import type { ReactNode } from 'react';
import Card from './Card';
export default function App(): ReactNode {
  return <main style={{padding:24}}><Card title="Typed native card" detail="Types stay in source; behavior comes from the supported expressions."/></main>;
}
