import { useEffect, useState } from 'react';

import { FolderPlus, MessageSquarePlus } from 'lucide-react';

import { GEMINI_APP_URL, STORAGE_KEYS, StorageService } from '../content/storage';
import { useTheme } from '../hooks/useTheme';

import FolderList from './FolderList';
import ToggleSwitch from './ToggleSwitch';
import UncategorizedList from './UncategorizedList';

import './Overlay.css';

export const Overlay = () => {
    const [enabled, setEnabled] = useState(true);
    const [folders, setFolders] = useState({});
    const [folderOrder, setFolderOrder] = useState([]);
    const [chatCache, setChatCache] = useState({});

    const [activeChatId, setActiveChatId] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [newFolderId, setNewFolderId] = useState(null);

    // Width constant, moved from CSS for dynamic control
    const SIDEBAR_WIDTH = 308;

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            const settings = await StorageService.getSettings();
            setEnabled(settings.enabled);

            const folderData = await StorageService.getFoldersData();
            setFolders(folderData.folders);
            setFolderOrder(folderData.folderOrder);

            const cache = await StorageService.getChatCache();
            setChatCache(cache);

            setIsInitialized(true);
        };
        loadData();

        // Listen for changes from other tabs or the observer
        const handleStorageChange = (changes) => {
            if (changes[STORAGE_KEYS.ENABLED]) {
                setEnabled(changes[STORAGE_KEYS.ENABLED].newValue);
            }

            if (changes[STORAGE_KEYS.FOLDERS]) {
                const raw = changes[STORAGE_KEYS.FOLDERS].newValue;
                if (typeof raw === 'string') {
                    StorageService.getFoldersData().then((data) => setFolders(data.folders));
                }
                else if (raw) {
                    setFolders(raw);
                }
            }

            if (changes[STORAGE_KEYS.FOLDER_ORDER]) {
                setFolderOrder(changes[STORAGE_KEYS.FOLDER_ORDER].newValue || []);
            }

            if (changes[STORAGE_KEYS.CHAT_CACHE]) {
                setChatCache(changes[STORAGE_KEYS.CHAT_CACHE].newValue || {});
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        // Listen for URL changes to update active state
        const handleUrlChange = () => {
            const match = window.location.href.match(/app\/([a-zA-Z0-9]+)/);
            if (match && match[1]) {
                setActiveChatId(match[1]);
            }
            else {
                setActiveChatId(null);
            }
        };

        // Initial URL check
        handleUrlChange();

        let lastUrl = window.location.href;
        const urlObserver = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                handleUrlChange();
            }
        });
        urlObserver.observe(document.body, { subtree: true, childList: true });

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
            urlObserver.disconnect();
        };
    }, []);

    const handleToggle = (newState) => {
        setEnabled(newState);
        StorageService.toggleEnabled(newState);
    };

    const handleCreateFolder = async () => {
        const id = await StorageService.createFolder();
        setNewFolderId(id);
    };

    const handleFolderRenamed = () => {
        setNewFolderId(null);
    };

    const handleNewChat = () => {
        // Trigger native new chat
        window.location.href = GEMINI_APP_URL;
    };

    // Calculate chats in folders vs uncategorized
    const chatsInFolders = new Set();
    Object.values(folders || {}).forEach((f) => {
        if (f.chatIds) f.chatIds.forEach((id) => chatsInFolders.add(id));
    });

    const uncategorizedChats = Object.entries(chatCache || {})
        .filter(([id]) => !chatsInFolders.has(id))
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => {
            // Hybrid Sorting: Active (Visible) first, then Historical (Last Sync)
            const NOW = Date.now();
            const ACTIVE_THRESHOLD = 5 * 60 * 1000;

            const aIsActive = (NOW - (a.lastSync || 0)) < ACTIVE_THRESHOLD
                && a.domIndex !== undefined;
            const bIsActive = (NOW - (b.lastSync || 0)) < ACTIVE_THRESHOLD
                && b.domIndex !== undefined;

            // Tier 1: Both are Active (Visible in DOM) -> Sort by domIndex (0, 1, 2...)
            if (aIsActive && bIsActive) {
                return a.domIndex - b.domIndex;
            }

            // Tier 2: One is Active, one is Historical
            // Active always comes before Historical
            if (aIsActive && !bIsActive) return -1;
            if (!aIsActive && bIsActive) return 1;

            // Tier 3: Both are Historical (Not in current DOM) -> Sort by lastSync (Newest first)
            return (b.lastSync || 0) - (a.lastSync || 0);
        });

    // Theme Detection (auto-detects Gemini and syncs to storage)
    const { themeClass } = useTheme();

    if (!isInitialized) return null;

    return (
        <>
            <div
                className={`gf-sidebar ${!enabled ? 'hidden' : ''} ${themeClass}`}
                style={{ width: SIDEBAR_WIDTH }}
            >
                <div className="gf-header">
                    <button type="button" className="gf-action-btn primary" onClick={handleNewChat}>
                        <MessageSquarePlus size={16} /> New Chat
                    </button>
                    <button type="button" className="gf-action-btn" onClick={handleCreateFolder}>
                        <FolderPlus size={16} />
                    </button>
                </div>

                <div className="gf-scroll-area">
                    <FolderList
                        folders={folders}
                        folderOrder={folderOrder}
                        chatCache={chatCache}
                        activeChatId={activeChatId}
                        newFolderId={newFolderId}
                        onFolderRenamed={handleFolderRenamed}
                    />

                    <div className="gf-uncategorized-header">Recents</div>

                    <UncategorizedList
                        chats={uncategorizedChats}
                        activeChatId={activeChatId}
                    />
                </div>
            </div>

            <ToggleSwitch enabled={enabled} onToggle={handleToggle} />
        </>
    );
};
