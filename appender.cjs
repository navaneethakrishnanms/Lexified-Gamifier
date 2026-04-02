const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src/data/local_kg_db.json');
const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newWords = [
  {
    "word": "கண்",
    "pos": "noun",
    "sense": "Eye (body part)",
    "question": "அவனுக்கு வலது ______ வலிக்கிறது.",
    "options": ["கண்", "கண்ணில்", "கண்ணாக", "காது"],
    "answer": "கண்"
  },
  {
    "word": "கண்",
    "pos": "noun",
    "sense": "Center / Joint",
    "question": "மூங்கிலில் பல ______ உள்ளன.",
    "options": ["கண்கள்", "கண்", "இலைகள்", "வேர்"],
    "answer": "கண்கள்"
  },
  {
    "word": "படி",
    "pos": "verb",
    "sense": "to descend / settle (dust)",
    "question": "மேஜை மீது தூசு ______ இருக்கிறது.",
    "options": ["படிந்து", "படித்து", "படிய", "படியில்"],
    "answer": "படிந்து"
  },
  {
    "word": "வீடு",
    "pos": "noun",
    "sense": "House / Home",
    "question": "அவன் புதிய ______ கட்டுகிறான்.",
    "options": ["வீடு", "வீட்டை", "வீட்டுக்கு", "விண்"],
    "answer": "வீடு"
  },
  {
    "word": "வீடு",
    "pos": "noun",
    "sense": "Liberation (spiritual)",
    "question": "அவன் முக்தி அல்லது ______ பெற்றான்.",
    "options": ["வீடுபேறு", "வீடு", "காடு", "நாடு"],
    "answer": "வீடுபேறு"
  },
  {
    "word": "சொல்",
    "pos": "verb",
    "sense": "to speak / say",
    "question": "என்னிடம் உண்மையை ______.",
    "options": ["சொல்", "பேசு", "கூறு", "சொல்லி"],
    "answer": "சொல்"
  },
  {
    "word": "சொல்",
    "pos": "noun",
    "sense": "Word / Term",
    "question": "தமிழில் பல இனிமையான ______ உள்ளன.",
    "options": ["சொற்கள்", "சொல்", "சொல்லி", "பொருள்"],
    "answer": "சொற்கள்"
  },
  {
    "word": "பல்",
    "pos": "noun",
    "sense": "Tooth (body part)",
    "question": "என் தம்பிக்கு ஒரு ______ விழுந்துவிட்டது.",
    "options": ["பல்", "பற்கள்", "வாய்", "கண்"],
    "answer": "பல்"
  },
  {
    "word": "பல்",
    "pos": "adjective",
    "sense": "Many (prefix)",
    "question": "அவர் ______ நூல்களை எழுதியுள்ளார்.",
    "options": ["பல்வேறு", "பல்", "பற்கள்", "சில"],
    "answer": "பல்வேறு"
  },
  {
    "word": "கால்",
    "pos": "noun",
    "sense": "Leg (body part)",
    "question": "அவன் ஓடும்போது ______ முறிந்தது.",
    "options": ["கால்", "கையில்", "தலை", "கண்"],
    "answer": "கால்"
  },
  {
    "word": "கால்",
    "pos": "noun",
    "sense": "Quarter (1/4)",
    "question": "எனக்கு ______ கிலோ சர்க்கரை வேண்டும்.",
    "options": ["கால்", "அரை", "முக்கால்", "பத்து"],
    "answer": "கால்"
  },
  {
    "word": "திங்கள்",
    "pos": "noun",
    "sense": "Month",
    "question": "ஓர் ஆண்டிற்கு பன்னிரண்டு ______.",
    "options": ["திங்கள்", "ஆண்டு", "நாள்", "சனி"],
    "answer": "திங்கள்"
  },
  {
    "word": "திங்கள்",
    "pos": "noun",
    "sense": "Monday",
    "question": "அடுத்த ______ விடுமுறை.",
    "options": ["திங்கள்", "கிழமை", "ஞாயிறு", "ஆண்டு"],
    "answer": "திங்கள்"
  },
  {
    "word": "திங்கள்",
    "pos": "noun",
    "sense": "Moon",
    "question": "வானில் முழு ______ தெரிந்தது.",
    "options": ["திங்கள்", "சூரியன்", "விண்மீன்", "மழை"],
    "answer": "திங்கள்"
  },
  {
    "word": "மரம்",
    "pos": "noun",
    "sense": "Tree",
    "question": "வீட்டின் முன் பெரிய ______ உள்ளது.",
    "options": ["மரம்", "செடி", "கொடி", "கல்"],
    "answer": "மரம்"
  },
  {
    "word": "மரம்",
    "pos": "noun",
    "sense": "Wood / Timber",
    "question": "இந்த நாற்காலி ______ மூலம் செய்யப்பட்டது.",
    "options": ["மரம்", "இரும்பு", "பிளாஸ்டிக்", "கண்ணாடி"],
    "answer": "மரம்"
  },
  {
    "word": "மதி",
    "pos": "noun",
    "sense": "Mind / Intelligence",
    "question": "அவன் மிகவும் நுண்ணிய ______ படைத்தவன்.",
    "options": ["மதி", "அறிவு", "மூளை", "தலை"],
    "answer": "மதி"
  },
  {
    "word": "மதி",
    "pos": "noun",
    "sense": "Moon",
    "question": "இரவில் ______ பிரகாசமாக ஒளிர்கிறது.",
    "options": ["மதி", "சூரியன்", "விண்மீன்", "பகல்"],
    "answer": "மதி"
  },
  {
    "word": "மதி",
    "pos": "verb",
    "sense": "Respect",
    "question": "பெரியவர்களை எப்போதும் ______ நடக்க வேண்டும்.",
    "options": ["மதித்து", "மதி", "மரியாதை", "நினைத்து"],
    "answer": "மதித்து"
  },
  {
    "word": "கலை",
    "pos": "noun",
    "sense": "Art",
    "question": "அவள் ஓவியக் ______ நன்கு கற்றாள்.",
    "options": ["கலையை", "கலை", "பாடம்", "வித்தை"],
    "answer": "கலையை"
  },
  {
    "word": "கலை",
    "pos": "verb",
    "sense": "to disperse / dissolve",
    "question": "கூட்டம் மெதுவாக ______ சென்றது.",
    "options": ["கலைந்து", "கலை", "சேர்ந்து", "கூடி"],
    "answer": "கலைந்து"
  },
  {
    "word": "கலை",
    "pos": "noun",
    "sense": "Deer (Male)",
    "question": "காட்டில் அழகிய ______ மான் ஓடியது.",
    "options": ["கலை", "புலி", "சிங்கம்", "நாய்"],
    "answer": "கலை"
  }
];

const merged = [...currentDb, ...newWords];
const deduped = [];
const seen = new Set();
merged.forEach(item => {
  const hash = item.word + '|' + item.sense;
  if(!seen.has(hash)) {
    seen.add(hash);
    deduped.push(item);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(deduped, null, 2));
console.log('Appended', newWords.length, 'entries to KG. Total size:', deduped.length);
