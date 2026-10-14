import React, { useState, useRef } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const COLORS = [
  { id: '#0f172a', name: 'Noir Carbone', preview: '#0f172a' },
  { id: '#2563eb', name: 'Bleu Encre', preview: '#2563eb' },
  { id: '#dc2626', name: 'Rouge Sanguine', preview: '#dc2626' },
];

const STROKE_WIDTHS = [
  { size: 2.5, label: 'Fin' },
  { size: 4.5, label: 'Moyen' },
  { size: 7.5, label: 'Large' },
];

export default function InnocentToolbar({
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  isEraser,
  setIsEraser,
  paperTheme,
  onOpenSecretModal,
}) {
  const [showWidthPicker, setShowWidthPicker] = useState(false);

  // Long press detection on Trash / Corbeille to open Settings / Secret Menu
  const trashTimerRef = useRef(null);
  const isTrashLongPressedRef = useRef(false);

  const startTrashPress = () => {
    isTrashLongPressedRef.current = false;
    trashTimerRef.current = setTimeout(() => {
      isTrashLongPressedRef.current = true;
      if (onOpenSecretModal) onOpenSecretModal();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(30);
        } catch {
          // ignore
        }
      }
    }, 800); // 800ms long-press
  };

  const cancelTrashPress = () => {
    if (trashTimerRef.current) {
      clearTimeout(trashTimerRef.current);
      trashTimerRef.current = null;
    }
  };

  const handleTrashClick = (e) => {
    // If it was a long-press, do not clear the canvas!
    if (isTrashLongPressedRef.current) {
      isTrashLongPressedRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Normal short click = innocent clear
    window.dispatchEvent(new CustomEvent('drawing-action', { detail: 'clear' }));
  };

  const triggerUndo = () => {
    window.dispatchEvent(new CustomEvent('drawing-action', { detail: 'undo' }));
  };

  const mutedColor = paperTheme === 'light' ? '#78716c' : '#94a3b8';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 12px 6px',
    }}>
      {/* Drawing Tools Strip (Directly beneath real native status bar) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: '16px',
        background: paperTheme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
        border: paperTheme === 'light' ? '1px solid #e7e5e4' : '1px solid var(--border-subtle)',
        boxShadow: paperTheme === 'light' ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 10px rgba(0,0,0,0.3)',
      }}>
        {/* Left tools: Pen, Eraser, Width, Colors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Pen Tool */}
          <button
            onClick={() => setIsEraser(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: !isEraser
                ? `2px solid ${paperTheme === 'light' ? '#0f172a' : '#38bdf8'}`
                : '1px solid transparent',
              background: !isEraser
                ? (paperTheme === 'light' ? '#f5f5f4' : 'rgba(56, 189, 248, 0.15)')
                : 'transparent',
              color: !isEraser
                ? (paperTheme === 'light' ? '#0f172a' : '#38bdf8')
                : mutedColor,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Crayon"
          >
            <PenTool size={18} />
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => setIsEraser(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: isEraser
                ? `2px solid ${paperTheme === 'light' ? '#0f172a' : '#f43f5e'}`
                : '1px solid transparent',
              background: isEraser
                ? (paperTheme === 'light' ? '#fee2e2' : 'rgba(244, 63, 94, 0.15)')
                : 'transparent',
              color: isEraser
                ? (paperTheme === 'light' ? '#0f172a' : '#f43f5e')
                : mutedColor,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Gomme"
          >
            <Eraser size={18} />
          </button>

          {/* Stroke Width Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowWidthPicker(!showWidthPicker)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: paperTheme === 'light' ? '#f5f5f4' : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
              title="Épaisseur"
            >
              <div style={{
                width: `${Math.min(strokeWidth * 2, 16)}px`,
                height: `${Math.min(strokeWidth * 2, 16)}px`,
                borderRadius: '50%',
                background: strokeColor,
              }} />
            </button>

            {/* Width Picker Popup */}
            {showWidthPicker && (
              <div style={{
                position: 'absolute',
                top: '46px',
                left: 0,
                background: paperTheme === 'light' ? '#ffffff' : '#1e293b',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                zIndex: 60,
              }}>
                {STROKE_WIDTHS.map((sw) => (
                  <button
                    key={sw.size}
                    onClick={() => {
                      setStrokeWidth(sw.size);
                      setShowWidthPicker(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: strokeWidth === sw.size ? 'rgba(56, 189, 248, 0.15)' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: paperTheme === 'light' ? '#1c1917' : '#ffffff',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{
                      width: `${sw.size * 2}px`,
                      height: `${sw.size * 2}px`,
                      borderRadius: '50%',
                      background: strokeColor,
                    }} />
                    <span>{sw.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Colors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setStrokeColor(c.id);
                  setIsEraser(false);
                }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: c.preview,
                  border: strokeColor === c.id && !isEraser
                    ? '2.5px solid #ffffff'
                    : '2px solid transparent',
                  boxShadow: strokeColor === c.id && !isEraser
                    ? '0 0 0 2px #0284c7'
                    : '0 1px 3px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.15s ease',
                  transform: strokeColor === c.id && !isEraser ? 'scale(1.15)' : 'scale(1)',
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Right actions: Undo & Clear / Settings Long-Press */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Undo */}
          <button
            onClick={triggerUndo}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: paperTheme === 'light' ? '#f5f5f4' : 'rgba(255, 255, 255, 0.06)',
              color: paperTheme === 'light' ? '#44403c' : '#cbd5e1',
              cursor: 'pointer',
            }}
            title="Annuler"
          >
            <RotateCcw size={16} />
          </button>

          {/* Corbeille / Trash Button
              - Clic court : Efface la page
              - Appui long (~800ms) : Ouvre le menu des réglages magiques
          */}
          <button
            onClick={handleTrashClick}
            onMouseDown={startTrashPress}
            onMouseUp={cancelTrashPress}
            onMouseLeave={cancelTrashPress}
            onTouchStart={startTrashPress}
            onTouchEnd={(e) => {
              cancelTrashPress();
              if (isTrashLongPressedRef.current) {
                e.preventDefault();
              }
            }}
            onTouchCancel={cancelTrashPress}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: paperTheme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation',
            }}
            title="Effacer (Maintien pour réglages)"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
