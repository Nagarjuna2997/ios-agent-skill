function TrailCard({name, distance = 4}) {
  const title = `${name} trail`;
  const subtitle = `${distance + 2} km loop`;
  const corner = 12 + 4;
  return <section style={{padding:20, backgroundColor:'#E5EEDD', borderRadius:corner}}>
    <h2>{title}</h2><p>{subtitle}</p>
    <details><summary>Before you go</summary><p>Bring water and keep to the marked path.</p></details>
  </section>;
}
export default function App() {
  const title = 'Weekend walks';
  const trail = 'Cedar';
  return <main style={{padding:20}}><h1>{title}</h1><TrailCard name={trail}/></main>;
}
