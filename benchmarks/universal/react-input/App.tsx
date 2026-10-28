import {useState} from 'react';
export default function App() {
  const [name,setName]=useState('');
  const [destination,setDestination]=useState('River walk');
  const [visible,setVisible]=useState(true);
  return <main style={{padding:24}}>
    <h1>Plan your walk</h1>
    <input type="text" aria-label="Your name" placeholder="Enter your name" value={name} onChange={event=>setName(event.target.value)}/>
    <p>{name}</p>
    <button style={{color:"#111111",backgroundColor:"#eeeeee"}} onClick={()=>setName("")}>Clear name</button>
    <button style={{color:"#111111",backgroundColor:"#eeeeee"}} onClick={()=>setName("Explorer")}>Reset name</button>
    {visible?<section>
      <input type="text" aria-label="Destination" value={destination} onChange={event=>setDestination(event.currentTarget.value)}/>
      <p>{destination}</p>
    </section>:null}
    <button style={{color:"#111111",backgroundColor:"#eeeeee"}} onClick={()=>setVisible(previous=>!previous)}>Show or hide destination</button>
  </main>;
}
