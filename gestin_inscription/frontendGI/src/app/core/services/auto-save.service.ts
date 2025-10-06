import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService {
  private readonly SAVE_DEBOUNCE_TIME = 2000; // 2 secondes
  private readonly STORAGE_PREFIX = 'autosave_';
  
  private statusSubject = new BehaviorSubject<AutoSaveStatus>({ status: 'idle' });
  public status$ = this.statusSubject.asObservable();

  constructor(private authService: AuthService) {}

  /**
   * Génère une clé de stockage spécifique à l'utilisateur
   */
  private getUserSpecificKey(key: string): string {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id;
    
    // Si pas d'utilisateur connecté, essayer de récupérer depuis le token stocké
    if (!userId) {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const user = JSON.parse(storedToken);
          if (user?.id) {
            return `${this.STORAGE_PREFIX}${user.id}_${key}`;
          }
        } catch (error) {
          console.warn('Erreur lors de la lecture du token stocké:', error);
        }
      }
      return `${this.STORAGE_PREFIX}anonymous_${key}`;
    }
    
    return `${this.STORAGE_PREFIX}${userId}_${key}`;
  }

  /**
   * Sauvegarde automatique avec debounce
   */
  autoSave<T>(key: string, data$: Observable<T>): Observable<T> {
    return new Observable(observer => {
      const subscription = data$
        .pipe(
          debounceTime(this.SAVE_DEBOUNCE_TIME),
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe({
          next: (data) => {
            this.saveData(key, data);
            observer.next(data);
          },
          error: (error) => {
            this.updateStatus({ status: 'error', error: error.message });
            observer.error(error);
          }
        });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Sauvegarde immédiate
   */
  saveData<T>(key: string, data: T): void {
    try {
      this.updateStatus({ status: 'saving' });
      
      const storageKey = this.getUserSpecificKey(key);
      const serializedData = JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: '1.0',
        userId: this.authService.getCurrentUser()?.id
      });
      
      localStorage.setItem(storageKey, serializedData);
      
      this.updateStatus({ 
        status: 'saved', 
        lastSaved: new Date() 
      });
      
      // Retour à idle après 3 secondes
      timer(3000).subscribe(() => {
        if (this.statusSubject.value.status === 'saved') {
          this.updateStatus({ status: 'idle' });
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      this.updateStatus({ 
        status: 'error', 
        error: 'Erreur de sauvegarde' 
      });
    }
  }

  /**
   * Chargement des données sauvegardées
   */
  loadData<T = any>(key: string): T | null {
    try {
      const storageKey = this.getUserSpecificKey(key);
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // Vérifier la validité des données (pas trop anciennes)
      const savedDate = new Date(parsed.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff > 7) { // Données de plus de 7 jours
        this.clearData(key);
        return null;
      }
      
      return parsed.data as T;
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      return null;
    }
  }

  /**
   * Suppression des données sauvegardées
   */
  clearData(key: string): void {
    try {
      const storageKey = this.getUserSpecificKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  /**
   * Vérification de l'espace de stockage disponible
   */
  checkStorageSpace(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Estimation de l'espace disponible (5MB pour localStorage)
      const maxStorage = 5 * 1024 * 1024; // 5MB
      const available = maxStorage - used;
      const percentage = (used / maxStorage) * 100;
      
      return { used, available, percentage };
      
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Nettoyage automatique des anciennes données
   */
  cleanupOldData(): void {
    try {
      const keysToRemove: string[] = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 jours
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const savedDate = new Date(data.timestamp);
            
            if (savedDate < cutoffDate) {
              keysToRemove.push(key);
            }
          } catch {
            // Données corrompues, les supprimer
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Nettoyage automatique: ${keysToRemove.length} entrées supprimées`);
      
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Sauvegarde de récupération d'urgence
   */
  createEmergencyBackup<T>(key: string, data: T): void {
    try {
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || 'anonymous';
      const backupKey = `${this.STORAGE_PREFIX}${userId}_emergency_${key}`;
      const backupData = {
        data,
        timestamp: new Date().toISOString(),
        type: 'emergency_backup',
        userId: userId
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde d\'urgence:', error);
    }
  }

  /**
   * Récupération de la sauvegarde d'urgence
   */
  restoreEmergencyBackup<T>(key: string): T | null {
    try {
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || 'anonymous';
      const backupKey = `${this.STORAGE_PREFIX}${userId}_emergency_${key}`;
      const backup = localStorage.getItem(backupKey);
      
      if (!backup) return null;
      
      const parsed = JSON.parse(backup);
      return parsed.data as T;
      
    } catch (error) {
      console.error('Erreur lors de la récupération d\'urgence:', error);
      return null;
    }
  }

  /**
   * Synchronisation avec le serveur (simulation)
   */
  syncWithServer<T>(key: string, data: T): Observable<boolean> {
    return new Observable(observer => {
      // Simulation d'une synchronisation serveur
      setTimeout(() => {
        try {
          // Ici, on ferait un appel HTTP vers le serveur
          console.log(`Synchronisation serveur pour ${key}:`, data);
          observer.next(true);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1000);
    });
  }

  /**
   * Détection de changements de connectivité
   */
  onlineStatusChanged(): Observable<boolean> {
    return new Observable(observer => {
      const updateOnlineStatus = () => observer.next(navigator.onLine);
      
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // État initial
      updateOnlineStatus();
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    });
  }

  private updateStatus(status: AutoSaveStatus): void {
    this.statusSubject.next({ ...this.statusSubject.value, ...status });
  }

  /**
   * Obtenir le statut actuel
   */
  getCurrentStatus(): AutoSaveStatus {
    return this.statusSubject.value;
  }

  /**
   * Réinitialiser le statut
   */
  resetStatus(): void {
    this.updateStatus({ status: 'idle' });
  }

  /**
   * Nettoyer toutes les données d'un utilisateur spécifique
   */
  clearUserData(userId?: string): void {
    try {
      const targetUserId = userId || this.authService.getCurrentUser()?.id;
      if (!targetUserId) return;
      
      const keysToRemove: string[] = [];
      const userPrefix = `${this.STORAGE_PREFIX}${targetUserId}_`;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userPrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Nettoyage utilisateur ${targetUserId}: ${keysToRemove.length} entrées supprimées`);
      
    } catch (error) {
      console.error('Erreur lors du nettoyage des données utilisateur:', error);
    }
  }

  /**
   * Vérifier si des données existent pour l'utilisateur actuel
   */
  hasUserData(key?: string): boolean {
    try {
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) return false;
      
      if (key) {
        const storageKey = this.getUserSpecificKey(key);
        return localStorage.getItem(storageKey) !== null;
      } else {
        const userPrefix = `${this.STORAGE_PREFIX}${userId}_`;
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.startsWith(userPrefix)) {
            return true;
          }
        }
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Forcer le rechargement des données après authentification
   */
  reloadUserData(): void {
    // Nettoyer le cache de statut
    this.resetStatus();
  }
}