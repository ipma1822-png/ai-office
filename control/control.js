import{db,$,clean,escapeHtml,normalizeSpeech,sessionCode,loadCatalog,commandPayload,createPresentationChannel,presenceHasRole,sendBroadcast,requireSession}from"../shared/core.js";

const state={menus:[],contents:[],recent:[],channel:null,code:"",pending:new Map(),display:false,megaStack:[]};
let toastTimer;
function toast(text){clearTimeout(toastTimer);$("toast").textContent=text;$("toast").classList.add("show");toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2400)}
function makeButton(item){return `<button class="command-button" data-content="${item.id}"><b>${item.is_favorite?"★ ":""}${escapeHtml(item.button_label||item.title)}</b><small>${escapeHtml(item.title)}</small></button>`}
function menuChildren(id){return state.menus.filter(menu=>(menu.parent_id||null)===(id||null))}
function contentChildren(id){return state.contents.filter(content=>content.menu_id===id)}
function menuHasContent(id,seen=new Set()){if(seen.has(id))return false;seen.add(id);return contentChildren(id).length>0||menuChildren(id).some(menu=>menuHasContent(menu.id,seen))}
function menuTrailText(menuId){const names=[];const seen=new Set();let current=state.menus.find(menu=>menu.id===menuId);while(current&&!seen.has(current.id)){seen.add(current.id);names.push(current.title);current=state.menus.find(menu=>menu.id===current.parent_id)}return names.join(" ")}
function bindContentButtons(scope=document){scope.querySelectorAll("[data-content]").forEach(button=>button.onclick=()=>showContent(button.dataset.content,"touch"))}

