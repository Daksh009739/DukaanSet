import type {Category} from './contracts';
export const businessCategories=['grocery','retail','medical','restaurant','salon','clothing','electronics','wholesale','services','hardware','vegetables','mobile','general'] as const;
export function businessMode(category:Category){return{orders:category==='restaurant',appointments:category==='salon',clients:category==='services'||category==='salon',stock:!['services','salon'].includes(category)};}
