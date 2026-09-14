import {createClient} from "@supabase/supabase-js";

export const ACCOUNT_EMAIL="victoria@paralegal-initiation.local";
export const supabase=createClient(
  "https://reulrjgfmfdybesmkfhg.supabase.co",
  "sb_publishable_PmsgYO_eS5qmtF859PRMDA_hz1kE3In",
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);
