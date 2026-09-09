const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,LineRuleType,HeightRule}=require('docx');

/* Six prompts, three a side. For each one: what the three paragraphs could be
   about, and one piece of evidence for each. */
const OUT=process.argv[2]||'BoneSparrow-essay-planner.docx';
const C={idea:"0B447C",ev:"7A5A00"};
const SH={idea:"D6EAFC",ev:"FFF3B0"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const PW=11906, MARG=900, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:8,color:DEEP};

const R=(t,o)=>new TextRun({text:t,size:22,font:"Georgia",color:INK,...o});
const cell=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:70,bottom:70,left:110,right:110},...(o||{}),children:kids});

const NUMW=520, COLW=Math.floor((W-NUMW)/2);
const head=(k,t)=>new Paragraph({spacing:{after:0},children:[
  new TextRun({text:"  "+t+"  ",bold:true,size:17,color:C[k],font:"Calibri",
    shading:{type:ShadingType.CLEAR,fill:SH[k]}})]});
const blank=()=>new Paragraph({spacing:{after:0},children:[new TextRun({text:"",size:22})]});

/* the prompt, then three rows to jot in */
const block=(n,prompt)=>[
  new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
    borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
    rows:[new TableRow({children:[cell([new Paragraph({spacing:{after:0},children:[
      new TextRun({text:n+"   ",bold:true,size:20,color:MUTED,font:"Calibri"}),
      R(prompt,{size:23})]})],W,{shading:{type:ShadingType.CLEAR,fill:"FBF7EE",color:"auto"},
      margins:{top:130,bottom:130,left:180,right:180}})]})]}),
  new Table({columnWidths:[NUMW,COLW,COLW],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({tableHeader:true,height:{value:340,rule:HeightRule.ATLEAST},children:[
        cell([blank()],NUMW),
        cell([head("idea","this paragraph could be about")],COLW),
        cell([head("ev","one piece of evidence")],COLW)]}),
      ...[1,2,3].map(i=>new TableRow({height:{value:1150,rule:HeightRule.ATLEAST},children:[
        cell([new Paragraph({spacing:{after:0},children:[
          new TextRun({text:String(i),bold:true,size:26,color:DEEP,font:"Georgia"})]})],NUMW),
        cell([blank()],COLW),
        cell([blank()],COLW)]}))]}),
  new Paragraph({spacing:{after:180},children:[]})
];

const PROMPTS=[
 "The Bone Sparrow shows us that imagination and friendship are essential for survival.",
 "In The Bone Sparrow, power comes in many forms.",
 "Fraillon makes the reader see the people behind the numbers.",
 "Loneliness in The Bone Sparrow does not need a fence.",
 "In the camp, the smallest things matter most.",
 "Fraillon leaves the reader hopeful and uneasy at the same time."
];

const title=new Paragraph({spacing:{after:60},children:[
  new TextRun({text:"The Bone Sparrow — planning three paragraphs",bold:true,size:28,color:DEEP,font:"Georgia"}),
  new TextRun({text:"\tName  ",size:18,color:MUTED,font:"Calibri"}),
  new TextRun({text:"______________________",size:18,color:LINE,font:"Calibri"})],
  tabStops:[{type:"right",position:W}]});
const instruction=new Paragraph({spacing:{after:200},children:[
  R("Jot, don’t write sentences. A few words for the idea, a few words for the evidence.",{size:20,color:MUTED,font:"Calibri"})]});

const kids=[title,instruction];
PROMPTS.forEach((p,i)=>{
  if(i===3) kids.push(new Paragraph({children:[new PageBreak()]}));
  kids.push(...block(i+1,p));
});

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:16838},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT+' — '+PROMPTS.length+' prompts, 3 a side');});
