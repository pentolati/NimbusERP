/* ===========================================
   ERP Nimbus - Item Module
   Based on PRD Section A.7.5, A.7.6
   =========================================== */

// Pagination state
let itemCurrentPage = 1;
const itemPageSize = 10; // PRD A-FR-013b: Default 10 records per page

/* ===========================================
   Item List - PRD A.7.6
   UI Pattern: Data Table
   =========================================== */

function renderItemList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Item</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openItemCreate()">
                    + Create Item
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <!-- Table Header with Search - PRD A-FR-013 -->
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="itemSearch"
                           placeholder="Search by SKU Number or Name..."
                           oninput="filterItemList()">
                </div>
            </div>

            <!-- Data Table - PRD A.7.6 -->
            <div id="itemTableContainer">
                ${renderItemTable()}
            </div>

            <!-- Pagination - PRD A-FR-013b -->
            <div class="table-footer" id="itemPagination">
                ${renderItemPagination()}
            </div>
        </div>

        <!-- Modal for Create/View - PRD A.7.5: Centered Modal -->
        <div class="modal-overlay" id="itemModal">
            <div class="modal modal-md" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="itemModalTitle">Create Item</h3>
                    <button class="modal-close" onclick="closeItemModal()">&times;</button>
                </div>
                <div class="modal-body" id="itemModalBody">
                    <!-- Form content -->
                </div>
                <div class="modal-footer" id="itemModalFooter">
                    <!-- Action buttons -->
                </div>
            </div>
        </div>
    `;
}

// Render Item Table - PRD A.7.6
function renderItemTable() {
    const searchTerm = document.getElementById('itemSearch')?.value || '';
    let items = [...dataStore.item];

    // Filter - PRD A-FR-013: by SKU Number and Name
    if (searchTerm) {
        items = searchFilter(items, searchTerm, ['sku', 'name']);
    }

    if (items.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128230;</div>
                <div class="empty-state-title">No items found</div>
                <div class="empty-state-description">Create your first Item using the "Create Item" button above</div>
            </div>
        `;
    }

    // Paginate
    const paginatedData = paginate(items, itemCurrentPage, itemPageSize);

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>SKU Number</th>
                    <th>Brand</th>
                    <th>Nama Item</th>
                    <th>UOM</th>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th>Updated By</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedData.items.forEach(item => {
        // Get UOM name
        const uom = getById('uom', item.uom_id);
        const uomCode = uom ? uom.code : '-';

        html += `
            <tr>
                <td class="col-id" onclick="viewItem('${item.id}')">${item.sku}</td>
                <td>${escapeHtml(item.brand || '-')}</td>
                <td class="col-name">${escapeHtml(item.name)}</td>
                <td><span class="tag">${uomCode}</span></td>
                <td>${getStatusBadge(item.status)}</td>
                <td class="col-date">${formatDateTime(item.updated_at)}</td>
                <td>${currentUser.full_name}</td>
                <td class="col-action">
                    <button class="btn btn-secondary btn-sm" onclick="viewItem('${item.id}')">View</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Update pagination
    setTimeout(() => {
        const paginationEl = document.getElementById('itemPagination');
        if (paginationEl) {
            paginationEl.innerHTML = renderPagination(paginatedData, 'goToItemPage');
        }
    }, 0);

    return html;
}

// Render Item Pagination
function renderItemPagination() {
    const items = dataStore.item;
    const paginatedData = paginate(items, itemCurrentPage, itemPageSize);
    return renderPagination(paginatedData, 'goToItemPage');
}

// Go to page
function goToItemPage(page) {
    itemCurrentPage = page;
    document.getElementById('itemTableContainer').innerHTML = renderItemTable();
}

// Filter item list
function filterItemList() {
    itemCurrentPage = 1;
    document.getElementById('itemTableContainer').innerHTML = renderItemTable();
}

/* ===========================================
   Item Create - PRD A.7.5
   UI Pattern: Centered Modal
   =========================================== */

function openItemCreate() {
    const modal = document.getElementById('itemModal');
    const title = document.getElementById('itemModalTitle');
    const body = document.getElementById('itemModalBody');
    const footer = document.getElementById('itemModalFooter');

    title.textContent = 'Create Item';

    // Get active UOMs for dropdown - PRD A-FR-011
    const activeUoms = getActiveUoms();

    body.innerHTML = `
        <form id="itemForm">
            <!-- SKU Number - PRD A.7.5, A-FR-009 -->
            <div class="form-group">
                <label class="form-label required">SKU Number</label>
                <input type="text" class="form-input mono" id="item_sku" placeholder="Auto-generated from Name..." maxlength="10">
                <div class="form-hint">3 consonants + 4 digits. Editable before save.</div>
            </div>

            <!-- Brand - PRD A.7.5, A-FR-010 -->
            <div class="form-group">
                <label class="form-label">Brand</label>
                <input type="text" class="form-input" id="item_brand" placeholder="Optional brand name" maxlength="100">
                <div class="form-hint">Optional field</div>
            </div>

            <!-- Nama Item - PRD A.7.5 -->
            <div class="form-group">
                <label class="form-label required">Nama Item</label>
                <input type="text" class="form-input" id="item_name" placeholder="Enter item name" maxlength="200" required oninput="onItemNameChange()">
                <div class="form-hint">Triggers SKU generation logic</div>
            </div>

            <!-- Detail - PRD A.7.5 -->
            <div class="form-group">
                <label class="form-label">Detail</label>
                <textarea class="form-textarea" id="item_detail" placeholder="Optional description..." maxlength="1000"></textarea>
            </div>

            <!-- UOM - PRD A.7.5, A-FR-011 -->
            <div class="form-group">
                <label class="form-label required">UOM</label>
                <select class="form-select" id="item_uom" required>
                    <option value="">Select UOM...</option>
                    ${activeUoms.map(uom => `<option value="${uom.id}">${uom.code} - ${uom.name}</option>`).join('')}
                </select>
                <div class="form-hint">Only Active UOMs are shown</div>
            </div>

            <!-- Status - PRD A.7.5 -->
            <div class="form-group">
                <label class="form-label required">Status</label>
                <select class="form-select" id="item_status" required>
                    <option value="Active" selected>Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeItemModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveItem()">Save</button>
    `;

    modal.classList.add('active');
}

// On Item Name Change - Generate SKU - PRD A-FR-009, A.6.1
function onItemNameChange() {
    const name = document.getElementById('item_name').value.trim();
    const skuInput = document.getElementById('item_sku');

    if (name.length >= 1) {
        const sku = generateSku(name);
        skuInput.value = sku;
    } else {
        skuInput.value = '';
    }
}

// Save Item
function saveItem() {
    const errors = [];

    // Get form values
    const sku = document.getElementById('item_sku').value.trim().toUpperCase();
    const brand = document.getElementById('item_brand').value.trim();
    const name = document.getElementById('item_name').value.trim();
    const detail = document.getElementById('item_detail').value.trim();
    const uomId = document.getElementById('item_uom').value;
    const status = document.getElementById('item_status').value;

    // Validate required fields - PRD A-VR-004
    if (!sku) errors.push('SKU Number is required');
    if (!name) errors.push('Nama Item is required');
    if (!uomId) errors.push('UOM is required');

    // Validate SKU format - PRD A-VR-003a
    if (sku && !validateSku(sku)) {
        errors.push('SKU must be 3 uppercase consonants + 4 digits (e.g., SMS0001)');
    }

    // Validate SKU uniqueness - PRD A-FR-012, A-VR-003b
    if (sku && !isUnique('item', 'sku', sku)) {
        errors.push('SKU must be unique');
    }

    // Validate max lengths - PRD A.14.2
    if (!validateMaxLength(sku, 10)) errors.push('SKU must be maximum 10 characters');
    if (!validateMaxLength(brand, 100)) errors.push('Brand must be maximum 100 characters');
    if (!validateMaxLength(name, 200)) errors.push('Nama Item must be maximum 200 characters');
    if (!validateMaxLength(detail, 1000)) errors.push('Detail must be maximum 1000 characters');

    // Show validation errors - PRD D.5
    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    // Create item record - PRD A.8.3
    const item = {
        sku: sku,
        brand: brand || null,
        name: name,
        detail: detail || null,
        uom_id: uomId,
        status: status
    };

    addRecord('item', item);

    // Close modal
    closeItemModal();

    // Show success toast - PRD D.4.3
    showToast('success', 'Success', `Item '${name}' created successfully`);

    // Refresh list
    renderItemList();
}

// Close Item Modal
function closeItemModal() {
    const modal = document.getElementById('itemModal');
    modal.classList.remove('active');
}

/* ===========================================
   Item View - PRD A-FR-013a
   Read-only mode
   =========================================== */

function viewItem(id) {
    const item = getById('item', id);
    if (!item) return;

    const modal = document.getElementById('itemModal');
    const title = document.getElementById('itemModalTitle');
    const body = document.getElementById('itemModalBody');
    const footer = document.getElementById('itemModalFooter');

    title.textContent = 'View Item';

    // Get UOM name
    const uom = getById('uom', item.uom_id);
    const uomDisplay = uom ? `${uom.code} - ${uom.name}` : '-';

    body.innerHTML = `
        <div class="form-group">
            <label class="form-label">SKU Number</label>
            <input type="text" class="form-input mono" value="${item.sku}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Brand</label>
            <input type="text" class="form-input" value="${escapeHtml(item.brand || '-')}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Nama Item</label>
            <input type="text" class="form-input" value="${escapeHtml(item.name)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Detail</label>
            <textarea class="form-textarea" readonly disabled>${escapeHtml(item.detail || '')}</textarea>
        </div>

        <div class="form-group">
            <label class="form-label">UOM</label>
            <input type="text" class="form-input" value="${uomDisplay}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Status</label>
            ${getStatusBadge(item.status)}
        </div>

        <div class="form-group">
            <label class="form-label">Updated At</label>
            <input type="text" class="form-input" value="${formatDateTime(item.updated_at)}" readonly disabled>
        </div>
    `;

    // PRD A-FR-013a: Close button only, no Edit button (Edit out of scope for MVP)
    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeItemModal()">Close</button>
    `;

    modal.classList.add('active');
}
