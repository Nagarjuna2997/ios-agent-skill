import {TripTitle} from './TripTitle';
export default function TripCard({title,distance}) {
  return <section style={{padding:16,backgroundColor:'#F3F6ED',borderRadius:12}}><TripTitle title={title}/><p>{distance}</p></section>;
}
