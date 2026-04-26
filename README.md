# 🔍 OSINT-Nexus

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/)
[![OSINT](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Hugo-Aliqo/OSINT-Nexus)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Hugo-Aliqo/OSINT-Nexus/issues)

**OSINT-Nexus** est un framework d'investigation numérique complet conçu pour centraliser, automatiser et corréler la collecte d'informations provenant de sources ouvertes. C'est l'outil idéal pour les analystes en cybersécurité, les chercheurs en menaces (CTI) et les enquêteurs numériques.

---

## ✨ Fonctionnalités Clés

* 👤 **User Search :** Traque d'identifiants sur plus de 150 réseaux sociaux et plateformes web.
* 🌐 **Network Intel :** Analyse de noms de domaine, énumération de sous-domaines, récupération de certificats SSL et données WHOIS.
* 📧 **Email Forensic :** Vérification de l'existence d'emails, recherche dans les bases de données de fuites (data breaches) et identification des services liés.
* 📱 **Phone Lookup :** Analyse des métadonnées des numéros de téléphone (opérateur, pays, validité).
* 🗺️ **Geoloc & Metadata :** Extraction de métadonnées EXIF sur les images et recherche de coordonnées géographiques.
* 📄 **Reporting :** Exportation automatique des résultats sous formats JSON, CSV ou PDF pour vos rapports d'investigation.

---

## 🚀 Installation

### Prérequis
- Python 3.9 ou une version plus récente.
- `git` installé sur votre machine.

### Étapes d'installation
```bash
# 1. Cloner le dépôt
git clone [https://github.com/Hugo-Aliqo/OSINT-Nexus.git](https://github.com/Hugo-Aliqo/OSINT-Nexus.git)

# 2. Accéder au répertoire
cd OSINT-Nexus

# 3. Créer un environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# 4. Installer les dépendances
pip install -r requirements.txt
