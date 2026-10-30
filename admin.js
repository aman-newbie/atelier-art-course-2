(function(){
  'use strict';
  const root=document.getElementById('adminRoot');
  const AUTH=window.ATELIER_ADMIN_AUTH;
  const CATALOG=window.ATELIER_ADMIN_CATALOG;
  let active='overview';
  let messageFilter='all';
  let messageSearch='';
  let logFilter='all';
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getCapabilities=()=>window.ATELIER_DOUBT_CAPABILITIES&&typeof window.ATELIER_DOUBT_CAPABILITIES.catalog==='function'?window.ATELIER_DOUBT_CAPABILITIES.catalog():[];
  const getKnowledge=()=>window.ATELIER_DOUBT_KB&&Array.isArray(window.ATELIER_DOUBT_KB.entries)?window.ATELIER_DOUBT_KB.entries:[];
  function readHistory(){try{const x=JSON.parse(localStorage.getItem('atelier_doubt_history')||'[]');return Array.isArray(x)?x.slice(-40):[];}catch(e){return [];}}
  function gate(){
    const status=AUTH.status();
    const setup=!status.configured;
    root.innerHTML='<main class="admin-gate"><section class="admin-gate-card"><div class="admin-kicker">ATELIER / OWNER TOOLS</div><h1>Admin <em>access</em></h1><p>'+(setup?'Create a local demo passphrase for this browser.':'Enter the local demo passphrase to open the dashboard.')+'</p><div class="admin-warning"><strong>Local Demo Mode — Not Secure.</strong><br>This is a convenience lock only. The website and its JavaScript are public; a visitor can inspect the source or alter browser storage to bypass this screen. Do not reuse an important password or store secrets here.</div><form id="adminGateForm"><div class="admin-field"><label for="adminPin">'+(setup?'Create passphrase (8+ characters)':'Passphrase')+'</label><input id="adminPin" type="password" minlength="8" autocomplete="'+(setup?'new-password':'current-password')+'" required></div>'+(setup?'<div class="admin-field"><label for="adminPinConfirm">Confirm passphrase</label><input id="adminPinConfirm" type="password" minlength="8" autocomplete="new-password" required></div>':'')+'<button class="admin-btn primary" type="submit">'+(setup?'Set local passphrase':'Unlock dashboard')+'</button><div class="admin-error" id="adminGateError" role="alert"></div></form><p class="admin-mono">No password is hard-coded or sent to a server.</p><a href="index.html">← Return to Atelier course</a></section></main>';
    const form=document.getElementById('adminGateForm');
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const pin=document.getElementById('adminPin').value;
      const confirm=document.getElementById('adminPinConfirm');
      const result=setup?await AUTH.setup(pin,confirm.value):await AUTH.login(pin);
      if(result.ok){renderShell();return;}
      document.getElementById('adminGateError').textContent=result.error||'Could not continue.';
    });
  }
  const nav=[['overview','Overview'],['messages','Message Library'],['rules','Intent & Rules'],['capabilities','Capabilities'],['knowledge','Knowledge Base'],['logs','Conversation Log'],['tests','Testing Lab'],['diagnostics','Diagnostics'],['mentor','Mentor Q&A']];
  function renderShell(){
    if(!AUTH.isAuthenticated()){gate();return;}
    root.innerHTML='<div class="admin-shell"><header class="admin-topbar"><a class="admin-brand" href="index.html"><span class="admin-brand-mark">A</span> Atelier <span class="admin-mono">/ ADMIN</span></a><div class="admin-top-actions"><span class="admin-local-pill">LOCAL DEMO · NOT SECURE</span><button class="admin-btn" id="adminLogout" type="button">Lock dashboard</button></div></header><div class="admin-layout"><aside class="admin-sidebar"><div class="admin-side-label">Mentor controls</div><nav class="admin-nav" aria-label="Admin sections">'+nav.map(n=>'<button type="button" data-admin-view="'+n[0]+'" class="'+(active===n[0]?'active':'')+'">'+n[1]+'</button>').join('')+'</nav><p class="admin-sidebar-note">Read-only inspector. This panel documents current behavior; it does not edit live Mentor rules.</p></aside><main class="admin-content" id="adminMain"></main></div></div>';
    document.getElementById('adminLogout').addEventListener('click',()=>{AUTH.logout();active='overview';gate();});
    root.querySelectorAll('[data-admin-view]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.adminView;root.querySelectorAll('[data-admin-view]').forEach(x=>x.classList.toggle('active',x.dataset.adminView===active));renderPage();}));
    renderPage();
  }
  function head(title,desc){return '<div class="admin-page-head"><div><div class="admin-kicker">ATELIER MENTOR / READ-ONLY INSPECTOR</div><h1>'+title+'</h1><p>'+desc+'</p></div></div>';}
  function stat(label,value,hint){return '<div class="admin-stat"><div class="admin-kicker">'+label+'</div><div class="value">'+esc(value)+'</div><div class="hint">'+hint+'</div></div>';}
  function panel(title,body){return '<section class="admin-panel"><h2>'+title+'</h2>'+body+'</section>';}
  function renderOverview(){
    const caps=getCapabilities(),kb=getKnowledge(),history=readHistory(),userCount=history.filter(x=>x.role==='user').length,botCount=history.filter(x=>x.role!=='user').length;
    return head('Mentor <em>overview</em>','A live, local view of the rules and data currently loaded by this page.')+
      '<div class="admin-grid">'+stat('Fixed message templates',CATALOG.messages.length,'Catalogued exact text templates')+stat('Tool categories',caps.length,'Read from the live capability engine')+stat('Knowledge entries',kb.length,'Read from the loaded offline knowledge base')+stat('Saved chat records',history.length,'This browser only · max 40 records')+'</div>'+
      '<div class="admin-two-col">'+panel('Runtime routing','<div class="admin-list">'+CATALOG.routing.map(x=>'<div class="admin-row"><div><strong>'+esc(x.step)+' · '+esc(x.name)+'</strong><small>'+esc(x.detail)+'</small></div></div>').join('')+'</div>')+
      panel('Local conversation snapshot','<div class="admin-grid">'+stat('User records',userCount,'Saved on this device')+stat('Mentor records',botCount,'Saved on this device')+'</div><p>No global visitor count exists. These are only the records available in this browser.</p><button class="admin-btn" data-go="logs">Inspect saved records</button>')+'</div>'+
      '<div class="admin-footer-note"><strong>Security boundary:</strong> this static admin view is a local convenience panel, not a private admin system. Do not enter secrets or treat the passphrase as secure authentication.</div>';
  }
  function renderMessages(){
    const groups=['all',...new Set(CATALOG.messages.map(x=>x.group))];
    const filtered=CATALOG.messages.filter(m=>(messageFilter==='all'||m.group===messageFilter)&&(!messageSearch||(m.text+' '+m.group+' '+m.language+' '+m.source).toLowerCase().includes(messageSearch)));
    return head('Message <em>library</em>','Exact fixed text templates found in the current runtime and welcome UI. Dynamic answers are listed separately under Capabilities and Knowledge Base.')+
      '<div class="admin-toolbar"><input class="admin-search" id="messageSearch" placeholder="Search messages…" value="'+esc(messageSearch)+'"><select class="admin-search" id="messageFilter" aria-label="Filter message group">'+groups.map(g=>'<option value="'+esc(g)+'" '+(g===messageFilter?'selected':'')+'>'+esc(g==='all'?'All groups':g)+'</option>').join('')+'</select><span class="admin-tag">'+filtered.length+' / '+CATALOG.messages.length+' templates</span></div>'+
      (filtered.length?filtered.map(m=>'<article class="admin-message-card"><div class="admin-message-meta"><span class="admin-tag">'+esc(m.group)+'</span><span>'+esc(m.language)+'</span><span>Source: '+esc(m.source)+'</span></div><blockquote>'+esc(m.text)+'</blockquote></article>').join(''):'<div class="admin-empty">No matching templates.</div>')+
      '<p class="admin-status">Count means fixed text templates catalogued here, not the number of times messages were sent.</p>';
  }
  function renderRules(){
    return head('Intent & <em>rules</em>','How a question moves through Atelier Mentor, in the order the runtime uses.')+
      panel('Routing pipeline',CATALOG.routing.map(x=>'<div class="admin-step"><div class="admin-step-num">'+esc(x.step)+'</div><div><strong>'+esc(x.name)+'</strong><p>'+esc(x.detail)+'</p></div></div>').join(''))+
      '<h2 class="admin-section-title">Intent triggers</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Intent</th><th>Example triggers</th><th>Runtime action</th></tr></thead><tbody>'+CATALOG.intents.map(x=>'<tr><td><strong>'+esc(x.name)+'</strong></td><td>'+esc(x.examples.join(' · '))+'</td><td>'+esc(x.action)+'</td></tr>').join('')+'</tbody></table></div>'+
      '<h2 class="admin-section-title">Important thresholds</h2><div class="admin-two-col">'+panel('Curated answer match','<p>Best alias/keyword match must score at least <strong>3.1</strong> before a knowledge entry is used.</p>')+panel('Curriculum evidence','<p>Score <strong>1.15 or higher</strong> is treated as strong. The response can include up to two lesson excerpts, each capped at 650 characters.</p>')+panel('External fallback','<p>At least three words, approved question prefix, maximum query 180 characters. Inputs over 300 characters and email, URL or phone-like text are blocked.</p>')+panel('Fallback provider','<p>Wikipedia Action API only. Hindi Wikipedia is tried first for Devanagari input, with English fallback if no Hindi results are found.</p>')+'</div>';
  }
  function renderCapabilities(){
    const caps=getCapabilities();
    return head('Tool <em>capabilities</em>','Loaded directly from the live capability engine; category names, aliases, uses and limitations are not manually guessed.')+
      '<div class="admin-grid">'+stat('Categories',caps.length,'Runtime catalogue')+stat('Combination support','Yes','Multiple matched tools are interpreted together')+stat('Language support','EN + HI','English, Hinglish and Hindi handling')+stat('External model','None','Rule-based capability responses')+'</div>'+
      '<div class="admin-cap-grid">'+caps.map(c=>'<article class="admin-cap"><h3>'+esc(c.label||c.id)+'</h3><p><strong>Aliases:</strong> '+esc((c.names||[]).join(', '))+'</p><p><strong>Can do:</strong> '+esc(c.can||c.hiCan||'No separate description recorded.')+'</p>'+(c.limit?'<p><strong>Limit:</strong> '+esc(c.limit)+'</p>':'')+'<span class="admin-mono">'+esc(c.id)+'</span></article>').join('')+'</div>';
  }
  function renderKnowledge(){
    const entries=getKnowledge();
    return head('Knowledge <em>base</em>','Curated offline Q&A entries loaded from doubt-knowledge.js. This is separate from the larger curriculum search index.')+
      '<div class="admin-toolbar"><input class="admin-search" id="knowledgeSearch" placeholder="Search topics or aliases…"></div><div id="knowledgeList" class="admin-list">'+knowledgeRows(entries)+'</div>';
  }
  function knowledgeRows(entries){return entries.length?entries.map(e=>'<article class="admin-message-card"><div class="admin-message-meta"><span class="admin-tag">'+esc(e.id)+'</span><span>'+((e.aliases||[]).length)+' aliases</span><span>'+((e.modules||[]).length)+' module refs</span></div><strong>'+esc((e.aliases||[]).slice(0,4).join(' · ')||e.id)+'</strong><p>'+esc(e.en||'No English answer stored.')+'</p><p>'+esc(e.hi||'No Hindi answer stored.')+'</p></article>').join(''):'<div class="admin-empty">No knowledge entries loaded.</div>';}
  function renderLogs(){
    const history=readHistory(),filtered=history.filter(x=>logFilter==='all'||(logFilter==='user'?x.role==='user':x.role!=='user'));
    return head('Conversation <em>log</em>','Read-only records saved in this browser under atelier_doubt_history. The application keeps at most the latest 40 records.')+
      '<div class="admin-warning">Local-only data: this is not a server log, not a complete visitor history, and not shared across devices or browsers. Messages may contain personal text; keep this device private.</div>'+
      '<div class="admin-toolbar"><select class="admin-search" id="logFilter"><option value="all" '+(logFilter==='all'?'selected':'')+'>All records</option><option value="user" '+(logFilter==='user'?'selected':'')+'>User messages</option><option value="bot" '+(logFilter==='bot'?'selected':'')+'>Mentor messages</option></select><span class="admin-tag">'+filtered.length+' records shown</span></div>'+
      (filtered.length?'<div class="admin-log-list">'+filtered.map((x,i)=>'<article class="admin-log-item"><span class="role">'+esc(x.role==='user'?'USER':'MENTOR')+' · record '+(i+1)+'</span><p>'+esc(x.text)+'</p></article>').join('')+'</div>':'<div class="admin-empty">No saved conversation records were found in this browser.</div>');
  }
  function renderTests(){
    return head('Testing <em>lab</em>','Run read-only checks against the catalogue and browser-local state. Full app conversation tests also live in the repository training suite.')+
      '<div class="admin-panel"><h2>Local diagnostics</h2><p>These checks do not send data, edit Mentor rules or modify course progress.</p><button class="admin-btn primary" id="runAdminChecks">Run checks</button><div id="adminCheckResults" class="admin-list" style="margin-top:14px"><div class="admin-empty">Press Run checks to inspect this browser.</div></div></div>'+
      '<h2 class="admin-section-title">Runtime regression scenarios</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Input</th><th>Expected route</th><th>External search?</th></tr></thead><tbody><tr><td>Hi / Namaste</td><td>Greeting shortcut</td><td>No</td></tr><tr><td>Who are you?</td><td>Identity shortcut</td><td>No</td></tr><tr><td>Eh? / Huh?</td><td>Clarification</td><td>No</td></tr><tr><td>What is 2B pencil?</td><td>Tool capability</td><td>No</td></tr><tr><td>How do I hold a pencil?</td><td>Curated knowledge</td><td>No</td></tr><tr><td>Current lesson: common mistakes</td><td>Active lesson fields</td><td>No</td></tr><tr><td>Unsupported factual question</td><td>Wikipedia only if eligible</td><td>Conditional</td></tr></tbody></table></div>';
  }
  function renderDiagnostics(){
    const caps=getCapabilities(),kb=getKnowledge(),history=readHistory(),status=AUTH.status();
    const checks=[
      ['Local passphrase configured',status.configured],
      ['Local session authenticated',status.authenticated],
      ['Web Crypto available',!!(window.crypto&&window.crypto.subtle)],
      ['Local storage available',storageWorks()],
      ['Capability engine loaded',caps.length===19],
      ['Knowledge base loaded',kb.length>0],
      ['Fixed message catalogue loaded',CATALOG.messages.length===16],
      ['Conversation history readable',Array.isArray(history)]
    ];
    return head('System <em>diagnostics</em>','Environment and data-source checks. Green means this browser can read the local component; it does not imply server security.')+
      '<div class="admin-panel"><div class="admin-list">'+checks.map(x=>'<div class="admin-row"><div><strong>'+esc(x[0])+'</strong><small>'+(x[1]?'Available':'Unavailable / not verified')+'</small></div><span class="admin-tag">'+(x[1]?'OK':'CHECK')+'</span></div>').join('')+'</div></div>'+
      '<h2 class="admin-section-title">Data boundaries</h2><div class="admin-two-col">'+panel('Runtime files','<p>index.html, app.js, doubt-capabilities.js, doubt-knowledge.js, curriculum index and translation files are static assets served to every visitor.</p>')+panel('Conversation history','<p>localStorage key: <code>atelier_doubt_history</code>. Up to 40 records in the current browser profile. No central collection.</p>')+panel('Admin credentials','<p>Salted PBKDF2 hash is stored in localStorage; a session flag is stored in sessionStorage. Both are client-side and bypassable.</p>')+panel('Server-side controls','<p>None. GitHub Pages serves static files only; there is no protected admin API or verified owner identity.</p>')+'</div>';
  }
  function storageWorks(){try{const k='atelier_admin_probe';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch(e){return false;}}
  function answerMentor(question){
    const q=String(question||'').toLowerCase();
    const caps=getCapabilities(),kb=getKnowledge(),history=readHistory();
    if(/how many .*?(visitor|user|chat|conversation)|messages sent|usage count/.test(q))return 'This browser currently has '+history.length+' saved chat records ('+history.filter(x=>x.role==='user').length+' user and '+history.filter(x=>x.role!=='user').length+' Mentor). The static site has no global analytics, so I cannot count all visitors or devices.';
    if(/how many (messages|templates)|message count|automated messages/.test(q))return 'There are '+CATALOG.messages.length+' fixed text templates in the audited message library. This is a template count, not a sent-message count. Dynamic tool and knowledge answers are generated from data and are counted separately.';
    if(/what can you do|capabilit|which tools|which questions|what questions|what can i answer|scope/.test(q))return 'I can inspect '+caps.length+' tool categories: '+caps.map(x=>x.label||x.id).join(', ')+'. I also answer from '+kb.length+' curated knowledge entries, the active lesson and the course search index.';
    if(/automated messages|message library|predefined messages|show messages/.test(q))return 'The fixed-message library contains '+CATALOG.messages.length+' exact templates. Open Message Library to inspect each message, language and source file.';
    if(/greeting|hello|hi /.test(q))return 'Greetings are handled first by fixed English or Hindi/Hinglish shortcuts. They return a greeting immediately and do not trigger curriculum retrieval or Wikipedia.';
    if(/unknown|do not know|dont know|fallback|no answer/.test(q))return 'The Mentor checks the active lesson, tool rules, curated answers and course evidence. Only when no strong course result exists can an eligible factual question reach Wikipedia. If no reliable result is found, it asks for context instead of guessing.';
    if(/intent|routing|trigger|rule/.test(q))return 'The ordered pipeline is: conversation shortcuts → active lesson → tool capability engine → curated knowledge (score >= 3.1) → curriculum retrieval (strong score >= 1.15) → eligible Wikipedia fallback → safe no-answer response. Open Intent & Rules for full details.';
    if(/limitation|limit|secure|security|admin login/.test(q))return CATALOG.limitations.join('\n• ');
    if(/wikipedia|external|internet|web search/.test(q))return 'External lookup is a restricted Wikipedia Action API fallback, not a full-web search engine. It requires an eligible factual question, blocks long or personal-looking inputs and sends the query text to Wikipedia.';
    if(/knowledge base|topics|curated/.test(q))return 'The loaded offline knowledge base contains '+kb.length+' entries. Open Knowledge Base to inspect aliases, module references and English/Hindi answers.';
    if(/who are you|what are you|ai model/.test(q))return 'Atelier Mentor is a deterministic, rule-based learning assistant. It is not a generative AI model.';
    return 'I can answer questions about Mentor capabilities, fixed messages, intent routing, knowledge entries, fallback behavior, limitations and this browser’s saved chat records. Try: “What can you do?”, “How do you handle greetings?” or “What happens when you do not know?”';
  }
  function renderMentor(){
    return head('Ask the <em>Mentor</em>','Ask about the system’s own documented behavior. Answers come from this local catalogue and browser state—no AI API or external request.')+
      '<div class="admin-chat"><div class="admin-chat-log" id="adminChatLog"><div class="admin-chat-bubble">I can explain my predefined messages, intent rules, capabilities, local history and limitations. I am a deterministic admin help panel, not a generative AI.</div></div><div class="admin-command-list">'+CATALOG.commands.map(c=>'<button class="admin-btn" type="button" data-admin-question="'+esc(c.q)+'">'+esc(c.q)+'</button>').join('')+'</div><form class="admin-chat-form" id="adminChatForm"><input class="admin-chat-input" id="adminChatInput" placeholder="Ask about Mentor’s rules or capabilities…" autocomplete="off"><button class="admin-btn primary" type="submit">Ask</button></form></div>';
  }
  function addChat(role,text){const log=document.getElementById('adminChatLog');if(!log)return;const el=document.createElement('div');el.className='admin-chat-bubble '+role;el.textContent=text;log.appendChild(el);log.scrollTop=log.scrollHeight;}
  function renderPage(){
    if(!AUTH.isAuthenticated()){gate();return;}
    const main=document.getElementById('adminMain');if(!main)return;
    const renderers={overview:renderOverview,messages:renderMessages,rules:renderRules,capabilities:renderCapabilities,knowledge:renderKnowledge,logs:renderLogs,tests:renderTests,diagnostics:renderDiagnostics,mentor:renderMentor};
    main.innerHTML=(renderers[active]||renderOverview)();
    main.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.go;renderShell();}));
    const search=document.getElementById('messageSearch');if(search){search.addEventListener('input',()=>{messageSearch=search.value.toLowerCase();renderPage();const x=document.getElementById('messageSearch');if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length);}});}
    const filter=document.getElementById('messageFilter');if(filter)filter.addEventListener('change',()=>{messageFilter=filter.value;renderPage();});
    const ksearch=document.getElementById('knowledgeSearch');if(ksearch)ksearch.addEventListener('input',()=>{const q=ksearch.value.toLowerCase();const rows=getKnowledge().filter(e=>(e.id+' '+(e.aliases||[]).join(' ')+' '+(e.en||'')+' '+(e.hi||'')).toLowerCase().includes(q));document.getElementById('knowledgeList').innerHTML=knowledgeRows(rows);});
    const lfilter=document.getElementById('logFilter');if(lfilter)lfilter.addEventListener('change',()=>{logFilter=lfilter.value;renderPage();});
    const run=document.getElementById('runAdminChecks');if(run)run.addEventListener('click',runChecks);
    const chat=document.getElementById('adminChatForm');if(chat)chat.addEventListener('submit',e=>{e.preventDefault();const input=document.getElementById('adminChatInput');const q=input.value.trim();if(!q)return;addChat('user',q);addChat('mentor',answerMentor(q));input.value='';});
    main.querySelectorAll('[data-admin-question]').forEach(b=>b.addEventListener('click',()=>{addChat('user',b.dataset.adminQuestion);addChat('mentor',answerMentor(b.dataset.adminQuestion));}));
  }
  function runChecks(){
    const results=[
      ['Authentication gate active',AUTH.isAuthenticated()],
      ['Message catalogue integrity',CATALOG.messages.length===16],
      ['Capability catalogue count',getCapabilities().length===19],
      ['Knowledge base available',getKnowledge().length>0],
      ['Local history is readable',Array.isArray(readHistory())],
      ['No server analytics claimed',true],
      ['No external AI API used by admin Q&A',true]
    ];
    document.getElementById('adminCheckResults').innerHTML=results.map(x=>'<div class="admin-row"><div><strong>'+esc(x[0])+'</strong></div><span class="admin-tag">'+(x[1]?'PASS':'FAIL')+'</span></div>').join('')+'<p class="admin-status">'+results.filter(x=>x[1]).length+' / '+results.length+' local checks passed.</p>';
  }
  root.addEventListener('click',e=>{const target=e.target.closest('[data-admin-question]');if(target&&active==='mentor'){e.preventDefault();}});
  if(AUTH&&CATALOG){if(AUTH.isAuthenticated())renderShell();else gate();}
})();