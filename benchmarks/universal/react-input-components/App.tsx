import {useState} from 'react';
import {NameField} from './components/NameField';
export default function App() {
  const [name,setName]=useState('Explorer');
  return <main style={{padding:24}}>
    <h1>Walking profile</h1>
    <NameField value={name} change={setName}/>
    <p>{name}</p>
  </main>;
}
