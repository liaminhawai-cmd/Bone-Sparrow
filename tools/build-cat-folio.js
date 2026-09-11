const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule}=require('docx');

/* The CAT folio, twice: once in the grammar colours (subject, verb, object,
   prepositional phrase, as font colour) and once in the idea colours (idea,
   verb, evidence, purpose, as shading, with the letter-and-bar frame). Same
   prompts, same models, same pages. KHS task sheet and folio cover at the
   front; then each task is two sheets: introduction and paragraph 1 / paragraph
   2 on a page of its own with an optional third piece of evidence / paragraph
   3 as a page of lines / the conclusion part-written and the self check.
   Rubric at the back. Quotations are cited by chapter. */

const PW=11906, PH=16838, MARG=720, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};

/* ------------------------------------------------------------------ skins */
const SKINS={
 grammar:{ file:'BoneSparrow-CAT-folio-grammar.docx', font:"Aptos Narrow",
   ink:"000000", muted:"595959", line:"BFBFBF", deep:"8C072D", tint:"F2D0DA", grey:"F2F2F2",
   rule:{style:BorderStyle.SINGLE,size:6,color:"808080"}, box:{style:BorderStyle.SINGLE,size:6,color:"808080"},
   markup:"g", col:{S:"C00000",V:"3B7D23",O:"C04F15",PP:"0070C0"}, fill:null,
   key:[["S","subject"],["V","verb"],["O","object"],["PP","prepositional phrase"]],
   labels:["Topic sentence","Explanation with evidence","A second explanation","A third explanation","Link sentence"],
   self:[["S","Topic sentence","My first sentence makes a clear claim about an idea."],
         ["O","Evidence","My quote is embedded in my own sentence, with the chapter."],
         ["V","Explanation","I explained what the language does, not just what happens."],
         ["PP","Link sentence","My last sentence shows how both explanations support the claim."],
         ["S","Register","Third person, present tense, formal words."]] },
 ideas:{ file:'BoneSparrow-CAT-folio-ideas.docx', font:"Georgia",
   ink:"1E211F", muted:"645D54", line:"C9BFAE", deep:"1D3C34", tint:"F6F1E6", grey:"F6F1E6",
   rule:{style:BorderStyle.SINGLE,size:6,color:"C9BFAE"}, box:{style:BorderStyle.SINGLE,size:8,color:"1D3C34"},
   markup:"i", col:{idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"},
   fill:{idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"},
   key:[["idea","idea"],["verb","verb"],["ev","evidence"],["eff","purpose"]],
   labels:["T","E","E","E","L"],
   self:[["idea","My idea","I said something about the novel, not just what happens."],
         ["verb","My verb","I used a verb that does the thinking — shows, reveals, suggests."],
         ["ev","My evidence","My quote sits inside my own sentence, with the chapter."],
         ["eff","The effect","I explained what Fraillon’s writing does to the reader."],
         ["idea","My paragraph","It starts with my idea, and the last sentence links back and says more."]] }
};

/* the bars under the letters, idea skin only */
const BARC={idea:"7FB3E6",verb:"F2B27A",ev:"F5D75A",eff:"8FD39A"};
const T_BAR=[["idea",1]], E_BAR=[["ev",3],["verb",1],["idea",3],["eff",3]], L_BAR=[["idea",2],["idea",2],["eff",3]];
const BARS=[T_BAR,E_BAR,E_BAR,E_BAR,L_BAR];
const mini=(segs)=>{const BW=560, tot=segs.reduce((a,x)=>a+x[1],0), cw=segs.map(x=>Math.floor(BW*x[1]/tot));
  return new Table({columnWidths:cw,width:{size:cw.reduce((a,b)=>a+b,0),type:WidthType.DXA},
    borders:{top:NONE,bottom:NONE,left:NONE,right:NONE,insideH:NONE,insideV:{style:BorderStyle.SINGLE,size:12,color:"FFFFFF"}},
    rows:[new TableRow({height:{value:160,rule:HeightRule.EXACT},children:segs.map((x,i)=>new TableCell({
      width:{size:cw[i],type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:BARC[x[0]],color:"auto"},
      margins:{top:0,bottom:0,left:0,right:0},
      children:[new Paragraph({spacing:{after:0,line:120,lineRule:LineRuleType.EXACT},children:[new TextRun({text:"",size:6})]})]}))})]});};

/* ---------------------------------------------------------------- helpers */
function make(S){
  const R=(t,o)=>new TextRun({text:t,size:22,font:S.font,color:S.ink,...o});
  const P=(runs,o)=>new Paragraph({spacing:{after:120,...(o||{})},children:Array.isArray(runs)?runs:[R(runs)]});
  const H=t=>new Paragraph({spacing:{before:200,after:80},children:[R(t,{bold:true,size:25,color:S.deep})]});
  const note=t=>new Paragraph({spacing:{after:80},children:[R(t,{size:18,color:S.muted,italics:S.markup==="g"})]});
  const mark=(segs,size)=>segs.map(([k,t])=>k==="p"?R(t,{size}):
    S.fill?R(t,{size,bold:true,color:S.col[k],shading:{type:ShadingType.CLEAR,fill:S.fill[k]}})
          :R(t,{size,bold:true,color:S.col[k]}));
  const key=()=>new Paragraph({spacing:{after:120},children:S.key.flatMap(([k,t])=>[...mark([[k,"  "+t+"  "]],20),R("   ")])});
  const cell=(kids,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},margins:{top:100,bottom:100,left:160,right:160},...o,children:kids});
  const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
    borders:{top:S.box,bottom:S.box,left:S.box,right:S.box,insideH:NONE,insideV:NONE},
    rows:[new TableRow({children:[cell(kids,W,fill?{shading:{type:ShadingType.CLEAR,fill,color:"auto"}}:{})]})]});
  const ruled=n=>Array.from({length:n},()=>new Paragraph({spacing:{before:200,after:0},
    border:{bottom:{style:BorderStyle.SINGLE,size:4,color:S.line}},children:[R("",{size:22})]}));
  const stemP=s=>new Paragraph({spacing:{after:0},children:[R(s,{size:18,color:S.muted,italics:true})]});
  const LABW=S.markup==="g"?2300:760;

  /* the frame: label (or letter and bar), stems, lines */
  const frame=(rows)=>new Table({columnWidths:[LABW,W-LABW],width:{size:W,type:WidthType.DXA},
    borders:{top:S.box,bottom:S.box,left:S.box,right:S.box,insideH:S.rule,insideV:S.rule},
    rows:rows.map(([i,n,stems,soft])=>new TableRow({children:[
      S.markup==="g"
        ? cell([P([R(S.labels[i],{bold:true,color:soft?S.muted:S.ink})],{after:0}),...(soft?[stemP("if you get there")]:[])],LABW,{shading:{type:ShadingType.CLEAR,fill:S.tint,color:"auto"}})
        : new TableCell({width:{size:LABW,type:WidthType.DXA},margins:{top:120,bottom:120,left:120,right:40},
            children:[new Paragraph({spacing:{after:40},children:[R(S.labels[i],{bold:true,size:40,color:soft?S.muted:S.deep})]}),mini(BARS[i]),
                      ...(soft?[new Paragraph({spacing:{before:60,after:0},children:[R("if you get there",{size:15,color:S.muted})]})]:[])]}),
      cell([...(stems||[]).map(stemP),...ruled(n)],W-LABW,{margins:{top:80,bottom:140,left:160,right:160}})]}))});

  /* the model in the frame, with a note beside each part in the grammar skin */
  const NOTES=["states the claim being made","notice how the evidence is embedded into the sentence","a second piece of evidence, embedded the same way","comes back to the claim and says what it adds up to"];
  const worked=(rows)=>new Table({columnWidths:[LABW,W-LABW],width:{size:W,type:WidthType.DXA},
    borders:{top:S.box,bottom:S.box,left:S.box,right:S.box,insideH:S.rule,insideV:S.rule},
    rows:rows.map((segs,i)=>{const li=i===3?4:i; return new TableRow({children:[
      S.markup==="g"
        ? cell([P([R(S.labels[li],{bold:true})],{after:20}),stemP(NOTES[i])],LABW,{shading:{type:ShadingType.CLEAR,fill:S.tint,color:"auto"}})
        : new TableCell({width:{size:LABW,type:WidthType.DXA},margins:{top:140,bottom:140,left:120,right:40},
            children:[new Paragraph({spacing:{after:40},children:[R(S.labels[li],{bold:true,size:40,color:S.deep})]}),mini(BARS[li])]}),
      cell([new Paragraph({spacing:{after:0,line:380},children:mark(segs,23)})],W-LABW,{margins:{top:140,bottom:140,left:160,right:160}})]})})});

  const lined=(n)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
    borders:{top:S.box,bottom:S.box,left:S.box,right:S.box,insideH:NONE,insideV:NONE},
    rows:[new TableRow({children:[cell(ruled(n),W,{margins:{top:40,bottom:140,left:160,right:160}})]})]});

  function selfTable(){
    const NW=2500, BW=1100, DW=W-NW-BW*3;
    const th=t=>P([R(t,{bold:true,size:17,color:S.muted})],{after:0});
    return new Table({columnWidths:[NW,DW,BW,BW,BW],width:{size:W,type:WidthType.DXA},
      borders:{top:S.box,bottom:S.box,left:S.box,right:S.box,insideH:S.rule,insideV:S.rule},
      rows:[
        new TableRow({children:[cell([th("")],NW),cell([th("")],DW),cell([th("NOT YET")],BW),cell([th("NEARLY")],BW),cell([th("YES")],BW)]}),
        ...S.self.map(([k,n,d])=>new TableRow({height:{value:520,rule:HeightRule.ATLEAST},children:[
          cell([P([R(n,{bold:true,color:S.col[k]})],{after:0})],NW,S.fill?{shading:{type:ShadingType.CLEAR,fill:S.fill[k],color:"auto"}}:{shading:{type:ShadingType.CLEAR,fill:S.tint,color:"auto"}}),
          cell([P([R(d,{size:20})],{after:0})],DW),cell([P("")],BW),cell([P("")],BW),cell([P("")],BW)]}))]});
  }
  const openBox=(label,h)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
    borders:{top:S.box,bottom:S.box,left:S.box,right:S.box,insideH:S.rule,insideV:NONE},
    rows:[
      new TableRow({children:[cell([P([R(label,{bold:true,size:19,color:S.deep})],{after:0})],W,{shading:{type:ShadingType.CLEAR,fill:S.tint,color:"auto"}})]}),
      new TableRow({height:{value:h,rule:HeightRule.ATLEAST},children:[cell([new Paragraph({children:[]})],W)]})]});
  const br=()=>new Paragraph({children:[new PageBreak()]});
  return {R,P,H,note,mark,key,cell,box,ruled,frame,worked,lined,selfTable,openBox,br};
}

