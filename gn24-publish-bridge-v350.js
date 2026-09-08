(()=>{
'use strict';
const QUEUE_KEY='ipma_ai_office_gn24_publish_queue_v1';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const TARGET='https://news24.ai.kr/pages/ai-office-publish/';
const $=id=>document.getElementById(id);
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch(_){return f}};
function b64url(obj){const json=JSON.stringify(obj);const bytes=new TextEncoder().encode(json);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function packageFor(articleId){return read(QUEUE_KEY,[]).find(x=>x.articleId===articleId&&x.status==='ready')||null}
function markSent(articleId){const q=read(QUEUE_KEY,[]),i=q.findIndex(x=>x.articleId===articleId&&x.status==='ready');if(i<0)return;q[i]={...q[i],status:'handoff',handoffAt:new Date().toISOString()};try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q))}catch(_){}}
function install(){
 const note=$('nr350QueueNote');if(!note||$('gn24PublishHandoff'))return;
 const b=document.createElement('button');b.type='button';b.id='gn24PublishHandoff';b.textContent='Global News24 발행 화면으로 이동';b.style.cssText='display:block;margin-top:10px;padding:11px 14px;border:1px solid rgba(85,217,139,.5);border-radius:10px;background:rgba(85,217,139,.14);color:#baf3d0;font-weight:900;cursor:pointer';
 b.addEventListener('click',()=>{
   const articleId=$('nr350Id')?.value||'';const pkg=packageFor(articleId);
   if(!pkg)return alert('발행대기 패키지를 찾지 못했습니다. 먼저 최종 발행 승인을 완료해 주세요.');
   const payload={...pkg,bridgeVersion:'3.5.0',origin:'AI OFFICE',handoffAt:new Date().toISOString()};
   markSent(articleId);
   location.href=TARGET+'#package='+b64url(payload);
 });
 note.appendChild(b);
}
function refresh(){install();const b=$('gn24PublishHandoff');if(!b)return;const articleId=$('nr350Id')?.value||'';b.disabled=!packageFor(articleId);b.style.opacity=b.disabled?'.45':'1';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setInterval(refresh,800)});else setInterval(refresh,800);
})();