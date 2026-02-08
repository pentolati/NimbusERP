/* ===========================================
   ERP Nimbus - Workflow Management Module (Simplified)
   Based on PRD Part W: Workflow Management
   =========================================== */

// Fixed document types (hardcoded, not master data)
const DOCUMENT_TYPES = ['Purchase Order'];

// =============================================
// DOCUMENT STATUS - Master status per document type
// =============================================

function renderDocumentStatusList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Document Status</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openDocumentStatusCreate()">
                    + Add Status
                </button>
            </div>
        </div>

        <!-- Filter by Document Type -->
        <div class="table-container">
            <div class="table-header">
                <div class="form-group" style="margin: 0; min-width: 200px;">
                    <select class="form-input" id="statusDocTypeFilter" onchange="filterDocumentStatusList()">
                        <option value="">All Document Types</option>
                        ${DOCUMENT_TYPES.map(dt => `<option value="${dt}">${dt}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div id="documentStatusTableContainer">
                ${renderDocumentStatusTable()}
            </div>
        </div>

        <!-- Modal for Create/Edit -->
        <div class="modal-overlay" id="documentStatusModal">
            <div class="modal modal-sm" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="documentStatusModalTitle">Add Status</h3>
                    <button class="modal-close" onclick="closeDocumentStatusModal()">&times;</button>
                </div>
                <div class="modal-body" id="documentStatusModalBody"></div>
                <div class="modal-footer" id="documentStatusModalFooter"></div>
            </div>
        </div>
    `;
}

function renderDocumentStatusTable() {
    const filterDocType = document.getElementById('statusDocTypeFilter')?.value || '';
    let statuses = [...dataStore.documentStatus];

    if (filterDocType) {
        statuses = statuses.filter(s => s.document_type === filterDocType);
    }

    // Group by document type
    const grouped = {};
    statuses.forEach(s => {
        if (!grouped[s.document_type]) grouped[s.document_type] = [];
        grouped[s.document_type].push(s);
    });

    if (Object.keys(grouped).length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128203;</div>
                <div class="empty-state-title">No statuses found</div>
                <div class="empty-state-description">Add document statuses using the button above</div>
            </div>
        `;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Document Type</th>
                    <th>Status Name</th>
                    <th>Initial</th>
                    <th>Final</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.keys(grouped).forEach(docType => {
        grouped[docType].forEach((status, idx) => {
            const initialBadge = status.is_initial ? '<span class="badge badge-info">Initial</span>' : '-';
            const finalBadge = status.is_final ? '<span class="badge badge-warning">Final</span>' : '-';

            html += `
                <tr>
                    ${idx === 0 ? `<td rowspan="${grouped[docType].length}"><strong>${docType}</strong></td>` : ''}
                    <td>${escapeHtml(status.status_name)}</td>
                    <td>${initialBadge}</td>
                    <td>${finalBadge}</td>
                    <td class="col-action">
                        <button class="btn btn-secondary btn-sm" onclick="openDocumentStatusEdit('${status.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteDocumentStatus('${status.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    });

    html += '</tbody></table>';
    return html;
}

function filterDocumentStatusList() {
    document.getElementById('documentStatusTableContainer').innerHTML = renderDocumentStatusTable();
}

function openDocumentStatusCreate() {
    const modal = document.getElementById('documentStatusModal');
    const title = document.getElementById('documentStatusModalTitle');
    const body = document.getElementById('documentStatusModalBody');
    const footer = document.getElementById('documentStatusModalFooter');

    title.textContent = 'Add Status';

    body.innerHTML = `
        <form id="documentStatusForm">
            <div class="form-group">
                <label class="form-label required">Document Type</label>
                <select class="form-input" id="dsDocType" required>
                    <option value="">Select Document Type</option>
                    ${DOCUMENT_TYPES.map(dt => `<option value="${dt}">${dt}</option>`).join('')}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label required">Status Name</label>
                <input type="text" class="form-input" id="dsStatusName" placeholder="e.g., Draft, Submitted, Approved" maxlength="50" required>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Is Initial?</label>
                    <div class="toggle-wrapper">
                        <input type="checkbox" id="dsIsInitial" onchange="if(this.checked) document.getElementById('dsIsFinal').checked = false;">
                        <label for="dsIsInitial">Status saat document pertama kali dibuat</label>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Is Final?</label>
                    <div class="toggle-wrapper">
                        <input type="checkbox" id="dsIsFinal" onchange="if(this.checked) document.getElementById('dsIsInitial').checked = false;">
                        <label for="dsIsFinal">Status tidak bisa berubah lagi (end state)</label>
                    </div>
                </div>
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeDocumentStatusModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveDocumentStatus()">Save</button>
    `;

    modal.classList.add('active');
}

function openDocumentStatusEdit(statusId) {
    const status = dataStore.documentStatus.find(s => s.id === statusId);
    if (!status) return;

    openDocumentStatusCreate();
    document.getElementById('documentStatusModalTitle').textContent = 'Edit Status';
    document.getElementById('dsDocType').value = status.document_type;
    document.getElementById('dsStatusName').value = status.status_name;
    document.getElementById('dsIsInitial').checked = status.is_initial;
    document.getElementById('dsIsFinal').checked = status.is_final;

    document.getElementById('documentStatusModalFooter').innerHTML = `
        <button class="btn btn-secondary" onclick="closeDocumentStatusModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveDocumentStatus('${statusId}')">Update</button>
    `;
}

function saveDocumentStatus(statusId = null) {
    const errors = [];
    const docType = document.getElementById('dsDocType').value;
    const statusName = document.getElementById('dsStatusName').value.trim();
    const isInitial = document.getElementById('dsIsInitial').checked;
    const isFinal = document.getElementById('dsIsFinal').checked;

    if (!docType) errors.push('Document Type is required');
    if (!statusName) errors.push('Status Name is required');

    // Check duplicate
    const duplicate = dataStore.documentStatus.find(s =>
        s.document_type === docType &&
        s.status_name.toLowerCase() === statusName.toLowerCase() &&
        s.id !== statusId
    );
    if (duplicate) errors.push('Status name already exists for this document type');

    // Cannot be both initial and final
    if (isInitial && isFinal) errors.push('Status cannot be both Initial and Final');

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const now = getCurrentTimestamp();

    if (statusId) {
        const status = dataStore.documentStatus.find(s => s.id === statusId);
        status.document_type = docType;
        status.status_name = statusName;
        status.is_initial = isInitial;
        status.is_final = isFinal;
    } else {
        dataStore.documentStatus.push({
            id: generateUUID(),
            document_type: docType,
            status_name: statusName,
            is_initial: isInitial,
            is_final: isFinal,
            created_at: now
        });
    }

    closeDocumentStatusModal();
    showToast('success', 'Success', 'Document Status saved');
    renderDocumentStatusList();
}

function deleteDocumentStatus(statusId) {
    const status = dataStore.documentStatus.find(s => s.id === statusId);

    // Check if used in transitions
    const usedInTransition = dataStore.workflowTransition.find(t =>
        t.document_type === status.document_type &&
        (t.from_status === status.status_name || t.to_status === status.status_name)
    );

    if (usedInTransition) {
        showValidationModal(['Cannot delete: Status is used in workflow transitions']);
        return;
    }

    showConfirmModal('Are you sure you want to delete this status?', () => {
        dataStore.documentStatus = dataStore.documentStatus.filter(s => s.id !== statusId);
        showToast('success', 'Success', 'Document Status deleted');
        renderDocumentStatusList();
    });
}

function closeDocumentStatusModal() {
    document.getElementById('documentStatusModal').classList.remove('active');
}

// =============================================
// WORKFLOW TRANSITIONS
// =============================================

function renderWorkflowList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Workflow Transitions</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openWorkflowTransitionCreate()">
                    + Add Transition
                </button>
            </div>
        </div>

        <!-- Filter by Document Type -->
        <div class="table-container">
            <div class="table-header">
                <div class="form-group" style="margin: 0; min-width: 200px;">
                    <select class="form-input" id="transitionDocTypeFilter" onchange="filterWorkflowTransitionList()">
                        <option value="">All Document Types</option>
                        ${DOCUMENT_TYPES.map(dt => `<option value="${dt}">${dt}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div id="workflowTransitionTableContainer">
                ${renderWorkflowTransitionTable()}
            </div>
        </div>

        <!-- Modal for Create/Edit -->
        <div class="modal-overlay" id="workflowTransitionModal">
            <div class="modal modal-md" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="workflowTransitionModalTitle">Add Transition</h3>
                    <button class="modal-close" onclick="closeWorkflowTransitionModal()">&times;</button>
                </div>
                <div class="modal-body" id="workflowTransitionModalBody"></div>
                <div class="modal-footer" id="workflowTransitionModalFooter"></div>
            </div>
        </div>
    `;
}

function renderWorkflowTransitionTable() {
    const filterDocType = document.getElementById('transitionDocTypeFilter')?.value || '';
    let transitions = [...dataStore.workflowTransition];

    if (filterDocType) {
        transitions = transitions.filter(t => t.document_type === filterDocType);
    }

    if (transitions.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#8644;</div>
                <div class="empty-state-title">No transitions found</div>
                <div class="empty-state-description">Add workflow transitions using the button above</div>
            </div>
        `;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Document Type</th>
                    <th>From Status</th>
                    <th></th>
                    <th>To Status</th>
                    <th>Allowed Roles</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    transitions.forEach(t => {
        // Get role names (multiple)
        const roleNames = (t.allowed_role_ids || []).map(rid => {
            const role = dataStore.functionalRole.find(r => r.id === rid);
            return role ? `<span class="tag">${role.name}</span>` : '';
        }).filter(Boolean).join(' ');

        const fromStatus = dataStore.documentStatus.find(s =>
            s.document_type === t.document_type && s.status_name === t.from_status
        );
        const toStatus = dataStore.documentStatus.find(s =>
            s.document_type === t.document_type && s.status_name === t.to_status
        );

        const fromBadge = fromStatus?.is_initial ? 'badge-info' : (fromStatus?.is_final ? 'badge-warning' : 'badge-neutral');
        const toBadge = toStatus?.is_initial ? 'badge-info' : (toStatus?.is_final ? 'badge-warning' : 'badge-neutral');

        html += `
            <tr>
                <td><strong>${t.document_type}</strong></td>
                <td><span class="badge ${fromBadge}">${escapeHtml(t.from_status)}</span></td>
                <td style="text-align: center;">&#8594;</td>
                <td><span class="badge ${toBadge}">${escapeHtml(t.to_status)}</span></td>
                <td>${roleNames || '-'}</td>
                <td class="col-action">
                    <button class="btn btn-secondary btn-sm" onclick="openWorkflowTransitionEdit('${t.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWorkflowTransition('${t.id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    return html;
}

function filterWorkflowTransitionList() {
    document.getElementById('workflowTransitionTableContainer').innerHTML = renderWorkflowTransitionTable();
}

function openWorkflowTransitionCreate() {
    const modal = document.getElementById('workflowTransitionModal');
    const title = document.getElementById('workflowTransitionModalTitle');
    const body = document.getElementById('workflowTransitionModalBody');
    const footer = document.getElementById('workflowTransitionModalFooter');

    title.textContent = 'Add Transition';

    // Get roles with Update permission
    const rolesWithUpdate = getRolesWithUpdatePermissionList();

    body.innerHTML = `
        <form id="workflowTransitionForm">
            <div class="form-group">
                <label class="form-label required">Document Type</label>
                <select class="form-input" id="wtDocType" required onchange="updateStatusDropdowns()">
                    <option value="">Select Document Type</option>
                    ${DOCUMENT_TYPES.map(dt => `<option value="${dt}">${dt}</option>`).join('')}
                </select>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label required">From Status</label>
                    <select class="form-input" id="wtFromStatus" required>
                        <option value="">Select Document Type first</option>
                    </select>
                    <div class="form-hint">Status asal sebelum transition</div>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label class="form-label required">To Status</label>
                    <select class="form-input" id="wtToStatus" required>
                        <option value="">Select Document Type first</option>
                    </select>
                    <div class="form-hint">Status tujuan setelah transition</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label required">Allowed Roles</label>
                <div class="form-hint">Pilih role yang boleh melakukan transition ini</div>
                <div class="checkbox-list" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 12px;">
                    ${rolesWithUpdate.map(r => `
                        <label class="checkbox-item-inline">
                            <input type="checkbox" name="allowedRoles" value="${r.id}">
                            <span>${r.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeWorkflowTransitionModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveWorkflowTransition()">Save</button>
    `;

    modal.classList.add('active');
}

function getRolesWithUpdatePermissionList() {
    // Get roles that have Update permission on any entity
    const rolesWithUpdate = new Set();

    dataStore.permissionRule.forEach(pr => {
        if (pr.perm_update) {
            rolesWithUpdate.add(pr.role_id);
        }
    });

    return dataStore.functionalRole.filter(r => rolesWithUpdate.has(r.id));
}

function updateStatusDropdowns() {
    const docType = document.getElementById('wtDocType').value;
    const fromSelect = document.getElementById('wtFromStatus');
    const toSelect = document.getElementById('wtToStatus');

    if (!docType) {
        fromSelect.innerHTML = '<option value="">Select Document Type first</option>';
        toSelect.innerHTML = '<option value="">Select Document Type first</option>';
        return;
    }

    const statuses = dataStore.documentStatus.filter(s => s.document_type === docType);

    if (statuses.length === 0) {
        fromSelect.innerHTML = '<option value="">No statuses defined for this document type</option>';
        toSelect.innerHTML = '<option value="">No statuses defined for this document type</option>';
        return;
    }

    // From Status: exclude Final statuses (final can't transition to anything)
    const fromOptions = statuses
        .filter(s => !s.is_final)
        .map(s => {
            const suffix = s.is_initial ? ' (Initial)' : '';
            return `<option value="${s.status_name}">${s.status_name}${suffix}</option>`;
        }).join('');

    // To Status: all statuses allowed (Initial to Initial is valid, e.g. Draft → Submitted)
    const toOptions = statuses
        .map(s => {
            const suffix = s.is_initial ? ' (Initial)' : (s.is_final ? ' (Final)' : '');
            return `<option value="${s.status_name}">${s.status_name}${suffix}</option>`;
        }).join('');

    fromSelect.innerHTML = '<option value="">Select From Status</option>' + fromOptions;
    toSelect.innerHTML = '<option value="">Select To Status</option>' + toOptions;
}

function openWorkflowTransitionEdit(transitionId) {
    const transition = dataStore.workflowTransition.find(t => t.id === transitionId);
    if (!transition) return;

    openWorkflowTransitionCreate();
    document.getElementById('workflowTransitionModalTitle').textContent = 'Edit Transition';
    document.getElementById('wtDocType').value = transition.document_type;
    updateStatusDropdowns();
    document.getElementById('wtFromStatus').value = transition.from_status;
    document.getElementById('wtToStatus').value = transition.to_status;

    // Check allowed roles
    (transition.allowed_role_ids || []).forEach(roleId => {
        const checkbox = document.querySelector(`input[name="allowedRoles"][value="${roleId}"]`);
        if (checkbox) checkbox.checked = true;
    });

    document.getElementById('workflowTransitionModalFooter').innerHTML = `
        <button class="btn btn-secondary" onclick="closeWorkflowTransitionModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveWorkflowTransition('${transitionId}')">Update</button>
    `;
}

function saveWorkflowTransition(transitionId = null) {
    const errors = [];
    const docType = document.getElementById('wtDocType').value;
    const fromStatus = document.getElementById('wtFromStatus').value;
    const toStatus = document.getElementById('wtToStatus').value;

    // Get selected roles
    const selectedRoles = [];
    document.querySelectorAll('input[name="allowedRoles"]:checked').forEach(cb => {
        selectedRoles.push(cb.value);
    });

    if (!docType) errors.push('Document Type is required');
    if (!fromStatus) errors.push('From Status is required');
    if (!toStatus) errors.push('To Status is required');
    if (selectedRoles.length === 0) errors.push('At least one Allowed Role is required');

    if (fromStatus === toStatus) {
        errors.push('From Status and To Status cannot be the same');
    }

    // Check duplicate transition
    const duplicate = dataStore.workflowTransition.find(t =>
        t.document_type === docType &&
        t.from_status === fromStatus &&
        t.to_status === toStatus &&
        t.id !== transitionId
    );
    if (duplicate) errors.push('This transition already exists');

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const now = getCurrentTimestamp();

    if (transitionId) {
        const transition = dataStore.workflowTransition.find(t => t.id === transitionId);
        transition.document_type = docType;
        transition.from_status = fromStatus;
        transition.to_status = toStatus;
        transition.allowed_role_ids = selectedRoles;
    } else {
        dataStore.workflowTransition.push({
            id: generateUUID(),
            document_type: docType,
            from_status: fromStatus,
            to_status: toStatus,
            allowed_role_ids: selectedRoles,
            created_at: now
        });
    }

    closeWorkflowTransitionModal();
    showToast('success', 'Success', 'Workflow Transition saved');
    renderWorkflowList();
}

function deleteWorkflowTransition(transitionId) {
    showConfirmModal('Are you sure you want to delete this transition?', () => {
        dataStore.workflowTransition = dataStore.workflowTransition.filter(t => t.id !== transitionId);
        showToast('success', 'Success', 'Workflow Transition deleted');
        renderWorkflowList();
    });
}

function closeWorkflowTransitionModal() {
    document.getElementById('workflowTransitionModal').classList.remove('active');
}

// =============================================
// INTEGRATION APIs (for PO module to use)
// =============================================

// Get available transitions for a document based on current status and user roles
function getAvailableTransitions(documentType, currentStatus, userRoleIds) {
    const currentStatusLower = (currentStatus || '').toLowerCase();
    return dataStore.workflowTransition.filter(t =>
        t.document_type === documentType &&
        t.from_status.toLowerCase() === currentStatusLower &&
        t.allowed_role_ids.some(rid => userRoleIds.includes(rid))
    );
}

// Get initial status for a document type (first one found)
function getInitialStatus(documentType) {
    const initialStatus = dataStore.documentStatus.find(s =>
        s.document_type === documentType && s.is_initial
    );
    return initialStatus ? initialStatus.status_name : null;
}

// Get ALL initial statuses for a document type
function getAllInitialStatuses(documentType) {
    return dataStore.documentStatus
        .filter(s => s.document_type === documentType && s.is_initial)
        .map(s => s.status_name);
}

// Check if status is final (no more transitions allowed)
function isStatusFinal(documentType, statusName) {
    const statusNameLower = (statusName || '').toLowerCase();
    const status = dataStore.documentStatus.find(s =>
        s.document_type === documentType && s.status_name.toLowerCase() === statusNameLower
    );
    return status ? status.is_final : false;
}

// Get all statuses for a document type
function getDocumentStatuses(documentType) {
    return dataStore.documentStatus.filter(s => s.document_type === documentType);
}

// Get user's role IDs (for checking permissions)
function getUserRoleIds(userId) {
    return dataStore.userRole
        .filter(ur => ur.user_id === userId)
        .map(ur => ur.role_id);
}
