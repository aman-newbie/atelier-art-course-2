const fs=require('fs'),vm=require('vm'),assert=require('assert'),{webcrypto}=require('crypto'),{TextEncoder}=require('util');
const authSource=fs.readFileSync('admin-auth.js','utf8'),catalogSource=fs.readFileSync('admin-catalog.js','utf8'),adminSource=fs.readFileSync('admin.js','utf8'),app=fs.readFileSync('app.js','utf8'),html=fs.readFileSync('index.html','utf8'),cap=fs.readFileSync('doubt-capabilities.js','utf8');
const checks=[];function record(name,ok,detail){checks.push({name,ok:!!ok,...(detail?{detail}: {})});}
function store(){const x={};return {getItem:k=>Object.prototype.hasOwnProperty.call(x,k)?x[k]:null,setItem:(k,v)=>x[k]=String(v),removeItem:k=>delete x[k]};}
(async()=>{
 const TEST_PIN='qa-'+'local-'+'phrase-2026';
 const local=store(),session=store(),win={crypto:webcrypto,TextEncoder};const authCtx={window:win,localStorage:local,sessionStorage:session,crypto:webcrypto,TextEncoder,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};vm.createContext(authCtx);vm.runInContext(authSource,authCtx);const auth=win.ATELIER_ADMIN_AUTH;
 record('fresh browser starts unauthenticated',!auth.isAuthenticated());
 let r=await auth.setup('123','123');record('short passphrase rejected',!r.ok&&!auth.isAuthenticated());
 r=await auth.setup('long-enough-pass','different-pass');record('mismatched passphrase rejected',!r.ok&&!auth.isAuthenticated());
 r=await auth.setup(TEST_PIN,TEST_PIN);record('first-time local setup succeeds',r.ok&&auth.isAuthenticated());
 const saved=JSON.parse(local.getItem('atelier_admin_local_auth_v1'));record('plaintext passphrase is not stored',!JSON.stringify(saved).includes(TEST_PIN));
 auth.logout();record('logout removes local session',!auth.isAuthenticated());
 r=await auth.login('wrong-passphrase');record('wrong passphrase rejected',!r.ok&&!auth.isAuthenticated());
 r=await auth.login(TEST_PIN);record('correct passphrase unlocks',r.ok&&auth.isAuthenticated());
 const otherSession=store();authCtx.sessionStorage=otherSession;record('new browser session requires login',!auth.isAuthenticated());authCtx.sessionStorage=session;auth.logout();
 const catCtx={window:{}};vm.createContext(catCtx);vm.runInContext(catalogSource,catCtx);const catalog=catCtx.window.ATELIER_ADMIN_CATALOG;
 record('19 fixed and dynamic message templates catalogued',catalog.messages.length===19);
 record('every message template points to its live source',catalog.messages.every(m=>m.source==='index.html'?html.includes(m.text):m.source.includes('#mentorLanguage')?html.includes('id="mentorLanguage"'):m.source.includes('answerProgressQuestion')?app.includes('function answerProgressQuestion')&&app.includes(m.text.slice(0,35)):app.includes(m.text)));
 record('conversation intent families represented',['Greeting','Identity','Thanks','Goodbye','Ambiguous / short input'].every(n=>catalog.intents.some(i=>i.name===n)));
 record('normal course UI has no admin link',!html.includes('admin.html'));
 record('no default passphrase embedded',!authSource.includes('DEFAULT_PIN')&&!authSource.includes('DEFAULT_PASSWORD'));
 record('capability engine exposes live catalogue',cap.includes('catalog:function'));
 const capCtx={window:{}};vm.createContext(capCtx);vm.runInContext(cap,capCtx);record('runtime capability catalogue has 19 real categories',capCtx.window.ATELIER_DOUBT_CAPABILITIES.catalog().length===19);
 record('admin render paths enforce auth gate',adminSource.includes('if(!AUTH.isAuthenticated()){gate();return;}'));
 record('admin Q&A makes no network request',!adminSource.includes('fetch(')&&!adminSource.includes('XMLHttpRequest'));
 const adminHtml=fs.readFileSync('admin.html','utf8');record('admin page does not boot the course application',!adminHtml.includes('app.js')&&adminHtml.includes('admin-auth.js'));
 record('admin dashboard is a separate direct route',adminHtml.includes('admin.js')&&adminHtml.includes('admin.css'));
 // Exercise the direct admin-page boot path with an unauthenticated session.
 const root={innerHTML:'',addEventListener(){},querySelectorAll(){return []}};const form={addEventListener(){}};const doc={getElementById:id=>id==='adminRoot'?root:id==='adminGateForm'?form:null};
 const deniedWin={ATELIER_ADMIN_AUTH:{status:()=>({configured:true,authenticated:false}),isAuthenticated:()=>false},ATELIER_ADMIN_CATALOG:catalog};const denyCtx={window:deniedWin,document:doc,localStorage:store(),sessionStorage:store()};vm.createContext(denyCtx);vm.runInContext(adminSource,denyCtx);
 record('direct admin route without session renders gate only',root.innerHTML.includes('Local Demo Mode')&&!root.innerHTML.includes('data-admin-view')&&!root.innerHTML.includes('Mentor overview'));
 const passRoot={innerHTML:'',addEventListener(){},querySelectorAll(){return navButtons}};const main={innerHTML:'',querySelectorAll(){return []}};const button={addEventListener(){}};const chatForm={handler:null,addEventListener:(ev,fn)=>{chatForm.handler=fn;}};const chatInput={value:''};const chatLog={children:[],appendChild(x){this.children.push(x);},scrollTop:0,scrollHeight:100};const navButtons=['overview','messages','rules','capabilities','knowledge','logs','tests','diagnostics','mentor'].map(id=>({dataset:{adminView:id},addEventListener:(ev,fn)=>{navHandlers[id]=fn;},classList:{toggle(){}}}));const navHandlers={};const doc2={getElementById:id=>id==='adminRoot'?passRoot:id==='adminLogout'?button:id==='adminMain'?main:id==='adminChatForm'?chatForm:id==='adminChatInput'?chatInput:id==='adminChatLog'?chatLog:null,createElement:()=>({className:'',textContent:''})};
 const passWin={ATELIER_ADMIN_AUTH:{status:()=>({configured:true,authenticated:true}),isAuthenticated:()=>true,logout:()=>{}},ATELIER_ADMIN_CATALOG:catalog,ATELIER_DOUBT_CAPABILITIES:{catalog:()=>Array.from({length:19},(_,i)=>({id:'x'+i,label:'tool'+i,names:[],can:'can'}))},ATELIER_DOUBT_KB:{entries:[{id:'sample',aliases:['sample topic'],en:'Sample answer',hi:'Udaharan'}]}};
 const passCtx={window:passWin,document:doc2,localStorage:store(),sessionStorage:store()};vm.createContext(passCtx);vm.runInContext(adminSource,passCtx);
 record('authenticated session renders admin dashboard',passRoot.innerHTML.includes('data-admin-view')&&main.innerHTML.includes('Mentor'));
 const expectedViews={overview:'Mentor',messages:'Message',rules:'Intent',capabilities:'Tool',knowledge:'Knowledge',logs:'Conversation',tests:'Testing',diagnostics:'System',mentor:'Ask the'};
 for(const [id,needle] of Object.entries(expectedViews)){if(navHandlers[id])navHandlers[id]();record('dashboard section renders: '+id,main.innerHTML.includes(needle));}
 navHandlers.mentor();chatInput.value='Which questions can you answer?';chatForm.handler({preventDefault(){}});record('admin Mentor Q&A answers capability-scope question',chatLog.children.some(x=>x.textContent.includes('19 tool categories')));
 chatInput.value='How many messages have visitors sent?';chatForm.handler({preventDefault(){}});record('admin Mentor Q&A distinguishes local records from global analytics',chatLog.children.some(x=>x.textContent.includes('This browser currently has')&&x.textContent.includes('no global analytics')));
 const failed=checks.filter(x=>!x.ok);console.log(JSON.stringify({total:checks.length,passed:checks.length-failed.length,failed:failed.length,checks},null,2));if(failed.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
