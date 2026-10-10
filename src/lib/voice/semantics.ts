import {z} from 'zod';
import {normalize} from './parser';

const entity=z.object({spokenName:z.string().max(150),evidence:z.enum(['explicit','absent','ambiguous'])}).strict();
/** Role labels are untrusted interpretation, never database IDs or permission grants. */
export const voiceRolesSchema=z.object({customer:entity,supplier:entity,productText:z.string().max(5000),actionAmbiguous:z.boolean(),conditional:z.boolean()}).strict();
export type VoiceRoles=z.infer<typeof voiceRolesSchema>;
export function extractVoiceRoles(normalized:string):VoiceRoles {
 const text=normalize(normalized);let productText=text,customer='',supplier='';
 // Consume complete role phrases, rather than deleting only the person's name.
 const customerPatterns=[
  /^(?:please\s+)?(?:create\s+(?:a\s+)?(?:bill|invoice)\s+for|bill\s+for|sell\s+to)\s+(.+?)(?=\s+(?:for|of)\s+\d|\s+\d|$)/u,
  /^(?:please\s+|bhai\s+|aaj\s+|today\s+|आज\s+)?(.+?)\s+(?:ke naam (?:se|pe|par)|के नाम से|के नाम पर|ko|को|ka|का)(?=\s|$)/u,
  /^(.+?)\s+customer\s+(?:create|add)\s+(?:karo|kar do)?\s*(?:aur|and)\s+(?:usko|uska|iska)?/u
 ];
 for(const pattern of customerPatterns){const match=text.match(pattern);if(!match)continue;const value=match[1].trim();
  if(!/\d|stock|स्टॉक|supplier|सप्लायर|traders|bill|invoice|create|add|banao|बिल/.test(value)){customer=value;productText=text.replace(match[0],' ').replace(/^\s*(?:for|of)\s+/,'');break;}
 }
 const leading=text.match(/^(?:purchase\s+|receive\s+)?(.+?)\s+(?:supplier\s+)?(?:se|से|from)\s+(?=\d)/u);
 const trailing=text.match(/\s+([\p{L}\p{M}]+)\s+supplier\s+(?:se|से)\s+(?:aayi|aaya|received|आई|आया)/u);
 if(leading&&!customer&&!/\d/.test(leading[1])&&/purchase|supplier|traders|kharid|aayi|aaya|received|सप्लायर|खरीद|आई|आया/.test(text)){supplier=leading[1].replace(/\s+supplier$/,'').trim();productText=text.replace(leading[0],'');customer='';}
 else if(trailing){supplier=trailing[1];const marker=text.indexOf(' '+supplier+' supplier');if(marker>=0){productText=text.slice(0,marker);customer='';}}
 const explicit=/bill|invoice|sale|sold|sell|bech|बिल|बेच|stock|inventory|स्टॉक|purchase|supplier|खरीद|सप्लायर/.test(text);
 const actionAmbiguous=!!customer&&/\d/.test(text)&&/add|jod|जोड़/.test(text)&&!explicit;
 const conditional=/^(?:agar|if|what if|suppose|यदि|अगर)(?:\s|$)/.test(text)||/\bwhat if\b/.test(text);
 return voiceRolesSchema.parse({customer:{spokenName:customer,evidence:customer?'explicit':'absent'},supplier:{spokenName:supplier,evidence:supplier?'explicit':'absent'},productText:productText.trim(),actionAmbiguous,conditional});
}

/** Strict provider contract: no IDs, execution paths, SQL, or success claims. */
export const interpretedSlotsSchema=z.object({
 intent:z.enum(['sale','stock','customer','payment','expense','supplier','purchase','demand','closing','report','reorder','document','followup','open','cancel','simulation','scan','insights','unknown']),
 customerName:z.string().max(100).nullable(),supplierName:z.string().max(100).nullable(),
 items:z.array(z.object({productName:z.string().min(1).max(100),quantity:z.string().regex(/^\d+(?:\.\d{1,3})?$/).nullable(),unit:z.enum(['kg','g','piece','packet','box','litre','ml','metre','bag','dozen']).nullable(),unitPrice:z.string().regex(/^\d+(?:\.\d{1,2})?$/).nullable(),purchaseCost:z.string().regex(/^\d+(?:\.\d{1,2})?$/).nullable(),lineTotal:z.string().regex(/^\d+(?:\.\d{1,2})?$/).nullable()}).strict()).max(30),
 payment:z.enum(['cash','upi','credit','split']).nullable(),cash:z.string().regex(/^\d+(?:\.\d{1,2})?$/).nullable(),upi:z.string().regex(/^\d+(?:\.\d{1,2})?$/).nullable(),amount:z.string().regex(/^\d+(?:\.\d{1,2})?$/).nullable(),
 uncertainties:z.array(z.enum(['intent','customer','supplier','product','quantity','unit','price','payment'])).max(8)
}).strict();
export type InterpretedSlots=z.infer<typeof interpretedSlotsSchema>;
