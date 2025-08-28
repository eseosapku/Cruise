const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Dialog methods
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

    // Store methods for persistent data
    store: {
        get: (key) => ipcRenderer.invoke('store-get', key),
        set: (key, value) => ipcRenderer.invoke('store-set', key, value),
        delete: (key) => ipcRenderer.invoke('store-delete', key)
    },

    // Notifications
    showNotification: (options) => ipcRenderer.invoke('show-notification', options),

    // External links
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),

    // Event listeners
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', callback);
    },

    onPreferencesOpen: (callback) => {
        ipcRenderer.on('open-preferences', callback);
    },

    // Remove listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Platform information
contextBridge.exposeInMainWorld('platform', {
    os: process.platform,
    arch: process.arch,
    versions: process.versions
});

// Feature flags for desktop-specific features
contextBridge.exposeInMainWorld('features', {
    fileSystem: true,
    notifications: true,
    autoUpdater: true,
    menuBar: true,
    systemIntegration: true
});
