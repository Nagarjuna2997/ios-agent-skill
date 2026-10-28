import type { ReactNode } from 'react';
interface CardProps { title: string; detail: string; }
type CardResult = ReactNode;
export default function Card({title,detail}: CardProps): CardResult {
  return <section style={{padding:16,backgroundColor:'#eef4ee',borderRadius:12}}><h1>{title}</h1><p>{detail}</p></section>;
}
