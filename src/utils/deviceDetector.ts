import { ClientDeviceSession } from '../types/auth';

const DEVICE_ID_KEY = 'paw_client_device_fingerprint_id';

/**
 * Gets or generates a consistent unique device ID for this browser instance.
 */
export function getOrCreateDeviceId(): string {
  try {
    let existingId = localStorage.getItem(DEVICE_ID_KEY);
    if (!existingId) {
      existingId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, existingId);
    }
    return existingId;
  } catch (e) {
    return `dev_temp_${Date.now()}`;
  }
}

/**
 * Parses user-agent and screen details to build a detailed ClientDeviceSession.
 */
export function detectCurrentDevice(): Omit<ClientDeviceSession, 'loginAt' | 'lastActiveAt' | 'status'> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const deviceId = getOrCreateDeviceId();
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceName = 'Workstation';

  // Detect Mobile / Tablet / Desktop
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(userAgent);
  const isMobile = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(userAgent);

  if (isTablet) {
    deviceType = 'tablet';
  } else if (isMobile) {
    deviceType = 'mobile';
  } else {
    deviceType = 'desktop';
  }

  // Detect OS
  if (/Mac OS X|Macintosh/i.test(userAgent)) {
    os = 'macOS';
    deviceName = deviceType === 'desktop' ? 'Apple Mac' : 'Apple iPad';
  } else if (/Windows NT 10.0|Windows NT 11.0/i.test(userAgent)) {
    os = 'Windows 11/10';
    deviceName = 'Windows PC';
  } else if (/Windows NT/i.test(userAgent)) {
    os = 'Windows';
    deviceName = 'Windows PC';
  } else if (/iPhone/i.test(userAgent)) {
    os = 'iOS';
    deviceName = 'Apple iPhone';
  } else if (/iPad/i.test(userAgent)) {
    os = 'iPadOS';
    deviceName = 'Apple iPad';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
    deviceName = deviceType === 'tablet' ? 'Android Tablet' : 'Android Phone';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
    deviceName = 'Linux Workstation';
  }

  // Detect Browser
  if (/Edg\//i.test(userAgent)) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = `Edge ${match ? match[1] : ''}`;
  } else if (/Chrome\//i.test(userAgent) && !/Chromium|Edg/i.test(userAgent)) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match ? match[1] : ''}`;
  } else if (/Safari\//i.test(userAgent) && !/Chrome|Chromium|Edg/i.test(userAgent)) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = `Safari ${match ? match[1] : ''}`;
  } else if (/Firefox\//i.test(userAgent)) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match ? match[1] : ''}`;
  } else if (/Opera|OPR\//i.test(userAgent)) {
    browser = 'Opera';
  }

  // Location / IP description
  const timeZone = Intl?.DateTimeFormat?.()?.resolvedOptions()?.timeZone || 'UTC';
  const location = timeZone.replace(/_/g, ' ');

  return {
    sessionId,
    deviceId,
    deviceType,
    deviceName: `${deviceName} (${browser.trim()})`,
    browser: browser.trim(),
    os,
    location,
    ipAddress: '192.168.1.1'
  };
}
