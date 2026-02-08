/* ===========================================
   ERP Nimbus - Inventory Module
   Based on PRD Section A.7.9, A.7.10
   =========================================== */

// Pagination state
let inventoryCurrentPage = 1;
const inventoryPageSize = 10; // PRD A-FR-032b: Default 10 records per page

/* ===========================================
   Inventory List - PRD A.7.9
   UI Pattern: Data Table with Filters
   Purpose: View inventory levels per Item per Warehouse location. Read-only display.
   =========================================== */

function renderInventoryList() {
    const mainContent = document.getElementById('mainContent');

    // Get parent warehouses for filter dropdown - PRD A-FR-029
    const warehouses = getParentWarehouses();

    mainContent.innerHTML = `
        <!-- Page Header -->
        <!-- PRD A-FR-030: No Create button - Inventory is read-only -->
        <div class="page-header">
            <h1 class="page-title">Inventory</h1>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <!-- Table Header with Search and Filter - PRD A-FR-028, A-FR-029 -->
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="inventorySearch"
                           placeholder="Search by Item SKU, Item Name, or Warehouse Name..."
                           oninput="filterInventoryList()">
                </div>
                <div class="table-controls">
                    <!-- Warehouse Filter Dropdown - PRD A-FR-029 -->
                    <select class="form-select" id="inventoryWarehouseFilter" onchange="filterInventoryList()" style="width: 200px;">
                        <option value="">All Warehouses</option>
                        ${warehouses.map(w => `<option value="${w.id}">${w.node_id} - ${escapeHtml(w.name)}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Data Table - PRD A.7.9 -->
            <div id="inventoryTableContainer">
                ${renderInventoryTable()}
            </div>

            <!-- Pagination - PRD A-FR-032b -->
            <div class="table-footer" id="inventoryPagination">
                ${renderInventoryPagination()}
            </div>
        </div>

        <!-- Modal for View Detail - PRD A.7.10 -->
        <div class="modal-overlay" id="inventoryModal">
            <div class="modal modal-md" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="inventoryModalTitle">Inventory Detail</h3>
                    <button class="modal-close" onclick="closeInventoryModal()">&times;</button>
                </div>
                <div class="modal-body" id="inventoryModalBody">
                    <!-- View content -->
                </div>
                <div class="modal-footer" id="inventoryModalFooter">
                    <!-- Action buttons -->
                </div>
            </div>
        </div>
    `;
}

// Render Inventory Table - PRD A.7.9
function renderInventoryTable() {
    const searchTerm = document.getElementById('inventorySearch')?.value || '';
    const warehouseFilter = document.getElementById('inventoryWarehouseFilter')?.value || '';

    let inventories = [...dataStore.inventory];

    // Filter by warehouse - PRD A-FR-029
    if (warehouseFilter) {
        inventories = inventories.filter(inv => inv.warehouse_id === warehouseFilter);
    }

    // Filter by search - PRD A-FR-028: by Item SKU, Item Name, Warehouse Name
    if (searchTerm) {
        inventories = inventories.filter(inv => {
            const item = getById('item', inv.item_id);
            const warehouse = getById('warehouse', inv.warehouse_id);

            const itemSku = item ? item.sku : '';
            const itemName = item ? item.name : '';
            const whName = warehouse ? warehouse.name : '';

            const term = searchTerm.toLowerCase();
            return itemSku.toLowerCase().includes(term) ||
                   itemName.toLowerCase().includes(term) ||
                   whName.toLowerCase().includes(term);
        });
    }

    // PRD A.7.9 Phase 1 Implementation Note:
    // In Phase 1, inventory records will NOT be automatically created.
    // Show empty state with specific message.
    if (inventories.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128451;</div>
                <div class="empty-state-title">No inventory records found</div>
                <div class="empty-state-description">Stock is updated when Purchase Orders are completed.</div>
            </div>
        `;
    }

    // Paginate
    const paginatedData = paginate(inventories, inventoryCurrentPage, inventoryPageSize);

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Item SKU</th>
                    <th>Item Name</th>
                    <th>Warehouse</th>
                    <th>Location (Bin)</th>
                    <th>Quantity on Hand</th>
                    <th>UOM</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedData.items.forEach(inv => {
        const item = getById('item', inv.item_id);
        const warehouse = getById('warehouse', inv.warehouse_id);
        const bin = inv.bin_id ? getById('warehouse', inv.bin_id) : null;
        const uom = item ? getById('uom', item.uom_id) : null;

        html += `
            <tr onclick="viewInventory('${inv.id}')" style="cursor: pointer;">
                <td class="col-id">${item ? item.sku : '-'}</td>
                <td class="col-name">${item ? escapeHtml(item.name) : '-'}</td>
                <td>${warehouse ? escapeHtml(warehouse.name) : '-'}</td>
                <td>${bin ? `<span class="tag">${bin.node_id}</span>` : '-'}</td>
                <td class="col-number">${formatNumber(inv.qty_on_hand, 4)}</td>
                <td>${uom ? `<span class="tag">${uom.code}</span>` : '-'}</td>
                <td class="col-date">${formatDateTime(inv.updated_at)}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Update pagination
    setTimeout(() => {
        const paginationEl = document.getElementById('inventoryPagination');
        if (paginationEl) {
            paginationEl.innerHTML = renderPagination(paginatedData, 'goToInventoryPage');
        }
    }, 0);

    return html;
}

// Render Inventory Pagination
function renderInventoryPagination() {
    const inventories = dataStore.inventory;
    const paginatedData = paginate(inventories, inventoryCurrentPage, inventoryPageSize);
    return renderPagination(paginatedData, 'goToInventoryPage');
}

// Go to page
function goToInventoryPage(page) {
    inventoryCurrentPage = page;
    document.getElementById('inventoryTableContainer').innerHTML = renderInventoryTable();
}

// Filter inventory list
function filterInventoryList() {
    inventoryCurrentPage = 1;
    document.getElementById('inventoryTableContainer').innerHTML = renderInventoryTable();
}

/* ===========================================
   Inventory View Detail - PRD A.7.10
   UI Pattern: Modal (Read-only)
   =========================================== */

function viewInventory(id) {
    const inv = getById('inventory', id);
    if (!inv) return;

    const item = getById('item', inv.item_id);
    const warehouse = getById('warehouse', inv.warehouse_id);
    const bin = inv.bin_id ? getById('warehouse', inv.bin_id) : null;
    const uom = item ? getById('uom', item.uom_id) : null;
    const lastPo = inv.last_po_id ? getById('purchaseOrder', inv.last_po_id) : null;

    // Calculate full path - PRD A.7.10
    const fullPath = bin ? calculateFullPath(bin.id) : (warehouse ? calculateFullPath(warehouse.id) : '-');

    const modal = document.getElementById('inventoryModal');
    const title = document.getElementById('inventoryModalTitle');
    const body = document.getElementById('inventoryModalBody');
    const footer = document.getElementById('inventoryModalFooter');

    title.textContent = 'Inventory Detail';

    // PRD A.7.10 Fields Displayed
    body.innerHTML = `
        <div class="inventory-detail-grid">
            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Item SKU</div>
                <div class="inventory-detail-value mono">${item ? item.sku : '-'}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Item Name</div>
                <div class="inventory-detail-value" style="font-weight: 600;">${item ? escapeHtml(item.name) : '-'}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Brand</div>
                <div class="inventory-detail-value">${item && item.brand ? escapeHtml(item.brand) : '-'}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Warehouse</div>
                <div class="inventory-detail-value">${warehouse ? escapeHtml(warehouse.name) : '-'}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Location (Bin)</div>
                <div class="inventory-detail-value">${bin ? `<span class="tag">${bin.node_id}</span>` : '-'}</div>
            </div>

            <div class="inventory-detail-item full-width">
                <div class="inventory-detail-label">Full Path</div>
                <div class="inventory-detail-value">${fullPath}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Quantity on Hand</div>
                <div class="inventory-detail-value large">${formatNumber(inv.qty_on_hand, 4)}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">UOM</div>
                <div class="inventory-detail-value">${uom ? `<span class="tag">${uom.code}</span>` : '-'}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Last Received Date</div>
                <div class="inventory-detail-value">${inv.last_received_at ? formatDate(inv.last_received_at) : '-'}</div>
            </div>

            <div class="inventory-detail-item">
                <div class="inventory-detail-label">Last Received Qty</div>
                <div class="inventory-detail-value">${inv.last_received_qty ? formatNumber(inv.last_received_qty, 4) : '-'}</div>
            </div>

            <div class="inventory-detail-item full-width">
                <div class="inventory-detail-label">Last PO Reference</div>
                <div class="inventory-detail-value ${lastPo ? 'mono link' : ''}" ${lastPo ? `onclick="viewPoFromInventory('${lastPo.id}')"` : ''}>
                    ${lastPo ? lastPo.po_id : '-'}
                </div>
            </div>
        </div>
    `;

    // PRD A-FR-033, A-FR-034: Read-only with Close button only
    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeInventoryModal()">Close</button>
    `;

    modal.classList.add('active');
}

// Close Inventory Modal
function closeInventoryModal() {
    const modal = document.getElementById('inventoryModal');
    modal.classList.remove('active');
}

// View PO from Inventory - PRD A-FR-035
function viewPoFromInventory(poId) {
    closeInventoryModal();
    navigateTo('po-view', { id: poId });
}
