/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - AUTHENTICATION & ACCESS CONTROL
 * ============================================================================
 */

const UMSAuth = (() => {
    const SESSION_KEY = 'ums_active_session';
    const REMEMBER_KEY = 'ums_remembered_user';

    return {
        /**
         * Attempt login
         * @param {string} email
         * @param {string} password
         * @param {string} role ('student' | 'teacher' | 'admin')
         * @param {boolean} remember
         */
        async login(email, password, role, remember = false) {
            const firebase = window.UMSFirebase;
            if (!firebase) {
                return { success: false, message: 'Firebase is not available. Please reload the page and try again.' };
            }

            localStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_KEY);
            let credential;
            try {
                await firebase.setPersistence(
                    firebase.auth,
                    remember ? firebase.browserLocalPersistence : firebase.browserSessionPersistence
                );
                credential = await firebase.signInWithEmailAndPassword(firebase.auth, email.trim(), password);
                const profileSnapshot = await firebase.get(
                    firebase.ref(firebase.database, `users/${credential.user.uid}`)
                );
                const user = profileSnapshot.val();

                if (user && user.role === 'teacher' && role === 'teacher' && user.status === 'Pending') {
                    await firebase.update(firebase.ref(firebase.database), {
                        [`users/${credential.user.uid}/status`]: 'Active',
                        [`teachers/${credential.user.uid}/status`]: 'Active'
                    });
                    user.status = 'Active';
                }

                if (!user || user.role !== role || user.status !== 'Active') {
                    await firebase.signOut(firebase.auth);
                    return {
                        success: false,
                        message: user && user.status === 'Pending' ?
                            'Your account is awaiting BAUET verification. Ask an administrator to review your account.' : 'Invalid credentials or account role mismatch. Please verify your details.'
                    };
                }

                const sessionUser = {
                    id: user.id,
                    uid: credential.user.uid,
                    name: user.name,
                    email: credential.user.email,
                    role: user.role,
                    avatar: user.avatar,
                    studentId: user.studentId || null,
                    teacherId: user.teacherId || null,
                    department: user.department || null,
                    loginTime: new Date().toISOString()
                };

                const sessionStore = remember ? localStorage : sessionStorage;
                sessionStore.setItem(SESSION_KEY, JSON.stringify(sessionUser));
                if (remember) {
                    localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: sessionUser.email, role: user.role }));
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }

                return {
                    success: true,
                    user: sessionUser,
                    redirectUrl: this.getRoleHome(user.role)
                };
            } catch (error) {
                if (credential) {
                    await firebase.signOut(firebase.auth).catch(() => {});
                }
                const messages = {
                    'auth/invalid-credential': 'Email or password is incorrect.',
                    'auth/user-not-found': 'No BAUET account exists for this email.',
                    'auth/wrong-password': 'Email or password is incorrect.',
                    'auth/too-many-requests': 'Too many attempts. Please try again later.',
                    'PERMISSION_DENIED': 'Faculty account activation was denied. Publish the updated database.rules.json in Firebase Console, then try again.'
                };
                return {
                    success: false,
                    message: messages[error.code] || 'Sign-in failed. Check your connection and try again.'
                };
            }
        },

        /**
         * Terminate current session and redirect
         * @param {string} redirectPath
         */
        logout(redirectPath = '../login.html') {
            const finishLogout = () => {
                localStorage.removeItem(SESSION_KEY);
                sessionStorage.removeItem(SESSION_KEY);
                window.location.href = redirectPath;
            };
            const firebase = window.UMSFirebase;
            if (firebase) {
                firebase.signOut(firebase.auth).catch(console.error).finally(finishLogout);
            } else {
                finishLogout();
            }
        },

        /**
         * Retrieve active session user
         * @returns {Object|null}
         */
        getCurrentUser() {
            try {
                const session = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
                return session ? JSON.parse(session) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Retrieve remembered credentials if present
         */
        getRemembered() {
            try {
                const rem = localStorage.getItem(REMEMBER_KEY);
                return rem ? JSON.parse(rem) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Determine default dashboard for role
         * @param {string} role
         */
        getRoleHome(role) {
            switch (role) {
                case 'student':
                    return 'student/dashboard.html';
                case 'teacher':
                    return 'teacher/dashboard.html';
                case 'admin':
                    return 'admin/dashboard.html';
                default:
                    return 'index.html';
            }
        },

        /**
         * Guard route access based on role
         * @param {string[]} allowedRoles
         * @param {string} loginRedirect
         */
        requireAuth(allowedRoles = [], loginRedirect = '../login.html') {
            const user = this.getCurrentUser();

            if (!user) {
                window.location.href = loginRedirect;
                return null;
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                // Unauthorized role for this section
                alert('Access Denied: You do not have permission to view this portal.');
                window.location.href = this.getRoleHome(user.role);
                return null;
            }

            return user;
        }
    };
})();