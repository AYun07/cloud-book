import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Cloud Book - AI小说创作平台',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 开发模式加载本地服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式加载打包的前端
    mainWindow.loadFile(path.join(__dirname, '../web/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建菜单
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        { label: '新建项目', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new-project') },
        { label: '打开项目', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu:open-project') },
        { type: 'separator' },
        { label: '保存', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { label: '导出', accelerator: 'CmdOrCtrl+E', click: () => mainWindow?.webContents.send('menu:export') },
        { type: 'separator' },
        { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '创作',
      submenu: [
        { label: '生成章节', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('menu:generate-chapter') },
        { label: '审计质量', accelerator: 'CmdOrCtrl+Shift+A', click: () => mainWindow?.webContents.send('menu:audit') },
        { label: '去AI味', accelerator: 'CmdOrCtrl+Shift+H', click: () => mainWindow?.webContents.send('menu:humanize') },
        { type: 'separator' },
        { label: '章节大纲', accelerator: 'CmdOrCtrl+D', click: () => mainWindow?.webContents.send('menu:outline') },
        { label: '角色管理', accelerator: 'CmdOrCtrl+Shift+C', click: () => mainWindow?.webContents.send('menu:characters') },
        { label: '世界观设定', accelerator: 'CmdOrCtrl+Shift+W', click: () => mainWindow?.webContents.send('menu:world') }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于Cloud Book', click: () => mainWindow?.webContents.send('menu:about') },
        { type: 'separator' },
        { label: '快捷键列表', accelerator: 'CmdOrCtrl+/', click: () => mainWindow?.webContents.send('menu:shortcuts') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC通信处理
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('show-save-dialog', async (_, options) => {
  const { dialog } = await import('electron');
  return dialog.showSaveDialog(mainWindow!, options);
});

ipcMain.handle('show-open-dialog', async (_, options) => {
  const { dialog } = await import('electron');
  return dialog.showOpenDialog(mainWindow!, options);
});

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  const fs = await import('fs');
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  const fs = await import('fs');
  return fs.readFileSync(filePath, 'utf-8');
});
