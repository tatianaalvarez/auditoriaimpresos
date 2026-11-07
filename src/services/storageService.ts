/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
} from '../types/audit';

const DB_NAME = 'ImpresosAlDiaStorageDB';
const DB_VERSION = 2;
const STORE_NAME = 'audit_state';
const LOCAL_STORAGE_KEY = 'impresos_al_dia_audit_state_v2';

export const INITIAL_AUDITORS: Auditor[] = [
  {
    id: 'aud-01',
    name: 'Ing. Noralba Castaño Puerta',
    role: 'Auditor Líder',
    jobTitle: 'Directora de Aseguramiento de Calidad y Procesos',
    email: 'noralba.castano@impresosaldia.com',
    phone: '+57 312 450 8921',
    department: 'Aseguramiento de Calidad & Procesos',
    assignedProcesses: ['Alistamiento de Máquina', 'Seguridad y Salud en Prensa'],
    competence: {
      education: 'Ingeniería Industrial con Especialización en Sistemas de Gestión ISO 9001:2015',
      graphicTechnicalTraining: ['Directrices de Auditoría ISO 19011:2026', 'Auditoría a Puestos de Trabajo Operativos', 'Seguridad en Maquinaria Rotativa Industrial'],
      auditExperienceYears: 12,
      iso9001Certified: true,
      iso19011Trained: true,
      personalAttributes: ['Ético y objetivo', 'Mente abierta', 'Diplomático', 'Perceptivo y observador', 'Seguro de sí mismo'],
      competenceScore: 98,
      notes: 'Auditor Líder Certificado con amplia trayectoria en auditorías técnicas a naves de impresión offset y flexografía.'
    },
    signatureBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M15 45 Q 40 10, 70 35 T 120 20 T 170 40 T 210 25" stroke="%231e293b" stroke-width="2.5" fill="none"/><text x="20" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">N. Castaño - Lead Auditor</text></svg>',
    active: true
  },
  {
    id: 'aud-02',
    name: 'Carlos Eduardo Rivas M.',
    role: 'Auditor Técnico Especialista en Prensas',
    jobTitle: 'Especialista Técnico en Prensas y Colorimetría',
    email: 'carlos.rivas@impresosaldia.com',
    phone: '+57 315 882 1044',
    department: 'Ingeniería Técnica Litográfica',
    assignedProcesses: ['Control de Color y Tintas', 'Calce y Registro de Impresión', 'Montaje de Planchas CTP'],
    competence: {
      education: 'Ingeniería en Producción Gráfica / Prensista Master Heidelberg',
      graphicTechnicalTraining: ['Estandarización ISO 12647-2 en Offset de Pliego', 'Alineación de Batería de Rodillos y Mojadores', 'Densitometría y Colorimetría X-Rite SpectroEye'],
      auditExperienceYears: 9,
      iso9001Certified: true,
      iso19011Trained: true,
      personalAttributes: ['Metódico', 'Analítico en tolerancias micrométricas', 'Versátil ante descalces', 'Tenaz'],
      competenceScore: 96,
      notes: 'Experto en evaluación de competencias operativas para prensas Heidelberg Speedmaster 102 y Komori Lithrone.'
    },
    signatureBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M10 40 Q 30 15, 60 40 T 110 15 T 160 45 T 205 30" stroke="%231e293b" stroke-width="2" fill="none"/><text x="15" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">C. Rivas - Tech Auditor</text></svg>',
    active: true
  },
  {
    id: 'aud-03',
    name: 'Didier Rave Zuluaga',
    role: 'Auditor Técnico Especialista en Prensas',
    jobTitle: 'Jefe de Mantenimiento Mecánico y Prensas',
    email: 'didier.rave@impresosaldia.com',
    phone: '+57 301 773 2210',
    department: 'Mantenimiento & Producción',
    assignedProcesses: ['Alistamiento de Máquina', 'Control de Mermas y Desperdicios'],
    competence: {
      education: 'Tecnólogo en Mecánica Industrial y Artes Gráficas',
      graphicTechnicalTraining: ['Mantenimiento Autónomo de Prensas Offset', 'Inspección de Mantillas y Cilindros de Presión', 'Control Estadístico de Merma de Arranque'],
      auditExperienceYears: 7,
      iso9001Certified: true,
      iso19011Trained: true,
      personalAttributes: ['Riguroso', 'Observador de limpieza y orden 5S en prensa', 'Colaborativo'],
      competenceScore: 92,
      notes: 'Verifica el cumplimiento de calibración de cilindros y torque de mordazas portaplanchas.'
    },
    signatureBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M12 35 Q 45 5, 80 40 T 130 10 T 175 42" stroke="%231e293b" stroke-width="2" fill="none"/><text x="15" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">D. Rave - Press Specialist</text></svg>',
    active: true
  },
  {
    id: 'aud-04',
    name: 'Claudia Restrepo Ossa',
    role: 'Auditor Acompañante',
    jobTitle: 'Coordinadora de Costos, Mermas y Calidad',
    email: 'claudia.restrepo@impresosaldia.com',
    phone: '+57 318 633 4901',
    department: 'Gestión de Calidad y Procesos',
    assignedProcesses: ['Control de Mermas y Desperdicios', 'Comercial y Cotizaciones'],
    competence: {
      education: 'Administradora de Procesos de Calidad',
      graphicTechnicalTraining: ['Auditorías de Control Operativo ISO 19011', 'Trazabilidad de Pliegos Maculatura vs Conteo ERP'],
      auditExperienceYears: 5,
      iso9001Certified: true,
      iso19011Trained: true,
      personalAttributes: ['Precisa en datos numéricos', 'Diplomática', 'Sistemática'],
      competenceScore: 89,
      notes: 'Monitorea el registro en tiempo real de mermas de arranque y desperdicios de tiro en la terminal de máquina.'
    },
    signatureBase64: '',
    active: true
  },
  {
    id: 'aud-05',
    name: 'Jenith Montoya García',
    role: 'Auditor Acompañante',
    jobTitle: 'Química Industrial / Analista de Tintas y Sustratos',
    email: 'jenith.montoya@impresosaldia.com',
    phone: '+57 311 902 3348',
    department: 'Laboratorio de Tintas & Sustratos',
    assignedProcesses: ['Control de Color y Tintas', 'Seguridad y Salud en Prensa'],
    competence: {
      education: 'Lic. Química Industrial',
      graphicTechnicalTraining: ['Monitoreo Físico-Químico de Solución de Fuente', 'Fichas de Seguridad SDS y Solventes de Lavado'],
      auditExperienceYears: 4,
      iso9001Certified: true,
      iso19011Trained: true,
      personalAttributes: ['Detallista', 'Orientada a la evidencia analítica', 'Objetiva'],
      competenceScore: 88,
      notes: 'Verifica la manipulación segura de aditivos, control de conductividad y uso de EPP por parte del prensista.'
    },
    signatureBase64: '',
    active: true
  }
];

