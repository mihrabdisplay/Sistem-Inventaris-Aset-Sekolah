import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Building, Tag, DollarSign, Layers } from 'lucide-react';
import { SchoolAsset, SchoolLocation, AssetCategory, AssetCondition, AssetStatus } from '../types';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: SchoolAsset) => Promise<void>;
  editingAsset?: SchoolAsset | null;
  locations: SchoolLocation[];
  existingAssetsCount: number;
}

const CATEGORIES: AssetCategory[] = [
  'Elektronik',
  'Furnitur',
  'Peralatan Lab',
  'Buku & Media',
  'Sarana Olahraga',
  'Kendaraan/Mesin',
  'Lainnya'
];

const CONDITIONS: AssetCondition[] = [
  'Baik',
  'Rusak Ringan',
  'Rusak Berat',
  'Dalam Perbaikan',
  'Dihapuskan'
];

const STATUSES: AssetStatus[] = [
  'Tersedia',
  'Dipinjam',
  'Dalam Perbaikan',
  'Dihapuskan'
];

const FUND_SOURCES = [
  'BOS Reguler',
  'BOS Kinerja',
  'DAK Fisik Pendidikan',
  'Komite Sekolah',
  'APBD Provinsi/Kota',
  'Hibah / Alumni',
  'Yayasan',
  'Lainnya'
];

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  locations,
  existingAssetsCount
}) => {
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Elektronik');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('Baik');
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseYear, setPurchaseYear] = useState<number>(new Date().getFullYear());
  const [sourceOfFunds, setSourceOfFunds] = useState('BOS Reguler');
  const [price, setPrice] = useState<number>(0);
  const [personInCharge, setPersonInCharge] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AssetStatus>('Tersedia');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingAsset) {
      setAssetCode(editingAsset.assetCode);
      setName(editingAsset.name);
      setCategory(editingAsset.category);
      setLocation(editingAsset.location);
      setCondition(editingAsset.condition);
      setQuantity(editingAsset.quantity || 1);
      setPurchaseYear(editingAsset.purchaseYear || new Date().getFullYear());
      setSourceOfFunds(editingAsset.sourceOfFunds || 'BOS Reguler');
      setPrice(editingAsset.price || 0);
      setPersonInCharge(editingAsset.personInCharge || '');
      setNotes(editingAsset.notes || '');
      setStatus(editingAsset.status || 'Tersedia');
    } else {
      // Generate standard incremental asset code
      const nextNum = String(existingAssetsCount + 1).padStart(3, '0');
      setAssetCode(`AST-SARPRAS-${nextNum}`);
      setName('');
      setCategory('Elektronik');
      setLocation(locations.length > 0 ? locations[0].name : 'Lab Komputer 1');
      setCondition('Baik');
      setQuantity(1);
      setPurchaseYear(new Date().getFullYear());
      setSourceOfFunds('BOS Reguler');
      setPrice(0);
      setPersonInCharge('');
      setNotes('');
      setStatus('Tersedia');
    }
    setErrorMsg('');
  }, [editingAsset, isOpen, locations, existingAssetsCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama barang tidak boleh kosong.');
      return;
    }
    if (!assetCode.trim()) {
      setErrorMsg('Kode aset harus diisi.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Lokasi atau ruangan harus dipilih.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const assetToSave: SchoolAsset = {
        id: editingAsset ? editingAsset.id : assetCode.trim().replace(/\s+/g, '-'),
        assetCode: assetCode.trim(),
        name: name.trim(),
        category,
        location: location.trim(),
        condition,
        quantity: Math.max(1, Number(quantity) || 1),
        purchaseYear: Number(purchaseYear) || new Date().getFullYear(),
        sourceOfFunds,
        price: Number(price) >= 0 ? Number(price) : 0,
        personInCharge: personInCharge.trim(),
        notes: notes.trim(),
        status,
        lastAuditAt: editingAsset?.lastAuditAt,
        lastAuditBy: editingAsset?.lastAuditBy,
        createdAt: editingAsset?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(assetToSave);
      onClose();
    } catch (err: any) {
      console.error('Save failed:', err);
      setErrorMsg(err.message || 'Gagal menyimpan aset sekolah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingAsset ? 'Ubah Data Aset Sekolah' : 'Registrasi Aset Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Isi spesifikasi lengkap sarana prasarana sekolah
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Kode Aset & Nama Barang */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kode Aset (Unik) *
              </label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
                placeholder="misal: AST-LAB-01"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-bold bg-slate-50/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Barang / Alat Inventaris *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Proyektor Epson EB-E500"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Kategori & Lokasi Ruangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Sarpras *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lokasi / Ruangan Penempatan *
              </label>
              <div className="flex gap-2">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.building})</option>
                  ))}
                  <option value="Ruang Kelas VII-A">Ruang Kelas VII-A</option>
                  <option value="Ruang Kelas VII-B">Ruang Kelas VII-B</option>
                  <option value="Ruang Kelas VIII-A">Ruang Kelas VIII-A</option>
                  <option value="Ruang Guru & Tata Usaha">Ruang Guru & Tata Usaha</option>
                  <option value="Perpustakaan">Perpustakaan</option>
                  <option value="Lab Komputer 1">Lab Komputer 1</option>
                  <option value="Laboratorium IPA Terpadu">Laboratorium IPA Terpadu</option>
                  <option value="UKS">Ruang UKS</option>
                  <option value="Gudang Sarpras">Gudang Sarpras</option>
                  <option value="Aula Utama Serbaguna">Aula Utama Serbaguna</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Kondisi, Jumlah, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kondisi Fisik Barang *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kuantitas / Jumlah Unit *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Penggunaan *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Anggaran, Tahun, Nilai (Rp) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sumber Anggaran
              </label>
              <select
                value={sourceOfFunds}
                onChange={(e) => setSourceOfFunds(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {FUND_SOURCES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun Pengadaan
              </label>
              <input
                type="number"
                min="1980"
                max="2100"
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harga Perolehan (Rp / Unit)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="misal: 6500000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 5: Penanggung Jawab */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Penanggung Jawab Aset / Ruangan (PIC)
            </label>
            <input
              type="text"
              value={personInCharge}
              onChange={(e) => setPersonInCharge(e.target.value)}
              placeholder="misal: Drs. Budi Santoso / Guru Mapel IPA"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Row 6: Spesifikasi / Catatan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Spesifikasi Teknis / Nomor Seri / Catatan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nomor seri pabrik, merk spesifik, atau kondisi fisik khusus..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Aset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
