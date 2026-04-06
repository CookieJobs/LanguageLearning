const mongoose = require("mongoose");
async function check() {
  await mongoose.connect("mongodb://localhost:27017/linguacraft");
  const collection = mongoose.connection.collection("vocabwords");
  
  const primaryCount = await collection.countDocuments({ levels: "Primary" });
  const a1Count = await collection.countDocuments({ levels: "Primary", cefr: "A1" });
  const a2Count = await collection.countDocuments({ levels: "Primary", cefr: "A2" });
  const noneCount = await collection.countDocuments({ levels: "Primary", cefr: "" });

  console.log("Total Primary:", primaryCount);
  console.log("A1:", a1Count);
  console.log("A2:", a2Count);
  console.log("Empty CEFR:", noneCount);
  
  process.exit(0);
}
check();
