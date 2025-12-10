import { useState, useEffect } from 'react';
import { StorageService } from '../content/storage';
import { FolderPlus } from 'lucide-react';
import BasePopupMenu from './BasePopupMenu';

const ChatSettings = ({ show, onClose, chatId, anchorRef, menuPos }) => {
    const [folders, setFolders] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setLoading(true);
            StorageService.getFoldersData()
                .then(data => setFolders(data.folders))
                .finally(() => setLoading(false));
        }
    }, [show]);

    const handleMoveToFolder = async (folderId) => {
        await StorageService.moveChatToFolder(chatId, folderId);
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
                        marginBottom: 4
                    }}>
                        Move to...
                    </div>
                    {Object.entries(folders).length === 0 && (
                        <div style={{ padding: 8, fontSize: 12, fontStyle: 'italic' }}>No folders</div>
                    )}
                    {Object.entries(folders).map(([fid, folder]) => (
                        <div
                            key={fid}
                            className="gf-menu-item"
                            onClick={() => handleMoveToFolder(fid)}
                        >
                            <FolderPlus size={14} />
                            <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {folder.name}
                            </span>
                        </div>
                    ))}
                </>
            )}
        </BasePopupMenu>
    );
};

export default ChatSettings;