export const INITIAL_RISKS: RiskItem[] = [
  {
    id: 'risk-01',
    code: 'R-PRE-01',
    process: 'Alistamiento de Máquina',
    description: 'Omisión en el torqueo o ajuste de mantillas (cauchos) y falta de calibración en la presión entre cilindro porta-mantilla y cilindro impresor.',
    frequency: 2,
    severity: 18,
    fxs: 36,
    riskLevel: 'Alto',
    consequences: 'Impresión con ganancia de punto excesiva, empastado de tramas, rotura de mantilla por sobrepresión y paradas no programadas de prensa (2 a 4 horas).',
    controls: 'Uso obligatorio de torquímetro calibrado para tensado de mantilla y comprobación con tira de presión (Kiss-print) antes de iniciar el tiro.',
    responsible: 'Operario de Prensa Litográfica y Supervisor de Turno',
    status: 'Controlado',
    lastReviewDate: '2026-10-24'
  },
  {
    id: 'risk-02',
    code: 'R-PRE-02',
    process: 'Montaje de Planchas CTP',
    description: 'Montaje de plancha térmica CTP con suciedad en mordazas, desalineación en el pin-register o presencia de rayas en la superficie emulsionada.',
    frequency: 3,
    severity: 16,
    fxs: 48,
    riskLevel: 'Alto',
    consequences: 'Falta de calce entre colores, rayado permanente en el tiro que obliga a re-quemar planchas en CTP y merma de 500 pliegos de papel esmaltado.',
    controls: 'Inspección visual obligatoria de la plancha a contra-luz por parte del prensista, limpieza previa de mordazas y encaje exacto en pivotes guía.',
    responsible: 'Operario de Prensa Litográfica',
    status: 'Controlado',
    lastReviewDate: '2026-10-26'
  },
  {
    id: 'risk-03',
    code: 'R-PRE-03',
    process: 'Control de Color y Tintas',
    description: 'Ajuste manual de tinteros sin comprobación densitométrica periódica contra la tira de control FOGRA / ISO 12647-2.',
    frequency: 3,
    severity: 15,
    fxs: 45,
    riskLevel: 'Alto',
    consequences: 'Desviación de color cromático Delta E > 2.5 en el transcurso del tiraje, reclamo del cliente y rechazo total de 20.000 pliegos de catálogo.',
    controls: 'Toma de lectura con espectrofotómetro cada 1.000 pliegos y firma del visto bueno en pliego testigo guardado en mesa de control.',
    responsible: 'Operario de Prensa Litográfica',
    status: 'Controlado',
    lastReviewDate: '2026-10-28'
  },
  {
    id: 'risk-04',
    code: 'R-PRE-04',
    process: 'Calce y Registro de Impresión',
    description: 'Falta de comprobación micrométrica con cuentahílos del registro en esquinas y centro del pliego durante la velocidad nominal de tiro (12.000 pliegos/h).',
    frequency: 2,
    severity: 14,
    fxs: 28,
    riskLevel: 'Medio',
    consequences: 'Descalce de 0.2mm a 0.5mm visible en textos calados y sombras, efecto fantasma y retraso en estación de troquelado o guillotina.',
    controls: 'Verificación del pliego con cuentahílos 15x en las 4 esquinas al inicio de tiro y cada 2.000 pliegos con ajuste micrométrico remoto desde consola.',
    responsible: 'Operario de Prensa Litográfica',
    status: 'Controlado',
    lastReviewDate: '2026-10-29'
  },
  {
    id: 'risk-05',
    code: 'R-PRE-05',
    process: 'Control de Mermas y Desperdicios',
    description: 'Falta de separación y rotulación inmediata de pliegos maculatura de arranque, dejándolos mezclar con pliegos de tiro comercial aprobado en la pila de salida.',
    frequency: 2,
    severity: 17,
    fxs: 34,
    riskLevel: 'Alto',
    consequences: 'Paso de hojas defectuosas a la línea de plastificado y troquelado, generando cajas no conformes que llegan al cliente final.',
    controls: 'Uso de lengüetas divisorias plásticas de color rojo en pila de salida para aislar la maculatura y conteo digital estricto en consola de máquina.',
    responsible: 'Operario de Prensa Litográfica y Auxiliar de Máquina',
    status: 'Controlado',
    lastReviewDate: '2026-10-30'
  },
  {
    id: 'risk-06',
    code: 'R-PRE-06',
    process: 'Seguridad y Salud en Prensa',
    description: 'Operación o limpieza de batería de rodillos con prensa en marcha lenta sin utilizar la barra de parada de emergencia o portando joyas/ropa suelta.',
    frequency: 1,
    severity: 20,
    fxs: 20,
    riskLevel: 'Medio',
    consequences: 'Riesgo severo de atrapamiento mecánico en cilindros en rotación, amputación o lesiones incapacitantes; sanciones legales y suspensión de actividades.',
    controls: 'Protocolo de Bloqueo y Etiquetado (LOTO) en mantenimientos; verificación diaria del switch de paro de emergencia y uso obligatorio de ropa ajustada sin accesorios.',
    responsible: 'Operario de Prensa Litográfica y Coordinador de SST',
    status: 'Controlado',
    lastReviewDate: '2026-11-01'
  }
];

export const INITIAL_SCHEDULES: AuditScheduleItem[] = [
  {
    id: 'sch-01',
    auditNumber: 'AUD-OPE-01',
    stageTitle: 'Reunión de Apertura con el Equipo de Prensistas',
    process: 'Aseguramiento de Calidad',
    standardClause: 'ISO 19011:2026 Numeral 6.4.2 / FO-MCO-20',
    date: '2026-11-05',
    startTime: '07:30',
    endTime: '08:00',
    location: 'Consola Central de Prensa Heidelberg CD 102 - Nave de Impresión',
    leadAuditorId: 'aud-01',
    accompanyingAuditorIds: ['aud-02', 'aud-03', 'aud-04', 'aud-05'],
    auditeeResponsible: 'Jorge Valderrama (Operario Principal) y Mario Gómez (Prensista Turno 2)',
    status: 'Programada',
    deliverableNotes: 'Socialización del alcance de la auditoría al cargo de operario de prensa, confirmación de turnos y firma del acta de apertura.'
  },
  {
    id: 'sch-02',
    auditNumber: 'AUD-OPE-02',
    stageTitle: 'Auditoría en Sitio: Alistamiento de Máquina, Cilindros y Mantillas',
    process: 'Alistamiento de Máquina',
    standardClause: 'ISO 9001:2015 8.5.1 / Procedimiento PO-PRE-03',
    date: '2026-11-05',
    startTime: '08:15',
    endTime: '09:45',
    location: 'Prensa Heidelberg Speedmaster CD 102-4 Colores',
    leadAuditorId: 'aud-03',
    accompanyingAuditorIds: ['aud-02'],
    auditeeResponsible: 'Jorge Valderrama - Operario de Prensa Litográfica',
    status: 'Programada',
    deliverableNotes: 'Inspección del tensado de mantillas, lavado de cauchos, comprobación de rodillos mojadores y preparación de solución de fuente pH 4.8 - 5.2.'
  },
  {
    id: 'sch-03',
    auditNumber: 'AUD-OPE-03',
    stageTitle: 'Auditoría en Sitio: Montaje e Inspección de Planchas CTP',
    process: 'Montaje de Planchas CTP',
    standardClause: 'ISO 9001:2015 8.5.2 / Manual de Operación Heidelberg',
    date: '2026-11-05',
    startTime: '10:00',
    endTime: '11:15',
    location: 'Cilindros Portaplanchas de Prensa Heidelberg CD 102',
    leadAuditorId: 'aud-02',
    accompanyingAuditorIds: ['aud-03'],
    auditeeResponsible: 'Jorge Valderrama - Operario de Prensa Litográfica',
    status: 'Programada',
    deliverableNotes: 'Verificación del montaje de planchas térmicas CTP en mordazas Autoplate, encaje de pines guía y ausencia de rayaduras superficiales.'
  },
  {
    id: 'sch-04',
    auditNumber: 'AUD-OPE-04',
    stageTitle: 'Auditoría en Sitio: Control de Color CMYK/Pantone y Densitometría',
    process: 'Control de Color y Tintas',
    standardClause: 'ISO 12647-2:2013 / ISO 9001:2015 Numeral 7.1.5',
    date: '2026-11-05',
    startTime: '11:30',
    endTime: '13:00',
    location: 'Mesa de Inspección y Consola Prinect Press Center',
    leadAuditorId: 'aud-02',
    accompanyingAuditorIds: ['aud-05'],
    auditeeResponsible: 'Jorge Valderrama - Operario de Prensa Litográfica',
    status: 'Programada',
    deliverableNotes: 'Evaluación de mediciones con espectrofotómetro contra tira FOGRA, ajuste de tinteros por zona y visto bueno del pliego testigo.'
  },
  {
    id: 'sch-05',
    auditNumber: 'AUD-OPE-05',
    stageTitle: 'Auditoría en Sitio: Registro, Mermas y Normas de Seguridad EPP',
    process: 'Seguridad y Salud en Prensa',
    standardClause: 'ISO 9001:2015 8.5.4 & OHSAS/ISO 45001',
    date: '2026-11-05',
    startTime: '14:30',
    endTime: '16:00',
    location: 'Nave de Prensas Offset y Salida de Pliegos',
    leadAuditorId: 'aud-01',
    accompanyingAuditorIds: ['aud-04'],
    auditeeResponsible: 'Jorge Valderrama y Mario Gómez - Operarios de Prensa',
    status: 'Programada',
    deliverableNotes: 'Verificación de calce con cuentahílos, segregación de maculatura de arranque, uso de protección auditiva, botas y pruebas de parada de emergencia.'
  },
  {
    id: 'sch-06',
    auditNumber: 'AUD-OPE-06',
    stageTitle: 'Reunión de Cierre e Informe Preliminar al Prensista',
    process: 'Aseguramiento de Calidad',
    standardClause: 'ISO 19011:2026 Numeral 6.4.10 / FO-MCO-21',
    date: '2026-11-05',
    startTime: '16:30',
    endTime: '17:15',
    location: 'Oficina Técnica de Producción - Impresos al Día',
    leadAuditorId: 'aud-01',
    accompanyingAuditorIds: ['aud-02', 'aud-03', 'aud-04', 'aud-05'],
    auditeeResponsible: 'Operarios de Prensa y Jefe de Planta Litográfica',
    status: 'Programada',
    deliverableNotes: 'Presentación formal de fortalezas, observaciones y plan de acción correctivo derivado de la lista de chequeo.'
  }
];

