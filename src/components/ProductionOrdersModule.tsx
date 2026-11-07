/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Printer, 
  Layers, 
  Palette, 
  Sliders, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X,
  Gauge,
  Sparkles,
  Droplets,
  Scissors
} from 'lucide-react';
import { 
  ProductionOrderAudit, 
  SubstrateSpec, 
  InksChemistrySpec, 
  FinishesSpec, 
  AuditFinding, 
  InkColorSpec 
} from '../types/audit';

interface ProductionOrdersModuleProps {
  orders: ProductionOrderAudit[];
  onSaveOrder: (order: ProductionOrderAudit) => void;
  onDeleteOrder: (id: string) => void;
}

export const ProductionOrdersModule: React.FC<ProductionOrdersModuleProps> = ({
  orders,
  onSaveOrder,
  onDeleteOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrderAudit | null>(orders[0] || null);
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editingData, setEditingData] = useState<ProductionOrderAudit | null>(null);

  // New Finding inputs
  const [newFindingType, setNewFindingType] = useState<AuditFinding['type']>('Observación');
  const [newFindingClause, setNewFindingClause] = useState('ISO 9001:2015 8.5.1');
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingEvidence, setNewFindingEvidence] = useState('');
  const [newFindingAuditor, setNewFindingAuditor] = useState('Auditor Técnico');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.overallAuditStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    const newId = `OP-2026-${String(840 + orders.length + 1).padStart(4, '0')}`;
    const newOrder: ProductionOrderAudit = {
      id: newId,
      quoteNumber: `COT-2026-${String(1200 + orders.length + 1)}`,
      clientName: '',
      jobTitle: '',
      pressOperatorName: 'Jorge Valderrama (Prensista Titular)',
      pressMachineId: 'Prensa Heidelberg Speedmaster CD 102-4 Colores',
      creationDate: new Date().toISOString().split('T')[0],
      targetDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      runQuantity: 10000,
      sheetsPrinted: 10500,
      wasteAllowancePercent: 5.0,
      actualWastePercent: 4.8,
      unitPrice: 1500,
      totalPrice: 15000000,
      substrate: {
        paperType: 'Propalcote C2S Esmaltado',
        basisWeightGsm: 150,
        sheetSizeCm: '70 x 100 cm',
        grainDirection: 'Paralelo al eje de cilindro',
        caliperMicrons: 140,
        moisturePercent: 50,
        supplierBatch: 'LOTE-PAPEL-2026',
        verifiedGsmSample: 150.0
      },
      inks: {
        processType: 'Offset Cuatricromía (CMYK)',
        colors: [
          { name: 'Cyan Process', code: 'C', targetDensity: 1.45, measuredDensity: 1.45, deltaE: 1.1 },
          { name: 'Magenta Process', code: 'M', targetDensity: 1.40, measuredDensity: 1.40, deltaE: 1.2 },
          { name: 'Yellow Process', code: 'Y', targetDensity: 1.05, measuredDensity: 1.05, deltaE: 0.9 },
          { name: 'Black Process', code: 'K', targetDensity: 1.70, measuredDensity: 1.70, deltaE: 1.0 }
        ],
        fountainPh: 5.0,
        fountainConductivityUs: 1100,
        measuredPh: 5.0,
        measuredConductivity: 1120
      },
      finishes: {
        lamination: 'Térmico Mate',
        spotUv: false,
        hotStamping: false,
        dieCutting: false,
        binding: 'Corte y Doblez',
        specialRequirements: ''
      },
      overallAuditStatus: 'Conforme',
      findings: [],
      auditNotes: 'Muestreo inicial sin desviaciones registradas.',
      lastUpdated: new Date().toLocaleString('es-CO')
    };

    setEditingData(newOrder);
    setIsEditingModal(true);
  };

  const openEditModal = (order: ProductionOrderAudit) => {
    setEditingData(JSON.parse(JSON.stringify(order)));
    setIsEditingModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingData) return;
    if (!editingData.clientName.trim() || !editingData.jobTitle.trim()) {
      alert('Por favor especifica el nombre del cliente y el título del trabajo.');
      return;
    }

    const updated = {
      ...editingData,
      lastUpdated: new Date().toLocaleString('es-CO')
    };

    onSaveOrder(updated);
    if (selectedOrder?.id === updated.id) {
      setSelectedOrder(updated);
    }
    setIsEditingModal(false);
  };

  const addFindingToSelected = () => {
    if (!selectedOrder || !newFindingDesc.trim()) return;

    const finding: AuditFinding = {
      id: `find-${Date.now()}`,
      type: newFindingType,
      clause: newFindingClause,
      description: newFindingDesc,
      evidence: newFindingEvidence || 'Verificación en pliego muestra de tiraje',
      auditorName: newFindingAuditor,
      date: new Date().toISOString().split('T')[0],
      status: newFindingType.includes('No Conformidad') ? 'Plan de Acción Solicitado' : 'Abierto'
    };

    const updatedOrder: ProductionOrderAudit = {
      ...selectedOrder,
      findings: [...selectedOrder.findings, finding],
      overallAuditStatus: newFindingType.includes('No Conformidad') ? 'No Conforme' : 'Con Observaciones',
      lastUpdated: new Date().toLocaleString('es-CO')
    };

    onSaveOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
    setNewFindingDesc('');
    setNewFindingEvidence('');
  };

  const removeFinding = (findingId: string) => {
    if (!selectedOrder) return;
    const updatedFindings = selectedOrder.findings.filter(f => f.id !== findingId);
    const hasNC = updatedFindings.some(f => f.type.includes('No Conformidad'));
    const hasObs = updatedFindings.some(f => f.type === 'Observación');

    const updatedOrder: ProductionOrderAudit = {
      ...selectedOrder,
      findings: updatedFindings,
      overallAuditStatus: hasNC ? 'No Conforme' : hasObs ? 'Con Observaciones' : 'Conforme',
      lastUpdated: new Date().toLocaleString('es-CO')
    };

    onSaveOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
  };

  // Color Density Updater in Quick view
  const updateMeasuredDensity = (colorIndex: number, newDensity: number) => {
    if (!selectedOrder) return;
    const colors = [...selectedOrder.inks.colors];
    colors[colorIndex] = {
      ...colors[colorIndex],
      measuredDensity: newDensity,
      // recalculate deltaE approximation
      deltaE: Math.abs(Number((Math.abs(colors[colorIndex].targetDensity - newDensity) * 10).toFixed(1))) + 0.5
    };

    const updatedOrder: ProductionOrderAudit = {
      ...selectedOrder,
      inks: {
        ...selectedOrder.inks,
        colors
      },
      lastUpdated: new Date().toLocaleString('es-CO')
    };

    onSaveOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <Printer className="w-4 h-4" />
              <span>Verificación Técnica y Muestreo Litográfico</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Órdenes de Producción Auditadas (OP)
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Control en tiempo real de cotizaciones, sustratos (g/m²), tintas, densitometría y acabados postprensa.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Orden Auditada
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por OP, Cotización, Cliente o Producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">Todos los Estados de Auditoría</option>
              <option value="Conforme">Conforme</option>
              <option value="Con Observaciones">Con Observaciones</option>
              <option value="No Conforme">No Conforme</option>
              <option value="En Verificación">En Verificación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Orders List (Left) + Detailed Technical Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>ÓRDENES SELECCIONADAS ({filteredOrders.length})</span>
            <span>TIRAJE / ESTADO</span>
          </div>

          {filteredOrders.map((order) => {
            const isSelected = selectedOrder?.id === order.id;
            const statusBadge = 
              order.overallAuditStatus === 'Conforme' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              order.overallAuditStatus === 'Con Observaciones' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              order.overallAuditStatus === 'No Conforme' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              'bg-blue-50 text-blue-800 border-blue-200';

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/10 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {order.quoteNumber}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs mt-1 leading-snug">
                      {order.jobTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {order.clientName}
                    </p>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border shrink-0 ${statusBadge}`}>
                    {order.overallAuditStatus}
                  </span>
                </div>

                {/* Substrate & Inks Summary Tag */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <div className="truncate pr-2">
                    <span className="text-slate-400">Papel:</span>{' '}
                    <strong className="text-slate-700">{order.substrate.paperType} {order.substrate.basisWeightGsm}g</strong>
                  </div>
                  <div className="font-mono font-bold text-slate-800 shrink-0">
                    {order.runQuantity.toLocaleString('es-CO')} ej.
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">No se encontraron órdenes de producción.</p>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Graphic Technical Inspector */}
        {selectedOrder ? (
          <div className="lg:col-span-7 space-y-5">
            {/* Header Inspector */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                      {selectedOrder.id}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Cotización {selectedOrder.quoteNumber}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Entrega: {selectedOrder.targetDeliveryDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedOrder.jobTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                    <span className="text-slate-600 font-medium">
                      Cliente: <strong>{selectedOrder.clientName}</strong>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-indigo-800 font-semibold bg-indigo-50 px-2 py-0.5 rounded-sm">
                      Operario: {selectedOrder.pressOperatorName || 'Jorge Valderrama'}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {selectedOrder.pressMachineId || 'Heidelberg Speedmaster CD 102'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar Especificaciones
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la orden ${selectedOrder.id}?`)) {
                        onDeleteOrder(selectedOrder.id);
                        setSelectedOrder(orders.find(o => o.id !== selectedOrder.id) || null);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar OP"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Commercial & Production Volume Grid */}
              <div className="grid grid-cols-4 gap-3 py-3 text-xs border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block">Tiraje Solicitado</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedOrder.runQuantity.toLocaleString('es-CO')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Pliegos Tirados</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedOrder.sheetsPrinted.toLocaleString('es-CO')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Merma Presupuestada</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedOrder.wasteAllowancePercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Merma Real Medida</span>
                  <span className={`font-mono font-bold text-sm ${
                    (selectedOrder.actualWastePercent || 0) > selectedOrder.wasteAllowancePercent
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}>
                    {selectedOrder.actualWastePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Substrate Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Sustrato Litográfico & Propiedades del Papel
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Lote: {selectedOrder.substrate.supplierBatch}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Tipo Sustrato</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {selectedOrder.substrate.paperType}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Gramaje Nominal</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedOrder.substrate.basisWeightGsm} g/m²
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Gramaje Medido Balanza</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedOrder.substrate.verifiedGsmSample || selectedOrder.substrate.basisWeightGsm} g/m²
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Formato Pliego</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedOrder.substrate.sheetSizeCm}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500">Sentido de Fibra:</span>{' '}
                  <strong className="text-slate-800">{selectedOrder.substrate.grainDirection}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Calibre Micras:</span>{' '}
                  <strong className="font-mono text-slate-800">{selectedOrder.substrate.caliperMicrons} µm</strong>
                </div>
                <div>
                  <span className="text-slate-500">Humedad Papel:</span>{' '}
                  <strong className="font-mono text-slate-800">{selectedOrder.substrate.moisturePercent}%</strong>
                </div>
              </div>
            </div>

            {/* Inks & Colorimetry Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  Tintas, Densitometría & Solución de Fuente (ISO 12647-2)
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                  {selectedOrder.inks.processType}
                </span>
              </div>

              {/* Color Densities Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 bg-slate-50/50">
                      <th className="py-2 px-2">Color / Tinta</th>
                      <th className="py-2 px-2 text-center">Densidad Meta (D)</th>
                      <th className="py-2 px-2 text-center">Densidad Medida</th>
                      <th className="py-2 px-2 text-center">ΔE (Color)</th>
                      <th className="py-2 px-2 text-right">Tolerancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.inks.colors.map((color, idx) => {
                      const isOutOfTolerance = (color.deltaE || 0) > 2.5;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2 font-medium text-slate-800 flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full border border-slate-300 shrink-0" 
                              style={{
                                backgroundColor: 
                                  color.code === 'C' ? '#06b6d4' :
                                  color.code === 'M' ? '#ec4899' :
                                  color.code === 'Y' ? '#eab308' :
                                  color.code === 'K' ? '#0f172a' : '#d97706'
                              }}
                            />
                            {color.name}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-600">
                            {color.targetDensity.toFixed(2)} D
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">
                            <input
                              type="number"
                              step="0.01"
                              value={color.measuredDensity || color.targetDensity}
                              onChange={(e) => updateMeasuredDensity(idx, parseFloat(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 text-center text-xs font-mono border rounded bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold">
                            <span className={isOutOfTolerance ? 'text-rose-600' : 'text-emerald-600'}>
                              ΔE {color.deltaE}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            {isOutOfTolerance ? (
                              <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded-sm">
                                Fuera de norma
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                                En rango ISO
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Fountain Solution Chemistry Check */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    pH Solución de Fuente
                  </div>
                  <div className="flex items-center gap-2 mt-1 font-mono">
                    <span className="text-sm font-bold text-slate-900">
                      pH {selectedOrder.inks.measuredPh || selectedOrder.inks.fountainPh}
                    </span>
                    <span className="text-[10px] text-slate-500">(Rango óptimo: 4.8 - 5.2)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Gauge className="w-3.5 h-3.5 text-amber-600" />
                    Conductividad
                  </div>
                  <div className="flex items-center gap-2 mt-1 font-mono">
                    <span className="text-sm font-bold text-slate-900">
                      {selectedOrder.inks.measuredConductivity || selectedOrder.inks.fountainConductivityUs} µS/cm
                    </span>
                    <span className="text-[10px] text-slate-500">(800 - 1500 µS)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Finishes and Postprensa Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Scissors className="w-4 h-4 text-indigo-600" />
                  Acabados, Barnices y Postprensa
                </div>
                <span className="text-[11px] font-semibold text-slate-700">
                  Encuadernación: {selectedOrder.finishes.binding}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 border rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Laminado</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.finishes.lamination}</span>
                </div>
                <div className="p-2 border rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Barniz UV Reserva</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.finishes.spotUv ? 'Sí (Serigrafía)' : 'No'}</span>
                </div>
                <div className="p-2 border rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Hot Stamping</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.finishes.hotStamping ? 'Sí (Metalizado)' : 'No'}</span>
                </div>
                <div className="p-2 border rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Troquelado</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.finishes.dieCutting ? 'Sí (Platina)' : 'No'}</span>
                </div>
              </div>

              {selectedOrder.finishes.specialRequirements && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong className="text-slate-700">Especificación especial de acabados:</strong>{' '}
                  {selectedOrder.finishes.specialRequirements}
                </div>
              )}
            </div>

            {/* Audit Findings On this OP */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Hallazgos y Observaciones de Auditoría en esta OP ({selectedOrder.findings.length})
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-2">
                {selectedOrder.findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                          f.type.includes('No Conformidad') ? 'bg-rose-100 text-rose-800' :
                          f.type === 'Observación' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {f.type}
                        </span>
                        <span className="font-mono text-slate-500">{f.clause}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 font-medium">{f.auditorName}</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">{f.description}</p>
                      <p className="text-[11px] text-slate-500 italic">Evidencia: {f.evidence}</p>
                    </div>

                    <button
                      onClick={() => removeFinding(f.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Eliminar hallazgo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {selectedOrder.findings.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs italic">
                    No se registran no conformidades ni observaciones en esta orden de producción.
                  </div>
                )}
              </div>

              {/* Add New Finding Form */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">Registrar Hallazgo en Terreno:</span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newFindingType}
                    onChange={(e) => setNewFindingType(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  >
                    <option value="Observación">Observación</option>
                    <option value="No Conformidad Menor">No Conformidad Menor</option>
                    <option value="No Conformidad Mayor">No Conformidad Mayor</option>
                    <option value="Fortaleza">Fortaleza</option>
                  </select>

                  <input
                    type="text"
                    value={newFindingClause}
                    onChange={(e) => setNewFindingClause(e.target.value)}
                    placeholder="Cláusula ISO (ej. 8.5.1)"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />

                  <input
                    type="text"
                    value={newFindingAuditor}
                    onChange={(e) => setNewFindingAuditor(e.target.value)}
                    placeholder="Auditor responsable"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>

                <textarea
                  rows={2}
                  value={newFindingDesc}
                  onChange={(e) => setNewFindingDesc(e.target.value)}
                  placeholder="Descripción detallada de la desviación encontrada..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                />

                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={newFindingEvidence}
                    onChange={(e) => setNewFindingEvidence(e.target.value)}
                    placeholder="Evidencia objetiva / Número de pliego / Muestra física..."
                    className="flex-1 mr-2 px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />

                  <button
                    type="button"
                    onClick={addFindingToSelected}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Añadir Hallazgo
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Full Editing Modal for Production Order */}
      {isEditingModal && editingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Editar Orden de Producción #{editingData.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Modificación de cotización, especificaciones de sustrato, tintas y acabados.
                </p>
              </div>
              <button
                onClick={() => setIsEditingModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Section 1: Commercial / Quote Info */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide">
                  1. Datos Comerciales & Cotización
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Número de Cotización</label>
                    <input
                      type="text"
                      required
                      value={editingData.quoteNumber}
                      onChange={(e) => setEditingData({ ...editingData, quoteNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nombre del Cliente *</label>
                    <input
                      type="text"
                      required
                      value={editingData.clientName}
                      onChange={(e) => setEditingData({ ...editingData, clientName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Fecha Compromiso de Entrega</label>
                    <input
                      type="date"
                      value={editingData.targetDeliveryDate}
                      onChange={(e) => setEditingData({ ...editingData, targetDeliveryDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Título del Trabajo Litográfico *</label>
                  <input
                    type="text"
                    required
                    value={editingData.jobTitle}
                    onChange={(e) => setEditingData({ ...editingData, jobTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Operario de Prensa Evaluado</label>
                    <input
                      type="text"
                      value={editingData.pressOperatorName || ''}
                      onChange={(e) => setEditingData({ ...editingData, pressOperatorName: e.target.value })}
                      placeholder="Ej. Jorge Valderrama (Prensista)"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Prensa Litográfica / Línea</label>
                    <input
                      type="text"
                      value={editingData.pressMachineId || ''}
                      onChange={(e) => setEditingData({ ...editingData, pressMachineId: e.target.value })}
                      placeholder="Ej. Prensa Heidelberg Speedmaster CD 102"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tiraje Solicitado</label>
                    <input
                      type="number"
                      value={editingData.runQuantity}
                      onChange={(e) => setEditingData({ ...editingData, runQuantity: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Pliegos Tirados</label>
                    <input
                      type="number"
                      value={editingData.sheetsPrinted}
                      onChange={(e) => setEditingData({ ...editingData, sheetsPrinted: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">% Merma Presupuestada</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingData.wasteAllowancePercent}
                      onChange={(e) => setEditingData({ ...editingData, wasteAllowancePercent: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">% Merma Real</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingData.actualWastePercent || 0}
                      onChange={(e) => setEditingData({ ...editingData, actualWastePercent: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Substrate Specifications */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide">
                  2. Especificaciones de Sustrato & Papel
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tipo de Papel / Sustrato</label>
                    <input
                      type="text"
                      value={editingData.substrate.paperType}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        substrate: { ...editingData.substrate, paperType: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Gramaje Nominal (g/m²)</label>
                    <input
                      type="number"
                      value={editingData.substrate.basisWeightGsm}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        substrate: { ...editingData.substrate, basisWeightGsm: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Formato de Pliego (cm)</label>
                    <input
                      type="text"
                      value={editingData.substrate.sheetSizeCm}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        substrate: { ...editingData.substrate, sheetSizeCm: e.target.value }
                      })}
                      placeholder="Ej. 70 x 100 cm"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Sentido de Fibra</label>
                    <select
                      value={editingData.substrate.grainDirection}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        substrate: { ...editingData.substrate, grainDirection: e.target.value as any }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value="Paralelo al eje de cilindro">Paralelo al eje de cilindro</option>
                      <option value="Perpendicular al eje de cilindro">Perpendicular al eje de cilindro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Humedad del Papel (%)</label>
                    <input
                      type="number"
                      value={editingData.substrate.moisturePercent}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        substrate: { ...editingData.substrate, moisturePercent: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Lote del Proveedor</label>
                    <input
                      type="text"
                      value={editingData.substrate.supplierBatch}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        substrate: { ...editingData.substrate, supplierBatch: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Inks & Chemistry */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide">
                  3. Tintas & Solución de Fuente
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">pH Solución de Fuente</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingData.inks.fountainPh}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        inks: { ...editingData.inks, fountainPh: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Conductividad (µS/cm)</label>
                    <input
                      type="number"
                      value={editingData.inks.fountainConductivityUs}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        inks: { ...editingData.inks, fountainConductivityUs: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Finishes */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide">
                  4. Postprensa, Acabados & Encuadernación
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Laminado / Plastificado</label>
                    <select
                      value={editingData.finishes.lamination}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        finishes: { ...editingData.finishes, lamination: e.target.value as any }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value="Térmico Mate">Térmico Mate</option>
                      <option value="Térmico Brillante">Térmico Brillante</option>
                      <option value="Soft Touch">Soft Touch</option>
                      <option value="Sin Laminado">Sin Laminado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tipo de Encuadernación</label>
                    <select
                      value={editingData.finishes.binding}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        finishes: { ...editingData.finishes, binding: e.target.value as any }
                      })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value="Cosido al Hilo y Pegado">Cosido al Hilo y Pegado</option>
                      <option value="Grapa a Caballete">Grapa a Caballete</option>
                      <option value="Encolado PUR">Encolado PUR</option>
                      <option value="Corte y Doblez">Corte y Doblez</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingData.finishes.spotUv}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        finishes: { ...editingData.finishes, spotUv: e.target.checked }
                      })}
                      className="rounded"
                    />
                    Barniz UV Reserva
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingData.finishes.hotStamping}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        finishes: { ...editingData.finishes, hotStamping: e.target.checked }
                      })}
                      className="rounded"
                    />
                    Estampado al Calor (Hot Stamping)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingData.finishes.dieCutting}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        finishes: { ...editingData.finishes, dieCutting: e.target.checked }
                      })}
                      className="rounded"
                    />
                    Troquelado
                  </label>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Requisitos Especiales de Acabados
                  </label>
                  <input
                    type="text"
                    value={editingData.finishes.specialRequirements}
                    onChange={(e) => setEditingData({
                      ...editingData,
                      finishes: { ...editingData.finishes, specialRequirements: e.target.value }
                    })}
                    placeholder="Ej. Pegado con adhesivo no tóxico para alimentos..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block font-medium text-slate-700 mb-1">
                  Estado General de Auditoría de la OP
                </label>
                <select
                  value={editingData.overallAuditStatus}
                  onChange={(e) => setEditingData({
                    ...editingData,
                    overallAuditStatus: e.target.value as any
                  })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="Conforme">Conforme</option>
                  <option value="Con Observaciones">Con Observaciones</option>
                  <option value="No Conforme">No Conforme</option>
                  <option value="En Verificación">En Verificación</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Especificaciones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
