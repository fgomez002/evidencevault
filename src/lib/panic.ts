import * as SMS from 'expo-sms';
import { supabase } from './supabase';
import { captureLocation } from './location';
import type { Contact } from './database.types';

export interface PanicResult {
  latitude?: number;
  longitude?: number;
  recipients: string[];
  smsOpened: boolean;
}

/**
 * Fire the panic flow:
 *  1. capture current GPS
 *  2. compose an emergency message with a maps link
 *  3. open the SMS composer pre-filled to all panic-recipient contacts
 *  4. record a panic_event row
 *
 * In managed Expo, `expo-sms` opens the user's messaging app with the message
 * pre-filled — the user taps send. Fully automated background SMS requires a
 * dev build + an SMS gateway (e.g. Twilio via Edge Function); see PLAN.md §9.
 */
export async function triggerPanic(contacts: Contact[], customMessage?: string): Promise<PanicResult> {
  const recipients = contacts.filter((c) => c.is_panic_recipient && c.phone).map((c) => c.phone!) ;

  const loc = await captureLocation();
  const mapsLink =
    loc != null ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}` : undefined;

  const message =
    (customMessage?.trim() ||
      'EMERGENCY: I need help and may be in danger. This is an automated alert from EvidenceVault.') +
    (mapsLink ? `\nMy location: ${mapsLink}` : '') +
    `\nTime: ${new Date().toLocaleString()}`;

  let smsOpened = false;
  if (recipients.length > 0 && (await SMS.isAvailableAsync())) {
    const { result } = await SMS.sendSMSAsync(recipients, message);
    smsOpened = result !== 'cancelled';
  }

  // Best-effort audit row (no-op in demo mode).
  try {
    await supabase.from('panic_events').insert({
      latitude: loc?.latitude ?? null,
      longitude: loc?.longitude ?? null,
      message,
      recipients,
      delivered: smsOpened,
    });
  } catch {
    // ignore — surfacing the SMS composer is the priority
  }

  return { latitude: loc?.latitude, longitude: loc?.longitude, recipients, smsOpened };
}
