(()=>{
'use strict';
const VERSION='2.1.2';
function mount(){
  const smart=document.getElementById('ariaSmartWorkspace');
  if(!smart)return;

  let main=document.getElementById('aswVisualMain');
  if(!main){
    main=document.createElement('section');
    main.id='aswVisualMain';
    main.className='asw-visual-main';
    main.innerHTML='<img src="./images/ai-office-main.png?v=2.1.2" alt="AI OFFICE 메인 이미지"><div class="asw-visual-caption"><b>AI OFFICE 2.0</b><span>ARIA · GEN SMART WORKSPACE</span></div>';
  }
  main.classList.remove('aria-smart-hidden','asw-detail-target');
  if(main.parentNode!==smart){
    smart.insertBefore(main,smart.firstChild);
  }else if(smart.firstChild!==main){
    smart.insertBefore(main,smart.firstChild);
  }

  const ariaCard=smart.querySelector('.asw-aria');
  if(ariaCard){
    let visual=document.getElementById('aswAriaVisual');
    if(!visual){
      visual=document.createElement('div');
      visual.id='aswAriaVisual';
      visual.className='asw-aria-visual';
      visual.innerHTML='<img src="./images/ariya-daily-briefing.png?v=2.1.2" alt="ARIA 업무 보고 이미지"><div class="asw-visual-caption"><b>ARIA DAILY BRIEFING</b><span>업무 보고 · 우선순위 · NEXT ACTION</span></div>';
    }
    visual.classList.remove('aria-smart-hidden');
    const head=ariaCard.querySelector('.asw-card-head');
    if(visual.parentNode!==ariaCard){
      if(head) head.insertAdjacentElement('afterend',visual); else ariaCard.prepend(visual);
    }
  }
}

function keepStable(){
  const smart=document.getElementById('ariaSmartWorkspace');
  const main=document.getElementById('aswVisualMain');
  const aria=document.getElementById('aswAriaVisual');
  if(smart&&main){
    main.classList.remove('aria-smart-hidden');
    if(main.parentNode!==smart||smart.firstChild!==main) smart.insertBefore(main,smart.firstChild);
  }
  if(aria) aria.classList.remove('aria-smart-hidden');
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,120));
else setTimeout(mount,120);
setTimeout(mount,1100);
setTimeout(keepStable,1800);
window.addEventListener('pageshow',()=>setTimeout(mount,60));
window.AI_OFFICE_VISUAL_RESTORE_VERSION=VERSION;
})();
