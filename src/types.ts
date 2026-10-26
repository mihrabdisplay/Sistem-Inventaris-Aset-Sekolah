export type AssetCategory = 
  | 'Elektronik'
  | 'Furnitur'
  | 'Peralatan Lab'
  | 'Buku & Media'
  | 'Sarana Olahraga'
  | 'Kendaraan/Mesin'
  | 'Lainnya';

export type AssetCondition = 
  | 'Baik'
  | 'Rusak Ringan'
  | 'Rusak Berat'
  | 'Dalam Perbaikan'
  | 'Dihapuskan';

export type AssetStatus = 
  | 'Tersedia'
  | 'Dipinjam'
  | 'Dalam Perbaikan'
  | 'Dihapuskan';

export interface SchoolAsset {
  id: string; // Document ID (usually matches assetCode sanitized, e.g. AST-001)
  assetCode: string;
  name: string;
  category: AssetCategory;
  location: string;
  condition: AssetCondition;
  quantity: number;
  purchaseYear?: number;
  sourceOfFunds?: string;
  price?: number;
  personInCharge?: string;
  notes?: string;
  status: AssetStatus;
  lastAuditAt?: string;
  lastAuditBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolLocation {
  id: string;
  name: string;
  building: string;
  picName: string;
  picContact?: string;
  createdAt?: string;
}

export interface AuditLogItem {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  action: string;
  previousCondition?: string;
  newCondition?: string;
  location?: string;
  scannedBy: string;
  scannedById?: string;
  notes?: string;
  timestamp: string;
}

export interface SchoolProfile {
  schoolName: string;
  npsn: string;
  address: string;
  principalName: string;
  principalNip: string;
  sarprasManagerName: string;
  sarprasManagerNip: string;
  city: string;
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SMP / SMA NEGERI 1 TELADAN',
  npsn: '20108892',
  address: 'Jl. Pendidikan Mandiri No. 45, Kompleks Sarana Pendidikan',
  principalName: 'Drs. H. Ahmad Sudrajat, M.Pd.',
  principalNip: '19750812 200003 1 002',
  sarprasManagerName: 'Bambang Triyono, S.T., M.Kom.',
  sarprasManagerNip: '19840315 200902 1 004',
  city: 'Jakarta'
};