export const INITIAL_ORDERS: ProductionOrderAudit[] = [
  {
    id: 'OP-2026-0842',
    quoteNumber: 'COT-2026-1194',
    clientName: 'Editorial & Publicaciones Andina S.A.',
    jobTitle: 'Catálogo Corporativo Anual 64 Páginas + Portada con Lomo',
    pressOperatorName: 'Jorge Valderrama (Prensista Titular)',
    pressMachineId: 'Prensa Heidelberg Speedmaster CD 102-4 Colores',
    creationDate: '2026-10-24',
    targetDeliveryDate: '2026-11-12',
    runQuantity: 25000,
    sheetsPrinted: 26250,
    wasteAllowancePercent: 5.0,
    actualWastePercent: 4.8,
    unitPrice: 4200,
    totalPrice: 105000000,
    substrate: {
      paperType: 'Propalcote C2S Esmaltado Brillante',
      basisWeightGsm: 150,
      sheetSizeCm: '70 x 100 cm',
      grainDirection: 'Paralelo al eje de cilindro',
      caliperMicrons: 145,
      moisturePercent: 52,
      supplierBatch: 'SMURFIT-LOTE-44910',
      verifiedGsmSample: 149.2
    },
    inks: {
      processType: 'Offset Cuatricromía (CMYK)',
      colors: [
        { name: 'Cyan Process', code: 'C', targetDensity: 1.45, measuredDensity: 1.44, deltaE: 1.2 },
        { name: 'Magenta Process', code: 'M', targetDensity: 1.40, measuredDensity: 1.42, deltaE: 1.4 },
        { name: 'Yellow Process', code: 'Y', targetDensity: 1.05, measuredDensity: 1.03, deltaE: 0.9 },
        { name: 'Black Process', code: 'K', targetDensity: 1.70, measuredDensity: 1.72, deltaE: 1.1 }
      ],
      fountainPh: 5.0,
      fountainConductivityUs: 1150,
      measuredPh: 5.1,
      measuredConductivity: 1180
    },
    finishes: {
      lamination: 'Térmico Mate',
      spotUv: true,
      hotStamping: false,
      dieCutting: false,
      binding: 'Cosido al Hilo y Pegado',
      specialRequirements: 'Portada con plastificado mate soft touch y barniz serigráfico UV a registro.'
    },
    overallAuditStatus: 'Conforme',
    findings: [
      {
        id: 'f-01',
        type: 'Fortaleza',
        clause: 'ISO 9001:2015 8.5.1',
        description: 'El operario mantiene pliego testigo firmado y archivado con control estricto de densitometría por zonas en la mesa Prinect.',
        evidence: 'Registro densitométrico cada 1.000 pliegos con delta E promedio < 1.3 verificado en consola.',
        auditorName: 'Carlos Eduardo Rivas M.',
        date: '2026-10-26',
        status: 'Cerrado'
      }
    ],
    auditNotes: 'Alistamiento de batería entintadora realizado en 28 minutos. Registro perfecto.',
    lastUpdated: '2026-10-31 16:20'
  },
  {
    id: 'OP-2026-0843',
    quoteNumber: 'COT-2026-1205',
    clientName: 'Laboratorios Dermocosméticos L\'Aura',
    jobTitle: 'Estuche Plegadiza Cosmética para Serum Antiedad con Ventana',
    pressOperatorName: 'Jorge Valderrama (Prensista Titular)',
    pressMachineId: 'Prensa Heidelberg Speedmaster CD 102-4 Colores',
    creationDate: '2026-10-26',
    targetDeliveryDate: '2026-11-15',
    runQuantity: 50000,
    sheetsPrinted: 54100,
    wasteAllowancePercent: 7.0,
    actualWastePercent: 8.2,
    unitPrice: 850,
    totalPrice: 42500000,
    substrate: {
      paperType: 'Cartulina Sulfatada SBS Blanca Reverso Blanco',
      basisWeightGsm: 300,
      sheetSizeCm: '65 x 90 cm',
      grainDirection: 'Perpendicular al eje de cilindro',
      caliperMicrons: 380,
      moisturePercent: 48,
      supplierBatch: 'CLARUS-SBS-2026-B',
      verifiedGsmSample: 304.5
    },
    inks: {
      processType: 'CMYK + Tintas Directas Pantone',
      colors: [
        { name: 'Cyan', code: 'C', targetDensity: 1.45, measuredDensity: 1.46, deltaE: 1.3 },
        { name: 'Magenta', code: 'M', targetDensity: 1.40, measuredDensity: 1.39, deltaE: 1.1 },
        { name: 'Yellow', code: 'Y', targetDensity: 1.05, measuredDensity: 1.06, deltaE: 0.8 },
        { name: 'Black', code: 'K', targetDensity: 1.70, measuredDensity: 1.68, deltaE: 1.0 },
        { name: 'Pantone 871 C (Oro Rico)', code: 'P871', targetDensity: 1.15, measuredDensity: 1.10, deltaE: 2.2 },
        { name: 'Pantone 186 C (Rojo Marca)', code: 'P186', targetDensity: 1.50, measuredDensity: 1.48, deltaE: 1.8 }
      ],
      fountainPh: 4.9,
      fountainConductivityUs: 1220,
      measuredPh: 4.9,
      measuredConductivity: 1240
    },
    finishes: {
      lamination: 'Soft Touch',
      spotUv: true,
      hotStamping: true,
      dieCutting: true,
      binding: 'Corte y Doblez',
      specialRequirements: 'Control riguroso de tono Pantone 871 C metalizado en cartulina pesada de 300g.'
    },
    overallAuditStatus: 'Con Observaciones',
    findings: [
      {
        id: 'f-02',
        type: 'Observación',
        clause: 'ISO 9001:2015 8.5.2',
        description: 'La merma de arranque superó en 1.2% el límite presupuestado debido a ajuste prolongado de calce en la tinta directa Pantone 871 C.',
        evidence: 'Registro en terminal de máquina arrojando 600 pliegos adicionales de maculatura.',
        auditorName: 'Didier Rave Zuluaga',
        date: '2026-10-29',
        status: 'Plan de Acción Solicitado'
      }
    ],
    auditNotes: 'Se recomendó al prensista precargar la curva de tintero en CIP3 desde preimpresión para reducir pliegos de arranque.',
    lastUpdated: '2026-11-02 09:45'
  },
  {
    id: 'OP-2026-0844',
    quoteNumber: 'COT-2026-1218',
    clientName: 'Revista Panorama & Arquitectura',
    jobTitle: 'Edición Bimestral 100 Páginas Interior + Carátula con Solapas',
    pressOperatorName: 'Mario Gómez (Prensista Turno 2)',
    pressMachineId: 'Prensa Heidelberg Speedmaster SM 74-4',
    creationDate: '2026-10-28',
    targetDeliveryDate: '2026-11-10',
    runQuantity: 12000,
    sheetsPrinted: 12550,
    wasteAllowancePercent: 5.0,
    actualWastePercent: 4.5,
    unitPrice: 5900,
    totalPrice: 70800000,
    substrate: {
      paperType: 'Papel Esmaltado Mate Couché',
      basisWeightGsm: 115,
      sheetSizeCm: '70 x 100 cm',
      grainDirection: 'Paralelo al eje de cilindro',
      caliperMicrons: 110,
      moisturePercent: 50,
      supplierBatch: 'UPM-COAT-901',
      verifiedGsmSample: 114.8
    },
    inks: {
      processType: 'Offset Cuatricromía (CMYK)',
      colors: [
        { name: 'Cyan', code: 'C', targetDensity: 1.45, measuredDensity: 1.45, deltaE: 1.0 },
        { name: 'Magenta', code: 'M', targetDensity: 1.40, measuredDensity: 1.41, deltaE: 1.2 },
        { name: 'Yellow', code: 'Y', targetDensity: 1.05, measuredDensity: 1.04, deltaE: 0.7 },
        { name: 'Black', code: 'K', targetDensity: 1.70, measuredDensity: 1.71, deltaE: 0.9 }
      ],
      fountainPh: 5.0,
      fountainConductivityUs: 1100,
      measuredPh: 5.0,
      measuredConductivity: 1120
    },
    finishes: {
      lamination: 'Térmico Mate',
      spotUv: true,
      hotStamping: false,
      dieCutting: false,
      binding: 'Encolado PUR',
      specialRequirements: 'Encuadernación PUR para resistir tiro y retiro con alto secado de tintas.'
    },
    overallAuditStatus: 'Conforme',
    findings: [],
    auditNotes: 'Planchas CTP montadas sin contratiempos. Registro micrométrico dentro de ±0.05 mm.',
    lastUpdated: '2026-11-03 14:10'
  }
];

