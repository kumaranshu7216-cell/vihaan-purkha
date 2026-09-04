// आपकी Firebase Config
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

// Firestore से रियलटाइम डेटा सिंक
function listenToCloudData() {
    db.collection("places").onSnapshot((snapshot) => {
        cloudData = {};
        snapshot.forEach((doc) => {
            cloudData[doc.id] = doc.data();
        });
        renderCards();
    }, (error) => {
        console.error("Firebase read error: ", error);
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
        const author = place.adminId ? place.adminId : "अज्ञात";

        const cardHTML = `
            <div class="card">
                <div class="card-img" style="background-color: #ffcc80;">
                    (${place.name} 360° व्यू)
                </div>
                <div class="card-content">
                    <h3>${place.name}</h3>
                    <p class="tag">${place.category} • ${place.xp || "50 XP बैज"} <br><span style="color:#1a73e8; font-size: 0.85em;">✍️ Contributor: ${author}</span></p>
                    <button class="ai-btn" onclick="startAIGuide('${key}')">🎧 AI गाइड सुनें</button>
                    <button class="nav-btn" onclick="showSection('map')">📍 नेविगेट</button>
                </div>
            </div>
        `;
        cardList.innerHTML += cardHTML;
    }

    if (count === 0) {
        cardList.innerHTML = "<p style='text-align:center; color:#777; margin-top:30px;'>कोई डेटा नहीं मिला या क्लाउड से लोड हो रहा है...</p>";
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

// AI आवाज़ (Hindi)
let voices = [];
function loadVoices() { voices = synth.getVoices(); }
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = loadVoices; }

function startAIGuide(placeId) {
    if (synth.speaking) synth.cancel();
    const textToSpeak = cloudData[placeId]?.story;
    if (!textToSpeak) return;

    audioStatus.style.display = "block";
    const utterThis = new SpeechSynthesisUtterance(textToSpeak);
    const hindiVoice = voices.find(voice => voice.lang === 'hi-IN' || voice.lang === 'hi-in');
    if (hindiVoice) utterThis.voice = hindiVoice;
    else utterThis.lang = 'hi-IN';
    
    utterThis.rate = 0.9;
    utterThis.onend = () => { audioStatus.style.display = "none"; };
    utterThis.onerror = () => { audioStatus.style.display = "none"; };
    synth.speak(utterThis);
}