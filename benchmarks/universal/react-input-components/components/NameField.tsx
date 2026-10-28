export function NameField(props) {
  return <section>
    <input type="text" aria-label="Your name" value={props.value} onChange={event=>props.change(event.target.value)}/>
    <button style={{color:'#111111',backgroundColor:'#eeeeee'}} onClick={()=>props.change('')}>Clear name</button>
    <button style={{color:'#111111',backgroundColor:'#eeeeee'}} onClick={()=>props.change('Explorer')}>Reset name</button>
  </section>;
}
