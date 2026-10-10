import enDocuments from './en/documents.json';
import hiDocuments from './hi/documents.json';
import hlDocuments from './hinglish/documents.json';
import enCommon from './en/common.json';
import enErrors from './en/errors.json';
import enRetail from './en/retail.json';
import enSaas from './en/saas.json';
import enSales from './en/sales.json';
import enVoice from './en/inventoryVoice.json';
import enVoiceOS from './en/voiceos.json';
import hiCommon from './hi/common.json';
import hiErrors from './hi/errors.json';
import hiRetail from './hi/retail.json';
import hiSaas from './hi/saas.json';
import hiSales from './hi/sales.json';
import hiVoice from './hi/inventoryVoice.json';
import hiVoiceOS from './hi/voiceos.json';
import hlCommon from './hinglish/common.json';
import hlErrors from './hinglish/errors.json';
import hlRetail from './hinglish/retail.json';
import hlSaas from './hinglish/saas.json';
import hlSales from './hinglish/sales.json';
import hlVoice from './hinglish/inventoryVoice.json';
import hlVoiceOS from './hinglish/voiceos.json';
import enMarketing from './en/marketing.json';
import hiMarketing from './hi/marketing.json';
import hlMarketing from './hinglish/marketing.json';
import enWorkspace from './en/workspace.json';
import hiWorkspace from './hi/workspace.json';
import hlWorkspace from './hinglish/workspace.json';
export const locales=['en','hi','hinglish'] as const;
export type Locale=typeof locales[number];
export function locale(value:unknown):Locale{return value==='hi'||value==='hinglish'?value:'en';}
export const messages={
 en:{translation:{...enCommon,errors:enErrors},v2:enRetail,v3:enSaas,sales:enSales,voice:enVoice,voiceos:enVoiceOS,marketing:enMarketing,documents:enDocuments,workspace:enWorkspace},
 hi:{translation:{...hiCommon,errors:hiErrors},v2:hiRetail,v3:hiSaas,sales:hiSales,voice:hiVoice,voiceos:hiVoiceOS,marketing:hiMarketing,documents:hiDocuments,workspace:hiWorkspace},
 hinglish:{translation:{...hlCommon,errors:hlErrors},v2:hlRetail,v3:hlSaas,sales:hlSales,voice:hlVoice,voiceos:hlVoiceOS,marketing:hlMarketing,documents:hlDocuments,workspace:hlWorkspace},
};
export type Namespace=keyof typeof messages.en;
export function copy<N extends Namespace>(namespace:N,language:string):typeof messages.en[N]{return messages[locale(language)][namespace] as typeof messages.en[N];}
export const languageTags={en:'en',hi:'hi',hinglish:'hi-Latn'} as const;
export const formatLocales={en:'en-IN-u-nu-latn',hi:'hi-IN-u-nu-latn',hinglish:'en-IN-u-nu-latn'} as const;
