// --- CONSTANTES DE L'APPLICATION ---
const MAX_CARDS = 10;
const SOLUCE_PASSWORD = "1111";
const DECKS_KEY = 'torg_game_decks';
const DECK_INFO_KEY = 'torg_game_deck_info';

const SWIPE_THRESHOLD = 80;
const MAX_ROT = 15;
const MAX_DISP = 150;

// --- DONNÉES PAR DÉFAUT ---
const DEFAULT_DECK_INFO = [
  { name: "Deck Classic", emoji: "🧜🏻", color: "purple", titleColor: "text-purple-400", cardBorder: "border-purple-400/30", indicatorLeft: "TRANS", indicatorRight: "GIRL" },
  { name: "Deck Hardcore", emoji: "🧚🏻", color: "cyan", titleColor: "text-cyan-400", cardBorder: "border-cyan-400/30", indicatorLeft: "PC", indicatorRight: "CONSOLE" },
  { name: "Deck Cosplay", emoji: "🧝🏻‍♀️", color: "pink", titleColor: "text-pink-400", cardBorder: "border-pink-400/30", indicatorLeft: "COSPLAY", indicatorRight: "IRL" }
];

const neutralImg = "https://placehold.co/400x550/FBFCF8/000000?text=?";
const neutralCard = (correctSide = "left") => ({
  id: crypto.randomUUID(),
  text: "",
  correct: correctSide,
  img: neutralImg,
  soluceLink: ""
});

const INITIAL_DECKS = [
  Array(10).fill(null).map((_, i) => neutralCard(i % 2 === 0 ? "left" : "right")),
  Array(10).fill(null).map((_, i) => neutralCard(i % 2 === 0 ? "left" : "right")),
  Array(10).fill(null).map((_, i) => neutralCard(i % 2 === 0 ? "left" : "right"))
];

// --- ÉTAT GLOBAL ---
let PERSISTENT_DECKS;
let PERSISTENT_DECK_INFO;

const state = {
  playerName: '',
  currentDeck: 0,
  currentFilter: 'all',
  game: { score: 0, cardIndex: 0, isProcessing: false },
  currentDeckCards: [],
  resultsRecap: [],
  isEditingMode: false,
  editingCardGlobalId: null,
  previousScreen: null,
  drag: { startX: 0, currentX: 0, isDragging: false, isMouseDown: false },
  animationFrameId: null // NOUVEAU: Pour RAF
};

const DOM = {};

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
  queryDOMElements();
  loadPersistentData();
  
  state.playerName = localStorage.getItem('player_name') || '';
  if (state.playerName) {
    DOM.playerNameInput.value = state.playerName;
    DOM.playerDisplay.textContent = state.playerName;
  }

  initEventListeners();
  regenerateAllDynamicContent();
  showScreen(DOM.introScreen);
});

function queryDOMElements() {
  DOM.introScreen = document.getElementById('intro-screen');
  DOM.deckScreen = document.getElementById('deck-screen');
  DOM.gameScreen = document.getElementById('game-screen');
  DOM.scoresScreen = document.getElementById('scores-screen'); 
  DOM.soluceScreen = document.getElementById('soluce-screen'); 
  DOM.publicSoluceScreen = document.getElementById('public-soluce-screen');
  
  DOM.btnHeaderAdmin = document.getElementById('btn-header-admin');
  DOM.playerDisplay = document.getElementById('player-display');
  DOM.playerNameInput = document.getElementById('player-name');
  DOM.btnStart = document.getElementById('btn-start');
  DOM.btnViewScores = document.getElementById('btn-view-scores');

  DOM.deckSelectionGrid = document.getElementById('deck-selection-grid');
  DOM.btnViewScoresFromDeck = document.getElementById('btn-view-scores-from-deck');
  DOM.btnViewPublicSoluce = document.getElementById('btn-view-public-soluce');
  DOM.btnChangePlayer = document.getElementById('btn-change-player');
  
  DOM.overlayLeft = document.getElementById('overlay-left');
  DOM.overlayRight = document.getElementById('overlay-right');
  DOM.scoreDisplay = document.getElementById('score-display');
  DOM.indexDisplay = document.getElementById('index-display');
  DOM.btnQuitGame = document.getElementById('btn-quit-game');
  DOM.cardHolder = document.getElementById('card-holder');
  DOM.indicatorLeft = document.getElementById('indicator-left');
  DOM.indicatorRight = document.getElementById('indicator-right');
  DOM.cardElement = document.getElementById('card');
  DOM.cardImage = document.getElementById('card-image');
  DOM.cardText = document.getElementById('card-text');
  DOM.arrowBtnContainer = document.querySelector('.arrow-btn-container');
  DOM.btnArrowLeft = document.getElementById('btn-arrow-left');
  DOM.btnArrowRight = document.getElementById('btn-arrow-right');
  DOM.btnZoomCard = document.getElementById('btn-zoom-card');
  DOM.messageBox = document.getElementById('message-box');
  
  DOM.endOverlay = document.getElementById('end-overlay');
  DOM.gaugeCircle = document.getElementById('gauge-circle');
  DOM.gaugePercentage = document.getElementById('gauge-percentage');
  DOM.resultMessage = document.getElementById('result-message');
  DOM.recapTitle = document.getElementById('recap-title');
  DOM.recapList = document.getElementById('recap-list');
  DOM.btnChooseDeck = document.getElementById('btn-choose-deck');
  DOM.btnReplay = document.getElementById('btn-replay');
  DOM.btnViewScoresFromGame = document.getElementById('btn-view-scores-from-game');
  
  DOM.btnBackFromScores = document.getElementById('btn-back-from-scores');
  DOM.scoreFilterButtons = document.getElementById('score-filter-buttons');
  DOM.btnFilterAll = document.getElementById('btn-filter-all');
  DOM.scoresList = document.getElementById('scores-list');

  DOM.btnToggleEdit = document.getElementById('btn-toggle-edit');
  DOM.btnAddDeck = document.getElementById('btn-add-deck');
  DOM.btnExportData = document.getElementById('btn-export-data');
  DOM.btnImportData = document.getElementById('btn-import-data');
  DOM.importFileInput = document.getElementById('import-file-input');
  DOM.btnBackFromSoluceAdmin = document.getElementById('btn-back-from-soluce-admin');
  DOM.soluceGalleryContainer = document.getElementById('soluce-gallery-container');
  DOM.soluceInfoText = document.getElementById('soluce-info-text');

  DOM.btnBackFromPublicSoluce = document.getElementById('btn-back-from-public-soluce');
  DOM.publicSoluceGalleryContainer = document.getElementById('public-soluce-gallery-container');

  DOM.imageModal = document.getElementById('image-modal');
  DOM.modalImage = document.getElementById('modal-image');
  DOM.btnCloseImageModal = document.getElementById('btn-close-image-modal');

  DOM.passwordModal = document.getElementById('password-modal');
  DOM.passwordInput = document.getElementById('password-input');
  DOM.passwordError = document.getElementById('password-error');
  DOM.btnCheckPassword = document.getElementById('btn-check-password');
  DOM.btnClosePasswordModal = document.getElementById('btn-close-password-modal');

  DOM.editCardModal = document.getElementById('edit-card-modal');
  DOM.editModalTitle = document.getElementById('edit-modal-title');
  DOM.cardForm = document.getElementById('card-form');
  DOM.editCardDeckIndex = document.getElementById('edit-card-deck-index');
  DOM.editCardId = document.getElementById('edit-card-id');
  DOM.editDeckSelect = document.getElementById('edit-deck-select');
  DOM.editCardText = document.getElementById('edit-card-text');
  DOM.editCardImg = document.getElementById('edit-card-img');
  DOM.editCardSoluceLink = document.getElementById('edit-card-soluce-link');
  DOM.editCardCorrect = document.getElementById('edit-card-correct');
  DOM.saveCardBtn = document.getElementById('save-card-btn');
  DOM.btnDeleteCard = document.getElementById('btn-delete-card');
  DOM.btnCancelEditCard = document.getElementById('btn-cancel-edit-card');

  DOM.deckModal = document.getElementById('deck-modal');
  DOM.deckForm = document.getElementById('deck-form');
  DOM.deckModalTitle = document.getElementById('deck-modal-title');
  DOM.editDeckId = document.getElementById('edit-deck-id');
  DOM.deckNameInput = document.getElementById('deck-name');
  DOM.deckEmojiInput = document.getElementById('deck-emoji');
  DOM.deckIndicatorLeftInput = document.getElementById('deck-indicator-left');
  DOM.deckIndicatorRightInput = document.getElementById('deck-indicator-right');
  DOM.deckColorSelector = document.getElementById('deck-color-selector');
  DOM.btnSaveDeck = document.getElementById('btn-save-deck');
  DOM.btnCancelDeck = document.getElementById('btn-cancel-deck');
  DOM.btnCloseDeckModal = document.getElementById('btn-close-deck-modal');

  DOM.alertModal = document.getElementById('alert-modal');
  DOM.alertModalTitle = document.getElementById('alert-modal-title');
  DOM.alertModalText = document.getElementById('alert-modal-text');
  DOM.alertModalButtons = document.getElementById('alert-modal-buttons');
  DOM.btnCloseAlertModal = document.getElementById('btn-close-alert-modal');
}