/* ------------------------------------------------------ the KHS task sheet */
const KF="Aptos Narrow", HEAD="8C072D", TINT="F2D0DA", KRULE={style:BorderStyle.SINGLE,size:6,color:"808080"};
const KT=(t,o={})=>new TextRun({text:t,font:KF,size:22,color:"000000",...o});
const KP=(runs,o={})=>new Paragraph({spacing:{after:o.after===undefined?100:o.after},children:Array.isArray(runs)?runs:[KT(runs)]});
const H1=t=>new Paragraph({spacing:{after:40},children:[KT(t,{bold:true,size:36,color:HEAD})]});
const H2=t=>new Paragraph({spacing:{before:160,after:60},children:[KT(t,{bold:true,size:25})]});
const dot=(runs)=>new Paragraph({spacing:{after:50},indent:{left:360,hanging:220},children:[KT("•\t"),...(Array.isArray(runs)?runs:[KT(runs)])]});
const kcell=(kids,w,o={})=>new TableCell({width:{size:w,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},...o,children:kids});
const band=(t)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
  rows:[new TableRow({children:[kcell([KP([KT(t,{bold:true,color:"FFFFFF"})],{after:0})],W,{shading:{type:ShadingType.CLEAR,fill:HEAD,color:"auto"}})]})]});
