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
// ... (code inchangé) ...
 */
document.addEventListener('DOMContentLoaded', () => {
  // ... (code inchangé) ...
  // 6. Afficher l'écran d'introduction
  showScreen(DOM.introScreen);
});

/**
 * REFACTOR: Sélectionne tous les éléments DOM statiques une seule fois.
// ... (code inchangé) ...
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
  
  // CORRECTION: L'événement 'click' est géré par onDragEnd
  // DOM.cardElement.addEventListener('click', ...); // SUPPRIMÉ
  
  DOM.btnArrowLeft.addEventListener('click', () => handleDecision('left'));
// ... (code inchangé) ...
  DOM.btnCloseAlertModal.addEventListener('click', () => closeModal(DOM.alertModal));
}

// ------------------------------------
// --- GESTION DU STOCKAGE (localStorage) ---
// ... (code inchangé) ...
// ------------------------------------
// FIN DU BLOC RESTAURÉ

function getScores() {
// ... (code inchangé) ...
}

// ------------------------------------
// --- IMPORT/EXPORT DES DONNÉES ---
// ... (code inchangé) ...
// ------------------------------------

function exportData() {
// ... (code inchangé) ...
  }
}

/**
 * Gère l'importation d'un fichier JSON de données.
// ... (code inchangé) ...
 */
function importData(event) {
// ... (code inchangé) ...
  reader.readAsText(file);
}

// ------------------------------------
// --- NAVIGATION & GESTION DES ÉCRANS ---
// ... (code inchangé) ...
// ------------------------------------

function showScreen(screenEl) {
// ... (code inchangé) ...
  screenEl.classList.remove('hidden-screen');
  // requestAnimationFrame(() => screenEl.style.opacity = 1); // Plus nécessaire
}

function showScoresScreen(prevScreen) {
// ... (code inchangé) ...
}

function showAllSoluce() {
// ... (code inchangé) ...
}

function showPublicSoluce() {
// ... (code inchangé) ...
}

// ------------------------------------
// --- GÉNÉRATION D'UI DYNAMIQUE ---
// ... (code inchangé) ...
// ------------------------------------

/**
 * REFACTOR: Fonction centrale pour (re)générer tout le contenu
// ... (code inchangé) ...
 */
function regenerateAllDynamicContent() {
// ... (code inchangé) ...
  });
}

/**
 * REFACTOR: Renommée pour être plus claire.
// ... (code inchangé) ...
 */
function regeneratePublicSoluce() {
// ... (code inchangé) ...
}

function generateDeckSelectionScreen() {
// ... (code inchangé) ...
}

function generateScoreFilters() {
// ... (code inchangé) ...
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
    });
  });
}

/**
 * REFACTOR: Crée une vignette de carte pour la galerie (Admin ou Publique)
// ... (code inchangé) ...
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
// ... (code inchangé) ...
// ------------------------------------

function continueToDecks() {
// ... (code inchangé) ...
}

function selectDeck(deckIndex) {
// ... (code inchangé) ...
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
// ... (code inchangé) ...
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
  }
}

function openEditModal(deckIndex, cardId = null) {
// ... (code inchangé) ...
}

function saveCard() {
// ... (code inchangé) ...
}

function deleteCard() {
// ... (code inchangé) ...
  );
}

function openDeckModal(deckIndex = null) {
// ... (code inchangé) ...
}

function saveDeckInfo() {
// ... (code inchangé) ...
}

// ------------------------------------
// --- FONCTIONS UTILITAIRES & UI ---
// ... (code inchangé) ...
// ------------------------------------

function updateUI() {
// ... (code inchangé) ...
}

function displayCard() {
// ... (code inchangé) ...
  }
}
    
function updateVisualFeedback(dx) {
// ... (code inchangé) ...
  }
}

function displayErrorRecap() {
  DOM.recapList.innerHTML = '';
// ... (code inchangé) ...
  if (state.resultsRecap.length === 0) {
    DOM.recapTitle.textContent = "Aucune carte jouée dans cette partie.";
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
// ... (code inchangé) ...
}
    
function openPasswordModal() {
// ... (code inchangé) ...
}
    
function isModalOpen() {
// ... (code inchangé) ...
         DOM.alertModal.classList.contains('active'); // AJOUT
}
    
// ------------------------------------
// --- NOUVELLES FONCTIONS D'ALERTE ---
// ... (code inchangé) ...
// ------------------------------------

/**
 * Affiche une alerte non bloquante.
// ... (code inchangé) ...
 */
function showAlert(title, text, type = 'info') {
// ... (code inchangé) ...
  openModal(DOM.alertModal);
}

/**
 * Affiche une confirmation non bloquante.
// ... (code inchangé) ...
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
