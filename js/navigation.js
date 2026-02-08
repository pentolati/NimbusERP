/* ===========================================
   ERP Nimbus - Navigation
   Based on PRD Section D.1.3
   =========================================== */

// Current active page
let currentPage = 'dashboard';

// Page render functions map
const pageRenderers = {
    'dashboard': renderDashboard,
    'warehouse-list': renderWarehouseList,
    'supplier-list': renderSupplierList,
    'item-list': renderItemList,
    'uom-list': renderUomList,
    'inventory-list': renderInventoryList,
    'po-list': renderPoList,
    'po-create': renderPoCreate,
    'po-view': renderPoView,
    // Part U: User Management & RBAC
    'user-list': renderUserList,
    'functional-role-list': renderFunctionalRoleList,
    // Part W: Workflow Management (Simplified)
    'document-status-list': renderDocumentStatusList,
    'workflow-list': renderWorkflowList
};

// Navigate to page - PRD D-NAV-001, D-NAV-002
function navigateTo(pageName, params = {}) {
    currentPage = pageName;

    // Update nav active state - PRD D-NAV-002: Only one active at a time
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Match the base page name (e.g., 'warehouse-list' matches 'warehouse-*')
        const itemPage = item.dataset.page;
        if (itemPage && pageName.startsWith(itemPage.split('-')[0])) {
            if (itemPage === pageName || pageName.includes(itemPage.split('-')[0])) {
                item.classList.add('active');
            }
        }
    });

    // Highlight correct nav item
    const navItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    } else {
        // For sub-pages, highlight parent
        const basePage = pageName.split('-')[0] + '-list';
        const parentNav = document.querySelector(`.nav-item[data-page="${basePage}"]`);
        if (parentNav) {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            parentNav.classList.add('active');
        }
    }

    // Render page content
    const mainContent = document.getElementById('mainContent');
    const renderer = pageRenderers[pageName];

    if (renderer) {
        renderer(params);
    } else {
        mainContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Page Not Found</h1>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>The requested page "${pageName}" does not exist.</p>
                </div>
            </div>
        `;
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize navigation
function initNavigation() {
    // Add click handlers to nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Load initial page
    navigateTo('dashboard');
}

// Toggle theme - PRD D.1.2
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

// Close any open slideover
function closeSlideover() {
    document.querySelectorAll('.slideover-overlay').forEach(overlay => {
        overlay.classList.remove('active');
    });
}

// Close any open modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}