const fallbackCatalog={
 menus:[
  {id:"c2ea801f-3d4f-4185-afb2-fba3e2d8f068",title:"HOME",parent_id:null,sort_order:1},
  {id:"b8a8dd86-cebe-4e34-9626-4c9deebc1a98",title:"전성권",parent_id:null,sort_order:10},
  {id:"b07d7293-514a-4306-bc94-98c345482b9d",title:"5개 단체",parent_id:null,sort_order:20},
  {id:"26be3fd9-35f0-4489-9a72-2a5c3a2c7724",title:"SPARK · 아이성장",parent_id:null,sort_order:30},
  {id:"376720c4-2790-4a3e-9398-601ea731872b",title:"좋은글 · 메시지",parent_id:null,sort_order:40},
  {id:"1b8da127-69d3-41a9-b8bc-b198677fab9d",title:"영상",parent_id:null,sort_order:50},
  {id:"6a7ccaa0-cb41-49d5-8da9-e7b7aed5934d",title:"홈페이지",parent_id:null,sort_order:60},
  {id:"94d74deb-b657-4728-85a1-11c28fdabbad",title:"세계태권검도연맹",parent_id:"b07d7293-514a-4306-bc94-98c345482b9d",sort_order:10},
  {id:"3aff0062-8bae-407e-90c2-82cb6d66c528",title:"국제경찰무도연합회",parent_id:"b07d7293-514a-4306-bc94-98c345482b9d",sort_order:20},
  {id:"7078389e-1956-4e5c-b396-c28c43d80a87",title:"국제드론순찰대",parent_id:"b07d7293-514a-4306-bc94-98c345482b9d",sort_order:30},
  {id:"fd660ecb-5ccb-457c-b070-43a553971a50",title:"Global News24",parent_id:"b07d7293-514a-4306-bc94-98c345482b9d",sort_order:40},
  {id:"fee7a0e6-0f4b-451e-8922-01ccc2b9eeb5",title:"ACTS Mission Alliance",parent_id:"b07d7293-514a-4306-bc94-98c345482b9d",sort_order:50},
  {id:"6a73b740-eb78-46e9-85f6-fe90ebb0c909",title:"노력",parent_id:"376720c4-2790-4a3e-9398-601ea731872b",sort_order:10},
  {id:"470e6141-01f7-4b1f-9253-474ce7465f00",title:"도전",parent_id:"376720c4-2790-4a3e-9398-601ea731872b",sort_order:20},
  {id:"696f76c2-7b38-45cd-967a-360d5c8a9578",title:"태권검도",parent_id:"1b8da127-69d3-41a9-b8bc-b198677fab9d",sort_order:10},
  {id:"f2f0e93e-b898-4926-b3c5-56ca99f95b7c",title:"호신술",parent_id:"1b8da127-69d3-41a9-b8bc-b198677fab9d",sort_order:20},
  {id:"d136300a-5138-4321-94dc-e905f172a8f9",title:"태권도 품새",parent_id:"1b8da127-69d3-41a9-b8bc-b198677fab9d",sort_order:30}
 ],
 contents:[
  {id:"17e17e94-d69a-430f-8fb0-e6c796506ad2",title:"AI 사무국 HOME",button_label:"HOME",menu_id:"c2ea801f-3d4f-4185-afb2-fba3e2d8f068",content_type:"HOME",source_url:"../media/01.png",is_favorite:true,sort_order:1},
  {id:"f9bc7672-9d1f-4ad3-927d-c01c7a932ffc",title:"5개 단체 한눈에 보기",button_label:"5개 단체",menu_id:"b07d7293-514a-4306-bc94-98c345482b9d",content_type:"IMAGE",source_url:"../media/06.png",is_favorite:true,sort_order:10},
  {id:"215151ef-bb7a-42cc-980e-172a8c847b4b",title:"SPARK 아이들의 현실 속 성장",button_label:"SPARK",menu_id:"26be3fd9-35f0-4489-9a72-2a5c3a2c7724",content_type:"IMAGE",source_url:"../media/12.png",is_favorite:true,sort_order:10},
  {id:"0d9fe54d-1275-4551-a093-3ad90cb7c3f0",title:"노력의 보상",button_label:"노력의 보상",menu_id:"6a73b740-eb78-46e9-85f6-fe90ebb0c909",content_type:"IMAGE",source_url:"../media/13.png",is_favorite:true,sort_order:10},
  {id:"af5b448e-5900-4366-86e4-a0055678db13",title:"전성권은 이런 일을 하고 있습니다",button_label:"내가 하는 일",menu_id:"b8a8dd86-cebe-4e34-9626-4c9deebc1a98",content_type:"IMAGE",source_url:"../media/02.png",is_favorite:true,sort_order:10},
  {id:"ffa534a9-c5dc-4cf5-9df7-6c44cc615bd3",title:"호신술 영상",button_label:"호신술",menu_id:"f2f0e93e-b898-4926-b3c5-56ca99f95b7c",content_type:"YOUTUBE",source_url:"https://youtu.be/0hnRgcgcAQ8",is_favorite:true,sort_order:10},
  {id:"f019b7a7-fead-4c94-b395-eb64f37a253f",title:"세계태권검도연맹",button_label:"한눈에 보기",menu_id:"94d74deb-b657-4728-85a1-11c28fdabbad",content_type:"IMAGE",source_url:"../media/07.png",is_favorite:true,sort_order:20},
  {id:"fd4412f0-4f73-4ccb-b381-947b4dd5ad87",title:"태권검도 영상",button_label:"태권검도 영상",menu_id:"696f76c2-7b38-45cd-967a-360d5c8a9578",content_type:"YOUTUBE",source_url:"https://youtu.be/65UpGpJtHA0",is_favorite:true,sort_order:20},
  {id:"bef96f6c-fb12-4dc5-9401-d43043222a2c",title:"국제경찰무도연합회",button_label:"한눈에 보기",menu_id:"3aff0062-8bae-407e-90c2-82cb6d66c528",content_type:"IMAGE",source_url:"../media/08.png",is_favorite:true,sort_order:30},
  {id:"c1451358-2163-4200-b0aa-32a22423525c",title:"지금 만들고 있는 것들",button_label:"만들고 있는 것들",menu_id:"b8a8dd86-cebe-4e34-9626-4c9deebc1a98",content_type:"IMAGE",source_url:"../media/04-1.png",is_favorite:true,sort_order:30},
  {id:"73cb456f-ff4f-4575-b478-a3dc0d8344bd",title:"국제드론순찰대",button_label:"한눈에 보기",menu_id:"7078389e-1956-4e5c-b396-c28c43d80a87",content_type:"IMAGE",source_url:"../media/09.png",is_favorite:true,sort_order:40},
  {id:"667ebadf-a637-47cb-bfdd-cee8e0975e25",title:"Global News24",button_label:"한눈에 보기",menu_id:"fd660ecb-5ccb-457c-b070-43a553971a50",content_type:"IMAGE",source_url:"../media/10.png",is_favorite:true,sort_order:50},
  {id:"788105f5-a662-49d6-8307-a8bd4a2c40ac",title:"숫자로 보는 전성권의 현재",button_label:"주요 숫자",menu_id:"b8a8dd86-cebe-4e34-9626-4c9deebc1a98",content_type:"IMAGE",source_url:"../media/05.png",is_favorite:true,sort_order:50},
  {id:"a5a4b9ee-4ed0-4777-864b-8d81527ee6e6",title:"국제경찰무도연합회 홈페이지",button_label:"홈페이지",menu_id:"3aff0062-8bae-407e-90c2-82cb6d66c528",content_type:"WEB",source_url:"https://ipma.kr",is_favorite:false,sort_order:10},
  {id:"8a2a8ef9-3fa1-4482-bc55-8ff3966713d8",title:"국제드론순찰대 홈페이지",button_label:"홈페이지",menu_id:"7078389e-1956-4e5c-b396-c28c43d80a87",content_type:"WEB",source_url:"https://idp.ai.kr",is_favorite:false,sort_order:20},
  {id:"8ec37f9b-fb63-4db1-8900-dcb4bb6e6e8f",title:"성공과 도전",button_label:"성공과 도전",menu_id:"470e6141-01f7-4b1f-9253-474ce7465f00",content_type:"IMAGE",source_url:"../media/14.png",is_favorite:false,sort_order:20},
  {id:"b3859917-c7e9-44d9-abce-fed244c01b55",title:"전성권이 이 일을 하는 이유",button_label:"이 일을 하는 이유",menu_id:"b8a8dd86-cebe-4e34-9626-4c9deebc1a98",content_type:"IMAGE",source_url:"../media/03.png",is_favorite:false,sort_order:20},
  {id:"e48cb927-7b71-4d72-a8f8-0448f1a2f4b5",title:"Global News24 홈페이지",button_label:"홈페이지",menu_id:"fd660ecb-5ccb-457c-b070-43a553971a50",content_type:"WEB",source_url:"https://gn24.ai.kr",is_favorite:false,sort_order:30},
  {id:"300df5a3-8c1d-45b1-828b-0e0266b7570e",title:"태극1장",button_label:"태극1장",menu_id:"d136300a-5138-4321-94dc-e905f172a8f9",content_type:"YOUTUBE",source_url:"https://youtu.be/x4HFiyPCQC0",is_favorite:false,sort_order:30},
  {id:"b6fb07d6-b561-4d5c-9191-8792c888e37a",title:"ACTS Mission Alliance 홈페이지",button_label:"홈페이지",menu_id:"fee7a0e6-0f4b-451e-8922-01ccc2b9eeb5",content_type:"WEB",source_url:"https://acts.pe.kr",is_favorite:false,sort_order:40},
  {id:"893fa88c-79ae-44ee-8d25-ab7270b3ca0d",title:"왜 이 일을 하는가",button_label:"왜 하는가",menu_id:"b8a8dd86-cebe-4e34-9626-4c9deebc1a98",content_type:"IMAGE",source_url:"../media/04.png",is_favorite:false,sort_order:40}
 ]
};

