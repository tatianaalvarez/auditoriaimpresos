/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AuditorRole = 
  | 'Auditor Líder'
  | 'Auditor Técnico Especialista en Prensas'
  | 'Auditor Acompañante'
  | 'Auditor en Formación'
  | 'Experto Técnico'
  | 'Observador';

export type PressAuditCategory = 
  | 'Competencia e Inducción del Operario'
  | 'Alistamiento de Máquina y Mantillas'
  | 'Montaje e Inspección de Planchas CTP'
  | 'Control de Color CMYK y Tintas Pantone'
  | 'Registro y Calce Micrométrico'
  | 'Control de Desperdicios y Mermas'
  | 'Normas de Seguridad Industrial y EPP';

export type GraphicProcess = 
  | 'Alistamiento de Máquina'
  | 'Montaje de Planchas CTP'
  | 'Control de Color y Tintas'
  | 'Calce y Registro de Impresión'
  | 'Control de Mermas y Desperdicios'
  | 'Seguridad y Salud en Prensa'
  | 'Comercial y Cotizaciones'
  | 'Preimpresión y CTP'
  | 'Impresión Offset y Prensas'
  | 'Postprensa y Acabados'
  | 'Almacén de Sustratos y Tintas'
  | 'Aseguramiento de la Calidad';

export interface Iso19011Competence {
  education: string;
  graphicTechnicalTraining: string[];
  auditExperienceYears: number;
  iso9001Certified: boolean;
  iso19011Trained: boolean;
  personalAttributes: string[];
  competenceScore: number; // 0-100
  notes: string;
}

export interface Auditor {
  id: string;
  name: string;
  role: AuditorRole | string;
  jobTitle?: string; // Cargo o función técnica (ej: "Director de Calidad", "Especialista Técnico en Offset")
  email: string;
  phone: string;
  department: string;
  assignedProcesses: string[];
  competence: Iso19011Competence;
  signatureBase64?: string;
  active: boolean;
}

export type RiskLevel = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export interface RiskItem {
  id: string;
  code: string; // e.g., R-PRE-01
  process: string;
  description: string;
  frequency: number; // 1 to 5
  severity: number;  // 1 to 20
  fxs: number;       // frequency * severity
  riskLevel: RiskLevel;
  consequences: string;
  controls: string;
  responsible: string;
  status: 'Controlado' | 'En Mitigación' | 'Requiere Acción';
  lastReviewDate: string;
}

export type AuditStageStatus = 'Programada' | 'En Ejecución' | 'Completada' | 'Reprogramada';

export interface AuditScheduleItem {
  id: string;
  auditNumber: string; // e.g., AUD-01
  stageTitle: string;
  process: string;
  standardClause: string; // e.g., "ISO 9001:2015 8.5.1 / ISO 12647-2"
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  leadAuditorId: string;
  accompanyingAuditorIds: string[];
  auditeeResponsible: string;
  status: AuditStageStatus;
  executedDateTime?: string;
  deliverableNotes?: string;
}

export interface SubstrateSpec {
  paperType: string;
  basisWeightGsm: number;
  sheetSizeCm: string;
  grainDirection: 'Paralelo al eje de cilindro' | 'Perpendicular al eje de cilindro';
  caliperMicrons: number;
  moisturePercent: number;
  supplierBatch: string;
  verifiedGsmSample?: number;
}

export interface InkColorSpec {
  name: string;
  code: string;
  targetDensity: number;
  measuredDensity?: number;
  deltaE: number;
  viscositySec?: number;
}

export interface InksChemistrySpec {
  processType: 'Offset Cuatricromía (CMYK)' | 'CMYK + Tintas Directas Pantone' | 'Flexografía UV';
  colors: InkColorSpec[];
  fountainPh: number; // Rango 4.8 - 5.2
  fountainConductivityUs: number; // Rango 800 - 1500 uS/cm
  measuredPh?: number;
  measuredConductivity?: number;
}

