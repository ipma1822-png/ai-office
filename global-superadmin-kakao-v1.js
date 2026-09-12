import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.AI_OFFICE_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabasePublishableKey) {
  console.warn("[GLOBAL AUTH] Supabase config unavailable");
} else {
  const db = createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
    auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
  });
  const RETURN_URL = "https://ipma1822-png.github.io/ai-office/";
  const OWNER_EMAIL = "jeonseongkweon@gmail.com";
  const CONTROL_ID = "globalSuperadminKakaoLink";
  const OVERLAY_ID = "globalKakaoLoginGate";
  const remove = id => document.getElementById(id)?.remove();

  function cleanupLegacyAdminHubLinks() {
    document.querySelectorAll('a[href*="kmt-landing/admin-hub"]').forEach(link => {
      if (link.classList.contains("brand")) { link.href = "./"; link.setAttribute("aria-label", "AI 사무국 홈"); }
      else if ((link.textContent || "").includes("관리자 허브")) link.remove();
      else link.href = "./";
    });
  }

  function showLoginGate(message = "전총재님 전용 AI 사무국", statusText = "") {
    remove(OVERLAY_ID); remove(CONTROL_ID);
    const gate = document.createElement("div");
    gate.id = OVERLAY_ID; gate.setAttribute("role", "dialog"); gate.setAttribute("aria-modal", "true");
    Object.assign(gate.style,{position:"fixed",inset:"0",zIndex:"100000",display:"grid",placeItems:"center",padding:"24px",background:"rgba(2,8,23,.94)",backdropFilter:"blur(12px)"});
    gate.innerHTML=`<div style="width:min(420px,100%);padding:28px 22px;border:1px solid rgba(250,204,21,.25);border-radius:24px;background:#071225;color:#fff;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.42)"><div style="font-size:13px;font-weight:900;letter-spacing:.12em;color:#facc15">AI OFFICE</div><h1 style="margin:10px 0 7px;font-size:27px;line-height:1.25">${message}</h1><p style="margin:0 0 22px;color:#a9b4c7;font-size:14px;line-height:1.6">카카오 한 번으로 안전하게 들어갑니다.<br>로그인이 유지되면 다음부터 바로 AI 사무국이 열립니다.</p><button type="button" id="globalKakaoLoginButton" style="width:100%;min-height:58px;border:0;border-radius:15px;background:#fee500;color:#191919;font-size:17px;font-weight:900;cursor:pointer">카카오로 AI 사무국 들어가기</button><div id="globalKakaoLoginStatus" style="min-height:20px;margin-top:12px;color:#94a3b8;font-size:12px">${statusText}</div></div>`;
    document.body.appendChild(gate);
    gate.querySelector("#globalKakaoLoginButton").addEventListener("click",async e=>{const button=e.currentTarget,status=gate.querySelector("#globalKakaoLoginStatus");button.disabled=true;button.textContent="카카오 연결 중…";status.textContent="카카오 인증 화면을 여는 중입니다.";const {error}=await db.auth.signInWithOAuth({provider:"kakao",options:{redirectTo:RETURN_URL}});if(error){button.disabled=false;button.textContent="카카오로 AI 사무국 들어가기";status.textContent=error.message||"카카오 로그인을 시작하지 못했습니다.";}});
  }

  function renderLinkedBadge() {
    remove(CONTROL_ID); remove(OVERLAY_ID);
    const badge=document.createElement("div");badge.id=CONTROL_ID;badge.textContent="SUPERADMIN · 카카오 로그인";
    Object.assign(badge.style,{position:"fixed",right:"14px",bottom:"14px",zIndex:"9999",padding:"9px 12px",borderRadius:"999px",fontSize:"12px",fontWeight:"800",background:"rgba(15,23,42,.94)",color:"#facc15",border:"1px solid rgba(250,204,21,.35)",boxShadow:"0 10px 30px rgba(0,0,0,.22)"});document.body.appendChild(badge);setTimeout(()=>badge.remove(),4000);
  }

  async function syncAuth(){
    try{
      cleanupLegacyAdminHubLinks();
      const {data:{session}}=await db.auth.getSession();
      if(!session){showLoginGate();return;}
      const email=(session.user?.email||"").trim().toLowerCase();
      const provider=session.user?.app_metadata?.provider||"";
      const providers=session.user?.app_metadata?.providers||[];
      const isKakao=provider==="kakao"||providers.includes("kakao");
      const isVerifiedOwnerKakao=isKakao&&email===OWNER_EMAIL;
      let isRoleSuperadmin=false;
      try{const {data,error}=await db.rpc("spark_is_superadmin");isRoleSuperadmin=!error&&data===true;}catch(_){isRoleSuperadmin=false;}
      if(isVerifiedOwnerKakao||isRoleSuperadmin){renderLinkedBadge();return;}
      showLoginGate("관리자 계정 확인이 필요합니다","현재 카카오 계정은 AI 사무국 관리자 계정과 일치하지 않습니다.");
    }catch(error){console.warn("[GLOBAL AUTH] bootstrap failed",error);showLoginGate("로그인을 다시 확인해 주세요");}
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{cleanupLegacyAdminHubLinks();syncAuth();},{once:true});else{cleanupLegacyAdminHubLinks();syncAuth();}
  db.auth.onAuthStateChange(()=>setTimeout(syncAuth,0));
}
