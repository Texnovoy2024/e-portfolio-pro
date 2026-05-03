/**
 * shared.js — E-Portfolio Pro
 * Firebase Realtime Database integratsiyasi
 */

(function () {
    'use strict';

    window.EP = window.EP || {};

    // =========================================================
    // FIREBASE CONFIG & INIT
    // =========================================================
    var FIREBASE_CONFIG = {
        apiKey: "AIzaSyCT8YjaWxeWyE5-E-1UJ5xNefJFKmREc40",
        authDomain: "e-portfolio-pro.firebaseapp.com",
        databaseURL: "https://e-portfolio-pro-default-rtdb.firebaseio.com",
        projectId: "e-portfolio-pro",
        storageBucket: "e-portfolio-pro.firebasestorage.app",
        messagingSenderId: "239854304840",
        appId: "1:239854304840:web:5c772321a21b35f4c4e27d"
    };

    var firebaseDB = null;
    var firebaseReady = false;
    var firebaseCallbacks = [];

    // Firebase tayyor bo'lganda callback chaqirish
    function onFirebaseReady(cb) {
        if (firebaseReady) { cb(firebaseDB); return; }
        firebaseCallbacks.push(cb);
    }

    // Firebase SDK yuklash va init
    function initFirebase() {
        // Firebase SDK skriptlarini dinamik yuklash
        var scripts = [
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
        ];

        var loaded = 0;
        scripts.forEach(function(src) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = function() {
                loaded++;
                if (loaded === scripts.length) {
                    try {
                        if (!firebase.apps.length) {
                            firebase.initializeApp(FIREBASE_CONFIG);
                        }
                        firebaseDB = firebase.database();
                        firebaseReady = true;
                        console.log('✅ Firebase ulandi');
                        firebaseCallbacks.forEach(function(cb) { cb(firebaseDB); });
                        firebaseCallbacks = [];
                    } catch(e) {
                        console.error('Firebase init xatolik:', e);
                    }
                }
            };
            s.onerror = function() {
                console.error('Firebase SDK yuklanmadi:', src);
            };
            document.head.appendChild(s);
        });
    }

    // DOM tayyor bo'lganda Firebase ni ishga tushirish
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFirebase);
    } else {
        initFirebase();
    }

    EP.onFirebaseReady = onFirebaseReady;
    window.onFirebaseReady = onFirebaseReady;

    // =========================================================
    // FIREBASE DATABASE HELPERS
    // =========================================================

    /**
     * Firebase dan ma'lumot o'qish (async)
     * @param {string} path - masalan: 'users' yoki 'portfolios/S-001'
     * @returns {Promise<any>}
     */
    function fbGet(path) {
        return new Promise(function(resolve) {
            onFirebaseReady(function(db) {
                db.ref(path).once('value')
                    .then(function(snap) {
                        resolve(snap.val());
                    })
                    .catch(function(e) {
                        console.warn('fbGet error:', path, e);
                        resolve(null);
                    });
            });
        });
    }

    /**
     * Firebase ga ma'lumot yozish (async)
     * @param {string} path
     * @param {any} value
     * @returns {Promise<boolean>}
     */
    function fbSet(path, value) {
        return new Promise(function(resolve) {
            onFirebaseReady(function(db) {
                db.ref(path).set(value)
                    .then(function() { resolve(true); })
                    .catch(function(e) {
                        console.warn('fbSet error:', path, e);
                        resolve(false);
                    });
            });
        });
    }

    /**
     * Firebase dan ma'lumot o'chirish
     * @param {string} path
     * @returns {Promise<boolean>}
     */
    function fbRemove(path) {
        return new Promise(function(resolve) {
            onFirebaseReady(function(db) {
                db.ref(path).remove()
                    .then(function() { resolve(true); })
                    .catch(function(e) {
                        console.warn('fbRemove error:', path, e);
                        resolve(false);
                    });
            });
        });
    }

    EP.fbGet = fbGet;
    EP.fbSet = fbSet;
    EP.fbRemove = fbRemove;
    window.fbGet = fbGet;
    window.fbSet = fbSet;
    window.fbRemove = fbRemove;

    // =========================================================
    // LEGACY localStorage HELPERS (session uchun saqlanadi)
    // users va portfolios endi Firebase da
    // ep_* session kalitlari hali ham localStorage da
    // =========================================================

    function safeGetItem(key, defaultValue) {
        try {
            var raw = localStorage.getItem(key);
            if (raw === null) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            return defaultValue;
        }
    }

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    EP.safeGetItem = safeGetItem;
    EP.safeSetItem = safeSetItem;
    window.safeGetItem = safeGetItem;
    window.safeSetItem = safeSetItem;

    // =========================================================
    // SESSION FUNKSIYALARI (localStorage da qoladi)
    // =========================================================

    function isSessionExpired(role, sessionStart) {
        if (!sessionStart) return true;
        var elapsed = Date.now() - new Date(sessionStart).getTime();
        var limit = role === 'teacher'
            ? 30 * 60 * 1000
            : 8 * 60 * 60 * 1000;
        return elapsed > limit;
    }

    function checkSession(role) {
        var loggedIn = localStorage.getItem('ep_logged_in') === 'true';
        var userRole = localStorage.getItem('ep_user_role');
        var sessionStart = localStorage.getItem('ep_session_start');

        if (!loggedIn || userRole !== role) {
            window.location.href = 'auth.html';
            return;
        }

        if (isSessionExpired(role, sessionStart)) {
            showAlert("Sessiya muddati tugadi. Qayta kiring.", "Sessiya tugadi")
                .then(function () { logout(); });
        }
    }

    function refreshSession() {
        localStorage.setItem('ep_session_start', new Date().toISOString());
    }

    function logout() {
        var keys = Object.keys(localStorage).filter(function (k) {
            return k.startsWith('ep_');
        });
        keys.forEach(function (k) { localStorage.removeItem(k); });
        window.location.href = 'index.html';
    }

    EP.isSessionExpired = isSessionExpired;
    EP.checkSession = checkSession;
    EP.refreshSession = refreshSession;
    EP.logout = logout;
    window.isSessionExpired = isSessionExpired;
    window.checkSession = checkSession;
    window.refreshSession = refreshSession;
    window.logout = logout;

    // Inaktivlik timer
    var inactivityTimer = null;

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function () {
            showAlert("Inaktivlik sababli sessiya tugadi. Qayta kiring.", "Sessiya tugadi")
                .then(function () { logout(); });
        }, 30 * 60 * 1000);
    }

    function startInactivityWatcher() {
        ['mousemove', 'keydown', 'click'].forEach(function (eventName) {
            document.addEventListener(eventName, resetInactivityTimer);
        });
        resetInactivityTimer();
    }

    EP.resetInactivityTimer = resetInactivityTimer;
    EP.startInactivityWatcher = startInactivityWatcher;
    window.resetInactivityTimer = resetInactivityTimer;
    window.startInactivityWatcher = startInactivityWatcher;

    // =========================================================
    // PIN VALIDATION
    // =========================================================

    function validatePIN(pin) {
        return /^\d{4,6}$/.test(pin);
    }

    EP.validatePIN = validatePIN;
    window.validatePIN = validatePIN;

    // =========================================================
    // PASSWORD & PIN CHANGE (Firebase async)
    // =========================================================

    function changePassword(userId, currentPass, newPass) {
        return fbGet('users/' + userId).then(function(user) {
            if (!user) return { success: false, error: "Foydalanuvchi topilmadi" };
            if (user.password !== currentPass) return { success: false, error: "Joriy parol noto'g'ri" };
            if (!newPass || newPass.length < 6) return { success: false, error: "Yangi parol kamida 6 belgi bo'lishi kerak" };
            return fbSet('users/' + userId + '/password', newPass).then(function() {
                return { success: true };
            });
        });
    }

    function changePIN(userId, currentPIN, newPIN) {
        return fbGet('users/' + userId).then(function(user) {
            if (!user) return { success: false, error: "Foydalanuvchi topilmadi" };
            if (user.pin !== currentPIN) return { success: false, error: "Joriy PIN noto'g'ri" };
            if (!validatePIN(newPIN)) return { success: false, error: "Yangi PIN faqat 4-6 ta raqamdan iborat bo'lishi kerak" };
            return fbSet('users/' + userId + '/pin', newPIN).then(function() {
                return { success: true };
            });
        });
    }

    EP.changePassword = changePassword;
    EP.changePIN = changePIN;
    window.changePassword = changePassword;
    window.changePIN = changePIN;

    // =========================================================
    // CSV PARSER
    // =========================================================

    function parseCSV(csvString) {
        if (!csvString || typeof csvString !== 'string') {
            return { headers: [], rows: [], malformedRows: [] };
        }
        var lines = csvString.trim().split('\n');
        if (lines.length < 2) return { headers: [], rows: [], malformedRows: [] };

        var headers = lines[0].split(',').map(function (h) { return h.trim(); });
        var rows = [], malformedRows = [];

        for (var i = 1; i < lines.length; i++) {
            var line = lines[i];
            if (!line.trim()) continue;
            var cols = line.split(',');
            if (cols.length !== headers.length) { malformedRows.push(i); continue; }
            var row = {};
            headers.forEach(function (h, j) { row[h] = cols[j].trim(); });
            rows.push(row);
        }
        return { headers: headers, rows: rows, malformedRows: malformedRows };
    }

    function serializeToCSV(rows, headers) {
        var lines = [headers.join(',')];
        rows.forEach(function (row) {
            var cols = headers.map(function (h) {
                var val = row[h];
                return val !== undefined && val !== null ? String(val) : '';
            });
            lines.push(cols.join(','));
        });
        return lines.join('\n');
    }

    function validateCSVHeaders(headers, required) {
        if (!Array.isArray(headers) || !Array.isArray(required)) return false;
        return required.every(function (r) { return headers.includes(r); });
    }

    function validateCSVRow(row, headers) {
        if (!row || !Array.isArray(headers)) return false;
        return headers.every(function (h) { return Object.prototype.hasOwnProperty.call(row, h); });
    }

    EP.parseCSV = parseCSV;
    EP.serializeToCSV = serializeToCSV;
    EP.validateCSVHeaders = validateCSVHeaders;
    EP.validateCSVRow = validateCSVRow;
    window.parseCSV = parseCSV;
    window.serializeToCSV = serializeToCSV;
    window.validateCSVHeaders = validateCSVHeaders;
    window.validateCSVRow = validateCSVRow;

    // =========================================================
    // MODAL FUNKSIYALARI
    // =========================================================

    function ensureModalExists() {
        if (document.getElementById('globalModal')) return;
        var modalHTML = [
            '<div id="globalModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 hidden">',
            '  <div id="modalBox" class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 scale-95 opacity-0 transition-all duration-200">',
            '    <h3 id="modalTitle" class="text-xl font-bold mb-4 text-gray-800"></h3>',
            '    <div id="modalMessage" class="text-gray-600 mb-6"></div>',
            '    <div class="flex justify-end gap-3">',
            '      <button id="modalCancel" class="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 hidden">Bekor qilish</button>',
            '      <button id="modalOk" class="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">OK</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n');
        var container = document.createElement('div');
        container.innerHTML = modalHTML;
        document.body.appendChild(container.firstElementChild);
    }

    function openModal(title, message, isConfirm, callback, extraElement) {
        ensureModalExists();
        var modal = document.getElementById('globalModal');
        var box = document.getElementById('modalBox');
        var titleEl = document.getElementById('modalTitle');
        var messageEl = document.getElementById('modalMessage');
        var cancelBtn = document.getElementById('modalCancel');
        var okBtn = document.getElementById('modalOk');

        titleEl.textContent = title;
        messageEl.innerHTML = message;
        if (extraElement) messageEl.prepend(extraElement);
        cancelBtn.classList.toggle('hidden', !isConfirm);
        modal.classList.remove('hidden');
        setTimeout(function () {
            box.classList.remove('scale-95', 'opacity-0');
            box.classList.add('scale-100', 'opacity-100');
        }, 10);

        var newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        var newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        document.getElementById('modalOk').addEventListener('click', function () {
            closeModal();
            if (extraElement) callback(extraElement.value || false);
            else callback(true);
        });
        document.getElementById('modalCancel').addEventListener('click', function () {
            closeModal();
            callback(false);
        });
    }

    function closeModal() {
        var modal = document.getElementById('globalModal');
        var box = document.getElementById('modalBox');
        if (!modal || !box) return;
        box.classList.add('scale-95', 'opacity-0');
        box.classList.remove('scale-100', 'opacity-100');
        setTimeout(function () { modal.classList.add('hidden'); }, 200);
    }

    function showAlert(message, title) {
        title = title || "Ma'lumot";
        return new Promise(function (resolve) {
            openModal(title, message, false, resolve, null);
        });
    }

    function showConfirm(message, title) {
        title = title || "Tasdiqlash";
        return new Promise(function (resolve) {
            openModal(title, message, true, resolve, null);
        });
    }

    function showPrompt(message, title) {
        title = title || "Ma'lumot kiriting";
        return new Promise(function (resolve) {
            var input = document.createElement('input');
            input.className = 'w-full border border-gray-300 p-3 rounded-xl mb-4 focus:outline-none focus:border-indigo-500';
            input.placeholder = "Ma'lumot kiriting...";
            openModal(title, message, true, resolve, input);
            setTimeout(function () { input.focus(); }, 50);
        });
    }

    EP.openModal = openModal;
    EP.closeModal = closeModal;
    EP.showAlert = showAlert;
    EP.showConfirm = showConfirm;
    EP.showPrompt = showPrompt;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showAlert = showAlert;
    window.showConfirm = showConfirm;
    window.showPrompt = showPrompt;

    // =========================================================
    // DARK MODE (stub — o'chirilgan)
    // =========================================================
    function initDarkMode() {
        try { localStorage.removeItem('ep_dark_mode'); document.documentElement.classList.remove('dark'); } catch(e) {}
    }
    function toggleDarkMode() { return false; }
    EP.initDarkMode = initDarkMode;
    EP.toggleDarkMode = toggleDarkMode;
    window.initDarkMode = initDarkMode;
    window.toggleDarkMode = toggleDarkMode;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        initDarkMode();
    }

})();
