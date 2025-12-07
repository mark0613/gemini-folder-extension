import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

const rootId = 'gemini-folder-extension-root';
const rootElement = document.createElement('div');
rootElement.id = rootId;
document.body.appendChild(rootElement);
ReactDOM.createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
