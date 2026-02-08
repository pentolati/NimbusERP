/* ===========================================
   ERP Nimbus - Purchase Order Module
   Based on PRD Section B.7
   =========================================== */

// Pagination state
let poCurrentPage = 1;
const poPageSize = 10; // PRD B-FR-044: Default 10 records per page

// PO Form state
let poLineItems = [];
let poFormData = {};

// Render PO Create action buttons based on Workflow
// Shows: ONLY Initial statuses (user picks starting status)
// Transitions are shown in View mode AFTER PO is created
function renderPoCreateActions() {
    // Get ALL initial statuses for Purchase Order
    const initialStatuses = getAllInitialStatuses('Purchase Order');

    if (initialStatuses.length === 0) {
        // Fallback if no workflow defined
        return '<button type="button" class="btn btn-primary" onclick="submitPo()">Submit</button>';
    }

    // Create button for each Initial status
    return initialStatuses.map(initStatus => {
        const initLower = initStatus.toLowerCase();
        return `<button type="button" class="btn btn-primary" onclick="submitPoWithStatus('${initLower}')">${initStatus}</button>`;
    }).join(' ');
}

/* ===========================================
   PO List - PRD B.7.0
   UI Pattern: Data Table with Search/Filter
   =========================================== */

function renderPoList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Purchase Order</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="navigateTo('po-create')">
                    + Create PO
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <!-- Table Header with Search - PRD B-FR-046 -->
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="poSearch"
                           placeholder="Search by PO ID or Supplier Name..."
                           oninput="filterPoList()">
                </div>
            </div>

            <!-- Data Table - PRD B.7.0 -->
            <div id="poTableContainer">
                ${renderPoTable()}
            </div>

            <!-- Pagination - PRD B-FR-044 -->
            <div class="table-footer" id="poPagination">
                ${renderPoPagination()}
            </div>
        </div>
    `;
}

// Render PO Table - PRD B.7.0
function renderPoTable() {
    const searchTerm = document.getElementById('poSearch')?.value || '';
    let pos = [...dataStore.purchaseOrder];

    // Sort by Updated At newest first
    pos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // Filter - PRD B-FR-046: by PO ID and Supplier Name
    if (searchTerm) {
        pos = pos.filter(po => {
            const supplier = getById('supplier', po.supplier_id);
            const supplierName = supplier ? supplier.name : '';
            const term = searchTerm.toLowerCase();
            return po.po_id.toLowerCase().includes(term) ||
                   supplierName.toLowerCase().includes(term);
        });
    }

    if (pos.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128196;</div>
                <div class="empty-state-title">No purchase orders found</div>
                <div class="empty-state-description">Create your first Purchase Order using the "Create PO" button above</div>
            </div>
        `;
    }

    // Paginate
    const paginatedData = paginate(pos, poCurrentPage, poPageSize);

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>PO ID</th>
                    <th>PO Date</th>
                    <th>Supplier</th>
                    <th>Required Date</th>
                    <th>Delivery Date</th>
                    <th>Grand Total</th>
                    <th>Transfer Amount</th>
                    <th>Remaining Amount</th>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedData.items.forEach(po => {
        const supplier = getById('supplier', po.supplier_id);
        // PRD B-FR-049: Remaining Amount = Grand Total - Transfer Amount
        const remainingAmount = (po.grand_total || 0) - (po.transfer_amount || 0);
        const isFinal = isStatusFinal('Purchase Order', capitalizeStatus(po.status));

        // Check overdue: required_date passed AND no delivery_date AND not Final status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reqDate = new Date(po.required_date);
        reqDate.setHours(0, 0, 0, 0);
        const isOverdue = !isFinal && !po.delivery_date && reqDate < today;
        const overdueIcon = isOverdue ? ' <span class="badge badge-error" title="Overdue">Overdue</span>' : '';

        // Delivery date display
        const deliveryDisplay = po.delivery_date
            ? formatDate(po.delivery_date)
            : (isOverdue ? '<span style="color: var(--error);">-</span>' : '-');

        html += `
            <tr${isOverdue ? ' style="background-color: var(--error-bg);"' : ''}>
                <td class="col-id" onclick="navigateTo('po-view', {id: '${po.id}'})">${po.po_id}${overdueIcon}</td>
                <td class="col-date">${formatDate(po.po_date)}</td>
                <td class="col-name">${supplier ? escapeHtml(supplier.name) : '-'}</td>
                <td class="col-date">${formatDate(po.required_date)}</td>
                <td class="col-date">${deliveryDisplay}</td>
                <td class="col-currency">${formatCurrency(po.grand_total)}</td>
                <td class="col-currency">${formatCurrency(po.transfer_amount || 0)}</td>
                <td class="col-currency">${formatCurrency(remainingAmount)}</td>
                <td>${getStatusBadge(po.status)}</td>
                <td class="col-date">${formatDateTime(po.updated_at)}</td>
                <td class="col-action">
                    <div class="dropdown">
                        <button class="btn btn-secondary btn-sm btn-icon" onclick="togglePoMenu('${po.id}', event)">&#8942;</button>
                        <div class="dropdown-menu" id="poMenu_${po.id}">
                            <a href="#" class="dropdown-item" onclick="event.preventDefault(); closeAllDropdowns(); navigateTo('po-view', {id: '${po.id}'})">View Detail</a>
                            <a href="#" class="dropdown-item" onclick="event.preventDefault(); closeAllDropdowns(); showStatusHistoryModal('${po.id}')">View History</a>
                            ${!isFinal ? `<a href="#" class="dropdown-item" onclick="event.preventDefault(); closeAllDropdowns(); showChangeStatusModal('${po.id}')">Change Status</a>` : ''}
                            ${remainingAmount > 0 ? `<a href="#" class="dropdown-item" onclick="event.preventDefault(); closeAllDropdowns(); showPayRemainingModal('${po.id}', ${remainingAmount})">Pay Remaining</a>` : ''}
                            ${isFinal && !po.delivery_date ? `<a href="#" class="dropdown-item" onclick="event.preventDefault(); closeAllDropdowns(); flagAsDelivered('${po.id}')">Flag as Delivered</a>` : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Update pagination
    setTimeout(() => {
        const paginationEl = document.getElementById('poPagination');
        if (paginationEl) {
            paginationEl.innerHTML = renderPagination(paginatedData, 'goToPoPage');
        }
    }, 0);

    return html;
}

// Render PO Pagination
function renderPoPagination() {
    const pos = dataStore.purchaseOrder;
    const paginatedData = paginate(pos, poCurrentPage, poPageSize);
    return renderPagination(paginatedData, 'goToPoPage');
}

// Go to page
function goToPoPage(page) {
    poCurrentPage = page;
    document.getElementById('poTableContainer').innerHTML = renderPoTable();
}

// Filter PO list
function filterPoList() {
    poCurrentPage = 1;
    document.getElementById('poTableContainer').innerHTML = renderPoTable();
}

/* ===========================================
   PO Create - PRD B.7.1
   UI Pattern: Full-page Form with Sticky Summary Panel
   =========================================== */

function renderPoCreate() {
    const mainContent = document.getElementById('mainContent');

    // Initialize form state - PRD B.13
    poLineItems = [];
    poFormData = {
        po_date: new Date(),
        required_date: new Date(),
        tax_option: 'no_tax', // PRD B.13: Default to "No Tax"
        tax_percentage: 0,
        discount_type: null,
        discount_percentage: 0,
        discount_amount: 0,
        payment_method: null,
        paid_amount: 0,
        dp_percentage: 0,
        dp_amount: 0
    };

    // Generate PO ID - PRD B-FR-001
    const poId = generatePoId(poFormData.po_date);

    // Get data for dropdowns
    const activeSuppliers = getActiveSuppliers();
    const parentWarehouses = getParentWarehouses();

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Create Purchase Order</h1>
        </div>

        <!-- PO Form Container - PRD B.7.1: Full-page Form with Sticky Summary Panel -->
        <div class="po-form-container">
            <!-- Main Form -->
            <div class="po-form-main">
                <form id="poForm">
                    <!-- Header Section -->
                    <div class="card" style="margin-bottom: var(--space-4);">
                        <div class="card-body">
                            <h3 class="form-section-title">PO Information</h3>

                            <div class="form-row">
                                <!-- PO ID - PRD B.7.1: Read-only, Auto-gen -->
                                <div class="form-group">
                                    <label class="form-label required">PO ID</label>
                                    <input type="text" class="form-input mono" id="po_id" value="${poId}" readonly disabled>
                                    <div class="form-hint">Auto-generated (reactive to PO Date)</div>
                                </div>

                                <!-- PO Date - PRD B.7.1, B-FR-004 -->
                                <div class="form-group">
                                    <label class="form-label required">PO Date</label>
                                    <input type="datetime-local" class="form-input" id="po_date"
                                           value="${getDateTimeForInput(poFormData.po_date)}"
                                           onchange="onPoDateChange()">
                                    <div class="form-hint">Editable for backdate/future scenarios</div>
                                </div>
                            </div>

                            <div class="form-row">
                                <!-- Supplier - PRD B.7.1 -->
                                <div class="form-group">
                                    <label class="form-label required">Supplier</label>
                                    <select class="form-select" id="po_supplier" onchange="onSupplierChange()">
                                        <option value="">Select Supplier...</option>
                                        ${activeSuppliers.map(s => `<option value="${s.id}">${s.supp_id} - ${escapeHtml(s.name)}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- Required Date - PRD B.7.1, B-FR-008 -->
                                <div class="form-group">
                                    <label class="form-label required">Required Date</label>
                                    <input type="date" class="form-input" id="po_required_date"
                                           value="${getDateForInput(poFormData.required_date)}">
                                    <div class="form-hint">Must be >= PO Date</div>
                                </div>
                            </div>

                            <!-- Distribution Method - PRD B.7.1: Radio Button, no default -->
                            <div class="form-group">
                                <label class="form-label required">Distribution Method</label>
                                <div class="radio-group">
                                    <label class="radio-label">
                                        <input type="radio" name="po_distribution" value="pickup" onchange="onDistributionChange()">
                                        Pickup
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="po_distribution" value="delivery" onchange="onDistributionChange()">
                                        Delivery
                                    </label>
                                </div>
                            </div>

                            <!-- Warehouse - PRD B-FR-006a, B-FR-007: Always visible for both -->
                            <div class="form-group">
                                <label class="form-label required">Warehouse</label>
                                <select class="form-select" id="po_warehouse" onchange="onWarehouseChange()">
                                    <option value="">Select Warehouse...</option>
                                    ${parentWarehouses.map(w => `<option value="${w.id}">${w.node_id} - ${escapeHtml(w.name)}</option>`).join('')}
                                </select>
                                <div class="form-hint">Only parent Warehouse nodes shown</div>
                            </div>

                            <!-- Address - PRD B.7.1: Conditional, auto-filled -->
                            <div class="form-group" id="addressGroup" style="display: none;">
                                <label class="form-label required">Address</label>
                                <input type="text" class="form-input" id="po_address" placeholder="Address will auto-fill..." maxlength="500">
                                <div class="form-hint">Auto-fills from Supplier (Pickup) or Warehouse (Delivery). Editable.</div>
                            </div>
                        </div>
                    </div>

                    <!-- Item Lines Section - PRD B.7.2 -->
                    <div class="card" style="margin-bottom: var(--space-4);">
                        <div class="card-body">
                            <h3 class="form-section-title">Item Details</h3>

                            <div id="poItemsContainer">
                                ${renderPoItems()}
                            </div>

                            <!-- Add Item Button - PRD B-FR-009 -->
                            <div class="add-item-row">
                                <button type="button" class="btn btn-secondary" onclick="addPoItem()">+ Add Item</button>
                            </div>
                        </div>
                    </div>

                    <!-- Tax & Discount Section - PRD B.7.2 -->
                    <div class="card" style="margin-bottom: var(--space-4);">
                        <div class="card-body">
                            <h3 class="form-section-title">Tax & Discount</h3>

                            <div class="form-row">
                                <!-- Tax Option - PRD B.7.2: Default "No Tax" -->
                                <div class="form-group">
                                    <label class="form-label required">Tax Option</label>
                                    <div class="radio-group">
                                        <label class="radio-label">
                                            <input type="radio" name="po_tax_option" value="no_tax" checked onchange="onTaxOptionChange()">
                                            No Tax
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="po_tax_option" value="apply_tax" onchange="onTaxOptionChange()">
                                            Apply Tax
                                        </label>
                                    </div>
                                </div>

                                <!-- Tax Percentage - PRD B.7.2: Visible only if Apply Tax -->
                                <div class="form-group" id="taxPercentageGroup" style="display: none;">
                                    <label class="form-label required">Tax Percentage (%)</label>
                                    <input type="number" class="form-input" id="po_tax_percentage"
                                           min="0" max="100" step="0.01" value="0" oninput="calculateTotals()">
                                </div>
                            </div>

                            <div class="form-row">
                                <!-- Discount Type - PRD B-FR-023: Optional -->
                                <div class="form-group">
                                    <label class="form-label">Discount Type</label>
                                    <div class="radio-group">
                                        <label class="radio-label">
                                            <input type="radio" name="po_discount_type" value="" checked onchange="onDiscountTypeChange()">
                                            No Discount
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="po_discount_type" value="percentage" onchange="onDiscountTypeChange()">
                                            Percentage
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="po_discount_type" value="nominal" onchange="onDiscountTypeChange()">
                                            Nominal
                                        </label>
                                    </div>
                                </div>

                                <!-- Discount Fields - PRD B.7.2 -->
                                <div class="form-group" id="discountPercentageGroup" style="display: none;">
                                    <label class="form-label">Discount Percentage (%)</label>
                                    <input type="number" class="form-input" id="po_discount_percentage"
                                           min="0" max="100" step="0.01" value="0" oninput="calculateTotals()">
                                </div>
                                <div class="form-group" id="discountAmountGroup" style="display: none;">
                                    <label class="form-label">Discount Amount</label>
                                    <input type="number" class="form-input" id="po_discount_amount"
                                           min="0" step="0.01" value="0" oninput="calculateTotals()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Section - PRD B.7.2 Payment Fields -->
                    <div class="card" style="margin-bottom: var(--space-4);">
                        <div class="card-body">
                            <h3 class="form-section-title">Payment</h3>

                            <div class="form-row">
                                <!-- Payment Method - PRD B-FR-024, B-FR-025 -->
                                <div class="form-group">
                                    <label class="form-label required">Payment Method</label>
                                    <select class="form-select" id="po_payment_method" onchange="onPaymentMethodChange()">
                                        <option value="">Select Payment Method...</option>
                                        <option value="advance_payment">Advance Payment</option>
                                        <option value="payment_after_delivery">Payment After Delivery</option>
                                        <option value="down_payment">Down Payment</option>
                                    </select>
                                </div>

                                <!-- Paid Amount - PRD B-FR-025a: Always visible -->
                                <div class="form-group">
                                    <label class="form-label required">Paid Amount</label>
                                    <input type="number" class="form-input" id="po_paid_amount"
                                           min="0" step="0.01" value="0" oninput="onPaidAmountChange()">
                                </div>
                            </div>

                            <!-- DP Fields - PRD B-FR-025d: Visible only for Down Payment -->
                            <div class="form-row" id="dpFieldsRow" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label">DP Percentage (%)</label>
                                    <input type="number" class="form-input" id="po_dp_percentage"
                                           min="0" max="100" step="0.01" value="0" oninput="onDpPercentageChange()">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">DP Amount</label>
                                    <input type="number" class="form-input" id="po_dp_amount"
                                           min="0" step="0.01" value="0" oninput="onDpAmountChange()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Notes & Attachment Section -->
                    <div class="card">
                        <div class="card-body">
                            <h3 class="form-section-title">Notes & Attachment</h3>

                            <!-- Notes - PRD B.7.1 -->
                            <div class="form-group">
                                <label class="form-label">Notes</label>
                                <textarea class="form-textarea" id="po_notes" placeholder="Optional remarks..." maxlength="2000"></textarea>
                            </div>

                            <!-- Document Attachment - PRD B.7.1, B.7.3 -->
                            <div class="form-group">
                                <label class="form-label">Document Attachment</label>
                                <div class="file-upload" onclick="document.getElementById('po_attachment').click()">
                                    <div class="file-upload-icon">&#128206;</div>
                                    <div class="file-upload-text">Click to upload file</div>
                                    <div class="file-upload-hint">PDF or Image (Max 2MB)</div>
                                    <input type="file" id="po_attachment" accept=".pdf,.jpg,.jpeg,.png" onchange="onFileUpload(event)" hidden>
                                </div>
                                <div id="filePreviewContainer"></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Sticky Summary Panel - PRD B.7.1 -->
            <div class="po-summary-panel">
                <div class="po-summary-title">Summary</div>

                <div class="po-summary-row">
                    <span class="po-summary-label">Subtotal</span>
                    <span class="po-summary-value" id="summary_subtotal">Rp 0</span>
                </div>
                <div class="po-summary-row">
                    <span class="po-summary-label">Tax Amount</span>
                    <span class="po-summary-value" id="summary_tax">Rp 0</span>
                </div>
                <div class="po-summary-row">
                    <span class="po-summary-label">Discount Amount</span>
                    <span class="po-summary-value" id="summary_discount">Rp 0</span>
                </div>
                <div class="po-summary-row total">
                    <span class="po-summary-label">Grand Total</span>
                    <span class="po-summary-value" id="summary_grand_total">Rp 0</span>
                </div>

                <div class="divider"></div>

                <div class="po-summary-row">
                    <span class="po-summary-label">Paid Amount</span>
                    <span class="po-summary-value" id="summary_paid">Rp 0</span>
                </div>
                <div class="po-summary-row">
                    <span class="po-summary-label">Outstanding</span>
                    <span class="po-summary-value" id="summary_outstanding">Rp 0</span>
                </div>

                <!-- Action Buttons - Based on Workflow Transitions from Initial Status -->
                <div class="po-summary-actions">
                    ${renderPoCreateActions()}
                    <button type="button" class="btn btn-secondary" onclick="confirmBackPo()">Back</button>
                </div>
            </div>
        </div>
    `;
}

// Render PO Items Grid - PRD B.7.2
function renderPoItems() {
    if (poLineItems.length === 0) {
        return `
            <div class="empty-state" style="padding: var(--space-6);">
                <div class="empty-state-icon">&#128230;</div>
                <div class="empty-state-title">No items added</div>
                <div class="empty-state-description">Click "Add Item" to add line items</div>
            </div>
        `;
    }

    const activeItems = getActiveItems();

    let html = `
        <table class="editable-grid">
            <thead>
                <tr>
                    <th class="col-item">Item</th>
                    <th class="col-stock">Stock</th>
                    <th class="col-qty">Quantity</th>
                    <th class="col-uom">UOM</th>
                    <th class="col-price">Unit Price</th>
                    <th class="col-total">Total Amount</th>
                    <th class="col-action"></th>
                </tr>
            </thead>
            <tbody>
    `;

    poLineItems.forEach((item, index) => {
        const selectedItem = item.item_id ? getById('item', item.item_id) : null;
        const uom = selectedItem ? getById('uom', selectedItem.uom_id) : null;
        const stock = selectedItem ? getItemStock(selectedItem.id) : 0;

        html += `
            <tr>
                <td class="col-item">
                    <select class="form-select" onchange="onItemSelect(${index}, this.value)">
                        <option value="">Select Item...</option>
                        ${activeItems.map(i => `<option value="${i.id}" ${item.item_id === i.id ? 'selected' : ''}>${i.sku} - ${escapeHtml(i.name)}</option>`).join('')}
                    </select>
                </td>
                <td class="col-stock">
                    <div class="readonly-cell">${formatNumber(stock)}</div>
                </td>
                <td class="col-qty">
                    <input type="number" class="form-input" min="0.0001" step="0.0001"
                           value="${item.quantity || ''}" onchange="onItemQuantityChange(${index}, this.value)">
                </td>
                <td class="col-uom">
                    <div class="readonly-cell">${uom ? uom.code : '-'}</div>
                </td>
                <td class="col-price">
                    <input type="number" class="form-input" min="0" step="0.01"
                           value="${item.unit_price || ''}" onchange="onItemPriceChange(${index}, this.value)">
                </td>
                <td class="col-total">
                    <strong>${formatCurrency(item.total_amount || 0)}</strong>
                </td>
                <td class="col-action">
                    <button type="button" class="btn btn-icon btn-ghost" onclick="removePoItem(${index})"
                            ${poLineItems.length <= 1 ? 'disabled title="Cannot delete last item"' : ''}>
                        &#128465;
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    return html;
}

// Add PO Item - PRD B-FR-009
function addPoItem() {
    poLineItems.push({
        item_id: null,
        quantity: null,
        unit_price: null,
        total_amount: 0
    });
    document.getElementById('poItemsContainer').innerHTML = renderPoItems();
}

// Remove PO Item - PRD B-FR-010, B-FR-010a
function removePoItem(index) {
    if (poLineItems.length <= 1) {
        showToast('error', 'Error', 'Cannot delete last item. Minimum 1 item required.');
        return;
    }
    poLineItems.splice(index, 1);
    document.getElementById('poItemsContainer').innerHTML = renderPoItems();
    calculateTotals(); // PRD B-FR-010b
}

// On Item Select - PRD B-FR-012
function onItemSelect(index, itemId) {
    poLineItems[index].item_id = itemId || null;
    document.getElementById('poItemsContainer').innerHTML = renderPoItems();
    calculateTotals();
}

// On Item Quantity Change - PRD B-FR-014
function onItemQuantityChange(index, value) {
    poLineItems[index].quantity = parseFloat(value) || 0;
    poLineItems[index].total_amount = (poLineItems[index].quantity || 0) * (poLineItems[index].unit_price || 0);
    document.getElementById('poItemsContainer').innerHTML = renderPoItems();
    calculateTotals();
}

// On Item Price Change - PRD B-FR-014
function onItemPriceChange(index, value) {
    poLineItems[index].unit_price = parseFloat(value) || 0;
    poLineItems[index].total_amount = (poLineItems[index].quantity || 0) * (poLineItems[index].unit_price || 0);
    document.getElementById('poItemsContainer').innerHTML = renderPoItems();
    calculateTotals();
}

// On PO Date Change - PRD B-FR-004: Reactive PO ID generation
function onPoDateChange() {
    const poDate = document.getElementById('po_date').value;
    if (poDate) {
        const newPoId = generatePoId(new Date(poDate));
        document.getElementById('po_id').value = newPoId;
    }
}

// On Supplier Change - PRD B-FR-006
function onSupplierChange() {
    const distribution = document.querySelector('input[name="po_distribution"]:checked')?.value;
    if (distribution === 'pickup') {
        const supplierId = document.getElementById('po_supplier').value;
        if (supplierId) {
            const supplier = getById('supplier', supplierId);
            if (supplier) {
                document.getElementById('po_address').value = supplier.address;
            }
        }
    }
}

// On Distribution Change - PRD B-FR-006, B-FR-007
function onDistributionChange() {
    const distribution = document.querySelector('input[name="po_distribution"]:checked')?.value;
    const addressGroup = document.getElementById('addressGroup');
    const addressInput = document.getElementById('po_address');

    addressGroup.style.display = 'block';

    if (distribution === 'pickup') {
        // PRD B-FR-006: Auto-fill from Supplier address
        const supplierId = document.getElementById('po_supplier').value;
        if (supplierId) {
            const supplier = getById('supplier', supplierId);
            if (supplier) {
                addressInput.value = supplier.address;
            }
        }
    } else if (distribution === 'delivery') {
        // PRD B-FR-007a: Auto-fill from Warehouse address
        const warehouseId = document.getElementById('po_warehouse').value;
        if (warehouseId) {
            const warehouse = getById('warehouse', warehouseId);
            if (warehouse) {
                addressInput.value = warehouse.address;
            }
        }
    }
}

// On Warehouse Change - PRD B-FR-007a, B-FR-007c
function onWarehouseChange() {
    const distribution = document.querySelector('input[name="po_distribution"]:checked')?.value;
    if (distribution === 'delivery') {
        const warehouseId = document.getElementById('po_warehouse').value;
        if (warehouseId) {
            const warehouse = getById('warehouse', warehouseId);
            if (warehouse) {
                document.getElementById('po_address').value = warehouse.address;
            }
        }
    }
}

// On Tax Option Change - PRD B-FR-017, B-FR-018
function onTaxOptionChange() {
    const taxOption = document.querySelector('input[name="po_tax_option"]:checked')?.value;
    const taxPercentageGroup = document.getElementById('taxPercentageGroup');

    if (taxOption === 'apply_tax') {
        taxPercentageGroup.style.display = 'block';
    } else {
        taxPercentageGroup.style.display = 'none';
        document.getElementById('po_tax_percentage').value = 0;
    }
    calculateTotals();
}

// On Discount Type Change - PRD B-FR-023
function onDiscountTypeChange() {
    const discountType = document.querySelector('input[name="po_discount_type"]:checked')?.value;
    const discountPercentageGroup = document.getElementById('discountPercentageGroup');
    const discountAmountGroup = document.getElementById('discountAmountGroup');

    discountPercentageGroup.style.display = 'none';
    discountAmountGroup.style.display = 'none';

    if (discountType === 'percentage') {
        discountPercentageGroup.style.display = 'block';
    } else if (discountType === 'nominal') {
        discountAmountGroup.style.display = 'block';
    }

    document.getElementById('po_discount_percentage').value = 0;
    document.getElementById('po_discount_amount').value = 0;
    calculateTotals();
}

// On Payment Method Change - PRD B-FR-024, B-FR-025
function onPaymentMethodChange() {
    const paymentMethod = document.getElementById('po_payment_method').value;
    const paidAmountInput = document.getElementById('po_paid_amount');
    const dpFieldsRow = document.getElementById('dpFieldsRow');

    dpFieldsRow.style.display = 'none';

    if (paymentMethod === 'advance_payment') {
        // Advance Payment: Auto-fill with Grand Total, disabled
        const grandTotal = parseFloat(document.getElementById('summary_grand_total').textContent.replace(/[^\d]/g, '')) || 0;
        paidAmountInput.value = grandTotal;
        paidAmountInput.readOnly = true;
        paidAmountInput.classList.add('readonly');
    } else if (paymentMethod === 'payment_after_delivery') {
        // PRD B-FR-025c: Auto-fill 0, read-only
        paidAmountInput.value = 0;
        paidAmountInput.readOnly = true;
        paidAmountInput.classList.add('readonly');
    } else if (paymentMethod === 'down_payment') {
        // PRD B-FR-025d: Show DP fields
        dpFieldsRow.style.display = 'flex';
        paidAmountInput.readOnly = false;
        paidAmountInput.classList.remove('readonly');
    } else {
        paidAmountInput.readOnly = false;
        paidAmountInput.classList.remove('readonly');
    }

    calculateTotals();
}

// On DP Percentage Change - PRD B-FR-025e
function onDpPercentageChange() {
    const dpPercentage = parseFloat(document.getElementById('po_dp_percentage').value) || 0;
    const grandTotal = parseFloat(document.getElementById('summary_grand_total').textContent.replace(/[^\d]/g, '')) || 0;

    const dpAmount = grandTotal * (dpPercentage / 100);
    document.getElementById('po_dp_amount').value = dpAmount.toFixed(2);
    // PRD B-FR-025e: Copy to Paid Amount
    document.getElementById('po_paid_amount').value = dpAmount.toFixed(2);

    calculateTotals();
}

// On DP Amount Change - PRD B-FR-025f
function onDpAmountChange() {
    const dpAmount = parseFloat(document.getElementById('po_dp_amount').value) || 0;
    const grandTotal = parseFloat(document.getElementById('summary_grand_total').textContent.replace(/[^\d]/g, '')) || 0;

    if (grandTotal > 0) {
        const dpPercentage = (dpAmount / grandTotal) * 100;
        document.getElementById('po_dp_percentage').value = dpPercentage.toFixed(2);
    }
    // PRD B-FR-025f: Copy to Paid Amount
    document.getElementById('po_paid_amount').value = dpAmount.toFixed(2);

    calculateTotals();
}

// On Paid Amount Change
function onPaidAmountChange() {
    calculateTotals();
}

// Calculate Totals - PRD B-FR-016 to B-FR-023
function calculateTotals() {
    // Subtotal - PRD B-FR-016
    let subtotal = 0;
    poLineItems.forEach(item => {
        subtotal += item.total_amount || 0;
    });

    // Tax Amount - PRD B-FR-019
    const taxOption = document.querySelector('input[name="po_tax_option"]:checked')?.value;
    let taxAmount = 0;
    if (taxOption === 'apply_tax') {
        const taxPercentage = parseFloat(document.getElementById('po_tax_percentage').value) || 0;
        taxAmount = subtotal * (taxPercentage / 100);
    }

    // Discount Amount - PRD B-FR-023b, B-FR-023c, B-FR-023d (applied AFTER tax)
    const discountType = document.querySelector('input[name="po_discount_type"]:checked')?.value;
    let discountAmount = 0;
    const subtotalPlusTax = subtotal + taxAmount;

    if (discountType === 'percentage') {
        const discountPercentage = parseFloat(document.getElementById('po_discount_percentage').value) || 0;
        discountAmount = subtotalPlusTax * (discountPercentage / 100);
    } else if (discountType === 'nominal') {
        discountAmount = parseFloat(document.getElementById('po_discount_amount').value) || 0;
    }

    // Grand Total - PRD B-FR-021
    const grandTotal = subtotalPlusTax - discountAmount;

    // Paid Amount
    const paidAmount = parseFloat(document.getElementById('po_paid_amount').value) || 0;

    // Outstanding - PRD B-FR-023e
    const outstanding = grandTotal - paidAmount;

    // Update summary panel
    document.getElementById('summary_subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary_tax').textContent = formatCurrency(taxAmount);
    document.getElementById('summary_discount').textContent = formatCurrency(discountAmount);
    document.getElementById('summary_grand_total').textContent = formatCurrency(grandTotal);
    document.getElementById('summary_paid').textContent = formatCurrency(paidAmount);
    document.getElementById('summary_outstanding').textContent = formatCurrency(outstanding);

    // PRD B-FR-025h: Recalculate DP Amount if DP Percentage has value
    const paymentMethod = document.getElementById('po_payment_method').value;
    if (paymentMethod === 'down_payment') {
        const dpPercentage = parseFloat(document.getElementById('po_dp_percentage').value) || 0;
        if (dpPercentage > 0) {
            const newDpAmount = grandTotal * (dpPercentage / 100);
            document.getElementById('po_dp_amount').value = newDpAmount.toFixed(2);
            document.getElementById('po_paid_amount').value = newDpAmount.toFixed(2);
        }
    }
}

// File Upload - PRD B-FR-026 to B-FR-029
function onFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - PRD B-FR-026, B-VR-027
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showValidationModal(['Unsupported file format. Only PDF or Image (.jpg/.jpeg/.png) are allowed']);
        event.target.value = '';
        return;
    }

    // Validate file size - PRD B-FR-027, B-VR-028
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        showValidationModal(['Maximum file size is 2MB']);
        event.target.value = '';
        return;
    }

    // Show preview
    const container = document.getElementById('filePreviewContainer');
    container.innerHTML = `
        <div class="file-preview">
            <span class="file-preview-icon">&#128196;</span>
            <span class="file-preview-name">${file.name}</span>
            <div class="file-preview-actions">
                <button type="button" class="btn btn-sm btn-ghost" onclick="removeFile()">&#128465; Remove</button>
            </div>
        </div>
    `;
}

