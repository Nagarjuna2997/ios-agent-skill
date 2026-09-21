/** Shared static Xcode helpers. Never evaluates build scripts or resolves packages. */
import { posix } from 'node:path';
import * as plist from 'plist';
export type ObjectMap = Record<string, any>;
export const list = (v: any): any[] => Array.isArray(v) ? v : v ? [v] : [];
export function parsePropertyList(b: Buffer): ObjectMap {
    const v = b.subarray(0, 6).toString() === 'bplist' ? plist.parseBinary(b) : plist.parse(b.toString());
    if (!v || typeof v !== 'object' || Array.isArray(v))
        throw Error('Expected a property dictionary');
    return v as ObjectMap;
}
export function projectPaths(objects: ObjectMap, base: string) {
    const parents = new Map<string, string[]>();
    for (const [id, ob] of Object.entries(objects))
        for (const child of list(ob.children))
            parents.set(child, [...(parents.get(child) || []), id]);
    function filePath(id: string, seen = new Set<string>()): string | undefined {
        if (seen.has(id))
            return;
        seen.add(id);
        const ob = objects[id];
        if (!ob)
            return;
        const name = ob.path || '';
        if (typeof name !== 'string' || /\$[({]/.test(name) || name.startsWith('/'))
            return;
        let parent = base;
        if (ob.sourceTree === '<group>') {
            const ps = parents.get(id) || [];
            if (ps.length > 1)
                return;
            if (ps.length === 1) {
                const p = filePath(ps[0]!, seen);
                if (p === undefined)
                    return;
                parent = p;
            }
        }
        else if (ob.sourceTree && ob.sourceTree !== 'SOURCE_ROOT')
            return;
        const p = posix.normalize(posix.join(parent, name));
        return p === '..' || p.startsWith('../') ? undefined : p;
    }
    return filePath;
}
