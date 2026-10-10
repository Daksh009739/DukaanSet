'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { LoaderCircle, X, ArrowUpRight } from 'lucide-react';
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { renderSystemMessage } from '@/lib/locale';
import {LanguageOptions} from './locale-provider';
import {useOptionalApp} from './app-provider';
import type {Language} from '@/lib/contracts';

export function Button({ children, busy, variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?:boolean; variant?:'primary'|'secondary'|'ghost'|'danger' }) {
  return <button {...props} disabled={props.disabled || busy} className={clsx('btn', `btn-${variant}`, className)}>{busy && <LoaderCircle size={17} className="spin"/>}{children}</button>;
}
export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label:string; hint?:string }) {
  return <label className="field"><span>{label}</span><input aria-label={label} {...props}/>{hint && <small>{hint}</small>}</label>;
}
export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & {label:string}) {
  return <label className="field"><span>{label}</span><select aria-label={label} {...props}>{children}</select></label>;
}
export function Sheet({ title, description, open, onOpenChange, children, wide=false, className,hideLanguage=false }: {title:string;description?:string;open:boolean;onOpenChange:(open:boolean)=>void;children:ReactNode;wide?:boolean;className?:string;hideLanguage?:boolean}) {
  const {t,i18n}=useTranslation(),app=useOptionalApp();
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="sheet-overlay"/><Dialog.Content className={clsx('sheet', wide && 'sheet-wide',className)}>
    <div className="sheet-header"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description className={description ? 'muted' : 'sr-only'}>{description || title}</Dialog.Description></div><Dialog.Close className="icon-btn" aria-label={t('close')}><X size={20}/></Dialog.Close></div>{!hideLanguage&&<div className="sheet-locale"><label><span>{t('language')}</span><select aria-label={t('language')} value={i18n.language} onChange={event=>{const language=event.target.value as Language;if(app)void app.changeLanguage(language).catch(error=>app.notify(app.errorText(error)));else void i18n.changeLanguage(language);}}><LanguageOptions/></select></label></div>}{children}
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
export function Empty({icon, title, detail, action}: {icon:ReactNode;title:string;detail?:string;action?:ReactNode}) {
  return <div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3>{detail && <p>{detail}</p>}{action}</div>;
}
export function CardTitle({children, action}: {children:ReactNode;action?:ReactNode}) { return <div className="card-title"><h2>{children}</h2>{action}</div>; }
export function ArrowLink({children, href}: {children:ReactNode;href:string}) { return <a className="text-link" href={href}>{children}<ArrowUpRight size={15}/></a>; }
export function FormError({message}: {message:string}) {const {i18n}=useTranslation();return message ? <p className="form-error" role="alert">{renderSystemMessage(message,i18n.language)}</p>:null;}
