from pathlib import Path

path = Path("teacher/teel-purpose.html")
s = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str, label: str) -> None:
    global s
    if old not in s:
        raise SystemExit(f"Could not find patch target: {label}")
    s = s.replace(old, new, 1)


replace_once(
    'Tap to test an idea: ✓ agree, ✗ disagree. The first two paragraph-ready ideas you agree with become P1 and P2; yellow bubbles are evidence.',
    'Tap to test an idea: ✓ agree, ✗ disagree. The first two strong ideas you agree with become P1 and P2; yellow bubbles are evidence.',
    "cloud wording",
)

replace_once(
    ''' {t:"she has Harvey learn their names",name:"learning their names",by:"having one adult learn their names",e:[
   {lead:"When Subhi describes Harvey",q:"…learn their names so that he can talk with us for real, instead of talking to us by our numbers.",shows:"using a name is a choice the camp never requires",eff:"shows the reader exactly what a number takes away"},
   {lead:"After Nasir dies",q:"…I whisper the few words of Rohingya that I know, just so my brain doesn't turn to thinking that they are right and that I am only Aussie Boy.",shows:"Subhi holds on to his language to hold on to himself",eff:"makes the reader feel the effort of staying a person"}]}''',
    ''' {t:"she contrasts names with numbers",name:"names instead of numbers",by:"contrasting people's names with the camp's use of numbers",e:[
   {lead:"When Subhi describes Harvey",q:"…learn their names so that he can talk with us for real, instead of talking to us by our numbers.",shows:"Harvey chooses to recognise each person by name",eff:"shows the reader what the camp's number system takes away"},
   {lead:"After Nasir dies",q:"…I whisper the few words of Rohingya that I know, just so my brain doesn't turn to thinking that they are right and that I am only Aussie Boy.",shows:"Subhi uses his own language to hold on to his identity",eff:"shows the reader that identity is something he has to protect"}]}''',
    "names idea",
)

replace_once(
    ''' {t:"she counts things instead of people",name:"counting things, not people",by:"letting the camp count things instead of people",e:[
   {lead:"When Subhi counts the camp's shoes",q:"There are only fourteen pairs of real shoes in this whole entire camp.",shows:"the camp is measured by what is missing",eff:"makes the reader feel the shortage without being told to"},
   {lead:"When Subhi thinks about Outside",q:"None of us knows what it is like just on the other side of the fences.",shows:"the fence is the edge of everything Subhi knows",eff:"makes the reader feel how close and how final it is"}]}''',
    ''' {t:"she focuses on ordinary childhood details",name:"ordinary childhood details",by:"focusing on ordinary things children notice and value",e:[
   {lead:"When Subhi counts the camp's shoes",q:"There are only fourteen pairs of real shoes in this whole entire camp.",shows:"a simple count of shoes makes the camp's deprivation concrete",eff:"shows the reader what daily life is like through a child's attention"},
   {lead:"When Jimmie brings her mother's book",q:"…knowing that Jimmie has a whole real book in her hands gives me a sort of brave that I haven't felt since Eli got taken.",shows:"a book matters to Subhi in the way an ordinary treasured object matters to a child",eff:"helps the reader see him as a child rather than a number"}]}''',
    "ordinary details idea",
)

replace_once(
    ''' {t:"she takes Subhi's voice away",name:"taking his voice",by:"taking Subhi's voice away when he is afraid",e:[
   {lead:"When Beaver catches Subhi at the fence",q:"I can't talk. I can't say a single thing.",shows:"fear takes Subhi's voice before Beaver has touched him",eff:"makes the reader feel that silence from the inside"},
   {lead:"When the protest grows",q:"There are twenty-four people with their lips sewn shut now, and eighty-seven on hunger strike.",shows:"people use their bodies when their words are not heard",eff:"makes the reader see what being ignored costs"}]}''',
    ''' {t:"she shows people struggling to be heard",name:"struggling to be heard",by:"showing what happens when people's voices are ignored",e:[
   {lead:"When Beaver catches Subhi at the fence",q:"I can't talk. I can't say a single thing.",shows:"fear leaves Subhi unable to speak for himself",eff:"puts the reader inside his loss of control"},
   {lead:"When the protest grows",q:"There are twenty-four people with their lips sewn shut now, and eighty-seven on hunger strike.",shows:"people turn to their bodies when ordinary words are not being heard",eff:"shows the reader the cost of being ignored"}]}''',
    "voice idea",
)

