const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule}=require('docx');

/* Three folio tasks, one booklet each, on the TEEL sheet's layout and colours.
   The prompt and the first paragraph are printed; the introduction gives the
   first idea; paragraph 3 and the third piece of evidence in each paragraph
   are there for whoever gets that far. Quotations are ones already checked
   for the wall, the decks or the planning sheet. */

const C={idea:"0B447C",verb:"8A4B12",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",verb:"FAE3CF",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, PH=16838, MARG=1000, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:8,color:DEEP};

const R=(t,o)=>new TextRun({text:t,size:22,font:"Georgia",color:INK,...o});
const P=(runs,o)=>new Paragraph({spacing:{after:120,...(o||{})},children:Array.isArray(runs)?runs:[R(runs)]});
const H=t=>new Paragraph({spacing:{before:260,after:80},children:[new TextRun({text:t,bold:true,size:24,color:DEEP,font:"Georgia"})]});
const note=t=>new Paragraph({spacing:{after:100},children:[new TextRun({text:t,size:18,color:MUTED,font:"Calibri"})]});
const bullet=t=>new Paragraph({spacing:{after:60},indent:{left:400,hanging:240},children:[R("•  "),R(t)]});
const box=(kids,fill)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
  rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},
    shading:fill?{type:ShadingType.CLEAR,fill,color:"auto"}:undefined,
    margins:{top:140,bottom:140,left:200,right:200},children:kids})]})]});
const br=()=>new Paragraph({children:[new PageBreak()]});
const swatch=(k,t)=>new TextRun({text:"  "+t+"  ",size:20,bold:true,color:C[k],font:"Calibri",
  shading:{type:ShadingType.CLEAR,fill:SH[k]}});
const key=()=>new Paragraph({spacing:{after:160},children:[swatch("idea","idea"),R("   "),swatch("verb","verb"),
  R("   "),swatch("ev","evidence"),R("   "),swatch("eff","purpose")]});
const hl=(k,t)=>R(t,{bold:true,color:C[k],shading:{type:ShadingType.CLEAR,fill:SH[k]}});

/* the bars, and the small one that sits under a letter in the frame */
const BARC={idea:"7FB3E6",verb:"F2B27A",ev:"F5D75A",eff:"8FD39A",plain:"D8CFBB"};
const mini=(segs)=>{const BW=560, tot=segs.reduce((a,x)=>a+x[1],0), cw=segs.map(x=>Math.floor(BW*x[1]/tot));
  return new Table({columnWidths:cw,width:{size:cw.reduce((a,b)=>a+b,0),type:WidthType.DXA},
    borders:{top:NONE,bottom:NONE,left:NONE,right:NONE,insideH:NONE,insideV:{style:BorderStyle.SINGLE,size:12,color:"FFFFFF"}},
    rows:[new TableRow({height:{value:160,rule:HeightRule.EXACT},children:segs.map((x,i)=>new TableCell({
      width:{size:cw[i],type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:BARC[x[0]],color:"auto"},
      margins:{top:0,bottom:0,left:0,right:0},
      children:[new Paragraph({spacing:{after:0,line:120,lineRule:LineRuleType.EXACT},children:[new TextRun({text:"",size:6})]})]}))})]});};
const T_BAR=[["idea",1]], E_BAR=[["ev",3],["verb",1],["idea",3],["eff",3]], L_BAR=[["idea",2],["idea",2],["eff",3]];

/* ruled lines to write on */
const ruled=n=>Array.from({length:n},()=>new Paragraph({spacing:{before:180,after:0},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE}},children:[new TextRun({text:"",size:22})]}));

/* the frame: the letter with its bar, then the lines */
const frame=(rows)=>new Table({columnWidths:[760,W-760],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
  rows:rows.map(([l,n,bar,soft,label])=>new TableRow({children:[
    new TableCell({width:{size:760,type:WidthType.DXA},margins:{top:120,bottom:120,left:120,right:40},
      children:[new Paragraph({spacing:{after:40},children:[new TextRun({text:l,bold:true,size:40,
        color:soft?MUTED:DEEP,font:"Georgia"})]}),...(bar?[mini(bar)]:[])]}),
    new TableCell({width:{size:W-760,type:WidthType.DXA},margins:{top:100,bottom:140,left:160,right:160},
      children:[...(label?[new Paragraph({spacing:{after:0},children:[new TextRun({text:label,size:17,
        color:MUTED,font:"Calibri"})]})]:[]),...ruled(n)]})]}))});

