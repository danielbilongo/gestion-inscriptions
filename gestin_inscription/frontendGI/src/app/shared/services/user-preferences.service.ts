import { Injectable } from '@angular/core';

export type NotificationTypePref = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface Preferences {
  notifications: {
    showUnreadOnly: boolean;
    enabledTypes: NotificationTypePref[];
  };
}

const STORAGE_KEY = 'gi_user_prefs_v1';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private defaultPrefs: Preferences = {
    notifications: {
      showUnreadOnly: false,
      enabledTypes: ['INFO', 'SUCCESS', 'WARNING', 'ERROR']
    }
  };

  get(): Preferences {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.defaultPrefs;
      const parsed = JSON.parse(raw) as Preferences;
      return {
        ...this.defaultPrefs,
        ...parsed,
        notifications: {
          ...this.defaultPrefs.notifications,
          ...(parsed.notifications || {})
        }
      };
    } catch {
      return this.defaultPrefs;
    }
  }

  update(partial: Partial<Preferences>) {
    const current = this.get();
    const merged: Preferences = {
      ...current,
      ...partial,
      notifications: {
        ...current.notifications,
        ...(partial.notifications || {})
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }
}
