import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Session} from '../../src/lib/contracts';
import type {V3State} from '../../src/lib/v3-contracts';
const origin='http://127.0.0.1:3001';
async function setup(page:Page){
  expect((await page.request.post('/api/auth/demo',{headers:{Origin:origin},data:{language:'en'}})).status()).toBe(201);
  const user:Session=await(await page.request.get('/api/session')).json();await page.goto('/app');await expect(page.locator('main')).toHaveAttribute('data-business-id',user.businesses[0].id);return user;
}
const ledger=async(page:Page,id:string):Promise<V3State>=>(await page.request.get(`/api/businesses/${id}/state`)).json();
const sidebar=(page:Page)=>page.locator('aside.sidebar');
const switchTrigger=(page:Page)=>sidebar(page).getByRole('button',{name:/^Switch shop:/});

test('one navigation registry serves expanded, persistent rail, nested tools and profile actions',async({page})=>{
  const user=await setup(page),before=await ledger(page,user.businesses[0].id),nav=sidebar(page);
  await expect(nav.getByRole('link',{name:'Dashboard',exact:true})).toHaveAttribute('aria-current','page');
  await expect(nav.getByRole('link',{name:'Customers',exact:true})).not.toContainText(String(before.customers.length));
  await nav.getByRole('button',{name:'Business Tools',exact:true}).click();await expect(nav.getByRole('link',{name:'DukaanSet AI',exact:true})).toBeVisible();
  await nav.getByRole('link',{name:'DukaanSet AI',exact:true}).click();await expect(page).toHaveURL(/\/app\/ai$/);await expect(nav.getByRole('button',{name:'Business Tools'})).toHaveAttribute('aria-expanded','true');await expect(nav.getByRole('link',{name:'DukaanSet AI',exact:true})).toHaveAttribute('aria-current','page');
  await nav.getByRole('button',{name:'Collapse navigation',exact:true}).click();await expect(page.locator('.workspace')).toHaveClass(/sidebar-collapsed/);
  await expect(nav.getByRole('button',{name:'Business Tools'})).toHaveAttribute('aria-expanded','true');
  await nav.getByRole('link',{name:'Products & Stock',exact:true}).focus();await expect(nav.getByRole('link',{name:'Products & Stock',exact:true})).toContainText('Products & Stock');
  await nav.getByRole('link',{name:'Products & Stock',exact:true}).click();await expect(nav.getByRole('link',{name:'Products & Stock',exact:true})).toHaveAttribute('aria-current','page');
  await page.reload();await expect(page.locator('.workspace')).toHaveClass(/sidebar-collapsed/);await expect(nav).toHaveCSS('width','80px');
  expect(await(await page.request.get('/app')).text()).toMatch(/class="[^"]*workspace[^"]*sidebar-collapsed/);
  await nav.getByRole('button',{name:'Expand navigation'}).click();await nav.getByRole('button',{name:'Open profile actions'}).click();await expect(page.getByRole('dialog')).toContainText(user.user.email);await expect(page.getByRole('dialog').getByRole('link',{name:'My profile'})).toHaveAttribute('href','/app/settings/account');await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
  await nav.getByRole('link',{name:'Explore DukaanSet plans'}).click();await expect(page).toHaveURL(/\/pricing$/);
  expect((await ledger(page,user.businesses[0].id)).totals).toEqual(before.totals);
});

test('drawer locks page scrolling, closes on outside tap and brand navigation, and restores its trigger',async({page})=>{
  await setup(page);await page.setViewportSize({width:390,height:844});await page.goto('/app/stock');const trigger=page.locator('.bottom-nav button');await trigger.click();const drawer=page.getByRole('dialog');await expect(drawer).toHaveCSS('transform','none');await expect(page.locator('body')).toHaveAttribute('data-scroll-locked','1');await page.mouse.click(380,400);await expect(drawer).toBeHidden();await expect(trigger).toBeFocused();await trigger.click();await drawer.getByRole('link',{name:'DukaanSet home',exact:true}).click();await expect(page).toHaveURL(/\/app$/);await expect(drawer).toBeHidden();await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked','1');
});

test('shop switches protect drafts, commit scope atomically and preserve the active shop on failure',async({page,browser})=>{
  const user=await setup(page),first=user.businesses[0],target=user.businesses.find(b=>b.id!==first.id)!,before=await ledger(page,first.id);
  await page.goto('/app/sales/new');const product=before.products[0];await page.getByRole('button',{name:new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).first().click();
  await switchTrigger(page).click();await sidebar(page).getByRole('searchbox',{name:'Search your shops…'}).fill(target.name);await sidebar(page).getByRole('option',{name:target.name,exact:true}).click();
  const warning=page.getByRole('dialog');await expect(warning).toContainText('Local drafts stay with this shop');await warning.getByRole('button',{name:'Stay in this shop',exact:true}).click();await expect(page.locator('main')).toHaveAttribute('data-business-id',first.id);await expect(page.getByLabel(`Quantity ${product.name}`,{exact:true})).toHaveValue('1');
  await page.locator('#business-select').selectOption(target.id);await warning.getByRole('button',{name:'Switch shop',exact:true}).click();await expect(page.locator('main')).toHaveAttribute('data-business-id',target.id);await expect(page.getByLabel(`Quantity ${product.name}`,{exact:true})).toHaveCount(0);
  await page.locator('#business-select').selectOption(first.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',first.id);await expect(page.getByLabel(`Quantity ${product.name}`,{exact:true})).toHaveValue('1');
  await page.getByRole('button',{name:'Clear draft',exact:true}).click();
  await page.goto('/app/daily-closing');await expect(page.locator('.session-strip')).toBeVisible();await page.locator('#business-select').selectOption(target.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',target.id);await page.locator('#business-select').selectOption(first.id);await expect(page.locator('main')).toHaveAttribute('data-business-id',first.id);await expect(page.locator('.session-strip')).toBeVisible();await page.getByLabel('Physical cash counted',{exact:true}).fill('100');await page.locator('#business-select').selectOption(target.id);await expect(warning).toContainText('Local drafts stay with this shop');await warning.getByRole('button',{name:'Stay in this shop',exact:true}).click();await page.getByLabel('Physical cash counted',{exact:true}).fill('');await page.goto('/app/sales/new');
  await page.route(`**/api/businesses/${target.id}/state`,route=>route.fulfill({status:503,json:{error:{code:'UNAVAILABLE',message:'Test outage'}}}));
  await page.locator('#business-select').selectOption(target.id);await expect(page.getByRole('status').filter({hasText:'Could not switch shops'})).toBeVisible();await expect(page.locator('main')).toHaveAttribute('data-business-id',first.id);await expect(page.locator('#business-select')).toHaveValue(first.id);await page.unroute(`**/api/businesses/${target.id}/state`);
  const destination=await ledger(page,target.id);await page.route(`**/api/businesses/${target.id}/state`,async route=>{await new Promise(resolve=>setTimeout(resolve,2000));await route.fulfill({status:200,json:destination}).catch(()=>{});});await page.locator('#business-select').selectOption(target.id);await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('main')).toHaveAttribute('data-business-id',first.id);await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();await expect(page.getByRole('dialog')).toBeHidden();await expect(page.locator('#business-select')).toBeEnabled();await expect(page.locator('main')).toHaveAttribute('data-business-id',first.id);await page.unroute(`**/api/businesses/${target.id}/state`);
  const foreign=await browser.newContext();expect((await foreign.request.get(`${origin}/api/businesses/${first.id}/state`)).status()).toBe(401);await foreign.close();
  await page.goto('/app/stock/voice');await page.getByRole('textbox').first().fill('Add 3 kg of onions');await page.setViewportSize({width:390,height:844});await page.locator('.bottom-nav button').click();const drawer=page.getByRole('dialog');await drawer.getByRole('button',{name:/^Switch shop:/}).click();await drawer.getByRole('option',{name:target.name,exact:true}).click();await expect(warning.getByRole('heading',{name:'Switch shop with unfinished work?',exact:true})).toBeVisible();await warning.getByRole('button',{name:'Switch shop',exact:true}).click();await expect(page.locator('main')).toHaveAttribute('data-business-id',target.id);await expect(page.getByRole('textbox').first()).not.toHaveValue('Add 3 kg of onions');
  expect((await ledger(page,first.id)).totals).toEqual(before.totals);
});

test('mobile drawer keyboard, route closing and eleven widths stay accessible in three languages',async({page})=>{
  test.setTimeout(240000);await setup(page);
  for(const language of ['en','hi','hinglish']){
    if(language!=='en')await page.waitForTimeout(60000); // Production request budget, never disabled for QA.
    await page.setViewportSize({width:1440,height:900});await page.locator('.app-header select[aria-label]').first().selectOption(language);await expect(page.locator('html')).toHaveAttribute('lang',language==='hinglish'?'hi-Latn':language);
    for(const width of [320,360,375,390,412,430,768,1024,1280,1440,1920]){
      await page.setViewportSize({width,height:width<=430?844:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      if(width<=1024){const trigger=page.locator('.bottom-nav button');await trigger.click();const drawer=page.getByRole('dialog');await expect(drawer).toBeVisible();await expect(drawer).toHaveCSS('transform','none');const bounds=await drawer.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);await drawer.getByRole('button',{name:/Switch shop:|दुकान बदलें:|Shop badlein:/}).click();await drawer.getByRole('searchbox').fill('no-match-shop');await expect(drawer.getByRole('option')).toHaveCount(0);await page.keyboard.press('Escape');await expect(drawer).toBeVisible();await page.keyboard.press('Escape');await expect(drawer).toBeHidden();await expect(trigger).toBeFocused();}
    }
    await page.setViewportSize({width:390,height:844});await page.locator('.bottom-nav button').click();let result=await new AxeBuilder({page}).include('[role="dialog"]').withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
    await page.getByRole('dialog').locator('a[data-nav-id="stock"]').click();await expect(page).toHaveURL(/\/app\/stock$/);await expect(page.getByRole('dialog')).toBeHidden();
    await page.setViewportSize({width:1440,height:600});const navBox=await sidebar(page).boundingBox(),footerBox=await sidebar(page).getByRole('button',{name:/Open profile actions|प्रोफ़ाइल के विकल्प खोलें|Profile options kholein/}).boundingBox();expect(footerBox!.x+footerBox!.width).toBeLessThanOrEqual(navBox!.width+1);expect(footerBox!.y+footerBox!.height).toBeLessThanOrEqual(600);result=await new AxeBuilder({page}).include('aside.sidebar').withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);await sidebar(page).locator('[data-nav-id="settings"]').click();await expect(page).toHaveURL(/\/app\/settings$/);await page.goto('/app');
  }
});
