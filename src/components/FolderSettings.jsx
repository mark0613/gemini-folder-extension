import { useRef, useEffect } from 'react';
import { FOLDER_COLORS } from '../content/storage';
import { Trash2, Edit2 } from 'lucide-react';

const FolderSettings = ({ show, onClose, onRename, onDelete, onChangeColor, currentColor }) => {
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!show) return;
        const handleClickOutside = (event) => {
            // Check if click is on the backdrop
            if (event.target.classList.contains('gf-folder-menu-backdrop')) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose]);

    if (!show) return null;

    return (
        <>
            <div
                className="gf-folder-menu-backdrop"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />
            <div
                ref={menuRef}
                className="gf-folder-menu"
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
            >
                <div className="gf-menu-item" onClick={() => { onRename(); onClose(); }}>
                    <Edit2 size={12} /> Rename
                </div>
                <div className="gf-menu-item delete" onClick={() => { onDelete(); onClose(); }}>
                    <Trash2 size={12} /> Delete
                </div>
                <div className="gf-menu-colors">
                    {Object.values(FOLDER_COLORS).map(c => (
                        <div
                            key={c}
                            onClick={() => { onChangeColor(c); onClose(); }}
                            style={{
                                width: 16, height: 16,
                                backgroundColor: c,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                border: currentColor === c ? '2px solid var(--gf-text-primary)' : '1px solid transparent'
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default FolderSettings;
