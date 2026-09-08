(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const QUEUE_KEY='ipma_ai_office_gn24_publish_queue_v1';
const $=id=>document.getElementById(id);
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
function decode(v){let s=String(v||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}
function applyReceipt(r){if(!r||r.origin!=='GN24'||r.status!=='published'||!r.aiArticleId||!r.articleUrl)return false;const rows=read(ARTICLE_KEY,[]);const i=rows.findIndex(x=>x.id===r.aiArticleId);if(i>=0){rows[i]={...rows[i],status:'published',gn24Status:'published',gn24ArticleId:r.gn24ArticleId||'',publishedAt:r.publishedAt||new Date().toISOString(),publishedUrl:r.articleUrl,updatedAt:new Date().toISOString()};write(ARTICLE_KEY,rows);}const q=read(QUEUE_KEY,[]);q.forEach(x=>{if(x.articleId===r.aiArticleId){x.status='published';x.gn24ArticleId=r.gn24ArticleId||'';x.publishedAt=r.publishedAt||new Date().toISOString();x.publishedUrl=r.articleUrl;}});write(QUEUE_KEY,q);return true;}
function banner(r){let b=$('gn24Receipt360');if(!b){b=document.createElement('div');b.id='gn24Receipt360';b.style.cssText='position:fixed;left:50%;top:74px;transform:translateX(-50%);z-index:99999;max-width:760px;width:calc(100% - 32px);padding:14px 16px;border:1px solid rgba(85,217,139,.5);border-radius:14px;background:#0c2533;color:#d9ffea;box-shadow:0 18px 50px rgba(0,0,0,.4);font-weight:800';document.body.appendChild(b);}b.innerHTML=`Global News24 발행 완료 회신이 반영되었습니다. <a href="${String(r.articleUrl).replace(/"/g,'&quot;')}" target="_blank" rel="noopener" style="color:#9fd3ff">발행 기사 열기</a>`;setTimeout(()=>b.remove(),12000);}
function consume(){const p=new URLSearchParams(location.hash.slice(1));const raw=p.get('gn24Receipt');if(!raw)return;try{const r=decode(raw);if(applyReceipt(r))banner(r);}catch(e){console.error('GN24 receipt error',e);}history.replaceState(null,'',location.pathname+location.search);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',consume,{once:true});else consume();
})();