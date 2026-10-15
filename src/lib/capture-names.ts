import {canonicalProductName} from './voice/parser';
import {text} from './locale';
const supported=new Set(['dal','sugar','rice','milk','onion','potato','flour','tomato','ginger','garlic','salt','biscuit']);
/** Display-only dictionary. Original text, names and product IDs are never translated in storage. */
export function captureName(name:string,language:string,displayNames?:Partial<Record<'en'|'hi'|'hinglish',string>>){const approved=displayNames?.[language as 'en'|'hi'|'hinglish'];if(approved)return approved;const canonical=canonicalProductName(name);return supported.has(canonical)?text(language,'workspace','capture.products.'+canonical):name;}
