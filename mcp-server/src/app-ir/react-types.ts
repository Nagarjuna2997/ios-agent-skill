import ts from 'typescript';
/** Explicitly erased syntax only. Never infer that a runtime import is type-only. */
export function isErasedTypeStatement(node:ts.Statement):boolean {
  if(ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node))return true;
  if(!ts.isImportDeclaration(node)||node.attributes)return false;
  // Inline `import {type T}` may preserve `import {}` with
  // verbatimModuleSyntax. Only declaration-level import type is erased.
  return node.importClause?.isTypeOnly===true;
}
