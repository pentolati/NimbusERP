/* ===========================================
   ERP Nimbus - User Management Module
   Based on PRD Part U: User Management & Access Control
   =========================================== */

// Pagination state
let userCurrentPage = 1;
const userPageSize = 10;

// =============================================
// U.7.1 USER MANAGEMENT
// =============================================

function renderUserList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">User Management</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openUserCreate()">
                    + Create User
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="table-container">
            <div class="table-header">
                <div class="search-input-wrapper">
                    <input type="text" class="form-input" id="userSearch"
                           placeholder="Search by name, username, or email..."
                           oninput="filterUserList()">
                </div>
            </div>

            <div id="userTableContainer">
                ${renderUserTable()}
            </div>

            <div class="table-footer" id="userPagination">
                ${renderUserPagination()}
            </div>
        </div>

        <!-- Modal for Create/Edit/View -->
        <div class="modal-overlay" id="userModal">
            <div class="modal modal-md" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="userModalTitle">Create User</h3>
                    <button class="modal-close" onclick="closeUserModal()">&times;</button>
                </div>
                <div class="modal-body" id="userModalBody"></div>
                <div class="modal-footer" id="userModalFooter"></div>
            </div>
        </div>
    `;
}

function renderUserTable() {
    const searchTerm = document.getElementById('userSearch')?.value || '';
    let users = [...dataStore.user];

    if (searchTerm) {
        users = searchFilter(users, searchTerm, ['name', 'username', 'email']);
    }

    if (users.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128100;</div>
                <div class="empty-state-title">No users found</div>
                <div class="empty-state-description">Create your first User using the button above</div>
            </div>
        `;
    }

    const paginatedData = paginate(users, userCurrentPage, userPageSize);

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedData.items.forEach(user => {
        const statusBadge = user.is_active ?
            '<span class="badge badge-active">Active</span>' :
            '<span class="badge badge-inactive">Inactive</span>';

        html += `
            <tr>
                <td class="col-name" onclick="viewUser('${user.id}')">${escapeHtml(user.name)}</td>
                <td class="mono">${user.username}</td>
                <td>${user.email}</td>
                <td>${statusBadge}</td>
                <td class="col-action">
                    <button class="btn btn-secondary btn-sm" onclick="viewUser('${user.id}')">View</button>
                    <button class="btn btn-secondary btn-sm" onclick="cloneUser('${user.id}')">Clone</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    setTimeout(() => {
        const paginationEl = document.getElementById('userPagination');
        if (paginationEl) {
            paginationEl.innerHTML = renderPagination(paginatedData, 'goToUserPage');
        }
    }, 0);

    return html;
}

function renderUserPagination() {
    const users = dataStore.user;
    const paginatedData = paginate(users, userCurrentPage, userPageSize);
    return renderPagination(paginatedData, 'goToUserPage');
}

function goToUserPage(page) {
    userCurrentPage = page;
    document.getElementById('userTableContainer').innerHTML = renderUserTable();
}

function filterUserList() {
    userCurrentPage = 1;
    document.getElementById('userTableContainer').innerHTML = renderUserTable();
}

function openUserCreate() {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const body = document.getElementById('userModalBody');
    const footer = document.getElementById('userModalFooter');

    title.textContent = 'Create User';

    const functionalRoles = dataStore.functionalRole;

    body.innerHTML = `
        <form id="userForm">
            <div class="form-group">
                <label class="form-label required">Full Name</label>
                <input type="text" class="form-input" id="userName" placeholder="Enter full name" maxlength="100" required>
            </div>

            <div class="form-group">
                <label class="form-label required">Email</label>
                <input type="email" class="form-input" id="userEmail" placeholder="Enter email address" required onchange="autoFillUsername()">
            </div>

            <div class="form-group">
                <label class="form-label required">Username</label>
                <input type="text" class="form-input mono" id="userUsername" placeholder="Auto-generated from email" maxlength="30" required>
                <div class="form-hint">Auto-fills from email prefix, editable before save</div>
            </div>

            <div class="form-group">
                <label class="form-label">Functional Roles</label>
                <div class="checkbox-list">
                    ${functionalRoles.map(role => `
                        <label class="checkbox-item">
                            <input type="checkbox" name="roles" value="${role.id}">
                            <span>${role.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label required">Status</label>
                <div class="toggle-wrapper">
                    <div class="toggle active" id="userStatusToggle" onclick="toggleUserStatus()"></div>
                    <span class="toggle-label" id="userStatusLabel">Active</span>
                </div>
                <input type="hidden" id="userStatus" value="true">
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeUserModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveUser()">Save</button>
    `;

    modal.classList.add('active');
}

function toggleUserStatus() {
    const toggle = document.getElementById('userStatusToggle');
    const label = document.getElementById('userStatusLabel');
    const input = document.getElementById('userStatus');

    if (toggle.classList.contains('active')) {
        toggle.classList.remove('active');
        label.textContent = 'Inactive';
        input.value = 'false';
    } else {
        toggle.classList.add('active');
        label.textContent = 'Active';
        input.value = 'true';
    }
}

function autoFillUsername() {
    const email = document.getElementById('userEmail').value;
    const usernameField = document.getElementById('userUsername');
    if (email && !usernameField.readOnly) {
        const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        usernameField.value = prefix;
    }
}

function cloneUser(userId) {
    const user = dataStore.user.find(u => u.id === userId);
    if (!user) return;

    openUserCreate();

    // Pre-fill roles from cloned user
    const userRoles = dataStore.userRole.filter(ur => ur.user_id === userId).map(ur => ur.role_id);
    document.querySelectorAll('input[name="roles"]').forEach(checkbox => {
        checkbox.checked = userRoles.includes(checkbox.value);
    });

    document.getElementById('userModalTitle').textContent = 'Clone User';
}

function saveUser(userId = null) {
    const errors = [];

    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const isActive = document.getElementById('userStatus').value === 'true';

    if (!name) errors.push('Full Name is required');
    if (!email) errors.push('Email is required');
    if (!username) errors.push('Username is required');

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }

    if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscore (3-30 chars)');
    }

    if (!userId) {
        if (dataStore.user.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            errors.push('Email already exists');
        }
        if (dataStore.user.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            errors.push('Username already exists');
        }
    }

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const selectedRoles = [];
    document.querySelectorAll('input[name="roles"]:checked').forEach(checkbox => {
        selectedRoles.push(checkbox.value);
    });

    const now = getCurrentTimestamp();
    const newId = generateUUID();

    dataStore.user.push({
        id: newId,
        username: username,
        name: name,
        email: email,
        is_active: isActive,
        created_at: now,
        created_by: currentUser.id,
        updated_at: now,
        updated_by: currentUser.id
    });

    selectedRoles.forEach(roleId => {
        dataStore.userRole.push({
            user_id: newId,
            role_id: roleId,
            assigned_at: now,
            assigned_by: currentUser.id
        });
    });

    closeUserModal();
    showToast('success', 'Success', `User '${name}' created successfully`);
    renderUserList();
}

function viewUser(userId) {
    const user = dataStore.user.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const body = document.getElementById('userModalBody');
    const footer = document.getElementById('userModalFooter');

    title.textContent = 'View User';

    const userRoles = dataStore.userRole.filter(ur => ur.user_id === userId);
    const assignedRoles = userRoles.map(ur => dataStore.functionalRole.find(r => r.id === ur.role_id)).filter(Boolean);

    body.innerHTML = `
        <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" value="${escapeHtml(user.name)}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input mono" value="${user.username}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Email</label>
            <input type="text" class="form-input" value="${user.email}" readonly disabled>
        </div>

        <div class="form-group">
            <label class="form-label">Functional Roles</label>
            <div class="tag-list">
                ${assignedRoles.length > 0 ? assignedRoles.map(r => `<span class="tag">${r.name}</span>`).join(' ') : '-'}
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Status</label>
            ${user.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-inactive">Inactive</span>'}
        </div>

        <div class="form-group">
            <label class="form-label">Updated At</label>
            <input type="text" class="form-input" value="${formatDateTime(user.updated_at)}" readonly disabled>
        </div>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeUserModal()">Close</button>
    `;

    modal.classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

// =============================================
// =============================================
// U.7.3 FUNCTIONAL ROLE
// =============================================

function renderFunctionalRoleList() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Functional Roles</h1>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openFunctionalRoleCreate()">
                    + Create Role
                </button>
            </div>
        </div>

        <div class="table-container">
            <div id="functionalRoleTableContainer">
                ${renderFunctionalRoleTable()}
            </div>
        </div>

        <div class="modal-overlay" id="functionalRoleModal">
            <div class="modal modal-lg" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 id="functionalRoleModalTitle">Create Functional Role</h3>
                    <button class="modal-close" onclick="closeFunctionalRoleModal()">&times;</button>
                </div>
                <div class="modal-body" id="functionalRoleModalBody"></div>
                <div class="modal-footer" id="functionalRoleModalFooter"></div>
            </div>
        </div>
    `;
}

function renderFunctionalRoleTable() {
    const roles = dataStore.functionalRole;

    if (roles.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">&#128272;</div>
                <div class="empty-state-title">No roles found</div>
                <div class="empty-state-description">Create your first Functional Role using the button above</div>
            </div>
        `;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Permissions</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    roles.forEach(role => {
        const permCount = dataStore.permissionRule.filter(pr => pr.role_id === role.id).length;
        const isSystem = role.is_system ? ' <span class="tag">System</span>' : '';

        html += `
            <tr>
                <td class="col-name">${escapeHtml(role.name)}${isSystem}</td>
                <td class="col-truncate">${role.description ? truncateText(role.description, 50) : '-'}</td>
                <td><span class="tag">${permCount} entities</span></td>
                <td class="col-action">
                    <button class="btn btn-secondary btn-sm" onclick="openFunctionalRoleEdit('${role.id}')">Edit</button>
                    ${!role.is_system ? `<button class="btn btn-danger btn-sm" onclick="deleteFunctionalRole('${role.id}')">Delete</button>` : ''}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    return html;
}

function openFunctionalRoleCreate() {
    const modal = document.getElementById('functionalRoleModal');
    const title = document.getElementById('functionalRoleModalTitle');
    const body = document.getElementById('functionalRoleModalBody');
    const footer = document.getElementById('functionalRoleModalFooter');

    title.textContent = 'Create Functional Role';

    const entities = ['Purchase Order', 'Item', 'Supplier', 'Warehouse', 'Workflow', 'User'];

    body.innerHTML = `
        <form id="functionalRoleForm">
            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label required">Role Name</label>
                    <input type="text" class="form-input" id="roleName" placeholder="e.g., Creator, Approver" maxlength="50" required>
                </div>
                <div class="form-group" style="flex: 2;">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-input" id="roleDescription" placeholder="Optional description" maxlength="200">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label required">Permission Matrix</label>
                <div class="form-hint">Check permissions for each entity. State transitions (Submit, Approve, etc.) are managed by Workflow Engine.</div>
                <table class="data-table" style="margin-top: 10px;">
                    <thead>
                        <tr>
                            <th>Entity</th>
                            <th>Create</th>
                            <th>Read</th>
                            <th>Update</th>
                            <th>Delete</th>
                            <th>Cancel</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entities.map(entity => {
                            const entityKey = entity.replace(/\s/g, '_');
                            return `
                                <tr>
                                    <td><strong>${entity}</strong></td>
                                    <td class="text-center"><input type="checkbox" id="${entityKey}_create"></td>
                                    <td class="text-center"><input type="checkbox" id="${entityKey}_read"></td>
                                    <td class="text-center"><input type="checkbox" id="${entityKey}_update"></td>
                                    <td class="text-center"><input type="checkbox" id="${entityKey}_delete"></td>
                                    <td class="text-center"><input type="checkbox" id="${entityKey}_cancel"></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </form>
    `;

    footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeFunctionalRoleModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveFunctionalRole()">Save</button>
    `;

    modal.classList.add('active');
}

function openFunctionalRoleEdit(roleId) {
    const role = dataStore.functionalRole.find(r => r.id === roleId);
    if (!role) return;

    openFunctionalRoleCreate();
    document.getElementById('functionalRoleModalTitle').textContent = 'Edit Functional Role';
    document.getElementById('roleName').value = role.name;
    document.getElementById('roleDescription').value = role.description || '';

    const permissions = dataStore.permissionRule.filter(pr => pr.role_id === roleId);
    permissions.forEach(perm => {
        const entityKey = perm.entity_name.replace(/\s/g, '_');
        if (perm.perm_create) document.getElementById(`${entityKey}_create`).checked = true;
        if (perm.perm_read) document.getElementById(`${entityKey}_read`).checked = true;
        if (perm.perm_update) document.getElementById(`${entityKey}_update`).checked = true;
        if (perm.perm_delete) document.getElementById(`${entityKey}_delete`).checked = true;
        if (perm.perm_cancel) document.getElementById(`${entityKey}_cancel`).checked = true;
    });

    document.getElementById('functionalRoleModalFooter').innerHTML = `
        <button class="btn btn-secondary" onclick="closeFunctionalRoleModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveFunctionalRole('${roleId}')">Update</button>
    `;
}

function saveFunctionalRole(roleId = null) {
    const errors = [];
    const name = document.getElementById('roleName').value.trim();
    const description = document.getElementById('roleDescription').value.trim();

    if (!name) errors.push('Role Name is required');

    const duplicate = dataStore.functionalRole.find(r =>
        r.name.toLowerCase() === name.toLowerCase() && r.id !== roleId
    );
    if (duplicate) {
        errors.push('Role name already exists');
    }

    if (errors.length > 0) {
        showValidationModal(errors);
        return;
    }

    const entities = ['Purchase Order', 'Item', 'Supplier', 'Warehouse', 'Workflow', 'User'];
    const now = getCurrentTimestamp();

    if (roleId) {
        const role = dataStore.functionalRole.find(r => r.id === roleId);
        role.name = name;
        role.description = description;
        role.updated_at = now;

        dataStore.permissionRule = dataStore.permissionRule.filter(pr => pr.role_id !== roleId);
    } else {
        roleId = generateUUID();
        dataStore.functionalRole.push({
            id: roleId,
            name: name,
            description: description,
            is_system: false,
            created_at: now,
            updated_at: now
        });
    }

    entities.forEach(entity => {
        const entityKey = entity.replace(/\s/g, '_');
        const permRule = {
            id: generateUUID(),
            role_id: roleId,
            entity_name: entity,
            perm_create: document.getElementById(`${entityKey}_create`)?.checked || false,
            perm_read: document.getElementById(`${entityKey}_read`)?.checked || false,
            perm_update: document.getElementById(`${entityKey}_update`)?.checked || false,
            perm_delete: document.getElementById(`${entityKey}_delete`)?.checked || false,
            perm_cancel: document.getElementById(`${entityKey}_cancel`)?.checked || false
        };
        if (Object.keys(permRule).filter(k => k.startsWith('perm_') && permRule[k]).length > 0) {
            dataStore.permissionRule.push(permRule);
        }
    });

    closeFunctionalRoleModal();
    showToast('success', 'Success', 'Functional Role saved');
    renderFunctionalRoleList();
}

function deleteFunctionalRole(roleId) {
    const role = dataStore.functionalRole.find(r => r.id === roleId);

    if (role && role.is_system) {
        showValidationModal(['System roles cannot be deleted']);
        return;
    }

    showConfirmModal('Are you sure you want to delete this role?', () => {
        dataStore.functionalRole = dataStore.functionalRole.filter(r => r.id !== roleId);
        dataStore.permissionRule = dataStore.permissionRule.filter(pr => pr.role_id !== roleId);
        dataStore.userRole = dataStore.userRole.filter(ur => ur.role_id !== roleId);
        showToast('success', 'Success', 'Functional Role deleted');
        renderFunctionalRoleList();
    });
}

function closeFunctionalRoleModal() {
    document.getElementById('functionalRoleModal').classList.remove('active');
}