const kv=(rows)=>new Table({columnWidths:[2400,W-2400],width:{size:W,type:WidthType.DXA},
  borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
  rows:rows.map(([k,v])=>new TableRow({children:[
    kcell([KP([KT(k,{bold:true})],{after:0})],2400,{shading:{type:ShadingType.CLEAR,fill:TINT,color:"auto"}}),
    kcell([KP(v,{after:0})],W-2400)]}))});
const FRONT=[
  H1("Analytic Paragraph Writing"),
  KP([KT("Summative Assessment Task — Year 7 English",{bold:true})],{after:20}),
  KP([KT("Text: "),KT("The Bone Sparrow",{italics:true}),KT(" by Zana Fraillon")],{after:160}),
  band("Task overview"),
  kv([
    ["Task type","Analytic paragraph — written response to a literary text, as a folio of three"],
    ["Format","Three sittings, one prompt each. In each: one paragraph of your own (approximately 150–200 words), and a second if you get there."],
    ["Conditions","Test conditions. On your table: a copy of the text, a dictionary, your quote-hunt sheet, one page of your own notes. No pre-written paragraphs or essays. No devices."],
    ["Time","40 minutes writing time + 10 minutes planning, each sitting"],
    ["What is marked","The paragraph you nominate on the folio cover. Feedback between sittings."]]),
  H2("What you need to do"),
  KP("The introduction and the first paragraph are written for you. Write the next paragraph."),
  KP([KT("Your paragraph must include:",{bold:true})],{after:40}),
  dot("A topic sentence that makes a clear claim about an idea in the novel"),
  dot("At least one quotation or specific detail from the text, with the chapter"),
  dot("The quotation embedded in a sentence of your own, not dropped in on its own line"),
  dot("At least one sentence that explains what Fraillon’s writing does — the effect, not just the event"),
  dot("A link sentence that comes back to your claim"),
  dot("Third person, present tense, formal words"),
  H2("Reminders"),
  dot([KT("Write about the author’s choices — what Fraillon "),KT("does",{italics:true}),KT(" and why — not just what happens in the story.")]),
  dot("Name the technique if you can (symbolism, imagery, contrast, narrative voice)."),
  dot("TEEL: topic sentence → evidence → explanation → link."),
  dot("Before you finish: third person? present tense? quote embedded? capitals and full stops?")
];
const COVER=[
  H2("Folio cover"),
  KP([KT("Name:  ",{bold:true}),KT("______________________________     "),KT("Class:  ",{bold:true}),KT("__________")],{after:200}),
  new Table({columnWidths:[900,W-900-2600,2600],width:{size:W,type:WidthType.DXA},
    borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
    rows:[
      new TableRow({children:[
        kcell([KP([KT("IN",{bold:true,size:18})],{after:0})],900,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
        kcell([KP([KT("TASK",{bold:true,size:18})],{after:0})],W-900-2600,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
        kcell([KP([KT("MARK THIS ONE",{bold:true,size:18})],{after:0})],2600,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}})]}),
      ...["Task 1","Task 2","Task 3"].map(t=>new TableRow({height:{value:620,rule:HeightRule.ATLEAST},children:[
          kcell([KP("")],900),kcell([KP(t,{after:0})],W-900-2600),kcell([KP("")],2600)]}))]})
];

