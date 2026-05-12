import 'dotenv/config';
import { connect, connection } from 'mongoose';

async function main() {
    const uri = process.env.MONGO_URL;
    if (!uri) { console.error('MONGO_URL not set'); process.exit(1); }
    await connect(uri);

    const collections = await connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const vocabCollection = connection.collection('vocabwords');
    const count = await vocabCollection.countDocuments();
    console.log('vocabwords count:', count);

    const words = await vocabCollection.find({ textbooks: { $exists: true, $not: { $size: 0 } } }).limit(1).toArray();
    console.log('Sample word with textbooks:', words[0] ? words[0].headword : 'None');

    await connection.close();
}
main().catch(console.error);
