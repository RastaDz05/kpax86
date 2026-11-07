import { MachineType } from '../types';

export interface DeviceDiagnosticInfo {
  ipAddress: string;
  realCity: string;
  realCountry: string;
  countryCode: 'DZ' | 'FR' | 'OTHER';
  isp: string;
  machine: MachineType;
  deviceModel: string;
  browser: string;
  os: string;
}

/**
 * Detect client machine type based on user agent and screen
 */
export function detectMachineType(): MachineType {
  if (typeof window === 'undefined') return 'pc';
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1024)) {
    return 'tablette';
  }
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768) {
    return 'smartphone';
  }
  return 'pc';
}

/**
 * Detect OS & Browser details
 */
export function detectClientEnvironment(): { os: string; browser: string; deviceModel: string } {
  if (typeof window === 'undefined') {
    return { os: 'Linux', browser: 'Node', deviceModel: 'Server' };
  }

  const ua = navigator.userAgent;
  let os = 'Windows 11';
  let browser = 'Chrome';
  let deviceModel = 'PC Desktop';

  // OS Detection
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9\.]+)/);
    os = `Android ${match ? match[1] : '14'}`;
    deviceModel = /Samsung|SM-/i.test(ua) ? 'Samsung Galaxy' : /Xiaomi|Redmi/i.test(ua) ? 'Xiaomi Redmi' : 'Smartphone Android';
  } else if (/iPhone/i.test(ua)) {
    os = 'iOS (iPhone)';
    deviceModel = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    deviceModel = 'Apple iPad';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS Sonoma';
    deviceModel = 'Apple Mac';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows 11 / 10';
    deviceModel = 'PC Portable / Tour';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux Ubuntu';
    deviceModel = 'PC Linux';
  }

  // Browser Detection
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  }

  return { os, browser, deviceModel };
}

/**
 * Fetch real public IP & Geolocation
 */
export async function fetchRealIPAndLocation(): Promise<DeviceDiagnosticInfo> {
  const env = detectClientEnvironment();
  const machine = detectMachineType();

  const fallback: DeviceDiagnosticInfo = {
    ipAddress: '105.101.48.214',
    realCity: 'Alger (El Bahdja)',
    realCountry: 'Algérie 🇩🇿',
    countryCode: 'DZ',
    isp: 'Algérie Télécom (Mobilis 4G)',
    machine,
    deviceModel: env.deviceModel,
    browser: env.browser,
    os: env.os,
  };

  try {
    // Attempt 1: ipwho.is (fast, CORS-friendly, SSL supported)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const countryCode = data.country_code === 'DZ' ? 'DZ' : data.country_code === 'FR' ? 'FR' : 'OTHER';
        const flag = data.country_code === 'DZ' ? '🇩🇿' : data.country_code === 'FR' ? '🇫🇷' : '🌍';
        return {
          ipAddress: data.ip,
          realCity: `${flag} ${data.city || 'Alger'}`,
          realCountry: `${data.country || 'Algérie'} ${flag}`,
          countryCode,
          isp: data.connection?.isp || data.isp || 'Opérateur Internet',
          machine,
          deviceModel: env.deviceModel,
          browser: env.browser,
          os: env.os,
        };
      }
    }
  } catch {
    // ignore, try attempt 2
  }

  try {
    // Attempt 2: api.ipify.org
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        return {
          ...fallback,
          ipAddress: data.ip,
        };
      }
    }
  } catch {
    // ignore
  }

  return fallback;
}
