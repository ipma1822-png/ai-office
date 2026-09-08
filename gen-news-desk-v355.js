(()=>{
'use strict';
const $=id=>document.getElementById(id);
function style(){if($('genNewsDesk355Style'))return;const s=document.createElement('style');s.id='genNewsDesk355Style';s.textContent=`
/* GEN NEWS DESK v3.5.5 · executive compact cards */
#genNewsBoard{padding:18px!important}
#newsList{gap:8px!important;margin-top:10px!important}
#newsList .news-item{grid-template-columns:58px minmax(0,1fr) auto!important;gap:12px!important;padding:12px 13px!important;border-radius:14px!important;min-height:0!important}
#newsList .news-priority{padding:7px 5px!important;font-size:13px!important}
#newsList .news-item-main b{font-size:14px!important;line-height:1.35!important}
#newsList .news-item-main p{margin:5px 0!important;font-size:13px!important;line-height:1.45!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#newsList .news-item-main span{margin-top:3px!important}
#newsList .news-item-main small{margin-top:3px!important;font-size:10px!important}
#newsList .news-item-actions{gap:5px!important;flex-wrap:nowrap!important;align-items:center!important}
#newsList .news-item-actions button{padding:7px 9px!important;font-size:12px!important;white-space:nowrap!important}
#newsList .news-item-actions .approve{padding:8px 11px!important}
#newsList .news-source-link{font-size:10px!important}
#newsList .news-source-date{font-size:10px!important}
#newsList .news-status{font-size:9px!important;padding:2px 6px!important}
#newsList .news-item[data-news-status="excluded"]{opacity:.55}
@media(max-width:980px){#newsList .news-item{grid-template-columns:52px minmax(0,1fr)!important}#newsList .news-item-actions{grid-column:2;justify-content:flex-start!important;flex-wrap:wrap!important}}
@media(max-width:760px){#genNewsBoard{padding:13px!important}#newsList .news-item{grid-template-columns:1fr!important;padding:12px!important}#newsList .news-priority{width:max-content;min-width:52px}#newsList .news-item-actions{grid-column:1!important}#newsList .news-item-main p{-webkit-line-clamp:3}}
`;document.head.appendChild(s)}
function mark(){document.querySelectorAll('#newsList .news-item[data-news-id]').forEach(card=>{const st=card.querySelector('.news-status');if(st)card.dataset.newsStatus=st.classList.contains('excluded')?'excluded':st.classList.contains('approved')?'approved':st.classList.contains('hold')?'hold':'candidate';});}
function apply(){style();mark()}
function boot(){apply();const root=$('genNewsBoard');if(root)new MutationObserver(()=>requestAnimationFrame(apply)).observe(root,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();