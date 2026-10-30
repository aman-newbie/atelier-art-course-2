/* Local demo authentication only. This is not a security boundary on a public static site. */
(function(){
  'use strict';
  const CONFIG_KEY='atelier_admin_local_auth_v1';
  const SESSION_KEY='atelier_admin_local_session_v1';
  function encode(bytes){let s='';new Uint8Array(bytes).forEach(b=>s+=String.fromCharCode(b));return btoa(s);}
  function decode(value){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
  function constantTimeEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
  function config(){try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');}catch(e){return null;}}
  async function derive(pin,salt){
    if(!window.crypto||!window.crypto.subtle||!window.TextEncoder)throw new Error('Secure-context Web Crypto is unavailable.');
    const key=await window.crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
    const bits=await window.crypto.subtle.deriveBits({name:'PBKDF2',salt:decode(salt),iterations:120000,hash:'SHA-256'},key,256);
    return encode(bits);
  }
  async function setup(pin,confirmation){
    if(String(pin||'').length<8)return {ok:false,error:'Use a passphrase of at least 8 characters.'};
    if(pin!==confirmation)return {ok:false,error:'The two passphrases do not match.'};
    try{
      const salt=encode(window.crypto.getRandomValues(new Uint8Array(16)));
      const hash=await derive(pin,salt);
      localStorage.setItem(CONFIG_KEY,JSON.stringify({version:1,salt:salt,hash:hash,iterations:120000,algorithm:'PBKDF2-SHA-256'}));
      sessionStorage.setItem(SESSION_KEY,'1');
      return {ok:true};
    }catch(e){return {ok:false,error:e.message||'Could not save local demo credentials.'};}
  }
  async function login(pin){
    const saved=config();
    if(!saved||!saved.salt||!saved.hash)return {ok:false,error:'No local passphrase is configured.'};
    try{
      const candidate=await derive(String(pin||''),saved.salt);
      if(!constantTimeEqual(candidate,saved.hash))return {ok:false,error:'Incorrect passphrase.'};
      sessionStorage.setItem(SESSION_KEY,'1');
      return {ok:true};
    }catch(e){return {ok:false,error:e.message||'Local login is unavailable.'};}
  }
  function isAuthenticated(){try{return !!config()&&sessionStorage.getItem(SESSION_KEY)==='1';}catch(e){return false;}}
  function logout(){try{sessionStorage.removeItem(SESSION_KEY);}catch(e){}}
  function status(){return {configured:!!config(),authenticated:isAuthenticated(),mode:'local-demo',secure:false};}
  window.ATELIER_ADMIN_AUTH={setup:setup,login:login,isAuthenticated:isAuthenticated,logout:logout,status:status};
})();