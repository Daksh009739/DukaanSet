import type {Store} from './store';
import type {ExtractedPurchase,IntelligenceOverview,ReorderPlan,Simulation} from '../intelligence-contracts';
import {authorize} from './access';
import {ClosingService,sessionDay,safeSum} from './closing';
import {SaaSService} from './saas';
import {DomainError,integer,keys,lineTotal,object,string} from './validation';
import {minorUnits} from '../client';
import {canonicalUnit} from '../voice/parser';
import {resolveContact,resolveVoiceProduct,spokenText,voiceQuantity} from '../voice/os';
import type {InvoiceItem} from '../contracts';

export class IntelligenceService {
 constructor(readonly store:Store,readonly clock:()=>Date=()=>new Date()){}
 overview(userId:string,businessId:string):IntelligenceOverview {
  const config=authorize(this.store.db,userId,businessId,'reports','assistant'),state=new SaaSService(this.store).state(userId,businessId),closing=new ClosingService(this.store,this.clock),preview=closing.calculate(businessId),settings=closing.settings(businessId);
  const rows=this.store.db.prepare("SELECT items_json FROM invoices WHERE business_id=? AND status!='cancelled' AND date>=? AND date<=?").all(businessId,preview.session.openedAt,preview.asOf) as {items_json:string}[];
  let covered=0,totalLines=0;const costs:number[]=[];
  for(const row of rows)for(const item of JSON.parse(row.items_json) as InvoiceItem[]){totalLines++;const product=state.products.find(p=>p.id===item.productId);if(product&&product.costPaise>0){covered++;costs.push(lineTotal(product.costPaise,item.quantityMilli));}}
  const fullCost=config.permissions.inventory&&config.permissions.purchases&&preview.totals.returnsPaise===0&&totalLines>0&&covered===totalLines? safeSum(costs):null,low=config.permissions.inventory?state.products.filter(p=>p.quantityMilli<=p.minStockMilli).map(p=>({id:p.id,name:p.name,unit:p.unit,quantityMilli:p.quantityMilli,minStockMilli:p.minStockMilli})):[],receivables=config.permissions.customers?state.customers.filter(c=>c.balancePaise>0).map(c=>({id:c.id,name:c.name,balancePaise:c.balancePaise})):[];
  return{generatedAt:this.clock().toISOString(),businessDate:preview.session.businessDate||sessionDay(this.clock(),settings),timezone:settings.timezone,salesPaise:preview.totals.netSalesPaise,estimatedCostPaise:fullCost,estimatedGrossProfitPaise:fullCost===null?null:preview.totals.netSalesPaise-fullCost,costCoveragePercent:totalLines?Math.round(covered/totalLines*100):0,historicalCostAvailable:false,lowStock:low,receivables,plans:config.permissions.purchases&&config.permissions.inventory?state.products.filter(p=>p.quantityMilli<=p.minStockMilli).slice(0,30).map(p=>this.reorder(userId,businessId,{productId:p.id,leadDays:7,coverageDays:7})):[],sourceBillCount:rows.length,actions:[...low.map(p=>({kind:'stock' as const,id:p.id,name:p.name,value:p.quantityMilli,href:'/app/stock/'+p.id})),...receivables.map(c=>({kind:'credit' as const,id:c.id,name:c.name,value:c.balancePaise,href:'/app/customers/'+c.id})),...config.permissions.demand&&config.features.demandPulse?state.demand.requestsList.filter(r=>r.eligibleFollowUp).map(r=>({kind:'demand' as const,id:r.id,name:r.productName,value:r.remainingMilli,href:'/app/demand/'+r.id})):[]]};
 }
 reorder(userId:string,businessId:string,raw:unknown):ReorderPlan {
  const config=authorize(this.store.db,userId,businessId,'purchases');authorize(this.store.db,userId,businessId,'inventory');const input=object(raw);keys(input,['productId','leadDays','coverageDays']);const id=string(input.productId,'Product',36),lead=integer(input.leadDays??7,'Lead days',0,90),coverage=integer(input.coverageDays??7,'Coverage days',1,90),state=new SaaSService(this.store).state(userId,businessId),product=state.products.find(p=>p.id===id);if(!product)throw new DomainError('NOT_FOUND','Product not found.',404);
  const end=this.clock().toISOString(),start=new Date(this.clock().getTime()-30*86400000).toISOString(),rows=this.store.db.prepare("SELECT items_json FROM invoices WHERE business_id=? AND status!='cancelled' AND date>=? AND date<=?").all(businessId,start,end) as {items_json:string}[];
  const sold=safeSum(rows.flatMap(row=>(JSON.parse(row.items_json) as InvoiceItem[]).filter(i=>i.productId===id).map(i=>i.quantityMilli))),orders=new SaaSService(this.store).orders(userId,businessId),pending=safeSum(orders.filter(o=>o.productId===id&&o.status==='draft').map(o=>o.quantityMilli));
  const unmet=config.permissions.demand&&config.features.demandPulse?safeSum(state.demand.requestsList.filter(r=>r.productId===id&&['open','available'].includes(r.status)).map(r=>r.remainingMilli)):0;
  const projected=Number((BigInt(sold)*BigInt(lead+coverage)+29n)/30n),target=Math.max(projected,product.minStockMilli,unmet);let suggested=Math.max(0,target-product.quantityMilli);
  if(['pcs','piece','packet','box','bag','pair','bottle'].includes(canonicalUnit(product.unit)))suggested=Math.ceil(suggested/1000)*1000;
  // Saved drafts have no supplier acknowledgement. They are shown separately, never called confirmed incoming.
  return{productId:id,name:product.name,variant:product.variation,unit:product.unit,stockMilli:product.quantityMilli,recentSoldMilli:sold,observationDays:30,leadDays:lead,coverageDays:coverage,confirmedIncomingMilli:0,unconfirmedDraftMilli:pending,unmetDemandMilli:unmet,suggestedMilli:suggested,minimumMilli:product.minStockMilli,dataQuality:sold?'salesHistory':'minimumOnly'};
 }
 simulate(userId:string,businessId:string,raw:unknown):Simulation {
  authorize(this.store.db,userId,businessId,'reports');const input=object(raw);keys(input,['quantityMilli','costPaise','pricePaise']);const qty=integer(input.quantityMilli,'Quantity',1),cost=integer(input.costPaise,'Purchase rate'),price=integer(input.pricePaise,'Selling rate'),purchase=lineTotal(cost,qty),sales=lineTotal(price,qty),profit=sales-purchase;
  return{quantityMilli:qty,costPaise:cost,pricePaise:price,purchasePaise:purchase,potentialSalesPaise:sales,grossProfitPaise:profit,marginPercent:sales?Math.round(profit/sales*10000)/100:null,markupPercent:purchase?Math.round(profit/purchase*10000)/100:null,simulationOnly:true};
 }
 extractPurchase(userId:string,businessId:string,raw:unknown):ExtractedPurchase {
  authorize(this.store.db,userId,businessId,'purchases');const input=object(raw);keys(input,['text']);const text=string(input.text,'Document text',20000),state=new SaaSService(this.store).state(userId,businessId),lines=text.split(/[\r\n]+/).map(l=>l.trim()).filter(Boolean),supplier=lines.find(l=>/^(?:supplier|from|सप्लायर)\s*[:：]/i.test(l)),supplierName=supplier?.replace(/^.+?[:：]\s*/,'')||'',ids=resolveContact(supplierName,state.suppliers),items:ExtractedPurchase['items']=[],unparsed:string[]=[];let stated:number|null=null;
  for(const original of lines){if(original===supplier)continue;const t=spokenText(original),total=t.match(/^(?:total|grand total|कुल)\s+(\d+(?:\.\d{1,2})?)$/);if(total){stated=minorUnits(total[1]);continue;}
   const row=original.match(/^(.+?)\s+[@×]\s*(?:₹\s*)?(\d+(?:\.\d{1,2})?)\s*(?:\/\s*\w+)?$/u),quantity=row?spokenText(row[1]).match(/^(\d+(?:\.\d{1,3})?)\s+(kg|kilo|g|gram|piece|pieces|pcs|packet|packets|box|litre|ml|metre|किलो|पीस|पैकेट)\s+(.+)$/u):null;
   if(!row||!quantity){unparsed.push(original);continue;}const query=quantity[3],matches=resolveVoiceProduct(query,state.products),productId=matches.exact&&matches.ids.length===1?matches.ids[0]:'',unit=canonicalUnit(quantity[2]),qty=voiceQuantity({id:'document',query,productId,candidates:matches.ids,quantity:quantity[1],unit,price:'',priceBasis:''},state.products);items.push({query,productId,quantity:quantity[1],unit,cost:row[2],quantityMilli:qty,candidates:matches.ids});
  }
  const calculated=items.length&&items.every(i=>i.quantityMilli!==null)?safeSum(items.map(i=>lineTotal(minorUnits(i.cost),minorUnits(i.quantity,3)))):null;
  return{supplierName,supplierId:ids.length===1?ids[0]:'',items,statedTotalPaise:stated,calculatedTotalPaise:calculated,totalMatches:stated!==null&&calculated===stated,unparsedLines:unparsed,draftOnly:true};
 }
}
