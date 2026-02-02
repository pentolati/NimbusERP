/* ===========================================
   ERP Nimbus - Warehouse Module
   Based on PRD Section A.7.1, A.7.2
   =========================================== */

// State
let warehouseTreeState = {}; // Track expanded/collapsed nodes

/* ===========================================
   Warehouse List - PRD A.7.2
   UI Pattern: Tree Grid View
   =========================================== */

function renderWarehouseList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Warehouse</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openWarehouseCreate()">
                    + Create Warehouse
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <!-- Table Header with Search - PRD A-FR-004 -->
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="warehouseSearch"
                           placeholder="Search by Name or Node ID..."
                           oninput="filterWarehouseTree()">
                </div>
                <!-- Tree Controls - PRD A-FR-021 -->
                <div class="tree-controls">
                    <button class="btn btn-secondary btn-sm" onclick="expandAllNodes()">Expand All</button>
                    <button class="btn btn-secondary btn-sm" onclick="collapseAllNodes()">Collapse All</button>
                </div>
            </div>

            <!-- Tree View - PRD A.7.2 -->
            <div class="card-body" id="warehouseTreeContainer">
                ${renderWarehouseTree()}
            </div>
        </div>

        <!-- Slideover for Create/View -->
        <div class="slideover-overlay" id="warehouseSlideoverOverlay" onclick="closeWarehouseSlideover(event)">
            <div class="slideover" onclick="event.stopPropagation()">
                <div class="slideover-header">
                    <h3 id="warehouseSlideoverTitle">Create Warehouse</h3>
                    <button class="slideover-close" onclick="closeWarehouseSlideover()">&times;</button>
                </div>
                <div class="slideover-body" id="warehouseSlideoverBody">
                    <!-- Form content -->
                </div>
                <div class="slideover-footer" id="warehouseSlideoverFooter">
                    <!-- Action buttons -->
                </div>
            </div>
        </div>
    `;

    // Initialize tree state - PRD A-FR-018: All nodes expanded by default
    initTreeState();
}

// Initialize tree state - all expanded by default - PRD A-FR-018
function initTreeState() {
    warehouseTreeState = {};
    dataStore.warehouse.forEach(node => {
        warehouseTreeState[node.id] = true; // true = expanded
    });
}

// Render warehouse tree - PRD A.7.2
function renderWarehouseTree() {
    const warehouses = dataStore.warehouse.filter(w => w.node_type === 'Warehouse');

    if (warehouses.length === 0) {
        // Empty State - PRD D.3.2
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#127970;</div>
                <div class="empty-state-title">No warehouses found</div>
                <div class="empty-state-description">Create your first Warehouse using the "Create Warehouse" button above</div>
            </div>
        `;
    }

    let html = '<div class="tree-view">';
    warehouses.forEach(wh => {
        html += renderTreeNode(wh, 0);
    });
    html += '</div>';

    return html;
}

// Render single tree node - PRD A.7.2
function renderTreeNode(node, level) {
    const children = dataStore.warehouse.filter(w => w.parent_id === node.id);
    const hasChildren = children.length > 0;
    const isExpanded = warehouseTreeState[node.id] !== false;

    // Node type icons - PRD A-FR-020
    const icons = {
        'Warehouse': '&#127970;',
        'Aisle': '&#9776;',
        'Rack': '&#9638;',
        'Bin': '&#128230;'
    };

    const fullPath = calculateFullPath(node.id);

    let html = `
        <div class="tree-node">
            <div class="tree-node-row" data-level="${level}">
                <!-- Toggle Button - PRD A-FR-016, A-FR-017 -->
                <button class="tree-toggle ${hasChildren ? (isExpanded ? 'expanded' : 'collapsed') : 'no-children'}"
                        onclick="toggleTreeNode('${node.id}')"
                        ${!hasChildren ? 'disabled' : ''}></button>

                <!-- Node Icon - PRD A-FR-020 -->
                <span class="tree-icon ${node.node_type.toLowerCase()}">${icons[node.node_type]}</span>

                <!-- Node ID - Monospace, Clickable Link - PRD A.7.2 -->
                <span class="tree-node-id" onclick="viewWarehouse('${node.id}')">${node.node_id}</span>

                <!-- Full Path - PRD A.7.2 -->
                <span class="tree-node-path">${fullPath}</span>

                <!-- Name - Bold - PRD A.7.2 -->
                <span class="tree-node-name">${escapeHtml(node.name)}</span>

                <!-- Status Badge - PRD A.7.2 -->
                ${getStatusBadge(node.status)}

                <!-- View Button - PRD A-FR-005 -->
                <button class="btn btn-secondary btn-sm" onclick="viewWarehouse('${node.id}')">View</button>
            </div>
    `;

    // Render children - PRD A-FR-017
    if (hasChildren) {
        html += `<div class="tree-node-children ${isExpanded ? '' : 'collapsed'}">`;
        children.forEach(child => {
            html += renderTreeNode(child, level + 1);
        });
        html += '</div>';
    }

    html += '</div>';

    return html;
}

