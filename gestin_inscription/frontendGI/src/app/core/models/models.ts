export interface User {
  id?: number;
  email: string;
  nom?: string;
  prenom?: string;
  roles?: string[];
  token?: string;
  profilePhoto?: string;
  telephone?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
}

export interface UserResponseDTO {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  userIdNum?: string;
  emergencyContact?: string;
  administratorRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Candidat {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  pieceIdentite?: string;
  numeroIdentite?: string;
  dateCreation?: string;
}

export interface Agent {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  fonction?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface Dossier {
  id?: number;
  applicationId?: number; // Correspond à applicationId du backend
  candidatId?: number; // Optionnel pour compatibilité
  candidat?: Candidat;
  status: DossierStatus;
  applicantName?: string; // Nom du candidat
  username?: string; // Username du candidat
  userIdNum?: string; // Numéro d'identification
  completionRate?: number; // Taux de completion
  submissionDate?: string; // Date de soumission
  dateCreation?: string;
  dateModification?: string;
  documents?: Document[];
}

export interface Document {
  id?: number;
  dossierId: number;
  nom: string;
  type: DocumentType;
  cheminFichier: string;
  tailleFichier?: number;
  status?: DocumentStatus;
  dateUpload?: string;
}

export interface Notification {
  id?: number;
  recipientId: number;
  titre: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  dateCreation?: string;
}

export interface AcademicRecord {
  id?: number;
  candidatId: number;
  etablissement: string;
  diplome: string;
  anneeObtention: number;
  mention?: string;
}

export enum DossierStatus {
  PENDING = 'PENDING',
  EN_ATTENTE = 'EN_ATTENTE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  EN_COURS = 'EN_COURS',
  AGENT_VALIDATED = 'AGENT_VALIDATED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  VALIDE = 'VALIDE',
  REJECTED = 'REJECTED',
  REJETE = 'REJETE'
}

export enum DocumentType {
  CERTIFICAT = 'CERTIFICAT',
  BULLETIN = 'BULLETIN',
  RELEVE_DE_NOTE = 'RELEVE_DE_NOTE',
  PHOTO_IDENTITE = 'PHOTO_IDENTITE'
}

export enum DocumentStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum Role {
  CANDIDAT = 'CANDIDATE',  // Mapping vers le backend
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

// Utilitaire pour mapper les rôles backend vers frontend
export class RoleMapper {
  static backendToFrontend(backendRole: string): string {
    switch (backendRole) {
      case 'CANDIDATE': return 'CANDIDAT';
      case 'AGENT': return 'AGENT';
      case 'SUPER_ADMIN': return 'ADMIN';
      default: return backendRole;
    }
  }

  static frontendToBackend(frontendRole: string): string {
    switch (frontendRole) {
      case 'CANDIDAT': return 'CANDIDATE';
      case 'AGENT': return 'AGENT';
      case 'ADMIN': return 'SUPER_ADMIN';
      default: return frontendRole;
    }
  }
}