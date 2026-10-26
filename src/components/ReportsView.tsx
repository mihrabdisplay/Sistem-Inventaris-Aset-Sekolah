import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  SlidersHorizontal, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Calendar,
  Settings2,
  Check,
  Tag
} from 'lucide-react';
import { SchoolAsset, SchoolLocation, SchoolProfile, DEFAULT_SCHOOL_PROFILE } from '../types';
import { formatRupiah } from '../utils/qrUtils';

interface ReportsViewProps {
  assets: SchoolAsset[];
  locations: SchoolLocation[];
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (profile: SchoolProfile) => void;
}

type ReportType = 'biib' | 'kondisi' | 'ruangan' | 'anggaran';

export const ReportsView: React.FC<ReportsViewProps> = ({
  assets,
  locations,
  schoolProfile,
  onUpdateSchoolProfile
}) => {
  const [reportType, setReportType] = useState<ReportType>('biib');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterFund, setFilterFund] = useState<string>('all');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Local state for school profile modal
  const [tempProfile, setTempProfile] = useState<SchoolProfile>(schoolProfile);

  // Filtered Assets
  const filteredAssets = assets.filter(a => {
    const matchLoc = filterLocation === 'all' || a.location === filterLocation;
    const matchCat = filterCategory === 'all' || a.category === filterCategory;
    const matchCond = filterCondition === 'all' || a.condition === filterCondition;
    const matchFund = filterFund === 'all' || a.sourceOfFunds === filterFund;
    return matchLoc && matchCat && matchCond && matchFund;
  });

  // Calculations for current report
  const reportUnits = filteredAssets.reduce((sum, a) => sum + (Number(a.quantity) || 1), 0);
  const reportValuation = filteredAssets.reduce(
    (sum, a) => sum + ((Number(a.price) || 0) * (Number(a.quantity) || 1)), 
    0
  );
  const baikUnits = filteredAssets.filter(a => a.condition === 'Baik').reduce((s, a) => s + (Number(a.quantity) || 1), 0);
  const rusakUnits = filteredAssets.filter(a => a.condition === 'Rusak Ringan' || a.condition === 'Rusak Berat').reduce((s, a) => s + (Number(a.quantity) || 1), 0);

  // Date formatting for official document
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode Aset',
      'Nama Barang',
      'Kategori',
      'Lokasi Ruangan',
      'Kondisi',
      'Kuantitas',
      'Tahun Pengadaan',
      'Sumber Dana',
      'Harga Satuan (Rp)',
      'Total Nilai (Rp)',
      'Penanggung Jawab',
      'Spesifikasi / Catatan',
      'Audit Terakhir'
    ];

    const rows = filteredAssets.map((asset, index) => [
      index + 1,
      `"${asset.assetCode}"`,
      `"${asset.name.replace(/"/g, '""')}"`,
      `"${asset.category}"`,
      `"${asset.location}"`,
      `"${asset.condition}"`,
      asset.quantity,
      asset.purchaseYear || '-',
      `"${asset.sourceOfFunds || '-'}"`,
      asset.price || 0,
      (asset.price || 0) * (asset.quantity || 1),
      `"${(asset.personInCharge || '-').replace(/"/g, '""')}"`,
      `"${(asset.notes || '-').replace(/"/g, '""')}"`,
      `"${asset.lastAuditAt || '-'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Aset_Sekolah_${reportType.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolProfile(tempProfile);
    setIsEditProfileOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Control Panel (Hidden during print) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Laporan Otomatis Sarana & Prasarana
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Format standar dinas pendidikan & pelaporan BOS dengan kop surat dan tanda tangan resmi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempProfile(schoolProfile);
                setIsEditProfileOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Atur Kop & TTD Sekolah</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Report Types Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setReportType('biib')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              reportType === 'biib' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Buku Induk Inventaris</span>
          </button>
          <button
            onClick={() => setReportType('kondisi')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              reportType === 'kondisi' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Rekapitulasi Kerusakan</span>
          </button>
          <button
            onClick={() => setReportType('ruangan')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              reportType === 'ruangan' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Inventaris Ruangan (KIR)</span>
          </button>
          <button
            onClick={() => setReportType('anggaran')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              reportType === 'anggaran' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Rekap Sumber Dana & Nilai</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filter Laporan:</span>
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Ruangan</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Furnitur">Furnitur</option>
            <option value="Peralatan Lab">Peralatan Lab</option>
            <option value="Buku & Media">Buku & Media</option>
            <option value="Sarana Olahraga">Sarana Olahraga</option>
            <option value="Kendaraan/Mesin">Kendaraan/Mesin</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Baik">Hanya Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
            <option value="Dalam Perbaikan">Dalam Perbaikan</option>
            <option value="Dihapuskan">Dihapuskan</option>
          </select>

          <select
            value={filterFund}
            onChange={(e) => setFilterFund(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Sumber Dana</option>
            <option value="BOS Reguler">BOS Reguler</option>
            <option value="BOS Kinerja">BOS Kinerja</option>
            <option value="DAK Fisik Pendidikan">DAK Fisik</option>
            <option value="Komite Sekolah">Komite Sekolah</option>
          </select>

          <div className="ml-auto text-slate-500">
            Terfilter: <strong className="text-slate-800">{filteredAssets.length}</strong> aset ({reportUnits} unit)
          </div>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6 text-slate-900 font-sans">
        {/* Kop Surat Resmi Sekolah */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-600">
            PEMERINTAH DAERAH DINAS PENDIDIKAN
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-slate-900">
            {schoolProfile.schoolName}
          </h2>
          <div className="text-xs text-slate-600">
            NPSN: <span className="font-semibold text-slate-800">{schoolProfile.npsn}</span> • Alamat: {schoolProfile.address}
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1 pt-2">
          <h3 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
            {reportType === 'biib' && 'BUKU INDUK INVENTARIS BARANG (SARPRAS)'}
            {reportType === 'kondisi' && 'LAPORAN REKAPITULASI KONDISI & KERUSAKAN BARANG'}
            {reportType === 'ruangan' && `DAFTAR INVENTARIS RUANGAN (KIR) - ${filterLocation === 'all' ? 'SELURUH RUANGAN' : filterLocation.toUpperCase()}`}
            {reportType === 'anggaran' && 'LAPORAN VALUASI INVENTARIS BERDASARKAN SUMBER ANGGARAN'}
          </h3>
          <p className="text-xs text-slate-500">
            Periode Laporan Tahun Ajaran 2026/2027 • Tanggal Cetak: {todayFormatted}
          </p>
        </div>

        {/* Statistical Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 print:bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div className="text-slate-500">Total Jenis Barang:</div>
            <div className="text-sm font-bold text-slate-900">{filteredAssets.length} nomor reg</div>
          </div>
          <div>
            <div className="text-slate-500">Total Unit Fisik:</div>
            <div className="text-sm font-bold text-slate-900">{reportUnits} unit</div>
          </div>
          <div>
            <div className="text-slate-500">Kondisi Baik / Rusak:</div>
            <div className="text-sm font-bold text-emerald-800">
              {baikUnits} baik / <span className="text-rose-700">{rusakUnits} rusak</span>
            </div>
          </div>
          <div>
            <div className="text-slate-500">Total Nilai Perolehan:</div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {formatRupiah(reportValuation)}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300 print:border-slate-800 border-collapse">
            <thead className="bg-slate-100 print:bg-slate-200 text-slate-800 font-bold border-b border-slate-300 print:border-slate-800">
              <tr>
                <th className="p-2 border border-slate-300 print:border-slate-800 text-center w-8">No</th>
                <th className="p-2 border border-slate-300 print:border-slate-800">Kode Aset</th>
                <th className="p-2 border border-slate-300 print:border-slate-800">Nama Barang / Spesifikasi</th>
                <th className="p-2 border border-slate-300 print:border-slate-800">Kategori</th>
                <th className="p-2 border border-slate-300 print:border-slate-800">Lokasi / Ruang</th>
                <th className="p-2 border border-slate-300 print:border-slate-800 text-center w-12">Jml</th>
                <th className="p-2 border border-slate-300 print:border-slate-800 text-center">Kondisi</th>
                <th className="p-2 border border-slate-300 print:border-slate-800">Sumber Dana</th>
                <th className="p-2 border border-slate-300 print:border-slate-800 text-right">Nilai Satuan</th>
                <th className="p-2 border border-slate-300 print:border-slate-800 text-right">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset, index) => {
                  const itemTotal = (asset.price || 0) * (asset.quantity || 1);
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/50">
                      <td className="p-2 border border-slate-300 print:border-slate-800 text-center">{index + 1}</td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 font-mono font-bold whitespace-nowrap">
                        {asset.assetCode}
                      </td>
                      <td className="p-2 border border-slate-300 print:border-slate-800">
                        <div className="font-semibold">{asset.name}</div>
                        {asset.notes && (
                          <div className="text-[10px] text-slate-500 italic">{asset.notes}</div>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 whitespace-nowrap">{asset.category}</td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 whitespace-nowrap">{asset.location}</td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 text-center font-bold">{asset.quantity}</td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 text-center whitespace-nowrap font-semibold">
                        <span className={
                          asset.condition === 'Baik' ? 'text-emerald-700' :
                          asset.condition === 'Rusak Ringan' ? 'text-amber-700' : 'text-rose-700'
                        }>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 whitespace-nowrap text-[11px]">{asset.sourceOfFunds || '-'}</td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 text-right whitespace-nowrap">
                        {asset.price ? formatRupiah(asset.price) : '-'}
                      </td>
                      <td className="p-2 border border-slate-300 print:border-slate-800 text-right font-medium whitespace-nowrap">
                        {formatRupiah(itemTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 border border-slate-300">
                    Tidak ada data barang yang memenuhi kriteria filter laporan.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-100 print:bg-slate-200 font-bold border-t-2 border-slate-400">
              <tr>
                <td colSpan={5} className="p-2.5 text-right border border-slate-300 print:border-slate-800 uppercase">
                  Total Keseluruhan:
                </td>
                <td className="p-2.5 text-center border border-slate-300 print:border-slate-800">{reportUnits} unit</td>
                <td colSpan={3} className="p-2.5 border border-slate-300 print:border-slate-800"></td>
                <td className="p-2.5 text-right border border-slate-300 print:border-slate-800 text-slate-900 whitespace-nowrap">
                  {formatRupiah(reportValuation)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Signatures Section */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs break-inside-avoid">
          <div className="space-y-16">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah</p>
            </div>
            <div>
              <p className="font-bold underline uppercase">{schoolProfile.principalName}</p>
              <p className="text-slate-600">NIP. {schoolProfile.principalNip}</p>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p>{schoolProfile.city}, {todayFormatted}</p>
              <p className="font-bold">Pengurus Sarana & Prasarana</p>
            </div>
            <div>
              <p className="font-bold underline uppercase">{schoolProfile.sarprasManagerName}</p>
              <p className="text-slate-600">NIP. {schoolProfile.sarprasManagerNip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit School Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Konfigurasi Kop Surat & Penandatangan Dokumen
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={tempProfile.schoolName}
                  onChange={(e) => setTempProfile({ ...tempProfile, schoolName: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPSN Sekolah</label>
                  <input
                    type="text"
                    value={tempProfile.npsn}
                    onChange={(e) => setTempProfile({ ...tempProfile, npsn: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kota / Domisili</label>
                  <input
                    type="text"
                    value={tempProfile.city}
                    onChange={(e) => setTempProfile({ ...tempProfile, city: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Sekolah Lengkap</label>
                <input
                  type="text"
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={tempProfile.principalName}
                    onChange={(e) => setTempProfile({ ...tempProfile, principalName: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={tempProfile.principalNip}
                    onChange={(e) => setTempProfile({ ...tempProfile, principalNip: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pengurus Sarpras</label>
                  <input
                    type="text"
                    value={tempProfile.sarprasManagerName}
                    onChange={(e) => setTempProfile({ ...tempProfile, sarprasManagerName: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Pengurus Sarpras</label>
                  <input
                    type="text"
                    value={tempProfile.sarprasManagerNip}
                    onChange={(e) => setTempProfile({ ...tempProfile, sarprasManagerNip: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Profil Kop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
