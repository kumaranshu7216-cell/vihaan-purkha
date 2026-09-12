/**
 * VratyaVani AI (व्रात्यवाणी) — Admin Desk Controller
 */

const STORAGE_KEY = "vratyavani_custom_records";

document.addEventListener("DOMContentLoaded", () => {
  renderAdminTable();
  bindAdminForm();
});

function getCustomRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Storage read error:", err);
    return [];
  }
}

function saveCustomRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function renderAdminTable() {
  const tbody = document.getElementById("recordsTbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  // 1. Load baseline records from data.js
  let allRecords = [];
  if (typeof heritageData !== "undefined") {
    Object.keys(heritageData).forEach((districtKey) => {
      heritageData[districtKey].forEach((item) => {
        allRecords.push({
          ...item,
          districtDisplay: item.districtName || districtKey,
          source: "Core Dataset (data.js)"
        });
      });
    });
  }

  // 2. Load LocalStorage custom records
  const customRecords = getCustomRecords();
  allRecords = [...customRecords, ...allRecords];

  if (allRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">कोई हेरिटेज रिकॉर्ड उपलब्ध नहीं है।</td></tr>`;
    return;
  }

  allRecords.forEach((item, index) => {
    const isCustom = item.source === "User Verified (Custom)";
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td>${item.districtDisplay || item.district}</td>
      <td>
        <span class="badge-category ${item.category}">
          ${getCategoryLabel(item.category)}
        </span>
      </td>
      <td>
        <span class="badge-status">✓ ${item.source}</span>
      </td>
      <td>
        ${
          isCustom
            ? `<button onclick="deleteCustomRecord(${index})" class="btn-delete">🗑️ हटाएं</button>`
            : `<span style="color:#94a3b8; font-size:11px;">सुरक्षित (Core)</span>`
        }
      </td>
    `;
    tbody.appendChild(row);
  });
}

function getCategoryLabel(cat) {
  const labels = {
    major: "प्रमुख धरोहर",
    monument: "स्मारक",
    gem: "छिपा रत्न",
    artisan: "शिल्पकार"
  };
  return labels[cat] || cat;
}

function bindAdminForm() {
  const form = document.getElementById("addRecordForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("recCat").value;
    const district = document.getElementById("recDistrict").value;
    const title = document.getElementById("recTitle").value.trim();
    const coordsRaw = document.getElementById("recCoords").value.trim();
    const desc = document.getElementById("recDesc").value.trim();
    const phone = document.getElementById("recPhone") ? document.getElementById("recPhone").value.trim() : "";

    let coords = [26.1209, 85.3647];
    if (coordsRaw.includes(",")) {
      const parts = coordsRaw.split(",");
      coords = [parseFloat(parts[0].trim()), parseFloat(parts[1].trim())];
    }

    const newRecord = {
      id: `vv_${Date.now()}`,
      category: category,
      district: district,
      districtDisplay: district,
      title: title,
      desc: desc,
      coords: coords,
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: desc,
      artisanPhone: phone || null,
      source: "User Verified (Custom)"
    };

    const customRecords = getCustomRecords();
    customRecords.unshift(newRecord);
    saveCustomRecords(customRecords);

    alert(`🎉 VratyaVani AI: "${title}" को सत्यापित कर लाइव कर दिया गया है!`);
    form.reset();
    renderAdminTable();
  });
}

function deleteCustomRecord(recordIndex) {
  if (!confirm("क्या आप वाकई इस रिकॉर्ड को हटाना चाहते हैं?")) return;

  let customRecords = getCustomRecords();
  customRecords.splice(recordIndex, 1);
  saveCustomRecords(customRecords);
  renderAdminTable();
}