# 🔍 OSINT-Nexus

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Hugo-Aliqo/OSINT-Nexus/graphs/commit-activity)

**OSINT-Nexus** est un framework d'investigation numérique conçu pour centraliser et automatiser la collecte d'informations provenant de sources ouvertes. Que ce soit pour de la recherche d'empreinte numérique, de l'analyse de menaces (Threat Intel) ou de l'investigation sur des réseaux sociaux, Nexus offre une interface unifiée pour corréler les données.

---

## ✨ Fonctionnalités

- 👤 **Analyse de Profils :** Recherche de pseudos (usernames) sur plus de 100 plateformes sociales.
- 🌐 **Intelligence Réseau :** Scan de domaines, DNS, sous-domaines et récupération de données WHOIS.
- 📧 **Investigation d'Emails :** Vérification de format, détection de fuites de données (breach detection) et liens avec des comptes tiers.
- 📱 **Numéros de Téléphone :** Identification de l'opérateur, de la localisation et des comptes associés.
- 🗺️ **Visualisation :** (Optionnel si inclus) Génération de graphes de relations entre les entités trouvées.
- 🤖 **IA Assistée :** Intégration possible avec des LLM pour synthétiser les rapports d'investigation.

---

## 🚀 Installation

### Prérequis

- Python 3.9 ou supérieur
- Un environnement virtuel (recommandé)

### Clonage et Configuration

```bash
# Cloner le dépôt
git clone [https://github.com/Hugo-Aliqo/OSINT-Nexus.git](https://github.com/Hugo-Aliqo/OSINT-Nexus.git)
cd OSINT-Nexus

# Installer les dépendances
pip install -r requirements.txt
