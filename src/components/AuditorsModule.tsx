/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Award, 
  CheckCircle, 
  BookOpen, 
  PenTool, 
  Filter, 
  Search,
  Sliders,
  Check,
  X,
  Table,
  LayoutGrid,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Auditor, AuditorRole, GraphicProcess } from '../types/audit';
import { DigitalSignatureModal } from './DigitalSignatureModal';

interface AuditorsModuleProps {
  auditors: Auditor[];
  onSaveAuditor: (auditor: Auditor) => void;
  onDeleteAuditor: (id: string) => void;
}

const ALL_PROCESSES: GraphicProcess[] = [
  'Comercial y Cotizaciones',
  'Preimpresión y CTP',
  'Impresión Offset y Prensas',
  'Postprensa y Acabados',
  'Almacén de Sustratos y Tintas',
  'Aseguramiento de la Calidad'
];

const ISO_ATTRIBUTES = [
  'Ético y con principios',
  'Mente abierta y receptivo',
  'Diplomático en la comunicación',
  'Perceptivo y observador',
  'Versátil ante situaciones imprevistas',
  'Tenaz y enfocado en objetivos',
  'Decisivo y con juicio profesional',
  'Seguro de sí mismo e independiente'
];

export const AuditorsModule: React.FC<AuditorsModuleProps> = ({
  auditors,
  onSaveAuditor,
  onDeleteAuditor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('all');
  const [editingAuditor, setEditingAuditor] = useState<Auditor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureModalAuditor, setSignatureModalAuditor] = useState<Auditor | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [auditorToDelete, setAuditorToDelete] = useState<Auditor | null>(null);

  // Form State
  const [formData, setFormData] = useState<Auditor>({
    id: '',
    name: '',
    role: 'Auditor Acompañante',
    jobTitle: 'Especialista en Producción Gráfica',
    email: '',
    phone: '',
    department: 'Producción Litográfica',
    assignedProcesses: ['Impresión Offset y Prensas'],
    competence: {
      education: '',
      graphicTechnicalTraining: [],
      auditExperienceYears: 3,
      iso9001Certified: true,
      iso19011Trained: true,
      personalAttributes: ['Ético y con principios', 'Perceptivo y observador'],
      competenceScore: 85,
      notes: ''
    },
    active: true
  });

  const [trainingInput, setTrainingInput] = useState('');

  const openCreateModal = () => {
    setFormData({
      id: `aud-${Date.now()}`,
      name: '',
      role: 'Auditor Acompañante',
      jobTitle: 'Especialista en Impresión Offset',
      email: '',
      phone: '',
      department: 'Planta Litográfica',
      assignedProcesses: ['Impresión Offset y Prensas'],
      competence: {
        education: 'Tecnólogo / Profesional en Artes Gráficas o Afines',
        graphicTechnicalTraining: ['Control de Calidad Offset', 'Directrices ISO 19011:2026'],
        auditExperienceYears: 2,
        iso9001Certified: true,
        iso19011Trained: true,
        personalAttributes: ['Ético y con principios', 'Perceptivo y observador'],
        competenceScore: 82,
        notes: ''
      },
      active: true
    });
    setEditingAuditor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (auditor: Auditor) => {
    setFormData(JSON.parse(JSON.stringify(auditor)));
    setEditingAuditor(auditor);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor especifica el nombre del auditor.');
      return;
    }

    // Auto-calculate competence score based on ISO 19011 criteria
    let score = 50;
    if (formData.competence.iso19011Trained) score += 15;
    if (formData.competence.iso9001Certified) score += 15;
    score += Math.min(formData.competence.auditExperienceYears * 2, 10);
    score += Math.min(formData.competence.graphicTechnicalTraining.length * 2, 10);
    const finalScore = Math.min(score, 100);

    const updated: Auditor = {
      ...formData,
      competence: {
        ...formData.competence,
        competenceScore: finalScore
      }
    };

    onSaveAuditor(updated);
    setIsModalOpen(false);
  };

  const toggleProcess = (process: GraphicProcess) => {
    const current = formData.assignedProcesses;
    if (current.includes(process)) {
      setFormData({
        ...formData,
        assignedProcesses: current.filter(p => p !== process)
      });
    } else {
      setFormData({
        ...formData,
        assignedProcesses: [...current, process]
      });
    }
  };

  const toggleAttribute = (attr: string) => {
    const current = formData.competence.personalAttributes;
    if (current.includes(attr)) {
      setFormData({
        ...formData,
        competence: {
          ...formData.competence,
          personalAttributes: current.filter(a => a !== attr)
        }
      });
    } else {
      setFormData({
        ...formData,
        competence: {
          ...formData.competence,
          personalAttributes: [...current, attr]
        }
      });
    }
  };

  const addTrainingTag = () => {
    if (trainingInput.trim()) {
      setFormData({
        ...formData,
        competence: {
          ...formData.competence,
          graphicTechnicalTraining: [...formData.competence.graphicTechnicalTraining, trainingInput.trim()]
        }
      });
      setTrainingInput('');
    }
  };

  const removeTrainingTag = (index: number) => {
    const updated = [...formData.competence.graphicTechnicalTraining];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      competence: {
        ...formData.competence,
        graphicTechnicalTraining: updated
      }
    });
  };

  // Filter auditors
  const filteredAuditors = auditors.filter(aud => {
    const matchesSearch = 
      aud.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aud.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aud.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || aud.role === selectedRoleFilter;
    const matchesProcess = selectedProcessFilter === 'all' || aud.assignedProcesses.includes(selectedProcessFilter as GraphicProcess);
    return matchesSearch && matchesRole && matchesProcess;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <Award className="w-4 h-4" />
              <span>Directrices de Competencia ISO 19011:2026 · Impresos al Día</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Equipo Auditor y Calificación Técnica en Prensas
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Administración y asignación del equipo auditor para evaluación del puesto de operario de prensa litográfica (Offset, CTP, Colorimetría y Mermas).
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Registrar Auditor
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar auditor por nombre o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Roles de Auditor</option>
              <option value="Auditor Líder">Auditor Líder</option>
              <option value="Auditor Técnico Especialista">Auditor Técnico Especialista</option>
              <option value="Auditor Acompañante">Auditor Acompañante</option>
              <option value="Auditor en Formación">Auditor en Formación</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedProcessFilter}
              onChange={(e) => setSelectedProcessFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Procesos Litográficos</option>
              {ALL_PROCESSES.map((proc) => (
                <option key={proc} value={proc}>{proc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Data-Binding Banner & View Switcher Bar */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/70 border border-indigo-200/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5 sm:mt-0 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Sincronización Reactiva en Cascada (Data Binding ISO 19011:2026)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Activa
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Cualquier cambio o eliminación en el equipo auditor actualiza automáticamente en tiempo real los documentos oficiales generados (Programa FO-MCO-17, Plan FO-MCO-18, Lista de Chequeo FO-MCO-19, Actas FO-MCO-20/21 e Informe Final FO-MCO-22).
            </p>
          </div>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shrink-0 self-start md:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Vista Tabla Oficial</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Vista Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Table View (ISO 19011:2026 Qualified Auditors Table) */}
      {viewMode === 'table' && filteredAuditors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Auditor / Cargo Institucional</th>
                  <th className="py-3 px-3">Rol Auditoría</th>
                  <th className="py-3 px-3">Departamento</th>
                  <th className="py-3 px-3">Procesos Asignados</th>
                  <th className="py-3 px-3 text-center">Competencia ISO</th>
                  <th className="py-3 px-3 text-center">Firma Digital</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditors.map((auditor) => (
                  <tr key={auditor.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {auditor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-[200px]" title={auditor.name}>
                            {auditor.name}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-900 block truncate max-w-[200px]" title={auditor.jobTitle}>
                            {auditor.jobTitle || 'Técnico Especialista'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {auditor.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        auditor.role === 'Auditor Líder'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : auditor.role.includes('Especialista')
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {auditor.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                      {auditor.department}
                    </td>

                    <td className="py-3.5 px-3 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {auditor.assignedProcesses.slice(0, 2).map((p) => (
                          <span key={p} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm truncate max-w-[150px]">
                            {p}
                          </span>
                        ))}
                        {auditor.assignedProcesses.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-semibold self-center">
                            +{auditor.assignedProcesses.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                        {auditor.competence.competenceScore} / 100
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        {auditor.competence.auditExperienceYears} años exp.
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {auditor.signatureBase64 ? (
                        <div className="inline-flex flex-col items-center">
                          <img
                            src={auditor.signatureBase64}
                            alt={`Firma ${auditor.name}`}
                            className="max-h-6 max-w-[90px] object-contain border border-slate-200 rounded px-1 bg-slate-50 cursor-pointer"
                            onClick={() => setSignatureModalAuditor(auditor)}
                            title="Haz clic para modificar firma"
                          />
                          <span className="text-[9px] text-emerald-700 font-bold mt-0.5">Registrada</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSignatureModalAuditor(auditor)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Firmar</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(auditor)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Modificar datos, cargo o competencias"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuditorToDelete(auditor)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title={`Eliminar a ${auditor.name} del equipo auditor`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View (Grid Mode) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuditors.map((auditor) => (
            <div
              key={auditor.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {auditor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {auditor.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-indigo-900 mt-0.5">
                        {auditor.jobTitle || 'Especialista en Planta Litográfica'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{auditor.role}</span>
                        <span>·</span>
                        <span>{auditor.competence.auditExperienceYears} años exp.</span>
                      </div>
                    </div>
                  </div>

                  {/* Competence Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                      {auditor.competence.competenceScore} / 100
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Competencia ISO</p>
                  </div>
                </div>

                {/* Department & Contact */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="truncate"><strong className="text-slate-700">Cargo:</strong> {auditor.jobTitle || 'Técnico Especialista'}</div>
                  <div className="truncate"><strong className="text-slate-700">Depto:</strong> {auditor.department}</div>
                  <div className="truncate"><strong className="text-slate-700">Email:</strong> {auditor.email}</div>
                  <div className="truncate"><strong className="text-slate-700">Formación:</strong> {auditor.competence.education}</div>
                </div>

                {/* Assigned Graphic Processes */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Procesos Asignados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {auditor.assignedProcesses.map((proc) => (
                      <span
                        key={proc}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm"
                      >
                        {proc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Certifications */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Especialidad Técnica Litográfica:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {auditor.competence.graphicTechnicalTraining.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm border border-emerald-100"
                      >
                        {item}
                      </span>
                    ))}
                    {auditor.competence.graphicTechnicalTraining.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{auditor.competence.graphicTechnicalTraining.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Signature presence preview */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Rúbrica Digital:</span>
                  {auditor.signatureBase64 ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={auditor.signatureBase64}
                        alt={`Firma ${auditor.name}`}
                        className="max-h-7 max-w-[110px] object-contain border border-slate-200 rounded px-1 bg-slate-50"
                      />
                      <span className="text-[10px] text-emerald-700 font-bold">Activa</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium">Pendiente</span>
                  )}
                </div>
              </div>

              {/* Actions with Explicit Delete Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSignatureModalAuditor(auditor)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  {auditor.signatureBase64 ? 'Actualizar Firma' : 'Firmar'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(auditor)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                    title="Editar datos y competencias"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditorToDelete(auditor)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                    title={`Eliminar a ${auditor.name} del equipo auditor`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAuditors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No se encontraron auditores</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ajusta los filtros de búsqueda o agrega un nuevo auditor al equipo bajo la norma ISO 19011:2026.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
          >
            Registrar Primer Auditor
          </button>
        </div>
      )}

      {/* Modal Edit / Create Auditor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingAuditor ? 'Modificar Auditor y Competencias' : 'Registrar Nuevo Auditor (ISO 19011:2026)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Criterios de evaluación y asignación técnica a procesos de litografía.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Auditor *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Ing. Noralba Castaño Puerta"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo / Puesto en la Empresa *</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Ej. Directora de Calidad / Prensista Master Offset"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rol en el Equipo Auditor</label>
                  <div className="space-y-1.5">
                    <select
                      value={
                        ['Auditor Líder', 'Auditor Técnico Especialista en Prensas', 'Auditor Acompañante', 'Auditor en Formación', 'Experto Técnico', 'Observador'].includes(formData.role)
                          ? formData.role
                          : 'Otro'
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'Otro') {
                          setFormData({ ...formData, role: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <option value="Auditor Líder">Auditor Líder</option>
                      <option value="Auditor Técnico Especialista en Prensas">Auditor Técnico Especialista en Prensas</option>
                      <option value="Auditor Acompañante">Auditor Acompañante</option>
                      <option value="Auditor en Formación">Auditor en Formación</option>
                      <option value="Experto Técnico">Experto Técnico</option>
                      <option value="Observador">Observador</option>
                      <option value="Otro">Personalizado / Otro Rol...</option>
                    </select>

                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Escribe o ajusta el rol específico..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento / Área de Origen</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Ej. Aseguramiento de Calidad / Prensas"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="auditor@impresosaldia.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 312 000 0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Signature Management Inside Form */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">Firma Digital del Auditor</span>
                  <button
                    type="button"
                    onClick={() => setSignatureModalAuditor(formData)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold border border-indigo-200 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {formData.signatureBase64 ? 'Cambiar / Redibujar Firma' : 'Crear Firma Digital'}
                  </button>
                </div>
                {formData.signatureBase64 ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-slate-200">
                    <img
                      src={formData.signatureBase64}
                      alt="Firma actual"
                      className="max-h-12 max-w-[200px] object-contain"
                    />
                    <div className="text-[11px] text-slate-500">
                      <span className="text-emerald-700 font-semibold block">Firma registrada y vigente</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, signatureBase64: '' })}
                        className="text-rose-600 hover:underline mt-0.5 text-[10px]"
                      >
                        Eliminar firma
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Sin firma digital capturada aún. Puedes registrarla ahora con el botón superior.
                  </p>
                )}
              </div>

              {/* Assigned Graphic Processes */}
              <div>
                <label className="block font-semibold text-slate-800 mb-2">
                  Procesos Litográficos Autorizados para Auditar
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_PROCESSES.map((proc) => {
                    const isChecked = formData.assignedProcesses.includes(proc);
                    return (
                      <button
                        type="button"
                        key={proc}
                        onClick={() => toggleProcess(proc)}
                        className={`text-left px-3 py-2 rounded-lg border transition-colors flex items-center justify-between ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{proc}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ISO 19011 Competence Fields */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Lineamientos de Competencia ISO 19011:2026
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Educación y Título Profesional</label>
                    <input
                      type="text"
                      value={formData.competence.education}
                      onChange={(e) => setFormData({
                        ...formData,
                        competence: { ...formData.competence, education: e.target.value }
                      })}
                      placeholder="Ej. Ing. Producción Gráfica / Diseñador Industrial"
                      className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Años de Experiencia en Auditorías</label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={formData.competence.auditExperienceYears}
                      onChange={(e) => setFormData({
                        ...formData,
                        competence: { ...formData.competence, auditExperienceYears: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Certifications checks */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.competence.iso19011Trained}
                      onChange={(e) => setFormData({
                        ...formData,
                        competence: { ...formData.competence, iso19011Trained: e.target.checked }
                      })}
                      className="rounded-sm text-indigo-600"
                    />
                    Formación formal en Directrices ISO 19011:2026
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.competence.iso9001Certified}
                      onChange={(e) => setFormData({
                        ...formData,
                        competence: { ...formData.competence, iso9001Certified: e.target.checked }
                      })}
                      className="rounded-sm text-indigo-600"
                    />
                    Certificado en Sistemas de Gestión ISO 9001:2015
                  </label>
                </div>

                {/* Technical Graphic Skills Tags */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Habilidades Técnicas Litográficas Específicas
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={trainingInput}
                      onChange={(e) => setTrainingInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTrainingTag();
                        }
                      }}
                      placeholder="Escribe una competencia y presiona Enter (ej. Colorimetría ISO 12647)"
                      className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addTrainingTag}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-700"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.competence.graphicTechnicalTraining.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded-sm text-[11px] text-slate-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTrainingTag(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* ISO Personal Attributes */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Atributos Personales Demostrados (ISO 19011 Numeral 7.2)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ISO_ATTRIBUTES.map((attr) => {
                      const selected = formData.competence.personalAttributes.includes(attr);
                      return (
                        <button
                          type="button"
                          key={attr}
                          onClick={() => toggleAttribute(attr)}
                          className={`text-left px-2.5 py-1.5 rounded-sm border text-[11px] transition-colors flex items-center justify-between ${
                            selected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{attr}</span>
                          {selected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cualificación y Comentarios del Auditor Líder
                  </label>
                  <textarea
                    rows={2}
                    value={formData.competence.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      competence: { ...formData.competence, notes: e.target.value }
                    })}
                    placeholder="Detalles sobre desempeño en auditorías anteriores, liderazgo o temas a fortalecer..."
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                {editingAuditor ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDel = editingAuditor;
                      setIsModalOpen(false);
                      setAuditorToDelete(toDel);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar este auditor</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    {editingAuditor ? 'Guardar Cambios' : 'Registrar Auditor'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {signatureModalAuditor && (
        <DigitalSignatureModal
          isOpen={!!signatureModalAuditor}
          onClose={() => setSignatureModalAuditor(null)}
          onSave={(dataUrl) => {
            const updated: Auditor = {
              ...signatureModalAuditor,
              signatureBase64: dataUrl
            };
            onSaveAuditor(updated);
            if (formData.id === signatureModalAuditor.id) {
              setFormData((prev) => ({ ...prev, signatureBase64: dataUrl }));
            }
            setSignatureModalAuditor(null);
          }}
          title={`Firma Digital de ${signatureModalAuditor.name}`}
          defaultSignatoryName={signatureModalAuditor.name}
          signatoryRole={signatureModalAuditor.role}
        />
      )}

      {/* Dynamic Deletion Confirmation Dialog with Data-Binding Explanation */}
      {auditorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  ¿Eliminar auditor del equipo?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Estás a punto de borrar a <strong className="text-slate-900 font-semibold">{auditorToDelete.name}</strong> ({auditorToDelete.role}).
                </p>

                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1.5">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    Actualización Automática en Cascada (Data Binding):
                  </span>
                  <p className="leading-snug">
                    Su registro se eliminará dinámicamente del estado y se desvinculará de todos los documentos oficiales donde aparezca (Programa FO-MCO-17, Plan FO-MCO-18, Lista de Chequeo FO-MCO-19, Actas FO-MCO-20/21 e Informe Final FO-MCO-22).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAuditorToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAuditor(auditorToDelete.id);
                  setAuditorToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar y Desvincular</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
