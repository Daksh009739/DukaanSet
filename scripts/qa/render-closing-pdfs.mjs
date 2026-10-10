import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {createCanvas} from '@napi-rs/canvas';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';

const source=process.argv[2]||'.local/qa-v10',output=process.argv[3]||'.local/qa-v10/pdf-rendered';
mkdirSync(output,{recursive:true});
const reports=[];
for(const language of ['en','hi','hinglish']){
 const task=getDocument({data:new Uint8Array(readFileSync(path.join(source,`closing-${language}.pdf`)))}),pdf=await task.promise;
 for(let n=1;n<=pdf.numPages;n++){
  const page=await pdf.getPage(n),viewport=page.getViewport({scale:1.5}),canvas=createCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height));
  await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
  writeFileSync(path.join(output,`closing-${language}-${n}.png`),canvas.toBuffer('image/png'));
 }
 reports.push({language,pages:pdf.numPages});await task.destroy();
}
writeFileSync(path.join(output,'render-report.json'),JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports));
