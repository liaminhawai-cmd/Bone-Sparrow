const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule}=require('docx');

/* Six prompts, three a side. For each one: what the three paragraphs could be
   about, and one piece of evidence for each. Blue prompts ask about an idea,
   green prompts ask what the author does to the reader. */
const OUT=process.argv[2]||'BoneSparrow-essay-planner.docx';
const C={idea:"0B447C",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, PH=16838, MARG=800, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};

const R=(t,o)=>new TextRun({text:t,size:22,font:"Georgia",color:INK,...o});
const cell=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:60,bottom:60,left:110,right:110},...(o||{}),children:kids});
const blank=()=>new Paragraph({spacing:{after:0},children:[new TextRun({text:"",size:22})]});
const swatch=(k,t)=>new TextRun({text:"  "+t+"  ",size:18,bold:true,color:C[k],font:"Calibri",
  shading:{type:ShadingType.CLEAR,fill:SH[k]}});

const NUMW=500, COLW=Math.floor((W-NUMW)/2);
const ROW=1000, HDR=320, GAP=140;
const head=(k,t)=>new Paragraph({spacing:{after:0},children:[
  new TextRun({text:"  "+t+"  ",bold:true,size:17,color:C[k],font:"Calibri",
    shading:{type:ShadingType.CLEAR,fill:SH[k]}})]});

const block=(n,kind,prompt,worked)=>{
  const B={style:BorderStyle.SINGLE,size:8,color:C[kind]};
  return [
    new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
      borders:{top:B,bottom:B,left:B,right:B,insideH:NONE,insideV:NONE},
      rows:[new TableRow({children:[cell([new Paragraph({spacing:{after:0},children:[
        new TextRun({text:n+"   ",bold:true,size:20,color:MUTED,font:"Calibri"}),
        R(prompt,{size:23,color:C[kind]}),
        ...(worked?[new TextRun({text:"      worked example",size:17,color:MUTED,font:"Calibri"})]:[])]})],W,
        {shading:{type:ShadingType.CLEAR,fill:SH[kind],color:"auto"},
         margins:{top:110,bottom:110,left:170,right:170}})]})]}),
    new Table({columnWidths:[NUMW,COLW,COLW],width:{size:W,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
      rows:[
        new TableRow({height:{value:HDR,rule:HeightRule.ATLEAST},children:[
          cell([blank()],NUMW),
          cell([head("idea","this paragraph could be about")],COLW),
          cell([head("ev","one piece of evidence")],COLW)]}),
        ...[1,2,3].map(i=>new TableRow({height:{value:ROW,rule:HeightRule.ATLEAST},children:[
          cell([new Paragraph({spacing:{after:0},children:[
            new TextRun({text:String(i),bold:true,size:26,color:DEEP,font:"Georgia"})]})],NUMW),
          cell([worked?new Paragraph({spacing:{after:0},children:[R(worked[i-1][0],{size:20})]}):blank()],COLW),
          cell([worked?new Paragraph({spacing:{after:0},children:[R(worked[i-1][1],{size:20})]}):blank()],COLW)]}))]}),
    new Paragraph({spacing:{after:GAP},children:[]})
  ];
};

const WORKED=[
 ["imagination gives him somewhere to go when he cannot leave",
  "at night the dirt turns into a beautiful ocean (ch 1)"],
 ["a friend who keeps her promise gives him something to count on",
  "“the kind of person that keeps a promise” (ch 14)"],
 ["together they give him what the camp cannot take away",
  "a real book gives him “a sort of brave” (ch 10)"]
];
const PROMPTS=[
 ["idea","The Bone Sparrow shows us that imagination and friendship are essential for survival.",WORKED],
 ["idea","In The Bone Sparrow, power comes in many forms. Discuss."],
 ["idea","Explore how loneliness and friendship shape the lives of the characters in The Bone Sparrow."],
 ["idea","What does The Bone Sparrow show about the importance of stories and family?"],
 ["eff", "How does Fraillon make the reader care about the people in the camp?"],
 ["eff", "How does Fraillon show the reader what life in the camp is like?"]
];

const kids=[
  new Paragraph({spacing:{after:50},children:[
    new TextRun({text:"The Bone Sparrow — planning three paragraphs",bold:true,size:27,color:DEEP,font:"Georgia"}),
    new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
    new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
    tabStops:[{type:"right",position:W}]}),
  new Paragraph({spacing:{after:150},children:[
    R("Jot, don’t write sentences. A few words for the idea, a few words for the evidence.",
      {size:19,color:MUTED,font:"Calibri"}),
    R("      "), swatch("idea","idea"), R("   "), swatch("eff","effect")]})
];
PROMPTS.forEach((p,i)=>{
  if(i===3) kids.push(new Paragraph({spacing:{after:0},children:[new PageBreak()]}));
  kids.push(...block(i+1,p[0],p[1],p[2]));
});

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:PH},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  const box=110*2+300, block=box+HDR+3*ROW+GAP, usable=PH-MARG*2;
  console.log('written '+OUT);
  console.log('  usable per side '+usable+' twips');
  console.log('  block '+block+'  x3 = '+(3*block)+'  + heading 500 = '+(3*block+500)+' on side one');
  console.log('  headroom: side one '+(usable-3*block-500)+', side two '+(usable-3*block));
});
