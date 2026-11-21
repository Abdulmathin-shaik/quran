/**
 * AL-QURAN AL-KARIM — MCMASTER SPEED ENGINE
 * Word-by-Word with Tajweed & Side Margin Line Translation
 */

(function () {
  'use strict';

  // State
  const state = {
    chapters: [],
    currentSurahId: 1,
    currentAyahId: 1,
    surahData: null,
    activeTab: 'surahs',
    tajweedEnabled: true,
    wbwEnabled: true,
    translitEnabled: false,
    marginEnabled: true,
    flowMode: 'interlinear', // 'interlinear' or 'pure'
    sidebarOpen: true,
    arabicFontSize: 32,
    theme: 'parchment', // 'parchment' (default physical Mushaf), 'light', 'dark'
    isPlayingRecitation: false,
    bookmarks: [],
    wordAudio: new Audio()
  };

  // DOM Elements
  const DOM = {
    header: document.getElementById('app-header'),
    layout: document.getElementById('app-layout'),
    sidebar: document.getElementById('sidebar-catalog'),
    catalogList: document.getElementById('catalog-list'),
    catalogFilter: document.getElementById('catalog-filter'),
    catalogTabs: document.querySelectorAll('.tab-btn'),
    mushafContainer: document.getElementById('mushaf-container'),
    versesStream: document.getElementById('verses-stream'),
    marginPanel: document.getElementById('margin-panel'),
    marginList: document.getElementById('margin-list'),
    marginCount: document.getElementById('margin-meta-count'),
    
    // Banner
    bannerEn: document.getElementById('banner-en'),
    bannerAr: document.getElementById('banner-ar'),
    metaRevelation: document.getElementById('meta-revelation'),
    metaVerses: document.getElementById('meta-verses'),
    metaJuz: document.getElementById('meta-juz'),
    metaPage: document.getElementById('meta-page'),
    bannerBismillah: document.getElementById('banner-bismillah'),

    // Controls
    globalSearch: document.getElementById('global-search'),
    surahSelect: document.getElementById('quick-surah-select'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnHome: document.getElementById('btn-home'),
    btnToggleFlowMode: document.getElementById('btn-toggle-flow-mode'),
    flowModeLabel: document.getElementById('flow-mode-label'),
    btnToggleTajweed: document.getElementById('btn-toggle-tajweed'),
    btnToggleWbw: document.getElementById('btn-toggle-wbw'),
    btnToggleTranslit: document.getElementById('btn-toggle-translit'),
    btnToggleMargin: document.getElementById('btn-toggle-margin'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontInc: document.getElementById('btn-font-inc'),
    btnCycleTheme: document.getElementById('btn-cycle-theme'),
    themeIcon: document.getElementById('theme-icon'),
    btnPlaySurah: document.getElementById('btn-play-surah'),
    playerBtnLabel: document.getElementById('player-btn-label'),
    audioPlayer: document.getElementById('audio-player'),
    offlineIndicator: document.getElementById('offline-indicator'),
    btnHelp: document.getElementById('btn-help'),
    helpModal: document.getElementById('help-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),

    // Word Live Inspector
    wordInspector: document.getElementById('word-inspector'),
    inspAr: document.getElementById('insp-ar'),
    inspTr: document.getElementById('insp-tr'),
    inspEn: document.getElementById('insp-en')
  };

  // Juz start mapping (Surah, Ayah)
  const JUZ_MAPPING = [
    { juz: 1, surah: 1, ayah: 1, name: "Al-Fatihah 1:1" },
    { juz: 2, surah: 2, ayah: 142, name: "Al-Baqarah 2:142" },
    { juz: 3, surah: 2, ayah: 253, name: "Al-Baqarah 2:253" },
    { juz: 4, surah: 3, ayah: 93, name: "Ali 'Imran 3:93" },
    { juz: 5, surah: 4, ayah: 24, name: "An-Nisa 4:24" },
    { juz: 6, surah: 4, ayah: 148, name: "An-Nisa 4:148" },
    { juz: 7, surah: 5, ayah: 82, name: "Al-Ma'idah 5:82" },
    { juz: 8, surah: 6, ayah: 111, name: "Al-An'am 6:111" },
    { juz: 9, surah: 7, ayah: 88, name: "Al-A'raf 7:88" },
    { juz: 10, surah: 8, ayah: 41, name: "Al-Anfal 8:41" },
    { juz: 11, surah: 9, ayah: 93, name: "At-Tawbah 9:93" },
    { juz: 12, surah: 11, ayah: 6, name: "Hud 11:6" },
    { juz: 13, surah: 12, ayah: 53, name: "Yusuf 12:53" },
    { juz: 14, surah: 15, ayah: 1, name: "Al-Hijr 15:1" },
    { juz: 15, surah: 17, ayah: 1, name: "Al-Isra 17:1" },
    { juz: 16, surah: 18, ayah: 75, name: "Al-Kahf 18:75" },
    { juz: 17, surah: 21, ayah: 1, name: "Al-Anbya 21:1" },
    { juz: 18, surah: 23, ayah: 1, name: "Al-Mu'minun 23:1" },
    { juz: 19, surah: 25, ayah: 21, name: "Al-Furqan 25:21" },
    { juz: 20, surah: 27, ayah: 56, name: "An-Naml 27:56" },
    { juz: 21, surah: 29, ayah: 46, name: "Al-'Ankabut 29:46" },
    { juz: 22, surah: 33, ayah: 31, name: "Al-Ahzab 33:31" },
    { juz: 23, surah: 36, ayah: 28, name: "Ya-Sin 36:28" },
    { juz: 24, surah: 39, ayah: 32, name: "Az-Zumar 39:32" },
    { juz: 25, surah: 41, ayah: 47, name: "Fussilat 41:47" },
    { juz: 26, surah: 46, ayah: 1, name: "Al-Ahqaf 46:1" },
    { juz: 27, surah: 51, ayah: 31, name: "Adh-Dhariyat 51:31" },
    { juz: 28, surah: 58, ayah: 1, name: "Al-Mujadila 58:1" },
    { juz: 29, surah: 67, ayah: 1, name: "Al-Mulk 67:1" },
    { juz: 30, surah: 78, ayah: 1, name: "An-Naba 78:1" }
  ];

  /* --------------------------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------------------------- */
  async function init() {
    // Register Service Worker for offline capability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    // Load saved settings
    if (window.quranDB) {
      const savedTheme = await window.quranDB.getSetting('theme', 'light');
      setTheme(savedTheme);
      const savedFont = await window.quranDB.getSetting('fontSize', 32);
      setFontSize(savedFont);
      const savedBookmarks = await window.quranDB.getSetting('bookmarks', []);
      state.bookmarks = savedBookmarks;
      const lastSurah = await window.quranDB.getSetting('lastSurah', 1);
      state.currentSurahId = lastSurah;
    }

    // Fetch chapters list
    try {
      const resp = await fetch('data/chapters.json');
      state.chapters = await resp.json();
      populateSurahDropdown();
      renderCatalog();
    } catch (e) {
      console.error('Failed to load chapters:', e);
    }

    // Render initial Surah
    await loadSurah(state.currentSurahId);

    // Setup event listeners
    setupEventListeners();
  }

  /* --------------------------------------------------------------------------
     SURAH DROPDOWN & CATALOG
     -------------------------------------------------------------------------- */
  function populateSurahDropdown() {
    DOM.surahSelect.innerHTML = state.chapters.map(c => 
      `<option value="${c.id}">${c.id}. ${c.name_simple} (${c.name_arabic})</option>`
    ).join('');
    DOM.surahSelect.value = state.currentSurahId;
  }

  function renderCatalog(filter = '') {
    filter = filter.trim().toLowerCase().replace(/[\/\\\s]+$/, '');
    const cleanFilter = filter.replace(/[-_\s]/g, '');
    DOM.catalogList.innerHTML = '';

    if (state.activeTab === 'surahs') {
      const fragment = document.createDocumentFragment();
      const filtered = state.chapters.filter(c => {
        if (!filter) return true;
        const simple = c.name_simple.toLowerCase().replace(/[-_\s]/g, '');
        return (
          c.id.toString() === filter ||
          simple.includes(cleanFilter) ||
          c.name_simple.toLowerCase().includes(filter) ||
          c.translated_name.name.toLowerCase().includes(filter) ||
          c.name_arabic.includes(filter)
        );
      });

      filtered.forEach(c => {
        const item = document.createElement('div');
        item.className = `catalog-item ${c.id === state.currentSurahId ? 'active' : ''}`;
        item.dataset.surahId = c.id;
        item.innerHTML = `
          <span class="item-id">${c.id}</span>
          <div class="item-info">
            <div class="item-name-en">${c.name_simple}</div>
            <div class="item-name-sub">${c.translated_name.name} • ${c.verses_count}v</div>
          </div>
          <span class="item-arabic">${c.name_arabic}</span>
        `;
        item.addEventListener('click', () => {
          loadSurah(c.id);
          if (window.innerWidth <= 680) {
            DOM.sidebar.classList.remove('open');
          }
        });
        fragment.appendChild(item);
      });
      DOM.catalogList.appendChild(fragment);
    } 
    else if (state.activeTab === 'juz') {
      const fragment = document.createDocumentFragment();
      JUZ_MAPPING.forEach(j => {
        if (filter && !j.juz.toString().includes(filter) && !j.name.toLowerCase().includes(filter)) {
          return;
        }
        const item = document.createElement('div');
        item.className = 'catalog-item';
        item.innerHTML = `
          <span class="item-id">J${j.juz}</span>
          <div class="item-info">
            <div class="item-name-en">Juz ${j.juz}</div>
            <div class="item-name-sub">${j.name}</div>
          </div>
          <span class="item-arabic" style="font-size:13px; font-family:var(--font-mono);">Ayah ${j.ayah}</span>
        `;
        item.addEventListener('click', () => {
          loadSurah(j.surah, j.ayah);
          if (window.innerWidth <= 680) {
            DOM.sidebar.classList.remove('open');
          }
        });
        fragment.appendChild(item);
      });
      DOM.catalogList.appendChild(fragment);
    } 
    else if (state.activeTab === 'bookmarks') {
      if (state.bookmarks.length === 0) {
        DOM.catalogList.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:12px;">No bookmarks saved yet. Click the bookmark icon on any ayah to save.</div>`;
        return;
      }
      const fragment = document.createDocumentFragment();
      state.bookmarks.forEach(bm => {
        const item = document.createElement('div');
        item.className = 'catalog-item';
        item.innerHTML = `
          <span class="item-id" style="color:var(--brand-yellow);">★</span>
          <div class="item-info">
            <div class="item-name-en">Surah ${bm.surahName} (${bm.key})</div>
            <div class="item-name-sub">${bm.text ? bm.text.slice(0, 45) + '...' : ''}</div>
          </div>
          <button class="verse-btn btn-del-bm" title="Remove bookmark" style="color:var(--text-light);">&times;</button>
        `;
        item.querySelector('.item-info').addEventListener('click', () => {
          loadSurah(bm.surahId, bm.ayahNumber);
        });
        item.querySelector('.btn-del-bm').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleBookmark(bm.surahId, bm.ayahNumber, bm.key, bm.text);
          renderCatalog();
        });
        fragment.appendChild(item);
      });
      DOM.catalogList.appendChild(fragment);
    }
  }

  /* --------------------------------------------------------------------------
     SURAH LOADING & RENDERING (Sub-millisecond)
     -------------------------------------------------------------------------- */
  async function loadSurah(surahId, targetAyahNumber = null) {
    surahId = Number(surahId);
    state.currentSurahId = surahId;
    DOM.surahSelect.value = surahId;

    if (window.quranDB) {
      window.quranDB.saveSetting('lastSurah', surahId);
    }

    // Update active state in catalog
    const currentActive = DOM.catalogList.querySelector('.catalog-item.active');
    if (currentActive) currentActive.classList.remove('active');
    const newActive = DOM.catalogList.querySelector(`.catalog-item[data-surah-id="${surahId}"]`);
    if (newActive) newActive.classList.add('active');

    // Update banner metadata if present
    const chapter = state.chapters.find(c => c.id === surahId);
    if (chapter) {
      if (DOM.bannerEn) DOM.bannerEn.textContent = `${chapter.id}. ${chapter.name_simple} (${chapter.translated_name.name})`;
      if (DOM.bannerAr) DOM.bannerAr.textContent = chapter.name_arabic;
      if (DOM.metaRevelation) DOM.metaRevelation.textContent = chapter.revelation_place.toUpperCase();
      if (DOM.metaVerses) DOM.metaVerses.textContent = `${chapter.verses_count} VERSES`;
      if (DOM.metaPage) DOM.metaPage.textContent = `PAGE ${chapter.pages[0]}`;
      if (DOM.bannerBismillah) {
        DOM.bannerBismillah.style.display = (surahId === 9 || surahId === 1) ? 'none' : 'block';
      }
    }

    // Try IndexedDB first for 0ms retrieval, otherwise fetch JSON
    let verses = null;
    if (window.quranDB) {
      verses = await window.quranDB.getSurah(surahId);
    }

    if (!verses) {
      try {
        const resp = await fetch(`data/surahs/${surahId}.json`);
        verses = await resp.json();
        if (window.quranDB) {
          window.quranDB.saveSurah(surahId, verses);
        }
      } catch (err) {
        console.error('Error fetching surah:', err);
        DOM.versesStream.innerHTML = `<div style="padding:30px; text-align:center; color:red;">Failed to load Surah ${surahId}. Check offline cache.</div>`;
        return;
      }
    }

    state.surahData = verses;
    renderVersesAndMargin(verses, targetAyahNumber);
  }

  function renderVersesAndMargin(verses, targetAyahNumber = null) {
    const versesFragment = document.createDocumentFragment();
    const marginFragment = document.createDocumentFragment();

    DOM.marginCount.textContent = `${verses.length} Ayahs`;

    const chapter = state.chapters.find(c => c.id === state.currentSurahId) || {
      name_simple: `Surah ${state.currentSurahId}`,
      name_arabic: '',
      translated_name: { name: '' },
      revelation_place: '',
      verses_count: verses.length
    };

    // ========================================================================
    // 1. THE CONTINUOUS MUSHAF PAGE FRAME (EXACT REPLICATION OF IMAGE 2)
    // ========================================================================
    const pageFrame = document.createElement('div');
    pageFrame.className = 'mushaf-page-frame';

    // Surah Calligraphy Plaque Header
    const plaqueHeader = document.createElement('div');
    plaqueHeader.className = 'mushaf-frame-header';
    plaqueHeader.innerHTML = `
      <div class="surah-plaque">
        <h1>سُورَةُ ${chapter.name_arabic}</h1>
        <h2>${chapter.id}. ${chapter.name_simple} (${chapter.translated_name.name}) • ${chapter.revelation_place.toUpperCase()} • ${chapter.verses_count} VERSES</h2>
      </div>
    `;
    pageFrame.appendChild(plaqueHeader);

    // Bismillah row (except Surah 9 At-Tawbah and Surah 1 where Bismillah is Ayah 1)
    if (state.currentSurahId !== 9 && state.currentSurahId !== 1) {
      const bismillahRow = document.createElement('div');
      bismillahRow.className = 'mushaf-bismillah-row';
      bismillahRow.innerHTML = `
        <div style="direction: rtl; display: inline-flex; justify-content: center; align-items: flex-start; gap: 8px;">
          <span class="mushaf-word-unit">
            <span class="mushaf-word-ar">بِسۡمِ</span>
            <span class="mushaf-word-en">In (the) name</span>
          </span>
          <span class="mushaf-word-unit">
            <span class="mushaf-word-ar"><rule class="ham_wasl">ٱ</rule>للَّهِ</span>
            <span class="mushaf-word-en">(of) Allah</span>
          </span>
          <span class="mushaf-word-unit">
            <span class="mushaf-word-ar"><rule class="ham_wasl">ٱ</rule><rule class="laam_shamsiyah">ل</rule>رَّحۡمَ<rule class="madda_normal">ـٰ</rule>نِ</span>
            <span class="mushaf-word-en">the Most Gracious</span>
          </span>
          <span class="mushaf-word-unit">
            <span class="mushaf-word-ar"><rule class="ham_wasl">ٱ</rule><rule class="laam_shamsiyah">ل</rule>رَّح<rule class="madda_permissible">ِي</rule>مِ</span>
            <span class="mushaf-word-en">the Most Merciful</span>
          </span>
        </div>
        <div class="bismillah-trans">In the name of Allah, the Entirely Merciful, the Especially Merciful</div>
      `;
      pageFrame.appendChild(bismillahRow);
    }

    // Continuous Arabic Flow Container (All Verses Flow Unbroken)
    const flowContainer = document.createElement('div');
    flowContainer.className = 'mushaf-continuous-flow';

    // Bottom Running Translations List (Inside or directly below the frame)
    const transSection = document.createElement('div');
    transSection.className = 'mushaf-translations-section';
    transSection.innerHTML = `
      <div class="mushaf-trans-heading">
        <span>Translation — ${chapter.name_simple} (${chapter.translated_name.name})</span>
        <span style="font-family:var(--font-mono); font-size:11px;">${verses.length} Verses</span>
      </div>
      <div class="mushaf-trans-list" id="mushaf-bottom-trans-list"></div>
    `;
    const bottomTransList = transSection.querySelector('#mushaf-bottom-trans-list');

    verses.forEach((v) => {
      // Loop over words in this verse and add them to the continuous flow
      v.words.forEach(w => {
        if (w.type === 'word') {
          const unit = document.createElement('span');
          unit.className = 'mushaf-word-unit';
          unit.dataset.verseKey = v.key;
          unit.dataset.ayah = v.id;
          if (w.audio) {
            unit.dataset.audio = w.audio;
          }

          unit.innerHTML = `
            <span class="mushaf-word-ar">${w.tajweed || w.ar}</span>
            <span class="mushaf-word-tr">${w.tr || ''}</span>
            <span class="mushaf-word-en">${w.en || ''}</span>
          `;

          // Word click: play audio + inspect + highlight entire Ayah
          unit.addEventListener('click', (e) => {
            e.stopPropagation();
            playWordAudio(w.audio, unit);
            showWordInspector(w);
            highlightAyah(v.key);
          });

          unit.addEventListener('mouseenter', () => {
            showWordInspector(w);
          });

          flowContainer.appendChild(unit);
        } else if (w.type === 'end') {
          // Authentic Ayah Number End Marker: ﴿١﴾, ﴿٢﴾, etc.
          const endMarker = document.createElement('span');
          endMarker.className = 'mushaf-ayah-mark';
          endMarker.dataset.verseKey = v.key;
          endMarker.dataset.ayah = v.id;
          endMarker.title = `Ayah ${v.id} (Click to highlight & copy)`;
          endMarker.innerHTML = `﴿${w.num || v.id}﴾`;

          endMarker.addEventListener('click', (e) => {
            e.stopPropagation();
            highlightAyah(v.key);
            scrollToVerse(v.key);
          });

          flowContainer.appendChild(endMarker);
        }
      });

      // 2. Bottom Running Translation Item (Like Image 2)
      const transItem = document.createElement('div');
      transItem.className = 'mushaf-trans-item';
      transItem.id = `bottom-trans-${v.key.replace(':', '-')}`;
      transItem.dataset.verseKey = v.key;
      transItem.innerHTML = `
        <span class="mushaf-trans-num">${v.id}.</span>
        <span>${v.side_trans}</span>
      `;
      transItem.addEventListener('click', () => {
        highlightAyah(v.key);
        scrollToVerse(v.key);
      });
      bottomTransList.appendChild(transItem);

      // 3. Right Side Margin Card
      const marginCard = document.createElement('div');
      marginCard.className = 'margin-card';
      marginCard.id = `margin-${v.key.replace(':', '-')}`;
      marginCard.dataset.verseKey = v.key;
      marginCard.innerHTML = `
        <div class="margin-card-header">
          <span class="margin-card-key">${v.key}</span>
          <span>Juz ${v.juz} • Pg ${v.page}</span>
        </div>
        <div class="margin-card-text">${v.side_trans}</div>
      `;
      marginCard.addEventListener('click', () => {
        highlightAyah(v.key);
        scrollToVerse(v.key);
      });
      marginFragment.appendChild(marginCard);
    });

    pageFrame.appendChild(flowContainer);
    pageFrame.appendChild(transSection);
    versesFragment.appendChild(pageFrame);

    // Batch paint DOM
    DOM.versesStream.innerHTML = '';
    DOM.versesStream.appendChild(versesFragment);

    DOM.marginList.innerHTML = '';
    DOM.marginList.appendChild(marginFragment);

    // Scroll to target ayah or top
    if (targetAyahNumber) {
      scrollToVerse(`${state.currentSurahId}:${targetAyahNumber}`);
    } else {
      DOM.mushafContainer.scrollTop = 0;
      DOM.marginList.scrollTop = 0;
    }
  }

  function highlightAyah(verseKey) {
    // Un-highlight previous
    document.querySelectorAll('.mushaf-word-unit.highlight-ayah, .mushaf-ayah-mark.highlight-ayah').forEach(el => {
      el.classList.remove('highlight-ayah');
    });
    document.querySelectorAll('.mushaf-trans-item.active, .margin-card.active').forEach(el => {
      el.classList.remove('active');
    });

    // Highlight words of this ayah
    document.querySelectorAll(`[data-verse-key="${verseKey}"]`).forEach(el => {
      el.classList.add('highlight-ayah');
    });

    const safeKey = verseKey.replace(':', '-');
    const bottomEl = document.getElementById(`bottom-trans-${safeKey}`);
    if (bottomEl) bottomEl.classList.add('active');

    const marginEl = document.getElementById(`margin-${safeKey}`);
    if (marginEl) {
      marginEl.classList.add('active');
      marginEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* --------------------------------------------------------------------------
     SCROLL & HIGHLIGHT SYNCHRONIZATION
     -------------------------------------------------------------------------- */
  function scrollToVerse(verseKey) {
    highlightAyah(verseKey);
    const targetWord = document.querySelector(`.mushaf-word-unit[data-verse-key="${verseKey}"]`);
    if (targetWord) {
      targetWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* --------------------------------------------------------------------------
     AUDIO ENGINES
     -------------------------------------------------------------------------- */
  function playWordAudio(audioUrl, unitEl) {
    if (!audioUrl) return;
    const fullUrl = `https://audio.qurancdn.com/${audioUrl}`;
    
    // Highlight word
    document.querySelectorAll('.wbw-unit.playing').forEach(el => el.classList.remove('playing'));
    if (unitEl) unitEl.classList.add('playing');

    state.wordAudio.src = fullUrl;
    state.wordAudio.play().catch(e => console.warn('Word audio error:', e));

    state.wordAudio.onended = () => {
      if (unitEl) unitEl.classList.remove('playing');
    };
  }

  function toggleSurahRecitation() {
    if (state.isPlayingRecitation) {
      DOM.audioPlayer.pause();
      state.isPlayingRecitation = false;
      DOM.playerBtnLabel.textContent = 'Recite Surah';
      DOM.btnPlaySurah.classList.remove('active');
      return;
    }

    // High fidelity recitation: Mishary Rashid Alafasy 128kbps
    const paddedSurah = String(state.currentSurahId).padStart(3, '0');
    DOM.audioPlayer.src = `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;
    DOM.audioPlayer.play().then(() => {
      state.isPlayingRecitation = true;
      DOM.playerBtnLabel.textContent = 'Pause';
      DOM.btnPlaySurah.classList.add('active');
    }).catch(e => {
      console.warn('Recitation playback failed:', e);
      alert('Could not stream recitation audio. Please check your internet connection.');
    });

    DOM.audioPlayer.onended = () => {
      state.isPlayingRecitation = false;
      DOM.playerBtnLabel.textContent = 'Recite Surah';
      DOM.btnPlaySurah.classList.remove('active');
    };
  }

  /* --------------------------------------------------------------------------
     BOOKMARK MANAGEMENT
     -------------------------------------------------------------------------- */
  function toggleBookmark(surahId, ayahNumber, key, text) {
    const chapter = state.chapters.find(c => c.id === surahId);
    const surahName = chapter ? chapter.name_simple : `Surah ${surahId}`;
    const idx = state.bookmarks.findIndex(bm => bm.key === key);

    let isAdded = false;
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push({ surahId, ayahNumber, key, surahName, text, timestamp: Date.now() });
      isAdded = true;
    }

    if (window.quranDB) {
      window.quranDB.saveSetting('bookmarks', state.bookmarks);
    }

    if (state.activeTab === 'bookmarks') {
      renderCatalog();
    }
    return isAdded;
  }

  /* --------------------------------------------------------------------------
     THEMES & DISPLAY SETTINGS
     -------------------------------------------------------------------------- */
  function showWordInspector(w) {
    if (!w || !DOM.wordInspector) return;
    DOM.wordInspector.style.display = 'inline-flex';
    DOM.inspAr.textContent = w.ar || '';
    DOM.inspTr.textContent = w.tr ? `• ${w.tr}` : '';
    DOM.inspEn.textContent = w.en ? `• "${w.en}"` : '';
  }

  function toggleFlowMode() {
    if (state.flowMode === 'interlinear') {
      state.flowMode = 'pure';
      document.body.classList.add('pure-mushaf-mode');
      DOM.flowModeLabel.textContent = '📜 Continuous Text';
      DOM.btnToggleFlowMode.classList.remove('active');
    } else {
      state.flowMode = 'interlinear';
      document.body.classList.remove('pure-mushaf-mode');
      DOM.flowModeLabel.textContent = '📖 Interlinear Flow';
      DOM.btnToggleFlowMode.classList.add('active');
    }
  }

  function cycleTheme() {
    const themes = ['light', 'parchment', 'dark'];
    const nextIdx = (themes.indexOf(state.theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  }

  function setTheme(newTheme) {
    state.theme = newTheme;
    document.body.className = `theme-${newTheme}`;
    if (!state.tajweedEnabled) document.body.classList.add('tajweed-off');
    if (!state.wbwEnabled) document.body.classList.add('wbw-off');
    if (!state.translitEnabled) document.body.classList.add('translit-off');
    if (state.flowMode === 'pure') document.body.classList.add('pure-mushaf-mode');

    const icons = {
      light: '☀️ Light',
      parchment: '📜 Parchment',
      dark: '🌙 Dark'
    };
    DOM.themeIcon.textContent = icons[newTheme] || '☀️ Light';

    if (window.quranDB) {
      window.quranDB.saveSetting('theme', newTheme);
    }
  }

  function setFontSize(newSize) {
    newSize = Math.max(22, Math.min(48, newSize));
    state.arabicFontSize = newSize;
    document.documentElement.style.setProperty('--arabic-size', `${newSize}px`);
    if (window.quranDB) {
      window.quranDB.saveSetting('fontSize', newSize);
    }
  }

  /* --------------------------------------------------------------------------
     EVENT LISTENERS & KEYBOARD SHORTCUTS
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Quick selector
    DOM.surahSelect.addEventListener('change', (e) => {
      loadSurah(Number(e.target.value));
    });

    // Brand home click
    DOM.btnHome.addEventListener('click', () => loadSurah(1));

    // Catalog Tabs
    DOM.catalogTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.catalogTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeTab = btn.dataset.tab;
        renderCatalog(DOM.catalogFilter.value);
      });
    });

    // Catalog Filter Input
    DOM.catalogFilter.addEventListener('input', (e) => {
      renderCatalog(e.target.value);
    });

    // Global Search / Jump
    DOM.globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        let val = DOM.globalSearch.value.trim().toLowerCase().replace(/[\/\\\s]+$/, '');
        if (!val) return;

        // Verse key format: e.g. "2:255" or "36:1"
        if (val.includes(':')) {
          const parts = val.split(':');
          const sid = parseInt(parts[0], 10);
          const aid = parseInt(parts[1], 10);
          if (sid >= 1 && sid <= 114) {
            loadSurah(sid, aid);
            DOM.globalSearch.blur();
            return;
          }
        }

        // Surah number: e.g. "36"
        const num = parseInt(val, 10);
        if (!isNaN(num) && num >= 1 && num <= 114) {
          loadSurah(num);
          DOM.globalSearch.blur();
          return;
        }

        // Surah name search (tolerant to yasin / ya-sin / etc.)
        const cleanVal = val.replace(/[-_\s]/g, '');
        const match = state.chapters.find(c => {
          const simple = c.name_simple.toLowerCase().replace(/[-_\s]/g, '');
          const trans = c.translated_name.name.toLowerCase();
          return simple.includes(cleanVal) || trans.includes(val) || c.name_arabic.includes(val);
        });
        if (match) {
          loadSurah(match.id);
          DOM.globalSearch.blur();
        }
      }
    });

    // Flow Mode Toggle (Interlinear Flow vs Continuous Text)
    if (DOM.btnToggleFlowMode) {
      DOM.btnToggleFlowMode.addEventListener('click', toggleFlowMode);
    }

    // Tajweed Toggle
    DOM.btnToggleTajweed.addEventListener('click', () => {
      state.tajweedEnabled = !state.tajweedEnabled;
      document.body.classList.toggle('tajweed-off', !state.tajweedEnabled);
      DOM.btnToggleTajweed.classList.toggle('active', state.tajweedEnabled);
    });

    // WBW Toggle: Meaning is ALWAYS preserved underneath each word. Toggles additional phonetics/transliteration.
    if (DOM.btnToggleWbw) {
      DOM.btnToggleWbw.addEventListener('click', () => {
        state.translitEnabled = !state.translitEnabled;
        document.body.classList.toggle('translit-on', state.translitEnabled);
        DOM.btnToggleWbw.innerHTML = state.translitEnabled ? '<span>WBW: Meaning + Phonetics</span>' : '<span>WBW: Meaning</span>';
        DOM.btnToggleWbw.classList.add('active');
      });
    }

    // Side Margin Toggle
    DOM.btnToggleMargin.addEventListener('click', () => {
      state.marginEnabled = !state.marginEnabled;
      DOM.marginPanel.style.display = state.marginEnabled ? 'flex' : 'none';
      DOM.btnToggleMargin.classList.toggle('active', state.marginEnabled);
    });

    // Font Sizing
    DOM.btnFontInc.addEventListener('click', () => setFontSize(state.arabicFontSize + 3));
    DOM.btnFontDec.addEventListener('click', () => setFontSize(state.arabicFontSize - 3));

    // Theme Switch
    DOM.btnCycleTheme.addEventListener('click', cycleTheme);

    // Sidebar Toggle
    DOM.btnToggleSidebar.addEventListener('click', () => {
      if (window.innerWidth <= 680) {
        DOM.sidebar.classList.toggle('open');
      } else {
        const isHidden = DOM.sidebar.style.display === 'none';
        DOM.sidebar.style.display = isHidden ? 'flex' : 'none';
        DOM.layout.style.gridTemplateColumns = isHidden 
          ? 'var(--sidebar-width) 1fr var(--margin-panel-width)'
          : '0px 1fr var(--margin-panel-width)';
      }
    });

    // Recitation Audio Button
    DOM.btnPlaySurah.addEventListener('click', toggleSurahRecitation);

    // Help Modal
    DOM.btnHelp.addEventListener('click', () => DOM.helpModal.classList.add('open'));
    DOM.modalCloseBtn.addEventListener('click', () => DOM.helpModal.classList.remove('open'));
    DOM.helpModal.addEventListener('click', (e) => {
      if (e.target === DOM.helpModal) DOM.helpModal.classList.remove('open');
    });

    // Global Keyboard Hotkeys (McMaster speed experience)
    window.addEventListener('keydown', (e) => {
      // Ignore if typing inside input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      switch (e.key) {
        case '/':
        case 'k':
          if (e.ctrlKey || e.metaKey || e.key === '/') {
            e.preventDefault();
            DOM.globalSearch.focus();
            DOM.globalSearch.select();
          }
          break;
        case '[':
          if (state.currentSurahId > 1) loadSurah(state.currentSurahId - 1);
          break;
        case ']':
          if (state.currentSurahId < 114) loadSurah(state.currentSurahId + 1);
          break;
        case 't':
        case 'T':
          DOM.btnToggleTajweed.click();
          break;
        case 'f':
        case 'F':
          toggleFlowMode();
          break;
        case 'w':
        case 'W':
          DOM.btnToggleWbw.click();
          break;
        case 's':
        case 'S':
          DOM.btnToggleMargin.click();
          break;
        case 'm':
        case 'M':
          cycleTheme();
          break;
        case 'Tab':
          e.preventDefault();
          DOM.btnToggleSidebar.click();
          break;
        case ' ':
          e.preventDefault();
          toggleSurahRecitation();
          break;
        case '?':
          DOM.helpModal.classList.toggle('open');
          break;
        case 'Escape':
          DOM.helpModal.classList.remove('open');
          break;
        case 'j':
        case 'ArrowDown':
          scrollNextAyah();
          break;
        case 'k':
        case 'ArrowUp':
          scrollPrevAyah();
          break;
      }
    });
  }

  function scrollNextAyah() {
    if (!state.surahData || !state.surahData.length) return;
    const currentActive = document.querySelector('.mushaf-trans-item.active');
    let nextIdx = 0;
    if (currentActive) {
      const currentKey = currentActive.dataset.verseKey;
      const idx = state.surahData.findIndex(v => v.key === currentKey);
      if (idx >= 0 && idx < state.surahData.length - 1) {
        nextIdx = idx + 1;
      }
    }
    scrollToVerse(state.surahData[nextIdx].key);
  }

  function scrollPrevAyah() {
    if (!state.surahData || !state.surahData.length) return;
    const currentActive = document.querySelector('.mushaf-trans-item.active');
    let prevIdx = 0;
    if (currentActive) {
      const currentKey = currentActive.dataset.verseKey;
      const idx = state.surahData.findIndex(v => v.key === currentKey);
      if (idx > 0) {
        prevIdx = idx - 1;
      }
    }
    scrollToVerse(state.surahData[prevIdx].key);
  }

  // Run on page load (robust check whether DOM is already parsed)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
