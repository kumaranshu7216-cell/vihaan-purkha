/**
 * VratyaVani AI (व्रात्यवाणी) — Multi-District Dataset
 */

const heritageData = {
  muzaffarpur: [
    {
      id: "muz_1",
      category: "major",
      district: "muzaffarpur",
      districtName: "मुजफ्फरपुर (तिरहुत)",
      title: "बाबा गरीबनाथ धाम (Baba Garibnath)",
      desc: "उत्तर बिहार का देवघर माना जाने वाला ऐतिहासिक शिवधाम। सावन में लाखों कांवरियों की आस्था का प्रमुख केंद्र।",
      coords: [26.1209, 85.3647],
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "बाबा गरीबनाथ धाम मुजफ्फरपुर का आध्यात्मिक हृदय है। जनश्रुति के अनुसार यहाँ स्थापित मनोकामना लिंग भक्तों की हर पुकार सुनता है।"
    },
    {
      id: "muz_2",
      category: "gem",
      district: "muzaffarpur",
      districtName: "मुजफ्फरपुर (तिरहुत)",
      title: "सिकंदरपुर झील व बूढ़ी गंडक तट",
      desc: "तिरहुत का शांत जल विस्तार और प्राचीन पर्यावरण धरोहर, जिसे ईको-टूरिज्म के रूप में विकसित किया जा रहा है।",
      coords: [26.1315, 85.3850],
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "सिकंदरपुर जलाशय बूढ़ी गंडक नदी की प्राचीन धारा से जुड़ा ऐतिहासिक जल क्षेत्र है, जो नौकायन और पक्षी प्रेमियों के लिए खास है।"
    },
    {
      id: "muz_3",
      category: "monument",
      district: "muzaffarpur",
      districtName: "मुजफ्फरपुर (तिरहुत)",
      title: "अमर शहीद खुदीराम बोस स्मारक",
      desc: "1908 में मात्र 18 वर्ष की आयु में स्वतंत्रता के लिए सर्वोच्च बलिदान देने वाले क्रांतिवीर का शहादत स्थल।",
      coords: [26.1180, 85.3920],
      image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "11 अगस्त 1908 को मुजफ्फरपुर की जेल में क्रांतिकारी खुदीराम बोस ने भारत माँ की स्वाधीनता के लिए हँसते-हँसते फांसी का फंदा चूमा था।"
    },
    {
      id: "muz_4",
      category: "artisan",
      district: "muzaffarpur",
      districtName: "मुजफ्फरपुर (तिरहुत)",
      title: "सुजनी कढ़ाई एवं शाही लीची क्लस्टर",
      desc: "जीआई-टैग्ड सुजनी हस्तशिल्प और विश्व प्रसिद्ध शाही लीची उत्पादों का सीधा ग्रामीण कारीगर केंद्र।",
      coords: [26.1150, 85.3500],
      image: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "सुजनी शिल्प मुजफ्फरपुर के ग्रामीण अंचलों की माताओं-बहनों की सुई-धागे से गढ़ी गई अमर लोककला है।",
      artisanPhone: "919876543210"
    }
  ],
  patna: [
    {
      id: "pat_1",
      category: "major",
      district: "patna",
      districtName: "पटना (पाटलिपुत्र)",
      title: "कुम्रहार - 80 स्तंभों वाला मौर्य राजप्रसाद",
      desc: "प्राचीन पाटलिपुत्र में मौर्य साम्राज्य के चंद्रगुप्त और सम्राट अशोक के विशाल राजसभा भवन का उत्खनन स्थल।",
      coords: [25.5992, 85.1843],
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "कुम्रहार मौर्य साम्राज्य की भव्यता का प्रतीक है, जहाँ 80 विशाल स्तंभों वाले अद्वितीय मौर्य राजप्रासाद के अवशेष मौजूद हैं।"
    },
    {
      id: "pat_2",
      category: "artisan",
      district: "patna",
      districtName: "पटना (पाटलिपुत्र)",
      title: "उपेंद्र महारथी शिल्प संस्थान (टिकुली कला)",
      desc: "कांच पर सोने की महीन पत्तियों से तैयार होने वाली मगध की 800 वर्ष पुरानी पारंपरिक टिकुली कला।",
      coords: [25.6200, 85.1400],
      image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "टिकुली कला पटना और मगध की प्राचीन सांस्कृतिक धरोहर है जिसे स्थानीय शिल्पकार आज भी जीवित रखे हुए हैं।",
      artisanPhone: "919123456789"
    }
  ],
  varanasi: [
    {
      id: "var_1",
      category: "major",
      district: "varanasi",
      districtName: "वाराणसी (काशी)",
      title: "काशी विश्वनाथ कॉरिडोर एवं दशाश्वमेध घाट",
      desc: "संसार की प्राचीनतम जीवंत आध्यात्मिक नगरी काशी का दिव्य केंद्र और मां गंगा की दैनिक महाआरती।",
      coords: [25.3109, 83.0107],
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "काशी विश्वनाथ ज्योतिर्लिंग और दशाश्वमेध घाट भारतीय ज्ञान परंपरा और अध्यात्म का शाश्वत संगम हैं।"
    }
  ],
  amritsar: [
    {
      id: "amr_1",
      category: "major",
      district: "amritsar",
      districtName: "अमृतसर (पंजाब)",
      title: "श्री हरमंदिर साहिब (स्वर्ण मंदिर)",
      desc: "सिख पंथ का सर्वोच्च धर्मस्थल, जो विश्व भर में आध्यात्मिक शांति, सद्भाव और अखंड लंगर सेवा का प्रतीक है।",
      coords: [31.6200, 74.8765],
      image: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=400&q=80",
      bhashiniAudioText: "श्री हरमंदिर साहिब पवित्र अमृत सरोवर के मध्य स्थित है, जहाँ गुरुबाणी का अखंड प्रवाह होता है।"
    }
  ]
};