// Translations
const translations = {
    ar: {
        pageTitle: "النادي الرياضي النواصر أولاد صالح | C.S.N.O.S",
        navHome: "الرئيسية",
        navAbout: "عن النادي",
        navSquad: "الفريق",
        navMatches: "المباريات",
        navGallery: "معرض الصور",
        navContact: "اتصل بنا",
        heroTitle: "النادي الرياضي النواصر أولاد صالح",
        heroSubtitle: "NOUACEUR CLUB ATHLETIC",
        heroMotto: "شغف. مجد. انتصار.",
        btnMatches: "مركز المباريات",
        btnHistory: "تاريخنا",
        aboutHeader: "إرثنا",
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
        navGallery: "Galerie",
        navContact: "Contact",
        heroTitle: "NOUACEUR CLUB ATHLETIC",
        heroSubtitle: "النادي الرياضي النواصر أولاد صالح",
        heroMotto: "PASSION. GLOIRE. VICTOIRE.",
        btnMatches: "Centre de Match",
        btnHistory: "Notre Histoire",
        aboutHeader: "Notre Héritage",
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
