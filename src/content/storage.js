import LZString from 'lz-string';

export const STORAGE_KEYS = {
    FOLDER_ORDER: 'folderOrder',
    FOLDERS: 'folders',
    CHAT_CACHE: 'chatCache',
    SETTINGS: 'settings',
    ENABLED: 'enabled',
};

export const FOLDER_COLORS = {
    RED: '#FF4D4F',
    GREEN: '#95DE64',
    BLUE: '#3357FF',
    YELLOW: '#FFEC3D',
    PURPLE: '#A833FF',
};

export const GEMINI_APP_URL = 'https://gemini.google.com/app';

const DEFAULT_SETTINGS = {
    customColors: [],
};

// Define Storage Areas
const STORAGE_AREAS = {
    [STORAGE_KEYS.CHAT_CACHE]: 'local',
    [STORAGE_KEYS.FOLDERS]: 'sync',
    [STORAGE_KEYS.FOLDER_ORDER]: 'sync',
    [STORAGE_KEYS.SETTINGS]: 'sync',
    [STORAGE_KEYS.ENABLED]: 'sync',
};

/**
 * Smart Getter: Routes keys to correct storage area (sync vs local)
 */
const getStorage = (keys) => new Promise((resolve, reject) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const syncKeys = [];
    const localKeys = [];

    keyArray.forEach(key => {
        if (STORAGE_AREAS[key] === 'local') {
            localKeys.push(key);
        } else {
            syncKeys.push(key);
        }
    });

    const promises = [];
    if (syncKeys.length > 0) promises.push(new Promise(r => chrome.storage.sync.get(syncKeys, r)));
    if (localKeys.length > 0) promises.push(new Promise(r => chrome.storage.local.get(localKeys, r)));

    Promise.all(promises).then(results => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
        }
        // Merge results
        const combined = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        resolve(combined);
    }).catch(reject);
});

/**
 * Smart Setter: Routes items to correct storage area
 */
const setStorage = (items) => new Promise((resolve, reject) => {
    const syncItems = {};
    const localItems = {};
    let hasSync = false;
    let hasLocal = false;

    Object.entries(items).forEach(([key, value]) => {
        if (STORAGE_AREAS[key] === 'local') {
            localItems[key] = value;
            hasLocal = true;
        } else {
            syncItems[key] = value;
            hasSync = true;
        }
    });

    const promises = [];
    if (hasSync) promises.push(new Promise((r, j) => chrome.storage.sync.set(syncItems, () => chrome.runtime.lastError ? j(chrome.runtime.lastError) : r())));
    if (hasLocal) promises.push(new Promise((r, j) => chrome.storage.local.set(localItems, () => chrome.runtime.lastError ? j(chrome.runtime.lastError) : r())));

    Promise.all(promises).then(() => resolve()).catch(reject);
});


