import ChatItem from './ChatItem';

const UncategorizedList = ({ chats, activeChatId }) => (
    <div className="gf-uncategorized-list">
        {chats.map((chat) => (
            <ChatItem
                key={chat.id}
                chatId={chat.id}
                title={chat.title}
                isActive={activeChatId === chat.id}
            />
        ))}
    </div>
);

export default UncategorizedList;
