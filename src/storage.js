import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initialState, validateBackup } from './domain.js';

const KEY = 'gymhub.state.v1';
let queue = Promise.resolve();
export async function load() {
  const { value } = await Preferences.get({ key: KEY });
  return value ? validateBackup(value) : initialState();
}
export function save(state) {
  const value = JSON.stringify(state);
  queue = queue.catch(() => {}).then(() => Preferences.set({ key: KEY, value }));
  return queue;
}
export async function exportData(state) {
  const data = JSON.stringify(state, null, 2), name = `gymhub-${new Date().toISOString().slice(0, 10)}.json`;
  if (Capacitor.isNativePlatform()) {
    const file = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: 'Backup GymHub', url: file.uri, dialogTitle: 'Salva il tuo backup' });
  } else {
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
export async function scheduleRest(until) {
  if (!Capacitor.isNativePlatform()) return false;
  await LocalNotifications.cancel({ notifications: [{ id: 901 }] });
  if (!until || until <= Date.now()) return false;
  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return false;
  await LocalNotifications.schedule({ notifications: [{ id: 901, title: 'GymHub · Recupero terminato', body: 'Il timer di recupero è arrivato a zero.', schedule: { at: new Date(until), allowWhileIdle: true } }] });
  return true;
}
