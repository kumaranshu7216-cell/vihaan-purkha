const synth = window.speechSynthesis;
const audioStatus = document.getElementById("audioStatus");

function loadDynamicData() {
    let savedData = JSON.parse(localStorage.getItem("vihaanData"));
    if (!savedData || Object.keys(savedData).length === 0) {
        savedData = {
            "garibnath": { adminId: "विहान टीम", name: "बाबा गरीबनाथ मंदिर", category: "धार्मिक स्थल", story: "विहान पुरखा में आपका स्वागत है। बाबा गरीबनाथ मंदिर मुजफ्फरपुर का सबसे प्राचीन शिव मंदिर है।", xp: "50 XP बैज" },
            "sutapatti": { adminId: "विहान टीम", name: "सुतापट्टी लहठी कला", category: "लोकल इकॉनमी", story: "सुतापट्टी की लहठी पूरे भारत में मशहूर है। यहाँ के स्थानीय कारीगर पीढ़ियों से लाह की खूबसूरत चूड़ियाँ बना रहे हैं।", xp: "100 XP बैज" }
        };
        localStorage.setItem("vihaanData", JSON.stringify(savedData));
    }
    return savedData;
}

function renderCards(searchText = "", filterCategory = "सभी") {
    const data = loadDynamicData();
    const cardList = document.getElementById("dynamicCardList");
    if (!cardList) return;
    cardList.innerHTML = ""; 

    for (const key in data) {
        const place = data[key];
        
        if (filterCategory !== "सभी" && place.category !== filterCategory) continue;
        if (searchText && !place.name.includes(searchText)) continue;

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

    if(cardList.innerHTML === "") {
        cardList.innerHTML = "<p style='text-align:center; color:red; margin-top:20px;'>डेटा नहीं मिला!</p>";
    }
}

// टैब बदलने का लॉजिक (होम, मैप, बैजेज)
function showSection(sectionName) {
    const home = document.getElementById("homeSection");
    const map = document.getElementById("mapSection");
    const badges = document.getElementById("badgesSection");

    home.style.display = "none";
    map.style.display = "none";
    badges.style.display = "none";

    if (sectionName === 'home') {
        home.style.display = "block";
    } else if (sectionName === 'map') {
        map.style.display = "block";
    } else if (sectionName === 'badges') {
        badges.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCards();

    // सर्च बार इवेंट
    const searchBar = document.querySelector(".search-bar");
    if(searchBar) {
        searchBar.addEventListener("input", (e) => {
            renderCards(e.target.value, document.querySelector(".cat-btn.active")?.innerText || "सभी");
        });
    }

    // कैटेगरी बटन्स
    const catBtns = document.querySelectorAll(".cat-btn");
    catBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            catBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            const currentSearch = document.querySelector(".search-bar").value;
            renderCards(currentSearch, e.target.innerText);
        });
    });

    // नीचे के बॉटम नेविगेशन बटन्स
    document.getElementById("navHome")?.addEventListener("click", () => showSection('home'));
    document.getElementById("navMap")?.addEventListener("click", () => showSection('map'));
    document.getElementById("navBadges")?.addEventListener("click", () => showSection('badges'));
});

// AI ऑडियो
let voices = [];
function loadVoices() { voices = synth.getVoices(); }
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = loadVoices; }

function startAIGuide(placeId) {
    if (synth.speaking) synth.cancel();
    const data = loadDynamicData();
    const textToSpeak = data[placeId]?.story;
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