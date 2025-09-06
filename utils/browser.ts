import { Linking, Platform } from 'react-native';

export const openURL = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Cannot open URL: ${url}`);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};

export const openInAppBrowser = (url: string) => {
  if (Platform.OS === 'web') {
    // On web, open in new tab
    window.open(url, '_blank');
  } else {
    // On mobile, use the system browser
    openURL(url);
  }
};

// Email functionality
export const openEmail = (email: string, subject?: string, body?: string) => {
  let emailUrl = `mailto:${email}`;
  
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  
  if (params.length > 0) {
    emailUrl += `?${params.join('&')}`;
  }
  
  openURL(emailUrl);
};

// Phone functionality
export const openPhone = (phoneNumber: string) => {
  openURL(`tel:${phoneNumber}`);
};

// SMS functionality
export const openSMS = (phoneNumber: string, message?: string) => {
  let smsUrl = `sms:${phoneNumber}`;
  if (message) {
    smsUrl += `${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
  }
  openURL(smsUrl);
};