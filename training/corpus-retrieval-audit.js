const fs=require('fs'),vm=require('vm');
const app=fs.readFileSync('app.js','utf8');
function extract(start,end){const i=app.indexOf(start),j=app.indexOf(end,i);if(i<0||j<0)throw new Error('Missing source: '+start);return app.slice(i,j);}
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(extract('const DOUBT_STOP_WORDS','function normalizeDoubtText'),ctx);
vm.runInContext(extract('function transliterateHindiForSearch','function tokenizeForSearch'),ctx);
vm.runInContext(extract('function tokenizeForSearch','async function loadCurriculumIndex'),ctx);
vm.runInContext(extract('function bm25Score','async function searchCurriculum'),ctx);
const chunks=JSON.parse(fs.readFileSync('curriculum-index.json','utf8'));
const rows=fs.readFileSync('training/atelier_qa_dataset.jsonl','utf8').trim().split(/\n/).map(JSON.parse);
const docs=chunks.map(c=>ctx.tokenizeForSearch(c.t));const df=new Map();let total=0;
for(const d of docs){total+=d.length;for(const w of new Set(d))df.set(w,(df.get(w)||0)+1);}
const avg=total/(docs.length||1);let covered=0,exact=0,examples=[];
for(const row of rows){
 const q=row.messages[1].content;const label=row.messages[0].content.match(/currently on the module "([^"]+)/);const expected=label&&label[1];const qt=ctx.tokenizeForSearch(q);const qn=ctx.normalizeDoubtText(q);let best=-1,bestScore=0;
 for(let i=0;i<chunks.length;i++){const title=ctx.normalizeDoubtText(chunks[i].m||'');const boost=title.length>3&&qn.includes(title)?100:0;const score=ctx.bm25Score(qt,docs[i],df,docs.length,avg,1.5,0.75)+boost;if(score>bestScore){bestScore=score;best=i;}}
 if(bestScore>=1.15)covered++;
 if(expected&&best>=0&&chunks[best].m.toLowerCase()===expected.toLowerCase())exact++;
 else if(examples.length<5)examples.push({question:q,expectedModule:expected,topModule:best>=0?chunks[best].m:null,score:Number(bestScore.toFixed(2))});
}
const out={qaPairs:rows.length,allQuestionsNonempty:rows.every(r=>r.messages[1].content.trim().length>0),indexChunks:chunks.length,confidenceThreshold:2.8,retrievalCoverage:covered,coveragePercent:Number((covered/rows.length*100).toFixed(1)),topModuleExact:exact,topModuleExactPercent:Number((exact/rows.length*100).toFixed(1)),unmatched:rows.length-covered,topModuleMismatchExamples:examples};
console.log(JSON.stringify(out,null,2));
