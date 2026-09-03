"""The power sheet is the teacher's own TEEL template file with the words
swapped, paragraph by paragraph, so the formatting is theirs and stays theirs.
Run: python3 tools/build-teel-power-sheet.py"""
import re,zipfile,shutil,os,html
SRC='tools/teel-template-source.docx'; OUT='BoneSparrow-TEEL-power.docx'
z=zipfile.ZipFile(SRC); x=z.read('word/document.xml').decode('utf8')
paras=list(re.finditer(r'<w:p[ >].*?</w:p>',x,flags=re.S))
def ptext(p): return ''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>',p,flags=re.S))
def set_runs(p,new_texts):
    """replace the text of the paragraph's runs in order; extra runs emptied"""
    runs=[r for r in re.finditer(r'<w:r[ >].*?</w:r>',p,flags=re.S) if re.search(r'<w:t[ >]',r.group(0))]; out=p; off=0
    for i,r in enumerate(runs):
        t=new_texts[i] if i<len(new_texts) else ''
        body=r.group(0)
        nb=re.sub(r'<w:t[^>]*>.*?</w:t>','<w:t xml:space="preserve">'+html.escape(t,quote=False)+'</w:t>',body,count=1,flags=re.S)
        nb=re.sub(r'(<w:t xml:space="preserve">.*?</w:t>).*?(?=</w:r>)',r'\1',nb,count=1,flags=re.S) if nb.count('<w:t')>1 else nb
        out=out[:r.start()+off]+nb+out[r.end()+off:]; off+=len(nb)-len(body)
    return out
E=[  # the new words, keyed by the old paragraph's opening text
 ("writing about an idea",["The Bone Sparrow — kinds of power","Name  ","_","_____________________"]),
 ("The Bone Sparrow shows us that",["The Bone Sparrow shows us that ","power"," comes in ","many forms","."]),
 ("Imagination is essential to Subhi",["One kind of power in The Bone Sparrow is the physical power the Jackets hold over everyone in the camp."]),
 ("When Subhi explains the Night Sea",["When Beaver catches Subhi at the fence, “He shoves me backward so hard that my feet leave the ground.” This shows that the Jackets’ power is in their bodies, which makes the reader feel how small and breakable Subhi is next to them."]),
 ("When Jimmie brings her mother",["In the same scene, “I can’t talk. I can’t say a single thing.” This shows that physical power also takes away Subhi’s voice, which makes the reader understand that fear can silence a person before a word is said."]),
 ("So",["So"," physical power is one kind of power in the camp: it can throw a boy against a wall, and it can stop him speaking at all."]),
 ("Friendship is essential to Subhi",["One kind of power in The Bone Sparrow is …"]),
 ("Two reasons friendship",["My kind of power: ____________________________.  Two things it shows:"]),
 ("Friendship",["Another kind of power",""]),
 ("So, because A and B",["So … is one kind of power in the camp: A, and B."]),
]
new=x; off=0
for m in paras:
    p=m.group(0); t=ptext(p)
    for key,texts in E:
        if (key in t) if key!="So" else ("So imagination gives" in t):
            np_=set_runs(p,texts); new=new[:m.start()+off]+np_+new[m.end()+off:]; off+=len(np_)-len(p); break
tmp=OUT+'.tmp'; shutil.copy(SRC,tmp)
zin=zipfile.ZipFile(SRC); zout=zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data=zin.read(item.filename)
    if item.filename=='word/document.xml': data=new.encode('utf8')
    zout.writestr(item,data)
zout.close(); os.remove(tmp); print('written',OUT)
