# PRD V6.1 Changelog

**Version:** 6.1
**Date:** 02 February 2026
**Previous Version:** 6.0

---

## Summary of Changes

Revisi ini berdasarkan hasil review QA dari Jackie (PRD_Readiness_Checklist.md) dan Fenti (PRD_V6_FEEDBACK_RESPONSE.md).

---

## Changes Made

### 1. Document Header (Line 3-6)
- Updated version to 6.1
- Added revision date and change summary

### 2. A.3 Out of Scope - Phase 1 Status Toggle Limitation (NEW)
- **Issue:** Status Toggle membutuhkan Edit form, tapi Edit out of scope
- **Fix:** Added explicit note that Status field cannot be changed after record creation in Phase 1
- **Impact:** Users must set correct Status during creation

### 3. A.7.1 - Cascading Reset Logic (A-FR-014a NEW)
- **Issue:** PRD tidak eksplisit tentang reset child dropdown saat parent berubah
- **Fix:** Added A-FR-014a stating that changing parent selection resets all downstream child dropdowns

### 4. A.7.9 - Inventory Phase 1 Implementation Note (NEW)
- **Issue:** Inventory Deadlock - inventory only updates from "Completed" POs, but "Completed" is future phase
- **Fix:** Added explicit note that Inventory List will be empty in Phase 1 (by design)
- **Impact:** Developers understand this is intentional, not a bug

### 5. A.9 Validation Rules - New Rules Added
- **A-VR-009:** UOM Deactivation Constraint (for future when Edit is implemented)
- **A-VR-010:** Search Sensitivity - case-insensitive, partial matching
- **A-VR-011:** SKU Manual Override Policy - consonants don't need to match item name

### 6. A.15 - SKU Editability Clarification
- **Issue:** "after auto-generation" was ambiguous
- **Fix:** Changed to "after auto-generation **but BEFORE saving the record**"
- **Old:** "Node ID, SKU can be manually edited by the user after auto-generation"
- **New:** "Node ID and SKU can be manually edited by the user after auto-generation **but BEFORE saving the record**. Once the record is saved, these fields become read-only"

### 7. B.6 Screen Flow Diagram - Cancel to Back
- Changed diagram label from "Cancel" to "Back"

### 8. B-FR-007c - Address Overwrite Policy (NEW)
- **Issue:** PRD tidak jelas apa yang terjadi jika user sudah edit address manual, lalu re-select Supplier/Warehouse
- **Fix:** Added B-FR-007c stating that re-selecting Supplier/Warehouse overwrites manual edits

### 9. B-FR-030 & B-FR-033 - Cancel Button Renamed to Back
- **Issue:** "Cancel" button bisa membingungkan dengan "Cancel PO" status
- **Fix:** Renamed to "Back" to avoid confusion
- **Old:** "Submit" and "Cancel"
- **New:** "Submit" and "Back"

### 10. B.9.5 - Search & Display Standards (NEW)
- **B-VR-030:** Added search sensitivity rule for PO List (case-insensitive, partial matching)

### 11. B.14 - Currency Precision Policy (NEW)
- **Issue:** Tidak ada policy pembulatan Rupiah
- **Fix:** Added Currency Precision Policy section
- Standard rounding only when calculation results exceed 2 decimal places

### 12. B-TC-079 - Test Case Updated
- Changed "click Cancel" to "click Back"

### 13. B.7.2 - Stock Column in PO Item Grid
- **Decision:** KEEP Stock column - display "0" for Phase 1
- **Rationale:** Best practice ERP menampilkan stock sebagai informational reference untuk procurement
- **B-FR-015:** Stock SHALL display "0" if no inventory record exists
- **B-TC-024:** Test case untuk Stock display "0"

