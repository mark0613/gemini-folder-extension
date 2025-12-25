import { useEffect, useLayoutEffect, useState } from 'react';

import {
    autoUpdate,
    flip,
    offset,
    shift,
    useFloating,
} from '@floating-ui/react';

import './Menu.css';

/**
 * Base Popup Menu Component
 * Uses floating-ui for smart positioning with auto-update on scroll/resize.
 */
const BasePopupMenu = ({ show, onClose, children, anchorRef, className = '' }) => {
    const [isReady, setIsReady] = useState(false);

    const { refs, floatingStyles, isPositioned } = useFloating({
        open: show,
        placement: 'bottom-end',
        middleware: [
            offset(5),
            flip({ fallbackPlacements: ['top-end', 'bottom-start', 'top-start'] }),
            shift({ padding: 8 }),
        ],
        whileElementsMounted: autoUpdate,
    });

    // Sync anchorRef to floating-ui's reference BEFORE paint
    useLayoutEffect(() => {
        if (anchorRef?.current) {
            refs.setReference(anchorRef.current);
        }
    }, [anchorRef, refs]);

    // Wait for position to stabilize (flip middleware needs an extra frame)
    useEffect(() => {
        if (!show) {
            setIsReady(false);
            return undefined;
        }
        if (isPositioned) {
            // Give flip middleware time to adjust
            const timer = requestAnimationFrame(() => {
                setIsReady(true);
            });
            return () => cancelAnimationFrame(timer);
        }
        return undefined;
    }, [show, isPositioned]);

    // Close on click outside
    useEffect(() => {
        if (!show) return undefined;
        const handleClickOutside = (event) => {
            if (anchorRef?.current && anchorRef.current.contains(event.target)) {
                return;
            }
            if (refs.floating.current && !refs.floating.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose, anchorRef, refs]);

    // Close on Escape
    useEffect(() => {
        if (!show) return undefined;
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div
            ref={refs.setFloating}
            role="menu"
            tabIndex={-1}
            className={`gf-helper-menu ${className}`}
            style={{
                ...floatingStyles,
                visibility: isReady ? 'visible' : 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
};

export default BasePopupMenu;
