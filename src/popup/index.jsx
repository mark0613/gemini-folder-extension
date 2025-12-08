import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { StorageService } from '../content/storage'; // We can reuse logic if imports work, assuming vite bundler specific

// Popup assumes we are in extension context so chrome.storage works directly.
// We can reuse the StorageService logic if we copy it or import it.
// Since it's in `src/content`, let's try importing. 
// Note: importing from content/ might work if Vite bundles it correctly for the popup entry point.

const Popup = () => {
    const [enabled, setEnabled] = useState(true);

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
        <div style={{ width: 250, padding: 16, backgroundColor: '#1e1f20', color: '#e3e3e3', fontFamily: 'sans-serif' }}>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Gemini Folder</h2>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#2b2c2e', padding: 12, borderRadius: 8 }}>
                <span>Overlay Enabled</span>
                <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 20 }}>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={toggle}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                        position: 'absolute', cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: enabled ? '#a8c7fa' : '#444746',
                        transition: '.4s', borderRadius: 34
                    }}></span>
                    <span style={{
                        position: 'absolute', content: '""',
                        height: 14, width: 14, left: 3, bottom: 3,
                        backgroundColor: enabled ? '#004a77' : '#e3e3e3',
                        transition: '.4s', borderRadius: '50%',
                        transform: enabled ? 'translateX(20px)' : 'translateX(0)'
                    }}></span>
                </label>
            </div>

            <p style={{ marginTop: 12, fontSize: 12, color: '#8e918f' }}>
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
