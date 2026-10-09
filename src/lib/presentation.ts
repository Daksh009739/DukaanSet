import type { TFunction } from 'i18next';
import type { Task } from './contracts';
import { money, quantity } from './client';
import {unitText,dateText,text} from './locale';

export function taskText(task:Task,t:TFunction,language:string):string {
  return task.type==='credit'?t('taskCreditDetail',{name:task.name,amount:money(task.balancePaise||0,language)}):task.type==='demand'?t('taskDemandDetail',{name:task.name,quantity:quantity(task.quantityMilli||0),unit:unitText(task.unit||'',language)}):task.type==='expiry'?t('taskExpiryDetail',{name:task.name,date:dateText(task.expiryDate||'',language)}):t('taskStockDetail',{name:task.name,quantity:quantity(task.quantityMilli||0),unit:unitText(task.unit||'',language)});
}
export function taskHref(task:Task):string {
  return task.type==='credit'?`/app/customers/${task.customerId}`:task.type==='demand'?task.productId?`/app/demand?product=${task.productId}`:`/app/demand?query=${encodeURIComponent(task.name)}`:`/app/stock?product=${task.productId}`;
}

export function activityText(action:string,language:string):string{return text(language,'translation','activityLabels.'+(Object.hasOwn(activityKeys,action)?activityKeys[action]:'updated'));}
const activityKeys:Record<string,string>={'business.created':'business','onboarding.completed':'business','product.created':'productCreated','product.updated':'productUpdated','stock.receipt':'stockReceipt','stock.wastage':'stockWastage','stock.correction':'stockCorrection','invoice.created':'sale','invoice.cancelled':'cancelled','customer.created':'customer','supplier.created':'supplier','payment.created':'payment','purchase.created':'purchase','expense.created':'expense','closing.created':'closing','inventory.created':'inventory','demo.reset':'demo'};