// Toggle tree node - PRD A-FR-017
function toggleTreeNode(nodeId) {
    warehouseTreeState[nodeId] = !warehouseTreeState[nodeId];
    document.getElementById('warehouseTreeContainer').innerHTML = renderWarehouseTree();
}

// Expand all nodes - PRD A-FR-021
function expandAllNodes() {
    dataStore.warehouse.forEach(node => {
        warehouseTreeState[node.id] = true;
    });
    document.getElementById('warehouseTreeContainer').innerHTML = renderWarehouseTree();
}

// Collapse all nodes - PRD A-FR-021
function collapseAllNodes() {
    dataStore.warehouse.forEach(node => {
        warehouseTreeState[node.id] = false;
    });
    document.getElementById('warehouseTreeContainer').innerHTML = renderWarehouseTree();
}

// Filter warehouse tree - PRD A-FR-004
function filterWarehouseTree() {
    const searchTerm = document.getElementById('warehouseSearch').value;
    const container = document.getElementById('warehouseTreeContainer');

    if (!searchTerm.trim()) {
        container.innerHTML = renderWarehouseTree();
        return;
    }

    // Filter by Name and Node ID - PRD A-FR-004
    const filtered = searchFilter(dataStore.warehouse, searchTerm, ['name', 'node_id']);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#128269;</div>
                <div class="empty-state-title">No results found</div>
                <div class="empty-state-description">Try a different search term</div>
            </div>
        `;
        return;
    }

    // Show filtered results as flat list
    let html = '<div class="tree-view">';
    filtered.forEach(node => {
        const fullPath = calculateFullPath(node.id);
        const icons = {
            'Warehouse': '&#127970;',
            'Aisle': '&#9776;',
            'Rack': '&#9638;',
            'Bin': '&#128230;'
        };

        html += `
            <div class="tree-node-row" data-level="0">
                <span class="tree-toggle no-children"></span>
                <span class="tree-icon ${node.node_type.toLowerCase()}">${icons[node.node_type]}</span>
                <span class="tree-node-id" onclick="viewWarehouse('${node.id}')">${node.node_id}</span>
                <span class="tree-node-path">${fullPath}</span>
                <span class="tree-node-name">${escapeHtml(node.name)}</span>
                ${getStatusBadge(node.status)}
                <button class="btn btn-secondary btn-sm" onclick="viewWarehouse('${node.id}')">View</button>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

/* ===========================================
   Warehouse Create - PRD A.7.1
   UI Pattern: Right-side Slide-over Form
   =========================================== */

function openWarehouseCreate() {
    const overlay = document.getElementById('warehouseSlideoverOverlay');
    const title = document.getElementById('warehouseSlideoverTitle');
    const body = document.getElementById('warehouseSlideoverBody');
    const footer = document.getElementById('warehouseSlideoverFooter');

    title.textContent = 'Create Warehouse';

    body.innerHTML = `
        <form id="warehouseForm">
            <!-- Node Type - PRD A.7.1 -->
            <div class="form-group">
                <label class="form-label required">Node Type</label>
                <select class="form-select" id="wh_node_type" onchange="onNodeTypeChange()" required>
                    <option value="">Select Node Type...</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Aisle">Aisle</option>
                    <option value="Rack">Rack</option>
                    <option value="Bin">Bin</option>
                </select>
            </div>

            <!-- Node ID - PRD A.7.1, A-FR-001 -->
            <div class="form-group">
                <label class="form-label required">Node ID</label>
                <input type="text" class="form-input" id="wh_node_id" placeholder="Auto-generated..." readonly>
                <div class="form-hint">Auto-generated based on Node Type. Editable before save.</div>
            </div>

            <!-- Parent Selection - PRD A-FR-014 -->
            <div id="parentSelectionContainer" class="form-group hidden">
                <!-- Cascading dropdowns will be rendered here -->
            </div>

            <!-- Name - PRD A.7.1 -->
            <div class="form-group">
                <label class="form-label required">Name</label>
                <input type="text" class="form-input" id="wh_name" placeholder="Enter warehouse name" maxlength="100" required>
                <div class="form-hint">Must be unique system-wide (max 100 characters)</div>
            </div>

            <!-- Method - PRD A.7.1 -->
            <div class="form-group">
                <label class="form-label required">Method</label>
                <select class="form-select" id="wh_method" required>
                    <option value="FIFO" selected>FIFO (First In First Out)</option>
                    <option value="LIFO">LIFO (Last In First Out)</option>
                    <option value="FEFO">FEFO (First Expired First Out)</option>
                </select>
            </div>

            <!-- Address - PRD A.7.1, A-FR-015 -->
            <div class="form-group">
                <label class="form-label required">Address</label>
                <input type="text" class="form-input" id="wh_address" placeholder="Enter physical address" maxlength="500" required>
                <div class="form-hint">Auto-fills from parent warehouse (max 500 characters)</div>
            </div>

            <!-- Description - PRD A.7.1 -->
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="wh_description" placeholder="Optional remarks..." maxlength="1000"></textarea>
            </div>

            <!-- Status - PRD A.7.1 -->
            <div class="form-group">
                <label class="form-label required">Status</label>
                <div class="toggle-wrapper">
                    <div class="toggle active" id="wh_status_toggle" onclick="toggleWarehouseStatus()"></div>
                    <span class="toggle-label" id="wh_status_label">Active</span>
                </div>
                <input type="hidden" id="wh_status" value="Active">
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeWarehouseSlideover()">Cancel</button>
        <button class="btn btn-primary" onclick="saveWarehouse()">Save</button>
    `;

    overlay.classList.add('active');
}

// Toggle warehouse status
function toggleWarehouseStatus() {
    const toggle = document.getElementById('wh_status_toggle');
    const label = document.getElementById('wh_status_label');
    const input = document.getElementById('wh_status');

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

// On Node Type Change - PRD A-FR-001, A-FR-014
function onNodeTypeChange() {
    const nodeType = document.getElementById('wh_node_type').value;
    const nodeIdInput = document.getElementById('wh_node_id');
    const parentContainer = document.getElementById('parentSelectionContainer');

    if (!nodeType) {
        nodeIdInput.value = '';
        parentContainer.classList.add('hidden');
        parentContainer.innerHTML = '';
        return;
    }

    // Generate Node ID - PRD A-FR-001
    nodeIdInput.value = generateNodeId(nodeType);
    nodeIdInput.removeAttribute('readonly'); // Editable after auto-generation - PRD A.7.1

    // Show parent selection for child nodes - PRD A-FR-014
    if (nodeType === 'Warehouse') {
        parentContainer.classList.add('hidden');
        parentContainer.innerHTML = '';
    } else {
        parentContainer.classList.remove('hidden');
        renderCascadingDropdowns(nodeType);
    }
}

// Render Cascading Dropdowns - PRD A-FR-014
function renderCascadingDropdowns(nodeType) {
    const container = document.getElementById('parentSelectionContainer');

    let html = '<div class="cascading-dropdowns">';

    // Step 1: Select Warehouse
    const warehouses = dataStore.warehouse.filter(w => w.node_type === 'Warehouse' && w.status === 'Active');
    html += `
        <div class="form-group">
            <label class="form-label required">Select Warehouse</label>
            <select class="form-select" id="wh_parent_warehouse" onchange="onParentWarehouseChange('${nodeType}')" required>
                <option value="">Select Warehouse...</option>
                ${warehouses.map(w => `<option value="${w.id}">${w.node_id} - ${escapeHtml(w.name)}</option>`).join('')}
            </select>
        </div>
    `;

    // Step 2: Select Aisle (for Rack and Bin)
    if (nodeType === 'Rack' || nodeType === 'Bin') {
        html += `
            <div class="form-group" id="aisleDropdownContainer">
                <label class="form-label required">Select Aisle</label>
                <select class="form-select" id="wh_parent_aisle" onchange="onParentAisleChange('${nodeType}')" disabled required>
                    <option value="">Select Warehouse first...</option>
                </select>
            </div>
        `;
    }

    // Step 3: Select Rack (for Bin only)
    if (nodeType === 'Bin') {
        html += `
            <div class="form-group" id="rackDropdownContainer">
                <label class="form-label required">Select Rack</label>
                <select class="form-select" id="wh_parent_rack" disabled required>
                    <option value="">Select Aisle first...</option>
                </select>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// On Parent Warehouse Change - PRD A-FR-014a
function onParentWarehouseChange(nodeType) {
    const warehouseId = document.getElementById('wh_parent_warehouse').value;

    // Reset downstream dropdowns - PRD A-FR-014a
    if (nodeType === 'Rack' || nodeType === 'Bin') {
        const aisleSelect = document.getElementById('wh_parent_aisle');
        aisleSelect.innerHTML = '<option value="">Select Aisle...</option>';
        aisleSelect.disabled = !warehouseId;

        if (warehouseId) {
            const aisles = dataStore.warehouse.filter(w => w.node_type === 'Aisle' && w.parent_id === warehouseId && w.status === 'Active');
            aisles.forEach(a => {
                aisleSelect.innerHTML += `<option value="${a.id}">${a.node_id} - ${escapeHtml(a.name)}</option>`;
            });
        }
    }

    if (nodeType === 'Bin') {
        const rackSelect = document.getElementById('wh_parent_rack');
        rackSelect.innerHTML = '<option value="">Select Aisle first...</option>';
        rackSelect.disabled = true;
    }

    // Auto-fill address from parent warehouse - PRD A-FR-015
    if (warehouseId && nodeType === 'Aisle') {
        const parentWh = getById('warehouse', warehouseId);
        if (parentWh) {
            document.getElementById('wh_address').value = parentWh.address;
        }
    }
}

// On Parent Aisle Change - PRD A-FR-014a
function onParentAisleChange(nodeType) {
    const aisleId = document.getElementById('wh_parent_aisle').value;

    if (nodeType === 'Bin') {
        const rackSelect = document.getElementById('wh_parent_rack');
        rackSelect.innerHTML = '<option value="">Select Rack...</option>';
        rackSelect.disabled = !aisleId;

        if (aisleId) {
            const racks = dataStore.warehouse.filter(w => w.node_type === 'Rack' && w.parent_id === aisleId && w.status === 'Active');
            racks.forEach(r => {
                rackSelect.innerHTML += `<option value="${r.id}">${r.node_id} - ${escapeHtml(r.name)}</option>`;
            });
        }
    }

    // Auto-fill address from parent warehouse - PRD A-FR-015
    if (aisleId && nodeType === 'Rack') {
        const aisle = getById('warehouse', aisleId);
        if (aisle && aisle.parent_id) {
            const parentWh = getById('warehouse', aisle.parent_id);
            if (parentWh) {
                document.getElementById('wh_address').value = parentWh.address;
            }
        }
    }
}

// Save Warehouse
function saveWarehouse() {
    const errors = [];

    // Get form values
    const nodeType = document.getElementById('wh_node_type').value;
    const nodeId = document.getElementById('wh_node_id').value.trim();
    const name = document.getElementById('wh_name').value.trim();
    const method = document.getElementById('wh_method').value;
    const address = document.getElementById('wh_address').value.trim();
    const description = document.getElementById('wh_description').value.trim();
    const status = document.getElementById('wh_status').value;

    // Validate required fields - PRD A-VR-004
    if (!nodeType) errors.push('Node Type is required');
    if (!nodeId) errors.push('Node ID is required');
    if (!name) errors.push('Name is required');
    if (!address) errors.push('Address is required');

    // Validate unique name - PRD A-VR-001
    if (name && !isUnique('warehouse', 'name', name)) {
        errors.push('Name must be unique');
    }

    // Validate parent selection - PRD A-FR-003
    let parentId = null;
    if (nodeType === 'Aisle') {
        parentId = document.getElementById('wh_parent_warehouse')?.value;
        if (!parentId) errors.push('Parent Warehouse is required for Aisle');
    } else if (nodeType === 'Rack') {
        parentId = document.getElementById('wh_parent_aisle')?.value;
        if (!parentId) errors.push('Parent Aisle is required for Rack');
    } else if (nodeType === 'Bin') {
        parentId = document.getElementById('wh_parent_rack')?.value;
        if (!parentId) errors.push('Parent Rack is required for Bin');
    }

    // Validate max lengths - PRD A.14.2
    if (!validateMaxLength(name, 100)) errors.push('Name must be maximum 100 characters');
    if (!validateMaxLength(address, 500)) errors.push('Address must be maximum 500 characters');
    if (!validateMaxLength(description, 1000)) errors.push('Description must be maximum 1000 characters');

    // Show validation errors - PRD D.5
    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    // Create warehouse record - PRD A.8.1
    const warehouse = {
        node_id: nodeId,
        name: name,
        parent_id: parentId,
        node_type: nodeType,
        method: method,
        address: address,
        description: description || null,
        status: status
    };

    addRecord('warehouse', warehouse);

    // Close slideover
    closeWarehouseSlideover();

    // Show success toast - PRD D.4.3
    showToast('success', 'Success', `Warehouse '${name}' created successfully`);

    // Refresh list
    renderWarehouseList();
}

// Close Warehouse Slideover
function closeWarehouseSlideover(event) {
    if (event && event.target !== event.currentTarget) return;
    const overlay = document.getElementById('warehouseSlideoverOverlay');
    overlay.classList.remove('active');
}

/* ===========================================
   Warehouse View - PRD A-FR-005a
   Read-only mode
   =========================================== */

function viewWarehouse(id) {
    const warehouse = getById('warehouse', id);
    if (!warehouse) return;

    const overlay = document.getElementById('warehouseSlideoverOverlay');
    const title = document.getElementById('warehouseSlideoverTitle');
    const body = document.getElementById('warehouseSlideoverBody');
    const footer = document.getElementById('warehouseSlideoverFooter');

    title.textContent = 'View Warehouse';

    const fullPath = calculateFullPath(id);

    body.innerHTML = `
        <div class="form-group">
            <label class="form-label">Node Type</label>
            <input type="text" class="form-input" value="${warehouse.node_type}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Node ID</label>
            <input type="text" class="form-input mono" value="${warehouse.node_id}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Full Path</label>
            <input type="text" class="form-input" value="${fullPath}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" class="form-input" value="${escapeHtml(warehouse.name)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Method</label>
            <input type="text" class="form-input" value="${warehouse.method}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" class="form-input" value="${escapeHtml(warehouse.address)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" readonly disabled>${escapeHtml(warehouse.description || '')}</textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Status</label>
            ${getStatusBadge(warehouse.status)}
        </div>

        <div class="form-group">
            <label class="form-label">Updated At</label>
            <input type="text" class="form-input" value="${formatDateTime(warehouse.updated_at)}" readonly disabled>
        </div>
    `;

    // PRD A-FR-005a: Close button only, no Edit button (Edit out of scope for MVP)
    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeWarehouseSlideover()">Close</button>
    `;

    overlay.classList.add('active');
}
