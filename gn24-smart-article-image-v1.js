(()=>{
'use strict';
const ARTICLE_KEY='ipma_ai_office_article_drafts_v1';
const FUNCTION_NAME='generate-gn24-news-image';
const cfg=window.AI_OFFICE_CONFIG||{};
const read=()=>{try{const v=JSON.parse(localStorage.getItem(ARTICLE_KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}};
const write=v=>{try{localStorage.setItem(ARTICLE_KEY,JSON.stringify(v));return true}catch(_){return false}};
const fingerprint=a=>[a.title,a.summary,a.body,a.category].map(v=>String(v||'').trim()).join('\n').slice(0,12000);
let client=null,running=new Map();

function supabaseClient(){
  if(client)return client;
  if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey)throw new Error('AI OFFICE 인증 설정을 불러오지 못했습니다.');
  client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  return client;
}
function update(id,values){
  const rows=read(),index=rows.findIndex(x=>x.id===id);
  if(index<0)throw new Error('기사 저장자료를 찾지 못했습니다.');
  rows[index]={...rows[index],...values,updatedAt:new Date().toISOString()};
  if(!write(rows))throw new Error('이미지 정보를 저장하지 못했습니다.');
  window.dispatchEvent(new CustomEvent('ai-office:smart-image-updated',{detail:{id,article:rows[index]}}));
  return rows[index];
}
async function generate(articleId){
  if(running.has(articleId))return running.get(articleId);
  const job=(async()=>{
    const article=read().find(x=>x.id===articleId);
    if(!article)throw new Error('이미지를 만들 기사 자료가 없습니다.');
    const hash=fingerprint(article);
    if(/^https:\/\//i.test(String(article.sourceImageUrl||''))&&article.imagePromptFingerprint===hash)return article;
    update(articleId,{imageStatus:'IMAGE_PENDING',imageError:'',imagePromptFingerprint:hash});
    const sb=supabaseClient(),{data:{session},error:sessionError}=await sb.auth.getSession();
    if(sessionError||!session?.access_token)throw new Error('AI OFFICE 로그인이 필요합니다.');
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/${FUNCTION_NAME}`,{method:'POST',headers:{apikey:cfg.supabasePublishableKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({articleId:article.id,title:article.title,summary:article.summary,body:article.body,category:article.category,source:article.source})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result?.sourceImageUrl)throw new Error(result?.message||result?.error||`이미지 생성 요청 실패 (${response.status})`);
    return update(articleId,{sourceImageUrl:result.sourceImageUrl,finalImageUrl:'',imageUrl:'',imageStatus:'IMAGE_REVIEW',imageReady:false,imageGeneratedAt:result.generatedAt||new Date().toISOString(),imageModel:result.model||'',imageError:'',imagePromptFingerprint:hash});
  })().catch(error=>{update(articleId,{imageStatus:'IMAGE_ERROR',imageReady:false,imageError:String(error?.message||error)});throw error}).finally(()=>running.delete(articleId));
  running.set(articleId,job);return job;
}
window.GN24SmartArticleImage={generateForArticle:generate};
})();
