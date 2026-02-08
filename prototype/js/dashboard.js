/* ===========================================
   ERP Nimbus - Dashboard
   Based on PRD Section D.2
   =========================================== */

// Render Dashboard - PRD D.2
function renderDashboard() {
    const mainContent = document.getElementById('mainContent');

    // Get counts - PRD D.2.2, D-DASH-001
    const warehouseCount = dataStore.warehouse.length;
    const supplierCount = dataStore.supplier.length;
    const itemCount = dataStore.item.length;
    const uomCount = dataStore.uom.length;
    const poCount = dataStore.purchaseOrder.length;

    mainContent.innerHTML = `
        <!-- Page Header - PRD D.2.1 -->
        <div class="page-header">
            <h1 class="page-title">Dashboard</h1>
        </div>

        <!-- Summary Cards - PRD D.2.1, D.2.2 (5-column grid) -->
        <div class="grid-5">
            <!-- Card 1: Warehouses - PRD D.2.2 (info/blue) -->
            <div class="dashboard-card">
                <div class="dashboard-card-icon info">&#127970;</div>
                <div class="dashboard-card-label">Warehouses</div>
                <div class="dashboard-card-value">${warehouseCount}</div>
            </div>

            <!-- Card 2: Suppliers - PRD D.2.2 (secondary/teal) -->
            <div class="dashboard-card">
                <div class="dashboard-card-icon secondary">&#128101;</div>
                <div class="dashboard-card-label">Suppliers</div>
                <div class="dashboard-card-value">${supplierCount}</div>
            </div>

            <!-- Card 3: Items - PRD D.2.2 (warning/amber) -->
            <div class="dashboard-card">
                <div class="dashboard-card-icon warning">&#128230;</div>
                <div class="dashboard-card-label">Items</div>
                <div class="dashboard-card-value">${itemCount}</div>
            </div>

            <!-- Card 4: UOMs - PRD D.2.2 (accent/orange) -->
            <div class="dashboard-card">
                <div class="dashboard-card-icon accent">&#128207;</div>
                <div class="dashboard-card-label">UOMs</div>
                <div class="dashboard-card-value">${uomCount}</div>
            </div>

            <!-- Card 5: Purchase Orders - PRD D.2.2 (primary/indigo) -->
            <div class="dashboard-card">
                <div class="dashboard-card-icon primary">&#128196;</div>
                <div class="dashboard-card-label">Purchase Orders</div>
                <div class="dashboard-card-value">${poCount}</div>
            </div>
        </div>

        <!-- Info Section - PRD D.2.1 -->
        <div class="info-section">
            <h3>Prototype Information</h3>
            <p>This prototype implements the PRD specifications for ERP Nimbus. It demonstrates the user interface and interactions defined in the Product Requirements Document.</p>

            <div class="info-cards">
                <div class="info-card">
                    <h4>Master Data Management</h4>
                    <p>Manage Warehouses, Suppliers, Items, UOM, and view Inventory levels.</p>
                </div>
                <div class="info-card">
                    <h4>Purchase Order Management</h4>
                    <p>Create and manage Purchase Orders with item lines, tax calculations, and payment tracking.</p>
                </div>
            </div>
        </div>
    `;
}
