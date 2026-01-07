import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// --- Auth & Navigation ---

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";
    else {
        loadMatches();
        loadSquad();
        loadNews();
        switchView('matches'); // Initialize UI state
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = "login.html");
});

const views = {
    matches: document.getElementById('matches-view'),
    squad: document.getElementById('squad-view'),
    news: document.getElementById('news-view')
};
const navLinks = {
    matches: document.getElementById('nav-matches'),
    squad: document.getElementById('nav-squad'),
    news: document.getElementById('nav-news')
};
const pageTitle = document.getElementById('page-title');
const addBtn = document.getElementById('add-match-btn'); // reusing ID, changing text

// Set initial click handler for the default view (matches)
addBtn.onclick = () => openModal('match');

function switchView(viewName) {
    Object.keys(views).forEach(key => {
        views[key].classList.add('hidden');
        navLinks[key].classList.remove('active');
    });
    views[viewName].classList.remove('hidden');
    navLinks[viewName].classList.add('active');

    // Update Title & Button
    if (viewName === 'matches') {
        pageTitle.textContent = "إدارة المباريات";
        addBtn.textContent = "+ إضافة مباراة";
        addBtn.onclick = () => openModal('match');
    } else if (viewName === 'squad') {
        pageTitle.textContent = "إدارة الفريق";
        addBtn.textContent = "+ إضافة لاعب";
        addBtn.onclick = () => openModal('player');
    } else if (viewName === 'news') {
        pageTitle.textContent = "إدارة الأخبار";
        addBtn.textContent = "+ إضافة خبر";
        addBtn.onclick = () => openModal('news');
    }
}

navLinks.matches.addEventListener('click', () => switchView('matches'));
navLinks.squad.addEventListener('click', () => switchView('squad'));
navLinks.news.addEventListener('click', () => switchView('news'));

// --- Data State ---
let matches = [];
let squad = [];
let news = [];
let editingId = null;
let currentType = 'match'; // 'match', 'player', 'news'

