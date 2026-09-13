import {createClient} from "@supabase/supabase-js";

const AUTHORIZED_EMAIL_HASH="731c7f07100e12fe0f5ae66d0d9c4848b65e6a7ccf98576ad8a4f17f0858acd6";
export async function isAuthorizedEmail(email:string){
  const normalized=email.trim().toLowerCase();
  const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,"0")).join("")===AUTHORIZED_EMAIL_HASH;
}
export const supabase=createClient(
  "https://reulrjgfmfdybesmkfhg.supabase.co",
  "sb_publishable_PmsgYO_eS5qmtF859PRMDA_hz1kE3In",
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);