/* the same frame with the model already coloured in it */
const worked=(rows)=>new Table({columnWidths:[760,W-760],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
  rows:rows.map(([l,segs,bar])=>new TableRow({children:[
    new TableCell({width:{size:760,type:WidthType.DXA},margins:{top:140,bottom:140,left:120,right:40},
      children:[new Paragraph({spacing:{after:40},children:[new TextRun({text:l,bold:true,size:40,color:DEEP,font:"Georgia"})]}),
        ...(bar?[mini(bar)]:[])]}),
    new TableCell({width:{size:W-760,type:WidthType.DXA},margins:{top:160,bottom:160,left:160,right:160},
      children:[new Paragraph({spacing:{after:0,line:400},children:segs.map(([k,t])=>
        k==="plain"?R(t,{size:23}):R(t,{size:23,bold:true,color:C[k],shading:{type:ShadingType.CLEAR,fill:SH[k]}}))})]})]}))});

const PARA=[["T",2,T_BAR],["E",3,E_BAR],["E",3,E_BAR],["E",2,E_BAR,true,"if you get there"],["L",3,L_BAR]];

/* self assessment, same colours */
const SELF=[
 ["idea","My idea","I said something about the novel, not just what happens."],
 ["verb","My verb","I used a verb that does the thinking — shows, reveals, suggests."],
 ["ev","My evidence","My quote sits inside my own sentence, and it fits my idea."],
 ["eff","The effect","I explained what Fraillon’s writing does to the reader."],
 ["idea","My paragraph","It starts with my idea, and the last sentence links back and says more."]
];
function selfTable(){
  const NW=2600, BW=1100, DW=W-NW-BW*3;
  const th=t=>new Paragraph({spacing:{after:0},children:[new TextRun({text:t,bold:true,size:17,color:MUTED,font:"Calibri"})]});
  const c=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},...(o||{}),children:kids});
  return new Table({columnWidths:[NW,DW,BW,BW,BW],width:{size:W,type:WidthType.DXA},
    borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({children:[c([th("")],NW),c([th("")],DW),c([th("NOT YET")],BW),c([th("NEARLY")],BW),c([th("YES")],BW)]}),
      ...SELF.map(([k,n,d])=>new TableRow({height:{value:600,rule:HeightRule.ATLEAST},children:[
        c([new Paragraph({spacing:{after:0},children:[R(n,{bold:true,color:C[k]})]})],NW,
          {shading:{type:ShadingType.CLEAR,fill:SH[k],color:"auto"}}),
        c([new Paragraph({spacing:{after:0},children:[R(d,{size:20})]})],DW),
        c([P("")],BW),c([P("")],BW),c([P("")],BW)]}))]});
}
const openBox=(label,h)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:RULE,insideV:NONE},
  rows:[
    new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},margins:{top:100,bottom:100,left:200,right:200},
      shading:{type:ShadingType.CLEAR,fill:"F6F1E6",color:"auto"},
      children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:label,bold:true,size:19,color:DEEP,font:"Calibri"})]})]})]}),
    new TableRow({height:{value:h,rule:HeightRule.ATLEAST},children:[new TableCell({width:{size:W,type:WidthType.DXA},
      margins:{top:100,bottom:100,left:200,right:200},children:[new Paragraph({children:[]})]})]})]});

