'use client';
import type {ReactNode} from 'react';
import {Info} from 'lucide-react';
import styles from './insight-workspace.module.css';

export function StudioHeading({title,subtitle,icon,eyebrow,action}:{title:string;subtitle:string;icon:ReactNode;eyebrow?:string;action?:ReactNode}) {
  return <header className={`page-heading ${styles.heading}`}><div className={styles.headingLead}><span className={styles.headingIcon} aria-hidden>{icon}</span><div>{eyebrow&&<span className={styles.eyebrow}>{eyebrow}</span>}<h1>{title}</h1><p>{subtitle}</p></div></div>{action}</header>;
}
export function StudioNote({children}:{children:ReactNode}) {return <p className={styles.note}><Info size={16} aria-hidden/><span>{children}</span></p>;}
export {styles as insightStyles};