### 14. B.7.4 - PO Print/PDF Template (NEW)
- **Issue:** GAP-001 - Print/PDF template tidak ada spesifikasi
- **Fix:** Tambah B.7.4 dengan layout dokumen PO
- **Content:** Company info, PO header, Supplier, Delivery info, Items table, Summary, Payment, Notes, Footer
- **Note:** Tanpa logo dan signature (sesuai kebutuhan)

### 15. A.14.2 - Master Data Field Lengths (NEW)
- **Issue:** GAP-002 - Field lengths untuk Master Data tidak terdefinisi
- **Fix:** Tambah A.14.2 dengan max length untuk semua field Warehouse, Supplier, Item, UOM

### 16. A.7.1, A.7.5, A-FR-009 - Node ID & SKU Editability Wording
- **Issue:** CONF-001 - Wording "Editable after generation" ambigu
- **Fix:** Ubah ke "Editable after auto-generation but before save. Read-only after record is saved."

### 17. B-FR-007c - Address Overwrite on Method Switch
- **Issue:** CONF-002 - Tidak jelas apa yang terjadi ke Address saat switch Distribution Method
- **Fix:** Update B-FR-007c untuk include method switch scenario (Pickup ↔ Delivery)

### 18. A.12 - Tooltip vs Popover
- **Issue:** AMB-001 - "tooltip/popover" ambigu
- **Fix:** Ubah ke "tooltip" saja

### 19. B-FR-002 - ID Generation Concurrency Note
- **Issue:** GAP-005 - Concurrent submissions bisa generate duplicate PO ID
- **Fix:** Tambah note bahwa database unique constraint menjamin tidak ada duplikat

### 20. B-FR-033a - Back Confirmation Dialog (NEW)
- **Issue:** GAP-006 - Tombol Back tidak ada konfirmasi, user bisa tidak sengaja kehilangan data
- **Fix:** Tambah B-FR-033a dengan confirmation dialog: "Unsaved changes will be lost. Continue?"
- **Test Cases:** B-TC-079, B-TC-079a, B-TC-079b updated

### 21. CONF-003 - Validation Error Display Standardized to Popup
- **Issue:** Part A pakai Popup, Part B pakai Inline - tidak konsisten
- **Fix:** Standardize semua validation error ke Popup Modal (B-FR-035 updated)

### 22. GAP-004 - Inventory View Detail Trigger (NEW)
- **Issue:** A.7.10 modal tidak ada trigger yang jelas
- **Fix:** Tambah A-FR-032a: Klik row di Inventory List membuka modal detail

### 23. GAP-002 - Pagination for Part A Lists (NEW)
- **Issue:** Part B (PO List) punya pagination, Part A tidak
- **Fix:** Tambah pagination FRs untuk semua Part A Data Tables:
  - A-FR-008b (Supplier List)
  - A-FR-013b (Item List)
  - A-FR-025a (UOM List)
  - A-FR-032b (Inventory List)
- **Note:** Warehouse List uses Tree Grid View, pagination not applicable

### 24. CG-002 - Company Info Hardcoded for MVP
- **Issue:** B-TPL-001 references "System Config" tapi entity tidak defined
- **Fix:** Update B-TPL-001: Company Name & Address hardcoded di template untuk MVP

### 25. CRITICAL-001 - B.12 Validation Style Conflict
- **Issue:** B.12 masih "inline text" padahal B-FR-035 dan E.5 sudah Popup Modal
- **Fix:** Update B.12 ke "Popup Modal listing all validation errors"

### 26. GAP-001 - ID Generation Race Condition (A-VR-012 NEW)
- **Issue:** Race condition handling hanya di B-FR-002 untuk PO ID
- **Fix:** Tambah A-VR-012: Semua auto-generated IDs punya unique constraint, retry on violation

### 27. GAP-002 - ID Sequence Overflow (A-VR-013 NEW)
- **Issue:** ID overflow behavior tidak defined
- **Fix:** Tambah A-VR-013: Error message "Maximum sequence reached" saat overflow

