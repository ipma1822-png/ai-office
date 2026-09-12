import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.AI_OFFICE_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabasePublishableKey) {
  console.warn("[GLOBAL AUTH] Supabase config unavailable");
} else {
  const db = createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
    auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
  });
  const RETURN_URL = "https://ipma1822-png.github.io/ai-office/";
  const CONTROL_ID = "globalSuperadminKakaoLink";
  const OVERLAY_ID = "globalKakaoLoginGate";

  const remove = id => document.getElementById(id)?.remove();

  function cleanupLegacyAdminHubLinks() {
    document.querySelectorAll('a[href*="kmt-landing/admin-hub"]').forEach(link => {
      if (link.classList.contains("brand")) {
        link.href = "./";
        link.setAttribute("aria-label", "AI 사무국 홈");
      } else if ((link.textContent || "").includes("관리자 허브")) {
        link.remove();
      } else {
        link.href = "./";
      }
    });
  }

  function showLoginGate(message = "전총재님 전용 AI 사무국") {
    remove(OVERLAY_ID);
    remove(CONTROL_ID);
    const gate = document.createElement("div");
    gate.id = OVERLAY_ID;
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    Object.assign(gate.style, {
      position:"fixed", inset:"0", zIndex:"100000", display:"grid", placeItems:"center",
      padding:"24px", background:"rgba(2,8,23,.94)", backdropFilter:"blur(12px)"
    });
    gate.innerHTML = `<div style="width:min(420px,100%);padding:28px 22px;border:1px solid rgba(250,204,21,.25);border-radius:24px;background:#071225;color:#fff;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.42)">
      <div style="font-size:13px;font-weight:900;letter-spacing:.12em;color:#facc15">AI OFFICE</div>
      <h1 style="margin:10px 0 7px;font-size:27px;line-height:1.25">${message}</h1>
      <p style="margin:0 0 22px;color:#a9b4c7;font-size:14px;line-height:1.6">카카오 한 번으로 안전하게 들어갑니다.<br>로그인이 유지되면 다음부터 바로 AI 사무국이 열립니다.</p>
      <button type="button" id="globalKakaoLoginButton" style="width:100%;min-height:58px;border:0;border-radius:15px;background:#fee500;color:#191919;font-size:17px;font-weight:900;cursor:pointer">카카오로 AI 사무국 들어가기</button>
      <div id="globalKakaoLoginStatus" style="min-height:20px;margin-top:12px;color:#94a3b8;font-size:12px"></div>
    </div>`;
    document.body.appendChild(gate);
    gate.querySelector("#globalKakaoLoginButton").addEventListener("click", async e => {
      const button=e.currentTarget, status=gate.querySelector("#globalKakaoLoginStatus");
      button.disabled=true; button.textContent="카카오 연결 중…"; status.textContent="카카오 인증 화면을 여는 중입니다.";
      const { error } = await db.auth.signInWithOAuth({ provider:"kakao", options:{ redirectTo:RETURN_URL } });
      if (error) { button.disabled=false; button.textContent="카카오로 AI 사무국 들어가기"; status.textContent=error.message || "카카오 로그인을 시작하지 못했습니다."; }
    });
  }

  function showDeniedGate() {
    showLoginGate("관리자 계정 확인이 필요합니다");
    const status=document.getElementById("globalKakaoLoginStatus");
    if(status) status.textContent="현재 카카오 계정은 GLOBAL SUPERADMIN으로 연결되지 않았습니다.";
  }

  function renderLinkedBadge() {
    remove(CONTROL_ID); remove(OVERLAY_ID);
    const badge=document.createElement("div"); badge.id=CONTROL_ID; badge.textContent="SUPERADMIN · 카카오 연결됨";
    Object.assign(badge.style,{position:"fixed",right:"14px",bottom:"14px",zIndex:"9999",padding:"9px 12px",borderRadius:"999px",fontSize:"12px",fontWeight:"800",background:"rgba(15,23,42,.94)",color:"#facc15",border:"1px solid rgba(250,204,21,.35)",boxShadow:"0 10px 30px rgba(0,0,0,.22)"});
    document.body.appendChild(badge); setTimeout(()=>badge.remove(),4000);
  }

  function renderFirstLinkButton() {
    remove(CONTROL_ID); remove(OVERLAY_ID);
    const wrap=document.createElement("div"); wrap.id=CONTROL_ID;
    Object.assign(wrap.style,{position:"fixed",right:"14px",bottom:"14px",zIndex:"9999",maxWidth:"320px",padding:"12px",borderRadius:"16px",background:"rgba(15,23,42,.97)",color:"#fff",border:"1px solid rgba(250,204,21,.35)",boxShadow:"0 16px 40px rgba(0,0,0,.28)",fontSize:"12px",lineHeight:"1.45"});
    wrap.innerHTML=`<b style="display:block;margin-bottom:5px;color:#facc15">최초 1회 설정</b><span>현재 SUPERADMIN 계정에 전총재님의 카카오를 연결합니다. 이 작업이 끝나면 이후에는 카카오 버튼 하나만 사용합니다.</span><button type="button" style="width:100%;margin-top:9px;padding:11px 12px;border:0;border-radius:10px;background:#fee500;color:#191919;font-weight:900;cursor:pointer">내 카카오 계정 연결하기</button>`;
    const button=wrap.querySelector("button");
    button.addEventListener("click",async()=>{button.disabled=true;button.textContent="카카오 연결 중…";const {error}=await db.auth.linkIdentity({provider:"kakao",options:{redirectTo:RETURN_URL}});if(error){button.disabled=false;button.textContent="내 카카오 계정 연결하기";alert(`카카오 계정 연결을 시작하지 못했습니다.\n${error.message||error}`);}});
    document.body.appendChild(wrap);
  }

  async function syncAuth() {
    try {
      cleanupLegacyAdminHubLinks();
      const {data:{session}}=await db.auth.getSession();
      if(!session){showLoginGate();return;}
      const {data:isSuperadmin,error:roleError}=await db.rpc("spark_is_superadmin");
      if(roleError||isSuperadmin!==true){showDeniedGate();return;}
      const {data,error}=await db.auth.getUserIdentities();
      if(error){console.warn("[GLOBAL AUTH] identity check failed",error);return;}
      const hasKakao=(data?.identities||[]).some(identity=>identity.provider==="kakao");
      hasKakao?renderLinkedBadge():renderFirstLinkButton();
    } catch(error){console.warn("[GLOBAL AUTH] bootstrap failed",error);}
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>{cleanupLegacyAdminHubLinks();syncAuth();},{once:true}); else {cleanupLegacyAdminHubLinks();syncAuth();}
  db.auth.onAuthStateChange(()=>setTimeout(syncAuth,0));
}
