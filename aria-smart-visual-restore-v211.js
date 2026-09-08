(()=>{
'use strict';
const VERSION='2.1.1';
function mount(){
  const smart=document.getElementById('ariaSmartWorkspace');
  if(!smart||document.getElementById('aswVisualMain'))return;
  const main=document.createElement('section');
  main.id='aswVisualMain';
  main.className='asw-visual-main';
  main.innerHTML='<img src="./images/ai-office-main.png?v=2.1.1" alt="AI OFFICE 메인 이미지"><div class="asw-visual-caption"><b>AI OFFICE 2.0</b><span>ARIA · GEN SMART WORKSPACE</span></div>';
  smart.parentNode.insertBefore(main,smart);

  const ariaCard=smart.querySelector('.asw-aria');
  if(ariaCard){
    const visual=document.createElement('div');
    visual.id='aswAriaVisual';
    visual.className='asw-aria-visual';
    visual.innerHTML='<img src="./images/ariya-daily-briefing.png?v=2.1.1" alt="ARIA 업무 보고 이미지"><div class="asw-visual-caption"><b>ARIA DAILY BRIEFING</b><span>업무 보고 · 우선순위 · NEXT ACTION</span></div>';
    const head=ariaCard.querySelector('.asw-card-head');
    if(head) head.insertAdjacentElement('afterend',visual); else ariaCard.prepend(visual);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,120));
else setTimeout(mount,120);
setTimeout(mount,900);
window.AI_OFFICE_VISUAL_RESTORE_VERSION=VERSION;
})();
