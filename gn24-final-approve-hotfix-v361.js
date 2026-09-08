(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const NEWS_KEY='ipma_ai_office_news_brief_v1';
const QUEUE_KEY='ipma_ai_office_gn24_publish_queue_v1';
const $=id=>document.getElementById(id);
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
function buildPackage(a){const n=read(NEWS_KEY,[]).find(x=>x.id===a.sourceNewsId)||null;return {id:'publish-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),articleId:a.id,target:'Global News24',status:'ready',approvedAt:new Date().toISOString(),publishedAt:null,title:a.title||'',subtitle:a.subtitle||'',summary:a.summary||'',body:a.body||'',category:a.category||'',tags:a.tags||'',sources:a.sources||'',imageBrief:a.imageBrief||'',photoCaption:a.photoCaption||'',imageUrl:String(a.imageUrl||'').trim(),sourceNewsId:a.sourceNewsId||'',sourceNewsTitle:n?.title||'',sourceNewsSource:n?.source||'',autoPublish:false,brandLogoLocked:a.brandLogoLocked===true,brandLogoUrl:a.brandLogoUrl||'',brandLogoPosition:a.brandLogoPosition||'',brandLogoRule:a.brandLogoRule||''};}
function handle(e){
 const b=e.target?.closest?.('#nr350ConfirmFinal');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 const id=$('nr350Id')?.value||'';if(!id)return;
 const ok=$('nr350CheckContent')?.checked&&$('nr350CheckSource')?.checked&&$('nr350CheckImage')?.checked&&($('nr350ConfirmText')?.value||'').trim()==='최종승인';
 if(!ok){const s=$('nr350State');if(s)s.textContent='최종 승인 확인 항목과 “최종승인” 입력을 확인해 주세요.';return;}
 const rows=read(ARTICLE_KEY,[]),i=rows.findIndex(x=>x.id===id);if(i<0)return;
 const now=new Date().toISOString();
 const a={...rows[i],title:$('nr350Title')?.value.trim()||rows[i].title||'',subtitle:$('nr350Subtitle')?.value.trim()||'',category:$('nr350Category')?.value.trim()||'',tags:$('nr350Tags')?.value.trim()||'',summary:$('nr350Summary')?.value.trim()||'',body:$('nr350Body')?.value.trim()||'',sources:$('nr350Sources')?.value.trim()||'',imageBrief:$('nr350Image')?.value.trim()||'',photoCaption:$('nr350Caption')?.value.trim()||'',status:'publish_ready',updatedAt:now};
 rows[i]=a;if(!write(ARTICLE_KEY,rows))return;
 const q=read(QUEUE_KEY,[]);const qi=q.findIndex(x=>x.articleId===id&&['ready','handoff'].includes(String(x.status||'ready')));const pkg=buildPackage(a);if(qi>=0)q[qi]={...q[qi],...pkg,id:q[qi].id||pkg.id};else q.push(pkg);write(QUEUE_KEY,q);
 $('nr350Guard')?.classList.remove('show');$('nr350QueueNote')?.classList.add('show');
 const s=$('nr350State');if(s)s.textContent='발행 승인 완료 · Global News24 발행대기';
 if($('nr350ConfirmText'))$('nr350ConfirmText').value='';['nr350CheckContent','nr350CheckSource','nr350CheckImage'].forEach(x=>{if($(x))$(x).checked=false;});
 setTimeout(()=>window.dispatchEvent(new Event('storage')),0);
}
document.addEventListener('click',handle,true);
})();