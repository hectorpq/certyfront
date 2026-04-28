import { useRef, useEffect, useState, useCallback } from 'react';
import { Trash2, Pen, Upload, X } from 'lucide-react';

interface SignaturePadProps {
  onSave: (file: File | null) => void;
  initialPreview?: string | null;
}

export const SignaturePad = ({ onSave, initialPreview }: SignaturePadProps) => {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  // --- Draw state ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // --- Upload state ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // ---- Canvas helpers ----
  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  };

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e, canvas);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
    hasDrawn.current = true;
    setIsEmpty(false);
  }, []);

  const stopDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    if (!hasDrawn.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      onSave(new File([blob], 'firma.png', { type: 'image/png' }));
    }, 'image/png');
  }, [onSave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    setIsEmpty(true);
    onSave(null);
  };

  // ---- Upload helpers ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPreview(URL.createObjectURL(file));
    onSave(file);
  };

  const clearUpload = () => {
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onSave(null);
  };

  // ---- Mode switch ----
  const switchMode = (next: 'draw' | 'upload') => {
    setMode(next);
    onSave(null);
    if (next === 'draw') {
      setUploadPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      clearCanvas();
    }
  };

  return (
    <div className="space-y-2">
      {/* Tabs */}
      <div className="flex rounded-lg border border-secondary-200 overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => switchMode('draw')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'draw'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-secondary-500 hover:bg-secondary-50'
          }`}
        >
          <Pen className="w-3 h-3" />
          Dibujar
        </button>
        <button
          type="button"
          onClick={() => switchMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-secondary-500 hover:bg-secondary-50'
          }`}
        >
          <Upload className="w-3 h-3" />
          Subir imagen
        </button>
      </div>

      {/* Draw mode */}
      {mode === 'draw' && (
        <div className="space-y-1.5">
          <div className="relative border-2 border-dashed border-secondary-300 rounded-xl bg-white overflow-hidden hover:border-primary-400 transition-colors">
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <Pen className="w-6 h-6 text-secondary-300 mb-1" />
                <span className="text-xs text-secondary-400">Dibuja tu firma aquí</span>
              </div>
            )}
            {initialPreview && isEmpty && (
              <img
                src={initialPreview}
                alt="Firma actual"
                className="absolute inset-0 w-full h-full object-contain p-2 opacity-25 pointer-events-none"
              />
            )}
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="w-full h-36 cursor-crosshair touch-none"
              style={{ display: 'block' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary-400">{isEmpty ? 'Lienzo vacío' : 'Firma lista'}</span>
            <button
              type="button"
              onClick={clearCanvas}
              disabled={isEmpty}
              className="flex items-center gap-1 text-xs text-secondary-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div className="space-y-2">
          {uploadPreview || initialPreview ? (
            <div className="relative inline-flex items-center gap-3 p-3 border border-secondary-200 rounded-xl bg-white">
              <img
                src={uploadPreview || initialPreview || ''}
                alt="Firma"
                className="h-14 object-contain"
              />
              <button
                type="button"
                onClick={clearUpload}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 w-full border-2 border-dashed border-secondary-300 rounded-xl text-sm text-secondary-500 hover:border-primary-400 hover:text-primary-600 transition-colors justify-center"
            >
              <Upload className="w-4 h-4" />
              Seleccionar imagen (PNG, JPG)
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          {(uploadPreview || initialPreview) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary-600 hover:underline"
            >
              Cambiar imagen
            </button>
          )}
        </div>
      )}
    </div>
  );
};
