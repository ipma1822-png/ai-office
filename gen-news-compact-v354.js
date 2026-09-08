(()=>{
'use strict';
const NEWS_KEY='ipma_ai_office_news_brief_v1';
const $=id=>document.getElementById(id);
const read=()=>{try{const v=JSON.parse(localStorage.getItem(NEWS_KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return []}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sourceUrl(n){if(/^https?:\/\//i.test(String(n?.sourceUrl||'')))return n.sourceUrl;const m=String(n?.source||'').match(/https?:\/\/\S+/i);return m?m[0].replace(/[),.;]+$/,''):''}
function sourceName(n){const s=String(n?.source||'').split('·')[0].trim();if(s&&s!=='뉴스 원문')return s;if(/news\.google\.com/i.test(sourceUrl(n)))return 'Google News';if(/yna\.co\.kr/i.test(sourceUrl(n)))return '연합뉴스';return '원문'}
function shortDate(iso){try{return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso))}catch(_){return ''}}
function installStyle(){if($('genNewsCompact354Style'))return;const s=document.createElement('style');s.id='genNewsCompact354Style';s.textContent=`
#newsBriefing{gap:6px!important;margin:10px 0 12px!important}
#newsBriefing .brief-row{grid-template-columns:24px minmax(0,1fr) auto!important;padding:9px 11px!important;align-items:center!important}
#newsBriefing .brief-row p{margin:0!important;min-width:0!important}
#newsBriefing .brief-row b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px!important}
#newsBriefing .brief-row small{display:none!important}
#newsBriefing .brief-row em{font-size:11px;font-style:normal;white-space:nowrap}
#newsList .news-item-main{min-width:0!important}
#newsList .news-item-main p{overflow-wrap:anywhere}
#newsList .news-item-main small{display:flex!important;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}
#newsList .news-source-link{color:#86b8ff;text-decoration:none;font-weight:800}
#newsList .news-source-link:hover{text-decoration:underline}
#newsList .news-source-date{color:var(--muted)}
#genNewsBoard{overflow:hidden}
@media(max-width:760px){#newsBriefing .brief-row b{white-space:normal}.news-source-date{font-size:11px}}
`;document.head.appendChild(s)}
function compactHeading(){const box=$('newsBriefing');if(!box)return;let p=box.parentElement;for(let i=0;i<3&&p;i++,p=p.parentElement){const h=[...p.querySelectorAll('h2,h3')].find(x=>/GEN 브리핑|뉴스 브리핑/.test(x.textContent||''));if(h){h.textContent='오늘의 TOP 5';break}}}
function cleanCards(){const rows=read(),map=new Map(rows.map(n=>[String(n.id),n]));document.querySelectorAll('#newsList .news-item[data-news-id]').forEach(card=>{const n=map.get(String(card.dataset.newsId));if(!n)return;const small=card.querySelector('.news-item-main small');if(!small)return;const url=sourceUrl(n),name=sourceName(n),date=shortDate(n.createdAt);small.innerHTML=url?`<a class="news-source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} 원문</a><span class="news-source-date">${esc(date)}</span>`:`<span>${esc(name)}</span><span class="news-source-date">${esc(date)}</span>`;});}
function apply(){installStyle();compactHeading();cleanCards()}
let scheduled=false;function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
function boot(){apply();const root=$('genNewsBoard');if(root)new MutationObserver(queue).observe(root,{childList:true,subtree:true});window.addEventListener('storage',e=>{if(e.key===NEWS_KEY)queue()});setInterval(apply,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();