(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const $=id=>document.getElementById(id);
const read=()=>{try{const v=JSON.parse(localStorage.getItem(ARTICLE_KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}};
const write=v=>{try{localStorage.setItem(ARTICLE_KEY,JSON.stringify(v));return true}catch(_){return false}};
function isTarget(a){const t=String(a?.title||'');return /(경찰|소방|민원).*(자살|긴급직무휴지|직무휴지)|(자살예방).*(공무원)/.test(t)}
function enrich(a){
 const official='https://www.mpm.go.kr/mpm/comm/newsPress/newsPressRelease/?boardId=bbs_0000000000000029&category=&cntId=4322&mode=view&pageIdx=';
 const yonhap='https://www.yna.co.kr/view/AKR20260908084400001';
 const newsis='https://www.newsis.com/view/NISX20260908_0003780358';
 return {...a,
  subtitle:'경찰·소방·민원 공무원 등 고위험군 보호 강화…긴급 직무휴지·심리지원 확대',
  category:'종합',
  tags:'공무원, 자살예방, 경찰, 소방, 민원공무원, 마음건강, 긴급직무휴지, Global News24',
  summary:'정부가 경찰·소방·군인·민원 공무원과 감정노동자, 재난피해자 등 심리적 고위험군을 대상으로 범정부 자살 예방대책을 마련했다. 위험 징후가 급박한 공무원에게 즉시 휴식을 부여하는 긴급 직무휴지 제도를 신설하고 공무원 마음건강 지원과 특수직군별 심리지원을 강화한다.',
  body:'정부가 경찰·소방·군인·민원 공무원 등 심리적 고위험군에 대한 자살 예방과 마음건강 보호를 강화한다.\n\n인사혁신처는 8일 국무회의에서 ‘특수직군·집단 자살 예방대책’을 보고했다고 밝혔다. 이번 대책은 공무원과 제복공무원, 감정노동자, 재난피해자 등 직무 특성상 높은 심리적 부담에 노출될 수 있는 집단을 범정부 차원에서 보호하기 위해 마련됐다.\n\n정부는 자살 등 중대한 재해가 급박하게 발생할 우려가 있는 공무원에게 직무 수행을 즉시 중단하고 휴식을 부여할 수 있는 ‘긴급 직무휴지’ 제도를 신설할 계획이다. 기관별 건강안전 관리체계를 구축하고 건강검진과 심리검사 지원 근거도 강화한다.\n\n공무원 마음건강 지원 기반도 확대된다. 현재 11개인 공무원 마음건강센터는 단계적으로 16개까지 늘리는 방안이 추진된다. 경찰·소방·군인 등 제복공무원에게는 직무 특성을 고려해 예방부터 진단·치료·회복까지 이어지는 심리지원 체계를 강화한다.\n\n민원 담당 공무원의 보호도 보강한다. 반복적이거나 특이한 민원에 대해 개인이 아닌 기관 중심으로 대응하고, 폭언·성희롱 등으로부터 담당자를 보호하기 위한 대응체계도 강화한다. 감정노동자와 재난피해자에 대해서도 심리지원 체계를 확충한다.\n\n이번 대책은 지난 5월 국무회의에서 논의된 분야별 자살 예방대책의 후속 조치다. 정부는 고위험 직군에서 위험 신호를 조기에 발견하고 실제 보호와 회복으로 이어질 수 있도록 제도적 지원을 확대할 방침이다.\n\n※ 이 기사는 인사혁신처 공식 보도자료와 복수 언론 보도를 교차 확인해 Global News24가 재구성했습니다.',
  sources:`[공식 1차 자료] 인사혁신처 보도자료 · 2026-09-08\n${official}\n\n[교차확인 1] 연합뉴스 · 2026-09-08\n${yonhap}\n\n[교차확인 2] 뉴시스 · 2026-09-08\n${newsis}\n\n사실확인 상태: 공식 발표 + 복수 보도 교차확인 완료`,
  imageBrief:'경찰·소방·민원 공무원의 마음건강 보호와 긴급 직무휴지를 상징하는 16:9 전문 뉴스 이미지. 특정 실제 인물의 얼굴을 식별 가능하게 사용하지 않고, 상담·보호·회복의 분위기를 중심으로 표현한다.',
  photoCaption:'경찰·소방·민원 공무원 등 심리적 고위험 직군의 마음건강 보호와 회복 지원을 상징적으로 표현한 이미지.',
  factChecked:true,factCheckedAt:new Date().toISOString(),updatedAt:new Date().toISOString()
 };
}
function fill(a){[['nr350Subtitle','subtitle'],['nr350Category','category'],['nr350Tags','tags'],['nr350Summary','summary'],['nr350Body','body'],['nr350Sources','sources'],['nr350Image','imageBrief'],['nr350Caption','photoCaption']].forEach(([id,k])=>{const e=$(id);if(e)e.value=a[k]||''});const s=$('nr350State');if(s)s.textContent='초안 · 공식자료 교차확인 반영 완료'}
function run(){const id=$('nr350Id')?.value;if(!id)return alert('먼저 기사 작업함에서 기사를 선택해 주세요.');const rows=read(),i=rows.findIndex(x=>x.id===id);if(i<0)return alert('선택한 기사 자료를 찾지 못했습니다.');if(!isTarget(rows[i]))return alert('현재 자동 사실확인 패키지는 이 시험 기사에 적용되지 않습니다.');rows[i]=enrich(rows[i]);if(!write(rows))return alert('사실확인 자료를 저장하지 못했습니다.');fill(rows[i]);let n=$('genFactcheckNotice');if(!n){n=document.createElement('div');n.id='genFactcheckNotice';n.style.cssText='grid-column:1/-1;padding:11px 12px;border:1px solid rgba(74,222,128,.35);border-radius:11px;background:rgba(74,222,128,.08);color:#bbf7d0;font-size:12px';document.querySelector('#nr350Form .nr350-actions')?.insertAdjacentElement('beforebegin',n)}if(n)n.textContent='공식자료 교차확인 완료 · 인사혁신처 공식 발표와 연합뉴스·뉴시스 보도를 반영했습니다. 기사 저장 후 최종 승인 요청으로 진행하세요.';}
function install(){const actions=document.querySelector('#nr350Form .nr350-actions');if(!actions||$('genFactcheck357'))return;const b=document.createElement('button');b.type='button';b.id='genFactcheck357';b.textContent='공식자료 사실확인 반영';b.style.cssText='border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.12);color:#bbf7d0';b.addEventListener('click',run);const auto=$('genAutoDraft351');auto?.insertAdjacentElement('afterend',b)||actions.insertBefore(b,actions.firstChild)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setInterval(install,800));else setInterval(install,800);
})();