export const INITIAL_PROGRAM: AuditProgram = {
  code: 'FO-MCO-17',
  version: '02',
  approvalDate: 'Febrero 14 de 2026',
  page: 'Página 1 de 2',
  editorResponsible: 'Ing. Noralba Castaño Puerta (Auditor Líder)',
  year: 2026,
  cycle: 'Ciclo 01 - Evaluación Operativa',
  startDate: '2026-11-05',
  endDate: '2026-11-05',
  criteria: 'NTC-ISO 9001:2015, Manual de Operación Prensas Heidelberg, Norma ISO 12647-2 y Protocolos OHSAS/ISO 45001',
  leadAuditor: 'Ing. Noralba Castaño Puerta',
  leadAuditorJobTitle: 'Directora de Aseguramiento de Calidad',
  auditorTeam: ['Carlos Eduardo Rivas M.', 'Didier Rave Zuluaga', 'Claudia Restrepo Ossa', 'Jenith Montoya García'],
  objective: 'Determinar la competencia, destreza y conformidad operativa del cargo de Operario de Prensa Litográfica en el alistamiento de máquina, montaje de planchas, control cromático CMYK/Pantone, calibración de registro, manejo de mermas y estricto apego a normas de seguridad y EPP.',
  scope: 'Puesto de trabajo del Operario de Prensa Litográfica (Prensistas Titulares y Auxiliares de Prensas Offset Heidelberg Speedmaster) de la planta de Impresos al Día.',
  resources: 'Nave de prensas, consola de control Prinect, espectrofotómetro calibrado X-Rite, cuentahílos 15x, densitómetro de transmisión, balanza de gramaje, fichas técnicas y EPP completo.',
  processes: [
    {
      audNumber: 'AUD-01',
      process: 'Reunión de Apertura con Operarios',
      standardClause: 'ISO 19011:2026 Numeral 6.4.2',
      scheduledDateTime: '05/11/2026 (07:30 - 08:00)',
      executedDateTime: '05/11/2026 (07:30 - 08:00)',
      leadAuditor: 'Noralba Castaño',
      accompanyingAuditor: 'Equipo Auditor',
      status: 'Programada'
    },
    {
      audNumber: 'AUD-02',
      process: 'Alistamiento de Máquina, Mantillas y Mojadores',
      standardClause: 'ISO 9001:2015 8.5.1 / PO-PRE-03',
      scheduledDateTime: '05/11/2026 (08:15 - 09:45)',
      executedDateTime: '05/11/2026 (08:15 - 09:45)',
      leadAuditor: 'Didier Rave',
      accompanyingAuditor: 'Carlos Rivas',
      status: 'Programada'
    },
    {
      audNumber: 'AUD-03',
      process: 'Montaje e Inspección de Planchas CTP',
      standardClause: 'ISO 9001:2015 8.5.2',
      scheduledDateTime: '05/11/2026 (10:00 - 11:15)',
      executedDateTime: '05/11/2026 (10:00 - 11:15)',
      leadAuditor: 'Carlos Rivas',
      accompanyingAuditor: 'Didier Rave',
      status: 'Programada'
    },
    {
      audNumber: 'AUD-04',
      process: 'Control de Color CMYK/Pantone y Densitometría',
      standardClause: 'ISO 12647-2 / ISO 9001:2015 7.1.5',
      scheduledDateTime: '05/11/2026 (11:30 - 13:00)',
      executedDateTime: '05/11/2026 (11:30 - 13:00)',
      leadAuditor: 'Carlos Rivas',
      accompanyingAuditor: 'Jenith Montoya',
      status: 'Programada'
    },
    {
      audNumber: 'AUD-05',
      process: 'Registro, Desperdicios y Seguridad EPP',
      standardClause: 'ISO 9001:2015 8.5.4 & ISO 45001',
      scheduledDateTime: '05/11/2026 (14:30 - 16:00)',
      executedDateTime: '05/11/2026 (14:30 - 16:00)',
      leadAuditor: 'Noralba Castaño',
      accompanyingAuditor: 'Claudia Restrepo',
      status: 'Programada'
    },
    {
      audNumber: 'AUD-06',
      process: 'Reunión de Cierre y Hallazgos',
      standardClause: 'ISO 19011:2026 Numeral 6.4.10',
      scheduledDateTime: '05/11/2026 (16:30 - 17:15)',
      executedDateTime: '05/11/2026 (16:30 - 17:15)',
      leadAuditor: 'Noralba Castaño',
      accompanyingAuditor: 'Equipo Auditor',
      status: 'Programada'
    }
  ],
  observations: 'La auditoría se ejecutará sin interrumpir la cadencia crítica de entrega de tirajes comprometidos del día.',
  leadAuditorSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M15 45 Q 40 10, 70 35 T 120 20 T 170 40 T 210 25" stroke="%231e293b" stroke-width="2.5" fill="none"/><text x="20" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">N. Castaño - Lead Auditor</text></svg>'
};

export const INITIAL_PLAN: AuditPlan = {
  code: 'FO-MCO-18',
  version: '01',
  approvalDate: 'Febrero 14 de 2026',
  page: 'Página 1 de 2',
  editorResponsible: 'Ing. Noralba Castaño Puerta (Auditor Líder)',
  auditCycle: 'Ciclo 01 - 2026',
  auditNumber: 'AUD-01',
  auditedProcess: 'Operación de Prensa Litográfica Offset',
  targetJob: 'Operario de Prensa Litográfica (Prensista)',
  leadAuditor: 'Ing. Noralba Castaño Puerta',
  leadAuditorJobTitle: 'Directora de Calidad y Procesos',
  accompanyingAuditors: ['Carlos Eduardo Rivas M.', 'Didier Rave Zuluaga', 'Claudia Restrepo Ossa', 'Jenith Montoya'],
  objective: 'Verificar y evaluar la competencia técnica del Operario de Prensa en Impresos al Día, asegurando el alistamiento correcto de prensas, calibración de presiones, control colorimétrico bajo norma ISO 12647-2 y mitigación del desperdicio de papel y tintas.',
  scope: 'Puesto de trabajo del prensista en Prensas Offset Heidelberg Speedmaster CD 102 y SM 74 de Impresos al Día.',
  criteria: 'NTC-ISO 9001:2015, Manual de Prensista Impresos al Día, Fichas Técnicas de Tintas y Sustratos, Normativa SST.',
  referenceDocuments: [
    { name: 'Procedimiento de Alistamiento y Operación de Prensas', code: 'PR-PRE-01', version: '03', clause: '8.5.1' },
    { name: 'Guía de Estandarización de Color y Densitometría', code: 'GU-COL-02', version: '02', clause: '7.1.5, 8.5.1' },
    { name: 'Instructivo de Manejo y Montaje de Planchas CTP', code: 'IN-CTP-04', version: '01', clause: '8.5.2' },
    { name: 'Manual de Seguridad Industrial y Uso de EPP en Prensa', code: 'MN-SST-05', version: '04', clause: '7.1.4' }
  ],
  itinerary: [
    { activity: 'Reunión de Apertura con el Prensista', auditee: 'Jorge Valderrama (Prensista)', auditor: 'Noralba Castaño Puerta', date: '05/11/2026', startTime: '07:30', endTime: '08:00', location: 'Consola Heidelberg CD 102' },
    { activity: 'Verificación de Alistamiento y Presión de Cilindros', auditee: 'Jorge Valderrama (Prensista)', auditor: 'Didier Rave Zuluaga', date: '05/11/2026', startTime: '08:15', endTime: '09:45', location: 'Cilindros de Impresión' },
    { activity: 'Inspección de Planchas CTP y Fijación en Mordazas', auditee: 'Jorge Valderrama (Prensista)', auditor: 'Carlos Eduardo Rivas', date: '05/11/2026', startTime: '10:00', endTime: '11:15', location: 'Cuerpo Impresor 1 al 4' },
    { activity: 'Control de Colorimetría CMYK, Pantones y Densitometría', auditee: 'Jorge Valderrama (Prensista)', auditor: 'Carlos Eduardo Rivas', date: '05/11/2026', startTime: '11:30', endTime: '13:00', location: 'Mesa de Visto Bueno' },
    { activity: 'Control de Calce, Mermas y Seguridad en el Puesto', auditee: 'Jorge Valderrama (Prensista)', auditor: 'Noralba Castaño / Jenith Montoya', date: '05/11/2026', startTime: '14:30', endTime: '16:00', location: 'Salida de Pila y Nave' },
    { activity: 'Reunión de Cierre y Retroalimentación al Prensista', auditee: 'Jorge Valderrama / Jefe Planta', auditor: 'Equipo Auditor Completo', date: '05/11/2026', startTime: '16:30', endTime: '17:15', location: 'Oficina Técnica' }
  ],
  leadAuditorSignature: '',
  auditeeLeaderName: 'Jorge Valderrama',
  auditeeLeaderJobTitle: 'Operario de Prensa Litográfica (Prensista)',
  auditeeLeaderSignature: ''
};

