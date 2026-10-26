import React from 'react';
import { 
  Building2, 
  QrCode, 
  LayoutDashboard, 
  Boxes, 
  Printer, 
  FileText, 
  History, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  Camera,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'dashboard' | 'assets' | 'scanner' | 'print-labels' | 'locations' | 'reports' | 'audit';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickScan: () => void;
  assetCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickScan,
  assetCount
}) => {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SIMAS</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sekolah
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistem Inventaris & Aset Terpadu
              </p>
            </div>
          </div>

          {/* Nav Items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => onSelectTab('assets')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'assets'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Data Aset</span>
              {assetCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                  {assetCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('scanner')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'scanner'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Pindai QR</span>
            </button>

            <button
              onClick={() => onSelectTab('print-labels')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'print-labels'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label QR</span>
            </button>

            <button
              onClick={() => onSelectTab('locations')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'locations'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Ruangan</span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'reports'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Laporan Otomatis</span>
            </button>

            <button
              onClick={() => onSelectTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'audit'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Audit</span>
            </button>
          </nav>

          {/* Right Actions: Quick Scan & Auth */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenQuickScan}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all shadow-emerald-700/20 active:scale-95"
              title="Buka Kamera Pemindai QR"
            >
              <Camera className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">Pindai QR</span>
            </button>

            {/* Auth status */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 mr-0.5" />
                          Admin Sarpras
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Staf Sekolah</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Petugas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-between overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200/80 gap-2 scrollbar-none text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'dashboard' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Ringkasan</span>
        </button>
        <button
          onClick={() => onSelectTab('assets')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'assets' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Data Aset</span>
        </button>
        <button
          onClick={() => onSelectTab('scanner')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'scanner' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pindai QR</span>
        </button>
        <button
          onClick={() => onSelectTab('print-labels')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'print-labels' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Label QR</span>
        </button>
        <button
          onClick={() => onSelectTab('locations')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'locations' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Ruangan</span>
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'reports' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Laporan</span>
        </button>
        <button
          onClick={() => onSelectTab('audit')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            currentTab === 'audit' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit</span>
        </button>
      </div>
    </header>
  );
};
