/* eslint-disable no-console */
import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';

import './devtools';

import { Overlay } from '../components/Overlay';

import { chatObserver } from './observer';

import '../components/index.css';

const MOUNT_POINT_ID = 'gemini-folder-overlay-root';

function init() {
    // 1. Inject Mount Point
    if (!document.getElementById(MOUNT_POINT_ID)) {
        const mountPoint = document.createElement('div');
        mountPoint.id = MOUNT_POINT_ID;
        document.body.appendChild(mountPoint);

        try {
            const root = ReactDOM.createRoot(mountPoint);
            root.render(
                <StrictMode>
                    <Overlay />
                </StrictMode>,
            );
        }
        catch (e) {
            console.error('Gemini Folder: React render failed', e);
        }
    }

    // 2. Start Observer
    chatObserver.start();
}

// Ensure DOM is ready, though run_at is document_end, sometimes dynamic apps need a tick.
// Gemini is a heavy SPA.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
