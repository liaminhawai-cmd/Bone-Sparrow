const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,
       ShadingType,PageBreak,HeightRule}=require('docx');

/* Three folio tasks, one document each. Four sides: the prompt and an
   introduction with the first idea written in, the first paragraph written
   for them, frames for the second and third, then self assessment.
   Every quotation is one already checked against the novel for the wall,
   the decks or the planning sheet. */

const A4W=11906, A4H=16838, MARG=720, W=A4W-MARG*2;
const GREY="D9D9D9", SOFT="F2F2F2";
const RULE={style:BorderStyle.SINGLE,size:6,color:"808080"};
const FAINT={style:BorderStyle.SINGLE,size:4,color:"BFBFBF"};
const T=(t,o={})=>new TextRun({text:t,font:"Arial",size:24,...o});
const P=(t,o={})=>new Paragraph({spacing:{after:o.after===undefined?120:o.after},children:[T(t,o)]});
const HEAD=(t)=>new Paragraph({spacing:{before:200,after:80},children:[T(t,{bold:true,size:26})]});
const dot=(t)=>new Paragraph({spacing:{after:80},indent:{left:400,hanging:220},children:[T("•\t"+t)]});
const gap=(a=0)=>new Paragraph({spacing:{after:a},children:[T("")]});
const cell=(kids,w,o)=>new TableCell({width:{size:w,type:WidthType.DXA},
  margins:{top:70,bottom:70,left:120,right:120},...(o||{}),children:kids});
const brk=()=>new Paragraph({spacing:{after:0},children:[new PageBreak()]});

/* a box for the prompt */
const promptBox=(t)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:[new TableRow({children:[cell([new Paragraph({spacing:{after:0},children:[T(t,{size:26})]})],W,
    {shading:{type:ShadingType.CLEAR,fill:SOFT,color:"auto"}})]})]});

/* writing space: a labelled row, then an empty one to write in */
function frame(title,rows){
  const LW2=2600, RW=W-LW2;
  return new Table({columnWidths:[LW2,RW],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:FAINT,insideV:FAINT},
    rows:[
      new TableRow({children:[cell([new Paragraph({spacing:{after:0},children:[T(title,{bold:true,size:24})]})],W,
        {columnSpan:2,shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}})]}),
      ...rows.flatMap(([letter,label,hint,h])=>[
        new TableRow({children:[
          cell([new Paragraph({spacing:{after:0},children:[T(letter+"  ",{bold:true,size:28,color:"1F5C33"}),
            T(label,{bold:true,size:22})]}),
            new Paragraph({spacing:{after:0},children:[T(hint,{size:19,color:"595959"})]})],LW2,
            {shading:{type:ShadingType.CLEAR,fill:SOFT,color:"auto"}}),
          cell([gap()],RW,{})]}),
        ...(h>1?[new TableRow({height:{value:(h-1)*520,rule:HeightRule.ATLEAST},children:[
          cell([gap()],LW2,{shading:{type:ShadingType.CLEAR,fill:SOFT,color:"auto"}}),cell([gap()],RW)]})]:[])
      ].map((r,i,a)=>r))
    ]});
}
const PARA_ROWS=[
  ["T","Topic sentence","Your idea, in one clear sentence.",2],
  ["E","Evidence","A quote from the novel, inside a sentence of your own.",3],
  ["E","Explanation","What Fraillon’s writing does to the reader.",3],
  ["L","Link","Back to your idea — say more than your topic sentence did.",2]
];

