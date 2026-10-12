import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {messages} from '../../src/locales/registry';
import {money} from '../../src/lib/client';
import {taskHref} from '../../src/lib/presentation';
import {osCopy} from '../../src/lib/voice/os-copy';
import type {V3State} from '../../src/lib/v3-contracts';
import type {Session,Language} from '../../src/lib/contracts';
import type {ClosingPreview} from '../../src/lib/closing-contracts';

const origin='http://127.0.0.1:3001',output='.local/qa-insight-workspaces';mkdirSync(output,{recursive:true});
const post=(page:Page,path:string,data:unknown)=>page.request.post('/api'+path,{headers:{Origin:origin},data});
async function setup(page:Page,language:Language='en',scenario?:string){expect((await post(page,'/auth/demo',{language,...(scenario?{scenario}:{})})).status()).toBe(201);const session:Session=await(await page.request.get('/api/session')).json();await page.goto('/app');const state:V3State=await(await page.request.get(`/api/businesses/${session.businesses[0].id}/state`)).json();return{session,state};}
async function openAccount(page:Page,language:Language){const w=messages[language].workspace;if(page.viewportSize()!.width<800){const primary=page.locator('.app-header .reference-menu'),trigger=await primary.isVisible()?primary:page.locator('.app-header .mobile-only');await trigger.click();const drawer=page.getByRole('dialog',{name:w.sidebar.navigation});await drawer.getByRole('button',{name:w.sidebar.profileActions,exact:true}).click();return trigger;}const trigger=page.locator('.profile-menu-trigger');await trigger.click();return trigger;}
const ledger=(state:V3State)=>({invoices:state.invoices,payments:state.payments,movements:state.movements,expenses:state.expenses,purchases:state.purchases,demands:state.demand.requestsList});

test('reports, task filters, demand search and help links reflect the actual shop without writes',async({page})=>{
  test.setTimeout(120000);const {state}=await setup(page),w=messages.en.workspace,t=messages.en.translation;
  await page.goto('/app/reports');const reports=page.getByTestId('reports-studio');
  for(const [label,value]of [[t.netSales,state.totals.salesPaise],[t.moneyReceived,state.totals.receivedPaise],[t.outstanding,state.metrics.outstandingPaise]]as const)await expect(reports.locator('.module-metric').filter({has:page.locator('dt',{hasText:label})}).locator('dd')).toContainText(money(value));
  await expect(reports.getByText(money(state.metrics.stockValuePaise),{exact:true})).toBeVisible();await expect(reports.getByText(t.profitNotice,{exact:true})).toBeVisible();
  await page.goto('/app/todays-work');const work=page.getByTestId('work-studio');for(const task of state.tasks)await expect(work.getByRole('link').filter({has:page.getByRole('heading',{name:task.name,exact:true})})).toHaveAttribute('href',taskHref(task));
  await work.getByRole('button',{name:t.stock,exact:true}).click();await expect(work.locator('h2').filter({hasText:state.tasks.find(task=>task.type==='credit')!.name})).toHaveCount(0);
  await work.getByRole('searchbox',{name:w.studio.searchTasks}).fill('no-such-task');await expect(work.getByRole('heading',{name:w.studio.noMatches})).toBeVisible();await work.getByRole('button',{name:w.moduleUi.resetFilters}).click();await expect(work.getByRole('searchbox')).toHaveValue('');
  await page.goto('/app/demand');await page.getByRole('searchbox',{name:messages.en.v3.search,exact:true}).fill('no-such-demand');await expect(page.getByRole('heading',{name:messages.en.v3.noDemand,exact:true})).toBeVisible();await page.getByRole('button',{name:w.moduleUi.clearSearch}).click();await expect(page.getByRole('searchbox')).toHaveValue('');
  await page.goto('/app/help');const help=page.getByTestId('help-studio');await help.getByRole('searchbox',{name:w.studio.searchGuides}).fill(t.newBill);const guide=help.getByRole('link').filter({has:page.getByRole('heading',{name:t.newBill,exact:true})});await expect(guide).toHaveAttribute('href','/app/sales/new');await guide.click();await expect(page).toHaveURL(/\/app\/sales\/new$/);
  const after:V3State=await(await page.request.get(`/api/businesses/${state.business.id}/state`)).json();expect(ledger(after)).toEqual(ledger(state));
});

