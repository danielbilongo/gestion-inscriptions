import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AddressSuggestion {
  display: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Institution {
  name: string;
  address: string;
  city: string;
  country: string;
  type: 'university' | 'school' | 'institute';
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  
  // Simulation d'une base de données d'établissements
  private institutions: Institution[] = [
    { name: 'Université de Paris', address: '85 Boulevard Saint-Germain', city: 'Paris', country: 'France', type: 'university' },
    { name: 'Sorbonne Université', address: '21 Rue de l\'École de Médecine', city: 'Paris', country: 'France', type: 'university' },
    { name: 'École Polytechnique', address: 'Route de Saclay', city: 'Palaiseau', country: 'France', type: 'school' },
    { name: 'Université de Lyon', address: '92 Rue Pasteur', city: 'Lyon', country: 'France', type: 'university' },
    { name: 'Université de Marseille', address: '58 Boulevard Charles Livon', city: 'Marseille', country: 'France', type: 'university' },
    { name: 'INSA Lyon', address: '20 Avenue Albert Einstein', city: 'Villeurbanne', country: 'France', type: 'school' },
    { name: 'Université de Bordeaux', address: '351 Cours de la Libération', city: 'Talence', country: 'France', type: 'university' },
    { name: 'Université de Toulouse', address: '118 Route de Narbonne', city: 'Toulouse', country: 'France', type: 'university' },
    { name: 'Université de Strasbourg', address: '4 Rue Blaise Pascal', city: 'Strasbourg', country: 'France', type: 'university' },
    { name: 'Université de Lille', address: 'Cité Scientifique', city: 'Villeneuve-d\'Ascq', country: 'France', type: 'university' },
    // Établissements africains
    { name: 'Université Cheikh Anta Diop', address: 'BP 5005', city: 'Dakar', country: 'Sénégal', type: 'university' },
    { name: 'Université de Yaoundé I', address: 'BP 812', city: 'Yaoundé', country: 'Cameroun', type: 'university' },
    { name: 'Université d\'Abidjan', address: 'BP V 34', city: 'Abidjan', country: 'Côte d\'Ivoire', type: 'university' },
    { name: 'Université Mohammed V', address: 'Avenue des Nations Unies', city: 'Rabat', country: 'Maroc', type: 'university' },
    { name: 'Université d\'Alger', address: '2 Rue Didouche Mourad', city: 'Alger', country: 'Algérie', type: 'university' },
    { name: 'Université de Tunis', address: '92 Avenue 9 Avril 1938', city: 'Tunis', country: 'Tunisie', type: 'university' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Recherche d'établissements avec autocomplétion
   */
  searchInstitutions(query: string): Observable<Institution[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const filtered = this.institutions.filter(institution =>
      institution.name.toLowerCase().includes(query.toLowerCase()) ||
      institution.city.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered.slice(0, 10)); // Limiter à 10 résultats
  }

  /**
   * Autocomplétion d'adresses (simulation)
   */
  searchAddresses(query: string): Observable<AddressSuggestion[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    // Simulation d'API de géocodage
    const mockAddresses: AddressSuggestion[] = [
      {
        display: '123 Rue de la Paix, 75001 Paris, France',
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        coordinates: { lat: 48.8566, lng: 2.3522 }
      },
      {
        display: '45 Avenue des Champs-Élysées, 75008 Paris, France',
        street: '45 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        coordinates: { lat: 48.8698, lng: 2.3076 }
      },
      {
        display: '10 Boulevard Saint-Germain, 75005 Paris, France',
        street: '10 Boulevard Saint-Germain',
        city: 'Paris',
        postalCode: '75005',
        country: 'France',
        coordinates: { lat: 48.8499, lng: 2.3447 }
      }
    ];

    // Filtrer les adresses qui correspondent à la requête
    const filtered = mockAddresses.filter(address =>
      address.display.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered);
  }

  /**
   * Géocodage d'une adresse complète
   */
  geocodeAddress(address: string): Observable<{ lat: number; lng: number } | null> {
    // Simulation de géocodage
    return of({
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1
    });
  }

  /**
   * Géocodage inverse (coordonnées vers adresse)
   */
  reverseGeocode(lat: number, lng: number): Observable<AddressSuggestion | null> {
    // Simulation de géocodage inverse
    return of({
      display: 'Adresse approximative, Paris, France',
      street: 'Rue approximative',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      coordinates: { lat, lng }
    });
  }

  /**
   * Obtenir la position actuelle de l'utilisateur
   */
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Validation de code postal par pays
   */
  validatePostalCode(postalCode: string, country: string): boolean {
    const patterns: { [key: string]: RegExp } = {
      'FR': /^[0-9]{5}$/,
      'DZ': /^[0-9]{5}$/,
      'MA': /^[0-9]{5}$/,
      'TN': /^[0-9]{4}$/,
      'SN': /^[0-9]{5}$/,
      'CI': /^[0-9]{2}$/,
      'CM': /^[0-9]{6}$/
    };

    const pattern = patterns[country];
    return pattern ? pattern.test(postalCode) : true; // Si pas de pattern, on accepte
  }

  /**
   * Validation de numéro de téléphone international
   */
  validatePhoneNumber(phone: string, countryCode: string): boolean {
    // Supprimer tous les espaces et caractères spéciaux
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    const patterns: { [key: string]: RegExp } = {
      '+33': /^[1-9][0-9]{8}$/, // France: 9 chiffres, ne commence pas par 0
      '+213': /^[5-7][0-9]{8}$/, // Algérie: 9 chiffres, commence par 5, 6 ou 7
      '+212': /^[5-7][0-9]{8}$/, // Maroc: 9 chiffres
      '+216': /^[2-9][0-9]{7}$/, // Tunisie: 8 chiffres
      '+221': /^[7][0-9]{8}$/, // Sénégal: 9 chiffres, commence par 7
      '+225': /^[0-9]{8}$/, // Côte d'Ivoire: 8 chiffres
      '+237': /^[6-9][0-9]{8}$/ // Cameroun: 9 chiffres
    };

    const pattern = patterns[countryCode];
    return pattern ? pattern.test(cleanPhone) : /^[0-9]{8,15}$/.test(cleanPhone);
  }

  /**
   * Obtenir les informations de pays par code
   */
  getCountryInfo(countryCode: string): { name: string; flag: string; phoneCode: string } | null {
    const countries: { [key: string]: { name: string; flag: string; phoneCode: string } } = {
      'FR': { name: 'France', flag: '🇫🇷', phoneCode: '+33' },
      'DZ': { name: 'Algérie', flag: '🇩🇿', phoneCode: '+213' },
      'MA': { name: 'Maroc', flag: '🇲🇦', phoneCode: '+212' },
      'TN': { name: 'Tunisie', flag: '🇹🇳', phoneCode: '+216' },
      'SN': { name: 'Sénégal', flag: '🇸🇳', phoneCode: '+221' },
      'CI': { name: 'Côte d\'Ivoire', flag: '🇨🇮', phoneCode: '+225' },
      'CM': { name: 'Cameroun', flag: '🇨🇲', phoneCode: '+237' }
    };

    return countries[countryCode] || null;
  }
}