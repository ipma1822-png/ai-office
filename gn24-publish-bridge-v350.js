(()=>{
'use strict';
const QUEUE_KEY='ipma_ai_office_gn24_publish_queue_v1';
const TARGET='https://news24.ai.kr/pages/ai-office-publish/';
const $=id=>document.getElementById(id);
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch(_){return f}};
const validImageUrl=v=>/^https?:\/\/[^\s]+$/i.test(String(v||'').trim());
function b64url(obj){const json=JSON.stringify(obj);const bytes=new TextEncoder().encode(json);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function packageFor(articleId){return read(QUEUE_KEY,[]).find(x=>x.articleId===articleId&&['ready','handoff'].includes(String(x.status||'ready')))||null}
function readyPackage(articleId){const pkg=packageFor(articleId);return pkg&&validImageUrl(pkg.imageUrl)?pkg:null}
function install(){
 const note=$('nr350QueueNote');if(!note||$('gn24PublishHandoff'))return;
 const b=document.createElement('button');b.type='button';b.id='gn24PublishHandoff';b.textContent='Global News24 발행 화면으로 이동';b.style.cssText='display:block;margin-top:10px;padding:11px 14px;border:1px solid rgba(85,217,139,.5);border-radius:10px;background:rgba(85,217,139,.14);color:#baf3d0;font-weight:900;cursor:pointer';
 b.addEventListener('click',()=>{
   const articleId=$('nr350Id')?.value||'';const pkg=readyPackage(articleId);
   if(!pkg)return alert('대표이미지 실제 URL까지 연결된 발행대기 패키지가 필요합니다. 대표이미지 URL을 확인한 뒤 다시 시도해 주세요.');
   const payload={...pkg,imageUrl:String(pkg.imageUrl||'').trim(),status:'ready',bridgeVersion:'3.5.0',origin:'AI OFFICE',handoffAt:new Date().toISOString()};
   location.href=TARGET+'#package='+b64url(payload);
 });
 note.appendChild(b);
}
function refresh(){install();const b=$('gn24PublishHandoff');if(!b)return;const articleId=$('nr350Id')?.value||'';const pkg=packageFor(articleId),ready=!!(pkg&&validImageUrl(pkg.imageUrl));b.disabled=!ready;b.style.opacity=b.disabled?'.45':'1';b.title=ready?'대표이미지 imageUrl 포함 발행 패키지 준비 완료':pkg?'대표이미지 실제 URL을 먼저 연결해 주세요':'최종 발행 승인을 먼저 완료해 주세요';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setInterval(refresh,800)});else setInterval(refresh,800);
})();