function removeFile() {
    document.getElementById('po_attachment').value = '';
    document.getElementById('filePreviewContainer').innerHTML = '';
}

// Confirm Back - PRD B-FR-033, B-FR-033a
function confirmBackPo() {
    showConfirmModal('Unsaved changes will be lost. Continue?', () => {
        navigateTo('po-list');
    });
}

// Submit PO with specific status (from workflow)
function submitPoWithStatus(status) {
    submitPo(status);
}

// Submit PO - PRD B-FR-031
function submitPo(targetStatus = 'submitted') {
    const errors = [];

    // Get form values
    const poId = document.getElementById('po_id').value;
    const poDate = document.getElementById('po_date').value;
    const supplierId = document.getElementById('po_supplier').value;
    const distribution = document.querySelector('input[name="po_distribution"]:checked')?.value;
    const warehouseId = document.getElementById('po_warehouse').value;
    const address = document.getElementById('po_address').value.trim();
    const requiredDate = document.getElementById('po_required_date').value;
    const taxOption = document.querySelector('input[name="po_tax_option"]:checked')?.value;
    const taxPercentage = parseFloat(document.getElementById('po_tax_percentage').value) || 0;
    const discountType = document.querySelector('input[name="po_discount_type"]:checked')?.value || null;
    const discountPercentage = parseFloat(document.getElementById('po_discount_percentage').value) || 0;
    const discountAmountInput = parseFloat(document.getElementById('po_discount_amount').value) || 0;
    const paymentMethod = document.getElementById('po_payment_method').value;
    const paidAmount = parseFloat(document.getElementById('po_paid_amount').value) || 0;
    const dpPercentage = parseFloat(document.getElementById('po_dp_percentage').value) || 0;
    const dpAmount = parseFloat(document.getElementById('po_dp_amount').value) || 0;
    const notes = document.getElementById('po_notes').value.trim();

    // Validate required fields
    if (!supplierId) errors.push('Supplier is required');
    if (!distribution) errors.push('Distribution Method is required');
    if (!warehouseId) errors.push('Warehouse is required');
    if (!address) errors.push('Address is required');
    if (!requiredDate) errors.push('Required Date is required');
    if (!paymentMethod) errors.push('Payment Method is required');

    // Validate Required Date >= PO Date - PRD B-VR-005
    if (requiredDate && poDate) {
        const reqDate = new Date(requiredDate);
        const pDate = new Date(poDate);
        reqDate.setHours(0, 0, 0, 0);
        pDate.setHours(0, 0, 0, 0);
        if (reqDate < pDate) {
            errors.push('Required Date cannot be earlier than PO Date');
        }
    }

    // Validate at least 1 item - PRD B-VR-007
    const validItems = poLineItems.filter(item => item.item_id && item.quantity > 0 && item.unit_price > 0);
    if (validItems.length === 0) {
        errors.push('At least 1 item is required with valid quantity and unit price');
    }

    // Validate items
    poLineItems.forEach((item, index) => {
        if (item.item_id) {
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
            }
            if (!item.unit_price || item.unit_price <= 0) {
                errors.push(`Item ${index + 1}: Unit Price must be greater than 0`);
            }
        }
    });

    // Validate tax percentage - PRD B-VR-013
    if (taxOption === 'apply_tax' && (taxPercentage < 0 || taxPercentage > 100)) {
        errors.push('Tax Percentage must be between 0-100');
    }

    // Calculate totals for validation
    let subtotal = 0;
    validItems.forEach(item => {
        subtotal += item.total_amount || 0;
    });
    let taxAmount = taxOption === 'apply_tax' ? subtotal * (taxPercentage / 100) : 0;
    const subtotalPlusTax = subtotal + taxAmount;
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = subtotalPlusTax * (discountPercentage / 100);
    } else if (discountType === 'nominal') {
        discountAmount = discountAmountInput;
    }
    const grandTotal = subtotalPlusTax - discountAmount;

    // Validate payment - PRD B-VR-018, B-VR-019, B-VR-020
    if (paymentMethod === 'advance_payment') {
        if (Math.abs(paidAmount - grandTotal) > 0.01) {
            errors.push('Paid Amount must equal Grand Total for Advance Payment');
        }
    } else if (paymentMethod === 'down_payment') {
        if (paidAmount <= 0) {
            errors.push('Paid Amount must be greater than 0 for Down Payment');
        }
        if (paidAmount > grandTotal) {
            errors.push('Paid Amount cannot exceed Grand Total');
        }
    }

    // Show validation errors - PRD B-FR-035
    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    // Create PO record - PRD B.8.1
    const po = {
        po_id: poId,
        po_date: poDate,
        supplier_id: supplierId,
        distribution_method: distribution,
        warehouse_id: warehouseId,
        address: address,
        required_date: requiredDate,
        subtotal: subtotal,
        tax_option: taxOption,
        tax_percentage: taxOption === 'apply_tax' ? taxPercentage : null,
        tax_amount: taxAmount,
        discount_type: discountType || null,
        discount_percentage: discountType === 'percentage' ? discountPercentage : null,
        discount_amount: discountAmount,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        paid_amount: paidAmount,
        outstanding: grandTotal - paidAmount,
        dp_percentage: paymentMethod === 'down_payment' && dpPercentage > 0 ? dpPercentage : null,
        dp_amount: paymentMethod === 'down_payment' && dpAmount > 0 ? dpAmount : null,
        notes: notes || null,
        delivery_date: null, // PRD B.8.1 Note: defaults to null in Phase 1
        transfer_amount: paymentMethod === 'advance_payment' ? grandTotal : (paymentMethod === 'down_payment' ? dpAmount : 0),
        status: targetStatus, // Status from workflow transition
        is_active: true
    };

    const savedPo = addRecord('purchaseOrder', po);

    // Log initial status
    dataStore.poStatusLog.push({
        id: generateUUID(),
        po_id: savedPo.id,
        from_status: null,
        to_status: capitalizeStatus(targetStatus),
        changed_by: currentUser.id,
        changed_at: getCurrentTimestamp(),
        comment: 'Initial creation'
    });

    // Create line items - PRD B.8.2
    validItems.forEach((item, index) => {
        const lineItem = {
            po_id: savedPo.id,
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_amount: item.total_amount,
            line_number: index + 1
        };
        addRecord('purchaseOrderLineItem', lineItem);
    });

    // Show success toast - PRD B-FR-036
    const statusDisplay = targetStatus.charAt(0).toUpperCase() + targetStatus.slice(1);
    showToast('success', 'Success', `Purchase Order ${poId} ${statusDisplay} successfully`);

    // Redirect to PO List - PRD B-FR-038
    navigateTo('po-list');
}

