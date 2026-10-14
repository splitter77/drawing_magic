import React, { useRef, useEffect, useState, useCallback, useImperativeHandle } from 'react';

export default function DrawingCanvas({
  strokeColor = '#0f172a',
  strokeWidth = 3.5,
  isEraser = false,
  onHistoryChange,
  registerCanvasCallbacks,
  paperTheme = 'light', // 'light' (sketchbook) | 'dark' (slate)
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Drawing state
  const isDrawingRef = useRef(false);
  const pointsRef = useRef([]);
  const activePointerIdRef = useRef(null);

  // Undo / Redo history stack (stores DataURLs)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Colors & styles
  const bgColor = paperTheme === 'light' ? '#fcfbf7' : '#0b0f19';

  // Resize canvas to fill container with proper devicePixelRatio
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save existing content before resizing
    let existingData = null;
    if (canvas.width > 0 && canvas.height > 0) {
      existingData = canvas.toDataURL();
    }

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear and restore
    if (existingData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = existingData;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Push new state to history
  const pushState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => {
      const newHist = prev.slice(0, historyIndex + 1);
      newHist.push(dataUrl);
      if (newHist.length > 25) newHist.shift(); // Limit to 25 steps
      return newHist;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Notify parent of undo/redo availability
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange({
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
      });
    }
  }, [historyIndex, history.length, onHistoryChange]);

  // Imperative callbacks for the magic switch
  useEffect(() => {
    if (!registerCanvasCallbacks) return;

    registerCanvasCallbacks({
      getCanvasData: () => {
        return canvasRef.current ? canvasRef.current.toDataURL() : null;
      },
      loadCanvasData: (dataUrl) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = containerRef.current;
        const w = container ? container.clientWidth : canvas.width;
        const h = container ? container.clientHeight : canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (dataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, w, h);
            // Replace history head with new data
            setHistory([dataUrl]);
            setHistoryIndex(0);
          };
          img.src = dataUrl;
        } else {
          setHistory([]);
          setHistoryIndex(-1);
        }
      },
    });
  }, [registerCanvasCallbacks]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex <= 0) {
      // Clear to empty
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const container = containerRef.current;
      ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
      setHistoryIndex(-1);
      return;
    }

    const newIdx = historyIndex - 1;
    const targetData = history[newIdx];
    const canvas = canvasRef.current;
    if (!canvas || !targetData) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
      ctx.drawImage(img, 0, 0, container.clientWidth, container.clientHeight);
      setHistoryIndex(newIdx);
    };
    img.src = targetData;
  }, [historyIndex, history]);

  // Clear function
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
    pushState();
  }, [pushState]);

  // Expose undo & clear via global event listener or props
  useEffect(() => {
    const handleCustomEvent = (e) => {
      if (e.detail === 'undo') undo();
      if (e.detail === 'clear') clear();
    };
    window.addEventListener('drawing-action', handleCustomEvent);
    return () => window.removeEventListener('drawing-action', handleCustomEvent);
  }, [undo, clear]);

  // Drawing Pointer Event Handlers with Quadratic Smoothing
  const handlePointerDown = (e) => {
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) {
      return; // Ignore secondary touches
    }

    e.target.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    isDrawingRef.current = true;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointsRef.current = [{ x, y }];

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, (isEraser ? strokeWidth * 2.5 : strokeWidth) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? bgColor : strokeColor;
    ctx.fill();
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || e.pointerId !== activePointerIdRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const points = pointsRef.current;
    points.push({ x, y });

    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = isEraser ? strokeWidth * 3 : strokeWidth;
    ctx.strokeStyle = isEraser ? bgColor : strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length >= 3) {
      // Draw smooth quadratic curve using midpoint
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      ctx.beginPath();
      const prevMid = points.length === 3
        ? points[0]
        : {
            x: (points[points.length - 3].x + p1.x) / 2,
            y: (points[points.length - 3].y + p1.y) / 2,
          };

      ctx.moveTo(prevMid.x, prevMid.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e) => {
    if (e.pointerId !== activePointerIdRef.current) return;
    isDrawingRef.current = false;
    activePointerIdRef.current = null;
    pointsRef.current = [];
    pushState();
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: bgColor,
        borderRadius: '16px',
        boxShadow: paperTheme === 'light'
          ? 'inset 0 0 20px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.06)'
          : 'inset 0 0 30px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)',
        border: paperTheme === 'light' ? '1px solid #e7e5e4' : '1px solid #1e293b',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isEraser ? 'cell' : 'crosshair',
      }}
    >
      {/* Subtle notebook ruled background or dots if light theme */}
      {paperTheme === 'light' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          backgroundImage: 'radial-gradient(#78716c 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />
      )}

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
