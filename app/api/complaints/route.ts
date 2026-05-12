import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = supabaseAdmin();
  const { data, error } = await client
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { shop_name, mobile, description, photo_url } = body;

  if (!shop_name || !mobile || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const client = supabaseAdmin();
  const { data, error } = await client
    .from('complaints')
    .insert([{ shop_name, mobile, description, photo_url, status: 'new' }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
