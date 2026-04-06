const mongoose = require("mongoose");
const fs = require("fs");

async function check() {
  await mongoose.connect("mongodb://localhost:27017/linguacraft");
  const collection = mongoose.connection.collection("vocabwords");
  const words = await collection.find({ levels: "Primary" }).toArray();
  
  const wordCounts = {};
  words.forEach(w => {
    const key = w.lemma + '|' + w.pos;
    wordCounts[key] = (wordCounts[key] || 0) + 1;
  });
  
  let dups = 0;
  for (let k in wordCounts) {
    if (wordCounts[k] > 1) {
      dups += (wordCounts[k] - 1);
    }
  }
  console.log("Duplicate lemma+pos in DB:", dups);

  const data = JSON.parse(fs.readFileSync("../data/processed/elementary_vocabulary.json", "utf-8"));
  const invalidWords = new Set(data.filter(item => !item.word || !item.translation).map(d => d.word));
  
  let dbInInvalid = 0;
  for (let w of words) {
    if (invalidWords.has(w.lemma) || invalidWords.has(w.headword)) {
      dbInInvalid++;
    }
  }
  console.log("DB words that are in the INVALID set of JSON:", dbInInvalid);
  process.exit(0);
}
check().catch(console.error);
