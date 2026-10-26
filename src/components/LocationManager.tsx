import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  User, 
  Phone, 
  Boxes, 
  Printer, 
  ArrowRight,
  X,
  Save
} from 'lucide-react';
import { SchoolLocation, SchoolAsset } from '../types';

interface LocationManagerProps {
  locations: SchoolLocation[];
  assets: SchoolAsset[];
  onSaveLocation: (loc: SchoolLocation) => Promise<void>;
  onDeleteLocation: (locId: string) => Promise<void>;
  onFilterAssetsByLocation: (locationName: string) => void;
  onPrintLocationLabels: (locationName: string) => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  locations,
  assets,
  onSaveLocation,
  onDeleteLocation,
  onFilterAssetsByLocation,
  onPrintLocationLabels
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<SchoolLocation | null>(null);

  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [picName, setPicName] = useState('');
  const [picContact, setPicContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setName('');
    setBuilding('');
    setPicName('');
    setPicContact('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: SchoolLocation) => {
    setEditingLoc(loc);
    setName(loc.name);
    setBuilding(loc.building);
    setPicName(loc.picName);
    setPicContact(loc.picContact || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !building.trim() || !picName.trim()) {
      alert('Nama ruangan, gedung, dan penanggung jawab wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const locToSave: SchoolLocation = {
        id: editingLoc ? editingLoc.id : `LOC_${name.replace(/\s+/g, '_')}_${Date.now()}`,
        name: name.trim(),
        building: building.trim(),
        picName: picName.trim(),
        picContact: picContact.trim(),
        createdAt: editingLoc?.createdAt || new Date().toISOString()
      };
      await onSaveLocation(locToSave);
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan ruangan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute stats per room
  const getRoomStats = (roomName: string) => {
    const roomAssets = assets.filter(a => a.location.toLowerCase() === roomName.toLowerCase());
    const count = roomAssets.length;
    const units = roomAssets.reduce((sum, a) => sum + (Number(a.quantity) || 1), 0);
    const goodUnits = roomAssets
      .filter(a => a.condition === 'Baik')
      .reduce((sum, a) => sum + (Number(a.quantity) || 1), 0);
    return { count, units, goodUnits };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Master Ruangan & Gedung Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola data ruangan penempatan sarpras dan penanggung jawab fisik (KIR)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ruangan Baru</span>
        </button>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const stats = getRoomStats(loc.name);
          return (
            <div
              key={loc.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{loc.name}</h3>
                      <p className="text-xs text-slate-500">{loc.building}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(loc)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Ubah Ruangan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus ruangan "${loc.name}"?`)) {
                          onDeleteLocation(loc.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Hapus Ruangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* PIC Info */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">PJ: {loc.picName}</span>
                  </div>
                  {loc.picContact && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{loc.picContact}</span>
                    </div>
                  )}
                </div>

                {/* Asset Stats in this room */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Fisik</div>
                    <div className="text-sm font-bold text-emerald-800">{stats.units} unit</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Jenis Aset</div>
                    <div className="text-sm font-bold text-slate-800">{stats.count} macam</div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onPrintLocationLabels(loc.name)}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cetak Label Ruang</span>
                </button>

                <button
                  onClick={() => onFilterAssetsByLocation(loc.name)}
                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  <span>Daftar Aset ({stats.count})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Location */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingLoc ? 'Ubah Master Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="misal: Lab Multimedia / Ruang Kelas IX-A"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gedung / Lokasi / Lantai *
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="misal: Gedung C Lantai 2"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Penanggung Jawab Ruangan (PIC) *
                </label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  placeholder="misal: Drs. Suwardi / Wali Kelas"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kontak WhatsApp / No. HP PIC
                </label>
                <input
                  type="text"
                  value={picContact}
                  onChange={(e) => setPicContact(e.target.value)}
                  placeholder="misal: 0812-3456-7890"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
