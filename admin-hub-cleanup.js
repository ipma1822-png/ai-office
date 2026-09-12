(()=>{
  function cleanupAdminHub(){
    document.querySelectorAll('a[href*="kmt-landing/admin-hub/"]').forEach(link=>{
      if(link.classList.contains('brand')){
        link.setAttribute('href','./');
        link.setAttribute('aria-label','AI 사무국 홈');
        return;
      }
      if((link.textContent||'').includes('관리자 허브')) link.remove();
      else link.setAttribute('href','./');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cleanupAdminHub,{once:true});
  else cleanupAdminHub();
})();
