/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Maximize2, X, Plus } from 'lucide-react';
import { AuditPhotoEvidence } from '../types/audit';

interface PhotoEvidenceUploaderProps {
  photos: AuditPhotoEvidence[];
  onChange: (photos: AuditPhotoEvidence[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
  label?: string;
}

export const PhotoEvidenceUploader: React.FC<PhotoEvidenceUploaderProps> = ({
  photos = [],
  onChange,
  maxPhotos = 6,
  readOnly = false,
  label = 'Evidencias Fotográficas del Hallazgo'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoForZoom, setSelectedPhotoForZoom] = useState<AuditPhotoEvidence | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress and resize image to prevent LocalStorage/IndexedDB quota issues
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1280;
          const maxHeight = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Use JPEG with 0.82 compression for crisp litographic inspection and compact storage
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= maxPhotos) {
      alert(`Has alcanzado el límite máximo de ${maxPhotos} fotografías por hallazgo.`);
      return;
    }

    setIsProcessing(true);
    const newPhotos: AuditPhotoEvidence[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        if (photos.length + newPhotos.length >= maxPhotos) break;
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await compressImage(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          dataUrl,
          name: file.name,
          caption: '',
          timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        });
      }

      if (newPhotos.length > 0) {
        onChange([...photos, ...newPhotos]);
      }
    } catch (err) {
      console.error('Error al procesar la fotografía de evidencia:', err);
      alert('Hubo un inconveniente al cargar la fotografía. Por favor intenta con otra imagen.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    onChange(photos.filter(p => p.id !== photoId));
  };

  const handleUpdateCaption = (photoId: string, caption: string) => {
    onChange(
      photos.map(p => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Label and Upload Button */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-indigo-600" />
          <span>{label}</span>
          <span className="text-[10px] font-normal text-slate-400">
            ({photos.length}/{maxPhotos})
          </span>
        </label>

        {!readOnly && photos.length < maxPhotos && (
          <div className="no-print">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Subir Foto / Evidencia</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-4/3 w-full bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || 'Evidencia fotográfica en prensa'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* Overlay actions on screen */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoForZoom(photo)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-sm cursor-pointer"
                    title="Ampliar fotografía"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-sm cursor-pointer"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Timestamp badge */}
                {photo.timestamp && (
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1 py-0.5 rounded">
                    {photo.timestamp}
                  </span>
                )}
              </div>

              {/* Caption field */}
              <div className="mt-1.5">
                {!readOnly ? (
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                    placeholder="Descripción de la foto (ej. Plancha rayada, densitómetro)..."
                    className="w-full text-[10px] p-1 border border-slate-200 rounded bg-white text-slate-800 focus:outline-hidden focus:border-indigo-500 truncate"
                  />
                ) : (
                  <span className="text-[10px] text-slate-700 block italic leading-tight">
                    {photo.caption || 'Sin descripción'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-[11px] no-print">
          <ImageIcon className="w-4 h-4 mx-auto mb-1 text-slate-300" />
          <span>No hay evidencias fotográficas adjuntas a este punto.</span>
        </div>
      )}

      {/* Zoom Modal */}
      {selectedPhotoForZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs no-print">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-800">
                  Inspección de Evidencia Fotográfica en Prensa
                </span>
                {selectedPhotoForZoom.timestamp && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({selectedPhotoForZoom.timestamp})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoForZoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden max-h-[70vh]">
              <img
                src={selectedPhotoForZoom.dataUrl}
                alt={selectedPhotoForZoom.caption || 'Evidencia fotográfica'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {selectedPhotoForZoom.caption && (
              <p className="mt-3 text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded border border-slate-200">
                <strong>Descripción:</strong> {selectedPhotoForZoom.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
