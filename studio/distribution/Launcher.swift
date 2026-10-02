import AppKit
import Foundation

@MainActor
final class StudioLauncher: NSObject, NSApplicationDelegate {
    var process: Process?
    var window: NSWindow!
    var status: NSTextField!
    let address = URL(string: "http://127.0.0.1:8844/")!
    func applicationDidFinishLaunching(_ notification: Notification) {
        let menu = NSMenu(); let item = NSMenuItem(); menu.addItem(item)
        let appMenu = NSMenu(); appMenu.addItem(withTitle: "Quit iOS Agent Studio", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"); item.submenu=appMenu; NSApp.mainMenu=menu
        window=NSWindow(contentRect:NSRect(x:0,y:0,width:460,height:250),styleMask:[.titled,.closable,.miniaturizable],backing:.buffered,defer:false)
        window.title="iOS Agent Studio"; window.center(); window.isReleasedWhenClosed=false
        let title=NSTextField(labelWithString:"Your app workshop.");title.font = .systemFont(ofSize:28,weight:.semibold)
        let subtitle=NSTextField(wrappingLabelWithString:"Native SwiftUI apps. Built and tested on your Mac.");subtitle.textColor = .secondaryLabelColor
        status=NSTextField(wrappingLabelWithString:"Starting your local workspace…");status.textColor = .secondaryLabelColor
        let open=NSButton(title:"Open Studio",target:self,action:#selector(openStudio));open.bezelStyle = .rounded
        let stack=NSStackView(views:[title,subtitle,status,open]);stack.orientation = .vertical;stack.alignment = .leading;stack.spacing=18;stack.translatesAutoresizingMaskIntoConstraints=false
        window.contentView!.addSubview(stack);NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo:window.contentView!.leadingAnchor,constant:30),stack.trailingAnchor.constraint(equalTo:window.contentView!.trailingAnchor,constant:-30),stack.topAnchor.constraint(equalTo:window.contentView!.topAnchor,constant:30)])
        window.makeKeyAndOrderFront(nil);NSApp.activate(ignoringOtherApps:true)
        Task { await start() }
    }
    func ready() async -> Bool {
        var request=URLRequest(url:address.appendingPathComponent("_studio"));request.timeoutInterval=1
        guard let (data, response)=try? await URLSession.shared.data(for:request), (response as? HTTPURLResponse)?.statusCode==200,
              let json=try? JSONSerialization.jsonObject(with:data) as? [String:Any] else{return false}
        return json["product"] as? String == "iOS Agent Studio"
    }
    func start() async {
        if await ready(){status.stringValue="Connected to your existing local Studio.";openStudio();return}
        guard let resource=Bundle.main.resourceURL else{return}
        let task=Process();task.executableURL=resource.appendingPathComponent("bin/node");task.arguments=[resource.appendingPathComponent("repo/studio/server.mjs").path]
        var env=ProcessInfo.processInfo.environment
        env["PATH"]="/usr/local/bin:/opt/homebrew/bin:"+NSHomeDirectory()+"/.local/bin:"+NSHomeDirectory()+"/.npm-global/bin:/usr/bin:/bin:/usr/sbin:/sbin:"+(env["PATH"] ?? "")
        task.environment=env
        let log=URL(fileURLWithPath:NSHomeDirectory()).appendingPathComponent("Library/Logs/iOS Agent Studio/launcher.log")
        do {
            try FileManager.default.createDirectory(at:log.deletingLastPathComponent(),withIntermediateDirectories:true)
            if !FileManager.default.fileExists(atPath:log.path){FileManager.default.createFile(atPath:log.path,contents:nil)}
            let handle=try FileHandle(forWritingTo:log);try handle.seekToEnd();task.standardOutput=handle;task.standardError=handle
            try task.run();process=task
            for _ in 0..<40 {
                if await ready(){status.stringValue="Running locally. Quit Studio to stop this session.";openStudio();return}
                if !task.isRunning{break}
                try? await Task.sleep(for:.milliseconds(500))
            }
            status.stringValue="Could not start. Check Library/Logs/iOS Agent Studio/launcher.log. Port 8844 may be busy."
        } catch {status.stringValue="Could not start Studio: "+error.localizedDescription}
    }
    @objc func openStudio(){NSWorkspace.shared.open(address)}
    func applicationShouldTerminate(_ sender:NSApplication)->NSApplication.TerminateReply {
        guard let process,process.isRunning else{return .terminateNow}
        process.terminationHandler={_ in DispatchQueue.main.async {NSApp.reply(toApplicationShouldTerminate:true)}}
        process.terminate();return .terminateLater
    }
}
@main
struct Main {
    @MainActor static func main() {
        let app = NSApplication.shared
        let delegate = StudioLauncher()
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.run()
    }
}
