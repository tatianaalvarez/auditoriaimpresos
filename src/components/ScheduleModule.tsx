/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  PlayCircle, 
  RotateCcw,
  CalendarDays,
  ListFilter,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { AuditScheduleItem, Auditor, GraphicProcess, AuditStageStatus } from '../types/audit';

interface ScheduleModuleProps {
  schedules: AuditScheduleItem[];
  auditors: Auditor[];
  onSaveSchedule: (item: AuditScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
}

const ALL_PROCESSES: GraphicProcess[] = [
  'Comercial y Cotizaciones',
  'Preimpresión y CTP',
  'Impresión Offset y Prensas',
  'Postprensa y Acabados',
  'Almacén de Sustratos y Tintas',
  'Aseguramiento de la Calidad'
];

export const ScheduleModule: React.FC<ScheduleModuleProps> = ({
  schedules,
  auditors,
  onSaveSchedule,
  onDeleteSchedule
}) => {
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AuditScheduleItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<AuditScheduleItem>({
    id: '',
    auditNumber: '',
    stageTitle: '',
    process: 'Impresión Offset y Prensas',
    standardClause: 'ISO 9001:2015 8.5.1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    location: 'Nave de Impresión Offset',
    leadAuditorId: auditors[0]?.id || '',
    accompanyingAuditorIds: [],
    auditeeResponsible: 'Líder de Proceso',
    status: 'Programada',
    deliverableNotes: ''
  });

  const openCreateModal = () => {
    const nextNum = `AUD-${String(schedules.length + 1).padStart(2, '0')}`;
    setFormData({
      id: `sch-${Date.now()}`,
      auditNumber: nextNum,
      stageTitle: '',
      process: 'Impresión Offset y Prensas',
      standardClause: 'ISO 9001:2015 8.5.1',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      location: 'Nave de Prensas',
      leadAuditorId: auditors[0]?.id || '',
      accompanyingAuditorIds: [],
      auditeeResponsible: 'Jefe de Proceso',
      status: 'Programada',
      deliverableNotes: ''
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AuditScheduleItem) => {
    setFormData(JSON.parse(JSON.stringify(item)));
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stageTitle.trim()) {
      alert('Por favor especifica el título de la actividad o etapa.');
      return;
    }
    onSaveSchedule(formData);
    setIsModalOpen(false);
  };

  const toggleStatus = (item: AuditScheduleItem) => {
    let nextStatus: AuditStageStatus = 'Programada';
    if (item.status === 'Programada') nextStatus = 'En Ejecución';
    else if (item.status === 'En Ejecución') nextStatus = 'Completada';
    else if (item.status === 'Completada') nextStatus = 'Programada';

    onSaveSchedule({
      ...item,
      status: nextStatus,
      executedDateTime: nextStatus === 'Completada' ? new Date().toLocaleString('es-CO') : item.executedDateTime
    });
  };

  const toggleAccompanyingAuditor = (audId: string) => {
    const current = formData.accompanyingAuditorIds;
    if (current.includes(audId)) {
      setFormData({
        ...formData,
        accompanyingAuditorIds: current.filter(id => id !== audId)
      });
    } else {
      setFormData({
        ...formData,
        accompanyingAuditorIds: [...current, audId]
      });
    }
  };

  const filteredSchedules = schedules
    .filter(s => {
      const matchProc = selectedProcess === 'all' || s.process === selectedProcess;
      const matchStat = selectedStatus === 'all' || s.status === selectedStatus;
      return matchProc && matchStat;
    })
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  const getAuditorName = (id: string) => {
    return auditors.find(a => a.id === id)?.name || 'Auditor no asignado';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <CalendarIcon className="w-4 h-4" />
              <span>Cronograma e Itinerario Oficial (FO-MCO-18)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Planificación y Cronograma de Auditoría
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Tiempos, etapas, asignación de auditores y control de ejecución en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Línea de Tiempo
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabla Itinerario
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Etapa
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Procesos Litográficos</option>
              {ALL_PROCESSES.map((proc) => (
                <option key={proc} value={proc}>{proc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Estados</option>
              <option value="Programada">Programada</option>
              <option value="En Ejecución">En Ejecución</option>
              <option value="Completada">Completada</option>
              <option value="Reprogramada">Reprogramada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredSchedules.map((item, idx) => {
            const isCompleted = item.status === 'Completada';
            const isRunning = item.status === 'En Ejecución';

            const statusDotColor = isCompleted
              ? 'bg-emerald-600 ring-4 ring-emerald-50'
              : isRunning
              ? 'bg-amber-500 ring-4 ring-amber-50 animate-pulse'
              : 'bg-slate-400 ring-4 ring-slate-100';

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node marker */}
                <div
                  className={`absolute -left-[27px] md:-left-[35px] top-4 w-4 h-4 rounded-full ${statusDotColor} transition-transform group-hover:scale-125`}
                />

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">
                          {item.auditNumber}
                        </span>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                          {item.process}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono">{item.standardClause}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 pt-1">
                        {item.stageTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Fast Action */}
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : isRunning
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="Haz clic para avanzar de estado"
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Completada
                          </>
                        ) : isRunning ? (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                            En Ejecución
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Programada
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Modificar fecha o detalles"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la etapa ${item.stageTitle}?`)) {
                            onDeleteSchedule(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Eliminar etapa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Team Assignment & Deliverables */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-700">Auditor Líder:</span>
                        <span className="text-slate-900">{getAuditorName(item.leadAuditorId)}</span>
                      </div>
                      {item.accompanyingAuditorIds.length > 0 && (
                        <div className="text-[11px] text-slate-500 pl-5">
                          <strong>Acompañantes:</strong>{' '}
                          {item.accompanyingAuditorIds.map(id => getAuditorName(id)).join(', ')}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 pl-5">
                        <strong>Auditado Responsable:</strong> {item.auditeeResponsible}
                      </div>
                    </div>

                    {item.deliverableNotes && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 max-w-md">
                        {item.deliverableNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View matching FO-MCO-18 Format */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-16">AUD #</th>
                  <th className="py-3 px-4 min-w-[200px]">Actividad / Etapa</th>
                  <th className="py-3 px-3 min-w-[140px]">Auditado</th>
                  <th className="py-3 px-3 min-w-[140px]">Auditor Principal</th>
                  <th className="py-3 px-3 w-28">Fecha</th>
                  <th className="py-3 px-3 w-24">Horario</th>
                  <th className="py-3 px-3 min-w-[140px]">Lugar</th>
                  <th className="py-3 px-3 w-24">Estado</th>
                  <th className="py-3 px-3 text-right w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filteredSchedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{item.auditNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.stageTitle}</div>
                      <div className="text-[10px] text-indigo-700">{item.process}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{item.auditeeResponsible}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{getAuditorName(item.leadAuditorId)}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{item.date}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{item.startTime} - {item.endTime}</td>
                    <td className="py-3 px-3 text-slate-600">{item.location}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleStatus(item)}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Schedule Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? `Modificar Etapa ${formData.auditNumber}` : 'Programar Nueva Etapa de Auditoría'}
                </h3>
                <p className="text-xs text-slate-500">Planificación horaria y asignación de equipo.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Identificador #</label>
                  <input
                    type="text"
                    required
                    value={formData.auditNumber}
                    onChange={(e) => setFormData({ ...formData, auditNumber: e.target.value })}
                    placeholder="AUD-01"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Proceso Litográfico</label>
                  <select
                    value={formData.process}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value as GraphicProcess })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {ALL_PROCESSES.map((proc) => (
                      <option key={proc} value={proc}>{proc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título de la Actividad / Etapa *</label>
                <input
                  type="text"
                  required
                  value={formData.stageTitle}
                  onChange={(e) => setFormData({ ...formData, stageTitle: e.target.value })}
                  placeholder="Ej. Inspección de Prensas Offset y Balance Agua-Tinta"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lugar / Ubicación en Planta</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej. Taller CTP / Nave de Prensas"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auditado Responsable</label>
                  <input
                    type="text"
                    value={formData.auditeeResponsible}
                    onChange={(e) => setFormData({ ...formData, auditeeResponsible: e.target.value })}
                    placeholder="Ej. Coordinador de Acabados"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auditor Principal Asignado</label>
                  <select
                    value={formData.leadAuditorId}
                    onChange={(e) => setFormData({ ...formData, leadAuditorId: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {auditors.map((aud) => (
                      <option key={aud.id} value={aud.id}>
                        {aud.name} ({aud.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de la Etapa</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AuditStageStatus })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Programada">Programada</option>
                    <option value="En Ejecución">En Ejecución</option>
                    <option value="Completada">Completada</option>
                    <option value="Reprogramada">Reprogramada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Auditores Acompañantes / Especialistas Técnicos
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {auditors.filter(a => a.id !== formData.leadAuditorId).map(aud => {
                    const isChecked = formData.accompanyingAuditorIds.includes(aud.id);
                    return (
                      <button
                        type="button"
                        key={aud.id}
                        onClick={() => toggleAccompanyingAuditor(aud.id)}
                        className={`text-left p-1.5 rounded-md border text-[11px] transition-colors flex items-center justify-between ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{aud.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requisitos de la Norma / Documentos de Referencia
                </label>
                <input
                  type="text"
                  value={formData.standardClause}
                  onChange={(e) => setFormData({ ...formData, standardClause: e.target.value })}
                  placeholder="Ej. ISO 9001:2015 Numeral 8.5.1 / ISO 12647-2"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones / Entregables</label>
                <textarea
                  rows={2}
                  value={formData.deliverableNotes || ''}
                  onChange={(e) => setFormData({ ...formData, deliverableNotes: e.target.value })}
                  placeholder="Instrucciones específicas, pliegos a revisar o muestras requeridas..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Etapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
