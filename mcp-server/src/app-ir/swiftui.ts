import { wrappingRowSwift } from './wrapping-row.js';
import {typographyProbeSwift} from './typography-probe.js';
import { mkdir, writeFile, lstat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { AppIRSchema, sha256, type AppIR } from './schema.js';
import { initProject, regenerate } from '../agent/project.js';
import { ProcessRunner } from '../agent/runner.js';

export const swiftString = (s: string): string => '"' + [...s].map(c => c === '\\' ? '\\\\' : c === '"' ? '\\"' : c.codePointAt(0)! < 32 || c.codePointAt(0) === 127 ? `\\u{${c.codePointAt(0)!.toString(16)}}` : c).join('') + '"';
const color = (s: string) => `Color(red: ${parseInt(s.slice(1,3),16)/255}, green: ${parseInt(s.slice(3,5),16)/255}, blue: ${parseInt(s.slice(5,7),16)/255})`;
/** Deterministic rendering for the supported IR subset; no model or web wrapper. */
export function renderSwiftUI(value: unknown, options: { disclosureStyle?: "platform" | "leading"; instrumentTypography?: boolean } = {}): {source: string; mappings: Array<{node: string; symbol: string; evidence: AppIR['nodes'][number]['evidence']}>} {
  const ir = AppIRSchema.parse(value);
  if (ir.screens.length !== 1 && !ir.navigation) throw Error('Multiple screens require an explicit navigation mapping');
  if (ir.navigation && ir.nodes.some(n => n.kind === 'disclosure')) throw Error('Disclosure lifecycle inside routed screens is not mapped');
  if (ir.limitations.length) throw Error('Resolve unsupported input before generating. Inspect IR limitations; no lossy conversion is implicit.');
  const symbol = (id: string) => 'node_' + id.replaceAll('-','_');
  const records=ir.collections??[];
  const recordType=(id:string)=>'ImportedRecord_'+id.replaceAll('-','_');
  const recordProperty=(field:string)=>'field_'+field;
  const recordState=(id:string)=>'records_'+symbol(id);
  const recordRoute=(screen:string)=>ir.navigation?.routes.find(r=>r.screen===screen&&r.collection);
  const recordNodes=new Set<string>();
  function markDetail(id:string){
    recordNodes.add(id);
    for(const child of ir.nodes.find(n=>n.id===id)!.children)markDetail(child);
  }
  for(const screen of ir.screens)if(recordRoute(screen.id))markDetail(screen.root);
  const reference=(id:string)=>symbol(id)+(recordNodes.has(id)?'(recordID)':'');
  const declaration=(id:string)=>recordNodes.has(id)?`func ${symbol(id)}(_ recordID: String) -> some View`:`var ${symbol(id)}: some View`;
  const recordInitializers=records.map(collection=>{
    const literal=collection.rows.map(row=>{
      const values=collection.fields.map(field=>recordProperty(field)+': '+swiftString(row.values[field]!)).join(', ');
      return `        ${recordType(collection.id)}(id: ${swiftString(row.id)}, ${values})`;
    }).join(',\n');
    return `    @State private var ${recordState(collection.id)}: [${recordType(collection.id)}] = [\n${literal}\n    ]`;
  });
  const state = [...recordInitializers,...(ir.navigation ? ['    @State private var routePath: [String] = []'] : []), ...ir.nodes.filter(n => n.kind === 'disclosure').map(n => `    @State private var expanded_${symbol(n.id)} = false;`),
    ...(ir.states ?? []).map(s => `    @State private var state_${symbol(s.id)} = ${typeof s.initial==='string'?swiftString(s.initial):s.initial};`)].join('\n');
  const rowChildren=new Set(ir.nodes.filter(n=>n.kind==='row').flatMap(n=>n.children));
  // Conditional wrappers have no native layout of their own. Their visible
  // branch roots inherit the same horizontal sizing proposal.
  for(const id of rowChildren){const node=ir.nodes.find(n=>n.id===id);if(node?.kind==='conditional')for(const child of node.children)rowChildren.add(child);}
  for(const id of rowChildren){const node=ir.nodes.find(n=>n.id===id)!;if(!['text','button','link','conditional'].includes(node.kind))throw Error('Unsupported row child: only text, buttons, links and conditional leaf branches have verified sizing mappings');}
  const views = ir.nodes.map(n => {
    if(n.kind === 'conditional' && n.condition) {
      const c=n.condition;
      return `    @ViewBuilder private ${declaration(n.id)} {\n        if state_${symbol(c.state)} {\n            ${c.whenTrue ? reference(c.whenTrue) : 'EmptyView()'}\n        } else {\n            ${c.whenFalse ? reference(c.whenFalse) : 'EmptyView()'}\n        }\n    }`;
    }
    const s = n.style;
    const children = n.children.map(c => `            ${reference(c)}`).join('\n');
    const selected = n.recordField ? `fieldBinding(\$${recordState(n.recordField.collection)}, id: recordID, field: \\.${recordProperty(n.recordField.field)})` : undefined;
    const content = selected && n.kind==='text' ? `collapsedInputText(${selected}.wrappedValue)` : n.stringBinding && n.kind==='text' ? `collapsedInputText(state_${symbol(n.stringBinding)})` : n.textBinding ? `(state_${symbol(n.textBinding.state)} ? ${swiftString(n.textBinding.whenTrue)} : ${swiftString(n.textBinding.whenFalse)})` : swiftString(n.text ?? '');
    const textView = options.instrumentTypography ? `MeasuredText(nodeID: ${swiftString(n.id)}, content: ${content})` : `Text(verbatim: ${content})`;
    const action = n.action?.operation === 'toggle' ? `state_${symbol(n.action.state)}.toggle()` : n.action?.operation === 'set' ? `state_${symbol(n.action.state)} = ${typeof n.action.value==='string'?swiftString(n.action.value):n.action.value}` : '';
    const field = n.stringBinding ? 'state_' + symbol(n.stringBinding) : '';
    const prompt = swiftString(n.placeholder ?? '');
    const inputBinding=selected??('$'+field);
    const inputValue=selected?selected+'.wrappedValue':field;
    const list=n.recordList;
    let view = list ? `ForEach(${recordState(list.collection)}) { record in
            NavigationLink(value: ${swiftString(recordRoute(list.screen)!.path.split(':')[0]!)} + record.id) {
                Text(verbatim: collapsedInputText(record.${recordProperty(list.field)})).frame(minHeight: 44)
            }
            .buttonStyle(.bordered)
            .accessibilityIdentifier(${swiftString(n.id+'-')} + record.id)
        }` : n.kind === 'textfield' && (field||selected) ? `TextField("", text: ${inputBinding})
        .accessibilityLabel(Text(verbatim: ${swiftString(n.text ?? '')}))
        .accessibilityHint(Text(verbatim: ${inputValue}.isEmpty ? ${prompt} : ""))
        .textFieldStyle(ImportedTextFieldStyle(prompt: ${prompt}, isEmpty: ${inputValue}.isEmpty))` : n.kind === 'text' ? textView : n.kind === 'link' && n.action?.operation === 'navigate'
      ? `NavigationLink(value: ${swiftString(n.action.screen)}) { ${textView}.frame(minHeight: 44) }\n        .buttonStyle(.bordered)` : n.kind === 'button'
      ? `Button { ${action} } label: { ${textView}${['1.4.0','1.5.0','1.6.0','1.7.0'].includes(ir.schemaVersion)&&s.foreground&&s.background?`.frame(${rowChildren.has(n.id)?'':'maxWidth: .infinity, '}minHeight: 44, alignment: ${s.centered?'.center':'.leading'}).contentShape(Rectangle())`:''} }\n        .buttonStyle(${['1.4.0','1.5.0','1.6.0','1.7.0'].includes(ir.schemaVersion)&&s.foreground&&s.background?'.plain':'.bordered'})\n        .frame(minHeight: 44)` : n.kind === 'disclosure'
      ? `DisclosureGroup(isExpanded: $expanded_${symbol(n.id)}) {\n${children}\n        } label: { ${textView} }`
      : s.wrap ? `ImportedWrappingRow(gap: ${s.gap ?? 0}) {\n${children}\n        }`
      : n.kind==='row' ? `HStack(alignment: .center, spacing: ${s.gap ?? 0}) {\n${children}\n        }`
      : `VStack(alignment: ${s.centered ? '.center' : '.leading'}, spacing: ${s.gap ?? 12}) {\n${children}\n        }`;
    if (n.kind === 'disclosure' && options.disclosureStyle === 'leading') view += '\n        .disclosureGroupStyle(ImportedDisclosureStyle())';
    if (s.fontSize) view += `\n        .font(.system(size: scaled_${symbol(n.id)}, weight: ${s.bold ? '.bold' : '.regular'}))`;
    else if (s.bold !== undefined) view += `\n        .fontWeight(${s.bold ? '.bold' : '.regular'})`;
    if (s.foreground) view += `\n        .foregroundStyle(${color(s.foreground)})`;
    if (s.centered !== undefined) view += `\n        .multilineTextAlignment(${s.centered ? '.center' : '.leading'})`;
    if (s.padding !== undefined) view += `\n        .padding(${s.padding})`;
    if(!rowChildren.has(n.id))view += `\n        .frame(maxWidth: .infinity, alignment: ${n.kind!=='row'&&s.centered ? '.center' : '.leading'})`;
    if (s.background) view += `\n        .background(${color(s.background)})`;
    if (s.radius) view += `\n        .clipShape(RoundedRectangle(cornerRadius: ${s.radius}))`;
    // Container identifiers propagate to descendants in XCTest; identify leaf controls only.
    if (!['column','row','record-list'].includes(n.kind)) view += `\n        .accessibilityIdentifier(${swiftString(n.id)})`;
    return `    private ${declaration(n.id)} {\n        ${view}\n    }`;
  }).join('\n\n');
  const root = ir.nodes.find(n => n.id === ir.screens[0]!.root)!;
  const screenBody = (root: AppIR['nodes'][number]) => `ScrollView { ${reference(root.id)} }\n        ${root.style.background ? `.background(${color(root.style.background)}.ignoresSafeArea())` : ''}`;
  const body = ir.navigation ? `NavigationStack(path: $routePath) {\n            routeScreen(${swiftString(ir.navigation.initialScreen)})\n                .navigationDestination(for: String.self) { destination in routeScreen(destination) }\n        }` : screenBody(root);
  const recordDestinations=ir.screens.flatMap(screen=>{
    const route=recordRoute(screen.id);
    if(!route)return [];
    const prefix=swiftString(route.path.split(':')[0]!);
    return [`        case let path where path.hasPrefix(${prefix}):
            let recordID = String(path.dropFirst(${prefix}.count))
            ${screenBody(ir.nodes.find(n=>n.id===screen.root)!)}
                .navigationBarTitleDisplayMode(.inline)`];
  });
  const routedViews = ir.navigation ? `\n    @ViewBuilder private func routeScreen(_ destination: String) -> some View {\n        switch destination {\n${ir.screens.filter(s=>!recordRoute(s.id)).map(s => `        case ${swiftString(s.id)}:\n            ${screenBody(ir.nodes.find(n => n.id === s.root)!)}\n                .navigationBarTitleDisplayMode(.inline)`).concat(recordDestinations).join('\n')}\n        default: EmptyView()\n        }\n    }\n` : '';
  const scales = ir.nodes.filter(n => n.style.fontSize).map(n => `    @ScaledMetric(relativeTo: .body) private var scaled_${symbol(n.id)}: CGFloat = ${n.style.fontSize}`).join('\n');
  const disclosureStyle = options.disclosureStyle === 'leading' ? `
private struct ImportedDisclosureStyle: DisclosureGroupStyle {
    func makeBody(configuration: Configuration) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                configuration.isExpanded.toggle()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "play.fill")
                        .font(.caption)
                        .rotationEffect(.degrees(configuration.isExpanded ? 90 : 0))
                        .accessibilityHidden(true)
                    configuration.label
                }
                .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityValue(configuration.isExpanded ? "Expanded" : "Collapsed")
            if configuration.isExpanded { configuration.content }
        }
    }
}
` : '';
  const inputStyle=ir.nodes.some(n=>n.kind==='textfield')?`
private struct ImportedTextFieldStyle: TextFieldStyle {
    let prompt: String
    let isEmpty: Bool

    func _body(configuration: TextField<Self._Label>) -> some View {
        ZStack(alignment: .leading) {
            if isEmpty && !prompt.isEmpty {
                // The native field exposes the prompt as a hint while empty.
                // A separate text view can wrap instead of truncating to one line.
                Text(verbatim: prompt)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
            configuration
                .textFieldStyle(.plain)
                .padding(.vertical, 12)
                .frame(minHeight: 44)
        }
        .padding(.horizontal, 12)
        .background(Color(uiColor: .secondarySystemBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}
`:'';
  const recordHelpers=records.length?`
${records.map(collection=>`private struct ${recordType(collection.id)}: Identifiable, Sendable {
    let id: String
${collection.fields.map(field=>'    var '+recordProperty(field)+': String').join('\n')}
}`).join('\n\n')}

@MainActor private func fieldBinding<Record: Identifiable & Sendable>(_ records: Binding<[Record]>, id: String,
    field: WritableKeyPath<Record, String> & Sendable) -> Binding<String> where Record.ID == String {
    Binding(get: { records.wrappedValue.first { $0.id == id }?[keyPath: field] ?? "" }, set: { value in
        guard let index = records.wrappedValue.firstIndex(where: { $0.id == id }) else { return }
        records.wrappedValue[index][keyPath: field] = value
    })
}
`:'';
  const stringTextHelper=records.length||ir.nodes.some(n=>n.kind==='text'&&n.stringBinding)?`
private func collapsedInputText(_ value: String) -> String {
    value.split(whereSeparator: { [" ", "\\t", "\\n", "\\r", "\\u{c}"].contains(String($0)) }).joined(separator: " ")
}
`:'';
  return {source:`import SwiftUI\n\nstruct RootView: View {\n${state}\n${scales}\n    var body: some View {\n        ${body}\n    }\n${routedViews}\n${views}\n}\n\n${ir.nodes.some(n => n.style.wrap) ? wrappingRowSwift : ''}${disclosureStyle}${inputStyle}${recordHelpers}${stringTextHelper}\n${options.instrumentTypography ? typographyProbeSwift : ''}\n#Preview { RootView() }\n`,mappings:ir.nodes.map(n => ({node:n.id,symbol:symbol(n.id),evidence:n.evidence}))};
}
export async function generateProject(value: unknown, output: string, options: { disclosureStyle?: "platform" | "leading"; instrumentTypography?: boolean } = {}): Promise<{project: string; sourceHash: string; status: 'generated-unverified'}> {
  const ir = AppIRSchema.parse(value);
  const rendered = renderSwiftUI(ir, options); // Reject unsupported inputs before writes.
  const root = resolve(output);
  // Atomic reservation: never overwrite an existing project or symlink.
  await mkdir(root, {recursive:false});
  if (!(await lstat(root)).isDirectory()) throw Error('Output is not a directory');
  const {spec} = await initProject({projectDir:root,name:ir.name,capabilities:[],tests:false});
  const source = `${ir.name}/Views/RootView.swift`;
  await writeFile(join(root,source),rendered.source);
  const generated = await regenerate(root,spec,new ProcessRunner());
  if (!generated.generated) throw Error(generated.reason ?? 'Project generation failed');
  await writeFile(join(root,'.ios-agent/app-ir.json'),JSON.stringify(ir,null,2)+'\n');
  await writeFile(join(root,'.ios-agent/source-map.json'),JSON.stringify({schemaVersion:1,irHash:sha256(JSON.stringify(ir)),files:[{path:source,sha256:sha256(rendered.source),mappings:rendered.mappings}]},null,2)+'\n');
  return {project:root,sourceHash:sha256(rendered.source),status:'generated-unverified'};
}
