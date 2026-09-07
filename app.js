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

// राज्य और उनके ज़िलों का डेटाबेस
const stateDistricts = {
    "Bihar": ["Muzaffarpur", "Patna", "Gaya", "Darbhanga", "Bhagalpur", "Vaishali"],
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
    "Uttar Pradesh": ["Varanasi", "Ayodhya", "Lucknow", "Agra", "Mathura"]
};

let selectedState = localStorage.getItem("vp_state") || "";
let selectedDistrict = localStorage.getItem("vp_district") || "";

// ================= विभिन्न राज्यों का समृद्ध डिफ़ॉल्ट डेटा =================
const defaultPlaces = {
    // 1. बिहार - मुजफ्फरपुर
    "garibnath_mandir": {
        name: "बाबा गरीबनाथ मंदिर",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "पुरानी बाज़ार",
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80",
        story: "बाबा गरीबनाथ मंदिर मुजफ्फरपुर का हृदय है, जिसे बिहार का देवघर भी कहा जाता है। सावन के महीने में यहाँ लाखों श्रद्धालु जलाभिषेक करने आते हैं।",
        adminId: "@spidey_ahamiyat",
        xp: "50 XP",
        mapQuery: "Baba Garibnath Temple Muzaffarpur"
    },
    "khudiram_bose_smarak": {
        name: "शहीद खुदीराम बोस स्मारक",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "कंपनी बाग",
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1000&auto=format&fit=crop&q=80",
        story: "यह स्थल अमर बलिदानी खुदीराम बोस की शहादत का साक्षी है। 1908 में मात्र 18 वर्ष की आयु में मुजफ्फरपुर जेल में उन्हें फांसी दी गई थी।",
        adminId: "@spidey_ahamiyat",
        xp: "60 XP",
        mapQuery: "Khudiram Bose Memorial Muzaffarpur"
    },
    "ls_college": {
        name: "लंगट सिंह कॉलेज (LS College)",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "कलमबाग रोड",
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80",
        story: "1899 में स्थापित लंगट सिंह कॉलेज उत्तर बिहार का गौरवशाली शैक्षणिक केंद्र है। चंपारण सत्याग्रह के दौरान राष्ट्रपिता महात्मा गांधी स्वयं यहाँ ठहरे थे।",
        adminId: "@spidey_ahamiyat",
        xp: "40 XP",
        mapQuery: "Langat Singh College Muzaffarpur"
    },
    // 2. बिहार - पटना
    "golghar_patna": {
        name: "गोलघर (Golghar)",
        state: "Bihar",
        district: "Patna",
        village: "गांधी मैदान",
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1000&auto=format&fit=crop&q=80",
        story: "1786 में कैप्टन जॉन गार्सटिन द्वारा निर्मित गोलघर बिना किसी खंभे के बना एक विशाल अन्न भंडार है, जहाँ से पूरे पटना और गंगा का विहंगम दृश्य दिखता है।",
        adminId: "@spidey_ahamiyat",
        xp: "50 XP",
        mapQuery: "Golghar Patna"
    },
    // 3. बिहार - गया
    "mahabodhi_temple": {
        name: "महाबोधि मंदिर (बोधगया)",
        state: "Bihar",
        district: "Gaya",
        village: "बोधगया",
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=1000&auto=format&fit=crop&q=80",
        story: "यह यूनेस्को विश्व धरोहर स्थल है, जहाँ भगवान बुद्ध को पवित्र बोधि वृक्ष के नीचे ज्ञान की प्राप्ति हुई थी।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP",
        mapQuery: "Mahabodhi Temple Bodh Gaya"
    },
    // 4. पंजाब - अमृतसर
    "golden_temple": {
        name: "स्वर्ण मंदिर (Golden Temple)",
        state: "Punjab",
        district: "Amritsar",
        village: "अटारी बाज़ार",
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1588096344356-9a4d95267b2d?w=1000&auto=format&fit=crop&q=80",
        story: "श्री हरिमंदिर साहिब सिख धर्म का सबसे पवित्र आध्यात्मिक स्थल है, जिसकी नींव हज़रत मियां मीर ने रखी थी और जहाँ विश्व का सबसे बड़ा लंगर चलता है।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP",
        mapQuery: "Golden Temple Amritsar"
    },
    "jallianwala_bagh": {
        name: "जलियांवाला बाग",
        state: "Punjab",
        district: "Amritsar",
        village: "गोल्डन टेम्पल रोड",
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1601614749298-25f0a0d6aa0d?w=1000&auto=format&fit=crop&q=80",
        story: "13 अप्रैल 1919 को वैशाखी के दिन जनरल डायर द्वारा निहत्थे भारतीयों पर किए गए नरसंहार का गवाह, जहाँ अमर शहीदों की याद में ज्योति जलती है।",
        adminId: "@spidey_ahamiyat",
        xp: "80 XP",
        mapQuery: "Jallianwala Bagh Amritsar"
    },
    // 5. उत्तर प्रदेश - वाराणसी
    "kashi_vishwanath": {
        name: "काशी विश्वनाथ ज्योतिर्लिंग",
        state: "Uttar Pradesh",
        district: "Varanasi",
        village: "विश्वनाथ गली",
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1000&auto=format&fit=crop&q=80",
        story: "द्वादश ज्योतिर्लिंगों में प्रमुख भगवान शिव की अविनाशी नगरी काशी का यह मंदिर मोक्ष दायिनी शक्ति का केंद्र है।",
        adminId: "@spidey_ahamiyat",
        xp: "100 XP",
        mapQuery: "Kashi Vishwanath Temple Varanasi"
    }
};

