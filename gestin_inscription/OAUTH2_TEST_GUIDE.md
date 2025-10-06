# Guide de Test OAuth2 - SIGEC

## 🚀 Test Rapide de l'Authentification Google

### Configuration Actuelle
✅ **Mode Développement Activé** - Les boutons OAuth2 utilisent des endpoints de test

### Comment Tester

1. **Démarrer le Backend** (dans le dossier `gestin_inscription`) :
   ```bash
   mvnw spring-boot:run
   ```

2. **Démarrer le Frontend** (dans le dossier `frontendGI`) :
   ```bash
   npm start
   ```

3. **Accéder à l'Application** :
   - Ouvrez votre navigateur sur `http://localhost:4200`
   - Cliquez sur "Se connecter" ou allez directement sur `http://localhost:4200/auth/login`

4. **Tester l'Authentification Google** :
   - Cliquez sur le bouton "Google (Test)"
   - Vous serez automatiquement connecté avec un compte de test
   - Redirection automatique vers le dashboard

### Comptes de Test Créés Automatiquement

**Google Test :**
- Email : `test.google@example.com`
- Nom : Test Google
- Rôle : AGENT

**Microsoft Test :**
- Email : `test.microsoft@example.com`
- Nom : Test Microsoft
- Rôle : AGENT

### Flux de Test

1. **Clic sur "Google (Test)"** → `http://localhost:8086/api/oauth2/test/google`
2. **Backend** crée/récupère l'utilisateur de test
3. **JWT généré** et redirection vers `http://localhost:4200/oauth2/redirect?token=JWT`
4. **Frontend** traite le token et redirige vers `/dashboard`

### Vérifications

✅ **Token JWT** : Vérifiez dans les outils de développement (localStorage)
✅ **Redirection** : Doit aller vers `/dashboard` après connexion
✅ **Authentification** : L'utilisateur doit être connecté
✅ **Logs** : Vérifiez les logs du backend pour la connexion réussie

### Dépannage

**Erreur "Connection Refused"** :
- Vérifiez que le backend Spring Boot est démarré sur le port 8086
- Vérifiez les logs du backend

**Token non reçu** :
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que l'URL de redirection est correcte

**Erreur CORS** :
- La configuration CORS est déjà configurée pour `localhost:4200`

### Passer en Mode Production

Pour utiliser de vrais identifiants Google :

1. **Créer un projet Google Cloud Console**
2. **Configurer OAuth2 Credentials**
3. **Mettre à jour `application.properties`** :
   ```properties
   spring.security.oauth2.client.registration.google.client-id=VOTRE_VRAI_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=VOTRE_VRAI_CLIENT_SECRET
   ```
4. **Changer l'environnement** dans `environment.prod.ts` :
   ```typescript
   export const environment = {
     production: true,
     // ...
   };
   ```

### Endpoints Disponibles

**Test (Développement uniquement) :**
- `GET /api/oauth2/test/google` - Simule connexion Google
- `GET /api/oauth2/test/microsoft` - Simule connexion Microsoft

**Production :**
- `GET /oauth2/authorization/google` - Vraie connexion Google
- `GET /oauth2/authorization/microsoft` - Vraie connexion Microsoft

---

**🎯 Résultat Attendu :** Connexion réussie avec redirection vers le dashboard et utilisateur authentifié.