import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.AI_OFFICE_CONFIG;
window.ARIA_MEMORY_ACTIVE = true;
const db = createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
  auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
});
const SEOUL_TZ = "Asia/Seoul";
const $ = id => document.getElementById(id);
const state = { session: null, items: [], period: "today", pending: null };
const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

function seoulYmd(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SEOUL_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function ymdParts(ymd) { const [year, month, day] = ymd.split("-").map(Number); return { year, month, day }; }
function addDays(ymd, amount) {
  const { year, month, day } = ymdParts(ymd);
  const d = new Date(Date.UTC(year, month - 1, day + amount));
  return d.toISOString().slice(0, 10);
}
function mondayOf(ymd) {
  const { year, month, day } = ymdParts(ymd);
  const d = new Date(Date.UTC(year, month - 1, day));
  const offset = d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1;
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}
function monthEnd(ymd) {
  const { year, month } = ymdParts(ymd);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}
function toIso(ymd, time = "09:00") { return new Date(`${ymd}T${time}:00+09:00`).toISOString(); }
function localDateTime(iso) {
  if (!iso) return { date: "", time: "" };
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: SEOUL_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso));
  const get = t => parts.find(p => p.type === t)?.value || "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
function periodRange(period) {
  const today = seoulYmd();
  if (period === "today") return [today, today];
  if (period === "week") { const start = mondayOf(today); return [start, addDays(start, 6)]; }
  if (period === "month") return [today.slice(0, 8) + "01", monthEnd(today)];
  return [null, null];
}
function itemDate(item) { return item.start_at ? localDateTime(item.start_at).date : ""; }
function isTask(item) { return item.type === "task" || item.type === "article_review"; }
function statusLabel(status) { return ({ planned:"예정", in_progress:"진행", done:"완료", cancelled:"취소" })[status] || status; }
function typeLabel(type) { return ({ schedule:"일정", task:"업무", meeting:"회의", article_review:"기사 검토" })[type] || type; }
function setSync(message, kind = "") {
  const el = $("ariaSyncStatus"); el.textContent = message; el.className = `aria-sync ${kind}`.trim();
}
function showPreview(html) { const el = $("ariaPreview"); el.innerHTML = html; el.hidden = false; }
function closePreview() { state.pending = null; $("ariaPreview").hidden = true; $("ariaPreview").innerHTML = ""; }
function message(title, body) {
  showPreview(`<h3>${esc(title)}</h3><p>${esc(body)}</p><div class="aria-preview-actions"><button type="button" data-preview-close>닫기</button></div>`);
  bindPreview();
}

