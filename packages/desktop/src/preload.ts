import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  onMenuAction: (callback: (action: string) => void) => {
    const actions = [
      'menu:new-project', 'menu:open-project', 'menu:save', 'menu:export',
      'menu:generate-chapter', 'menu:audit', 'menu:humanize',
      'menu:outline', 'menu:characters', 'menu:world',
      'menu:about', 'menu:shortcuts'
    ];
    actions.forEach(action => {
      ipcRenderer.on(action, () => callback(action));
    });
  }
});

declare global {
  interface Window {
    electronAPI: {
      getAppPath: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      writeFile: (filePath: string, content: string) => Promise<boolean>;
      readFile: (filePath: string) => Promise<string>;
      onMenuAction: (callback: (action: string) => void) => void;
    };
  }
}
