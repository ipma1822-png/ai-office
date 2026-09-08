(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1',QUEUE_KEY='ipma_ai_office_gn24_publish_queue_v1';
const LOGO='https://news24.ai.kr/assets/images/logos/gn24-showroom-logo.jpg';
const PROMPT_GUARD='NO TEXT. NO LETTERS. NO TYPOGRAPHY. NO CAPTION. NO HEADLINE. NO WATERMARK.';
const BRAND_SPEC_VERSION='GN24-IMAGE-BRAND-v1';
const IMAGE_URL_MODULE='./gn24-image-url-v359.js?v=3.5.9';
const FINAL_HOTFIX_MODULE='./gn24-final-approve-hotfix-v361.js?v=3.6.2';
const $=id=>document.getElementById(id);
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
function brandData(){return {brandLogoLocked:true,brandLogoUrl:LOGO,brandLogoPosition:'top-left',brandLogoScale:.18,brandLogoMargin:.03,brandLogoRule:'공식 원본 그대로 사용 · 재생성/변형 금지 · 기사 이미지 완성 후 좌측 상단 합성',imageWorkflow:'generate-clean-image-then-compose-official-logo',imageTextPolicy:'no-text',imagePromptGuard:PROMPT_GUARD,brandSpecVersion:BRAND_SPEC_VERSION}}
function enforceImageBrief(){const input=$('nr350Image');if(!input)return;const raw=String(input.value||'').trim();if(!raw)return;if(!raw.toUpperCase().includes('NO TEXT'))input.value=raw+'\n\n'+PROMPT_GUARD;}
function loadModule(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.head.appendChild(s)}
function loadImageUrlModule(){loadModule('gn24ImageUrl359Script',IMAGE_URL_MODULE)}
function loadFinalHotfix(){loadModule('gn24FinalApprove361Script',FINAL_HOTFIX_MODULE)}
function persist(){enforceImageBrief();const id=$('nr350Id')?.value;if(!id)return;const rows=read(ARTICLE_KEY,[]),i=rows.findIndex(x=>x.id===id);if(i<0)return;rows[i]={...rows[i],imageBrief:$('nr350Image')?.value.trim()||rows[i].imageBrief||'',...brandData(),updatedAt:new Date().toISOString()};write(ARTICLE_KEY,rows);setTimeout(()=>{const q=read(QUEUE_KEY,[]);let changed=false;q.forEach(x=>{if(x.articleId===id){Object.assign(x,brandData());x.imageBrief=$('nr350Image')?.value.trim()||x.imageBrief||'';changed=true}});if(changed)write(QUEUE_KEY,q)},80)}
function install(){loadImageUrlModule();loadFinalHotfix();const image=$('nr350Image');if(!image||$('gn24BrandLock358'))return;const label=image.closest('label');if(!label)return;const box=document.createElement('div');box.id='gn24BrandLock358';box.style.cssText='grid-column:1/-1;display:flex;gap:12px;align-items:center;padding:11px 12px;border:1px solid rgba(231,191,99,.35);border-radius:12px;background:rgba(231,191,99,.07);color:#f4d98f;font-size:12px';box.innerHTML=`<img src="${LOGO}" alt="Global News24 공식 로고" style="width:96px;height:64px;object-fit:contain;border-radius:8px;background:#000"><div><b style="display:block;margin-bottom:4px">GLOBAL NEWS24 공식 로고 절대 고정</b><span style="color:#b9c6d4">순수 이미지에는 글자·로고를 생성하지 않음 → 최종 발행 단계에서 이 공식 원본을 좌측 상단 18% 크기·3% 여백으로 합성 · 비율/색상/형태 변경 금지</span></div>`;label.insertAdjacentElement('afterend',box);['submit'].forEach(ev=>$('nr350Form')?.addEventListener(ev,persist,true));['nr350Review','nr350Approval','nr350Preflight','nr350Final','nr350ConfirmFinal'].forEach(id=>$(id)?.addEventListener('click',persist,true));persist()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setInterval(install,800));else setInterval(install,800);
})();
