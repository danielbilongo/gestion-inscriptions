// Script de débogage pour tester la sauvegarde automatique
// À utiliser dans la console du navigateur pour diagnostiquer les problèmes

export function debugAutoSave() {
  console.log('=== DEBUG AUTO-SAVE ===');
  
  // Vérifier l'utilisateur actuel
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    try {
      const user = JSON.parse(authToken);
      console.log('✅ Utilisateur connecté:', user);
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du token:', error);
    }
  } else {
    console.warn('⚠️ Aucun utilisateur connecté');
  }
  
  // Vérifier les clés de stockage
  console.log('\n=== CLÉS DE STOCKAGE ===');
  const storageKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('autosave_')) {
      storageKeys.push(key);
    }
  }
  
  if (storageKeys.length > 0) {
    console.log('✅ Clés de sauvegarde trouvées:');
    storageKeys.forEach(key => {
      const data = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(data || '{}');
        console.log(`   - ${key}:`, {
          timestamp: parsed.timestamp,
          userId: parsed.userId,
          dataSize: JSON.stringify(parsed.data || {}).length
        });
      } catch (error) {
        console.log(`   - ${key}: Données corrompues`);
      }
    });
  } else {
    console.warn('⚠️ Aucune donnée de sauvegarde trouvée');
  }
  
  // Vérifier l'espace de stockage
  console.log('\n=== ESPACE DE STOCKAGE ===');
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  
  const maxStorage = 5 * 1024 * 1024; // 5MB
  const percentage = (totalSize / maxStorage) * 100;
  
  console.log(`📊 Utilisation: ${(totalSize / 1024).toFixed(2)} KB / ${(maxStorage / 1024 / 1024).toFixed(2)} MB (${percentage.toFixed(1)}%)`);
  
  if (percentage > 80) {
    console.warn('⚠️ Espace de stockage critique!');
  }
  
  console.log('=== FIN DEBUG ===');
}

// Fonction pour nettoyer manuellement les données
export function cleanupAutoSave() {
  console.log('🧹 Nettoyage des données de sauvegarde...');
  
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('autosave_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   - Supprimé: ${key}`);
  });
  
  console.log(`✅ ${keysToRemove.length} entrées supprimées`);
}

// Fonction pour simuler des données de test
export function createTestData() {
  console.log('🧪 Création de données de test...');
  
  const testData = {
    personalInfo: {
      lastName: 'Test',
      firstNames: ['Utilisateur'],
      gender: 'M',
      birthDate: '1990-01-01',
      nationality: 'Cameroun',
      idType: 'CNI'
    },
    contactInfo: {
      email: 'test@example.com',
      phone: '+237600000000'
    }
  };
  
  const user = { id: 'test_user_123' };
  const storageKey = `autosave_${user.id}_registration_form_data`;
  
  localStorage.setItem(storageKey, JSON.stringify({
    data: testData,
    timestamp: new Date().toISOString(),
    version: '1.0',
    userId: user.id
  }));
  
  console.log('✅ Données de test créées avec la clé:', storageKey);
}

// Rendre les fonctions disponibles globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).debugAutoSave = debugAutoSave;
  (window as any).cleanupAutoSave = cleanupAutoSave;
  (window as any).createTestData = createTestData;
}