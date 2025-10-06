# 🔧 Guide de Configuration SIGEC

## 🚀 Démarrage Rapide

### 1. Configuration des Variables d'Environnement

```bash
# Copiez le fichier d'exemple
cp .env.example .env

# Éditez le fichier .env avec vos vraies valeurs
nano .env
```

### 2. Profils d'Environnement

- **Développement** : `spring.profiles.active=dev`
- **Production** : `spring.profiles.active=prod`

## 🔐 Configuration OAuth2

### Google OAuth2

1. **Accédez à [Google Cloud Console](https://console.cloud.google.com/)**
2. **Créez un nouveau projet** ou sélectionnez un existant
3. **Activez l'API Google+ API**
4. **Créez des identifiants OAuth 2.0** :
   - Type : Application Web
   - URIs de redirection autorisées : `http://localhost:8086/oauth2/callback/google`
   - Pour production : `https://votre-domaine.com/oauth2/callback/google`

5. **Ajoutez dans votre .env** :
```env
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
```

### Microsoft OAuth2

1. **Accédez à [Azure Portal](https://portal.azure.com/)**
2. **Azure Active Directory > Inscriptions d'applications**
3. **Nouvelle inscription** :
   - Nom : SIGEC
   - Types de comptes : Comptes dans un annuaire organisationnel et comptes personnels Microsoft
   - URI de redirection : `http://localhost:8086/oauth2/callback/microsoft`

4. **Ajoutez dans votre .env** :
```env
MICROSOFT_CLIENT_ID=votre_client_id_microsoft
MICROSOFT_CLIENT_SECRET=votre_client_secret_microsoft
```

## 🛡️ Configuration reCAPTCHA

1. **Accédez à [Google reCAPTCHA](https://www.google.com/recaptcha/admin)**
2. **Créez un nouveau site** :
   - Type : reCAPTCHA v2
   - Domaines : localhost, votre-domaine.com

3. **Ajoutez dans votre .env** :
```env
RECAPTCHA_SITE_KEY=votre_site_key
RECAPTCHA_SECRET_KEY=votre_secret_key
```

## 📧 Configuration Email

### Gmail avec App Password

1. **Activez la vérification en 2 étapes** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Compte Google > Sécurité > Mots de passe des applications
   - Sélectionnez "Autre" et nommez "SIGEC"

3. **Ajoutez dans votre .env** :
```env
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_application
```

## 📱 Configuration SMS (Twilio)

1. **Créez un compte [Twilio](https://www.twilio.com/)**
2. **Obtenez vos identifiants** depuis le dashboard
3. **Ajoutez dans votre .env** :
```env
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
```

## 🔑 Génération de Clé JWT Sécurisée

```bash
# Générez une clé JWT forte (256 bits minimum)
openssl rand -base64 64
```

Ajoutez le résultat dans votre .env :
```env
JWT_SECRET=la_cle_generee_ici
```

## 🗄️ Configuration Base de Données

### PostgreSQL

```sql
-- Créez les bases de données
CREATE DATABASE sigec_dev;
CREATE DATABASE sigec_prod;

-- Créez un utilisateur dédié (recommandé pour production)
CREATE USER sigec_user WITH PASSWORD 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE sigec_prod TO sigec_user;
```

## 🚀 Déploiement

### Variables d'Environnement Obligatoires pour Production

```env
# OBLIGATOIRES
DATABASE_PASSWORD=***
JWT_SECRET=***
MAIL_PASSWORD=***
ADMIN_PASSWORD=***

# OPTIONNELLES (mais recommandées)
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
RECAPTCHA_SITE_KEY=***
RECAPTCHA_SECRET_KEY=***
```

### Commandes de Déploiement

```bash
# Compilation
mvn clean package -Pprod

# Lancement en production
java -jar target/sigec-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 🔍 Vérification de Configuration

### Endpoints de Santé

- **Swagger UI** : `http://localhost:8086/swagger-ui.html`
- **Actuator Health** : `http://localhost:8086/actuator/health` (si activé)

### Tests de Fonctionnalités

1. **Authentification** : Testez login/logout
2. **OAuth2** : Testez connexion Google/Microsoft
3. **Email** : Vérifiez réception des emails
4. **reCAPTCHA** : Testez sur formulaires publics

## ⚠️ Sécurité

### Checklist de Sécurité

- [ ] Variables sensibles externalisées
- [ ] Profil production configuré (`validate` au lieu de `create-drop`)
- [ ] Clé JWT forte (256+ bits)
- [ ] Mots de passe admin sécurisés
- [ ] HTTPS activé en production
- [ ] Logs de sécurité désactivés en production

### Fichiers à Ignorer (.gitignore)

```gitignore
# Variables d'environnement
.env
.env.local
.env.production

# Logs
logs/
*.log

# Configuration locale
application-local.properties
```

## 🆘 Dépannage

### Problèmes Courants

1. **Erreur OAuth2** : Vérifiez les URIs de redirection
2. **Erreur Email** : Vérifiez le mot de passe d'application Gmail
3. **Erreur JWT** : Vérifiez la longueur de la clé secrète
4. **Erreur Base de Données** : Vérifiez les permissions utilisateur

### Logs Utiles

```bash
# Logs de sécurité (développement uniquement)
logging.level.org.springframework.security=DEBUG

# Logs SQL (développement uniquement)
spring.jpa.show-sql=true
```
