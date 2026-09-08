(()=>{
'use strict';
const HIDE_TEXT=[
  '전략 · 기획 · 조직 · 일정 · 업무 · 프로젝트',
  '뉴스 · 기사 · 콘텐츠 · 이미지 · 홍보 · SNS · 미디어 업무를 담당하는 AI 사무국장 영역입니다.',
  '말해도, 눌러도 같은 ACTION',
  '버튼과 음성은 동일한 ACTION ID 사용',
  '9차 안전 원칙',
  '※ TASK와 PROJECT는 AI OFFICE 전용 localStorage에만 저장됩니다.',
  'GEN 3.5.0 승인 흐름',
  'v1.4.0 · SAFE NEWS DESK',
  'DISPLAY READY · v1.4.0'
];
function norm(s){return String(s||'').replace(/\s+/g,' ').trim();}
function hideExactOrContaining(text){
  [...document.querySelectorAll('p,small,span,div,b,strong,em,h1,h2,h3,h4')].forEach(el=>{
    const t=norm(el.textContent);
    if(!t)return;
    if(t===text||t.includes(text)){
      if(t.length<320)el.style.display='none';
    }
  });
}
function hideVoiceSection(){
  const heads=[...document.querySelectorAll('h1,h2,h3,h4')].filter(el=>norm(el.textContent).includes('말해도, 눌러도 같은 ACTION'));
  heads.forEach(h=>{
    let box=h.closest('section,article');
    if(!box){box=h.parentElement;}
    if(box&&norm(box.textContent).length<3500)box.style.display='none';
  });
}
function hideVersionNoise(){
  [...document.querySelectorAll('.version-chip,[class*="version"],[class*="build"]')].forEach(el=>{
    const t=norm(el.textContent);
    if(/v\d|ARIA MEMORY|PHASE/i.test(t)&&t.length<100)el.style.display='none';
  });
}
function polish(){
  HIDE_TEXT.forEach(hideExactOrContaining);
  hideVoiceSection();
  hideVersionNoise();
  const newsBoard=document.getElementById('genNewsBoard');
  if(newsBoard){
    [...newsBoard.querySelectorAll('p,small,span,div')].forEach(el=>{
      const t=norm(el.textContent);
      if(t.startsWith('※ 현재는 직접 확인한 정보만 저장')||t.includes('로컬 브리핑함')||t.includes('사실 확인되지 않은 내용을 자동 생성하지 않습니다'))el.style.display='none';
    });
  }
  const style=document.getElementById('executiveClean353Style')||document.createElement('style');
  style.id='executiveClean353Style';
  style.textContent=`
    .topbar{box-shadow:0 8px 24px rgba(0,0,0,.18)}
    #genNewsBoard .gen-candidate-note{display:none!important}
    #genNewsBoard{margin-top:16px}
    .shell>section{scroll-margin-top:90px}
  `;
  if(!style.isConnected)document.head.appendChild(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{polish();setInterval(polish,1500)});else{polish();setInterval(polish,1500)}
})();