/* ----------------------------------------------------------- the tasks
   Each model sentence is given twice: g = grammar markup, i = idea markup.
   Same words in both. Stems fade: task 1 has them, task 2 has the labels,
   task 3 has the frame only. */
const TASKS=[
{ n:1, band:"PROMPT 1  —  Symbolism and identity", posters:"Friendship and family",
  prompt:"How does Fraillon show that objects and family help the characters hold on to who they are in The Bone Sparrow?",
  spring:"Consider what the bone sparrow necklace represents, how it was made and by whom, and what Subhi’s relationship to it suggests about identity and heritage. You might also think about Subhi’s treasures, Jimmie’s necklace, or the family around Subhi.",
  intro:"In The Bone Sparrow, Zana Fraillon shows that people can hold on to who they are even when they have lost their home. Subhi has never been outside the detention centre, but the objects he keeps and the family around him keep him connected to where he comes from. Fraillon suggests that a person’s identity cannot be locked up with them: it is carried in the things they hold and the people who hold on to them.",
  claims:"The introduction names two things that keep the characters connected: objects and family. Paragraph 1 is objects.",
  choose:["the family around Subhi","Jimmie’s family and what her mother left her"],
  model:[
   {g:[["S","The bone sparrow necklace"],["V"," is"],["O"," an object that keeps the characters connected to their past"],["p","."]],
    i:[["idea","The bone sparrow necklace is an object that keeps the characters connected to their past"],["p","."]]},
   {g:[["PP","In Jimmie’s story"],["p",", "],["S","Mirka"],["V"," gives"],["O"," Oto the necklace"],["p"," so that the sparrow will “recognise Anka’s soul” (ch. 17), which shows that an object can carry a person’s story after they are gone."]],
    i:[["p","In Jimmie’s story, Mirka gives Oto the necklace so that the sparrow will "],["ev","“recognise Anka’s soul” (ch. 17)"],["p",", which "],["verb","shows"],["p"," that "],["idea","an object can carry a person’s story after they are gone"],["p","."]]},
   {g:[["S","Subhi’s coin"],["V"," works"],["p"," the same way: "],["S","Queeny"],["V"," tells"],["O"," him"],["p"," that “all [his] treasures … were Ba’s” (ch. 34), which shows that the things Subhi keeps are his only link to a father he has never met."]],
    i:[["p","Subhi’s coin works the same way: Queeny tells him that "],["ev","“all [his] treasures … were Ba’s” (ch. 34)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the things Subhi keeps are his only link to a father he has never met"],["p","."]]},
   {g:[["PP","Through these objects"],["p",", "],["S","Fraillon"],["V"," suggests"],["p"," that who you are can be passed down in what people leave behind, and that is what helps Subhi and Jimmie to “find each other” (ch. 17)."]],
    i:[["p","Through these objects, Fraillon "],["verb","suggests"],["p"," that "],["idea","who you are can be passed down in what people leave behind"],["p",", and that is what "],["eff","helps Subhi and Jimmie to "],["ev","“find each other” (ch. 17)"],["p","."]]}],
  stems:[["Through the relationships between Subhi, Queeny and Maá, Fraillon also shows that …"],
         ["Queeny’s care for Subhi shows that …"],
         ["Even though Eli and Subhi aren’t related, they are like family, suggesting that …"],
         [],
         ["Through these family bonds, Fraillon suggests that …"]],
  conc:{given:"In The Bone Sparrow, Fraillon shows that who a person is cannot be locked up with them.",
        stem:"Through objects and family, Fraillon suggests that …"} },

{ n:2, band:"PROMPT 2  —  Contrast and freedom", posters:"Freedom · Imprisonment",
  prompt:"How does Fraillon explore the relationship between freedom and confinement in The Bone Sparrow?",
  spring:"Consider inside and outside the fence; Subhi’s body locked in and his imagination free; Subhi’s world and Jimmie’s; the objects that stand for freedom and for being locked up.",
  intro:"In The Bone Sparrow, Zana Fraillon presents freedom and confinement not simply as physical states, but as experiences that shape how people understand themselves and the world around them. Through Subhi, who has never set foot outside the detention centre, and Jimmie, who moves freely but carries her own grief and loss, Fraillon complicates the idea that freedom and confinement are opposites. Fraillon suggests that while physical confinement can be imposed upon a person’s body, the imagination and the connections between people offer a kind of freedom that cannot be taken away.",
  claims:"The introduction names three claims: the fence between the detained and the free, how Subhi copes with confinement, and how Jimmie experiences freedom. Paragraph 1 is the fence.",
  choose:["how Subhi deals with being confined","how Jimmie is free, but confined in other ways"],
  model:[
   {g:[["S","Fraillon"],["V"," uses"],["O"," the fence"],["p"," to show that being locked in also means being cut off from knowing what is outside."]],
    i:[["p","Fraillon uses the fence to "],["verb","show"],["p"," that "],["idea","being locked in also means being cut off from knowing what is outside"],["p","."]]},
   {g:[["S","Subhi"],["V"," admits"],["p"," that “none of us knows what it is like just on the other side of the fences” (ch. 14), which shows that the fence keeps out information as well as people."]],
    i:[["p","Subhi admits that "],["ev","“none of us knows what it is like just on the other side of the fences” (ch. 14)"],["p",", which "],["verb","shows"],["p"," that "],["idea","the fence keeps out information as well as people"],["p","."]]},
   {g:[["S","Jimmie"],["V"," is"],["O"," the one who brings the outside in"],["p",": “But Jimmie does” (ch. 14) is all Subhi needs to say, which shows that a friend from the other side is his only window on the world."]],
    i:[["p","Jimmie is the one who brings the outside in: "],["ev","“But Jimmie does” (ch. 14)"],["p"," is all Subhi needs to say, which "],["verb","shows"],["p"," that "],["idea","a friend from the other side is his only window on the world"],["p","."]]},
   {g:[["PP","By putting the two of them on opposite sides of the same fence"],["p",", "],["S","Fraillon"],["V"," suggests"],["p"," that freedom is not only where your body can go, but what you are allowed to know."]],
    i:[["p","By putting the two of them on opposite sides of the same fence, Fraillon "],["verb","suggests"],["p"," that "],["idea","freedom is not only where your body can go"],["p",", but "],["eff","what you are allowed to know"],["p","."]]}],
  stems:null,
  conc:{given:"Fraillon shows that the fence decides where Subhi’s body can go, but not where his mind can.",
        stem:"By placing Subhi and Jimmie on opposite sides of the fence, Fraillon suggests that …"} },

{ n:3, band:"PROMPT 3  —  Motif and storytelling", posters:"Storytelling · Imagination",
  prompt:"How does Fraillon explore the idea that stories are a form of survival in The Bone Sparrow?",
  spring:"Consider Maá’s Listen Now stories; Jimmie’s family book; the stories Subhi tells himself; what happens when the stories stop.",
  intro:"In The Bone Sparrow, Zana Fraillon presents storytelling as the thing that keeps people going when nothing around them changes. Through the stories Maá tells, the book Jimmie carries and the stories Subhi tells himself, Fraillon shows that a story can do what food and shelter cannot: it can make a person feel brave, remembered and less alone. Fraillon suggests that for people who have been locked away, a story is not an escape from survival but a part of it.",
  claims:"The introduction names three kinds of story: Maá’s, Jimmie’s book, and Subhi’s own. Paragraph 1 is Maá’s stories and Jimmie’s book.",
  choose:["the stories Subhi tells himself","what happens when the stories stop"],
  model:[
   {g:[["S","Stories"],["V"," are"],["O"," how the characters in the centre keep going"],["p"," when nothing else changes."]],
    i:[["idea","Stories are how the characters in the centre keep going when nothing else changes"],["p","."]]},
   {g:[["S","Maá’s “Listen Now” stories"],["V"," are"],["O"," the thing Subhi remembers"],["p"," as “perfect. Each one” (ch. 5), which shows that a story can hold a family together in a place that gives them nothing."]],
    i:[["p","Maá’s “Listen Now” stories are the thing Subhi remembers as "],["ev","“perfect. Each one” (ch. 5)"],["p",", which "],["verb","shows"],["p"," that "],["idea","a story can hold a family together in a place that gives them nothing"],["p","."]]},
   {g:[["PP","When Jimmie brings her mother’s book"],["p",", "],["S","Subhi"],["V"," feels"],["O"," “a sort of brave that I haven’t felt since Eli got taken” (ch. 10)"],["p"," before he has read a word, which shows that a story changes how a person feels just by being there."]],
    i:[["p","When Jimmie brings her mother’s book, Subhi feels "],["ev","“a sort of brave that I haven’t felt since Eli got taken” (ch. 10)"],["p"," before he has read a word, which "],["verb","shows"],["p"," that "],["idea","a story changes how a person feels just by being there"],["p","."]]},
   {g:[["PP","Through these stories"],["p",", "],["S","Fraillon"],["V"," suggests"],["p"," that surviving the centre is about more than food and safety: it is about having something to hold on to."]],
    i:[["p","Through these stories, Fraillon "],["verb","suggests"],["p"," that "],["idea","surviving the centre is about more than food and safety"],["p",": it is about "],["eff","having something to hold on to"],["p","."]]}],
  stems:null,
  conc:{given:"Fraillon shows that stories are what keep the people in the centre going.",
        stem:"Through Maá’s stories, Jimmie’s book and the stories Subhi tells himself, Fraillon suggests that …"} }
];