test('account panel retains focus, real navigation and persistent language settings on a phone',async({page})=>{
  await setup(page);await page.setViewportSize({width:390,height:844});const w=messages.en.workspace,trigger=await openAccount(page,'en');const dialog=page.getByRole('dialog',{name:w.profileMenu});await expect(dialog).toBeVisible();await expect(dialog.getByText(w.studio.demoAccount,{exact:true})).toBeVisible();await expect(dialog.getByRole('link',{name:new RegExp(w.sidebar.myProfile)})).toHaveAttribute('href','/app/settings/account');
  expect((await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);await dialog.getByRole('combobox',{name:messages.en.translation.language,exact:true}).selectOption('hi');await expect(page.getByRole('dialog',{name:messages.hi.workspace.profileMenu})).toBeVisible();expect((await(await page.request.get('/api/session')).json()).user.language).toBe('hi');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(trigger).toBeFocused();await openAccount(page,'hi');const updated=page.getByRole('dialog',{name:messages.hi.workspace.profileMenu});await updated.getByRole('button',{name:messages.hi.workspace.sidebar.yourShops,exact:true}).click();await expect(page.getByRole('dialog',{name:messages.hi.workspace.sidebar.navigation})).toBeVisible();await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});

test('closing review keeps the shop open until cash and explicit acknowledgement are confirmed',async({page})=>{
  test.setTimeout(90000);const {state}=await setup(page,'en','closing'),w=messages.en.workspace;
  const preview:ClosingPreview=await(await page.request.get(`/api/businesses/${state.business.id}/closing-review`)).json();await page.goto('/app/daily-closing');const confirm=page.getByRole('button',{name:w.confirmClosing,exact:true});await expect(confirm).toBeDisabled();await page.getByRole('link',{name:/02/}).click();await page.getByLabel(w.actualCash,{exact:true}).fill(String(preview.totals.expectedCashPaise/100));await expect(confirm).toBeDisabled();await page.getByLabel(w.acknowledge,{exact:true}).check();await expect(confirm).toBeEnabled();
  const before:V3State=await(await page.request.get(`/api/businesses/${state.business.id}/state`)).json();expect(before.closing!.session.status).toBe('open');expect(ledger(before)).toEqual(ledger(state));await confirm.click();await expect(page.locator('.closing-report-banner h2')).toBeVisible();const after:V3State=await(await page.request.get(`/api/businesses/${state.business.id}/state`)).json();expect(after.closing!.session.status).toBe('closed');expect(after.closing!.latest!.actualCashPaise).toBe(preview.totals.expectedCashPaise);expect(ledger(after)).toEqual(ledger(state));
});

for(const language of ['en','hi','hinglish']as Language[])test(`all seven refreshed views fit desktop and phones with accessible ${language} copy`,async({page})=>{
  test.setTimeout(180000);await setup(page,language);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));const checks:{page:string;width:number}[]=[];
  for(const route of ['demand','reports','daily-closing','intelligence','todays-work','help']){
    await page.goto('/app/'+route);await expect(page.locator('main h1').first()).toBeVisible();if(route==='intelligence')await expect(page.locator('.intelligence-panel').getByRole('heading',{name:osCopy(language).insights,exact:true})).toBeVisible();
    for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);if(width===390||width===1440){const result=await new AxeBuilder({page}).include('.workspace').withTags(['wcag2a','wcag2aa']).analyze();expect(result.violations,`${route}, ${language}, ${width}`).toEqual([]);if(language==='en')await page.screenshot({path:`${output}/${route}-${width}.png`,fullPage:true});}checks.push({page:route,width});}
  }
  for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});await openAccount(page,language);const dialog=page.getByRole('dialog',{name:messages[language].workspace.profileMenu});await expect(dialog).toBeVisible();const geometry=await dialog.evaluate(el=>{const box=el.getBoundingClientRect();return{left:box.left,right:box.right,height:box.height,width:innerWidth,viewport:innerHeight};});expect(geometry.left).toBeGreaterThanOrEqual(0);expect(geometry.right).toBeLessThanOrEqual(geometry.width);expect(geometry.height).toBeLessThanOrEqual(geometry.viewport);if(width!==320){expect((await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);if(language==='en')await page.screenshot({path:`${output}/account-${width}.png`});}await page.keyboard.press('Escape');checks.push({page:'account',width});}
  expect(errors).toEqual([]);writeFileSync(`${output}/${language}-layouts.json`,JSON.stringify({checks,accessibilityScans:14,pageErrors:errors},null,2));
});
