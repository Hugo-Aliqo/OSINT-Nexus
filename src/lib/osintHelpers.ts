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

export function generateGoogleDorks(target: string) {
  const encTarget = encodeURIComponent(`"${target}"`);
  return [
    { name: "LinkedIn", icon: "Linkedin", url: `https://www.google.com/search?q=site%3Alinkedin.com+${encTarget}` },
    { name: "Facebook", icon: "Facebook", url: `https://www.google.com/search?q=site%3Afacebook.com+${encTarget}` },
    { name: "Twitter/X", icon: "Twitter", url: `https://www.google.com/search?q=site%3Atwitter.com+${encTarget}` },
    { name: "Documents (PDF/Doc)", icon: "FileText", url: `https://www.google.com/search?q=${encTarget}+filetype%3Apdf+OR+filetype%3Adoc+OR+filetype%3Acsv` },
  ];
}

export function generateQuickLinks(target: string, type: 'email' | 'phone' | 'unknown') {
    const links = [];
    if (type === 'phone') {
        const cleanPhone = target.replace(/[^\d+]/g, '');
        links.push(
            { name: "WhatsApp (Check Profile)", url: `https://wa.me/${cleanPhone.replace('+', '')}`, description: "Ouvre une discussion WhatsApp pour vérifier l'existence du compte et l'image de profil." },
            { name: "NumLookup (US/Intl)", url: `https://www.numlookup.com/`, description: "Annuaire téléphonique inversé." },
            { name: "Truecaller", url: `https://www.truecaller.com/search/globe/${cleanPhone}`, description: "Recherche dans la base de données Truecaller (requiert un compte)." }
        );
    } else if (type === 'email') {
        links.push(
            { name: "Have I Been Pwned", url: `https://haveibeenpwned.com/account/${encodeURIComponent(target)}`, description: "Vérifie les fuites de données (Data Leaks)." },
            { name: "Epieos (OSINT Email)", url: `https://epieos.com/?q=${encodeURIComponent(target)}`, description: "Vérifie la présence sur les réseaux sociaux de base, Google Maps, etc." },
            { name: "Hunter.io (Domain Check)", url: `https://hunter.io/search/${encodeURIComponent(target.split('@')[1] || '')}`, description: "Vérifie la structure et la présence du domaine de l'email." }
        );
    }
    
    // Always append General OSINT / Reverse Image
    links.push(
        { name: "Reverse Image (Google)", url: `https://images.google.com/`, description: "Si vous trouvez une photo de profil (WhatsApp, LinkedIn), utilisez Google Images." },
        { name: "Reverse Image (Yandex)", url: `https://yandex.com/images/`, description: "Excellent pour l'OSINT, la reconnaissance faciale publique et les sources russes/européennes." },
        { name: "TinEye", url: `https://tineye.com/`, description: "Moteur de recherche par similarité d'images." }
    );

    return links;
}
