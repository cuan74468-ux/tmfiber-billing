import {TM_STAGE,hasStagingEndpoint} from './config.js';
export class TMApiError extends Error{constructor(message,code=0){super(message);this.name='TMApiError';this.code=code;}}
export async function tmPost(action,payload={},sessionToken=''){
 if(!hasStagingEndpoint()||TM_STAGE.environment!=='STAGING')throw new TMApiError('Koneksi STAGING belum disiapkan.',503);
 if(typeof action!=='string'||!action||typeof payload!=='object'||payload===null)throw new TMApiError('Permintaan tidak valid.',400);
 // No credentials/PII are persisted to URL, storage or service worker.
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),18000);
 try{
  const response=await fetch(TM_STAGE.apiEndpoint,{
   method:'POST',mode:'cors',redirect:'follow',credentials:'omit',
   headers:{'Content-Type':'text/plain;charset=utf-8'},
   body:JSON.stringify({action,session_token:sessionToken,payload}),signal:controller.signal,cache:'no-store'
  });
  if(!response.ok)throw new TMApiError('Server tidak dapat dihubungi.',response.status);
  let result;
  try{result=await response.json();}catch{throw new TMApiError('Respons server tidak terbaca. Periksa izin akses atau CORS GAS.',502);}
  if(!result||!['SUCCESS','ERROR'].includes(result.status)||typeof result.code!=='number'||typeof result.message!=='string'||!result.data||typeof result.data!=='object')throw new TMApiError('Format respons server tidak sesuai kontrak.',502);
  if(result.status==='ERROR')throw new TMApiError(result.message,result.code);
  return result.data;
 }catch(e){
  if(e.name==='AbortError')throw new TMApiError('Koneksi terlalu lama. Coba lagi.',408);
  if(e instanceof TMApiError)throw e;
  throw new TMApiError('Gagal tersambung ke STAGING. Periksa koneksi dan CORS Apps Script.',0);
 }finally{clearTimeout(timeout);}
}
