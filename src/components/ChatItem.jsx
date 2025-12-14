import { useRef, useState } from 'react';

import { MoreVertical } from 'lucide-react';

import { GEMINI_APP_URL } from '../content/storage';

import ChatSettings from './ChatSettings';

import './ChatItem.css';

const ChatItem = ({ chatId, title, isActive }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const handleDragStart = (e) => {
        e.stopPropagation(); // Prevent parent (like Folder) from dragging
        e.dataTransfer.setData('application/json', JSON.stringify({ chatId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = () => {
        window.location.href = `${GEMINI_APP_URL}/${chatId}`;
    };

    const handleToggleMenu = (e) => {
        e.stopPropagation();
        if (!showMenu && buttonRef.current) {
            // Calculate position before showing to avoid flicker/misalignment
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 5,
                left: rect.right - 140, // Align right edge
            });
        }
        setShowMenu(!showMenu);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            className={`gf-chat-item ${isActive ? 'active' : ''}`}
            draggable="true"
            onDragStart={handleDragStart}
            onClick={handleClick}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
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
                    menuPos={menuPos}
                />
            </div>
        </div>
    );
};

export default ChatItem;
