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

    // Warehouse - PRD A.8.1
    warehouse: [],

    // Supplier - PRD A.8.2
    supplier: [],

    // Item - PRD A.8.3
    item: [],

    // Inventory - PRD A.8.5 (Read-only, empty in Phase 1)
    inventory: [],

    // Purchase Order - PRD B.8.1
    purchaseOrder: [],

    // Purchase Order Line Items - PRD B.8.2
    purchaseOrderLineItem: [],

    // PO Attachment - PRD B.8.3
    poAttachment: []
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
