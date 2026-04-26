# 🌐 OSINT-Nexus Framework

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg)](https://github.com/Hugo-Aliqo/OSINT-Nexus)

**OSINT-Nexus** est un framework de renseignement d'origine source ouverte (OSINT) conçu pour automatiser la collecte et la corrélation de données numériques. Il permet de pivoter efficacement entre pseudos, emails, domaines et numéros de téléphone pour reconstruire une empreinte numérique complète.

## ⚖️ CLAUSE DE NON-RESPONSABILITÉ (LEGAL DISCLAIMER)
**IMPORTANT : Usage Éthique Uniquement**
Cet outil est fourni exclusivement à des fins de tests d'intrusion éthiques, de recherche pédagogique ou d'investigation légale. L'auteur (**Hugo-Aliqo**) décline toute responsabilité en cas d'utilisation malveillante. L'utilisateur est seul responsable du respect des lois locales concernant la vie privée et la collecte de données. Le scan de cibles sans consentement est illégal dans de nombreuses juridictions.

## ✨ FONCTIONNALITÉS PRINCIPALES
* 👤 **Identity Recon :** Énumération de pseudonymes sur plus de 150 réseaux sociaux et forums.
* 📧 **Email Intelligence :** Recherche de fuites de données (Breach Detection) et vérification de validité SMTP.
* 🌐 **Network Analysis :** Énumération de sous-domaines, analyse DNS, historique WHOIS et certificats SSL.
* 📱 **Phone Lookup :** Identification de l'opérateur, de la région et des métadonnées associées.
* 📊 **Reporting :** Exportation automatisée des résultats aux formats JSON, CSV ou PDF.

## 🚀 INSTALLATION, CONFIGURATION ET UTILISATION

### 1. Installation des dépendances
```bash
git clone [https://github.com/Hugo-Aliqo/OSINT-Nexus.git](https://github.com/Hugo-Aliqo/OSINT-Nexus.git)
cd OSINT-Nexus
python -m venv venv
source venv/bin/activate  # Sur Linux/macOS (utilisez venv\Scripts\activate sur Windows)
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Configuration des clés API
Pour activer tous les modules, renommez le fichier `.env.example` en `.env` et insérez vos jetons d'accès :
```env
SHODAN_API_KEY=votre_cle_shodan
HUNTER_IO_KEY=votre_cle_hunter
HIBP_API_KEY=votre_cle_hibp
VIRUSTOTAL_KEY=votre_cle_virustotal
IPINFO_TOKEN=votre_cle_ipinfo
```

### 3. Lancement
```bash
python main.py

# Exemples de commandes CLI :
# python main.py --user "john_doe"
# python main.py --domain "example.com" --export pdf
```

## 📁 STRUCTURE DU PROJET
```text
OSINT-Nexus/
├── core/                # Moteur central et gestionnaires d'API
├── modules/             # Scripts d'extraction spécialisés
│   ├── social/          # Reconnaissance réseaux sociaux
│   ├── network/         # DNS, Domaines, Sous-domaines
│   ├── emails/          # Recherche de fuites et data-breach
│   └── phone/           # Analyse de numéros de téléphone
├── data/                # Dictionnaires et agents utilisateurs
├── reports/             # Dossier de stockage des rapports générés
├── .env.example         # Modèle pour les clés API
├── requirements.txt     # Liste des bibliothèques Python
└── main.py              # Point d'entrée principal
```

## 🤝 CONTRIBUTION & LICENCE
Les contributions sont les bienvenues ! Forkez le projet, créez votre branche (`git checkout -b feature/AmazingFeature`), commitez vos changements et ouvrez une Pull Request.
Distribué sous la licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

**Maintenu par [Hugo-Aliqo](https://github.com/Hugo-Aliqo)**
