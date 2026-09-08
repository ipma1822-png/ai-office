(()=>{
'use strict';
const VERSION='3.6.5';
function install(){
  const top=document.querySelector('.top-actions');
  if(top&&!document.getElementById('systemVersion365')){
    const chip=document.createElement('span');
    chip.id='systemVersion365';
    chip.className='version-chip';
    chip.textContent='SYSTEM v'+VERSION;
    top.insertBefore(chip,top.firstChild);
  }
  const line=document.querySelector('.build-line em');
  if(line&&!line.dataset.systemVersion365){
    line.dataset.systemVersion365='1';
    if(!String(line.textContent||'').includes('SYSTEM v')) line.textContent='SYSTEM v'+VERSION+' · '+line.textContent;
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();