/* ===========================================
   PO View - PRD B-FR-047a
   Read-only mode
   =========================================== */

function renderPoView(params) {
    const po = getById('purchaseOrder', params.id);
    if (!po) {
        navigateTo('po-list');
        return;
    }

    const mainContent = document.getElementById('mainContent');
    const supplier = getById('supplier', po.supplier_id);
    const warehouse = getById('warehouse', po.warehouse_id);
    const lineItems = dataStore.purchaseOrderLineItem.filter(li => li.po_id === po.id);

    // Check if current status is FINAL (no more transitions, PO locked)
    const isFinalStatus = isStatusFinal('Purchase Order', capitalizeStatus(po.status));

    let actionButtons = '';

    if (!isFinalStatus) {
        // Generate action buttons based on WORKFLOW transitions
        const userRoleIds = getUserRoleIds(currentUser.id);
        const transitions = getAvailableTransitions('Purchase Order', capitalizeStatus(po.status), userRoleIds);

        transitions.forEach(t => {
            // Determine button style based on to_status (danger for Cancel/Reject, primary for others)
            const isDanger = t.to_status.toLowerCase() === 'cancelled' || t.to_status.toLowerCase() === 'rejected';
            const btnClass = isDanger ? 'btn-danger' : 'btn-primary';
            actionButtons += `<button class="btn ${btnClass}" onclick="executeTransition('${po.id}', '${t.to_status}')">${t.to_status}</button> `;
        });
    }
    // If Final status: no action buttons (PO is locked)

    // Show Final indicator if status is Final (no more status changes possible)
    const finalBadge = isFinalStatus ? '<span class="badge badge-warning" style="margin-left: 12px;">Final</span>' : '';

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">View Purchase Order ${finalBadge}</h1>
            <div class="page-actions">
                ${actionButtons}
                <!-- PRD B-FR-039, B-FR-040: Print and Download buttons in View mode -->
                <button class="btn btn-secondary" onclick="printPo('${po.id}')">&#128424; Print PO</button>
                <button class="btn btn-secondary" onclick="downloadPoPdf('${po.id}')">&#128229; Download PDF</button>
                <button class="btn btn-secondary" onclick="navigateTo('po-list')">Back to List</button>
            </div>
        </div>

        <!-- PO Details - Read Only -->
        <div class="po-form-container">
            <div class="po-form-main">
                <!-- Header Section -->
                <div class="card" style="margin-bottom: var(--space-4);">
                    <div class="card-body">
                        <h3 class="form-section-title">PO Information</h3>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">PO ID</label>
                                <input type="text" class="form-input mono" value="${po.po_id}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">PO Date</label>
                                <input type="text" class="form-input" value="${formatDateTime(po.po_date)}" readonly disabled>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Supplier</label>
                                <input type="text" class="form-input" value="${supplier ? escapeHtml(supplier.name) : '-'}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Required Date</label>
                                <input type="text" class="form-input" value="${formatDate(po.required_date)}" readonly disabled>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Distribution Method</label>
                                <input type="text" class="form-input" value="${po.distribution_method === 'pickup' ? 'Pickup' : 'Delivery'}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Warehouse</label>
                                <input type="text" class="form-input" value="${warehouse ? escapeHtml(warehouse.name) : '-'}" readonly disabled>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input type="text" class="form-input" value="${escapeHtml(po.address)}" readonly disabled>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Status</label>
                            ${getStatusBadge(po.status)}
                        </div>

                        ${po.status === 'rejected' && po.rejection_reason ? `
                        <div class="form-group">
                            <label class="form-label">Rejection Reason</label>
                            <div style="background: var(--error-bg); padding: var(--space-3); border-radius: var(--radius-md); color: var(--error);">
                                ${escapeHtml(po.rejection_reason)}
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Rejected At</label>
                                <input type="text" class="form-input" value="${formatDateTime(po.rejected_at)}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Rejected By</label>
                                <input type="text" class="form-input" value="${currentUser.full_name}" readonly disabled>
                            </div>
                        </div>
                        ` : ''}

                        ${po.status === 'cancelled' && po.cancellation_reason ? `
                        <div class="form-group">
                            <label class="form-label">Cancellation Reason</label>
                            <div style="background: var(--error-bg); padding: var(--space-3); border-radius: var(--radius-md); color: var(--error);">
                                ${escapeHtml(po.cancellation_reason)}
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Cancelled At</label>
                                <input type="text" class="form-input" value="${formatDateTime(po.cancelled_at)}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Cancelled By</label>
                                <input type="text" class="form-input" value="${currentUser.full_name}" readonly disabled>
                            </div>
                        </div>
                        ` : ''}

                        ${po.status === 'approved' ? `
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Approved At</label>
                                <input type="text" class="form-input" value="${formatDateTime(po.approved_at)}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Approved By</label>
                                <input type="text" class="form-input" value="${currentUser.full_name}" readonly disabled>
                            </div>
                        </div>
                        ` : ''}

                        ${po.status === 'completed' ? `
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Completed At</label>
                                <input type="text" class="form-input" value="${formatDateTime(po.completed_at)}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Invoice Number</label>
                                <input type="text" class="form-input" value="${po.invoice_number || '-'}" readonly disabled>
                            </div>
                        </div>
                        ${po.completion_notes ? `
                        <div class="form-group">
                            <label class="form-label">Completion Notes</label>
                            <div style="background: var(--success-bg); padding: var(--space-3); border-radius: var(--radius-md); color: var(--success);">
                                ${escapeHtml(po.completion_notes)}
                            </div>
                        </div>
                        ` : ''}
                        ` : ''}
                    </div>
                </div>

                <!-- Item Lines -->
                <div class="card" style="margin-bottom: var(--space-4);">
                    <div class="card-body">
                        <h3 class="form-section-title">Item Details</h3>

                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>UOM</th>
                                    <th>Unit Price</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lineItems.map((li, idx) => {
                                    const item = getById('item', li.item_id);
                                    const uom = item ? getById('uom', item.uom_id) : null;
                                    return `
                                        <tr>
                                            <td>${idx + 1}</td>
                                            <td class="col-name">${item ? escapeHtml(item.name) : '-'}</td>
                                            <td class="col-number">${formatNumber(li.quantity, 4)}</td>
                                            <td>${uom ? uom.code : '-'}</td>
                                            <td class="col-currency">${formatCurrency(li.unit_price)}</td>
                                            <td class="col-currency">${formatCurrency(li.total_amount)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tax & Payment -->
                <div class="card" style="margin-bottom: var(--space-4);">
                    <div class="card-body">
                        <h3 class="form-section-title">Tax & Payment</h3>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tax Option</label>
                                <input type="text" class="form-input" value="${po.tax_option === 'apply_tax' ? 'Apply Tax' : 'No Tax'}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tax Percentage</label>
                                <input type="text" class="form-input" value="${po.tax_percentage ? po.tax_percentage + '%' : '-'}" readonly disabled>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Discount Type</label>
                                <input type="text" class="form-input" value="${po.discount_type ? (po.discount_type === 'percentage' ? 'Percentage' : 'Nominal') : 'No Discount'}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Discount</label>
                                <input type="text" class="form-input" value="${po.discount_type === 'percentage' ? (po.discount_percentage + '%') : formatCurrency(po.discount_amount || 0)}" readonly disabled>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Payment Method</label>
                                <input type="text" class="form-input" value="${formatPaymentMethod(po.payment_method)}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Initial Paid Amount</label>
                                <input type="text" class="form-input" value="${formatCurrency(po.paid_amount)}" readonly disabled>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <div class="card">
                    <div class="card-body">
                        <h3 class="form-section-title">Notes</h3>
                        <div class="form-group">
                            <textarea class="form-textarea" readonly disabled>${escapeHtml(po.notes || '-')}</textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Panel -->
            <div class="po-summary-panel">
                <div class="po-summary-title">Summary</div>

                <div class="po-summary-row">
                    <span class="po-summary-label">Subtotal</span>
                    <span class="po-summary-value">${formatCurrency(po.subtotal)}</span>
                </div>
                <div class="po-summary-row">
                    <span class="po-summary-label">Tax Amount</span>
                    <span class="po-summary-value">${formatCurrency(po.tax_amount)}</span>
                </div>
                <div class="po-summary-row">
                    <span class="po-summary-label">Discount Amount</span>
                    <span class="po-summary-value">${formatCurrency(po.discount_amount || 0)}</span>
                </div>
                <div class="po-summary-row total">
                    <span class="po-summary-label">Grand Total</span>
                    <span class="po-summary-value">${formatCurrency(po.grand_total)}</span>
                </div>

                <div class="divider"></div>

                <div class="po-summary-row">
                    <span class="po-summary-label">Transfer Amount</span>
                    <span class="po-summary-value">${formatCurrency(po.transfer_amount || 0)}</span>
                </div>
                <div class="po-summary-row">
                    <span class="po-summary-label">Remaining Amount</span>
                    <span class="po-summary-value">${formatCurrency((po.grand_total || 0) - (po.transfer_amount || 0))}</span>
                </div>

                <div class="divider"></div>

                <div class="po-summary-row">
                    <span class="po-summary-label">Updated At</span>
                    <span class="po-summary-value">${formatDateTime(po.updated_at)}</span>
                </div>
            </div>
        </div>
    `;
}

// Format Payment Method
function formatPaymentMethod(method) {
    const methods = {
        'advance_payment': 'Advance Payment',
        'payment_after_delivery': 'Payment After Delivery',
        'down_payment': 'Down Payment'
    };
    return methods[method] || method;
}

// Print PO - PRD B-FR-039
function printPo(poId) {
    showToast('info', 'Info', 'Print functionality - would open print dialog');
}

// Download PO PDF - PRD B-FR-040
function downloadPoPdf(poId) {
    showToast('info', 'Info', 'Download PDF functionality - would generate PDF');
}

/* ===========================================
   PO Workflow Actions - Integrated with Workflow Engine
   =========================================== */

// Helper: Capitalize status (draft -> Draft) for workflow matching
function capitalizeStatus(status) {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Execute workflow transition (generic)
function executeTransition(poId, toStatus) {
    const statusLower = toStatus.toLowerCase();
    const statusDisplay = toStatus;

    showConfirmModal(`Are you sure you want to change status to "${statusDisplay}"?`, () => {
        const po = getById('purchaseOrder', poId);
        if (po) {
            const now = getCurrentTimestamp();
            const oldStatus = capitalizeStatus(po.status);

            // Log status change
            dataStore.poStatusLog.push({
                id: generateUUID(),
                po_id: poId,
                from_status: oldStatus,
                to_status: toStatus,
                changed_by: currentUser.id,
                changed_at: now,
                comment: 'Status transition'
            });

            po.status = statusLower;
            po.updated_at = now;
            po.updated_by = currentUser.id;

            // Set specific timestamps based on status
            if (statusLower === 'submitted') {
                po.submitted_at = now;
                po.submitted_by = currentUser.id;
            } else if (statusLower === 'approved') {
                po.approved_at = now;
                po.approved_by = currentUser.id;
            }

            showToast('success', 'Success', `PO ${po.po_id} status changed to ${statusDisplay}`);
            renderPoView({ id: poId });
        }
    });
}

// Approve PO (legacy, now uses executeTransition)
function approvePo(poId) {
    showConfirmModal('Are you sure you want to approve this Purchase Order?', () => {
        const po = getById('purchaseOrder', poId);
        if (po) {
            po.status = 'approved';
            po.approved_at = getCurrentTimestamp();
            po.approved_by = currentUser.id;
            po.updated_at = getCurrentTimestamp();
            po.updated_by = currentUser.id;

            showToast('success', 'Success', `PO ${po.po_id} has been approved`);
            renderPoView({ id: poId });
        }
    });
}

// Submit Draft PO - PRD B.18.2
function submitDraftPo(poId) {
    showConfirmModal('Are you sure you want to submit this Purchase Order?', () => {
        const po = getById('purchaseOrder', poId);
        if (po) {
            po.status = 'submitted';
            po.submitted_at = getCurrentTimestamp();
            po.submitted_by = currentUser.id;
            po.updated_at = getCurrentTimestamp();
            po.updated_by = currentUser.id;

            showToast('success', 'Success', `PO ${po.po_id} has been submitted for approval`);
            renderPoView({ id: poId });
        }
    });
}

// Show Reject Modal - PRD B.18.2
function showRejectModal(poId) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');

    messageEl.innerHTML = `
        <div style="text-align: left;">
            <p style="margin-bottom: var(--space-3);">Are you sure you want to reject this Purchase Order?</p>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label required">Rejection Reason</label>
                <textarea class="form-textarea" id="rejectionReason" placeholder="Enter reason for rejection..." maxlength="500" required style="width: 100%;"></textarea>
            </div>
        </div>
    `;

    // Update button text
    yesBtn.textContent = 'Reject';
    yesBtn.className = 'btn btn-danger';

    // Remove old listener and add new one
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.addEventListener('click', () => {
        const reason = document.getElementById('rejectionReason').value.trim();
        if (!reason) {
            showValidationModal(['Rejection reason is required']);
            return;
        }

        const po = getById('purchaseOrder', poId);
        if (po) {
            po.status = 'rejected';
            po.rejected_at = getCurrentTimestamp();
            po.rejected_by = currentUser.id;
            po.rejection_reason = reason;
            po.updated_at = getCurrentTimestamp();
            po.updated_by = currentUser.id;

            closeConfirmModal();
            showToast('success', 'Success', `PO ${po.po_id} has been rejected`);
            renderPoView({ id: poId });
        }
    });

    modal.classList.add('active');
}

// Show Cancel Modal - PRD B.18.2
function showCancelModal(poId) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');

    messageEl.innerHTML = `
        <div style="text-align: left;">
            <p style="margin-bottom: var(--space-3);">Are you sure you want to cancel this Purchase Order?</p>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label required">Cancellation Reason</label>
                <textarea class="form-textarea" id="cancellationReason" placeholder="Enter reason for cancellation..." maxlength="500" required style="width: 100%;"></textarea>
            </div>
        </div>
    `;

    // Update button text
    yesBtn.textContent = 'Cancel PO';
    yesBtn.className = 'btn btn-danger';

    // Remove old listener and add new one
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.addEventListener('click', () => {
        const reason = document.getElementById('cancellationReason').value.trim();
        if (!reason) {
            showValidationModal(['Cancellation reason is required']);
            return;
        }

        const po = getById('purchaseOrder', poId);
        if (po) {
            po.status = 'cancelled';
            po.cancelled_at = getCurrentTimestamp();
            po.cancelled_by = currentUser.id;
            po.cancellation_reason = reason;
            po.updated_at = getCurrentTimestamp();
            po.updated_by = currentUser.id;

            closeConfirmModal();
            showToast('success', 'Success', `PO ${po.po_id} has been cancelled`);
            renderPoView({ id: poId });
        }
    });

    modal.classList.add('active');
}

/* ===========================================
   Three-Dots Menu Functions
   =========================================== */

// Close all dropdown menus
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });
}

