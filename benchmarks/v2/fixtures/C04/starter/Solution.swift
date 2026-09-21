import Foundation
@MainActor final class SearchModel {
 var query=""; var results:[String]=[]
 func begin(_ query:String) -> String { self.query=query; return query }
 func complete(_ query:String, values:[String]) { results=values }
}
