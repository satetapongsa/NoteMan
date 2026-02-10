import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Pen, Eraser, Square, Circle, Type, Undo2, Redo2,
    Palette, Download, Trash2, Move
} from 'lucide-react';
import { Button } from '../UI/Button';
import './DrawingCanvas.css';

export const DrawingCanvas = ({ noteId, initialData, onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#6366f1');
    const [lineWidth, setLineWidth] = useState(2);
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
        '#000000', '#ffffff'
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Load initial data if exists
        if (initialData) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                saveToHistory();
            };
            img.src = initialData;
        } else {
            // Clear canvas with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveToHistory();
        }
    }, []);

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(canvas.toDataURL());
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = history[historyStep - 1];
            setHistoryStep(historyStep - 1);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = history[historyStep + 1];
            setHistoryStep(historyStep + 1);
        }
    };

    const clearCanvas = () => {
        if (!window.confirm('Clear the entire canvas?')) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = lineWidth * 3;
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === 'pen' || tool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();

            // Save to note
            if (onSave) {
                const canvas = canvasRef.current;
                onSave(canvas.toDataURL());
            }
        }
    };

    return (
        <div className="drawing-canvas-container">
            {/* Toolbar */}
            <div className="canvas-toolbar glass">
                <div className="toolbar-group">
                    <button
                        className={`canvas-tool-btn ${tool === 'pen' ? 'active' : ''}`}
                        onClick={() => setTool('pen')}
                        title="Pen"
                    >
                        <Pen size={18} />
                    </button>
                    <button
                        className={`canvas-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                        onClick={() => setTool('eraser')}
                        title="Eraser"
                    >
                        <Eraser size={18} />
                    </button>
                </div>

                <div className="toolbar-separator" />

                <div className="toolbar-group">
                    <button
                        className="canvas-tool-btn"
                        onClick={undo}
                        disabled={historyStep <= 0}
                        title="Undo"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        className="canvas-tool-btn"
                        onClick={redo}
                        disabled={historyStep >= history.length - 1}
                        title="Redo"
                    >
                        <Redo2 size={18} />
                    </button>
                </div>

                <div className="toolbar-separator" />

                <div className="toolbar-group">
                    <div className="color-picker">
                        {colors.map((c) => (
                            <button
                                key={c}
                                className={`color-swatch ${color === c ? 'active' : ''}`}
                                style={{ background: c }}
                                onClick={() => setColor(c)}
                                title={c}
                            />
                        ))}
                    </div>
                </div>

                <div className="toolbar-separator" />

                <div className="toolbar-group">
                    <label className="line-width-control">
                        <span>Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(Number(e.target.value))}
                        />
                        <span>{lineWidth}px</span>
                    </label>
                </div>

                <div className="toolbar-separator" />

                <div className="toolbar-group">
                    <button
                        className="canvas-tool-btn"
                        onClick={downloadCanvas}
                        title="Download"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        className="canvas-tool-btn danger"
                        onClick={clearCanvas}
                        title="Clear Canvas"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="drawing-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
        </div>
    );
};
