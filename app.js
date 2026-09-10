// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyA0bnCrIDTPracgy-qFvfXlXu7Im5RNGj0",
    authDomain: "vihaan-purkha.firebaseapp.com",
    projectId: "vihaan-purkha",
    storageBucket: "vihaan-purkha.firebasestorage.app",
    messagingSenderId: "1033538607939",
    appId: "1:1033538607939:web:b341070cc12e6708716df6"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const synth = window.speechSynthesis;
const audioStatus = document.getElementById("audioStatus");
let pannellumViewer = null;
let leafletMap = null;
let currentMarker = null;

// ज़िलों के सटीक निर्देशांक
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

// ================= 100% बहुभाषी 3-4 पंक्तियों वाला डिफ़ॉल्ट डेटा =================
const defaultPlaces = {
    // 1. बाबा गरीबनाथ मंदिर (मुजफ्फरपुर)
    "garibnath_mandir": {
        name: "बाबा गरीबनाथ मंदिर",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "पुरानी बाज़ार",
        lat: 26.1215,
        lng: 85.3725,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "बाबा गरीबनाथ मंदिर मुजफ्फरपुर का अति प्राचीन और प्रसिद्ध शिव धाम है। इसे उत्तर बिहार का देवघर भी कहा जाता है। मान्यता है कि यहाँ सच्चे मन से जलाभिषेक करने पर भक्तों की सभी मनोकामनाएं पूरी होती हैं। सावन के महीने में यहाँ लाखों कांवरिये पहलेजा घाट से पवित्र गंगाजल लेकर पैदल यात्रा करते हुए बाबा का जलाभिषेक करने आते हैं।",
            "en": "Welcome to Baba Garibnath Temple, a historic and sacred shrine dedicated to Lord Shiva in Muzaffarpur. Widely revered as the Deoghar of Bihar, this spiritual center attracts millions of devotees from across India. Legend holds that sincere prayers offered here grant fulfilling blessings. During the holy month of Shravan, pilgrims travel on foot carrying holy Ganga water to perform ceremonial rituals.",
            "bho": "प्रणाम! ई बा मुजफ्फरपुर के पावन बाबा गरीबनाथ मंदिर। एह मंदिर के बिहार के देवघर कहल जाला। मानल जाला कि इहाँ सावन के महीना में जे भी भक्त सच्चा मन से गंगाजल चढ़ावेला, ओकर सब मनोकामना पूरा हो जाला। लाखन श्रद्धालु पहलेजा घाट से जल भर के पैदल इहाँ दर्शन खातिर आवेले।",
            "mai": "प्रणाम! अहांक स्वागत अछि मुजफ्फरपुरक प्रसिद्ध बाबा गरीबनाथ मंदिर में। एकरा उत्तर बिहारक देवघर कहल जाइत अछि। मान्यता अछि जे इहाँ महादेव सभक मनोकामना पूर्ण करैत छथि। सावन मास में लाखो श्रद्धालु गंगाजल लऽ कऽ पैदल यात्रा करैत बाबाक जलाभिषेक करबाक लेल अबैत छथि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਮੁਜ਼ੱਫਰਪੁਰ ਦਾ ਇਤਿਹਾਸਕ ਬਾਬਾ ਗਰੀਬਨਾਥ ਮੰਦਰ, ਜਿਸ ਨੂੰ ਬਿਹਾਰ ਦਾ ਦੇਵਘਰ ਵੀ ਕਿਹਾ ਜਾਂਦਾ ਹੈ। ਇਹ ਭਗਵਾਨ ਸ਼ਿਵ ਦਾ ਬਹੁਤ ਪਵਿੱਤਰ ਅਸਥਾਨ ਹੈ। ਸਾਵਣ ਦੇ ਮਹੀਨੇ ਲੱਖਾਂ ਸ਼ਰਧਾਲੂ ਇੱਥੇ ਪਵਿੱਤਰ ਗੰਗਾ ਜਲ ਭੇਟ ਕਰਨ ਲਈ ਆਉਂਦੇ ਹਨ ਅਤੇ ਸ਼ਰਧਾ ਨਾਲ ਨਮਨ ਕਰਦੇ ਹਨ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "50 XP"
    },

    // 2. शहीद खुदीराम बोस स्मारक (मुजफ्फरपुर)
    "khudiram_bose_smarak": {
        name: "शहीद खुदीराम बोस स्मारक",
        state: "Bihar",
        district: "Muzaffarpur",
        village: "कंपनी बाग",
        lat: 26.1250,
        lng: 85.3810,
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "शहीद खुदीराम बोस स्मारक भारत की स्वतंत्रता संग्राम के सबसे युवा अमर क्रांतिकारी की शहादत का पावन प्रतीक है। सन 1908 में मात्र अठारह वर्ष की आयु में मुजफ्फरपुर जेल में उन्हें फांसी दी गई थी। हाथ में गीता लेकर मुस्कुराते हुए फांसी के फंदे को चूमने वाले इस वीर सपूत की स्मृति में यह स्मारक आज भी युवाओं को राष्ट्रभक्ति की प्रेरणा देता है।",
            "en": "Welcome to the Shaheed Khudiram Bose Memorial, a solemn tribute to one of the youngest revolutionaries of India's freedom struggle. In 1908, at the tender age of eighteen, Khudiram Bose embraced martyrdom when he was hanged in Muzaffarpur Jail. Facing the gallows fearlessly with the Bhagavad Gita in his hand, his sacrifice remains a timeless inspiration of courage and patriotism.",
            "bho": "प्रणाम! ई बा भारत के महान बलिदानी शहीद खुदीराम बोस के स्मारक। 1908 में मात्र अठारह बरिस के उमिर में मुजफ्फरपुर जेल में उनुका के फांसी दिहल गइल रहे। हाथ में गीता ले के मुस्कुराते फांसी के फंदा चूमे वाला ई वीर सपूत आजुओ हमनी के देशप्रेम के पाठ पढ़ावेला।",
            "mai": "प्रणाम! ई स्मारक भारतक सबसे युवा क्रांतिकारी अमर बलिदानी खुदीराम बोसक अछि। वर्ष 1908 में मात्र अठारह वर्षक आयु में मुजफ्फरपुर में हिनका फांसी देल गेल छल। हाथ में गीता लऽ कऽ हँसैत फांसीक फंदा चूमय वाला ई वीर सपूत आजुओ हमरा सभक लेल गौरवशाली छथि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਅਮਰ ਸ਼ਹੀਦ ਖੁਦੀਰਾਮ ਬੋਸ ਦੀ ਯਾਦਗਾਰ। ਸਿਰਫ਼ 18 ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ 1908 ਵਿੱਚ ਮੁਜ਼ੱਫਰਪੁਰ ਜੇਲ੍ਹ ਵਿੱਚ ਉਨ੍ਹਾਂ ਨੂੰ ਫਾਂਸੀ ਦਿੱਤੀ ਗਈ ਸੀ। ਦੇਸ਼ ਦੀ ਆਜ਼ਾਦੀ ਲਈ ਉਨ੍ਹਾਂ ਦਾ ਇਹ ਮਹਾਨ ਬਲੀਦਾਨ ਅੱਜ ਵੀ ਸਾਡੇ ਸਾਰਿਆਂ ਦੇ ਦਿਲਾਂ ਵਿੱਚ ਦੇਸ਼ ਭਗਤੀ ਦਾ ਜਜ਼ਬਾ ਜਗਾਉਂਦਾ ਹੈ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "60 XP"
    },

    // 3. अशोक स्तंभ (वैशाली)
    "ashoka_pillar_vaishali": {
        name: "अशोक स्तंभ व बौद्ध स्तूप",
        state: "Bihar",
        district: "Vaishali",
        village: "कोल्हुआ",
        lat: 25.9863,
        lng: 85.1228,
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e08e1e12?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "वैशाली का अशोक स्तंभ प्राचीन भारत के समृद्ध बौद्ध इतिहास और मौर्य कालीन स्थापत्य कला का अनुपम उदाहरण है। सम्राट अशोक ने भगवान बुद्ध के अंतिम उपदेश स्थल की स्मृति में इसका निर्माण करवाया था। लाल बलुआ पत्थर से तराशा गया यह एकाश्म स्तंभ आज भी अपने शीर्ष पर बैठे सिंह के साथ अखंड खड़ा है।",
            "en": "Welcome to the Ashoka Pillar and Buddhist Stupa in ancient Vaishali. Erected by Emperor Ashoka in the third century BCE, this monolithic polished sandstone pillar commemorates the site of Lord Buddha's last sermon. Crowned by a beautifully carved single lion facing north, it stands as an enduring testament to India's spiritual and royal heritage.",
            "bho": "प्रणाम! ई बा वैशाली के विश्वविख्यात अशोक स्तंभ। सम्राट अशोक भगवान बुद्ध के अंतिम उपदेश के याद में एह एकाश्म खंभा के बनवले रहन। लाल बलुआ पाथर से बनल ई खंभा आजुओ अपना चोटी पर बइठल सिंह के साथे प्राचीन भारत के शान बढ़ा रहल बा।",
            "mai": "प्रणाम! अहांक स्वागत अछि ऐतिहासिक वैशालीक अशोक स्तंभ में। सम्राट अशोक भगवान बुद्धक अंतिम उपदेशक स्मृति में एकर निर्माण करबाने छलाह। ई एकाश्म स्तंभ प्राचीन मिथिला आ वैशालीक गौरवशाली इतिहासक साक्षी अछि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਵੈਸ਼ਾਲੀ ਦਾ ਪ੍ਰਾਚੀਨ ਅਸ਼ੋਕ ਥੰਮ੍ਹ। ਸਮਰਾਟ ਅਸ਼ੋਕ ਨੇ ਭਗਵਾਨ ਬੁੱਧ ਦੇ ਆਖਰੀ ਉਪਦੇਸ਼ ਦੀ ਯਾਦ ਵਿੱਚ ਇਹ ਸ਼ਾਨਦਾਰ ਥੰਮ੍ਹ ਬਣਵਾਇਆ ਸੀ, ਜੋ ਭਾਰਤ ਦੇ ਮਹਾਨ ਇਤਿਹਾਸ ਅਤੇ ਕਲਾ ਦਾ ਪ੍ਰਤੀਕ ਹੈ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "80 XP"
    },

    // 4. गोलघर (पटना)
    "golghar_patna": {
        name: "गोलघर (Golghar)",
        state: "Bihar",
        district: "Patna",
        village: "गांधी मैदान",
        lat: 25.6174,
        lng: 85.1439,
        category: "ऐतिहासिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "पटना का गोलघर 1786 में कैप्टन जॉन गार्सटिन द्वारा अकाल से निपटने के लिए एक विशाल अन्न भंडार के रूप में बनवाया गया था। बिना किसी खंभे के बना इसका 125 मीटर का गोलाकार ढांचा इंजीनियरिंग का एक नायाब नमूना है। इसके शीर्ष पर जाने के लिए घुमावदार सीढ़ियां बनी हैं, जहाँ से गंगा नदी और पूरे पटना शहर का विहंगम दृश्य दिखता है।",
            "en": "Welcome to Golghar, Patna's iconic 18th-century architectural marvel. Built in 1786 by Captain John Garstin as a famine relief granary, it features an imposing pillarless beehive design capable of storing massive grain reserves. Visitors can climb its spiral staircases to enjoy panoramic views of the sacred Ganges and the historic city of Patna.",
            "bho": "प्रणाम! ई बा पटना के मशहूर गोलघर। 1786 में बिना कवनो खंभा के बनावल ई विशाल अन्न भंडार पुरान जमाना के बेजोड़ इंजीनियरिंग हवे। एकरा माथा पर चढ़ला के बाद पवित्र गंगा मइया आ पूरा पटना शहर के बहुत सुंदर नजारा लउकेला।",
            "mai": "प्रणाम! ई पटनाक ऐतिहासिक गोलघर अछि। 1786 में बिना कोनो खंभाक बनल ई विशाल अन्न भंडार इंजीनियरिंगक अद्भुत उदाहरण अछि। एकर ऊपर चढ़लाक बाद गंगा नदीक पावन दृश्य मन मोहेत अछि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਪਟਨਾ ਦਾ ਇਤਿਹਾਸਕ ਗੋਲਘਰ। ਬਿਨਾਂ ਕਿਸੇ ਖੰਭੇ ਦੇ ਬਣਿਆ ਇਹ ਵਿਸ਼ਾਲ ਅਨਾਜ ਭੰਡਾਰ ਪੁਰਾਤਨ ਇੰਜੀਨੀਅਰਿੰਗ ਦਾ ਕਮਾਲ ਹੈ, ਜਿੱਥੋਂ ਗੰਗਾ ਨਦੀ ਦਾ ਖੂਬਸੂਰਤ ਨਜ਼ਾਰਾ ਦਿੱਸਦਾ ਹੈ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "50 XP"
    },

    // 5. महाबोधि मंदिर (बोधगया)
    "mahabodhi_temple": {
        name: "महाबोधि मंदिर (बोधगया)",
        state: "Bihar",
        district: "Gaya",
        village: "बोधगया",
        lat: 24.6960,
        lng: 84.9914,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "बोधगया का महाबोधि मंदिर बौद्ध धर्म का सर्वोच्च पवित्र स्थल और यूनेस्को विश्व धरोहर है। इसी पावन स्थल पर पवित्र बोधि वृक्ष के नीचे तपस्या करते हुए भगवान बुद्ध को ज्ञान की प्राप्ति हुई थी। मंदिर की भव्य वास्तुकला और शांतिपूर्ण वातावरण पूरी दुनिया के लाखों भिक्षुओं और पर्यटकों को अपनी ओर आकर्षित करता है।",
            "en": "Welcome to the Mahabodhi Temple in Bodh Gaya, a revered UNESCO World Heritage Site and the cradle of Buddhism. It marks the holy location where Siddhartha Gautama attained Supreme Enlightenment beneath the sacred Bodhi Tree. The grand ancient spire and serene atmosphere make it a global beacon of peace, spirituality, and mindfulness.",
            "bho": "प्रणाम! ई बा बोधगया के पावन महाबोधि मंदिर। इहवें पवित्र बोधि पेड़ के नीचे तपस्या करत भगवान बुद्ध के ज्ञान मिलल रहे। ई यूनेस्को के विश्व धरोहर स्थल हवे जहाँ पूरा दुनिया से लाखन लोग शांति आ ध्यान खातिर आवेला।",
            "mai": "प्रणाम! अहांक स्वागत अछि पावन महाबोधि मंदिर बोधगया में। एहि ठाम पवित्र बोधि वृक्ष केर तर में भगवान बुद्धक ज्ञान प्राप्त भेल छलन्हि। ई मंदिर विश्वक अद्वितीय आध्यात्मिक धरोहर अछि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਬੋਧਗਯਾ ਦਾ ਵਿਸ਼ਵ ਪ੍ਰਸਿੱਧ ਮਹਾਬੋਧੀ ਮੰਦਰ। ਇਸ ਪਵਿੱਤਰ ਅਸਥਾਨ 'ਤੇ ਬੋਧੀ ਰੁੱਖ ਹੇਠਾਂ ਭਗਵਾਨ ਬੁੱਧ ਨੂੰ ਗਿਆਨ ਦੀ ਪ੍ਰਾਪਤੀ ਹੋਈ ਸੀ। ਇਹ ਸਥਾਨ ਸ਼ਾਂਤੀ ਅਤੇ ਰੂਹਾਨੀਅਤ ਦਾ ਕੇਂਦਰ ਹੈ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    },

    // 6. स्वर्ण मंदिर (अमृतसर)
    "golden_temple": {
        name: "श्री हरिमंदिर साहिब (स्वर्ण मंदिर)",
        state: "Punjab",
        district: "Amritsar",
        village: "अटारी बाज़ार",
        lat: 31.6200,
        lng: 74.8765,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1588096344356-9a4d95267b2d?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "श्री हरिमंदिर साहिब, जिसे स्वर्ण मंदिर के नाम से जाना जाता है, सिख धर्म का सर्वोच्च आध्यात्मिक केंद्र है। पवित्र अमृत सरोवर के बीच स्थित यह गुरुद्वारा समानता, शांति और मानवता का अद्वितीय प्रतीक है। यहाँ स्थित गुरु का लंगर विश्व का सबसे बड़ा लंगर है, जहाँ प्रतिदिन बिना किसी भेदभाव के लाखों लोग एक साथ बैठकर भोजन करते हैं।",
            "en": "Welcome to Sri Harmandir Sahib, globally renowned as the Golden Temple, the supreme spiritual sanctuary of Sikhism in Amritsar. Surrounded by the sacred pool of nectar, its golden dome symbolizes universal brotherhood, equality, and peace. It also hosts the world's largest community kitchen (Langar), serving free wholesome meals to thousands every day regardless of religion or background.",
            "bho": "प्रणाम! ई बा अमृतसर के पावन स्वर्ण मंदिर, जेकरा श्री हरिमंदिर साहिब कहल जाला। पवित्र अमृत सरोवर के बीच में स्थित ई दरबार शांति आ मानवता के महान केंद्र हवे। इहाँ के 24 घंटा चले वाला लंगर दुनिया के सबसे बड़ लंगर मानल जाला।",
            "mai": "प्रणाम! ई अमृतसरक पावन स्वर्ण मंदिर अछि, जेकरा श्री हरिमंदिर साहिब कहल जाइत अछि। पवित्र अमृत सरोवरक मध्य में स्थित ई पावन स्थल विश्वक करोड़ों भक्तक लेल शांति आ समानताक प्रतीक अछि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਸੱਚਖੰਡ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ। ਪਵਿੱਤਰ ਅੰਮ੍ਰਿਤ ਸਰੋਵਰ ਵਿੱਚ ਸੁਸ਼ੋਭਿਤ ਇਹ ਦਰਬਾਰ ਸਿੱਖ ਧਰਮ ਦਾ ਸਭ ਤੋਂ ਪਵਿੱਤਰ ਅਸਥਾਨ ਹੈ। ਇੱਥੇ 24 ਘੰਟੇ ਗੁਰੂ ਕਾ ਅਤੁੱਟ ਲੰਗਰ ਚੱਲਦਾ ਹੈ ਅਤੇ ਸਭ ਨੂੰ ਬਰਾਬਰਤਾ ਦਾ ਪੈਗਾਮ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    },

    // 7. श्री राम जन्मभूमि मंदिर (अयोध्या)
    "ram_mandir_ayodhya": {
        name: "श्री राम जन्मभूमि मंदिर",
        state: "Uttar Pradesh",
        district: "Ayodhya",
        village: "रामकोट, अयोध्या धाम",
        lat: 26.7956,
        lng: 82.1943,
        category: "धार्मिक स्थल",
        imageUrl: "https://images.unsplash.com/photo-1706185890886-07a82c448bb0?w=800&auto=format&fit=crop&q=80",
        stories: {
            "hi": "मर्यादा पुरुषोत्तम भगवान श्री राम का यह भव्य जन्मभूमि मंदिर अयोध्या धाम में स्थित करोड़ों सनातन धर्मियों की आस्था का केंद्र है। नागर स्थापत्य शैली में निर्मित यह पावन मंदिर भारतीय संस्कृति, त्याग और शौर्य का अनुपम संगम है। मंदिर के नक्काशीदार खंभे और गर्भगृह की अलौकिक छवि भक्तों को आत्मिक शांति और भक्ति से सराबोर कर देती है।",
            "en": "Welcome to the grand Shri Ram Janmabhoomi Mandir in the holy city of Ayodhya. Revered as the sacred birthplace of Lord Shri Ram, this majestic temple is an architectural masterpiece crafted in the classical Nagara style. Its intricately hand-carved stone pillars, towering spires, and sanctum sanctorum reflect India's profound cultural ethos and spiritual devotion.",
            "bho": "जय सिया राम! ई बा अयोध्या धाम में प्रभु श्री राम के भव्य जन्मभूमि मंदिर। नागर शैली में बनल ई पावन मंदिर हमनी के संस्कृति, त्याग आ मर्यादा के सर्वोच्च प्रतीक हवे। इहाँ अइला पर भक्तन के मन अलौकिक शांति से भर जाला।",
            "mai": "जय सिया राम! अहांक स्वागत अछि पावन अयोध्या धाम में प्रभु श्री रामक जन्मभूमि मंदिर में। नागर शैली में निर्मित ई भव्य मंदिर करोड़ों श्रद्धालु लोकनिक आस्थाक महातीर्थ अछि।",
            "pa": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਇਹ ਹੈ ਅਯੋਧਿਆ ਧਾਮ ਵਿੱਚ ਭਗਵਾਨ ਸ਼੍ਰੀ ਰਾਮ ਜੀ ਦਾ ਸ਼ਾਨਦਾਰ ਜਨਮ ਭੂਮੀ ਮੰਦਰ। ਨਾਗਰਾ ਸ਼ੈਲੀ ਵਿੱਚ ਬਣਿਆ ਇਹ ਪਵਿੱਤਰ ਮੰਦਰ ਭਾਰਤੀ ਸੰਸਕ੍ਰਿਤੀ ਅਤੇ ਸ਼ਰਧਾ ਦਾ ਇੱਕ ਬਹੁਤ ਹੀ ਮਹਾਨ ਪ੍ਰਤੀਕ ਹੈ।"
        },
        adminId: "@spidey_ahamiyat",
        xp: "100 XP"
    }
};

let cloudPlaces = {};

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

    const searchBar = document.querySelector(".search-bar");
    if (searchBar) searchBar.value = "";

    updateLocationHeader();
    renderCards();
    initOrUpdateMap();
}

function updateLocationHeader() {
    const label = document.getElementById("activeLocLabel");
    if (label) {
        label.innerHTML = `📍 ${selectedDistrict}, ${selectedState}`;
    }
}

function listenToCloudData() {
    db.collection("places").onSnapshot((snapshot) => {
        cloudPlaces = {};
        snapshot.forEach((doc) => {
            cloudPlaces[doc.id] = doc.data();
        });
        renderCards();
    }, (err) => {
        console.warn("Using offline fallback:", err);
        renderCards();
    });
}

function normalizeName(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/[\s\(\)\-_\.,\/]/g, "")
        .replace(/mandir|temple|smarak|memorial|stupa/g, "");
}

