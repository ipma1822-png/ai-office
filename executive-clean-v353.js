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
function hideLegacySecretaryDutyBoard(){
  [...document.querySelectorAll('main.shell > section')].forEach(section=>{
    if(section.id==='ariaMemory'||section.id==='genNewsBoard'||section.classList.contains('main-hero-image'))return;
    const t=norm(section.textContent);
    const isDutyBoard=t.includes('아리아 · 젠 업무분장')||(
      t.includes('AI SECRETARY')&&
      t.includes('아리아 · 전략/운영 사무국장')&&
      t.includes('젠 · 뉴스/콘텐츠 사무국장')
    );
    if(isDutyBoard)section.style.setProperty('display','none','important');
  });
}
function hideVersionNoise(){
  [...document.querySelectorAll('.version-chip,[class*="version"],[class*="build"]')].forEach(el=>{
    if(el.id==='systemVersion365'){
      el.style.removeProperty('display');
      return;
    }
    const t=norm(el.textContent);
    if(/v\d|ARIA MEMORY|PHASE/i.test(t)&&t.length<100)el.style.display='none';
  });
}
function compactGenHeader(newsBoard){
  const head=newsBoard.querySelector('.section-head');
  const desc=head?.querySelector(':scope > p');
  if(desc&&norm(desc.textContent).includes('GEN이 검토할 뉴스 후보를 모아 중요도 순으로 보고합니다')){
    desc.style.setProperty('display','none','important');
  }
  const ids=['newsTotal','newsUrgent','newsHigh'];
  const stats=ids.map(id=>document.getElementById(id)).filter(el=>el&&newsBoard.contains(el));
  const boxes=stats.map(el=>el.parentElement).filter(Boolean);
  boxes.forEach(box=>{
    box.style.setProperty('display','inline-flex','important');
    box.style.setProperty('align-items','baseline','important');
    box.style.setProperty('gap','3px','important');
    box.style.setProperty('margin','0 16px 0 0','important');
    box.style.setProperty('width','auto','important');
  });
  if(boxes.length===3){
    const parent=boxes[0].parentElement;
    if(parent&&boxes.every(box=>box.parentElement===parent)){
      parent.style.setProperty('display','flex','important');
      parent.style.setProperty('align-items','center','important');
      parent.style.setProperty('flex-wrap','wrap','important');
      parent.style.setProperty('gap','4px 0','important');
      parent.style.setProperty('margin','6px 0 10px','important');
    }
  }
}
function polish(){
  HIDE_TEXT.forEach(hideExactOrContaining);
  hideVoiceSection();
  hideLegacySecretaryDutyBoard();
  hideVersionNoise();
  const newsBoard=document.getElementById('genNewsBoard');
  if(newsBoard){
    compactGenHeader(newsBoard);
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
    #genNewsBoard{margin-top:16px;padding:16px!important}
    #genNewsBoard>.section-head{margin-bottom:8px!important;gap:8px!important}
    #genNewsBoard>.section-head h2{margin-bottom:0!important}
    #genNewsBoard .gen-news-grid{gap:10px!important}
    #genNewsBoard #newsBriefing{margin:8px 0!important}
    #genNewsBoard #newsList{margin-top:8px!important}
    .shell>section{scroll-margin-top:90px}

    /* PINPOINT MAIN CLEANUP · keep hero/ARIA/GEN untouched */
    main.shell > .priority-strip,
    main.shell > .section-head,
    main.shell > .workspace-grid,
    main.shell > .period-board,
    main.shell > .schedule-board,
    main.shell > .dday-board,
    main.shell > .task-section,
    main.shell > .task-policy,
    main.shell > .project-section,
    main.shell > .meeting-section,
    main.shell > .detail-panel,
    main.shell > .secretary-strip{
      display:none!important;
    }

    #ariaMemory,
    .main-hero-image,
    #genNewsBoard{
      display:block;
    }

    /* PINPOINT ONLY: overdue tasks 3-column layout */
    #ariaOverdueSection .aria-list{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:10px!important;
    }
    #ariaOverdueSection .aria-card{
      grid-template-columns:64px minmax(0,1fr)!important;
      align-items:center!important;
    }
    #ariaOverdueSection .aria-card-actions{
      grid-column:1 / -1!important;
      justify-content:flex-start!important;
    }

    /* PINPOINT ONLY: D-DAY cards match overdue 3-column layout */
    #ariaDdaySection .aria-list{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:10px!important;
    }
    #ariaDdaySection .aria-card{
      grid-template-columns:64px minmax(0,1fr)!important;
      align-items:center!important;
    }
    #ariaDdaySection .aria-card-actions{
      grid-column:1 / -1!important;
      justify-content:flex-start!important;
    }

    @media(max-width:1100px){
      #ariaOverdueSection .aria-list,
      #ariaDdaySection .aria-list{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
    }
    @media(max-width:760px){
      #ariaOverdueSection .aria-list,
      #ariaDdaySection .aria-list{grid-template-columns:1fr!important;}
      #genNewsBoard{padding:13px!important}
    }
  `;
  if(!style.isConnected)document.head.appendChild(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{polish();setInterval(polish,1500)});else{polish();setInterval(polish,1500)}
})();