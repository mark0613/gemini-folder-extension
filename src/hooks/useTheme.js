import { useState, useEffect } from 'react';
import { StorageService, STORAGE_KEYS } from '../content/storage';

/**
 * Hook to manage theme state
 * - On Gemini website: Detects theme from DOM and syncs to storage
 * - Elsewhere (popup): Reads from storage
 */
export const useTheme = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Load initial theme from storage
        StorageService.getTheme().then(setTheme);

        // Listen for storage changes
        const handleStorageChange = (changes) => {
            if (changes[STORAGE_KEYS.THEME]) {
                setTheme(changes[STORAGE_KEYS.THEME].newValue || 'light');
            }
        };
        chrome.storage.onChanged.addListener(handleStorageChange);

        // Detect if we're on Gemini website by checking for body element
        const isOnGemini = typeof document !== 'undefined' &&
            document.body &&
            window.location.hostname.includes('gemini.google.com');

        let themeObserver;
        if (isOnGemini) {
            const syncThemeFromDOM = () => {
                const isDark = document.body.classList.contains('dark-theme');
                const detectedTheme = isDark ? 'dark' : 'light';
                setTheme(detectedTheme);
                StorageService.setTheme(detectedTheme);
            };

            // Initial sync
            syncThemeFromDOM();

            // Watch for changes
            themeObserver = new MutationObserver(syncThemeFromDOM);
            themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
            if (themeObserver) themeObserver.disconnect();
        };
    }, []);

    const isDarkMode = theme === 'dark';
    const themeClass = isDarkMode ? 'gf-theme-dark' : 'gf-theme-light';

    return { theme, isDarkMode, themeClass };
};