function initEventListeners() {
  DOM.btnHeaderAdmin.addEventListener('click', openPasswordModal);
  DOM.btnStart.addEventListener('click', continueToDecks);
  DOM.btnViewScores.addEventListener('click', () => showScoresScreen(DOM.introScreen));
  
  DOM.btnViewScoresFromDeck.addEventListener('click', () => showScoresScreen(DOM.deckScreen));
  DOM.btnViewPublicSoluce.addEventListener('click', showPublicSoluce);
  DOM.btnChangePlayer.addEventListener('click', () => showScreen(DOM.introScreen));

  DOM.btnQuitGame.addEventListener('click', quitGame);
  DOM.cardElement.addEventListener('click', () => {
    if (DOM.cardImage.src && !DOM.cardImage.src.includes('placehold.co')) {
      openModal(DOM.cardImage.src);
    }
  });
  DOM.btnZoomCard.addEventListener('click', () => {
    if (DOM.cardImage.src && !DOM.cardImage.src.includes('placehold.co')) {
      openModal(DOM.cardImage.src);
    }
  });
  
  DOM.btnArrowLeft.addEventListener('click', () => handleDecision('left'));
  DOM.btnArrowRight.addEventListener('click', () => handleDecision('right'));
  
  DOM.cardElement.addEventListener('touchstart', onDragStart, { passive: true });
  DOM.cardElement.addEventListener('touchmove', onDragMove, { passive: true });
  DOM.cardElement.addEventListener('touchend', onDragEnd);
  DOM.cardElement.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  
  document.addEventListener('keydown', onKeyDown);

  DOM.btnChooseDeck.addEventListener('click', () => {
    DOM.endOverlay.classList.add('hidden');
    showScreen(DOM.deckScreen);
  });
  DOM.btnReplay.addEventListener('click', () => {
    DOM.endOverlay.classList.add('hidden');
    startGame();
  });
  DOM.btnViewScoresFromGame.addEventListener('click', () => showScoresScreen(DOM.gameScreen));

  DOM.btnBackFromScores.addEventListener('click', () => {
    showScreen(state.previousScreen || DOM.deckScreen);
  });
  DOM.btnFilterAll.addEventListener('click', (e) => filterScores('all', e.target));

  DOM.btnToggleEdit.addEventListener('click', toggleEditingMode);
  DOM.btnAddDeck.addEventListener('click', () => openDeckModal(null));
  DOM.btnExportData.addEventListener('click', exportData);
  DOM.btnImportData.addEventListener('click', () => DOM.importFileInput.click());
  DOM.importFileInput.addEventListener('change', importData);
  DOM.btnBackFromSoluceAdmin.addEventListener('click', () => showScreen(DOM.deckScreen));

  DOM.btnBackFromPublicSoluce.addEventListener('click', () => showScreen(DOM.deckScreen));
  
  DOM.imageModal.addEventListener('click', (e) => {
    if (e.target.id === 'image-modal') closeModal(DOM.imageModal);
  });
  DOM.btnCloseImageModal.addEventListener('click', () => closeModal(DOM.imageModal));

  DOM.passwordModal.addEventListener('click', (e) => {
    if (e.target.id === 'password-modal') closeModal(DOM.passwordModal);
  });
  DOM.btnClosePasswordModal.addEventListener('click', () => closeModal(DOM.passwordModal));
  DOM.btnCheckPassword.addEventListener('click', checkPassword);
  DOM.passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
  });

  DOM.editCardModal.addEventListener('click', (e) => {
    if (e.target.id === 'edit-card-modal') closeModal(DOM.editCardModal);
  });
  DOM.saveCardBtn.addEventListener('click', saveCard);
  DOM.btnDeleteCard.addEventListener('click', deleteCard);
  DOM.btnCancelEditCard.addEventListener('click', () => closeModal(DOM.editCardModal));

  DOM.deckModal.addEventListener('click', (e) => {
    if (e.target.id === 'deck-modal') closeModal(DOM.deckModal);
  });
  DOM.btnCloseDeckModal.addEventListener('click', () => closeModal(DOM.deckModal));
  DOM.btnSaveDeck.addEventListener('click', saveDeckInfo);
  DOM.btnCancelDeck.addEventListener('click', () => closeModal(DOM.deckModal));
  DOM.deckColorSelector.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      DOM.deckColorSelector.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
    });
  });

  DOM.alertModal.addEventListener('click', (e) => {
    if (e.target.id === 'alert-modal') closeModal(DOM.alertModal);
  });
  DOM.btnCloseAlertModal.addEventListener('click', () => closeModal(DOM.alertModal));
}

// --- STOCKAGE ---
function loadPersistentData() {
  PERSISTENT_DECKS = loadDecks();
  PERSISTENT_DECK_INFO = loadDeckInfo();
}