// Toggle PO dropdown menu
function togglePoMenu(poId, event) {
    if (event) {
        event.stopPropagation();
    }

    // Close all other menus first
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });

    const menu = document.getElementById(`poMenu_${poId}`);
    if (menu) {
        menu.classList.toggle('show');
    }

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
}

// Validate comment field inline
function validateCommentField(field) {
    const errorDiv = document.getElementById('commentError');
    if (field.value.trim()) {
        field.style.borderColor = '';
        if (errorDiv) errorDiv.style.display = 'none';
    } else {
        field.style.borderColor = 'var(--error)';
        if (errorDiv) errorDiv.style.display = 'block';
    }
}

// Validate payment amount inline
function validatePaymentAmount(field, maxAmount) {
    const errorDiv = document.getElementById('paymentAmountError');
    const amount = parseFloat(field.value) || 0;

    if (amount <= 0) {
        field.style.borderColor = 'var(--error)';
        if (errorDiv) {
            errorDiv.textContent = 'Payment amount must be greater than 0';
            errorDiv.style.display = 'block';
        }
    } else if (amount > maxAmount) {
        field.style.borderColor = 'var(--error)';
        if (errorDiv) {
            errorDiv.textContent = `Payment amount cannot exceed ${formatCurrency(maxAmount)}`;
            errorDiv.style.display = 'block';
        }
    } else {
        field.style.borderColor = '';
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

// Show Status History Modal
function showStatusHistoryModal(poId) {
    const po = getById('purchaseOrder', poId);
    if (!po) return;

    // Sort by changed_at descending (newest first)
    const logs = dataStore.poStatusLog
        .filter(log => log.po_id === poId)
        .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));

    let historyHtml = '';
    if (logs.length === 0) {
        historyHtml = '<p style="color: var(--text-tertiary); text-align: center;">No status changes recorded</p>';
    } else {
        historyHtml = '<table class="data-table"><thead><tr><th>Date</th><th>From</th><th>To</th><th>By</th><th>Comment</th></tr></thead><tbody>';
        logs.forEach(log => {
            const user = dataStore.user.find(u => u.id === log.changed_by) || { name: 'System' };
            historyHtml += `
                <tr>
                    <td>${formatDateTime(log.changed_at)}</td>
                    <td>${log.from_status || '-'}</td>
                    <td><strong>${log.to_status}</strong></td>
                    <td>${user.name}</td>
                    <td>${log.comment || '-'}</td>
                </tr>
            `;
        });
        historyHtml += '</tbody></table>';
    }

    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');
    const noBtn = document.querySelector('#confirmModal .btn-secondary');

    messageEl.innerHTML = `
        <div style="text-align: left;">
            <h4 style="margin-bottom: var(--space-3);">Status History - ${po.po_id}</h4>
            <div style="max-height: 300px; overflow-y: auto;">
                ${historyHtml}
            </div>
        </div>
    `;

    yesBtn.style.display = 'none';
    noBtn.textContent = 'Close';

    modal.classList.add('active');
}

