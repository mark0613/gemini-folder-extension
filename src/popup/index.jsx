import React, { useState, useEffect } from 'react';
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
        StorageService.getSettings().then(({ enabled }) => {
            setEnabled(enabled);
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
                <span>Overlay Enabled</span>
                <label className="gf-toggle-switch">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={toggle}
                    />
                    <span className={`gf-toggle-track ${enabled ? 'active' : ''}`}></span>
                    <span className={`gf-toggle-thumb ${enabled ? 'active' : ''}`}></span>
                </label>
            </div>

            <p className="gf-popup-hint">
                Toggle to show/hide the custom sidebar overlay on Gemini.
            </p>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
