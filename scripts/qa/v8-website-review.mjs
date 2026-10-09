import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:3000';
fs.mkdirSync('docs/qa/v8',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})}),context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [name,route] of [['home','/en'],['business','/en/business-types'],['features','/en/features'],['journey','/en/how-it-works'],['pricing','/en/pricing'],['help','/en/help'],['login','/login'],['register','/register'],['recovery','/forgot-password'],['reset','/reset-password'],['verify','/verify-email']]){
 await page.setViewportSize({width:1440,height:1000});const response=await page.goto(origin+route);await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({style:"nextjs-portal{visibility:hidden}",path:`docs/qa/v8/${name}-1440.png`,fullPage:true});if(['home','login','register'].includes(name))await page.screenshot({style:"nextjs-portal{visibility:hidden}",path:`docs/qa/v8/${name}-1440-viewport.png`});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();
 const widths=[];
 for(const width of [320,360,375,390,412,430,768,1024,1440,1920]){await page.setViewportSize({width,height:950});const issues=await page.evaluate(()=>Array.from(document.querySelectorAll('h1,h2,h3,p,button,a,strong,input,select')).filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&!el.classList.contains('m-skip-link')&&(r.right>innerWidth+2||r.left< -2||el.scrollWidth>el.clientWidth+4);}).map(el=>({text:el.textContent.slice(0,60),class:el.className,width:el.clientWidth,scroll:el.scrollWidth})));widths.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),issues});if(width===390||name==='home'&&width===768)await page.screenshot({style:"nextjs-portal{visibility:hidden}",path:`docs/qa/v8/${name}-${width}.png`,fullPage:true});}
 results.push({name,route,status:response.status(),accessibility:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),widths});console.log(name, 'axe='+axe.violations.length,'layout='+widths.reduce((n,r)=>n+r.issues.length+Number(r.overflow),0));
}
for(const locale of ['hi','hinglish']){await page.setViewportSize({width:390,height:950});await page.goto('http://127.0.0.1:3000/'+locale);await page.evaluate(()=>document.fonts.ready);await page.screenshot({style:"nextjs-portal{visibility:hidden}",path:`docs/qa/v8/home-${locale}-390.png`,fullPage:true});const axe=await new AxeBuilder({page}).include('main').analyze();results.push({locale,accessibility:axe.violations.map(v=>v.id)});}
fs.writeFileSync('docs/qa/v8/render-report.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,results,errors},null,2));await browser.close();
if(errors.length||results.some(r=>r.accessibility.length||r.widths?.some(w=>w.overflow||w.issues.length)))process.exitCode=1;