// Show Change Status Modal
function showChangeStatusModal(poId) {
    const po = getById('purchaseOrder', poId);
    if (!po) return;

    const userRoleIds = getUserRoleIds(currentUser.id);
    const currentStatus = po.status;
    const transitions = getAvailableTransitions('Purchase Order', currentStatus, userRoleIds);

    // Debug: show what we're checking
    console.log('DEBUG Change Status:', {
        poStatus: currentStatus,
        userRoleIds: userRoleIds,
        allTransitions: dataStore.workflowTransition.filter(t => t.document_type === 'Purchase Order'),
        matchingTransitions: transitions
    });

    if (transitions.length === 0) {
        showValidationModal([`No status transitions available for current status "${currentStatus}". Check console for debug info.`]);
        return;
    }

    const transitionOptions = transitions.map(t =>
        `<option value="${t.to_status}">${t.to_status}</option>`
    ).join('');

    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');

    messageEl.innerHTML = `
        <div style="text-align: left;">
            <p style="margin-bottom: var(--space-3);">Change status of <strong>${po.po_id}</strong></p>
            <p style="margin-bottom: var(--space-3);">Current Status: <span class="badge badge-info">${capitalizeStatus(po.status)}</span></p>
            <div class="form-group">
                <label class="form-label required">New Status</label>
                <select class="form-input" id="newStatusSelect">
                    ${transitionOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label required">Comment</label>
                <textarea class="form-textarea" id="statusChangeComment" placeholder="Reason for status change..."
                    oninput="validateCommentField(this)"></textarea>
                <div id="commentError" class="form-error" style="display: none; color: var(--error); font-size: var(--text-sm); margin-top: 4px;">Comment is required</div>
            </div>
        </div>
    `;

    yesBtn.textContent = 'Change Status';
    yesBtn.className = 'btn btn-primary';
    yesBtn.style.display = '';

    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.addEventListener('click', () => {
        const newStatus = document.getElementById('newStatusSelect').value;
        const commentField = document.getElementById('statusChangeComment');
        const comment = commentField.value.trim();

        if (!comment) {
            commentField.style.borderColor = 'var(--error)';
            document.getElementById('commentError').style.display = 'block';
            commentField.focus();
            return;
        }

        const now = getCurrentTimestamp();
        const oldStatus = po.status;

        // Log status change
        dataStore.poStatusLog.push({
            id: generateUUID(),
            po_id: poId,
            from_status: capitalizeStatus(oldStatus),
            to_status: newStatus,
            changed_by: currentUser.id,
            changed_at: now,
            comment: comment
        });

        // Update PO status
        po.status = newStatus.toLowerCase();
        po.updated_at = now;
        po.updated_by = currentUser.id;

        closeConfirmModal();
        showToast('success', 'Success', `Status changed to ${newStatus}`);
        renderPoList();
    });

    modal.classList.add('active');
}

