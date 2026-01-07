// Translations
const translations = {
    ar: {
        pageTitle: "النادي الرياضي النواصر أولاد صالح | C.S.N.O.S",
        navHome: "الرئيسية",
        navAbout: "عن النادي",
        navSquad: "الفريق",
        navMatches: "المباريات",
        navGallery: "معرض الصور",
        navNews: "الأخبار",
        navGallery: "معرض الصور",
        navContact: "اتصل بنا",
        heroTitle: "النادي الرياضي النواصر أولاد صالح",
        heroSubtitle: "NOUACEUR CLUB ATHLETIC",
        heroMotto: "شغف. مجد. انتصار.",
        btnMatches: "مركز المباريات",
        btnHistory: "تاريخنا",
        aboutHeader: "إرثنا",
        newsHeader: "آخر الأخبار",
        loadMoreNews: "المزيد من الأخبار",
        aboutSubHeader: "نمثل النواصر منذ 2025",
        aboutText1: "النادي الرياضي النواصر أولاد صالح هو أكثر من مجرد فريق كرة قدم؛ إنه رمز للمجتمع، الصمود، والتميز الرياضي. تأسسنا لنجلب المجد للمنطقة، ونحن ملتزمون بتطوير المواهب والمنافسة في أعلى المستويات.",
        aboutText2: "تحت شعار <strong>#DIMACSNOS</strong>، نسير قدماً في موسم 2025-2026 بعزيمة وطموح متجددين.",
        squadHeader: "الفريق",
        roleCaptain: "الكابتن",
        posMidfielder: "وسط ميدان",
        roleStriker: "الهداف",
        posForward: "مهاجم",
        roleGoalkeeper: "حارس المرمى",
        posGoalkeeper: "حارس مرمى",
        roleDefender: "المدافع",
        posCenterBack: "قلب دفاع",
        galleryHeader: "معرض الصور",
        footerAddress: "النواصر، الدار البيضاء، المغرب",
        footerCopyright: "&copy; 2026 النادي الرياضي النواصر أولاد صالح. جميع الحقوق محفوظة."
    },
    fr: {
        pageTitle: "Nouaceur Club Athletic | C.S.N.O.S",
        navHome: "Accueil",
        navAbout: "À propos",
        navSquad: "Effectif",
        navMatches: "Matchs",
        navNews: "Actualités",
        navGallery: "Galerie",
        navContact: "Contact",
        heroTitle: "NOUACEUR CLUB ATHLETIC",
        heroSubtitle: "النادي الرياضي النواصر أولاد صالح",
        heroMotto: "PASSION. GLOIRE. VICTOIRE.",
        btnMatches: "Centre de Match",
        btnHistory: "Notre Histoire",
        aboutHeader: "Notre Héritage",
        newsHeader: "Dernières Actualités",
        loadMoreNews: "Plus d'Actualités",
        aboutSubHeader: "Représentant Nouaceur depuis 2025",
        aboutText1: "Le Nouaceur Club Athletic est plus qu'une simple équipe de football; c'est un symbole de communauté, de résilience et d'excellence sportive. Fondé pour apporter la gloire à la région, nous nous engageons à développer les talents et à rivaliser aux plus hauts niveaux.",
        aboutText2: "Sous la bannière de <strong>#DIMACSNOS</strong>, nous avançons vers la saison 2025-2026 avec une vigueur et une ambition renouvelées.",
        squadHeader: "L'Effectif",
        roleCaptain: "Capitaine",
        posMidfielder: "Milieu de Terrain",
        roleStriker: "Buteur",
        posForward: "Attaquant",
        roleGoalkeeper: "Gardien de But",
        posGoalkeeper: "Gardien",
        roleDefender: "Défenseur",
        posCenterBack: "Défenseur Central",
        galleryHeader: "Galerie Photos",
        footerAddress: "Nouaceur, Casablanca, Maroc",
        footerCopyright: "&copy; 2026 Nouaceur Club Athletic. Tous droits réservés."
    }
};

// Language Handling
const langSwitchBtn = document.getElementById('lang-switch');
let currentLang = 'ar'; // Default

function updateContent(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Check if content has HTML tags (like strong)
            if (translations[lang][key].includes('<')) {
                el.innerHTML = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // Update Direction and Font
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        document.body.style.fontFamily = "'Cairo', sans-serif";
        langSwitchBtn.textContent = 'FR';
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'fr');
        document.body.style.fontFamily = "'Montserrat', sans-serif";
        langSwitchBtn.textContent = 'AR';
    }
}

langSwitchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentLang = currentLang === 'ar' ? 'fr' : 'ar';
    updateContent(currentLang);
});

// Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links li a").forEach(n => n.addEventListener("click", () => {
    if (n.id !== 'lang-switch') { // Don't close menu if clicking lang switch on mobile might differ, but safe to close usually
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
    }
}));

// Sticky Navbar Background
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    } else {
        navbar.style.boxShadow = "none";
    }
});

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('loaded');
});

// Failsafe: Force remove preloader after 3 seconds if something gets stuck
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('loaded')) {
        preloader.classList.add('loaded');
    }
}, 3000);

// Scroll Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-on-scroll');
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden-on-scroll');
hiddenElements.forEach(el => observer.observe(el));

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Initial Theme Check
// Default to Light unless explicitly set to Dark
if (storedTheme === 'dark') {
    setTheme('dark');
} else {
    setTheme('light');
}

themeToggle.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent jump if it was a link, though it's a button now
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// --- Firebase Integration ---
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

