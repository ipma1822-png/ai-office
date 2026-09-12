import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.AI_OFFICE_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabasePublishableKey) {
  console.warn("[GLOBAL AUTH] Supabase config unavailable");
} else {
  const db = createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
    auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
  });
  const RETURN_URL = "https://ipma1822-png.github.io/ai-office/";

  function removeControl() {
    document.getElementById("globalSuperadminKakaoLink")?.remove();
  }

  function renderLinkedBadge() {
    removeControl();
    const badge = document.createElement("div");
    badge.id = "globalSuperadminKakaoLink";
    badge.setAttribute("role", "status");
    badge.textContent = "SUPERADMIN · 카카오 연결됨";
    Object.assign(badge.style, {
      position: "fixed", right: "14px", bottom: "14px", zIndex: "9999",
      padding: "9px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "800",
      background: "rgba(15,23,42,.94)", color: "#facc15", border: "1px solid rgba(250,204,21,.35)",
      boxShadow: "0 10px 30px rgba(0,0,0,.22)"
    });
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 5000);
  }

  function renderLinkButton() {
    removeControl();
    const wrap = document.createElement("div");
    wrap.id = "globalSuperadminKakaoLink";
    Object.assign(wrap.style, {
      position: "fixed", right: "14px", bottom: "14px", zIndex: "9999",
      maxWidth: "320px", padding: "12px", borderRadius: "16px",
      background: "rgba(15,23,42,.97)", color: "#fff", border: "1px solid rgba(250,204,21,.35)",
      boxShadow: "0 16px 40px rgba(0,0,0,.28)", fontSize: "12px", lineHeight: "1.45"
    });
    wrap.innerHTML = `<b style="display:block;margin-bottom:5px;color:#facc15">GLOBAL SUPERADMIN</b><span>현재 관리자 계정에 카카오 로그인을 1회 연결합니다. 연결 후에는 같은 SUPERADMIN 계정으로 카카오 로그인을 사용할 수 있습니다.</span><button type="button" style="width:100%;margin-top:9px;padding:10px 12px;border:0;border-radius:10px;background:#fee500;color:#191919;font-weight:900;cursor:pointer">카카오 관리자 계정 연결</button>`;
    const button = wrap.querySelector("button");
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "카카오 연결 중…";
      const { error } = await db.auth.linkIdentity({
        provider: "kakao",
        options: { redirectTo: RETURN_URL }
      });
      if (error) {
        button.disabled = false;
        button.textContent = "카카오 관리자 계정 연결";
        alert(`카카오 계정 연결을 시작하지 못했습니다.\n${error.message || error}`);
      }
    });
    document.body.appendChild(wrap);
  }

  async function syncSuperadminKakaoLink() {
    try {
      const { data: { session } } = await db.auth.getSession();
      if (!session) { removeControl(); return; }

      const { data: isSuperadmin, error: roleError } = await db.rpc("spark_is_superadmin");
      if (roleError || isSuperadmin !== true) { removeControl(); return; }

      const { data, error } = await db.auth.getUserIdentities();
      if (error) { console.warn("[GLOBAL AUTH] identity check failed", error); return; }
      const identities = data?.identities || [];
      const hasKakao = identities.some(identity => identity.provider === "kakao");
      hasKakao ? renderLinkedBadge() : renderLinkButton();
    } catch (error) {
      console.warn("[GLOBAL AUTH] bootstrap failed", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncSuperadminKakaoLink, { once: true });
  } else {
    syncSuperadminKakaoLink();
  }

  db.auth.onAuthStateChange(() => setTimeout(syncSuperadminKakaoLink, 0));
}
