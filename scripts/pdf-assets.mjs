import {copyFileSync,existsSync,mkdirSync,readFileSync} from 'node:fs';
// Keep the local worker identical to the locked PDF.js library, including offline builds.
export function syncPdfAssets(){
  mkdirSync('public',{recursive:true});
  for(const [source,target]of [['node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/pdf.worker.min.mjs'],['node_modules/pdfjs-dist/LICENSE','public/pdfjs-LICENSE.txt']]){
    if(!existsSync(target)||!readFileSync(source).equals(readFileSync(target)))copyFileSync(source,target);
  }
}
