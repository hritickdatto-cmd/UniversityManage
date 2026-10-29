/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - TEACHER PORTAL CONTROLLER & ENGINE
 * ============================================================================
 */

const TeacherPortal = (() => {
            const DAILY_ATT_STORAGE_KEY = 'ums_teacher_daily_attendance';
            const ENROLLMENT_STORAGE_KEY = 'ums_student_enrollments';

            /**
             * Ensure standard mock student enrollments exist for faculty courses
             */
            const ensureRosters = () => {
                let enrollments = {};
                try {
                    enrollments = JSON.parse(localStorage.getItem(ENROLLMENT_STORAGE_KEY)) || {};
                } catch (e) {
                    enrollments = {};
                }

                // Guarantee students enrolled in Robert Martin's courses (CSE-301, CSE-303)
                let updated = false;
                if (!enrollments['STU-2024-001'] || !enrollments['STU-2024-001'].includes('CSE-301')) {
                    enrollments['STU-2024-001'] = Array.from(new Set([...(enrollments['STU-2024-001'] || []), 'CSE-301', 'CSE-303']));
                    updated = true;
                }
                if (!enrollments['STU-2024-002']) {
                    enrollments['STU-2024-002'] = ['CSE-301', 'CSE-303'];
                    updated = true;
                }
                if (!enrollments['STU-2024-003']) {
                    enrollments['STU-2024-003'] = ['CSE-301'];
                    updated = true;
                }

                if (updated) {
                    localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(enrollments));
                }
            };

            ensureRosters();

            return {
                /**
                 * Initializes any Teacher Portal page:
                 * - Enforces auth guard for role 'teacher'
                 * - Injects unified Sidebar & Topbar
                 * - Resolves faculty record
                 */
                init(activePageKey, pageTitle = 'Dashboard') {
                    const user = UMSAuth.requireAuth(['teacher'], '../login.html');
                    if (!user) return null;

                    const teacherId = user.teacherId || 'FAC-101';
                    const teacher = UMSStorage.findData('teachers', t => t.id === teacherId) || {
                        id: teacherId,
                        name: user.name,
                        designation: 'Senior Professor',
                        department: user.department || 'CSE',
                        email: user.email,
                        phone: '+1 (555) 789-0123',
                        room: 'Academic Block 3, Room 402',
                        assignedCourses: ['CSE-301', 'CSE-303'],
                        avatar: user.avatar || 'RM'
                    };

                    this.renderSidebar(activePageKey, teacher);
                    this.renderTopbar(pageTitle, teacher);

                    return { user, teacher };
                },

                /**
                 * Injects unified Teacher Sidebar
                 */
                renderSidebar(activeKey, teacher) {
                    const sidebarContainer = document.getElementById('appSidebar');
                    if (!sidebarContainer) return;

                    const navItems = [
                        { key: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
                        { key: 'students', label: 'My Students', icon: '👥', href: 'students.html' },
                        { key: 'attendance', label: 'Take Attendance', icon: '📅', href: 'attendance.html' },
                        { key: 'results', label: 'Gradebook & Marks', icon: '📝', href: 'results.html' },
                        { key: 'courses', label: 'Assigned Courses', icon: '📚', href: 'courses.html' },
                        { key: 'assignments', label: 'Coursework & Tasks', icon: '📁', href: 'assignments.html' }
                    ];

                    sidebarContainer.innerHTML = `
        <div class="sidebar-header">
          <a href="dashboard.html" class="sidebar-brand">
            <span style="font-size: 1.35rem;">🏛️</span>
            <span>Faculty Portal</span>
          </a>
          <button class="btn-icon btn-sidebar-toggle" onclick="UMSApp.toggleSidebar()" style="display: none;">✕</button>
        </div>

        <div class="sidebar-nav-container">
          <div class="nav-section-title">Academic Instruction</div>
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
            <div class="user-avatar" style="background: linear-gradient(135deg, var(--secondary) 0%, #0284c7 100%);">
              ${teacher.avatar || 'FC'}
            </div>
            <div class="user-details">
              <div class="user-name">${teacher.name}</div>
              <div class="user-role-badge">ID: ${teacher.id} &bull; ${teacher.department}</div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Injects unified Topbar
     */
    renderTopbar(title, teacher) {
      const topbarContainer = document.getElementById('appTopbar');
      if (!topbarContainer) return;

      topbarContainer.innerHTML = `
        <div class="topbar-left">
          <button class="btn-icon btn-sidebar-toggle" onclick="UMSApp.toggleSidebar()" aria-label="Toggle Sidebar Navigation">
            ☰
          </button>
          <div class="breadcrumb-nav">
            <a href="dashboard.html">Faculty</a>
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
            <button class="btn-icon" id="profileDropdownBtn" onclick="TeacherPortal.toggleProfileDropdown()" aria-label="User Menu" style="font-weight: 700;">
              ${teacher.avatar || 'FC'}
            </button>
            <div class="dropdown-menu" id="profileDropdownMenu">
              <div class="dropdown-header">
                <strong>${teacher.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${teacher.email}</div>
                <div style="font-size: 0.7rem; color: var(--secondary); font-weight: 600; margin-top: 0.15rem;">${teacher.designation}</div>
              </div>
              <a href="courses.html" class="dropdown-item">📚 My Courses</a>
              <a href="assignments.html" class="dropdown-item">📁 Class Assignments</a>
              <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.35rem 0;">
              <a href="javascript:void(0)" onclick="UMSAuth.logout('../login.html')" class="dropdown-item text-danger">🚪 Sign Out</a>
            </div>
          </div>
        </div>
      `;

      // Dismiss menu on outside clicks
      window.addEventListener('click', (e) => {
        const btn = document.getElementById('profileDropdownBtn');
        const menu = document.getElementById('profileDropdownMenu');
        if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
    },

    toggleProfileDropdown() {
      const menu = document.getElementById('profileDropdownMenu');
      if (menu) menu.classList.toggle('active');
    },

    /**
     * Get courses assigned to a teacher
     */
    getTeacherCourses(teacherId) {
      const allCourses = UMSStorage.getData('courses');
      return allCourses.filter(c => c.teacherId === teacherId || (c.assignedCourses && c.assignedCourses.includes(c.id)));
    },

    /**
     * Get students enrolled in a particular course
     */
    getStudentsByCourse(courseId) {
      let enrollments = {};
      try {
        enrollments = JSON.parse(localStorage.getItem(ENROLLMENT_STORAGE_KEY)) || {};
      } catch (e) {
        enrollments = {};
      }

      const enrolledStudentIds = Object.keys(enrollments).filter(stuId => {
        return Array.isArray(enrollments[stuId]) && enrollments[stuId].includes(courseId);
      });

      const allStudents = UMSStorage.getData('students');
      return allStudents.filter(s => enrolledStudentIds.includes(s.id));
    },

    /**
     * Grade calculation helper: Computes letter grade and grade point based on total marks
     */
    calculateGrade(totalMarks) {
      const marks = parseFloat(totalMarks);
      if (isNaN(marks) || marks < 0) return { grade: 'F', point: 0.00 };

      if (marks >= 90) return { grade: 'A+', point: 4.00 };
      if (marks >= 85) return { grade: 'A',  point: 3.75 };
      if (marks >= 80) return { grade: 'A-', point: 3.50 };
      if (marks >= 75) return { grade: 'B+', point: 3.25 };
      if (marks >= 70) return { grade: 'B',  point: 3.00 };
      if (marks >= 65) return { grade: 'B-', point: 2.75 };
      if (marks >= 60) return { grade: 'C+', point: 2.50 };
      if (marks >= 50) return { grade: 'C',  point: 2.00 };
      return { grade: 'F', point: 0.00 };
    },

    /**
     * Save daily roll call session and synchronize overall student attendance record
     */
    saveDailyAttendance(courseId, date, section, attendanceRecords) {
      let logs = [];
      try {
        logs = JSON.parse(localStorage.getItem(DAILY_ATT_STORAGE_KEY)) || [];
      } catch (e) {
        logs = [];
      }

      // Check for existing log for same course, section, and date
      const existingIdx = logs.findIndex(l => l.courseId === courseId && l.date === date && l.section === section);
      const logEntry = {
        id: existingIdx >= 0 ? logs[existingIdx].id : 'ATT-' + Date.now(),
        courseId,
        date,
        section,
        records: attendanceRecords,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        logs[existingIdx] = logEntry;
      } else {
        logs.push(logEntry);
      }
      localStorage.setItem(DAILY_ATT_STORAGE_KEY, JSON.stringify(logs));

      // Update aggregate student portal attendance table
      const course = UMSStorage.findData('courses', c => c.id === courseId);
      const courseCode = course ? course.code : courseId;
      const courseTitle = course ? course.title : 'Course Session';

      const allAttendance = UMSStorage.getData('attendance');

      attendanceRecords.forEach(rec => {
        const existingAtt = allAttendance.find(a => a.studentId === rec.studentId && a.courseCode === courseCode);
        if (existingAtt) {
          existingAtt.totalClasses += 1;
          if (rec.status === 'Present') {
            existingAtt.present += 1;
          } else {
            existingAtt.absent += 1;
          }
        } else {
          allAttendance.push({
            studentId: rec.studentId,
            courseCode,
            courseTitle,
            totalClasses: 1,
            present: rec.status === 'Present' ? 1 : 0,
            absent: rec.status === 'Absent' ? 1 : 0
          });
        }
      });

      UMSStorage.setData('attendance', allAttendance);
      return { success: true, message: `Roll call for ${date} preserved and aggregated successfully!` };
    },

    /**
     * Retrieve daily roll call log for a course & date if previously saved
     */
    getDailyAttendance(courseId, date, section) {
      try {
        const logs = JSON.parse(localStorage.getItem(DAILY_ATT_STORAGE_KEY)) || [];
        return logs.find(l => l.courseId === courseId && l.date === date && l.section === section) || null;
      } catch (e) {
        return null;
      }
    }
  };
})();