async function fetchAndRenderMatches() {
    const matchesList = document.getElementById('matches-list');

    try {
        const q = query(collection(db, "matches"), orderBy("date", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            matchesList.innerHTML = '<p style="text-align:center;">لا توجد مباريات لعرضها.</p>';
            return;
        }

        matchesList.innerHTML = ''; // Clear loading state

        querySnapshot.forEach((doc) => {
            const match = doc.data();
            const dateObj = new Date(match.date);
            const dateStr = dateObj.toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });

            const matchHTML = `
                <div class="match-item shadow hidden-on-scroll show-on-scroll">
                    <div class="match-date-box">
                        <span class="m-date">${dateStr}</span>
                        <span class="m-time">${timeStr}</span>
                        <img src="assets/logo_final.jpg" class="league-logo-small" alt="League">
                    </div>
                    <div class="match-teams">
                        <div class="team home">
                            <span class="team-name">${match.teamHome}</span>
                            <div class="team-logo-placeholder" style="background-color: #0033A0;">${match.teamHome.charAt(0)}</div>
                        </div>
                        <div class="match-score">
                            <span class="score">${match.isFinished ? match.scoreHome : '-'}</span>
                            <span class="divider">-</span>
                            <span class="score">${match.isFinished ? match.scoreAway : '-'}</span>
                        </div>
                        <div class="team away">
                            <div class="team-logo-placeholder" style="background-color: #333;">${match.teamAway.charAt(0)}</div>
                            <span class="team-name">${match.teamAway}</span>
                        </div>
                    </div>
                </div>
            `;
            matchesList.insertAdjacentHTML('beforeend', matchHTML);
        });

    } catch (error) {
        console.error("Error fetching matches:", error);
        matchesList.innerHTML = '<p style="text-align:center; color:red;">فشل تحميل المباريات. تأكد من الاتصال بالإنترنت.</p>';
    }
}

// Fetch matches after page load
window.addEventListener('load', fetchAndRenderMatches);

// --- News Logic ---
async function fetchAndRenderNews() {
    const newsGrid = document.getElementById('news-grid');
    const loadMoreBtn = document.getElementById('load-more-news');

    try {
        const q = query(collection(db, "news"), orderBy("date", "desc"), limit(6));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            newsGrid.innerHTML = '<p style="text-align:center; width:100%;">لا توجد أخبار حالياً.</p>';
            return;
        }

        newsGrid.innerHTML = ''; // Clear loading

        querySnapshot.forEach((doc) => {
            const newsItem = doc.data();
            const dateObj = new Date(newsItem.date);
            const dateStr = dateObj.toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' });

            // Truncate content for excerpt
            const excerpt = newsItem.content.length > 100 ? newsItem.content.substring(0, 100) + '...' : newsItem.content;

            // Fallback image if none provided
            const imageUrl = newsItem.image || 'assets/logo_final.jpg';
            const imageStyle = newsItem.image ? '' : 'object-fit: contain; padding: 20px;'; // Better look for logo

            const newsCard = `
                <div class="news-card hidden-on-scroll show-on-scroll" onclick="window.openNewsModal('${doc.id}')" style="cursor: pointer;">
                    <img src="${imageUrl}" class="news-image" alt="${newsItem.title}" style="${imageStyle}" loading="lazy">
                    <div class="news-content">
                        <span class="news-date">${dateStr}</span>
                        <h3 class="news-title">${newsItem.title}</h3>
                        <p class="news-excerpt">${excerpt}</p>
                        <span class="read-more-btn">اقرأ المزيد &larr;</span>
                    </div>
                </div>
            `;
            newsGrid.insertAdjacentHTML('beforeend', newsCard);
        });

        // Re-apply scroll observer to new elements
        const newElements = document.querySelectorAll('.news-card');
        newElements.forEach(el => observer.observe(el));


    } catch (error) {
        console.error("Error fetching news:", error);
        newsGrid.innerHTML = '<p style="text-align:center; color:red;">فشل تحميل الأخبار.</p>';
    }
}

// --- News Modal Logic ---
let currentNewsItem = null;

window.openNewsModal = async (id) => {
    // We already likely have the data, but for simplicity let's find it in the cached 'news' if possible, or re-fetch.
    // OPTIMIZATION: We didn't store news globally in script.js, so we'll just quickly fetch the single doc or store it.
    // Let's just fetch it again for simplicity, or we can improve `fetchAndRenderNews` to store in a global array.
    // Given the request, let's just fetch the single doc to be safe and simple.

    // Better yet, to avoid delay, pass the data? No, IDs are safer.
    // Actually, `fetchAndRenderNews` is not storing data globally. Let's do a quick fetch.
    const fromCache = document.getElementById('news-grid').querySelector(`[onclick*="${id}"]`);
    // Wait, retrieving from DOM is hacky. Let's just use getDoc.

    // Importing getDoc
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");

    const docRef = doc(db, "news", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const item = docSnap.data();
        currentNewsItem = item;
        const dateObj = new Date(item.date);
        const dateStr = dateObj.toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' });
        const imageUrl = item.image || 'assets/logo_final.jpg';

        const modalBody = document.getElementById('news-modal-body');
        modalBody.innerHTML = `
            <img src="${imageUrl}" style="${item.image ? '' : 'object-fit:contain; background:#333; padding:20px;'}" crossorigin="anonymous">
            <h2 id="modal-news-title">${item.title}</h2>
            <span class="meta-date">${dateStr}</span>
            <p>${item.content}</p>
        `;

        document.getElementById('news-modal').classList.remove('hidden');
    }
};

// Close Modal
document.querySelector('.close-news-modal').onclick = () => {
    document.getElementById('news-modal').classList.add('hidden');
};

window.addEventListener('load', fetchAndRenderNews);
