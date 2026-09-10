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

let leafletMap = null;
let currentMarker = null;
let transitionMap = null;

// राज्य और ज़िलों के सटीक निर्देशांक
const stateCoords = {
    "Bihar": [25.6, 85.5],
    "Punjab": [31.1, 75.3],
    "Uttar Pradesh": [26.8, 80.9]
};

const districtCoords = {
    "Muzaffarpur": [26.1209, 85.3647],
    "Patna": [25.5941, 85.1376],
    "Gaya": [24.7914, 85.0002],
    "Vaishali": [25.9863, 85.1228],
    "Darbhanga": [26.1542, 85.8918],
    "Bhagalpur": [25.2425, 86.9842],
    "Amritsar": [31.6340, 74.8723],
    "Ludhiana": [30.9010, 75.8573],
    "Jalandhar": [31.3260, 75.5762],
    "Patiala": [30.3398, 76.3869],
    "Ayodhya": [26.7956, 82.1943],
    "Varanasi": [25.3109, 83.0107],
    "Lucknow": [26.8690, 80.9126],
    "Agra": [27.1751, 78.0421],
    "Mathura": [27.5050, 77.6690]
};

const stateDistricts = {
    "Bihar": ["Muzaffarpur", "Patna", "Gaya", "Vaishali", "Darbhanga", "Bhagalpur"],
    "Punjab": ["Amritsar", "Patiala", "Ludhiana", "Jalandhar"],
    "Uttar Pradesh": ["Ayodhya", "Varanasi", "Agra", "Mathura", "Lucknow"]
};

let selectedState = localStorage.getItem("vp_state") || "Bihar";
let selectedDistrict = localStorage.getItem("vp_district") || "Muzaffarpur";

