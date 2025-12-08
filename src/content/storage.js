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

/**
 * Wraps chrome.storage.sync.get with a promise.
 * @param {string|string[]|Object} keys
 * @returns {Promise<Object>}
 */
const getStorage = (keys) => new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
        } else {
            resolve(result);
        }
    });
});

/**
 * Wraps chrome.storage.sync.set with a promise.
 * @param {Object} items
 * @returns {Promise<void>}
 */
const setStorage = (items) => new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
        } else {
            resolve();
        }
    });
});

export const StorageService = {
    async getFoldersData() {
        const data = await getStorage([STORAGE_KEYS.FOLDER_ORDER, STORAGE_KEYS.FOLDERS]);
        return {
            folderOrder: data[STORAGE_KEYS.FOLDER_ORDER] || [],
            folders: data[STORAGE_KEYS.FOLDERS] || {},
        };
    },

    async saveFolderOrder(order) {
        await setStorage({ [STORAGE_KEYS.FOLDER_ORDER]: order });
    },

    async updateFolders(folders) {
        await setStorage({ [STORAGE_KEYS.FOLDERS]: folders });
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

        await setStorage({
            [STORAGE_KEYS.FOLDERS]: newFolders,
            [STORAGE_KEYS.FOLDER_ORDER]: newOrder,
        });
        return id;
    },

    async deleteFolder(folderId) {
        const { folderOrder, folders } = await this.getFoldersData();
        // eslint-disable-next-line no-unused-vars
        const { [folderId]: deleted, ...remainingFolders } = folders;
        const newOrder = folderOrder.filter((id) => id !== folderId);

        await setStorage({
            [STORAGE_KEYS.FOLDERS]: remainingFolders,
            [STORAGE_KEYS.FOLDER_ORDER]: newOrder,
        });
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

    async getSettings() {
        const data = await getStorage([STORAGE_KEYS.SETTINGS, STORAGE_KEYS.ENABLED]);
        return {
            settings: data[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
            enabled: data[STORAGE_KEYS.ENABLED] !== false, // Default to true if undefined
        };
    },

    async toggleEnabled(newState) {
        await setStorage({ [STORAGE_KEYS.ENABLED]: newState });
    }
};
