# SIGEC - Système Intégré de Gestion des Candidatures

## 🚀 Démarrage Rapide

### Prérequis
- Java 17+
- PostgreSQL 12+
- Node.js 18+ (pour le frontend)
- Maven 3.8+
# 🔑 Guide de génération des clés OAuth Google

Pour utiliser l’authentification Google dans ce projet, vous devez générer vos propres clés **Client ID** et **Client Secret**.

## Étapes à suivre

1. **Accéder à la console Google Cloud**
   👉 [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Créer un projet (si nécessaire)**

    * Cliquez sur **Sélectionner un projet** → **Nouveau projet**.
    * Donnez-lui un nom (ex : `gestion-inscription`).
    * Validez.

3. **Activer l’API Google OAuth**

    * Dans le menu de gauche, allez dans **API & Services → Bibliothèque**.
    * Recherchez **"Google Identity Services"**.
    * Cliquez sur **Activer**.

4. **Créer les identifiants OAuth**

    * Allez dans **API & Services → Identifiants**.
    * Cliquez sur **+ Créer des identifiants** → **ID client OAuth**.
    * Sélectionnez **Application Web**.
    * Ajoutez vos **URIs autorisés** (ex : `http://localhost:8080` ou l’URL de votre appli en production).
    * Ajoutez vos **URIs de redirection** (ex : `http://localhost:8080/login/oauth2/code/google`).
    * Cliquez sur **Créer**.

5. **Récupérer vos clés**

    * Une fois créé, vous obtiendrez :

        * **Client ID**
        * **Client Secret**

6. **Configurer votre projet**
   Dans `application.properties` (ou `.env` si vous utilisez un fichier d’environnement) :

   ```properties
   spring.security.oauth2.client.registration.google.client-id=VOTRE_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=VOTRE_CLIENT_SECRET
   ```

⚠️ **Ne commitez jamais ces clés sur GitHub !**
Utilisez plutôt un fichier `.env` (ajouté dans `.gitignore`) ou des variables d’environnement.

## Ressources utiles

* [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
* [Guide Spring Security OAuth2](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)

### Configuration2

1. **Copier le fichier d'environnement**
```bash
cp .env.example .env
```

2. **Configurer les variables d'environnement**
```bash
# Base de données
DB_URL=jdbc:postgresql://localhost:5432/gestion_inscription2
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_256_bits
JWT_EXPIRATION=86400000

# Email
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

3. **Démarrer l'application**
```bash
# Backend
mvn spring-boot:run

# Frontend
cd frontendGI
npm install
ng serve
```

## 🏗️ Architecture

### Backend (Spring Boot)
- **Contrôleurs** : Gestion des endpoints REST
- **Services** : Logique métier
- **Repositories** : Accès aux données
- **Security** : JWT + OAuth2 + RBAC
- **Exception Handling** : Gestion centralisée des erreurs

### Frontend (Angular)
- **Components** : Interface utilisateur
- **Services** : Communication avec l'API
- **Guards** : Protection des routes
- **Interceptors** : Gestion automatique des tokens

## 🔒 Sécurité

### Authentification
- **JWT** avec expiration configurable
- **OAuth2** (Google, Microsoft)
- **reCAPTCHA** pour la protection anti-bot

### Autorisation
- **RBAC** : CANDIDATE, AGENT, SUPER_ADMIN
- **Guards** côté frontend
- **@PreAuthorize** côté backend

### Bonnes Pratiques Appliquées
- ✅ Variables d'environnement pour les secrets
- ✅ Validation Bean avec annotations
- ✅ Gestion d'erreurs globale
- ✅ Logging structuré (SLF4J)
- ✅ Profils séparés (dev/prod)
- ✅ Tests unitaires
- ✅ Monitoring avec Actuator

## 📊 Monitoring

### Endpoints Actuator
- `/actuator/health` - État de l'application
- `/actuator/info` - Informations système
- `/actuator/metrics` - Métriques de performance

### Logs
```bash
# Développement
logging.level.com.groupe.gestin_inscription=DEBUG

# Production
logging.level.root=INFO
```

## 🧪 Tests

### Exécuter les tests
```bash
mvn test
```

### Structure des tests
```
src/test/java/
├── services/          # Tests unitaires des services
├── controllers/       # Tests d'intégration des contrôleurs
└── security/         # Tests de sécurité
```

## 🚀 Déploiement

### Profils
- **dev** : Développement local
- **prod** : Production

### Variables d'environnement Production
```bash
SPRING_PROFILES_ACTIVE=prod
DB_PASSWORD=secure_production_password
JWT_SECRET=super_secure_production_jwt_key
SSL_ENABLED=true
```

## 📝 API Documentation

Swagger UI disponible sur : `http://localhost:8086/swagger-ui.html`

## 🔧 Configuration Avancée

### Base de données
```properties
# Développement
spring.jpa.hibernate.ddl-auto=create-drop

# Production
spring.jpa.hibernate.ddl-auto=validate
```

### CORS
```properties
# Développement
app.cors.allowed-origins=http://localhost:4200

# Production
app.cors.allowed-origins=https://yourdomain.com
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.