import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// --- Data State (Hoisted) ---
let matchesData = [];
let squadData = [];
let newsData = [];
let scheduleData = [];
let editingId = null;
let currentType = 'match'; // 'match', 'player', 'news', 'schedule'

// --- Auth & Navigation ---
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "/admin/login.html";
    else {
        loadMatches();
        loadSquad();
        loadNews();
        loadSchedule();
        const savedView = localStorage.getItem('adminView') || 'matches';
        switchView(savedView); // Initialize UI
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        localStorage.removeItem('adminView');
        window.location.href = "/admin/login.html";
    });
});

const views = {
    matches: document.getElementById('matches-view'),
    squad: document.getElementById('squad-view'),
    news: document.getElementById('news-view'),
    schedule: document.getElementById('schedule-view')
};

const navLinks = {
    matches: document.getElementById('nav-matches'),
    squad: document.getElementById('nav-squad'),
    news: document.getElementById('nav-news'),
    schedule: document.getElementById('nav-schedule')
};

const pageTitle = document.getElementById('page-title');
const mainActionBtn = document.getElementById('main-action-btn');

// Initial click handler setup
if (mainActionBtn) {
    mainActionBtn.onclick = () => openModal('match');
}

function switchView(viewName) {
    localStorage.setItem('adminView', viewName);

    // Hide all
    Object.keys(views).forEach(key => {
        if (views[key]) views[key].classList.add('hidden');
        if (navLinks[key]) navLinks[key].classList.remove('active');
    });

    // Show selected
    if (views[viewName]) views[viewName].classList.remove('hidden');
    if (navLinks[viewName]) navLinks[viewName].classList.add('active');

    // Update Header
    if (mainActionBtn) {
        mainActionBtn.classList.remove('hidden');
        if (viewName === 'matches') {
            pageTitle.textContent = "إدارة المباريات";
            mainActionBtn.textContent = "+ إضافة مباراة";
            mainActionBtn.onclick = () => openModal('match');
        } else if (viewName === 'squad') {
            pageTitle.textContent = "إدارة الفريق";
            mainActionBtn.textContent = "+ إضافة لاعب";
            mainActionBtn.onclick = () => openModal('player');
        } else if (viewName === 'news') {
            pageTitle.textContent = "إدارة الأخبار";
            mainActionBtn.textContent = "+ إضافة خبر";
            mainActionBtn.onclick = () => openModal('news');
        } else if (viewName === 'schedule') {
            pageTitle.textContent = "جدول المباريات";
            mainActionBtn.textContent = "+ إضافة موعد";
            mainActionBtn.onclick = () => openScheduleModal();
        }
    }
}

// Event Listeners for Nav
if (navLinks.matches) navLinks.matches.addEventListener('click', () => switchView('matches'));
if (navLinks.squad) navLinks.squad.addEventListener('click', () => switchView('squad'));
if (navLinks.news) navLinks.news.addEventListener('click', () => switchView('news'));
if (navLinks.schedule) navLinks.schedule.addEventListener('click', () => switchView('schedule'));


