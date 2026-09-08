"""Build a TEEL sheet from the teacher's own template file, swapping only the
words and leaving every bit of their formatting alone.

  python3 tools/build-teel-sheet.py tools/kits/purpose-sheet.json
"""
import re,zipfile,os,html,json,sys

cfg=json.load(open(sys.argv[1]))
SRC=cfg.get("src","tools/teel-template-source.docx"); OUT=cfg["out"]
x=zipfile.ZipFile(SRC).read('word/document.xml').decode('utf8')

def ptext(p): return ''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>',p,flags=re.S))
def set_runs(p,new_texts):
    """replace the text of the paragraph's text runs in order; extras emptied"""
    runs=[r for r in re.finditer(r'<w:r[ >].*?</w:r>',p,flags=re.S) if re.search(r'<w:t[ >]',r.group(0))]
    out=p; off=0
    for i,r in enumerate(runs):
        t=new_texts[i] if i<len(new_texts) else ''
        body=r.group(0)
        nb=re.sub(r'<w:t[^>]*>.*?</w:t>','<w:t xml:space="preserve">'+html.escape(t,quote=False)+'</w:t>',body,count=1,flags=re.S)
        if nb.count('<w:t')>1:
            nb=re.sub(r'(<w:t xml:space="preserve">.*?</w:t>).*?(?=</w:r>)',r'\1',nb,count=1,flags=re.S)
        out=out[:r.start()+off]+nb+out[r.end()+off:]; off+=len(nb)-len(body)
    return out

edits=[(e["find"],e["texts"]) for e in cfg["edits"]]
new=x; off=0; used=set()
for m in re.finditer(r'<w:p[ >].*?</w:p>',x,flags=re.S):
    p=m.group(0); t=ptext(p)
    for i,(key,texts) in enumerate(edits):
        if key in t:
            np_=set_runs(p,texts); new=new[:m.start()+off]+np_+new[m.end()+off:]
            off+=len(np_)-len(p); used.add(i); break
missing=[edits[i][0] for i in range(len(edits)) if i not in used]
assert not missing, "these paragraphs were not found: %r"%missing

zin=zipfile.ZipFile(SRC); zout=zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data=zin.read(item.filename)
    if item.filename=='word/document.xml': data=new.encode('utf8')
    zout.writestr(item,data)
zout.close(); print('written '+OUT)
