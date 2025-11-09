// --- CONSTANTES DE L'APPLICATION ---
const MAX_CARDS = 10;
// ... (code inchangé) ...
const MAX_DISP = 150;

// --- DONNÉES PAR DÉFAUT (si le localStorage est vide) ---
// ... (code inchangé) ...
// FIN DE LA MODIFICATION

// --- GESTION DE L'ÉTAT GLOBAL ---
// ... (code inchangé) ...
  }
};

// --- SÉLECTION DES ÉLÉMENTS DU DOM ---
// ... (code inchangé) ...
const DOM = {};

/**
 * Point d'entrée principal de l'application.
 * S'exécute lorsque le HTML est entièrement chargé.
 */
document.addEventListener('DOMContentLoaded', () => {
  // ... (code inchangé) ...
  // 6. Afficher l'écran d'introduction
  showScreen(DOM.introScreen);
});

/**
 * REFACTOR: Sélectionne tous les éléments DOM statiques une seule fois.
 */
function queryDOMElements() {
  // ... (code inchangé) ...
  DOM.btnCloseAlertModal = document.getElementById('btn-close-alert-modal');
}

/**
 * REFACTOR: Initialise tous les auditeurs d'événements de l'application.
 * Appelée une seule fois au démarrage.
 */
function initEventListeners() {
  // ... (code inchangé) ...
  DOM.btnChangePlayer.addEventListener('click', () => showScreen(DOM.introScreen));

  // Jeu
  DOM.btnQuitGame.addEventListener('click', quitGame);
  
  // CORRECTION: L'événement 'click' est maintenant géré directement
  // dans 'onDragEnd' pour éviter les conflifs.
  // DOM.cardElement.addEventListener('click', ...); // SUPPRIMÉ
  
  DOM.btnArrowLeft.addEventListener('click', () => handleDecision('left'));
  DOM.btnArrowRight.addEventListener('click', () => handleDecision('right'));
  
  // Événements de Drag/Swipe
// ... (code inchangé) ...
  document.addEventListener('keydown', onKeyDown);

  // Écran de fin
// ... (code inchangé) ...
  DOM.btnViewScoresFromGame.addEventListener('click', () => showScoresScreen(DOM.gameScreen));

  // Écran Scores
// ... (code inchangé) ...
  DOM.btnFilterAll.addEventListener('click', (e) => filterScores('all', e.target));

  // Écran Admin
// ... (code inchangé) ...
  DOM.btnBackFromSoluceAdmin.addEventListener('click', () => showScreen(DOM.deckScreen));

  // Écran Soluce Publique
// ... (code inchangé) ...
  DOM.btnBackFromPublicSoluce.addEventListener('click', () => showScreen(DOM.deckScreen));
  
  // Modale Image
// ... (code inchangé) ...
  DOM.btnCloseImageModal.addEventListener('click', () => closeModal(DOM.imageModal));

  // Modale Mot de Passe
// ... (code inchangé) ...
    if (e.key === 'Enter') checkPassword();
  });

  // Modale Édition Carte
// ... (code inchangé) ...
  DOM.btnCancelEditCard.addEventListener('click', () => closeModal(DOM.editCardModal));

  // Modale Édition Deck
// ... (code inchangé) ...
      swatch.classList.add('selected');
    });
  });

  // AJOUT: Événements pour la nouvelle modale d'alerte
// ... (code inchangé) ...
  DOM.btnCloseAlertModal.addEventListener('click', () => closeModal(DOM.alertModal));
}

// ------------------------------------
// --- GESTION DU STOCKAGE (localStorage) ---
// ------------------------------------

// CORRECTION: Bloc de fonctions restauré
function loadPersistentData() {
// ... (code inchangé) ...
  PERSISTENT_DECK_INFO = loadDeckInfo();
}

function loadDecks() {
// ... (code inchangé) ...
  return migrateInitialDecks();
}

function loadDeckInfo() {
// ... (code inchangé) ...
  return migrateInitialDeckInfo();
}

function migrateInitialDecks() {
// ... (code inchangé) ...
  saveDecks(decksWithIds); // Sauvegarde directe
  return decksWithIds;
}

function migrateInitialDeckInfo() {
// ... (code inchangé) ...
  saveDeckInfoToStorage(DEFAULT_DECK_INFO); // Sauvegarde directe
  return DEFAULT_DECK_INFO;
}

function saveDecks(decks) {
// ... (code inchangé) ...
}

function saveDeckInfoToStorage(info) {
// ... (code inchangé) ...
}
// FIN DU BLOC RESTAURÉ

function getScores() {
// ... (code inchangé) ...
}

// ------------------------------------
// --- IMPORT/EXPORT DES DONNÉES ---
// ------------------------------------

/**
 * Exporte toutes les données des decks (cartes et infos)
// ... (code inchangé) ...
 */
function exportData() {
// ... (code inchangé) ...
    showAlert("Erreur", "Échec de l'exportation des données.", "error");
  }
}

/**
 * Gère l'importation d'un fichier JSON de données.
// ... (code inchangé) ...
 * @param {Event} event - L'événement de changement de l'input file.
 */
