import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  CheckSquare, 
  Square, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Tag, 
  FileCheck2,
  Settings
} from 'lucide-react';
import { SchoolAsset, SchoolLocation } from '../types';
import { generateQrDataUrl } from '../utils/qrUtils';

interface QRPrintSheetProps {
  assets: SchoolAsset[];
  locations: SchoolLocation[];
  preSelectedAssetIds?: string[];
  schoolName: string;
}

interface AssetWithQr extends SchoolAsset {
  qrDataUrl: string;
}

export const QRPrintSheet: React.FC<QRPrintSheetProps> = ({
  assets,
  locations,
  preSelectedAssetIds = [],
  schoolName
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [labelSize, setLabelSize] = useState<'standard' | 'compact' | 'badge'>('standard');
  const [headerTitle, setHeaderTitle] = useState(schoolName || 'INVENTARIS SEKOLAH');
  const [assetsWithQr, setAssetsWithQr] = useState<AssetWithQr[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize selected IDs
  useEffect(() => {
    if (preSelectedAssetIds.length > 0) {
      setSelectedIds(preSelectedAssetIds);
    } else {
      setSelectedIds(assets.map(a => a.id));
    }
  }, [preSelectedAssetIds, assets]);

  // Filtered assets
  const filteredAssets = assets.filter(item => {
    const matchesLoc = selectedLocation === 'all' || item.location === selectedLocation;
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesLoc && matchesCat;
  });

  // Generate QR data URLs for selected assets
  useEffect(() => {
    let isCancelled = false;
    const generateAll = async () => {
      setIsGenerating(true);
      const targetAssets = assets.filter(a => selectedIds.includes(a.id));
      const results: AssetWithQr[] = [];

      for (const asset of targetAssets) {
        if (isCancelled) return;
        const qrUrl = await generateQrDataUrl(asset.assetCode);
        results.push({ ...asset, qrDataUrl: qrUrl });
      }

      if (!isCancelled) {
        setAssetsWithQr(results);
        setIsGenerating(false);
      }
    };

    generateAll();
    return () => {
      isCancelled = true;
    };
  }, [selectedIds, assets]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map(a => a.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Non-printable Control Panel */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Generator & Cetak Label QR Aset
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Cetak stiker barcode inventaris untuk ditempel pada meja, komputer, proyektor, atau pintu ruangan
            </p>
          </div>

          <button
            onClick={handlePrint}
            disabled={assetsWithQr.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak {assetsWithQr.length} Label Sekarang</span>
          </button>
        </div>

        {/* Filter and Configuration Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Filter Ruangan
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Ruangan ({assets.length})</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Filter Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Format Ukuran Label
              </label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="standard">Standar Stiker (3 kolom per baris)</option>
                <option value="compact">Kompak Kecil (4 kolom per baris)</option>
                <option value="badge">Besar / Kartu Aset (2 kolom)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teks Header Label
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                placeholder="misal: SMPN 1 TELADAN"
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-700 cursor-pointer"
            >
              {selectedIds.length === filteredAssets.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Pilih Semua yang Ditampilkan ({selectedIds.length} terpilih)</span>
            </button>

            <span className="text-slate-500">
              Siap cetak di kertas stiker label atau kertas A4 standar
            </span>
          </div>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
        {/* Notice for preview */}
        <div className="no-print mb-6 pb-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Pratinjau Hasil Cetak Label Stiker Inventaris:</span>
          </div>
          {isGenerating && (
            <span className="text-emerald-700 font-semibold animate-pulse">
              Memproses render barcode QR...
            </span>
          )}
        </div>

        {assetsWithQr.length > 0 ? (
          <div
            className={`grid gap-4 print:gap-3 ${
              labelSize === 'compact'
                ? 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4'
                : labelSize === 'badge'
                ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-3 print:grid-cols-3'
            }`}
          >
            {assetsWithQr.map((asset) => (
              <div
                key={asset.id}
                className="relative border-2 border-dashed border-slate-300 print:border-slate-800 rounded-xl p-3.5 bg-white flex flex-col justify-between break-inside-avoid shadow-xs print:shadow-none text-slate-900"
              >
                {/* Header */}
                <div className="text-center border-b border-slate-200 print:border-slate-800 pb-1.5 mb-2">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800 line-clamp-1">
                    {headerTitle}
                  </div>
                  <div className="text-[9px] text-slate-500 print:text-slate-700 uppercase tracking-widest font-semibold">
                    KARTU INVENTARIS BARANG
                  </div>
                </div>

                {/* Content: QR and details */}
                <div className="flex items-center gap-3 my-1">
                  <div className="shrink-0 p-1 bg-white border border-slate-200 print:border-slate-800 rounded-lg">
                    {asset.qrDataUrl ? (
                      <img
                        src={asset.qrDataUrl}
                        alt={`QR ${asset.assetCode}`}
                        className="w-20 h-20 print:w-22 print:h-22 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-[10px]">
                        QR
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-mono text-xs print:text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                      {asset.assetCode}
                    </div>
                    <div className="font-bold text-[11px] print:text-xs text-slate-900 line-clamp-2 leading-tight">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-slate-600 truncate">
                      Ruang: <strong>{asset.location}</strong>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Tahun: {asset.purchaseYear || '-'} • {asset.category}
                    </div>
                  </div>
                </div>

                {/* Footer with Scan Instructions */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 print:border-slate-800 flex items-center justify-between text-[8px] text-slate-500 print:text-slate-700 font-mono">
                  <span>MILIK NEGARA / SEKOLAH</span>
                  <span>SIMAS SCAN</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">
            Belum ada aset yang dipilih untuk dicetak labelnya.
          </div>
        )}
      </div>
    </div>
  );
};
