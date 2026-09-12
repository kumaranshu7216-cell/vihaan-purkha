/**
 * VratyaVani AI (व्रात्यवाणी) — Client Engine
 */

let currentDistrict = "muzaffarpur";
let currentCategory = "major";
let mapInstance = null;
let mapMarkers = [];
let activeAudioItem = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('VratyaVani Offline Engine Ready'))
      .catch((err) => console.log('SW Registration Failed:', err));
  });
}

// Network Status
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
  const badge = document.getElementById("networkStatusBadge");
  if (!badge) return;
  if (navigator.onLine) {
    badge.className = "network-badge online";
    badge.innerText = "● Online";
  } else {
    badge.className = "network-badge offline";
    badge.innerText = "● Offline (Cached)";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadDistrictData(currentDistrict);
  updateNetworkStatus();
});

function initMap() {
  mapInstance = L.map('map').setView([26.1209, 85.3647], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap | VratyaVani AI'
  }).addTo(mapInstance);
}

function onDistrictChange(districtKey) {
  currentDistrict = districtKey;
  const badge = document.getElementById("currentDistrictBadge");
  const districtNames = {
    muzaffarpur: "मुजफ्फरपुर (तिरहुत)",
    patna: "पटना (पाटलिपुत्र)",
    varanasi: "वाराणसी (काशी)",
    amritsar: "अमृतसर (पंजाब)"
  };
  badge.innerText = districtNames[districtKey] || districtKey;
  loadDistrictData(currentDistrict);
}

function filterCategory(catKey) {
  currentCategory = catKey;
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderCards();
}

function loadDistrictData(districtKey) {
  let items = heritageData[districtKey] ? [...heritageData[districtKey]] : [];

  // Read LocalStorage
  try {
    const custom = JSON.parse(localStorage.getItem("vratyavani_custom_records") || "[]");
    const matching = custom.filter(c => c.district === districtKey);
    items = [...matching, ...items];
  } catch (e) {
    console.error("Local sync error:", e);
  }

  // Clear previous markers
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  if (items.length > 0) {
    mapInstance.flyTo(items[0].coords, 12);
    items.forEach(item => {
      const marker = L.marker(item.coords).addTo(mapInstance);
      marker.bindPopup(`
        <strong>${item.title}</strong><br>
        <small style="text-transform:uppercase; color:#c2410c;">${item.category}</small><br>
        <button onclick="selectForVoice('${item.id}')" style="margin-top:6px; padding:4px 8px; font-size:11px; background:#d97706; color:#000; border:none; border-radius:4px; font-weight:700; cursor:pointer;">
          🎙️ AI वॉयस गाइड
        </button>
      `);
      mapMarkers.push(marker);
    });
  }

  renderCards(items);
}

function renderCards(preloadedItems) {
  const container = document.getElementById("cardsGrid");
  container.innerHTML = "";

  let items = preloadedItems;
  if (!items) {
    items = heritageData[currentDistrict] ? [...heritageData[currentDistrict]] : [];
    try {
      const custom = JSON.parse(localStorage.getItem("vratyavani_custom_records") || "[]");
      const matching = custom.filter(c => c.district === currentDistrict);
      items = [...matching, ...items];
    } catch(e) {}
  }

  const filtered = items.filter(item => item.category === currentCategory);

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1; padding:20px;">इस श्रेणी में वर्तमान में कोई रिकॉर्ड सत्यापित नहीं है। Admin Panel से नया डेटा जोड़ें।</p>`;
    return;
  }

  filtered.forEach(item => {
    const isArtisan = item.category === "artisan";
    const cardHtml = `
      <div class="heritage-card">
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="card-content">
          <span class="card-tag">${item.category}</span>
          <h4 class="card-title">${item.title}</h4>
          <p class="card-desc">${item.desc}</p>
          <div class="card-actions">
            <button class="btn-sm btn-listen" onclick="selectForVoice('${item.id}')">🎙️ AI सुनें</button>
            <button class="btn-sm btn-locate" onclick="panToLocation(${item.coords[0]}, ${item.coords[1]})">📍 रडार</button>
            ${isArtisan && item.artisanPhone ? `
              <a href="https://wa.me/${item.artisanPhone}?text=नमस्ते! मैंने VratyaVani AI पोर्टल पर आपकी कला देखी। मुझे उत्पाद खरीदने हैं।" target="_blank" class="btn-sm btn-artisan-wa">💬 कारीगर</a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

function panToLocation(lat, lng) {
  mapInstance.flyTo([lat, lng], 15);
}

function selectForVoice(itemId) {
  let allItems = heritageData[currentDistrict] ? [...heritageData[currentDistrict]] : [];
  try {
    const custom = JSON.parse(localStorage.getItem("vratyavani_custom_records") || "[]");
    allItems = [...custom, ...allItems];
  } catch(e) {}

  const found = allItems.find(i => i.id === itemId);
  if (!found) return;

  activeAudioItem = found;
  document.getElementById("nowPlayingText").innerHTML = `
    <strong>${found.title}</strong><br>
    <em>"${found.bhashiniAudioText}"</em>
  `;
  const playBtn = document.getElementById("playAudioBtn");
  playBtn.disabled = false;
  playBtn.innerText = "▶ AI आवाज़ सुनें";
}

function togglePlayVoice() {
  if (!activeAudioItem) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeAudioItem.bhashiniAudioText);
    utterance.lang = document.getElementById("langSelect").value;
    utterance.rate = 0.92;

    utterance.onstart = () => {
      document.getElementById("playAudioBtn").innerText = "⏹ चल रहा है...";
    };
    utterance.onend = () => {
      document.getElementById("playAudioBtn").innerText = "▶ पुनः सुनें";
    };

    window.speechSynthesis.speak(utterance);
  } else {
    alert("डिवाइस में वॉयस सिंथेसिस उपलब्ध नहीं है।");
  }
}

function showQrModal() {
  if (activeAudioItem) {
    document.getElementById("modalHeritageTitle").innerText = `QR: ${activeAudioItem.title}`;
    document.getElementById("qrImage").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://vratyavani.ai/spot/${activeAudioItem.id}`;
  } else {
    document.getElementById("modalHeritageTitle").innerText = `VratyaVani AI Spot Guide`;
    document.getElementById("qrImage").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://vratyavani.ai/spot/muzaffarpur`;
  }
  document.getElementById("qrModal").style.display = "flex";
}

function closeQrModal(e) {
  if (!e || e.target.id === "qrModal" || e.target.classList.contains("close-modal")) {
    document.getElementById("qrModal").style.display = "none";
  }
}