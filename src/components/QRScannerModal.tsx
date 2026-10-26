import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { 
  X, 
  Camera, 
  Upload, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Save, 
  MapPin, 
  RefreshCw,
  PlusCircle,
  FileCheck2,
  Volume2
} from 'lucide-react';
import { SchoolAsset, SchoolLocation, AssetCondition } from '../types';
import { playBeepSound, formatRupiah } from '../utils/qrUtils';
import { useAuth } from '../context/AuthContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: SchoolAsset[];
  locations: SchoolLocation[];
  onAuditAsset: (
    asset: SchoolAsset,
    newCondition: string,
    newLocation: string,
    scannedByName: string,
    notes: string
  ) => Promise<void>;
  onRegisterNewFromCode?: (scannedCode: string) => void;
  initialSelectedAsset?: SchoolAsset | null;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  assets,
  locations,
  onAuditAsset,
  onRegisterNewFromCode,
  initialSelectedAsset
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanned / Target Asset State
  const [scannedAsset, setScannedAsset] = useState<SchoolAsset | null>(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);

  // Audit Form State for scanned asset
  const [auditCondition, setAuditCondition] = useState<AssetCondition>('Baik');
  const [auditLocation, setAuditLocation] = useState<string>('');
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [auditorName, setAuditorName] = useState<string>('');
  const [isSavingAudit, setIsSavingAudit] = useState(false);
  const [auditSuccessMsg, setAuditSuccessMsg] = useState(false);

  // Manual input state
  const [manualCode, setManualCode] = useState('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'school-qr-reader';

  // Set default auditor name from logged-in user
  useEffect(() => {
    if (user?.displayName) {
      setAuditorName(user.displayName);
    } else if (user?.email) {
      setAuditorName(user.email.split('@')[0]);
    } else {
      setAuditorName('Petugas Sarpras Sekolah');
    }
  }, [user]);

  // If opened directly for a specific asset (from table action)
  useEffect(() => {
    if (initialSelectedAsset) {
      handleAssetFound(initialSelectedAsset);
    }
  }, [initialSelectedAsset]);

  // Handle Asset Recognition
  const handleAssetFound = (asset: SchoolAsset) => {
    playBeepSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    setScannedAsset(asset);
    setUnrecognizedCode(null);
    setAuditCondition(asset.condition);
    setAuditLocation(asset.location);
    setAuditNotes('');
    setAuditSuccessMsg(false);

    // Stop camera once scanned
    stopCamera();
  };

  const handleScanCode = (code: string) => {
    const cleanCode = code.trim();
    // Look up in assets by assetCode or id
    const found = assets.find(
      a => a.assetCode.toLowerCase() === cleanCode.toLowerCase() ||
           a.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (found) {
      handleAssetFound(found);
    } else {
      playBeepSound();
      setScannedAsset(null);
      setUnrecognizedCode(cleanCode);
      stopCamera();
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Back camera preferred on phones
        config,
        (decodedText) => {
          handleScanCode(decodedText);
        },
        () => {
          // scanning frame (ignore errors)
        }
      );
      setScannerActive(true);
    } catch (err: any) {
      console.warn('Camera start failed:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda dapat mengunggah foto QR code atau memasukkan kode manual di bawah.'
      );
      setScannerActive(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Camera stop error:', err);
      }
    }
    setScannerActive(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedAsset && !unrecognizedCode) {
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, scannedAsset, unrecognizedCode]);

  // Handle File Upload QR scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const result = await html5QrCodeRef.current.scanFile(file, true);
      handleScanCode(result);
    } catch (err: any) {
      alert('Tidak menemukan QR Code yang valid pada gambar ini. Coba foto lain.');
    }
  };

  // Save Physical Audit
  const handleSaveAudit = async () => {
    if (!scannedAsset) return;
    setIsSavingAudit(true);
    try {
      await onAuditAsset(
        scannedAsset,
        auditCondition,
        auditLocation,
        auditorName,
        auditNotes
      );
      setAuditSuccessMsg(true);
      setTimeout(() => {
        // Reset and prepare for next scan
        setScannedAsset(null);
        setAuditSuccessMsg(false);
        setActiveTab('camera');
      }, 1500);
    } catch (err: any) {
      alert('Gagal merekam audit: ' + err.message);
    } finally {
      setIsSavingAudit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Pemindai QR & Audit Aset
              </h2>
              <p className="text-xs text-slate-500">
                Pindai kode QR label barang untuk verifikasi fisik langsung
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Results View: Asset Found! */}
        {scannedAsset ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {auditSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="font-bold text-emerald-900 text-sm">Audit Berhasil Disimpan!</h3>
                <p className="text-xs text-emerald-700">
                  Data kondisi dan lokasi aset telah diperbarui dalam sistem serta tercatat di riwayat audit.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-sm">
                        {scannedAsset.assetCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">
                        {scannedAsset.name}
                      </h3>
                      <p className="text-xs text-slate-500">Kategori: {scannedAsset.category}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      scannedAsset.condition === 'Baik'
                        ? 'bg-emerald-100 text-emerald-800'
                        : scannedAsset.condition === 'Rusak Ringan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {scannedAsset.condition}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-slate-600">
                    <div>
                      Lokasi Terdaftar: <strong className="text-slate-800">{scannedAsset.location}</strong>
                    </div>
                    <div>
                      Penanggung Jawab: <strong className="text-slate-800">{scannedAsset.personInCharge || '-'}</strong>
                    </div>
                    {scannedAsset.lastAuditAt && (
                      <div className="col-span-2 text-[11px] text-slate-400">
                        Audit Terakhir: {scannedAsset.lastAuditAt} oleh {scannedAsset.lastAuditBy}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Input Form */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-emerald-100 shadow-xs text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Perbarui Verifikasi Kondisi Fisik Sekarang</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kondisi Hasil Cek *
                      </label>
                      <select
                        value={auditCondition}
                        onChange={(e) => setAuditCondition(e.target.value as AssetCondition)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="Baik">Kondisi Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                        <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                        <option value="Dihapuskan">Dihapuskan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Ruangan Saat Ini *
                      </label>
                      <select
                        value={auditLocation}
                        onChange={(e) => setAuditLocation(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Petugas Pemeriksa *
                    </label>
                    <input
                      type="text"
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                      required
                      placeholder="Nama Anda atau Petugas Sarpras"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Catatan Temuan Fisik
                    </label>
                    <input
                      type="text"
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="misal: Kabel HDMI kendor, layar sedikit gores, dll"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveAudit}
                      disabled={isSavingAudit}
                      className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingAudit ? 'Menyimpan...' : 'Simpan Hasil Audit'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setScannedAsset(null);
                        setActiveTab('camera');
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Pindai Lainnya
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : unrecognizedCode ? (
          /* Unrecognized Code */
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-center text-xs">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Kode Tidak Dikenal di Inventaris</h3>
              <p className="font-mono font-bold text-slate-800 text-sm mt-1 bg-white py-1 px-2 rounded-md border border-amber-200 inline-block">
                {unrecognizedCode}
              </p>
              <p className="text-amber-700 mt-2">
                Kode ini belum terdaftar pada database aset sekolah. Anda dapat mendaftarkannya sebagai aset baru.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              {onRegisterNewFromCode && (
                <button
                  onClick={() => {
                    onRegisterNewFromCode(unrecognizedCode);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Daftarkan Aset Baru</span>
                </button>
              )}
              <button
                onClick={() => {
                  setUnrecognizedCode(null);
                  setActiveTab('camera');
                }}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl"
              >
                Coba Pindai Ulang
              </button>
            </div>
          </div>
        ) : (
          /* Normal Scanner Interface */
          <div className="space-y-4">
            {/* Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'camera' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera Langsung</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Foto QR</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'manual' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Input Kode</span>
              </button>
            </div>

            {/* Camera Tab */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 aspect-square max-h-[300px] flex items-center justify-center">
                  <div id={scannerContainerId} className="w-full h-full" />
                  
                  {/* Visual Crosshair Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-xl relative shadow-lg">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
                      <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>

                {cameraError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                    {cameraError}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Suara beep aktif otomatis</span>
                  </div>
                  <button
                    onClick={startCamera}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Muat Ulang Kamera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Upload Image Tab */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Pilih Gambar atau Foto Kode QR</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ambil foto stiker QR aset dari galeri ponsel atau laptop Anda
                  </p>
                </div>
                <label className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition-colors">
                  Pilih File Gambar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Manual Code Entry Tab */}
            {activeTab === 'manual' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-800 text-xs">
                  Ketik Kode Aset (atau Nomor Barcode)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="misal: AST-LAB-001"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    onClick={() => {
                      if (manualCode.trim()) handleScanCode(manualCode.trim());
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cari Aset
                  </button>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400">Contoh kode yang tersedia:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assets.slice(0, 5).map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleScanCode(a.assetCode)}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono text-slate-700 hover:border-emerald-500 cursor-pointer"
                      >
                        {a.assetCode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
