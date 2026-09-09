import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"https://ipma1822-png.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json; charset=utf-8"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:unknown,max=6000)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,max);
const safeId=(v:unknown)=>clean(v,100).replace(/[^a-zA-Z0-9_-]/g,'-')||crypto.randomUUID();
function promptFor(input:Record<string,unknown>){
  const title=clean(input.title,300),summary=clean(input.summary,1200),body=clean(input.body,3000),category=clean(input.category,80);
  const hazard=/사고|화재|재난|사망|부상|폭발|붕괴|전쟁|범죄/.test(`${title} ${summary}`);
  const publicFigure=/대통령|총리|장관|대표|회장|시장|도지사|국회의원/.test(`${title} ${summary}`);
  return [`Create one editorial news photograph for a Korean news article.`,`Article title: ${title}`,`Category: ${category}`,`Article context: ${summary||body}`,`Landscape documentary photography, credible newsroom aesthetic, natural light, realistic composition, visually specific to the event or topic.`,`Do not include any text, letters, numbers, captions, headlines, signs, logos, trademarks, UI, or watermarks.`,`Do not create a recognizable real person or imply a fabricated photograph of a named public figure; use a symbolic scene, environment, objects, or distant non-identifiable people instead.`,hazard?`Sensitive event: show response, prevention, equipment, or aftermath without bodies, blood, injury, panic, or graphic damage.`:`Keep the scene factual, neutral, and non-sensational.`,publicFigure?`Public-figure topic: do not depict the person's face; visualize the institution, location, policy subject, or neutral press setting.`:'',`No sensationalism. No invented evidence. No misleading documents or statistics.`].filter(Boolean).join('\n');
}
function adminKey(){
  const direct=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(direct)return direct;
  try{const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');return String(keys.service_role||keys.secret||Object.values(keys)[0]||'')}catch{return''}
}
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  try{
    const url=Deno.env.get('SUPABASE_URL')||'',publishable=Deno.env.get('SUPABASE_ANON_KEY')||'',authorization=req.headers.get('authorization')||'';
    if(!authorization.startsWith('Bearer '))return json({error:'authentication_required',message:'AI OFFICE 로그인이 필요합니다.'},401);
    const userClient=createClient(url,publishable,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:'invalid_session',message:'AI OFFICE 로그인 세션을 확인할 수 없습니다.'},401);
    const allowed=(Deno.env.get('AI_OFFICE_ADMIN_EMAIL')||'class-admin@ipma.kr').toLowerCase();
    if(String(user.email||'').toLowerCase()!==allowed)return json({error:'forbidden',message:'이미지 생성 권한이 없습니다.'},403);
    const input=await req.json();if(!clean(input?.articleId)||!clean(input?.title))return json({error:'invalid_article',message:'기사 ID와 제목이 필요합니다.'},400);
    const openaiKey=Deno.env.get('OPENAI_API_KEY');if(!openaiKey)return json({error:'configuration_missing',message:'서버 이미지 생성 키가 설정되지 않았습니다.'},503);
    const model=Deno.env.get('GN24_IMAGE_MODEL')||'gpt-image-2.5-sunburst';
    const ai=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${openaiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,prompt:promptFor(input),size:'1536x864',quality:'medium',output_format:'png'})});
    const result=await ai.json();if(!ai.ok)throw new Error(result?.error?.message||`image_api_${ai.status}`);
    const encoded=result?.data?.[0]?.b64_json;if(!encoded)throw new Error('이미지 데이터가 없습니다.');
    const binary=atob(encoded),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0)),key=adminKey();if(!key)throw new Error('서버 저장 권한이 설정되지 않았습니다.');
    const admin=createClient(url,key,{auth:{persistSession:false}}),now=new Date(),ym=[now.getUTCFullYear(),String(now.getUTCMonth()+1).padStart(2,'0')].join('/'),path=`news-images/ai-generated/${ym}/${safeId(input.articleId)}-${Date.now()}-source.png`;
    const {error:uploadError}=await admin.storage.from('ai-office-media').upload(path,bytes,{contentType:'image/png',cacheControl:'31536000',upsert:false});if(uploadError)throw uploadError;
    const {data}=admin.storage.from('ai-office-media').getPublicUrl(path);return json({ok:true,articleId:input.articleId,sourceImageUrl:data.publicUrl,imageStatus:'IMAGE_REVIEW',generatedAt:new Date().toISOString(),model});
  }catch(error){console.error(error);return json({error:'image_generation_failed',message:String(error?.message||error)},500)}
});