export const INITIAL_OPENING_ACT: OpeningAct = {
  code: 'FO-MCO-20',
  version: '02',
  approvalDate: 'Febrero 14 de 2026',
  page: 'Página 1 de 2',
  editorResponsible: 'Ing. Noralba Castaño Puerta (Auditor Líder)',
  auditYear: 2026,
  auditCycle: 'Ciclo 01 - Auditoría a Operario de Prensa',
  date: '2026-11-05',
  time: '07:30 a.m.',
  place: 'Consola de Mando Prensa Heidelberg CD 102 - Planta Impresos al Día',
  auditedProcess: 'Operación de Prensa Litográfica Offset',
  targetJobTitle: 'Operario de Prensa Litográfica (Prensista)',
  objective: 'Verificar y evaluar la conformidad de las actividades desarrolladas por el Operario de Prensa Litográfica frente a los requisitos de la norma ISO 9001:2015, procedimientos internos de alistamiento de máquina, calibración de planchas CTP, control espectrofotométrico de color, control de desperdicios y normas de seguridad industrial.',
  scope: 'Actividades de alistamiento, entintado, registro, tiro continuo, segregación de maculatura y seguridad ejecutadas por el operario de prensa en prensas offset Heidelberg de Impresos al Día.',
  methodology: 'Observación directa del proceso de arranque y corrida de tiro, entrevista técnica al prensista, verificación in situ de mediciones de densitometría, revisión del pliego testigo firmado y registro en lista de chequeo (FO-MCO-19).',
  attendees: [
    { id: 'att-1', name: 'Ing. Noralba Castaño Puerta', role: 'Auditor Líder ISO 19011:2026', email: 'noralba.castano@impresosaldia.com', confirmedAt: '2026-11-05 07:35' },
    { id: 'att-2', name: 'Carlos Eduardo Rivas M.', role: 'Auditor Técnico Especialista en Prensas', email: 'carlos.rivas@impresosaldia.com', confirmedAt: '2026-11-05 07:35' },
    { id: 'att-3', name: 'Didier Rave Zuluaga', role: 'Auditor Técnico de Maquinaria Gráfica', email: 'didier.rave@impresosaldia.com', confirmedAt: '2026-11-05 07:36' },
    { id: 'att-4', name: 'Jorge Valderrama', role: 'Operario de Prensa Litográfica (Prensista Auditado)', email: 'jorge.valderrama@impresosaldia.com', confirmedAt: '2026-11-05 07:38' },
    { id: 'att-5', name: 'Ing. Mauricio Henao Gómez', role: 'Jefe de Planta Litográfica Impresos al Día', email: 'mauricio.henao@impresosaldia.com', confirmedAt: '2026-11-05 07:40' }
  ],
  agenda: [
    { hour: '07:30 - 08:00', requirement: 'ISO 19011:2026 Num. 6.4.2', activity: 'Presentación del equipo auditor al prensista y confirmación del alcance', auditee: 'Jorge Valderrama (Prensista)', auditor: 'Ing. Noralba Castaño' },
    { hour: '08:15 - 09:45', requirement: 'ISO 9001:2015 8.5.1', activity: 'Evaluación del alistamiento de máquina, mantillas y solución de fuente', auditee: 'Jorge Valderrama', auditor: 'Didier Rave / Carlos Rivas' },
    { hour: '10:00 - 11:15', requirement: 'ISO 9001:2015 8.5.2', activity: 'Verificación de montaje de planchas térmicas CTP y mordazas', auditee: 'Jorge Valderrama', auditor: 'Carlos Eduardo Rivas' },
    { hour: '11:30 - 13:00', requirement: 'ISO 12647-2 / 7.1.5', activity: 'Control de densitometría CMYK, tiras FOGRA y ajuste de llaves de tintero', auditee: 'Jorge Valderrama', auditor: 'Carlos Eduardo Rivas' },
    { hour: '14:30 - 16:00', requirement: 'ISO 9001:2015 8.5.4 & ISO 45001', activity: 'Revisión de calce micrométrico, segregación de maculatura y EPP', auditee: 'Jorge Valderrama', auditor: 'Noralba Castaño / Jenith Montoya' },
    { hour: '16:30 - 17:15', requirement: 'ISO 19011:2026 Num. 6.4.10', activity: 'Reunión de Cierre y lectura de hallazgos con el prensista', auditee: 'Jorge Valderrama / Jefe Planta', auditor: 'Equipo Auditor Completo' }
  ],
  orderOfDay: [
    '1. Presentación de los miembros del equipo auditor y sus competencias técnicas en impresión offset bajo ISO 19011:2026.',
    '2. Confirmación del objetivo específico: evaluar la pericia técnica y cumplimiento normativo del Operario de Prensa Litográfica.',
    '3. Ratificación de los criterios de auditoría (Manual de Operación de Prensa, Estándar ISO 12647-2 y Orden de Producción OP-2026-0842).',
    '4. Definición del canal de comunicación directo con el prensista para la toma de muestras y pliegos testigo sin generar riesgos de atrapamiento.',
    '5. Confirmación de elementos de protección personal (protección auditiva, gafas y calzado con puntera) por parte del equipo auditor.',
    '6. Ratificación del horario fijado para la reunión de cierre en la consola de mando.'
  ],
  observations: 'El operario de prensa cuenta con su ficha técnica de producción abierta y la consola de la máquina en estado operativo nominal.',
  leadAuditorName: 'Ing. Noralba Castaño Puerta',
  leadAuditorJobTitle: 'Auditor Líder Certificado ISO 19011:2026',
  auditeeLeaderName: 'Jorge Valderrama',
  auditeeLeaderJobTitle: 'Operario de Prensa Litográfica (Prensista)',
  status: 'Borrador'
};

