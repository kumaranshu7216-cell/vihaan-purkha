// आपकी Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyA0bnCrIDTPracgy-qFvfXlXu7Im5RNGj0",
    authDomain: "vihaan-purkha.firebaseapp.com",
    projectId: "vihaan-purkha",
    storageBucket: "vihaan-purkha.firebasestorage.app",
    messagingSenderId: "1033538607939",
    appId: "1:1033538607939:web:b341070cc12e6708716df6"
};

// इनिशियलाइज़ेशन
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function saveData() {
    const adminId = document.getElementById("adminId").value.trim();
    const placeId = document.getElementById("placeId").value.trim();
    const name = document.getElementById("placeName").value.trim();
    const category = document.getElementById("placeCategory").value;
    const story = document.getElementById("placeStory").value.trim();

    if (!adminId || !placeId || !name || !story) {
        alert("कृपया सभी बॉक्स भरें!");
        return;
    }

    const dataObj = {
        adminId: adminId,
        name: name,
        category: category,
        story: story,
        xp: "50 XP बैज",
        createdAt: new Date()
    };

    // Firebase Firestore में डेटा सेव करना
    db.collection("places").doc(placeId).set(dataObj)
        .then(() => {
            const msgBox = document.getElementById("msg");
            msgBox.style.display = "block";
            setTimeout(() => { msgBox.style.display = "none"; }, 2500);

            document.getElementById("placeId").value = "";
            document.getElementById("placeName").value = "";
            document.getElementById("placeStory").value = "";
        })
        .catch((error) => {
            alert("डेटाबेस एरर: " + error.message);
        });
}