/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Edit2, Check, FileCheck, Shield, Sparkles } from 'lucide-react';

interface DocumentHeaderProps {
  title: string;
  subtitle?: string;
  normative?: string;
  code: string;
  version: string;
  approvalDate: string;
  editorResponsible?: string;
  page?: string;
  isEditing?: boolean;
  onUpdateControlFields: (fields: {
    code: string;
    version: string;
    approvalDate: string;
    editorResponsible: string;
    page?: string;
  }) => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  title,
  subtitle = 'EVALUACIÓN AL CARGO DE OPERARIO DE PRENSA LITOGRÁFICA',
  normative = 'SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026',
  code,
  version,
  approvalDate,
  editorResponsible = 'Ing. Noralba Castaño Puerta (Auditor Líder)',
  page = 'Página 1 de 2',
  isEditing = false,
  onUpdateControlFields
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempCode, setTempCode] = useState(code);
  const [tempVersion, setTempVersion] = useState(version);
  const [tempApprovalDate, setTempApprovalDate] = useState(approvalDate);
  const [tempEditor, setTempEditor] = useState(editorResponsible);
  const [tempPage, setTempPage] = useState(page);

  const handleOpenModal = () => {
    setTempCode(code);
    setTempVersion(version);
    setTempApprovalDate(approvalDate);
    setTempEditor(editorResponsible || '');
    setTempPage(page || 'Página 1 de 2');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateControlFields({
      code: tempCode.trim() || code,
      version: tempVersion.trim() || version,
      approvalDate: tempApprovalDate.trim() || approvalDate,
      editorResponsible: tempEditor.trim() || editorResponsible,
      page: tempPage.trim() || page
    });
    setIsModalOpen(false);
  };

  return (
    <div className="relative mb-6">
      {/* Official Standard SGC Header Box */}
      <div className="border-2 border-slate-800 bg-white">
        <div className="grid grid-cols-12 divide-x-2 divide-slate-800">
          {/* Logo / Company Identification */}
          <div className="col-span-12 sm:col-span-3 p-3 flex flex-col justify-center items-center text-center bg-slate-50/80">
            <span className="font-black text-sm uppercase tracking-tight text-slate-900 leading-tight">
              IMPRESOS AL DÍA
            </span>
            <span className="text-[10px] text-slate-600 mt-0.5 font-mono font-medium">SGC ISO 9001:2015</span>
            <span className="text-[9px] text-indigo-700 font-semibold tracking-wider uppercase mt-0.5">
              Planta Litográfica
            </span>
          </div>

          {/* Central Title and Subject */}
          <div className="col-span-12 sm:col-span-6 p-3 sm:p-4 flex flex-col justify-center items-center text-center">
            <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <span className="text-[11px] font-bold text-indigo-800 mt-1 leading-snug">
                {subtitle}
              </span>
            )}
            {normative && (
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                {normative}
              </span>
            )}
          </div>

          {/* Document Control Box */}
          <div className="col-span-12 sm:col-span-3 divide-y divide-slate-800 text-[10px] flex flex-col justify-between bg-slate-50/40">
            <div className="p-1 px-2.5 font-mono flex items-center justify-between">
              <span className="font-bold text-slate-700">CÓDIGO:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    onUpdateControlFields({
                      code: e.target.value,
                      version,
                      approvalDate,
                      editorResponsible
                    })
                  }
                  className="w-24 text-right px-1 py-0.5 border border-indigo-400 rounded bg-white text-indigo-900 font-mono font-bold"
                />
              ) : (
                <span className="font-bold text-slate-900">{code}</span>
              )}
            </div>

            <div className="p-1 px-2.5 font-mono flex items-center justify-between">
              <span className="font-bold text-slate-700">VERSIÓN:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={version}
                  onChange={(e) =>
                    onUpdateControlFields({
                      code,
                      version: e.target.value,
                      approvalDate,
                      editorResponsible
                    })
                  }
                  className="w-16 text-right px-1 py-0.5 border border-indigo-400 rounded bg-white text-indigo-900 font-mono font-bold"
                />
              ) : (
                <span className="font-semibold text-slate-900">{version}</span>
              )}
            </div>

            <div className="p-1 px-2.5 flex items-center justify-between">
              <span className="font-bold text-slate-700">FECHA APROB:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={approvalDate}
                  onChange={(e) =>
                    onUpdateControlFields({
                      code,
                      version,
                      approvalDate: e.target.value,
                      editorResponsible
                    })
                  }
                  className="w-28 text-right px-1 py-0.5 border border-indigo-400 rounded bg-white text-indigo-900 font-medium"
                />
              ) : (
                <span className="text-slate-800 font-medium text-right truncate max-w-[120px]" title={approvalDate}>
                  {approvalDate}
                </span>
              )}
            </div>

            <div className="p-1 px-2.5 flex items-center justify-between bg-slate-100/60">
              <span className="font-bold text-slate-700">EDITADO POR:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editorResponsible}
                  onChange={(e) =>
                    onUpdateControlFields({
                      code,
                      version,
                      approvalDate,
                      editorResponsible: e.target.value
                    })
                  }
                  placeholder="Nombre de responsable..."
                  className="w-32 text-right px-1 py-0.5 border border-indigo-400 rounded bg-white text-slate-900 text-[9px]"
                />
              ) : (
                <span className="text-slate-800 font-semibold text-right truncate max-w-[130px]" title={editorResponsible}>
                  {editorResponsible || 'Auditor Líder'}
                </span>
              )}
            </div>

            <div className="p-1 px-2 bg-slate-100 font-bold text-center text-slate-800 text-[9px] tracking-wider uppercase flex items-center justify-center gap-1">
              <Shield className="w-2.5 h-2.5 text-indigo-600 print:hidden" />
              <span>COPIA CONTROLADA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Edit Control Documental Button for UI (hidden in print) */}
      <div className="flex justify-end mt-1.5 no-print">
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors cursor-pointer"
          title="Editar código, versión, fechas y responsable del documento"
        >
          <Edit2 className="w-3 h-3 text-indigo-600" />
          <span>Editar Control Documental (Código, Versión, Fecha y Editor)</span>
        </button>
      </div>

      {/* Modal for direct, foolproof editing of Document Control Fields */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Control Documental y Responsable
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Formato / Documento:
                </label>
                <input
                  type="text"
                  value={tempCode}
                  onChange={(e) => setTempCode(e.target.value)}
                  placeholder="ej. FO-MCO-20, FO-MCO-17..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Código reglamentario según el Sistema de Gestión de Calidad (SGC).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número de Versión:
                  </label>
                  <input
                    type="text"
                    value={tempVersion}
                    onChange={(e) => setTempVersion(e.target.value)}
                    placeholder="01, 02, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Numeración de Página:
                  </label>
                  <input
                    type="text"
                    value={tempPage}
                    onChange={(e) => setTempPage(e.target.value)}
                    placeholder="Página 1 de 2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha de Aprobación o Emisión:
                </label>
                <input
                  type="text"
                  value={tempApprovalDate}
                  onChange={(e) => setTempApprovalDate(e.target.value)}
                  placeholder="ej. 14 de Febrero de 2026 ó 2026-11-05"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Editor / Responsable que Elabora o Actualiza:
                </label>
                <input
                  type="text"
                  value={tempEditor}
                  onChange={(e) => setTempEditor(e.target.value)}
                  placeholder="Nombre y cargo del responsable (ej. Ing. Noralba Castaño / Auditor Líder)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Persona responsable de la redacción, revisión o edición del documento.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Actualizar Encabezado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
