/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Printer, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  PenTool, 
  Save, 
  Search,
  Sliders,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AuditChecklist, ChecklistItem, PressAuditCategory } from '../types/audit';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { DocumentHeader } from './DocumentHeader';

interface ChecklistModuleProps {
  checklist: AuditChecklist;
  onSaveChecklist: (checklist: AuditChecklist) => void;
}

const ALL_CATEGORIES: PressAuditCategory[] = [
  'Alistamiento de Máquina y Mantillas',
  'Montaje e Inspección de Planchas CTP',
  'Control de Color CMYK y Tintas Pantone',
  'Registro y Calce Micrométrico',
  'Control de Desperdicios y Mermas',
  'Normas de Seguridad Industrial y EPP'
];

export const ChecklistModule: React.FC<ChecklistModuleProps> = ({
  checklist,
  onSaveChecklist
}) => {
  const [data, setData] = useState<AuditChecklist>(JSON.parse(JSON.stringify(checklist)));

  useEffect(() => {
    setData(JSON.parse(JSON.stringify(checklist)));
  }, [checklist]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'non-compliant' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState<'auditor' | 'operator' | null>(null);

  // New Item State
  const [newItemCat, setNewItemCat] = useState<PressAuditCategory>('Alistamiento de Máquina y Mantillas');
  const [newItemCrit, setNewItemCrit] = useState('ISO 9001:2015 8.5.1');
  const [newItemAspect, setNewItemAspect] = useState('');
  const [newItemObs, setNewItemObs] = useState('');

  // Statistics
  const totalItems = data.items.length;
  const compliantCount = data.items.filter(i => i.isCompliant === true).length;
  const nonCompliantCount = data.items.filter(i => i.isCompliant === false).length;
  const pendingCount = data.items.filter(i => i.isCompliant === null).length;
  const complianceRate = totalItems > 0 ? Math.round((compliantCount / totalItems) * 100) : 0;

  const toggleCompliance = (itemId: string, newStatus: boolean | null) => {
    const updatedItems = data.items.map(item => {
      if (item.id === itemId) {
        return { ...item, isCompliant: newStatus };
      }
      return item;
    });

    const updated = { ...data, items: updatedItems };
    setData(updated);
    onSaveChecklist(updated);
  };

  const updateObservation = (itemId: string, observation: string) => {
    const updatedItems = data.items.map(item => {
      if (item.id === itemId) {
        return { ...item, evidenceObservation: observation };
      }
      return item;
    });

    const updated = { ...data, items: updatedItems };
    setData(updated);
    onSaveChecklist(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemAspect.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      itemNumber: data.items.length + 1,
      category: newItemCat,
      criterion: newItemCrit,
      aspectToVerify: newItemAspect.trim(),
      isCompliant: null,
      evidenceObservation: newItemObs.trim()
    };

    const updated = {
      ...data,
      items: [...data.items, newItem]
    };

    setData(updated);
    onSaveChecklist(updated);
    setIsAddingItem(false);
    setNewItemAspect('');
    setNewItemObs('');
  };

  const removeItem = (itemId: string) => {
    if (confirm('¿Eliminar este ítem de verificación técnica?')) {
      const updatedItems = data.items
        .filter(i => i.id !== itemId)
        .map((item, idx) => ({ ...item, itemNumber: idx + 1 }));
      const updated = { ...data, items: updatedItems };
      setData(updated);
      onSaveChecklist(updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = data.items.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'compliant' ? item.isCompliant === true :
      statusFilter === 'non-compliant' ? item.isCompliant === false :
      item.isCompliant === null;
    const matchSearch = 
      item.aspectToVerify.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidenceObservation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.criterion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <CheckSquare className="w-4 h-4" />
              <span>LISTA DE CHEQUEO TÉCNICA · FORMATO FO-MCO-19</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Verificación al Operario de Prensa Litográfica
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Evaluación in situ de alistamiento de máquina, planchas, colorimetría CMYK/Pantone, registro, mermas y seguridad EPP.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsEditingHeader(!isEditingHeader)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isEditingHeader
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              {isEditingHeader ? 'Modo Visualización' : 'Editar Encabezado y Datos'}
            </button>

            <button
              onClick={() => setIsAddingItem(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Pregunta
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Real-time Compliance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Total Preguntas de Auditoría</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalItems}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Conformes (C)</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">{compliantCount}</span>
          </div>
          <div>
            <span className="text-slate-500 block">No Conformes (NC)</span>
            <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">{nonCompliantCount}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tasa de Conformidad Técnica</span>
            <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">{complianceRate}%</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por aspecto a verificar o criterio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
            >
              <option value="all">Todas las Categorías de Prensa</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
            >
              <option value="all">Todos ({totalItems})</option>
              <option value="compliant">Solo Conformes ({compliantCount})</option>
              <option value="non-compliant">Solo No Conformes ({nonCompliantCount})</option>
              <option value="pending">Pendientes de Evaluar ({pendingCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Checklist Document Container - FO-MCO-19 Standard Layout */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Official Header Block with Full Document Control Editing */}
        <DocumentHeader
          title="LISTA DE VERIFICACIÓN / CHEQUEO TÉCNICO"
          subtitle="EVALUACIÓN AL CARGO DE OPERARIO DE PRENSA LITOGRÁFICA"
          normative="SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026"
          code={data.code}
          version={data.version}
          approvalDate={data.approvalDate}
          editorResponsible={data.editorResponsible || 'Carlos Eduardo Rivas M. (Auditor Técnico)'}
          page={data.page}
          isEditing={isEditingHeader}
          onUpdateControlFields={(fields) => {
            const updated = {
              ...data,
              code: fields.code,
              version: fields.version,
              approvalDate: fields.approvalDate,
              editorResponsible: fields.editorResponsible,
              page: fields.page || data.page
            };
            setData(updated);
            onSaveChecklist(updated);
          }}
        />

        {/* Audit Identification Strip */}
        <div className="border border-slate-800 mb-6 text-xs divide-y divide-slate-800">
          <div className="grid grid-cols-12 divide-x divide-slate-800 bg-slate-50 font-medium">
            <div className="col-span-3 p-2">
              <strong>Auditoría #:</strong>{' '}
              {isEditingHeader ? (
                <input
                  type="text"
                  value={data.auditNumber}
                  onChange={(e) => {
                    const updated = { ...data, auditNumber: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="p-0.5 border rounded bg-white font-mono text-xs w-full mt-0.5"
                />
              ) : (
                <span>{data.auditNumber}</span>
              )}
            </div>
            <div className="col-span-3 p-2">
              <strong>Ciclo:</strong>{' '}
              {isEditingHeader ? (
                <input
                  type="text"
                  value={data.cycle}
                  onChange={(e) => {
                    const updated = { ...data, cycle: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="p-0.5 border rounded bg-white text-xs w-full mt-0.5"
                />
              ) : (
                <span>{data.cycle}</span>
              )}
            </div>
            <div className="col-span-3 p-2">
              <strong>Fecha:</strong>{' '}
              {isEditingHeader ? (
                <input
                  type="date"
                  value={data.auditDate}
                  onChange={(e) => {
                    const updated = { ...data, auditDate: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="p-0.5 border rounded bg-white text-xs w-full mt-0.5"
                />
              ) : (
                <span>{data.auditDate}</span>
              )}
            </div>
            <div className="col-span-3 p-2">
              <strong>Proceso:</strong>{' '}
              {isEditingHeader ? (
                <input
                  type="text"
                  value={data.process}
                  onChange={(e) => {
                    const updated = { ...data, process: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="p-0.5 border rounded bg-white text-xs w-full mt-0.5"
                />
              ) : (
                <span>{data.process}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-12 divide-x divide-slate-800">
            <div className="col-span-6 p-2">
              <strong className="block mb-1">Auditores Técnicos:</strong>
              {isEditingHeader ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={data.leadAuditorName}
                    onChange={(e) => {
                      const updated = { ...data, leadAuditorName: e.target.value };
                      setData(updated);
                      onSaveChecklist(updated);
                    }}
                    placeholder="Nombres de auditores..."
                    className="w-full p-1 border rounded bg-white text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={data.leadAuditorJobTitle || 'Auditor Técnico Especialista en Prensas'}
                    onChange={(e) => {
                      const updated = { ...data, leadAuditorJobTitle: e.target.value };
                      setData(updated);
                      onSaveChecklist(updated);
                    }}
                    placeholder="Cargo de auditor..."
                    className="w-full p-0.5 border rounded bg-white text-[10px] text-slate-600"
                  />
                </div>
              ) : (
                <div>
                  <span className="font-semibold text-slate-900">{data.leadAuditorName}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {data.leadAuditorJobTitle || 'Auditor Técnico Especialista en Prensas'}
                  </span>
                </div>
              )}
            </div>

            <div className="col-span-6 p-2">
              <strong className="block mb-1">Operario Auditado & Máquina:</strong>
              {isEditingHeader ? (
                <div className="space-y-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={data.auditeeName}
                      onChange={(e) => {
                        const updated = { ...data, auditeeName: e.target.value };
                        setData(updated);
                        onSaveChecklist(updated);
                      }}
                      placeholder="Nombre del operario..."
                      className="flex-1 p-1 border rounded bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={data.pressMachine}
                      onChange={(e) => {
                        const updated = { ...data, pressMachine: e.target.value };
                        setData(updated);
                        onSaveChecklist(updated);
                      }}
                      placeholder="Máquina..."
                      className="flex-1 p-1 border rounded bg-white text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={data.auditeeJobTitle || 'Operario Titular Prensa Heidelberg CD 102'}
                    onChange={(e) => {
                      const updated = { ...data, auditeeJobTitle: e.target.value };
                      setData(updated);
                      onSaveChecklist(updated);
                    }}
                    placeholder="Cargo del operario..."
                    className="w-full p-0.5 border rounded bg-white text-[10px] text-slate-600"
                  />
                </div>
              ) : (
                <div>
                  <span className="font-semibold text-slate-900">{data.auditeeName}</span> ·{' '}
                  <span className="font-medium text-slate-700">{data.pressMachine}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {data.auditeeJobTitle || 'Operario Titular Prensa Heidelberg CD 102'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="border border-slate-800 overflow-hidden mb-6">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-800 divide-x divide-slate-800">
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5 w-40">Criterio / Norma</th>
                <th className="p-2.5 min-w-[280px]">Pregunta o Aspecto a Verificar al Prensista</th>
                <th className="p-2.5 w-48 text-center">Conformidad (Sí / No)</th>
                <th className="p-2.5 min-w-[260px]">Observaciones y Evidencias Objetivas</th>
                <th className="p-2.5 w-12 text-center no-print">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 divide-x divide-slate-300 transition-colors">
                  {/* # */}
                  <td className="p-3 text-center font-mono font-bold text-slate-700 align-top">
                    {item.itemNumber}
                  </td>

                  {/* Criterio */}
                  <td className="p-3 font-mono text-[11px] text-slate-600 align-top">
                    <span className="font-semibold text-slate-900 block leading-tight">{item.criterion}</span>
                    <span className="text-[10px] text-indigo-800 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-sm block mt-1.5 font-sans font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* Pregunta */}
                  <td className="p-3 font-medium text-slate-900 leading-relaxed align-top">
                    <p className="text-xs">{item.aspectToVerify}</p>
                    {item.recommendation && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/70 p-1.5 rounded mt-2 border border-amber-200/60">
                        <strong>Nota Técnica:</strong> {item.recommendation}
                      </p>
                    )}
                  </td>

                  {/* Conformity: Interactive Sí / No Selector */}
                  <td className="p-3 align-top">
                    {/* Interactive UI (Screen) */}
                    <div className="space-y-2 no-print">
                      <div className="grid grid-cols-2 gap-1.5">
                        {/* Option: SÍ */}
                        <label
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            item.isCompliant === true
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`conformity-${item.id}`}
                            checked={item.isCompliant === true}
                            onChange={() => toggleCompliance(item.id, true)}
                            className="sr-only"
                          />
                          <Check className="w-3.5 h-3.5" />
                          <span>Sí</span>
                        </label>

                        {/* Option: NO */}
                        <label
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            item.isCompliant === false
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-rose-400 hover:bg-rose-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`conformity-${item.id}`}
                            checked={item.isCompliant === false}
                            onChange={() => toggleCompliance(item.id, false)}
                            className="sr-only"
                          />
                          <span className="text-xs font-black">✕</span>
                          <span>No</span>
                        </label>
                      </div>

                      {/* Dropdown alternative / Reset state */}
                      <div className="flex items-center justify-between pt-0.5">
                        <select
                          value={item.isCompliant === true ? 'yes' : item.isCompliant === false ? 'no' : 'pending'}
                          onChange={(e) => {
                            const val = e.target.value;
                            toggleCompliance(item.id, val === 'yes' ? true : val === 'no' ? false : null);
                          }}
                          className="text-[11px] py-1 px-1.5 rounded border border-slate-200 bg-slate-50 text-slate-600 focus:outline-hidden w-full font-medium"
                        >
                          <option value="yes">Estado: Sí (Conforme)</option>
                          <option value="no">Estado: No (No Conforme)</option>
                          <option value="pending">Estado: Pendiente por evaluar</option>
                        </select>
                      </div>

                      {/* Status indicator tag */}
                      <div className="text-center pt-0.5">
                        {item.isCompliant === true && (
                          <span className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Conforme Verificado
                          </span>
                        )}
                        {item.isCompliant === false && (
                          <span className="text-[10px] font-bold text-rose-700 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> No Conforme Detectado
                          </span>
                        )}
                        {item.isCompliant === null && (
                          <span className="text-[10px] font-medium text-amber-600">
                            Pendiente de verificación en máquina
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Official Print View */}
                    <div className="hidden print:block text-xs font-mono font-bold text-center">
                      <div className="flex items-center justify-center gap-4 py-1">
                        <span className={item.isCompliant === true ? 'underline font-black' : 'text-slate-400'}>
                          [ {item.isCompliant === true ? 'X' : ' '} ] SÍ
                        </span>
                        <span className={item.isCompliant === false ? 'underline font-black' : 'text-slate-400'}>
                          [ {item.isCompliant === false ? 'X' : ' '} ] NO
                        </span>
                      </div>
                      <span className="text-[9px] block text-slate-600">
                        {item.isCompliant === true ? 'CONFORME' : item.isCompliant === false ? 'NO CONFORME' : 'PENDIENTE'}
                      </span>
                    </div>
                  </td>

                  {/* Observations and Objective Evidence */}
                  <td className="p-3 align-top">
                    <div className="space-y-1.5">
                      <textarea
                        rows={3}
                        value={item.evidenceObservation}
                        onChange={(e) => updateObservation(item.id, e.target.value)}
                        placeholder="Escriba aquí la evidencia objetiva observada en prensa (pliego testigo, medición espectral, registro, EPP)..."
                        className="w-full p-2 text-xs border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg bg-slate-50/50 focus:bg-white resize-y transition-colors leading-relaxed"
                      />

                      {/* Quick preset chips for rapid auditing on tablet/desktop */}
                      <div className="flex flex-wrap items-center gap-1 no-print">
                        <span className="text-[10px] text-slate-400 font-medium">Insertar rápido:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const note = 'Pliego testigo firmado y verificado en mesa de control.';
                            const updated = item.evidenceObservation ? `${item.evidenceObservation} · ${note}` : note;
                            updateObservation(item.id, updated);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          + Pliego Vo.Bo.
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const note = 'Medición densitométrica dentro de tolerancia ISO 12647.';
                            const updated = item.evidenceObservation ? `${item.evidenceObservation} · ${note}` : note;
                            updateObservation(item.id, updated);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          + En Rango ISO
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const note = 'Uso correcto de EPP reglamentario verificado.';
                            const updated = item.evidenceObservation ? `${item.evidenceObservation} · ${note}` : note;
                            updateObservation(item.id, updated);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          + EPP Cumplido
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center align-top no-print">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                      title="Eliminar aspecto de verificación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures Zone */}
        <div className="grid grid-cols-2 gap-8 pt-4 page-break-inside-avoid">
          <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
            <span className="text-[11px] font-bold uppercase text-slate-600 block mb-2">
              AUDITOR TÉCNICO EN PRENSAS
            </span>
            <div className="min-h-[70px] border-b border-dashed border-slate-400 flex items-center justify-center my-2">
              {data.leadAuditorSignature ? (
                <img src={data.leadAuditorSignature} alt="Firma Auditor" className="max-h-16" />
              ) : (
                <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
              )}
            </div>
            {isEditingHeader ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={data.leadAuditorName}
                  onChange={(e) => {
                    const updated = { ...data, leadAuditorName: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                />
                <input
                  type="text"
                  value={data.leadAuditorJobTitle || 'Auditor Técnico Litográfico'}
                  onChange={(e) => {
                    const updated = { ...data, leadAuditorJobTitle: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                />
              </div>
            ) : (
              <>
                <span className="font-bold text-xs text-slate-900 block">{data.leadAuditorName}</span>
                <span className="text-[10px] text-slate-500">
                  {data.leadAuditorJobTitle || 'Auditor Técnico Litográfico'}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => setSignatureTarget('auditor')}
              className="mt-2 text-xs text-indigo-600 font-semibold underline block mx-auto no-print cursor-pointer"
            >
              {data.leadAuditorSignature ? 'Modificar Firma' : 'Firmar Lista'}
            </button>
          </div>

          <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
            <span className="text-[11px] font-bold uppercase text-slate-600 block mb-2">
              OPERARIO DE PRENSA AUDITADO (PRENSISTA)
            </span>
            <div className="min-h-[70px] border-b border-dashed border-slate-400 flex items-center justify-center my-2">
              {data.operatorSignature ? (
                <img src={data.operatorSignature} alt="Firma Prensista" className="max-h-16" />
              ) : (
                <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
              )}
            </div>
            {isEditingHeader ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={data.auditeeName}
                  onChange={(e) => {
                    const updated = { ...data, auditeeName: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                />
                <input
                  type="text"
                  value={data.auditeeJobTitle || 'Operario Titular Prensa Heidelberg'}
                  onChange={(e) => {
                    const updated = { ...data, auditeeJobTitle: e.target.value };
                    setData(updated);
                    onSaveChecklist(updated);
                  }}
                  className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                />
              </div>
            ) : (
              <>
                <span className="font-bold text-xs text-slate-900 block">{data.auditeeName}</span>
                <span className="text-[10px] text-slate-500">
                  {data.auditeeJobTitle || 'Operario Titular Prensa Heidelberg'}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => setSignatureTarget('operator')}
              className="mt-2 text-xs text-indigo-600 font-semibold underline block mx-auto no-print cursor-pointer"
            >
              {data.operatorSignature ? 'Modificar Firma' : 'Firmar Lista'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Question */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Añadir Aspecto Técnico a la Lista de Chequeo
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoría de Prensa</label>
              <select
                value={newItemCat}
                onChange={(e) => setNewItemCat(e.target.value as PressAuditCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Criterio o Numeral de Norma</label>
              <input
                type="text"
                value={newItemCrit}
                onChange={(e) => setNewItemCrit(e.target.value)}
                placeholder="Ej. ISO 9001:2015 8.5.1 / ISO 12647-2"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aspecto Técnico a Verificar *</label>
              <textarea
                rows={3}
                required
                value={newItemAspect}
                onChange={(e) => setNewItemAspect(e.target.value)}
                placeholder="¿El operario verifica...?"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Evidencia / Observación Inicial</label>
              <input
                type="text"
                value={newItemObs}
                onChange={(e) => setNewItemObs(e.target.value)}
                placeholder="Evidencia o método de muestreo..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Guardar Pregunta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {signatureTarget && (
        <DigitalSignatureModal
          isOpen={!!signatureTarget}
          onClose={() => setSignatureTarget(null)}
          onSave={(dataUrl) => {
            const updated = {
              ...data,
              [signatureTarget === 'auditor' ? 'leadAuditorSignature' : 'operatorSignature']: dataUrl
            };
            setData(updated);
            onSaveChecklist(updated);
            setSignatureTarget(null);
          }}
          title={signatureTarget === 'auditor' ? 'Firma del Auditor Técnico' : 'Firma del Operario de Prensa'}
          defaultSignatoryName={signatureTarget === 'auditor' ? data.leadAuditorName : data.auditeeName}
          signatoryRole={signatureTarget === 'auditor' ? 'Auditor Técnico en Prensas' : 'Operario de Prensa Litográfica'}
        />
      )}
    </div>
  );
};