/* self assessment, in the words a student can use on themselves */
const SELF=[
 ["My idea","I said something about the novel, not just what happens in the story."],
 ["The language feature","I named what Fraillon actually did — a metaphor, a description, the way she writes it."],
 ["My evidence","My quote sits inside my own sentence, and it fits the idea I started with."],
 ["The effect","I explained what the writing does to the reader."],
 ["My paragraph","It starts with my idea, and the last sentence links back and says more."]
];
function selfTable(){
  const NW=3000, BW=1200, DW=W-NW-BW*3;
  const th=t=>new Paragraph({spacing:{after:0},children:[T(t,{bold:true,size:18})]});
  return new Table({columnWidths:[NW,DW,BW,BW,BW],width:{size:W,type:WidthType.DXA},
    borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
    rows:[
      new TableRow({children:[
        cell([th("")],NW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        cell([th("What it means")],DW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        cell([th("Not yet")],BW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        cell([th("Nearly")],BW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}}),
        cell([th("Yes")],BW,{shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}})]}),
      ...SELF.map(([n,d])=>new TableRow({height:{value:560,rule:HeightRule.ATLEAST},children:[
        cell([new Paragraph({spacing:{after:0},children:[T(n,{bold:true,size:22})]})],NW),
        cell([new Paragraph({spacing:{after:0},children:[T(d,{size:20})]})],DW),
        cell([gap()],BW),cell([gap()],BW),cell([gap()],BW)]}))]});
}
const box=(label,h)=>new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
  borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
  rows:[
    new TableRow({children:[cell([new Paragraph({spacing:{after:0},children:[T(label,{bold:true,size:22})]})],W,
      {shading:{type:ShadingType.CLEAR,fill:GREY,color:"auto"}})]}),
    new TableRow({height:{value:h,rule:HeightRule.ATLEAST},children:[cell([gap()],W)]})]});

/* ------------------------------------------------------------------ tasks */
const TASKS=[
{ n:1, file:"BoneSparrow-folio-1-stories.docx",
  short:"Stories and imagination",
  prompt:"‘But reading is important.’ (p39)\nDiscuss how stories and imagination are important for characters in The Bone Sparrow.",
  bigidea:"Zana Fraillon shows that stories and imagination are what the characters in The Bone Sparrow use to survive a place that gives them nothing else.",
  idea1:"the way imagination gives Subhi somewhere to go when he cannot leave the camp",
  worked:[
   "Imagination gives Subhi somewhere to go when he cannot leave the camp.",
   "On the very first page the ground outside the tent changes: at night “the dirt outside turns into a beautiful ocean”.",
   "Fraillon writes the Night Sea as a fact rather than as a daydream, which reveals that Subhi’s way of seeing is not a mistake about where he is, but the one part of the camp that belongs to him.",
   "This makes the reader understand that imagination is not an escape from the camp so much as a way of getting through it."],
  hints:["Jimmie and her mother’s book","Eli and Subhi trading treasures and stories"] },

{ n:2, file:"BoneSparrow-folio-2-conditions.docx",
  short:"Life inside and outside",
  prompt:"‘Soon they’ll see that living in here isn’t living at all. We just need to show them who we are, that we’re people, and then they’ll remember.’ (p108)\nDiscuss the living conditions for characters inside and outside the centre.",
  bigidea:"Zana Fraillon shows the reader that life inside the centre is measured out in numbers, while life outside it goes on without noticing.",
  idea1:"the way ordinary life inside the centre is controlled until protest is all that is left",
  worked:[
   "Inside the centre, ordinary life is controlled until protest is the only thing people have left.",
   "Subhi counts what is happening around him: “There are twenty-four people with their lips sewn shut now, and eighty-seven on hunger strike.”",
   "Fraillon gives the reader numbers instead of descriptions, which demonstrates that a place which counts people rather than naming them has taught a child to count them too.",
   "This makes the reader feel how ordinary the desperation has become, which is worse than being told that it is terrible."],
  hints:["what Jimmie’s life is like on the other side of the fence","what the people outside are told, or not told"] },

{ n:3, file:"BoneSparrow-folio-3-family.docx",
  short:"Family and friendship",
  prompt:"The Bone Sparrow explores themes of family and friendship.\nDiscuss.",
  bigidea:"Zana Fraillon shows that in the centre friendship does the work that family cannot always do.",
  idea1:"the way a friend who keeps a promise gives Subhi something the camp cannot take away",
  worked:[
   "A friend who keeps a promise gives Subhi something the camp cannot take away.",
   "After Jimmie stops coming, Subhi holds on to what she has already proved: he knows “for sure that Jimmie is the kind of person that keeps a promise”.",
   "Fraillon puts the certainty in Subhi’s own voice, and “for sure” suggests that what matters to him is not what Jimmie brings him but the fact that she comes back.",
   "This shows the reader that in a place where everything is temporary, somebody keeping their word is what safety looks like."],
  hints:["Subhi and Eli, and what they show each other","Queeny, Maá, and what family costs in the centre"] }
];

