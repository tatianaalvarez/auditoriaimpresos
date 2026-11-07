/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Printer, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Layers, 
  Clock, 
  CheckCircle,
  Users,
  PenTool
} from 'lucide-react';
import { AuditProgram, AuditPlan, Auditor } from '../types/audit';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { DocumentHeader } from './DocumentHeader';

interface AuditProgramModuleProps {
  auditProgram: AuditProgram;
  auditPlan: AuditPlan;
  auditors: Auditor[];
  onSaveProgram: (prog: AuditProgram) => void;
  onSavePlan: (plan: AuditPlan) => void;
}

export const AuditProgramModule: React.FC<AuditProgramModuleProps> = ({
  auditProgram,
  auditPlan,
  auditors,
  onSaveProgram,
  onSavePlan
}) => {
  const [subTab, setSubTab] = useState<'programa' | 'plan'>('programa');
  const [isEditing, setIsEditing] = useState(false);
  const [progData, setProgData] = useState<AuditProgram>(JSON.parse(JSON.stringify(auditProgram)));
  const [planData, setPlanData] = useState<AuditPlan>(JSON.parse(JSON.stringify(auditPlan)));

  useEffect(() => {
    setProgData(JSON.parse(JSON.stringify(auditProgram)));
  }, [auditProgram]);

  useEffect(() => {
    setPlanData(JSON.parse(JSON.stringify(auditPlan)));
  }, [auditPlan]);
  const [signatureTarget, setSignatureTarget] = useState<'progLead' | 'planLead' | 'planAuditee' | null>(null);

  // New process item in program
  const [newAudNum, setNewAudNum] = useState('');
  const [newProcName, setNewProcName] = useState('');
  const [newProcClause, setNewProcClause] = useState('');
  const [newProcSchedule, setNewProcSchedule] = useState('');
  const [newProcLead, setNewProcLead] = useState('');

  // New ref doc in plan
  const [newDocName, setNewDocName] = useState('');
  const [newDocCode, setNewDocCode] = useState('');
  const [newDocClause, setNewDocClause] = useState('');

  // New auditor in program team
  const [newTeamAuditorName, setNewTeamAuditorName] = useState('');
  const [selectedAuditorToImport, setSelectedAuditorToImport] = useState('');

  // New itinerary item in plan
  const [newItinAct, setNewItinAct] = useState('');
  const [newItinAuditee, setNewItinAuditee] = useState('');
  const [newItinAuditor, setNewItinAuditor] = useState('');
  const [newItinTime, setNewItinTime] = useState('');
  const [newItinLoc, setNewItinLoc] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const saveCurrent = () => {
    if (subTab === 'programa') {
      onSaveProgram(progData);
      alert('Programa de Auditoría (' + progData.code + ') guardado exitosamente.');
    } else {
      onSavePlan(planData);
      alert('Plan de Auditoría (' + planData.code + ') guardado exitosamente.');
    }
    setIsEditing(false);
  };

  const addProgramProcess = () => {
    if (!newProcName.trim()) return;
    setProgData({
      ...progData,
      processes: [
        ...progData.processes,
        {
          audNumber: newAudNum || `AUD-${progData.processes.length + 1}`,
          process: newProcName,
          standardClause: newProcClause || 'ISO 9001:2015',
          scheduledDateTime: newProcSchedule || 'Por definir',
          executedDateTime: newProcSchedule || 'Por definir',
          leadAuditor: newProcLead || progData.leadAuditor,
          accompanyingAuditor: 'Equipo Auditor',
          status: 'Programada'
        }
      ]
    });
    setNewAudNum('');
    setNewProcName('');
    setNewProcClause('');
    setNewProcSchedule('');
    setNewProcLead('');
  };

  const removeProgramProcess = (idx: number) => {
    const updated = [...progData.processes];
    updated.splice(idx, 1);
    setProgData({ ...progData, processes: updated });
  };

  const addRefDocument = () => {
    if (!newDocName.trim()) return;
    setPlanData({
      ...planData,
      referenceDocuments: [
        ...planData.referenceDocuments,
        {
          name: newDocName,
          code: newDocCode || 'PR-PRE-00',
          version: '01',
          clause: newDocClause || '8.5.1'
        }
      ]
    });
    setNewDocName('');
    setNewDocCode('');
    setNewDocClause('');
  };

  const removeRefDocument = (idx: number) => {
    const updated = [...planData.referenceDocuments];
    updated.splice(idx, 1);
    setPlanData({ ...planData, referenceDocuments: updated });
  };

  const addItineraryItem = () => {
    if (!newItinAct.trim()) return;
    setPlanData({
      ...planData,
      itinerary: [
        ...planData.itinerary,
        {
          activity: newItinAct,
          auditee: newItinAuditee || 'Jorge Valderrama (Prensista)',
          auditor: newItinAuditor || planData.leadAuditor,
          date: '05/11/2026',
          startTime: newItinTime.split('-')[0]?.trim() || '08:00',
          endTime: newItinTime.split('-')[1]?.trim() || '09:00',
          location: newItinLoc || 'Nave de Prensas'
        }
      ]
    });
    setNewItinAct('');
    setNewItinAuditee('');
    setNewItinAuditor('');
    setNewItinTime('');
    setNewItinLoc('');
  };

  const removeItineraryItem = (idx: number) => {
    const updated = [...planData.itinerary];
    updated.splice(idx, 1);
    setPlanData({ ...planData, itinerary: updated });
  };

  return (
    <div className="space-y-6">
      {/* Module Toolbar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <Calendar className="w-4 h-4" />
              <span>GESTIÓN MACRO Y PLANIFICACIÓN DETALLADA (ISO 19011:2026) · Impresos al Día</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Programa y Plan de Auditoría a Prensas
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Control documental (códigos, versiones, fechas, editor), gestión macro del ciclo anual e itinerario técnico para el operario de prensa.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              {isEditing ? 'Modo Visualización' : 'Editar Campos'}
            </button>

            {isEditing && (
              <button
                onClick={saveCurrent}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-100">
          <button
            onClick={() => setSubTab('programa')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              subTab === 'programa'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Programa de Auditoría ({progData.code})
          </button>
          <button
            onClick={() => setSubTab('plan')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              subTab === 'plan'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Plan de Auditoría ({planData.code})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: PROGRAMA DE AUDITORIA (FO-MCO-17) */}
      {/* ============================================================== */}
      {subTab === 'programa' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <DocumentHeader
            title="PROGRAMA DE AUDITORÍA INTERNA DE CALIDAD"
            subtitle="GESTIÓN MACRO DEL CICLO ANUAL DE EVALUACIÓN"
            normative="SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026"
            code={progData.code}
            version={progData.version}
            approvalDate={progData.approvalDate}
            editorResponsible={progData.editorResponsible || 'Ing. Noralba Castaño Puerta (Auditor Líder)'}
            page={progData.page}
            isEditing={isEditing}
            onUpdateControlFields={(fields) =>
              setProgData({
                ...progData,
                code: fields.code,
                version: fields.version,
                approvalDate: fields.approvalDate,
                editorResponsible: fields.editorResponsible,
                page: fields.page || progData.page
              })
            }
          />

          {/* Macro Cycle Specs */}
          <div className="border border-slate-800 mb-6 text-xs divide-y divide-slate-800">
            <div className="grid grid-cols-12 divide-x divide-slate-800 bg-slate-50 font-medium">
              <div className="col-span-2 p-2">
                <strong>Año:</strong>{' '}
                {isEditing ? (
                  <input
                    type="number"
                    value={progData.year}
                    onChange={(e) => setProgData({ ...progData, year: Number(e.target.value) })}
                    className="w-16 p-0.5 border rounded bg-white font-mono"
                  />
                ) : (
                  <span>{progData.year}</span>
                )}
              </div>
              <div className="col-span-3 p-2">
                <strong>Ciclo:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={progData.cycle}
                    onChange={(e) => setProgData({ ...progData, cycle: e.target.value })}
                    className="w-full p-0.5 border rounded bg-white text-xs mt-0.5"
                  />
                ) : (
                  <span>{progData.cycle}</span>
                )}
              </div>
              <div className="col-span-3 p-2">
                <strong>Fecha Inicio:</strong>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    value={progData.startDate}
                    onChange={(e) => setProgData({ ...progData, startDate: e.target.value })}
                    className="w-full p-0.5 border rounded bg-white text-xs mt-0.5"
                  />
                ) : (
                  <span>{progData.startDate}</span>
                )}
              </div>
              <div className="col-span-4 p-2">
                <strong>Fecha Final:</strong>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    value={progData.endDate}
                    onChange={(e) => setProgData({ ...progData, endDate: e.target.value })}
                    className="w-full p-0.5 border rounded bg-white text-xs mt-0.5"
                  />
                ) : (
                  <span>{progData.endDate}</span>
                )}
              </div>
            </div>

            <div className="p-2.5">
              <strong>Criterio de Auditoría:</strong>{' '}
              {isEditing ? (
                <textarea
                  rows={2}
                  value={progData.criteria}
                  onChange={(e) => setProgData({ ...progData, criteria: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <span>{progData.criteria}</span>
              )}
            </div>

            <div className="grid grid-cols-12 divide-x divide-slate-800">
              <div className="col-span-4 p-2.5">
                <strong className="block mb-1">Auditor Líder del Programa:</strong>
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={progData.leadAuditor}
                      onChange={(e) => setProgData({ ...progData, leadAuditor: e.target.value })}
                      className="w-full p-1 border rounded bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={progData.leadAuditorJobTitle || 'Directora de Aseguramiento de Calidad'}
                      onChange={(e) => setProgData({ ...progData, leadAuditorJobTitle: e.target.value })}
                      placeholder="Cargo del auditor líder..."
                      className="w-full p-1 border rounded bg-white text-[10px] text-slate-600"
                    />
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-slate-900 block">{progData.leadAuditor}</span>
                    <span className="text-[10px] text-slate-500">
                      {progData.leadAuditorJobTitle || 'Directora de Aseguramiento de Calidad'}
                    </span>
                  </div>
                )}
              </div>

              <div className="col-span-8 p-2.5">
                <strong className="block mb-1">Equipo Auditor Integrante:</strong>
                {isEditing ? (
                  <div className="space-y-2 no-print">
                    <div className="flex flex-wrap gap-1.5">
                      {progData.auditorTeam.map((member, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-900 font-medium"
                        >
                          {member}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = progData.auditorTeam.filter((_, i) => i !== idx);
                              setProgData({ ...progData, auditorTeam: updated });
                            }}
                            className="text-rose-500 hover:text-rose-700 ml-1 font-bold"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAuditorToImport}
                        onChange={(e) => setSelectedAuditorToImport(e.target.value)}
                        className="px-2 py-1 text-xs border rounded bg-white flex-1"
                      >
                        <option value="">Seleccionar del directorio de auditores...</option>
                        {auditors.map((aud) => (
                          <option key={aud.id} value={aud.name}>
                            {aud.name} ({aud.role})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedAuditorToImport && !progData.auditorTeam.includes(selectedAuditorToImport)) {
                            setProgData({
                              ...progData,
                              auditorTeam: [...progData.auditorTeam, selectedAuditorToImport]
                            });
                            setSelectedAuditorToImport('');
                          }
                        }}
                        disabled={!selectedAuditorToImport}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
                      >
                        + Vincular
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700">{progData.auditorTeam.join(' · ')}</p>
                )}
              </div>
            </div>

            <div className="p-2.5">
              <strong>Objetivo del Programa:</strong>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={progData.objective}
                  onChange={(e) => setProgData({ ...progData, objective: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <p className="mt-0.5 text-slate-700 leading-relaxed">{progData.objective}</p>
              )}
            </div>

            <div className="p-2.5">
              <strong>Alcance:</strong>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={progData.scope}
                  onChange={(e) => setProgData({ ...progData, scope: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <p className="mt-0.5 text-slate-700 leading-relaxed">{progData.scope}</p>
              )}
            </div>

            <div className="p-2.5">
              <strong>Recursos:</strong>{' '}
              {isEditing ? (
                <textarea
                  rows={2}
                  value={progData.resources}
                  onChange={(e) => setProgData({ ...progData, resources: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <span>{progData.resources}</span>
              )}
            </div>
          </div>

          {/* Processes Table */}
          <div className="border border-slate-800 mb-6 overflow-hidden text-xs">
            <div className="bg-slate-100 p-2 font-bold uppercase text-slate-800 border-b border-slate-800 flex justify-between items-center">
              <span>PROCESOS PROGRAMADOS Y EQUIPO AUDITOR ASIGNADO</span>
              <span className="text-[10px] text-slate-500 font-mono">{progData.processes.length} Etapas</span>
            </div>
            <table className="w-full text-left divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700 divide-x divide-slate-800">
                  <th className="p-2 w-16">Aud #</th>
                  <th className="p-2 min-w-[200px]">Proceso / Etapa</th>
                  <th className="p-2 w-32">Numeral Norma</th>
                  <th className="p-2 w-36">Fecha y Hora</th>
                  <th className="p-2 w-32">Auditor Principal</th>
                  <th className="p-2 w-32">Acompañante</th>
                  {isEditing && <th className="p-2 w-12 text-center no-print">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {progData.processes.map((proc, idx) => (
                  <tr key={idx} className="divide-x divide-slate-300">
                    <td className="p-2 font-mono font-bold text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={proc.audNumber}
                          onChange={(e) => {
                            const updated = [...progData.processes];
                            updated[idx].audNumber = e.target.value;
                            setProgData({ ...progData, processes: updated });
                          }}
                          className="w-12 p-0.5 border rounded bg-white font-mono"
                        />
                      ) : (
                        proc.audNumber
                      )}
                    </td>
                    <td className="p-2 font-medium text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={proc.process}
                          onChange={(e) => {
                            const updated = [...progData.processes];
                            updated[idx].process = e.target.value;
                            setProgData({ ...progData, processes: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        proc.process
                      )}
                    </td>
                    <td className="p-2 font-mono text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={proc.standardClause}
                          onChange={(e) => {
                            const updated = [...progData.processes];
                            updated[idx].standardClause = e.target.value;
                            setProgData({ ...progData, processes: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white font-mono text-xs"
                        />
                      ) : (
                        proc.standardClause
                      )}
                    </td>
                    <td className="p-2 font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={proc.scheduledDateTime}
                          onChange={(e) => {
                            const updated = [...progData.processes];
                            updated[idx].scheduledDateTime = e.target.value;
                            setProgData({ ...progData, processes: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        proc.scheduledDateTime
                      )}
                    </td>
                    <td className="p-2 text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={proc.leadAuditor}
                          onChange={(e) => {
                            const updated = [...progData.processes];
                            updated[idx].leadAuditor = e.target.value;
                            setProgData({ ...progData, processes: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        proc.leadAuditor
                      )}
                    </td>
                    <td className="p-2 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={proc.accompanyingAuditor}
                          onChange={(e) => {
                            const updated = [...progData.processes];
                            updated[idx].accompanyingAuditor = e.target.value;
                            setProgData({ ...progData, processes: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        proc.accompanyingAuditor
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => removeProgramProcess(idx)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="p-3 bg-slate-50 border-t border-slate-800 grid grid-cols-5 gap-2 no-print">
                <input
                  type="text"
                  placeholder="Aud # (AUD-07)"
                  value={newAudNum}
                  onChange={(e) => setNewAudNum(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Proceso / Etapa..."
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Numeral ISO..."
                  value={newProcClause}
                  onChange={(e) => setNewProcClause(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Horario..."
                  value={newProcSchedule}
                  onChange={(e) => setNewProcSchedule(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <button
                  type="button"
                  onClick={addProgramProcess}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  + Añadir al Programa
                </button>
              </div>
            )}
          </div>

          {/* Observations and Signature */}
          <div className="border border-slate-800 p-3 mb-6 text-xs">
            <strong>OBSERVACIONES GENERALES:</strong>
            {isEditing ? (
              <textarea
                rows={2}
                value={progData.observations}
                onChange={(e) => setProgData({ ...progData, observations: e.target.value })}
                className="w-full p-1 border rounded text-xs mt-1 bg-white"
              />
            ) : (
              <p className="mt-1 text-slate-700 italic">{progData.observations}</p>
            )}
          </div>

          <div className="border border-slate-300 rounded p-4 max-w-sm mx-auto text-center bg-slate-50/50 page-break-inside-avoid">
            <span className="text-[11px] font-bold uppercase text-slate-600 block mb-2">
              AUDITOR LÍDER EMISOR DEL PROGRAMA
            </span>
            <div className="min-h-[60px] border-b border-dashed border-slate-400 flex items-center justify-center my-2">
              {progData.leadAuditorSignature ? (
                <img src={progData.leadAuditorSignature} alt="Firma Líder" className="max-h-14" />
              ) : (
                <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={progData.leadAuditor}
                  onChange={(e) => setProgData({ ...progData, leadAuditor: e.target.value })}
                  className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                />
                <input
                  type="text"
                  value={progData.leadAuditorJobTitle || 'Directora de Aseguramiento de Calidad'}
                  onChange={(e) => setProgData({ ...progData, leadAuditorJobTitle: e.target.value })}
                  className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                />
              </div>
            ) : (
              <>
                <span className="font-bold text-xs text-slate-900 block">{progData.leadAuditor}</span>
                <span className="text-[10px] text-slate-500">
                  {progData.leadAuditorJobTitle || 'Directora de Aseguramiento de Calidad'}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => setSignatureTarget('progLead')}
              className="mt-2 text-xs text-indigo-600 font-semibold underline block mx-auto no-print cursor-pointer"
            >
              {progData.leadAuditorSignature ? 'Modificar Firma' : 'Firmar Programa'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: PLAN DE AUDITORIA (FO-MCO-18) */}
      {/* ============================================================== */}
      {subTab === 'plan' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Header Block */}
          <DocumentHeader
            title="PLAN DE AUDITORÍA INTERNA DE CALIDAD"
            subtitle="CARGO: OPERARIO DE PRENSA LITOGRÁFICA"
            normative="SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026"
            code={planData.code}
            version={planData.version}
            approvalDate={planData.approvalDate}
            editorResponsible={planData.editorResponsible || 'Ing. Noralba Castaño Puerta (Auditor Líder)'}
            page={planData.page}
            isEditing={isEditing}
            onUpdateControlFields={(fields) =>
              setPlanData({
                ...planData,
                code: fields.code,
                version: fields.version,
                approvalDate: fields.approvalDate,
                editorResponsible: fields.editorResponsible,
                page: fields.page || planData.page
              })
            }
          />

          {/* Plan Specific Details */}
          <div className="border border-slate-800 mb-6 text-xs divide-y divide-slate-800">
            <div className="grid grid-cols-12 divide-x divide-slate-800 bg-slate-50 font-medium">
              <div className="col-span-3 p-2">
                <strong>Ciclo:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={planData.auditCycle}
                    onChange={(e) => setPlanData({ ...planData, auditCycle: e.target.value })}
                    className="p-0.5 border rounded bg-white text-xs w-full mt-0.5"
                  />
                ) : (
                  <span>{planData.auditCycle}</span>
                )}
              </div>
              <div className="col-span-3 p-2">
                <strong>Auditoría #:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={planData.auditNumber}
                    onChange={(e) => setPlanData({ ...planData, auditNumber: e.target.value })}
                    className="p-0.5 border rounded bg-white font-mono font-bold text-xs w-full mt-0.5"
                  />
                ) : (
                  <span>{planData.auditNumber}</span>
                )}
              </div>
              <div className="col-span-6 p-2">
                <strong>Proceso Auditado:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={planData.auditedProcess}
                    onChange={(e) => setPlanData({ ...planData, auditedProcess: e.target.value })}
                    className="p-0.5 border rounded bg-white text-xs w-full mt-0.5"
                  />
                ) : (
                  <span>{planData.auditedProcess}</span>
                )}
              </div>
            </div>

            <div className="p-2.5">
              <strong>Cargo Evaluado:</strong> <span className="font-bold text-indigo-900">{planData.targetJob}</span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-800">
              <div className="p-2.5">
                <strong className="block mb-1">Auditor Principal:</strong>
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={planData.leadAuditor}
                      onChange={(e) => setPlanData({ ...planData, leadAuditor: e.target.value })}
                      className="w-full p-1 border rounded bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={planData.leadAuditorJobTitle || 'Directora de Calidad y Procesos'}
                      onChange={(e) => setPlanData({ ...planData, leadAuditorJobTitle: e.target.value })}
                      placeholder="Cargo del auditor..."
                      className="w-full p-0.5 border rounded bg-white text-[10px] text-slate-600"
                    />
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-slate-900 block">{planData.leadAuditor}</span>
                    <span className="text-[10px] text-slate-500">
                      {planData.leadAuditorJobTitle || 'Directora de Calidad y Procesos'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2.5">
                <strong className="block mb-1">Auditores Acompañantes:</strong>
                {isEditing ? (
                  <div className="space-y-2 no-print">
                    <div className="flex flex-wrap gap-1.5">
                      {planData.accompanyingAuditors.map((aud, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs"
                        >
                          {aud}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = planData.accompanyingAuditors.filter((_, i) => i !== idx);
                              setPlanData({ ...planData, accompanyingAuditors: updated });
                            }}
                            className="text-rose-500 hover:text-rose-700 ml-1 font-bold"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700">{planData.accompanyingAuditors.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="p-2.5">
              <strong>Objetivo:</strong>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={planData.objective}
                  onChange={(e) => setPlanData({ ...planData, objective: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <p className="mt-0.5 text-slate-700 leading-relaxed">{planData.objective}</p>
              )}
            </div>

            <div className="p-2.5">
              <strong>Alcance:</strong>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={planData.scope}
                  onChange={(e) => setPlanData({ ...planData, scope: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <p className="mt-0.5 text-slate-700 leading-relaxed">{planData.scope}</p>
              )}
            </div>

            <div className="p-2.5">
              <strong>Criterios de Auditoría:</strong>{' '}
              {isEditing ? (
                <textarea
                  rows={2}
                  value={planData.criteria}
                  onChange={(e) => setPlanData({ ...planData, criteria: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <span>{planData.criteria}</span>
              )}
            </div>
          </div>

          {/* Reference Documents Table */}
          <div className="border border-slate-800 mb-6 overflow-hidden text-xs">
            <div className="bg-slate-100 p-2 font-bold uppercase text-slate-800 border-b border-slate-800 flex justify-between items-center">
              <span>DOCUMENTOS DE REFERENCIA TÉCNICA Y OPERATIVA</span>
              <span className="text-[10px] text-slate-500 font-mono">{planData.referenceDocuments.length} Documentos</span>
            </div>
            <table className="w-full text-left divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700 divide-x divide-slate-800">
                  <th className="p-2">Documento de Referencia</th>
                  <th className="p-2 w-32 font-mono">Código</th>
                  <th className="p-2 w-24 text-center font-mono">Versión</th>
                  <th className="p-2 w-36 font-mono">Numeral Norma</th>
                  {isEditing && <th className="p-2 w-12 text-center no-print">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {planData.referenceDocuments.map((doc, idx) => (
                  <tr key={idx} className="divide-x divide-slate-300">
                    <td className="p-2 font-medium text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => {
                            const updated = [...planData.referenceDocuments];
                            updated[idx].name = e.target.value;
                            setPlanData({ ...planData, referenceDocuments: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        doc.name
                      )}
                    </td>
                    <td className="p-2 font-mono text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={doc.code}
                          onChange={(e) => {
                            const updated = [...planData.referenceDocuments];
                            updated[idx].code = e.target.value;
                            setPlanData({ ...planData, referenceDocuments: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white font-mono text-xs"
                        />
                      ) : (
                        doc.code
                      )}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={doc.version}
                          onChange={(e) => {
                            const updated = [...planData.referenceDocuments];
                            updated[idx].version = e.target.value;
                            setPlanData({ ...planData, referenceDocuments: updated });
                          }}
                          className="w-12 text-center p-0.5 border rounded bg-white font-mono text-xs"
                        />
                      ) : (
                        doc.version
                      )}
                    </td>
                    <td className="p-2 font-mono text-indigo-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={doc.clause}
                          onChange={(e) => {
                            const updated = [...planData.referenceDocuments];
                            updated[idx].clause = e.target.value;
                            setPlanData({ ...planData, referenceDocuments: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white font-mono text-xs"
                        />
                      ) : (
                        doc.clause
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => removeRefDocument(idx)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="p-3 bg-slate-50 border-t border-slate-800 flex items-center gap-2 no-print">
                <input
                  type="text"
                  placeholder="Nombre documento de referencia..."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Código..."
                  value={newDocCode}
                  onChange={(e) => setNewDocCode(e.target.value)}
                  className="w-28 px-2.5 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Numeral..."
                  value={newDocClause}
                  onChange={(e) => setNewDocClause(e.target.value)}
                  className="w-28 px-2.5 py-1 text-xs border rounded bg-white"
                />
                <button
                  type="button"
                  onClick={addRefDocument}
                  className="px-3.5 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  + Agregar
                </button>
              </div>
            )}
          </div>

          {/* Itinerary Table */}
          <div className="border border-slate-800 mb-6 overflow-hidden text-xs">
            <div className="bg-slate-100 p-2 font-bold uppercase text-slate-800 border-b border-slate-800 flex justify-between items-center">
              <span>ITINERARIO HORARIO DE AUDITORÍA AL PRENSISTA</span>
              <span className="text-[10px] text-slate-500 font-mono">{planData.itinerary.length} Actividades</span>
            </div>
            <table className="w-full text-left divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700 divide-x divide-slate-800">
                  <th className="p-2 min-w-[200px]">Actividad Específica</th>
                  <th className="p-2 w-36">Auditado</th>
                  <th className="p-2 w-36">Auditor</th>
                  <th className="p-2 w-28 text-center">Horario</th>
                  <th className="p-2 min-w-[140px]">Lugar</th>
                  {isEditing && <th className="p-2 w-12 text-center no-print">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {planData.itinerary.map((it, idx) => (
                  <tr key={idx} className="divide-x divide-slate-300">
                    <td className="p-2 font-semibold text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.activity}
                          onChange={(e) => {
                            const updated = [...planData.itinerary];
                            updated[idx].activity = e.target.value;
                            setPlanData({ ...planData, itinerary: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white font-semibold text-xs"
                        />
                      ) : (
                        it.activity
                      )}
                    </td>
                    <td className="p-2 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.auditee}
                          onChange={(e) => {
                            const updated = [...planData.itinerary];
                            updated[idx].auditee = e.target.value;
                            setPlanData({ ...planData, itinerary: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        it.auditee
                      )}
                    </td>
                    <td className="p-2 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.auditor}
                          onChange={(e) => {
                            const updated = [...planData.itinerary];
                            updated[idx].auditor = e.target.value;
                            setPlanData({ ...planData, itinerary: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        it.auditor
                      )}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-800">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={it.startTime}
                            onChange={(e) => {
                              const updated = [...planData.itinerary];
                              updated[idx].startTime = e.target.value;
                              setPlanData({ ...planData, itinerary: updated });
                            }}
                            className="w-12 text-center p-0.5 border rounded bg-white text-xs font-mono"
                          />
                          <span>-</span>
                          <input
                            type="text"
                            value={it.endTime}
                            onChange={(e) => {
                              const updated = [...planData.itinerary];
                              updated[idx].endTime = e.target.value;
                              setPlanData({ ...planData, itinerary: updated });
                            }}
                            className="w-12 text-center p-0.5 border rounded bg-white text-xs font-mono"
                          />
                        </div>
                      ) : (
                        <span>{it.startTime} - {it.endTime}</span>
                      )}
                    </td>
                    <td className="p-2 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.location}
                          onChange={(e) => {
                            const updated = [...planData.itinerary];
                            updated[idx].location = e.target.value;
                            setPlanData({ ...planData, itinerary: updated });
                          }}
                          className="w-full p-0.5 border rounded bg-white text-xs"
                        />
                      ) : (
                        it.location
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => removeItineraryItem(idx)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="p-3 bg-slate-50 border-t border-slate-800 grid grid-cols-5 gap-2 no-print">
                <input
                  type="text"
                  placeholder="Actividad..."
                  value={newItinAct}
                  onChange={(e) => setNewItinAct(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Auditado..."
                  value={newItinAuditee}
                  onChange={(e) => setNewItinAuditee(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Auditor..."
                  value={newItinAuditor}
                  onChange={(e) => setNewItinAuditor(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Horario (08:00 - 09:00)"
                  value={newItinTime}
                  onChange={(e) => setNewItinTime(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <button
                  type="button"
                  onClick={addItineraryItem}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  + Agregar
                </button>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 page-break-inside-avoid">
            <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
              <span className="text-[11px] font-bold uppercase text-slate-600 block mb-2">
                FIRMA AUDITOR PRINCIPAL
              </span>
              <div className="min-h-[60px] border-b border-dashed border-slate-400 flex items-center justify-center my-2">
                {planData.leadAuditorSignature ? (
                  <img src={planData.leadAuditorSignature} alt="Firma" className="max-h-14" />
                ) : (
                  <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={planData.leadAuditor}
                    onChange={(e) => setPlanData({ ...planData, leadAuditor: e.target.value })}
                    className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={planData.leadAuditorJobTitle || 'Directora de Calidad y Procesos'}
                    onChange={(e) => setPlanData({ ...planData, leadAuditorJobTitle: e.target.value })}
                    className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <span className="font-bold text-xs text-slate-900 block">{planData.leadAuditor}</span>
                  <span className="text-[10px] text-slate-500">
                    {planData.leadAuditorJobTitle || 'Directora de Calidad y Procesos'}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSignatureTarget('planLead')}
                className="mt-2 text-xs text-indigo-600 font-semibold underline block mx-auto no-print cursor-pointer"
              >
                {planData.leadAuditorSignature ? 'Modificar Firma' : 'Firmar Plan'}
              </button>
            </div>

            <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
              <span className="text-[11px] font-bold uppercase text-slate-600 block mb-2">
                FIRMA AUDITADO (OPERARIO DE PRENSA)
              </span>
              <div className="min-h-[60px] border-b border-dashed border-slate-400 flex items-center justify-center my-2">
                {planData.auditeeLeaderSignature ? (
                  <img src={planData.auditeeLeaderSignature} alt="Firma" className="max-h-14" />
                ) : (
                  <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={planData.auditeeLeaderName || 'Jorge Valderrama'}
                    onChange={(e) => setPlanData({ ...planData, auditeeLeaderName: e.target.value })}
                    className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={planData.auditeeLeaderJobTitle || 'Operario de Prensa Litográfica (Prensista)'}
                    onChange={(e) => setPlanData({ ...planData, auditeeLeaderJobTitle: e.target.value })}
                    className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <span className="font-bold text-xs text-slate-900 block">
                    {planData.auditeeLeaderName || 'Jorge Valderrama'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {planData.auditeeLeaderJobTitle || 'Operario de Prensa Litográfica (Prensista)'}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSignatureTarget('planAuditee')}
                className="mt-2 text-xs text-indigo-600 font-semibold underline block mx-auto no-print cursor-pointer"
              >
                {planData.auditeeLeaderSignature ? 'Modificar Firma' : 'Firmar Plan'}
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
            if (signatureTarget === 'progLead') {
              const updated = { ...progData, leadAuditorSignature: dataUrl };
              setProgData(updated);
              onSaveProgram(updated);
            } else if (signatureTarget === 'planLead') {
              const updated = { ...planData, leadAuditorSignature: dataUrl };
              setPlanData(updated);
              onSavePlan(updated);
            } else if (signatureTarget === 'planAuditee') {
              const updated = { ...planData, auditeeLeaderSignature: dataUrl };
              setPlanData(updated);
              onSavePlan(updated);
            }
            setSignatureTarget(null);
          }}
          title="Firma Digital Formal de Auditoría"
          defaultSignatoryName={
            signatureTarget === 'planAuditee'
              ? planData.auditeeLeaderName || 'Jorge Valderrama'
              : progData.leadAuditor
          }
          signatoryRole={
            signatureTarget === 'planAuditee'
              ? 'Operario de Prensa Litográfica'
              : 'Auditor Líder ISO 19011:2026'
          }
        />
      )}
    </div>
  );
};
