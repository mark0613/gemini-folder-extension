import { Edit2, Trash2 } from 'lucide-react';

import { FOLDER_COLORS } from '../content/storage';

import BasePopupMenu from './BasePopupMenu';

const FolderMenu = ({
    show,
    onClose,
    onRename,
    onDelete,
    onChangeColor,
    currentColor,
    anchorRef,
}) => (
    <BasePopupMenu
        show={show}
        onClose={onClose}
        anchorRef={anchorRef}
        className="gf-folder-menu"
    >
        <div
            role="menuitem"
            tabIndex={0}
            className="gf-menu-item"
            onClick={() => {
                onRename();
                onClose();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    onRename();
                    onClose();
                }
            }}
        >
            <Edit2 size={12} /> Rename
        </div>
        <div
            role="menuitem"
            tabIndex={0}
            className="gf-menu-item delete"
            onClick={() => {
                onDelete();
                onClose();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    onDelete();
                    onClose();
                }
            }}
        >
            <Trash2 size={12} /> Delete
        </div>
        <div className="gf-menu-colors" role="group" aria-label="Folder colors">
            {Object.values(FOLDER_COLORS).map((c) => (
                <div
                    key={c}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select color ${c}`}
                    onClick={() => {
                        onChangeColor(c);
                        onClose();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onChangeColor(c);
                            onClose();
                        }
                    }}
                    style={{
                        width: 16,
                        height: 16,
                        backgroundColor: c,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: currentColor === c
                            ? '2px solid var(--gf-text-primary)'
                            : '1px solid transparent',
                    }}
                />
            ))}
        </div>
    </BasePopupMenu>
);

export default FolderMenu;
