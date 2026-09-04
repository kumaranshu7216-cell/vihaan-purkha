function saveData() {
    const adminId = document.getElementById("adminId").value;
    const id = document.getElementById("placeId").value;
    const name = document.getElementById("placeName").value;
    const category = document.getElementById("placeCategory").value;
    const story = document.getElementById("placeStory").value;

    if(!adminId || !id || !name || !story) {
        alert("कृपया सभी जानकारी भरें!");
        return;
    }

    const newPlace = {
        adminId: adminId,
        name: name,
        category: category,
        story: story,
        xp: "50 XP बैज"
    };

    let existingData = JSON.parse(localStorage.getItem("vihaanData")) || {};
    existingData[id] = newPlace;
    localStorage.setItem("vihaanData", JSON.stringify(existingData));

    document.getElementById("msg").style.display = "block";
    setTimeout(() => { document.getElementById("msg").style.display = "none"; }, 2000);

    // फॉर्म खाली करना
    document.getElementById("adminId").value = "";
    document.getElementById("placeId").value = "";
    document.getElementById("placeName").value = "";
    document.getElementById("placeStory").value = "";
}