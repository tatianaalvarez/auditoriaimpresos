/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AppAuditState, 
  Auditor, 
  AuditChecklist, 
  FinalAuditReport, 
  DetailedNonConformity, 
  FinalReportFinding, 
  CorrectiveActionPlan 
} from '../types/audit';

/**
 * Service to handle dynamic reactive data-binding and cascade updates
 * between the Auditors Module and all generated SGC ISO 19011:2026 documents.
 */
export const dataBindingService = {
  /**
   * Cascades changes of an auditor (name, jobTitle, role, signature) to all documents
   */
  cascadeAuditorUpdate(state: AppAuditState, updatedAuditor: Auditor): {
    newState: AppAuditState;
    affectedDocsCount: number;
    docsUpdated: string[];
  } {
    const prevAuditor = state.auditors.find(a => a.id === updatedAuditor.id);
    const oldName = prevAuditor ? prevAuditor.name.trim() : '';
    const newName = updatedAuditor.name.trim();
    const newJobTitle = updatedAuditor.jobTitle?.trim() || '';
    const newRole = updatedAuditor.role;
    const newSignature = updatedAuditor.signatureBase64;

    // 1. Update auditors array
    const exists = state.auditors.some(a => a.id === updatedAuditor.id);
    const updatedAuditors = exists
      ? state.auditors.map(a => a.id === updatedAuditor.id ? updatedAuditor : a)
      : [...state.auditors, updatedAuditor];

    const docsUpdated: string[] = [];

    // Helper to check match
    const isMatchingName = (targetName?: string) => {
      if (!targetName) return false;
      const t = targetName.toLowerCase().trim();
      return (oldName && t === oldName.toLowerCase()) || (newName && t === newName.toLowerCase());
    };

    // 2. Cascade to Audit Program (FO-MCO-17)
    let progUpdated = false;
    let newProg = { ...state.auditProgram };

    const isProgLeadMatch = isMatchingName(newProg.leadAuditor) || (newRole === 'Auditor Líder' && !newProg.leadAuditor);
    if (isProgLeadMatch) {
      newProg.leadAuditor = newName;
      if (newJobTitle) newProg.leadAuditorJobTitle = newJobTitle;
      if (newSignature) newProg.leadAuditorSignature = newSignature;
      progUpdated = true;
    }

    if (newProg.auditorTeam && Array.isArray(newProg.auditorTeam)) {
      const teamIdx = newProg.auditorTeam.findIndex(m => isMatchingName(m));
      if (teamIdx >= 0) {
        const nextTeam = [...newProg.auditorTeam];
        nextTeam[teamIdx] = newName;
        newProg.auditorTeam = nextTeam;
        progUpdated = true;
      }
    }

    if (newProg.processes && Array.isArray(newProg.processes)) {
      const nextProcs = newProg.processes.map(proc => {
        let changed = false;
        let lead = proc.leadAuditor;
        let acc = proc.accompanyingAuditor;
        if (isMatchingName(lead)) {
          lead = newName;
          changed = true;
        }
        if (isMatchingName(acc)) {
          acc = newName;
          changed = true;
        }
        if (changed) progUpdated = true;
        return changed ? { ...proc, leadAuditor: lead, accompanyingAuditor: acc } : proc;
      });
      if (progUpdated) newProg.processes = nextProcs;
    }

    if (progUpdated) docsUpdated.push('Programa de Auditoría (FO-MCO-17)');

    // 3. Cascade to Audit Plan (FO-MCO-18)
    let planUpdated = false;
    let newPlan = { ...state.auditPlan };

    const isPlanLeadMatch = isMatchingName(newPlan.leadAuditor) || (newRole === 'Auditor Líder' && !newPlan.leadAuditor);
    if (isPlanLeadMatch) {
      newPlan.leadAuditor = newName;
      if (newJobTitle) newPlan.leadAuditorJobTitle = newJobTitle;
      if (newSignature) newPlan.leadAuditorSignature = newSignature;
      planUpdated = true;
    }

    if (newPlan.accompanyingAuditors && Array.isArray(newPlan.accompanyingAuditors)) {
      const accIdx = newPlan.accompanyingAuditors.findIndex(m => isMatchingName(m));
      if (accIdx >= 0) {
        const nextAcc = [...newPlan.accompanyingAuditors];
        nextAcc[accIdx] = newName;
        newPlan.accompanyingAuditors = nextAcc;
        planUpdated = true;
      }
    }

    if (newPlan.itinerary && Array.isArray(newPlan.itinerary)) {
      const nextItin = newPlan.itinerary.map(item => {
        if (isMatchingName(item.auditor)) {
          planUpdated = true;
          return { ...item, auditor: newName };
        }
        return item;
      });
      if (planUpdated) newPlan.itinerary = nextItin;
    }

    if (planUpdated) docsUpdated.push('Plan de Auditoría (FO-MCO-18)');

    // 4. Cascade to Checklist (FO-MCO-19)
    let checklistUpdated = false;
    let newChecklist = { ...state.checklist };

    if (isMatchingName(newChecklist.leadAuditorName)) {
      newChecklist.leadAuditorName = newName;
      if (newJobTitle) newChecklist.leadAuditorJobTitle = newJobTitle;
      if (newSignature) newChecklist.leadAuditorSignature = newSignature;
      checklistUpdated = true;
      docsUpdated.push('Lista de Chequeo (FO-MCO-19)');
    }

    // 5. Cascade to Opening Act (FO-MCO-20)
    let actUpdated = false;
    let newAct = { ...state.openingAct };

    if (isMatchingName(newAct.leadAuditorName)) {
      newAct.leadAuditorName = newName;
      if (newJobTitle) newAct.leadAuditorJobTitle = newJobTitle;
      if (newSignature) newAct.leadAuditorSignature = newSignature;
      actUpdated = true;
    }

    if (newAct.attendees && Array.isArray(newAct.attendees)) {
      const nextAttendees = newAct.attendees.map(att => {
        if (att.id === updatedAuditor.id || isMatchingName(att.name)) {
          actUpdated = true;
          return {
            ...att,
            id: updatedAuditor.id,
            name: newName,
            role: `${newRole} · ${newJobTitle || updatedAuditor.department || 'Auditor'}`,
            signature: newSignature || att.signature
          };
        }
        return att;
      });
      if (actUpdated) newAct.attendees = nextAttendees;
    }

    if (newAct.agenda && Array.isArray(newAct.agenda)) {
      const nextAgenda = newAct.agenda.map(item => {
        if (isMatchingName(item.auditor)) {
          actUpdated = true;
          return { ...item, auditor: newName };
        }
        return item;
      });
      if (actUpdated) newAct.agenda = nextAgenda;
    }

    if (actUpdated) docsUpdated.push('Acta de Apertura (FO-MCO-20)');

    // 6. Cascade to Closing Act (FO-MCO-21)
    let closingUpdated = false;
    let newClosing = { ...state.closingAct };

    if (isMatchingName(newClosing.leadAuditorName)) {
      newClosing.leadAuditorName = newName;
      if (newJobTitle) newClosing.leadAuditorJobTitle = newJobTitle;
      if (newSignature) newClosing.leadAuditorSignature = newSignature;
      closingUpdated = true;
    }

    if (newClosing.attendees && Array.isArray(newClosing.attendees)) {
      const nextClosingAtt = newClosing.attendees.map(att => {
        if (att.id === updatedAuditor.id || isMatchingName(att.name)) {
          closingUpdated = true;
          return {
            ...att,
            id: updatedAuditor.id,
            name: newName,
            role: `${newRole} · ${newJobTitle || updatedAuditor.department || 'Auditor'}`,
            signature: newSignature || att.signature
          };
        }
        return att;
      });
      if (closingUpdated) newClosing.attendees = nextClosingAtt;
    }

    if (closingUpdated) docsUpdated.push('Acta de Cierre (FO-MCO-21)');

    // 7. Cascade to Final Report (FO-MCO-22)
    let reportUpdated = false;
    let newReport = { ...state.finalReport };

    if (isMatchingName(newReport.leadAuditorName)) {
      newReport.leadAuditorName = newName;
      if (newJobTitle) newReport.leadAuditorJobTitle = newJobTitle;
      if (newSignature) newReport.leadAuditorSignature = newSignature;
      reportUpdated = true;
    }

    if (newReport.auditorTeam && Array.isArray(newReport.auditorTeam)) {
      const repTeamIdx = newReport.auditorTeam.findIndex(m => isMatchingName(m));
      if (repTeamIdx >= 0) {
        const nextRepTeam = [...newReport.auditorTeam];
        nextRepTeam[repTeamIdx] = newName;
        newReport.auditorTeam = nextRepTeam;
        reportUpdated = true;
      }
    }

    if (reportUpdated) docsUpdated.push('Informe Final de Auditoría (FO-MCO-22)');

    const newState: AppAuditState = {
      ...state,
      auditors: updatedAuditors,
      auditProgram: newProg,
      auditPlan: newPlan,
      checklist: newChecklist,
      openingAct: newAct,
      closingAct: newClosing,
      finalReport: newReport,
      lastPersisted: new Date().toISOString()
    };

    return {
      newState,
      affectedDocsCount: docsUpdated.length,
      docsUpdated
    };
  },

  /**
   * Cascades the deletion of an auditor from the system, cleanly unlinking them
   * from attendees, agendas, teams, and process assignments across all documents.
   */
  cascadeAuditorDelete(state: AppAuditState, auditorId: string): {
    newState: AppAuditState;
    deletedAuditorName: string;
    docsUpdated: string[];
  } {
    const target = state.auditors.find(a => a.id === auditorId);
    if (!target) {
      return {
        newState: state,
        deletedAuditorName: '',
        docsUpdated: []
      };
    }

    const delName = target.name.trim();
    const remainingAuditors = state.auditors.filter(a => a.id !== auditorId);
    const fallbackAuditor = remainingAuditors.find(a => a.role === 'Auditor Líder') || remainingAuditors[0];
    const fallbackName = fallbackAuditor ? fallbackAuditor.name : 'Por Asignar';
    const fallbackJob = fallbackAuditor?.jobTitle || '';
    const fallbackSig = fallbackAuditor?.signatureBase64 || '';

    const docsUpdated: string[] = [];

    const isMatch = (targetName?: string) => {
      if (!targetName) return false;
      return targetName.toLowerCase().trim() === delName.toLowerCase().trim();
    };

    // 1. Audit Program
    let progUpdated = false;
    let newProg = { ...state.auditProgram };

    if (isMatch(newProg.leadAuditor)) {
      newProg.leadAuditor = fallbackName;
      newProg.leadAuditorJobTitle = fallbackJob;
      newProg.leadAuditorSignature = fallbackSig;
      progUpdated = true;
    }

    if (newProg.auditorTeam) {
      const beforeLen = newProg.auditorTeam.length;
      newProg.auditorTeam = newProg.auditorTeam.filter(m => !isMatch(m));
      if (newProg.auditorTeam.length !== beforeLen) progUpdated = true;
    }

    if (newProg.processes) {
      newProg.processes = newProg.processes.map(proc => {
        let changed = false;
        let lead = proc.leadAuditor;
        let acc = proc.accompanyingAuditor;
        if (isMatch(lead)) {
          lead = fallbackName;
          changed = true;
        }
        if (isMatch(acc)) {
          acc = '';
          changed = true;
        }
        if (changed) progUpdated = true;
        return changed ? { ...proc, leadAuditor: lead, accompanyingAuditor: acc } : proc;
      });
    }

    if (progUpdated) docsUpdated.push('Programa de Auditoría (FO-MCO-17)');

    // 2. Audit Plan
    let planUpdated = false;
    let newPlan = { ...state.auditPlan };

    if (isMatch(newPlan.leadAuditor)) {
      newPlan.leadAuditor = fallbackName;
      newPlan.leadAuditorJobTitle = fallbackJob;
      newPlan.leadAuditorSignature = fallbackSig;
      planUpdated = true;
    }

    if (newPlan.accompanyingAuditors) {
      const beforeLen = newPlan.accompanyingAuditors.length;
      newPlan.accompanyingAuditors = newPlan.accompanyingAuditors.filter(m => !isMatch(m));
      if (newPlan.accompanyingAuditors.length !== beforeLen) planUpdated = true;
    }

    if (newPlan.itinerary) {
      newPlan.itinerary = newPlan.itinerary.map(item => {
        if (isMatch(item.auditor)) {
          planUpdated = true;
          return { ...item, auditor: fallbackName };
        }
        return item;
      });
    }

    if (planUpdated) docsUpdated.push('Plan de Auditoría (FO-MCO-18)');

    // 3. Checklist
    let checklistUpdated = false;
    let newChecklist = { ...state.checklist };

    if (isMatch(newChecklist.leadAuditorName)) {
      newChecklist.leadAuditorName = fallbackName;
      newChecklist.leadAuditorJobTitle = fallbackJob;
      newChecklist.leadAuditorSignature = fallbackSig;
      checklistUpdated = true;
      docsUpdated.push('Lista de Chequeo (FO-MCO-19)');
    }

    // 4. Opening Act
    let actUpdated = false;
    let newAct = { ...state.openingAct };

    if (isMatch(newAct.leadAuditorName)) {
      newAct.leadAuditorName = fallbackName;
      newAct.leadAuditorJobTitle = fallbackJob;
      newAct.leadAuditorSignature = fallbackSig;
      actUpdated = true;
    }

    if (newAct.attendees) {
      const beforeLen = newAct.attendees.length;
      newAct.attendees = newAct.attendees.filter(att => att.id !== auditorId && !isMatch(att.name));
      if (newAct.attendees.length !== beforeLen) actUpdated = true;
    }

    if (newAct.agenda) {
      newAct.agenda = newAct.agenda.map(item => {
        if (isMatch(item.auditor)) {
          actUpdated = true;
          return { ...item, auditor: fallbackName };
        }
        return item;
      });
    }

    if (actUpdated) docsUpdated.push('Acta de Apertura (FO-MCO-20)');

    // 5. Closing Act
    let closingUpdated = false;
    let newClosing = { ...state.closingAct };

    if (isMatch(newClosing.leadAuditorName)) {
      newClosing.leadAuditorName = fallbackName;
      newClosing.leadAuditorJobTitle = fallbackJob;
      newClosing.leadAuditorSignature = fallbackSig;
      closingUpdated = true;
    }

    if (newClosing.attendees) {
      const beforeLen = newClosing.attendees.length;
      newClosing.attendees = newClosing.attendees.filter(att => att.id !== auditorId && !isMatch(att.name));
      if (newClosing.attendees.length !== beforeLen) closingUpdated = true;
    }

    if (closingUpdated) docsUpdated.push('Acta de Cierre (FO-MCO-21)');

    // 6. Final Report
    let reportUpdated = false;
    let newReport = { ...state.finalReport };

    if (isMatch(newReport.leadAuditorName)) {
      newReport.leadAuditorName = fallbackName;
      newReport.leadAuditorJobTitle = fallbackJob;
      newReport.leadAuditorSignature = fallbackSig;
      reportUpdated = true;
    }

    if (newReport.auditorTeam) {
      const beforeLen = newReport.auditorTeam.length;
      newReport.auditorTeam = newReport.auditorTeam.filter(m => !isMatch(m));
      if (newReport.auditorTeam.length !== beforeLen) reportUpdated = true;
    }

    if (reportUpdated) docsUpdated.push('Informe Final de Auditoría (FO-MCO-22)');

    const newState: AppAuditState = {
      ...state,
      auditors: remainingAuditors,
      auditProgram: newProg,
      auditPlan: newPlan,
      checklist: newChecklist,
      openingAct: newAct,
      closingAct: newClosing,
      finalReport: newReport,
      lastPersisted: new Date().toISOString()
    };

    return {
      newState,
      deletedAuditorName: delName,
      docsUpdated
    };
  },

  /**
   * Conexión Lista de Chequeo e Informe Final:
   * Las no conformidades registradas con respuesta "No" en la lista de chequeo
   * fluyen y se alimentan automáticamente en el informe final de auditoría,
   * estructuradas con los 6 campos obligatorios + evidencias fotográficas.
   */
  syncChecklistToFinalReport(checklist: AuditChecklist, currentReport: FinalAuditReport): FinalAuditReport {
    const nonCompliantItems = checklist.items.filter(item => item.isCompliant === false);
    const existingDetailed = currentReport.detailedNonConformities || [];

    // Riesgos contextuales específicos para artes gráficas y prensa litográfica
    const getContextualRisk = (category: string, criterion: string) => {
      if (category.includes('Color') || criterion.includes('12647')) {
        return 'Variación tonal Delta E > 3.0 en pliegos impresos, desbalance agua-tinta, riesgo de rechazo por el cliente y sobreconsumo de tintas Pantone.';
      }
      if (category.includes('Planchas') || category.includes('CTP')) {
        return 'Rayado o velado de planchas en batería, descalce en tiraje, paradas prolongadas de prensa y desperdicio de sustrato litográfico.';
      }
      if (category.includes('Registro') || category.includes('Calce')) {
        return 'Fuera de registro micrométrico en cuatricromía (> 0.05 mm), pérdida de nitidez en tipografías y pliegos no conformes.';
      }
      if (category.includes('Desperdicios') || category.includes('Mermas')) {
        return 'Exceso de merma sobre el 5% presupuestado en orden de producción, sobrecosto operativo y retraso en fecha pactada de entrega.';
      }
      if (category.includes('Seguridad') || category.includes('EPP')) {
        return 'Riesgo inminente de atrapamiento en rodillos en movimiento, exposición a solventes orgánicos volátiles y sanción en SG-SST.';
      }
      return 'Riesgo de reproceso en taller de prensa, desviación de calidad en el producto terminado o demora en tiempos de entrega.';
    };

    // Acciones correctivas contextuales acordes a la norma ISO 19011 e ISO 9001
    const getContextualAction = (category: string, recommendation?: string) => {
      if (recommendation && recommendation.trim()) return recommendation.trim();
      if (category.includes('Color')) {
        return 'Detener tiraje, re-calibrar densidad con espectrofotómetro según ISO 12647-2 y ajustar porcentaje de alcohol isopropílico/fountain.';
      }
      if (category.includes('Planchas')) {
        return 'Inspeccionar mordazas de cilindro porta-planchas, regenerar plancha CTP no conforme y verificar paralelismo de pinzas.';
      }
      if (category.includes('Registro')) {
        return 'Ajustar calce micrométrico circunferencial y axial en consola central Heidelberg, registrar pliego testigo firmado.';
      }
      if (category.includes('Seguridad')) {
        return 'Suspender operación hasta que el operario cuente con el EPP obligatorio y activar guardas de seguridad en batería.';
      }
      return 'Implementar ajuste técnico correctivo inmediato, registrar en bitácora de prensa y efectuar segunda verificación con el auditor.';
    };

    // Mapear cada aspecto "No" a un hallazgo detallado
    const mappedDetailed: DetailedNonConformity[] = nonCompliantItems.map((item) => {
      const existing = existingDetailed.find(
        d => d.checklistItemId === item.id || d.id === `nc-${item.id}` || d.itemNumber === item.itemNumber
      );

      const detection = item.detectionDescription?.trim() || existing?.detectionDescription?.trim() ||
        (item.evidenceObservation?.trim()
          ? `Detectado en estación de prensa: ${item.evidenceObservation.trim()}`
          : `Durante la inspección técnica al puesto del operario en ${checklist.pressMachine}, se constató incumplimiento en: "${item.aspectToVerify}".`);

      const breached = item.breachedRequirement?.trim() || existing?.breachedRequirement?.trim() ||
        item.criterion || 'ISO 9001:2015 Numeral 8.5.1 / ISO 12647-2';

      const risk = item.processRisk?.trim() || existing?.processRisk?.trim() ||
        getContextualRisk(item.category, item.criterion);

      const action = item.proposedAction?.trim() || existing?.proposedAction?.trim() ||
        getContextualAction(item.category, item.recommendation);

      const responsible = item.responsiblePerson?.trim() || existing?.responsiblePerson?.trim() ||
        `${checklist.auditeeName} (${checklist.auditeeJobTitle || 'Operario de Prensa Litográfica'})`;

      const deadline = item.deadline?.trim() || existing?.deadline?.trim() || '2026-03-01';

      // Combinar fotos de la lista de chequeo con las añadidas directamente en el informe
      const combinedPhotos = [...(item.photos || [])];
      if (existing?.photos) {
        existing.photos.forEach(ep => {
          if (!combinedPhotos.some(cp => cp.id === ep.id)) {
            combinedPhotos.push(ep);
          }
        });
      }

      return {
        id: existing?.id || `nc-${item.id}`,
        checklistItemId: item.id,
        itemNumber: item.itemNumber,
        detectionDescription: detection,
        breachedRequirement: breached,
        processRisk: risk,
        proposedAction: action,
        responsiblePerson: responsible,
        deadline: deadline,
        classification: existing?.classification || 'NC',
        photos: combinedPhotos,
        status: existing?.status || 'Pendiente',
        category: item.category
      };
    });

    // Conservar hallazgos manuales que hayan sido creados directamente en el informe final
    const manualNCs = existingDetailed.filter(
      d => !d.checklistItemId && !nonCompliantItems.some(i => `nc-${i.id}` === d.id)
    );

    const allDetailed = [...mappedDetailed, ...manualNCs];

    // Sincronizar array de no conformidades estándar (FO-MCO-22)
    const syncedNonConformities: FinalReportFinding[] = allDetailed.map((d) => ({
      id: d.id,
      finding: d.detectionDescription,
      classification: (d.classification.startsWith('NC') || d.classification === 'NC') ? 'NC' : 'OBS',
      breachedRequirement: d.breachedRequirement
    }));

    // Sincronizar planes de acción correctiva estándar (FO-MCO-22)
    const syncedActionPlans: CorrectiveActionPlan[] = allDetailed.map((d, i) => ({
      id: `act-${d.id}`,
      nonConformityId: `NC-0${i + 1}`,
      findingDescription: d.detectionDescription,
      rootCauseAnalysis: `Desviación en puesto de prensa: ${d.processRisk}`,
      correctiveAction: d.proposedAction,
      responsiblePerson: d.responsiblePerson,
      commitmentDeadline: d.deadline,
      status: d.status
    }));

    // Asegurar que el operario evaluado figure en el personal entrevistado
    const interviewed = [...currentReport.interviewedPersonnel];
    const operatorLabel = `${checklist.auditeeName} (${checklist.auditeeJobTitle || 'Operario de Prensa'})`;
    if (!interviewed.some(p => p.toLowerCase().includes(checklist.auditeeName.toLowerCase().trim()))) {
      interviewed.push(operatorLabel);
    }

    return {
      ...currentReport,
      detailedNonConformities: allDetailed,
      nonConformities: syncedNonConformities,
      actionPlans: syncedActionPlans,
      interviewedPersonnel: interviewed,
      auditeeLeaderName: checklist.auditeeName,
      auditeeLeaderJobTitle: checklist.auditeeJobTitle,
      auditDate: checklist.auditDate || currentReport.auditDate
    };
  },

  /**
   * Sincronización Automática de Datos Generales:
   * Si se actualiza información del operario de prensa, fechas, máquina o ciclo en un módulo,
   * se refleja automáticamente en todas las actas y documentos del sistema.
   */
  cascadeGeneralAuditInfo(
    state: AppAuditState,
    updates: {
      auditeeName?: string;
      auditeeJobTitle?: string;
      pressMachine?: string;
      auditDate?: string;
      cycle?: string;
      code?: string;
      version?: string;
      approvalDate?: string;
      editorResponsible?: string;
    }
  ): {
    newState: AppAuditState;
    updatedDocs: string[];
  } {
    const updatedDocs: string[] = [];

    // 1. Checklist (FO-MCO-19)
    let newChecklist = { ...state.checklist };
    if (updates.auditeeName) newChecklist.auditeeName = updates.auditeeName;
    if (updates.auditeeJobTitle) newChecklist.auditeeJobTitle = updates.auditeeJobTitle;
    if (updates.pressMachine) newChecklist.pressMachine = updates.pressMachine;
    if (updates.auditDate) newChecklist.auditDate = updates.auditDate;
    if (updates.cycle) newChecklist.cycle = updates.cycle;
    updatedDocs.push('Lista de Chequeo (FO-MCO-19)');

    // 2. Opening Act (FO-MCO-20)
    let newOpening = { ...state.openingAct };
    if (updates.auditeeName) newOpening.auditeeLeaderName = updates.auditeeName;
    if (updates.auditeeJobTitle) {
      newOpening.auditeeLeaderJobTitle = updates.auditeeJobTitle;
      newOpening.targetJobTitle = updates.auditeeJobTitle;
    }
    if (updates.auditDate) newOpening.date = updates.auditDate;
    if (updates.cycle) newOpening.auditCycle = updates.cycle;
    updatedDocs.push('Acta de Apertura (FO-MCO-20)');

    // 3. Closing Act (FO-MCO-21)
    let newClosing = { ...state.closingAct };
    if (updates.auditeeName) newClosing.auditeeLeaderName = updates.auditeeName;
    if (updates.auditeeJobTitle) newClosing.auditeeLeaderJobTitle = updates.auditeeJobTitle;
    if (updates.auditDate) newClosing.date = updates.auditDate;
    updatedDocs.push('Acta de Cierre (FO-MCO-21)');

    // 4. Audit Plan (FO-MCO-18)
    let newPlan = { ...state.auditPlan };
    if (updates.auditeeName) newPlan.auditeeLeaderName = updates.auditeeName;
    if (updates.auditeeJobTitle) {
      newPlan.auditeeLeaderJobTitle = updates.auditeeJobTitle;
      newPlan.targetJob = updates.auditeeJobTitle;
    }
    if (updates.cycle) newPlan.auditCycle = updates.cycle;
    updatedDocs.push('Plan de Auditoría (FO-MCO-18)');

    // 5. Audit Program (FO-MCO-17)
    let newProg = { ...state.auditProgram };
    if (updates.cycle) newProg.cycle = updates.cycle;
    updatedDocs.push('Programa de Auditoría (FO-MCO-17)');

    // 6. Final Report (FO-MCO-22)
    let newReport = { ...state.finalReport };
    if (updates.auditeeName) newReport.auditeeLeaderName = updates.auditeeName;
    if (updates.auditeeJobTitle) {
      newReport.auditeeLeaderJobTitle = updates.auditeeJobTitle;
      newReport.targetJob = updates.auditeeJobTitle;
    }
    if (updates.auditDate) newReport.auditDate = updates.auditDate;
    updatedDocs.push('Informe Final (FO-MCO-22)');

    // 7. Production Orders
    let newOrders = state.productionOrders.map(order => {
      let changed = false;
      let opName = order.pressOperatorName;
      let mach = order.pressMachineId;
      if (updates.auditeeName && opName) {
        opName = updates.auditeeName;
        changed = true;
      }
      if (updates.pressMachine && mach) {
        mach = updates.pressMachine;
        changed = true;
      }
      return changed ? { ...order, pressOperatorName: opName, pressMachineId: mach } : order;
    });

    // Also auto-sync non-conformities from checklist to final report
    newReport = this.syncChecklistToFinalReport(newChecklist, newReport);

    const newState: AppAuditState = {
      ...state,
      checklist: newChecklist,
      openingAct: newOpening,
      closingAct: newClosing,
      auditPlan: newPlan,
      auditProgram: newProg,
      finalReport: newReport,
      productionOrders: newOrders,
      lastPersisted: new Date().toISOString()
    };

    return { newState, updatedDocs };
  }
};
