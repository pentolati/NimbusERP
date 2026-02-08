/* ===========================================
   ERP Nimbus - UOM Module
   Based on PRD Section A.7.7, A.7.8
   =========================================== */

// Pagination state
let uomCurrentPage = 1;
const uomPageSize = 10; // PRD A-FR-025a: Default 10 records per page

/* ===========================================
   UOM List - PRD A.7.8
   UI Pattern: Data Table
   =========================================== */

function renderUomList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">UOM (Unit of Measure)</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openUomCreate()">
                    + Create UOM
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <!-- Table Header with Search - PRD A-FR-025 -->
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="uomSearch"
                           placeholder="Search by UOM Code or UOM Name..."
                           oninput="filterUomList()">
                </div>
            </div>

            <!-- Data Table - PRD A.7.8 -->
            <div id="uomTableContainer">
                ${renderUomTable()}
            </div>

            <!-- Pagination - PRD A-FR-025a -->
            <div class="table-footer" id="uomPagination">
                ${renderUomPagination()}
            </div>
        </div>

        <!-- Modal for Create/View - PRD A.7.7: Centered Modal (Small) -->
        <div class="modal-overlay" id="uomModal">
            <div class="modal modal-sm" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="uomModalTitle">Create UOM</h3>
                    <button class="modal-close" onclick="closeUomModal()">&times;</button>
                </div>
                <div class="modal-body" id="uomModalBody">
                    <!-- Form content -->
                </div>
                <div class="modal-footer" id="uomModalFooter">
                    <!-- Action buttons -->
                </div>
            </div>
        </div>
    `;
}

// Render UOM Table - PRD A.7.8
function renderUomTable() {
    const searchTerm = document.getElementById('uomSearch')?.value || '';
    let uoms = [...dataStore.uom];

    // Filter - PRD A-FR-025: by UOM Code and UOM Name
    if (searchTerm) {
        uoms = searchFilter(uoms, searchTerm, ['code', 'name']);
    }

    if (uoms.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128207;</div>
                <div class="empty-state-title">No UOMs found</div>
                <div class="empty-state-description">Create your first UOM using the "Create UOM" button above</div>
            </div>
        `;
    }

    // Paginate
    const paginatedData = paginate(uoms, uomCurrentPage, uomPageSize);

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>UOM ID</th>
                    <th>UOM Code</th>
                    <th>UOM Name</th>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th>Updated By</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedData.items.forEach(uom => {
        html += `
            <tr>
                <td class="col-id" onclick="viewUom('${uom.id}')">${uom.uom_id}</td>
                <td><span class="tag">${uom.code}</span></td>
                <td>${escapeHtml(uom.name)}</td>
                <td>${getStatusBadge(uom.status)}</td>
                <td class="col-date">${formatDateTime(uom.updated_at)}</td>
                <td>${currentUser.full_name}</td>
                <td class="col-action">
                    <button class="btn btn-secondary btn-sm" onclick="viewUom('${uom.id}')">View</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Update pagination
    setTimeout(() => {
        const paginationEl = document.getElementById('uomPagination');
        if (paginationEl) {
            paginationEl.innerHTML = renderPagination(paginatedData, 'goToUomPage');
        }
    }, 0);

    return html;
}

// Render UOM Pagination
function renderUomPagination() {
    const uoms = dataStore.uom;
    const paginatedData = paginate(uoms, uomCurrentPage, uomPageSize);
    return renderPagination(paginatedData, 'goToUomPage');
}

// Go to page
function goToUomPage(page) {
    uomCurrentPage = page;
    document.getElementById('uomTableContainer').innerHTML = renderUomTable();
}

// Filter UOM list
function filterUomList() {
    uomCurrentPage = 1;
    document.getElementById('uomTableContainer').innerHTML = renderUomTable();
}

/* ===========================================
   UOM Create - PRD A.7.7
   UI Pattern: Centered Modal (Small)
   =========================================== */

function openUomCreate() {
    const modal = document.getElementById('uomModal');
    const title = document.getElementById('uomModalTitle');
    const body = document.getElementById('uomModalBody');
    const footer = document.getElementById('uomModalFooter');

    title.textContent = 'Create UOM';

    // Generate UOM ID - PRD A-FR-022
    const uomId = generateUomId();

    body.innerHTML = `
        <form id="uomForm">
            <!-- UOM ID - PRD A.7.7: Read-only, Auto-gen -->
            <div class="form-group">
                <label class="form-label required">UOM ID</label>
                <input type="text" class="form-input mono" id="uom_uom_id" value="${uomId}" readonly disabled>
                <div class="form-hint">Auto-generated (UOM + 3 digit sequence)</div>
            </div>

            <!-- UOM Code - PRD A.7.7, A-FR-023, A-FR-024 -->
            <div class="form-group">
                <label class="form-label required">UOM Code</label>
                <input type="text" class="form-input" id="uom_code" placeholder="e.g., Kg, Ltr, Pcs" maxlength="10" required>
                <div class="form-hint">Short code, max 10 characters, must be unique</div>
            </div>

            <!-- UOM Name - PRD A.7.7 -->
            <div class="form-group">
                <label class="form-label required">UOM Name</label>
                <input type="text" class="form-input" id="uom_name" placeholder="e.g., Kilogram, Liter" maxlength="50" required>
            </div>

            <!-- Description - PRD A.7.7 -->
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="uom_description" placeholder="Optional description..." maxlength="500"></textarea>
            </div>

            <!-- Status - PRD A.7.7 -->
            <div class="form-group">
                <label class="form-label required">Status</label>
                <div class="toggle-wrapper">
                    <div class="toggle active" id="uom_status_toggle" onclick="toggleUomStatus()"></div>
                    <span class="toggle-label" id="uom_status_label">Active</span>
                </div>
                <input type="hidden" id="uom_status" value="Active">
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeUomModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveUom()">Save</button>
    `;

    modal.classList.add('active');
}

// Toggle UOM status
function toggleUomStatus() {
    const toggle = document.getElementById('uom_status_toggle');
    const label = document.getElementById('uom_status_label');
    const input = document.getElementById('uom_status');

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

// Save UOM
function saveUom() {
    const errors = [];

    // Get form values
    const uomId = document.getElementById('uom_uom_id').value;
    const code = document.getElementById('uom_code').value.trim();
    const name = document.getElementById('uom_name').value.trim();
    const description = document.getElementById('uom_description').value.trim();
    const status = document.getElementById('uom_status').value;

    // Validate required fields - PRD A-VR-004
    if (!code) errors.push('UOM Code is required');
    if (!name) errors.push('UOM Name is required');

    // Validate UOM Code uniqueness - PRD A-FR-023, A-VR-006
    if (code && !isUnique('uom', 'code', code)) {
        errors.push('UOM Code must be unique');
    }

    // Validate max lengths - PRD A-FR-024, A.14.2
    if (!validateMaxLength(code, 10)) errors.push('UOM Code must be maximum 10 characters');
    if (!validateMaxLength(name, 50)) errors.push('UOM Name must be maximum 50 characters');
    if (!validateMaxLength(description, 500)) errors.push('Description must be maximum 500 characters');

    // Show validation errors - PRD D.5
    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    // Create UOM record - PRD A.8.4
    const uom = {
        uom_id: uomId,
        code: code,
        name: name,
        description: description || null,
        status: status
    };

    addRecord('uom', uom);

    // Close modal
    closeUomModal();

    // Show success toast - PRD D.4.3
    showToast('success', 'Success', `UOM '${code}' created successfully`);

    // Refresh list
    renderUomList();
}

// Close UOM Modal
function closeUomModal() {
    const modal = document.getElementById('uomModal');
    modal.classList.remove('active');
}

/* ===========================================
   UOM View - PRD A-FR-026, A-FR-026a
   Read-only mode
   =========================================== */

function viewUom(id) {
    const uom = getById('uom', id);
    if (!uom) return;

    const modal = document.getElementById('uomModal');
    const title = document.getElementById('uomModalTitle');
    const body = document.getElementById('uomModalBody');
    const footer = document.getElementById('uomModalFooter');

    title.textContent = 'View UOM';

    body.innerHTML = `
        <div class="form-group">
            <label class="form-label">UOM ID</label>
            <input type="text" class="form-input mono" value="${uom.uom_id}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">UOM Code</label>
            <input type="text" class="form-input" value="${escapeHtml(uom.code)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">UOM Name</label>
            <input type="text" class="form-input" value="${escapeHtml(uom.name)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" readonly disabled>${escapeHtml(uom.description || '')}</textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Status</label>
            ${getStatusBadge(uom.status)}
        </div>

        <div class="form-group">
            <label class="form-label">Updated At</label>
            <input type="text" class="form-input" value="${formatDateTime(uom.updated_at)}" readonly disabled>
        </div>
    `;

    // PRD A-FR-026a: Close button only, no Edit button (Edit out of scope for MVP)
    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeUomModal()">Close</button>
    `;

    modal.classList.add('active');
}
