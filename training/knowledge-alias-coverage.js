const fs=require('fs'),vm=require('vm'),assert=require('assert');
const app=fs.readFileSync('app.js','utf8'),kb=fs.readFileSync('doubt-knowledge.js','utf8');
function extract(a,b){const i=app.indexOf(a),j=app.indexOf(b,i);if(i<0||j<0)throw Error('missing '+a);return app.slice(i,j);}
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(kb,ctx);
vm.runInContext(extract('function transliterateHindiForSearch','function tokenizeForSearch'),ctx);
vm.runInContext(extract('const DOUBT_STOP_WORDS','function isHinglishDoubt'),ctx);
vm.runInContext(extract('function matchDoubtKnowledge','function isHinglishDoubt'),ctx);
let total=0,miss=[];for(const entry of ctx.window.ATELIER_DOUBT_KB.entries){if(entry.id==='unknown-topic')continue;for(const alias of entry.aliases||[]){total++;if(!ctx.matchDoubtKnowledge(alias))miss.push({entry:entry.id,alias});}}
console.log(JSON.stringify({entries:ctx.window.ATELIER_DOUBT_KB.entries.length,aliases:total,matched:total-miss.length,missed:miss.length,failures:miss},null,2));if(miss.length||total!==406)process.exitCode=1;
