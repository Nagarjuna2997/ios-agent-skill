// Enumerate AX identifiers emitted by the Universal SwiftUI generator.
export function screenTargets(ir) {
  return ir.nodes.flatMap(node => {
    if (node.kind === 'record-list') {
      const list=node.recordList;
      const rows=ir.collections?.find(collection=>collection.id===list?.collection)?.rows??[];
      return rows.map(row=>({id:node.id+'-'+row.id,label:row.values[list.field]}));
    }
    if (node.kind==='row'||node.kind==='column')return [];
    return [{id:node.id,label:node.text??node.kind}];
  });
}
