# Security Specification for SIMAS (Sistem Inventaris Aset Sekolah)

## 1. Data Invariants
1. **Asset Identity & Integrity**: Every asset record must possess an approved assetCode, name, category, location, condition, and status within defined string length and enumeration bounds.
2. **Audit Attribution**: Any audit log or QR scan record created must reflect the caller's identity (`request.auth.uid` or verified credentials) and cite a valid `assetId`.
3. **Master Role Access**: School asset management allows read and query by authenticated school staff. Critical operations (delete assets, master modifications) are guarded or reserved for administrator / designated personnel.
4. **Immutability of Historical Audits**: Once an audit log is committed, it cannot be tampered with or overwritten to preserve the chain of custody.
5. **No Orphaned Audits**: Audits cannot reference arbitrary non-existent or blank asset identifiers.
6. **No Injection or Field Pollution**: Updates to assets must strictly modify known permissible fields (`assetCode`, `name`, `category`, `location`, `condition`, `quantity`, `purchaseYear`, `sourceOfFunds`, `price`, `personInCharge`, `notes`, `status`, `lastAuditAt`, `lastAuditBy`, `updatedAt`).

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Cases)

1. **Unauthenticated Read / Write**
   - Payload: Unauthenticated client calling `get()` or `set()` on `/assets/AST-001`.
   - Expected Result: `PERMISSION_DENIED`
2. **Ghost Field Poisoning (Shadow Key Injection)**
   - Payload: `{ assetCode: 'AST-001', name: 'Laptop', ..., isSuperAdminOverride: true }`
   - Expected Result: `PERMISSION_DENIED` (Strict schema key enforcement)
3. **Huge Oversized Payload (Denial of Wallet)**
   - Payload: `{ name: 'A'.repeat(500000) }`
   - Expected Result: `PERMISSION_DENIED` (Size guards)
4. **Invalid Enumeration in Condition**
   - Payload: `{ condition: 'HancurLeburTakBersisa' }`
   - Expected Result: `PERMISSION_DENIED` (Allowed enum check)
5. **Invalid Enumeration in Category**
   - Payload: `{ category: 'SuperWeapon' }`
   - Expected Result: `PERMISSION_DENIED` (Allowed enum check)
6. **Audit Log Tampering (Update after creation)**
   - Payload: Attempting to `update` `/auditLogs/log-123` to rewrite `newCondition` or `scannedBy`.
   - Expected Result: `PERMISSION_DENIED` (Audit logs are append-only/immutable)
7. **Audit Log Deletion**
   - Payload: Calling `deleteDoc` on `/auditLogs/log-123` by non-admin or standard user.
   - Expected Result: `PERMISSION_DENIED`
8. **Malicious Document ID Poisoning**
   - Payload: Creating document with ID `../../etc/passwd` or 1KB long string.
   - Expected Result: `PERMISSION_DENIED` (`isValidId` regex & size guard)
9. **Identity Spoofing on Asset Creation**
   - Payload: User `userA` submits `createdBy: "victimUserB"`.
   - Expected Result: `PERMISSION_DENIED` (`incoming().createdBy == request.auth.uid`)
10. **Spoofing Scan User on Audit**
    - Payload: User `userA` logs scan with `scannedById: "principalAdmin"`.
    - Expected Result: `PERMISSION_DENIED` (`incoming().scannedById == request.auth.uid`)
11. **Negative Quantity or Price Tampering**
    - Payload: `{ quantity: -10, price: -9999999 }`
    - Expected Result: `PERMISSION_DENIED` (Numeric boundary validation >= 0)
12. **Blank Required Fields on Asset**
    - Payload: `{ name: "", assetCode: "" }`
    - Expected Result: `PERMISSION_DENIED` (Size minimum constraint > 0)

---

## 3. The Test Runner Reference (firestore.rules.test.ts)
The test suite validates that all malicious payloads fail with `PERMISSION_DENIED`.
