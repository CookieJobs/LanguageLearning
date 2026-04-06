# 修改 generate-contextual-defs.ts 计划 (generate_plan.md)

## 1. 现状分析
当前 `backend/scripts/generate-contextual-defs.ts` 脚本中的 `main` 函数如下：
```typescript
async function main() {
    await mongoose.connect(MONGO_URL);
    loadCache();

    const textbooks: string[] = JSON.parse(fs.readFileSync(TEXTBOOKS_FILE, 'utf-8'));
    
    const targetBook = "人教版三年级起点三年级上";
    if (textbooks.includes(targetBook)) {
        await processTextbook(targetBook);
    } else {
        console.log(`Target book "${targetBook}" not found in list.`);
    }

    // If we want to run ALL, we would do:
    // for (const book of textbooks) { 
    //     await processTextbook(book); 
    // }

    await mongoose.disconnect();
}
```
这段代码旨在仅处理一本测试教材，但现在我们需要全量生成例句。

## 2. 修改步骤
我们需要将 `main` 函数修改为遍历 `textbooks` 数组中的每一项，并在循环中添加进度输出和异常捕获机制，以防止单本教材处理失败导致整个脚本终止。

修改后的 `main` 函数应该类似于：
```typescript
async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB.');
        loadCache();

        if (!fs.existsSync(TEXTBOOKS_FILE)) {
            throw new Error(`Textbooks file not found at ${TEXTBOOKS_FILE}`);
        }
        const textbooks: string[] = JSON.parse(fs.readFileSync(TEXTBOOKS_FILE, 'utf-8'));
        
        console.log(`Total textbooks found: ${textbooks.length}`);

        for (let i = 0; i < textbooks.length; i++) {
            const book = textbooks[i];
            console.log(`\n--------------------------------------------------`);
            console.log(`Progress: [${i + 1}/${textbooks.length}]`);
            console.log(`Target: ${book}`);
            console.log(`--------------------------------------------------`);
            
            try {
                await processTextbook(book);
            } catch (error) {
                console.error(`Failed to process "${book}":`, error);
            }
        }

        console.log('\nProcessing complete!');
    } catch (error) {
        console.error('Fatal error in main:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}
```

## 3. 风险与缓解
- **API 限制与计费**: DeepSeek API 有请求频率和 token 数量限制，以及计费问题。处理全量 151 本教材会消耗一定时间，但代码中已有 `await new Promise(resolve => setTimeout(resolve, 1000));` 延时控制，且有 `contextual_defs_cache.json` 缓存机制，因此如果被限制中断，可以随时恢复执行。
- **长时间运行**: 建议直接在终端运行脚本并观察进度，由于脚本有良好的日志输出，可以清晰地看到进度。
