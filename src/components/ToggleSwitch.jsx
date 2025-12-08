import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';

const ToggleSwitch = ({ enabled, onToggle, className = '' }) => {
    return (
        <button
            onClick={() => onToggle(!enabled)}
            className={`
        fixed bottom-6 right-6 z-[10000] 
        p-3 rounded-full shadow-lg transition-all duration-300
        hover:scale-110 active:scale-95
        flex items-center justify-center
        ${enabled ? 'bg-[#1a73e8] text-white' : 'bg-[#2d2e35] text-gray-300 border border-gray-600'}
        ${className}
      `}
            title={enabled ? "Hide Folder Sidebar" : "Show Folder Sidebar"}
            style={{
                // Fallback styles if clean CSS isn't loaded yet
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 2147483602, // Higher than sidebar
                borderRadius: '9999px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: enabled ? 'none' : '1px solid #4b5563',
                backgroundColor: enabled ? '#1a73e8' : '#2d2e35',
                color: enabled ? 'white' : '#d1d5db',
                cursor: 'pointer',
                pointerEvents: 'auto', // CRITICAL: Re-enable pointer events since parent has none
            }}
        >
            {enabled ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
        </button>
    );
};

export default ToggleSwitch;
