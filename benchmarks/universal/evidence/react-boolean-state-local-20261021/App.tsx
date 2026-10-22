import {useState} from 'react';

function Panel({children}) {
  return <section style={{display:'flex',flexDirection:'column',gap:12}}>{children}</section>;
}
export default function App() {
  const [packed,setPacked]=useState(false);
  const [reminder,setReminder]=useState(true);
  return <main style={{padding:24,gap:16,backgroundColor:'#FFFFFF',color:'#142017'}}>
    <h1 style={{fontSize:32}}>Trip checklist</h1>
    <Panel>
      <p>{packed ? 'Pack ready' : 'Packing incomplete'}</p>
      <button onClick={()=>setPacked(!packed)}>Toggle pack</button>
      <button onClick={()=>setPacked(true)}>Mark packed</button>
      <button onClick={()=>setPacked(false)}>Reset pack</button>
    </Panel>
    <Panel>
      <p>{reminder ? 'Reminder on' : 'Reminder off'}</p>
      <button onClick={()=>setReminder(!reminder)}>Toggle reminder</button>
    </Panel>
  </main>;
}