export interface FinishesSpec {
  lamination: 'Térmico Mate' | 'Térmico Brillante' | 'Soft Touch' | 'Sin Laminado';
  spotUv: boolean;
  hotStamping: boolean;
  dieCutting: boolean;
  binding: 'Grapa a Caballete' | 'Cosido al Hilo y Pegado' | 'Encolado PUR' | 'Corte y Doblez';
  specialRequirements: string;
}

export interface AuditFinding {
  id: string;
  type: 'Fortaleza' | 'Observación' | 'No Conformidad Menor' | 'No Conformidad Mayor';
  clause: string;
  description: string;
  evidence: string;
  auditorName: string;
  date: string;
  status: 'Abierto' | 'Plan de Acción Solicitado' | 'Cerrado';
}

export interface ProductionOrderAudit {
  id: string;
  quoteNumber: string;
  clientName: string;
  jobTitle: string;
  pressOperatorName: string; // Operario de Prensa evaluado
  pressMachineId: string; // e.g., "Prensa Heidelberg Speedmaster SM 102-4"
  creationDate: string;
  targetDeliveryDate: string;
  runQuantity: number;
  sheetsPrinted: number;
  wasteAllowancePercent: number;
  actualWastePercent?: number;
  unitPrice: number;
  totalPrice: number;
  substrate: SubstrateSpec;
  inks: InksChemistrySpec;
  finishes: FinishesSpec;
  overallAuditStatus: 'Conforme' | 'Con Observaciones' | 'No Conforme' | 'En Verificación';
  findings: AuditFinding[];
  auditNotes: string;
  lastUpdated: string;
}

export interface Attendee {
  id: string;
  name: string;
  role: string;
  email?: string;
  signature?: string;
  confirmedAt?: string;
}

export interface OpeningActItem {
  hour: string;
  requirement: string;
  activity: string;
  auditee: string;
  auditor: string;
}

export interface OpeningAct {
  code: string; // "FO-MCO-20"
  version: string; // "02"
  approvalDate: string;
  page: string;
  editorResponsible?: string; // Nombre del editor o responsable de emisión/actualización
  auditYear: number;
  auditCycle: string;
  date: string;
  time: string;
  place: string;
  auditedProcess: string;
  targetJobTitle: string; // Cargo auditado: Operario de Prensa Litográfica
  objective: string;
  scope: string;
  methodology: string;
  attendees: Attendee[];
  agenda: OpeningActItem[];
  orderOfDay: string[];
  observations: string;
  leadAuditorName: string;
  leadAuditorJobTitle?: string;
  leadAuditorSignature?: string;
  auditeeLeaderName: string;
  auditeeLeaderJobTitle?: string;
  auditeeLeaderSignature?: string;
  status: 'Borrador' | 'Firmada y Cerrada';
}

export interface ReferenceDocument {
  name: string;
  code: string;
  version: string;
  clause: string;
}

export interface AuditPlan {
  code: string; // "FO-MCO-18"
  version: string;
  approvalDate: string;
  page: string;
  editorResponsible?: string; // Responsable que elabora o actualiza el documento
  auditCycle: string;
  auditNumber: string;
  auditedProcess: string;
  targetJob: string; // Operario de Prensa Litográfica
  leadAuditor: string;
  leadAuditorJobTitle?: string;
  accompanyingAuditors: string[];
  objective: string;
  scope: string;
  criteria: string;
  referenceDocuments: ReferenceDocument[];
  itinerary: Array<{
    activity: string;
    auditee: string;
    auditor: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
  }>;
  leadAuditorSignature?: string;
  auditeeLeaderName?: string;
  auditeeLeaderJobTitle?: string;
  auditeeLeaderSignature?: string;
}

export interface AuditProgramProcess {
  audNumber: string;
  process: string;
  standardClause: string;
  scheduledDateTime: string;
  executedDateTime: string;
  leadAuditor: string;
  accompanyingAuditor: string;
  status: 'Programada' | 'En Curso' | 'Ejecutada';
}

