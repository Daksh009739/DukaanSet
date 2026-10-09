'use client';
import {useTranslation} from 'react-i18next';
import {dateText,unitText,locale,renderSystemMessage} from '@/lib/locale';
import type {Product} from '@/lib/contracts';
export function LocalizedUnit({value,count}:{value:string;count?:number}){return <>{unitText(value,useTranslation().i18n.language,count)}</>;}
export function LocalizedDate({value,options}:{value:string|Date;options?:Intl.DateTimeFormatOptions}){return <>{dateText(value,useTranslation().i18n.language,options)}</>;}
export function ProductName({product}:{product:Product}){const language=locale(useTranslation().i18n.language);return <span title={product.name}>{product.displayNames?.[language]||product.name}</span>;}

export function SystemText({value}:{value:string}){return <>{renderSystemMessage(value,useTranslation().i18n.language)}</>;}