function loadDecks() {
  const storedDecks = localStorage.getItem(DECKS_KEY);
  if (storedDecks) {
    try {
      return JSON.parse(storedDecks);
    } catch (e) {
      console.error("Erreur chargement decks, réinit.");
      return migrateInitialDecks();
    }
  }
  return migrateInitialDecks();
}

function loadDeckInfo() {
  const storedInfo = localStorage.getItem(DECK_INFO_KEY);
  if (storedInfo) {
    try {
      return JSON.parse(storedInfo);
    } catch (e) {
      return migrateInitialDeckInfo();
    }
  }
  return migrateInitialDeckInfo();
}

function migrateInitialDecks() {
  const decksWithIds = INITIAL_DECKS.map(deck => 
    deck.map(card => ({
      ...card, 
      id: card.id || crypto.randomUUID(),
      soluceLink: card.soluceLink || ""
    }))
  );
  saveDecks(decksWithIds);
  return decksWithIds;
}

function migrateInitialDeckInfo() {
  saveDeckInfoToStorage(DEFAULT_DECK_INFO);
  return DEFAULT_DECK_INFO;
}

function saveDecks(decks) {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

function saveDeckInfoToStorage(info) {
  localStorage.setItem(DECK_INFO_KEY, JSON.stringify(info));
}

function getScores() {
  return JSON.parse(localStorage.getItem('game_scores') || '[]');
}

// --- IMPORT/EXPORT ---
function exportData() {
  console.log("Export données...");
  try {
    const data = { decks: PERSISTENT_DECKS, info: PERSISTENT_DECK_INFO };
    const dataString = JSON.stringify(data, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torg_beta_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur export:", error);
    showAlert("Erreur", "Échec de l'exportation.", "error");
  }
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const data = JSON.parse(content);
      
      if (data && Array.isArray(data.decks) && Array.isArray(data.info)) {
        const totalDecks = data.info.length;
        const totalCards = data.decks.reduce((sum, deck) => sum + (deck ? deck.length : 0), 0);
        
        const onConfirmImport = () => {
          saveDecks(data.decks);
          saveDeckInfoToStorage(data.info);
          loadPersistentData();
          regenerateAllDynamicContent();
          showAlert("Import Réussi", "Nouveaux decks chargés.", "success");
        };
        
        showConfirm(
          "Confirmer l'import",
          `Import ${totalDecks} deck(s) et ${totalCards} carte(s).\n\nATTENTION: Écrase les données actuelles. Continuer ?`,
          onConfirmImport
        );
      } else {
        throw new Error("Structure JSON invalide.");
      }
    } catch (error) {
      console.error("Erreur import:", error);
      showAlert("Erreur d'import", `Échec: ${error.message}`, "error");
    } finally {
      event.target.value = null;
    }
  };
  
  reader.onerror = (error) => {
     console.error("Erreur lecture fichier:", error);
     showAlert("Erreur", "Échec lecture fichier.", "error");
     event.target.value = null;
  };
  
  reader.readAsText(file);
}

// --- NAVIGATION ---
function showScreen(screenEl) {
  const mainScreens = [
    DOM.introScreen, DOM.deckScreen, DOM.gameScreen, 
    DOM.scoresScreen, DOM.soluceScreen, DOM.publicSoluceScreen
  ];
  
  mainScreens.forEach(s => {
    s.classList.add('hidden-screen');
    s.classList.remove('active');
  });

  closeModal(DOM.imageModal);
  closeModal(DOM.passwordModal);
  closeModal(DOM.editCardModal);
  closeModal(DOM.deckModal);
  closeModal(DOM.alertModal);

  screenEl.classList.remove('hidden-screen');
  // AMÉLIORATION: Ajoute la classe 'active' après un court délai pour l'animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      screenEl.classList.add('active');
    });
  });
}

function showScoresScreen(prevScreen) {
  state.previousScreen = prevScreen;
  renderScores();
  showScreen(DOM.scoresScreen);
}

function showAllSoluce() {
  DOM.soluceGalleryContainer.querySelectorAll('.soluce-deck-title').forEach(el => el.style.display = 'flex');
  DOM.soluceGalleryContainer.querySelectorAll('.soluce-deck-content').forEach(el => {
    el.classList.remove('hidden-soluce');
  });
  
  // MODIFICATION: Ne pas réinitialiser le mode édition
  // state.isEditingMode = false;
  updateSoluceDisplayModes();
  showScreen(DOM.soluceScreen);
}

function showPublicSoluce() {
  regeneratePublicSoluce();
  showScreen(DOM.publicSoluceScreen);
}

// --- GÉNÉRATION UI DYNAMIQUE ---
function regenerateAllDynamicContent() {
  generateDeckSelectionScreen();
  generateSoluceContainers();
  generatePublicSoluceContainers();
  generateScoreFilters();
  
  DOM.editDeckSelect.innerHTML = '';
  PERSISTENT_DECK_INFO.forEach((info, index) => {
    DOM.editDeckSelect.innerHTML += `<option value="${index}">${info.emoji} ${info.name}</option>`;
  });
}

function regeneratePublicSoluce() {
  generatePublicSoluceContainers();
}

function generateDeckSelectionScreen() {
  DOM.deckSelectionGrid.innerHTML = '';
  
  PERSISTENT_DECK_INFO.forEach((deckInfo, index) => {
    const cardCount = (PERSISTENT_DECKS[index] || []).length;
    
    const el = document.createElement('div');
    el.className = `deck-card glass rounded-xl p-6 border-2 ${deckInfo.cardBorder}`;
    el.addEventListener('click', () => selectDeck(index));
    
    el.innerHTML = `
      <div class="text-4xl mb-4 text-center">${deckInfo.emoji}</div>
      <h3 class="text-xl font-bold mb-2 text-center ${deckInfo.titleColor}">${deckInfo.name}</h3>
      <p class="text-sm text-gray-300 text-center mb-3">Le deck ${deckInfo.name.toLowerCase()}</p>
      <div class="text-xs text-gray-400 text-center">${cardCount} cartes</div>
    `;
    DOM.deckSelectionGrid.appendChild(el);
  });
}

function generateScoreFilters() {
  DOM.scoreFilterButtons.querySelectorAll('.filter-btn:not(#btn-filter-all)').forEach(btn => btn.remove());
  
  PERSISTENT_DECK_INFO.forEach((deckInfo, index) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn px-4 py-2 bg-white/6 border border-white/10 rounded-lg text-sm';
    btn.textContent = `${deckInfo.emoji} ${deckInfo.name}`;
    btn.addEventListener('click', (e) => filterScores(index, e.target));
    DOM.scoreFilterButtons.appendChild(btn);
  });
}

