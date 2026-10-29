/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - GLOBAL APPLICATION UTILITIES
 * ============================================================================
 */

const UMSApp = (() => {
    const THEME_KEY = 'ums_theme_mode';

    /**
     * Initialize Global DOM Listeners
     */
    const initTheme = () => {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    };

    // Run immediately
    initTheme();

    return {
        /**
         * Toggle Light / Dark Theme
         */
        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const target = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', target);
            localStorage.setItem(THEME_KEY, target);
            this.toast(`Switched to ${target} mode`, 'info');
            return target;
        },

        /**
         * Trigger Toast Notification
         * @param {string} message
         * @param {'success'|'error'|'warning'|'info'} type
         * @param {string} title
         */
        toast(message, type = 'info', title = '') {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;

            const iconMap = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            const titleMap = {
                success: 'Success',
                error: 'Attention Required',
                warning: 'Notice',
                info: 'Information'
            };

            toast.innerHTML = `
        <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
        <div class="toast-content">
          <div class="toast-title">${title || titleMap[type]}</div>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      `;

            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 200);
            });

            container.appendChild(toast);

            // Auto dismiss after 4.5 seconds
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(100%)';
                    setTimeout(() => toast.remove(), 200);
                }
            }, 4500);
        },

        /**
         * Open Modal
         * @param {string} modalId
         */
        openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        /**
         * Close Modal
         * @param {string} modalId
         */
        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        /**
         * Setup global modal dismiss listeners
         */
        initModals() {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal.id);
                    }
                });

                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.closeModal(modal.id));
                }
            });
        },

        /**
         * Toggle Mobile Navigation
         */
        toggleMobileNav(menuId) {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('active');
            }
        },

        /**
         * Toggle Dashboard Sidebar on Tablets / Mobile
         */
        toggleSidebar() {
            const sidebar = document.querySelector('.app-sidebar');
            if (sidebar) {
                sidebar.classList.toggle('sidebar-open');
            }
        },

        /**
         * Format currency
         */
        formatCurrency(amount) {
            return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
        },

        /**
         * Format date
         */
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }
    };
})();

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    UMSApp.initModals();
});

const portalRole = window.location.pathname.split('/')[1];
if (portalRole === 'student' || portalRole === 'teacher') {
    const appScript = document.currentScript;
    if (appScript) {
        const chatbotScript = document.createElement('script');
        chatbotScript.src = new URL('chatbot.js', appScript.src).href;
        chatbotScript.defer = true;
        document.head.appendChild(chatbotScript);
    }
}