export const INITIAL_CHECKLIST: AuditChecklist = {
  code: 'FO-MCO-19',
  version: '01',
  approvalDate: 'Febrero 14 de 2026',
  page: 'Página 1 de 4',
  editorResponsible: 'Carlos Eduardo Rivas M. (Auditor Técnico)',
  auditNumber: 'AUD-OPE-01',
  cycle: 'Ciclo 01 - 2026',
  process: 'Operación de Prensa Litográfica Offset',
  targetJob: 'Operario de Prensa Litográfica (Prensista)',
  leadAuditorName: 'Carlos Eduardo Rivas M. / Noralba Castaño',
  leadAuditorJobTitle: 'Auditor Técnico Especialista en Prensas',
  auditeeName: 'Jorge Valderrama',
  auditeeJobTitle: 'Operario Titular Prensa Heidelberg CD 102',
  pressMachine: 'Heidelberg Speedmaster CD 102-4 Colores',
  auditDate: '2026-11-05',
  items: [
    // 1. Alistamiento de Máquina y Mantillas
    {
      id: 'chk-01',
      itemNumber: 1,
      category: 'Alistamiento de Máquina y Mantillas',
      criterion: 'ISO 9001:2015 8.5.1 / Procedimiento PO-PRE-03',
      aspectToVerify: '¿El operario realiza la inspección física y limpieza de los cilindros portamantilla y de contrapresión antes de iniciar el turno?',
      isCompliant: true,
      evidenceObservation: 'Se verifica que el prensista limpia residuos de tinta seca y polvo de papel en los 4 cuerpos impresores usando paño sin hilachas.',
      recommendation: 'Mantener la rutina de limpieza al cambio de turno.'
    },
    {
      id: 'chk-02',
      itemNumber: 2,
      category: 'Alistamiento de Máquina y Mantillas',
      criterion: 'ISO 9001:2015 7.1.3 / Manual Heidelberg',
      aspectToVerify: '¿El operario comprueba el tensado adecuado de las mantillas (cauchos) con torquímetro para evitar sobrepresión o arrugas?',
      isCompliant: true,
      evidenceObservation: 'Verificado tensado en cuerpo 1 y 2 con torquímetro a 45 Nm según especificación del fabricante.',
      recommendation: 'Calibrar semestralmente la llave dinamométrica.'
    },
    {
      id: 'chk-03',
      itemNumber: 3,
      category: 'Alistamiento de Máquina y Mantillas',
      criterion: 'ISO 9001:2015 8.5.1 / Control Químico',
      aspectToVerify: '¿El operario monitorea y registra el pH (4.8 - 5.2) y la conductividad (800 - 1500 µS/cm) del agua de mojado en la bitácora?',
      isCompliant: true,
      evidenceObservation: 'Lectura tomada en presencia del auditor: pH 5.05 y conductividad 1.180 µS/cm, registrada en formato de turno.',
      recommendation: 'Registrar la temperatura del agua de retorno (debe estar entre 10°C y 12°C).'
    },
    {
      id: 'chk-04',
      itemNumber: 4,
      category: 'Alistamiento de Máquina y Mantillas',
      criterion: 'ISO 9001:2015 8.5.1',
      aspectToVerify: '¿El operario verifica el ajuste y balance de presión de los rodillos mojadores y entintadores contra la plancha (franjas de contacto)?',
      isCompliant: true,
      evidenceObservation: 'Franja de entintado uniforme de 4 mm verificada en cuerpo cian y magenta.',
      recommendation: 'Documentar el cambio periódico de rodillos con desgaste.'
    },

    // 2. Montaje e Inspección de Planchas CTP
    {
      id: 'chk-05',
      itemNumber: 5,
      category: 'Montaje e Inspección de Planchas CTP',
      criterion: 'ISO 9001:2015 8.5.2 / Trazabilidad',
      aspectToVerify: '¿El operario verifica que las planchas térmicas CTP correspondan al número de Orden de Producción (OP), juego de colores (CMYK) y fecha?',
      isCompliant: true,
      evidenceObservation: 'Planchas con código OP-2026-0842 rotuladas con fecha y secuencia correcta C, M, Y, K.',
      recommendation: ''
    },
    {
      id: 'chk-06',
      itemNumber: 6,
      category: 'Montaje e Inspección de Planchas CTP',
      criterion: 'ISO 9001:2015 8.5.1 / Calidad Gráfica',
      aspectToVerify: '¿El operario examina visualmente la plancha antes de montarla en busca de rayas, dobladuras, motas de polvo o velado?',
      isCompliant: true,
      evidenceObservation: 'Operario descarta plancha cian por ligera raspadura y solicita re-filmación inmediata a CTP sin retrasar prensa.',
      recommendation: 'Registrar el motivo de re-filmación en el software de preprensa.'
    },
    {
      id: 'chk-07',
      itemNumber: 7,
      category: 'Montaje e Inspección de Planchas CTP',
      criterion: 'ISO 9001:2015 8.5.1 / Mecánica de Prensa',
      aspectToVerify: '¿El operario asegura el encaje exacto de la plancha en las mordazas del cilindro portaplanchas (sistema Autoplate / pin-register)?',
      isCompliant: true,
      evidenceObservation: 'Pines de registro acoplados con firmeza. Sin holguras laterales.',
      recommendation: ''
    },

    // 3. Control de Color CMYK y Tintas Pantone
    {
      id: 'chk-08',
      itemNumber: 8,
      category: 'Control de Color CMYK y Tintas Pantone',
      criterion: 'ISO 12647-2 / ISO 9001:2015 7.1.5',
      aspectToVerify: '¿El operario utiliza el espectrofotómetro/densitómetro calibrado para contrastar las densidades de la tira de control con los estándares?',
      isCompliant: true,
      evidenceObservation: 'Mediciones realizadas: Cyan 1.44 D, Magenta 1.42 D, Yellow 1.03 D, Black 1.72 D (todas dentro de tolerancia ±0.05 D).',
      recommendation: 'Limpiar el lente óptico del espectrofotómetro con alcohol isopropílico semanalmente.'
    },
    {
      id: 'chk-09',
      itemNumber: 9,
      category: 'Control de Color CMYK y Tintas Pantone',
      criterion: 'ISO 12647-2 Numeral 4.3.4',
      aspectToVerify: '¿La desviación de color Delta E (ΔE) frente a la prueba contractual aprobada por el cliente se mantiene en ΔE ≤ 2.0?',
      isCompliant: true,
      evidenceObservation: 'Reporte de la consola Prinect arroja ΔE promedio de 1.15 en los parches de escala de grises y secundarios.',
      recommendation: ''
    },
    {
      id: 'chk-10',
      itemNumber: 10,
      category: 'Control de Color CMYK y Tintas Pantone',
      criterion: 'ISO 9001:2015 8.5.1 / Tintas Especiales',
      aspectToVerify: '¿Para tintas directas Pantone, el operario verifica la formulación y tonalidad sobre el sustrato real antes de dar marcha al tiro?',
      isCompliant: false,
      evidenceObservation: 'En la OP-2026-0843 se inició el tiro preliminar de Pantone 871 C sin corroborar la viscosidad con copa Zahn.',
      recommendation: 'No Conformidad Menor: Estandarizar la medición de viscosidad previa para tintas metalizadas.'
    },
    {
      id: 'chk-11',
      itemNumber: 11,
      category: 'Control de Color CMYK y Tintas Pantone',
      criterion: 'ISO 9001:2015 8.5.1 / Aprobación',
      aspectToVerify: '¿El operario obtiene la firma de Visto Bueno (Vo.Bo.) del pliego testigo por parte del supervisor o cliente antes de autorizar el tiraje?',
      isCompliant: true,
      evidenceObservation: 'Pliego testigo con firma física del supervisor de calidad fechado a las 09:20 a.m. adherido en mesa de luz normalizada D50.',
      recommendation: ''
    },

    // 4. Registro y Calce Micrométrico
    {
      id: 'chk-12',
      itemNumber: 12,
      category: 'Registro y Calce Micrométrico',
      criterion: 'ISO 9001:2015 8.5.1 / Precisión Mecánica',
      aspectToVerify: '¿El operario utiliza cuentahílos de magnificación (10x a 20x) para verificar las crucetas de registro en centro y esquinas del pliego?',
      isCompliant: true,
      evidenceObservation: 'Cuentahílos 15x disponible en la mesa de control; verificación realizada a las 4 esquinas del formato 70x100 cm.',
      recommendation: ''
    },
    {
      id: 'chk-13',
      itemNumber: 13,
      category: 'Registro y Calce Micrométrico',
      criterion: 'ISO 9001:2015 8.5.1 / Tolerancias',
      aspectToVerify: '¿El registro de calce entre colores se mantiene dentro de la tolerancia estipulada de ±0.05 mm a ±0.1 mm a lo largo del tiro?',
      isCompliant: true,
      evidenceObservation: 'Comprobado calce en texto blanco calado sobre fondo negro 4 colores sin reborde visible.',
      recommendation: ''
    },
    {
      id: 'chk-14',
      itemNumber: 14,
      category: 'Registro y Calce Micrométrico',
      criterion: 'ISO 9001:2015 8.5.1 / Registro Tiro-Retiro',
      aspectToVerify: '¿El operario verifica el calce de cara y respaldo (tiro y retiro) garantizando la coincidencia con las líneas de corte y doblez?',
      isCompliant: true,
      evidenceObservation: 'Pliego doblado a contra-luz confirma coincidencia de cajas de texto dentro de ±0.5 mm para refile posterior.',
      recommendation: ''
    },

    // 5. Control de Desperdicios y Mermas
    {
      id: 'chk-15',
      itemNumber: 15,
      category: 'Control de Desperdicios y Mermas',
      criterion: 'ISO 9001:2015 8.5.4 / Preservación',
      aspectToVerify: '¿El operario separa inmediatamente los pliegos maculatura de arranque e inserta banderillas rojas para evitar mezclas en la pila?',
      isCompliant: true,
      evidenceObservation: 'Se observan banderillas rojas insertadas en los primeros 180 pliegos de arranque. Pila comercial limpia.',
      recommendation: ''
    },
    {
      id: 'chk-16',
      itemNumber: 16,
      category: 'Control de Desperdicios y Mermas',
      criterion: 'ISO 9001:2015 8.5.1 / Control de Cantidades',
      aspectToVerify: '¿El contador de pliegos de la consola es verificado para garantizar la entrega de la cantidad neta pactada más el porcentaje de merma?',
      isCompliant: true,
      evidenceObservation: 'Contador programado en 26.250 pliegos para garantizar entrega de 25.000 unidades netas al cliente.',
      recommendation: ''
    },
    {
      id: 'chk-17',
      itemNumber: 17,
      category: 'Control de Desperdicios y Mermas',
      criterion: 'ISO 9001:2015 8.5.2 / Merma Excesiva',
      aspectToVerify: '¿El operario registra en la bitácora la causa de cualquier merma superior al porcentaje presupuestado (e.g. rotura de papel, descalce)?',
      isCompliant: false,
      evidenceObservation: 'En la OP-2026-0843 no se diligenció en el software la causa del exceso de merma de 1.2% durante el arranque del Pantone.',
      recommendation: 'No Conformidad: Implementar obligatoriedad de justificar mermas mayores al 5% antes de cerrar la orden en el ERP.'
    },

    // 6. Normas de Seguridad Industrial y EPP
    {
      id: 'chk-18',
      itemNumber: 18,
      category: 'Normas de Seguridad Industrial y EPP',
      criterion: 'ISO 45001 / Reglamento Interno SST',
      aspectToVerify: '¿El operario y su auxiliar utilizan de manera permanente los EPP reglamentarios (protectores auditivos de copa, gafas y botas con puntera)?',
      isCompliant: true,
      evidenceObservation: 'Prensista y auxiliar portan protectores auditivos 3M con NRR 27dB y botas dieléctricas en buen estado.',
      recommendation: ''
    },
    {
      id: 'chk-19',
      itemNumber: 19,
      category: 'Normas de Seguridad Industrial y EPP',
      criterion: 'Reglamento de Seguridad en Máquinas Rotativas',
      aspectToVerify: '¿El operario trabaja sin cadenas, anillos, pulseras ni mangas holgadas que representen peligro de atrapamiento en cilindros?',
      isCompliant: true,
      evidenceObservation: 'Operario con overol ajustado de mangas cortas y sin accesorios metálicos.',
      recommendation: ''
    },
    {
      id: 'chk-20',
      itemNumber: 20,
      category: 'Normas de Seguridad Industrial y EPP',
      criterion: 'Seguridad en Maquinaria / ISO 12100',
      aspectToVerify: '¿El operario verifica diariamente el funcionamiento del botón de parada de emergencia y los microswitches de las guardas de seguridad?',
      isCompliant: true,
      evidenceObservation: 'Prueba funcional ejecutada en presencia del auditor: la máquina frena en menos de 0.8 segundos al pulsar el botón de paro.',
      recommendation: 'Mantener el registro semanal de pruebas de seguridad.'
    },
    {
      id: 'chk-21',
      itemNumber: 21,
      category: 'Normas de Seguridad Industrial y EPP',
      criterion: 'Manejo de Sustancias Químicas / SGA',
      aspectToVerify: '¿Los solventes de lavado y químicos se encuentran debidamente rotulados bajo el Sistema Globalmente Armonizado (SGA) y cerrados?',
      isCompliant: true,
      evidenceObservation: 'Frascos lavadores con etiqueta SGA de toxicidad e inflamabilidad vigentes; trapos impregnados depositados en caneca metálica hermética con pedal.',
      recommendation: ''
    }
  ],
  leadAuditorSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M10 40 Q 30 15, 60 40 T 110 15 T 160 45 T 205 30" stroke="%231e293b" stroke-width="2" fill="none"/><text x="15" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">C. Rivas - Tech Auditor</text></svg>',
  operatorSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M15 35 Q 50 10, 85 45 T 140 20 T 190 40" stroke="%231e293b" stroke-width="2" fill="none"/><text x="15" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">J. Valderrama - Prensista</text></svg>'
};