function generateSoluceContainers() {
  DOM.soluceGalleryContainer.innerHTML = '';

  PERSISTENT_DECKS.forEach((deck, deckIndex) => {
    const deckInfo = PERSISTENT_DECK_INFO[deckIndex];
    if (!deckInfo) {
      console.warn(`Pas d'info deck ${deckIndex}`);
      return;
    }
    
    const titleEl = document.createElement('h4');
    titleEl.className = `soluce-deck-title ${deckInfo.titleColor}`;
    titleEl.innerHTML = `${deckInfo.emoji} ${deckInfo.name} (${(deck || []).length} cartes)`;
    
    const editBtn = document.createElement('span');
    editBtn.className = 'edit-deck-btn';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeckModal(deckIndex);
    });
    titleEl.appendChild(editBtn);
    DOM.soluceGalleryContainer.appendChild(titleEl);

    const cardsContainer = document.createElement('div');
    cardsContainer.id = `soluce-deck-${deckIndex}`;
    cardsContainer.className = 'soluce-deck-content hidden-soluce';
    DOM.soluceGalleryContainer.appendChild(cardsContainer);
    
    (deck || []).forEach(card => {
      cardsContainer.appendChild(createSoluceCardVignette(card, deckInfo, deckIndex));
    });
    
    cardsContainer.appendChild(createAddCardVignette(deckIndex));
  });
  
  updateSoluceDisplayModes();
}

function generatePublicSoluceContainers() {
  DOM.publicSoluceGalleryContainer.innerHTML = '';

  PERSISTENT_DECKS.forEach((deck, deckIndex) => {
    const deckInfo = PERSISTENT_DECK_INFO[deckIndex];
    if (!deckInfo) return;
    
    const titleEl = document.createElement('h4');
    titleEl.className = `soluce-deck-title ${deckInfo.titleColor}`;
    titleEl.innerHTML = `${deckInfo.emoji} ${deckInfo.name} (${(deck || []).length} cartes)`;
    DOM.publicSoluceGalleryContainer.appendChild(titleEl);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'soluce-deck-content';
    DOM.publicSoluceGalleryContainer.appendChild(cardsContainer);
    
    (deck || []).forEach(card => {
      cardsContainer.appendChild(createSoluceCardVignette(card, deckInfo, deckIndex, true));
    });
  });
}

function createSoluceCardVignette(card, deckInfo, deckIndex, isPublic = false) {
  const el = document.createElement('div');
  el.className = 'soluce-gallery-item flex flex-col justify-between p-2 glass rounded-lg border-2 ' + deckInfo.cardBorder;
  el.setAttribute('data-card-id', card.id);
  el.setAttribute('data-deck-index', deckIndex);
  
  const hasSoluceLink = card.soluceLink && card.soluceLink.trim() !== "";
  
  el.addEventListener('click', () => {
    if (!isPublic && state.isEditingMode) {
      openEditModal(deckIndex, card.id);
    } else if (hasSoluceLink) {
      window.open(card.soluceLink, '_blank');
    } else {
      openModal(card.img);
    }
  });
  
  const imageContainer = document.createElement('div');
  imageContainer.className = 'w-full h-2/3 object-cover rounded-md mb-1 soluce-gallery-item-image-container';
  imageContainer.style.backgroundImage = `url('${card.img}')`;
  imageContainer.style.backgroundSize = 'cover';
  imageContainer.style.backgroundPosition = 'center';

  if (hasSoluceLink) {
    imageContainer.innerHTML = `<span class="soluce-link-indicator">🔗</span>`;
  }
  
  const correctText = card.correct === 'left' ? 'GAUCHE (Mauve)' : 'DROITE (Rose)';
  const colorClass = card.correct === 'left' ? 'text-purple-400' : 'text-pink-400';
  
  const textDiv = document.createElement('div');
  textDiv.className = 'text-xs font-semibold text-gray-200 truncate';
  textDiv.title = card.text;
  textDiv.textContent = card.text.split(' (')[0] || "Carte sans texte";
  
  const correctDiv = document.createElement('div');
  correctDiv.className = `text-[10px] ${colorClass}`;
  correctDiv.textContent = `Rép: ${correctText}`;
  
  const deckNameDiv = document.createElement('div');
  deckNameDiv.className = 'text-[9px] text-gray-400 mt-0.5';
  deckNameDiv.textContent = deckInfo.name;
  
  el.appendChild(imageContainer);
  el.appendChild(textDiv);
  el.appendChild(correctDiv);
  el.appendChild(deckNameDiv);
  
  return el;
}

function createAddCardVignette(deckIndex) {
  const addCardEl = document.createElement('div');
  addCardEl.className = 'soluce-gallery-item add-card-btn';
  addCardEl.style.display = 'none';
  addCardEl.addEventListener('click', () => openEditModal(deckIndex, null));
  addCardEl.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  `;
  return addCardEl;
}

// --- LOGIQUE JEU ---
function continueToDecks() {
  const name = (DOM.playerNameInput.value || '').trim();
  if (!name) {
    DOM.playerNameInput.focus();
    DOM.playerNameInput.classList.add('border-red-500');
    return;
  }
  DOM.playerNameInput.classList.remove('border-red-500');
  state.playerName = name;
  localStorage.setItem('player_name', state.playerName);
  DOM.playerDisplay.textContent = state.playerName;
  showScreen(DOM.deckScreen);
}

function selectDeck(deckIndex) {
  if (!PERSISTENT_DECKS[deckIndex] || PERSISTENT_DECKS[deckIndex].length < MAX_CARDS) {
    showAlert(
      "Deck incomplet",
      `Ce deck n'a que ${PERSISTENT_DECKS[deckIndex]?.length || 0} cartes. Il en faut ${MAX_CARDS}.`,
      "warning"
    );
    return;
  }
  state.currentDeck = deckIndex;
  startGame();
}

function startGame() {
  state.resultsRecap = [];
  
  const fullDeck = PERSISTENT_DECKS[state.currentDeck];
  const shuffledDeck = shuffleArray(fullDeck);
  
  state.currentDeckCards = shuffledDeck.slice(0, MAX_CARDS).map(c => ({ id: c.id })); 
  preloadGameImages(state.currentDeckCards);
  
  state.game = { score: 0, cardIndex: 0, isProcessing: false };
  updateUI();
  displayCard();
  showScreen(DOM.gameScreen);
}

function preloadGameImages(cardRefs) {
  const fullDeck = PERSISTENT_DECKS[state.currentDeck];
  
  cardRefs.forEach(ref => {
    const card = fullDeck.find(c => c.id === ref.id);
    if (card && card.img) {
      const img = new Image();
      img.src = card.img;
    }
  });
}

function endGame() {
  state.game.isProcessing = true;
  const pct = Math.round((state.game.score / MAX_CARDS) * 100);
  saveScore(state.playerName, state.currentDeck, state.game.score, pct);
  displayErrorRecap();
  updateUI();
  state.game.isProcessing = false;
  DOM.endOverlay.classList.remove('hidden');
  
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => DOM.gaugeCircle.style.strokeDashoffset = offset, 100);
  
  DOM.gaugePercentage.textContent = pct + '%';
  const result = getResultMessage(pct);
  DOM.resultMessage.textContent = result.text;
  DOM.resultMessage.className = `result-message text-2xl font-bold mb-4 px-4 py-3 rounded-lg ${result.color}`;
}

function quitGame() {
  showScreen(DOM.deckScreen);
}