export const StorageService = {
    async getFoldersData() {
        const data = await getStorage([STORAGE_KEYS.FOLDER_ORDER, STORAGE_KEYS.FOLDERS]);
        let folders = data[STORAGE_KEYS.FOLDERS] || {};

        // Decompression Logic
        if (typeof folders === 'string') {
            // Try decompress
            const decompressed = LZString.decompressFromUTF16(folders);
            if (decompressed) {
                try {
                    folders = JSON.parse(decompressed);
                } catch (e) {
                    console.error('Failed to parse decompressed folders', e);
                    folders = {};
                }
            } else {
                console.warn('Decompression returned null');
            }
        }

        return {
            folderOrder: data[STORAGE_KEYS.FOLDER_ORDER] || [],
            folders: folders, // Object
        };
    },

    async saveFolderOrder(order) {
        await setStorage({ [STORAGE_KEYS.FOLDER_ORDER]: order });
    },

    async updateFolders(folders) {
        // Compression Logic
        const jsonString = JSON.stringify(folders);
        const compressed = LZString.compressToUTF16(jsonString);

        await setStorage({ [STORAGE_KEYS.FOLDERS]: compressed });
    },

    async createFolder(name = 'New Folder') {
        const { folderOrder, folders } = await this.getFoldersData();
        const id = `f_${Date.now()}`;
        const newFolder = {
            name,
            color: FOLDER_COLORS.RED, // Default color
            collapsed: false,
            chatIds: [],
        };

        const newFolders = { ...folders, [id]: newFolder };
        const newOrder = [id, ...folderOrder];

        await this.updateFolders(newFolders);
        await this.saveFolderOrder(newOrder);
        return id;
    },

    async deleteFolder(folderId) {
        const { folderOrder, folders } = await this.getFoldersData();
        // eslint-disable-next-line no-unused-vars
        const { [folderId]: deleted, ...remainingFolders } = folders;
        const newOrder = folderOrder.filter((id) => id !== folderId);

        await this.updateFolders(remainingFolders);
        await this.saveFolderOrder(newOrder);
    },

    async getChatCache() {
        const data = await getStorage([STORAGE_KEYS.CHAT_CACHE]);
        return data[STORAGE_KEYS.CHAT_CACHE] || {};
    },

    async updateChatCache(chatId, title) {
        const cache = await this.getChatCache();
        const current = cache[chatId];

        const updatedCache = {
            ...cache,
            [chatId]: {
                ...(current || {}), // Preserve existing data like domIndex
                title,
                lastSync: Date.now(),
            },
        };

        await setStorage({ [STORAGE_KEYS.CHAT_CACHE]: updatedCache });
    },



    /**
     * Batch update chat cache
     * @param {Object.<string, {title: string, domIndex: number, lastSync?: number}>} updates - Object where keys are chat IDs and values are objects containing title, domIndex, and optional lastSync.
     */
    async batchUpdateChatCache(updates) {
        // updates: { [id]: { title, domIndex, lastSync } }
        const data = await this.getChatCache();
        let changed = false;

        Object.entries(updates).forEach(([id, updateData]) => {
            const current = data[id];

            // Check if meaningful change occurred
            if (!current ||
                current.title !== updateData.title ||
                current.domIndex !== updateData.domIndex) {

                data[id] = {
                    ...current, // Keep other keys if any (like folderId if we stored it here, but we store it in folder obj)
                    ...updateData,
                    lastSync: updateData.lastSync || Date.now()
                };
                changed = true;
            } else if (current.lastSync !== updateData.lastSync) {
                // Update lastSync even if title/domIndex are the same
                data[id] = {
                    ...current,
                    lastSync: updateData.lastSync || Date.now()
                };
                changed = true;
            }
        });

        if (changed) {
            await setStorage({ [STORAGE_KEYS.CHAT_CACHE]: data });
        }
    },

    async removeChats(chatIds) {
        if (!chatIds || chatIds.length === 0) return;

        const { folders } = await this.getFoldersData();
        const chatCache = await this.getChatCache();

        // 1. Remove from cache
        chatIds.forEach(id => delete chatCache[id]);

        // 2. Remove from folders
        let foldersChanged = false;
        Object.keys(folders).forEach(folderId => {
            const folder = folders[folderId];
            const initialLength = folder.chatIds.length;
            folder.chatIds = folder.chatIds.filter(id => !chatIds.includes(id));
            if (folder.chatIds.length !== initialLength) {
                foldersChanged = true;
            }
        });

        await setStorage({ [STORAGE_KEYS.CHAT_CACHE]: chatCache });
        if (foldersChanged) {
            await this.updateFolders(folders);
        }
    },

    async moveChatToFolder(chatId, targetFolderId) {
        const { folders } = await this.getFoldersData();
        let changed = false;

        // 1. Remove from all other folders
        Object.keys(folders).forEach(fid => {
            if (folders[fid].chatIds.includes(chatId)) {
                folders[fid].chatIds = folders[fid].chatIds.filter(id => id !== chatId);
                changed = true;
            }
        });

        // 2. Add to target folder
        if (folders[targetFolderId]) {
            if (!folders[targetFolderId].chatIds.includes(chatId)) {
                folders[targetFolderId].chatIds.push(chatId);
                changed = true;
            }
        }

        if (changed) {
            await this.updateFolders(folders);
        }
    },

    async getSettings() {
        const data = await getStorage([STORAGE_KEYS.SETTINGS, STORAGE_KEYS.ENABLED]);
        return {
            settings: data[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
            enabled: data[STORAGE_KEYS.ENABLED] !== false,
        };
    },

    async toggleEnabled(newState) {
        await setStorage({ [STORAGE_KEYS.ENABLED]: newState });
    },
};