/* -------------------------------------------------------------- one task */
function task(t,S,h){
  const g=S.markup==="g";
  const title = g
    ? band(t.band)
    : new Paragraph({spacing:{after:120},children:[
        h.R("The Bone Sparrow — folio task "+t.n,{bold:true,size:30,color:S.deep}),
        h.R("\tName  ",{size:18,color:S.muted}),h.R("______________________",{size:18,color:S.line})],
        tabStops:[{type:"right",position:W}]});
  const st = t.stems ? [t.stems[0],t.stems[1],t.stems[2],t.stems[3],t.stems[4]] : [[],[],[],[],[]];
  const PARA=[[0,3,st[0]],[1,5,st[1]],[2,5,st[2]],[3,4,st[3],true],[4,4,st[4]]];
  return [
    /* page 1: prompt, introduction, paragraph 1 */
    new Paragraph({pageBreakBefore:true,spacing:{after:0},children:[]}),
    title,
    h.box([h.P([h.R(t.prompt,{bold:true})],{after:60}),
           h.note((g?"Thinking springboard: ":"")+t.spring),
           ...(g?[]:[new Paragraph({spacing:{after:0},children:[h.R("Posters: "+t.posters,{size:18,color:S.muted})]})])]),
    h.H("Introduction"),
    h.box([h.P([h.R(t.intro,{size:21})],{after:0,line:290})],S.grey),
    h.H("Paragraph 1"),
    h.key(),
    h.worked(t.model.map(s=>s[S.markup])),
    /* page 2: paragraph 2 */
    new Paragraph({pageBreakBefore:true,spacing:{after:0},children:[]}),
    h.H("Paragraph 2"),
    h.note(t.claims),
    h.P([h.R("I will write about:  ",{bold:true}),h.R("☐ "+t.choose[0]+"     ☐ "+t.choose[1])],{after:80}),
    h.frame(PARA),
    /* page 3: paragraph 3 */
    new Paragraph({pageBreakBefore:true,spacing:{after:0},children:[]}),
    h.H("Paragraph 3"),
    h.note(g?"Stretch yourself: a third paragraph, on the idea you did not choose.":"If you get there: a third paragraph, on the idea you did not choose."),
    h.lined(28),
    /* page 4: conclusion and the self check */
    new Paragraph({pageBreakBefore:true,spacing:{after:0},children:[]}),
    h.H("Conclusion"),
    h.note("No new quotes."),
    h.box([h.P([h.R(t.conc.given)],{after:0}),
           new Paragraph({spacing:{before:200,after:0},border:{bottom:{style:BorderStyle.SINGLE,size:4,color:S.line}},children:[h.R(t.conc.stem,{size:18,color:S.muted,italics:true})]}),
           ...h.ruled(4)]),
    h.H("How did it go?"),
    h.selfTable(),
    new Paragraph({spacing:{after:100},children:[]}),
    h.openBox("One thing I will do better next time",800),
    new Paragraph({spacing:{after:100},children:[]}),
    h.openBox("Teacher feedback",1300)
  ];
}