// --- Matches Logic (Existing) ---
async function loadMatches() {
    const tbody = document.getElementById('matches-table-body');
    tbody.innerHTML = '<tr><td colspan="5">جاري التحميل...</td></tr>';
    const q = query(collection(db, "matches"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    matches = [];
    snap.forEach(d => matches.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    matches.forEach((m) => {
        const row = document.createElement('tr');
        const d = new Date(m.date);
        row.innerHTML = `
            <td>${d.toLocaleDateString('ar-MA')}</td>
            <td>${m.teamHome}</td>
            <td>${m.isFinished ? m.scoreHome + '-' + m.scoreAway : 'قادمة'}</td>
            <td>${m.teamAway}</td>
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
    // tbody.innerHTML = '<tr><td colspan="5">جاري التحميل...</td></tr>';
    const snap = await getDocs(collection(db, "squad"));
    squad = [];
    snap.forEach(d => squad.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    squad.forEach((p) => {
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
    const snap = await getDocs(collection(db, "news"));
    news = [];
    snap.forEach(d => news.push({ id: d.id, ...d.data() }));

    tbody.innerHTML = '';
    news.forEach((n) => {
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


// --- Generic Modal & CRUD ---
const modal = document.getElementById('match-modal'); // We'll reuse this modal container
const closeModalBtn = document.querySelector('.close-modal');
const form = document.getElementById('match-form');

// We need to dynamically change form fields based on type
function openModal(type, item = null) {
    currentType = type;
    modal.classList.remove('hidden');
    editingId = item ? item.id : null;

    const container = document.getElementById('match-form'); // Actually the form itself
    container.innerHTML = `<input type="hidden" id="match-id">`; // Reset fields

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn-login';
    saveBtn.textContent = 'حفظ';
    saveBtn.id = 'save-btn';

    if (type === 'match') {
        document.getElementById('modal-title').textContent = item ? "تعديل مباراة" : "إضافة مباراة";
        container.insertAdjacentHTML('beforeend', `
            <div class="form-row">
                <div class="form-group half"><label>الفريق المضيف</label><input type="text" id="teamHome" required value="${item?.teamHome || ''}"></div>
                <div class="form-group half"><label>الفريق الضيف</label><input type="text" id="teamAway" required value="${item?.teamAway || ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group half"><label>التاريخ</label><input type="datetime-local" id="matchDate" required value="${item?.date || ''}"></div>
                <div class="form-group half"><label>الحالة</label><select id="isFinished"><option value="false">قادمة</option><option value="true">انتهت</option></select></div>
            </div>
            <div class="form-row" id="scores-container" style="${item?.isFinished ? '' : 'display:none'}">
                <div class="form-group half"><label>Home Score</label><input type="number" id="scoreHome" value="${item?.scoreHome || 0}"></div>
                <div class="form-group half"><label>Away Score</label><input type="number" id="scoreAway" value="${item?.scoreAway || 0}"></div>
            </div>
        `);
        if (item) document.getElementById('isFinished').value = item.isFinished.toString();

    } else if (type === 'player') {
        document.getElementById('modal-title').textContent = item ? "تعديل لاعب" : "إضافة لاعب";
        container.insertAdjacentHTML('beforeend', `
            <div class="form-group"><label>الاسم الكامل</label><input type="text" id="pName" required value="${item?.name || ''}"></div>
            <div class="form-row">
                <div class="form-group half"><label>الرقم</label><input type="number" id="pNumber" required value="${item?.number || ''}"></div>
                <div class="form-group half"><label>الدور (Role)</label><input type="text" id="pRole" placeholder="Captain/Player" value="${item?.role || 'Player'}"></div>
            </div>
            <div class="form-group"><label>المركز (Position)</label><input type="text" id="pPos" required value="${item?.position || ''}"></div>
         `);

    } else if (type === 'news') {
        document.getElementById('modal-title').textContent = item ? "تعديل خبر" : "إضافة خبر";

        let imgPreview = '';
        if (item?.image) {
            imgPreview = `<img src="${item.image}" style="width: 100%; max-height: 150px; object-fit: contain; margin-top: 10px; border-radius: 5px;">`;
        }

        container.insertAdjacentHTML('beforeend', `
            <div class="form-group"><label>العنوان</label><input type="text" id="nTitle" required value="${item?.title || ''}"></div>
            <div class="form-group">
                <label>صورة الخبر (Maximum 1MB)</label>
                <input type="file" id="nImageFile" accept="image/*">
                <input type="hidden" id="nImageBase64" value=""> <!-- Stores existing or new base64 -->
                <div id="image-preview">${imgPreview}</div>
            </div>
            <div class="form-group"><label>المحتوى</label><textarea id="nContent" rows="4" style="width:100%">${item?.content || ''}</textarea></div>
            <div class="form-group"><label>التاريخ</label><input type="date" id="nDate" required value="${item?.date || ''}"></div>
         `);

        // If editing, keep old image in hidden field
        if (item?.image) {
            document.getElementById('nImageBase64').value = item.image;
        }

        // Handle file selection
        document.getElementById('nImageFile').onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const base64 = await compressImage(file);
                    document.getElementById('nImageBase64').value = base64;
                    document.getElementById('image-preview').innerHTML = `<img src="${base64}" style="width: 100%; max-height: 150px; object-fit: contain; margin-top: 10px; border-radius: 5px;">`;
                } catch (err) {
                    alert("فشل ضغط الصورة: " + err.message);
                }
            }
        };
    }

    container.appendChild(saveBtn);

    // Re-attach event for match score toggle if match
    if (type === 'match') {
        document.getElementById('isFinished').onchange = (e) => {
            document.getElementById('scores-container').style.display = e.target.value === 'true' ? 'flex' : 'none';
        }
    }
}

// Utility: Compress Image to Base64
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const maxWidth = 800;
        const maxHeight = 800;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    btn.textContent = 'جاري الحفظ...'; btn.disabled = true;

    try {
        let collectionName = '';
        let data = {};

        if (currentType === 'match') {
            collectionName = 'matches';
            data = {
                teamHome: document.getElementById('teamHome').value,
                teamAway: document.getElementById('teamAway').value,
                date: document.getElementById('matchDate').value,
                isFinished: document.getElementById('isFinished').value === 'true',
                scoreHome: document.getElementById('scoreHome').value,
                scoreAway: document.getElementById('scoreAway').value
            };
        } else if (currentType === 'player') {
            collectionName = 'squad';
            data = {
                name: document.getElementById('pName').value,
                number: document.getElementById('pNumber').value,
                role: document.getElementById('pRole').value,
                position: document.getElementById('pPos').value
            };
        } else if (currentType === 'news') {
            collectionName = 'news';
            data = {
                title: document.getElementById('nTitle').value,
                content: document.getElementById('nContent').value,
                date: document.getElementById('nDate').value,
                image: document.getElementById('nImageBase64').value
            };
        }

        if (editingId) {
            await updateDoc(doc(db, collectionName, editingId), data);
        } else {
            await addDoc(collection(db, collectionName), data);
        }

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

closeModalBtn.onclick = () => modal.classList.add('hidden');

// Globals
window.openModal = openModal; // Expose for HTML onclick
window.editItem = (type, id) => {
    let item;
    if (type === 'match') item = matches.find(m => m.id === id);
    else if (type === 'player') item = squad.find(s => s.id === id);
    else if (type === 'news') item = news.find(n => n.id === id);
    openModal(type, item);
};

window.deleteItem = async (col, id) => {
    if (!confirm('حذف؟')) return;
    await deleteDoc(doc(db, col, id));
    if (col === 'matches') loadMatches();
    else if (col === 'squad') loadSquad();
    else loadNews();
};
