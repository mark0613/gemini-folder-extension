import { useRef, useState } from 'react';

import { MoreVertical } from 'lucide-react';

import { GEMINI_APP_URL } from '../content/storage';

import ChatSettings from './ChatSettings';

import './ChatItem.css';

const ChatItem = ({ chatId, title, isActive, folderId }) => {
    const [showMenu, setShowMenu] = useState(false);
    const buttonRef = useRef(null);

    const handleDragStart = (e) => {
        e.stopPropagation(); // Prevent parent (like Folder) from dragging
        e.dataTransfer.setData('application/json', JSON.stringify({ chatId, type: 'chat' }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleToggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    return (
        <a
            href={`${GEMINI_APP_URL}/${chatId}`}
            className={`gf-chat-item ${isActive ? 'active' : ''}`}
            draggable="true"
            onDragStart={handleDragStart}
            title={title}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {title || 'Untitled Chat'}
            </div>

            <div className={`gf-chat-actions ${showMenu ? 'active' : ''}`}>
                <button
                    type="button"
                    ref={buttonRef}
                    className="gf-icon-btn"
                    onClick={handleToggleMenu}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{ padding: 2 }}
                >
                    <MoreVertical size={14} />
                </button>

                <ChatSettings
                    show={showMenu}
                    onClose={() => setShowMenu(false)}
                    chatId={chatId}
                    anchorRef={buttonRef}
                    folderId={folderId}
                />
            </div>
        </a>
    );
};

export default ChatItem;
