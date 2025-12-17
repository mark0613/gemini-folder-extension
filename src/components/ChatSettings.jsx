import { useEffect, useState } from 'react';

import { FolderMinus, FolderPlus } from 'lucide-react';

import { StorageService } from '../content/storage';

import BasePopupMenu from './BasePopupMenu';

const ChatSettings = ({ show, onClose, chatId, anchorRef, menuPos, folderId }) => {
    const [folders, setFolders] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setLoading(true);
            StorageService.getFoldersData()
                .then((data) => setFolders(data.folders))
                .finally(() => setLoading(false));
        }
    }, [show]);

    const handleMoveToFolder = async (targetFolderId) => {
        await StorageService.moveChatToFolder(chatId, targetFolderId);
        onClose();
    };

    const handleRemoveFromFolder = async () => {
        const { folders: foldersData } = await StorageService.getFoldersData();
        if (foldersData[folderId]) {
            foldersData[folderId].chatIds = foldersData[folderId].chatIds.filter(
                (id) => id !== chatId,
            );
            await StorageService.updateFolders(foldersData);
        }
        onClose();
    };

    return (
        <BasePopupMenu
            show={show}
            onClose={onClose}
            anchorRef={anchorRef}
            position={menuPos}
        >
            {loading ? (
                <div style={{ padding: 8, fontSize: 12, color: '#888' }}>Loading...</div>
            ) : (
                <>
                    <div style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--gf-text-muted)',
                        borderBottom: '1px solid var(--gf-border)',
                        marginBottom: 4,
                    }}
                    >
                        Move to...
                    </div>
                    {Object.entries(folders).length === 0 && (
                        <div style={{ padding: 8, fontSize: 12, fontStyle: 'italic' }}>No folders</div>
                    )}
                    {Object.entries(folders).map(([fid, folder]) => (
                        <div
                            key={fid}
                            role="menuitem"
                            tabIndex={0}
                            className="gf-menu-item"
                            onClick={() => handleMoveToFolder(fid)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMoveToFolder(fid)}
                        >
                            <FolderPlus size={14} />
                            <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {folder.name}
                            </span>
                        </div>
                    ))}

                    {folderId && (
                        <>
                            <div style={{
                                borderTop: '1px solid var(--gf-border)',
                                marginTop: 4,
                                paddingTop: 4,
                            }}
                            />
                            <div
                                role="menuitem"
                                tabIndex={0}
                                className="gf-menu-item"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveFromFolder();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveFromFolder();
                                    }
                                }}
                                style={{ color: 'var(--gf-danger, #ff4d4f)' }}
                            >
                                <FolderMinus size={14} />
                                <span style={{ fontSize: 12 }}>Remove</span>
                            </div>
                        </>
                    )}
                </>
            )}
        </BasePopupMenu>
    );
};

export default ChatSettings;
