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
#newsList [data-article-text-copy]{border-color:rgba(231,191,99,.58)!important;background:rgba(231,191,99,.14)!important;color:var(--gold2)!important;pointer-events:auto!important;cursor:pointer!important}
#genNewsBoard{overflow:hidden}
@media(max-width:760px){#newsBriefing .brief-row b{white-space:normal}.news-source-date{font-size:11px}}
`;document.head.appendChild(s)}
function compactHeading(){const box=$('newsBriefing');if(!box)return;let p=box.parentElement;for(let i=0;i<3&&p;i++,p=p.parentElement){const h=[...p.querySelectorAll('h2,h3')].find(x=>/GEN 브리핑|뉴스 브리핑/.test(x.textContent||''));if(h){h.textContent='오늘의 TOP 5';break}}}
function articleTextMaterial(n){const url=sourceUrl(n);return ['[GN24 기사 원고 제작 · v1.3]','제목: '+(n?.title||''),'현재 GEN 분야: '+(n?.category||'종합'),'출처: '+(n?.source||sourceName(n)||'출처 미입력'),'요약: '+(n?.summary||''),'원문 링크: '+(url||'없음'),'','요청: 이 자료와 원문 및 필요한 추가 출처를 확인하여 사실관계를 검증한 뒤 GLOBAL NEWS24용 독립기사로 재작성해줘. 이번 요청에서는 이미지 생성 도구를 절대 사용하지 말고 텍스트 기사 원고만 작성해줘.','반드시 아래 순서로 전부 출력해줘:','1. 제목','2. 부제목','3. 기사 요약','4. 본문 전체','5. GN24 추천 분류','6. 추천 태그','사용자가 그대로 복사해 GN24 기사 작성에 사용할 수 있도록 본문을 생략하거나 축약하지 마. 현재 GEN 분야는 참고값일 뿐이며 원문 내용에 따라 GN24 메뉴 기준 가장 적합한 최종 분류를 판단해줘.'].join('\n')}
async function copyText(btn,text){try{await navigator.clipboard.writeText(text);const old=btn.textContent;btn.textContent='복사 완료';setTimeout(()=>{if(btn.isConnected)btn.textContent=old},1400)}catch(_){window.prompt('아래 내용을 복사하세요.',text)}}
function cleanCards(){const rows=read(),map=new Map(rows.map(n=>[String(n.id),n]));document.querySelectorAll('#newsList .news-item[data-news-id]').forEach(card=>{const n=map.get(String(card.dataset.newsId));if(!n)return;const small=card.querySelector('.news-item-main small');if(small){const url=sourceUrl(n),name=sourceName(n),date=shortDate(n.createdAt);small.innerHTML=url?`<a class="news-source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} 원문</a><span class="news-source-date">${esc(date)}</span>`:`<span>${esc(name)}</span><span class="news-source-date">${esc(date)}</span>`}const actions=card.querySelector('.news-item-actions');if(!actions)return;actions.querySelectorAll('[data-image-request-copy],[data-caption-request-copy]').forEach(btn=>btn.remove());let articleBtn=actions.querySelector('[data-news-copy-article],[data-article-material-copy],[data-article-text-copy]');if(!articleBtn){articleBtn=document.createElement('button');articleBtn.type='button';const first=actions.querySelector('button,a');if(first)first.insertAdjacentElement('afterend',articleBtn);else actions.appendChild(articleBtn)}articleBtn.removeAttribute('data-news-copy-article');articleBtn.removeAttribute('data-article-material-copy');articleBtn.setAttribute('data-article-text-copy','');articleBtn.onclick=e=>{e.preventDefault();copyText(articleBtn,articleTextMaterial(n))};if(articleBtn.textContent!=='복사 완료')articleBtn.textContent='기사원고 복사 v1.3';})}
function apply(){installStyle();compactHeading();cleanCards()}
let scheduled=false;function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
function boot(){apply();const root=$('genNewsBoard');if(root)new MutationObserver(queue).observe(root,{childList:true,subtree:true});window.addEventListener('storage',e=>{if(e.key===NEWS_KEY)queue()});setInterval(apply,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
