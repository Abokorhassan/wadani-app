import { Linking, Platform } from 'react-native';

/** Opens a URL and quietly does nothing when no app can handle it. */
async function open(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    // No dialler, mail client or maps app on this device.
  }
}

export const callNumber = (phone: string) => open(`tel:${phone.replace(/\s/g, '')}`);

export const sendEmail = (email: string) => open(`mailto:${email}`);

export const openMap = (query: string) =>
  open(
    Platform.select({
      ios: `maps://?q=${encodeURIComponent(query)}`,
      default: `geo:0,0?q=${encodeURIComponent(query)}`,
    })
  );

/** wa.me works whether or not WhatsApp is installed. */
export const openWhatsApp = (number: string, message: string) =>
  open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