/* ------------------------------------------------------------------ tasks */
const TASKS=[
{ n:1, file:"BoneSparrow-folio-1-stories.docx",
  prompt:[["‘But reading is important.’ (p39) Discuss how "],["hl","stories"],[" and "],["hl","imagination"],
          [" are important for characters in The Bone Sparrow."]],
  big:"Stories and imagination are what the characters in The Bone Sparrow use to survive a place that gives them nothing else.",
  idea1:"the way imagination gives Subhi somewhere to go when he cannot leave",
  model:[
   ["T",[["idea","Imagination gives Subhi somewhere to go when he cannot leave the camp."]],T_BAR],
   ["E",[["plain","On the first page the ground outside the tent changes: at night "],
         ["ev","“the dirt outside turns into a beautiful ocean”"],["plain","."]],E_BAR],
   ["E",[["plain","Fraillon writes the Night Sea as a fact rather than as a daydream, which "],["verb","reveals"],
         ["plain"," that "],["idea","Subhi’s way of seeing is not a mistake about where he is, but the one part of the camp that belongs to him"],
         ["plain","."]],E_BAR],
   ["L",[["plain","This "],["eff","makes the reader understand that imagination is not an escape from the camp so much as a way of getting through it"],
         ["plain","."]],L_BAR]] },

{ n:2, file:"BoneSparrow-folio-2-conditions.docx",
  prompt:[["‘Soon they’ll see that living in here isn’t living at all. We just need to show them who we are, that we’re people, and then they’ll remember.’ (p108) Discuss the "],
          ["hl","living conditions"],[" for characters "],["hl","inside and outside"],[" the centre."]],
  big:"Life inside the centre is measured out in numbers, while life outside it goes on without noticing.",
  idea1:"the way ordinary life inside the centre is controlled until protest is all that is left",
  model:[
   ["T",[["idea","Inside the centre, ordinary life is controlled until protest is all that people have left."]],T_BAR],
   ["E",[["plain","Subhi counts what is happening around him: "],
         ["ev","“There are twenty-four people with their lips sewn shut now, and eighty-seven on hunger strike.”"]],E_BAR],
   ["E",[["plain","Fraillon gives the reader numbers instead of descriptions, which "],["verb","demonstrates"],
         ["plain"," that "],["idea","a place which counts people rather than naming them has taught a child to count them too"],
         ["plain","."]],E_BAR],
   ["L",[["plain","This "],["eff","makes the reader feel how ordinary the desperation has become"],
         ["plain",", and that is worse than being told it is terrible."]],L_BAR]] },

{ n:3, file:"BoneSparrow-folio-3-family.docx",
  prompt:[["The Bone Sparrow explores themes of "],["hl","family"],[" and "],["hl","friendship"],[". Discuss."]],
  big:"In the centre, friendship does the work that family cannot always do.",
  idea1:"the way a friend who keeps a promise gives Subhi something the camp cannot take away",
  model:[
   ["T",[["idea","A friend who keeps a promise gives Subhi something the camp cannot take away."]],T_BAR],
   ["E",[["plain","After Jimmie stops coming, Subhi holds on to what she has already proved: he knows "],
         ["ev","“for sure that Jimmie is the kind of person that keeps a promise”"],["plain","."]],E_BAR],
   ["E",[["plain","Fraillon puts the certainty in Subhi’s own voice, and “for sure” "],["verb","suggests"],
         ["plain"," that "],["idea","what matters to him is not what Jimmie brings but the fact that she comes back"],
         ["plain","."]],E_BAR],
   ["L",[["plain","This "],["eff","shows the reader that in a place where everything is temporary, somebody keeping their word is what safety looks like"],
         ["plain","."]],L_BAR]] }
];

function runs(spec){ return spec.map(x=>x[0]==="hl"?hl("idea",x[1]):R(x[0])); }

function doc(t){
  const kids=[
    new Paragraph({spacing:{after:200},children:[
      new TextRun({text:"The Bone Sparrow — folio task "+t.n,bold:true,size:30,color:DEEP,font:"Georgia"}),
      new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
      new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
      tabStops:[{type:"right",position:W}]}),
    note("30 minutes. Novel, your notes and the writing wall on the desk."),

    H("The prompt"),
    box([P(runs(t.prompt),{after:0})]),

    H("Introduction"),
    key(),
    box([
      P([R(t.big)],{after:140}),
      P([R("Fraillon shows this first through "),hl("idea",t.idea1),R(".")],{after:140}),
      P([R("She also shows it through")],{after:0}),
      ...ruled(2),
      P([R("and through")],{before:160,after:0}),
      ...ruled(2)]),
    note("The third idea is for whoever gets that far."),
    br(),

    H("The model"),
    worked(t.model),
    br(),

    H("Your paragraph"),
    frame(PARA),
    br(),

    H("Another paragraph"),
    note("If you get there."),
    frame(PARA),
    br(),

    H("Conclusion"),
    frame([["L",3,L_BAR,false,"So The Bone Sparrow shows that … — no new quotes"]]),

    H("How did it go?"),
    selfTable(),
    new Paragraph({spacing:{after:160},children:[R("")]}),
    openBox("One thing I will do better next time",800),
    new Paragraph({spacing:{after:160},children:[R("")]}),
    openBox("Teacher feedback",1300)
  ];
  return new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
    sections:[{properties:{page:{size:{width:PW,height:PH},
      margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
}
(async()=>{ for(const t of TASKS){
  const b=await Packer.toBuffer(doc(t)); fs.writeFileSync(t.file,b); console.log("written "+t.file);
}})();
