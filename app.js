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
        cardList.innerHTML = "<p style='text-align:center; color:#777; margin-top:30px;'>डेटा लोड हो रहा है या कोई डेटा मौजूद नहीं है...</p>";
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

// AI आवाज़ (Edge और Chrome दोनों के लिए सपोर्ट)
function startAIGuide(placeId) {
    if (!synth) {
        alert("आपका ब्राउज़र वॉइस सपोर्ट नहीं करता।");
        return;
    }

    // अगर पहले से कुछ बोल रहा हो या अटका हो तो रोकें
    synth.cancel();

    const textToSpeak = cloudData[placeId]?.story;
    if (!textToSpeak) return;

    if (audioStatus) audioStatus.style.display = "block";

    const utterThis = new SpeechSynthesisUtterance(textToSpeak);
    utterThis.rate = 0.9;
    utterThis.pitch = 1.0;

    // Edge और Chrome की सभी आवाज़ें फेच करना
    const availableVoices = synth.getVoices();
    
    // हिंदी आवाज़ ढूंढने का सुरक्षित तरीका (Edge और Chrome दोनों के लिए)
    const hindiVoice = availableVoices.find(voice => 
        voice.lang.toLowerCase().includes('hi') || 
        voice.name.toLowerCase().includes('hindi') || 
        voice.name.toLowerCase().includes('swara') ||
        voice.name.toLowerCase().includes('madhur')
    );

    if (hindiVoice) {
        utterThis.voice = hindiVoice;
    } else {
        utterThis.lang = 'hi-IN';
    }

    utterThis.onend = () => { 
        if (audioStatus) audioStatus.style.display = "none"; 
    };

    utterThis.onerror = (e) => { 
        console.error("SpeechSynthesis Error:", e);
        if (audioStatus) audioStatus.style.display = "none"; 
    };

    // Edge में speechSynthesis कई बार पॉज हो जाता है, resume() इसे चालू रखता है
    synth.resume();
    synth.speak(utterThis);
}