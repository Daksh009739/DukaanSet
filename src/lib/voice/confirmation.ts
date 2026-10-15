export class SpokenConfirmationGate{
  private current:string|null=null;private consumed=new Set<string>();
  arm(scope:string,snapshot:string,ready:boolean){this.current=ready?scope+'\n'+snapshot:null;}
  consume(scope:string,snapshot:string){const key=scope+'\n'+snapshot;if(this.current!==key||this.consumed.has(key))return false;this.consumed.add(key);this.current=null;if(this.consumed.size>50)this.consumed.delete(this.consumed.values().next().value!);return true;}
  invalidate(){this.current=null;}
}
