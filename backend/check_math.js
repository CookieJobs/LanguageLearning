const mongoose = require("mongoose");
const fs = require("fs");

async function check() {
  await mongoose.connect("mongodb://localhost:27017/linguacraft");
  const collection = mongoose.connection.collection("vocabwords");
  const words = await collection.find({ levels: "Primary" }).toArray();
  
  const data = JSON.parse(fs.readFileSync("../data/processed/elementary_vocabulary.json", "utf-8"));
  const jsonWords = new Set(data.map(d => d.word));
  
  let inJson = 0;
  let notInJson = 0;
  
  for (let w of words) {
    if (jsonWords.has(w.lemma) || jsonWords.has(w.headword)) {
      inJson++;
    } else {
      notInJson++;
    }
  }
  
  console.log("Total DB Primary:", words.length);
  console.log("DB Primary in JSON:", inJson);
  console.log("DB Primary NOT in JSON:", notInJson);

  process.exit(0);
}
check().catch(console.error);
