/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  PenTool, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Edit3, 
  Save, 
  Calendar,
  Clock,
  MapPin,
  ClipboardList,
  UserPlus,
  Users
} from 'lucide-react';
import { OpeningAct, ClosingAct, FinalAuditReport, Auditor, CorrectiveActionPlan } from '../types/audit';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { DocumentHeader } from './DocumentHeader';

interface OpeningActModuleProps {
  openingAct: OpeningAct;
  closingAct: ClosingAct;
  finalReport: FinalAuditReport;
  auditors: Auditor[];
  onSaveOpeningAct: (act: OpeningAct) => void;
  onSaveClosingAct: (act: ClosingAct) => void;
  onSaveFinalReport: (report: FinalAuditReport) => void;
}

export const OpeningActModule: React.FC<OpeningActModuleProps> = ({
  openingAct,
  closingAct,
  finalReport,
  auditors,
  onSaveOpeningAct,
  onSaveClosingAct,
  onSaveFinalReport
}) => {
  const [activeTab, setActiveTab] = useState<'apertura' | 'cierre' | 'informe'>('apertura');
  const [isEditing, setIsEditing] = useState(false);
  const [actData, setActData] = useState<OpeningAct>(JSON.parse(JSON.stringify(openingAct)));
  const [closingData, setClosingData] = useState<ClosingAct>(JSON.parse(JSON.stringify(closingAct)));
  const [reportData, setReportData] = useState<FinalAuditReport>(JSON.parse(JSON.stringify(finalReport)));

  useEffect(() => {
    setActData(JSON.parse(JSON.stringify(openingAct)));
  }, [openingAct]);

  useEffect(() => {
    setClosingData(JSON.parse(JSON.stringify(closingAct)));
  }, [closingAct]);

  useEffect(() => {
    setReportData(JSON.parse(JSON.stringify(finalReport)));
  }, [finalReport]);

  // Signature modal state
  const [sigTarget, setSigTarget] = useState<
    'leadAuditor' | 'auditeeLeader' | 'closingLead' | 'closingAuditee' | 'reportLead' | 'reportAuditee' | string | null
  >(null);

  // New attendee form in Apertura
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeRole, setNewAttendeeRole] = useState('');
  const [selectedAuditorToImport, setSelectedAuditorToImport] = useState('');

  // New attendee form in Cierre
  const [newClosingAttName, setNewClosingAttName] = useState('');
  const [newClosingAttRole, setNewClosingAttRole] = useState('');

  // New agenda item form
  const [newAgendaHour, setNewAgendaHour] = useState('');
  const [newAgendaReq, setNewAgendaReq] = useState('');
  const [newAgendaAct, setNewAgendaAct] = useState('');
  const [newAgendaAuditee, setNewAgendaAuditee] = useState('');
  const [newAgendaAuditor, setNewAgendaAuditor] = useState('');

  // New interviewed person in Report
  const [newInterviewed, setNewInterviewed] = useState('');

  // New auditor in Report
  const [newReportAuditor, setNewReportAuditor] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleSaveOpening = () => {
    onSaveOpeningAct(actData);
    setIsEditing(false);
    alert('Acta de Apertura (FO-MCO-20) guardada exitosamente.');
  };

  const handleSaveClosing = () => {
    onSaveClosingAct(closingData);
    setIsEditing(false);
    alert('Acta de Cierre (FO-MCO-21) guardada exitosamente.');
  };

  const handleSaveReport = () => {
    onSaveFinalReport(reportData);
    setIsEditing(false);
    alert('Informe Final de Auditoría (FO-MCO-22) guardado exitosamente.');
  };

  const addAttendee = () => {
    if (newAttendeeName.trim()) {
      const newAtt = {
        id: `att-${Date.now()}`,
        name: newAttendeeName.trim(),
        role: newAttendeeRole.trim() || 'Participante / Auditor',
        confirmedAt: new Date().toLocaleString('es-CO')
      };
      setActData({
        ...actData,
        attendees: [...actData.attendees, newAtt]
      });
      setNewAttendeeName('');
      setNewAttendeeRole('');
    }
  };

  const importRegisteredAuditorToApertura = () => {
    const found = auditors.find(a => a.id === selectedAuditorToImport);
    if (found) {
      const newAtt = {
        id: `att-${Date.now()}`,
        name: found.name,
        role: `${found.role} · ${found.jobTitle || found.department}`,
        signature: found.signatureBase64,
        confirmedAt: new Date().toLocaleString('es-CO')
      };
      setActData({
        ...actData,
        attendees: [...actData.attendees, newAtt]
      });
      setSelectedAuditorToImport('');
    }
  };

  const removeAttendee = (id: string) => {
    setActData({
      ...actData,
      attendees: actData.attendees.filter(a => a.id !== id)
    });
  };

  const addClosingAttendee = () => {
    if (newClosingAttName.trim()) {
      const newAtt = {
        id: `att-cls-${Date.now()}`,
        name: newClosingAttName.trim(),
        role: newClosingAttRole.trim() || 'Participante',
        confirmedAt: new Date().toLocaleString('es-CO')
      };
      setClosingData({
        ...closingData,
        attendees: [...closingData.attendees, newAtt]
      });
      setNewClosingAttName('');
      setNewClosingAttRole('');
    }
  };

  const removeClosingAttendee = (id: string) => {
    setClosingData({
      ...closingData,
      attendees: closingData.attendees.filter(a => a.id !== id)
    });
  };

  const addAgendaItem = () => {
    if (newAgendaAct.trim()) {
      setActData({
        ...actData,
        agenda: [
          ...actData.agenda,
          {
            hour: newAgendaHour || 'Por definir',
            requirement: newAgendaReq || 'ISO 9001:2015',
            activity: newAgendaAct,
            auditee: newAgendaAuditee || 'Líder de Área',
            auditor: newAgendaAuditor || actData.leadAuditorName
          }
        ]
      });
      setNewAgendaHour('');
      setNewAgendaReq('');
      setNewAgendaAct('');
      setNewAgendaAuditee('');
      setNewAgendaAuditor('');
    }
  };

  const removeAgendaItem = (index: number) => {
    const updated = [...actData.agenda];
    updated.splice(index, 1);
    setActData({
      ...actData,
      agenda: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation & Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <FileText className="w-4 h-4" />
              <span>Documentos Oficiales Normalizados ISO 19011:2026 · Impresos al Día</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Actas y Registro Formal de Auditoría
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Control documental (código, versión, fechas y editor responsable), equipo auditor, actas y dictamen de cierre.
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
              {isEditing ? 'Modo Visualización' : 'Editar Campos del Documento'}
            </button>

            {isEditing && (
              <button
                onClick={
                  activeTab === 'apertura'
                    ? handleSaveOpening
                    : activeTab === 'cierre'
                    ? handleSaveClosing
                    : handleSaveReport
                }
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

        {/* Tabs for Documents */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('apertura')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'apertura'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Acta de Apertura ({actData.code})
          </button>
          <button
            onClick={() => setActiveTab('cierre')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cierre'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Acta de Cierre ({closingData.code})
          </button>
          <button
            onClick={() => setActiveTab('informe')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'informe'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Informe Final ({reportData.code})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ACTA DE APERTURA (FO-MCO-20) */}
      {/* ============================================================== */}
      {activeTab === 'apertura' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Document Header with Editable Code, Version, Date, and Editor Responsible */}
          <DocumentHeader
            title="ACTA DE APERTURA DE AUDITORÍA INTERNA DE CALIDAD"
            subtitle="CARGO: OPERARIO DE PRENSA LITOGRÁFICA"
            normative="SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026"
            code={actData.code}
            version={actData.version}
            approvalDate={actData.approvalDate}
            editorResponsible={actData.editorResponsible || 'Ing. Noralba Castaño Puerta (Auditor Líder)'}
            page={actData.page}
            isEditing={isEditing}
            onUpdateControlFields={(fields) =>
              setActData({
                ...actData,
                code: fields.code,
                version: fields.version,
                approvalDate: fields.approvalDate,
                editorResponsible: fields.editorResponsible,
                page: fields.page || actData.page
              })
            }
          />

          {/* Section 1: General Info Grid */}
          <div className="border border-slate-800 mb-6 text-xs">
            <div className="grid grid-cols-12 divide-x divide-slate-800 border-b border-slate-800 bg-slate-100 font-bold text-[11px]">
              <div className="col-span-3 p-2 text-slate-700 uppercase">FECHA DE APERTURA</div>
              <div className="col-span-2 p-2 text-slate-700 uppercase">HORA</div>
              <div className="col-span-3 p-2 text-slate-700 uppercase">LUGAR</div>
              <div className="col-span-4 p-2 text-slate-700 uppercase">ÁREA / PROCESO AUDITADO</div>
            </div>
            <div className="grid grid-cols-12 divide-x divide-slate-800">
              <div className="col-span-3 p-2 font-medium">
                {isEditing ? (
                  <input
                    type="date"
                    value={actData.date}
                    onChange={(e) => setActData({ ...actData, date: e.target.value })}
                    className="w-full p-1 border rounded text-xs bg-white font-medium"
                  />
                ) : (
                  actData.date
                )}
              </div>
              <div className="col-span-2 p-2 font-medium">
                {isEditing ? (
                  <input
                    type="text"
                    value={actData.time}
                    onChange={(e) => setActData({ ...actData, time: e.target.value })}
                    className="w-full p-1 border rounded text-xs bg-white font-medium"
                  />
                ) : (
                  actData.time
                )}
              </div>
              <div className="col-span-3 p-2 text-slate-700">
                {isEditing ? (
                  <input
                    type="text"
                    value={actData.place}
                    onChange={(e) => setActData({ ...actData, place: e.target.value })}
                    className="w-full p-1 border rounded text-xs bg-white"
                  />
                ) : (
                  actData.place
                )}
              </div>
              <div className="col-span-4 p-2 text-slate-800 font-semibold">
                {isEditing ? (
                  <input
                    type="text"
                    value={actData.auditedProcess}
                    onChange={(e) => setActData({ ...actData, auditedProcess: e.target.value })}
                    className="w-full p-1 border rounded text-xs font-semibold bg-white"
                  />
                ) : (
                  actData.auditedProcess
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Attendees & Auditor Team Table */}
          <div className="border border-slate-800 mb-6 text-xs">
            <div className="bg-slate-100 p-2 font-bold uppercase tracking-wider text-slate-800 border-b border-slate-800 flex items-center justify-between">
              <span>LISTA DE ASISTENTES Y EQUIPO AUDITOR</span>
              <span className="text-[10px] text-slate-500 font-mono">{actData.attendees.length} Asistentes Registrados</span>
            </div>

            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700">
                  <th className="p-2 border-r border-slate-800">Nombre del Asistente / Auditor</th>
                  <th className="p-2 border-r border-slate-800">Cargo / Rol en la Auditoría</th>
                  <th className="p-2 w-48 text-center">Firma Digital</th>
                  {isEditing && <th className="p-2 w-12 text-center no-print">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {actData.attendees.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="p-2 font-medium text-slate-900 border-r border-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={att.name}
                          onChange={(e) => {
                            const updated = actData.attendees.map(a =>
                              a.id === att.id ? { ...a, name: e.target.value } : a
                            );
                            setActData({ ...actData, attendees: updated });
                          }}
                          className="w-full p-1 border rounded text-xs bg-white"
                        />
                      ) : (
                        att.name
                      )}
                    </td>
                    <td className="p-2 text-slate-600 border-r border-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={att.role}
                          onChange={(e) => {
                            const updated = actData.attendees.map(a =>
                              a.id === att.id ? { ...a, role: e.target.value } : a
                            );
                            setActData({ ...actData, attendees: updated });
                          }}
                          className="w-full p-1 border rounded text-xs bg-white"
                        />
                      ) : (
                        att.role
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {att.signature ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={att.signature}
                            alt="Firma"
                            className="max-h-8 max-w-[140px] object-contain"
                          />
                          <span className="text-[9px] text-emerald-700 font-mono">Firma verificada</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = actData.attendees.map(a =>
                                  a.id === att.id ? { ...a, signature: '' } : a
                                );
                                setActData({ ...actData, attendees: updated });
                              }}
                              className="text-[9px] text-rose-600 hover:underline mt-0.5 no-print"
                            >
                              Borrar
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSigTarget(att.id)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer no-print"
                        >
                          Registrar Firma
                        </button>
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => removeAttendee(att.id)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          title="Eliminar asistente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Quick Add and Import Auditor when in Edit Mode */}
            {isEditing && (
              <div className="p-3 bg-slate-50 border-t border-slate-800 space-y-2 no-print">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del asistente..."
                    value={newAttendeeName}
                    onChange={(e) => setNewAttendeeName(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border rounded bg-white w-full sm:w-auto"
                  />
                  <input
                    type="text"
                    placeholder="Cargo / Rol en Auditoría..."
                    value={newAttendeeRole}
                    onChange={(e) => setNewAttendeeRole(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border rounded bg-white w-full sm:w-auto"
                  />
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="px-3.5 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer shrink-0"
                  >
                    + Agregar Asistente
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-600 font-medium shrink-0">
                    O importar del equipo auditor:
                  </span>
                  <select
                    value={selectedAuditorToImport}
                    onChange={(e) => setSelectedAuditorToImport(e.target.value)}
                    className="px-2 py-1 text-xs border rounded bg-white flex-1 max-w-xs"
                  >
                    <option value="">Seleccionar auditor registrado...</option>
                    {auditors.map((aud) => (
                      <option key={aud.id} value={aud.id}>
                        {aud.name} ({aud.role} - {aud.jobTitle || aud.department})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={importRegisteredAuditorToApertura}
                    disabled={!selectedAuditorToImport}
                    className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    Importar con Firma
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Objective, Scope & Methodology */}
          <div className="border border-slate-800 mb-6 text-xs divide-y divide-slate-800">
            <div className="grid grid-cols-12">
              <div className="col-span-3 p-2 bg-slate-100 font-bold uppercase text-slate-700 border-r border-slate-800">
                OBJETIVO
              </div>
              <div className="col-span-9 p-2.5 text-slate-800 leading-relaxed">
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={actData.objective}
                    onChange={(e) => setActData({ ...actData, objective: e.target.value })}
                    className="w-full p-1 border rounded text-xs bg-white"
                  />
                ) : (
                  actData.objective
                )}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 p-2 bg-slate-100 font-bold uppercase text-slate-700 border-r border-slate-800">
                ALCANCE
              </div>
              <div className="col-span-9 p-2.5 text-slate-800 leading-relaxed">
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={actData.scope}
                    onChange={(e) => setActData({ ...actData, scope: e.target.value })}
                    className="w-full p-1 border rounded text-xs bg-white"
                  />
                ) : (
                  actData.scope
                )}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 p-2 bg-slate-100 font-bold uppercase text-slate-700 border-r border-slate-800">
                METODOLOGÍA
              </div>
              <div className="col-span-9 p-2.5 text-slate-800 leading-relaxed">
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={actData.methodology}
                    onChange={(e) => setActData({ ...actData, methodology: e.target.value })}
                    className="w-full p-1 border rounded text-xs bg-white"
                  />
                ) : (
                  actData.methodology
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Agenda Table */}
          <div className="border border-slate-800 mb-6 text-xs">
            <div className="bg-slate-100 p-2 font-bold uppercase tracking-wider text-slate-800 border-b border-slate-800">
              AGENDA Y DISTRIBUCIÓN HORARIA DE LA AUDITORÍA
            </div>
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700">
                  <th className="p-2 w-28 border-r border-slate-800">Hora</th>
                  <th className="p-2 w-32 border-r border-slate-800">Requisito Norma</th>
                  <th className="p-2 border-r border-slate-800">Actividad a Desarrollar</th>
                  <th className="p-2 w-36 border-r border-slate-800">Auditado</th>
                  <th className="p-2 w-36">Auditores</th>
                  {isEditing && <th className="p-2 w-12 text-center no-print">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {actData.agenda.map((ag, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2 font-mono font-medium text-slate-800 border-r border-slate-800">
                      {ag.hour}
                    </td>
                    <td className="p-2 text-slate-700 border-r border-slate-800">
                      {ag.requirement}
                    </td>
                    <td className="p-2 font-medium text-slate-900 border-r border-slate-800">
                      {ag.activity}
                    </td>
                    <td className="p-2 text-slate-600 border-r border-slate-800">
                      {ag.auditee}
                    </td>
                    <td className="p-2 text-slate-700">
                      {ag.auditor}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(idx)}
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
                  placeholder="Hora (08:00 - 09:00)"
                  value={newAgendaHour}
                  onChange={(e) => setNewAgendaHour(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Requisito ISO"
                  value={newAgendaReq}
                  onChange={(e) => setNewAgendaReq(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Actividad..."
                  value={newAgendaAct}
                  onChange={(e) => setNewAgendaAct(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Auditado..."
                  value={newAgendaAuditee}
                  onChange={(e) => setNewAgendaAuditee(e.target.value)}
                  className="px-2 py-1 text-xs border rounded bg-white"
                />
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Auditor..."
                    value={newAgendaAuditor}
                    onChange={(e) => setNewAgendaAuditor(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={addAgendaItem}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Order of the Day */}
          <div className="border border-slate-800 mb-6 text-xs p-4 bg-slate-50/40">
            <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
              ORDEN DEL DÍA FORMAL (ISO 19011:2026)
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              {actData.orderOfDay.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ol>
          </div>

          {/* Section 6: Observations */}
          <div className="border border-slate-800 mb-8 text-xs p-3">
            <span className="font-bold uppercase text-slate-800 block mb-1">OBSERVACIONES:</span>
            {isEditing ? (
              <textarea
                rows={2}
                value={actData.observations}
                onChange={(e) => setActData({ ...actData, observations: e.target.value })}
                className="w-full p-1 border rounded text-xs bg-white"
              />
            ) : (
              <p className="text-slate-700 italic">{actData.observations || 'Sin observaciones adicionales.'}</p>
            )}
          </div>

          {/* Section 7: Formal Signatures Zone with Editable Names and Roles */}
          <div className="grid grid-cols-2 gap-8 pt-4 page-break-inside-avoid">
            {/* Lead Auditor Signature */}
            <div className="border border-slate-300 rounded-lg p-4 flex flex-col justify-between items-center text-center bg-slate-50/50">
              <span className="text-[11px] font-bold uppercase text-slate-600 mb-2">
                LÍDER DEL EQUIPO AUDITOR
              </span>
              <div className="min-h-[70px] w-full flex items-center justify-center my-2 border-b border-dashed border-slate-400">
                {actData.leadAuditorSignature ? (
                  <img
                    src={actData.leadAuditorSignature}
                    alt="Firma Auditor Líder"
                    className="max-h-16 max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              <div className="mt-1 w-full">
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={actData.leadAuditorName}
                      onChange={(e) => setActData({ ...actData, leadAuditorName: e.target.value })}
                      placeholder="Nombre del Auditor Líder..."
                      className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                    />
                    <input
                      type="text"
                      value={actData.leadAuditorJobTitle || ''}
                      onChange={(e) => setActData({ ...actData, leadAuditorJobTitle: e.target.value })}
                      placeholder="Cargo / Título..."
                      className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                    />
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-xs text-slate-900 block">{actData.leadAuditorName}</span>
                    <span className="text-[10px] text-slate-500">
                      {actData.leadAuditorJobTitle || 'Auditor Líder Certificado ISO 19011:2026'}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSigTarget('leadAuditor')}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer no-print"
              >
                {actData.leadAuditorSignature ? 'Modificar Firma' : 'Firmar Acta'}
              </button>
            </div>

            {/* Auditee Leader Signature */}
            <div className="border border-slate-300 rounded-lg p-4 flex flex-col justify-between items-center text-center bg-slate-50/50">
              <span className="text-[11px] font-bold uppercase text-slate-600 mb-2">
                LÍDER DEL PROCESO AUDITADO
              </span>
              <div className="min-h-[70px] w-full flex items-center justify-center my-2 border-b border-dashed border-slate-400">
                {actData.auditeeLeaderSignature ? (
                  <img
                    src={actData.auditeeLeaderSignature}
                    alt="Firma Líder Auditado"
                    className="max-h-16 max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              <div className="mt-1 w-full">
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={actData.auditeeLeaderName}
                      onChange={(e) => setActData({ ...actData, auditeeLeaderName: e.target.value })}
                      placeholder="Nombre del auditado..."
                      className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                    />
                    <input
                      type="text"
                      value={actData.auditeeLeaderJobTitle || ''}
                      onChange={(e) => setActData({ ...actData, auditeeLeaderJobTitle: e.target.value })}
                      placeholder="Cargo auditado..."
                      className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                    />
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-xs text-slate-900 block">{actData.auditeeLeaderName}</span>
                    <span className="text-[10px] text-slate-500">
                      {actData.auditeeLeaderJobTitle || 'Operario de Prensa Litográfica (Prensista)'}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSigTarget('auditeeLeader')}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer no-print"
              >
                {actData.auditeeLeaderSignature ? 'Modificar Firma' : 'Firmar Acta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ACTA DE CIERRE (FO-MCO-21) */}
      {/* ============================================================== */}
      {activeTab === 'cierre' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <DocumentHeader
            title="ACTA DE CIERRE DE AUDITORÍA INTERNA DE CALIDAD"
            subtitle="CARGO: OPERARIO DE PRENSA LITOGRÁFICA"
            normative="SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026"
            code={closingData.code}
            version={closingData.version}
            approvalDate={closingData.approvalDate}
            editorResponsible={closingData.editorResponsible || 'Ing. Noralba Castaño Puerta (Auditor Líder)'}
            isEditing={isEditing}
            onUpdateControlFields={(fields) =>
              setClosingData({
                ...closingData,
                code: fields.code,
                version: fields.version,
                approvalDate: fields.approvalDate,
                editorResponsible: fields.editorResponsible
              })
            }
          />

          {/* Details */}
          <div className="border border-slate-800 mb-6 text-xs divide-y divide-slate-800">
            <div className="grid grid-cols-4 p-2 bg-slate-50 font-medium">
              <div>
                <strong>Fecha:</strong>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    value={closingData.date}
                    onChange={(e) => setClosingData({ ...closingData, date: e.target.value })}
                    className="p-1 border rounded bg-white text-xs"
                  />
                ) : (
                  closingData.date
                )}
              </div>
              <div>
                <strong>Hora:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={closingData.time}
                    onChange={(e) => setClosingData({ ...closingData, time: e.target.value })}
                    className="p-1 border rounded bg-white text-xs"
                  />
                ) : (
                  closingData.time
                )}
              </div>
              <div className="col-span-2">
                <strong>Lugar:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={closingData.place}
                    onChange={(e) => setClosingData({ ...closingData, place: e.target.value })}
                    className="p-1 border rounded bg-white text-xs w-full"
                  />
                ) : (
                  closingData.place
                )}
              </div>
            </div>

            <div className="p-2.5">
              <strong className="block mb-1 text-slate-800">ORDEN DEL DÍA DE LA REUNIÓN DE CIERRE:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {closingData.orderOfDay.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 bg-amber-50/50">
              <strong className="text-slate-800">Plazo para presentar Plan de Acciones Correctivas:</strong>{' '}
              {isEditing ? (
                <input
                  type="number"
                  value={closingData.timeframeForActionPlanDays}
                  onChange={(e) => setClosingData({ ...closingData, timeframeForActionPlanDays: Number(e.target.value) })}
                  className="w-16 p-1 border rounded bg-white font-mono font-bold text-indigo-700"
                />
              ) : (
                <span className="font-bold font-mono text-indigo-700">{closingData.timeframeForActionPlanDays}</span>
              )}{' '}
              días calendario
              <div className="mt-1 text-slate-600">
                <strong>Responsable de seguimiento:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={closingData.actionPlanResponsible}
                    onChange={(e) => setClosingData({ ...closingData, actionPlanResponsible: e.target.value })}
                    className="w-full p-1 border rounded bg-white text-xs mt-1"
                  />
                ) : (
                  closingData.actionPlanResponsible
                )}
              </div>
            </div>

            <div className="p-2.5">
              <strong>Observaciones de Cierre:</strong>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={closingData.observations}
                  onChange={(e) => setClosingData({ ...closingData, observations: e.target.value })}
                  className="w-full p-1 border rounded text-xs mt-1 bg-white"
                />
              ) : (
                <p className="mt-1 text-slate-700 italic">{closingData.observations}</p>
              )}
            </div>
          </div>

          {/* Attendees Table for Closing */}
          <div className="border border-slate-800 mb-6 text-xs">
            <div className="bg-slate-100 p-2 font-bold uppercase text-slate-800 border-b border-slate-800 flex justify-between items-center">
              <span>ASISTENTES A LA REUNIÓN DE CIERRE</span>
              <span className="text-[10px] text-slate-500 font-mono">{closingData.attendees.length} Asistentes</span>
            </div>
            <table className="w-full text-left divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700">
                  <th className="p-2 border-r border-slate-800">Nombre</th>
                  <th className="p-2">Cargo / Rol</th>
                  {isEditing && <th className="p-2 w-12 text-center no-print">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {closingData.attendees.map((att) => (
                  <tr key={att.id}>
                    <td className="p-2 font-medium text-slate-900 border-r border-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={att.name}
                          onChange={(e) => {
                            const updated = closingData.attendees.map(a =>
                              a.id === att.id ? { ...a, name: e.target.value } : a
                            );
                            setClosingData({ ...closingData, attendees: updated });
                          }}
                          className="w-full p-1 border rounded text-xs bg-white"
                        />
                      ) : (
                        att.name
                      )}
                    </td>
                    <td className="p-2 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={att.role}
                          onChange={(e) => {
                            const updated = closingData.attendees.map(a =>
                              a.id === att.id ? { ...a, role: e.target.value } : a
                            );
                            setClosingData({ ...closingData, attendees: updated });
                          }}
                          className="w-full p-1 border rounded text-xs bg-white"
                        />
                      ) : (
                        att.role
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => removeClosingAttendee(att.id)}
                          className="text-rose-500 hover:text-rose-700"
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
              <div className="p-2.5 bg-slate-50 border-t border-slate-800 flex gap-2 no-print">
                <input
                  type="text"
                  placeholder="Nombre asistente de cierre..."
                  value={newClosingAttName}
                  onChange={(e) => setNewClosingAttName(e.target.value)}
                  className="flex-1 p-1 text-xs border rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Cargo..."
                  value={newClosingAttRole}
                  onChange={(e) => setNewClosingAttRole(e.target.value)}
                  className="flex-1 p-1 text-xs border rounded bg-white"
                />
                <button
                  type="button"
                  onClick={addClosingAttendee}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  + Agregar
                </button>
              </div>
            )}
          </div>

          {/* Signatures Zone */}
          <div className="grid grid-cols-2 gap-8 pt-4 page-break-inside-avoid">
            <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
              <span className="font-bold text-[11px] uppercase text-slate-700 block mb-2">
                LÍDER DEL EQUIPO AUDITOR
              </span>
              <div className="min-h-[60px] border-b border-dashed border-slate-400 mb-2 flex items-center justify-center">
                {closingData.leadAuditorSignature ? (
                  <img src={closingData.leadAuditorSignature} alt="Firma Líder" className="max-h-14" />
                ) : (
                  <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={closingData.leadAuditorName || actData.leadAuditorName}
                    onChange={(e) => setClosingData({ ...closingData, leadAuditorName: e.target.value })}
                    className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={closingData.leadAuditorJobTitle || 'Auditor Líder ISO 19011:2026'}
                    onChange={(e) => setClosingData({ ...closingData, leadAuditorJobTitle: e.target.value })}
                    className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <span className="font-bold text-xs text-slate-800 block">
                    {closingData.leadAuditorName || actData.leadAuditorName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {closingData.leadAuditorJobTitle || 'Auditor Líder ISO 19011:2026'}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSigTarget('closingLead')}
                className="block text-xs text-indigo-600 font-semibold underline mt-2 mx-auto no-print cursor-pointer"
              >
                {closingData.leadAuditorSignature ? 'Modificar Firma' : 'Firmar Cierre'}
              </button>
            </div>

            <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
              <span className="font-bold text-[11px] uppercase text-slate-700 block mb-2">
                OPERARIO DE PRENSA AUDITADO
              </span>
              <div className="min-h-[60px] border-b border-dashed border-slate-400 mb-2 flex items-center justify-center">
                {closingData.auditeeLeaderSignature ? (
                  <img src={closingData.auditeeLeaderSignature} alt="Firma Operario" className="max-h-14" />
                ) : (
                  <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={closingData.auditeeLeaderName || 'Jorge Valderrama'}
                    onChange={(e) => setClosingData({ ...closingData, auditeeLeaderName: e.target.value })}
                    className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={closingData.auditeeLeaderJobTitle || 'Operario de Prensa Litográfica'}
                    onChange={(e) => setClosingData({ ...closingData, auditeeLeaderJobTitle: e.target.value })}
                    className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <span className="font-bold text-xs text-slate-800 block">
                    {closingData.auditeeLeaderName || 'Jorge Valderrama'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {closingData.auditeeLeaderJobTitle || 'Operario de Prensa Litográfica'}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSigTarget('closingAuditee')}
                className="block text-xs text-indigo-600 font-semibold underline mt-2 mx-auto no-print cursor-pointer"
              >
                {closingData.auditeeLeaderSignature ? 'Modificar Firma' : 'Firmar Cierre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: INFORME FINAL (FO-MCO-22) */}
      {/* ============================================================== */}
      {activeTab === 'informe' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 space-y-6">
          {/* Header */}
          <DocumentHeader
            title="INFORME FINAL DE AUDITORÍA INTERNA DE CALIDAD"
            subtitle="CARGO: OPERARIO DE PRENSA LITOGRÁFICA"
            normative="SGC ISO 9001:2015 · DIRECTRICES ISO 19011:2026"
            code={reportData.code}
            version={reportData.version}
            approvalDate={reportData.approvalDate}
            editorResponsible={reportData.editorResponsible || 'Ing. Noralba Castaño Puerta (Auditor Líder)'}
            isEditing={isEditing}
            onUpdateControlFields={(fields) =>
              setReportData({
                ...reportData,
                code: fields.code,
                version: fields.version,
                approvalDate: fields.approvalDate,
                editorResponsible: fields.editorResponsible
              })
            }
          />

          {/* Audit General Specs Strip */}
          <div className="border border-slate-800 text-xs divide-y divide-slate-800">
            <div className="grid grid-cols-12 divide-x divide-slate-800 bg-slate-50 font-medium">
              <div className="col-span-4 p-2">
                <strong>Fecha Auditoría:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={reportData.auditDate}
                    onChange={(e) => setReportData({ ...reportData, auditDate: e.target.value })}
                    className="p-1 border rounded bg-white text-xs w-full mt-1"
                  />
                ) : (
                  <span>{reportData.auditDate}</span>
                )}
              </div>
              <div className="col-span-4 p-2">
                <strong>Proceso Auditado:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={reportData.auditedProcess}
                    onChange={(e) => setReportData({ ...reportData, auditedProcess: e.target.value })}
                    className="p-1 border rounded bg-white text-xs w-full mt-1"
                  />
                ) : (
                  <span>{reportData.auditedProcess}</span>
                )}
              </div>
              <div className="col-span-4 p-2">
                <strong>Puesto / Cargo:</strong>{' '}
                <span className="font-bold text-indigo-900">{reportData.targetJob}</span>
              </div>
            </div>

            {/* Auditor Team in Final Report */}
            <div className="p-2.5">
              <strong className="block mb-1 text-slate-800">EQUIPO AUDITOR PARTICIPANTE:</strong>
              {isEditing ? (
                <div className="space-y-2 no-print">
                  <div className="flex flex-wrap gap-2">
                    {reportData.auditorTeam.map((member, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs font-medium text-indigo-950"
                      >
                        {member}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.auditorTeam.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, auditorTeam: updated });
                          }}
                          className="text-rose-500 hover:text-rose-700 ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre y cargo de auditor..."
                      value={newReportAuditor}
                      onChange={(e) => setNewReportAuditor(e.target.value)}
                      className="flex-1 p-1.5 border rounded text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newReportAuditor.trim()) {
                          setReportData({
                            ...reportData,
                            auditorTeam: [...reportData.auditorTeam, newReportAuditor.trim()]
                          });
                          setNewReportAuditor('');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed">{reportData.auditorTeam.join(' · ')}</p>
              )}
            </div>

            {/* Interviewed Personnel */}
            <div className="p-2.5">
              <strong className="block mb-1 text-slate-800">PERSONAL ENTREVISTADO EN PLANTA:</strong>
              {isEditing ? (
                <div className="space-y-2 no-print">
                  <div className="flex flex-wrap gap-2">
                    {reportData.interviewedPersonnel.map((person, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-md text-xs font-medium text-slate-800"
                      >
                        {person}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.interviewedPersonnel.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, interviewedPersonnel: updated });
                          }}
                          className="text-rose-500 hover:text-rose-700 ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la persona entrevistada..."
                      value={newInterviewed}
                      onChange={(e) => setNewInterviewed(e.target.value)}
                      className="flex-1 p-1.5 border rounded text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newInterviewed.trim()) {
                          setReportData({
                            ...reportData,
                            interviewedPersonnel: [...reportData.interviewedPersonnel, newInterviewed.trim()]
                          });
                          setNewInterviewed('');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed">{reportData.interviewedPersonnel.join(' · ')}</p>
              )}
            </div>
          </div>

          {/* Favorable Aspects */}
          <div className="border border-slate-800 text-xs">
            <div className="bg-emerald-50 p-2 font-bold uppercase tracking-wider text-emerald-900 border-b border-slate-800">
              ASPECTOS FAVORABLES Y FORTALEZAS OBSERVADAS EN EL PRENSISTA
            </div>
            <div className="p-4 space-y-2 text-slate-800">
              {reportData.favorableAspects.map((aspect, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{aspect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Non Conformities */}
          <div className="border border-slate-800 text-xs">
            <div className="bg-rose-50 p-2 font-bold uppercase tracking-wider text-rose-900 border-b border-slate-800">
              NO CONFORMIDADES IDENTIFICADAS EN EL PUESTO DE PRENSA
            </div>
            <table className="w-full text-left divide-y divide-slate-800">
              <thead>
                <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700">
                  <th className="p-2 border-r border-slate-800">Descripción del Hallazgo</th>
                  <th className="p-2 w-20 text-center border-r border-slate-800">Tipo</th>
                  <th className="p-2 w-72">Requisito Incumplido (Norma ISO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {reportData.nonConformities.map((nc) => (
                  <tr key={nc.id}>
                    <td className="p-2.5 text-slate-800 border-r border-slate-800 font-medium">
                      {nc.finding}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700 border-r border-slate-800">
                      {nc.classification}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {nc.breachedRequirement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Corrective Action Plans Table */}
          <div className="border border-slate-800 text-xs overflow-hidden">
            <div className="bg-amber-50 p-2 font-bold uppercase tracking-wider text-amber-900 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-amber-700" />
                PLANES DE ACCIÓN CORRECTIVOS CONCERTADOS
              </span>
              <span className="text-[10px] font-mono text-amber-800">Compromiso a 15 días</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left divide-y divide-slate-800">
                <thead>
                  <tr className="bg-slate-50 font-bold uppercase text-[10px] text-slate-700 divide-x divide-slate-800">
                    <th className="p-2 w-14 text-center">Ref</th>
                    <th className="p-2 min-w-[150px]">Causa Raíz Identificada</th>
                    <th className="p-2 min-w-[200px]">Acción Correctiva Acordada</th>
                    <th className="p-2 w-36">Responsable</th>
                    <th className="p-2 w-28 text-center">Fecha Plazo</th>
                    <th className="p-2 w-24 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {reportData.actionPlans.map((plan) => (
                    <tr key={plan.id} className="divide-x divide-slate-300">
                      <td className="p-2 font-mono font-bold text-center text-slate-800">
                        {plan.nonConformityId.toUpperCase()}
                      </td>
                      <td className="p-2 text-slate-700">
                        {plan.rootCauseAnalysis}
                      </td>
                      <td className="p-2 font-medium text-slate-900">
                        {plan.correctiveAction}
                      </td>
                      <td className="p-2 text-slate-700">
                        {plan.responsiblePerson}
                      </td>
                      <td className="p-2 text-center font-mono text-slate-800">
                        {plan.commitmentDeadline}
                      </td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-amber-100 text-amber-800">
                          {plan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Improvement Opportunities */}
          <div className="border border-slate-800 text-xs">
            <div className="bg-blue-50 p-2 font-bold uppercase tracking-wider text-blue-900 border-b border-slate-800">
              OPORTUNIDADES DE MEJORA EN EL TALLER DE PRENSAS
            </div>
            <div className="p-4 space-y-2 text-slate-800">
              {reportData.improvementOpportunities.map((op, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4">
                  <span>• {op.opportunity}</span>
                  <span className="font-mono text-slate-500 shrink-0">{op.standardClause}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusions */}
          <div className="border border-slate-800 p-4 text-xs bg-slate-50/50">
            <strong className="block uppercase text-slate-800 mb-1.5 font-bold">CONCLUSIONES GENERALES:</strong>
            {isEditing ? (
              <textarea
                rows={3}
                value={reportData.conclusions}
                onChange={(e) => setReportData({ ...reportData, conclusions: e.target.value })}
                className="w-full p-2 border rounded text-xs bg-white"
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">{reportData.conclusions}</p>
            )}
          </div>

          {/* Signatures Zone on Final Report */}
          <div className="grid grid-cols-2 gap-8 pt-4 page-break-inside-avoid">
            <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
              <span className="font-bold text-[11px] uppercase text-slate-700 block mb-2">
                AUDITOR LÍDER EMISOR DEL INFORME
              </span>
              <div className="min-h-[60px] border-b border-dashed border-slate-400 mb-2 flex items-center justify-center">
                {reportData.leadAuditorSignature ? (
                  <img src={reportData.leadAuditorSignature} alt="Firma Auditor Líder" className="max-h-14" />
                ) : (
                  <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={reportData.leadAuditorName || actData.leadAuditorName}
                    onChange={(e) => setReportData({ ...reportData, leadAuditorName: e.target.value })}
                    className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={reportData.leadAuditorJobTitle || 'Directora de Calidad y Procesos / Auditor Líder'}
                    onChange={(e) => setReportData({ ...reportData, leadAuditorJobTitle: e.target.value })}
                    className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <span className="font-bold text-xs text-slate-800 block">
                    {reportData.leadAuditorName || actData.leadAuditorName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {reportData.leadAuditorJobTitle || 'Directora de Calidad y Procesos / Auditor Líder'}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSigTarget('reportLead')}
                className="block text-xs text-indigo-600 font-semibold underline mt-2 mx-auto no-print cursor-pointer"
              >
                {reportData.leadAuditorSignature ? 'Modificar Firma' : 'Firmar Informe'}
              </button>
            </div>

            <div className="border border-slate-300 rounded p-4 text-center bg-slate-50/50">
              <span className="font-bold text-[11px] uppercase text-slate-700 block mb-2">
                REPRESENTANTE DE PLANTA / DIRECCIÓN TÉCNICA
              </span>
              <div className="min-h-[60px] border-b border-dashed border-slate-400 mb-2 flex items-center justify-center">
                {reportData.auditeeLeaderSignature ? (
                  <img src={reportData.auditeeLeaderSignature} alt="Firma Dirección" className="max-h-14" />
                ) : (
                  <span className="text-xs text-slate-400 italic">Pendiente de firma digital</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={reportData.auditeeLeaderName || 'Ing. Mauricio Henao Gómez'}
                    onChange={(e) => setReportData({ ...reportData, auditeeLeaderName: e.target.value })}
                    className="w-full text-center font-bold text-xs p-1 border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={reportData.auditeeLeaderJobTitle || 'Jefe de Planta Litográfica'}
                    onChange={(e) => setReportData({ ...reportData, auditeeLeaderJobTitle: e.target.value })}
                    className="w-full text-center text-[10px] p-0.5 border rounded bg-white text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <span className="font-bold text-xs text-slate-800 block">
                    {reportData.auditeeLeaderName || 'Ing. Mauricio Henao Gómez'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {reportData.auditeeLeaderJobTitle || 'Jefe de Planta Litográfica'}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSigTarget('reportAuditee')}
                className="block text-xs text-indigo-600 font-semibold underline mt-2 mx-auto no-print cursor-pointer"
              >
                {reportData.auditeeLeaderSignature ? 'Modificar Firma' : 'Firmar Informe'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {sigTarget && (
        <DigitalSignatureModal
          isOpen={!!sigTarget}
          onClose={() => setSigTarget(null)}
          onSave={(dataUrl) => {
            if (sigTarget === 'leadAuditor') {
              setActData({ ...actData, leadAuditorSignature: dataUrl });
            } else if (sigTarget === 'auditeeLeader') {
              setActData({ ...actData, auditeeLeaderSignature: dataUrl });
            } else if (sigTarget === 'closingLead') {
              setClosingData({ ...closingData, leadAuditorSignature: dataUrl });
            } else if (sigTarget === 'closingAuditee') {
              setClosingData({ ...closingData, auditeeLeaderSignature: dataUrl });
            } else if (sigTarget === 'reportLead') {
              setReportData({ ...reportData, leadAuditorSignature: dataUrl });
            } else if (sigTarget === 'reportAuditee') {
              setReportData({ ...reportData, auditeeLeaderSignature: dataUrl });
            } else {
              // Specific attendee signature
              setActData({
                ...actData,
                attendees: actData.attendees.map(a => a.id === sigTarget ? { ...a, signature: dataUrl } : a)
              });
            }
            setSigTarget(null);
          }}
          title={
            sigTarget === 'leadAuditor'
              ? 'Firma Digital: Auditor Líder'
              : sigTarget === 'auditeeLeader'
              ? 'Firma Digital: Operario / Líder Auditado'
              : sigTarget === 'closingLead'
              ? 'Firma Digital: Líder Auditor de Cierre'
              : sigTarget === 'closingAuditee'
              ? 'Firma Digital: Operario de Prensa en Cierre'
              : sigTarget === 'reportLead'
              ? 'Firma Digital: Emisor Informe Final'
              : sigTarget === 'reportAuditee'
              ? 'Firma Digital: Dirección de Planta'
              : 'Firma Digital de Asistente'
          }
          defaultSignatoryName={
            sigTarget === 'leadAuditor' || sigTarget === 'closingLead' || sigTarget === 'reportLead'
              ? actData.leadAuditorName
              : sigTarget === 'auditeeLeader' || sigTarget === 'closingAuditee'
              ? actData.auditeeLeaderName
              : sigTarget === 'reportAuditee'
              ? reportData.auditeeLeaderName || 'Ing. Mauricio Henao Gómez'
              : ''
          }
          signatoryRole="Auditoría Interna SGC ISO 19011:2026"
        />
      )}
    </div>
  );
};
