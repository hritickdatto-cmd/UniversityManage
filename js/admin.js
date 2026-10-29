/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - ADMIN PORTAL CONTROLLER & ENGINE
 * ============================================================================
 */

const AdminPortal = (() => {
            return {
                /**
                 * Initializes any Admin Portal view:
                 * - Enforces auth guard for 'admin'
                 * - Injects unified Sidebar & Topbar
                 * - Returns session user record
                 */
                init(activePageKey, pageTitle = 'Dashboard') {
                    const currentUser = UMSAuth.getCurrentUser();
                    if (currentUser && currentUser.role !== 'admin') {
                        UMSAuth.logout('../login.html?role=admin');
                        return null;
                    }

                    const user = UMSAuth.requireAuth(['admin'], '../login.html?role=admin');
                    if (!user) return null;

                    const admin = {
                        name: user.name || 'Prof. Margaret Hamilton',
                        email: user.email || 'admin@university.edu',
                        role: 'Administrator',
                        avatar: user.avatar || 'MH'
                    };

                    this.renderSidebar(activePageKey, admin);
                    this.renderTopbar(pageTitle, admin);

                    return { user, admin };
                },

                /**
                 * Injects unified Admin Sidebar
                 */
                renderSidebar(activeKey, admin) {
                    const sidebarContainer = document.getElementById('appSidebar');
                    if (!sidebarContainer) return;

                    const navItems = [
                        { key: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
                        { key: 'students', label: 'Student Registry', icon: '👨‍🎓', href: 'students.html' },
                        { key: 'teachers', label: 'Faculty Registry', icon: '👩‍🏫', href: 'teachers.html' },
                        { key: 'departments', label: 'Departments', icon: '🏢', href: 'departments.html' },
                        { key: 'courses', label: 'Courses & Catalog', icon: '📚', href: 'courses.html' },
                        { key: 'semesters', label: 'Academic Terms', icon: '🗓️', href: 'semesters.html' },
                        { key: 'routine', label: 'Class Routine', icon: '⏰', href: 'routine.html' },
                        { key: 'results', label: 'Academic Results', icon: '📝', href: 'results.html' },
                        { key: 'fees', label: 'Fee Management', icon: '💳', href: 'fees.html' },
                        { key: 'notices', label: 'Notice Board', icon: '📢', href: 'notices.html' },
                        { key: 'reports', label: 'Reports & Stats', icon: '📈', href: 'reports.html' }
                    ];

                    sidebarContainer.innerHTML = `
        <div class="sidebar-header">
          <a href="dashboard.html" class="sidebar-brand">
            <span style="font-size: 1.35rem;">🏛️</span>
            <span>Admin Center</span>
          </a>
          <button class="btn-icon btn-sidebar-toggle" onclick="UMSApp.toggleSidebar()" style="display: none;">✕</button>
        </div>

        <div class="sidebar-nav-container">
          <div class="nav-section-title">Institutional Management</div>
          <ul class="sidebar-nav">
            ${navItems.map(item => `
              <li>
                <a href="${item.href}" class="sidebar-link ${item.key === activeKey ? 'active' : ''}">
                  <span class="sidebar-link-icon">${item.icon}</span>
                  <span>${item.label}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-user-card">
            <div class="user-avatar" style="background: linear-gradient(135deg, #b45309 0%, #ea580c 100%);">
              ${admin.avatar}
            </div>
            <div class="user-details">
              <div class="user-name">${admin.name}</div>
              <div class="user-role-badge">System Administrator</div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Injects unified Admin Topbar
     */
    renderTopbar(title, admin) {
      const topbarContainer = document.getElementById('appTopbar');
      if (!topbarContainer) return;

      topbarContainer.innerHTML = `
        <div class="topbar-left">
          <button class="btn-icon btn-sidebar-toggle" onclick="UMSApp.toggleSidebar()" aria-label="Toggle Navigation">
            ☰
          </button>
          <div class="breadcrumb-nav">
            <a href="dashboard.html">Admin</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">${title}</span>
          </div>
        </div>

        <div class="topbar-right">
          <button class="btn-icon" id="themeBtn" title="Toggle Light/Dark Theme" onclick="UMSApp.toggleTheme()" aria-label="Toggle Theme">
            🌓
          </button>

          <!-- Profile Dropdown -->
          <div class="dropdown">
            <button class="btn-icon" id="adminDropdownBtn" onclick="AdminPortal.toggleDropdown()" style="font-weight: 700;">
              ${admin.avatar}
            </button>
            <div class="dropdown-menu" id="adminDropdownMenu">
              <div class="dropdown-header">
                <strong>${admin.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${admin.email}</div>
                <div style="font-size: 0.7rem; color: var(--accent); font-weight: 700; margin-top: 0.2rem;">Super Admin</div>
              </div>
              <a href="dashboard.html" class="dropdown-item">📊 Executive Overview</a>
              <a href="reports.html" class="dropdown-item">📈 Institutional Reports</a>
              <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.35rem 0;">
              <a href="javascript:void(0)" onclick="UMSAuth.logout('../login.html')" class="dropdown-item text-danger">🚪 Sign Out</a>
            </div>
          </div>
        </div>
      `;

      window.addEventListener('click', (e) => {
        const btn = document.getElementById('adminDropdownBtn');
        const menu = document.getElementById('adminDropdownMenu');
        if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
    },

    toggleDropdown() {
      const menu = document.getElementById('adminDropdownMenu');
      if (menu) menu.classList.toggle('active');
    },

    /**
     * Converts a 12-hour or 24-hour time string into minutes from midnight
     */
    parseTimeToMinutes(timeStr) {
      if (!timeStr) return 0;
      timeStr = timeStr.trim().toUpperCase();
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
      if (!match) return 0;

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3];

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    },

    /**
     * Detects timetable conflicts: checks if Room or Teacher has an overlapping booking on the same Day
     */
    checkScheduleConflict(newSlot, excludeId = null) {
      const routine = UMSStorage.getData('routine');
      const newStart = this.parseTimeToMinutes(newSlot.startTime);
      const newEnd = this.parseTimeToMinutes(newSlot.endTime);

      for (const slot of routine) {
        if (excludeId && slot.id === excludeId) continue;
        if (slot.day.toLowerCase() !== newSlot.day.toLowerCase()) continue;

        // Parse existing slot range e.g. "10:00 AM - 11:30 AM"
        const parts = slot.time.split('-');
        if (parts.length !== 2) continue;

        const slotStart = this.parseTimeToMinutes(parts[0]);
        const slotEnd = this.parseTimeToMinutes(parts[1]);

        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        const isOverlap = (newStart < slotEnd) && (newEnd > slotStart);

        if (isOverlap) {
          if (slot.room.toLowerCase() === newSlot.room.toLowerCase()) {
            return {
              conflict: true,
              message: `Room Conflict: Classroom ${slot.room} is already booked for ${slot.course} from ${slot.time} on ${slot.day}.`
            };
          }
          if (slot.teacher.toLowerCase() === newSlot.teacher.toLowerCase()) {
            return {
              conflict: true,
              message: `Faculty Conflict: ${slot.teacher} is already lecturing ${slot.course} in ${slot.room} from ${slot.time} on ${slot.day}.`
            };
          }
        }
      }

      return { conflict: false };
    }
  };
})();