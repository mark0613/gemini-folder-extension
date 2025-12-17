import ChatItem from './ChatItem';
import FolderItem from './FolderItem';

const FolderList = ({
    folders,
    folderOrder,
    chatCache,
    activeChatId,
    newFolderId,
    onFolderRenamed,
}) => (
    <div className="gf-folder-list">
        {folderOrder.map((folderId, index) => {
            const folder = folders[folderId];
            if (!folder) return null;
            const chatIds = folder.chatIds || [];

            return (
                <FolderItem
                    key={folderId}
                    folderId={folderId}
                    folder={folder}
                    index={index}
                    isNew={folderId === newFolderId}
                    onRenamed={onFolderRenamed}
                >
                    {chatIds.map((chatId) => {
                        const chat = chatCache[chatId] || { title: 'Unknown Chat' };
                        return (
                            <ChatItem
                                key={chatId}
                                chatId={chatId}
                                title={chat.title}
                                isActive={activeChatId === chatId}
                            />
                        );
                    })}
                    {chatIds.length === 0 && (
                        <div style={{ padding: '8px 16px 8px 36px', color: '#555', fontSize: 13, fontStyle: 'italic' }}>
                            Empty folder
                        </div>
                    )}
                </FolderItem>
            );
        })}
    </div>
);

export default FolderList;
