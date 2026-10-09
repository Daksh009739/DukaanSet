'use client';
import {useTranslation} from 'react-i18next';
export default function ErrorPage({reset}:{reset:()=>void}){const {t}=useTranslation();return <main className='standalone-state'><h1>{t('pageLoadError')}</h1><p>{t('pageLoadHint')}</p><button className='btn btn-primary' onClick={reset}>{t('retry')}</button></main>;}