### 28. GAP-003 - UOM Cross-Reference Fix
- **Issue:** A.7.5 reference "see A.7.9" salah (Inventory List)
- **Fix:** Ubah ke "see A.7.7/A.7.8" (UOM Create/List)

### 29. GAP-004 - Delivery Date & Transfer Amount Phase 1 Note
- **Issue:** Kolom di PO List tapi tidak ada cara input di Phase 1
- **Fix:** Tambah Phase 1 note: Delivery Date = "-", Transfer Amount = "Rp 0"

### 30. MINOR-001 - Supplier Status Field Consistency
- **Issue:** Supplier pakai `is_active` (Boolean), entity lain pakai `status` (Enum)
- **Fix:** Ubah Supplier entity dari `is_active | Boolean` ke `status | Enum (Active, Inactive)`

### 31. GAP-001 - Company Info Hardcoded Values
- **Issue:** B-TPL-001 tidak specify nilai hardcode
- **Fix:** Tambah explicit value: "PT Neo Fusion Indonesia", Address placeholder

### 32. GAP-003 - Warehouse Tree View Pagination Note
- **Issue:** Tidak jelas apakah Tree View pakai pagination
- **Fix:** Tambah note: "Tree View does NOT use pagination"

### 33. GAP-004 - Autocomplete Specification
- **Issue:** B-FR-011 tidak detail autocomplete behavior
- **Fix:** Tambah specs: 2 chars minimum, 300ms debounce, max 10 results

### 34. GAP-005 - UOM ID Generation Logic
- **Issue:** A-FR-022 kurang explicit dibanding ID lain
- **Fix:** Tambah "System queries MAX(uom_id), extracts numeric part, adds 1"

### 35. CONFLICT-001 - Print/Download Button Location Clarification
- **Issue:** B-FR-039/040 ada di section Create tapi seharusnya View mode only
- **Fix:** Tambah note: "This button is only available in View mode"

### 36. UI Framework Consistency - AdminLTE
- **Issue:** Line 137 reference "Shadcn", sisanya AdminLTE - tidak konsisten
- **Fix:** Ubah "Shadcn" ke "AdminLTE Panel" untuk konsistensi

### 37. B-VR-025 - Payment Sync Clarification
- **Issue:** AI reviewer salah paham sync DP↔Paid sebagai bidirectional
- **Fix:** Tambah explicit note: "ONE-WAY sync (DP Amount → Paid Amount), NOT bidirectional"

### 38. Document Storage - Implementation Note
- **Issue:** AI reviewer minta specify storage method (local vs S3)
- **Fix:** Tambah note: "Storage solution is implementation decision, PRD defines WHAT not HOW"

### 39. B-FR-042 - PDF Generation Implementation Note
- **Issue:** AI reviewer minta specify PDF generation method
- **Fix:** Tambah note: "PDF generation method is implementation decision"

### 40. A.7.2 - Tree View Performance Implementation Note
- **Issue:** AI reviewer minta specify performance limits
- **Fix:** Tambah note: "Performance optimization is implementation decision based on data volume"

---

## Issues NOT Changed (By Design)

The following issues from the reviews were NOT changed because they are intentional design decisions:

1. **Bin Allocation Logic** - bin_id is intentionally NULLABLE to allow warehouse-level tracking without requiring bin allocation
2. **Hierarchy Status Cascade** - Independent status management per node is intentional (no cascade from parent to children)
3. **Sequential ID Integrity** - Delete is out of scope for Phase 1, so no gaps can occur. This is a future phase consideration.

---

## Files Affected

- `ERP_NIMBUS_PRD_V6.1.md` - Main PRD document (all changes above)

---

## Next Steps

1. Review this changelog with stakeholders
2. Distribute PRD V6.1 to development team
3. Archive V6.0 for reference

---

**Prepared By:** Claude (AI Assistant)
**Based On:** Jackie's PRD_Readiness_Checklist.md and Fenti's PRD_V6_FEEDBACK_RESPONSE.md
