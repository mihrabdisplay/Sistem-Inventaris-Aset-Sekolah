import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  QrCode, 
  Calendar, 
  MapPin, 
  User, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditHistoryProps {
  logs: AuditLogItem[];
  onOpenQuickScan: () => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  logs,
  onOpenQuickScan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConditionFilter, setSelectedConditionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.scannedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.location && log.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCond =
      selectedConditionFilter === 'all' || log.newCondition === selectedConditionFilter;

    return matchesSearch && matchesCond;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Riwayat Audit & Pemindaian QR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Jejak digital verifikasi fisik kondisi inventaris sarpras sekolah
          </p>
        </div>

        <button
          onClick={onOpenQuickScan}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>Pindai QR Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode aset, nama barang, petugas audit..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedConditionFilter}
          onChange={(e) => setSelectedConditionFilter(e.target.value)}
          className="py-2 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Semua Kondisi Hasil</option>
          <option value="Baik">Kondisi Baik</option>
          <option value="Rusak Ringan">Rusak Ringan</option>
          <option value="Rusak Berat">Rusak Berat</option>
          <option value="Dalam Perbaikan">Dalam Perbaikan</option>
        </select>

        <div className="text-slate-500 ml-auto">
          Total <strong className="text-slate-800">{filteredLogs.length}</strong> log rekaman
        </div>
      </div>

      {/* Timeline / Table of Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu Audit</th>
                  <th className="py-3 px-4">Kode Aset</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Lokasi Ruang</th>
                  <th className="py-3 px-4 text-center">Perubahan Kondisi</th>
                  <th className="py-3 px-4">Petugas Pemeriksa</th>
                  <th className="py-3 px-4">Catatan Temuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                        {log.assetCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {log.assetName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{log.location || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {log.previousCondition && log.previousCondition !== log.newCondition && (
                          <>
                            <span className="text-slate-400 line-through text-[10px]">
                              {log.previousCondition}
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                          </>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          log.newCondition === 'Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.newCondition === 'Rusak Ringan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.newCondition || 'Diperiksa'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.scannedBy}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Belum ada riwayat audit fisik</p>
            <p className="text-slate-400">
              Setiap kali tim memindai kode QR aset dan menyimpan kondisi, catatan audit akan muncul di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
