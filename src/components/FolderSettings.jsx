import { FOLDER_COLORS } from '../content/storage';
import { Trash2, Edit2 } from 'lucide-react';
import BasePopupMenu from './BasePopupMenu';

const FolderSettings = ({ show, onClose, onRename, onDelete, onChangeColor, currentColor }) => {
    return (
        <BasePopupMenu
            show={show}
            onClose={onClose}
            className="gf-folder-menu"
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
        </BasePopupMenu>
    );
};

export default FolderSettings;
