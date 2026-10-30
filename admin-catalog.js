/* Audited, read-only description of Atelier Mentor's fixed response templates and routing. */
(function(){
  'use strict';
  const messages=[
    {id:'welcome',group:'Welcome',language:'English',source:'index.html',text:'Hi! I’m Atelier Mentor, your learning assistant for Atelier Art Course. Ask about drawing, art fundamentals, tools, or any course lesson. I use prepared course knowledge and lesson material, not a generative AI model. For clear general factual questions, I may search public Wikipedia; your question text is sent there. Do not include private information.'},
    {id:'greeting-en',group:'Greeting',language:'English',source:'app.js · getConversationReply',text:'Hi! I’m Atelier Mentor. Ask me about drawing, art concepts, or any Atelier lesson.'},
    {id:'greeting-hi',group:'Greeting',language:'Hindi / Hinglish',source:'app.js · getConversationReply',text:'Namaste! Main Atelier Mentor hoon. Drawing, art concepts ya course ke kisi bhi lesson ke baare mein poochho.'},
    {id:'identity-en',group:'Identity',language:'English',source:'app.js · getConversationReply',text:'I’m Atelier Mentor, the built-in learning assistant for Atelier Art Course. I guide you using prepared course knowledge and lesson material; I’m not a generative AI model.'},
    {id:'identity-hi',group:'Identity',language:'Hindi / Hinglish',source:'app.js · getConversationReply',text:'Main Atelier Mentor hoon — Atelier Art Course ka built-in learning assistant. Main prepared course knowledge aur lesson material se guidance deta hoon; main generative AI model nahi hoon.'},
    {id:'thanks-en',group:'Thanks',language:'English',source:'app.js · getConversationReply',text:'You’re welcome! Ask whenever you need help with art or an Atelier lesson.'},
    {id:'thanks-hi',group:'Thanks',language:'Hindi / Hinglish',source:'app.js · getConversationReply',text:'Koi baat nahi! Art ya course se related kuch bhi pooch sakte ho.'},
    {id:'goodbye-en',group:'Goodbye',language:'English',source:'app.js · getConversationReply',text:'See you next time. Happy practicing!'},
    {id:'goodbye-hi',group:'Goodbye',language:'Hindi / Hinglish',source:'app.js · getConversationReply',text:'Phir milte hain! Practice ke liye all the best.'},
    {id:'clarify-en',group:'Clarification',language:'English',source:'app.js · getConversationReply',text:'Not sure what you mean yet. Did something seem unclear? Add a little context and I’ll help.'},
    {id:'clarify-hi',group:'Clarification',language:'Hindi / Hinglish',source:'app.js · getConversationReply',text:'Kya unclear laga? Apna sawaal thoda aur context ke saath likho, main help karunga.'},
    {id:'course-en',group:'Curriculum retrieval',language:'English',source:'app.js · sendDoubtMessage',text:'Relevant Atelier course material:'},
    {id:'course-hi',group:'Curriculum retrieval',language:'Hindi / Hinglish',source:'app.js · sendDoubtMessage',text:'Atelier course mein is topic se related material:'},
    {id:'progress-en',group:'Progress',language:'English',source:'app.js · answerProgressQuestion',text:'Here is your progress on this device: completed modules, XP, streak, quiz accuracy and next incomplete module. Data is local to this browser.'},
    {id:'progress-hi',group:'Progress',language:'Hindi / Hinglish',source:'app.js · answerProgressQuestion',text:'Is device par tumhari progress:'},
    {id:'language-preference',group:'Language preference',language:'Auto / English / Hindi-Hinglish / Both',source:'index.html · #mentorLanguage',text:'Auto follows the language of the user message. English, Hindi/Hinglish or Both can be selected explicitly; the choice is saved with local progress.'},
    {id:'unknown-en',group:'No confident answer',language:'English',source:'app.js · sendDoubtMessage',text:'I could not verify a reliable answer in the Atelier knowledge base or external reference search. Add a little context or a more specific topic; I will not guess.'},
    {id:'unknown-hi',group:'No confident answer',language:'Hindi / Hinglish',source:'app.js · sendDoubtMessage',text:'Is sawaal ka reliable answer Atelier knowledge ya external reference se confirm nahi ho paya. Thoda context ya exact topic batao; main galat jawab guess nahi karunga.'},
    {id:'wiki-intro',group:'External reference',language:'English',source:'app.js · searchExternalKnowledge',text:'I could not find a confident answer in Atelier’s prepared knowledge, so here are external reference results. These are general references, not verified Atelier lesson instructions:'}
  ];
  const intents=[
    {id:'greeting',name:'Greeting',examples:['hi','hello','hey','namaste','good morning'],action:'Return a fixed greeting before any lesson or knowledge lookup.'},
    {id:'identity',name:'Identity',examples:['who are you','what is your name','are you an AI','tum kaun ho'],action:'Explain that Atelier Mentor is a prepared-knowledge assistant, not a generative AI model.'},
    {id:'thanks',name:'Thanks',examples:['thanks','thank you','shukriya'],action:'Return a short acknowledgement.'},
    {id:'goodbye',name:'Goodbye',examples:['bye','goodbye','see you'],action:'Return a short closing message.'},
    {id:'unclear',name:'Ambiguous / short input',examples:['eh','huh','hmm','what?','???'],action:'Ask for context; do not send the fragment to Wikipedia.'},
    {id:'progress',name:'Personal course progress',examples:['what is my progress','tell me about my progress','how far am I','meri progress kya hai','मेरी प्रोग्रेस बताओ'],action:'Read this browser’s actual saved state: completed modules, XP, streak, quiz accuracy and next incomplete module. Do not retrieve random lesson excerpts.'},
    {id:'current-lesson',name:'Current lesson',examples:['explain this lesson','common mistakes','pro tips','practice','why it matters'],action:'Use the active module fields: hook, whyItMatters, coreIdea, mistakes, proTips or practice, in the selected Mentor reply language.'},
    {id:'tools',name:'Tool capability',examples:['what can I do with a 2B pencil','what tools do I need','what is missing'],action:'Match tool names and aliases; combine found tools, explain uses, limits and course references.'},
    {id:'curated-kb',name:'Curated knowledge',examples:['how do I start drawing','how to hold a pencil','how to draw straight lines'],action:'Match aliases and keywords; return the best entry when score is at least 3.1.'},
    {id:'curriculum',name:'Course retrieval',examples:['perspective basics','explain proportion'],action:'Search the course index; only stronger results (score >= 2.8) may be shown, and bilingual source text is reduced to the selected reply language.'},
    {id:'external',name:'Wikipedia fallback',examples:['What is the history of digital painting?','Who invented perspective?'],action:'Only after no strong course result; query needs at least 3 words and an approved question prefix. Wikipedia only.'},
    {id:'unknown',name:'No confident answer',examples:['an unsupported or unclear detailed question'],action:'Say that a reliable answer could not be verified; ask for more context rather than guessing.'}
  ];
  const routing=[
    {step:'01',name:'Conversation shortcuts',detail:'Greeting, identity, thanks, goodbye and ambiguous-input rules run first.'},
    {step:'02',name:'Personal progress',detail:'Progress/status questions read the current browser’s saved completion, XP, streak and quiz state before any lesson retrieval.'},
    {step:'03',name:'Active lesson',detail:'If the user asks about the open lesson, answer from that module’s structured fields using the selected Mentor reply language.'},
    {step:'04',name:'Tool capability engine',detail:'Match the 19 tool categories and answer combinations, minimum-kit needs, alternatives and limitations.'},
    {step:'05',name:'Curated knowledge base',detail:'Alias/keyword matching; the best entry must score at least 3.1. Current coverage: 76 entries and 406 tested aliases.'},
    {step:'06',name:'Course curriculum retrieval',detail:'Search course material; only score >= 2.8 is treated as strong evidence. Up to two excerpts are returned in the selected language.'},
    {step:'07',name:'External reference fallback',detail:'Only if there is no strong course result and the query passes the factual-question gate. Search is Wikipedia, not full-web search.'},
    {step:'08',name:'Safe no-answer response',detail:'If no reliable answer is found, ask for context and do not invent an answer.'}
  ];
  const limitations=[
    'Rule-based matching and retrieval; no generative reasoning model. Literal coverage of every possible user question is impossible.',
    'The curated knowledge base currently has 76 entries and 406 tested aliases; tool capability rules cover 19 categories. New phrasings can still require clarification or new coverage.',
    'Progress is read only from the current browser’s local saved state; it is not a cross-device or server-side progress account.',
    'External fallback is Wikipedia only, not general web search.',
    'No central server, visitor analytics or cross-device chat database.',
    'The public GitHub Pages source and admin catalogue can be inspected by anyone.',
    'Local demo login can be bypassed by someone who can inspect or modify this browser’s storage or code.',
    'The saved chat history is browser-local and capped at 40 records; it is not a complete visitor log.',
    'External Wikipedia fetches were tested with mocks; deployed-browser CORS behavior has not been end-to-end verified.'
  ];
  const commands=[
    {q:'What can you do?',a:'Show the 19 tool capability categories, 76 curated knowledge entries (406 tested aliases), active-lesson answers, personal progress and course retrieval.'},
    {q:'What is my progress?',a:'Read this browser’s actual saved progress: completed modules, XP, streak, quiz accuracy and next incomplete module. Progress is local to this browser.'},
    {q:'How do you choose a reply language?',a:'The Mentor language selector offers Auto, English, Hindi/Hinglish or Both. Auto follows the language of the user message; an explicit preference takes priority.'},
    {q:'What are your automated messages?',a:'Open Message Library to inspect the fixed templates and their source locations.'},
    {q:'How do you handle greetings?',a:'Greeting shortcuts run first and return a fixed English or Hindi/Hinglish reply; they do not trigger course search.'},
    {q:'What happens when you do not know?',a:'The Mentor checks local course evidence, may use the restricted Wikipedia fallback for eligible factual questions, then returns a no-confident-answer message rather than guessing.'},
    {q:'Which questions can you answer?',a:'Questions about the 19 tool categories, curated art knowledge, active lesson fields and course curriculum are in scope. See Capabilities and Knowledge Base.'},
    {q:'What are your limitations?',a:'The Mentor is deterministic, Wikipedia-only for external references, and has no central visitor analytics. The local login is not secure authentication.'},
    {q:'Show your intent rules',a:'Open Intent & Rules for the ordered routing pipeline, intent triggers and thresholds.'},
    {q:'How many messages have visitors sent?',a:'Only the saved conversation records on this browser can be counted. This static site does not collect a global visitor-message count.'}
  ];
  window.ATELIER_ADMIN_CATALOG={version:1,messages:messages,intents:intents,routing:routing,limitations:limitations,commands:commands};
})();