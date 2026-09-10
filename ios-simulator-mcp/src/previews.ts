export interface Preview { url:string;close:()=>Promise<void> }

/** Serialize ownership changes, including pending starts, so no listener becomes orphaned. */
export class PreviewSessions {
  private sessions = new Map<string,Preview>();
  private queue:Promise<void> = Promise.resolve();
  private closed=false;
  constructor(private readonly create:(udid:string)=>Promise<Preview>) {}
  private serial<T>(work:()=>Promise<T>):Promise<T> {
    const result=this.queue.then(work);
    this.queue=result.then(()=>{},()=>{});
    return result;
  }
  start(udid:string):Promise<Preview> {
    return this.serial(async()=>{
      if(this.closed) throw new Error('Preview manager is shutting down.');
      const existing=this.sessions.get(udid);
      if(existing) return existing;
      if(this.sessions.size>=3) throw new Error('Close an existing preview first (maximum 3).');
      const preview=await this.create(udid);
      this.sessions.set(udid,preview);
      return preview;
    });
  }
  stop(udid:string):Promise<void> {
    return this.serial(async()=>{
      await this.sessions.get(udid)?.close();
      this.sessions.delete(udid);
    });
  }
  shutdown():Promise<void> {
    this.closed=true;
    return this.serial(async()=>{
      const results=await Promise.allSettled([...this.sessions.values()].map(p=>p.close()));
      this.sessions.clear();
      const failed=results.find(r=>r.status==='rejected');
      if(failed?.status==='rejected') throw failed.reason;
    });
  }
}
