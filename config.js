window.AI_OFFICE_CONFIG = Object.freeze({
  version: "2.0.3",
  supabaseUrl: "https://ojxarsfaewehwjidwgac.supabase.co",
  supabasePublishableKey: "sb_publishable_ZoAZrV5rDmYDLxhXlnEXCw_lPqJfin0",
  adminAuthEmail: "class-admin@ipma.kr",
  timezone: "Asia/Seoul",
  channelPrefix: "ai-office-v1",
  commandTimeoutMs: 8000,
  sessionMaxAgeHours: 12
});

// AI OFFICE 3.6.5 · GEN NEWS workflow modules
(()=>{
  const modules=[
    {src:'./gen-news-v350.js?v=3.6.4'},
    {src:'./gen-newsroom-v350.js?v=3.6.7'},
    {src:'./gen-auto-draft-v351.js?v=3.5.6'},
    {src:'./gen-auto-news-v352.js?v=3.5.3'},
    {src:'./executive-clean-v353.js?v=3.6.6'},
    {src:'./gen-news-compact-v354.js?v=3.5.4'},
    {src:'./gen-news-desk-v355.js?v=3.5.5'},
    {src:'./gen-factcheck-v357.js?v=3.5.7'},
    {src:'./gn24-brand-lock-v358.js?v=3.6.2'},
    {id:'gn24PublishReceipt360Script',src:'./gn24-publish-receipt-v360.js?v=3.6.7'},
    {id:'systemVersion365Script',src:'./system-version-v365.js?v=3.6.6'},
    {src:'./gn24-publish-bridge-v350.js?v=3.6.7'}
  ];
  modules.forEach(({id,src})=>{
    if(id&&document.getElementById(id))return;
    const script=document.createElement('script');
    if(id)script.id=id;
    script.src=src;
    script.defer=true;
    document.head.appendChild(script);
  });
})();
