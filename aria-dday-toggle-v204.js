(()=>{
'use strict';

const SUPABASE_URL=window.AI_OFFICE_CONFIG?.supabaseUrl||'';
const API_KEY=window.AI_OFFICE_CONFIG?.supabasePublishableKey||'';
let currentItemId='';
let bypassConfirm=false;

function getAccessToken(){
  try{
    const ref=new URL(SUPABASE_URL).hostname.split('.')[0];
    const raw=localStorage.getItem(`sb-${ref}-auth-token`);
    if(!raw)return '';
    const parsed=JSON.parse(raw);
    return parsed?.access_token||parsed?.currentSession?.access_token||'';
  }catch{return '';}
}

async function fetchDday(id){
  const token=getAccessToken();
  if(!id||!token||!SUPABASE_URL||!API_KEY)return false;
  const res=await fetch(`${SUPABASE_URL}/rest/v1/ai_office_items?id=eq.${encodeURIComponent(id)}&select=dday_enabled`,{
    headers:{apikey:API_KEY,Authorization:`Bearer ${token}`}
  });
  if(!res.ok)return false;
  const rows=await res.json();
  return !!rows?.[0]?.dday_enabled;
}

async function saveDday(id,enabled){
  const token=getAccessToken();
  if(!id||!token||!SUPABASE_URL||!API_KEY)return;
  const res=await fetch(`${SUPABASE_URL}/rest/v1/ai_office_items?id=eq.${encodeURIComponent(id)}`,{
    method:'PATCH',
    headers:{
      apikey:API_KEY,
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json',
      Prefer:'return=minimal'
    },
    body:JSON.stringify({dday_enabled:!!enabled,updated_at:new Date().toISOString()})
  });
  if(!res.ok)throw new Error('D-DAY 저장에 실패했습니다.');
}

async function injectToggle(){
  const grid=document.querySelector('.aria-edit-grid');
  if(!grid||!currentItemId||document.getElementById('ariaEditDday'))return;
  const label=document.createElement('label');
  label.className='wide aria-dday-toggle-row';
  label.innerHTML='<span>D-DAY</span><span style="display:flex;align-items:center;gap:8px"><input id="ariaEditDday" type="checkbox" style="width:auto"> 중요 일정으로 D-DAY에 표시</span>';
  grid.appendChild(label);
  try{document.getElementById('ariaEditDday').checked=await fetchDday(currentItemId);}catch{}
}

document.addEventListener('click',event=>{
  const edit=event.target.closest('[data-item-edit]');
  if(edit){
    currentItemId=edit.closest('.aria-card')?.dataset?.itemId||'';
    setTimeout(injectToggle,0);
    setTimeout(injectToggle,80);
    return;
  }

  const confirm=event.target.closest('[data-preview-confirm]');
  const checkbox=document.getElementById('ariaEditDday');
  if(!confirm||!checkbox||!currentItemId||bypassConfirm)return;

  event.preventDefault();
  event.stopImmediatePropagation();
  const enabled=checkbox.checked;
  (async()=>{
    try{
      await saveDday(currentItemId,enabled);
      bypassConfirm=true;
      confirm.click();
      bypassConfirm=false;
    }catch(err){
      bypassConfirm=false;
      alert(err?.message||String(err));
    }
  })();
},true);
})();
