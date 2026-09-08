(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const QUEUE_KEY='ipma_ai_office_gn24_publish_queue_v1';
const NEWS_KEY='ipma_ai_office_news_brief_v1';
const ARCHIVE_KEY='ipma_ai_office_gn24_published_archive_v1';
const LAST_RECEIPT_KEY='ipma_ai_office_last_gn24_receipt_v1';
const VERIFIED_PUBLISHED=[{
  aiArticleId:'gn24-20260908-ai-455295ruzn',
  sourceNewsId:'',
  title:'경찰·소방·민원공무원 자살예방 강화…긴급직무휴지 신설',
  summary:'',
  gn24ArticleId:'gn24-20260908-ai-455295ruzn',
  publishedAt:'2026-09-08T00:00:00+09:00',
  publishedUrl:'https://news24.ai.kr/pages/article/?id=gn24-20260908-ai-455295ruzn',
  status:'published'
}];
const $=id=>document.getElementById(id);
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch(_){return f}};
const readObject=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch(_){return null}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
function decode(v){let s=String(v||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}
function archiveReceipt(r,article){const archive=read(ARCHIVE_KEY,[]);const id=String(r.aiArticleId||r.gn24ArticleId||'');const entry={aiArticleId:id,sourceNewsId:article?.sourceNewsId||'',title:article?.title||r.title||'',summary:article?.summary||'',gn24ArticleId:r.gn24ArticleId||'',publishedAt:r.publishedAt||new Date().toISOString(),publishedUrl:r.articleUrl||r.publishedUrl,status:'published'};const i=archive.findIndex(x=>(id&&x.aiArticleId===id)||x.publishedUrl===entry.publishedUrl);if(i>=0)archive[i]={...archive[i],...entry};else archive.unshift(entry);write(ARCHIVE_KEY,archive.slice(0,500));}
function applyReceipt(r){if(!r||r.origin!=='GN24'||r.status!=='published'||!r.aiArticleId||!(r.articleUrl||r.publishedUrl))return false;const articleUrl=r.articleUrl||r.publishedUrl;const rows=read(ARTICLE_KEY,[]);const i=rows.findIndex(x=>x.id===r.aiArticleId);let article=i>=0?rows[i]:null;let sourceNewsId=article?.sourceNewsId||'';if(i>=0){rows[i]={...rows[i],status:'published',gn24Status:'published',gn24ArticleId:r.gn24ArticleId||'',publishedAt:r.publishedAt||new Date().toISOString(),publishedUrl:articleUrl,updatedAt:new Date().toISOString()};article=rows[i];write(ARTICLE_KEY,rows);}const q=read(QUEUE_KEY,[]);q.forEach(x=>{if(x.articleId===r.aiArticleId){x.status='published';x.gn24ArticleId=r.gn24ArticleId||'';x.publishedAt=r.publishedAt||new Date().toISOString();x.publishedUrl=articleUrl;}});write(QUEUE_KEY,q);if(sourceNewsId){const news=read(NEWS_KEY,[]);const n=news.findIndex(x=>x.id===sourceNewsId);if(n>=0){news[n]={...news[n],status:'published',publishedArticleId:r.aiArticleId,gn24ArticleId:r.gn24ArticleId||'',publishedAt:r.publishedAt||new Date().toISOString(),publishedUrl:articleUrl};write(NEWS_KEY,news);}}archiveReceipt({...r,articleUrl},article);try{localStorage.setItem(LAST_RECEIPT_KEY,JSON.stringify({...r,articleUrl}));}catch(_){}return true;}
function recoverArchive(){
  const archive=read(ARCHIVE_KEY,[]),rows=read(ARTICLE_KEY,[]),queue=read(QUEUE_KEY,[]),last=readObject(LAST_RECEIPT_KEY);let changed=false;
  const merge=a=>{if(!a||a.status!=='published'||!(a.publishedUrl||a.articleUrl))return;const entry={aiArticleId:a.aiArticleId||a.articleId||a.id||a.gn24ArticleId||'',sourceNewsId:a.sourceNewsId||'',title:a.title||'',summary:a.summary||'',gn24ArticleId:a.gn24ArticleId||'',publishedAt:a.publishedAt||a.updatedAt||'',publishedUrl:a.publishedUrl||a.articleUrl,status:'published'};const i=archive.findIndex(x=>(entry.aiArticleId&&x.aiArticleId===entry.aiArticleId)||x.publishedUrl===entry.publishedUrl);if(i>=0){const next={...archive[i],...entry,title:entry.title||archive[i].title};if(JSON.stringify(next)!==JSON.stringify(archive[i])){archive[i]=next;changed=true;}}else{archive.unshift(entry);changed=true;}};
  rows.forEach(merge);queue.forEach(merge);if(last)merge({...last,publishedUrl:last.publishedUrl||last.articleUrl});VERIFIED_PUBLISHED.forEach(merge);
  if(changed)write(ARCHIVE_KEY,archive.slice(0,500));
}
function renderArchive(){const archive=read(ARCHIVE_KEY,[]);let box=$('gn24PublishedArchive');if(!box){const board=$('genNewsBoard');if(!board)return;box=document.createElement('section');box.id='gn24PublishedArchive';box.style.cssText='margin:18px 0 6px;padding:16px;border:1px solid rgba(85,217,139,.28);border-radius:16px;background:rgba(85,217,139,.055)';const list=$('newsList');if(list)list.insertAdjacentElement('beforebegin',box);else board.appendChild(box);}box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><b style="color:#9ce6b6">GN24 발행 완료 기사</b><span style="font-size:12px;color:var(--muted)">${archive.length}건 · 새 뉴스 수집과 별도 보존</span></div><div style="display:grid;gap:8px;margin-top:12px">${archive.length?archive.slice(0,20).map(a=>`<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.035)"><span><b style="display:block">${String(a.title||'발행 기사').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</b><small style="color:var(--muted)">${a.publishedAt?new Date(a.publishedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'발행 완료'}</small></span><a href="${String(a.publishedUrl||'#').replace(/"/g,'&quot;')}" target="_blank" rel="noopener" style="white-space:nowrap;color:#baf3d0;text-decoration:none;border:1px solid rgba(85,217,139,.35);border-radius:9px;padding:7px 9px">GN24 기사 보기</a></div>`).join(''):'<span style="font-size:12px;color:var(--muted)">아직 저장된 발행 완료 기사가 없습니다.</span>'}</div>`;}
function installArchive(){recoverArchive();renderArchive();}
function banner(r){let b=$('gn24Receipt360');if(!b){b=document.createElement('div');b.id='gn24Receipt360';b.style.cssText='position:fixed;left:50%;top:74px;transform:translateX(-50%);z-index:99999;max-width:760px;width:calc(100% - 32px);padding:14px 16px;border:1px solid rgba(85,217,139,.5);border-radius:14px;background:#0c2533;color:#d9ffea;box-shadow:0 18px 50px rgba(0,0,0,.4);font-weight:800';document.body.appendChild(b);}b.innerHTML=`Global News24 발행 완료 회신이 반영되었습니다. <a href="${String(r.articleUrl).replace(/"/g,'&quot;')}" target="_blank" rel="noopener" style="color:#9fd3ff">발행 기사 열기</a>`;setTimeout(()=>b.remove(),12000);}
function consume(){const p=new URLSearchParams(location.hash.slice(1));const raw=p.get('gn24Receipt');if(!raw){installArchive();return;}try{const r=decode(raw);if(applyReceipt(r))banner(r);}catch(e){console.error('GN24 receipt error',e);}history.replaceState(null,'',location.pathname+location.search);setTimeout(()=>location.reload(),250);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',consume,{once:true});else consume();setInterval(installArchive,1000);
})();
