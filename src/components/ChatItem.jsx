import { GEMINI_APP_URL } from '../content/storage';

const ChatItem = ({ chatId, title, isActive }) => {

    const handleDragStart = (e) => {
        e.stopPropagation(); // Prevent parent (like Folder) from dragging
        e.dataTransfer.setData('application/json', JSON.stringify({ chatId, type: 'chat' }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = () => {
        window.location.href = `${GEMINI_APP_URL}/${chatId}`;
    };

    return (
        <div
            className={`gf-chat-item ${isActive ? 'active' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onClick={handleClick}
            title={title}
        >
            {title || 'Untitled Chat'}
        </div>
    );
};

export default ChatItem;