function handleDecision(decision) {
  if (state.game.isProcessing || state.game.cardIndex >= MAX_CARDS) return;
  state.game.isProcessing = true;
  
  const currentCardRef = state.currentDeckCards[state.game.cardIndex];
  const cur = PERSISTENT_DECKS[state.currentDeck].find(c => c.id === currentCardRef.id);
  
  if (!cur) {
    state.game.cardIndex++;
    state.game.isProcessing = false;
    displayCard();
    return;
  }

  const isCorrect = decision === cur.correct; 
  
  currentCardRef.isCorrect = isCorrect; 
  currentCardRef.img = cur.img;
  currentCardRef.text = cur.text;
  state.resultsRecap.push(currentCardRef);
  
  if (!isCorrect) {
    state.game.score++;
  }
  
  // MODIFICATION: Suppression du feedback rouge/vert sur la carte
  // DOM.cardElement.style.borderColor = isCorrect ? '#10B981' : '#EF4444';
  
  // AMÉLIORATION: Feedback haptique sur mobile
  triggerHapticFeedback(isCorrect);
  
  // Feedback visuel overlay
  if (decision === 'left') {
    DOM.overlayLeft.style.opacity = '0.6';
    DOM.overlayLeft.style.transition = 'opacity 0.2s ease-out';
  } else {
    DOM.overlayRight.style.opacity = '0.6';
    DOM.overlayRight.style.transition = 'opacity 0.2s ease-out';
  }
  
  const slideClass = decision === 'left' ? 'slide-out-left' : 'slide-out-right';
  DOM.cardElement.classList.add(slideClass);
  
  setTimeout(() => {
    DOM.cardElement.classList.remove(slideClass);
    state.game.cardIndex++;
    
    DOM.overlayLeft.style.opacity = '0';
    DOM.overlayRight.style.opacity = '0';
    DOM.overlayLeft.style.transition = 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    DOM.overlayRight.style.transition = 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    if (state.game.cardIndex < MAX_CARDS) {
      updateUI();
      displayCard();
      state.game.isProcessing = false;
    } else {
      endGame();
    }
  }, 360);
}

// NOUVEAU: Feedback haptique
function triggerHapticFeedback(isCorrect) {
  if ('vibrate' in navigator) {
    if (isCorrect) {
      navigator.vibrate(50); // Courte vibration pour succès
    } else {
      navigator.vibrate([100, 50, 100]); // Pattern pour erreur
    }
  }
}

// --- DRAG/SWIPE AVEC RAF ---
function onDragStart(e) {
  if (state.game.isProcessing || state.game.cardIndex >= MAX_CARDS || isModalOpen()) return;

  if (e.type === 'mousedown') {
    state.drag.isMouseDown = true;
    state.drag.startX = e.clientX;
    e.preventDefault();
  } else {
    state.drag.isDragging = true;
    state.drag.startX = e.touches[0].clientX;
  }
  
  state.drag.currentX = state.drag.startX;
  DOM.cardElement.style.transition = 'none'; 
  DOM.cardElement.style.cursor = 'grabbing';
}

function onDragMove(e) {
  if (state.game.isProcessing || isModalOpen() || (!state.drag.isMouseDown && !state.drag.isDragging)) return;

  if (e.type === 'mousemove') {
    state.drag.currentX = e.clientX;
  } else {
    state.drag.currentX = e.touches[0].clientX;
  }
  
  // AMÉLIORATION: Utilise RAF pour des animations fluides
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
  }
  
  state.animationFrameId = requestAnimationFrame(() => {
    const dx = state.drag.currentX - state.drag.startX;
    let rot = (dx / MAX_DISP) * MAX_ROT;
    rot = Math.max(-MAX_ROT, Math.min(MAX_ROT, rot));
    
    DOM.cardElement.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    updateVisualFeedback(dx);
  });
}

function onDragEnd(e) {
  if (state.game.isProcessing || isModalOpen() || (!state.drag.isMouseDown && !state.drag.isDragging)) return;

  const isMouseUp = e.type === 'mouseup';
  if (isMouseUp) {
    state.drag.isMouseDown = false;
  } else {
    state.drag.isDragging = false;
  }

  DOM.cardElement.style.cursor = 'grab';
  const dx = state.drag.currentX - state.drag.startX;
  state.drag.startX = 0;

  if (Math.abs(dx) < 10 && !isMouseUp) {
    DOM.cardElement.style.transition = 'transform .35s cubic-bezier(.22,.9,.27,1), opacity .35s';
    DOM.cardElement.style.transform = 'none';
    return;
  }
  
  DOM.cardElement.style.transition = 'transform .35s cubic-bezier(.22,.9,.27,1), opacity .35s'; 
  updateVisualFeedback(0); 
  
  if (Math.abs(dx) < 10 && isMouseUp) {
     DOM.cardElement.style.transform = 'none';
     return;
  }
  
  if (dx > SWIPE_THRESHOLD) handleDecision('right');
  else if (dx < -SWIPE_THRESHOLD) handleDecision('left');
  else DOM.cardElement.style.transform = 'none';
}
    
function onKeyDown(e) {
  if (!DOM.gameScreen.classList.contains('hidden-screen')) {
    if (isModalOpen()) return;
    if (e.key === 'ArrowLeft') handleDecision('left');
    if (e.key === 'ArrowRight') handleDecision('right');
  }
  
  if (e.key === 'Escape') {
    if (DOM.imageModal.classList.contains('active')) closeModal(DOM.imageModal);
    else if (DOM.passwordModal.classList.contains('active')) closeModal(DOM.passwordModal);
    else if (DOM.editCardModal.classList.contains('active')) closeModal(DOM.editCardModal);
    else if (DOM.deckModal.classList.contains('active')) closeModal(DOM.deckModal);
    else if (DOM.alertModal.classList.contains('active')) closeModal(DOM.alertModal);
  }
}

// --- ADMIN & ÉDITION ---
function checkPassword() {
  const inputCode = DOM.passwordInput.value;
  if (inputCode === SOLUCE_PASSWORD) {
    closeModal(DOM.passwordModal);
    showAllSoluce();
  } else {
    DOM.passwordError.classList.remove('hidden');
    DOM.passwordInput.value = '';
    DOM.passwordInput.focus();
  }
}

function toggleEditingMode() {
  state.isEditingMode = !state.isEditingMode;
  updateSoluceDisplayModes();
}

function updateSoluceDisplayModes() {
  DOM.soluceGalleryContainer.querySelectorAll('.soluce-gallery-item:not(.add-card-btn)').forEach(item => {
    item.classList.toggle('editing-mode', state.isEditingMode);
  });
  
  DOM.btnToggleEdit.textContent = state.isEditingMode ? "Quitter l'édition" : "Activer l'édition";
  DOM.btnAddDeck.style.display = state.isEditingMode ? 'block' : 'none';
  DOM.btnExportData.style.display = state.isEditingMode ? 'block' : 'none';
  DOM.btnImportData.style.display = state.isEditingMode ? 'block' : 'none';
  
  DOM.soluceGalleryContainer.querySelectorAll('.add-card-btn').forEach(btn => {
    btn.style.display = state.isEditingMode ? 'flex' : 'none';
  });
  DOM.soluceGalleryContainer.querySelectorAll('.edit-deck-btn').forEach(btn => {
    btn.style.display = state.isEditingMode ? 'inline' : 'none';
  });

  if (state.isEditingMode) {
    DOM.soluceInfoText.textContent = "Mode ÉDITION : Cliquez sur une carte pour modifier/supprimer, ou 'Ajouter une carte'.";
  } else {
    DOM.soluceInfoText.textContent = "Mode CONSULTATION : Cliquez pour agrandir. Si lien Soluce (🔗), le clic ouvre le lien.";
  }
}

