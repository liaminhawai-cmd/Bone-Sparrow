const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,ShadingType,AlignmentType,VerticalAlign}=require('docx');

/* The rubric is read out of the hub, the same way the print pages do it, so
   this sheet cannot drift from the ladder students climb on screen. */
const HUB = process.argv[2] || 'BoneSparrowReadingHub.html';
const OUT = process.argv[3] || 'BoneSparrow-draft-and-rewrite.docx';
const src = fs.readFileSync(HUB,'utf8');
const D = (function(){
  const b = src.slice(src.indexOf('const WK_LEVELS'), src.indexOf('\n];', src.indexOf('const WK_LEVELS')));
  const levels = [];
  const re = /\{ n:(\d), name:"([^"]*)", focus:"([^"]*)"[\s\S]*?vicH:`([^`]*)`/g;
  let m;
  while ((m = re.exec(b))) {
    const runs = [];
    m[4].split(/(<em class="hl-\w+">.*?<\/em>)/).forEach(function(part){
      if (!part) return;
      const hit = part.match(/<em class="hl-(\w+)">(.*?)<\/em>/);
      runs.push(hit ? {t:hit[2].replace(/<[^>]+>/g,''), hl:hit[1]}
                    : {t:part.replace(/<[^>]+>/g,''), hl:null});
    });
    levels.push({n:+m[1], focus:m[3], runs:runs});
  }
  if (levels.length !== 5) throw new Error('expected Levels 5-9 in the hub, found '+levels.length);
  const wb = src.slice(src.indexOf('const WK_BUILD'));
  return {levels:levels, q:wb.match(/prompt:"([^"]*)"/)[1], where:wb.match(/where:"([^"]*)"/)[1]};
})();

const C={idea:"0B447C", verb:"8A4B12", ev:"7A5A00", eff:"1F5C33", feat:"4B2F7A"};
const SH={idea:"D6EAFC", verb:"FAE3CF", ev:"FFF3B0", eff:"DFF0E2", feat:"E7DDF6"};
const INK="1E211F", MUTED="645D54", LINE="C9BFAE", DEEP="1D3C34";

const rule=(after,before)=>new Paragraph({
  spacing:{before:before||0, after:after||0, line:340},
  border:{bottom:{style:BorderStyle.SINGLE,size:4,color:LINE,space:1}},
  children:[new TextRun({text:"",size:20})]
});
const lines=n=>Array.from({length:n},()=>rule(80));

const label=t=>new Paragraph({spacing:{before:90,after:40},children:[
  new TextRun({text:t,bold:true,size:15,color:DEEP,characterSpacing:26,font:"Calibri"})]});

const swatch=(k,t)=>new TextRun({text:" "+t+" ",size:12,color:C[k],bold:true,font:"Calibri",shading:{type:ShadingType.CLEAR,fill:SH[k]}});

const gridBorder={style:BorderStyle.SINGLE,size:4,color:"9C9382"};
const cell=(children,w,shade,opts)=>new TableCell({
  width:{size:w,type:WidthType.DXA}, children, verticalAlign:VerticalAlign.CENTER,
  shading:shade?{type:ShadingType.CLEAR,fill:shade,color:"auto"}:undefined,
  margins:{top:70,bottom:70,left:110,right:110},
  borders:{top:gridBorder,bottom:gridBorder,left:gridBorder,right:gridBorder}
});
const headCell=(text,w)=>cell([new Paragraph({children:[new TextRun({text:text,bold:true,size:15,color:"F6F1E6",font:"Calibri",characterSpacing:14})]})],w,"1D3C34");

/* A proper rubric grid — a header row naming the columns, generous cell
   padding, a visible border on every cell — not a condensed reference strip.
   Text column is 9746 dxa (A4 minus the two 1080 margins). */
const COLS=[750,1800,7196];
const headerRow=new TableRow({tableHeader:true, children:[
  headCell("Level",COLS[0]), headCell("Focus",COLS[1]), headCell("What you need to show",COLS[2])
]});
const rubricRows=[headerRow].concat(D.levels.map((L,i)=>new TableRow({children:[
  cell([new Paragraph({children:[new TextRun({text:String(L.n),bold:true,size:18,color:DEEP,font:"Calibri"})],alignment:AlignmentType.CENTER})],COLS[0],i%2?"FFFFFF":"F4EFE5"),
  cell([new Paragraph({children:[new TextRun({text:L.focus,bold:true,size:14,color:INK,font:"Calibri"})]})],COLS[1],i%2?"FFFFFF":"F4EFE5"),
  cell([new Paragraph({children:L.runs.map(function(r){ return r.hl
        ? new TextRun({text:r.t,size:14,color:C[r.hl],bold:true,font:"Calibri",shading:{type:ShadingType.CLEAR,fill:SH[r.hl]}})
        : new TextRun({text:r.t,size:14,color:INK,font:"Calibri"}); })})],COLS[2],i%2?"FFFFFF":"F4EFE5")
]})));

const doc=new Document({
  styles:{default:{document:{run:{font:"Georgia",size:20,color:INK}}}},
  sections:[{
    properties:{page:{margin:{top:700,bottom:500,left:1080,right:1080}}},
    children:[
      new Paragraph({spacing:{after:40},children:[
        new TextRun({text:"Name",size:15,color:MUTED,font:"Calibri"}),
        new TextRun({text:"  ______________________________     ",size:15,color:LINE,font:"Calibri"}),
        new TextRun({text:"Class",size:15,color:MUTED,font:"Calibri"}),
        new TextRun({text:"  ______________",size:15,color:LINE,font:"Calibri"})]}),
      new Paragraph({spacing:{after:20},border:{bottom:{style:BorderStyle.SINGLE,size:10,color:DEEP,space:4}},
        children:[new TextRun({text:D.q,bold:true,size:22,color:DEEP})]}),
      new Paragraph({spacing:{before:40,after:0},children:[new TextRun({text:D.where,size:13,color:MUTED,font:"Calibri"})]}),

      label("YOUR IDEA"),
      rule(0),

      label("DRAFT"),
      ...lines(5),

      label("THE RUBRIC — LEVELS 5 TO 9"),
      new Table({columnWidths:COLS,width:{size:COLS.reduce((a,b)=>a+b,0),type:WidthType.DXA},rows:rubricRows}),
      new Paragraph({spacing:{before:60,after:0},children:[
        swatch("feat","subject"), new TextRun({text:"  ",size:12}),
        swatch("verb","verb"), new TextRun({text:"  ",size:12}),
        swatch("idea","idea"), new TextRun({text:"  ",size:12}),
        swatch("ev","evidence"), new TextRun({text:"  ",size:12}),
        swatch("eff","purpose")]}),

      label("REWRITE"),
      ...lines(9),
    ]
  }]
});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);console.log('written '+OUT);});