function importData(event) {
// ... (code inchangé) ...
  reader.readAsText(file);
}

// ------------------------------------
// --- NAVIGATION & GESTION DES ÉCRANS ---
// ------------------------------------

function showScreen(screenEl) {
// ... (code inchangé) ...
  closeModal(DOM.alertModal); // AJOUT

  screenEl.classList.remove('hidden-screen');
  // requestAnimationFrame(() => screenEl.style.opacity = 1); // Plus nécessaire
}

function showScoresScreen(prevScreen) {
// ... (code inchangé) ...
}

function showAllSoluce() {
// ... (code inchangé) ...
  showScreen(DOM.soluceScreen);
}

function showPublicSoluce() {
// ... (code inchangé) ...
}

// ------------------------------------
// --- GÉNÉRATION D'UI DYNAMIQUE ---
// ------------------------------------

/**
 * REFACTOR: Fonction centrale pour (re)générer tout le contenu
// ... (code inchangé) ...
 */
function regenerateAllDynamicContent() {
// ... (code inchangé) ...
    DOM.editDeckSelect.innerHTML += `<option value="${index}">${info.emoji} ${info.name}</option>`;
  });
}

/**
 * REFACTOR: Renommée pour être plus claire.
// ... (code inchangé) ...
 */
function regeneratePublicSoluce() {
  generatePublicSoluceContainers();
}

function generateDeckSelectionScreen() {
// ... (code inchangé) ...
    DOM.deckSelectionGrid.appendChild(el);
  });
}

function generateScoreFilters() {
// ... (code inchangé) ...
    DOM.scoreFilterButtons.appendChild(btn);
  });
}

/**
 * REFACTOR: Utilise `createElement` pour créer les vignettes.
// ... (code inchangé) ...
 */
function generateSoluceContainers() {
// ... (code inchangé) ...
  updateSoluceDisplayModes();
}

function generatePublicSoluceContainers() {
// ... (code inchangé) ...
    (deck || []).forEach(card => {
      cardsContainer.appendChild(createSoluceCardVignette(card, deckInfo, deckIndex, true));
    });
  });
}

/**
 * REFACTOR: Crée une vignette de carte pour la galerie (Admin ou Publique)
// ... (code inchangé) ...
 * @param {boolean} [isPublic=false] - Si vrai, génère une vignette publique (sans édition)
 */
function createSoluceCardVignette(card, deckInfo, deckIndex, isPublic = false) {
// ... (code inchangé) ...
  return el;
}

/**
 * REFACTOR: Crée la vignette "+" pour ajouter une carte
// ... (code inchangé) ...
 */
function createAddCardVignette(deckIndex) {
// ... (code inchangé) ...
  return addCardEl;
}

// ------------------------------------
// --- LOGIQUE DU JEU ---
// ------------------------------------

function continueToDecks() {
// ... (code inchangé) ...
  showScreen(DOM.deckScreen);
}

function selectDeck(deckIndex) {
// ... (code inchangé) ...
  state.currentDeck = deckIndex;
  startGame();
}

function startGame() {
// ... (code inchangé) ...
  showScreen(DOM.gameScreen);
}

/**
 * AJOUT: Précharge les images pour la partie en cours.
// ... (code inchangé) ...
 */
function preloadGameImages(cardRefs) {
// ... (code inchangé) ...
  });
}

function endGame() {
// ... (code inchangé) ...
  DOM.resultMessage.className = `result-message text-2xl font-bold mb-4 px-4 py-3 rounded-lg ${result.color}`;
}

function quitGame() {
// ... (code inchangé) ...
}

function handleDecision(decision) {
// ... (code inchangé) ...
    } else {
      endGame();
    }
  }, 360);
}

// ------------------------------------
// --- LOGIQUE DE DRAG/SWIPE ---
// ------------------------------------

function onDragStart(e) {
// ... (code inchangé) ...
  DOM.cardElement.style.transition = 'none'; 
  DOM.cardElement.style.cursor = 'grabbing';
}

function onDragMove(e) {
// ... (code inchangé) ...
  DOM.cardElement.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
  updateVisualFeedback(dx); 
}

// CORRECTION: La logique de onDragEnd est modifiée pour 
// gérer le clic/tap directement.
function onDragEnd(e) {
  if (state.game.isProcessing || isModalOpen() || (!state.drag.isMouseDown && !state.drag.isDragging)) return;

  const isMouseUp = e.type === 'mouseup';
  if (isMouseUp) {
    state.drag.isMouseDown = false;
  } else { // touchend
    state.drag.isDragging = false;
  }

  DOM.cardElement.style.cursor = 'grab';
  const dx = state.drag.currentX - state.drag.startX;
  state.drag.startX = 0;
  
  DOM.cardElement.style.transition = 'transform .35s cubic-bezier(.22,.9,.27,1), opacity .35s, border-color .3s'; 
  updateVisualFeedback(0); 
  
  // CORRECTION: Si le mouvement est faible, c'est un clic/tap.
  if (Math.abs(dx) < 10) { 
    DOM.cardElement.style.transform = 'none'; // Snap back
    
    // Déclenche le zoom manuellement pour mouseup ET touchend
    if (DOM.cardImage.src && !DOM.cardImage.src.includes('placehold.co')) {
      openModal(DOM.cardImage.src);
    }
    return;
  }
  
  // Si le mouvement est suffisant, c'est un swipe
  if (dx > SWIPE_THRESHOLD) handleDecision('right');
  else if (dx < -SWIPE_THRESHOLD) handleDecision('left');
  else DOM.cardElement.style.transform = 'none';
}