// AMÉLIORATION: Drag & Drop pour images
function setupImageDropZone() {
  // Crée la zone de drop si elle n'existe pas
  let dropZone = document.getElementById('image-drop-zone');
  
  if (!dropZone) {
    dropZone = document.createElement('div');
    dropZone.id = 'image-drop-zone';
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
      <div class="drop-zone-text">
        <p class="font-semibold mb-1">📎 Glissez une image ici</p>
        <p class="text-xs">ou cliquez pour sélectionner</p>
      </div>
      <img id="drop-zone-preview" class="drop-zone-preview hidden" />
    `;
    
    // Insère avant le champ URL
    const imgInput = DOM.editCardImg;
    imgInput.parentNode.insertBefore(dropZone, imgInput);
  }
  
  const preview = document.getElementById('drop-zone-preview');
  
  // Clic pour ouvrir sélecteur
  dropZone.addEventListener('click', (e) => {
    if (e.target === preview) return; // Ne pas déclencher si on clique sur l'aperçu
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => handleImageFile(e.target.files[0], preview);
    fileInput.click();
  });
  
  // Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file, preview);
    } else {
      showAlert("Fichier invalide", "Veuillez glisser une image.", "warning");
    }
  });
}

function handleImageFile(file, previewEl) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    DOM.editCardImg.value = dataUrl; // Remplit le champ URL avec la data URL
    previewEl.src = dataUrl;
    previewEl.classList.remove('hidden');
  };
  
  reader.onerror = () => {
    showAlert("Erreur", "Impossible de lire l'image.", "error");
  };
  
  reader.readAsDataURL(file);
}

function openEditModal(deckIndex, cardId = null) {
  state.editingCardGlobalId = cardId;
  DOM.passwordModal.classList.remove('active');
  
  // AMÉLIORATION: Setup drop zone
  setupImageDropZone();
  
  const preview = document.getElementById('drop-zone-preview');

  if (cardId === null) {
    DOM.editModalTitle.textContent = 'Ajouter une carte';
    DOM.editCardId.value = '';
    DOM.editCardText.value = '';
    DOM.editCardImg.value = '';
    DOM.editCardSoluceLink.value = '';
    DOM.editCardCorrect.value = 'left';
    DOM.editDeckSelect.value = deckIndex !== null ? deckIndex.toString() : '0';
    DOM.editDeckSelect.disabled = false;
    DOM.btnDeleteCard.style.display = 'none';
    if (preview) preview.classList.add('hidden');
  } else {
    const deck = PERSISTENT_DECKS[deckIndex];
    const card = deck.find(c => c.id === cardId);
    
    if (card) {
      DOM.editModalTitle.textContent = 'Modifier la carte';
      DOM.editCardId.value = cardId;
      DOM.editCardDeckIndex.value = deckIndex;
      DOM.editCardText.value = card.text;
      DOM.editCardImg.value = card.img;
      DOM.editCardSoluceLink.value = card.soluceLink || '';
      DOM.editCardCorrect.value = card.correct;
      DOM.editDeckSelect.value = deckIndex.toString();
      DOM.editDeckSelect.disabled = true;
      DOM.btnDeleteCard.style.display = 'block';
      
      // Affiche l'aperçu de l'image existante
      if (preview && card.img) {
        preview.src = card.img;
        preview.classList.remove('hidden');
      }
    }
  }
  openModal(DOM.editCardModal);
}

function saveCard() {
  const id = DOM.editCardId.value || crypto.randomUUID();
  const deckIndex = parseInt(DOM.editDeckSelect.value);
  const text = DOM.editCardText.value;
  const img = DOM.editCardImg.value;
  const soluceLink = DOM.editCardSoluceLink.value.trim();
  const correct = DOM.editCardCorrect.value;

  const newCard = { id, text, img, correct, soluceLink };
  
  let decks = loadDecks();
  
  if (state.editingCardGlobalId) {
    const oldDeckIndex = parseInt(DOM.editCardDeckIndex.value);
    const cardIndex = decks[oldDeckIndex].findIndex(c => c.id === state.editingCardGlobalId);
    if (cardIndex !== -1) {
      decks[oldDeckIndex][cardIndex] = newCard;
    }
  } else {
    if (!decks[deckIndex]) decks[deckIndex] = [];
    decks[deckIndex].push(newCard);
  }

  saveDecks(decks);
  PERSISTENT_DECKS = decks;
  closeModal(DOM.editCardModal);
  
  regenerateAllDynamicContent();
  // MODIFICATION: Reste sur l'écran Admin en mode édition
  showAllSoluce();
}

function deleteCard() {
  const cardId = DOM.editCardId.value;
  const deckIndex = parseInt(DOM.editCardDeckIndex.value);
  
  if (!cardId || isNaN(deckIndex)) return;
  
  const onConfirmDelete = () => {
    let decks = loadDecks();
    decks[deckIndex] = decks[deckIndex].filter(card => card.id !== cardId);
    
    saveDecks(decks);
    PERSISTENT_DECKS = decks;
    closeModal(DOM.editCardModal);
    
    regenerateAllDynamicContent();
    // MODIFICATION: Reste sur Admin en mode édition
    showAllSoluce();
  };

  showConfirm(
    "Supprimer la carte",
    "Êtes-vous sûr ? Action irréversible.",
    onConfirmDelete
  );
}

function openDeckModal(deckIndex = null) {
  DOM.deckColorSelector.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  DOM.editDeckId.value = '';

  if (deckIndex === null) {
    DOM.deckModalTitle.textContent = "Créer un Deck";
    DOM.deckNameInput.value = '';
    DOM.deckEmojiInput.value = '';
    DOM.deckIndicatorLeftInput.value = 'GAUCHE';
    DOM.deckIndicatorRightInput.value = 'DROITE';
    DOM.deckColorSelector.querySelector('.color-swatch').classList.add('selected');
  } else {
    DOM.deckModalTitle.textContent = "Modifier le Deck";
    const deckInfo = PERSISTENT_DECK_INFO[deckIndex];
    DOM.editDeckId.value = deckIndex;
    DOM.deckNameInput.value = deckInfo.name;
    DOM.deckEmojiInput.value = deckInfo.emoji;
    DOM.deckIndicatorLeftInput.value = deckInfo.indicatorLeft || 'GAUCHE';
    DOM.deckIndicatorRightInput.value = deckInfo.indicatorRight || 'DROITE';
    
    const swatch = DOM.deckColorSelector.querySelector(`[data-color-name="${deckInfo.color}"]`);
    if (swatch) {
      swatch.classList.add('selected');
    } else {
      DOM.deckColorSelector.querySelector('.color-swatch').classList.add('selected');
    }
  }
  openModal(DOM.deckModal);
  DOM.deckNameInput.focus();
}

function saveDeckInfo() {
  const name = DOM.deckNameInput.value.trim();
  const emoji = DOM.deckEmojiInput.value.trim();
  const indicatorLeft = DOM.deckIndicatorLeftInput.value.trim();
  const indicatorRight = DOM.deckIndicatorRightInput.value.trim();
  const selectedColorEl = DOM.deckColorSelector.querySelector('.color-swatch.selected');
  const colorName = selectedColorEl ? selectedColorEl.getAttribute('data-color-name') : 'gray';

  if (!name || !emoji || !indicatorLeft || !indicatorRight) {
    showAlert("Formulaire incomplet", "Remplissez tous les champs.", "warning");
    return;
  }

  let decks = loadDecks();
  let info = loadDeckInfo();
  const colorClasses = getColorClasses(colorName);
  
  const newDeckInfo = {
    name: name,
    emoji: emoji,
    indicatorLeft: indicatorLeft,
    indicatorRight: indicatorRight,
    color: colorName,
    ...colorClasses
  };

  const deckIndexToEdit = DOM.editDeckId.value;

  if (deckIndexToEdit !== "") {
    info[parseInt(deckIndexToEdit)] = newDeckInfo;
  } else {
    info.push(newDeckInfo);
    decks.push([]);
  }

  saveDeckInfoToStorage(info);
  saveDecks(decks);
  
  PERSISTENT_DECKS = decks;
  PERSISTENT_DECK_INFO = info;
  
  regenerateAllDynamicContent();
  closeModal(DOM.deckModal);
  // MODIFICATION: Reste sur Admin en mode édition
  showAllSoluce();
}

// --- UI & UTILITAIRES ---
function updateUI() {
  DOM.scoreDisplay.textContent = state.game.score;
  const cardNum = Math.min(state.game.cardIndex + 1, MAX_CARDS);
  DOM.indexDisplay.textContent = `${cardNum}/${MAX_CARDS}`;
  
  const finished = state.game.cardIndex >= MAX_CARDS;
  
  DOM.cardHolder.classList.toggle('hidden', finished);
  DOM.arrowBtnContainer.classList.toggle('hidden', finished);
  DOM.endOverlay.classList.toggle('hidden', !finished);
}

function displayCard() {
  if (state.game.cardIndex < MAX_CARDS) {
    const cur = PERSISTENT_DECKS[state.currentDeck].find(c => c.id === state.currentDeckCards[state.game.cardIndex].id);
    
    if (cur) {
      DOM.cardImage.src = cur.img;
      DOM.cardText.textContent = cur.text;
    } else {
      DOM.cardImage.src = neutralImg;
      DOM.cardText.textContent = "Erreur - Carte non trouvée";
    }
    
    DOM.cardElement.style.transform = 'none';
    DOM.cardElement.style.opacity = '1';
    DOM.cardElement.classList.remove('slide-out-left', 'slide-out-right');
    
    // MODIFICATION: Pas de bordure colorée
    // DOM.cardElement.style.borderColor = 'rgba(255,255,255,0.04)';
    
    DOM.overlayLeft.style.opacity = '0';
    DOM.overlayRight.style.opacity = '0';
    
    const deckInfo = PERSISTENT_DECK_INFO[state.currentDeck];
    DOM.indicatorLeft.innerHTML = deckInfo.indicatorLeft || 'GAUCHE';
    DOM.indicatorRight.innerHTML = deckInfo.indicatorRight || 'DROITE';
    
    DOM.indicatorLeft.style.opacity = '0';
    DOM.indicatorRight.style.opacity = '0';
    DOM.indicatorLeft.style.transform = 'translateY(-50%) translateX(0px)';
    DOM.indicatorRight.style.transform = 'translateY(-50%) translateX(0px)';
  } else {
    endGame();
  }
}

function updateVisualFeedback(dx) {
  const opacityRatio = Math.min(1, Math.abs(dx) / 100); 

  if (dx < 0) {
    DOM.overlayLeft.style.opacity = (opacityRatio * 0.9).toString();
    DOM.overlayRight.style.opacity = '0';
    DOM.indicatorLeft.style.opacity = opacityRatio > 0.1 ? '1' : '0';
    DOM.indicatorRight.style.opacity = '0';
    DOM.indicatorLeft.style.transform = `translateY(-50%) translateX(${Math.min(0, 10 + dx / 5)}px)`;
  } else if (dx > 0) {
    DOM.overlayRight.style.opacity = (opacityRatio * 0.9).toString();
    DOM.overlayLeft.style.opacity = '0';
    DOM.indicatorRight.style.opacity = opacityRatio > 0.1 ? '1' : '0';
    DOM.indicatorLeft.style.opacity = '0';
    DOM.indicatorRight.style.transform = `translateY(-50%) translateX(${Math.max(0, dx / 5 - 10)}px)`;
  } else {
    DOM.overlayLeft.style.opacity = '0';
    DOM.overlayRight.style.opacity = '0';
    DOM.indicatorLeft.style.opacity = '0';
    DOM.indicatorRight.style.opacity = '0';
    DOM.indicatorLeft.style.transform = 'translateY(-50%) translateX(0px)';
    DOM.indicatorRight.style.transform = 'translateY(-50%) translateX(0px)';
  }
}

function displayErrorRecap() {
  DOM.recapList.innerHTML = '';
  
  if (state.resultsRecap.length === 0) {
    DOM.recapTitle.textContent = "Aucune carte jouée.";
    return;
  }

  DOM.recapTitle.textContent = "Résultat de la partie";

  state.resultsRecap.forEach((playedCard) => {
    const card = PERSISTENT_DECKS[state.currentDeck].find(c => c.id === playedCard.id);
    if (!card) return;
    
    const status = playedCard.isCorrect ? 'success' : 'error';
    const statusText = playedCard.isCorrect ? 'RÉUSSIE' : 'ERREUR';
    
    const el = document.createElement('div');
    el.className = `result-vignette ${status} flex flex-col items-center justify-between`;
    
    const hasSoluceLink = card.soluceLink && card.soluceLink.trim() !== "";
    
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      if (hasSoluceLink) {
        window.open(card.soluceLink, '_blank');
      } else {
        openModal(card.img);
      }
    });

    el.innerHTML = `
      <img src="${card.img}" alt="${statusText}" onerror="this.onerror=null;this.src='https://placehold.co/100x60/${status === 'success' ? '10B981' : 'EF4444'}/FFFFFF?text=${statusText}';" />
      <div class="text-[0.6rem] text-gray-300 truncate w-full mt-0.5">${card.text.split(' (')[0] || "Carte"}</div>
    `;
    DOM.recapList.appendChild(el);
  });
}

function renderScores() {
  const allScores = getScores();
  const filtered = state.currentFilter === 'all' ? allScores : allScores.filter(s => s.deck === state.currentDeck);
  
  DOM.scoresList.innerHTML = '';
  if (filtered.length === 0) {
    DOM.scoresList.innerHTML = '<div class="text-gray-300 text-center py-6">Aucun score.</div>';
    return;
  }
  
  filtered.forEach(score => {
    const el = document.createElement('div');
    el.className = 'flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/8 transition';
    const deckInfo = PERSISTENT_DECK_INFO[score.deck];
    const deckEmoji = score.deckEmoji || (deckInfo ? deckInfo.emoji : '❓');
    const safePlayerName = (score.player || "Sans nom").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    
    el.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">${deckEmoji}</span>
          <span class="font-semibold">${safePlayerName}</span>
        </div>
        <div class="text-xs text-gray-400">${new Date(score.timestamp).toLocaleString('fr-FR')}</div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold ${score.percentage === 0 ? 'text-green-400' : score.percentage === 100 ? 'text-pink-400' : 'text-purple-400'}">${score.percentage}%</div>
        <div class="text-xs text-gray-400">${score.errors} erreur${score.errors > 1 ? 's' : ''}</div>
      </div>
    `;
    DOM.scoresList.appendChild(el);
  });
}