// --- Matches Logic ---
async function loadMatches() {
    const tbody = document.getElementById('matches-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">جاري التحميل...</td></tr>';

    const q = query(collection(db, "matches"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    matchesData = [];
    snap.forEach(d => matchesData.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    matchesData.forEach((m) => {
        const row = document.createElement('tr');
        const d = new Date(m.date);
        row.innerHTML = `
            <td>${d.toLocaleDateString('ar-MA')}</td>
            <td>${m.homeTeam || m.teamHome}</td>
            <td dir="ltr" style="text-align:center;">${m.isFinished ? m.scoreHome + '-' + m.scoreAway : 'قادمة'}</td>
            <td>${m.awayTeam || m.teamAway}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="window.editItem('match', '${m.id}')">تعديل</button>
                <button class="btn-delete" onclick="window.deleteItem('matches', '${m.id}')">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- Squad Logic ---
async function loadSquad() {
    const tbody = document.getElementById('squad-table-body');
    if (!tbody) return;
    const snap = await getDocs(collection(db, "squad"));
    squadData = [];
    snap.forEach(d => squadData.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    squadData.forEach((p) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.role}</td>
            <td>${p.number}</td>
            <td>${p.position}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="window.editItem('player', '${p.id}')">تعديل</button>
                <button class="btn-delete" onclick="window.deleteItem('squad', '${p.id}')">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- News Logic ---
async function loadNews() {
    const tbody = document.getElementById('news-table-body');
    if (!tbody) return;
    const snap = await getDocs(collection(db, "news"));
    newsData = [];
    snap.forEach(d => newsData.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    newsData.forEach((n) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${n.title}</td>
            <td>${n.date}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="window.editItem('news', '${n.id}')">تعديل</button>
                <button class="btn-delete" onclick="window.deleteItem('news', '${n.id}')">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- Schedule Logic ---
async function loadSchedule() {
    const tbody = document.getElementById('schedule-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">جاري التحميل...</td></tr>';

    // Ensure schedule collection exists and has data. Using 'round' as sort key.
    const q = query(collection(db, "schedule"), orderBy("round", "asc"));
    const snap = await getDocs(q);
    scheduleData = [];
    snap.forEach(d => scheduleData.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    scheduleData.forEach((s) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.round}</td>
            <td>${s.opponent}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="window.editScheduleItem('${s.id}', ${s.round}, '${s.opponent}')">تعديل</button>
                <button class="btn-delete" onclick="window.deleteItem('schedule', '${s.id}')">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


// --- Match/Squad/News Modal Handling ---
const modal = document.getElementById('match-modal');
const closeModalBtn = document.getElementById('close-match-modal');
const form = document.getElementById('match-form');

function openModal(type, item = null) {
    currentType = type;
    modal.classList.remove('hidden');
    editingId = item ? item.id : null;
    const formContainer = document.getElementById('match-form');

    // Create form content based on type
    let html = `<input type="hidden" id="match-id" value="${editingId || ''}">`;
    let btnText = 'حفظ';

    if (type === 'match') {
        document.getElementById('modal-title').textContent = item ? "تعديل مباراة" : "إضافة مباراة";
        html += `
            <div class="form-row">
                <div class="form-group half"><label>الفريق المضيف</label><input type="text" id="teamHome" required value="${item?.homeTeam || item?.teamHome || ''}"></div>
                <div class="form-group half"><label>الفريق الضيف</label><input type="text" id="teamAway" required value="${item?.awayTeam || item?.teamAway || ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group half"><label>التاريخ</label><input type="datetime-local" id="matchDate" required value="${item?.date || ''}"></div>
                <div class="form-group half"><label>الحالة</label>
                    <select id="isFinished" onchange="toggleScores(this.value)">
                        <option value="false" ${item?.isFinished === false ? 'selected' : ''}>قادمة</option>
                        <option value="true" ${item?.isFinished === true ? 'selected' : ''}>انتهت</option>
                    </select>
                </div>
            </div>
            <div class="form-row" id="scores-container" style="${item?.isFinished ? '' : 'display:none'}">
                <div class="form-group half"><label>نتيجة المضيف</label><input type="number" id="scoreHome" value="${item?.scoreHome || 0}"></div>
                <div class="form-group half"><label>نتيجة الضيف</label><input type="number" id="scoreAway" value="${item?.scoreAway || 0}"></div>
            </div>
        `;
    } else if (type === 'player') {
        document.getElementById('modal-title').textContent = item ? "تعديل لاعب" : "إضافة لاعب";
        html += `
            <div class="form-group"><label>الاسم الكامل</label><input type="text" id="pName" required value="${item?.name || ''}"></div>
            <div class="form-row">
                <div class="form-group half"><label>الرقم</label><input type="number" id="pNumber" required value="${item?.number || ''}"></div>
                <div class="form-group half"><label>الدور</label><input type="text" id="pRole" value="${item?.role || ''}" placeholder="مدرب / لاعب"></div>
            </div>
            <div class="form-group"><label>المركز</label><input type="text" id="pPos" required value="${item?.position || ''}"></div>
         `;
    } else if (type === 'news') {
        document.getElementById('modal-title').textContent = item ? "تعديل خبر" : "إضافة خبر";
        // Simple news form for now
        html += `
            <div class="form-group"><label>العنوان</label><input type="text" id="nTitle" required value="${item?.title || ''}"></div>
            <div class="form-group"><label>التاريخ</label><input type="date" id="nDate" required value="${item?.date || ''}"></div>
        `;
    }

    html += `<button type="submit" class="btn-login" id="save-btn">${btnText}</button>`;
    formContainer.innerHTML = html;
}

window.toggleScores = (val) => {
    document.getElementById('scores-container').style.display = (val === 'true') ? 'flex' : 'none';
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    btn.textContent = 'جاري الحفظ...'; btn.disabled = true;

    try {
        let col = '';
        let data = {};

        if (currentType === 'match') {
            col = 'matches';
            data = {
                homeTeam: document.getElementById('teamHome').value,
                awayTeam: document.getElementById('teamAway').value,
                date: document.getElementById('matchDate').value,
                isFinished: document.getElementById('isFinished').value === 'true',
                scoreHome: document.getElementById('scoreHome').value,
                scoreAway: document.getElementById('scoreAway').value
            };
        } else if (currentType === 'player') {
            col = 'squad';
            data = {
                name: document.getElementById('pName').value,
                number: document.getElementById('pNumber').value,
                role: document.getElementById('pRole').value,
                position: document.getElementById('pPos').value
            };
        } else if (currentType === 'news') {
            col = 'news';
            data = {
                title: document.getElementById('nTitle').value,
                date: document.getElementById('nDate').value
            };
        }

        if (editingId) await updateDoc(doc(db, col, editingId), data);
        else await addDoc(collection(db, col), data);

        modal.classList.add('hidden');
        if (currentType === 'match') loadMatches();
        else if (currentType === 'player') loadSquad();
        else loadNews();

    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        btn.disabled = false;
    }
});

if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.add('hidden');


// --- Schedule Modal Logic (Separate Modal) ---
const scheduleModal = document.getElementById('schedule-modal');
const closeScheduleModal = document.getElementById('close-schedule-modal');
const scheduleForm = document.getElementById('schedule-form');

window.openScheduleModal = () => {
    scheduleForm.reset();
    document.getElementById('schedule-id').value = '';
    document.getElementById('schedule-modal-title').textContent = "إضافة موعد مباراة";
    if (scheduleModal) scheduleModal.classList.remove('hidden');
};

window.editScheduleItem = (id, round, opponent) => {
    document.getElementById('schedule-id').value = id;
    document.getElementById('scheduleRound').value = round;
    document.getElementById('scheduleOpponent').value = opponent;
    document.getElementById('schedule-modal-title').textContent = "تعديل موعد";
    if (scheduleModal) scheduleModal.classList.remove('hidden');
};

if (closeScheduleModal) closeScheduleModal.onclick = () => scheduleModal.classList.add('hidden');

if (scheduleForm) {
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('schedule-id').value;
        const data = {
            round: Number(document.getElementById('scheduleRound').value),
            opponent: document.getElementById('scheduleOpponent').value
        };

        try {
            if (id) await updateDoc(doc(db, "schedule", id), data);
            else await addDoc(collection(db, "schedule"), data);
            scheduleModal.classList.add('hidden');
            loadSchedule();
        } catch (err) {
            console.error(err);
            alert("Error saving schedule");
        }
    });
}

// --- Global Helpers ---
window.editItem = (type, id) => {
    let item;
    if (type === 'match') item = matchesData.find(m => m.id === id);
    else if (type === 'player') item = squadData.find(s => s.id === id);
    else if (type === 'news') item = newsData.find(n => n.id === id);
    openModal(type, item);
};

window.deleteItem = async (col, id) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
        await deleteDoc(doc(db, col, id));
        if (col === 'matches') loadMatches();
        else if (col === 'squad') loadSquad();
        else if (col === 'news') loadNews();
        else if (col === 'schedule') loadSchedule();
    } catch (err) {
        console.error(err);
        alert("Error deleting item");
    }
};

// --- Seed Data Logic (Temporary) ---
const seedBtn = document.getElementById('seed-schedule-btn');
if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
        if (!confirm("هل تريد استرجاع جدول المباريات الافتراضي (الدورات 14-30)؟ هذا قد يؤدي إلى تكرار البيانات إذا كانت موجودة.")) return;

        seedBtn.textContent = "جاري الاسترجاع...";
        seedBtn.disabled = true;

        const defaultSchedule = [
            { round: 14, opponent: "اتحاد المحمدية (Ittihad Mohammedia)" },
            { round: 15, opponent: "شـب الدروة (Chabab Deroua)" },
            { round: 16, opponent: "أمل سيدي رحال (Amal Sidi Rahal)" },
            { round: 17, opponent: "أمل الغرباوي (Amal Gharbaoui)" },
            { round: 18, opponent: "نادي لانوريا (Club Lanoria)" },
            { round: 19, opponent: "نهضة سطات (Nahdat Settat)" },
            { round: 20, opponent: "اتحاد بن أحمد (Ittihad Ben Ahmed)" },
            { round: 21, opponent: "الوداد البيضاوي (Wydad Casablanca)" },
            { round: 22, opponent: "أمل سيدي بنور (Amal Sidi Bennour)" },
            { round: 23, opponent: "حسنية خريبكة (Hassania Khouribga)" },
            { round: 24, opponent: "يوسفية الرباطية (Youssoufia Rabat)" },
            { round: 25, opponent: "التكوين المهني (Formation Professionnelle)" },
            { round: 26, opponent: "نسمة السطاتية (Nasma Settatia)" },
            { round: 27, opponent: "أمل نهضة زمامرة (Amal Nahdat Zemamra)" },
            { round: 28, opponent: "الرجاء البيضاوي (Raja Casablanca)" },
            { round: 29, opponent: "اتحاد المحمدية (Ittihad Mohammedia)" },
            { round: 30, opponent: "شـب الدروة (Chabab Deroua)" }
        ];

        try {
            for (const item of defaultSchedule) {
                await addDoc(collection(db, "schedule"), item);
            }
            alert("تم استرجاع البيانات بنجاح!");
            loadSchedule();
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الاسترجاع: " + error.message);
        } finally {
            seedBtn.textContent = "استرجاع البيانات الافتراضية";
            seedBtn.disabled = false;
        }
    });
}
