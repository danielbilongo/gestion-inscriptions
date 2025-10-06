import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AutoSaveService } from './auto-save.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataManagerService {
  
  constructor(
    private authService: AuthService,
    private autoSaveService: AutoSaveService
  ) {}

  /**
   * Nettoie toutes les données de l'utilisateur actuel
   */
  clearCurrentUserData(): void {
    try {
      this.autoSaveService.clearUserData();
      console.log('Données utilisateur nettoyées avec succès');
    } catch (error) {
      console.error('Erreur lors du nettoyage des données utilisateur:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur actuel a des données sauvegardées
   */
  hasCurrentUserData(key?: string): boolean {
    return this.autoSaveService.hasUserData(key);
  }

  /**
   * Sauvegarde des données pour l'utilisateur actuel
   */
  saveUserData<T>(key: string, data: T): void {
    this.autoSaveService.saveData(key, data);
  }

  /**
   * Charge des données pour l'utilisateur actuel
   */
  loadUserData<T>(key: string): T | null {
    return this.autoSaveService.loadData<T>(key);
  }

  /**
   * Nettoie les données lors du changement d'utilisateur
   */
  onUserChange(newUserId?: string): void {
    // Nettoyer les données de l'ancien utilisateur si nécessaire
    this.clearCurrentUserData();
  }
}