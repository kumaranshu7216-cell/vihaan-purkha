// Firebase Config
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
let pannellumViewer = null;

// राज्य और ज़िलों की लिस्ट
const stateDistricts = {
    "Bihar": ["Muzaffarpur", "Patna", "Gaya", "Darbhanga", "Bhagalpur", "Vaishali"],
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
    "Uttar Pradesh": ["Varanasi", "Ayodhya", "Lucknow", "Agra", "Mathura"]
};

// डिफ़ॉल्ट रूप से मुजफ्फरपुर, बिहार सेट रहेगा ताकि कभी खाली स्क्रीन न दिखे
let selectedState = localStorage.getItem("vp_state") || "Bihar";
let selectedDistrict = localStorage.getItem("vp_district") || "Muzaffarpur";

// ================= समृद्ध बैकअप डेटा =================
const defaultPlaces = {
    "garibnath_mandir": {
        name: "बाबा गरीबनाथ मंदिर",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "पुरानी बाज़ार",
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80",
        story: "बाबा गरीबनाथ मंदिर मुजफ्फरपुर का हृदय है, जिसे बिहार का देवघर भी कहा जाता है। सावन के पावन महीने में यहाँ लाखों श्रद्धालु जलाभिषेक करने आते हैं।",
        adminId: "@spidey_ahamiyat",
        xp: "50 XP"
    },
    "khudiram_bose_smarak": {
        name: "शहीद खुदीराम बोस स्मारक",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "कंपनी बाग",
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1000&auto=format&fit=crop&q=80",
        story: "यह स्थल भारत के सबसे युवा अमर क्रांतिकारी शहीद खुदीराम बोस की शहादत का प्रतीक है, जिन्हें 1908 में मात्र 18 वर्ष की आयु में मुजफ्फरपुर जेल में फांसी दी गई थी।",
        adminId: "@spidey_ahamiyat",
        xp: "60 XP"
    },
    "ls_college": {
        name: "लंगट सिंह कॉलेज (LS College)",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "कलमबाग रोड",
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80",
        story: "1899 में स्थापित लंगट सिंह कॉलेज उत्तर बिहार का प्रमुख ऐतिहासिक शैक्षणिक केंद्र है। राष्ट्रपिता महात्मा गांधी चंपारण आंदोलन के समय यहाँ रुके थे।",
        adminId: "@spidey_ahamiyat",
        xp: "40 XP"
    },
    "golden_temple": {
        name: "स्वर्ण मंदिर (Golden Temple)",
        state: "Punjab",
        district: "Amritsar",
        village: "अटारी बाज़ार",
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1588096344356-9a4d95267b2d?w=1000&auto=format&fit=crop&q=80",
        story: "श्री हरिमंदिर साहिब सिख धर्म का सर्वोच्च आध्यात्मिक केंद्र है, जो शांति, समानता और अखंड सेवा का प्रतीक है।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    }
};

let cloudPlaces = {};

// ================= लोकेशन मॉडल प्रबंधन =================
function checkLocationSelection() {
    const modal = document.getElementById("locationModal");
    if (!localStorage.getItem("vp_state") || !localStorage.getItem("vp_district")) {
        modal.style.display = "flex";
    } else {
        modal.style.display = "none";
    }
    updateLocationHeader();
}

function openLocationPicker() {
    const modal = document.getElementById("locationModal");
    modal.style.display = "flex";
    
    document.getElementById("stateSelect").value = selectedState;
    onStateChange();
    document.getElementById("districtSelect").value = selectedDistrict;
}

function onStateChange() {
    const state = document.getElementById("stateSelect").value;
    const distSelect = document.getElementById("districtSelect");
    distSelect.innerHTML = '<option value="">-- ज़िला चुनें --</option>';

    if (state && stateDistricts[state]) {
        distSelect.disabled = false;
        stateDistricts[state].forEach(d => {
            const opt = document.createElement("option");
            opt.value = d;
            opt.innerText = d;
            distSelect.appendChild(opt);
        });
    } else {
        distSelect.disabled = true;
    }
}

function confirmLocation() {
    const s = document.getElementById("stateSelect").value;
    const d = document.getElementById("districtSelect").value;

    if (!s || !d) {
        alert("कृपया राज्य और ज़िला दोनों चुनें!");
        return;
    }

    selectedState = s;
    selectedDistrict = d;
    localStorage.setItem("vp_state", s);
    localStorage.setItem("vp_district", d);

    document.getElementById("locationModal").style.display = "none";
    updateLocationHeader();
    renderCards();
}

function updateLocationHeader() {
    const label = document.getElementById("activeLocLabel");
    if (label) {
        label.innerHTML = `📍 ${selectedDistrict}, ${selectedState}`;
    }
}

// ================= Firestore रियल-टाइम सिंक =================
function listenToCloudData() {
    db.collection("places").onSnapshot((snapshot) => {
        cloudPlaces = {};
        snapshot.forEach((doc) => {
            cloudPlaces[doc.id] = doc.data();
        });
        renderCards();
    }, (err) => {
        console.warn("Firestore offline fallback active:", err);
        renderCards();
    });
}

// ================= मुख्य रेंडरिंग और स्मार्ट फ़िल्टर =================
function renderCards() {
    const cardList = document.getElementById("dynamicCardList");
    if (!cardList) return;

    const searchInput = document.querySelector(".search-bar");
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const activeCategory = document.querySelector(".cat-btn.active")?.innerText || "सभी";

    // क्लाउड डेटा और डिफ़ॉल्ट डेटा को सुरक्षित तरीके से जोड़ना
    const mergedData = { ...defaultPlaces, ...cloudPlaces };
    cardList.innerHTML = "";

    let count = 0;

    for (const key in mergedData) {
        const place = mergedData[key];
        if (!place || !place.name) continue;

        // केस-इनसेसिटिव मैचिंग (अक्षर छोटा-बड़ा होने पर भी मैच करेगा)
        const pState = (place.state || "Bihar").toLowerCase();
        const pDistrict = (place.district || "Muzaffarpur").toLowerCase();
        const curState = selectedState.toLowerCase();
        const curDistrict = selectedDistrict.toLowerCase();

        // 1. राज्य और ज़िला फ़िल्टर (अगर सर्च खाली है तो सिर्फ चुने हुए ज़िले का दिखेगा)
        if (!searchText) {
            if (pState !== curState || pDistrict !== curDistrict) {
                continue;
            }
        }

        // 2. श्रेणी फ़िल्टर
        if (activeCategory !== "सभी" && place.category !== activeCategory) {
            continue;
        }

        // 3. ग्लोबल सर्च (नाम, गाँव, ज़िला, राज्य, कहानी कुछ भी सर्च करें)
        if (searchText) {
            const pName = (place.name || "").toLowerCase();
            const pVillage = (place.village || "").toLowerCase();
            const pCategory = (place.category || "").toLowerCase();
            const pStory = (place.story || "").toLowerCase();

            const isMatched = pName.includes(searchText) || 
                              pVillage.includes(searchText) || 
                              pDistrict.includes(searchText) || 
                              pState.includes(searchText) ||
                              pCategory.includes(searchText) ||
                              pStory.includes(searchText);

            if (!isMatched) continue;
        }

        count++;

        const displayImage = place.imageUrl || "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80";
        const locDisplay = place.village ? `${place.village}, ${place.district || selectedDistrict}` : `${place.district || selectedDistrict}, ${place.state || selectedState}`;
        const author = place.adminId || "@spidey_ahamiyat";

        const cardHTML = `
            <div class="card">
                <div class="card-img-wrapper" onclick="open360View('${key}')">
                    <img src="${displayImage}" alt="${place.name}" loading="lazy">
                    <div class="view-360-btn">🔄 360° दर्शन</div>
                    <div class="badge-overlay">🏆 ${place.xp || "50 XP"}</div>
                    <div class="location-chip">📍 ${locDisplay}</div>
                </div>
                <div class="card-content">
                    <h3>${place.name}</h3>
                    <p class="tag">${place.category || 'धरोहर'} • <span style="color:#d35400; font-weight:600;">✍️ ${author}</span></p>
                    <div class="card-actions">
                        <button class="ai-btn" onclick="startAIGuide('${key}')">🎧 AI गाइड सुनें</button>
                        <button class="nav-btn" onclick="navigateToPlace('${key}')">📍 नेविगेट</button>
                    </div>
                </div>
            </div>
        `;
        cardList.innerHTML += cardHTML;
    }

    if (count === 0) {
        cardList.innerHTML = `
            <div style="text-align:center; padding: 45px 15px; color:#64748b;">
                <p style="font-size: 1.2rem; font-weight:700; color:#1e293b;">🔍 कोई धरोहर नहीं मिली</p>
                <p style="font-size: 0.88rem; margin-top: 6px;">"${selectedDistrict}" के लिए अभी कोई एंट्री नहीं है। आप एडमिन पैनल से नया स्थल जोड़ सकते हैं, या ऊपर <b>'बदलें ✍️'</b> पर क्लिक करके 'Muzaffarpur' चुनें।</p>
            </div>
        `;
    }
}

// 📍 नेविगेशन और गूगल मैप्स लाइव रूट
function navigateToPlace(placeId) {
    const mergedData = { ...defaultPlaces, ...cloudPlaces };
    const place = mergedData[placeId];
    if (!place) return;

    showSection('map');

    const mapFrame = document.querySelector("#mapSection iframe");
    const mapHeading = document.querySelector("#mapSection h3");
    const placeNameClean = place.name.replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, "");
    const query = encodeURIComponent(`${placeNameClean} ${place.district || selectedDistrict}`);

    if (mapHeading) {
        mapHeading.innerHTML = `📍 ${place.name} <br><span style="font-size:0.85rem; color:#64748b; font-weight:normal;">${place.village || ''}, ${place.district || selectedDistrict}</span>`;
    }

    if (mapFrame) {
        mapFrame.src = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    let directBtn = document.getElementById("googleMapsDirectBtn");
    if (!directBtn) {
        directBtn = document.createElement("a");
        directBtn.id = "googleMapsDirectBtn";
        directBtn.target = "_blank";
        directBtn.style.cssText = "display:inline-block; margin-top:15px; padding:12px 24px; background:#1a73e8; color:white; border-radius:25px; text-decoration:none; font-size:14px; font-weight:bold; box-shadow: 0 4px 12px rgba(26,115,232,0.3);";
        document.getElementById("mapSection").appendChild(directBtn);
    }
    directBtn.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    directBtn.innerText = `🚗 Google Maps पर लाइव रास्ता देखें`;
}

// 🔄 360° व्यू ओपनर
function open360View(placeId) {
    const mergedData = { ...defaultPlaces, ...cloudPlaces };
    const place = mergedData[placeId];
    if (!place) return;

    const imgUrl = place.imageUrl || "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80";
    document.getElementById("panoTitle").innerText = `${place.name} (360° व्यू)`;
    document.getElementById("panoModal").style.display = "flex";

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
        console.log("Pannellum note:", err);
    }
}

