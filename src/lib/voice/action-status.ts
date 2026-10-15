import {api,RequestError} from '../client';
export type VoiceActionReceipt<T>={status:'committed';result:T}|{status:'not_found'};
/** Recover the exact frozen request. A failed status read must never trigger a fresh write. */
export async function recoverVoiceAction<T>(businessId:string,path:string,body:Record<string,unknown>,mutate:()=>Promise<T>,current:()=>boolean,refresh:()=>Promise<void>):Promise<T>{
 const receipt=await api<VoiceActionReceipt<T>>(`/businesses/${businessId}/voice-action-status`,{path,body});
 if(!current())throw new RequestError('SCOPE_CHANGED','The active business or account changed.',409);
 if(receipt.status==='committed'){await refresh();return receipt.result;}
 if(receipt.status!=='not_found')throw new RequestError('INVALID_RESPONSE','Could not verify the saved request.',502);
 return mutate();
}
