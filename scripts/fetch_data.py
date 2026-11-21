import urllib.request
import json
import time
import os
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def clean_side_trans(text):
    if not text:
        return ''
    # Strip footnote tags like <sup foot_note=123>1</sup>
    text = re.sub(r'<sup[^>]*>.*?</sup>', '', text)
    # Strip any extra html tags but preserve clean text
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

def fetch_chapters():
    url = 'https://api.quran.com/api/v4/chapters?language=en'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data['chapters']

def fetch_surah(chapter_id):
    url = f'https://api.quran.com/api/v4/verses/by_chapter/{chapter_id}?words=true&word_fields=text_uthmani,text_uthmani_tajweed,translation,transliteration,audio_url&translations=20&per_page=300'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    
    verses = data.get('verses', [])
    processed_verses = []
    
    for v in verses:
        side_raw = ''
        if v.get('translations') and len(v['translations']) > 0:
            side_raw = v['translations'][0].get('text', '')
        
        verse_obj = {
            'id': v['verse_number'],
            'key': v['verse_key'],
            'juz': v['juz_number'],
            'page': v['page_number'],
            'side_trans': clean_side_trans(side_raw),
            'words': []
        }
        
        for w in v.get('words', []):
            ctype = w.get('char_type_name')
            if ctype == 'end':
                verse_obj['words'].append({
                    'type': 'end',
                    'num': w.get('text_uthmani', str(v['verse_number']))
                })
            elif ctype == 'word':
                verse_obj['words'].append({
                    'type': 'word',
                    'ar': w.get('text_uthmani', ''),
                    'tajweed': w.get('text_uthmani_tajweed') or w.get('text_uthmani', ''),
                    'en': (w.get('translation') or {}).get('text', ''),
                    'tr': (w.get('transliteration') or {}).get('text', ''),
                    'audio': w.get('audio_url')
                })
        processed_verses.append(verse_obj)
    
    return processed_verses

if __name__ == '__main__':
    os.makedirs('data/surahs', exist_ok=True)
    print("Fetching chapter metadata...")
    chapters = fetch_chapters()
    with open('data/chapters.json', 'w', encoding='utf-8') as f:
        json.dump(chapters, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(chapters)} chapters to data/chapters.json")

    # Test fetching Surahs 1, 2, 36, 67, 112, 113, 114
    test_ids = [1, 2, 36, 67, 112, 113, 114]
    for cid in test_ids:
        print(f"Fetching Surah {cid}...")
        v = fetch_surah(cid)
        with open(f'data/surahs/{cid}.json', 'w', encoding='utf-8') as f:
            json.dump(v, f, ensure_ascii=False)
        print(f"Saved Surah {cid} ({len(v)} verses)")
