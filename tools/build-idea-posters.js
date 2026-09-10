const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,AlignmentType,VerticalAlign,PageBreak,HeightRule}=require('docx');

/* Six A3 posters for the walls, one idea each, each one split into the
   aspects a group can take separately. Groups brainstorm onto them; the
   notes are collated, scanned and printed as the booklet they take into
   the sitting, so every panel asks for quotes with chapter numbers. */
const OUT=process.argv[2]||'BoneSparrow-idea-posters.docx';

const C={idea:"0B447C",ev:"7A5A00",eff:"1F5C33"};
const SH={idea:"D6EAFC",ev:"FFF3B0",eff:"DFF0E2"};
const INK="1E211F",MUTED="645D54",LINE="C9BFAE",DEEP="1D3C34";

/* A3 landscape. docx swaps the page dimensions itself for a landscape page,
   so the size passed below is A3 portrait; the printed sheet is 23811 wide. */
const A3W=16838, A3H=23811;
const PW=A3H, PH=A3W, MARG=900, W=PW-MARG*2;
const NONE={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const RULE={style:BorderStyle.SINGLE,size:8,color:LINE};
const BOX={style:BorderStyle.SINGLE,size:12,color:DEEP};

const R=(t,o)=>new TextRun({text:t,size:24,font:"Georgia",color:INK,...o});
const cell=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:160,bottom:160,left:220,right:220},...(o||{}),children:kids});

const POSTERS=[
 { idea:"Imprisonment",
   aspects:[
    ["Locked in","Where does the camp physically hold people in? Fences, gates, Jackets, handcuffs, being counted."],
    ["Locked out","What do the people inside not get to know, choose, or do for themselves?"],
    ["Two sides of one fence","What is life like inside the camp compared with Jimmie’s life outside it?"]] },

 { idea:"Freedom",
   aspects:[
    ["Freedom to move","Who can come and go in this novel, and who cannot? What difference does it make to them?"],
    ["Freedom in your head","Where do characters get free without going anywhere?"],
    ["Small freedoms","What small choices do people in the camp still get to make for themselves?"]] },

 { idea:"Imagination",
   aspects:[
    ["Somewhere to go","Where does Subhi’s imagination take him, and when does he need it most?"],
    ["Making sense of things","How does imagining help a character understand what is happening to them?"],
    ["Believing in what comes next","Where does imagining keep hope alive, and where does it let someone down?"]] },

 { idea:"Storytelling",
   aspects:[
    ["Stories that carry people","Which stories keep hold of someone who is gone, or far away?"],
    ["Stories that get the truth out","How do characters try to make the outside world listen to them?"],
    ["Stories that make you brave","Where does a story change how somebody feels, or what they do next?"]] },

 { idea:"Loneliness",
   aspects:[
    ["Alone inside","Who is lonely in the camp, and what makes it worse for them?"],
    ["Alone outside","How is Jimmie lonely, even though nothing is stopping her leaving?"],
    ["Unseen","Where are people treated as numbers instead of people?"]] },

 { idea:"Friendship and family",
   aspects:[
    ["Friends who come back","Who keeps a promise in this novel, and what does that give the other person?"],
    ["Friends who share","What do characters give each other when they have almost nothing to give?"],
    ["Family worn down","What has the camp done to Subhi’s family, and what do they still manage?"]] }
];

/* the idea, big, across the top */
const banner=(idea)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:NONE,insideV:NONE},
  rows:[new TableRow({height:{value:1900,rule:HeightRule.ATLEAST},children:[
    new TableCell({width:{size:W,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,
      shading:{type:ShadingType.CLEAR,fill:SH.idea,color:"auto"},
      margins:{top:160,bottom:160,left:300,right:300},
      children:[new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},
        children:[new TextRun({text:idea,bold:true,size:110,color:C.idea,font:"Georgia"})]})]})]})]});

const COLW=Math.floor(W/3);
const NOTEH=9000, QUOTEH=3000;

function grid(aspects){
  return new Table({columnWidths:[COLW,COLW,W-2*COLW],width:{size:W,type:WidthType.DXA},
    borders:{top:BOX,bottom:BOX,left:BOX,right:BOX,insideH:BOX,insideV:BOX},
    rows:[
      /* the aspect, its question, and the room to answer it */
      new TableRow({height:{value:NOTEH,rule:HeightRule.ATLEAST},
        children:aspects.map(([head,q],i)=>cell([
          new Paragraph({spacing:{after:60},children:[
            new TextRun({text:head,bold:true,size:36,color:DEEP,font:"Georgia"})]}),
          new Paragraph({spacing:{after:0},children:[
            new TextRun({text:q,size:22,color:MUTED,font:"Calibri"})]})],
          i===2?W-2*COLW:COLW))}),
      /* the strip the booklet is really made of */
      new TableRow({height:{value:QUOTEH,rule:HeightRule.ATLEAST},
        children:aspects.map((_,i)=>cell([
          new Paragraph({spacing:{after:0},children:[
            new TextRun({text:"QUOTES",bold:true,size:20,color:C.ev,font:"Calibri",characterSpacing:30}),
            new TextRun({text:"   with the chapter number",size:19,color:MUTED,font:"Calibri"})]})],
          i===2?W-2*COLW:COLW,
          {shading:{type:ShadingType.CLEAR,fill:SH.ev,color:"auto"}}))})
    ]});
}

const kids=[];
POSTERS.forEach((p,i)=>{
  if(i) kids.push(new Paragraph({spacing:{after:0},children:[new PageBreak()]}));
  kids.push(banner(p.idea));
  kids.push(new Paragraph({spacing:{after:120},children:[R("")]}));
  kids.push(grid(p.aspects));
  kids.push(new Paragraph({spacing:{before:140,after:0},children:[
    new TextRun({text:"The Bone Sparrow",size:19,color:MUTED,font:"Calibri"}),
    new TextRun({text:"\tGroup:  ______________________",size:19,color:MUTED,font:"Calibri"})],
    tabStops:[{type:"right",position:W}]}));
});

const doc=new Document({styles:{default:{document:{run:{font:"Georgia",size:24,color:INK}}}},
  sections:[{properties:{page:{size:{width:A3W,height:A3H,orientation:"landscape"},
    margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(OUT,b);
  console.log('written '+OUT);
  console.log('  '+POSTERS.length+' posters, '+POSTERS.length*3+' panels');
  console.log('  banner 1900 + gap 120 + notes '+NOTEH+' + quotes '+QUOTEH+' + footer 300 = '+
    (1900+120+NOTEH+QUOTEH+300)+' of '+(PH-MARG*2)+' twips');
});
