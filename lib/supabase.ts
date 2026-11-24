import { createBrowserClient } from '@supabase/ssr';
export function supabase(){return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)}
export type Profile={id:string;gender:'female'|'male';display_name:string;birth_year:number|null;job:string|null;region:string|null;height_cm:number|null;bio:string|null;ideal_type:string|null;hobbies:string|null;photos:string[];is_published:boolean;sort_order:number;created_at:string;member_id?:string|null};

export async function signProfilePhotos(client: ReturnType<typeof supabase>, photos: string[], member: boolean): Promise<string[]> {
  const bucket = member ? 'member-photos' : 'profile-photos';
  return Promise.all(photos.map(async raw => {
    try {
      let path = raw;
      if (/^https?:\/\//i.test(raw)) {
        if (member) return '';
        const url = new URL(raw);
        const prefix = '/storage/v1/object/public/profile-photos/';
        if (url.origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin || !url.pathname.startsWith(prefix)) return '';
        path = decodeURIComponent(url.pathname.slice(prefix.length));
      }
      if (!path || path.startsWith('/') || path.split('/').some(part => !part || part === '..' || part === '.')) return '';
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 300);
      return error ? '' : data?.signedUrl || '';
    } catch { return ''; }
  }));
}
