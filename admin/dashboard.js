import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Auth Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadMatches(); // Load data only if authorized
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = "login.html");
});

// --- State ---
let matches = [];
let editingId = null;

// --- Elements ---
const matchesTableBody = document.getElementById('matches-table-body');
const modal = document.getElementById('match-modal');
const closeModalBtn = document.querySelector('.close-modal');
const addMatchBtn = document.getElementById('add-match-btn');
const matchForm = document.getElementById('match-form');
const isFinishedSelect = document.getElementById('isFinished');
const scoresContainer = document.getElementById('scores-container');

// --- Firestore Functions ---

async function loadMatches() {
    matchesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">جاري تحميل البيانات...</td></tr>';
    try {
        const q = query(collection(db, "matches"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        matches = [];
        querySnapshot.forEach((doc) => {
            matches.push({ id: doc.id, ...doc.data() });
        });
        renderMatches();
    } catch (error) {
        console.error("Error loading matches:", error);
        matchesTableBody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">حدث خطأ أثناء الاتصال بقاعدة البيانات</td></tr>';
    }
}

async function saveMatch(e) {
    e.preventDefault();
    const btn = document.getElementById('save-match-btn');
    btn.textContent = "جاري الحفظ...";
    btn.disabled = true;

    const matchData = {
        teamHome: document.getElementById('teamHome').value,
        teamAway: document.getElementById('teamAway').value,
        date: document.getElementById('matchDate').value, // Store as ISO string
        isFinished: isFinishedSelect.value === 'true',
        scoreHome: document.getElementById('scoreHome').value || 0,
        scoreAway: document.getElementById('scoreAway').value || 0
    };

    try {
        if (editingId) {
            await updateDoc(doc(db, "matches", editingId), matchData);
        } else {
            await addDoc(collection(db, "matches"), matchData);
        }
        closeModal();
        loadMatches(); // Reload list
    } catch (error) {
        console.error("Error saving match:", error);
        alert("فشل الحفظ: " + error.message);
    } finally {
        btn.textContent = "حفظ";
        btn.disabled = false;
    }
}

async function deleteMatch(id) {
    if (!confirm('هل أنت متأكد من حذف هذه المباراة؟')) return;
    try {
        await deleteDoc(doc(db, "matches", id));
        loadMatches();
    } catch (error) {
        alert("فشل الحذف");
    }
}

// --- UI Functions ---

function renderMatches() {
    matchesTableBody.innerHTML = '';
    if (matches.length === 0) {
        matchesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد مباريات مسجلة. أضف مباراة جديدة!</td></tr>';
        return;
    }

    matches.forEach(match => {
        const row = document.createElement('tr');
        const dateObj = new Date(match.date);
        const dateStr = dateObj.toLocaleDateString('ar-MA') + ' ' + dateObj.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });

        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${match.teamHome}</td>
            <td style="direction: ltr; font-weight:bold;">
                ${match.isFinished ? `${match.scoreHome} - ${match.scoreAway}` : '<span style="color:orange">قادمة</span>'}
            </td>
            <td>${match.teamAway}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="window.editMatch('${match.id}')">تعديل</button>
                <button class="btn-delete" onclick="window.deleteMatch('${match.id}')">حذف</button>
            </td>
        `;
        matchesTableBody.appendChild(row);
    });
}

function openModal(match = null) {
    modal.classList.remove('hidden');
    if (match) {
        editingId = match.id;
        document.getElementById('modal-title').textContent = "تعديل المباراة";
        document.getElementById('teamHome').value = match.teamHome;
        document.getElementById('teamAway').value = match.teamAway;
        document.getElementById('matchDate').value = match.date;
        isFinishedSelect.value = match.isFinished.toString();
        document.getElementById('scoreHome').value = match.scoreHome;
        document.getElementById('scoreAway').value = match.scoreAway;
    } else {
        editingId = null;
        document.getElementById('modal-title').textContent = "إضافة مباراة جديدة";
        matchForm.reset();
        isFinishedSelect.value = "false";
    }
    toggleScores();
}

function closeModal() {
    modal.classList.add('hidden');
}

function toggleScores() {
    if (isFinishedSelect.value === 'true') {
        scoresContainer.classList.remove('hidden');
    } else {
        scoresContainer.classList.add('hidden');
    }
}

// --- Event Listeners ---
addMatchBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
matchForm.addEventListener('submit', saveMatch);
isFinishedSelect.addEventListener('change', toggleScores);

// Expose functions to window for onclick events in HTML
window.editMatch = (id) => {
    const match = matches.find(m => m.id === id);
    openModal(match);
};
window.deleteMatch = (id) => deleteMatch(id);