export const INITIAL_FINAL_REPORT: FinalAuditReport = {
  code: 'FO-MCO-22',
  version: '01',
  approvalDate: 'Febrero 14 de 2026',
  editorResponsible: 'Ing. Noralba Castaño Puerta (Auditor Líder)',
  auditDate: '05 de Noviembre de 2026',
  auditedProcess: 'Operación de Prensa Litográfica Offset',
  targetJob: 'Operario de Prensa Litográfica (Prensista)',
  objective: 'Evaluar la conformidad y destreza operativa del cargo de Operario de Prensa en Impresos al Día frente a las especificaciones de calidad ISO 9001:2015, estándar cromático ISO 12647-2 y directrices de seguridad industrial.',
  scope: 'Prensas Offset Heidelberg Speedmaster CD 102 y SM 74 de la planta de Impresos al Día.',
  criteria: 'NTC-ISO 9001:2015, Procedimientos PO-PRE-03, Fichas Técnicas de Sustratos, Manual de Prensista y Normativa SST.',
  auditorTeam: ['Ing. Noralba Castaño Puerta (Auditor Líder)', 'Carlos Eduardo Rivas M. (Auditor Técnico)', 'Didier Rave Zuluaga (Auditor Técnico)', 'Claudia Restrepo Ossa', 'Jenith Montoya García'],
  leadAuditorName: 'Ing. Noralba Castaño Puerta',
  leadAuditorJobTitle: 'Directora de Calidad y Procesos / Auditor Líder',
  interviewedPersonnel: ['Jorge Valderrama (Operario de Prensa Titular)', 'Mario Gómez (Prensista Turno 2)', 'Ing. Mauricio Henao Gómez (Jefe de Planta)'],
  favorableAspects: [
    'Alto dominio técnico en el control densitomátrico de cuatricromía (CMYK) con valores delta E menores a 1.5 en el tiraje comercial.',
    'Alistamiento ágil de la máquina Heidelberg CD 102 con tensado de mantillas certificado mediante llave dinamométrica.',
    'Excelente adherencia al protocolo de seguridad industrial: uso permanente de EPP auditivo, ropa ceñida y comprobación de paradas de emergencia.',
    'Inmediata segregación de pliegos maculatura con banderillas rojas que previene la contaminación de pilas de producto conforme.'
  ],
  nonConformities: [
    {
      id: 'nc-01',
      finding: 'En la tirada de la OP-2026-0843 se inició el ajuste del color directo Pantone 871 C sin efectuar la comprobación previa de viscosidad con copa Zahn ni registrar la tolerancia de formulación.',
      classification: 'NC',
      breachedRequirement: 'ISO 9001:2015 Numeral 8.5.1 (Control de la producción) y Procedimiento PR-PRE-01'
    },
    {
      id: 'nc-02',
      finding: 'No se registró en el módulo de taller del ERP la justificación de la merma de arranque del 1.2% por encima del estándar en la máquina Heidelberg.',
      classification: 'NC',
      breachedRequirement: 'ISO 9001:2015 Numeral 8.5.2 (Identificación y trazabilidad de mermas)'
    }
  ],
  improvementOpportunities: [
    {
      opportunity: 'Implementar un temporizador digital en la mesa de luz para la verificación del pliego testigo cada 1.500 pliegos continuos.',
      standardClause: 'ISO 9001:2015 8.5.1'
    },
    {
      opportunity: 'Capacitar al auxiliar de prensa en la preparación estandarizada de mezclas de tintas Pantone para agilizar el arranque del prensista principal.',
      standardClause: 'ISO 9001:2015 7.2'
    }
  ],
  actionPlans: [
    {
      id: 'cap-01',
      nonConformityId: 'nc-01',
      findingDescription: 'Falta de comprobación de viscosidad en tintas Pantone especiales.',
      rootCauseAnalysis: 'Falta de copa Zahn calibrada en la mesa de tintas de la prensa Heidelberg.',
      correctiveAction: 'Dotar a la mesa de preparación con copa Zahn #3 calibrada y capacitar a los 3 prensistas en la medición de viscosidad en segundos antes de entintar.',
      responsiblePerson: 'Carlos Eduardo Rivas (Ing. Producción) y Jorge Valderrama',
      commitmentDeadline: '2026-11-20',
      status: 'En Implementación'
    },
    {
      id: 'cap-02',
      nonConformityId: 'nc-02',
      findingDescription: 'Omisión de registro de justificación de merma en el software de taller.',
      rootCauseAnalysis: 'El campo de justificación de merma en la terminal de planta no estaba configurado como obligatorio al cerrar turno.',
      correctiveAction: 'Configurar el sistema ERP para exigir causa raíz cuando la merma supere el 5% presupuestado y divulgar la política de control de desperdicios.',
      responsiblePerson: 'Claudia Restrepo (Costos) y Administrador ERP',
      commitmentDeadline: '2026-11-18',
      status: 'En Implementación'
    }
  ],
  conclusions: 'El cargo de Operario de Prensa Litográfica en Impresos al Día demuestra sólida competencia técnica, destreza en calibración mecánica y alto compromiso con las normas de seguridad industrial. Las dos no conformidades menores identificadas son operativas y subsanables en un plazo de 15 días calendario.',
  leadAuditorSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M15 45 Q 40 10, 70 35 T 120 20 T 170 40 T 210 25" stroke="%231e293b" stroke-width="2.5" fill="none"/><text x="20" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">N. Castaño - Lead Auditor</text></svg>',
  auditeeLeaderName: 'Ing. Mauricio Henao Gómez',
  auditeeLeaderJobTitle: 'Jefe de Planta Litográfica / Dirección Técnica',
  auditeeLeaderSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M15 35 Q 50 10, 85 45 T 140 20 T 190 40" stroke="%231e293b" stroke-width="2" fill="none"/><text x="15" y="55" font-family="sans-serif" font-size="10" fill="%2364748b">M. Henao - Dirección Planta</text></svg>'
};

