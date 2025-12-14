/* eslint-disable no-console */
const DEFAULT_STATE = {
    folderOrder: [], // 資料夾 ID 順序 (array)
    folders: {}, // 資料夾內容
    chatCache: {}, // 標題快取
    settings: {
        customColors: [], // 自定義顏色
    },
};

chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Gemini Folder Extension] Extension installed/updated:', details.reason);

    chrome.storage.sync.get(null, (currentData) => {
        const initData = {};
        let needsInit = false;

        // 檢查每一個 key，如果不存在才寫入預設值
        Object.keys(DEFAULT_STATE).forEach((key) => {
            if (currentData[key] === undefined) {
                initData[key] = DEFAULT_STATE[key];
                needsInit = true;
            }
        });

        if (needsInit) {
            chrome.storage.sync.set(initData, () => {
                console.log('[Gemini Folder Extension] Default data initialized:', initData);
            });
        }
        else {
            console.log('[Gemini Folder Extension] Data already exists, skipping initialization.');
            console.log('[Gemini Folder Extension] Data already exists, skipping initialization.');
        }
    });
});
