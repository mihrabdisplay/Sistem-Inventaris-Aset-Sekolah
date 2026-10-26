import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Edit3, 
  Trash2, 
  QrCode, 
  CheckSquare, 
  Square, 
  Eye, 
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Coins,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { SchoolAsset, SchoolLocation, AssetCategory, AssetCondition } from '../types';
import { formatRupiah, generateQrDataUrl } from '../utils/qrUtils';

interface AssetListProps {
  assets: SchoolAsset[];
  locations: SchoolLocation[];
  onAddAsset: () => void;
  onEditAsset: (asset: SchoolAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  onOpenAuditForAsset: (asset: SchoolAsset) => void;
  onPrintSelected: (assetIds: string[]) => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  locations,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  onOpenAuditForAsset,
  onPrintSelected,
  onSeedData,
  isSeeding
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [quickQrPreviewAsset, setQuickQrPreviewAsset] = useState<SchoolAsset | null>(null);
  const [quickQrDataUrl, setQuickQrDataUrl] = useState<string>('');

  // Handle Quick QR Modal
  const handleShowQrPreview = async (asset: SchoolAsset) => {
    setQuickQrPreviewAsset(asset);
    const url = await generateQrDataUrl(asset.assetCode);
    setQuickQrDataUrl(url);
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.personInCharge && item.personInCharge.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesLoc = selectedLocation === 'all' || item.location === selectedLocation;
      const matchesCond = selectedCondition === 'all' || item.condition === selectedCondition;

      return matchesSearch && matchesCat && matchesLoc && matchesCond;
    });
  }, [assets, searchTerm, selectedCategory, selectedLocation, selectedCondition]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedAssetIds.includes(id)) {
      setSelectedAssetIds(selectedAssetIds.filter(item => item !== id));
    } else {
      setSelectedAssetIds([...selectedAssetIds, id]);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Inventaris Aset Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Total {assets.length} item barang terdaftar dalam sistem sarpras
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedAssetIds.length > 0 && (
            <button
              onClick={() => onPrintSelected(selectedAssetIds)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Label ({selectedAssetIds.length})</span>
            </button>
          )}

          <button
            onClick={onAddAsset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aset Baru</span>
          </button>

          {assets.length === 0 && (
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Memuat...' : 'Muat Contoh Data'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode aset, nama, penanggung jawab..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700"
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
          </div>

          {/* Location Dropdown */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700"
            >
              <option value="all">Semua Ruangan</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700"
            >
              <option value="all">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              <option value="Dihapuskan">Dihapuskan</option>
            </select>
          </div>
        </div>

        {/* Status / Active selection indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-medium hover:text-slate-800 cursor-pointer"
            >
              {selectedAssetIds.length > 0 && selectedAssetIds.length === filteredAssets.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedAssetIds.length > 0 
                  ? `Terpilih ${selectedAssetIds.length} dari ${filteredAssets.length} aset` 
                  : 'Pilih Semua'}
              </span>
            </button>
          </div>

          <div>
            Menampilkan <span className="font-semibold text-slate-700">{filteredAssets.length}</span> aset
          </div>
        </div>
      </div>

      {/* Assets Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="w-10 py-3 px-3 text-center">
                <input
                  type="checkbox"
                  checked={filteredAssets.length > 0 && selectedAssetIds.length === filteredAssets.length}
                  onChange={toggleSelectAll}
                  className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-3 px-3">Kode Aset</th>
              <th className="py-3 px-3">Nama Barang</th>
              <th className="py-3 px-3">Kategori</th>
              <th className="py-3 px-3">Lokasi / Ruangan</th>
              <th className="py-3 px-3 text-center">Jml</th>
              <th className="py-3 px-3">Kondisi</th>
              <th className="py-3 px-3 text-right">Nilai Satuan</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                return (
                  <tr 
                    key={asset.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(asset.id)}
                        className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {asset.assetCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{asset.name}</div>
                      {asset.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{asset.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {asset.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{asset.location}</span>
                      </div>
                      {asset.personInCharge && (
                        <div className="text-[10px] text-slate-400">PJ: {asset.personInCharge}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {asset.quantity}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        asset.condition === 'Baik'
                          ? 'bg-emerald-100 text-emerald-800'
                          : asset.condition === 'Rusak Ringan'
                          ? 'bg-amber-100 text-amber-800'
                          : asset.condition === 'Rusak Berat'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 whitespace-nowrap font-medium">
                      {asset.price ? formatRupiah(asset.price) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleShowQrPreview(asset)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Kode QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenAuditForAsset(asset)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Audit / Pindai Lapangan"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditAsset(asset)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Ubah Data Aset"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus aset "${asset.name}" (${asset.assetCode})?`)) {
                              onDeleteAsset(asset.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Aset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada aset yang sesuai dengan kriteria filter atau pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assets Card View (Mobile) */}
      <div className="md:hidden space-y-3">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const isSelected = selectedAssetIds.includes(asset.id);
            return (
              <div 
                key={asset.id} 
                className={`bg-white rounded-xl p-4 border transition-colors space-y-3 shadow-xs ${
                  isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(asset.id)}
                      className="mt-1 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        {asset.assetCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{asset.name}</h3>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                    asset.condition === 'Baik'
                      ? 'bg-emerald-100 text-emerald-800'
                      : asset.condition === 'Rusak Ringan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {asset.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-b border-slate-100 py-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{asset.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{asset.quantity} unit ({asset.category})</span>
                  </div>
                  {asset.price && (
                    <div className="col-span-2 text-slate-700 font-semibold">
                      {formatRupiah(asset.price)} / unit
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400">
                    Audit: {asset.lastAuditAt ? asset.lastAuditAt.split(' ')[0] : 'Belum pernah'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShowQrPreview(asset)}
                      className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                      title="Lihat QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenAuditForAsset(asset)}
                      className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      title="Audit Fisik"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditAsset(asset)}
                      className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                      title="Ubah"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus aset "${asset.name}"?`)) {
                          onDeleteAsset(asset.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-slate-400 text-xs border border-slate-200">
            Tidak ada aset yang sesuai kriteria pencarian.
          </div>
        )}
      </div>

      {/* Quick QR Code Modal */}
      {quickQrPreviewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Label Barcode QR Aset</h3>
              <button
                onClick={() => setQuickQrPreviewAsset(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block">
              {quickQrDataUrl ? (
                <img
                  src={quickQrDataUrl}
                  alt={`QR ${quickQrPreviewAsset.assetCode}`}
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Membuat QR...
                </div>
              )}
              <div className="mt-2 font-mono font-bold text-slate-900 text-sm tracking-wider">
                {quickQrPreviewAsset.assetCode}
              </div>
            </div>

            <div className="text-left text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-900">{quickQrPreviewAsset.name}</div>
              <div className="text-slate-500">Ruangan: <span className="text-slate-800 font-medium">{quickQrPreviewAsset.location}</span></div>
              <div className="text-slate-500">Kondisi: <span className="text-slate-800 font-medium">{quickQrPreviewAsset.condition}</span></div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onPrintSelected([quickQrPreviewAsset.id]);
                  setQuickQrPreviewAsset(null);
                }}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cetak Stiker Label
              </button>
              <button
                onClick={() => setQuickQrPreviewAsset(null)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
