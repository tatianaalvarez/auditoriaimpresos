/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  Menu, 
  X,
  FileText,
  Calendar,
  CheckSquare,
  Users,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onQuickPrint: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeModule,
  setActiveModule,
  onQuickPrint
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Resumen' },
    { id: 'program', label: 'Programa & Plan' },
    { id: 'checklist', label: 'Lista de Chequeo' },
    { id: 'acts', label: 'Actas & Informe' },
    { id: 'orders', label: 'Órdenes Auditadas' },
    { id: 'risks', label: 'Matriz de Riesgos' },
    { id: 'schedule', label: 'Cronograma' },
    { id: 'auditors', label: 'Equipo Auditor' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div 
            onClick={() => setActiveModule('dashboard')}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
              ID
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                Impresos al Día
              </span>
              <span className="text-[10px] text-indigo-700 font-semibold tracking-wide">
                Auditoría a Prensas · ISO 19011
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer relative ${
                    isActive ? 'text-indigo-600 font-bold' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Mobile / Tablet menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg max-h-80 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
