import type {V3State} from '../v3-contracts';
import type {VoiceOSCopyKey} from './os-copy';
import type {VoiceCommand,VoiceIntent} from './os';
import {voiceActionRegistry,advanceVoice} from './conversation';

export type VoiceHeroVariant='default'|'compact'|'minimal';
type Example={key:VoiceOSCopyKey;intent:VoiceIntent};
export type VoicePageContext={path:string;intent:VoiceIntent;customerId?:string;productId?:string;invoiceId?:string;supplierId?:string};
type Hero={heading:VoiceOSCopyKey;variant:VoiceHeroVariant;examples:Example[];context:VoicePageContext;parameters?:Record<string,string>;description?:VoiceOSCopyKey};
const example=(key:VoiceOSCopyKey,intent:VoiceIntent):Example=>({key,intent});
const modules:Record<string,{heading:VoiceOSCopyKey;intent:VoiceIntent;examples:Example[]}>={
 home:{heading:'heroDashboard',intent:'report',examples:[example('heroSalesExample','report'),example('heroLowStockExample','report')]},
 customers:{heading:'heroCustomers',intent:'customer',examples:[example('heroCustomerExample','customer'),example('heroDuesExample','report')]},
 sales:{heading:'heroSales',intent:'sale',examples:[example('heroBillExample','sale'),example('heroSecondBillExample','sale')]},
 stock:{heading:'heroStock',intent:'stock',examples:[example('heroStockExample','stock'),example('heroPacketsExample','stock')]},
 purchases:{heading:'heroPurchases',intent:'purchase',examples:[example('heroPurchaseExample','purchase'),example('heroPurchasesExample','open')]},
 suppliers:{heading:'heroSuppliers',intent:'supplier',examples:[example('heroSupplierExample','supplier'),example('heroSuppliersExample','open')]},
 payments:{heading:'heroPayments',intent:'payment',examples:[example('heroPaymentExample','payment'),example('heroDuesExample','report')]},
 expenses:{heading:'heroExpenses',intent:'expense',examples:[example('heroExpenseExample','expense'),example('heroExpensesExample','report')]},
 demand:{heading:'heroDemand',intent:'demand',examples:[example('heroDemandExample','demand')]},
 reports:{heading:'heroReports',intent:'report',examples:[example('heroMonthExample','report'),example('heroLowStockExample','report')]},
 'daily-closing':{heading:'heroClosing',intent:'closing',examples:[example('heroClosingExample','closing'),example('heroCollectionsExample','report')]},
 insights:{heading:'heroInsights',intent:'insights',examples:[example('heroInsightsExample','insights')]},
 reorder:{heading:'heroReorder',intent:'reorder',examples:[example('heroReorderExample','reorder')]},
 scan:{heading:'heroScan',intent:'scan',examples:[example('heroScanExample','scan')]},
 simulation:{heading:'heroSimulation',intent:'simulation',examples:[example('heroSimulationExample','simulation')]},
 'todays-work':{heading:'heroActions',intent:'insights',examples:[example('heroInsightsExample','insights'),example('heroLowStockExample','report')]},
};

/** Discovery only advertises registered actions permitted in this business. No AI calls. */
export function voiceHeroForPage(path:string,state:V3State,tool?:VoiceIntent):Hero|null{
 const parts=path.split('/').filter(Boolean);if(parts[0]!=='app'||!state.configuration.features.voiceStock)return null;
 const section=parts[1]||'home',id=parts[2],key=section==='products'?'stock':section==='ai'?'insights':section==='intelligence'?(tool||'insights'):section;
 const module=modules[key];if(!module)return null;
 if(section==='demand'&&!state.configuration.features.demandPulse||section==='daily-closing'&&!state.configuration.features.dailyClosing||['ai','intelligence'].includes(section)&&!state.configuration.features.assistant)return null;
 const context:VoicePageContext={path,intent:module.intent};
 let heading=module.heading,examples=module.examples,variant:VoiceHeroVariant=section==='home'?'minimal':'default',parameters:Record<string,string>|undefined;
 if(id&&!['new','history','voice','voice-history','closings'].includes(id))variant='compact';
 const customer=section==='customers'&&state.customers.find(c=>c.id===id);
 const product=key==='stock'&&state.products.find(p=>p.id===id);
 const invoice=section==='sales'&&state.invoices.find(i=>i.id===id);
 if(customer&&state.configuration.permissions.customers){context.customerId=customer.id;context.intent='report';examples=[example('heroThisCustomerExample','report'),example('heroStatementExample','document')];}
 if(product){context.productId=product.id;context.intent='stock';examples=[example('heroThisProductExample','stock'),example('heroProductStockExample','report')];parameters={unit:product.unit};}
 if(invoice){context.invoiceId=invoice.id;heading='heroInvoice';context.intent='document';examples=[example('heroInvoiceExample','document')];}
 const supplier=section==='suppliers'&&state.suppliers.find(s=>s.id===id);
 if(supplier){context.intent='report';context.supplierId=supplier.id;examples=[example('heroSupplierDuesExample','report')];}
 if(section==='purchases'&&id)examples=[example('heroPurchasesExample','open')];
 examples=examples.filter(e=>voiceActionRegistry[e.intent].permitted(state));
 // Navigation still requires the advertised destination's permission.
 if(['purchases','suppliers'].includes(section)&&!state.configuration.permissions.purchases)return null;
 if(!examples.length)return null;
 if(!voiceActionRegistry[context.intent].permitted(state))context.intent=examples[0].intent;
 return {heading,variant,examples,context,parameters,...key==='scan'?{description:'heroScanDescription' as const}:{}};
}

/** Resolve typed page references only against the current authorised state; reuse the shared engine. */
export function advancePageVoice(raw:string,state:V3State,previous:VoiceCommand|undefined,context:VoicePageContext):VoiceCommand{
 const customer=state.configuration.permissions.customers&&state.customers.find(c=>c.id===context.customerId);
 let command=advanceVoice(raw,state,previous,customer?customer.id:undefined,context.intent);
 if(!voiceActionRegistry[command.intent].permitted(state))return command;
 const product=state.products.find(p=>p.id===context.productId);
 const productReference=/this product|is product|इस उत्पाद|इस प्रोडक्ट|यह उत्पाद/i;
 if(product&&productReference.test(raw)){
  if(command.intent==='report'&&command.fields.report==='stock')command={...command,fields:{...command.fields,query:product.name+' '+product.variation+' stock'}};
  if(command.intent==='stock'&&command.items.length===1&&(productReference.test(command.items[0].query)||/^product$/i.test(command.items[0].query)))command={...command,fields:{...command.fields,pageProductId:product.id},items:[{...command.items[0],query:product.name+' '+product.variation,productId:product.id,candidates:[product.id]}]};
 }
 const invoice=state.invoices.find(i=>i.id===context.invoiceId);
 if(invoice&&command.intent==='document'&&/this bill|this invoice|is bill|इस बिल/i.test(raw))command={...command,fields:{...command.fields,invoiceId:invoice.id,customerId:invoice.customerId||'',documentKind:'invoice'}};
 const supplier=state.configuration.permissions.purchases&&state.suppliers.find(s=>s.id===context.supplierId);
 if(supplier&&command.intent==='report'&&/this supplier|is supplier|इस सप्लायर/i.test(raw))command={...command,fields:{...command.fields,report:'supplierOutstanding',supplierId:supplier.id,supplierQuery:supplier.name,customerId:'',customerQuery:''}};
 return command;
}
