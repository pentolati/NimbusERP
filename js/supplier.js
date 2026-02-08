/* ===========================================
   ERP Nimbus - Supplier Module
   Based on PRD Section A.7.3, A.7.4
   =========================================== */

// Pagination state
let supplierCurrentPage = 1;
const supplierPageSize = 10; // PRD A-FR-008b: Default 10 records per page

/* ===========================================
   Supplier List - PRD A.7.4
   UI Pattern: Data Table
   =========================================== */

function renderSupplierList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Supplier</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openSupplierCreate()">
                    + Create Supplier
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <!-- Table Header with Search - PRD A-FR-008 -->
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="supplierSearch"
                           placeholder="Search by ID, Name, or Phone Number..."
                           oninput="filterSupplierList()">
                </div>
            </div>

            <!-- Data Table - PRD A.7.4 -->
            <div id="supplierTableContainer">
                ${renderSupplierTable()}
            </div>

            <!-- Pagination - PRD A-FR-008b -->
            <div class="table-footer" id="supplierPagination">
                ${renderSupplierPagination()}
            </div>
        </div>

        <!-- Modal for Create/View - PRD A.7.3: Centered Modal -->
        <div class="modal-overlay" id="supplierModal">
            <div class="modal modal-md" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="supplierModalTitle">Create Supplier</h3>
                    <button class="modal-close" onclick="closeSupplierModal()">&times;</button>
                </div>
                <div class="modal-body" id="supplierModalBody">
                    <!-- Form content -->
                </div>
                <div class="modal-footer" id="supplierModalFooter">
                    <!-- Action buttons -->
                </div>
            </div>
        </div>
    `;
}

// Render Supplier Table - PRD A.7.4
function renderSupplierTable() {
    const searchTerm = document.getElementById('supplierSearch')?.value || '';
    let suppliers = [...dataStore.supplier];

    // Filter - PRD A-FR-008: by ID, Name, Phone
    if (searchTerm) {
        suppliers = searchFilter(suppliers, searchTerm, ['supp_id', 'name', 'phone']);
    }

    if (suppliers.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128101;</div>
                <div class="empty-state-title">No suppliers found</div>
                <div class="empty-state-description">Create your first Supplier using the "Create Supplier" button above</div>
            </div>
        `;
    }

    // Paginate
    const paginatedData = paginate(suppliers, supplierCurrentPage, supplierPageSize);

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Supp ID</th>
                    <th>Supp Name</th>
                    <th>Alamat</th>
                    <th>Phone Number</th>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th>Updated By</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedData.items.forEach(supplier => {
        html += `
            <tr>
                <td class="col-id" onclick="viewSupplier('${supplier.id}')">${supplier.supp_id}</td>
                <td class="col-name">${escapeHtml(supplier.name)}</td>
                <td class="col-truncate" title="${escapeHtml(supplier.address)}">${truncateText(supplier.address, 50)}</td>
                <td>${supplier.phone}</td>
                <td>${getStatusBadge(supplier.status)}</td>
                <td class="col-date">${formatDateTime(supplier.updated_at)}</td>
                <td>${currentUser.full_name}</td>
                <td class="col-action">
                    <button class="btn btn-secondary btn-sm" onclick="viewSupplier('${supplier.id}')">View</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Update pagination
    setTimeout(() => {
        const paginationEl = document.getElementById('supplierPagination');
        if (paginationEl) {
            paginationEl.innerHTML = renderPagination(paginatedData, 'goToSupplierPage');
        }
    }, 0);

    return html;
}

// Render Supplier Pagination
function renderSupplierPagination() {
    const suppliers = dataStore.supplier;
    const paginatedData = paginate(suppliers, supplierCurrentPage, supplierPageSize);
    return renderPagination(paginatedData, 'goToSupplierPage');
}

// Go to page
function goToSupplierPage(page) {
    supplierCurrentPage = page;
    document.getElementById('supplierTableContainer').innerHTML = renderSupplierTable();
}

// Filter supplier list
function filterSupplierList() {
    supplierCurrentPage = 1;
    document.getElementById('supplierTableContainer').innerHTML = renderSupplierTable();
}

/* ===========================================
   Supplier Create - PRD A.7.3
   UI Pattern: Centered Modal
   =========================================== */

function openSupplierCreate() {
    const modal = document.getElementById('supplierModal');
    const title = document.getElementById('supplierModalTitle');
    const body = document.getElementById('supplierModalBody');
    const footer = document.getElementById('supplierModalFooter');

    title.textContent = 'Create Supplier';

    // Generate Supplier ID - PRD A-FR-006a
    const suppId = generateSupplierId();

    body.innerHTML = `
        <form id="supplierForm">
            <!-- Supp ID - PRD A.7.3: Read-only, Auto-gen -->
            <div class="form-group">
                <label class="form-label required">Supp ID</label>
                <input type="text" class="form-input mono" id="sup_supp_id" value="${suppId}" readonly disabled>
                <div class="form-hint">Auto-generated (SUP + 4 digit sequence)</div>
            </div>

            <!-- Supplier Name - PRD A.7.3 -->
            <div class="form-group">
                <label class="form-label required">Supplier Name</label>
                <input type="text" class="form-input" id="sup_name" placeholder="Enter supplier name" maxlength="100" required>
            </div>

            <!-- PIC Supplier Name - PRD A.7.3 -->
            <div class="form-group">
                <label class="form-label required">PIC Supplier Name</label>
                <input type="text" class="form-input" id="sup_pic_name" placeholder="Person In Charge" maxlength="100" required>
            </div>

            <!-- Alamat - PRD A.7.3, A-FR-007 -->
            <div class="form-group">
                <label class="form-label required">Alamat</label>
                <textarea class="form-textarea" id="sup_address" placeholder="Enter address" maxlength="500" required></textarea>
            </div>

            <!-- Phone Number - PRD A.7.3, A-FR-006 -->
            <div class="form-group">
                <label class="form-label required">Phone Number</label>
                <input type="text" class="form-input" id="sup_phone" placeholder="e.g., 628123456789" maxlength="15" required>
                <div class="form-hint">8-15 digits, must not start with 0</div>
            </div>

            <!-- Description - PRD A.7.3 -->
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="sup_description" placeholder="Optional remarks..." maxlength="1000"></textarea>
            </div>

            <!-- Status - PRD A.7.3 -->
            <div class="form-group">
                <label class="form-label required">Status</label>
                <div class="toggle-wrapper">
                    <div class="toggle active" id="sup_status_toggle" onclick="toggleSupplierStatus()"></div>
                    <span class="toggle-label" id="sup_status_label">Active</span>
                </div>
                <input type="hidden" id="sup_status" value="Active">
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeSupplierModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveSupplier()">Save</button>
    `;

    modal.classList.add('active');
}

// Toggle supplier status
function toggleSupplierStatus() {
    const toggle = document.getElementById('sup_status_toggle');
    const label = document.getElementById('sup_status_label');
    const input = document.getElementById('sup_status');

    if (toggle.classList.contains('active')) {
        toggle.classList.remove('active');
        label.textContent = 'Inactive';
        input.value = 'Inactive';
    } else {
        toggle.classList.add('active');
        label.textContent = 'Active';
        input.value = 'Active';
    }
}

// Save Supplier
function saveSupplier() {
    const errors = [];

    // Get form values
    const suppId = document.getElementById('sup_supp_id').value;
    const name = document.getElementById('sup_name').value.trim();
    const picName = document.getElementById('sup_pic_name').value.trim();
    const address = document.getElementById('sup_address').value.trim();
    const phone = document.getElementById('sup_phone').value.trim();
    const description = document.getElementById('sup_description').value.trim();
    const status = document.getElementById('sup_status').value;

    // Validate required fields - PRD A-VR-004
    if (!name) errors.push('Supplier Name is required');
    if (!picName) errors.push('PIC Supplier Name is required');
    if (!address) errors.push('Alamat is required'); // PRD A-FR-007
    if (!phone) errors.push('Phone Number is required');

    // Validate phone - PRD A-FR-006, A-VR-002
    if (phone && !validatePhone(phone)) {
        if (phone.startsWith('0')) {
            errors.push('Phone must not start with 0');
        } else if (phone.length < 8 || phone.length > 15) {
            errors.push('Phone must be 8-15 digits');
        } else {
            errors.push('Phone must contain only digits');
        }
    }

    // Validate max lengths - PRD A.14.2
    if (!validateMaxLength(name, 100)) errors.push('Supplier Name must be maximum 100 characters');
    if (!validateMaxLength(picName, 100)) errors.push('PIC Name must be maximum 100 characters');
    if (!validateMaxLength(address, 500)) errors.push('Alamat must be maximum 500 characters');
    if (!validateMaxLength(description, 1000)) errors.push('Description must be maximum 1000 characters');

    // Show validation errors - PRD D.5
    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    // Create supplier record - PRD A.8.2
    const supplier = {
        supp_id: suppId,
        name: name,
        pic_name: picName,
        address: address,
        phone: phone,
        description: description || null,
        status: status
    };

    addRecord('supplier', supplier);

    // Close modal
    closeSupplierModal();

    // Show success toast - PRD D.4.3
    showToast('success', 'Success', `Supplier '${name}' created successfully`);

    // Refresh list
    renderSupplierList();
}

// Close Supplier Modal
function closeSupplierModal() {
    const modal = document.getElementById('supplierModal');
    modal.classList.remove('active');
}

/* ===========================================
   Supplier View - PRD A-FR-008a
   Read-only mode
   =========================================== */

function viewSupplier(id) {
    const supplier = getById('supplier', id);
    if (!supplier) return;

    const modal = document.getElementById('supplierModal');
    const title = document.getElementById('supplierModalTitle');
    const body = document.getElementById('supplierModalBody');
    const footer = document.getElementById('supplierModalFooter');

    title.textContent = 'View Supplier';

    body.innerHTML = `
        <div class="form-group">
            <label class="form-label">Supp ID</label>
            <input type="text" class="form-input mono" value="${supplier.supp_id}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Supplier Name</label>
            <input type="text" class="form-input" value="${escapeHtml(supplier.name)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">PIC Supplier Name</label>
            <input type="text" class="form-input" value="${escapeHtml(supplier.pic_name)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Alamat</label>
            <textarea class="form-textarea" readonly disabled>${escapeHtml(supplier.address)}</textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-input" value="${supplier.phone}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" readonly disabled>${escapeHtml(supplier.description || '')}</textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Status</label>
            ${getStatusBadge(supplier.status)}
        </div>

        <div class="form-group">
            <label class="form-label">Updated At</label>
            <input type="text" class="form-input" value="${formatDateTime(supplier.updated_at)}" readonly disabled>
        </div>
    `;

    // PRD A-FR-008a: Close button only, no Edit button (Edit out of scope for MVP)
    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeSupplierModal()">Close</button>
    `;

    modal.classList.add('active');
}
