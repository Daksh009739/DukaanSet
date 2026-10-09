import type { DatabaseSync } from 'node:sqlite';
import { featureDefaults, moduleKeys, permissionKeys, rolePermissions, type BusinessConfiguration, type ModuleKey, type Permission, type Permissions, type Role } from '../v3-contracts';
import type { Category } from '../contracts';
import { DomainError } from './validation';
export function access(db:DatabaseSync,userId:string,businessId:string):BusinessConfiguration {
  const row=db.prepare('SELECT m.role,m.permissions_json,b.category,u.email_verified,u.verification_required FROM memberships m JOIN businesses b ON b.id=m.business_id JOIN users u ON u.id=m.user_id WHERE m.user_id=? AND b.id=?').get(userId,businessId) as {role:Role;permissions_json:string|null;category:Category;email_verified:number;verification_required:number}|undefined;
  if(!row)throw new DomainError('NOT_FOUND','Business not found.',404);
  if(row.verification_required&&!row.email_verified)throw new DomainError('EMAIL_UNVERIFIED','Verify your email before opening a business.',403);
  const settings=db.prepare('SELECT * FROM business_settings WHERE business_id=?').get(businessId) as {features_json:string;notifications_json:string;location:string;contact:string;revision:number}|undefined;
  const permissionOverrides=row.permissions_json?JSON.parse(row.permissions_json):{};
  const permissions=rolePermissions(row.role);
  if(row.role!=='owner'){for(const key of permissionKeys)if(typeof permissionOverrides[key]==='boolean')permissions[key]=permissionOverrides[key];permissions.settings=false;permissions.team=false;}
  const features={...featureDefaults(row.category,true),...(settings?JSON.parse(settings.features_json):{})};
  return {role:row.role,permissions,features,notificationPreferences:settings?JSON.parse(settings.notifications_json):{stock:true,credit:true,demand:true},location:settings?.location||'',contact:settings?.contact||'',revision:settings?.revision||0};
}
export function authorize(db:DatabaseSync,userId:string,businessId:string,permission:Permission,feature?:ModuleKey){const value=access(db,userId,businessId);if(!value.permissions[permission])throw new DomainError('FORBIDDEN','Your role cannot perform this operation.',403);if(feature&&!value.features[feature])throw new DomainError('FEATURE_DISABLED','This feature is disabled for this business.',403);return value;}
export function validateBooleans(raw:unknown,keys:readonly string[]){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new DomainError('INVALID_INPUT','Invalid settings.');for(const [key,value]of Object.entries(raw))if(!keys.includes(key)||typeof value!=='boolean')throw new DomainError('INVALID_INPUT','Invalid settings.');return raw as Record<string,boolean>;}
export {moduleKeys,permissionKeys};
