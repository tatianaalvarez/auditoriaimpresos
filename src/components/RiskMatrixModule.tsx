/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Search, 
  CheckCircle,
  HelpCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { RiskItem, GraphicProcess, RiskLevel } from '../types/audit';

interface RiskMatrixModuleProps {
  risks: RiskItem[];
  onSaveRisk: (risk: RiskItem) => void;
  onDeleteRisk: (id: string) => void;
}

const GRAPHIC_PROCESSES: GraphicProcess[] = [
  'Comercial y Cotizaciones',
  'Preimpresión y CTP',
  'Impresión Offset y Prensas',
  'Postprensa y Acabados',
  'Almacén de Sustratos y Tintas',
  'Aseguramiento de la Calidad'
];

export const RiskMatrixModule: React.FC<RiskMatrixModuleProps> = ({
  risks,
  onSaveRisk,
  onDeleteRisk
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<RiskItem>({
    id: '',
    code: '',
    process: 'Impresión Offset y Prensas',
    description: '',
    frequency: 2,
    severity: 15,
    fxs: 30,
    riskLevel: 'Medio',
    consequences: '',
    controls: '',
    responsible: 'Supervisor de Planta',
    status: 'Controlado',
    lastReviewDate: new Date().toISOString().split('T')[0]
  });

  const calculateLevel = (fxs: number): RiskLevel => {
    if (fxs <= 15) return 'Bajo';
    if (fxs <= 30) return 'Medio';
    if (fxs <= 50) return 'Alto';
    return 'Crítico';
  };

  const handleFrequencyChange = (val: number) => {
    const fxs = val * formData.severity;
    setFormData({
      ...formData,
      frequency: val,
      fxs,
      riskLevel: calculateLevel(fxs)
    });
  };

  const handleSeverityChange = (val: number) => {
    const fxs = formData.frequency * val;
    setFormData({
      ...formData,
      severity: val,
      fxs,
      riskLevel: calculateLevel(fxs)
    });
  };

  const openCreateModal = () => {
    const nextCode = `R-LIT-${String(risks.length + 1).padStart(2, '0')}`;
    setFormData({
      id: `risk-${Date.now()}`,
      code: nextCode,
      process: 'Impresión Offset y Prensas',
      description: '',
      frequency: 2,
      severity: 15,
      fxs: 30,
      riskLevel: 'Medio',
      consequences: '',
      controls: '',
      responsible: 'Jefe de Calidad y Producción',
      status: 'Controlado',
      lastReviewDate: new Date().toISOString().split('T')[0]
    });
    setEditingRisk(null);
    setIsModalOpen(true);
  };

  const openEditModal = (risk: RiskItem) => {
    setFormData(JSON.parse(JSON.stringify(risk)));
    setEditingRisk(risk);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('Por favor especifica la descripción del riesgo.');
      return;
    }
    const fxs = formData.frequency * formData.severity;
    const finalRisk: RiskItem = {
      ...formData,
      fxs,
      riskLevel: calculateLevel(fxs)
    };
    onSaveRisk(finalRisk);
    setIsModalOpen(false);
  };

  // Filtered risks
  const filteredRisks = risks.filter(r => {
    const matchesSearch = 
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.controls.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.consequences.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProcess = processFilter === 'all' || r.process === processFilter;
    const matchesLevel = levelFilter === 'all' || r.riskLevel === levelFilter;
    return matchesSearch && matchesProcess && matchesLevel;
  });

  // Risk stats
  const totalCount = risks.length;
  const criticalCount = risks.filter(r => r.riskLevel === 'Crítico' || r.riskLevel === 'Alto').length;
  const controlledCount = risks.filter(r => r.status === 'Controlado').length;
  const avgFxs = totalCount > 0 ? (risks.reduce((acc, r) => acc + r.fxs, 0) / totalCount).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header and KPI strip */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Matriz de Gestión del Riesgo en Prensas · Impresos al Día</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Matriz de Riesgos del Operario de Prensa
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Identificación, evaluación FxS y controles para alistamiento de máquina, planchas CTP, colorimetría CMYK/Pantone, mermas y seguridad industrial.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Riesgo
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-500 block">Total Riesgos Evaluados</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalCount}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Nivel Alto / Crítico</span>
            <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">{criticalCount}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Controles Efectivos</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">{controlledCount}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Promedio Severidad (FxS)</span>
            <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">{avgFxs} / 100</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, consecuencias o control..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Procesos</option>
              {GRAPHIC_PROCESSES.map((proc) => (
                <option key={proc} value={proc}>{proc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Severidad:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Niveles</option>
              <option value="Bajo">Bajo (FxS ≤ 15)</option>
              <option value="Medio">Medio (FxS 16 - 30)</option>
              <option value="Alto">Alto (FxS 31 - 50)</option>
              <option value="Crítico">Crítico (FxS &gt; 50)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Risk Table conforming exactly to FO-MCO-17 Format */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Matriz de Riesgos y Controles Operacionales (Formato FO-MCO-17)</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredRisks.length} registros listados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">Código / Proceso</th>
                <th className="py-3 px-4 min-w-[200px]">Riesgo Identificado</th>
                <th className="py-3 px-2 text-center w-12" title="Frecuencia (1-5)">F</th>
                <th className="py-3 px-2 text-center w-12" title="Severidad (1-20)">S</th>
                <th className="py-3 px-3 text-center w-16" title="Frecuencia x Severidad">FxS</th>
                <th className="py-3 px-4 min-w-[240px]">Consecuencias si se Materializa</th>
                <th className="py-3 px-4 min-w-[260px]">Controles a Implementar</th>
                <th className="py-3 px-3 w-28">Estado / Responsable</th>
                <th className="py-3 px-3 text-right w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredRisks.map((risk) => {
                const badgeColor = 
                  risk.riskLevel === 'Crítico' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                  risk.riskLevel === 'Alto' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  risk.riskLevel === 'Medio' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                  'bg-emerald-50 text-emerald-900 border-emerald-200';

                return (
                  <tr key={risk.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Code & Process */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-bold text-slate-900 block">{risk.code}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{risk.process}</span>
                    </td>

                    {/* Risk Description */}
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-medium text-slate-800 leading-relaxed">{risk.description}</p>
                    </td>

                    {/* F */}
                    <td className="py-3.5 px-2 text-center align-top font-mono font-medium text-slate-700">
                      {risk.frequency}
                    </td>

                    {/* S */}
                    <td className="py-3.5 px-2 text-center align-top font-mono font-medium text-slate-700">
                      {risk.severity}
                    </td>

                    {/* FxS */}
                    <td className="py-3.5 px-3 text-center align-top">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-mono font-bold rounded-sm border ${badgeColor}`}>
                        {risk.fxs}
                      </span>
                      <span className="text-[9px] block text-slate-400 mt-0.5 font-sans">{risk.riskLevel}</span>
                    </td>

                    {/* Consequences */}
                    <td className="py-3.5 px-4 align-top text-slate-600 leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{risk.consequences}</span>
                      </div>
                    </td>

                    {/* Controls */}
                    <td className="py-3.5 px-4 align-top text-slate-700 leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{risk.controls}</span>
                      </div>
                    </td>

                    {/* Status & Responsible */}
                    <td className="py-3.5 px-3 align-top">
                      <span className="font-medium text-slate-800 block text-[11px]">{risk.status}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{risk.responsible}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(risk)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Editar riesgo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar el riesgo ${risk.code}?`)) {
                              onDeleteRisk(risk.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Eliminar riesgo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRisks.length === 0 && (
          <div className="text-center py-10">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No se encontraron riesgos con los filtros actuales.</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Risk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingRisk ? `Editar Riesgo ${formData.code}` : 'Nuevo Riesgo del Proceso Litográfico'}
                </h3>
                <p className="text-xs text-slate-500">Evaluación FxS y definición de controles operativos.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código del Riesgo *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ej. R-GRA-08"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proceso Litográfico</label>
                  <select
                    value={formData.process}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value as GraphicProcess })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {GRAPHIC_PROCESSES.map((proc) => (
                      <option key={proc} value={proc}>{proc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción del Evento de Riesgo *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. Descalce cromático en prensa por variación térmica de planchas o estiramiento de papel..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              {/* FxS Calculation Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  Valoración de Riesgo: Frecuencia (F) × Severidad (S) = FxS
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Frecuencia (1 - 5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.frequency}
                      onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">1: Rara vez · 5: Frecuente</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Severidad (1 - 20)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formData.severity}
                      onChange={(e) => handleSeverityChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">10: Leve · 20: Crítico</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Nivel Resultante (FxS)
                    </label>
                    <div className="h-8 px-2.5 flex items-center justify-between rounded-md border border-slate-300 bg-white font-mono font-bold">
                      <span>{formData.fxs}</span>
                      <span className="text-[10px] font-sans font-semibold text-slate-500">{formData.riskLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consecuencias en caso de Materializarse</label>
                <textarea
                  rows={2}
                  value={formData.consequences}
                  onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                  placeholder="Ej. Rechazo del tiraje por el cliente, retraso de entrega de 48 horas..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Controles a Implementar</label>
                <textarea
                  rows={2}
                  value={formData.controls}
                  onChange={(e) => setFormData({ ...formData, controls: e.target.value })}
                  placeholder="Ej. Uso obligatorio de espectrofotómetro cada 1000 pliegos y calibración semanal..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsable del Control</label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Ej. Prensista y Supervisor de Calidad"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de Mitigación</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Controlado">Controlado</option>
                    <option value="En Mitigación">En Mitigación</option>
                    <option value="Requiere Acción">Requiere Acción</option>
                  </select>
                </div>
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
                  Guardar Riesgo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