function parseDate(text) {
  const today = seoulYmd();
  if (/모레/.test(text)) return addDays(today, 2);
  if (/내일/.test(text)) return addDays(today, 1);
  if (/오늘/.test(text)) return today;
  const full = text.match(/(20\d{2})[년.\/-]\s*(\d{1,2})[월.\/-]\s*(\d{1,2})일?/);
  if (full) return `${full[1]}-${String(full[2]).padStart(2,"0")}-${String(full[3]).padStart(2,"0")}`;
  const md = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (md) {
    const current = ymdParts(today); let year = current.year;
    const candidate = `${year}-${String(md[1]).padStart(2,"0")}-${String(md[2]).padStart(2,"0")}`;
    if (candidate < today && Number(md[1]) < current.month) year += 1;
    return `${year}-${String(md[1]).padStart(2,"0")}-${String(md[2]).padStart(2,"0")}`;
  }
  if (/이번\s*주\s*(안|내)/.test(text)) return addDays(mondayOf(today), 6);
  return "";
}
function parseTime(text) {
  const match = text.match(/(오전|오후)?\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (!match) return "";
  let hour = Number(match[2]); const minute = Number(match[3] || 0);
  if (hour > 23 || minute > 59) return "";
  if (match[1] === "오후" && hour < 12) hour += 12;
  if (match[1] === "오전" && hour === 12) hour = 0;
  return `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
}
function parseLocation(text) {
  const match = text.match(/(?:오전|오후)?\s*\d{1,2}시(?:\s*\d{1,2}분)?\s+([^\s]+)에서/);
  return match ? match[1] : "";
}
function cleanTitle(text) {
  return text
    .replace(/(20\d{2})[년.\/-]\s*\d{1,2}[월.\/-]\s*\d{1,2}일?/g, "")
    .replace(/\d{1,2}월\s*\d{1,2}일/g, "").replace(/오늘|내일|모레|이번\s*주\s*(안|내)/g, "")
    .replace(/(오전|오후)?\s*\d{1,2}시(?:\s*\d{1,2}분)?/g, "").replace(/[^\s]+에서\s*/g, "")
    .replace(/등록해(?:줘)?|등록|추가해(?:줘)?|추가|일정|업무|할\s*일/g, "")
    .replace(/만나(?:기로)?|만남/g, "미팅").replace(/\s+/g, " ").trim();
}
function queryPeriod(text) {
  if (/이번\s*달/.test(text)) return "month";
  if (/이번\s*주/.test(text)) return "week";
  if (/전체/.test(text)) return "all";
  return "today";
}
function inferType(text, time) {
  if (/기사.*검토|기사\s*검토/.test(text)) return "article_review";
  if (/회의|미팅|만나|약속|행사/.test(text)) return /회의|미팅|만나/.test(text) ? "meeting" : "schedule";
  if (/업무|정리|검토|준비|완료|해야/.test(text) && !time) return "task";
  return "schedule";
}
function keywordScore(item, text) {
  const ignored = new Set(["오늘","내일","모레","일정","업무","완료","취소","바꿔","변경","해줘","등록"]);
  return text.replace(/[^가-힣A-Za-z0-9 ]/g," ").split(/\s+/).filter(x=>x.length>1&&!ignored.has(x))
    .reduce((score, token) => score + (item.title.includes(token) ? token.length : 0), 0);
}
function bestMatch(text) {
  return state.items.filter(x => !["done","cancelled"].includes(x.status))
    .map(item => ({ item, score: keywordScore(item, text) }))
    .sort((a,b) => b.score-a.score || new Date(a.item.start_at||0)-new Date(b.item.start_at||0))[0];
}

function interpret(text) {
  if (/(보여|알려|조회)/.test(text)) return { action:"query", period:queryPeriod(text) };
  if (/완료/.test(text)) {
    const found = bestMatch(text);
    return found?.score ? { action:"status", item:found.item, status:"done" } : { action:"error", reason:"완료할 업무를 찾지 못했습니다. 제목의 일부를 함께 입력해 주세요." };
  }
  if (/취소|삭제/.test(text)) {
    const found = bestMatch(text);
    return found?.score ? { action:"status", item:found.item, status:"cancelled" } : { action:"error", reason:"취소할 일정을 찾지 못했습니다. 제목의 일부를 함께 입력해 주세요." };
  }
  if (/바꿔|변경|수정/.test(text)) {
    const found = bestMatch(text);
    if (!found?.score) return { action:"error", reason:"수정할 일정을 찾지 못했습니다. 제목의 일부를 함께 입력해 주세요." };
    return { action:"edit", item:found.item, date:parseDate(text), time:parseTime(text) };
  }
  const date = parseDate(text); const time = parseTime(text); const type = inferType(text, time);
  const title = cleanTitle(text);
  if (!date) return { action:"error", reason:"날짜가 분명하지 않습니다. 오늘·내일 또는 9월 15일처럼 입력해 주세요." };
  if (!title) return { action:"error", reason:"일정이나 업무의 제목을 확인해 주세요." };
  if (!["task","article_review"].includes(type) && !time) return { action:"error", reason:"일정 시간이 분명하지 않습니다. 오전 10시 또는 오후 2시처럼 입력해 주세요." };
  const effectiveTime = time || "23:59";
  return { action:"create", draft:{ type, title, location:parseLocation(text), start_at:toIso(date,effectiveTime), status:"planned", priority:"normal", dday_enabled:/D-?DAY|디데이|중요/.test(text), source_text:text } };
}

function draftPreview(draft) {
  const dt = localDateTime(draft.start_at);
  state.pending = { action:"create", draft };
  showPreview(`<h3>다음 ${esc(typeLabel(draft.type))}으로 등록할까요?</h3>
    <div class="aria-preview-grid"><div><small>제목</small><b>${esc(draft.title)}</b></div><div><small>날짜</small><b>${esc(dt.date)}</b></div><div><small>시간</small><b>${draft.type==="task"?"마감 "+esc(dt.time):esc(dt.time)}</b></div><div><small>장소</small><b>${esc(draft.location||"-")}</b></div><div><small>종류</small><b>${esc(typeLabel(draft.type))}</b></div><div><small>상태</small><b>예정</b></div></div>
    <div class="aria-preview-actions"><button type="button" class="primary" data-preview-confirm>등록</button><button type="button" data-preview-edit>수정</button><button type="button" data-preview-close>취소</button></div>`);
  bindPreview();
}
function statusPreview(item, status) {
  state.pending = { action:"status", item, status };
  const verb = status === "done" ? "완료" : "취소";
  showPreview(`<h3>“${esc(item.title)}”을(를) ${verb}하시겠습니까?</h3><p>삭제하지 않고 상태를 <b>${verb}</b>로 변경해 기록을 보존합니다.</p><div class="aria-preview-actions"><button type="button" class="${status==="cancelled"?"danger":"primary"}" data-preview-confirm>${verb} 확정</button><button type="button" data-preview-close>돌아가기</button></div>`);
  bindPreview();
}
function editPreview(item, date = "", time = "") {
  const current = localDateTime(item.start_at);
  state.pending = { action:"edit", item };
  showPreview(`<h3>일정·업무 수정</h3><div class="aria-edit-grid">
    <label class="wide"><span>제목</span><input id="ariaEditTitle" value="${esc(item.title)}" maxlength="160"></label>
    <label><span>날짜</span><input id="ariaEditDate" type="date" value="${esc(date||current.date)}"></label>
    <label><span>시간</span><input id="ariaEditTime" type="time" value="${esc(time||current.time)}"></label>
    <label><span>종류</span><select id="ariaEditType"><option value="schedule">일정</option><option value="task">업무</option><option value="meeting">회의</option><option value="article_review">기사 검토</option></select></label>
    <label><span>장소</span><input id="ariaEditLocation" value="${esc(item.location||"")}" maxlength="120"></label>
    <label class="wide"><span>설명</span><textarea id="ariaEditDescription" rows="2" maxlength="1000">${esc(item.description||"")}</textarea></label>
    </div><div class="aria-preview-actions"><button type="button" class="primary" data-preview-confirm>수정 저장</button><button type="button" data-preview-close>취소</button></div>`);
  $("ariaEditType").value = item.type;
  bindPreview();
}
function bindPreview() {
  document.querySelector("[data-preview-close]")?.addEventListener("click", closePreview);
  document.querySelector("[data-preview-edit]")?.addEventListener("click", () => editPreview({...state.pending.draft, id:null}));
  document.querySelector("[data-preview-confirm]")?.addEventListener("click", commitPending);
}

async function logAction(item, action, sourceText = "") {
  const { error } = await db.from("ai_office_activity_log").insert({
    user_id:state.session.user.id, entity_type:item.type, entity_id:item.id, action,
    summary:`${item.title} · ${statusLabel(item.status)}`, source_text:sourceText || null
  });
  if (error) console.warn("ARIA activity log", error);
}
async function commitPending() {
  if (!state.session) return message("카카오 인증이 필요합니다", "MEMORY에 저장하려면 먼저 카카오로 인증해 주세요.");
  const pending = state.pending; if (!pending) return;
  const button = document.querySelector("[data-preview-confirm]"); if (button) button.disabled = true;
  try {
    if (pending.action === "create") {
      const payload = {...pending.draft, user_id:state.session.user.id};
      const { data, error } = await db.from("ai_office_items").insert(payload).select().single();
      if (error) throw error;
      await logAction(data, isTask(data) ? "task_created" : "schedule_created", data.source_text);
    } else if (pending.action === "status") {
      const { data, error } = await db.from("ai_office_items").update({status:pending.status,updated_at:new Date().toISOString()}).eq("id",pending.item.id).select().single();
      if (error) throw error;
      const action = pending.status === "done" ? (isTask(data) ? "task_completed" : "schedule_updated") : (isTask(data) ? "task_cancelled" : "schedule_cancelled");
      await logAction(data, action);
    } else if (pending.action === "edit") {
      const title = $("ariaEditTitle").value.trim(), date = $("ariaEditDate").value, time = $("ariaEditTime").value;
      if (!title || !date || !time) throw new Error("제목·날짜·시간을 모두 확인해 주세요.");
      const payload = { title, start_at:toIso(date,time), type:$("ariaEditType").value, location:$("ariaEditLocation").value.trim()||null, description:$("ariaEditDescription").value.trim()||null, updated_at:new Date().toISOString() };
      if (!pending.item.id) {
        const { data, error } = await db.from("ai_office_items").insert({...pending.item,...payload,user_id:state.session.user.id}).select().single();
        if (error) throw error;
        await logAction(data, isTask(data) ? "task_created" : "schedule_created", data.source_text);
      } else {
        const { data, error } = await db.from("ai_office_items").update(payload).eq("id",pending.item.id).select().single();
        if (error) throw error;
        await logAction(data, isTask(data) ? "task_updated" : "schedule_updated");
      }
    }
    closePreview(); $("ariaCommandInput").value = ""; await loadItems(); setSync("MEMORY 저장 완료", "connected");
  } catch (error) { message("저장하지 못했습니다", error.message || String(error)); }
}

async function loadItems() {
  if (!state.session) { state.items=[]; render(); return; }
  setSync("MEMORY 동기화 중");
  const { data, error } = await db.from("ai_office_items").select("*").order("start_at",{ascending:true});
  if (error) { setSync("MEMORY 연결 오류","error"); message("조회하지 못했습니다",error.message); return; }
  state.items = data || []; render(); setSync("Supabase MEMORY 연결", "connected");
}
function filteredItems() {
  const [start,end] = periodRange(state.period);
  if (!start) return state.items;
  return state.items.filter(item => { const d=itemDate(item); return d && d>=start && d<=end; });
}
function ddayText(item) {
  const today = seoulYmd(), date = itemDate(item);
  const a = Date.parse(today+"T00:00:00Z"), b = Date.parse(date+"T00:00:00Z");
  const days = Math.round((b-a)/86400000);
  return days>0?`D-${days}`:days===0?"D-DAY":`D+${Math.abs(days)}`;
}
function card(item, dday = false) {
  const dt=localDateTime(item.start_at); const inactive=["done","cancelled"].includes(item.status);
  return `<article class="aria-card ${esc(item.status)}" data-item-id="${esc(item.id)}"><div class="aria-card-time">${dday?ddayText(item):(isTask(item)&&dt.time==="23:59"?"마감":esc(dt.time))}</div><div class="aria-card-main"><b>${esc(item.title)}</b><small>${esc(dt.date)} · ${esc(typeLabel(item.type))}${item.location?" · "+esc(item.location):""} · ${esc(statusLabel(item.status))}</small></div><div class="aria-card-actions"><button type="button" data-item-edit>수정</button>${isTask(item)&&!inactive?'<button type="button" data-item-done>완료</button>':""}${!inactive?'<button type="button" data-item-cancel>취소</button>':""}</div></article>`;
}
function setList(id, items, dday=false) { $(id).innerHTML = items.length ? items.map(x=>card(x,dday)).join("") : '<p class="aria-empty">등록된 항목이 없습니다.</p>'; }
function render() {
  const today=seoulYmd(), active=state.items.filter(x=>!["done","cancelled"].includes(x.status));
  const todaySchedules=active.filter(x=>!isTask(x)&&itemDate(x)===today);
  const todayTasks=active.filter(x=>isTask(x)&&itemDate(x)===today);
  const overdue=active.filter(x=>isTask(x)&&itemDate(x)&&itemDate(x)<today);
  const ddays=active.filter(x=>x.dday_enabled&&itemDate(x)).sort((a,b)=>new Date(a.start_at)-new Date(b.start_at));
  $("ariaTodayCount").textContent=todaySchedules.length;
  $("ariaOpenTaskCount").textContent=active.filter(isTask).length;
  $("ariaDdayCount").textContent=ddays.length;
  const periodItems=filteredItems();
  if(state.period==="today"){
    setList("ariaScheduleList",todaySchedules); setList("ariaTaskList",todayTasks); setList("ariaOverdueList",overdue); setList("ariaDdayList",ddays,true);
    ["ariaTodayScheduleSection","ariaTodayTaskSection","ariaOverdueSection","ariaDdaySection"].forEach(id=>$(id).hidden=false);
    $("ariaEmpty").hidden=true;
  } else {
    setList("ariaScheduleList",periodItems.filter(x=>!isTask(x))); setList("ariaTaskList",periodItems.filter(isTask));
    $("ariaTodayScheduleSection").hidden=false; $("ariaTodayTaskSection").hidden=false; $("ariaOverdueSection").hidden=true; $("ariaDdaySection").hidden=true;
    $("ariaTodayScheduleSection").querySelector("h3").textContent=state.period==="week"?"이번 주 일정":state.period==="month"?"이번 달 일정":"전체 일정";
    $("ariaTodayTaskSection").querySelector("h3").textContent=state.period==="week"?"이번 주 업무":state.period==="month"?"이번 달 업무":"전체 업무";
  }
  document.querySelectorAll(".aria-card").forEach(el=>{
    const item=state.items.find(x=>x.id===el.dataset.itemId);
    el.querySelector("[data-item-edit]")?.addEventListener("click",()=>editPreview(item));
    el.querySelector("[data-item-done]")?.addEventListener("click",()=>statusPreview(item,"done"));
    el.querySelector("[data-item-cancel]")?.addEventListener("click",()=>statusPreview(item,"cancelled"));
  });
  const topToday = document.querySelector(".priority-strip article:nth-child(1) b");
  const topNext = document.querySelector(".priority-strip article:nth-child(2) b");
  const topDday = document.querySelector(".priority-strip article:nth-child(3) b");
  if(topToday) topToday.textContent=todaySchedules[0]?.title||todayTasks[0]?.title||"등록된 업무 없음";
  if(topNext) topNext.textContent=active.find(x=>itemDate(x)>=today)?.title||"예정 없음";
  if(topDday) topDday.textContent=ddays[0]?ddayText(ddays[0]):"없음";
  const legacyTimeline=document.querySelector(".schedule-summary .timeline");
  if(legacyTimeline){
    const upcoming=active.filter(x=>!isTask(x)&&itemDate(x)>=today).slice(0,4);
    legacyTimeline.innerHTML=upcoming.length?upcoming.map(x=>{const dt=localDateTime(x.start_at);return `<div class="timeline-item"><time>${esc(dt.date.slice(5).replace("-","."))}</time><span></span><p><b>${esc(x.title)}</b><small>${esc(x.location||typeLabel(x.type))}</small></p><em>${esc(statusLabel(x.status))}</em></div>`;}).join(""):'<p class="aria-empty">등록된 예정 일정이 없습니다.</p>';
  }
  const legacyDday=document.querySelector(".dday-summary");
  if(legacyDday){
    const first=ddays[0], dt=first?localDateTime(first.start_at):null;
    legacyDday.querySelector("#ddayLarge").textContent=first?ddayText(first):"없음";
    legacyDday.querySelector(".dday-title").textContent=first?first.title:"등록된 중요 일정 없음";
    legacyDday.querySelector(".dday-date b").textContent=dt?dt.date:"-";
    legacyDday.querySelector("#ddayState").textContent="Supabase MEMORY · Asia/Seoul";
  }
}

async function handleCommand(event) {
  event.preventDefault(); const text=$("ariaCommandInput").value.trim(); if(!text)return;
  if(!state.session)return message("카카오 인증이 필요합니다","MEMORY를 사용하려면 카카오로 인증해 주세요.");
  const result=interpret(text);
  if(result.action==="query"){
    state.period=result.period; document.querySelector(`[data-aria-period="${result.period}"]`)?.click();
    $("ariaMemory").scrollIntoView({behavior:"smooth",block:"start"}); message("조회했습니다",({today:"오늘",week:"이번 주",month:"이번 달",all:"전체"})[result.period]+" 일정과 업무입니다."); return;
  }
  if(result.action==="error")return message("조금 더 확인이 필요합니다",result.reason);
  if(result.action==="create")return draftPreview(result.draft);
  if(result.action==="status")return statusPreview(result.item,result.status);
  if(result.action==="edit")return editPreview(result.item,result.date,result.time);
}
async function signInWithKakao() {
  const button=$("ariaKakaoLoginButton"); button.disabled=true;
  const redirectTo=location.origin+location.pathname;
  const { error }=await db.auth.signInWithOAuth({provider:"kakao",options:{redirectTo}});
  if(error){button.disabled=false;message("카카오 인증을 시작하지 못했습니다",error.message);}
}
async function boot() {
  $("ariaCommandForm").addEventListener("submit",handleCommand);
  $("ariaKakaoLoginButton").addEventListener("click",signInWithKakao);
  document.querySelectorAll("[data-aria-period]").forEach(button=>button.addEventListener("click",()=>{
    state.period=button.dataset.ariaPeriod;
    document.querySelectorAll("[data-aria-period]").forEach(x=>x.classList.toggle("active",x===button)); render();
  }));
  const { data:{session}, error }=await db.auth.getSession();
  if(error){setSync("인증 확인 오류","error");$("ariaLogin").hidden=false;return;}
  state.session=session; $("ariaLogin").hidden=!!session;
  if(!session){setSync("카카오 인증 필요","error");render();return;}
  await loadItems();
  db.auth.onAuthStateChange((_event,next)=>{state.session=next;$("ariaLogin").hidden=!!next;next?loadItems():(state.items=[],render());});
}
boot();
