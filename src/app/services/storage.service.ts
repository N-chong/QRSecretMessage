import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AppSettings, DEFAULT_SETTINGS } from '../models/app-settings.model';
import { SecureMessageRecord } from '../models/secure-message.model';

interface LocalDatabase { messages: SecureMessageRecord[]; settings: AppSettings; }

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly key = 'qrsecure_database_v1';

  private async read(): Promise<LocalDatabase> {
    const { value } = await Preferences.get({ key: this.key });
    if (!value) return { messages: [], settings: { ...DEFAULT_SETTINGS } };
    try {
      const parsed = JSON.parse(value) as Partial<LocalDatabase>;
      return {
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      };
    } catch { return { messages: [], settings: { ...DEFAULT_SETTINGS } }; }
  }

  private async write(database: LocalDatabase): Promise<void> {
    await Preferences.set({ key: this.key, value: JSON.stringify(database) });
  }

  async getMessages(): Promise<SecureMessageRecord[]> { return (await this.read()).messages; }

  async saveMessage(message: SecureMessageRecord): Promise<void> {
    const database = await this.read();
    const index = database.messages.findIndex((item) => item.id === message.id);
    if (index >= 0) database.messages[index] = message;
    else database.messages.unshift(message);
    await this.write(database);
  }

  async updateMessage(id: string, update: Partial<SecureMessageRecord>): Promise<void> {
    const database = await this.read();
    const index = database.messages.findIndex((item) => item.id === id);
    if (index >= 0) {
      database.messages[index] = { ...database.messages[index], ...update };
      await this.write(database);
    }
  }

  async deleteMessage(id: string): Promise<void> {
    const database = await this.read();
    database.messages = database.messages.filter((item) => item.id !== id);
    await this.write(database);
  }

  async clearHistory(): Promise<void> {
    const database = await this.read();
    database.messages = [];
    await this.write(database);
  }

  async getSettings(): Promise<AppSettings> { return (await this.read()).settings; }

  async updateSettings(update: Partial<AppSettings>): Promise<AppSettings> {
    const database = await this.read();
    database.settings = { ...database.settings, ...update };
    await this.write(database);
    return database.settings;
  }
}
