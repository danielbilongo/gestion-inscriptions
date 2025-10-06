import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SMSMessage {
  to: string;
  message: string;
  type: 'reminder' | 'notification' | 'verification' | 'alert';
  scheduledFor?: Date;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
  status?: 'sent' | 'delivered' | 'failed' | 'pending';
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  type: 'reminder' | 'notification' | 'verification' | 'alert';
}

export interface SMSSettings {
  enabled: boolean;
  defaultCountryCode: string;
  reminderTime: string;
  maxDailyMessages: number;
  templates: SMSTemplate[];
}

@Injectable({
  providedIn: 'root'
})
export class SMSService {
  private apiUrl = `${environment.apiUrl}/sms`;
  private settingsSubject = new BehaviorSubject<SMSSettings>(this.getDefaultSettings());
  public settings$ = this.settingsSubject.asObservable();

  // Templates prédéfinis
  private defaultTemplates: SMSTemplate[] = [
    {
      id: 'reminder_deadline',
      name: 'Rappel échéance',
      content: 'Bonjour {nom}, votre dossier d\'inscription expire le {date}. Complétez-le sur {url}',
      variables: ['nom', 'date', 'url'],
      type: 'reminder'
    },
    {
      id: 'status_update',
      name: 'Mise à jour statut',
      content: 'Votre dossier #{id} a été {status}. Consultez les détails sur {url}',
      variables: ['id', 'status', 'url'],
      type: 'notification'
    },
    {
      id: 'verification_code',
      name: 'Code de vérification',
      content: 'Votre code de vérification est : {code}. Valide pendant 10 minutes.',
      variables: ['code'],
      type: 'verification'
    },
    {
      id: 'document_missing',
      name: 'Document manquant',
      content: 'Il manque des documents à votre dossier. Téléchargez-les sur {url}',
      variables: ['url'],
      type: 'alert'
    }
  ];

  constructor(private http: HttpClient) {
    this.loadSettings();
  }

  /**
   * Envoyer un SMS simple
   */
  sendSMS(message: SMSMessage): Observable<SMSResponse> {
    return this.http.post<SMSResponse>(`${this.apiUrl}/send`, message);
  }

