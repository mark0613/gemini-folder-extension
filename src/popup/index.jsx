import { StrictMode, useEffect, useState } from 'react';

import ReactDOM from 'react-dom/client';

import { StorageService } from '../content/storage';
import { useTheme } from '../hooks/useTheme';

import '../components/index.css';
import './Popup.css';

const Popup = () => {
    const [enabled, setEnabled] = useState(true);
    // Reads theme from storage (synced by content script from Gemini)
    const { themeClass } = useTheme();

    useEffect(() => {
        StorageService.getSettings().then(({ enabled: isEnabled }) => {
            setEnabled(isEnabled);
        });
    }, []);

    const toggle = async () => {
        const newState = !enabled;
        setEnabled(newState);
        await StorageService.toggleEnabled(newState);
    };

    return (
        <div className={`gf-popup ${themeClass}`}>
            <h2 className="gf-popup-title">Gemini Folder</h2>

            <div className="gf-popup-toggle-row">
                <span id="overlay-toggle-label">Overlay Enabled</span>
                <label className="gf-toggle-switch" htmlFor="overlay-toggle">
                    <input
                        id="overlay-toggle"
                        type="checkbox"
                        checked={enabled}
                        onChange={toggle}
                        aria-labelledby="overlay-toggle-label"
                    />
                    <span className={`gf-toggle-track ${enabled ? 'active' : ''}`} />
                    <span className={`gf-toggle-thumb ${enabled ? 'active' : ''}`} />
                </label>
            </div>

            <p className="gf-popup-hint">
                Toggle to show/hide the custom sidebar overlay on Gemini.
            </p>
        </div>
    );
};

export default Popup;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <Popup />
    </StrictMode>,
);
