# 🔧 Configuration OAuth2 Google pour Développement Local

## 📋 Prérequis
- Compte Google
- Projet Google Cloud Console

## 🚀 Configuration Google Cloud Console

### 1. Créer/Sélectionner un Projet
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Nom suggéré : "SIGEC-Dev"

### 2. Activer l'API Google+
1. **APIs & Services > Library**
2. Recherchez "Google+ API"
3. Cliquez sur **Enable**

### 3. Créer les Identifiants OAuth2
1. **APIs & Services > Credentials**
2. **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
3. **Application type** : Web application
4. **Name** : SIGEC Local Development

### 4. Configurer les URIs de Redirection
**Authorized JavaScript origins:**
```
http://localhost:8086
http://localhost:4200
```

**Authorized redirect URIs:**
```
http://localhost:8086/oauth2/callback/google
http://localhost:8086/login/oauth2/code/google
```

### 5. Récupérer les Identifiants
- **Client ID** : `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret** : `GOCSPX-abcdef123456`

## ⚙️ Configuration Application

### 1. Créer le fichier .env
```bash
# Dans le dossier racine du projet backend
cp .env.example .env
```

### 2. Ajouter les Credentials Google
```env
# OAuth2 Google
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456
```

### 3. Modifier application-dev.properties
```properties
# OAuth2 Google pour développement
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8086/login/oauth2/code/google
```

## 🧪 Test de Fonctionnement

### 1. Démarrer l'Application
```bash
# Backend
mvn spring-boot:run

# Frontend (dans un autre terminal)
cd frontendGI
ng serve
```

### 2. Tester OAuth2 Google
1. Allez sur `http://localhost:4200`
2. Cliquez sur "Connexion avec Google"
3. Vous devriez être redirigé vers Google
4. Après autorisation, retour automatique vers l'application

### 3. Vérifier les Logs
```bash
# Logs backend - recherchez :
[INFO] OAuth2 authentication successful for user: votre-email@gmail.com
[INFO] JWT token generated for OAuth2 user
```

## 🐛 Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans Google Console correspond exactement
- Format exact : `http://localhost:8086/login/oauth2/code/google`

### Erreur "invalid_client"
- Vérifiez que le Client ID et Secret sont corrects
- Assurez-vous que les variables d'environnement sont bien chargées

### Erreur de CORS
- Ajoutez `http://localhost:4200` dans les origines autorisées de Google Console

## 📝 URLs Importantes

- **Google Console** : https://console.cloud.google.com/
- **OAuth2 Playground** : https://developers.google.com/oauthplayground/
- **Documentation** : https://developers.google.com/identity/protocols/oauth2

## ✅ Checklist de Vérification

- [ ] Projet Google Cloud créé
- [ ] API Google+ activée
- [ ] Identifiants OAuth2 créés
- [ ] URIs de redirection configurées
- [ ] Variables d'environnement définies
- [ ] Application redémarrée
- [ ] Test de connexion effectué
