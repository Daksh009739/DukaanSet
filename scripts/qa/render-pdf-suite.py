"""Render every QA page with Poppler and audit text bounds with pdfplumber."""
import json, os, subprocess, sys
from pathlib import Path
import pdfplumber
from PIL import Image, ImageDraw

root=Path(sys.argv[1] if len(sys.argv)>1 else '.local/qa/pdf-suite')
poppler=sys.argv[2] if len(sys.argv)>2 else r'C:\Users\daksh\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe'
manifest=json.loads((root/'manifest.json').read_text())['documents']
output=root/'rendered';output.mkdir(exist_ok=True)
audits=[];pages=[]
for entry in manifest:
 name=entry['name']; source=root/(name+'.pdf')
 subprocess.run([poppler,'-scale-to','1000','-png',str(source),str(output/name)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 with pdfplumber.open(source) as pdf:
  assert len(pdf.pages)==entry['pages'],name
  violations=[]
  for n,page in enumerate(pdf.pages,1):
   # Glyph bounds include font ascenders/descenders; allow 1pt numerical tolerance.
   bad=[{'text':c['text'],'bounds':[round(c[k],2) for k in ['x0','top','x1','bottom']]} for c in page.chars if c['x0']<-1 or c['x1']>page.width+1 or c['top']<-1 or c['bottom']>page.height+1]
   violations.extend(bad)
   pages.append((name,n,output/f'{name}-{n}.png'))
  audits.append({'name':name,'pages':len(pdf.pages),'outOfPage':violations})
# Every page appears in labelled contact sheets, four columns; native-size PNGs remain.
for sheet in range(0,len(pages),12):
 chunk=pages[sheet:sheet+12];thumb_w=380;thumb_h=540;canvas=Image.new('RGB',(thumb_w*4,thumb_h*3),'#DCE7E3');draw=ImageDraw.Draw(canvas)
 for i,(name,n,file) in enumerate(chunk):
  img=Image.open(file).convert('RGB');img.thumbnail((thumb_w-18,thumb_h-36));x=(i%4)*thumb_w+(thumb_w-img.width)//2;y=(i//4)*thumb_h+28;canvas.paste(img,(x,y));draw.text(((i%4)*thumb_w+8,(i//4)*thumb_h+7),f'{name} / p{n}',fill='#082F2A')
 canvas.save(output/f'contact-{sheet//12+1:02}.png')
(root/'visual-audit.json').write_text(json.dumps({'documents':len(audits),'pages':len(pages),'audits':audits},indent=2))
print(json.dumps({'documents':len(audits),'pages':len(pages),'boundsViolations':sum(len(v['outOfPage']) for v in audits),'contactSheets':(len(pages)+11)//12}))