function filterScores(filter, targetElement) {
  state.currentFilter = filter;
  DOM.scoreFilterButtons.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  targetElement.classList.add('active'); 
  renderScores();
}

function saveScore(playerName, deckIndex, errors, percentage) {
  const scores = getScores();
  const deckInfo = PERSISTENT_DECK_INFO[deckIndex];
  scores.unshift({
    player: playerName,
    deck: deckIndex,
    deckName: deckInfo ? deckInfo.name : "Deck Inconnu",
    deckEmoji: deckInfo ? deckInfo.emoji : "❓",
    errors: errors,
    percentage: percentage,
    timestamp: Date.now()
  });
  localStorage.setItem('game_scores', JSON.stringify(scores.slice(0, 100)));
}

// --- MODALES ---
function openModal(modalEl) {
  if (typeof modalEl === 'string') {
    DOM.modalImage.src = modalEl;
    DOM.imageModal.classList.add('active');
  } else {
    modalEl.classList.add('active');
  }
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

function openPasswordModal() {
  DOM.passwordInput.value = '';
  DOM.passwordError.classList.add('hidden');
  openModal(DOM.passwordModal);
  DOM.passwordInput.focus();
}

function isModalOpen() {
  return DOM.imageModal.classList.contains('active') || 
         DOM.passwordModal.classList.contains('active') || 
         DOM.editCardModal.classList.contains('active') ||
         DOM.deckModal.classList.contains('active') ||
         DOM.alertModal.classList.contains('active');
}

// --- ALERTES ---
function showAlert(title, text, type = 'info') {
  DOM.alertModalTitle.textContent = title;
  DOM.alertModalText.textContent = text;
  DOM.alertModalButtons.innerHTML = '';

  DOM.alertModalTitle.className = "text-2xl font-bold mb-4 ";
  switch (type) {
    case 'success':
      DOM.alertModalTitle.classList.add('text-green-400');
      break;
    case 'error':
      DOM.alertModalTitle.classList.add('text-red-400');
      break;
    case 'warning':
      DOM.alertModalTitle.classList.add('text-yellow-400');
      break;
    default:
      DOM.alertModalTitle.classList.add('text-white');
  }

  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.className = "px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold";
  okButton.onclick = () => closeModal(DOM.alertModal);
  
  DOM.alertModalButtons.appendChild(okButton);
  openModal(DOM.alertModal);
}

function showConfirm(title, text, onConfirm) {
  DOM.alertModalTitle.textContent = title;
  DOM.alertModalText.textContent = text;
  DOM.alertModalButtons.innerHTML = '';
  DOM.alertModalTitle.className = "text-2xl font-bold mb-4 text-white";

  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Annuler";
  cancelButton.className = "px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold";
  cancelButton.onclick = () => closeModal(DOM.alertModal);
  
  const confirmButton = document.createElement('button');
  confirmButton.textContent = "Confirmer";
  confirmButton.className = "px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold";
  confirmButton.onclick = () => {
    closeModal(DOM.alertModal);
    onConfirm();
  };
  
  DOM.alertModalButtons.appendChild(cancelButton);
  DOM.alertModalButtons.appendChild(confirmButton);
  openModal(DOM.alertModal);
}

// --- UTILITAIRES ---
function shuffleArray(array) {
  const newArray = [...array]; 
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getResultMessage(errorPercent) {
  const deckIndex = state.currentDeck;
  const deckMessages = [
    {
      0: { text: "PERFECT! ZERO ERREUR", color: "bg-green-600" },
      100: { text: "100% GAY", color: "bg-pink-600" },
      50: { text: "UN TROU C UN TROU", color: "bg-purple-600" },
      default: { text: "PETIT CURIEUX", color: "bg-blue-600" }
    },
    {
      0: { text: "Intello du PC!", color: "bg-green-600" },
      100: { text: "100% Consoleux", color: "bg-red-600" },
      50: { text: "Gamer du dimanche", color: "bg-yellow-600" },
      default: { text: "Connaisseur", color: "bg-blue-600" }
    },
    {
      0: { text: "Maître du déguisement", color: "bg-green-600" },
      100: { text: "A besoin d'une-up", color: "bg-red-600" },
      50: { text: "Encore en civil", color: "bg-yellow-600" },
      default: { text: "Passionné de Pop Culture", color: "bg-blue-600" }
    }
  ];
  
  const messages = deckMessages[deckIndex] || {
    0: { text: "PARFAIT !", color: "bg-green-600" },
    50: { text: "Peut mieux faire", color: "bg-yellow-600" },
    default: { text: "Bien joué !", color: "bg-blue-600" }
  };

  if (errorPercent === 0) return messages[0];
  if (errorPercent === 100 && messages[100]) return messages[100];
  if (errorPercent >= 50 && messages[50]) return messages[50];
  return messages.default;
}

function getColorClasses(colorName) {
  const colorMap = {
    "purple": { titleColor: "text-purple-400", cardBorder: "border-purple-400/30" },
    "cyan": { titleColor: "text-cyan-400", cardBorder: "border-cyan-400/30" },
    "pink": { titleColor: "text-pink-400", cardBorder: "border-pink-400/30" },
    "green": { titleColor: "text-green-400", cardBorder: "border-green-400/30" },
    "yellow": { titleColor: "text-yellow-400", cardBorder: "border-yellow-400/30" },
    "gray": { titleColor: "text-gray-400", cardBorder: "border-gray-400/30" },
    "red": { titleColor: "text-red-400", cardBorder: "border-red-400/30" },
    "blue": { titleColor: "text-blue-400", cardBorder: "border-blue-400/30" },
    "indigo": { titleColor: "text-indigo-400", cardBorder: "border-indigo-400/30" },
    "emerald": { titleColor: "text-emerald-400", cardBorder: "border-emerald-400/30" },
    "orange": { titleColor: "text-orange-400", cardBorder: "border-orange-400/30" }
  };
  return colorMap[colorName] || colorMap["gray"];
}
