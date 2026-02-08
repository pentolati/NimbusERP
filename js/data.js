/* ===========================================
   ERP Nimbus - Data Store
   Based on PRD Entity Definitions (A.8, B.8)
   =========================================== */

// Simulated User (PRD A.8.6 - Reference Entity)
const currentUser = {
    id: 'user-001',
    username: 'admin',
    full_name: 'Administrator',
    email: 'admin@erpnimbus.com',
    is_active: true
};

// Data Store
const dataStore = {
    // UOM Seed Data - PRD E.6
    uom: [
        { id: 'uom-001', uom_id: 'UOM001', code: 'Kg', name: 'Kilogram', description: 'Unit for weight measurement', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-002', uom_id: 'UOM002', code: 'Ltr', name: 'Liter', description: 'Unit for liquid measurement', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-003', uom_id: 'UOM003', code: 'Pcs', name: 'Pieces', description: 'Individual pieces', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-004', uom_id: 'UOM004', code: 'Box', name: 'Box', description: 'Box packaging', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-005', uom_id: 'UOM005', code: 'Pack', name: 'Pack', description: 'Package unit', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-006', uom_id: 'UOM006', code: 'Unit', name: 'Unit', description: 'Single unit', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-007', uom_id: 'UOM007', code: 'Set', name: 'Set', description: 'Set of items', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' },
        { id: 'uom-008', uom_id: 'UOM008', code: 'Dzn', name: 'Dozen', description: '12 pieces', status: 'Active', created_at: '2026-01-01T00:00:00', created_by: 'user-001', updated_at: '2026-01-01T00:00:00', updated_by: 'user-001' }
    ],

    // Warehouse - PRD A.8.1 - Seed Data
    warehouse: [
        { id: 'wh-001', node_id: 'WH0001', name: 'Warehouse Jakarta', parent_id: null, node_type: 'Warehouse', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Main distribution center', status: 'Active', created_at: '2026-01-15T08:00:00', created_by: 'user-001', updated_at: '2026-01-15T08:00:00', updated_by: 'user-001' },
        { id: 'wh-002', node_id: 'WH0002', name: 'Warehouse Surabaya', parent_id: null, node_type: 'Warehouse', method: 'FIFO', address: 'Jl. Rungkut Industri III/5, Surabaya 60293', description: 'East Java distribution center', status: 'Active', created_at: '2026-01-15T08:30:00', created_by: 'user-001', updated_at: '2026-01-15T08:30:00', updated_by: 'user-001' },
        { id: 'wh-003', node_id: 'A0001', name: 'Aisle A', parent_id: 'wh-001', node_type: 'Aisle', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Food & Beverages', status: 'Active', created_at: '2026-01-15T09:00:00', created_by: 'user-001', updated_at: '2026-01-15T09:00:00', updated_by: 'user-001' },
        { id: 'wh-004', node_id: 'A0002', name: 'Aisle B', parent_id: 'wh-001', node_type: 'Aisle', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Electronics', status: 'Active', created_at: '2026-01-15T09:15:00', created_by: 'user-001', updated_at: '2026-01-15T09:15:00', updated_by: 'user-001' },
        { id: 'wh-005', node_id: 'R0001', name: 'Rack A-1', parent_id: 'wh-003', node_type: 'Rack', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Beverages storage', status: 'Active', created_at: '2026-01-15T09:30:00', created_by: 'user-001', updated_at: '2026-01-15T09:30:00', updated_by: 'user-001' },
        { id: 'wh-006', node_id: 'R0002', name: 'Rack A-2', parent_id: 'wh-003', node_type: 'Rack', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Snacks storage', status: 'Active', created_at: '2026-01-15T09:45:00', created_by: 'user-001', updated_at: '2026-01-15T09:45:00', updated_by: 'user-001' },
        { id: 'wh-007', node_id: 'B0001', name: 'Bin A-1-01', parent_id: 'wh-005', node_type: 'Bin', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Small items bin', status: 'Active', created_at: '2026-01-15T10:00:00', created_by: 'user-001', updated_at: '2026-01-15T10:00:00', updated_by: 'user-001' },
        { id: 'wh-008', node_id: 'B0002', name: 'Bin A-1-02', parent_id: 'wh-005', node_type: 'Bin', method: 'FIFO', address: 'Jl. Industri Raya No. 100, Jakarta Utara 14350', description: 'Medium items bin', status: 'Active', created_at: '2026-01-15T10:15:00', created_by: 'user-001', updated_at: '2026-01-15T10:15:00', updated_by: 'user-001' }
    ],

    // Supplier - PRD A.8.2 - Seed Data
    supplier: [
        { id: 'sup-001', supp_id: 'SUP0001', name: 'PT. Maju Bersama', pic_name: 'Budi Santoso', address: 'Jl. Sudirman No. 45, Jakarta Selatan 12190', phone: '628111234567', description: 'Office supplies and stationery', status: 'Active', created_at: '2026-01-10T10:00:00', created_by: 'user-001', updated_at: '2026-01-10T10:00:00', updated_by: 'user-001' },
        { id: 'sup-002', supp_id: 'SUP0002', name: 'CV. Berkah Jaya', pic_name: 'Siti Rahayu', address: 'Jl. Gatot Subroto No. 88, Bandung 40262', phone: '628229876543', description: 'Electronics components', status: 'Active', created_at: '2026-01-10T11:00:00', created_by: 'user-001', updated_at: '2026-01-10T11:00:00', updated_by: 'user-001' },
        { id: 'sup-003', supp_id: 'SUP0003', name: 'PT. Sentosa Abadi', pic_name: 'Ahmad Wijaya', address: 'Jl. Pemuda No. 123, Semarang 50139', phone: '628335551234', description: 'Raw materials supplier', status: 'Active', created_at: '2026-01-11T09:00:00', created_by: 'user-001', updated_at: '2026-01-11T09:00:00', updated_by: 'user-001' },
        { id: 'sup-004', supp_id: 'SUP0004', name: 'UD. Makmur Sejahtera', pic_name: 'Dewi Lestari', address: 'Jl. Diponegoro No. 77, Surabaya 60241', phone: '628447778899', description: 'Packaging materials', status: 'Active', created_at: '2026-01-12T14:00:00', created_by: 'user-001', updated_at: '2026-01-12T14:00:00', updated_by: 'user-001' },
        { id: 'sup-005', supp_id: 'SUP0005', name: 'PT. Global Teknik', pic_name: 'Rudi Hartono', address: 'Jl. Asia Afrika No. 55, Jakarta Pusat 10150', phone: '628556667788', description: 'Machinery and spare parts', status: 'Inactive', created_at: '2026-01-13T08:30:00', created_by: 'user-001', updated_at: '2026-01-20T16:00:00', updated_by: 'user-001' }
    ],

    // Item - PRD A.8.3 - Seed Data
    item: [
        { id: 'itm-001', sku: 'SMS0001', brand: 'Samsung', name: 'Samsung Galaxy S24 Ultra', detail: '256GB, Titanium Black', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-15T10:00:00', created_by: 'user-001', updated_at: '2026-01-15T10:00:00', updated_by: 'user-001' },
        { id: 'itm-002', sku: 'PPL0002', brand: 'Apple', name: 'Apple iPhone 15 Pro Max', detail: '512GB, Natural Titanium', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-15T10:30:00', created_by: 'user-001', updated_at: '2026-01-15T10:30:00', updated_by: 'user-001' },
        { id: 'itm-003', sku: 'KRT0003', brand: null, name: 'Kertas HVS A4 70gsm', detail: 'Isi 500 lembar per rim', uom_id: 'uom-004', status: 'Active', created_at: '2026-01-15T11:00:00', created_by: 'user-001', updated_at: '2026-01-15T11:00:00', updated_by: 'user-001' },
        { id: 'itm-004', sku: 'TND0004', brand: 'Pilot', name: 'Tinta Spidol Whiteboard', detail: 'Warna Hitam, 30ml', uom_id: 'uom-003', status: 'Active', created_at: '2026-01-15T11:30:00', created_by: 'user-001', updated_at: '2026-01-15T11:30:00', updated_by: 'user-001' },
        { id: 'itm-005', sku: 'KBL0005', brand: 'Baseus', name: 'Kabel USB-C to Lightning', detail: '1 meter, Fast Charging', uom_id: 'uom-003', status: 'Active', created_at: '2026-01-16T09:00:00', created_by: 'user-001', updated_at: '2026-01-16T09:00:00', updated_by: 'user-001' },
        { id: 'itm-006', sku: 'MNT0006', brand: 'LG', name: 'Monitor LED 27 inch', detail: 'Full HD, IPS Panel', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-16T09:30:00', created_by: 'user-001', updated_at: '2026-01-16T09:30:00', updated_by: 'user-001' },
        { id: 'itm-007', sku: 'KYB0007', brand: 'Logitech', name: 'Keyboard Wireless MX Keys', detail: 'Backlit, Multi-device', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-16T10:00:00', created_by: 'user-001', updated_at: '2026-01-16T10:00:00', updated_by: 'user-001' },
        { id: 'itm-008', sku: 'MSX0008', brand: 'Logitech', name: 'Mouse Wireless MX Master 3S', detail: 'Ergonomic, 8K DPI', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-16T10:30:00', created_by: 'user-001', updated_at: '2026-01-16T10:30:00', updated_by: 'user-001' },
        { id: 'itm-009', sku: 'HDS0009', brand: 'Sony', name: 'Headset WH-1000XM5', detail: 'Wireless, Noise Cancelling', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-17T09:00:00', created_by: 'user-001', updated_at: '2026-01-17T09:00:00', updated_by: 'user-001' },
        { id: 'itm-010', sku: 'CRG0010', brand: 'Anker', name: 'Charger USB-C 65W', detail: 'GaN II, 3 Ports', uom_id: 'uom-003', status: 'Active', created_at: '2026-01-17T09:30:00', created_by: 'user-001', updated_at: '2026-01-17T09:30:00', updated_by: 'user-001' },
        { id: 'itm-011', sku: 'LPT0011', brand: 'Lenovo', name: 'Laptop ThinkPad X1 Carbon', detail: 'i7, 16GB RAM, 512GB SSD', uom_id: 'uom-006', status: 'Active', created_at: '2026-01-17T10:00:00', created_by: 'user-001', updated_at: '2026-01-17T10:00:00', updated_by: 'user-001' },
        { id: 'itm-012', sku: 'TBL0012', brand: 'Apple', name: 'Tablet iPad Pro 12.9', detail: 'M2 Chip, 256GB, WiFi', uom_id: 'uom-006', status: 'Inactive', created_at: '2026-01-17T10:30:00', created_by: 'user-001', updated_at: '2026-01-25T11:00:00', updated_by: 'user-001' }
    ],

    // Inventory - PRD A.8.5 - Seed Data for Testing
    inventory: [
        { id: 'inv-001', item_id: 'itm-001', warehouse_id: 'wh-001', bin_id: 'wh-007', qty_on_hand: 25.0000, last_received_at: '2026-02-01T14:00:00', last_received_qty: 10.0000, last_po_id: 'po-001', created_at: '2026-01-20T10:00:00', updated_at: '2026-02-01T14:00:00' },
        { id: 'inv-002', item_id: 'itm-002', warehouse_id: 'wh-001', bin_id: 'wh-007', qty_on_hand: 15.0000, last_received_at: '2026-02-01T14:00:00', last_received_qty: 5.0000, last_po_id: 'po-001', created_at: '2026-01-20T10:30:00', updated_at: '2026-02-01T14:00:00' },
        { id: 'inv-003', item_id: 'itm-003', warehouse_id: 'wh-001', bin_id: 'wh-008', qty_on_hand: 100.0000, last_received_at: '2026-01-28T10:00:00', last_received_qty: 50.0000, last_po_id: null, created_at: '2026-01-22T09:00:00', updated_at: '2026-01-28T10:00:00' },
        { id: 'inv-004', item_id: 'itm-006', warehouse_id: 'wh-002', bin_id: null, qty_on_hand: 8.0000, last_received_at: '2026-01-30T15:00:00', last_received_qty: 8.0000, last_po_id: null, created_at: '2026-01-30T15:00:00', updated_at: '2026-01-30T15:00:00' },
        { id: 'inv-005', item_id: 'itm-007', warehouse_id: 'wh-001', bin_id: 'wh-007', qty_on_hand: 20.0000, last_received_at: '2026-02-03T11:00:00', last_received_qty: 20.0000, last_po_id: 'po-002', created_at: '2026-02-03T11:00:00', updated_at: '2026-02-03T11:00:00' },
        { id: 'inv-006', item_id: 'itm-008', warehouse_id: 'wh-001', bin_id: 'wh-007', qty_on_hand: 20.0000, last_received_at: '2026-02-03T11:00:00', last_received_qty: 20.0000, last_po_id: 'po-002', created_at: '2026-02-03T11:00:00', updated_at: '2026-02-03T11:00:00' }
    ],

    // Purchase Order - PRD B.8.1
    purchaseOrder: [],

    // Purchase Order Line Items - PRD B.8.2
    purchaseOrderLineItem: [],

    // PO Attachment - PRD B.8.3
    poAttachment: [],

    // PO Status History Log - tracks all status changes
    poStatusLog: [],

    // PO Payment Log - tracks all payments
    poPaymentLog: [],

    // Document Status - Master status per document type
    // EMPTY - User configures via Settings → Document Status
    documentStatus: [],

    // Workflow Transition - Defines allowed status changes and which roles can perform them
    // EMPTY - User configures via Settings → Workflow Transitions
    workflowTransition: [],

    // FunctionalRole - PRD U.8.5 - Pre-seeded (U.16)
    functionalRole: [
        { id: 'role-001', name: 'System Administrator', description: 'Full access to all modules', is_system: true, created_at: '2026-01-01T00:00:00', updated_at: '2026-01-01T00:00:00' },
        { id: 'role-002', name: 'Creator', description: 'Can create and manage own documents', is_system: false, created_at: '2026-01-01T00:00:00', updated_at: '2026-01-01T00:00:00' },
        { id: 'role-003', name: 'Approver', description: 'Can approve/reject submitted documents', is_system: false, created_at: '2026-01-01T00:00:00', updated_at: '2026-01-01T00:00:00' },
        { id: 'role-004', name: 'Viewer', description: 'Read-only access', is_system: false, created_at: '2026-01-01T00:00:00', updated_at: '2026-01-01T00:00:00' }
    ],

    // PermissionRule - PRD U.8.6 (CRUD + Cancel only, state transitions handled by Workflow)
    permissionRule: [
        // System Administrator - full access
        { id: 'perm-001', role_id: 'role-001', entity_name: 'Purchase Order', perm_create: true, perm_read: true, perm_update: true, perm_delete: true, perm_cancel: true },
        { id: 'perm-002', role_id: 'role-001', entity_name: 'Item', perm_create: true, perm_read: true, perm_update: true, perm_delete: true, perm_cancel: false },
        { id: 'perm-003', role_id: 'role-001', entity_name: 'Supplier', perm_create: true, perm_read: true, perm_update: true, perm_delete: true, perm_cancel: false },
        { id: 'perm-004', role_id: 'role-001', entity_name: 'Warehouse', perm_create: true, perm_read: true, perm_update: true, perm_delete: true, perm_cancel: false },
        { id: 'perm-005', role_id: 'role-001', entity_name: 'Workflow', perm_create: true, perm_read: true, perm_update: true, perm_delete: true, perm_cancel: false },
        { id: 'perm-006', role_id: 'role-001', entity_name: 'User', perm_create: true, perm_read: true, perm_update: true, perm_delete: true, perm_cancel: false },
        // Creator - PO create/update/cancel
        { id: 'perm-007', role_id: 'role-002', entity_name: 'Purchase Order', perm_create: true, perm_read: true, perm_update: true, perm_delete: false, perm_cancel: true },
        { id: 'perm-008', role_id: 'role-002', entity_name: 'Item', perm_create: false, perm_read: true, perm_update: false, perm_delete: false, perm_cancel: false },
        { id: 'perm-009', role_id: 'role-002', entity_name: 'Supplier', perm_create: false, perm_read: true, perm_update: false, perm_delete: false, perm_cancel: false },
        // Approver - read only on PO (transitions handled by Workflow)
        { id: 'perm-010', role_id: 'role-003', entity_name: 'Purchase Order', perm_create: false, perm_read: true, perm_update: false, perm_delete: false, perm_cancel: false },
        // Viewer - read only
        { id: 'perm-011', role_id: 'role-004', entity_name: 'Purchase Order', perm_create: false, perm_read: true, perm_update: false, perm_delete: false, perm_cancel: false },
        { id: 'perm-012', role_id: 'role-004', entity_name: 'Item', perm_create: false, perm_read: true, perm_update: false, perm_delete: false, perm_cancel: false },
        { id: 'perm-013', role_id: 'role-004', entity_name: 'Supplier', perm_create: false, perm_read: true, perm_update: false, perm_delete: false, perm_cancel: false }
    ],

    // User - PRD U.8.1
    user: [
        { id: 'user-001', username: 'admin', name: 'Administrator', email: 'admin@erpnimbus.com', is_active: true, created_at: '2026-01-01T00:00:00', created_by: null, updated_at: '2026-01-01T00:00:00', updated_by: null },
        { id: 'user-002', username: 'budi_santoso', name: 'Budi Santoso', email: 'budi@erpnimbus.com', is_active: true, created_at: '2026-01-05T09:00:00', created_by: 'user-001', updated_at: '2026-01-05T09:00:00', updated_by: 'user-001' },
        { id: 'user-003', username: 'siti_rahayu', name: 'Siti Rahayu', email: 'siti@erpnimbus.com', is_active: true, created_at: '2026-01-06T10:00:00', created_by: 'user-001', updated_at: '2026-01-06T10:00:00', updated_by: 'user-001' },
        { id: 'user-004', username: 'ahmad_wijaya', name: 'Ahmad Wijaya', email: 'ahmad@erpnimbus.com', is_active: true, created_at: '2026-01-07T11:00:00', created_by: 'user-001', updated_at: '2026-01-07T11:00:00', updated_by: 'user-001' },
        { id: 'user-005', username: 'dewi_lestari', name: 'Dewi Lestari', email: 'dewi@erpnimbus.com', is_active: false, created_at: '2026-01-08T14:00:00', created_by: 'user-001', updated_at: '2026-01-20T16:00:00', updated_by: 'user-001' }
    ],

    // UserRole - PRD U.8.2
    userRole: [
        { user_id: 'user-001', role_id: 'role-001', assigned_at: '2026-01-01T00:00:00', assigned_by: null },
        { user_id: 'user-002', role_id: 'role-002', assigned_at: '2026-01-05T09:00:00', assigned_by: 'user-001' },
        { user_id: 'user-002', role_id: 'role-003', assigned_at: '2026-01-05T09:00:00', assigned_by: 'user-001' },
        { user_id: 'user-003', role_id: 'role-002', assigned_at: '2026-01-06T10:00:00', assigned_by: 'user-001' },
        { user_id: 'user-003', role_id: 'role-004', assigned_at: '2026-01-06T10:00:00', assigned_by: 'user-001' },
        { user_id: 'user-004', role_id: 'role-003', assigned_at: '2026-01-07T11:00:00', assigned_by: 'user-001' },
        { user_id: 'user-004', role_id: 'role-004', assigned_at: '2026-01-07T11:00:00', assigned_by: 'user-001' }
    ]
};

// ID Counters for auto-generation
const idCounters = {
    warehouse: 0,
    aisle: 0,
    rack: 0,
    bin: 0,
    supplier: 0,
    item: 0,
    uom: 8, // Already seeded 8 UOMs
    po: {} // Object to track per-day counts
};

/* ===========================================
   ID Generation Functions
   Based on PRD A-FR-001, A-FR-006a, A-FR-009a, A-FR-022, B-FR-001
   =========================================== */

// Generate Node ID - PRD A-FR-001
function generateNodeId(nodeType) {
    const prefixes = {
        'Warehouse': 'WH',
        'Aisle': 'A',
        'Rack': 'R',
        'Bin': 'B'
    };
    const prefix = prefixes[nodeType];
    const counterKey = nodeType.toLowerCase();

    // Find max existing ID
    const existingNodes = dataStore.warehouse.filter(w => w.node_type === nodeType);
    let maxNum = 0;
    existingNodes.forEach(node => {
        const numPart = parseInt(node.node_id.replace(prefix, ''));
        if (numPart > maxNum) maxNum = numPart;
    });

    const nextNum = maxNum + 1;
    return prefix + String(nextNum).padStart(4, '0');
}

// Generate Supplier ID - PRD A-FR-006a
function generateSupplierId() {
    const existing = dataStore.supplier;
    let maxNum = 0;
    existing.forEach(s => {
        const numPart = parseInt(s.supp_id.replace('SUP', ''));
        if (numPart > maxNum) maxNum = numPart;
    });
    const nextNum = maxNum + 1;
    return 'SUP' + String(nextNum).padStart(4, '0');
}

// Generate UOM ID - PRD A-FR-022
function generateUomId() {
    const existing = dataStore.uom;
    let maxNum = 0;
    existing.forEach(u => {
        const numPart = parseInt(u.uom_id.replace('UOM', ''));
        if (numPart > maxNum) maxNum = numPart;
    });
    const nextNum = maxNum + 1;
    return 'UOM' + String(nextNum).padStart(3, '0');
}

// Generate SKU - PRD A-FR-009, A.6.1
function generateSku(itemName) {
    // Extract first 3 consonants - PRD A.6.1
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    let prefix = '';
    const upperName = itemName.toUpperCase();

    for (let char of upperName) {
        if (consonants.includes(char)) {
            prefix += char;
            if (prefix.length === 3) break;
        }
    }

    // Pad with X if less than 3 consonants - PRD A.6.1
    while (prefix.length < 3) {
        prefix += 'X';
    }

    // Get next sequential number
    const existing = dataStore.item;
    let maxNum = 0;
    existing.forEach(i => {
        const numPart = parseInt(i.sku.slice(-4));
        if (numPart > maxNum) maxNum = numPart;
    });
    const nextNum = maxNum + 1;

    return prefix + String(nextNum).padStart(4, '0');
}

// Generate PO ID - PRD B-FR-001, B-FR-002, B-FR-003
function generatePoId(poDate) {
    const date = new Date(poDate);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const dateKey = dd + mm + yy;

    // Count existing POs for this date
    const existingForDate = dataStore.purchaseOrder.filter(po => {
        const poDateStr = new Date(po.po_date);
        const poDD = String(poDateStr.getDate()).padStart(2, '0');
        const poMM = String(poDateStr.getMonth() + 1).padStart(2, '0');
        const poYY = String(poDateStr.getFullYear()).slice(-2);
        return (poDD + poMM + poYY) === dateKey;
    });

    const nextSeq = existingForDate.length + 1;
    return 'PO-' + dateKey + '-' + String(nextSeq).padStart(3, '0');
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Get current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/* ===========================================
   Data Access Functions
   =========================================== */

// Get all records from a collection
function getAll(collection) {
    return dataStore[collection] || [];
}

// Get record by ID
function getById(collection, id) {
    return dataStore[collection].find(item => item.id === id);
}

// Add record
function addRecord(collection, record) {
    record.id = generateUUID();
    record.created_at = getCurrentTimestamp();
    record.created_by = currentUser.id;
    record.updated_at = getCurrentTimestamp();
    record.updated_by = currentUser.id;
    dataStore[collection].push(record);
    return record;
}

// Get active UOMs for dropdown - PRD A-FR-011
function getActiveUoms() {
    return dataStore.uom.filter(u => u.status === 'Active');
}

// Get active Suppliers for dropdown
function getActiveSuppliers() {
    return dataStore.supplier.filter(s => s.status === 'Active');
}

// Get active Items for dropdown
function getActiveItems() {
    return dataStore.item.filter(i => i.status === 'Active');
}

// Get parent Warehouses only - PRD B-FR-006a, B-FR-007b
function getParentWarehouses() {
    return dataStore.warehouse.filter(w => w.node_type === 'Warehouse' && w.status === 'Active');
}

// Get warehouses by type
function getWarehousesByType(type) {
    return dataStore.warehouse.filter(w => w.node_type === type);
}

// Get child nodes of a parent
function getChildNodes(parentId) {
    return dataStore.warehouse.filter(w => w.parent_id === parentId);
}

// Build warehouse hierarchy
function buildWarehouseHierarchy() {
    const warehouses = dataStore.warehouse.filter(w => w.node_type === 'Warehouse');
    return warehouses.map(wh => buildNodeTree(wh));
}

function buildNodeTree(node) {
    const children = getChildNodes(node.id);
    return {
        ...node,
        children: children.map(child => buildNodeTree(child))
    };
}

// Calculate full path for a warehouse node - PRD A.8.1 Computed Fields
function calculateFullPath(nodeId) {
    const node = getById('warehouse', nodeId);
    if (!node) return '';

    const path = [node.node_id];
    let currentNode = node;

    while (currentNode.parent_id) {
        currentNode = getById('warehouse', currentNode.parent_id);
        if (currentNode) {
            path.unshift(currentNode.node_id);
        } else {
            break;
        }
    }

    return path.join(' > ');
}

// Get inventory stock for an item - PRD B-FR-015
function getItemStock(itemId) {
    const inventoryRecords = dataStore.inventory.filter(inv => inv.item_id === itemId);
    let totalStock = 0;
    inventoryRecords.forEach(inv => {
        totalStock += parseFloat(inv.qty_on_hand) || 0;
    });
    return totalStock;
}