function onKeyDown(e) {
// ... (code inchangé) ...
    else if (DOM.alertModal.classList.contains('active')) closeModal(DOM.alertModal); // AJOUT
  }
}


// ------------------------------------
// --- FONCTIONS ADMIN & ÉDITION ---
// ------------------------------------

function checkPassword() {
// ... (code inchangé) ...
  }
}

function toggleEditingMode() {
// ... (code inchangé) ...
}

function updateSoluceDisplayModes() {
// ... (code inchangé) ...
    DOM.soluceInfoText.textContent = "Mode CONSULTATION : Cliquez sur une vignette pour agrandir l'image. Si un lien Soluce (🔗) est présent, le clic ouvrira le lien.";
  }
}

function openEditModal(deckIndex, cardId = null) {
// ... (code inchangé) ...
  openModal(DOM.editCardModal);
}

function saveCard() {
// ... (code inchangé) ...
  showAllSoluce(); // Reste sur la page Admin
}

function deleteCard() {
// ... (code inchangé) ...
    "Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.",
    onConfirmDelete
  );
}

function openDeckModal(deckIndex = null) {
// ... (code inchangé) ...
  DOM.deckNameInput.focus();
}

function saveDeckInfo() {
// ... (code inchangé) ...
  showAllSoluce(); // Reste sur la page Admin
}

// ------------------------------------
// --- FONCTIONS UTILITAIRES & UI ---
// ------------------------------------

function updateUI() {
// ... (code inchangé) ...
  DOM.endOverlay.classList.toggle('hidden', !finished);
}

function displayCard() {
// ... (code inchangé) ...
    endGame();
  }
}

function updateVisualFeedback(dx) {
// ... (code inchangé) ...
    DOM.indicatorRight.style.transform = 'translateY(-50%) translateX(0px)';
  }
}

function displayErrorRecap() {
  DOM.recapList.innerHTML = '';
  
  if (state.resultsRecap.length === 0) {
// ... (code inchangé) ...
    return;
  }

  DOM.recapTitle.textContent = "Résultat de la partie";

  state.resultsRecap.forEach((playedCard) => {
    const card = PERSISTENT_DECKS[state.currentDeck].find(c => c.id === playedCard.id);
    if (!card) return; // Ignore si la carte n'existe plus
    
    const status = playedCard.isCorrect ? 'success' : 'error';
    const statusText = playedCard.isCorrect ? 'RÉUSSIE' : 'ERREUR';
    
    const el = document.createElement('div');
    el.className = `result-vignette ${status} flex flex-col items-center justify-between`;
    
    const hasSoluceLink = card.soluceLink && card.soluceLink.trim() !== "";
    
    // CORRECTION: Ajout du curseur et du listener pour tous les cas
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      if (hasSoluceLink) {
        window.open(card.soluceLink, '_blank');
      } else {
        openModal(card.img); // Ajout du zoom
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
// ... (code inchangé) ...
    DOM.scoresList.appendChild(el);
  });
}

function filterScores(filter, targetElement) {
// ... (code inchangé) ...
  renderScores();
}

function saveScore(playerName, deckIndex, errors, percentage) {
// ... (code inchangé) ...
  localStorage.setItem('game_scores', JSON.stringify(scores.slice(0, 100)));
}

// --- Fonctions Modales ---
function openModal(modalEl) {
// ... (code inchangé) ...
  }
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

function openPasswordModal() {
// ... (code inchangé) ...
  DOM.passwordInput.focus();
}

function isModalOpen() {
// ... (code inchangé) ...
         DOM.alertModal.classList.contains('active'); // AJOUT
}

// ------------------------------------
// --- NOUVELLES FONCTIONS D'ALERTE ---
// ------------------------------------

/**
// ... (code inchangé) ...
 * @param {string} type - 'info' (défaut), 'success' (vert), 'warning' (orange), 'error' (rouge).
 */
function showAlert(title, text, type = 'info') {
// ... (code inchangé) ...
  openModal(DOM.alertModal);
}

/**
 * Affiche une confirmation non bloquante.
// ... (code inchangé) ...
 * @param {function} onConfirm - La fonction callback à exécuter si l'utilisateur confirme.
 */
function showConfirm(title, text, onConfirm) {
// ... (code inchangé) ...
  openModal(DOM.alertModal);
}

// --- Autres Utilitaires ---
function shuffleArray(array) {
// ... (code inchangé) ...
  return newArray;
}

function getResultMessage(errorPercent) {
// ... (code inchangé) ...
  return messages.default;
}

function getColorClasses(colorName) {
// ... (code inchangé) ...
  return colorMap[colorName] || colorMap["gray"];
}
