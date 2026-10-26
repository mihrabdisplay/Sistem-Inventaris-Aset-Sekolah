import React from 'react';
import { 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Coins, 
  QrCode, 
  Plus, 
  FileText, 
  Printer, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { SchoolAsset, SchoolLocation, AuditLogItem } from '../types';
import { formatRupiah } from '../utils/qrUtils';
import { NavTab } from './Navbar';

interface DashboardProps {
  assets: SchoolAsset[];
  locations: SchoolLocation[];
  auditLogs: AuditLogItem[];
  onSelectTab: (tab: NavTab) => void;
  onOpenAddAsset: () => void;
  onOpenQuickScan: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  assets,
  locations,
  auditLogs,
  onSelectTab,
  onOpenAddAsset,
  onOpenQuickScan,
  onSeedData,
  isSeeding
}) => {
  // Calculations
  const totalItems = assets.length;
  const totalUnits = assets.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalValuation = assets.reduce(
    (sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 
    0
  );

  const baikCount = assets.filter(a => a.condition === 'Baik').reduce((s, a) => s + (Number(a.quantity) || 1), 0);
  const rusakRinganCount = assets.filter(a => a.condition === 'Rusak Ringan').reduce((s, a) => s + (Number(a.quantity) || 1), 0);
  const rusakBeratCount = assets.filter(a => a.condition === 'Rusak Berat').reduce((s, a) => s + (Number(a.quantity) || 1), 0);
  const perbaikanCount = assets.filter(a => a.condition === 'Dalam Perbaikan').reduce((s, a) => s + (Number(a.quantity) || 1), 0);
  const dihapusCount = assets.filter(a => a.condition === 'Dihapuskan').reduce((s, a) => s + (Number(a.quantity) || 1), 0);

  const goodPercentage = totalUnits > 0 ? Math.round((baikCount / totalUnits) * 100) : 0;
  const damagedPercentage = totalUnits > 0 ? Math.round(((rusakRinganCount + rusakBeratCount) / totalUnits) * 100) : 0;

  // Category counts
  const categoryMap: Record<string, number> = {};
  assets.forEach(a => {
    categoryMap[a.category] = (categoryMap[a.category] || 0) + (Number(a.quantity) || 1);
  });
  const categoryList = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  // Location counts
  const locationMap: Record<string, number> = {};
  assets.forEach(a => {
    locationMap[a.location] = (locationMap[a.location] || 0) + (Number(a.quantity) || 1);
  });
  const locationList = Object.entries(locationMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Manajemen Sarana & Prasarana Digital
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sistem Inventaris & Aset Sekolah (SIMAS)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Pantau kondisi barang, kelola inventaris tiap ruangan secara presisi, cetak label barcode QR siap tempel, dan audit aset fisik dengan kamera instan.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenQuickScan}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Mulai Pindai QR Aset</span>
            </button>
            <button
              onClick={onOpenAddAsset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-semibold rounded-xl backdrop-blur-xs transition-all border border-white/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset Baru</span>
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Laporan Otomatis</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
          <Boxes className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* Empty State Seed Suggestion */}
      {assets.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Database Inventaris Masih Kosong</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Ingin langsung mencoba? Muat data sampel sekolah (PC Lab, Proyektor, Meja Kayu, Genset, Mikroskop IPA, Ruangan dll) dalam 1 klik!
              </p>
            </div>
          </div>
          <button
            onClick={onSeedData}
            disabled={isSeeding}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs whitespace-nowrap active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSeeding ? 'Memuat Data...' : 'Muat Contoh Data Sekolah'}
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Barang / Unit */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Fisik Aset
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalUnits.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-500 font-medium">unit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dari <span className="font-semibold text-slate-700">{totalItems}</span> nomor registrasi aset
            </p>
          </div>
        </div>

        {/* Valuasi Nilai Aset */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estimasi Nilai Aset
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate" title={formatRupiah(totalValuation)}>
              {formatRupiah(totalValuation)}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Total akumulasi sarpras sekolah
            </p>
          </div>
        </div>

        {/* Tingkat Kelayakan / Baik % */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kondisi Layak (Baik)
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {goodPercentage}%
              </span>
              <span className="text-xs text-slate-500">({baikCount} unit)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${goodPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Butuh Perbaikan / Rusak */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Perlu Perhatian / Rusak
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {rusakRinganCount + rusakBeratCount + perbaikanCount}
              </span>
              <span className="text-xs text-slate-500">unit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-amber-700 font-semibold">{rusakRinganCount}</span> ringan,{' '}
              <span className="text-rose-600 font-semibold">{rusakBeratCount}</span> berat
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Condition Visual Breakdown & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Condition Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Rekapitulasi Fisik Kondisi Barang</h2>
              <p className="text-xs text-slate-500">Pemetaan status kelayakan sarana prasarana sekolah</p>
            </div>
            <button
              onClick={() => onSelectTab('reports')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>Lihat Detail Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Multi-colored Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
              <div
                style={{ width: `${totalUnits > 0 ? (baikCount / totalUnits) * 100 : 0}%` }}
                className="bg-emerald-500"
                title={`Baik: ${baikCount} unit`}
              />
              <div
                style={{ width: `${totalUnits > 0 ? (rusakRinganCount / totalUnits) * 100 : 0}%` }}
                className="bg-amber-400"
                title={`Rusak Ringan: ${rusakRinganCount} unit`}
              />
              <div
                style={{ width: `${totalUnits > 0 ? (rusakBeratCount / totalUnits) * 100 : 0}%` }}
                className="bg-rose-500"
                title={`Rusak Berat: ${rusakBeratCount} unit`}
              />
              <div
                style={{ width: `${totalUnits > 0 ? (perbaikanCount / totalUnits) * 100 : 0}%` }}
                className="bg-sky-500"
                title={`Dalam Perbaikan: ${perbaikanCount} unit`}
              />
            </div>

            {/* Condition Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-medium text-slate-700">Baik</div>
                  <div className="font-bold text-emerald-700 text-sm">{baikCount} unit</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <div className="font-medium text-slate-700">Rusak Ringan</div>
                  <div className="font-bold text-amber-700 text-sm">{rusakRinganCount} unit</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/60 border border-rose-100">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <div>
                  <div className="font-medium text-slate-700">Rusak Berat</div>
                  <div className="font-bold text-rose-700 text-sm">{rusakBeratCount} unit</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50/60 border border-sky-100">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <div>
                  <div className="font-medium text-slate-700">Dalam Perbaikan</div>
                  <div className="font-bold text-sky-700 text-sm">{perbaikanCount} unit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 mb-2.5 uppercase tracking-wider">
              Kategori Sarpras Terbanyak
            </h4>
            <div className="space-y-2">
              {categoryList.slice(0, 4).map(([cat, count]) => {
                const pct = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="text-slate-500 font-semibold">{count} unit ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-700 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Shortcuts & Room Overview */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Aset per Ruangan</h3>
              <button
                onClick={() => onSelectTab('locations')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Semua Ruangan
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {locationList.length > 0 ? (
                locationList.map(([locName, count]) => (
                  <div key={locName} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-800 font-medium truncate">{locName}</span>
                    </div>
                    <span className="font-bold text-slate-700 px-2 py-0.5 bg-slate-100 rounded-md">
                      {count} unit
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 py-6 text-center italic">
                  Belum ada data ruangan terdaftar
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onSelectTab('print-labels')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Label QR Kode Barang</span>
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Format Laporan Cetak Resmi BOS/Dinas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent QR Audits */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Aktivitas Audit & Pemindaian QR Terbaru</h3>
              <p className="text-xs text-slate-500">Log verifikasi fisik langsung di lapangan oleh tim sarpras</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('audit')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            <span>Lihat Semua Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Kode Aset</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3">Lokasi / Ruangan</th>
                  <th className="py-2.5 px-3">Hasil Kondisi</th>
                  <th className="py-2.5 px-3">Petugas Audit</th>
                  <th className="py-2.5 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{log.assetCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{log.assetName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.location || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.newCondition === 'Baik' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.newCondition === 'Rusak Ringan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.newCondition || 'Diperiksa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{log.scannedBy}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            <QrCode className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Belum ada catatan pemindaian QR code.</p>
            <p className="mt-1">Gunakan tombol <strong>Pindai QR</strong> untuk memulai verifikasi aset sekolah.</p>
          </div>
        )}
      </div>
    </div>
  );
};
