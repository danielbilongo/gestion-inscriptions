import { Injectable } from '@angular/core';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key - remplacer par votre vraie clé
  private scriptLoaded = false;

  constructor() {}

  /**
   * Charge le script reCAPTCHA de Google
   */
  loadRecaptchaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Exécute reCAPTCHA v3 et retourne le token
   */
  async executeRecaptcha(action: string = 'login'): Promise<string> {
    if (!this.scriptLoaded) {
      await this.loadRecaptchaScript();
    }

    return new Promise((resolve, reject) => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(this.siteKey, { action })
            .then((token: string) => {
              resolve(token);
            })
            .catch((error: any) => {
              reject(error);
            });
        });
      } else {
        reject(new Error('reCAPTCHA not loaded'));
      }
    });
  }

  /**
   * Vérifie si reCAPTCHA est disponible
   */
  isRecaptchaLoaded(): boolean {
    return this.scriptLoaded && window.grecaptcha && window.grecaptcha.ready;
  }
}
