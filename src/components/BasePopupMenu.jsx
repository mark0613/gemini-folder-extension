import { useEffect, useRef } from 'react';

import './Menu.css';

/**
 * Base Popup Menu Component
 * Handles positioning, backdrop, and click-outside logic.
 */
const BasePopupMenu = ({ show, onClose, children, position, anchorRef, className = '' }) => {
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!show) return undefined;
        const handleClickOutside = (event) => {
            if (anchorRef?.current && anchorRef.current.contains(event.target)) {
                return;
            }
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose, anchorRef]);

    if (!show) return null;

    const style = position ? { top: position.top, left: position.left, position: 'fixed' } : {};

    return (
        <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            className={`gf-helper-menu ${className}`}
            style={style}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
};

export default BasePopupMenu;
