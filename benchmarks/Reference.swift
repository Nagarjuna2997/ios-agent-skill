import Foundation
func stableUnique(_ values:[String])->[String]{var seen=Set<String>();return values.filter{seen.insert($0).inserted}}
func searchTitles(_ titles:[String],query:String)->[String]{let q=query.trimmingCharacters(in:.whitespacesAndNewlines);return q.isEmpty ? titles:titles.filter{$0.localizedCaseInsensitiveContains(q)}}
func page<T>(_ values:[T],offset:Int,limit:Int)->[T]{let start=max(0,offset);guard limit>0,start<values.count else{return []};return Array(values[start..<start+min(limit,values.count-start)])}
func progress(completed:Int,total:Int)->Double{guard total>0 else{return 0};return min(1,max(0,Double(completed)/Double(total)))}
func shortened(_ text:String,maxCharacters:Int)->String{String(text.prefix(max(0,maxCharacters)))}
func isSafeComponent(_ value:String)->Bool{!value.isEmpty && value != "." && value != ".." && !value.contains("/") && !value.contains("\\") && !value.contains("\0")}
func queryURL(base:URL,key:String,value:String)->URL?{guard var c=URLComponents(url:base,resolvingAgainstBaseURL:false),c.scheme?.lowercased()=="https",let host=c.host,!host.isEmpty,c.user==nil,c.password==nil else{return nil};c.queryItems=(c.queryItems ?? [])+[URLQueryItem(name:key,value:value)];return c.url}
func redacted(_ value:String)->String{value.count>4 ? "****"+value.suffix(4):"****"}
func parseCount(_ text:String)->Int?{let t=text.trimmingCharacters(in:.whitespacesAndNewlines);guard !t.isEmpty,t.utf8.allSatisfy({$0>=48 && $0<=57}),let n=Int(t),n<=10000 else{return nil};return n}
func average(_ values:[Double])->Double?{guard !values.isEmpty,values.allSatisfy(\.isFinite) else{return nil};return values.reduce(0){$0+$1/Double(values.count)}}
struct Book{let title:String;let pages:Int}
func sortedBooks(_ books:[Book])->[Book]{books.sorted{$0.pages == $1.pages ? $0.title<$1.title:$0.pages<$1.pages}}
func toggled<T:Hashable>(_ value:T,in values:Set<T>)->Set<T>{var out=values;if !out.insert(value).inserted{out.remove(value)};return out}
struct Settings:Codable,Equatable{let notifications:Bool}
func decodeSettings(_ data:Data)throws->Settings{try JSONDecoder().decode(Settings.self,from:data)}
func merged(_ defaults:[String:String],overrides:[String:String])->[String:String]{defaults.merging(overrides){_,new in new}}
func incremented(_ value:Int,upperBound:Int)->Int{value>=upperBound ? upperBound:value+1}
func normalizedRange(start:Int,end:Int,count:Int)->Range<Int>{let n=max(0,count),s=min(n,max(0,start)),e=min(n,max(0,end));return s..<max(s,e)}
func bookID(from url:URL)->UUID?{guard url.scheme=="reading",url.host=="book",url.user==nil,url.password==nil,url.query==nil,url.fragment==nil else{return nil};let p=url.pathComponents.filter{$0 != "/"};return p.count==1 ? UUID(uuidString:p[0]):nil}
func grouped(_ values:[String])->[String:[String]]{var out:[String:[String]]=[:];for v in values{out[v.first.map(String.init) ?? "",default:[]].append(v)};return out}
func uniqueIDs(_ values:[UUID?])->[UUID]{var seen=Set<UUID>();return values.compactMap{$0}.filter{seen.insert($0).inserted}}
func percentage(_ value:Double,of total:Double)->Double?{guard value.isFinite,total.isFinite,total>0 else{return nil};let x=value/total*100;return x.isFinite ? x:nil}
