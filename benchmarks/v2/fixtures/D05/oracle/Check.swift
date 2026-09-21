import Foundation
func require(_ condition:Bool,_ message:String){if !condition{print("CONTRACT: "+message);exit(1)}}
actor Gate {
 var waiting=0;var open=false;var continuations:[CheckedContinuation<Void,Never>]=[]
 func wait() async {waiting+=1;if open{return};await withCheckedContinuation{continuations.append($0)}}
 func release(){open=true;let all=continuations;continuations=[];for c in all{c.resume()}}
}
@main struct Check {static func main() async {
 for _ in 0..<8 {
  let repository=Repository(),gate=Gate()
  await withTaskGroup(of:Void.self){group in
   for _ in 0..<12 {group.addTask{await repository.insert("same"){await gate.wait()}}}
   while await gate.waiting==0 {await Task.yield()}
   // Hold the first operation at a controlled checkpoint while other requests
   // are scheduled. Release externally: correct early reservation/serialization
   // must not need twelve calls to reach the checkpoint.
   for _ in 0..<256 {await Task.yield()}
   await gate.release()
  }
  await repository.insert("other"){}
  let values=await repository.all()
  require(values.sorted()==["other","same"],"duplicate logical record")
 }
}}
