# 🔐 Configuration OAuth2 - Guide Complet

Ce guide vous explique comment configurer l'authentification OAuth2 avec Google et Microsoft pour l'application de gestion d'inscription.

## 📋 Prérequis

- Accès à Google Cloud Console
- Accès à Azure Portal (Microsoft)
- Droits d'administration sur l'application

## 🔵 Configuration Google OAuth2

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet

### Étape 2 : Activer l'API Google+

1. Dans le menu de navigation, allez à **APIs & Services > Library**
2. Recherchez "Google+ API" ou "Google Identity"
3. Cliquez sur **Enable**

### Étape 3 : Créer les identifiants OAuth2

1. Allez à **APIs & Services > Credentials**
2. Cliquez sur **Create Credentials > OAuth 2.0 Client IDs**
3. Sélectionnez **Web application**
4. Configurez :
   - **Name** : `Gestion Inscription - Web Client`
   - **Authorized JavaScript origins** :
     - `http://localhost:4200`
     - `http://localhost:8086`
   - **Authorized redirect URIs** :
     - `http://localhost:8086/oauth2/callback/google`
     - `http://localhost:4200/oauth2/redirect`

5. Cliquez sur **Create**
6. **Copiez le Client ID et Client Secret**

### Étape 4 : Configuration du consentement OAuth

1. Allez à **APIs & Services > OAuth consent screen**
2. Sélectionnez **External** (pour les tests)
3. Remplissez les informations obligatoires :
   - **App name** : `Gestion Inscription`
   - **User support email** : votre email
   - **Developer contact information** : votre email

## 🔷 Configuration Microsoft OAuth2

### Étape 1 : Créer une application Azure AD

1. Allez sur [Azure Portal](https://portal.azure.com/)
2. Naviguez vers **Azure Active Directory > App registrations**
3. Cliquez sur **New registration**

### Étape 2 : Configurer l'application

1. Remplissez les informations :
   - **Name** : `Gestion Inscription`
   - **Supported account types** : `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI** : 
     - Type : `Web`
     - URI : `http://localhost:8086/oauth2/callback/microsoft`

2. Cliquez sur **Register**

### Étape 3 : Obtenir les identifiants

1. Dans la page **Overview** de votre application :
   - **Copiez l'Application (client) ID**
   - **Copiez le Directory (tenant) ID**

2. Allez à **Certificates & secrets**
3. Cliquez sur **New client secret**
4. Ajoutez une description et sélectionnez une expiration
5. **Copiez la valeur du secret** (elle ne sera plus visible après)

### Étape 4 : Configurer les permissions

1. Allez à **API permissions**
2. Cliquez sur **Add a permission**
3. Sélectionnez **Microsoft Graph**
4. Choisissez **Delegated permissions**
5. Ajoutez les permissions :
   - `openid`
   - `profile`
   - `email`
   - `User.Read`

6. Cliquez sur **Grant admin consent** (si vous êtes admin)

## ⚙️ Configuration Backend

### Mettre à jour application.properties

Remplacez les placeholders dans `src/main/resources/application.properties` :

```properties
# OAuth2 Configuration - Google
spring.security.oauth2.client.registration.google.client-id=VOTRE_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=VOTRE_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/oauth2/callback/{registrationId}

# OAuth2 Configuration - Microsoft
spring.security.oauth2.client.registration.microsoft.client-id=VOTRE_MICROSOFT_CLIENT_ID
spring.security.oauth2.client.registration.microsoft.client-secret=VOTRE_MICROSOFT_CLIENT_SECRET
spring.security.oauth2.client.registration.microsoft.scope=openid,profile,email
spring.security.oauth2.client.registration.microsoft.redirect-uri={baseUrl}/oauth2/callback/{registrationId}
spring.security.oauth2.client.registration.microsoft.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.microsoft.client-name=Microsoft

# Providers Microsoft
spring.security.oauth2.client.provider.microsoft.authorization-uri=https://login.microsoftonline.com/common/oauth2/v2.0/authorize
spring.security.oauth2.client.provider.microsoft.token-uri=https://login.microsoftonline.com/common/oauth2/v2.0/token
spring.security.oauth2.client.provider.microsoft.user-info-uri=https://graph.microsoft.com/v1.0/me
spring.security.oauth2.client.provider.microsoft.user-name-attribute=id
```

### Variables d'environnement (Recommandé)

Pour la sécurité, utilisez des variables d'environnement :

```bash
# Google
export GOOGLE_CLIENT_ID="votre_google_client_id"
export GOOGLE_CLIENT_SECRET="votre_google_client_secret"

# Microsoft
export MICROSOFT_CLIENT_ID="votre_microsoft_client_id"
export MICROSOFT_CLIENT_SECRET="votre_microsoft_client_secret"
```

Puis dans `application.properties` :

```properties
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.microsoft.client-id=${MICROSOFT_CLIENT_ID}
spring.security.oauth2.client.registration.microsoft.client-secret=${MICROSOFT_CLIENT_SECRET}
```

## 🧪 Tests

### Test Google OAuth2

1. Démarrez l'application backend
2. Allez sur `http://localhost:4200/auth/register`
3. Cliquez sur le bouton **Google**
4. Vous devriez être redirigé vers Google
5. Après authentification, retour sur `http://localhost:4200/oauth2/redirect`
6. Puis redirection vers le dashboard

### Test Microsoft OAuth2

1. Même processus avec le bouton **Microsoft**
2. Redirection vers Microsoft/Azure AD
3. Authentification et retour sur l'application

## 🔍 Débogage

### Logs utiles

Activez les logs de debug dans `application.properties` :

```properties
logging.level.org.springframework.security.oauth2=DEBUG
logging.level.org.springframework.web.client.RestTemplate=DEBUG
```

### Erreurs communes

1. **Invalid redirect_uri** :
   - Vérifiez que l'URI de redirection est exactement la même
   - Attention aux trailing slashes

2. **Invalid client_id** :
   - Vérifiez que le client ID est correct
   - Pas d'espaces avant/après

3. **Access denied** :
   - Vérifiez les permissions/scopes
   - Consentement admin requis pour Microsoft

4. **CORS errors** :
   - Vérifiez la configuration CORS dans le backend
   - Origins autorisées

### URLs de test

- **Google OAuth2** : `http://localhost:8086/oauth2/authorization/google`
- **Microsoft OAuth2** : `http://localhost:8086/oauth2/authorization/microsoft`

## 🚀 Déploiement en production

### Domaines de production

Ajoutez vos domaines de production dans :

1. **Google Cloud Console** :
   - Authorized JavaScript origins : `https://votre-domaine.com`
   - Authorized redirect URIs : `https://votre-domaine.com/oauth2/callback/google`

2. **Azure Portal** :
   - Redirect URIs : `https://votre-domaine.com/oauth2/callback/microsoft`

### Variables d'environnement production

```bash
# Production
GOOGLE_CLIENT_ID="prod_google_client_id"
GOOGLE_CLIENT_SECRET="prod_google_client_secret"
MICROSOFT_CLIENT_ID="prod_microsoft_client_id"
MICROSOFT_CLIENT_SECRET="prod_microsoft_client_secret"
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs de l'application
2. Testez les URLs OAuth2 directement
3. Vérifiez la configuration des providers
4. Consultez la documentation officielle :
   - [Google OAuth2](https://developers.google.com/identity/protocols/oauth2)
   - [Microsoft OAuth2](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

---

✅ **Configuration terminée !** Vos utilisateurs peuvent maintenant s'inscrire via Google et Microsoft OAuth2.
