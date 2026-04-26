import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface OsintReport {
  summary: string;
  socialMediaMentions: Array<{
    platform: string;
    url?: string;
    text: string;
  }>;
  publicInfoSurfaces: string[];
  riskAssessment: string;
  integratedTools: Array<{
    toolName: string;
    status: string;
    findings: string;
  }>;
  geolocation?: {
    location: string;
    confidence: string;
    source: string;
  } | null;
}

export async function scanTarget(target: string): Promise<OsintReport> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Tu es un agent d'OSINT autonome. L'utilisateur compte sur toi pour SIMULER et AUTOMATISER l'utilisation d'outils OSINT pour la cible : ${target}.

Tu DOIS intégrer virtuellement les résultats des outils en effectuant des requêtes en arrière-plan (via ton outil googleSearch) :
1. "Social Discovery": site:linkedin.com OR site:facebook.com OR site:twitter.com OR site:instagram.com "${target}"
2. "Data Leak Checker (HIBP/etc)": "${target}" AND ("pastebin" OR "leak" OR "breach" OR "password")
3. "Document Scanner": filetype:pdf OR filetype:doc "${target}"
4. "Reverse Lookup": Recherche globale de la cible "${target}"

Rassemble toutes les informations. Conçois ton rapport avec précision.
Fournis un bilan des outils dans 'integratedTools'. Pour chaque outil (ex: "Social Media Scanner", "Data Leak Checker", "Public Records Search"), définis son 'status' (ex: "No leaks found", "Profiles detected", "Clean") et résume ses 'findings'.

Réponds STRICTEMENT en JSON suivant le schéma fourni.`,
    tools: [
      { googleSearch: {} }
    ],
    config: {
      responseMimeType: "application/json",
      systemInstruction: "Tu es une suite d'outils OSINT automatisée. Tu intègres l'action de multiples modules de reconnaissance (Fuites, Sociaux, Documents) en effectuant toi-même les requêtes via Google Search, puis tu retournes les résultats comme si chaque module avait fonctionné de manière indépendante.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Résumé de l'analyse OSINT et des conclusions tirées des modules intégrés." },
          socialMediaMentions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING, description: "Nom de la plateforme (ex: LinkedIn, Twitter, Facebook, GitHub, etc)." },
                url: { type: Type.STRING, description: "URL vers la mention si connue, sinon chaîne vide." },
                text: { type: Type.STRING, description: "Description de la mention ou du profil." }
              },
              required: ["platform", "text"]
            }, 
            description: "Résultats précis trouvés sur les réseaux sociaux." 
          },
          publicInfoSurfaces: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sites, annuaires ou documents publics mentionnant la cible." },
          riskAssessment: { type: Type.STRING, description: "Évaluation du risque de sécurité globale." },
          integratedTools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                toolName: { type: Type.STRING, description: "Nom du module intégré (ex: 'Social Media Scanner', 'Hashes & Leaks Engine', 'Public Docs Recon')." },
                status: { type: Type.STRING, description: "Statut court du module (ex: 'Alert', 'Clear', 'Found 2 Matches')." },
                findings: { type: Type.STRING, description: "Résumé spécifique d'une phrase des découvertes du module." }
              },
              required: ["toolName", "status", "findings"]
            },
            description: "Liste des modules d'analyse simulés et leurs résultats."
          },
          geolocation: {
            type: Type.OBJECT,
            description: "Géolocalisation déduite ou trouvée (pays, ville, région). Null si aucune localisation n'est trouvée.",
            nullable: true,
            properties: {
              location: { type: Type.STRING, description: "La localisation (ex: 'Paris, France', 'US (indicatif)')" },
              confidence: { type: Type.STRING, description: "Niveau de confiance (ex: 'Élevé', 'Moyen', 'Faible')" },
              source: { type: Type.STRING, description: "Source de la localisation (ex: 'Indicatif téléphonique', 'LinkedIn', 'Fuite de données')" }
            },
            required: ["location", "confidence", "source"]
          }
        },
        required: ["summary", "socialMediaMentions", "publicInfoSurfaces", "riskAssessment", "integratedTools"]
      }
    }
  });

  const text = response.text || "{}";
  try {
    return JSON.parse(text) as OsintReport;
  } catch (e) {
    console.error("Failed to parse OSINT report", text);
    return {
        summary: "L'IA a retourné un format non valide ou aucune donnée.",
        socialMediaMentions: [],
        publicInfoSurfaces: [],
        riskAssessment: "Inconnu.",
        integratedTools: [],
        geolocation: null
    }
  }
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function askOsintQuestion(
    target: string, 
    report: OsintReport | null, 
    history: ChatMessage[]
): Promise<string> {
    const contents: any[] = [];

    // Add initial context as the first user message
    let initialContext = `Contexte de l'investigation OSINT :
Cible analytique : ${target}\n`;
    
    if (report) {
         initialContext += `Rapport préliminaire JSON de l'agent : ${JSON.stringify(report)}\n\n`;
    }
    initialContext += `Maintenant, réponds aux questions de l'enquêteur.`;

    contents.push({ role: 'user', parts: [{ text: initialContext }] });
    contents.push({ role: 'model', parts: [{ text: "Compris, je suis prêt à assister l'enquêteur sur cette cible." }] });

    // Map history to Google GenAI format (role 'user' or 'model')
    for (const msg of history) {
        contents.push({ role: msg.role, parts: [{ text: msg.text }] });
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        tools: [{ googleSearch: {} }],
        config: {
            systemInstruction: "Tu es un assistant IA d'OSINT spécialisé pour les forces de l'ordre, chercheurs et journalistes. Garde un ton clinique, précis et analytique. Tu peux effectuer des recherches web supplémentaires pour répondre aux questions pointues liées à la cible actuelle."
        }
    });

    return response.text || "Erreur de génération.";
}
