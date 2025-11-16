import { createClient } from "@supabase/supabase-js";
import { ENV } from "./environments.js";

export const supabase = createClient(ENV.DB_URL, ENV.DB_ANON_KEY);
