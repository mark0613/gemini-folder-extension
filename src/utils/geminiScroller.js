/**
 * 取得對話列表的 infinite-scroller 元素
 * @returns {Element|null}
 */
export function getScroller() {
    const container = document.querySelector('div[data-test-id="overflow-container"]');
    if (!container) return null;

    const scroller = container.querySelector('infinite-scroller');
    return scroller || null;
}

const CHAT_LIST_SELECTOR = '#conversations-list-0';
const CHAT_ITEM_SELECTOR = '.conversation-items-container';

/**
 * 取得 chat list 內的項目數量 (與 observer.js 使用相同 selector)
 * @returns {number}
 */
export function getItemCount() {
    const root = document.querySelector(CHAT_LIST_SELECTOR);
    if (!root) return 0;

    return root.querySelectorAll(CHAT_ITEM_SELECTOR).length;
}

/**
 * 滾動 infinite-scroller 到底部
 * @returns {boolean} 是否成功觸發滾動
 */
export function scroll() {
    const scroller = getScroller();
    if (!scroller) return false;

    scroller.scrollTo({
        top: scroller.scrollHeight,
        behavior: 'smooth',
    });

    return true;
}

const COOLDOWN_MS = 3000;
const MAX_FAILURES = 3;
const CHECK_DELAY_MS = 1500;

let failureCount = 0;
let isCoolingDown = false;
let cooldownTimeout = null;

/**
 * 重置 service 狀態
 */
export function reset() {
    failureCount = 0;
    isCoolingDown = false;
    if (cooldownTimeout) {
        clearTimeout(cooldownTimeout);
        cooldownTimeout = null;
    }
}

/**
 * 觸發滾動並自動管理到底偵測與冷卻
 * @param {Object} options
 * @param {Function} options.onLoading - 開始載入時的 callback
 * @param {Function} options.onComplete - 載入完成時的 callback (帶有 hasMore 參數)
 * @returns {boolean} 是否成功觸發 (false 表示正在冷卻中)
 */
export function triggerScroll({ onLoading, onComplete } = {}) {
    if (isCoolingDown) return false;

    const prevCount = getItemCount();
    const success = scroll();

    if (!success) {
        onComplete?.(false);
        return false;
    }

    onLoading?.();

    setTimeout(() => {
        const currentCount = getItemCount();

        if (currentCount <= prevCount) {
            failureCount += 1;

            if (failureCount >= MAX_FAILURES) {
                isCoolingDown = true;

                cooldownTimeout = setTimeout(() => {
                    isCoolingDown = false;
                    failureCount = 0;
                }, COOLDOWN_MS);

                onComplete?.(false);
                return;
            }
        }
        else {
            failureCount = 0;
        }

        onComplete?.(currentCount > prevCount);
    }, CHECK_DELAY_MS);

    return true;
}

/**
 * 檢查是否正在冷卻中
 * @returns {boolean}
 */
export function isCooldown() {
    return isCoolingDown;
}