// Show Pay Remaining Modal
function showPayRemainingModal(poId, maxAmount) {
    const po = getById('purchaseOrder', poId);
    if (!po) return;

    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');

    messageEl.innerHTML = `
        <div style="text-align: left;">
            <p style="margin-bottom: var(--space-3);">Pay Remaining for <strong>${po.po_id}</strong></p>
            <p style="margin-bottom: var(--space-3);">Remaining Amount: <strong>${formatCurrency(maxAmount)}</strong></p>
            <div class="form-group">
                <label class="form-label required">Payment Amount</label>
                <input type="number" class="form-input" id="paymentAmountInput"
                       min="1" max="${maxAmount}" value="${maxAmount}"
                       placeholder="Enter payment amount"
                       oninput="validatePaymentAmount(this, ${maxAmount})">
                <div class="form-hint">Maximum: ${formatCurrency(maxAmount)}</div>
                <div id="paymentAmountError" class="form-error" style="display: none; color: var(--error); font-size: var(--text-sm); margin-top: 4px;"></div>
            </div>
            <div class="form-group">
                <label class="form-label">Payment Note</label>
                <input type="text" class="form-input" id="paymentNoteInput" placeholder="e.g., Bank Transfer #123">
            </div>
        </div>
    `;

    yesBtn.textContent = 'Pay';
    yesBtn.className = 'btn btn-primary';
    yesBtn.style.display = '';

    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.addEventListener('click', () => {
        const amountField = document.getElementById('paymentAmountInput');
        const amount = parseFloat(amountField.value) || 0;
        const note = document.getElementById('paymentNoteInput').value.trim();
        const errorDiv = document.getElementById('paymentAmountError');

        if (amount <= 0) {
            amountField.style.borderColor = 'var(--error)';
            errorDiv.textContent = 'Payment amount must be greater than 0';
            errorDiv.style.display = 'block';
            amountField.focus();
            return;
        }

        if (amount > maxAmount) {
            amountField.style.borderColor = 'var(--error)';
            errorDiv.textContent = `Payment amount cannot exceed ${formatCurrency(maxAmount)}`;
            errorDiv.style.display = 'block';
            amountField.focus();
            return;
        }

        const now = getCurrentTimestamp();

        // Log payment
        dataStore.poPaymentLog.push({
            id: generateUUID(),
            po_id: poId,
            amount: amount,
            paid_by: currentUser.id,
            paid_at: now,
            note: note
        });

        // Update transfer amount
        po.transfer_amount = (po.transfer_amount || 0) + amount;
        po.updated_at = now;
        po.updated_by = currentUser.id;

        closeConfirmModal();
        showToast('success', 'Success', `Payment of ${formatCurrency(amount)} recorded`);
        renderPoList();
    });

    modal.classList.add('active');
}

// Flag PO as Delivered - set delivery_date to today
function flagAsDelivered(poId) {
    const po = getById('purchaseOrder', poId);
    if (!po) return;

    showConfirmModal(`Mark ${po.po_id} as delivered? This will set the delivery date to today.`, () => {
        const now = getCurrentTimestamp();
        const today = new Date().toISOString().split('T')[0];

        po.delivery_date = today;
        po.updated_at = now;
        po.updated_by = currentUser.id;

        showToast('success', 'Success', `${po.po_id} marked as delivered`);
        renderPoList();
    });
}
