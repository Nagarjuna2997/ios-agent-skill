function TrailCard({title, subtitle, description, radius}) {
  return <section style={{display:'flex',flexDirection:'column',backgroundColor:'#DDE8D6',borderRadius:radius,padding:24,gap:12}}><p style={{margin:0,fontSize:14,fontWeight:700}}>THIS WEEK'S WALK</p><h2 style={{margin:0,fontSize:28,fontWeight:700}}>{title}</h2><p style={{margin:0,fontSize:18}}>{subtitle}</p><p style={{margin:0,fontSize:16}}>{description}</p></section>;
}
export default function FieldNotes() {
  return <body style={{fontFamily:'system-ui',fontSize:17,display:'flex',flexDirection:'column',margin:0,backgroundColor:'#F4F1EB',padding:24,gap:24,color:'#243D35'}}><main style={{display:'flex',flexDirection:'column',gap:24}}>
    <header style={{display:'flex',flexDirection:'column',gap:8}}><p style={{margin:0,fontSize:14,fontWeight:700}}>FIELD NOTES · WEEKEND EDITION</p><h1 style={{margin:0,fontSize:36,fontWeight:700}}>A little closer to nature.</h1><p style={{margin:0,fontSize:18}}>Three quiet trails, one good weekend. Your next walk starts here.</p></header>
    <TrailCard title="Cedar Loop" subtitle="4.2 miles · Easy · 90 minutes" description="A shaded path through tall cedars, with a quiet river stop halfway." radius={24} />
    <details style={{padding:20,backgroundColor:'#FFFFFF',borderRadius:20}}><summary>Before you go</summary><p style={{margin:0}}>Bring water, comfortable shoes, and a light jacket.</p></details>
    <p style={{margin:0,fontSize:14}}>Synthetic demo content. No account or location permission needed.</p>
  </main></body>;
}