// ================= कार्ड रेंडरिंग (सख्त नेम-मैचिंग डिडुप्लिकेशन) =================
function renderCards() {
    const cardList = document.getElementById("dynamicCardList");
    if (!cardList) return;

    const searchInput = document.querySelector(".search-bar");
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const activeCategory = document.querySelector(".cat-btn.active")?.innerText || "सभी";

    const mergedList = [];
    const seenNormalizedNames = new Set();

    // 1. क्लाउड डेटा को प्राथमिकता (Admin Data First)
    for (const key in cloudPlaces) {
        const item = cloudPlaces[key];
        if (item && item.name) {
            mergedList.push({ id: key, ...item });
            seenNormalizedNames.add(normalizeName(item.name));
        }
    }

    // 2. डिफ़ॉल्ट डेटा तभी जोड़ें जब वैसा कोई नाम क्लाउड में न हो
    for (const key in defaultPlaces) {
        const item = defaultPlaces[key];
        if (item && item.name) {
            const norm = normalizeName(item.name);
            if (!seenNormalizedNames.has(norm)) {
                mergedList.push({ id: key, ...item });
            }
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

        // लोकेशन फ़िल्टर
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

        // श्रेणी फ़िल्टर
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
                    <img src="${displayImage}" alt="${place.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
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
                <p style="font-size: 0.85rem; margin-top: 6px;">"${searchText ? searchText : selectedDistrict}" के लिए अभी डेटा मौजूद नहीं है। ऊपर <b>'बदलें ✍️'</b> पर क्लिक करके अन्य ज़िला चुनें या एडमिन से जोड़ें।</p>
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

function open360View(placeId) {
    const place = cloudPlaces[placeId] || defaultPlaces[placeId];
    if (!place) return;

    const fallbackImg = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
    const imgUrl = (place.imageUrl && place.imageUrl.trim() !== "") ? place.imageUrl : fallbackImg;
    
    document.getElementById("panoTitle").innerText = `${place.name} (360° दर्शन)`;
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

// ================= 🇮🇳 भाषिणी AI फुल-स्टोरी ऑडियो इंजन (3-4 पंक्तियाँ) =================
async function startAIGuide(placeId) {
    const place = cloudPlaces[placeId] || defaultPlaces[placeId];
    if (!place) return;

    const selectedLang = document.getElementById("guideLanguage")?.value || "hi";
    
    if (audioStatus) {
        audioStatus.style.display = "block";
        audioStatus.innerText = `🔊 Bhashini AI बोल रहा है (${selectedLang.toUpperCase()})...`;
    }

    let textToSpeak = "";

    // 1. अगर डिफ़ॉल्ट डेटा में उस भाषा की पूरी 3-4 लाइन की कहानी पहले से मौजूद है
    if (place.stories && place.stories[selectedLang]) {
        textToSpeak = place.stories[selectedLang];
        playBrowserTTS(textToSpeak, selectedLang);
        return;
    }

    // 2. अगर एडमिन द्वारा डाला गया कार्ड है (जिसमें सिर्फ हिंदी स्टोरी है)
    const baseStory = place.story || (place.stories ? place.stories['hi'] : "");

    if (selectedLang === "en") {
        try {
            // MyMemory Translation API से 3-4 वाक्यों का पूरा ट्रांसलेशन
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(baseStory.slice(0, 480))}&langpair=hi|en`);
            const data = await res.json();
            if (data.responseData && data.responseData.translatedText) {
                textToSpeak = `Welcome to ${place.name}. ${data.responseData.translatedText}`;
            } else {
                textToSpeak = `Welcome to ${place.name}. This is a prominent historical and religious heritage site situated in ${place.district || selectedDistrict}, ${place.state || selectedState}. It holds immense cultural significance and attracts visitors from all across the nation.`;
            }
        } catch (err) {
            textToSpeak = `Welcome to ${place.name}. This is an ancient and revered heritage landmark in ${place.district || selectedDistrict}. It is celebrated for its glorious historical legacy, spiritual energy, and timeless architecture.`;
        }
        playBrowserTTS(textToSpeak, "en");
        return;
    }

    // 3. क्षेत्रीय बोलियों के लिए स्थानीय शैली में कम से कम 3 वाक्य
    if (selectedLang === "bho") {
        textToSpeak = `प्रणाम! रउआ सभे के स्वागत बा ${place.name} में। ई स्थल ${place.district || selectedDistrict} के बहुत बड़ पहचान हवे। ${baseStory} इहाँ अइला पर बड़ा सुकून आ गौरव के अहसास होला।`;
    } else if (selectedLang === "mai") {
        textToSpeak = `प्रणाम! अहांक स्वागत अछि ${place.name} में। ई स्थान ${place.district || selectedDistrict} केर गौरवशाली इतिहासक साक्षी अछि। ${baseStory} इहाँ अएला सँ मनक असीम शांति भेटैत अछि।`;
    } else if (selectedLang === "pa") {
        textToSpeak = `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ${place.name} ਵਿਖੇ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਇਹ ${place.district || selectedDistrict} ਦਾ ਬਹੁਤ ਹੀ ਮਹੱਤਵਪੂਰਨ ਅਤੇ ਇਤਿਹਾਸਕ ਅਸਥਾਨ ਹੈ। ${baseStory} ਇੱਥੇ ਆ ਕੇ ਮਨ ਨੂੰ ਬਹੁਤ ਸਕੂਨ ਮਿਲਦਾ ਹੈ।`;
    } else {
        textToSpeak = `नमस्ते! ${place.name} में आपका स्वागत है। ${baseStory}`;
    }

    playBrowserTTS(textToSpeak, selectedLang);
}

function playBrowserTTS(text, langCode) {
    if (!synth) return;
    synth.cancel();

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.rate = 0.88;

    const voices = synth.getVoices();

    if (langCode === "en") {
        const enVoice = voices.find(v => 
            v.lang.toLowerCase().includes("en-in") || 
            v.lang.toLowerCase().includes("en-us") || 
            v.lang.toLowerCase().includes("en-gb") || 
            v.name.toLowerCase().includes("english")
        );
        if (enVoice) utterThis.voice = enVoice;
        utterThis.lang = "en-US";
    } else if (langCode === "pa") {
        const paVoice = voices.find(v => v.lang.toLowerCase().includes("pa"));
        if (paVoice) utterThis.voice = paVoice;
        utterThis.lang = "pa-IN";
    } else {
        const hiVoice = voices.find(v => 
            v.lang.toLowerCase().includes("hi") || 
            v.name.toLowerCase().includes("hindi") || 
            v.name.toLowerCase().includes("swara")
        );
        if (hiVoice) utterThis.voice = hiVoice;
        utterThis.lang = "hi-IN";
    }

    utterThis.onend = () => { if (audioStatus) audioStatus.style.display = "none"; };
    utterThis.onerror = () => { if (audioStatus) audioStatus.style.display = "none"; };

    synth.resume();
    synth.speak(utterThis);
}

// इनिशियलाइजेशन
document.addEventListener("DOMContentLoaded", () => {
    checkLocationSelection();
    listenToCloudData();

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => synth.getVoices();
    }

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