function close360View() {
    document.getElementById("panoModal").style.display = "none";
    if (pannellumViewer) {
        try { pannellumViewer.destroy(); } catch(e){}
    }
}

// टैब नेविगेशन
function showSection(sectionName) {
    const home = document.getElementById("homeSection");
    const map = document.getElementById("mapSection");
    const badges = document.getElementById("badgesSection");

    const navHome = document.getElementById("navHome");
    const navMap = document.getElementById("navMap");
    const navBadges = document.getElementById("navBadges");

    home.style.display = "none";
    map.style.display = "none";
    badges.style.display = "none";

    navHome?.classList.remove("active-nav");
    navMap?.classList.remove("active-nav");
    navBadges?.classList.remove("active-nav");

    if (sectionName === 'home') {
        home.style.display = "block";
        navHome?.classList.add("active-nav");
    } else if (sectionName === 'map') {
        map.style.display = "block";
        navMap?.classList.add("active-nav");
    } else if (sectionName === 'badges') {
        badges.style.display = "block";
        navBadges?.classList.add("active-nav");
    }
}

// बहुभाषी AI ऑडियो
function startAIGuide(placeId) {
    if (!synth) return;
    synth.cancel();

    const mergedData = { ...defaultPlaces, ...cloudPlaces };
    const place = mergedData[placeId];
    if (!place || !place.story) return;

    const selectedLang = document.getElementById("guideLanguage")?.value || "hi-IN";
    let textToSpeak = place.story;

    if (selectedLang === "bho-IN") {
        textToSpeak = "प्रणाम! ई बा " + place.name + " के पावन इतिहास। " + place.story;
    }

    if (audioStatus) audioStatus.style.display = "block";

    const utterThis = new SpeechSynthesisUtterance(textToSpeak);
    utterThis.rate = 0.88;

    const voices = synth.getVoices();

    if (selectedLang === "en-IN") {
        const enVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US"));
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

// लोड और इवेंट लिसनर्स
document.addEventListener("DOMContentLoaded", () => {
    checkLocationSelection();
    listenToCloudData();

    // रियल-टाइम सर्च इनपुट
    const searchBar = document.querySelector(".search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", () => {
            renderCards();
        });
    }

    // कैटेगरी बटन फ़िल्टर
    const catBtns = document.querySelectorAll(".cat-btn");
    catBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            catBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            renderCards();
        });
    });

    // बॉटम बार नेविगेशन
    document.getElementById("navHome")?.addEventListener("click", () => showSection('home'));
    document.getElementById("navMap")?.addEventListener("click", () => showSection('map'));
    document.getElementById("navBadges")?.addEventListener("click", () => showSection('badges'));
});