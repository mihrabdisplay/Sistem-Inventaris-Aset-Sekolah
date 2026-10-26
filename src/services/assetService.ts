import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { SchoolAsset, SchoolLocation, AuditLogItem } from '../types';
import { INITIAL_ASSETS, INITIAL_LOCATIONS } from './sampleData';

const ASSETS_PATH = 'assets';
const LOCATIONS_PATH = 'locations';
const AUDIT_LOGS_PATH = 'auditLogs';

// Helper to sanitize document ID
export function sanitizeDocId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 120);
}

// Subscribe to Assets
export function subscribeToAssets(
  onData: (assets: SchoolAsset[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const assetsCol = collection(db, ASSETS_PATH);
    return onSnapshot(
      assetsCol,
      (snapshot) => {
        const items: SchoolAsset[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<SchoolAsset, 'id'>) });
        });
        onData(items);
      },
      (error) => {
        console.warn('Realtime assets listener error:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, ASSETS_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ASSETS_PATH);
  }
}

// Subscribe to Locations
export function subscribeToLocations(
  onData: (locs: SchoolLocation[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const locCol = collection(db, LOCATIONS_PATH);
    return onSnapshot(
      locCol,
      (snapshot) => {
        const items: SchoolLocation[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<SchoolLocation, 'id'>) });
        });
        onData(items);
      },
      (error) => {
        console.warn('Realtime locations listener error:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, LOCATIONS_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, LOCATIONS_PATH);
  }
}

// Subscribe to Audit Logs
export function subscribeToAuditLogs(
  onData: (logs: AuditLogItem[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const logsCol = collection(db, AUDIT_LOGS_PATH);
    return onSnapshot(
      logsCol,
      (snapshot) => {
        const items: AuditLogItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<AuditLogItem, 'id'>) });
        });
        // Sort descending by timestamp
        items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        onData(items);
      },
      (error) => {
        console.warn('Realtime audit logs listener error:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, AUDIT_LOGS_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, AUDIT_LOGS_PATH);
  }
}

// Save or Update Asset
export async function saveAsset(asset: SchoolAsset): Promise<void> {
  const docId = sanitizeDocId(asset.id || asset.assetCode);
  const now = new Date().toISOString();

  // Strict payload per firebase-blueprint
  const payload: Record<string, any> = {
    assetCode: (asset.assetCode || docId).trim().substring(0, 64),
    name: asset.name.trim().substring(0, 150),
    category: asset.category,
    location: asset.location.trim().substring(0, 100),
    condition: asset.condition,
    quantity: Number(asset.quantity) >= 0 ? Number(asset.quantity) : 1,
    status: asset.status,
    updatedAt: now
  };

  if (asset.purchaseYear) payload.purchaseYear = Number(asset.purchaseYear);
  if (asset.sourceOfFunds) payload.sourceOfFunds = asset.sourceOfFunds.trim().substring(0, 60);
  if (typeof asset.price === 'number' && !isNaN(asset.price)) payload.price = Math.max(0, asset.price);
  if (asset.personInCharge) payload.personInCharge = asset.personInCharge.trim().substring(0, 100);
  if (asset.notes) payload.notes = asset.notes.trim().substring(0, 500);
  if (asset.lastAuditAt) payload.lastAuditAt = asset.lastAuditAt.substring(0, 50);
  if (asset.lastAuditBy) payload.lastAuditBy = asset.lastAuditBy.trim().substring(0, 100);
  if (asset.createdAt) payload.createdAt = asset.createdAt;
  else payload.createdAt = now;

  if (auth.currentUser?.uid) {
    payload.createdBy = auth.currentUser.uid;
  }

  try {
    const docRef = doc(db, ASSETS_PATH, docId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ASSETS_PATH}/${docId}`);
  }
}

// Delete Asset
export async function deleteAsset(assetId: string): Promise<void> {
  const docId = sanitizeDocId(assetId);
  try {
    const docRef = doc(db, ASSETS_PATH, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ASSETS_PATH}/${docId}`);
  }
}

// Save or Update Location
export async function saveLocation(loc: SchoolLocation): Promise<void> {
  const docId = sanitizeDocId(loc.id || `LOC_${loc.name.replace(/\s+/g, '_')}`);
  const payload: Record<string, any> = {
    name: loc.name.trim().substring(0, 100),
    building: loc.building.trim().substring(0, 100),
    picName: loc.picName.trim().substring(0, 100),
    createdAt: loc.createdAt || new Date().toISOString()
  };
  if (loc.picContact) {
    payload.picContact = loc.picContact.trim().substring(0, 50);
  }

  try {
    const docRef = doc(db, LOCATIONS_PATH, docId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${LOCATIONS_PATH}/${docId}`);
  }
}

// Delete Location
export async function deleteLocation(locationId: string): Promise<void> {
  const docId = sanitizeDocId(locationId);
  try {
    const docRef = doc(db, LOCATIONS_PATH, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${LOCATIONS_PATH}/${docId}`);
  }
}

// Record QR Code Scan / Physical Audit
export async function recordAuditScan(
  asset: SchoolAsset,
  newCondition: string,
  newLocation: string,
  scannedByName: string,
  notes: string = ''
): Promise<void> {
  const logId = `AUDIT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const auditLogPayload: Record<string, any> = {
    assetId: asset.id,
    assetCode: asset.assetCode,
    assetName: asset.name,
    action: 'Pindai QR & Audit Fisik',
    previousCondition: asset.condition,
    newCondition: newCondition,
    location: newLocation,
    scannedBy: scannedByName.trim().substring(0, 100),
    notes: notes.trim().substring(0, 500),
    timestamp: nowStr
  };

  if (auth.currentUser?.uid) {
    auditLogPayload.scannedById = auth.currentUser.uid;
  }

  try {
    // 1. Create immutable audit log
    const logDocRef = doc(db, AUDIT_LOGS_PATH, logId);
    await setDoc(logDocRef, auditLogPayload);

    // 2. Update the asset's current condition, location, lastAuditAt, lastAuditBy
    const assetDocRef = doc(db, ASSETS_PATH, sanitizeDocId(asset.id));
    await setDoc(assetDocRef, {
      condition: newCondition,
      location: newLocation,
      lastAuditAt: nowStr,
      lastAuditBy: scannedByName.trim().substring(0, 100),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${AUDIT_LOGS_PATH}/${logId}`);
  }
}

// Populate sample data if Firestore is empty
export async function seedSampleData(): Promise<{ assetsCount: number; locationsCount: number }> {
  try {
    // Seed locations
    for (const loc of INITIAL_LOCATIONS) {
      await saveLocation(loc);
    }
    // Seed assets
    for (const ast of INITIAL_ASSETS) {
      await saveAsset(ast);
    }
    return { assetsCount: INITIAL_ASSETS.length, locationsCount: INITIAL_LOCATIONS.length };
  } catch (err) {
    console.error('Failed to seed sample data:', err);
    throw err;
  }
}
