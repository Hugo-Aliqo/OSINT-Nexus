import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js';

export function identifyTargetType(target: string) {
  if (target.includes('@')) return 'email';
  if (isValidPhoneNumber(target) || /^[\d\s+\-()]+$/.test(target)) return 'phone';
  return 'unknown';
}

export function parsePhoneData(phone: string) {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (!phoneNumber) return null;
    return {
      country: phoneNumber.country,
      international: phoneNumber.formatInternational(),
      national: phoneNumber.formatNational(),
      uri: phoneNumber.getURI(),
      possible: phoneNumber.isPossible(),
      regionCode: phoneNumber.countryCallingCode,
    };
  } catch (e) {
    return null;
  }
}
