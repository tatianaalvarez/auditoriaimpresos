/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppAuditState, Auditor } from '../types/audit';

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
  }
};
