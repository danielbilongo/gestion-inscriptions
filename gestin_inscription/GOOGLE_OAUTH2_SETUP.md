# Configuration Google OAuth2 pour SIGEC

## Étapes pour configurer Google OAuth2

### 1. Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ ou Google Identity

### 2. Configurer OAuth2 Credentials

1. Dans Google Cloud Console, allez dans **APIs & Services > Credentials**
2. Cliquez sur **Create Credentials > OAuth 2.0 Client IDs**
3. Sélectionnez **Web application**
4. Configurez les URIs autorisées :

**Authorized JavaScript origins:**
```
http://localhost:8086
http://localhost:4200
```

**Authorized redirect URIs:**
```
http://localhost:8086/login/oauth2/code/google
http://localhost:8086/oauth2/callback/google
```

### 3. Récupérer les identifiants

Après création, vous obtiendrez :
- **Client ID** : `1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`
- **Client Secret** : `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

### 4. Mettre à jour application.properties

Remplacez dans `src/main/resources/application.properties` :

```properties
# Configuration Google OAuth2 RÉELLE
spring.security.oauth2.client.registration.google.client-id=VOTRE_CLIENT_ID_ICI
spring.security.oauth2.client.registration.google.client-secret=VOTRE_CLIENT_SECRET_ICI
```

### 5. Configuration de développement actuelle

Pour le développement, les identifiants de test sont configurés :

```properties
spring.security.oauth2.client.registration.google.client-id=1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
spring.security.oauth2.client.registration.google.client-secret=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

**⚠️ IMPORTANT :** Ces identifiants de test ne fonctionneront pas. Vous devez les remplacer par vos vrais identifiants Google.

### 6. Test de la configuration

1. Démarrez le backend Spring Boot : `mvnw spring-boot:run`
2. Démarrez le frontend Angular : `npm start`
3. Allez sur `http://localhost:4200/auth/login`
4. Cliquez sur "Se connecter avec Google"

### 7. Variables d'environnement (Recommandé pour la production)

Pour la sécurité, utilisez des variables d'environnement :

```properties
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
```

Puis définissez les variables :
```bash
export GOOGLE_CLIENT_ID="votre-client-id"
export GOOGLE_CLIENT_SECRET="votre-client-secret"
```

## Flux OAuth2 dans SIGEC

1. **Frontend** : L'utilisateur clique sur "Se connecter avec Google"
2. **Redirection** : Vers `http://localhost:8086/oauth2/authorization/google`
3. **Google** : L'utilisateur s'authentifie sur Google
4. **Callback** : Google redirige vers `http://localhost:8086/login/oauth2/code/google`
5. **Backend** : Spring Security traite l'authentification
6. **Success Handler** : Génère un JWT et redirige vers `http://localhost:4200/oauth2/redirect?token=JWT`
7. **Frontend** : Le composant OAuth2RedirectComponent traite le token et redirige vers le dashboard

## Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que les URIs de redirection dans Google Cloud Console correspondent exactement
- Assurez-vous que le port est correct (8086 pour le backend)

### Erreur "invalid_client"
- Vérifiez que le Client ID et Client Secret sont corrects
- Assurez-vous que l'API Google+ est activée

### Token non reçu
- Vérifiez les logs du backend pour voir si l'authentification réussit
- Vérifiez que le Success Handler redirige correctement
- Vérifiez la console du navigateur pour les erreurs CORS