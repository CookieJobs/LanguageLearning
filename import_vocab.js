const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB 连接 URL
const mongoUrl = 'mongodb://mongo:27017/linguacraft';

// 词汇数据文件路径
const vocabFile = path.join(__dirname, 'data/vocab/words.json');

// 定义词汇模型
const vocabWordSchema = new mongoose.Schema({
  headword: String,
  lemma: String,
  pos: String,
  cefr: String,
  freqRank: Number,
  definitionEn: String,
  definitionZh: String,
  exampleEn: String,
  ipa: String,
  audioUrl: String,
  topics: [String],
  levels: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 创建唯一索引
vocabWordSchema.index({ lemma: 1, pos: 1 }, { unique: true });
vocabWordSchema.index({ headword: 1 });
vocabWordSchema.index({ cefr: 1 });

const VocabWord = mongoose.model('VocabWord', vocabWordSchema);

async function importVocabData() {
  try {
    console.log('连接到 MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('MongoDB 连接成功');

    // 读取词汇数据
    console.log('读取词汇数据文件...');
    const rawData = fs.readFileSync(vocabFile, 'utf-8');
    const vocabItems = JSON.parse(rawData);
    console.log(`读取到 ${vocabItems.length} 个词汇`);

    // 清空现有数据
    console.log('清空现有词汇数据...');
    await VocabWord.deleteMany({});
    console.log('现有数据已清空');

    // 批量插入数据
    console.log('开始导入词汇数据...');
    const batchSize = 50;
    let importedCount = 0;

    for (let i = 0; i < vocabItems.length; i += batchSize) {
      const batch = vocabItems.slice(i, i + batchSize);
      const formattedBatch = batch.map(item => ({
        headword: item.headword,
        lemma: item.lemma,
        pos: item.pos,
        cefr: item.cefr,
        freqRank: item.freq_rank || item.freqRank,
        definitionEn: item.definition_en || item.definitionEn,
        definitionZh: item.definition_zh || item.definitionZh,
        exampleEn: item.example_en || item.exampleEn,
        ipa: item.ipa || '',
        audioUrl: item.audioUrl || '',
        topics: item.topics || [],
        levels: item.levels || []
      }));

      await VocabWord.insertMany(formattedBatch, { ordered: false });
      importedCount += batch.length;
      console.log(`已导入 ${importedCount}/${vocabItems.length} 个词汇`);
    }

    console.log('词汇数据导入完成！');
    
    // 验证导入结果
    const count = await VocabWord.countDocuments();
    console.log(`数据库中共有 ${count} 个词汇记录`);

    // 显示统计信息
    const stats = await VocabWord.aggregate([
      {
        $group: {
          _id: '$cefr',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n按CEFR级别统计:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 个单词`);
    });

  } catch (error) {
    console.error('导入过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 连接已关闭');
  }
}

// 运行导入函数
importVocabData();