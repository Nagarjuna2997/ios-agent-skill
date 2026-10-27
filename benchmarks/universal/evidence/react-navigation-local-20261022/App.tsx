import {useState} from 'react';
import {MemoryRouter, Routes, Route, Link} from 'react-router-dom';

function Panel(p) {
  return <main style={{padding:24,gap:16,color:'#15372D',backgroundColor:'#F4F6EF'}}>{p.children}</main>;
}
function Walk() {
  return <Panel><h1>Cedar Loop</h1><p>A quiet woodland route.</p><Link to="/notes">Read field notes</Link></Panel>;
}
function Notes() {
  return <Panel><h1>Field notes</h1><p>Stay on the marked path.</p></Panel>;
}
export default function App() {
  const [saved,setSaved]=useState(false);
  return <MemoryRouter initialEntries={["/"]}>
    <Routes>
      <Route path="/" element={<Panel><h1>Trail journal</h1><p>{saved ? 'Walk saved' : 'No saved walk'}</p><button onClick={()=>setSaved(!saved)}>Toggle saved walk</button><Link to="/walk">Open Cedar Loop</Link></Panel>}/>
      <Route path="/walk" element={<Walk/>}/>
      <Route path="/notes" element={<Notes/>}/>
    </Routes>
  </MemoryRouter>;
}
