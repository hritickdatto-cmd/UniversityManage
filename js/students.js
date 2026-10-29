/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - STUDENT PORTAL CONTROLLER & ENGINE
 * ============================================================================
 */

const StudentPortal = (() => {
            // Key for enrolled courses mapping: { studentId: [courseId1, courseId2, ...] }
            const ENROLLMENT_STORAGE_KEY = 'ums_student_enrollments';
            const EXAMS_STORAGE_KEY = 'ums_db_exams';

            /**
             * Seed Exam Records if missing
             */
            const seedExams = () => {
                if (!localStorage.getItem(EXAMS_STORAGE_KEY)) {
                    const defaultExams = [{
                            id: 'EXAM-01',
                            courseCode: 'CSE-301',
                            courseTitle: 'Database Management Systems',
                            type: 'Midterm',
                            date: '2026-10-20',
                            time: '10:00 AM - 12:00 PM',
                            room: 'Exam Hall A, Room 301',
                            seatRoll: 'A-24'
                        },
                        {
                            id: 'EXAM-02',
                            courseCode: 'CSE-302',
                            courseTitle: 'Operating Systems & System Architecture',
                            type: 'Midterm',
                            date: '2026-10-22',
                            time: '02:00 PM - 04:00 PM',
                            room: 'Exam Hall B, Room 402',
                            seatRoll: 'B-18'
                        },
                        {
                            id: 'EXAM-03',
                            courseCode: 'CSE-303',
                            courseTitle: 'Software Engineering & Agile Methodologies',
                            type: 'Midterm',
                            date: '2026-10-25',
                            time: '10:00 AM - 12:00 PM',
                            room: 'Exam Hall A, Room 305',
                            seatRoll: 'A-12'
                        },
                        {
                            id: 'EXAM-04',
                            courseCode: 'MAT-301',
                            courseTitle: 'Probability & Statistics for Computing',
                            type: 'Midterm',
                            date: '2026-10-28',
                            time: '01:30 PM - 03:30 PM',
                            room: 'Science Complex, Room 102',
                            seatRoll: 'SC-09'
                        }
                    ];
                    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(defaultExams));
                }
            };

            /**
             * Seed Default Enrollments for Alex Harrison if missing
             */
            const seedEnrollments = (studentId) => {
                let enrollments = {};
                try {
                    enrollments = JSON.parse(localStorage.getItem(ENROLLMENT_STORAGE_KEY)) || {};
                } catch (e) {
                    enrollments = {};
                }

                if (!enrollments[studentId]) {
                    // Alex Harrison starts enrolled in CSE-301 and CSE-302
                    enrollments[studentId] = ['CSE-301', 'CSE-302'];
                    localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(enrollments));
                }
            };

            return {
                /**
                 * Initializes any Student Portal page:
                 * - Enforces auth guard for 'student'
                 * - Injects unified Sidebar and Topbar
                 * - Returns the student record
                 */
                init(activePageKey, pageTitle = 'Dashboard') {
                    const user = UMSAuth.requireAuth(['student'], '../login.html');
                    if (!user) return null;

                    if (activePageKey === 'exams') seedExams();

                    const studentId = user.studentId || 'STU-2024-001';
                    seedEnrollments(studentId);

                    const student = UMSStorage.findData('students', s => s.id === studentId) || {
                        id: studentId,
                        name: user.name,
                        email: user.email,
                        department: user.department || '',
                        program: 'B.Sc. in Computer Science',
                        batch: '2024',
                        currentSemester: '5th',
                        cgpa: 3.84,
                        totalCredits: 78,
                        avatar: user.avatar || 'ST'
                    };

                    this.renderSidebar(activePageKey, student);
                    this.renderTopbar(pageTitle, student);

                    return { user, student };
                },

                /**
                 * Injects unified Student Sidebar
                 */
                renderSidebar(activeKey, student) {
                    const sidebarContainer = document.getElementById('appSidebar');
                    if (!sidebarContainer) return;

                    const navItems = [
                        { key: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
                        { key: 'profile', label: 'Student Profile', icon: '👤', href: 'profile.html' },
                        { key: 'courses', label: 'Course Registration', icon: '📚', href: 'courses.html' },
                        { key: 'attendance', label: 'Attendance', icon: '📅', href: 'attendance.html' },
                        { key: 'results', label: 'Grades & Results', icon: '📝', href: 'results.html' },
                        { key: 'routine', label: 'Class Routine', icon: '⏰', href: 'routine.html' },
                        { key: 'exams', label: 'Exam Schedule', icon: '🎯', href: 'exams.html' },
                        { key: 'fees', label: 'Fees & Payments', icon: '💳', href: 'fees.html' },
                        { key: 'notices', label: 'Notice Board', icon: '📢', href: 'notices.html' }
                    ];

                    sidebarContainer.innerHTML = `
        <div class="sidebar-header">
          <a href="dashboard.html" class="sidebar-brand">
            <span style="font-size: 1.35rem;">🏛️</span>
            <span>BAUET</span>
          </a>
          <button class="btn-icon btn-sidebar-toggle" onclick="UMSApp.toggleSidebar()" style="display: none;">✕</button>
        </div>

        <div class="sidebar-nav-container">
          <div class="nav-section-title">Academic Portal</div>
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
            <div class="user-avatar">${student.avatar || 'ST'}</div>
            <div class="user-details">
              <div class="user-name">${student.name}</div>
              <div class="user-role-badge">ID: ${student.id}</div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Injects unified Topbar
     */
    renderTopbar(title, student) {
      const topbarContainer = document.getElementById('appTopbar');
      if (!topbarContainer) return;

      topbarContainer.innerHTML = `
        <div class="topbar-left">
          <button class="btn-icon btn-sidebar-toggle" onclick="UMSApp.toggleSidebar()" aria-label="Toggle Sidebar Navigation">
            ☰
          </button>
          <div class="breadcrumb-nav">
            <a href="dashboard.html">Portal</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">${title}</span>
          </div>
        </div>

        <div class="topbar-right">
          <button class="btn-icon" id="themeBtn" title="Toggle Light/Dark Theme" onclick="UMSApp.toggleTheme()" aria-label="Toggle Theme">
            🌓
          </button>

          <a href="notices.html" class="btn-icon" title="Notices & Announcements" aria-label="Notices">
            🔔
          </a>

          <!-- Profile Dropdown -->
          <div class="dropdown">
            <button class="btn-icon" id="profileDropdownBtn" onclick="StudentPortal.toggleProfileDropdown()" aria-label="User Menu" style="font-weight: 700;">
              ${student.avatar || 'ST'}
            </button>
            <div class="dropdown-menu" id="profileDropdownMenu">
              <div class="dropdown-header">
                <strong>${student.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${student.email}</div>
              </div>
              <a href="profile.html" class="dropdown-item">👤 My Profile</a>
              <a href="fees.html" class="dropdown-item">💳 Account Ledger</a>
              <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.35rem 0;">
              <a href="javascript:void(0)" onclick="UMSAuth.logout('../login.html')" class="dropdown-item text-danger">🚪 Sign Out</a>
            </div>
          </div>
        </div>
      `;

      // Global click handler to close profile dropdown
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
     * Retrieve list of registered course IDs for student
     */
    getEnrolledCourseIds(studentId) {
      try {
        const all = JSON.parse(localStorage.getItem(ENROLLMENT_STORAGE_KEY)) || {};
        return all[studentId] || [];
      } catch (e) {
        return [];
      }
    },

    /**
     * Register student for a course
     */
    enrollCourse(studentId, courseId) {
      const course = UMSStorage.findData('courses', c => c.id === courseId);
      if (!course) return { success: false, message: 'Selected course not found.' };

      if (course.enrolled >= course.capacity) {
        return { success: false, message: 'This course section is at full capacity.' };
      }

      const enrolledIds = this.getEnrolledCourseIds(studentId);
      if (enrolledIds.includes(courseId)) {
        return { success: false, message: 'You are already registered for this course.' };
      }

      // Check maximum semester credit limit (e.g., 15 credits max)
      const allCourses = UMSStorage.getData('courses');
      const currentCredits = enrolledIds.reduce((sum, id) => {
        const c = allCourses.find(item => item.id === id);
        return sum + (c ? c.credits : 0);
      }, 0);

      if (currentCredits + course.credits > 18) {
        return { success: false, message: 'Credit limit exceeded! Max 18.0 credits allowed per semester.' };
      }

      // Update enrollment array
      let allEnrollments = {};
      try {
        allEnrollments = JSON.parse(localStorage.getItem(ENROLLMENT_STORAGE_KEY)) || {};
      } catch (e) {
        allEnrollments = {};
      }
      allEnrollments[studentId] = [...enrolledIds, courseId];
      localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(allEnrollments));

      // Increment course enrolled count
      UMSStorage.updateData('courses', courseId, { enrolled: course.enrolled + 1 });

      return { success: true, message: `Successfully registered for ${course.code}: ${course.title}!` };
    },

    /**
     * Drop a registered course
     */
    dropCourse(studentId, courseId) {
      const course = UMSStorage.findData('courses', c => c.id === courseId);
      const enrolledIds = this.getEnrolledCourseIds(studentId);

      if (!enrolledIds.includes(courseId)) {
        return { success: false, message: 'You are not registered in this course.' };
      }

      let allEnrollments = {};
      try {
        allEnrollments = JSON.parse(localStorage.getItem(ENROLLMENT_STORAGE_KEY)) || {};
      } catch (e) {
        allEnrollments = {};
      }
      allEnrollments[studentId] = enrolledIds.filter(id => id !== courseId);
      localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(allEnrollments));

      // Decrement course enrolled count
      if (course && course.enrolled > 0) {
        UMSStorage.updateData('courses', courseId, { enrolled: course.enrolled - 1 });
      }

      return { success: true, message: `Course ${course ? course.code : courseId} has been dropped.` };
    },

    /**
     * Update Student Profile
     */
    updateProfile(studentId, updatedFields) {
      const updated = UMSStorage.updateData('students', studentId, updatedFields);
      if (updated) {
        // Also update corresponding user name if changed
        if (updatedFields.name) {
          const user = UMSAuth.getCurrentUser();
          if (user) {
            user.name = updatedFields.name;
            localStorage.setItem('ums_active_session', JSON.stringify(user));
          }
        }
        return { success: true, student: updated };
      }
      return { success: false, message: 'Could not update student record.' };
    },

    /**
     * Simulate Fee Payment
     */
    payFee(studentId, amount, paymentMethod) {
      const feeRecord = UMSStorage.findData('fees', f => f.studentId === studentId);
      if (!feeRecord) {
        return { success: false, message: 'No fee account found for this student.' };
      }

      const payVal = parseFloat(amount);
      if (isNaN(payVal) || payVal <= 0) {
        return { success: false, message: 'Please enter a valid payment amount.' };
      }

      if (payVal > feeRecord.due) {
        return { success: false, message: `Payment exceeds total due balance of ${UMSApp.formatCurrency(feeRecord.due)}.` };
      }

      const newPaid = feeRecord.paid + payVal;
      const newDue = feeRecord.due - payVal;
      const newStatus = newDue <= 0 ? 'Paid' : 'Partially Paid';

      UMSStorage.updateData('fees', feeRecord.id, {
        paid: newPaid,
        due: newDue,
        status: newStatus,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        lastMethod: paymentMethod
      });

      return {
        success: true,
        message: `Payment of ${UMSApp.formatCurrency(payVal)} via ${paymentMethod} received successfully!`,
        newDue,
        newStatus
      };
    },

    /**
     * Countdown Timer Generator for Exams
     */
    startExamCountdown(targetDateStr, elementId) {
      const container = document.getElementById(elementId);
      if (!container) return;

      function update() {
        const target = new Date(targetDateStr + 'T09:00:00').getTime();
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
          container.innerHTML = `<span class="badge badge-danger">Exam In Progress or Concluded</span>`;
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        container.innerHTML = `
          <div style="display: flex; gap: 0.75rem; justify-content: center; font-variant-numeric: tabular-nums;">
            <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center; min-width: 60px;">
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">${days}</div>
              <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted);">Days</div>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center; min-width: 60px;">
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">${hours}</div>
              <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted);">Hours</div>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center; min-width: 60px;">
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">${minutes}</div>
              <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted);">Mins</div>
            </div>
            <div style="background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center; min-width: 60px;">
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">${seconds}</div>
              <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted);">Secs</div>
            </div>
          </div>
        `;
      }

      update();
      setInterval(update, 1000);
    }
  };
})();