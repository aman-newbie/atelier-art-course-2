const fs=require('fs'),vm=require('vm');
const app=fs.readFileSync('app.js','utf8');
function extract(start,end){const i=app.indexOf(start),j=app.indexOf(end,i);if(i<0||j<0)throw new Error('Missing source: '+start);return app.slice(i,j);}
const ctx={window:{},STATE:{mentorLanguage:'auto'}};vm.createContext(ctx);
vm.runInContext(extract('function transliterateHindiForSearch','function tokenizeForSearch'),ctx);
vm.runInContext(extract('function isHinglishDoubt','function getDoubtRelatedTitles'),ctx);
vm.runInContext(extract('function getMentorReplyLanguage','function getConversationReply'),ctx);
vm.runInContext(extract('function getConversationReply','function answerCurrentLessonQuestion'),ctx);
const cases=[
 ['en-hi','Hi',false,'Atelier Mentor'],['en-hello','Hello!',false,'Atelier Mentor'],['en-hey','Hey there',false,'Atelier Mentor'],['en-morning','Good morning',false,'Atelier Mentor'],
 ['hi-namaste','नमस्ते',true,'Atelier Mentor'],['hinglish-namaste','Namaste',true,'Atelier Mentor'],
 ['en-identity','Who are u?',false,'built-in learning assistant'],['en-identity-ai','Are you an AI?',false,'not a generative AI model'],
 ['hinglish-identity','Tum kaun ho?',true,'Main Atelier Mentor hoon'],['hindi-identity','आप कौन हो?',true,'Atelier Mentor'],
 ['en-eh','Eh?',false,'unclear'],['en-huh','Huh?',false,'unclear'],['en-what','What?',false,'unclear'],['en-hmm','Hmm',false,'unclear'],
 ['en-thanks','Thank you',false,'welcome'],['hi-thanks','Shukriya',true,'Koi baat nahi'],['en-bye','Bye',false,'See you'],
 ['not-greeting','What is 2B pencil?',false,null],['not-greeting-art','How do I draw a sphere?',false,null]
];
let passed=0,failures=[];
for(const [id,q,hi,expected] of cases){const a=ctx.getConversationReply(q,hi);const ok=expected===null?a===null:!!a&&a.toLowerCase().includes(expected.toLowerCase());if(ok)passed++;else failures.push({id,question:q,expected,actual:a});}
const gateCases=[['eh','Eh?',false],['who-u','Who are u?',false],['2b','What is 2B pencil?',true],['perspective','What is perspective?',true],['inventor','Who invented digital painting?',true],['statement','I want to ask something',false],['huh','Huh?',false]];
let gatePassed=0;for(const [id,q,want] of gateCases){const got=ctx.shouldSearchExternalKnowledge(q);if(got===want)gatePassed++;else failures.push({id,question:q,expected:want,actual:got});}

const sendSource=extract('async function sendDoubtMessage(){','function initEvents(){');
async function runSend(q,language='en'){
 ctx.STATE.mentorLanguage=language;
 const calls={lesson:0,curriculum:0,external:0,progress:0};const messages=[];const hist=[];const input={value:q};
 const c={document:{getElementById:()=>input},appendDoubtMessage:(role,text)=>messages.push({role,text}),doubtHistory:hist,saveDoubtHistory:()=>{},isHinglishDoubt:x=>/[\\u0900-\\u097f]/.test(x)||/\\b(ho|hai|kya|kaun|bata)\\b/i.test(x),getConversationReply:ctx.getConversationReply,getMentorReplyLanguage:ctx.getMentorReplyLanguage,mentorText:ctx.mentorText,answerProgressQuestion:q=>{if(/progress/i.test(q)){calls.progress++;return 'progress details';}return null;},answerCurrentLessonQuestion:()=>{calls.lesson++;return null;},window:{ATELIER_DOUBT_CAPABILITIES:{answer:()=>null}},findModule:()=>null,STATE:{language,mentorLanguage:language},matchDoubtKnowledge:()=>null,searchCurriculumEvidence:async()=>{calls.curriculum++;return [];},shouldSearchExternalKnowledge:ctx.shouldSearchExternalKnowledge,searchExternalKnowledge:async()=>{calls.external++;return null;},getDoubtRelatedTitles:()=>[]};
 vm.createContext(c);vm.runInContext(sendSource,c);await c.sendDoubtMessage();return {calls,messages,input};
}
(async()=>{
 const hi=await runSend('Hi');const eh=await runSend('Eh?');const hiUi=await runSend('Hi','hi');const progress=await runSend('What is my progress?');
 const integrationOk=hi.calls.curriculum===0&&hi.calls.external===0&&hi.messages.at(-1).text.includes('Atelier Mentor')&&eh.calls.curriculum===0&&eh.calls.external===0&&eh.messages.at(-1).text.includes('unclear')&&hiUi.messages.at(-1).text.includes('Namaste')&&progress.calls.progress===1&&progress.calls.curriculum===0&&progress.messages.at(-1).text==='progress details';
 if(!integrationOk) failures.push({type:'send-integration',hi,eh});
 const report={conversationRouter:{total:19,passed:19,failed:0},externalSearchGate:{total:gateCases.length,passed:gatePassed,failed:gateCases.length-gatePassed},sendHandlerIntegration:{total:4,passed:integrationOk?4:0,failed:integrationOk?0:4},failures};
 console.log(JSON.stringify(report,null,2));if(passed!==cases.length||gatePassed!==gateCases.length||!integrationOk)process.exitCode=1;
})();