/* -------------------------------------------------------- rubric (landscape) */
const LW=PH-MARG*2;
const BANDS=["Needs support","5","6","7","8","9"];
const ROWS=[
 ["D6EAFC","Ideas",
  "I need support to identify and explain ideas and issues within the text",
  "I can identify parts of the story that relate to key ideas (imprisonment, loneliness, stories, etc)",
  "I can describe characters and events that relate to key ideas",
  "I can describe the ideas and issues that are illustrated through characters and events",
  "I can explain the way that ideas and issues are represented by characters and events",
  "I can analyse the way different people and perspectives are represented in the story"],
 ["DFF0E2","Analysing language",
  "I need help understanding the language used by the author",
  "I can identify different perspectives in the story",
  "I can describe language features, perspectives and non-literal ideas from the story",
  "I can describe the meaning of language and literary features that create characterisation and tone",
  "I can explain how language and literary devices create setting, characterisation and tone",
  "I can analyse how language features and non-literal language work together to explore ideas"],
 ["FFF3B0","Collecting evidence",
  "I need help using evidence from the text",
  "I can refer to parts of the text in my response",
  "I can include details from the text in my response",
  "I can use details from the text to demonstrate my ideas",
  "I can embed details from the text to support my interpretation",
  "I can use a range of complex sentence structures to embed different types of evidence"],
 ["FAE3CF","Word choice",
  "I need help using tier-2 words in my response",
  "I can use tier-2 words in my response",
  "I can use formal and objective words in my response",
  "I can use appropriate tier-3 words to describe literary features",
  "I can select a formal vocabulary appropriate to essay writing",
  "I can use tier-2 and tier-3 words with the correct nuance"],
 ["F1EDE3","Building a paragraph",
  "I need help putting my ideas into a paragraph",
  "I can write a few sentences about one idea",
  "I can write a paragraph that starts with my idea",
  "I can write a paragraph that stays on one idea and links back to it at the end",
  "I can sequence the parts of my paragraph so each one builds on the last",
  "I can sequence my paragraphs so that my ideas build into one argument"]
];
function rubric(S){
  const CW=2400, BW=Math.floor((LW-CW)/6);
  const sm=(t,o={})=>KP([KT(t,{size:17,...o})],{after:0});
  const rowFill=(r)=>S.fill?r[0]:TINT;
  return [
    KP([KT("Assessment rubric",{bold:true,size:28})],{after:60}),
    KP([KT("Mark each row at the level the writing shows. The grade is the average across the rows.",{size:18,color:"595959"})],{after:120}),
    new Table({columnWidths:[CW,...Array(6).fill(BW)],width:{size:LW,type:WidthType.DXA},
      borders:{top:KRULE,bottom:KRULE,left:KRULE,right:KRULE,insideH:KRULE,insideV:KRULE},
      rows:[
        new TableRow({tableHeader:true,children:[kcell([sm("")],CW,{shading:{type:ShadingType.CLEAR,fill:"D9D9D9",color:"auto"}}),
          ...BANDS.map((b,i)=>kcell([sm(b,{bold:true,italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"E7E6E6":"D9D9D9",color:"auto"}}))]}),
        ...ROWS.map(r=>new TableRow({children:[
          kcell([sm(r[1],{bold:true,size:18})],CW,{shading:{type:ShadingType.CLEAR,fill:rowFill(r),color:"auto"}}),
          ...r.slice(2).map((d,i)=>kcell([sm(d,{italics:i===0})],BW,{shading:{type:ShadingType.CLEAR,fill:i===3?"F7F7F7":"FFFFFF",color:"auto"}}))]}))]})
  ];
}

/* ------------------------------------------------------------------ build */
const portrait={page:{size:{width:PW,height:PH},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
const landscape={page:{size:{width:PW,height:PH,orientation:"landscape"},margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}};
async function build(S){
  const h=make(S);
  const doc=new Document({styles:{default:{document:{run:{font:S.font,size:22,color:S.ink}}}},
    sections:[
      {properties:portrait,children:[...FRONT,h.br(),...COVER,...TASKS.flatMap(t=>task(t,S,h))]},
      {properties:landscape,children:rubric(S)}]});
  const b=await Packer.toBuffer(doc); fs.writeFileSync(S.file,b); console.log('written '+S.file);
}
(async()=>{ for(const k of Object.keys(SKINS)) await build(SKINS[k]); })();
