import { StorageService } from './storage';

/**
 * Dev Tools for Gemini Folder Extension
 * 
 * Usage:
 * 1. Open DevTools (F12) -> Console
 * 2. In the top-left dropdown, select your extension's context (not "top")
 * 3. Type: GeminiFolder.dump() or GeminiFolder.usage()
 */

const DevTools = {
    async dump() {
        const { folderOrder, folders } = await StorageService.getFoldersData();
        const chatCache = await StorageService.getChatCache();
        const { settings, enabled } = await StorageService.getSettings();

        const dump = {
            folderOrder,
            folders,
            chatCache,
            settings,
            enabled,
        };

        console.log('[GeminiFolder Storage Dump]', dump);
        return dump;
    },

    usage() {
        chrome.storage.sync.getBytesInUse(null, (bytes) => {
            console.log(`[SYNC Usage] ${bytes} / 102400 bytes (${(bytes / 102400 * 100).toFixed(1)}%)`);
        });
        chrome.storage.local.getBytesInUse(null, (bytes) => {
            console.log(`[LOCAL Usage] ${bytes} bytes`);
        });
    },

    storage: StorageService,
};

window.GeminiFolder = DevTools;

export default DevTools;
