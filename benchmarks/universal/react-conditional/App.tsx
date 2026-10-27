import {useState} from 'react';
function Frame(props) { return <section>{props.children}</section>; }
export default function App() {
  const [ready,setReady] = useState(false);
  const [packed,setPacked] = useState(false);
  return <main style={{padding:20,gap:16}}>
    <h1>Trip planner</h1>
    {ready ? <Frame>
      <h2>Your plan</h2>
      <p>Trail walk</p>
      <p>{packed ? 'Bag packed' : 'Pack your bag'}</p>
      <button onClick={()=>setPacked(!packed)}>Toggle packed</button>
      <button onClick={()=>setReady(false)}>Remove plan</button>
    </Frame> : <Frame>
      <h2>No plan yet</h2>
      <button onClick={()=>setReady(true)}>Create plan</button>
    </Frame>}
    {!ready && <p>Start with a short walk.</p>}
  </main>;
}
