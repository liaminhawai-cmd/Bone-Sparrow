const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,HeightRule}=require('docx');

/* Chapter tickets for random assignment. The novel runs to 37 chapters, so
   these are 18 consecutive pairs (1-2 ... 35-36) plus chapter 37 on its own.
   Cut, shuffle, hand out or have students draw. Two copies print on one run
   so a class bigger than 19 doesn't run dry — repeats are fine, since two
   students hunting the same two chapters will still find different quotes. */
const OUT=process.argv[2]||'BoneSparrow-chapter-tickets.docx';
const LAST_CHAPTER=37;

const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";
const RULE={style:BorderStyle.SINGLE,size:6,color:LINE,dashSpacing:20};
const CUT={style:BorderStyle.DASHED,size:4,color:"B6AB95"};

const TICKETS=[];
for(let c=1;c<LAST_CHAPTER;c+=2) TICKETS.push([c,Math.min(c+1,LAST_CHAPTER-1)]);
if(LAST_CHAPTER%2===1) TICKETS.push([LAST_CHAPTER,LAST_CHAPTER]);

const PW=11906, PH=16838, MARG=700, W=PW-MARG*2;
const COLS=3, ROWH=2500;
const COLW=Math.floor(W/COLS);

const ticket=([a,b])=>{
  const label = a===b ? ("Chapter "+a) : ("Chapters "+a+"–"+b);
  return new TableCell({width:{size:COLW,type:WidthType.DXA},
    borders:{top:CUT,bottom:CUT,left:CUT,right:CUT},
    verticalAlign:VerticalAlign.CENTER,
    margins:{top:200,bottom:200,left:160,right:160},
    children:[
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},
        children:[new TextRun({text:"THE BONE SPARROW",size:14,color:MUTED,font:"Calibri",characterSpacing:20})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},
        children:[new TextRun({text:label,bold:true,size:34,color:DEEP,font:"Georgia"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:60,after:0},
        children:[new TextRun({text:"find at least 6 quotes",size:15,color:MUTED,font:"Calibri"})]})
    ]});
};

function grid(tix){
  const rows=[];
  for(let i=0;i<tix.length;i+=COLS){
    const cells=tix.slice(i,i+COLS).map(ticket);
    while(cells.length<COLS) cells.push(new TableCell({width:{size:COLW,type:WidthType.DXA},
      borders:{top:CUT,bottom:CUT,left:CUT,right:CUT},children:[new Paragraph({children:[]})]}));
    rows.push(new TableRow({height:{value:ROWH,rule:HeightRule.ATLEAST},children:cells}));
  }
  return new Table({columnWidths:Array(COLS).fill(COLW),width:{size:W,type:WidthType.DXA},
    borders:{top:{style:BorderStyle.NONE,size:0},bottom:{style:BorderStyle.NONE,size:0},
      left:{style:BorderStyle.NONE,size:0},right:{style:BorderStyle.NONE,size:0},
      insideH:{style:BorderStyle.NONE,size:0},insideV:{style:BorderStyle.NONE,size:0}},
    rows});
}

/* two copies, back to back, so a bigger class doesn't run out */
const kids=[
  new Paragraph({spacing:{after:160},children:[
    new TextRun({text:"Chapter tickets",bold:true,size:28,color:DEEP,font:"Georgia"}),
    new TextRun({text:"   —   cut out, shuffle, hand out or draw",size:18,color:MUTED,font:"Calibri"})]}),
  grid(TICKETS),
  new Paragraph({spacing:{before:200,after:60},children:[
    new TextRun({text:"Second set",bold:true,size:22,color:DEEP,font:"Georgia"}),
    new TextRun({text:"   —   for a class bigger than "+TICKETS.length,size:16,color:MUTED,font:"Calibri"})]}),
  grid(TICKETS)
];

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:22,color:INK}}}},
  sections:[{properties:{page:{size:{width:PW,height:PH},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT);
  console.log('  '+TICKETS.length+' tickets covering chapters 1-'+LAST_CHAPTER+', printed twice ('+TICKETS.length*2+' total)');
});
