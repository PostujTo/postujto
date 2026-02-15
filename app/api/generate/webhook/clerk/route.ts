import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: Request) {
  // Pobierz webhook secret z ENV
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Pobierz headery
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Pobierz body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Weryfikuj webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Obsługa eventów
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Utwórz użytkownika w Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_user_id: id,
          email: email_addresses[0].email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          subscription_plan: 'free',
          credits_total: 10,
          credits_remaining: 10,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error creating user', { status: 500 });
      }

      console.log('User created in Supabase:', data);
      return new Response('User created', { status: 200 });
    } catch (err) {
      console.error('Error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Zaktualizuj użytkownika w Supabase
      const { error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0].email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error updating user', { status: 500 });
      }

      console.log('User updated in Supabase');
      return new Response('User updated', { status: 200 });
    } catch (err) {
      console.error('Error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Usuń użytkownika z Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error deleting user', { status: 500 });
      }

      console.log('User deleted from Supabase');
      return new Response('User deleted', { status: 200 });
    } catch (err) {
      console.error('Error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('Event not handled', { status: 200 });
}