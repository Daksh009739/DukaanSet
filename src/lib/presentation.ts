import type { TFunction } from 'i18next';
import type { Task } from './contracts';
import { money, quantity } from './client';

export function taskText(task:Task,t:TFunction,language:string):string {
  return task.type==='credit'?t('taskCreditDetail',{name:task.name,amount:money(task.balancePaise||0,language)}):task.type==='expiry'?t('taskExpiryDetail',{name:task.name,date:task.expiryDate}):t('taskStockDetail',{name:task.name,quantity:quantity(task.quantityMilli||0),unit:task.unit});
}
export function taskHref(task:Task):string {
  return task.type==='credit'?`/app/customers/${task.customerId}`:`/app/stock?product=${task.productId}`;
}
