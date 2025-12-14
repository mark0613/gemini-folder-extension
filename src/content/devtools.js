/* eslint-disable no-console */
import bytes from 'bytes';

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
        const theme = await StorageService.getTheme();

        const dump = {
            folderOrder,
            folders,
            chatCache,
            settings,
            enabled,
            theme,
        };

        console.log('[GeminiFolder Storage Dump]', dump);
        return dump;
    },

    usage() {
        chrome.storage.sync.getBytesInUse(null, (b) => {
            const max = chrome.storage.sync.QUOTA_BYTES || 102400;
            const usage = bytes(b);
            const maxStr = bytes(max);
            const percent = ((b * 100) / max).toFixed(1);
            console.log(`[SYNC Usage] ${usage} / ${maxStr} (${percent}%)`);
        });

        chrome.storage.local.getBytesInUse(null, (b) => {
            const max = chrome.storage.local.QUOTA_BYTES || 5242880;
            const usage = bytes(b);
            const maxStr = bytes(max);
            const percent = ((b * 100) / max).toFixed(1);
            console.log(`[LOCAL Usage] ${usage} / ${maxStr} (${percent}%)`);
        });
    },

    storage: StorageService,
};

window.GeminiFolder = DevTools;

export default DevTools;
