import { useState } from 'react';
import { StorageService } from '../content/storage';
import { ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import FolderSettings from './FolderSettings';
import './FolderItem.css';

const FolderItem = ({ folderId, folder, children, index }) => {
    const [isRenaming, setIsRenaming] = useState(folder.name === 'New Folder');
    const [nameInput, setNameInput] = useState(folder.name);
    const [showMenu, setShowMenu] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleToggleCollapse = async (e) => {
        e.stopPropagation();
        const newFolders = await StorageService.getFoldersData().then(d => d.folders);
        newFolders[folderId].collapsed = !newFolders[folderId].collapsed;
        await StorageService.updateFolders(newFolders);
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: folderId, type: 'folder', index }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const dataStr = e.dataTransfer.getData('application/json');
        if (!dataStr) return;

        try {
            const data = JSON.parse(dataStr);

            // Handle Chat Drop
            if (data.type === 'chat') {
                const { chatId } = data;
                const { folders } = await StorageService.getFoldersData();

                // Remove from all folders first
                Object.keys(folders).forEach(fid => {
                    folders[fid].chatIds = folders[fid].chatIds.filter(id => id !== chatId);
                });

                // Add to target folder
                folders[folderId].chatIds.push(chatId);
                await StorageService.updateFolders(folders);
            }
            // Handle Folder Drop (Reorder)
            else if (data.type === 'folder') {
                const sourceIndex = data.index;
                const targetIndex = index;

                if (sourceIndex === targetIndex) return;

                const { folderOrder } = await StorageService.getFoldersData();
                const newOrder = [...folderOrder];
                const [moved] = newOrder.splice(sourceIndex, 1);
                newOrder.splice(targetIndex, 0, moved);

                await StorageService.saveFolderOrder(newOrder);
            }
        } catch (err) {
            console.error('Drop failed', err);
        }
    };

    const handleRename = async () => {
        setIsRenaming(false);
        const { folders } = await StorageService.getFoldersData();
        if (folders[folderId]) {
            folders[folderId].name = nameInput;
            await StorageService.updateFolders(folders);
        }
    };

    const handleDelete = async () => {
        if (confirm('Delete this folder? Chats will be moved to Uncategorized.')) {
            await StorageService.deleteFolder(folderId);
        }
    };

    const handleChangeColor = async (color) => {
        const { folders } = await StorageService.getFoldersData();
        if (folders[folderId]) {
            folders[folderId].color = color;
            await StorageService.updateFolders(folders);
        }
    };

    return (
        <div
            className="gf-folder-section"
            draggable={!isRenaming}
            onDragStart={handleDragStart}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <div
                className={`gf-folder-header ${isDragOver ? 'drag-over' : ''}`}
                onClick={handleToggleCollapse}
            >
                <div style={{ marginRight: 6, color: '#8e918f', cursor: 'grab' }}>
                    {folder.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: folder.color }}
                    />

                    {isRenaming ? (
                        <input
                            className="gf-input"
                            autoFocus
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on input
                        />
                    ) : (
                        <span style={{ fontWeight: 500 }}>{folder.name}</span>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        className="gf-icon-btn"
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <MoreVertical size={14} />
                    </button>

                    <FolderSettings
                        show={showMenu}
                        onClose={() => setShowMenu(false)}
                        onRename={() => setIsRenaming(true)}
                        onDelete={handleDelete}
                        onChangeColor={handleChangeColor}
                        currentColor={folder.color}
                    />
                </div>
            </div>

            <div
                className="gf-folder-content"
                style={{ height: folder.collapsed ? 0 : 'auto' }}
            >
                {children}
            </div>
        </div>
    );
};

export default FolderItem;
