import { useRef, useEffect } from 'react';
import './Menu.css';

/**
 * Base Popup Menu Component
 * Handles positioning, backdrop, and click-outside logic.
 */
const BasePopupMenu = ({ show, onClose, children, position, anchorRef, className = '' }) => {
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!show) return;
        const handleClickOutside = (event) => {
            // If we have an anchor, ignore clicks on it (handled by toggle)
            if (anchorRef?.current && anchorRef.current.contains(event.target)) {
                return;
            }
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        // Use mousedown to catch it before click triggers other things
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose, anchorRef]);

    if (!show) return null;

    // Default style or custom position
    // If position is provided ({top, left}), use it.
    const style = position ? { top: position.top, left: position.left, position: 'fixed' } : {};

    return (
        <div
            ref={menuRef}
            className={`gf-helper-menu ${className}`}
            style={style}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
        >
            {children}
        </div>
    );
};

export default BasePopupMenu;
