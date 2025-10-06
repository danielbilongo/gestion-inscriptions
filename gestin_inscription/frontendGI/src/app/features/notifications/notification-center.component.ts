import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification, NotificationType } from '../../core/models/models';
import { UserPreferencesService } from '../../shared/services/user-preferences.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Centre de Notifications</h1>
            <p class="text-gray-600 mt-2" *ngIf="isCandidate()">Vos notifications personnelles</p>
            <p class="text-gray-600 mt-2" *ngIf="isAdminOrAgent()">Notifications système et utilisateurs</p>
          </div>
          <div *ngIf="isAdminOrAgent()" class="text-right">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <i class="fas fa-shield-alt mr-2"></i>
              {{authService.getUserRole()}}
            </span>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{notifications.length}}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-bell text-blue-600"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Non lues</p>
              <p class="text-2xl font-bold text-gray-900">{{getUnreadCount()}}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-exclamation text-red-600"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600" *ngIf="isCandidate()">Succès</p>
              <p class="text-sm font-medium text-gray-600" *ngIf="isAdminOrAgent()">Validations</p>
              <p class="text-2xl font-bold text-gray-900">{{getCountByType('SUCCESS')}}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check text-green-600"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600" *ngIf="isCandidate()">Alertes</p>
              <p class="text-sm font-medium text-gray-600" *ngIf="isAdminOrAgent()">Problèmes</p>
              <p class="text-2xl font-bold text-gray-900">{{getCountByType('WARNING') + getCountByType('ERROR')}}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-yellow-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres préférences -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="showUnreadOnly" (change)="onPrefsChange()" class="h-4 w-4">
              <span class="text-sm text-gray-700">Afficher uniquement les non lues</span>
            </label>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button class="px-3 py-1 rounded-full text-xs font-medium"
                    [class.bg-blue-100]="isTypeEnabled(NotificationType.INFO)" [class.text-blue-800]="isTypeEnabled(NotificationType.INFO)"
                    [class.bg-gray-100]="!isTypeEnabled(NotificationType.INFO)" [class.text-gray-600]="!isTypeEnabled(NotificationType.INFO)"
                    (click)="toggleType(NotificationType.INFO)">Info</button>
            <button class="px-3 py-1 rounded-full text-xs font-medium"
                    [class.bg-green-100]="isTypeEnabled(NotificationType.SUCCESS)" [class.text-green-800]="isTypeEnabled(NotificationType.SUCCESS)"
                    [class.bg-gray-100]="!isTypeEnabled(NotificationType.SUCCESS)" [class.text-gray-600]="!isTypeEnabled(NotificationType.SUCCESS)"
                    (click)="toggleType(NotificationType.SUCCESS)">
              <span *ngIf="isCandidate()">Succès</span>
              <span *ngIf="isAdminOrAgent()">Validations</span>
            </button>
            <button class="px-3 py-1 rounded-full text-xs font-medium"
                    [class.bg-yellow-100]="isTypeEnabled(NotificationType.WARNING)" [class.text-yellow-800]="isTypeEnabled(NotificationType.WARNING)"
                    [class.bg-gray-100]="!isTypeEnabled(NotificationType.WARNING)" [class.text-gray-600]="!isTypeEnabled(NotificationType.WARNING)"
                    (click)="toggleType(NotificationType.WARNING)">Avertissement</button>
            <button class="px-3 py-1 rounded-full text-xs font-medium"
                    [class.bg-red-100]="isTypeEnabled(NotificationType.ERROR)" [class.text-red-800]="isTypeEnabled(NotificationType.ERROR)"
                    [class.bg-gray-100]="!isTypeEnabled(NotificationType.ERROR)" [class.text-gray-600]="!isTypeEnabled(NotificationType.ERROR)"
                    (click)="toggleType(NotificationType.ERROR)">Erreur</button>
          </div>
        </div>
      </div>

      <!-- Section spéciale candidat -->
      <div *ngIf="isCandidate()" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-lightbulb text-blue-600"></i>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Conseils pour vos candidatures</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">
                  <i class="fas fa-file-alt text-blue-500 mr-2"></i>
                  Documents requis
                </h4>
                <p class="text-sm text-gray-600">Assurez-vous d'avoir tous vos documents à jour</p>
              </div>
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">
                  <i class="fas fa-clock text-green-500 mr-2"></i>
                  Suivi en temps réel
                </h4>
                <p class="text-sm text-gray-600">Recevez des notifications pour chaque étape</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section spéciale admin/agent -->
      <div *ngIf="isAdminOrAgent()" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-cogs text-purple-600"></i>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Gestion des notifications</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">
                  <i class="fas fa-users text-purple-500 mr-2"></i>
                  Notifications utilisateurs
                </h4>
                <p class="text-sm text-gray-600">Suivez les notifications envoyées aux candidats</p>
              </div>
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">
                  <i class="fas fa-chart-line text-blue-500 mr-2"></i>
                  Statistiques système
                </h4>
                <p class="text-sm text-gray-600">Analysez les tendances de notifications</p>
              </div>
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">
                  <i class="fas fa-bell text-yellow-500 mr-2"></i>
                  Alertes importantes
                </h4>
                <p class="text-sm text-gray-600">Recevez les alertes système critiques</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="bg-white rounded-2xl shadow-lg">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">
              <span *ngIf="isCandidate()">Mes notifications</span>
              <span *ngIf="isAdminOrAgent()">Notifications système</span>
            </h2>
            <div class="flex space-x-2">
              <button (click)="markAllAsRead()" class="text-sm text-blue-600 hover:text-blue-800">
                Tout marquer comme lu
              </button>
            </div>
          </div>
        </div>
        
        <div class="divide-y divide-gray-200">
          <div *ngFor="let notification of displayedNotifications" 
               class="p-6 hover:bg-gray-50 transition-colors"
               [class.bg-blue-50]="!notification.isRead">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div [class]="getNotificationIconClass(notification.type)" 
                     class="w-10 h-10 rounded-full flex items-center justify-center">
                  <i [class]="getNotificationIcon(notification.type)" class="text-white"></i>
                </div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900">{{notification.titre}}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">{{formatDate(notification.dateCreation)}}</span>
                    <button *ngIf="!notification.isRead" 
                            (click)="markAsRead(notification.id!)"
                            class="text-blue-600 hover:text-blue-800 text-xs">
                      Marquer comme lu
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{getContextualMessage(notification)}}</p>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center space-x-2">
                    <span [class]="getTypeClass(notification.type)" 
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{getTypeLabel(notification.type)}}
                    </span>
                    <span *ngIf="isAdminOrAgent() && notification.recipientId" 
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      ID: {{notification.recipientId}}
                    </span>
                  </div>
                  <!-- Pas de suppression côté backend -->
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="notifications.length === 0" class="p-12 text-center">
            <i class="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500" *ngIf="isCandidate()">Aucune notification personnelle pour le moment</p>
            <p class="text-gray-500" *ngIf="isAdminOrAgent()">Aucune notification système pour le moment</p>
            <p class="text-sm text-gray-400 mt-2" *ngIf="isCandidate()">
              Vous recevrez des notifications lors de changements d'état de vos dossiers
            </p>
            <p class="text-sm text-gray-400 mt-2" *ngIf="isAdminOrAgent()">
              Les notifications système apparaîtront ici pour les événements importants
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pas de création locale de notification: non supporté par le backend -->
  `
})
export class NotificationCenterComponent implements OnInit {
  notifications: Notification[] = [];
  currentUser: any;
  showUnreadOnly = false;
  enabledTypes: NotificationType[] = [NotificationType.INFO, NotificationType.SUCCESS, NotificationType.WARNING, NotificationType.ERROR];
  // Expose enum to template
  NotificationType = NotificationType;

  constructor(
    private notificationService: NotificationService,
    public authService: AuthService,
    private userPrefs: UserPreferencesService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    // Charger préférences
    const prefs = this.userPrefs.get();
    this.showUnreadOnly = !!prefs.notifications.showUnreadOnly;
    // Conserver l'ordre et filtrer les types valides (convertir strings -> enum)
    const allowed: NotificationType[] = [NotificationType.INFO, NotificationType.SUCCESS, NotificationType.WARNING, NotificationType.ERROR];
    this.enabledTypes = (prefs.notifications.enabledTypes as any[])
      .map(t => NotificationType[t as keyof typeof NotificationType])
      .filter((t: NotificationType | undefined): t is NotificationType => !!t && allowed.includes(t));
    this.loadNotifications();
  }

  isCandidate(): boolean {
    return this.authService.hasRole('ROLE_CANDIDATE');
  }

  isAdminOrAgent(): boolean {
    return this.authService.hasAnyRole(['ROLE_SUPER_ADMIN', 'ROLE_AGENT']);
  }

  loadNotifications() {
    if (!this.currentUser?.id) {
      this.notifications = [];
      return;
    }
    
    this.notificationService.getMyNotifications().subscribe({
      next: (response: any) => {
        this.notifications = response.notifications || [];
        console.log('Notifications chargées:', this.notifications.length);
      },
      error: (err: any) => {
        console.error('Erreur chargement notifications:', err);
        this.notifications = [];
      }
    });
  }

  // Pas de création côté frontend: non supporté par l'API backend

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const n = this.notifications.find(x => x.id === notificationId);
        if (n) n.isRead = true;
      },
      error: (err) => console.error('Erreur marquage notification:', err)
    });
  }

  markAllAsRead() {
    const unread = this.notifications.filter(n => !n.isRead);
    unread.forEach(n => this.markAsRead(n.id!));
  }

  // Préférences et filtrage
  onPrefsChange() {
    // Convertir enum -> strings pour stockage
    const typesAsStrings = this.enabledTypes.map(t => NotificationType[t]);
    this.userPrefs.update({ notifications: { showUnreadOnly: this.showUnreadOnly, enabledTypes: typesAsStrings as any } });
  }

  toggleType(t: NotificationType) {
    if (this.enabledTypes.includes(t)) {
      this.enabledTypes = this.enabledTypes.filter(x => x !== t);
    } else {
      this.enabledTypes = [...this.enabledTypes, t];
    }
    this.onPrefsChange();
  }

  isTypeEnabled(t: NotificationType): boolean {
    return this.enabledTypes.includes(t);
  }

  get displayedNotifications(): Notification[] {
    return this.notifications.filter(n => {
      const typeOk = this.enabledTypes.includes(n.type);
      const unreadOk = this.showUnreadOnly ? !n.isRead : true;
      return typeOk && unreadOk;
    });
  }

  deleteNotification(notificationId: number) {
    if (confirm('Supprimer cette notification?')) {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getCountByType(type: string): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  getNotificationIconClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return 'bg-green-500';
      case NotificationType.WARNING: return 'bg-yellow-500';
      case NotificationType.ERROR: return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return 'fas fa-check';
      case NotificationType.WARNING: return 'fas fa-exclamation-triangle';
      case NotificationType.ERROR: return 'fas fa-times';
      default: return 'fas fa-info';
    }
  }

  getTypeClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return 'bg-green-100 text-green-800';
      case NotificationType.WARNING: return 'bg-yellow-100 text-yellow-800';
      case NotificationType.ERROR: return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  getTypeLabel(type: NotificationType): string {
    if (this.isCandidate()) {
      switch (type) {
        case NotificationType.SUCCESS: return 'Succès';
        case NotificationType.WARNING: return 'Attention';
        case NotificationType.ERROR: return 'Problème';
        default: return 'Information';
      }
    } else {
      switch (type) {
        case NotificationType.SUCCESS: return 'Validation';
        case NotificationType.WARNING: return 'Alerte';
        case NotificationType.ERROR: return 'Erreur système';
        default: return 'Info système';
      }
    }
  }

  getContextualMessage(notification: Notification): string {
    if (this.isCandidate()) {
      // Messages personnalisés pour les candidats
      switch (notification.type) {
        case NotificationType.SUCCESS:
          return notification.message.replace('validé', 'accepté').replace('approuvé', 'validé');
        case NotificationType.WARNING:
          return `⚠️ ${notification.message}`;
        case NotificationType.ERROR:
          return `❌ ${notification.message} - Contactez le support si nécessaire.`;
        default:
          return notification.message;
      }
    } else {
      // Messages pour les admins/agents
      return notification.message;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}