function doc(t){
  const kids=[
    new Paragraph({spacing:{after:0},children:[T("The Bone Sparrow",{bold:true,size:36})]}),
    new Paragraph({spacing:{after:0},children:[T("Folio task "+t.n+" · "+t.short,{size:30})]}),
    new Paragraph({spacing:{after:0},children:[T("Reading and Viewing",{size:22,color:"595959"})]}),
    new Paragraph({spacing:{after:180},children:[T("CAT 2 · Option A",{bold:true,size:22,color:"595959"})]}),
    new Paragraph({spacing:{after:200},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:"808080"}},
      children:[T("Name:",{bold:true}),T("  "+"_".repeat(34)+"    "),T("Date:",{bold:true}),T("  "+"_".repeat(18))]}),
    P("30 minutes. Novel, your notes and the writing wall on your desk. No help with drafting.",{size:20,color:"595959"}),
    promptBox(t.prompt),
    HEAD("Introduction"),
    P("The first idea is written in. Add the two ideas you are going to write about, then you will write those two paragraphs."),
    new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:FAINT,insideV:FAINT},
      rows:[
        new TableRow({children:[cell([
          new Paragraph({spacing:{after:120},children:[T(t.bigidea)]}),
          new Paragraph({spacing:{after:120},children:[T("Fraillon shows this first through "),
            T(t.idea1,{bold:true}),T(".")]}),
          new Paragraph({spacing:{after:0},children:[T("She also shows it through "),
            T("_".repeat(58),{color:"808080"})]}),
          new Paragraph({spacing:{after:120},children:[T("_".repeat(88),{color:"808080"})]}),
          new Paragraph({spacing:{after:0},children:[T("and through "),
            T("_".repeat(64),{color:"808080"})]}),
          new Paragraph({spacing:{after:0},children:[T("_".repeat(88),{color:"808080"})]})],W)]})]}),
    P("Two ideas you could use:",{size:20,color:"595959",after:60}),
    ...t.hints.map(h=>dot(h)),
    brk(),

    new Paragraph({spacing:{after:60},children:[T("Paragraph 1 — written for you",{bold:true,size:28})]}),
    P("Read it before you start. Colour the parts: the idea, the language feature, the analytical verb, the evidence, the effect on the reader.",{size:20,color:"595959"}),
    new Table({columnWidths:[W],width:{size:W,type:WidthType.DXA},
      borders:{top:RULE,bottom:RULE,left:RULE,right:RULE,insideH:RULE,insideV:RULE},
      rows:[new TableRow({children:[cell(
        [new Paragraph({spacing:{after:0,line:400},children:[T(t.worked.join(" "),{size:24})]})],W,
        {shading:{type:ShadingType.CLEAR,fill:SOFT,color:"auto"},margins:{top:180,bottom:180,left:200,right:200}})]})]}),
    HEAD("What this paragraph does"),
    dot("It starts with one idea, and every sentence after it stays on that idea."),
    dot("The quote sits inside a sentence — it is not left on its own."),
    dot("The third sentence says what the writing does, not what happens next."),
    dot("The last sentence goes back to the idea and says more than the first sentence did."),
    brk(),

    new Paragraph({spacing:{after:120},children:[T("Paragraph 2",{bold:true,size:28})]}),
    frame("Your second idea", PARA_ROWS),
    gap(160),
    new Paragraph({spacing:{after:120},children:[T("Paragraph 3",{bold:true,size:28})]}),
    frame("Your third idea", PARA_ROWS),
    brk(),

    new Paragraph({spacing:{after:60},children:[T("Self assessment",{bold:true,size:28})]}),
    P("Tick one box in each row for the paragraphs you wrote today.",{size:20,color:"595959"}),
    selfTable(),
    gap(160),
    box("One thing I will do better in the next task",900),
    gap(160),
    box("Teacher feedback",1400)
  ];
  return new Document({styles:{default:{document:{run:{font:"Arial",size:24,color:"000000"}}}},
    sections:[{properties:{page:{size:{width:A4W,height:A4H},
      margin:{top:MARG,bottom:MARG,left:MARG,right:MARG}}},children:kids}]});
}
(async()=>{ for(const t of TASKS){
  const b=await Packer.toBuffer(doc(t)); fs.writeFileSync(t.file,b); console.log("written "+t.file);
}})();
