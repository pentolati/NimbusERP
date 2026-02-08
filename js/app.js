/* ===========================================
   ERP Nimbus - Main Application
   =========================================== */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('ERP Nimbus Prototype v1.0 - Initializing...');

    // Initialize navigation
    initNavigation();

    console.log('ERP Nimbus Prototype v1.0 - Ready');
});

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        if (e.target.form) {
            e.preventDefault();
        }
    }
});

// Close modals on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close validation modal
        closeValidationModal();
        // Close confirm modal
        closeConfirmModal();
        // Close any active modal overlays
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        // Close any active slideover overlays
        document.querySelectorAll('.slideover-overlay.active').forEach(overlay => {
            overlay.classList.remove('active');
        });
    }
});

// Handle clicks outside modals to close them
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
    }
});
