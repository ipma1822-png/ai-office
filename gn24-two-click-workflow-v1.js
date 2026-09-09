(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const read=()=>{try{const value=JSON.parse(localStorage.getItem(ARTICLE_KEY)||'[]');return Array.isArray(value)?value:[]}catch(_){return []}};
let clickOneRunning=false,clickTwoRunning=false,autosaveTimer=0;

function installStyle(){
  if($('gn24TwoClickStyle'))return;
  const style=document.createElement('style');
  style.id='gn24TwoClickStyle';
  style.textContent=`
    #genNewsroom350.two-click-ready #genAutoDraft351,
    #genNewsroom350.two-click-ready #nr350Form>.nr350-actions>.save,
    #genNewsroom350.two-click-ready #nr350Review,
    #genNewsroom350.two-click-ready #nr350Approval,
    #genNewsroom350.two-click-ready #nr350Preflight,
    #genNewsroom350.two-click-ready #genFactcheck357,
    #genNewsroom350.two-click-ready #nr350Guard,
    #genNewsroom350.two-click-ready #gn24PublishHandoff{display:none!important}
    #genNewsroom350.two-click-ready #nr350Final{display:block;width:100%;padding:14px 18px;font-size:15px}
    #genNewsroom350.two-click-ready .nr350-two-click-status{grid-column:1/-1;padding:11px 12px;border:1px solid rgba(94,162,255,.32);border-radius:11px;background:rgba(94,162,255,.07);color:#bdd8ff;font-size:12px}
    #genNewsroom350.two-click-ready .nr350-two-click-status.ok{border-color:rgba(85,217,139,.35);background:rgba(85,217,139,.08);color:#baf3d0}
    #genNewsroom350.two-click-ready .nr350-two-click-status.error{border-color:rgba(255,126,126,.38);background:rgba(255,126,126,.08);color:#ffb4b4}
  `;
  document.head.appendChild(style);
}

function status(message,type=''){
  let box=$('nr350TwoClickStatus');
  if(!box){
    box=document.createElement('div');
    box.id='nr350TwoClickStatus';
    box.className='nr350-two-click-status';
    const actions=document.querySelector('#nr350Form>.nr350-actions');
    actions?.insertAdjacentElement('beforebegin',box);
  }
  if(box){box.className='nr350-two-click-status'+(type?' '+type:'');box.textContent=message;}
  const state=$('nr350State');
  if(state)state.textContent=message;
}

function setBusy(button,busy,label){
  if(!button)return;
  if(busy){button.dataset.twoClickLabel=button.textContent;button.disabled=true;button.textContent=label;}
  else{button.disabled=false;button.textContent=button.dataset.twoClickLabel||button.textContent;delete button.dataset.twoClickLabel;}
}

async function waitFor(test,timeout=7000){
  const started=Date.now();
  while(Date.now()-started<timeout){const value=test();if(value)return value;await wait(80);}
  return null;
}

async function prepareArticle(newsId,button){
  if(clickOneRunning)return;
  clickOneRunning=true;
  setBusy(button,true,'GEN 기사 제작 중…');
  status('GEN 기사 제작 중…');
  try{
    const article=await waitFor(()=>read().find(item=>item.sourceNewsId===newsId));
    if(!article)throw new Error('승인된 기사 레코드를 찾지 못했습니다.');
    const draftButton=await waitFor(()=>document.querySelector(`#nr350Drafts [data-id="${CSS.escape(article.id)}"]`));
    if(!draftButton)throw new Error('기사 작업함에서 승인 기사를 열지 못했습니다.');
    draftButton.click();
    const autoDraft=await waitFor(()=>$('genAutoDraft351'));
    if(!autoDraft)throw new Error('기존 GEN 초안작성 기능을 준비하지 못했습니다.');
    autoDraft.click();
    await waitFor(()=>read().find(item=>item.id===article.id)?.body?.trim().length>80);
    let imagePrepared=false;
    if(window.GN24SmartArticleImage){
      status('기사 맞춤 대표이미지 생성 중…');
      try{await window.GN24SmartArticleImage.generateForArticle(article.id);imagePrepared=true}catch(error){console.error(error)}
    }
    $('nr350Review')?.click();
    $('nr350Approval')?.click();
    const ready=read().find(item=>item.id===article.id);
    if(!ready||ready.status!=='approval')throw new Error('최종 승인 대기 단계까지 연결하지 못했습니다.');
    status(imagePrepared?'기사·맞춤 대표이미지 준비 완료 · 최종 확인해 주세요.':'기사는 준비되었습니다 · 대표이미지는 확인 또는 재생성이 필요합니다.',imagePrepared?'ok':'error');
    $('genNewsroom350')?.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){
    status(`기사 자동준비 일부 단계를 완료하지 못했습니다. 기사 데이터는 보존되어 있습니다. ${error.message}`,'error');
  }finally{
    setBusy(button,false,'');
    clickOneRunning=false;
  }
}

function scheduleAutosave(){
  clearTimeout(autosaveTimer);
  autosaveTimer=setTimeout(()=>{
    const id=$('nr350Id')?.value;
    const article=read().find(item=>item.id===id);
    if(!article||article.status==='published')return;
    $('nr350Form')?.requestSubmit();
  },500);
}

async function finalPublish(button){
  if(clickTwoRunning)return;
  clickTwoRunning=true;
  setBusy(button,true,'발행 처리 중…');
  status('발행 처리 중…');
  try{
    const id=$('nr350Id')?.value;
    const current=read().find(item=>item.id===id);
    if(!current)throw new Error('선택한 기사 저장자료를 찾지 못했습니다.');
    if(current.status==='published'||window.AIOfficeGN24Ledger?.isPublishedArticle(current))throw new Error('이미 GLOBAL NEWS24에 발행 완료된 기사입니다.');
    $('nr350Form')?.requestSubmit();
    $('nr350Preflight')?.click();
    const result=$('nr350PreflightResult');
    if(!result||!result.textContent.startsWith('안전점검 통과'))throw new Error(result?.textContent||'전체 동선 안전점검을 완료하지 못했습니다.');
    $('nr350Approval')?.click();
    ['nr350CheckContent','nr350CheckSource','nr350CheckImage'].forEach(id=>{if($(id))$(id).checked=true;});
    $('nr350ConfirmFinal')?.click();
    const handoff=await waitFor(()=>{const target=$('gn24PublishHandoff');return target&&!target.disabled?target:null;});
    if(!handoff)throw new Error('발행대기 패키지는 보존되었지만 GN24 전달 화면을 열지 못했습니다.');
    status('최종 승인 완료 · GLOBAL NEWS24 발행 검토 화면으로 이동합니다.','ok');
    handoff.click();
  }catch(error){
    status(`발행을 중단했습니다. 기사 데이터는 보존되어 있습니다. ${error.message}`,'error');
    setBusy(button,false,'');
    clickTwoRunning=false;
  }
}

function install(){
  const board=$('genNewsroom350'),form=$('nr350Form'),newsList=$('newsList'),final=$('nr350Final');
  if(!board||!form||!newsList||!final)return;
  installStyle();
  board.classList.add('two-click-ready');
  if(!clickTwoRunning)final.textContent='GLOBAL NEWS24 최종 발행 승인';
  const current=read().find(item=>item.id===$('nr350Id')?.value);
  const published=current&&(current.status==='published'||window.AIOfficeGN24Ledger?.isPublishedArticle(current));
  final.hidden=!current||current.status!=='approval'||published;
  if(!newsList.dataset.twoClickBound){
    newsList.dataset.twoClickBound='1';
    newsList.addEventListener('click',event=>{
      const button=event.target.closest('[data-news-approve]');
      const row=button?.closest('[data-news-id]');
      if(button&&row)setTimeout(()=>prepareArticle(row.dataset.newsId,button),0);
    });
  }
  if(!form.dataset.twoClickAutosave){
    form.dataset.twoClickAutosave='1';
    form.addEventListener('input',event=>{if(event.target.matches('input:not([type=hidden]),textarea'))scheduleAutosave();});
    form.addEventListener('change',scheduleAutosave);
  }
  if(!final.dataset.twoClickBound){
    final.dataset.twoClickBound='1';
    final.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();finalPublish(final);},true);
  }
  if(!$('nr350TwoClickStatus'))status('2-CLICK NEWSROOM · 기사 내용을 확인한 뒤 최종 발행 승인만 눌러주세요.');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setInterval(install,300),{once:true});
else setInterval(install,300);
})();
