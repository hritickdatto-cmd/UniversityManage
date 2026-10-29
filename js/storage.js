/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - LOCAL STORAGE DATABASE ENGINE
 * ============================================================================
 */

const UMSStorage = (() => {
    const DB_PREFIX = 'ums_db_';

    // Seed Data Definitions
    const SEED_DATA = {
        // 1. Departments
        departments: [{
                id: 'DEPT-CSE',
                code: 'CSE',
                name: 'Computer Science & Engineering',
                head: 'Dr. Alan Turing',
                totalStudents: 420,
                totalTeachers: 24,
                established: '2005'
            },
            {
                id: 'DEPT-EEE',
                code: 'EEE',
                name: 'Electrical & Electronic Engineering',
                head: 'Dr. Nikola Tesla',
                totalStudents: 310,
                totalTeachers: 18,
                established: '2006'
            },
            {
                id: 'DEPT-ICE',
                code: 'ICE',
                name: 'Information & Communication Engineering',
                head: 'Dr. Claude Shannon',
                totalStudents: 220,
                totalTeachers: 14,
                established: '2010'
            },
            {
                id: 'DEPT-BBA',
                code: 'BBA',
                name: 'Business Administration',
                head: 'Dr. Peter Drucker',
                totalStudents: 540,
                totalTeachers: 26,
                established: '2004'
            }
        ],

        // 2. Semesters
        semesters: [{
                id: 'SEM-2026-FALL',
                name: 'Fall 2026',
                year: 2026,
                status: 'Active',
                startDate: '2026-08-15',
                endDate: '2026-12-20',
                regDeadline: '2026-08-30'
            },
            {
                id: 'SEM-2026-SPRING',
                name: 'Spring 2026',
                year: 2026,
                status: 'Completed',
                startDate: '2026-01-10',
                endDate: '2026-05-25',
                regDeadline: '2026-01-25'
            }
        ],

        // 3. User Credentials & Roles
        users: [{
                id: 'USR-ADM-001',
                name: 'Prof. Margaret Hamilton',
                email: 'admin@university.edu',
                role: 'admin',
                avatar: 'MH',
                status: 'Active'
            },
            {
                id: 'USR-FAC-101',
                name: 'Dr. Robert C. Martin',
                email: 'teacher@university.edu',
                role: 'teacher',
                teacherId: 'FAC-101',
                department: 'CSE',
                avatar: 'RM',
                status: 'Active'
            },
            {
                id: 'USR-STU-501',
                name: 'Alex Harrison',
                email: 'student@university.edu',
                role: 'student',
                studentId: 'STU-2024-001',
                department: 'CSE',
                avatar: 'AH',
                status: 'Active'
            }
        ],

        // 4. Students Profiles
        students: [{
                id: 'STU-2024-001',
                userId: 'USR-STU-501',
                name: 'Alex Harrison',
                email: 'student@university.edu',
                phone: '+1 (555) 234-5678',
                department: 'CSE',
                program: 'B.Sc. in Computer Science',
                batch: '2024',
                currentSemester: '5th',
                cgpa: 3.84,
                totalCredits: 78,
                dob: '2003-04-12',
                gender: 'Male',
                address: '742 Evergreen Terrace, Springfield',
                guardianName: 'George Harrison',
                guardianPhone: '+1 (555) 987-6543',
                avatar: 'AH',
                status: 'Active'
            },
            {
                id: 'STU-2024-002',
                userId: 'USR-STU-502',
                name: 'Sophia Williams',
                email: 'sophia.w@university.edu',
                phone: '+1 (555) 345-6789',
                department: 'CSE',
                program: 'B.Sc. in Computer Science',
                batch: '2024',
                currentSemester: '5th',
                cgpa: 3.92,
                totalCredits: 78,
                dob: '2003-09-22',
                gender: 'Female',
                address: '12 Baker Street, Springfield',
                guardianName: 'Sarah Williams',
                guardianPhone: '+1 (555) 876-5432',
                avatar: 'SW',
                status: 'Active'
            },
            {
                id: 'STU-2024-003',
                userId: 'USR-STU-503',
                name: 'Liam Johnson',
                email: 'liam.j@university.edu',
                phone: '+1 (555) 456-7890',
                department: 'EEE',
                program: 'B.Sc. in Electrical Eng.',
                batch: '2023',
                currentSemester: '7th',
                cgpa: 3.45,
                totalCredits: 104,
                dob: '2002-02-18',
                gender: 'Male',
                address: '88 Skyline Drive, Springfield',
                guardianName: 'David Johnson',
                guardianPhone: '+1 (555) 765-4321',
                avatar: 'LJ',
                status: 'Active'
            }
        ],

        // 5. Teachers / Faculty Profiles
        teachers: [{
                id: 'FAC-101',
                userId: 'USR-FAC-101',
                name: 'Dr. Robert C. Martin',
                designation: 'Professor & Senior Academician',
                department: 'CSE',
                email: 'teacher@university.edu',
                phone: '+1 (555) 789-0123',
                room: 'Academic Block 3, Room 402',
                assignedCourses: ['CSE-301', 'CSE-402'],
                status: 'Active'
            },
            {
                id: 'FAC-102',
                userId: 'USR-FAC-102',
                name: 'Dr. Grace Hopper',
                designation: 'Associate Professor',
                department: 'CSE',
                email: 'grace.hopper@university.edu',
                phone: '+1 (555) 890-1234',
                room: 'Academic Block 3, Room 405',
                assignedCourses: ['CSE-205', 'CSE-310'],
                status: 'Active'
            }
        ],

        // 6. Courses
        courses: [{
                id: 'CSE-301',
                code: 'CSE-301',
                title: 'Database Management Systems',
                credits: 3.0,
                department: 'CSE',
                semester: '5th',
                teacherId: 'FAC-101',
                teacherName: 'Dr. Robert C. Martin',
                section: 'A',
                room: 'Lab-302',
                schedule: 'Mon / Wed 10:00 AM - 11:30 AM',
                capacity: 40,
                enrolled: 36
            },
            {
                id: 'CSE-302',
                code: 'CSE-302',
                title: 'Operating Systems & System Architecture',
                credits: 3.0,
                department: 'CSE',
                semester: '5th',
                teacherId: 'FAC-102',
                teacherName: 'Dr. Grace Hopper',
                section: 'A',
                room: 'Room-204',
                schedule: 'Tue / Thu 01:00 PM - 02:30 PM',
                capacity: 40,
                enrolled: 38
            },
            {
                id: 'CSE-303',
                code: 'CSE-303',
                title: 'Software Engineering & Agile Methodologies',
                credits: 3.0,
                department: 'CSE',
                semester: '5th',
                teacherId: 'FAC-101',
                teacherName: 'Dr. Robert C. Martin',
                section: 'A',
                room: 'Room-205',
                schedule: 'Mon / Wed 02:30 PM - 04:00 PM',
                capacity: 40,
                enrolled: 34
            },
            {
                id: 'MAT-301',
                code: 'MAT-301',
                title: 'Probability & Statistics for Computing',
                credits: 3.0,
                department: 'CSE',
                semester: '5th',
                teacherId: 'FAC-102',
                teacherName: 'Dr. Grace Hopper',
                section: 'B',
                room: 'Room-108',
                schedule: 'Sun / Tue 11:30 AM - 01:00 PM',
                capacity: 45,
                enrolled: 42
            }
        ],

        // 7. Attendance Records (Sample for Alex Harrison)
        attendance: [{
                studentId: 'STU-2024-001',
                courseCode: 'CSE-301',
                courseTitle: 'Database Management Systems',
                totalClasses: 28,
                present: 26,
                absent: 2
            },
            {
                studentId: 'STU-2024-001',
                courseCode: 'CSE-302',
                courseTitle: 'Operating Systems',
                totalClasses: 28,
                present: 24,
                absent: 4
            },
            {
                studentId: 'STU-2024-001',
                courseCode: 'CSE-303',
                courseTitle: 'Software Engineering',
                totalClasses: 26,
                present: 25,
                absent: 1
            },
            {
                studentId: 'STU-2024-001',
                courseCode: 'MAT-301',
                courseTitle: 'Probability & Statistics',
                totalClasses: 30,
                present: 22,
                absent: 8
            }
        ],

        // 8. Results / Grades
        results: [{
                studentId: 'STU-2024-001',
                semester: 'Spring 2026',
                courseCode: 'CSE-201',
                courseTitle: 'Data Structures & Algorithms',
                credits: 3.0,
                marks: 88,
                grade: 'A',
                gradePoint: 3.75
            },
            {
                studentId: 'STU-2024-001',
                semester: 'Spring 2026',
                courseCode: 'CSE-202',
                courseTitle: 'Object Oriented Programming',
                credits: 3.0,
                marks: 94,
                grade: 'A+',
                gradePoint: 4.00
            },
            {
                studentId: 'STU-2024-001',
                semester: 'Spring 2026',
                courseCode: 'MAT-201',
                courseTitle: 'Linear Algebra & Matrices',
                credits: 3.0,
                marks: 85,
                grade: 'A',
                gradePoint: 3.75
            }
        ],

        // 9. Fees Records
        fees: [{
            id: 'FEE-2026-001',
            studentId: 'STU-2024-001',
            semester: 'Fall 2026',
            tuitionFee: 3200,
            semesterFee: 500,
            labFee: 350,
            libraryFee: 150,
            total: 4200,
            paid: 2500,
            due: 1700,
            status: 'Partially Paid',
            dueDate: '2026-10-15'
        }],

        // 10. Class Routine / Timetable
        routine: [
            { id: 'RT-01', day: 'Monday', time: '10:00 AM - 11:30 AM', course: 'CSE-301', teacher: 'Dr. Robert C. Martin', room: 'Lab-302', section: 'A' },
            { id: 'RT-02', day: 'Monday', time: '02:30 PM - 04:00 PM', course: 'CSE-303', teacher: 'Dr. Robert C. Martin', room: 'Room-205', section: 'A' },
            { id: 'RT-03', day: 'Tuesday', time: '11:30 AM - 01:00 PM', course: 'MAT-301', teacher: 'Dr. Grace Hopper', room: 'Room-108', section: 'B' },
            { id: 'RT-04', day: 'Tuesday', time: '01:00 PM - 02:30 PM', course: 'CSE-302', teacher: 'Dr. Grace Hopper', room: 'Room-204', section: 'A' },
            { id: 'RT-05', day: 'Wednesday', time: '10:00 AM - 11:30 AM', course: 'CSE-301', teacher: 'Dr. Robert C. Martin', room: 'Lab-302', section: 'A' }
        ],

        // 11. Notices
        notices: [{
                id: 'NTC-001',
                title: 'Fall 2026 Midterm Examination Schedule Announced',
                category: 'Examination',
                date: '2026-09-15',
                important: true,
                author: 'Controller of Examinations',
                content: 'The Midterm examinations for Fall Semester 2026 will commence on October 20, 2026. All registered students are advised to download and print their exam clearance slips.'
            },
            {
                id: 'NTC-002',
                title: 'Course Registration Deadline Extension for Fall 2026',
                category: 'Academic',
                date: '2026-09-10',
                important: false,
                author: 'Office of the Registrar',
                content: 'The last date for course addition, alteration, and semester fee waiver submission has been extended through September 30, 2026.'
            },
            {
                id: 'NTC-003',
                title: 'Annual University Hackathon & Innovation Summit 2026',
                category: 'Events',
                date: '2026-09-05',
                important: false,
                author: 'CSE Department',
                content: 'Registration is now open for the 48-Hour Innovation Hackathon. Over $15,000 in project awards and scholarship sponsorships.'
            }
        ],

        // 12. Assignments
        assignments: [{
            id: 'ASN-01',
            courseId: 'CSE-301',
            title: 'ER Modeling & Relational Schema Mapping',
            description: 'Design a normalized 3NF database schema for a regional hospital healthcare management workflow.',
            deadline: '2026-10-05',
            submissionsCount: 32,
            totalEnrolled: 36
        }]
    };

    /**
     * Internal helper: Initialize default collections if missing
     */
    const initDatabase = () => {
        Object.keys(SEED_DATA).forEach(table => {
            const key = DB_PREFIX + table;
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(SEED_DATA[table]));
            }
        });

        const usersKey = DB_PREFIX + 'users';
        try {
            const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
            let removedPasswords = false;
            users.forEach(user => {
                if (Object.prototype.hasOwnProperty.call(user, 'password')) {
                    delete user.password;
                    removedPasswords = true;
                }
            });
            if (removedPasswords) {
                localStorage.setItem(usersKey, JSON.stringify(users));
            }
        } catch (err) {
            console.error('[UMSStorage] Error removing locally stored passwords:', err);
        }
    };

    // Run initialization on load
    initDatabase();

    /**
     * Public CRUD Storage Interface
     */
    return {
        /**
         * Retrieve full array from table
         * @param {string} table
         * @returns {Array}
         */
        getData(table) {
            try {
                const raw = localStorage.getItem(DB_PREFIX + table);
                return raw ? JSON.parse(raw) : [];
            } catch (err) {
                console.error(`[UMSStorage] Error reading table '${table}':`, err);
                return [];
            }
        },

        /**
         * Overwrite entire table
         * @param {string} table
         * @param {Array} data
         */
        setData(table, data) {
            try {
                localStorage.setItem(DB_PREFIX + table, JSON.stringify(data));
                return true;
            } catch (err) {
                console.error(`[UMSStorage] Error writing to table '${table}':`, err);
                return false;
            }
        },

        /**
         * Append a single item to a table
         * @param {string} table
         * @param {Object} item
         */
        addData(table, item) {
            const collection = this.getData(table);
            collection.push(item);
            this.setData(table, collection);
            return item;
        },

        /**
         * Update an item in a table
         * @param {string} table
         * @param {string|number} id
         * @param {Object} updates
         * @param {string} idField
         */
        updateData(table, id, updates, idField = 'id') {
            const collection = this.getData(table);
            const index = collection.findIndex(item => item[idField] === id);
            if (index !== -1) {
                collection[index] = {...collection[index], ...updates };
                this.setData(table, collection);
                return collection[index];
            }
            return null;
        },

        /**
         * Remove an item from a table
         * @param {string} table
         * @param {string|number} id
         * @param {string} idField
         */
        deleteData(table, id, idField = 'id') {
            const collection = this.getData(table);
            const filtered = collection.filter(item => item[idField] !== id);
            const wasDeleted = filtered.length !== collection.length;
            if (wasDeleted) {
                this.setData(table, filtered);
            }
            return wasDeleted;
        },

        /**
         * Search and find matching record
         * @param {string} table
         * @param {Function} predicate
         */
        findData(table, predicate) {
            const collection = this.getData(table);
            return collection.find(predicate) || null;
        },

        /**
         * Filter multiple records
         * @param {string} table
         * @param {Function} predicate
         */
        filterData(table, predicate) {
            const collection = this.getData(table);
            return collection.filter(predicate);
        },

        /**
         * Factory reset to original seed state
         */
        resetDatabase() {
            Object.keys(SEED_DATA).forEach(table => {
                localStorage.removeItem(DB_PREFIX + table);
            });
            initDatabase();
        }
    };
})();