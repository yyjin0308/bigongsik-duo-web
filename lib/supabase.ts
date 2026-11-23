import { createBrowserClient } from '@supabase/ssr';
export function supabase(){return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)}
export type Profile={id:string;gender:'female'|'male';display_name:string;birth_year:number|null;job:string|null;region:string|null;height_cm:number|null;bio:string|null;ideal_type:string|null;hobbies:string|null;photos:string[];is_published:boolean;sort_order:number;created_at:string};
