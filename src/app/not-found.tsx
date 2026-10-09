'use client';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
export default function NotFound(){const {t}=useTranslation();return <main className='standalone-state'><h1>{t('notFound')}</h1><p>{t('notFoundHint')}</p><Link href='/' className='btn btn-primary'>{t('websiteBack')}</Link></main>;}