  /**
   * Envoyer un SMS avec template
   */
  sendSMSWithTemplate(templateId: string, to: string, variables: { [key: string]: string }): Observable<SMSResponse> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trouvé`);
    }

    const message = this.processTemplate(template, variables);
    return this.sendSMS({
      to,
      message,
      type: template.type
    });
  }

  /**
   * Programmer un SMS
   */
  scheduleSMS(message: SMSMessage, scheduledFor: Date): Observable<SMSResponse> {
    return this.http.post<SMSResponse>(`${this.apiUrl}/schedule`, {
      ...message,
      scheduledFor: scheduledFor.toISOString()
    });
  }

  /**
   * Envoyer des SMS en masse
   */
  sendBulkSMS(messages: SMSMessage[]): Observable<SMSResponse[]> {
    return this.http.post<SMSResponse[]>(`${this.apiUrl}/bulk`, { messages });
  }

  /**
   * Vérifier un numéro de téléphone
   */
  verifyPhoneNumber(phoneNumber: string): Observable<{ valid: boolean; formatted: string; country: string }> {
    return this.http.post<{ valid: boolean; formatted: string; country: string }>(`${this.apiUrl}/verify`, { phoneNumber });
  }

  /**
   * Obtenir l'historique des SMS
   */
  getSMSHistory(filters?: { 
    dateFrom?: string; 
    dateTo?: string; 
    type?: string; 
    status?: string 
  }): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`, { params: filters as any });
  }

  /**
   * Obtenir les statistiques SMS
   */
  getSMSStats(): Observable<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    costThisMonth: number;
    remainingCredits: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Gérer les paramètres SMS
   */
  updateSettings(settings: Partial<SMSSettings>): Observable<SMSSettings> {
    return this.http.put<SMSSettings>(`${this.apiUrl}/settings`, settings);
  }

  getSettings(): SMSSettings {
    return this.settingsSubject.value;
  }

  /**
   * Gestion des templates
   */
  getTemplates(): SMSTemplate[] {
    return this.getSettings().templates;
  }

  getTemplate(id: string): SMSTemplate | undefined {
    return this.getTemplates().find(t => t.id === id);
  }

  createTemplate(template: Omit<SMSTemplate, 'id'>): Observable<SMSTemplate> {
    const newTemplate = {
      ...template,
      id: this.generateTemplateId()
    };
    return this.http.post<SMSTemplate>(`${this.apiUrl}/templates`, newTemplate);
  }

  updateTemplate(id: string, template: Partial<SMSTemplate>): Observable<SMSTemplate> {
    return this.http.put<SMSTemplate>(`${this.apiUrl}/templates/${id}`, template);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
  }

  /**
   * Utilitaires
   */
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+33'): string {
    // Nettoyer le numéro
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Ajouter le code pays si nécessaire
    if (!cleaned.startsWith('33') && countryCode === '+33') {
      if (cleaned.startsWith('0')) {
        cleaned = '33' + cleaned.substring(1);
      } else {
        cleaned = '33' + cleaned;
      }
    }
    
    return '+' + cleaned;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  processTemplate(template: SMSTemplate, variables: { [key: string]: string }): string {
    let message = template.content;
    
    template.variables.forEach(variable => {
      const value = variables[variable] || `{${variable}}`;
      message = message.replace(new RegExp(`{${variable}}`, 'g'), value);
    });
    
    return message;
  }

  /**
   * Fonctionnalités avancées
   */
  sendReminderToAll(templateId: string, recipients: Array<{ phone: string; variables: any }>): Observable<SMSResponse[]> {
    const messages = recipients.map(recipient => ({
      to: recipient.phone,
      message: this.processTemplate(this.getTemplate(templateId)!, recipient.variables),
      type: 'reminder' as const
    }));
    
    return this.sendBulkSMS(messages);
  }

  scheduleReminderCampaign(
    templateId: string, 
    recipients: Array<{ phone: string; variables: any }>,
    scheduledFor: Date
  ): Observable<SMSResponse[]> {
    const messages = recipients.map(recipient => ({
      to: recipient.phone,
      message: this.processTemplate(this.getTemplate(templateId)!, recipient.variables),
      type: 'reminder' as const,
      scheduledFor
    }));
    
    return this.http.post<SMSResponse[]>(`${this.apiUrl}/campaign`, {
      messages,
      scheduledFor: scheduledFor.toISOString()
    });
  }

  /**
   * Gestion des opt-out
   */
  addToOptOutList(phoneNumber: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/opt-out`, { phoneNumber });
  }

  removeFromOptOutList(phoneNumber: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/opt-out/${encodeURIComponent(phoneNumber)}`);
  }

  isOptedOut(phoneNumber: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/opt-out/${encodeURIComponent(phoneNumber)}`);
  }

  /**
   * Méthodes privées
   */
  private loadSettings(): void {
    // Charger depuis localStorage ou API
    const saved = localStorage.getItem('sms_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.settingsSubject.next({ ...this.getDefaultSettings(), ...settings });
      } catch (e) {
        console.warn('Erreur lors du chargement des paramètres SMS:', e);
      }
    }
  }

  private getDefaultSettings(): SMSSettings {
    return {
      enabled: false,
      defaultCountryCode: '+33',
      reminderTime: '09:00',
      maxDailyMessages: 100,
      templates: this.defaultTemplates
    };
  }

  private generateTemplateId(): string {
    return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Simulation pour développement (à supprimer en production)
   */
  simulateSMS(message: SMSMessage): Observable<SMSResponse> {
    console.log('SMS simulé:', message);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          messageId: 'sim_' + Date.now(),
          status: 'sent',
          cost: 0.05
        });
        observer.complete();
      }, 1000);
    });
  }
}