replace_once(
    ''' {t:"she puts a free girl on the other side of the fence",name:"a free girl too",by:"putting a free girl on the other side of the fence",e:[
   {lead:"At home in her own kitchen",q:"Jimmie wonders if her dad even remembers that she can't read.",shows:"Jimmie is unseen inside her own family",eff:"makes the reader feel that being shut out happens on both sides"},
   {lead:"By the end of the chapter",q:"Jimmie has never felt so alone.",shows:"the plainest sentence in the book is given to the free girl",eff:"makes the reader put the two children side by side"}]}''',
    ''' {t:"she places Subhi and Jimmie side by side",name:"Subhi and Jimmie",by:"placing Subhi's life beside Jimmie's",e:[
   {lead:"At home in her own kitchen",q:"Jimmie wonders if her dad even remembers that she can't read.",shows:"Jimmie can be overlooked even though she lives outside the camp",eff:"invites the reader to see her as a child with her own private problems"},
   {lead:"By the end of the chapter",q:"Jimmie has never felt so alone.",shows:"Jimmie's loneliness gives the reader a point of comparison with Subhi",eff:"helps the reader see both characters as individual children rather than categories"}]}''',
    "Jimmie comparison idea",
)

replace_once(
    ''' {t:"she lets a piece of paper beat a person",name:"paper beats a person",by:"letting a piece of paper beat a person",e:[
   {lead:"When Eli is moved",q:"That's not what his paper says. He was meant to move last week. And writing doesn't lie.",shows:"a form outranks what everyone in the room can see",eff:"makes the reader feel how helpless a person is against a rule"},
   {lead:"When Eli reads the wrappers",q:"I guess they don't want us getting any ideas, hey?",shows:"even the word freedom is rationed",eff:"lets the reader see the camp's control through a joke"}]}''',
    ''' {t:"she shows rules and paperwork overruling people",name:"rules and paperwork",by:"showing rules and paperwork being treated as more important than people",e:[
   {lead:"When Eli is moved",q:"That's not what his paper says. He was meant to move last week. And writing doesn't lie.",shows:"the written rule is treated as more important than Eli's actual situation",eff:"shows the reader how the system can ignore an individual person"},
   {lead:"When Subhi describes Harvey",q:"…learn their names so that he can talk with us for real, instead of talking to us by our numbers.",shows:"the camp normally treats people as numbers rather than individuals",eff:"makes the contrast between the system and Harvey's choice clear"}]}''',
    "paperwork idea",
)

replace_once(
    ''' {t:"she has people hand each other hope",name:"hope handed on",by:"having people hand each other hope",e:[
   {lead:"After Nasir dies",q:"Tonight, you look up at that sky, and there will be a new star there.",shows:"Harvey gives Subhi somewhere to put his grief",eff:"shows the reader that hope arrives from a person, not from luck"},
   {lead:"When Queeny and Eli get the photos out",q:"…about Queeny and Eli sneaking in the camera to get their pictures out into the world.",shows:"being seen is the one thing they can still arrange",eff:"makes the reader feel why being seen matters"}]}''',
    ''' {t:"she shows people caring for one another",name:"care between people",by:"showing people caring for one another inside the camp",e:[
   {lead:"After Nasir dies",q:"Tonight, you look up at that sky, and there will be a new star there.",shows:"Harvey responds to Subhi's grief with care",eff:"shows the reader a personal relationship inside the camp"},
   {lead:"When Queeny and Eli get the photos out",q:"…about Queeny and Eli sneaking in the camera to get their pictures out into the world.",shows:"Queeny and Eli take a risk so individual lives can be seen outside the camp",eff:"shows the reader people acting for one another rather than remaining anonymous"}]}''',
    "care idea",
)

replace_once(
    ''' {t:"she never lets someday arrive",name:"someday",by:"never letting someday arrive",e:[
   {lead:"When Maá talks about the future",q:"Someday, Subhi, someday they see we belong.",shows:"belonging is always being put off until later",eff:"makes the reader notice how long someday has already lasted"},
   {lead:"When Jimmie comes back",q:"Like maybe it really will be okay. Someday.",shows:"Subhi borrows his mother's word for his own hope",eff:"leaves the reader hopeful and uneasy at the same time"}]}''',
    ''' {t:"she repeats the word someday",name:"the word ‘someday’",by:"repeating the word ‘someday’ when characters imagine a better future",e:[
   {lead:"When Maá talks about the future",q:"Someday, Subhi, someday they see we belong.",shows:"Maá keeps imagining a future in which the family belongs",eff:"shows the reader how much of their life is spent waiting"},
   {lead:"When Jimmie comes back",q:"Like maybe it really will be okay. Someday.",shows:"Subhi repeats the same word when he tries to imagine change",eff:"leaves the reader with hope, but also with the sense that change is still postponed"}]}''',
    "someday idea",
)

replace_once(
    'const KEY="bonesparrow.teelPurpose.v2";',
    'const KEY="bonesparrow.teelPurpose.v3";',
    "state version",
)

path.write_text(s, encoding="utf-8")
print("Tidied", path)
