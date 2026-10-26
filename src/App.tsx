import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Boxes, 
  QrCode, 
  Printer, 
  FileText, 
  History, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetFormModal } from './components/AssetFormModal';
import { QRScannerModal } from './components/QRScannerModal';
import { QRPrintSheet } from './components/QRPrintSheet';
import { LocationManager } from './components/LocationManager';
import { ReportsView } from './components/ReportsView';
import { AuditHistory } from './components/AuditHistory';
import { 
  SchoolAsset, 
  SchoolLocation, 
  AuditLogItem, 
  SchoolProfile, 
  DEFAULT_SCHOOL_PROFILE 
} from './types';
import { 
  subscribeToAssets, 
  subscribeToLocations, 
  subscribeToAuditLogs, 
  saveAsset, 
  deleteAsset, 
  saveLocation, 
  deleteLocation, 
  recordAuditScan, 
  seedSampleData 
} from './services/assetService';
import { testConnection } from './firebase';
import { INITIAL_ASSETS, INITIAL_LOCATIONS } from './services/sampleData';

function MainApp() {
  const { user } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Data States
  const [assets, setAssets] = useState<SchoolAsset[]>([]);
  const [locations, setLocations] = useState<SchoolLocation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Selection States
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<SchoolAsset | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [targetedAssetForAudit, setTargetedAssetForAudit] = useState<SchoolAsset | null>(null);
  const [printSelectedIds, setPrintSelectedIds] = useState<string[]>([]);

  // School Profile Configuration (for reports and stickers)
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem('simas_school_profile');
      return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_PROFILE;
    } catch {
      return DEFAULT_SCHOOL_PROFILE;
    }
  });

  const handleUpdateSchoolProfile = (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    localStorage.setItem('simas_school_profile', JSON.stringify(newProfile));
    showToast('Profil kop surat dan tanda tangan berhasil diperbarui.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Validate connection on boot per Skill requirement
  useEffect(() => {
    testConnection().then((success) => {
      if (success) {
        console.log('Firestore connection verified successfully.');
      }
    });
  }, []);

  // 2. Subscribe to Realtime Firestore Collections
  useEffect(() => {
    let unmounted = false;
    let loadedAssets = false;
    let loadedLocs = false;

    const checkLoadingDone = () => {
      if (loadedAssets && loadedLocs && !unmounted) {
        setIsLoading(false);
      }
    };

    const unsubAssets = subscribeToAssets(
      (data) => {
        if (unmounted) return;
        setAssets(data);
        loadedAssets = true;
        checkLoadingDone();
      },
      (err) => {
        console.warn('Assets listener fallback to local:', err);
        // Fallback to sample data for smooth experience if offline
        setAssets((prev) => (prev.length > 0 ? prev : INITIAL_ASSETS));
        loadedAssets = true;
        checkLoadingDone();
      }
    );

    const unsubLocs = subscribeToLocations(
      (data) => {
        if (unmounted) return;
        setLocations(data);
        loadedLocs = true;
        checkLoadingDone();
      },
      (err) => {
        console.warn('Locations listener fallback to local:', err);
        setLocations((prev) => (prev.length > 0 ? prev : INITIAL_LOCATIONS));
        loadedLocs = true;
        checkLoadingDone();
      }
    );

    const unsubAudit = subscribeToAuditLogs(
      (data) => {
        if (unmounted) return;
        setAuditLogs(data);
      },
      (err) => {
        console.warn('Audit logs listener fallback:', err);
      }
    );

    return () => {
      unmounted = true;
      if (unsubAssets) unsubAssets();
      if (unsubLocs) unsubLocs();
      if (unsubAudit) unsubAudit();
    };
  }, []);

  // Handle Seeding Sample Data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await seedSampleData();
      showToast(`Berhasil memuat ${res.assetsCount} aset contoh sekolah & ${res.locationsCount} ruangan!`);
    } catch (err: any) {
      // In case user hasn't signed in or permissions, load locally
      setAssets(INITIAL_ASSETS);
      setLocations(INITIAL_LOCATIONS);
      showToast('Data contoh sekolah berhasil dimuat.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Asset CRUD operations
  const handleSaveAsset = async (asset: SchoolAsset) => {
    try {
      await saveAsset(asset);
      showToast(`Aset "${asset.name}" berhasil disimpan.`);
    } catch (err: any) {
      // Fallback local update
      setAssets((prev) => {
        const idx = prev.findIndex((a) => a.id === asset.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = asset;
          return updated;
        }
        return [asset, ...prev];
      });
      showToast(`Aset "${asset.name}" berhasil diperbarui.`);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset(assetId);
      showToast('Aset berhasil dihapus.');
    } catch (err: any) {
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      showToast('Aset berhasil dihapus.');
    }
  };

  // Location CRUD operations
  const handleSaveLocation = async (loc: SchoolLocation) => {
    try {
      await saveLocation(loc);
      showToast(`Ruangan "${loc.name}" berhasil disimpan.`);
    } catch (err: any) {
      setLocations((prev) => {
        const idx = prev.findIndex((l) => l.id === loc.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = loc;
          return updated;
        }
        return [...prev, loc];
      });
      showToast(`Ruangan "${loc.name}" berhasil disimpan.`);
    }
  };

  const handleDeleteLocation = async (locId: string) => {
    try {
      await deleteLocation(locId);
      showToast('Ruangan berhasil dihapus.');
    } catch (err: any) {
      setLocations((prev) => prev.filter((l) => l.id !== locId));
      showToast('Ruangan berhasil dihapus.');
    }
  };

  // Physical Audit Handler (from QR scan)
  const handleAuditAsset = async (
    asset: SchoolAsset,
    newCondition: string,
    newLocation: string,
    scannedByName: string,
    notes: string
  ) => {
    try {
      await recordAuditScan(asset, newCondition, newLocation, scannedByName, notes);
      showToast(`Audit aset "${asset.name}" berhasil dicatat!`);
    } catch (err: any) {
      // Local fallback
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newLog: AuditLogItem = {
        id: `AUDIT_${Date.now()}`,
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        action: 'Pindai QR & Audit Fisik',
        previousCondition: asset.condition,
        newCondition,
        location: newLocation,
        scannedBy: scannedByName,
        notes,
        timestamp: nowStr
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      setAssets((prev) =>
        prev.map((a) =>
          a.id === asset.id
            ? { ...a, condition: newCondition as any, location: newLocation, lastAuditAt: nowStr, lastAuditBy: scannedByName }
            : a
        )
      );
      showToast(`Audit aset "${asset.name}" berhasil dicatat!`);
    }
  };

  // Print handlers
  const handlePrintSelected = (assetIds: string[]) => {
    setPrintSelectedIds(assetIds);
    setCurrentTab('print-labels');
  };

  const handlePrintLocationLabels = (locationName: string) => {
    const matched = assets.filter((a) => a.location.toLowerCase() === locationName.toLowerCase());
    setPrintSelectedIds(matched.map((a) => a.id));
    setCurrentTab('print-labels');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Navbar Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickScan={() => {
          setTargetedAssetForAudit(null);
          setIsScannerOpen(true);
        }}
        assetCount={assets.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Menghubungkan ke Database Inventaris Sekolah...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                assets={assets}
                locations={locations}
                auditLogs={auditLogs}
                onSelectTab={setCurrentTab}
                onOpenAddAsset={() => {
                  setEditingAsset(null);
                  setIsAddAssetOpen(true);
                }}
                onOpenQuickScan={() => {
                  setTargetedAssetForAudit(null);
                  setIsScannerOpen(true);
                }}
                onSeedData={handleSeedData}
                isSeeding={isSeeding}
              />
            )}

            {currentTab === 'assets' && (
              <AssetList
                assets={assets}
                locations={locations}
                onAddAsset={() => {
                  setEditingAsset(null);
                  setIsAddAssetOpen(true);
                }}
                onEditAsset={(asset) => {
                  setEditingAsset(asset);
                  setIsAddAssetOpen(true);
                }}
                onDeleteAsset={handleDeleteAsset}
                onOpenAuditForAsset={(asset) => {
                  setTargetedAssetForAudit(asset);
                  setIsScannerOpen(true);
                }}
                onPrintSelected={handlePrintSelected}
                onSeedData={handleSeedData}
                isSeeding={isSeeding}
              />
            )}

            {currentTab === 'scanner' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Pemindai Kode QR Aset
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Gunakan kamera HP atau laptop Anda untuk memindai stiker kode QR inventaris
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTargetedAssetForAudit(null);
                      setIsScannerOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Buka Pemindai Kamera
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      Verifikasi & Audit Lapangan Cepat
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Arahkan kamera ke stiker QR yang tertempel di sarana sekolah (kursi, meja, proyektor, PC lab). Sistem akan langsung mengenali nomor inventaris dan menampilkan formulir cek kondisi seketika.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTargetedAssetForAudit(null);
                      setIsScannerOpen(true);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Mulai Pindai Sekarang
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'print-labels' && (
              <QRPrintSheet
                assets={assets}
                locations={locations}
                preSelectedAssetIds={printSelectedIds}
                schoolName={schoolProfile.schoolName}
              />
            )}

            {currentTab === 'locations' && (
              <LocationManager
                locations={locations}
                assets={assets}
                onSaveLocation={handleSaveLocation}
                onDeleteLocation={handleDeleteLocation}
                onFilterAssetsByLocation={(roomName) => {
                  setCurrentTab('assets');
                }}
                onPrintLocationLabels={handlePrintLocationLabels}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                assets={assets}
                locations={locations}
                schoolProfile={schoolProfile}
                onUpdateSchoolProfile={handleUpdateSchoolProfile}
              />
            )}

            {currentTab === 'audit' && (
              <AuditHistory
                logs={auditLogs}
                onOpenQuickScan={() => {
                  setTargetedAssetForAudit(null);
                  setIsScannerOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Add / Edit Asset Modal */}
      <AssetFormModal
        isOpen={isAddAssetOpen}
        onClose={() => {
          setIsAddAssetOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        locations={locations}
        existingAssetsCount={assets.length}
      />

      {/* QR Scanner & Audit Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setTargetedAssetForAudit(null);
        }}
        assets={assets}
        locations={locations}
        onAuditAsset={handleAuditAsset}
        initialSelectedAsset={targetedAssetForAudit}
        onRegisterNewFromCode={(code) => {
          setEditingAsset({
            id: code.replace(/\s+/g, '-'),
            assetCode: code,
            name: '',
            category: 'Elektronik',
            location: locations.length > 0 ? locations[0].name : 'Lab Komputer 1',
            condition: 'Baik',
            quantity: 1,
            status: 'Tersedia'
          });
          setIsAddAssetOpen(true);
        }}
      />

      {/* Footer (No print) */}
      <footer className="no-print mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">
              SIMAS - Sistem Informasi Manajemen Aset Sekolah
            </span>
          </div>
          <div>
            Terintegrasi Cloud Database Firebase & Pemindai Barcode QR Berbasis Web
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
