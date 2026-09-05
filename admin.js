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

let base64Image = "";

// फ़ोटो को कंप्रेस करके Base64 में बदलना
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // आकार 600px तक स्केल करना ताकि लोड फ़ास्ट हो
            const maxWidth = 600;
            const scaleSize = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            base64Image = canvas.toDataURL("image/jpeg", 0.7);

            const previewImg = document.getElementById("imgPreview");
            previewImg.src = base64Image;
            previewImg.style.display = "block";
            document.getElementById("previewPlaceholder").style.display = "none";
        };
    };
    reader.readAsDataURL(file);
}

function saveData() {
    const adminId = document.getElementById("adminId").value.trim();
    const placeId = document.getElementById("placeId").value.trim();
    const name = document.getElementById("placeName").value.trim();
    const state = document.getElementById("placeState").value.trim();
    const district = document.getElementById("placeDistrict").value.trim();
    const village = document.getElementById("placeVillage").value.trim();
    const category = document.getElementById("placeCategory").value;
    const story = document.getElementById("placeStory").value.trim();

    if (!adminId || !placeId || !name || !story) {
        alert("कृपया सभी अनिवार्य बॉक्स (ID, नाम, कहानी) भरें!");
        return;
    }

    const dataObj = {
        adminId: adminId,
        name: name,
        state: state || "Bihar",
        district: district || "Muzaffarpur",
        village: village || "",
        imageUrl: base64Image || "",
        category: category,
        story: story,
        xp: "50 XP",
        createdAt: new Date()
    };

    db.collection("places").doc(placeId).set(dataObj)
        .then(() => {
            const msgBox = document.getElementById("msg");
            msgBox.style.display = "block";
            setTimeout(() => { msgBox.style.display = "none"; }, 2500);

            document.getElementById("placeId").value = "";
            document.getElementById("placeName").value = "";
            document.getElementById("placeVillage").value = "";
            document.getElementById("placeStory").value = "";
            document.getElementById("imgPreview").style.display = "none";
            document.getElementById("previewPlaceholder").style.display = "block";
            document.getElementById("imageInput").value = "";
            base64Image = "";
        })
        .catch((error) => {
            alert("डेटाबेस एरर: " + error.message);
        });
}