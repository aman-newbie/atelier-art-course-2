const fs=require('fs'),vm=require('vm'),assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
function extract(a,b){const i=app.indexOf(a),j=app.indexOf(b,i);if(i<0||j<0)throw Error('missing '+a);return app.slice(i,j);}
const ctx={window:{},STATE:{mentorLanguage:'auto',completed:new Set(['m1']),quizAnswers:{m1:{0:1}},xp:55,streak:3},getAllLiveModules:()=>[{m:{id:'m1',quiz:[{correct:1}]}},{m:{id:'m2',quiz:[{correct:0}]}}],getNextIncompleteModule:()=>({m:{id:'m2'}}),L:()=> 'Perspective'};
vm.createContext(ctx);
vm.runInContext(extract('function transliterateHindiForSearch','function tokenizeForSearch'),ctx);
vm.runInContext(extract('function isHinglishDoubt','function getDoubtRelatedTitles'),ctx);
vm.runInContext(extract('function getMentorReplyLanguage','function getConversationReply'),ctx);
vm.runInContext(extract('function answerProgressQuestion','function getConversationReply'),ctx);
const cases=[
 ['english-auto','What\'s my progress?','en'],['english-tell','Tell me about my progress','en'],['english-status','How am I doing?','en'],
 ['hinglish-auto','Meri progress kya hai?','hi'],['hindi-auto','मेरी प्रोग्रेस क्या है?','hi'],
 ['preference-en','मेरी progress क्या है?','en','en'],['preference-hi','What is my progress?','hi','hi'],['preference-both','What is my progress?','both','both']
];
let passed=0,fail=[];
for(const [id,q,want,pref] of cases){ctx.STATE.mentorLanguage=pref||'auto';const got=ctx.getMentorReplyLanguage(q);if(got===want)passed++;else fail.push({id,want,got});}
ctx.STATE.mentorLanguage='auto';
for(const q of ['What\'s my progress?','Tell me about my progress','How far am I?','What have I completed?','Meri progress kya hai?','मेरी प्रोग्रेस बताओ','How many modules have I completed?','How much of the course is complete?','What did I complete?','Ab tak kitna hua?']){const a=ctx.answerProgressQuestion(q,'en');if(a&&a.includes('1/2 (50%)')&&a.includes('55')&&a.includes('1/1'))passed++;else fail.push({id:'progress-'+q,answer:a});}
const p=ctx.answerProgressQuestion('What is perspective?','en');if(p===null)passed++;else fail.push({id:'non-progress',answer:p});
const topicProgress=ctx.answerProgressQuestion('What is progress in perspective drawing?','en');if(topicProgress===null)passed++;else fail.push({id:'topic-progress-false-positive',answer:topicProgress});
const lang=extract('function extractMentorExcerpt','function answerCurrentLessonQuestion');
vm.runInContext(lang,ctx);
const sample='English: A simple line exercise. | Hinglish: Ek simple line exercise.';
if(ctx.extractMentorExcerpt(sample,'en')==='A simple line exercise.'&&ctx.extractMentorExcerpt(sample,'hi')==='Ek simple line exercise.'&&ctx.extractMentorExcerpt(sample,'both')==='A simple line exercise.\nEk simple line exercise.')passed++;else fail.push({id:'excerpt-language',en:ctx.extractMentorExcerpt(sample,'en'),hi:ctx.extractMentorExcerpt(sample,'hi'),both:ctx.extractMentorExcerpt(sample,'both')});
console.log(JSON.stringify({languageAndProgress:{passed,total:cases.length+13,failed:fail.length},failures:fail},null,2));if(fail.length)process.exitCode=1;
