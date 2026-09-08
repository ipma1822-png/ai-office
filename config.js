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

// AI OFFICE 3.5.8 · GEN NEWS workflow modules
(()=>{
  const modules=[
    './gen-news-v350.js?v=3.5.0',
    './gen-newsroom-v350.js?v=3.6.2',
    './gen-auto-draft-v351.js?v=3.5.6',
    './gen-auto-news-v352.js?v=3.5.3',
    './executive-clean-v353.js?v=3.5.3',
    './gen-news-compact-v354.js?v=3.5.4',
    './gen-news-desk-v355.js?v=3.5.5',
    './gen-factcheck-v357.js?v=3.5.7',
    './gn24-brand-lock-v358.js?v=3.6.2',
    './gn24-publish-bridge-v350.js?v=3.5.0'
  ];
  modules.forEach(src=>{
    const script=document.createElement('script');
    script.src=src;
    script.defer=true;
    document.head.appendChild(script);
  });
})();
