/**
 * shared.js — E-Portfolio Pro Upgrade
 * Barcha sahifalarda ishlatiladigan umumiy funksiyalar
 * Namespace: window.EP
 */

(function () {
    'use strict';

    window.EP = window.EP || {};

    // Dark mode o'chirildi — eski ep_dark_mode ni tozalash
    try { localStorage.removeItem('ep_dark_mode'); document.documentElement.classList.remove('dark'); } catch(e) {}

    // =========================================================
    // 1.1 localStorage yordamchilari
    // =========================================================

    /**
     * localStorage dan xavfsiz o'qish
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    function safeGetItem(key, defaultValue) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('localStorage read error for key "' + key + '":', e);
            return defaultValue;
        }
    }

    /**
     * localStorage ga xavfsiz yozish
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('localStorage QuotaExceededError for key "' + key + '"');
            } else {
                console.warn('localStorage write error for key "' + key + '":', e);
            }
            return false;
        }
    }

    EP.safeGetItem = safeGetItem;
    EP.safeSetItem = safeSetItem;
    window.safeGetItem = safeGetItem;
    window.safeSetItem = safeSetItem;

    // =========================================================
    // 1.3 Dark mode funksiyalari
    // =========================================================

    /**
     * Sahifa yuklanganda dark mode holatini o'rnatadi
     */
    function initDarkMode() {
        const isDark = safeGetItem('ep_dark_mode', false);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    /**
     * Dark mode ni almashtiradi va localStorage ga saqlaydi
     */
    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        safeSetItem('ep_dark_mode', isDark);
        return isDark;
    }

    EP.initDarkMode = initDarkMode;
    EP.toggleDarkMode = toggleDarkMode;
    window.initDarkMode = initDarkMode;
    window.toggleDarkMode = toggleDarkMode;

    // =========================================================
    // 1.5 Session funksiyalari
    // =========================================================

    /**
     * Session muddati tugaganligini tekshiradi
     * @param {'teacher'|'student'} role
     * @param {string} sessionStart - ISO string
     * @returns {boolean}
     */
    function isSessionExpired(role, sessionStart) {
        if (!sessionStart) return true;
        const elapsed = Date.now() - new Date(sessionStart).getTime();
        const limit = role === 'teacher'
            ? 30 * 60 * 1000      // 30 daqiqa
            : 8 * 60 * 60 * 1000; // 8 soat
        return elapsed > limit;
    }

    /**
     * Joriy sessionni tekshiradi; muddati o'tgan bo'lsa modal ko'rsatib redirect qiladi
     * @param {'teacher'|'student'} role
     */
    function checkSession(role) {
        const loggedIn = localStorage.getItem('ep_logged_in') === 'true';
        const userRole = localStorage.getItem('ep_user_role');
        const sessionStart = localStorage.getItem('ep_session_start');

        if (!loggedIn || userRole !== role) {
            window.location.href = 'auth.html';
            return;
        }

        if (isSessionExpired(role, sessionStart)) {
            showAlert("Sessiya muddati tugadi. Qayta kiring.", "Sessiya tugadi")
                .then(function () { logout(); });
        }
    }

    /**
     * Session start vaqtini yangilaydi
     */
    function refreshSession() {
        localStorage.setItem('ep_session_start', new Date().toISOString());
    }

    /**
     * Barcha ep_* localStorage kalitlarini o'chiradi va index.html ga redirect qiladi
     */
    function logout() {
        const keys = Object.keys(localStorage).filter(function (k) {
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

    // Teacher uchun inaktivlik timer
    var inactivityTimer = null;

    /**
     * Inaktivlik taymerini qayta ishga tushiradi (faqat teacher uchun)
     */
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function () {
            showAlert("Inaktivlik sababli sessiya tugadi. Qayta kiring.", "Sessiya tugadi")
                .then(function () { logout(); });
        }, 30 * 60 * 1000);
    }

    /**
     * Teacher uchun inaktivlik kuzatishni ishga tushiradi
     */
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
    // 1.6 PIN validation
    // =========================================================

    /**
     * PIN ni tekshiradi: faqat raqamlar, uzunlik 4-6
     * @param {string} pin
     * @returns {boolean}
     */
    function validatePIN(pin) {
        return /^\d{4,6}$/.test(pin);
    }

    EP.validatePIN = validatePIN;
    window.validatePIN = validatePIN;

    // =========================================================
    // 1.7 Notification yordamchilari
    // =========================================================

    /**
     * Dismissed notification ID larini qaytaradi
     * @returns {string[]}
     */
    function getDismissedNotifications() {
        return safeGetItem('ep_dismissed_notifications', []);
    }

    /**
     * Notification ni dismissed ro'yxatiga qo'shadi
     * @param {string} id
     */
    function dismissNotification(id) {
        var dismissed = getDismissedNotifications();
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            safeSetItem('ep_dismissed_notifications', dismissed);
        }
    }

    /**
     * Notification dismissed ekanligini tekshiradi
     * @param {string} id
     * @returns {boolean}
     */
    function isNotificationDismissed(id) {
        return getDismissedNotifications().includes(id);
    }

    EP.getDismissedNotifications = getDismissedNotifications;
    EP.dismissNotification = dismissNotification;
    EP.isNotificationDismissed = isNotificationDismissed;
    window.getDismissedNotifications = getDismissedNotifications;
    window.dismissNotification = dismissNotification;
    window.isNotificationDismissed = isNotificationDismissed;

    // =========================================================
    // 1.9 Modal funksiyalari
    // =========================================================

    /**
     * Modal HTML strukturasini dinamik yaratadi va document.body ga qo'shadi
     */
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

    /**
     * Modal ochadi
     * @param {string} title
     * @param {string} message
     * @param {boolean} isConfirm
     * @param {Function} callback
     * @param {HTMLElement|null} extraElement
     */
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

        if (extraElement) {
            messageEl.prepend(extraElement);
        }

        cancelBtn.classList.toggle('hidden', !isConfirm);

        modal.classList.remove('hidden');

        setTimeout(function () {
            box.classList.remove('scale-95', 'opacity-0');
            box.classList.add('scale-100', 'opacity-100');
        }, 10);

        // Eski event listenerlarni tozalash uchun clone
        var newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        var newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        document.getElementById('modalOk').addEventListener('click', function () {
            closeModal();
            if (extraElement) {
                callback(extraElement.value || false);
            } else {
                callback(true);
            }
        });

        document.getElementById('modalCancel').addEventListener('click', function () {
            closeModal();
            callback(false);
        });
    }

    /**
     * Modal yopadi
     */
    function closeModal() {
        var modal = document.getElementById('globalModal');
        var box = document.getElementById('modalBox');
        if (!modal || !box) return;

        box.classList.add('scale-95', 'opacity-0');
        box.classList.remove('scale-100', 'opacity-100');
        setTimeout(function () {
            modal.classList.add('hidden');
        }, 200);
    }

    /**
     * Alert modal ko'rsatadi
     * @param {string} message
     * @param {string} [title]
     * @returns {Promise<boolean>}
     */
    function showAlert(message, title) {
        title = title || "Ma'lumot";
        return new Promise(function (resolve) {
            openModal(title, message, false, resolve, null);
        });
    }

    /**
     * Confirm modal ko'rsatadi
     * @param {string} message
     * @param {string} [title]
     * @returns {Promise<boolean>}
     */
    function showConfirm(message, title) {
        title = title || "Tasdiqlash";
        return new Promise(function (resolve) {
            openModal(title, message, true, resolve, null);
        });
    }

    /**
     * Prompt modal ko'rsatadi (input bilan)
     * @param {string} message
     * @param {string} [title]
     * @returns {Promise<string|false>}
     */
    function showPrompt(message, title) {
        title = title || "Ma'lumot kiriting";
        return new Promise(function (resolve) {
            var input = document.createElement('input');
            input.className = 'w-full border border-gray-300 p-3 rounded-xl mb-4 focus:outline-none focus:border-indigo-500';
            input.placeholder = "Ma'lumot kiriting...";

            openModal(title, message, true, resolve, input);

            // Input ga focus
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
    // 1.10 changePassword va changePIN
    // =========================================================

    /**
     * Foydalanuvchi parolini o'zgartiradi
     * @param {string} userId
     * @param {string} currentPass
     * @param {string} newPass
     * @returns {{ success: boolean, error?: string }}
     */
    function changePassword(userId, currentPass, newPass) {
        var users = safeGetItem('users', {});

        if (!users[userId]) {
            return { success: false, error: "Foydalanuvchi topilmadi" };
        }

        if (users[userId].password !== currentPass) {
            return { success: false, error: "Joriy parol noto'g'ri" };
        }

        if (!newPass || newPass.length < 6) {
            return { success: false, error: "Yangi parol kamida 6 belgi bo'lishi kerak" };
        }

        users[userId].password = newPass;
        safeSetItem('users', users);
        return { success: true };
    }

    /**
     * Foydalanuvchi PIN ni o'zgartiradi
     * @param {string} userId
     * @param {string} currentPIN
     * @param {string} newPIN
     * @returns {{ success: boolean, error?: string }}
     */
    function changePIN(userId, currentPIN, newPIN) {
        var users = safeGetItem('users', {});

        if (!users[userId]) {
            return { success: false, error: "Foydalanuvchi topilmadi" };
        }

        if (users[userId].pin !== currentPIN) {
            return { success: false, error: "Joriy PIN noto'g'ri" };
        }

        if (!validatePIN(newPIN)) {
            return { success: false, error: "Yangi PIN faqat 4-6 ta raqamdan iborat bo'lishi kerak" };
        }

        users[userId].pin = newPIN;
        safeSetItem('users', users);
        return { success: true };
    }

    EP.changePassword = changePassword;
    EP.changePIN = changePIN;
    window.changePassword = changePassword;
    window.changePIN = changePIN;

    // =========================================================
    // 3. CSV Parser funksiyalari
    // =========================================================

    /**
     * CSV string ni parse qiladi
     * @param {string} csvString
     * @returns {{ headers: string[], rows: Object[], malformedRows: number[] }}
     */
    function parseCSV(csvString) {
        if (!csvString || typeof csvString !== 'string') {
            return { headers: [], rows: [], malformedRows: [] };
        }

        var lines = csvString.trim().split('\n');

        // Bo'sh yoki faqat 1 qatorli CSV
        if (lines.length < 2) {
            return { headers: [], rows: [], malformedRows: [] };
        }

        var headers = lines[0].split(',').map(function (h) { return h.trim(); });
        var rows = [];
        var malformedRows = [];

        for (var i = 1; i < lines.length; i++) {
            var line = lines[i];
            if (!line.trim()) continue; // bo'sh qatorlarni o'tkazib yuborish

            var cols = line.split(',');
            if (cols.length !== headers.length) {
                malformedRows.push(i);
                continue;
            }

            var row = {};
            headers.forEach(function (h, j) {
                row[h] = cols[j].trim();
            });
            rows.push(row);
        }

        return { headers: headers, rows: rows, malformedRows: malformedRows };
    }

    /**
     * Rows massivini CSV string ga aylantiradi
     * @param {Object[]} rows
     * @param {string[]} headers
     * @returns {string}
     */
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

    /**
     * Required headerlar mavjudligini tekshiradi
     * @param {string[]} headers
     * @param {string[]} required
     * @returns {boolean}
     */
    function validateCSVHeaders(headers, required) {
        if (!Array.isArray(headers) || !Array.isArray(required)) return false;
        return required.every(function (r) { return headers.includes(r); });
    }

    /**
     * Row object dagi barcha headers kalitlari mavjudligini tekshiradi
     * @param {Object} row
     * @param {string[]} headers
     * @returns {boolean}
     */
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
    // DOM tayyor bo'lganda dark mode ni ishga tushirish
    // =========================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        initDarkMode();
    }

})();