function sortCatalog(catalog){return {menus:[...(catalog.menus||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)||String(a.title).localeCompare(String(b.title),'ko')),contents:[...(catalog.contents||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)||String(a.title).localeCompare(String(b.title),'ko'))}}
function useCatalog(catalog){const sorted=sortCatalog(catalog);state.menus=sorted.menus;state.contents=sorted.contents;renderHome();if(state.megaStack.length)renderMega()}

function renderHome(){
  $("favorites").innerHTML=state.contents.filter(content=>content.is_favorite).slice(0,8).map(makeButton).join("")||'<div class="empty">즐겨찾기가 없습니다.</div>';
  const roots=menuChildren(null).filter(menu=>menuHasContent(menu.id));
  $("megaRoots").innerHTML=roots.map(menu=>`<button class="mega-root-button" data-menu="${menu.id}">${escapeHtml(menu.title)}</button>`).join("")||'<div class="empty">등록된 메뉴가 없습니다.</div>';
  $("megaRoots").querySelectorAll("[data-menu]").forEach(button=>button.onclick=()=>openMega(button.dataset.menu));
  bindContentButtons($("favorites"));
  renderSearch($("searchInput").value);
}
function renderSearch(value){const q=clean(value).toLowerCase();$("searchSection").hidden=!q;if(!q){$("searchResults").innerHTML="";return}const matches=state.contents.filter(content=>[content.title,content.button_label,content.voice_command,...(content.voice_aliases||[]),...(content.keywords||[]),menuTrailText(content.menu_id)].join(" ").toLowerCase().includes(q));$("searchResults").innerHTML=matches.map(makeButton).join("")||'<div class="empty">검색 결과가 없습니다.</div>';bindContentButtons($("searchResults"))}
function openMega(menuId){state.megaStack=[menuId];$("megaOverlay").classList.add("open");$("megaOverlay").setAttribute("aria-hidden","false");document.body.classList.add("mega-open");renderMega()}
function closeMega(){$("megaOverlay").classList.remove("open","backing");$("megaOverlay").setAttribute("aria-hidden","true");document.body.classList.remove("mega-open");state.megaStack=[]}
function enterMega(menuId){state.megaStack.push(menuId);renderMega()}
function backMega(){if(state.megaStack.length<=1){closeMega();return}state.megaStack.pop();$("megaOverlay").classList.remove("backing");void $("megaOverlay").offsetWidth;$("megaOverlay").classList.add("backing");renderMega()}
function renderMega(){const currentId=state.megaStack.at(-1);const menu=state.menus.find(item=>item.id===currentId);if(!menu){closeMega();return}$("megaTitle").textContent=menu.title;$("megaBack").hidden=false;$("megaBack").textContent=state.megaStack.length<=1?"← 홈":"← 뒤로";const childMenus=menuChildren(menu.id).filter(child=>menuHasContent(child.id));const contents=contentChildren(menu.id);$("megaBody").innerHTML=[...childMenus.map(child=>`<button class="mega-item menu-item" data-submenu="${child.id}">${escapeHtml(child.title)}</button>`),...contents.map(content=>`<button class="mega-item content-item" data-content="${content.id}">${escapeHtml(content.button_label||content.title)}</button>`)].join("")||'<div class="mega-empty">현재 등록된 자료가 없습니다.</div>';$("megaBody").querySelectorAll("[data-submenu]").forEach(button=>button.onclick=()=>enterMega(button.dataset.submenu));bindContentButtons($("megaBody"))}
async function showContent(id,source){const item=state.contents.find(c=>c.id===id);if(!item)return;if(!state.display){toast("⚠ DISPLAY 연결을 확인하세요");return}const payload=commandPayload(item,source);state.pending.set(payload.id,setTimeout(()=>{state.pending.delete(payload.id);toast("⚠ 화면 연결을 확인하세요")},AI_OFFICE_CONFIG.commandTimeoutMs));toast("전송 중…");await sendBroadcast(state.channel,"command",payload);state.recent=[id,...state.recent.filter(x=>x!==id)].slice(0,8);localStorage.setItem("aiOfficeRecent",JSON.stringify(state.recent))}
function connect(code){if(state.channel)db.removeChannel(state.channel);state.code=code;localStorage.setItem("aiOfficeSessionCode",code);$("codeTitle").textContent=`연결코드 · ${code}`;$("sessionText").textContent=`SESSION ${code}`;state.channel=createPresentationChannel(code,"control",{presence:p=>{state.display=presenceHasRole(p,"display");$("displayDot").classList.toggle("on",state.display);$("displayStatus").textContent=state.display?"DISPLAY 연결됨":"DISPLAY 연결 대기"},ack:p=>{const timer=state.pending.get(p.commandId);if(timer){clearTimeout(timer);state.pending.delete(p.commandId)}const verify=$("actionSendVerify");if(verify&&p.message)verify.textContent=`DISPLAY 응답 · ${p.message}`;toast(p.ok?`✓ ${p.message||"표시 완료"}`:`⚠ ${p.message||"표시 실패"}`)}})}
const office2Actions=[["aria:today","오늘 업무"],["aria:week","이번 주"],["aria:month","이번 달"],["aria:schedule","일정·D-DAY"],["aria:task","업무"],["aria:project","PROJECT"],["aria:meeting","회의 준비"],["aria:meeting-agenda","회의 안건"],["aria:meeting-check","준비 체크"],["aria:meeting-brief","회의 브리핑"],["aria:meeting-result","회의 결과"],["aria:followup","후속 업무"],["aria:followup-check","후속 점검"],["aria:task-proposal","업무 제안"],["aria:task-approval","업무 승인"],["gen:news","뉴스 브리핑"],["gen:article","기사 준비"],["gen:library","자료 보기"],["gen:media","미디어"]];
async function showOffice2Action(actionId,source="touch"){if(!state.display){toast("⚠ DISPLAY 연결을 확인하세요");return}const payload={id:crypto.randomUUID(),type:"AI_OFFICE_ACTION",actionId,source,payload:{agent:actionId.split(":")[0],action:actionId.slice(actionId.indexOf(":")+1)},sentAt:new Date().toISOString(),version:"1.10.0"};const verify=$("actionSendVerify");if(verify)verify.textContent=`송신 ACTION · ${actionId}`;state.pending.set(payload.id,setTimeout(()=>{state.pending.delete(payload.id);toast("⚠ 화면 연결을 확인하세요")},AI_OFFICE_CONFIG.commandTimeoutMs));toast(`${actionId} 전송 중…`);await sendBroadcast(state.channel,"command",payload)}
function renderOffice2Actions(){const box=$("office2Actions");if(!box)return;box.innerHTML=office2Actions.map(([id,label])=>`<button class="office2-action" data-office2-action="${id}">${label}</button>`).join("");box.onclick=e=>{const btn=e.target.closest("[data-office2-action]");if(btn)showOffice2Action(btn.dataset.office2Action,"touch")}}
function startVoice(){const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition){toast("이 브라우저는 음성인식을 지원하지 않습니다.");return}const r=new SpeechRecognition();r.lang="ko-KR";r.interimResults=false;r.maxAlternatives=3;$("ptt").classList.add("listening");$("ptt").querySelector("span").textContent="듣고 있습니다";r.onresult=e=>{const phrases=Array.from(e.results[0]).map(x=>x.transcript);const normalized=phrases.map(normalizeSpeech);const match=state.contents.find(c=>[c.voice_command,...(c.voice_aliases||[]),c.title,c.button_label].filter(Boolean).some(a=>normalized.some(p=>p.includes(normalizeSpeech(a))||normalizeSpeech(a).includes(p))));if(match){toast(`“${phrases[0]}” → ${match.title}`);showContent(match.id,"voice")}else toast(`명령을 찾지 못했습니다: ${phrases[0]}`)};r.onerror=()=>toast("음성을 인식하지 못했습니다.");r.onend=()=>{$("ptt").classList.remove("listening");$("ptt").querySelector("span").textContent="눌러서 말하기"};r.start()}
async function refreshCatalog(){useCatalog(await loadCatalog())}
async function boot(){if(!await requireSession("../",true))return;renderOffice2Actions();state.recent=JSON.parse(localStorage.getItem("aiOfficeRecent")||"[]");useCatalog(fallbackCatalog);try{await refreshCatalog()}catch(e){console.warn("AI OFFICE catalog unavailable; restored legacy presentation catalog",e);toast("기존 바로보기·메가메뉴를 복구했습니다.")}connect(localStorage.getItem("aiOfficeSessionCode")||sessionCode());db.channel("ai-office-catalog-control").on("postgres_changes",{event:"*",schema:"public",table:"ai_office_menus"},()=>refreshCatalog().catch(()=>{})).on("postgres_changes",{event:"*",schema:"public",table:"ai_office_contents"},()=>refreshCatalog().catch(()=>{})).subscribe();$("searchInput").oninput=e=>renderSearch(e.target.value);$("clearSearch").onclick=()=>{$("searchInput").value="";renderSearch("");$("searchInput").focus()};$("newSession").onclick=()=>connect(sessionCode());$("ptt").onclick=startVoice;$("megaBack").onclick=backMega;$("megaClose").onclick=closeMega;$("megaOverlay").onclick=e=>{if(e.target===$("megaOverlay"))closeMega()};document.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.megaStack.length)closeMega()})}boot();
