import csv
import json
import os
import sys

def main():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    book_csv_path = os.path.join(base_dir, 'data', 'raw', 'DictionaryData', 'book.csv')
    relation_csv_path = os.path.join(base_dir, 'data', 'raw', 'DictionaryData', 'relation_book_word.csv')
    word_csv_path = os.path.join(base_dir, 'data', 'raw', 'DictionaryData', 'word.csv')
    ecdict_csv_path = os.path.join(base_dir, 'data', 'raw', 'ECDICT', 'stardict.csv')
    output_dir = os.path.join(base_dir, 'data', 'processed')
    output_json_path = os.path.join(output_dir, 'elementary_vocabulary.json')

    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Constants
    ELEMENTARY_CATEGORY_ID = "45c48cce2e2d7fbdea1afc51"

    # Step 1: Find books under "小学英语"
    print("Step 1: Finding books under category '小学英语'...")
    elementary_book_ids = set()
    try:
        with open(book_csv_path, 'r', encoding='utf-8') as f:
            # Use '>' as delimiter
            reader = csv.DictReader(f, delimiter='>')
            for row in reader:
                if row['bk_parent_id'] == ELEMENTARY_CATEGORY_ID:
                    elementary_book_ids.add(row['bk_id'])
    except Exception as e:
        print(f"Error reading book.csv: {e}")
        return

    print(f"Found {len(elementary_book_ids)} books.")

    # Step 2: Get word IDs for these books
    print("Step 2: Getting word IDs for these books...")
    elementary_word_ids = set()
    try:
        with open(relation_csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='>')
            for row in reader:
                if row['bv_book_id'] in elementary_book_ids:
                    elementary_word_ids.add(row['bv_voc_id'])
    except Exception as e:
        print(f"Error reading relation_book_word.csv: {e}")
        return

    print(f"Found {len(elementary_word_ids)} unique word IDs.")

    # Step 3: Get word strings
    print("Step 3: Getting word strings...")
    target_words = set()
    try:
        with open(word_csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='>')
            for row in reader:
                if row['vc_id'] in elementary_word_ids:
                    target_words.add(row['vc_vocabulary'])
    except Exception as e:
        print(f"Error reading word.csv: {e}")
        return

    print(f"Found {len(target_words)} unique words.")

    # Step 4: Get details from ECDICT
    print("Step 4: Getting details from ECDICT...")
    vocabulary_list = []
    
    # Create a mapping from word to its data to avoid O(N*M) complexity
    ecdict_data = {}
    
    try:
        # stardict.csv has headers: word,phonetic,definition,translation,pos,collins,oxford,tag,bnc,frq,exchange,detail,audio
        # We need to handle potential quoting issues or large fields
        # Increase field size limit for large CSV fields
        csv.field_size_limit(sys.maxsize)
        
        with open(ecdict_csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Create a lowercase mapping for target words to handle case sensitivity
            target_words_lower = {w.lower(): w for w in target_words}
            
            for row in reader:
                word_raw = row.get('word')
                if not word_raw:
                    continue
                
                word_lower = word_raw.lower()
                
                # Check if this word (case-insensitive) is in our target list
                if word_lower in target_words_lower:
                    original_target_word = target_words_lower[word_lower]
                    
                    ecdict_data[original_target_word] = {
                        "word": original_target_word,
                        "phonetic": row.get('phonetic', ''),
                        "definition": row.get('definition', ''),
                        "translation": row.get('translation', ''),
                        "tags": row.get('tag', ''),
                        "collins": row.get('collins', ''),
                        "oxford": row.get('oxford', '')
                    }
    except Exception as e:
        print(f"Error reading ecdict.csv: {e}")
        # Continue execution to generate partial data if possible
    
    # Step 5: Merge data
    print("Step 5: Merging data...")
    for word in target_words:
        if word in ecdict_data:
            vocabulary_list.append(ecdict_data[word])
        else:
            # Word not found in ECDICT
            vocabulary_list.append({
                "word": word,
                "phonetic": "",
                "definition": "",
                "translation": "",
                "tags": "",
                "collins": "",
                "oxford": ""
            })

    print(f"Total vocabulary size: {len(vocabulary_list)}")
    found_count = len(ecdict_data)
    print(f"Words found in ECDICT: {found_count}")
    print(f"Words not found in ECDICT: {len(vocabulary_list) - found_count}")

    # Step 6: Generate JSON
    print("Step 6: Generating JSON...")
    try:
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(vocabulary_list, f, ensure_ascii=False, indent=2)
        print(f"Successfully generated {output_json_path}")
    except Exception as e:
        print(f"Error writing JSON: {e}")

if __name__ == "__main__":
    main()
