/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  Calendar, 
  Printer, 
  FileCheck2, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckSquare,
  ClipboardList
} from 'lucide-react';
import { AppAuditState } from '../types/audit';

interface AuditSummaryDashboardProps {
  state: AppAuditState;
  onNavigate: (module: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetDefaults: () => void;
}

export const AuditSummaryDashboard: React.FC<AuditSummaryDashboardProps> = ({
  state,
  onNavigate,
  onExportBackup,
  onImportBackup,
  onResetDefaults
}) => {
  const { auditors, risks, schedules, productionOrders, openingAct, checklist, auditProgram, finalReport } = state;

  const totalAuditors = auditors.length;
  const certifiedIso19011 = auditors.filter(a => a.competence.iso19011Trained).length;
  const avgAuditorCompetence = totalAuditors > 0
    ? (auditors.reduce((acc, a) => acc + a.competence.competenceScore, 0) / totalAuditors).toFixed(1)
    : '0';

  const totalRisks = risks.length;
  const highOrCriticalRisks = risks.filter(r => r.riskLevel === 'Alto' || r.riskLevel === 'Crítico').length;
  const controlledRisks = risks.filter(r => r.status === 'Controlado').length;

  const totalChecklistItems = checklist.items.length;
  const compliantItems = checklist.items.filter(i => i.isCompliant === true).length;
  const nonCompliantItems = checklist.items.filter(i => i.isCompliant === false).length;
  const checklistComplianceRate = totalChecklistItems > 0 
    ? Math.round((compliantItems / totalChecklistItems) * 100) 
    : 0;

  const totalOrders = productionOrders.length;
  const conformingOrders = productionOrders.filter(o => o.overallAuditStatus === 'Conforme').length;
  const orderCompliancePercent = totalOrders > 0 ? Math.round((conformingOrders / totalOrders) * 100) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Executive Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-7 relative overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>SISTEMA DE GESTIÓN ISO 19011:2026 & ISO 9001:2015</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Impresos al Día · Auditoría a Prensas
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Plataforma especializada en la evaluación operativa del <strong>Operario de Prensa Litográfica</strong>: alistamiento de máquina, montaje de planchas CTP, control espectrofotométrico de color CMYK/Pantone, registro micrométrico, gestión de mermas y seguridad industrial.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span>Empresa: <strong className="text-white">Impresos al Día</strong></span>
              <span>·</span>
              <span>Prensista Evaluado: <strong className="text-indigo-300">{checklist.auditeeName}</strong></span>
              <span>·</span>
              <span>Máquina: <strong className="text-slate-200">{checklist.pressMachine}</strong></span>
            </div>
          </div>

          {/* Quick Data Management Controls */}
          <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-xl border border-slate-700 space-y-2.5 shrink-0 text-xs">
            <span className="font-semibold text-slate-200 block text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Persistencia de Datos
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar JSON
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Restablecer todos los datos del sistema a los valores de Impresos al Día?')) {
                  onResetDefaults();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer pt-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer datos originales
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Checklist Score */}
        <div
          onClick={() => onNavigate('checklist')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Lista de Chequeo Operario</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{checklistComplianceRate}%</span>
            <span className="text-xs text-slate-500">conformidad técnica</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{compliantItems} conformes · {nonCompliantItems} NC</span>
            <strong className="text-emerald-700 font-mono">FO-MCO-19</strong>
          </div>
        </div>

        {/* KPI 2: Production Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Órdenes Evaluadas</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalOrders}</span>
            <span className="text-xs text-slate-500">OPs en prensa</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Control de color y mermas</span>
            <strong className="text-indigo-600 font-mono">{orderCompliancePercent}% aprobado</strong>
          </div>
        </div>

        {/* KPI 3: Risks */}
        <div
          onClick={() => onNavigate('risks')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Riesgos en Prensas</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalRisks}</span>
            <span className="text-xs text-slate-500">mitigados</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Alistamiento y Seguridad</span>
            <strong className="text-emerald-600 font-mono">{controlledRisks} controlados</strong>
          </div>
        </div>

        {/* KPI 4: Document Suite ISO */}
        <div
          onClick={() => onNavigate('program')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Documentación ISO 19011</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">100%</span>
            <span className="text-xs text-slate-500">habilitado</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Programa, Plan, Actas, Informe</span>
            <strong className="text-blue-700 font-mono">5 Formatos</strong>
          </div>
        </div>
      </div>

      {/* Grid: Press Operator Technical Competencies & Regulatory Documents Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Press Operator Evaluation Areas */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Áreas de Evaluación Técnica al Operario de Prensa
            </h3>
            <span className="text-xs text-slate-400 font-mono">Heidelberg CD 102</span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Alistamiento de Máquina y Mantillas',
                standard: 'ISO 9001 8.5.1 / PO-PRE-03',
                desc: 'Limpieza de cilindros, tensado de cauchos a 45 Nm con torquímetro, solución de fuente pH 4.8-5.2.',
                status: 'Evaluado Conforme'
              },
              {
                title: 'Montaje e Inspección de Planchas CTP',
                standard: 'ISO 9001 8.5.2',
                desc: 'Comprobación de pines de registro, mordazas Autoplate y verificación visual de rayas o velado.',
                status: 'Evaluado Conforme'
              },
              {
                title: 'Control de Color CMYK y Tintas Pantone',
                standard: 'ISO 12647-2 / 7.1.5',
                desc: 'Densitometría espectral X-Rite, tiras FOGRA, delta E ≤ 2.0 y visto bueno en pliego testigo.',
                status: '1 NC Menor (Viscosidad)'
              },
              {
                title: 'Registro y Calce Micrométrico',
                standard: 'Manual Heidelberg',
                desc: 'Verificación con cuentahílos 15x de crucetas en esquinas, tolerancia ±0.05 mm y calce tiro-retiro.',
                status: 'Evaluado Conforme'
              },
              {
                title: 'Control de Desperdicios y Mermas',
                standard: 'ISO 9001 8.5.4',
                desc: 'Aislamiento inmediato de pliegos maculatura con banderillas rojas y conteo neto en consola.',
                status: '1 NC Menor (Justificación)'
              },
              {
                title: 'Normas de Seguridad Industrial y EPP',
                standard: 'ISO 45001 / SST',
                desc: 'Uso obligatorio de protección auditiva, botas dieléctricas, ropa ajustada y prueba de paro de emergencia.',
                status: 'Evaluado Conforme'
              }
            ].map((area, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{area.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">· {area.standard}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {area.desc}
                  </p>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm shrink-0 border ${
                  area.status.includes('NC')
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {area.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Formal ISO 19011 Documents Suite */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                Módulos Documentales Habilitados
              </h3>
              <span className="text-xs text-slate-400 font-mono">ISO 19011:2026</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* Programa */}
              <div 
                onClick={() => onNavigate('program')}
                className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Programa de Auditoría (FO-MCO-17)</span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm">
                    Gestión Macro
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {auditProgram.processes.length} etapas programadas · Criterios ISO 9001:2015
                </div>
              </div>

              {/* Plan y Acta */}
              <div 
                onClick={() => onNavigate('acts')}
                className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Acta de Apertura (FO-MCO-20)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                    {openingAct.status}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {openingAct.attendees.length} asistentes · Rúbrica: {openingAct.leadAuditorSignature ? 'Firmada' : 'Pendiente'}
                </div>
              </div>

              {/* Lista Chequeo */}
              <div 
                onClick={() => onNavigate('checklist')}
                className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Lista de Chequeo al Prensista (FO-MCO-19)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                    {totalChecklistItems} Aspectos
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {checklistComplianceRate}% de cumplimiento · Verificación en máquina en tiempo real
                </div>
              </div>

              {/* Informe y Planes */}
              <div 
                onClick={() => onNavigate('acts')}
                className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Informe de Auditoría (FO-MCO-22)</span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                    2 Planes de Acción
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {finalReport.favorableAspects.length} fortalezas · {finalReport.nonConformities.length} no conformidades con causa raíz
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('checklist')}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              Abrir Lista de Chequeo
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('program')}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Ver Programa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
