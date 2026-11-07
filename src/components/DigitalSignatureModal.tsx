/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool } from 'lucide-react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string, signatoryName: string) => void;
  title: string;
  defaultSignatoryName?: string;
  signatoryRole?: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  defaultSignatoryName = '',
  signatoryRole = 'Auditor'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatoryName, setSignatoryName] = useState(defaultSignatoryName);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [stampMode, setStampMode] = useState<'draw' | 'type'>('draw');

  useEffect(() => {
    if (isOpen) {
      setSignatoryName(defaultSignatoryName);
      setHasDrawn(false);
      setTimeout(() => {
        clearCanvas();
      }, 50);
    }
  }, [isOpen, defaultSignatoryName]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (stampMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!hasDrawn && !signatoryName) {
        alert('Por favor realiza un trazo en el recuadro de firma o escribe el nombre del firmante.');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl, signatoryName);
    } else {
      // Generate stamped text SVG as signature
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 140);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'italic 28px serif';
        ctx.fillText(signatoryName || 'Firma Registrada', 30, 60);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(25, 75);
        ctx.lineTo(375, 75);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${signatoryRole} · ISO 19011:2026 · ${new Date().toLocaleDateString('es-CO')}`, 30, 95);
        onSave(canvas.toDataURL('image/png'), signatoryName);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Validez digital para acta de auditoría ISO 19011:2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nombre Completo del Firmante
            </label>
            <input
              type="text"
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
              placeholder="Ej. Ing. Noralba Castaño Puerta"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-medium text-slate-600">Método de firma:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setStampMode('draw')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  stampMode === 'draw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trazo Manual
              </button>
              <button
                type="button"
                onClick={() => setStampMode('type')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  stampMode === 'type' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sello Caligráfico
              </button>
            </div>
          </div>

          {stampMode === 'draw' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">
                  Dibuja la firma con el mouse o con el dedo en pantallas táctiles:
                </span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpiar
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] touch-none cursor-crosshair bg-white"
                />
                {!hasDrawn && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-400 text-xs italic">
                    Espacio para firma manual aquí
                  </div>
                )}
                <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 border-t border-slate-300 w-44 pt-0.5">
                  Línea de rúbrica
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-center">
              <p className="font-serif italic text-2xl text-slate-800 my-2">
                {signatoryName || 'Nombre del Firmante'}
              </p>
              <div className="w-48 h-px bg-slate-300 mx-auto my-2" />
              <p className="text-[11px] text-slate-500">
                {signatoryRole} · Sistema de Auditorías Internas · ISO 19011:2026
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Aplicar Firma Digital
          </button>
        </div>
      </div>
    </div>
  );
};
