import React, { useEffect, useState } from 'react';
import electronService from '../../services/electron.service';

interface DesktopWrapperProps {
    children: React.ReactNode;
}

interface AppInfo {
    version: string | null;
    platform: any;
    features: any;
}

const DesktopWrapper: React.FC<DesktopWrapperProps> = ({ children }) => {
    const [appInfo, setAppInfo] = useState<AppInfo>({
        version: null,
        platform: null,
        features: null
    });

    useEffect(() => {
        const initializeDesktopFeatures = async () => {
            if (electronService.isDesktopApp()) {
                try {
                    const [version, platform, features] = await Promise.all([
                        electronService.getAppVersion(),
                        electronService.getPlatform(),
                        electronService.getAvailableFeatures()
                    ]);

                    setAppInfo({ version, platform, features });

                    // Set up menu action listeners
                    electronService.onMenuAction((action: string) => {
                        console.log('Menu action:', action);
                        // Handle menu actions here
                    });

                    // Set up preferences listener
                    electronService.onPreferencesOpen(() => {
                        console.log('Preferences opened');
                        // Handle preferences opening
                    });

                    // Welcome notification for first-time users
                    const hasShownWelcome = await electronService.retrieve('hasShownWelcome');
                    if (!hasShownWelcome) {
                        await electronService.showNotification({
                            title: 'Welcome to Cruise!',
                            body: 'Your AI-powered entrepreneurship accelerator is ready.',
                            silent: false
                        });
                        await electronService.store('hasShownWelcome', true);
                    }

                } catch (error) {
                    console.error('Failed to initialize desktop features:', error);
                }
            }
        };

        initializeDesktopFeatures();
    }, []);

    // Add desktop-specific styles and behaviors
    useEffect(() => {
        if (electronService.isDesktopApp()) {
            // Add desktop app class to body
            document.body.classList.add('desktop-app');

            // Disable text selection for desktop app feel
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';

            // Handle app-specific keyboard shortcuts
            const handleKeydown = (e: KeyboardEvent) => {
                // Ctrl/Cmd + Q to quit (handled by Electron menu)
                if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                    e.preventDefault();
                }

                // Ctrl/Cmd + W to close window (handled by Electron menu)
                if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                    e.preventDefault();
                }

                // Ctrl/Cmd + M to minimize (handled by Electron menu)
                if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                    e.preventDefault();
                }
            };

            document.addEventListener('keydown', handleKeydown);

            return () => {
                document.removeEventListener('keydown', handleKeydown);
                document.body.classList.remove('desktop-app');
            };
        }
    }, []);

    // Provide app info context to children
    return (
        <div className={`app-container ${electronService.isDesktopApp() ? 'desktop' : 'web'}`}>
            {/* Add a hidden data attribute for CSS targeting */}
            <div
                data-app-version={appInfo.version}
                data-platform={appInfo.platform?.os}
                data-is-desktop={electronService.isDesktopApp()}
                style={{ display: 'none' }}
            />

            {/* Custom titlebar for desktop (if needed) */}
            {electronService.isDesktopApp() && appInfo.platform?.os !== 'darwin' && (
                <div className="custom-titlebar titlebar-drag-region">
                    <div className="titlebar-title">Cruise Platform</div>
                    <div className="titlebar-controls titlebar-no-drag">
                        {/* Window controls would go here if needed */}
                    </div>
                </div>
            )}

            {children}
        </div>
    );
};

export default DesktopWrapper;
