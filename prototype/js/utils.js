/* ===========================================
   ERP Nimbus - Utility Functions
   Based on PRD Specifications
   =========================================== */

/* ===========================================
   Formatting Functions
   PRD A.16, B.16, E.2, E.3
   =========================================== */

// Format date for display - PRD E.3: DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// Format datetime for display - PRD A.16, B.16: DD/MM/YYYY HH:mm
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// Format currency - PRD E.2, B.16: Rp X.XXX.XXX
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'Rp 0';
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Rp 0';
    return 'Rp ' + num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse currency input
function parseCurrency(value) {
    if (!value) return 0;
    const cleanValue = value.toString().replace(/[^\d]/g, '');
    return parseFloat(cleanValue) || 0;
}

// Format number with decimals
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Truncate text - PRD A.7.4: "Truncated (50 chars)"
function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Get date for input field (YYYY-MM-DD)
function getDateForInput(date) {
    if (!date) date = new Date();
    if (typeof date === 'string') date = new Date(date);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Get datetime for input field
function getDateTimeForInput(date) {
    if (!date) date = new Date();
    if (typeof date === 'string') date = new Date(date);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/* ===========================================
   Validation Functions
   Based on PRD Validation Rules
   =========================================== */

// Phone validation - PRD A-VR-002: 8-15 digits, not start with 0
// Regex: ^[1-9][0-9]{7,14}$
function validatePhone(phone) {
    const regex = /^[1-9][0-9]{7,14}$/;
    return regex.test(phone);
}

// SKU validation - PRD A-VR-003a: 3 uppercase consonants + 4 digits
// Regex: ^[BCDFGHJKLMNPQRSTVWXYZ]{3}[0-9]{4}$
function validateSku(sku) {
    const regex = /^[BCDFGHJKLMNPQRSTVWXYZ]{3}[0-9]{4}$/;
    return regex.test(sku);
}

// Check if value is unique in collection
function isUnique(collection, field, value, excludeId = null) {
    const items = dataStore[collection];
    return !items.some(item => {
        if (excludeId && item.id === excludeId) return false;
        return item[field] && item[field].toLowerCase() === value.toLowerCase();
    });
}

// Validate required fields
function validateRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
}

// Validate number range
function validateRange(value, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
}

// Validate positive number
function validatePositive(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

// Validate max length - PRD A.14.2
function validateMaxLength(value, maxLength) {
    if (!value) return true;
    return value.length <= maxLength;
}

/* ===========================================
   Toast Notifications
   PRD D.4
   =========================================== */

// Show toast - PRD D.4.1 (4 seconds auto-dismiss)
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');

    const icons = {
        success: '&#10003;',
        error: '&#10007;',
        warning: '&#9888;',
        info: '&#8505;'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Auto-dismiss after 4 seconds - PRD D.4.1
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

/* ===========================================
   Validation Modal
   PRD D.5, A.12
   =========================================== */

function showValidationModal(errors) {
    const modal = document.getElementById('validationModal');
    const messageEl = document.getElementById('validationMessage');

    let errorHtml = '<ul style="text-align: left; margin: 0; padding-left: 20px;">';
    errors.forEach(error => {
        errorHtml += `<li>${error}</li>`;
    });
    errorHtml += '</ul>';

    messageEl.innerHTML = errorHtml;
    modal.classList.add('active');
}

function closeValidationModal() {
    const modal = document.getElementById('validationModal');
    modal.classList.remove('active');
}

/* ===========================================
   Confirmation Modal
   PRD B-FR-033a
   =========================================== */

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYesBtn');

    messageEl.textContent = message;

    // Remove old listener and add new one
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.addEventListener('click', () => {
        closeConfirmModal();
        if (onConfirm) onConfirm();
    });

    modal.classList.add('active');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
}

/* ===========================================
   Search Functions
   PRD A-VR-010, B-VR-030: Case-insensitive, partial matching
   =========================================== */

function searchFilter(items, searchTerm, fields) {
    if (!searchTerm || searchTerm.trim() === '') {
        return items;
    }

    const term = searchTerm.toLowerCase().trim();

    return items.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (!value) return false;
            return value.toString().toLowerCase().includes(term);
        });
    });
}

/* ===========================================
   Pagination Helper
   PRD A-FR-008b, B-FR-044: Default 10 records per page
   =========================================== */

function paginate(items, page = 1, pageSize = 10) {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
        items: paginatedItems,
        currentPage: page,
        pageSize: pageSize,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

function renderPagination(paginationData, onPageChange) {
    const { currentPage, totalPages, totalItems, pageSize } = paginationData;

    if (totalPages <= 1) {
        return `<div class="table-info">Showing ${totalItems} of ${totalItems} records</div>`;
    }

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    let paginationHtml = `
        <div class="table-info">Showing ${startItem}-${endItem} of ${totalItems} records</div>
        <div class="pagination">
            <button class="pagination-btn" onclick="${onPageChange}(1)" ${currentPage === 1 ? 'disabled' : ''}>&#171;</button>
            <button class="pagination-btn" onclick="${onPageChange}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>
    `;

    // Show page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
    }

    paginationHtml += `
            <button class="pagination-btn" onclick="${onPageChange}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>
            <button class="pagination-btn" onclick="${onPageChange}(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>&#187;</button>
        </div>
    `;

    return paginationHtml;
}

/* ===========================================
   Status Badge Helper
   =========================================== */

function getStatusBadge(status) {
    const statusMap = {
        'Active': 'badge-active',
        'Inactive': 'badge-inactive',
        'submitted': 'badge-submitted',
        'completed': 'badge-completed',
        'cancelled': 'badge-cancelled',
        'draft': 'badge-neutral'
    };

    const badgeClass = statusMap[status] || 'badge-neutral';
    const displayText = status.charAt(0).toUpperCase() + status.slice(1);

    return `<span class="badge ${badgeClass}">${displayText}</span>`;
}

/* ===========================================
   Escape HTML
   =========================================== */

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
