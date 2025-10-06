import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserDataManagerService } from '../services/user-data-manager.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataCleanupService {
  private currentUserId: string | number | null = null;

  constructor(
    private authService: AuthService,
    private userDataManager: UserDataManagerService
  ) {
    // Surveiller les changements d'utilisateur
    this.authService.currentUser.subscribe(user => {
      const newUserId = user?.id || null;
      
      if (this.currentUserId !== null && this.currentUserId !== newUserId) {
        // L'utilisateur a changé, nettoyer les données de l'ancien utilisateur
        console.log('Changement d\'utilisateur détecté, nettoyage des données...');
        this.userDataManager.clearCurrentUserData();
      }
      
      this.currentUserId = newUserId;
    });
  }

  /**
   * Nettoie manuellement les données lors de la déconnexion
   */
  cleanupOnLogout(): void {
    this.userDataManager.clearCurrentUserData();
    this.currentUserId = null;
  }
}