export const INITIAL_CLOSING_ACT: ClosingAct = {
  code: 'FO-MCO-21',
  version: '01',
  approvalDate: 'Febrero 14 de 2026',
  editorResponsible: 'Ing. Noralba Castaño Puerta (Auditor Líder)',
  date: '2026-11-05',
  time: '16:30 p.m.',
  place: 'Consola Central Heidelberg CD 102 - Planta Impresos al Día',
  auditedProcess: 'Operación de Prensa Litográfica Offset',
  objective: 'Presentar formalmente los resultados de la auditoría interna al cargo de Operario de Prensa Litográfica, socializar las fortalezas y acordar los planes de acción correctivos para las no conformidades.',
  scope: 'Puesto de trabajo del Operario de Prensa en Impresos al Día.',
  attendees: [
    { id: 'att-1', name: 'Ing. Noralba Castaño Puerta', role: 'Auditor Líder' },
    { id: 'att-2', name: 'Carlos Eduardo Rivas M.', role: 'Auditor Técnico' },
    { id: 'att-3', name: 'Didier Rave Zuluaga', role: 'Auditor Técnico' },
    { id: 'att-4', name: 'Jorge Valderrama', role: 'Operario de Prensa Litográfica' },
    { id: 'att-5', name: 'Ing. Mauricio Henao Gómez', role: 'Jefe de Planta Litográfica' }
  ],
  orderOfDay: [
    '1. Presentación de aspectos favorables y fortalezas observadas en el prensista.',
    '2. Notificación formal de los 2 hallazgos clasificados como No Conformidades Menores.',
    '3. Establecimiento del plazo de 15 días calendario para la ejecución de las acciones correctivas.',
    '4. Firma formal del acta de cierre por las partes.'
  ],
  timeframeForActionPlanDays: 15,
  actionPlanResponsible: 'Jorge Valderrama (Prensista) y Carlos Eduardo Rivas (Supervisor de Prensas)',
  observations: 'El operario manifiesta plena conformidad con los hallazgos descritos y se compromete con la implementación de las medidas de mejora en viscosidad de tintas y registro de mermas.',
  leadAuditorName: 'Ing. Noralba Castaño Puerta',
  leadAuditorJobTitle: 'Auditor Líder ISO 19011:2026',
  auditeeLeaderName: 'Jorge Valderrama',
  auditeeLeaderJobTitle: 'Operario de Prensa Litográfica',
  status: 'Borrador'
};

class StorageService {
  private state: AppAuditState;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.state = this.getInitialFallbackState();
    this.initIndexedDB();
  }

  public getInitialFallbackState(): AppAuditState {
    return {
      companyName: 'Impresos al Día',
      auditors: INITIAL_AUDITORS,
      risks: INITIAL_RISKS,
      schedules: INITIAL_SCHEDULES,
      productionOrders: INITIAL_ORDERS,
      auditProgram: INITIAL_PROGRAM,
      auditPlan: INITIAL_PLAN,
      openingAct: INITIAL_OPENING_ACT,
      checklist: INITIAL_CHECKLIST,
      closingAct: INITIAL_CLOSING_ACT,
      finalReport: INITIAL_FINAL_REPORT,
      lastPersisted: new Date().toISOString()
    };
  }

  private initIndexedDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return resolve({} as IDBDatabase);
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.error('Error al abrir IndexedDB:', e);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public async loadState(): Promise<AppAuditState> {
    // 1. Try to load from IndexedDB first
    try {
      const db = await this.initIndexedDB();
      if (db && db.transaction) {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('current_state');

        const result = await new Promise<any>((resolve) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
        });

        if (result && result.value && result.value.checklist && result.value.auditProgram) {
          this.state = this.normalizeLoadedState(result.value);
          this.syncToLocalStorage(this.state);
          return this.state;
        }
      }
    } catch (err) {
      console.warn('Error leyendo desde IndexedDB, intentando LocalStorage:', err);
    }

    // 2. Try to load from LocalStorage
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.checklist && parsed.auditProgram) {
          this.state = this.normalizeLoadedState(parsed);
          this.saveToIndexedDB(this.state);
          return this.state;
        }
      }
    } catch (e) {
      console.warn('Error cargando LocalStorage:', e);
    }

    // 3. Fallback to rich initial state
    this.state = this.getInitialFallbackState();
    await this.persistState(this.state);
    return this.state;
  }

  private normalizeLoadedState(loaded: any): AppAuditState {
    const fallback = this.getInitialFallbackState();
    return {
      ...fallback,
      ...loaded,
      companyName: 'Impresos al Día',
      auditors: (loaded.auditors || fallback.auditors).map((a: any, idx: number) => ({
        ...fallback.auditors[idx % fallback.auditors.length],
        ...a,
        jobTitle: a.jobTitle || fallback.auditors.find((fa: Auditor) => fa.id === a.id)?.jobTitle || 'Especialista Litográfico'
      })),
      auditProgram: {
        ...fallback.auditProgram,
        ...loaded.auditProgram,
        editorResponsible: loaded.auditProgram?.editorResponsible || fallback.auditProgram.editorResponsible
      },
      auditPlan: {
        ...fallback.auditPlan,
        ...loaded.auditPlan,
        editorResponsible: loaded.auditPlan?.editorResponsible || fallback.auditPlan.editorResponsible
      },
      openingAct: {
        ...fallback.openingAct,
        ...loaded.openingAct,
        editorResponsible: loaded.openingAct?.editorResponsible || fallback.openingAct.editorResponsible
      },
      checklist: {
        ...fallback.checklist,
        ...loaded.checklist,
        editorResponsible: loaded.checklist?.editorResponsible || fallback.checklist.editorResponsible
      },
      closingAct: {
        ...fallback.closingAct,
        ...loaded.closingAct,
        editorResponsible: loaded.closingAct?.editorResponsible || fallback.closingAct.editorResponsible
      },
      finalReport: {
        ...fallback.finalReport,
        ...loaded.finalReport,
        editorResponsible: loaded.finalReport?.editorResponsible || fallback.finalReport.editorResponsible
      }
    };
  }

  public getState(): AppAuditState {
    return this.state;
  }

  public async persistState(newState: AppAuditState): Promise<void> {
    this.state = {
      ...newState,
      companyName: 'Impresos al Día',
      lastPersisted: new Date().toISOString()
    };

    this.syncToLocalStorage(this.state);
    await this.saveToIndexedDB(this.state);
  }

  private syncToLocalStorage(state: AppAuditState) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error guardando en LocalStorage:', e);
    }
  }

  private async saveToIndexedDB(state: AppAuditState): Promise<void> {
    try {
      const db = await this.initIndexedDB();
      if (!db || !db.transaction) return;

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put({ key: 'current_state', value: state, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error('Error guardando en IndexedDB:', e);
    }
  }

  public exportBackupJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public async importBackupJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data.auditors || !data.checklist || !data.auditProgram) {
        throw new Error('Estructura de respaldo no válida');
      }
      await this.persistState(data);
      return true;
    } catch (e) {
      console.error('Error importando respaldo JSON:', e);
      return false;
    }
  }

  public async resetToDefaults(): Promise<AppAuditState> {
    const defaultState = this.getInitialFallbackState();
    await this.persistState(defaultState);
    return defaultState;
  }
}

export const storageService = new StorageService();
