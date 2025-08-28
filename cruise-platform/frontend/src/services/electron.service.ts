// Desktop-specific service for Electron API integration
class ElectronService {
    private isElectron: boolean;

    constructor() {
        this.isElectron = typeof (window as any).electronAPI !== 'undefined';
    }

    /**
     * Check if running in Electron environment
     */
    isDesktopApp(): boolean {
        return this.isElectron;
    }

    /**
     * Get platform information
     */
    getPlatform() {
        if (!this.isElectron) return null;
        return (window as any).platform;
    }

    /**
     * Get app version
     */
    async getAppVersion(): Promise<string | null> {
        if (!this.isElectron) return null;
        try {
            return await (window as any).electronAPI.getAppVersion();
        } catch (error) {
            console.error('Failed to get app version:', error);
            return null;
        }
    }

    /**
     * Show message box dialog
     */
    async showMessageBox(options: {
        type?: 'info' | 'error' | 'question' | 'warning';
        title?: string;
        message: string;
        detail?: string;
        buttons?: string[];
    }) {
        if (!this.isElectron) {
            // Fallback for web
            alert(options.message);
            return { response: 0 };
        }

        try {
            return await (window as any).electronAPI.showMessageBox(options);
        } catch (error) {
            console.error('Failed to show message box:', error);
            return null;
        }
    }

    /**
     * Show open file dialog
     */
    async showOpenDialog(options: {
        title?: string;
        defaultPath?: string;
        buttonLabel?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
        properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
    }) {
        if (!this.isElectron) {
            // Fallback for web - use file input
            return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = options.properties?.indexOf('multiSelections') !== -1 || false;

                input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                        resolve({
                            canceled: false,
                            filePaths: Array.from(files).map(f => f.name)
                        });
                    } else {
                        resolve({ canceled: true, filePaths: [] });
                    }
                };

                input.click();
            });
        }

        try {
            return await (window as any).electronAPI.showOpenDialog(options);
        } catch (error) {
            console.error('Failed to show open dialog:', error);
            return null;
        }
    }

    /**
     * Show save file dialog
     */
    async showSaveDialog(options: {
        title?: string;
        defaultPath?: string;
        buttonLabel?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
    }) {
        if (!this.isElectron) {
            // Fallback for web - trigger download
            const filename = prompt('Enter filename:', options.defaultPath || 'document.txt');
            return filename ? { canceled: false, filePath: filename } : { canceled: true };
        }

        try {
            return await (window as any).electronAPI.showSaveDialog(options);
        } catch (error) {
            console.error('Failed to show save dialog:', error);
            return null;
        }
    }

    /**
     * Store data persistently
     */
    async store(key: string, value: any): Promise<void> {
        if (!this.isElectron) {
            // Fallback to localStorage
            localStorage.setItem(key, JSON.stringify(value));
            return;
        }

        try {
            await (window as any).electronAPI.store.set(key, value);
        } catch (error) {
            console.error('Failed to store data:', error);
            // Fallback to localStorage
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

    /**
     * Retrieve stored data
     */
    async retrieve(key: string): Promise<any> {
        if (!this.isElectron) {
            // Fallback to localStorage
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }

        try {
            return await (window as any).electronAPI.store.get(key);
        } catch (error) {
            console.error('Failed to retrieve data:', error);
            // Fallback to localStorage
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
    }

    /**
     * Delete stored data
     */
    async deleteStored(key: string): Promise<void> {
        if (!this.isElectron) {
            localStorage.removeItem(key);
            return;
        }

        try {
            await (window as any).electronAPI.store.delete(key);
        } catch (error) {
            console.error('Failed to delete stored data:', error);
            localStorage.removeItem(key);
        }
    }

    /**
     * Show system notification
     */
    async showNotification(options: {
        title: string;
        body: string;
        icon?: string;
        silent?: boolean;
    }): Promise<void> {
        if (!this.isElectron) {
            // Fallback to web notifications
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification(options.title, {
                        body: options.body,
                        icon: options.icon,
                        silent: options.silent
                    });
                } else if (Notification.permission !== 'denied') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        new Notification(options.title, {
                            body: options.body,
                            icon: options.icon,
                            silent: options.silent
                        });
                    }
                }
            }
            return;
        }

        try {
            await (window as any).electronAPI.showNotification(options);
        } catch (error) {
            console.error('Failed to show notification:', error);
            // Fallback to web notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(options.title, { body: options.body });
            }
        }
    }

    /**
     * Open external URL
     */
    async openExternal(url: string): Promise<void> {
        if (!this.isElectron) {
            window.open(url, '_blank');
            return;
        }

        try {
            await (window as any).electronAPI.openExternal(url);
        } catch (error) {
            console.error('Failed to open external URL:', error);
            window.open(url, '_blank');
        }
    }

    /**
     * Listen for menu actions
     */
    onMenuAction(callback: (action: string) => void): void {
        if (!this.isElectron) return;

        try {
            (window as any).electronAPI.onMenuAction((_event: any, action: string) => {
                callback(action);
            });
        } catch (error) {
            console.error('Failed to listen for menu actions:', error);
        }
    }

    /**
     * Listen for preferences open
     */
    onPreferencesOpen(callback: () => void): void {
        if (!this.isElectron) return;

        try {
            (window as any).electronAPI.onPreferencesOpen(() => {
                callback();
            });
        } catch (error) {
            console.error('Failed to listen for preferences open:', error);
        }
    }

    /**
     * Check if specific desktop features are available
     */
    getAvailableFeatures() {
        if (!this.isElectron) {
            return {
                fileSystem: false,
                notifications: 'Notification' in window,
                autoUpdater: false,
                menuBar: false,
                systemIntegration: false
            };
        }

        return (window as any).features || {
            fileSystem: true,
            notifications: true,
            autoUpdater: true,
            menuBar: true,
            systemIntegration: true
        };
    }
}

export default new ElectronService();
