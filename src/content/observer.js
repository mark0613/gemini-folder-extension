import { StorageService } from './storage';


const SELECTORS = {
    ROOT_CONTAINER: '#conversations-list-0',
    CHAT_ITEM: '.conversation-items-container',
    // Extract ID from jslog attribute: jslog="...; box:[...,["c_cdebef2d22fce225",...]]..."
    ITEM_WITH_JSLOG: 'div.conversation',
    TITLE: '.conversation-title',
    SELECTED: 'selected', // Class when active
};

const ID_REGEX = /\["c_([a-zA-Z0-9]+)"/;

class ChatObserver {
    constructor() {
        this.observer = null;
        this.isObserving = false;
        this.debounceTimer = null;
        this.pendingUpdates = {}; // { chatId: title }
    }

    start() {
        if (this.isObserving) return;

        const root = document.querySelector(SELECTORS.ROOT_CONTAINER);
        if (!root) {
            console.warn('Gemini Folder: Root container not found, retrying in 1s...');
            setTimeout(() => this.start(), 1000);
            return;
        }

        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true, // Watch for text changes
            attributeFilter: ['class', 'jslog'], // Watch for selection or regeneration
        });

        this.isObserving = true;
        console.log('Gemini Folder: Observer started');

        // Initial scan
        this.scanList();
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.isObserving = false;
    }

    handleMutations(mutations) {
        // Simple debounce to avoid spamming storage on heavy DOM updates
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.scanList();
        }, 250);
    }

    async scanList() {
        const root = document.querySelector(SELECTORS.ROOT_CONTAINER);
        if (!root) return;

        const chatItems = root.querySelectorAll(SELECTORS.CHAT_ITEM);
        // Safety: If list is completely empty, it might be loading. Do NOT delete anything.
        if (chatItems.length === 0) return;

        const updates = {};
        const currentVisibleIds = new Set();
        let activeChatId = null;
        let domIndex = 0; // Track visual order

        chatItems.forEach((item) => {
            // Find inner div with jslog
            const conversionDiv = item.querySelector(SELECTORS.ITEM_WITH_JSLOG);
            if (!conversionDiv) return;

            const jslog = conversionDiv.getAttribute('jslog');
            if (!jslog) return;

            const match = jslog.match(ID_REGEX);
            if (match && match[1]) {
                const chatId = match[1];
                currentVisibleIds.add(chatId);
                const currentIndex = domIndex++; // Capture order

                // Extract Title
                const titleEl = item.querySelector(SELECTORS.TITLE);
                const title = titleEl ? titleEl.innerText : 'Untitled';

                updates[chatId] = {
                    title: title,
                    domIndex: currentIndex,
                    lastSync: Date.now() // Treat scan as sync
                };

                // Check if active
                if (conversionDiv.classList.contains(SELECTORS.SELECTED)) {
                    activeChatId = chatId;
                }
            }
        });

        // Batch update storage
        if (Object.keys(updates).length > 0) {
            await StorageService.batchUpdateChatCache(updates);
        }
        // TODO: Dispatch event for UI to update current active state if needed (though UI might just listen to storage, 
        // active state in native UI is ephemeral, we might want to track looking at URL too).
        // For now, let's trust URL based navigation for active state, or use this to highlight our sidebar.
    }
}

export const chatObserver = new ChatObserver();
