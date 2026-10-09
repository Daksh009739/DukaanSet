import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {copy,locales,languageTags} from '../../src/locales/registry';

test('V8 public pages render in all languages across the required viewport widths',async({page})=>{
 test.setTimeout(240000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const language of locales){for(const route of ['','business-types','features','how-it-works','pricing','help']){
  const response=await page.goto('/'+language+(route?'/'+route:''));expect(response?.status()).toBe(200);await expect(page.locator('html')).toHaveAttribute('lang',languageTags[language]);await expect(page.locator('main h1')).toHaveCount(1);
  for(const width of [320,360,375,390,412,430,768,1024,1440,1920]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),language+'/'+route+' '+width).toBe(true);}
  const a11y=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();expect(a11y.violations).toEqual([]);
 }}expect(errors).toEqual([]);
});

test('fictional product demos have pause, replay and reduced-motion controls without any writes',async({page})=>{
 const writes:string[]=[];page.on('request',r=>{if(r.method()==='POST')writes.push(r.url());});
 await page.goto('/en');const demo=page.locator('#connected-workflow [data-sale-demo]');await demo.getByRole('button',{name:'Play the workflow',exact:true}).click();await expect(demo).toHaveAttribute('data-stage','0');await demo.getByRole('button',{name:'Pause demonstration'}).click();const paused=await demo.getAttribute('data-stage');await page.waitForTimeout(1200);await expect(demo).toHaveAttribute('data-stage',paused!);
 await page.emulateMedia({reducedMotion:'reduce'});await demo.getByRole('button',{name:'Resume demonstration'}).click();await expect(demo).toHaveAttribute('data-stage','6');await expect(demo.getByRole('status')).toContainText('No business records changed');await demo.getByRole('button',{name:'Replay demonstration'}).click();await expect(demo).toHaveAttribute('data-stage','6');
 const voice=page.locator('[data-voice-preview]');await voice.getByRole('button',{name:'Show the example draft'}).click();await expect(voice).toContainText('₹298');await voice.getByRole('button',{name:'Reset the example'}).click();
 const demand=page.locator('[data-demand-preview]');for(let i=0;i<5;i++)await demand.getByRole('button',{name:'Next step'}).click();await expect(demand.getByRole('status')).toHaveText('A possible future sale');await expect(demand).toContainText('Requests are not revenue');
 expect(writes).toEqual([]);expect((await page.request.get('/api/session')).status()).toBe(401);
});

test('industry keyboard controls, help search, mobile navigation and localized CTAs work',async({page})=>{
 await page.goto('/en/business-types');const tabs=page.getByRole('tab');await tabs.nth(1).click();await expect(page.getByRole('tabpanel')).toContainText('Setu Hardware');await tabs.nth(1).press('End');await expect(tabs.nth(5)).toHaveAttribute('aria-selected','true');await expect(tabs.nth(5)).toBeFocused();await tabs.nth(5).press('Home');await expect(tabs.nth(0)).toHaveAttribute('aria-selected','true');
 await page.goto('/en/help');await page.getByRole('searchbox').fill('password');await expect(page.locator('main details')).toHaveCount(1);await page.locator('main summary').click();await expect(page.locator('main details[open]')).toContainText('email link');await page.getByRole('searchbox').fill('not-a-help-topic');await expect(page.getByRole('status')).toContainText('No matching topics');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation'}).click();const menu=page.locator('#marketing-mobile-nav');await expect(menu).toBeVisible();await expect(menu.getByRole('link').first()).toBeFocused();await page.keyboard.press('Escape');await expect(menu).toBeHidden();await expect(page.getByRole('button',{name:'Open navigation'})).toBeFocused();await page.getByRole('button',{name:'Open navigation'}).click();await menu.getByRole('combobox').selectOption('hi');await expect(page).toHaveURL(/\/hi\/help$/);
 await page.goto('/en/pricing');for(const link of await page.locator('.m-pricing-card a').all())await expect(link).toHaveAttribute('href','/register');
 await page.goto('/en/how-it-works');await page.getByRole('button',{name:/Choose your business/}).click();await expect(page.locator('[data-journey-step="1"]')).toHaveAttribute('data-active','true');await expect(page.locator('[class*=journeyPreview]')).toContainText('Hardware');await page.getByRole('button',{name:/Set up your shop/}).click();await expect(page.locator('[class*=journeyPreview]')).toContainText('Everyday Threads');
});

test('auth password controls, matching, legal acknowledgement and language changes preserve form values',async({page})=>{
 const posts:string[]=[];page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/auth/register'))posts.push(r.url());});
 await page.goto('/register');await page.getByLabel('Name',{exact:true}).fill('V8 Form QA');await page.getByLabel('Email',{exact:true}).fill('v8-ui@example.test');await page.getByLabel('Password',{exact:true}).fill('A-long-unique-passphrase');await page.getByLabel('Confirm password',{exact:true}).fill('A-different-passphrase');await page.getByRole('button',{name:'Show password',exact:true}).first().click();await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');await page.locator('[name="termsAcknowledged"]').check();await page.getByRole('button',{name:'Get started free',exact:true}).click();expect(posts).toEqual([]);expect(await page.locator('[name="passwordConfirmation"]').evaluate((el:HTMLInputElement)=>el.validationMessage)).toBe('Passwords do not match.');
 await page.locator('.auth-top select').selectOption('hi');await expect(page.getByLabel(copy('translation','hi').email,{exact:true})).toHaveValue('v8-ui@example.test');await expect(page.getByLabel(copy('translation','hi').password,{exact:true})).toHaveValue('A-long-unique-passphrase');await page.locator('[name="passwordConfirmation"]').fill('A-long-unique-passphrase');await expect(page.locator('.auth-form')).toContainText(copy('marketing','hi').v8.passwordMatch);
 for(const route of ['/login','/register','/forgot-password','/reset-password','/verify-email']){await page.goto(route);for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);}
});
