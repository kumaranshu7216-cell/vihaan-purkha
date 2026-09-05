const firebaseConfig = {
    apiKey: "AIzaSyA0bnCrIDTPracgy-qFvfXlXu7Im5RNGj0",
    authDomain: "vihaan-purkha.firebaseapp.com",
    projectId: "vihaan-purkha",
    storageBucket: "vihaan-purkha.firebasestorage.app",
    messagingSenderId: "1033538607939",
    appId: "1:1033538607939:web:b341070cc12e6708716df6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const synth = window.speechSynthesis;
const audioStatus = document.getElementById("audioStatus");
let cloudData = {};
let pannellumViewer = null;

// बाबा गरीबनाथ जी का डिफ़ॉल्ट हेरिटेज फोटो (ताजमहल हटा दिया गया है)
const templeFallback = "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80";

function listenToCloudData() {
    db.collection("places").onSnapshot((snapshot) => {
        cloudData = {};
        snapshot.forEach((doc) => {
            cloudData[doc.id] = doc.data();
        });
        renderCards();
    }, (error) => {
        console.error("Firebase read error:", error);
    });
}

function renderCards(searchText = "", filterCategory = "सभी") {
    const cardList = document.getElementById("dynamicCardList");
    if (!cardList) return;
    cardList.innerHTML = ""; 

    let count = 0;

    for (const key in cloudData) {
        const place = cloudData[key];
        
        if (filterCategory !== "सभी" && place.category !== filterCategory) continue;
        if (searchText && !place.name.toLowerCase().includes(searchText.toLowerCase())) continue;

        count++;
        const displayImage = place.imageUrl ? place.imageUrl : templeFallback;
        const locationText = place.village ? `${place.village}, ${place.district || 'मुजफ्फरपुर'}` : (place.district || "मुजफ्फरपुर, बिहार");

        const cardHTML = `
            <div class="card">
                <div class="card-img-wrapper" onclick="open360View('${key}')">
                    <img src="${displayImage}" alt="${place.name}" loading="lazy">
                    <div class="view-360-btn">🔄 360° दर्शन</div>
                    <div class="badge-overlay">🏆 ${place.xp || "50 XP"}</div>
                    <div class="location-chip">📍 ${locationText}</div>
                </div>
                <div class="card-content">
                    <h3>${place.name}</h3>
                    <p class="tag">${place.category} • <span style="color:#d35400; font-weight:600;">✍️ ${place.adminId || '@spidey_ahamiyat'}</span></p>
                    <div class="card-actions">
                        <button class="ai-btn" onclick="startAIGuide('${key}')">🎧 AI गाइड सुनें</button>
                        <button class="nav-btn" onclick="open360View('${key}')">🔄 360° व्यू</button>
                    </div>
                </div>
            </div>
        `;
        cardList.innerHTML += cardHTML;
    }

    if (count === 0) {
        cardList.innerHTML = "<p style='text-align:center; color:#94a3b8; margin: 40px 0;'>कोई स्थल नहीं मिला...</p>";
    }
}

// 360° पैनोरमा व्यू ओपन करने का फंक्शन
function open360View(placeId) {
    const place = cloudData[placeId];
    if (!place) return;

    const imgUrl = place.imageUrl ? place.imageUrl : templeFallback;
    document.getElementById("panoTitle").innerText = `${place.name} (360° व्यू)`;
    document.getElementById("panoModal").style.display = "flex";

    // पुराना व्यूअर साफ़ करके नया 360 व्यू लोड करना
    document.getElementById("panorama-container").innerHTML = "";

    try {
        pannellumViewer = pannellum.viewer('panorama-container', {
            "type": "equirectangular",
            "panorama": imgUrl,
            "autoLoad": true,
            "autoRotate": -2,
            "compass": true
        });
    } catch (err) {
        console.log("360 Load Note: ", err);
    }
}

function close360View() {
    document.getElementById("panoModal").style.display = "none";
    if (pannellumViewer) {
        try { pannellumViewer.destroy(); } catch(e){}
    }
}

function showSection(sectionName) {
    const home = document.getElementById("homeSection");
    const map = document.getElementById("mapSection");
    const badges = document.getElementById("badgesSection");

    home.style.display = "none";
    map.style.display = "none";
    badges.style.display = "none";

    if (sectionName === 'home') home.style.display = "block";
    else if (sectionName === 'map') map.style.display = "block";
    else if (sectionName === 'badges') badges.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    listenToCloudData();

    const searchBar = document.querySelector(".search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            renderCards(e.target.value, document.querySelector(".cat-btn.active")?.innerText || "सभी");
        });
    }

    const catBtns = document.querySelectorAll(".cat-btn");
    catBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            catBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            const currentSearch = document.querySelector(".search-bar").value;
            renderCards(currentSearch, e.target.innerText);
        });
    });

    document.getElementById("navHome")?.addEventListener("click", () => showSection('home'));
    document.getElementById("navMap")?.addEventListener("click", () => showSection('map'));
    document.getElementById("navBadges")?.addEventListener("click", () => showSection('badges'));
});

// AI आवाज़
function startAIGuide(placeId) {
    if (!synth) return;
    synth.cancel();

    const place = cloudData[placeId];
    if (!place || !place.story) return;

    const selectedLang = document.getElementById("guideLanguage")?.value || "hi-IN";
    let textToSpeak = place.story;

    if (selectedLang === "bho-IN") {
        textToSpeak = "प्रणाम! ई बा " + place.name + " के इतिहास। " + place.story;
    }

    if (audioStatus) audioStatus.style.display = "block";

    const utterThis = new SpeechSynthesisUtterance(textToSpeak);
    utterThis.rate = 0.88;

    const voices = synth.getVoices();

    if (selectedLang === "en-IN") {
        const enVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-GB"));
        if (enVoice) utterThis.voice = enVoice;
        utterThis.lang = "en-IN";
    } else {
        const hindiVoice = voices.find(v => 
            v.lang.toLowerCase().includes("hi") || 
            v.name.toLowerCase().includes("hindi") || 
            v.name.toLowerCase().includes("swara") || 
            v.name.toLowerCase().includes("madhur")
        );
        if (hindiVoice) utterThis.voice = hindiVoice;
        utterThis.lang = "hi-IN";
    }

    utterThis.onend = () => { if (audioStatus) audioStatus.style.display = "none"; };
    utterThis.onerror = () => { if (audioStatus) audioStatus.style.display = "none"; };

    synth.resume();
    synth.speak(utterThis);
}