export interface AuditProgram {
  code: string; // "FO-MCO-17"
  version: string;
  approvalDate: string;
  page: string;
  editorResponsible?: string; // Responsable que elabora o actualiza el documento
  year: number;
  cycle: string;
  startDate: string;
  endDate: string;
  criteria: string;
  leadAuditor: string;
  leadAuditorJobTitle?: string;
  auditorTeam: string[];
  objective: string;
  scope: string;
  resources: string;
  processes: AuditProgramProcess[];
  observations: string;
  leadAuditorSignature?: string;
}

export interface ChecklistItem {
  id: string;
  itemNumber: number;
  category: PressAuditCategory;
  criterion: string; // e.g., "ISO 9001:2015 8.5.1 / F-OPE-04"
  aspectToVerify: string;
  isCompliant: boolean | null; // true: Conforme, false: No Conforme, null: Pendiente
  evidenceObservation: string;
  recommendation?: string;
}

export interface AuditChecklist {
  code: string; // "FO-MCO-19"
  version: string;
  approvalDate: string;
  page: string;
  editorResponsible?: string; // Responsable que elabora o actualiza el documento
  auditNumber: string;
  cycle: string;
  process: string;
  targetJob: string; // Operario de Prensa Litográfica
  leadAuditorName: string;
  leadAuditorJobTitle?: string;
  auditeeName: string; // e.g. Jorge Valderrama (Operario Principal)
  auditeeJobTitle?: string;
  pressMachine: string; // e.g. Heidelberg Speedmaster CD 102
  auditDate: string;
  items: ChecklistItem[];
  leadAuditorSignature?: string;
  operatorSignature?: string;
}

export interface CorrectiveActionPlan {
  id: string;
  nonConformityId: string;
  findingDescription: string;
  rootCauseAnalysis: string;
  correctiveAction: string;
  responsiblePerson: string;
  commitmentDeadline: string;
  verificationDate?: string;
  status: 'Pendiente' | 'En Implementación' | 'Eficaz y Cerrada';
}

export interface FinalReportFinding {
  id: string;
  finding: string;
  classification: 'OBS' | 'NC';
  breachedRequirement: string;
}

export interface FinalAuditReport {
  code: string; // "FO-MCO-22"
  version: string;
  approvalDate: string;
  editorResponsible?: string; // Responsable que elabora o actualiza el documento
  auditDate: string;
  auditedProcess: string;
  targetJob: string;
  objective: string;
  scope: string;
  criteria: string;
  auditorTeam: string[];
  leadAuditorName?: string;
  leadAuditorJobTitle?: string;
  interviewedPersonnel: string[];
  favorableAspects: string[];
  nonConformities: FinalReportFinding[];
  improvementOpportunities: { opportunity: string; standardClause: string }[];
  actionPlans: CorrectiveActionPlan[];
  conclusions: string;
  leadAuditorSignature?: string;
  auditeeLeaderName?: string;
  auditeeLeaderJobTitle?: string;
  auditeeLeaderSignature?: string;
}

export interface ClosingAct {
  code: string; // "FO-MCO-21"
  version: string;
  approvalDate: string;
  editorResponsible?: string; // Responsable que elabora o actualiza el documento
  date: string;
  time: string;
  place: string;
  auditedProcess: string;
  objective: string;
  scope: string;
  attendees: Attendee[];
  orderOfDay: string[];
  timeframeForActionPlanDays: number;
  actionPlanResponsible: string;
  observations: string;
  leadAuditorName?: string;
  leadAuditorJobTitle?: string;
  auditeeLeaderName?: string;
  auditeeLeaderJobTitle?: string;
  leadAuditorSignature?: string;
  auditeeLeaderSignature?: string;
  status: 'Borrador' | 'Firmada';
}

export interface AppAuditState {
  companyName: string; // "Impresos al Día"
  auditors: Auditor[];
  risks: RiskItem[];
  schedules: AuditScheduleItem[];
  productionOrders: ProductionOrderAudit[];
  auditProgram: AuditProgram;
  auditPlan: AuditPlan;
  openingAct: OpeningAct;
  checklist: AuditChecklist;
  closingAct: ClosingAct;
  finalReport: FinalAuditReport;
  lastPersisted: string;
}
