export interface Candidat {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  pieceIdentite: 'CNI' | 'PASSEPORT' | 'PERMIS_CONDUIRE';
  numeroPieceIdentite: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface Dossier {
  id?: number;
  candidatId: number;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'VALIDE' | 'REJETE';
  dateCreation?: string;
  dateModification?: string;
  commentaire?: string;
}

export interface Document {
  id?: number;
  dossierId: number;
  nom: string;
  type: 'PIECE_IDENTITE' | 'DIPLOME' | 'CV' | 'LETTRE_MOTIVATION' | 'PHOTO' | 'AUTRE';
  cheminFichier: string;
  tailleFichier: number;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  dateUpload?: string;
  commentaire?: string;
}

export interface Agent {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: 'AGENT_ACCUEIL' | 'RESPONSABLE_ADMISSION' | 'DIRECTEUR_ETUDES';
  dateEmbauche: string;
  actif: boolean;
}