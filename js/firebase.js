import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js';
import {
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    deleteUser,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    setPersistence,
    signInWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {get, getDatabase, onValue, ref, update } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js';

const firebaseConfig = {
    apiKey: 'AIzaSyCWoRvolhblS__7pQxNmBApwtYgon1-lW4',
    authDomain: 'universty-management-ceb81.firebaseapp.com',
    projectId: 'universty-management-ceb81',
    databaseURL: 'https://universty-management-ceb81-default-rtdb.firebaseio.com/',
    storageBucket: 'universty-management-ceb81.firebasestorage.app',
    messagingSenderId: '506432794990',
    appId: '1:506432794990:web:84fb6a790a4c944e14517f',
    measurementId: 'G-EDVN5FJWML'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

window.firebaseApp = app;
window.UMSFirebase = {
    auth,
    database,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    deleteUser,
    get,
    onAuthStateChanged,
    onValue,
    ref,
    sendPasswordResetEmail,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
    update
};

isSupported().then((supported) => {
    if (supported) {
        window.firebaseAnalytics = getAnalytics(app);
    }
}).catch((error) => {
    console.error('Firebase Analytics could not be initialized.', error);
});