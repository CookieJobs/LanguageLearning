# Data Documentation

## Overview

This directory contains data used by the LanguageLearning application.

## Directory Structure

```
data/
├── raw/                # Original, immutable data
│   ├── DictionaryData/ # Structure and relations (books, categories, word lists)
│   └── ECDICT/         # Detailed dictionary data (definitions, phonetics)
└── processed/          # Generated data ready for the application
    └── elementary_vocabulary.json
```

## Data Sources

1.  **DictionaryData**: Provides the hierarchical structure of textbooks and word lists.
    *   Source: [Skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) (and related projects)
    *   Key files:
        *   `book.csv`: Definitions of books and categories.
        *   `relation_book_word.csv`: Mapping between books and words.
        *   `word.csv`: Basic word list.

2.  **ECDICT**: Provides detailed definitions, phonetics, and translations.
    *   Source: [Skywind3000/ECDICT](https://github.com/skywind3000/ECDICT)
    *   Key file: `ecdict.csv`

## Generated Data

### `data/processed/elementary_vocabulary.json`

This file contains the vocabulary list for "Elementary English" (小学英语) textbooks.

*   **Source Logic**:
    *   Selects books with `parent_id` matching "小学英语" category (`45c48cce2e2d7fbdea1afc51`).
    *   Extracts all unique words associated with these books.
    *   Enriches word data (phonetic, definition) using ECDICT.

*   **Format**: JSON Array
    ```json
    [
      {
        "word": "apple",
        "phonetic": "'æpl",
        "definition": "n. 苹果",
        "translation": "n. 苹果"
      },
      ...
    ]
    ```

## How to Regenerate

To regenerate `data/processed/elementary_vocabulary.json` from the raw data:

1.  Ensure you have the raw data in `data/raw/DictionaryData` and `data/raw/ECDICT`.
2.  Run the generation script:

    ```bash
    python3 scripts/generate_vocabulary.py
    ```

3.  The script will:
    *   Filter books by category.
    *   Map words to books.
    *   Look up definitions in ECDICT.
    *   Output the JSON file to `data/processed/`.