let allPlacesData = { ...defaultPlaces };

// ================= लोकेशन मॉडल प्रबंधन =================
function checkLocationSelection() {
    if (!selectedState || !selectedDistrict) {
        document.getElementById("locationModal").style.display = "flex";
    } else {
        document.getElementById("locationModal").style.display = "none";
        updateLocationHeader();
    }
}

function openLocationPicker() {
    document.getElementById("locationModal").style.display = "flex";
    if (selectedState) {
        document.getElementById("stateSelect").value = selectedState;
        onStateChange();
        document.getElementById("districtSelect").value = selectedDistrict;
    }
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
    applyCurrentFilters();
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
        allPlacesData = { ...defaultPlaces };
        snapshot.forEach((doc) => {
            allPlacesData[doc.id] = { ...doc.data(), mapQuery: doc.data().name + " " + (doc.data().district || "") };
        });
        applyCurrentFilters();
    }, (err) => {
        console.warn("Using offline fallback:", err);
        applyCurrentFilters();
    });
}

// ================= कार्ड रेंडरिंग (ज़िला/राज्य अनुसार) =================
function renderCards(searchText = "", filterCategory = "सभी") {
    const cardList = document.getElementById("dynamicCardList");
    if (!cardList) return;
    cardList.innerHTML = "";

    const query = searchText.trim().toLowerCase();
    let count = 0;

    for (const key in allPlacesData) {
        const place = allPlacesData[key];

        // 1. केवल चुने हुए राज्य और ज़िले का डेटा दिखाएँ
        if (selectedState && place.state && place.state.toLowerCase() !== selectedState.toLowerCase()) {
            continue;
        }
        if (selectedDistrict && place.district && place.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
            continue;
        }

        // 2. कैटेगरी फ़िल्टर
        if (filterCategory !== "सभी" && place.category !== filterCategory) {
            continue;
        }

        // 3. डीप सर्च (नाम, गाँव, ज़िला, राज्य सब सर्च करेगा)
        if (query) {
            const matchName = (place.name || "").toLowerCase().includes(query);
            const matchVillage = (place.village || "").toLowerCase().includes(query);
            const matchDistrict = (place.district || "").toLowerCase().includes(query);
            const matchState = (place.state || "").toLowerCase().includes(query);
            const matchCategory = (place.category || "").toLowerCase().includes(query);

            if (!matchName && !matchVillage && !matchDistrict && !matchState && !matchCategory) {
                continue;
            }
        }

        count++;
        const displayImage = place.imageUrl || "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80";
        const locationText = place.village ? `${place.village}, ${place.district}` : `${place.district}, ${place.state}`;

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
                        <button class="nav-btn" onclick="navigateToPlace('${key}')">📍 नेविगेट</button>
                    </div>
                </div>
            </div>
        `;
        cardList.innerHTML += cardHTML;
    }

    if (count === 0) {
        cardList.innerHTML = `
            <div style="text-align:center; padding: 40px 15px; color:#64748b;">
                <p style="font-size: 1.15rem; font-weight:700;">🔍 इस ज़िले में कोई स्थल नहीं मिला</p>
                <p style="font-size: 0.85rem; margin-top: 6px;">आप एडमिन पैनल से इस ज़िले का नया स्थल जोड़ सकते हैं, या ऊपर से ज़िला बदलें।</p>
            </div>
        `;
    }
}

function applyCurrentFilters() {
    const searchBar = document.querySelector(".search-bar");
    const activeCat = document.querySelector(".cat-btn.active")?.innerText || "सभी";
    renderCards(searchBar ? searchBar.value : "", activeCat);
}

// 📍 नेविगेट (मैप पर लोकेशन सेट करेगा और लाइव रास्ता बटन देगा)
function navigateToPlace(placeId) {
    const place = allPlacesData[placeId];
    if (!place) return;

    showSection('map');

    const mapFrame = document.querySelector("#mapSection iframe");
    const mapHeading = document.querySelector("#mapSection h3");
    const query = encodeURIComponent(place.mapQuery || `${place.name} ${place.district}`);

    if (mapHeading) {
        mapHeading.innerHTML = `📍 ${place.name} <br><span style="font-size:0.8rem; color:#64748b; font-weight:normal;">${place.village || ''}, ${place.district}</span>`;
    }

    if (mapFrame) {
        mapFrame.src = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    let directBtn = document.getElementById("googleMapsDirectBtn");
    if (!directBtn) {
        directBtn = document.createElement("a");
        directBtn.id = "googleMapsDirectBtn";
        directBtn.target = "_blank";
        directBtn.style.cssText = "display:inline-block; margin-top:15px; padding:10px 20px; background:#1a73e8; color:white; border-radius:20px; text-decoration:none; font-size:13px; font-weight:bold;";
        document.getElementById("mapSection").appendChild(directBtn);
    }
    directBtn.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    directBtn.innerText = `🚗 Google Maps पर लाइव रास्ता देखें`;
}

// 🔄 360° व्यू
function open360View(placeId) {
    const place = allPlacesData[placeId];
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
        console.log("360 viewer note:", err);
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

// AI आवाज़
function startAIGuide(placeId) {
    if (!synth) return;
    synth.cancel();

    const place = allPlacesData[placeId];
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

// डोम इनिशियलाइजेशन
document.addEventListener("DOMContentLoaded", () => {
    checkLocationSelection();
    listenToCloudData();

    // सर्च
    const searchBar = document.querySelector(".search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const activeCat = document.querySelector(".cat-btn.active")?.innerText || "सभी";
            renderCards(e.target.value, activeCat);
        });
    }

    // कैटेगरी
    const catBtns = document.querySelectorAll(".cat-btn");
    catBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            catBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            const currentSearch = document.querySelector(".search-bar")?.value || "";
            renderCards(currentSearch, e.target.innerText);
        });
    });

    // बॉटम बार
    document.getElementById("navHome")?.addEventListener("click", () => showSection('home'));
    document.getElementById("navMap")?.addEventListener("click", () => showSection('map'));
    document.getElementById("navBadges")?.addEventListener("click", () => showSection('badges'));
});