import urllib.request
import json
import time
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def clean_side_trans(text):
    if not text:
        return ''
    text = re.sub(r'<sup[^>]*>.*?</sup>', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

def fetch_surah(chapter_id, retries=3):
    url = f'https://api.quran.com/api/v4/verses/by_chapter/{chapter_id}?words=true&word_fields=text_uthmani,text_uthmani_tajweed,translation,transliteration,audio_url&translations=20&per_page=300'
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
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
            return chapter_id, processed_verses
        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed to fetch Surah {chapter_id}: {e}")
                raise
            time.sleep(1 + attempt)

def main():
    os.makedirs('data/surahs', exist_ok=True)
    # Check which surahs are missing
    needed = [i for i in range(1, 115) if not os.path.exists(f'data/surahs/{i}.json')]
    print(f"Surahs to download: {len(needed)} of 114")
    if not needed:
        print("All surahs already downloaded.")
        return

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_surah, cid): cid for cid in needed}
        done_count = 0
        for future in as_completed(futures):
            cid = futures[future]
            try:
                cid, verses = future.result()
                with open(f'data/surahs/{cid}.json', 'w', encoding='utf-8') as f:
                    json.dump(verses, f, ensure_ascii=False)
                done_count += 1
                if done_count % 10 == 0 or done_count == len(needed):
                    print(f"Progress: {done_count}/{len(needed)} surahs downloaded.")
            except Exception as e:
                print(f"Error on Surah {cid}: {e}")

if __name__ == '__main__':
    main()
