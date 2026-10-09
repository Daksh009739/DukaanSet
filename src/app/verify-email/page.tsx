import { Auth } from '@/components/auth';
export const metadata={title:'Verify email',robots:{index:false,follow:false}};
export default function Verify(){return <Auth mode="verify"/>;}