// ================= 100% प्रामाणिक व समृद्ध हेरिटेज डेटा =================
const defaultPlaces = {
    "garibnath_mandir": {
        name: "बाबा गरीबनाथ मंदिर",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "पुरानी बाज़ार",
        lat: 26.1215,
        lng: 85.3725,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
        story: "बाबा गरीबनाथ मंदिर मुजफ्फरपुर का प्रसिद्ध शिव धाम है, जिसे बिहार का देवघर भी कहा जाता है। सावन में यहाँ लाखों श्रद्धालु जलाभिषेक करते हैं।",
        adminId: "@spidey_ahamiyat",
        xp: "50 XP"
    },
    "khudiram_bose_smarak": {
        name: "शहीद खुदीराम बोस स्मारक",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "कंपनी बाग",
        lat: 26.1250,
        lng: 85.3810,
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80",
        story: "यह स्थल अमर बलिदानी शहीद खुदीराम बोस की शहादत का साक्षी है, जिन्हें मात्र 18 वर्ष की आयु में मुजफ्फरपुर में फांसी दी गई थी।",
        adminId: "@spidey_ahamiyat",
        xp: "60 XP"
    },
    "ashoka_pillar_vaishali": {
        name: "अशोक स्तंभ व बौद्ध स्तूप",
        state: "Bihar",
        district: "Vaishali",
        village: "कोल्हुआ",
        lat: 25.9863,
        lng: 85.1228,
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e08e1e12?w=800&auto=format&fit=crop&q=80",
        story: "सम्राट अशोक द्वारा बनवाया गया यह एकाश्म स्तंभ प्राचीन वैशाली के समृद्ध ऐतिहासिक और बौद्ध गौरव का प्रतीक है।",
        adminId: "@spidey_ahamiyat",
        xp: "80 XP"
    },
    "golghar_patna": {
        name: "गोलघर (Golghar)",
        state: "Bihar",
        district: "Patna",
        village: "गांधी मैदान",
        lat: 25.6174,
        lng: 85.1439,
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80",
        story: "1786 में कैप्टन जॉन गार्सटिन द्वारा निर्मित गोलघर बिना किसी खंभे का एक विशाल ऐतिहासिक अन्न भंडार है।",
        adminId: "@spidey_ahamiyat",
        xp: "50 XP"
    },
    "mahabodhi_temple": {
        name: "महाबोधि मंदिर (बोधगया)",
        state: "Bihar",
        district: "Gaya",
        village: "बोधगया",
        lat: 24.6960,
        lng: 84.9914,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&auto=format&fit=crop&q=80",
        story: "यूनेस्को विश्व धरोहर स्थल, जहाँ भगवान बुद्ध को पवित्र बोधि वृक्ष के नीचे ज्ञान प्राप्त हुआ था।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    },
    "golden_temple": {
        name: "श्री हरिमंदिर साहिब (स्वर्ण मंदिर)",
        state: "Punjab",
        district: "Amritsar",
        village: "अटारी बाज़ार",
        lat: 31.6200,
        lng: 74.8765,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1588096344356-9a4d95267b2d?w=800&auto=format&fit=crop&q=80",
        story: "सिख धर्म का सर्वोच्च आध्यात्मिक केंद्र, जो पवित्र अमृत सरोवर और अखंड लंगर सेवा का प्रतीक है।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    },
    "ram_mandir_ayodhya": {
        name: "श्री राम जन्मभूमि मंदिर",
        state: "Uttar Pradesh",
        district: "Ayodhya",
        village: "रामकोट, अयोध्या धाम",
        lat: 26.7956,
        lng: 82.1943,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1706185890886-07a82c448bb0?w=800&auto=format&fit=crop&q=80",
        story: "मर्यादा पुरुषोत्तम प्रभु श्री राम का यह भव्य जन्मभूमि मंदिर भारतीय आस्था और नागर स्थापत्य शैली का अनुपम प्रतीक है।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    }
};

let cloudPlaces = {};

// ================= लोकेशन मॉडल =================
function checkLocationSelection() {
    const modal = document.getElementById("locationModal");
    if (!localStorage.getItem("vp_state") || !localStorage.getItem("vp_district")) {
        if (modal) modal.style.display = "flex";
    } else {
        if (modal) modal.style.display = "none";
    }
    updateLocationHeader();
}

function openLocationPicker() {
    const modal = document.getElementById("locationModal");
    if (modal) modal.style.display = "flex";

    const stateSel = document.getElementById("stateSelect");
    if (stateSel) {
        stateSel.value = selectedState;
        onStateChange();
        const distSel = document.getElementById("districtSelect");
        if (distSel) distSel.value = selectedDistrict;
    }
}

function onStateChange() {
    const state = document.getElementById("stateSelect").value;
    const distSelect = document.getElementById("districtSelect");
    if (!distSelect) return;

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

// ================= 🗺️ सिनेमैटिक भारत ➔ राज्य ➔ ज़िला ज़ूम =================
function startCinematicZoom() {
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

    const zoomOverlay = document.getElementById("zoomTransitionOverlay");
    const hudText = document.getElementById("zoomHudText");
    zoomOverlay.style.display = "flex";

    const indiaCenter = [22.9734, 78.6569];
    if (!transitionMap) {
        transitionMap = L.map('transitionMapBox', { zoomControl: false }).setView(indiaCenter, 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(transitionMap);
    } else {
        transitionMap.invalidateSize();
        transitionMap.setView(indiaCenter, 5);
    }

    hudText.innerHTML = `🇮🇳 भारत के मानचित्र पर ${s} खोज रहे हैं...`;

    setTimeout(() => {
        const sCoord = stateCoords[s] || indiaCenter;
        hudText.innerHTML = `📍 ${s} राज्य पर ज़ूम कर रहे हैं...`;
        transitionMap.flyTo(sCoord, 8, { duration: 1.6 });

        setTimeout(() => {
            const dCoord = districtCoords[d] || sCoord;
            hudText.innerHTML = `🎯 ${d} ज़िले की धरोहरों पर पहुँच रहे हैं...`;
            transitionMap.flyTo(dCoord, 14, { duration: 1.5 });

            setTimeout(() => {
                zoomOverlay.style.display = "none";
                updateLocationHeader();
                renderCards();
                initOrUpdateMap();
            }, 1800);

        }, 1800);

    }, 800);
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
        console.warn("Offline fallback active:", err);
        renderCards();
    });
}

// ================= कार्ड रेंडरिंग (डिडुप्लीकेटेड) =================
function renderCards() {
    const cardList = document.getElementById("dynamicCardList");
    if (!cardList) return;

    const searchInput = document.querySelector(".search-bar");
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const activeCategory = document.querySelector(".cat-btn.active")?.innerText || "सभी";

    const mergedList = [];
    const seenNames = new Set();

    for (const key in cloudPlaces) {
        const item = cloudPlaces[key];
        if (item && item.name) {
            mergedList.push({ id: key, ...item });
            seenNames.add(item.name.trim().toLowerCase());
        }
    }

    for (const key in defaultPlaces) {
        const item = defaultPlaces[key];
        if (item && item.name && !seenNames.has(item.name.trim().toLowerCase())) {
            mergedList.push({ id: key, ...item });
        }
    }

    cardList.innerHTML = "";
    let count = 0;

    for (const place of mergedList) {
        const pName = (place.name || "").toLowerCase();
        const pState = (place.state || "").toLowerCase().trim();
        const pDistrict = (place.district || "").toLowerCase().trim();
        const pCategory = (place.category || "").toLowerCase();

        const curState = selectedState.toLowerCase().trim();
        const curDistrict = selectedDistrict.toLowerCase().trim();

        if (!searchText) {
            if (pState !== curState || pDistrict !== curDistrict) {
                continue;
            }
        } else {
            const isMatch = pName.includes(searchText) || 
                            pDistrict.includes(searchText) || 
                            pState.includes(searchText) || 
                            pCategory.includes(searchText);
            if (!isMatch) continue;
        }

        if (activeCategory !== "सभी" && place.category !== activeCategory) {
            continue;
        }

        count++;

        const fallbackImg = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
        const displayImage = (place.imageUrl && place.imageUrl.trim() !== "") ? place.imageUrl : fallbackImg;
        const locDisplay = place.village ? `${place.village}, ${place.district || selectedDistrict}` : `${place.district || selectedDistrict}, ${place.state || selectedState}`;
        const author = place.adminId || "@spidey_ahamiyat";

        const cardHTML = `
            <div class="card">
                <div class="card-img-wrapper" onclick="open360View('${place.id}')">
                    <img src="${displayImage}" alt="${place.name}" loading="lazy">
                    <div class="view-360-btn">🔄 360° दर्शन</div>
                    <div class="badge-overlay">🏆 ${place.xp || "50 XP"}</div>
                    <div class="location-chip">📍 ${locDisplay}</div>
                </div>
                <div class="card-content">
                    <h3>${place.name}</h3>
                    <p class="tag">${place.category || 'धरोहर'} • <span style="color:#d35400; font-weight:700;">✍️ ${author}</span></p>
                    <div class="card-actions">
                        <button class="ai-btn" onclick="startAIGuide('${place.id}')">🎧 AI गाइड सुनें</button>
                        <button class="nav-btn" onclick="navigateToPlace('${place.id}')">📍 नेविगेट</button>
                    </div>
                </div>
            </div>
        `;
        cardList.innerHTML += cardHTML;
    }

    if (count === 0) {
        cardList.innerHTML = `
            <div style="text-align:center; padding: 45px 15px; color:#64748b;">
                <p style="font-size: 1.15rem; font-weight:800; color:#0f172a;">🔍 कोई स्थल नहीं मिला</p>
                <p style="font-size: 0.85rem; margin-top: 6px;">"${searchText ? searchText : selectedDistrict}" के लिए अभी डेटा मौजूद नहीं है। ऊपर <b>'बदलें ✍️'</b> पर क्लिक करके अन्य ज़िला चुनें।</p>
            </div>
        `;
    }
}

// ================= लाइव मैप =================
function initOrUpdateMap(targetLat = null, targetLng = null, placeTitle = null, placeSub = null) {
    const coords = (targetLat && targetLng) 
        ? [targetLat, targetLng] 
        : (districtCoords[selectedDistrict] || [26.1209, 85.3647]);

    const title = placeTitle || `${selectedDistrict} हेरिटेज मैप`;
    const sub = placeSub || `${selectedState}`;

    const titleEl = document.getElementById("mapTargetTitle");
    const subEl = document.getElementById("mapTargetSub");
    if (titleEl) titleEl.innerHTML = `📍 ${title}`;
    if (subEl) subEl.innerHTML = sub;

    const navBtn = document.getElementById("externalNavBtn");
    if (navBtn) {
        const queryName = encodeURIComponent(`${title} ${selectedDistrict}`);
        navBtn.href = `https://www.google.com/maps/search/?api=1&query=${queryName}`;
    }

    if (!leafletMap) {
        leafletMap = L.map('liveMapBox').setView(coords, 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);
    } else {
        leafletMap.invalidateSize();
        leafletMap.flyTo(coords, 14, { duration: 1.2 });
    }

    if (currentMarker) leafletMap.removeLayer(currentMarker);
    currentMarker = L.marker(coords).addTo(leafletMap)
        .bindPopup(`<b>${title}</b><br>${sub}`)
        .openPopup();
}

function navigateToPlace(placeId) {
    const place = cloudPlaces[placeId] || defaultPlaces[placeId];
    if (!place) return;

    showSection('map');

    const defaultCoords = districtCoords[place.district || selectedDistrict] || [26.1209, 85.3647];
    const lat = place.lat || defaultCoords[0];
    const lng = place.lng || defaultCoords[1];

    setTimeout(() => {
        initOrUpdateMap(lat, lng, place.name, `${place.village || ''}, ${place.district || selectedDistrict}`);
    }, 200);
}

// 🔄 360° व्यू
function open360View(placeId) {
    const place = cloudPlaces[placeId] || defaultPlaces[placeId];
    if (!place) return;

    const imgUrl = place.imageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
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
        console.log("Pannellum status:", err);
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
        setTimeout(() => initOrUpdateMap(), 200);
    } else if (sectionName === 'badges') {
        badges.style.display = "block";
        navBadges?.classList.add("active-nav");
    }
}

// भाषिणी AI आवाज़
async function startAIGuide(placeId) {
    const place = cloudPlaces[placeId] || defaultPlaces[placeId];
    if (!place || !place.story) return;

    const selectedLang = document.getElementById("guideLanguage")?.value || "hi";
    
    if (audioStatus) {
        audioStatus.style.display = "block";
        audioStatus.innerText = `🔊 Bhashini AI बोल रहा है (${selectedLang.toUpperCase()})...`;
    }

    let textToSpeak = place.story;
    if (selectedLang === "bho") {
        textToSpeak = `प्रणाम! ई बा ${place.name} के पावन इतिहास। ${place.story}`;
    } else if (selectedLang === "mai") {
        textToSpeak = `प्रणाम! अहांक स्वागत अछि ${place.name} में। ${place.story}`;
    } else if (selectedLang === "pa") {
        textToSpeak = `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ${place.name} ਦਾ ਇਤਿਹਾਸ। ${place.story}`;
    }

    try {
        playBrowserTTS(textToSpeak, selectedLang);
    } catch (e) {
        playBrowserTTS(textToSpeak, "hi");
    }
}

function playBrowserTTS(text, langCode) {
    if (!synth) return;
    synth.cancel();

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.rate = 0.88;

    const voices = synth.getVoices();
    const langMap = { "hi": "hi-IN", "bho": "hi-IN", "mai": "hi-IN", "pa": "pa-IN", "en": "en-IN" };
    const targetCode = langMap[langCode] || "hi-IN";

    const voice = voices.find(v => 
        v.lang.toLowerCase().includes(targetCode.toLowerCase()) || 
        v.name.toLowerCase().includes(langCode)
    );

    if (voice) utterThis.voice = voice;
    utterThis.lang = targetCode;

    utterThis.onend = () => { if (audioStatus) audioStatus.style.display = "none"; };
    utterThis.onerror = () => { if (audioStatus) audioStatus.style.display = "none"; };

    synth.resume();
    synth.speak(utterThis);
}

document.addEventListener("DOMContentLoaded", () => {
    checkLocationSelection();
    listenToCloudData();

    const searchBar = document.querySelector(".search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", () => renderCards());
    }

    const catBtns = document.querySelectorAll(".cat-btn");
    catBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            catBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            renderCards();
        });
    });

    document.getElementById("navHome")?.addEventListener("click", () => showSection('home'));
    document.getElementById("navMap")?.addEventListener("click", () => showSection('map'));
    document.getElementById("navBadges")?.addEventListener("click", () => showSection('badges'));
});