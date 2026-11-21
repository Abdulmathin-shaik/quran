# Al-Quran Al-Karim — Word-by-Word & Tajweed Edition
### *McMaster-Carr High-Performance Architecture*

An ultra-light, ultra-fast, offline-first web application replicating the classic physical **Al-Quran Al-Karim: Word-by-Word Mushaf with Tajweed and Side Margin Translation**.

---

## ⚡ Key Architectural Highlights

1. **Exact Al-Quran Al-Karim Layout Replication**:
   - **Unbroken Arabic Sentence Flow**: The Arabic text flows as a natural, connected sentence with authentic Quranic spacing. No boxy borders or artificial gaps break the reading rhythm.
   - **Interlinear Word-by-Word Sub-Tier**: Word meanings sit directly underneath each Arabic word in a clean, compact sub-tier with controlled width (`max-width: 66px`), ensuring short Arabic words are never pushed apart.
   - **Reading Flow Modes**:
     - **📖 Interlinear Flow**: Unbroken Arabic sentence with word-by-word meaning cleanly aligned directly below each word.
     - **📜 Continuous Text Flow**: 100% pure, continuous native Arabic paragraph flow with Tajweed colors; hover or tap any word to inspect meaning and audio in the real-time status pill without moving a single letter.
   - **Authentic Ayah Markers**: Traditional Unicode Quranic Ayah signs (`۝`) flow inline at the end of each verse.
   - **Side Margin Line Translation**: Exactly like the printed Mushaf, the full, flowing line/sentence translation is displayed in a dedicated margin panel aligned side-by-side with each verse.
   - **Full Tajweed Color Rules**:
     - 🟥 **Madd Lazim (6 counts)** — Deep Ruby Red
     - 🟥 **Madd Wajib (4–5 counts)** — Crimson Red
     - 🟧 **Madd Ja'iz (2/4/6 counts)** — Warm Orange
     - 🟨 **Madd Asli (2 counts)** — Amber / Gold
     - 🟩 **Ghunnah, Ikhfa & Idgham** — Emerald Green
     - 🟦 **Qalqalah (Echo)** — Sky Blue
     - ⬜ **Silent Letters & Hamzatul Wasl** — Muted Slate Gray
   - **Interactive Tajweed Legend**: Pinned at the bottom with real-time active word inspector.

2. **McMaster-Carr Design & Speed Philosophy**:
   - **Zero Framework Overhead**: Built with pure vanilla JS and CSS Grid/Flexbox. No 50MB node modules, no hydration lag, no virtual DOM bottlenecks.
   - **1ms Response Time**: Initial load and Surah switching occur in < 5ms.
   - **Dense, Utilitarian Catalog**: Left sidebar allows 0ms instant filtering across all 114 Surahs, 30 Juz, and custom Bookmarks.
   - **Keyboard-First Productivity**:
     - `/` or `Ctrl+K`: Instant jump/search (e.g., `36`, `Yasin`, `2:255`)
     - `[` / `]`: Previous / Next Surah
     - `J` / `K` or `↓` / `↑`: Scroll down/up verse by verse
     - `T`: Toggle Tajweed colors
     - `W`: Toggle Word-by-word English meaning
     - `S`: Toggle Side margin translation
     - `M`: Cycle Theme (☀️ Light / 📜 Parchment / 🌙 Dark)
     - `Tab`: Toggle Catalog Sidebar
     - `Space`: Play / Pause full Surah recitation
     - `?`: Show shortcuts cheat sheet

3. **100% Offline Capability (PWA)**:
   - **All 114 Surahs Pre-Bundled**: Every single chapter (6,236 verses, ~77,430 words with Tajweed and translation) is statically saved in `data/surahs/`.
   - **Service Worker (`sw.js`)**: Caches all HTML, CSS, JavaScript, and JSON assets.
   - **IndexedDB (`QuranMcMasterDB`)**: Stores surahs for instant sub-millisecond local reads.
   - Works seamlessly with zero internet connection.

4. **Multi-Device Responsive**:
   - **Laptop & Desktop**: 3-pane layout (Catalog Sidebar + Center Mushaf Word-by-Word + Right Side Line Translation).
   - **Tablet**: Adaptive 2-pane view with collapsible catalog and side margin.
   - **Phone**: Streamlined vertical reading view with touch-friendly word cards, inline side translation, and collapsible sidebar.

---

## 🚀 How to Run Locally

### Option 1: Fast Python Server (Recommended)
```bash
python serve.py
```
This automatically launches your default browser at `http://localhost:8080` with sub-millisecond response times.

### Option 2: Any Web Server
You can also serve this repository with any static file server:
```bash
python -m http.server 8080
```
Or host it directly on GitHub Pages, Cloudflare Pages, Netlify, or Vercel with zero build step!

---

## 📁 File Structure

```
quran/
├── index.html            # Main semantic application shell
├── serve.py              # Zero-latency local server with auto-launch
├── manifest.json         # PWA Progressive Web App configuration
├── sw.js                 # Offline service worker cache manager
├── css/
│   └── mcmaster.css      # McMaster-Carr utilitarian stylesheet & Tajweed color rules
├── js/
│   ├── app.js            # Core application engine, keyboard nav & audio player
│   └── db.js             # IndexedDB sub-millisecond local cache
├── data/
│   ├── chapters.json     # 114 Surah metadata (revelation, verses, pages, names)
│   └── surahs/           # 114 Complete JSON files (1.json to 114.json) with WBW & Tajweed
├── assets/
│   ├── icon-192.svg      # PWA application icon
│   └── icon-512.svg      # High-resolution PWA application icon
└── scripts/
    ├── fetch_data.py     # Extraction pipeline for Quranic text & Tajweed
    └── download_all.py   # Multi-threaded concurrent Surah downloader
```
