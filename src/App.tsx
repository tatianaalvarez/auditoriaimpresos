/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AuditSummaryDashboard } from './components/AuditSummaryDashboard';
import { AuditorsModule } from './components/AuditorsModule';
import { RiskMatrixModule } from './components/RiskMatrixModule';
import { ScheduleModule } from './components/ScheduleModule';
import { ProductionOrdersModule } from './components/ProductionOrdersModule';
import { OpeningActModule } from './components/OpeningActModule';
import { ChecklistModule } from './components/ChecklistModule';
import { AuditProgramModule } from './components/AuditProgramModule';
import { storageService } from './services/storageService';
import { dataBindingService } from './services/dataBindingService';
import { 
  AppAuditState, 
  Auditor, 
  RiskItem, 
  AuditScheduleItem, 
  ProductionOrderAudit, 
  OpeningAct, 
  ClosingAct, 
  FinalAuditReport,
  AuditProgram,
  AuditPlan,
  AuditChecklist
} from './types/audit';
import { Database, RefreshCw, Trash2, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [auditState, setAuditState] = useState<AppAuditState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    subMessage?: string;
    type: 'save' | 'cascade' | 'delete';
  } | null>(null);

  // Initialize data from IndexedDB / LocalStorage
  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await storageService.loadState();
        setAuditState(loaded);
      } catch (err) {
        console.error('Error al inicializar la base de datos de auditoría:', err);
        setAuditState(storageService.getState());
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerPersist = async (newState: AppAuditState) => {
    setAuditState(newState);
    await storageService.persistState(newState);
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
      setToastNotification(null);
    }, 4000);
  };

  // Program & Plan handlers
  const handleSaveProgram = (auditProgram: AuditProgram) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      auditProgram
    });
  };

  const handleSavePlan = (auditPlan: AuditPlan) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      auditPlan
    });
  };

  // Checklist handler
  const handleSaveChecklist = (checklist: AuditChecklist) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      checklist
    });
  };

  // Auditor handlers with Reactive Cascade Data Binding (ISO 19011:2026)
  const handleSaveAuditor = (auditor: Auditor) => {
    if (!auditState) return;
    const { newState, affectedDocsCount, docsUpdated } = dataBindingService.cascadeAuditorUpdate(auditState, auditor);

    if (affectedDocsCount > 0) {
      setToastNotification({
        type: 'cascade',
        message: `Actualización reactiva en cascada (Data Binding): "${auditor.name}"`,
        subMessage: `Sincronizado en tiempo real en: ${docsUpdated.join(' · ')}`
      });
    } else {
      setToastNotification({
        type: 'save',
        message: `Auditor "${auditor.name}" guardado exitosamente`,
        subMessage: 'Información registrada y persistida en LocalStorage e IndexedDB'
      });
    }

    triggerPersist(newState);
  };

  const handleDeleteAuditor = (id: string) => {
    if (!auditState) return;
    const { newState, deletedAuditorName, docsUpdated } = dataBindingService.cascadeAuditorDelete(auditState, id);

    setToastNotification({
      type: 'delete',
      message: `Auditor "${deletedAuditorName}" eliminado del equipo`,
      subMessage: docsUpdated.length > 0
        ? `Desvinculado automáticamente en cascada de: ${docsUpdated.join(' · ')}`
        : 'Registro eliminado dinámicamente del estado de la aplicación'
    });

    triggerPersist(newState);
  };

  // Risk handlers
  const handleSaveRisk = (risk: RiskItem) => {
    if (!auditState) return;
    const exists = auditState.risks.some(r => r.id === risk.id);
    const updatedRisks = exists
      ? auditState.risks.map(r => r.id === risk.id ? risk : r)
      : [...auditState.risks, risk];

    triggerPersist({
      ...auditState,
      risks: updatedRisks
    });
  };

  const handleDeleteRisk = (id: string) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      risks: auditState.risks.filter(r => r.id !== id)
    });
  };

  // Schedule handlers
  const handleSaveSchedule = (schedule: AuditScheduleItem) => {
    if (!auditState) return;
    const exists = auditState.schedules.some(s => s.id === schedule.id);
    const updatedSchedules = exists
      ? auditState.schedules.map(s => s.id === schedule.id ? schedule : s)
      : [...auditState.schedules, schedule];

    triggerPersist({
      ...auditState,
      schedules: updatedSchedules
    });
  };

  const handleDeleteSchedule = (id: string) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      schedules: auditState.schedules.filter(s => s.id !== id)
    });
  };

  // Production Order handlers
  const handleSaveOrder = (order: ProductionOrderAudit) => {
    if (!auditState) return;
    const exists = auditState.productionOrders.some(o => o.id === order.id);
    const updatedOrders = exists
      ? auditState.productionOrders.map(o => o.id === order.id ? order : o)
      : [...auditState.productionOrders, order];

    triggerPersist({
      ...auditState,
      productionOrders: updatedOrders
    });
  };

  const handleDeleteOrder = (id: string) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      productionOrders: auditState.productionOrders.filter(o => o.id !== id)
    });
  };

  // Acts & Reports handlers
  const handleSaveOpeningAct = (openingAct: OpeningAct) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      openingAct
    });
  };

  const handleSaveClosingAct = (closingAct: ClosingAct) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      closingAct
    });
  };

  const handleSaveFinalReport = (finalReport: FinalAuditReport) => {
    if (!auditState) return;
    triggerPersist({
      ...auditState,
      finalReport
    });
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ImpresosAlDia_Auditoria_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        const success = await storageService.importBackupJson(content);
        if (success) {
          setAuditState(storageService.getState());
          alert('Copia de respaldo restaurada exitosamente para Impresos al Día.');
        } else {
          alert('Error al procesar el archivo de respaldo. Verifica el formato JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = async () => {
    const defaultState = await storageService.resetToDefaults();
    setAuditState(defaultState);
    alert('Datos restaurados a los valores estándar de Impresos al Día.');
  };

  const handleQuickPrint = () => {
    if (activeModule !== 'checklist' && activeModule !== 'acts' && activeModule !== 'program') {
      setActiveModule('checklist');
      setTimeout(() => {
        window.print();
      }, 300);
    } else {
      window.print();
    }
  };

  if (isLoading || !auditState) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">Cargando Plataforma de Auditoría · Impresos al Día...</h2>
          <p className="text-xs text-slate-500">Sincronizando almacenamiento local e IndexedDB</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navigation
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onQuickPrint={handleQuickPrint}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeModule === 'dashboard' && (
          <AuditSummaryDashboard
            state={auditState}
            onNavigate={setActiveModule}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeModule === 'program' && (
          <AuditProgramModule
            auditProgram={auditState.auditProgram}
            auditPlan={auditState.auditPlan}
            auditors={auditState.auditors}
            onSaveProgram={handleSaveProgram}
            onSavePlan={handleSavePlan}
          />
        )}

        {activeModule === 'checklist' && (
          <ChecklistModule
            checklist={auditState.checklist}
            onSaveChecklist={handleSaveChecklist}
          />
        )}

        {activeModule === 'acts' && (
          <OpeningActModule
            openingAct={auditState.openingAct}
            closingAct={auditState.closingAct}
            finalReport={auditState.finalReport}
            auditors={auditState.auditors}
            onSaveOpeningAct={handleSaveOpeningAct}
            onSaveClosingAct={handleSaveClosingAct}
            onSaveFinalReport={handleSaveFinalReport}
          />
        )}

        {activeModule === 'orders' && (
          <ProductionOrdersModule
            orders={auditState.productionOrders}
            onSaveOrder={handleSaveOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeModule === 'risks' && (
          <RiskMatrixModule
            risks={auditState.risks}
            onSaveRisk={handleSaveRisk}
            onDeleteRisk={handleDeleteRisk}
          />
        )}

        {activeModule === 'schedule' && (
          <ScheduleModule
            schedules={auditState.schedules}
            auditors={auditState.auditors}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {activeModule === 'auditors' && (
          <AuditorsModule
            auditors={auditState.auditors}
            onSaveAuditor={handleSaveAuditor}
            onDeleteAuditor={handleDeleteAuditor}
          />
        )}
      </main>

      {/* Floating Save & Data Binding Notification */}
      {showSaveToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 text-xs max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200 no-print">
          {toastNotification?.type === 'cascade' ? (
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg mt-0.5 shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          ) : toastNotification?.type === 'delete' ? (
            <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg mt-0.5 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg mt-0.5 shrink-0">
              <Database className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="font-bold text-slate-100 block text-xs">
              {toastNotification?.message || 'Cambios guardados en LocalStorage e IndexedDB'}
            </span>
            <span className="text-[11px] text-slate-300 block mt-0.5 leading-snug">
              {toastNotification?.subMessage || 'Sincronización activa del Sistema de Gestión de Calidad · Impresos al Día'}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Impresos al Día</span>
            <span>·</span>
            <span>Auditoría al Operario de Prensa Litográfica (ISO 19011:2026 / ISO 9001:2015)</span>
          </div>
          <div>
            Persistencia activa (LocalStorage + IndexedDB) · Planta de Impresión Offset
          </div>
        </div>
      </footer>
    </div>
  );
}
