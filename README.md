# t0rg.github.io
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jeu de Tri de Cartes – Version Finale Complète</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* STYLES CSS COMPLETS (Base + Ajouts pour le feedback dynamique) */
    .bg-game { background: linear-gradient(180deg,#0b1220 0%, #071018 100%); }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.04); }
    /* MODIF CSS: Ajout de 'border-color' pour le feedback vert/rouge */
    .card-container { transition: transform .35s cubic-bezier(.22,.9,.27,1), opacity .35s, border-color .3s; will-change: transform, opacity, border-color; touch-action: none; cursor: grab; }
    .slide-out-left { transform: translateX(-150vw) rotate(-22deg) !important; opacity: 0; }
    .slide-out-right { transform: translateX(150vw) rotate(22deg) !important; opacity: 0; }
    
    /* CORRECTIF MAJEUR: 'position: absolute' est supprimé pour permettre un défilement normal.
      Les écrans sont maintenant des blocs flex centrés.
    */
    .screen { 
      /* position:absolute; inset:0; */ /* SUPPRIMÉ */
      display:flex; 
      align-items:center; 
      justify-content:center;
      width: 100%;
      min-height: calc(100vh - 12rem); /* Hauteur minimale pour centrer sur les écrans courts */
    }
    .screen.items-start { align-items: flex-start; justify-content: center; }
    .hidden-screen{ display:none; }
    
    .circular-gauge { width: 200px; height: 200px; position: relative; }
    .circular-gauge svg { transform: rotate(-90deg); }
    .gauge-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 20; }
    .gauge-progress { fill: none; stroke: url(#gaugeGradient); stroke-width: 20; stroke-linecap: round; transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .gauge-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .deck-card { transition: all 0.3s ease; cursor: pointer; }
    .deck-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .filter-btn { transition: all 0.2s ease; }
    .filter-btn.active { background: rgba(99, 102, 241, 0.5); border-color: rgb(99, 102, 241); }
    .pop{ animation: popInUp .36s cubic-bezier(.2,.9,.3,1) both; }
    @keyframes popInUp{ from{ transform: translateY(18px) scale(.99); opacity:0 } to{ transform: translateY(0) scale(1); opacity:1 } }
    input[type="text"].player-input{ background:#f3f4f6; color:#0f172a; }
    .msg { transition: opacity .25s ease; }
    .result-message { animation: fadeInScale 0.6s cubic-bezier(0.2, 0.9, 0.3, 1) 0.3s both; }
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    /* AJOUTS CSS POUR LE FEEDBACK DYNAMIQUE */
    .overlay-gradient { 
        position: absolute; 
        top: 0; 
        bottom: 0; 
        width: 50%; 
        opacity: 0; 
        pointer-events: none;
        transition: opacity .1s linear;
    }
    #overlay-left { left: 0; background: linear-gradient(90deg, rgba(168,85,247, 0.1) 0%, rgba(168,85,247, 0) 100%); }
    #overlay-right { right: 0; background: linear-gradient(-90deg, rgba(236,72,153, 0.1) 0%, rgba(236,72,153, 0) 100%); }
    .swipe-indicator {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.5rem;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        z-index: 50;
        opacity: 0;
        transition: opacity .1s linear, transform .1s linear;
    }
    #indicator-left { left: -1rem; color: #c084fc; background: rgba(168,85,247, 0.2); }
    #indicator-right { right: -1rem; color: #f472b6; background: rgba(236,72,153, 0.2); }

    /* NOUVEAU STYLE POUR LE RÉCAPITULATIF */
    .error-card-recap { transition: transform 0.3s ease; cursor: pointer; }
    .error-card-recap:hover { transform: translateY(-3px); }

    /* STYLE DE LA MODALE ET MODALE MOT DE PASSE */
    .base-modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.95);
        display: none; 
        z-index: 9999;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .base-modal.active {
        display: flex;
        opacity: 1;
    }
    #modal-content, #password-modal-content, #edit-modal-content, #deck-modal-content, #alert-modal-content {
        max-width: 90%;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 1.5rem;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
        max-height: 90%;
        box-sizing: border-box;
        /* CORRECTION: Ajout de flex pour le scrolling interne */
        display: flex;
        flex-direction: column;
    }
    #modal-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 1rem;
    }
    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 2rem;
        cursor: pointer;
        color: white;
        text-shadow: 0 0 10px black;
        transition: color 0.2s;
    }
    .close-btn:hover {
        color: #ec4899;
    }
    #password-input {
        letter-spacing: 0.5rem;
        text-align: center;
        font-size: 1.5rem;
    }
    
    /* STYLES DE BOUTONS FLÈCHES */
    .arrow-btn-container {
      margin-top: 1.5rem;
      width: 100%;
      max-width: 320px;
    }
    .arrow-btn {
        width: 70px;
        height: 48px;
        border-radius: 9999px; /* Pill shape */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        transition: background-color 0.2s, transform 0.2s;
        cursor: pointer;
        border: 2px solid;
    }
    .arrow-btn:hover {
        transform: scale(1.05);
    }
    #btn-arrow-left {
        background-color: rgba(168, 85, 247, 0.2);
        border-color: #a855f7;
        color: #a855f7;
    }
    #btn-arrow-right {
        background-color: rgba(236, 72, 153, 0.2);
        border-color: #ec4899;
        color: #ec4899;
    }
    .arrow-svg {
        width: 24px; /* Taille du SVG */
        height: 24px;
        fill: currentColor; /* Le SVG prend la couleur du parent */
        stroke-width: 2;
    }
    /* STYLE POUR LE PETIT BOUTON SOLUCE SUR DECK SCREEN */
    #btn-view-soluce-deck {
        transition: transform 0.2s ease;
    }
    #btn-view-soluce-deck:hover {
        transform: scale(1.05);
    }

    /* Style pour la galerie Soluce */
    .soluce-gallery-item {
        width: 120px;
        height: 160px;
        transition: transform 0.3s ease;
        object-fit: cover;
        position: relative;
        padding: 0.5rem;
        cursor: default;
    }
    .soluce-gallery-item-image-container {
        position: relative;
        /* CURSEUR EN MODE CONSULTATION DÉSACTIVÉ */
        cursor: default; 
    }
    /* Style pour le curseur en mode édition/soluce */
    /* MODIFICATION: SOLUCE LINK MODE UTILISE MAINTENANT isEditingMode UNIQUEMENT POUR LE CURSEUR */
    .soluce-gallery-item.editing-mode {
        cursor: pointer !important;
        outline: 2px dashed #34d399; /* Vert pour édition */
    }
    .soluce-gallery-item.editing-mode:hover {
        transform: scale(1.02);
    }
    
    /* MODIFICATION: Le mode de base (lien/zoom) utilise le curseur par défaut, mais ajoute le lien/agrandir au clic */
    .soluce-gallery-item {
        cursor: pointer;
    }
    
    /* Suppression de l'indication "cliquez pour agrandir" */
    .edit-overlay-consult { display: none !important; }

    /* Style pour les séparateurs de Deck dans Soluce */
    .soluce-deck-title {
        width: 100%;
        text-align: center;
        padding: 0.5rem 0;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
        font-weight: bold;
        border-bottom: 2px solid rgba(255, 255, 255, 0.1); 
        /* Ajout pour l'édition de deck */
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    .edit-deck-btn {
        font-size: 1rem;
        cursor: pointer;
        display: none; /* Caché par défaut */
        transition: transform 0.2s;
    }
    .edit-deck-btn:hover {
        transform: scale(1.2);
    }

    /* Styles pour cacher/montrer les decks de solution */
    .soluce-deck-content.hidden-soluce {
        display: none;
    }
    .soluce-deck-content {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem; /* Espace entre les vignettes */
    }
    /* Champs d'édition */
    #edit-card-modal input, #edit-card-modal select, #deck-modal-content input, #deck-modal-content select {
        width: 100%;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        margin-bottom: 0.75rem;
    }
    #edit-card-modal label, #deck-modal-content label {
        font-size: 0.875rem;
        color: #94a3b8;
        display: block;
        margin-bottom: 0.25rem;
        text-align: left;
    }
    /* Indicateur de lien soluce */
    .soluce-link-indicator {
        position: absolute;
        top: 5px;
        right: 5px;
        color: #f472b6;
        font-size: 1.25rem;
        pointer-events: none; /* Ne doit pas bloquer le clic sur la vignette */
    }
    /* Nouveau style pour les vignettes de résultats */
    .result-vignette {
        border-radius: 0.5rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        padding: 0.5rem;
        text-align: center;
        max-width: 100px;
        min-width: 80px;
        margin: 0.25rem;
    }
    .result-vignette.success {
        border: 2px solid #10B981; /* Vert */
    }
    .result-vignette.error {
        border: 2px solid #EF4444; /* Rouge */
    }
    .result-vignette img {
        width: 100%;
        height: 60px;
        object-fit: cover;
        border-radius: 0.25rem;
        margin-bottom: 0.25rem;
    }
    .result-vignette .result-status {
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    .result-vignette.success .result-status {
        color: #10B981;
    }
    .result-vignette.error .result-status {
        color: #EF4444;
    }
    /* Style du bouton zoom sur la carte de jeu (SUPPRIMÉ) */
    /*
    #btn-zoom-card { ... }
    */
    
    /* REFACTOR: Style pour le bouton admin dans le header (simplifié) */
    /* Le positionnement absolu a été supprimé pour utiliser flexbox */

    /* NOUVEAU STYLE: Bouton "Ajouter" (+) */
    .add-card-btn {
        width: 120px;
        height: 160px;
        display: none; /* Caché par défaut */
        align-items: center;
        justify-content: center;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0.5rem; /* Correspond à .soluce-gallery-item */
    }
    .add-card-btn:hover {
        border-color: #34d399; /* Teal */
        background: rgba(52, 211, 153, 0.1);
    }
    .add-card-btn svg {
        width: 40px;
        height: 40px;
        stroke: rgba(255, 255, 255, 0.4);
        transition: all 0.2s ease;
    }
    .add-card-btn:hover svg {
        stroke: #34d399;
        transform: scale(1.1);
    }
    
    /* NOUVEAU STYLE: Sélecteur de couleur pour Deck */
    .color-swatch {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid transparent;
        transition: transform 0.2s, border-color 0.2s;
    }
    .color-swatch.selected {
        border-color: #ffffff;
        transform: scale(1.1);
    }
    .color-swatch:hover {
        transform: scale(1.1);
    }
    /* AJOUT: Permet aux sauts de ligne (\n) de fonctionner dans la modale d'alerte */
    #alert-modal-text {
        white-space: pre-wrap;
    }
  </style>

  <!-- 
    REFACTOR: Le script est déplacé dans le <head> et utilise 'defer'.
    'defer' garantit que le script s'exécute seulement après que le HTML
    a été entièrement analysé, tout en permettant au script d'être
    téléchargé en parallèle.
    Nous utiliserons `DOMContentLoaded` pour démarrer l'application.
  -->
  <script defer>
    // --- CONSTANTES DE L'APPLICATION ---
    const MAX_CARDS = 10;
    const SOLUCE_PASSWORD = "1111"; // MOT DE PASSE SECRET
    const DECKS_KEY = 'torg_game_decks';
    const DECK_INFO_KEY = 'torg_game_deck_info';
    
    // Constantes pour le drag/swipe
    const SWIPE_THRESHOLD = 80;
    const MAX_ROT = 15;
    const MAX_DISP = 150;

    // --- DONNÉES PAR DÉFAUT (si le localStorage est vide) ---
    // Métadonnées des decks
    const DEFAULT_DECK_INFO = [
      { name: "Deck Classic", emoji: "🧜🏻", color: "purple", titleColor: "text-purple-400", cardBorder: "border-purple-400/30", indicatorLeft: "TRANS", indicatorRight: "GIRL" },
      { name: "Deck Hardcore", emoji: "🧚🏻", color: "cyan", titleColor: "text-cyan-400", cardBorder: "border-cyan-400/30", indicatorLeft: "PC", indicatorRight: "CONSOLE" },
      { name: "Deck Cosplay", emoji: "🧝🏻‍♀️", color: "pink", titleColor: "text-pink-400", cardBorder: "border-pink-400/30", indicatorLeft: "COSPLAY", indicatorRight: "IRL" }
    ];

    // MODIFICATION: Les decks initiaux sont maintenant des modèles neutres.
    const neutralImg = "https://placehold.co/400x550/FBFCF8/000000?text=?";
    const neutralCard = (correctSide = "left") => ({
      id: crypto.randomUUID(),
      text: "", // Texte vide
      correct: correctSide,
      img: neutralImg, // Image placeholder
      soluceLink: ""
    });

    const INITIAL_DECKS = [
      [ // Deck 1 (10 cartes)
        neutralCard("left"),
        neutralCard("right"),
        neutralCard("left"),
        neutralCard("right"),
        neutralCard("left"),
        neutralCard("right"), // 6
        neutralCard("left"),  // 7
        neutralCard("right"), // 8
        neutralCard("left"),  // 9
        neutralCard("right")  // 10
      ],
      [ // Deck 2 (10 cartes)
        neutralCard("left"),
        neutralCard("right"),
        neutralCard("left"),
        neutralCard("right"),
        neutralCard("left"),
        neutralCard("right"), // 6
        neutralCard("left"),  // 7
        neutralCard("right"), // 8
        neutralCard("left"),  // 9
        neutralCard("right")  // 10
      ],
      [ // Deck 3 (10 cartes)
        neutralCard("left"),
        neutralCard("right"),
        neutralCard("left"),
        neutralCard("right"),
        neutralCard("left"),
        neutralCard("right"), // 6
        neutralCard("left"),  // 7
        neutralCard("right"), // 8
        neutralCard("left"),  // 9
        neutralCard("right")  // 10
      ],
    ];
    // FIN DE LA MODIFICATION

    // --- GESTION DE L'ÉTAT GLOBAL ---
    // Les données de la base de données persistante (chargées au démarrage)
    let PERSISTENT_DECKS;
    let PERSISTENT_DECK_INFO;
    
    // L'état de l'application (réinitialisé ou chargé)
    const state = {
      playerName: '',
      currentDeck: 0,
      currentFilter: 'all',
      game: {
        score: 0,
        cardIndex: 0,
        isProcessing: false,
      },
      currentDeckCards: [], // Les 10 cartes tirées au sort pour cette partie
      resultsRecap: [],
      isEditingMode: false,
      editingCardGlobalId: null, // ID de la carte en cours d'édition
      previousScreen: null, // AJOUT: Pour mémoriser l'écran précédent
      // État du swipe/drag
      drag: {
        startX: 0,
        currentX: 0,
        isDragging: false,
        isMouseDown: false
      }
    };

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    // REFACTOR: Objet pour stocker tous les éléments du DOM
    const DOM = {};

    /**
     * Point d'entrée principal de l'application.
     * S'exécute lorsque le HTML est entièrement chargé.
     */
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Sélectionner tous les éléments du DOM
      queryDOMElements();
      
      // 2. Charger les données persistantes (ou les initialiser)
      loadPersistentData();
      
      // 3. Initialiser l'état (ex: nom du joueur)
      state.playerName = localStorage.getItem('player_name') || '';
      if (state.playerName) {
        DOM.playerNameInput.value = state.playerName;
        DOM.playerDisplay.textContent = state.playerName;
      }

      // 4. Configurer tous les auditeurs d'événements
      initEventListeners();
      
      // 5. Générer le contenu dynamique (listes de decks, galeries...)
      regenerateAllDynamicContent();

      // 6. Afficher l'écran d'introduction
      showScreen(DOM.introScreen);
    });

    /**
     * REFACTOR: Sélectionne tous les éléments DOM statiques une seule fois.
     */
    function queryDOMElements() {
      // Écrans
      DOM.introScreen = document.getElementById('intro-screen');
      DOM.deckScreen = document.getElementById('deck-screen');
      DOM.gameScreen = document.getElementById('game-screen');
      DOM.scoresScreen = document.getElementById('scores-screen'); 
      DOM.soluceScreen = document.getElementById('soluce-screen'); 
      DOM.publicSoluceScreen = document.getElementById('public-soluce-screen');
      
      // Header
      DOM.btnHeaderAdmin = document.getElementById('btn-header-admin');
      DOM.playerDisplay = document.getElementById('player-display');

      // Intro
      DOM.playerNameInput = document.getElementById('player-name');
      DOM.btnStart = document.getElementById('btn-start');
      DOM.btnViewScores = document.getElementById('btn-view-scores');

      // Sélection Deck
      DOM.deckSelectionGrid = document.getElementById('deck-selection-grid');
      DOM.btnViewScoresFromDeck = document.getElementById('btn-view-scores-from-deck');
      DOM.btnViewPublicSoluce = document.getElementById('btn-view-public-soluce');
      DOM.btnChangePlayer = document.getElementById('btn-change-player');
      
      // Jeu
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
      DOM.arrowBtnContainer = document.querySelector('.arrow-btn-container'); // REFACTOR
      DOM.btnArrowLeft = document.getElementById('btn-arrow-left');
      DOM.btnArrowRight = document.getElementById('btn-arrow-right');
      DOM.messageBox = document.getElementById('message-box');
      
      // Écran de fin
      DOM.endOverlay = document.getElementById('end-overlay');
      DOM.gaugeCircle = document.getElementById('gauge-circle');
      DOM.gaugePercentage = document.getElementById('gauge-percentage');
      DOM.resultMessage = document.getElementById('result-message');
      DOM.recapTitle = document.getElementById('recap-title');
      DOM.recapList = document.getElementById('recap-list');
      DOM.btnChooseDeck = document.getElementById('btn-choose-deck');
      DOM.btnReplay = document.getElementById('btn-replay');
      DOM.btnViewScoresFromGame = document.getElementById('btn-view-scores-from-game');
      
      // Écran Scores
      DOM.btnBackFromScores = document.getElementById('btn-back-from-scores');
      DOM.scoreFilterButtons = document.getElementById('score-filter-buttons');
      DOM.btnFilterAll = document.getElementById('btn-filter-all'); // REFACTOR: Ajout d'un ID pour le bouton "Tous"
      DOM.scoresList = document.getElementById('scores-list');

      // Écran Admin (Soluce)
      DOM.btnToggleEdit = document.getElementById('btn-toggle-edit');
      DOM.btnAddDeck = document.getElementById('btn-add-deck');
      // AJOUT DES NOUVEAUX BOUTONS
      DOM.btnExportData = document.getElementById('btn-export-data');
      DOM.btnImportData = document.getElementById('btn-import-data');
      DOM.importFileInput = document.getElementById('import-file-input');
      // FIN AJOUT
      DOM.btnBackFromSoluceAdmin = document.getElementById('btn-back-from-soluce-admin');
      DOM.soluceGalleryContainer = document.getElementById('soluce-gallery-container');
      DOM.soluceInfoText = document.getElementById('soluce-info-text');

      // Écran Soluce Publique
      DOM.btnBackFromPublicSoluce = document.getElementById('btn-back-from-public-soluce');
      DOM.publicSoluceGalleryContainer = document.getElementById('public-soluce-gallery-container');

      // Modale Image
      DOM.imageModal = document.getElementById('image-modal');
      DOM.modalImage = document.getElementById('modal-image');
      DOM.btnCloseImageModal = document.getElementById('btn-close-image-modal');

      // Modale Mot de Passe
      DOM.passwordModal = document.getElementById('password-modal');
      DOM.passwordInput = document.getElementById('password-input');
      DOM.passwordError = document.getElementById('password-error');
      DOM.btnCheckPassword = document.getElementById('btn-check-password');
      DOM.btnClosePasswordModal = document.getElementById('btn-close-password-modal');

      // Modale Édition Carte
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

      // Modale Édition Deck
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

      // AJOUT: Nouvelle modale d'alerte/confirmation
      DOM.alertModal = document.getElementById('alert-modal');
      DOM.alertModalTitle = document.getElementById('alert-modal-title');
      DOM.alertModalText = document.getElementById('alert-modal-text');
      DOM.alertModalButtons = document.getElementById('alert-modal-buttons');
      DOM.btnCloseAlertModal = document.getElementById('btn-close-alert-modal');
    }

    /**
     * REFACTOR: Initialise tous les auditeurs d'événements de l'application.
     * Appelée une seule fois au démarrage.
     */
    function initEventListeners() {
      // Header
      DOM.btnHeaderAdmin.addEventListener('click', openPasswordModal);

      // Intro
      DOM.btnStart.addEventListener('click', continueToDecks);
      DOM.btnViewScores.addEventListener('click', () => showScoresScreen(DOM.introScreen));
      
      // Sélection Deck
      DOM.btnViewScoresFromDeck.addEventListener('click', () => showScoresScreen(DOM.deckScreen));
      DOM.btnViewPublicSoluce.addEventListener('click', showPublicSoluce);
      DOM.btnChangePlayer.addEventListener('click', () => showScreen(DOM.introScreen));

      // Jeu
      DOM.btnQuitGame.addEventListener('click', quitGame);
      DOM.cardElement.addEventListener('click', () => {
        // N'ouvre la modale que si l'image n'est pas le placeholder par défaut
        if (DOM.cardImage.src && !DOM.cardImage.src.includes('placehold.co')) {
          openModal(DOM.cardImage.src);
        }
      });
      DOM.btnArrowLeft.addEventListener('click', () => handleDecision('left'));
      DOM.btnArrowRight.addEventListener('click', () => handleDecision('right'));
      
      // Événements de Drag/Swipe
      DOM.cardElement.addEventListener('touchstart', onDragStart, { passive: true });
      DOM.cardElement.addEventListener('touchmove', onDragMove, { passive: true });
      DOM.cardElement.addEventListener('touchend', onDragEnd);
      DOM.cardElement.addEventListener('mousedown', onDragStart);
      document.addEventListener('mousemove', onDragMove); // Écoute sur tout le document
      document.addEventListener('mouseup', onDragEnd);     // Écoute sur tout le document
      
      // Événements de clavier
      document.addEventListener('keydown', onKeyDown);

      // Écran de fin
      DOM.btnChooseDeck.addEventListener('click', () => {
        DOM.endOverlay.classList.add('hidden');
        showScreen(DOM.deckScreen);
      });
      DOM.btnReplay.addEventListener('click', () => {
        DOM.endOverlay.classList.add('hidden');
        startGame();
      });
      DOM.btnViewScoresFromGame.addEventListener('click', () => showScoresScreen(DOM.gameScreen));

      // Écran Scores
      DOM.btnBackFromScores.addEventListener('click', () => {
        // Retourne à l'écran mémorisé, ou au deckScreen par défaut
        showScreen(state.previousScreen || DOM.deckScreen);
      });
      DOM.btnFilterAll.addEventListener('click', (e) => filterScores('all', e.target));

      // Écran Admin
      DOM.btnToggleEdit.addEventListener('click', toggleEditingMode);
      DOM.btnAddDeck.addEventListener('click', () => openDeckModal(null));
      // AJOUT DES NOUVEAUX ÉVÉNEMENTS
      DOM.btnExportData.addEventListener('click', exportData);
      DOM.btnImportData.addEventListener('click', () => DOM.importFileInput.click()); // Ouvre le sélecteur de fichier
      DOM.importFileInput.addEventListener('change', importData); // Gère le fichier sélectionné
      // FIN AJOUT
      DOM.btnBackFromSoluceAdmin.addEventListener('click', () => showScreen(DOM.deckScreen));

      // Écran Soluce Publique
      DOM.btnBackFromPublicSoluce.addEventListener('click', () => showScreen(DOM.deckScreen));
      
      // Modale Image
      DOM.imageModal.addEventListener('click', (e) => {
        if (e.target.id === 'image-modal') closeModal(DOM.imageModal);
      });
      DOM.btnCloseImageModal.addEventListener('click', () => closeModal(DOM.imageModal));

      // Modale Mot de Passe
      DOM.passwordModal.addEventListener('click', (e) => {
        if (e.target.id === 'password-modal') closeModal(DOM.passwordModal);
      });
      DOM.btnClosePasswordModal.addEventListener('click', () => closeModal(DOM.passwordModal));
      DOM.btnCheckPassword.addEventListener('click', checkPassword);
      DOM.passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkPassword();
      });

      // Modale Édition Carte
      DOM.editCardModal.addEventListener('click', (e) => {
        if (e.target.id === 'edit-card-modal') closeModal(DOM.editCardModal);
      });
      DOM.saveCardBtn.addEventListener('click', saveCard);
      DOM.btnDeleteCard.addEventListener('click', deleteCard);
      DOM.btnCancelEditCard.addEventListener('click', () => closeModal(DOM.editCardModal));

      // Modale Édition Deck
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

      // AJOUT: Événements pour la nouvelle modale d'alerte
      DOM.alertModal.addEventListener('click', (e) => {
        if (e.target.id === 'alert-modal') closeModal(DOM.alertModal);
      });
      DOM.btnCloseAlertModal.addEventListener('click', () => closeModal(DOM.alertModal));
    }

    // ------------------------------------
    // --- GESTION DU STOCKAGE (localStorage) ---
    // ------------------------------------

    // CORRECTION: Bloc de fonctions restauré
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
          console.error("Erreur lors du chargement des decks, réinitialisation.");
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
      saveDecks(decksWithIds); // Sauvegarde directe
      return decksWithIds;
    }
    
    function migrateInitialDeckInfo() {
      saveDeckInfoToStorage(DEFAULT_DECK_INFO); // Sauvegarde directe
      return DEFAULT_DECK_INFO;
    }

    function saveDecks(decks) {
      localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
    }
    
    function saveDeckInfoToStorage(info) {
      localStorage.setItem(DECK_INFO_KEY, JSON.stringify(info));
    }
    // FIN DU BLOC RESTAURÉ

    function getScores() {
      return JSON.parse(localStorage.getItem('game_scores') || '[]');
    }
    
    // ------------------------------------
    // --- IMPORT/EXPORT DES DONNÉES ---
    // ------------------------------------

    /**
     * Exporte toutes les données des decks (cartes et infos)
     * dans un fichier JSON téléchargeable.
     */
    function exportData() {
      console.log("Exportation des données...");
      try {
        // 1. Créer l'objet de données
        const data = {
          decks: PERSISTENT_DECKS,
          info: PERSISTENT_DECK_INFO
        };
        
        // 2. Convertir en chaîne JSON (avec formatage pour lisibilité)
        const dataString = JSON.stringify(data, null, 2);
        
        // 3. Créer un Blob (fichier en mémoire)
        const blob = new Blob([dataString], { type: 'application/json' });
        
        // 4. Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Génère un nom de fichier avec la date, ex: torg_beta_backup_2025-11-09.json
        a.download = `torg_beta_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        // 5. Simuler le clic, télécharger, puis nettoyer
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error("Erreur lors de l'exportation:", error);
        // REMPLACEMENT: alert -> showAlert
        showAlert("Erreur", "Échec de l'exportation des données.", "error");
      }
    }

    /**
     * Gère l'importation d'un fichier JSON de données.
     * Appelé par l'événement 'change' de l'input file.
     * @param {Event} event - L'événement de changement de l'input file.
     */
    function importData(event) {
      const file = event.target.files[0];
      if (!file) {
        console.log("Aucun fichier sélectionné.");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // 1. Lire et analyser le contenu du fichier
          const content = e.target.result;
          const data = JSON.parse(content);
          
          // 2. Valider la structure du fichier
          if (data && Array.isArray(data.decks) && Array.isArray(data.info)) {
            
            const totalDecks = data.info.length;
            const totalCards = data.decks.reduce((sum, deck) => sum + deck.length, 0);
            
            // 3. REMPLACEMENT: confirm -> showConfirm (logique asynchrone)
            
            // Étape 3a: Définir ce qu'il faut faire si l'utilisateur confirme
            const onConfirmImport = () => {
              // 4. Sauvegarder les nouvelles données dans localStorage
              saveDecks(data.decks);
              saveDeckInfoToStorage(data.info);
              
              // 5. Recharger l'état de l'application et rafraîchir l'interface
              loadPersistentData(); // Met à jour les variables globales
              regenerateAllDynamicContent(); // Redessine toute l'UI
              
              // REMPLACEMENT: alert -> showAlert
              showAlert("Importation Réussie", "Les nouveaux decks sont chargés.", "success");
            };
            
            // Étape 3b: Afficher la modale de confirmation
            showConfirm(
              "Confirmer l'importation",
              `Vous allez importer ${totalDecks} deck(s) et ${totalCards} carte(s).\n\nATTENTION: Cela écrasera et remplacera toutes les données actuelles. Continuer ?`,
              onConfirmImport
            );
            
          } else {
            throw new Error("Structure de fichier invalide. Le JSON doit contenir les clés 'decks' et 'info' (tableaux).");
          }
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          // REMPLACEMENT: alert -> showAlert
          showAlert("Erreur d'importation", `Échec: ${error.message}`, "error");
        } finally {
          // Réinitialiser le champ de fichier pour permettre de réimporter le même fichier
          event.target.value = null;
        }
      };
      
      reader.onerror = (error) => {
         console.error("Erreur de lecture du fichier:", error);
         // REMPLACEMENT: alert -> showAlert
         showAlert("Erreur", "Échec de la lecture du fichier.", "error");
         event.target.value = null;
      };
      
      reader.readAsText(file);
    }

    // ------------------------------------
    // --- NAVIGATION & GESTION DES ÉCRANS ---
    // ------------------------------------

    function showScreen(screenEl) {
      const mainScreens = [
        DOM.introScreen, DOM.deckScreen, DOM.gameScreen, 
        DOM.scoresScreen, DOM.soluceScreen, DOM.publicSoluceScreen
      ];
      
      mainScreens.forEach(s => {
        s.classList.add('hidden-screen');
        // s.style.opacity = 0; // Opacité gérée par 'hidden-screen'
      });

      // S'assurer que les modales sont cachées
      closeModal(DOM.imageModal);
      closeModal(DOM.passwordModal);
      closeModal(DOM.editCardModal);
      closeModal(DOM.deckModal);
      closeModal(DOM.alertModal); // AJOUT

      screenEl.classList.remove('hidden-screen');
      // requestAnimationFrame(() => screenEl.style.opacity = 1); // Plus nécessaire
    }
    
    function showScoresScreen(prevScreen) {
      state.previousScreen = prevScreen; // Mémorise l'écran d'où on vient
      renderScores();
      showScreen(DOM.scoresScreen);
    }

    function showAllSoluce() {
      // Montre tous les titres et conteneurs
      DOM.soluceGalleryContainer.querySelectorAll('.soluce-deck-title').forEach(el => el.style.display = 'flex');
      DOM.soluceGalleryContainer.querySelectorAll('.soluce-deck-content').forEach(el => {
        el.classList.remove('hidden-soluce');
      });
      
      state.isEditingMode = false;
      updateSoluceDisplayModes(); // Réinitialise les modes
      showScreen(DOM.soluceScreen);
    }
    
    function showPublicSoluce() {
      regeneratePublicSoluce(); // S'assure que la galerie publique est à jour
      showScreen(DOM.publicSoluceScreen);
    }

    // ------------------------------------
    // --- GÉNÉRATION D'UI DYNAMIQUE ---
    // ------------------------------------

    /**
     * REFACTOR: Fonction centrale pour (re)générer tout le contenu
     * dépendant des données persistantes.
     */
    function regenerateAllDynamicContent() {
      generateDeckSelectionScreen();
      generateSoluceContainers();
      generatePublicSoluceContainers();
      generateScoreFilters();
      
      // Met à jour la liste des decks dans la modale d'édition
      DOM.editDeckSelect.innerHTML = '';
      PERSISTENT_DECK_INFO.forEach((info, index) => {
        DOM.editDeckSelect.innerHTML += `<option value="${index}">${info.emoji} ${info.name}</option>`;
      });
    }
    
    /**
     * REFACTOR: Renommée pour être plus claire.
     * Utilise `document.createElement` pour plus de sécurité et de clarté.
     */
    function regeneratePublicSoluce() {
      generatePublicSoluceContainers();
    }
    
    function generateDeckSelectionScreen() {
      DOM.deckSelectionGrid.innerHTML = ''; // Vide la grille
      
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
      // Vider les anciens filtres (sauf le bouton 'Tous')
      DOM.scoreFilterButtons.querySelectorAll('.filter-btn:not(#btn-filter-all)').forEach(btn => btn.remove());
      
      PERSISTENT_DECK_INFO.forEach((deckInfo, index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn px-4 py-2 bg-white/6 border border-white/10 rounded-lg text-sm';
        btn.textContent = `${deckInfo.emoji} ${deckInfo.name}`;
        btn.addEventListener('click', (e) => filterScores(index, e.target));
        DOM.scoreFilterButtons.appendChild(btn);
      });
    }

    /**
     * REFACTOR: Utilise `createElement` pour créer les vignettes.
     * C'est plus verbeux mais beaucoup plus propre.
     */
    function generateSoluceContainers() {
      DOM.soluceGalleryContainer.innerHTML = ''; // Nettoyer l'ancien contenu

      PERSISTENT_DECKS.forEach((deck, deckIndex) => {
        const deckInfo = PERSISTENT_DECK_INFO[deckIndex];
        if (!deckInfo) {
          console.warn(`Pas d'info pour le deck ${deckIndex}, le deck sera ignoré.`);
          return;
        }
        
        // Crée le titre du Deck
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

        // Crée le conteneur spécifique du Deck
        const cardsContainer = document.createElement('div');
        cardsContainer.id = `soluce-deck-${deckIndex}`;
        cardsContainer.className = 'soluce-deck-content hidden-soluce';
        DOM.soluceGalleryContainer.appendChild(cardsContainer);
        
        // Ajoute les cartes
        (deck || []).forEach(card => {
          cardsContainer.appendChild(createSoluceCardVignette(card, deckInfo, deckIndex));
        });
        
        // Ajoute le bouton "Ajouter une carte"
        cardsContainer.appendChild(createAddCardVignette(deckIndex));
      });
      
      updateSoluceDisplayModes();
    }
    
    function generatePublicSoluceContainers() {
      DOM.publicSoluceGalleryContainer.innerHTML = ''; // Nettoyer l'ancien contenu

      PERSISTENT_DECKS.forEach((deck, deckIndex) => {
        const deckInfo = PERSISTENT_DECK_INFO[deckIndex];
        if (!deckInfo) return; // Ignore les decks sans info
        
        // Crée le titre du Deck
        const titleEl = document.createElement('h4');
        titleEl.className = `soluce-deck-title ${deckInfo.titleColor}`;
        titleEl.innerHTML = `${deckInfo.emoji} ${deckInfo.name} (${(deck || []).length} cartes)`;
        DOM.publicSoluceGalleryContainer.appendChild(titleEl);

        // Crée le conteneur spécifique du Deck
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'soluce-deck-content';
        DOM.publicSoluceGalleryContainer.appendChild(cardsContainer);
        
        // Ajoute les cartes (en mode public/consultation)
        (deck || []).forEach(card => {
          cardsContainer.appendChild(createSoluceCardVignette(card, deckInfo, deckIndex, true));
        });
      });
    }

    /**
     * REFACTOR: Crée une vignette de carte pour la galerie (Admin ou Publique)
     * @param {object} card - L'objet carte
     * @param {object} deckInfo - Les métadonnées du deck
     * @param {number} deckIndex - L'index du deck
     * @param {boolean} [isPublic=false] - Si vrai, génère une vignette publique (sans édition)
     */
    function createSoluceCardVignette(card, deckInfo, deckIndex, isPublic = false) {
      const el = document.createElement('div');
      el.className = 'soluce-gallery-item flex flex-col justify-between p-2 glass rounded-lg border-2 ' + deckInfo.cardBorder;
      el.setAttribute('data-card-id', card.id);
      el.setAttribute('data-deck-index', deckIndex);
      
      const hasSoluceLink = card.soluceLink && card.soluceLink.trim() !== "";
      
      // Gestion du clic
      el.addEventListener('click', () => {
        if (!isPublic && state.isEditingMode) {
          openEditModal(deckIndex, card.id);
        } else if (hasSoluceLink) {
          window.open(card.soluceLink, '_blank');
        } else {
          openModal(card.img);
        }
      });
      
      // Conteneur d'image (pour le fond)
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
      textDiv.textContent = card.text.split(' (')[0] || "Carte sans texte"; // Fallback
      
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
    
    /**
     * REFACTOR: Crée la vignette "+" pour ajouter une carte
     * @param {number} deckIndex - L'index du deck auquel ajouter la carte
     */
    function createAddCardVignette(deckIndex) {
      const addCardEl = document.createElement('div');
      addCardEl.className = 'soluce-gallery-item add-card-btn';
      addCardEl.style.display = 'none'; // Caché par défaut
      addCardEl.addEventListener('click', () => openEditModal(deckIndex, null));
      addCardEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      `;
      return addCardEl;
    }

    // ------------------------------------
    // --- LOGIQUE DU JEU ---
    // ------------------------------------
    
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
      // Vérifie si le deck a assez de cartes
      if (!PERSISTENT_DECKS[deckIndex] || PERSISTENT_DECKS[deckIndex].length < MAX_CARDS) {
        showAlert(
          "Deck incomplet",
          `Ce deck n'a que ${PERSISTENT_DECKS[deckIndex]?.length || 0} cartes. Il en faut au moins ${MAX_CARDS} pour jouer.`,
          "warning"
        );
        return;
      }
      state.currentDeck = deckIndex;
      startGame();
    }

    function startGame() {
      state.resultsRecap = []; // Réinitialise les résultats
      
      const fullDeck = PERSISTENT_DECKS[state.currentDeck];
      const shuffledDeck = shuffleArray(fullDeck);
      
      // Stocke une référence ID unique
      state.currentDeckCards = shuffledDeck.slice(0, MAX_CARDS).map(c => ({ id: c.id })); 
      
      // AJOUT: Précharger les images du jeu
      preloadGameImages(state.currentDeckCards);
      
      state.game = { score: 0, cardIndex: 0, isProcessing: false };
      updateUI();
      displayCard();
      showScreen(DOM.gameScreen);
    }
    
    /**
     * AJOUT: Précharge les images pour la partie en cours.
     * @param {Array} cardRefs - Tableau des références de cartes (ex: [{id: '...'}])
     */
    function preloadGameImages(cardRefs) {
      const fullDeck = PERSISTENT_DECKS[state.currentDeck];
      
      cardRefs.forEach(ref => {
        const card = fullDeck.find(c => c.id === ref.id);
        if (card && card.img) {
          const img = new Image(); // Crée un objet Image en mémoire
          img.src = card.img;       // Déclenche le téléchargement
        }
      });
    }

    function endGame() {
      state.game.isProcessing = true;
      const pct = Math.round((state.game.score / MAX_CARDS) * 100);
      saveScore(state.playerName, state.currentDeck, state.game.score, pct);
      displayErrorRecap(); // Affiche le récapitulatif
      updateUI(); // Met à jour l'UI (qui masquera la carte)
      state.game.isProcessing = false;
      DOM.endOverlay.classList.remove('hidden');
      // DOM.endOverlay.style.opacity = 1; // Plus nécessaire
      
      // Animer la jauge
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
      
      // Si la carte n'existe plus (ex: supprimée pendant le jeu), on passe
      if (!cur) {
        state.game.cardIndex++;
        state.game.isProcessing = false;
        displayCard(); // Affiche la carte suivante
        return;
      }

      const isCorrect = decision === cur.correct; 
      
      // Stocke le résultat
      currentCardRef.isCorrect = isCorrect; 
      currentCardRef.img = cur.img;
      currentCardRef.text = cur.text;
      state.resultsRecap.push(currentCardRef);
      
      if (!isCorrect) {
        state.game.score++;
        DOM.cardElement.style.borderColor = '#EF4444'; // Rouge
      } else {
        DOM.cardElement.style.borderColor = '#10B981'; // Vert
      }
      
      // Feedback visuel (dégradé)
      if (decision === 'left') {
        DOM.overlayLeft.style.opacity = '0.5';
        DOM.overlayLeft.style.transition = 'opacity 0.2s ease-out';
      } else {
        DOM.overlayRight.style.opacity = '0.5';
        DOM.overlayRight.style.transition = 'opacity 0.2s ease-out';
      }
      
      const slideClass = decision === 'left' ? 'slide-out-left' : 'slide-out-right';
      DOM.cardElement.classList.add(slideClass);
      
      setTimeout(() => {
        DOM.cardElement.classList.remove(slideClass);
        state.game.cardIndex++;
        
        // Réinitialisation des dégradés
        DOM.overlayLeft.style.opacity = '0';
        DOM.overlayRight.style.opacity = '0';
        DOM.overlayLeft.style.transition = 'opacity 0.1s linear';
        DOM.overlayRight.style.transition = 'opacity 0.1s linear';
        
        if (state.game.cardIndex < MAX_CARDS) {
          updateUI();
          displayCard();
          state.game.isProcessing = false;
        } else {
          endGame();
        }
      }, 360);
    }

    // ------------------------------------
    // --- LOGIQUE DE DRAG/SWIPE ---
    // ... (Fonctions onDragStart, onDragMove, onDragEnd) ...
    function onDragStart(e) {
      if (state.game.isProcessing || state.game.cardIndex >= MAX_CARDS || isModalOpen()) return;

      if (e.type === 'mousedown') {
        state.drag.isMouseDown = true;
        state.drag.startX = e.clientX;
        e.preventDefault(); // Empêche la sélection de texte
      } else { // touchstart
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
      } else { // touchmove
        state.drag.currentX = e.touches[0].clientX;
      }
      
      const dx = state.drag.currentX - state.drag.startX;
      let rot = (dx / MAX_DISP) * MAX_ROT;
      rot = Math.max(-MAX_ROT, Math.min(MAX_ROT, rot));
      
      DOM.cardElement.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
      updateVisualFeedback(dx); 
    }

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

      // Si c'est un clic rapide (ou un tap), ne pas traiter comme un swipe
      // Sauf si c'est un mouseup, auquel cas on veut permettre le "clic" pour la modale
      if (Math.abs(dx) < 10 && !isMouseUp) {
        DOM.cardElement.style.transition = 'transform .35s cubic-bezier(.22,.9,.27,1), opacity .35s, border-color .3s';
        DOM.cardElement.style.transform = 'none'; // Snap back
        return;
      }
      
      DOM.cardElement.style.transition = 'transform .35s cubic-bezier(.22,.9,.27,1), opacity .35s, border-color .3s'; 
      updateVisualFeedback(0); 
      
      if (dx > SWIPE_THRESHOLD) handleDecision('right');
      else if (dx < -SWIPE_THRESHOLD) handleDecision('left');
      else DOM.cardElement.style.transform = 'none';
    }
    
    function onKeyDown(e) {
      // Gérer les touches fléchées pour le jeu
      if (!DOM.gameScreen.classList.contains('hidden-screen')) {
        if (isModalOpen()) return; // Ne pas jouer si une modale est ouverte
        if (e.key === 'ArrowLeft') handleDecision('left');
        if (e.key === 'ArrowRight') handleDecision('right');
      }
      
      // Gérer la touche Échap pour fermer les modales
      if (e.key === 'Escape') {
        if (DOM.imageModal.classList.contains('active')) closeModal(DOM.imageModal);
        else if (DOM.passwordModal.classList.contains('active')) closeModal(DOM.passwordModal);
        else if (DOM.editCardModal.classList.contains('active')) closeModal(DOM.editCardModal);
        else if (DOM.deckModal.classList.contains('active')) closeModal(DOM.deckModal);
        else if (DOM.alertModal.classList.contains('active')) closeModal(DOM.alertModal); // AJOUT
      }
    }


    // ------------------------------------
    // --- FONCTIONS ADMIN & ÉDITION ---
    // ------------------------------------

    function checkPassword() {
      const inputCode = DOM.passwordInput.value;
      if (inputCode === SOLUCE_PASSWORD) {
        closeModal(DOM.passwordModal);
        showAllSoluce(); // Affiche la soluce complète
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
      // Met à jour les vignettes de carte
      DOM.soluceGalleryContainer.querySelectorAll('.soluce-gallery-item:not(.add-card-btn)').forEach(item => {
        item.classList.toggle('editing-mode', state.isEditingMode);
      });
      
      // Met à jour les boutons
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

      // Met à jour le texte d'information
      if (state.isEditingMode) {
        DOM.soluceInfoText.textContent = "Mode ÉDITION ACTIF : Cliquez sur une carte pour la modifier ou la supprimer, ou utilisez le bouton 'Ajouter une carte'.";
      } else {
        DOM.soluceInfoText.textContent = "Mode CONSULTATION : Cliquez sur une vignette pour agrandir l'image. Si un lien Soluce (🔗) est présent, le clic ouvrira le lien.";
      }
    }

    function openEditModal(deckIndex, cardId = null) {
      state.editingCardGlobalId = cardId;
      DOM.passwordModal.classList.remove('active');

      if (cardId === null) {
        // MODE AJOUT
        DOM.editModalTitle.textContent = 'Ajouter une nouvelle carte';
        DOM.editCardId.value = '';
        DOM.editCardText.value = '';
        DOM.editCardImg.value = '';
        DOM.editCardSoluceLink.value = '';
        DOM.editCardCorrect.value = 'left';
        DOM.editDeckSelect.value = deckIndex !== null ? deckIndex.toString() : '0';
        DOM.editDeckSelect.disabled = false;
        DOM.btnDeleteCard.style.display = 'none';
      } else {
        // MODE ÉDITION
        const deck = PERSISTENT_DECKS[deckIndex];
        const card = deck.find(c => c.id === cardId);
        
        if (card) {
          DOM.editModalTitle.textContent = 'Modifier la carte existante';
          DOM.editCardId.value = cardId;
          DOM.editCardDeckIndex.value = deckIndex;
          DOM.editCardText.value = card.text;
          DOM.editCardImg.value = card.img;
          DOM.editCardSoluceLink.value = card.soluceLink || '';
          DOM.editCardCorrect.value = card.correct;
          DOM.editDeckSelect.value = deckIndex.toString();
          DOM.editDeckSelect.disabled = true; // Empêche de changer le deck
          DOM.btnDeleteCard.style.display = 'block';
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
      
      let decks = loadDecks(); // Charge la version la plus récente
      
      if (state.editingCardGlobalId) {
        // MODIFICATION
        const oldDeckIndex = parseInt(DOM.editCardDeckIndex.value);
        const cardIndex = decks[oldDeckIndex].findIndex(c => c.id === state.editingCardGlobalId);
        if (cardIndex !== -1) {
          decks[oldDeckIndex][cardIndex] = newCard;
        }
      } else {
        // AJOUT
        if (!decks[deckIndex]) decks[deckIndex] = []; // Crée le deck s'il n'existe pas
        decks[deckIndex].push(newCard);
      }

      saveDecks(decks);
      PERSISTENT_DECKS = decks; // Met à jour l'état global
      closeModal(DOM.editCardModal);
      
      regenerateAllDynamicContent();
      showAllSoluce(); // Reste sur la page Admin
    }

    function deleteCard() {
      const cardId = DOM.editCardId.value;
      const deckIndex = parseInt(DOM.editCardDeckIndex.value);
      
      if (!cardId || isNaN(deckIndex)) return;
      
      // REMPLACEMENT: confirm -> showConfirm (logique asynchrone)
      
      // Étape 1: Définir ce qu'il faut faire en cas de confirmation
      const onConfirmDelete = () => {
        let decks = loadDecks();
        decks[deckIndex] = decks[deckIndex].filter(card => card.id !== cardId);
        
        saveDecks(decks);
        PERSISTENT_DECKS = decks; // Met à jour l'état global
        closeModal(DOM.editCardModal);
        
        regenerateAllDynamicContent();
        showAllSoluce(); // Reste sur la page Admin
      };

      // Étape 2: Afficher la modale de confirmation
      showConfirm(
        "Supprimer la carte",
        "Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.",
        onConfirmDelete
      );
    }
    
    function openDeckModal(deckIndex = null) {
      DOM.deckColorSelector.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      DOM.editDeckId.value = '';

      if (deckIndex === null) {
        // MODE AJOUT
        DOM.deckModalTitle.textContent = "Créer un nouveau Deck";
        DOM.deckNameInput.value = '';
        DOM.deckEmojiInput.value = '';
        DOM.deckIndicatorLeftInput.value = 'GAUCHE';
        DOM.deckIndicatorRightInput.value = 'DROITE';
        DOM.deckColorSelector.querySelector('.color-swatch').classList.add('selected');
      } else {
        // MODE ÉDITION
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
          DOM.deckColorSelector.querySelector('.color-swatch').classList.add('selected'); // Fallback
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
        // REMPLACEMENT: alert -> showAlert
        showAlert("Formulaire incomplet", "Veuillez remplir tous les champs.", "warning");
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
        // MODE ÉDITION
        info[parseInt(deckIndexToEdit)] = newDeckInfo;
      } else {
        // MODE AJOUT
        info.push(newDeckInfo);
        decks.push([]); // Ajoute un tableau vide pour les cartes
      }

      saveDeckInfoToStorage(info);
      saveDecks(decks);
      
      PERSISTENT_DECKS = decks;
      PERSISTENT_DECK_INFO = info;
      
      regenerateAllDynamicContent();
      closeModal(DOM.deckModal);
      showAllSoluce(); // Reste sur la page Admin
    }

    // ------------------------------------
    // --- FONCTIONS UTILITAIRES & UI ---
    // ------------------------------------

    function updateUI() {
      DOM.scoreDisplay.textContent = state.game.score;
      const cardNum = Math.min(state.game.cardIndex + 1, MAX_CARDS);
      DOM.indexDisplay.textContent = `${cardNum}/${MAX_CARDS}`;
      
      const finished = state.game.cardIndex >= MAX_CARDS;
      
      // CORRECTION: Cache la carte et les flèches à la fin du jeu
      DOM.cardHolder.classList.toggle('hidden', finished);
      DOM.arrowBtnContainer.classList.toggle('hidden', finished);
      
      // Affiche ou cache l'écran de fin
      DOM.endOverlay.classList.toggle('hidden', !finished);
    }

    function displayCard() {
      if (state.game.cardIndex < MAX_CARDS) {
        const cur = PERSISTENT_DECKS[state.currentDeck].find(c => c.id === state.currentDeckCards[state.game.cardIndex].id);
        
        if (cur) { // Vérifie si la carte a été trouvée
          DOM.cardImage.src = cur.img;
          DOM.cardText.textContent = cur.text;
        } else {
          // Fallback si la carte a été supprimée pendant le jeu
          DOM.cardImage.src = neutralImg;
          DOM.cardText.textContent = "Erreur - Carte non trouvée";
        }
        
        DOM.cardElement.style.transform = 'none';
        DOM.cardElement.style.opacity = '1';
        DOM.cardElement.classList.remove('slide-out-left', 'slide-out-right');
        
        DOM.cardElement.style.borderColor = 'rgba(255,255,255,0.04)'; 
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

      if (dx < 0) { // Glissement vers la gauche
        DOM.overlayLeft.style.opacity = (opacityRatio * 0.9).toString();
        DOM.overlayRight.style.opacity = '0';
        DOM.indicatorLeft.style.opacity = opacityRatio > 0.1 ? '1' : '0';
        DOM.indicatorRight.style.opacity = '0';
        DOM.indicatorLeft.style.transform = `translateY(-50%) translateX(${Math.min(0, 10 + dx / 5)}px)`;
      } else if (dx > 0) { // Glissement vers la droite
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
        if (hasSoluceLink) {
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => {
            window.open(card.soluceLink, '_blank');
          });
        }

        el.innerHTML = `
          <img src="${card.img}" alt="${statusText}" onerror="this.onerror=null;this.src='https://placehold.co/100x60/${status === 'success' ? '10B981' : 'EF4444'}/FFFFFF?text=${statusText}';" />
          <div class="text-[0.6rem] text-gray-300 truncate w-full mt-0.5">${card.text.split(' (')[0] || "Carte"}</div>
        `;
        DOM.recapList.appendChild(el);
      });
    }

    function renderScores() {
      const allScores = getScores();
      const filtered = state.currentFilter === 'all' ? allScores : allScores.filter(s => s.deck === state.currentFilter);
      
      DOM.scoresList.innerHTML = '';
      if (filtered.length === 0) {
        DOM.scoresList.innerHTML = '<div class="text-gray-300 text-center py-6">Aucun score enregistré.</div>';
        return;
      }
      
      filtered.forEach(score => {
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/8 transition';
        const deckInfo = PERSISTENT_DECK_INFO[score.deck];
        const deckEmoji = score.deckEmoji || (deckInfo ? deckInfo.emoji : '❓');
        // Sécurisation du nom du joueur
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

    // --- Fonctions Modales ---
    function openModal(modalEl) {
      if (typeof modalEl === 'string') {
        // C'est une URL d'image pour l'imageModal
        DOM.modalImage.src = modalEl;
        DOM.imageModal.classList.add('active');
      } else {
        // C'est un élément modal
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
             DOM.alertModal.classList.contains('active'); // AJOUT
    }
    
    // ------------------------------------
    // --- NOUVELLES FONCTIONS D'ALERTE ---
    // ------------------------------------

    /**
     * Affiche une alerte non bloquante.
     * @param {string} title - Le titre de l'alerte.
     * @param {string} text - Le message de l'alerte.
     * @param {string} type - 'info' (défaut), 'success' (vert), 'warning' (orange), 'error' (rouge).
     */
    function showAlert(title, text, type = 'info') {
      DOM.alertModalTitle.textContent = title;
      DOM.alertModalText.textContent = text;
      DOM.alertModalButtons.innerHTML = ''; // Vide les anciens boutons

      // Couleur du titre
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

      // Bouton OK
      const okButton = document.createElement('button');
      okButton.textContent = "OK";
      okButton.className = "px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold";
      okButton.onclick = () => closeModal(DOM.alertModal);
      
      DOM.alertModalButtons.appendChild(okButton);
      openModal(DOM.alertModal);
    }

    /**
     * Affiche une confirmation non bloquante.
     * @param {string} title - Le titre de la confirmation.
     * @param {string} text - La question de confirmation.
     * @param {function} onConfirm - La fonction callback à exécuter si l'utilisateur confirme.
     */
    function showConfirm(title, text, onConfirm) {
      DOM.alertModalTitle.textContent = title;
      DOM.alertModalText.textContent = text;
      DOM.alertModalButtons.innerHTML = ''; // Vide les anciens boutons
      DOM.alertModalTitle.className = "text-2xl font-bold mb-4 text-white"; // Couleur par défaut

      // Bouton Annuler
      const cancelButton = document.createElement('button');
      cancelButton.textContent = "Annuler";
      cancelButton.className = "px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold";
      cancelButton.onclick = () => closeModal(DOM.alertModal);
      
      // Bouton Confirmer (rouge pour indiquer une action destructive)
      const confirmButton = document.createElement('button');
      confirmButton.textContent = "Confirmer";
      confirmButton.className = "px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold";
      confirmButton.onclick = () => {
        closeModal(DOM.alertModal);
        onConfirm(); // Exécute le callback
      };
      
      DOM.alertModalButtons.appendChild(cancelButton);
      DOM.alertModalButtons.appendChild(confirmButton);
      openModal(DOM.alertModal);
    }

    // --- Autres Utilitaires ---
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
        // Deck 0: Classic
        {
          0: { text: "PERFECT! ZERO ERREUR", color: "bg-green-600" },
          100: { text: "100% GAY", color: "bg-pink-600" },
          50: { text: "UN TROU C UN TROU", color: "bg-purple-600" },
          default: { text: "PETIT CURIEUX", color: "bg-blue-600" }
        },
        // Deck 1: Hardcore
        {
          0: { text: "Intello du PC!", color: "bg-green-600" },
          100: { text: "100% Consoleux", color: "bg-red-600" },
          50: { text: "Gamer du dimanche", color: "bg-yellow-600" },
          default: { text: "Connaisseur", color: "bg-blue-600" }
        },
        // Deck 2: Cosplay
        {
          0: { text: "Maître du déguisement", color: "bg-green-600" },
          100: { text: "A besoin d'une-up", color: "bg-red-600" },
          50: { text: "Encore en civil", color: "bg-yellow-600" },
          default: { text: "Passionné de Pop Culture", color: "bg-blue-600" }
        }
      ];
      
      const messages = deckMessages[deckIndex] || {
        // Fallback pour les nouveaux decks
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

  </script>
</head>
<body class="bg-game text-white min-h-screen font-sans flex items-center justify-center p-6">
  
  <!-- 
    CORRECTIF: 'h-[680px]' et 'max-h-[95vh]' sont supprimés pour permettre au contenu de grandir.
    'min-h-[680px]' est ajouté pour les écrans courts.
  -->
  <div id="app" class="relative w-full max-w-3xl min-h-[680px] rounded-2xl overflow-hidden border border-white/6 shadow-2xl flex flex-col">
    
    <!-- 
      REFACTOR: En-tête simplifié utilisant flexbox standard.
      Le bouton "Admin" n'est plus en position absolue.
    -->
    <header class="flex items-center justify-between mb-6 px-6 pt-6 relative flex-shrink-0">
      <div class="flex-shrink-0 w-24 text-left"> <!-- Conteneur à largeur fixe pour le bouton Admin -->
        <button id="btn-header-admin" class="px-4 py-2 bg-pink-600/60 border border-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600/80 transition-colors">Admin</button>
      </div>
      <h1 class="text-2xl font-extrabold flex-1 text-center truncate px-4">TORG_BETA v1</h1>
      <div class="text-sm text-gray-300 flex-shrink-0 w-24 text-right"> <!-- Conteneur à largeur fixe pour le joueur -->
        Joueur: <span id="player-display" class="truncate">N/A</span>
      </div>
    </header>

    <!-- 
      CORRECTIF: 'h-[calc(100%-84px)]' est supprimé. 'flex-1' est ajouté
      pour que main prenne la place restante si #app est plus grand que le contenu.
    -->
    <main class="relative w-full flex-1 flex flex-col">

      <!-- 
        Écran d'introduction
        CORRECTIF: 'min-height' est géré par la classe .screen
      -->
      <section id="intro-screen" class="screen glass p-8 z-40">
        <div class="w-full max-w-md text-center mx-auto">
          <h2 class="text-3xl font-bold mb-2">Bienvenue</h2>
          <p class="text-sm text-gray-300 mb-4">Entre ton pseudo pour commencer à jouer.</p>
          <input id="player-name" class="player-input w-full p-3 rounded-lg placeholder-gray-500 border border-gray-300 mb-4" type="text" maxlength="24" placeholder="Ton pseudo" />
          <div class="flex gap-3 justify-center">
            <button id="btn-start" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">Continuer</button>
            <button id="btn-view-scores" class="px-4 py-2 bg-white/6 hover:bg-white/8 rounded-lg">Scores</button>
          </div>
          <p class="text-xs text-gray-400 mt-4">Astuce : swipe vers la gauche/droite ou utilise les flèches ← →</p>
        </div>
      </section>

      <!-- 
        Écran de sélection de deck
        CORRECTIF: 'overflow-y-auto' est supprimé. 'items-start' est conservé.
      -->
      <section id="deck-screen" class="screen hidden-screen glass p-8 z-35 items-start">
        <div class="w-full max-w-4xl mx-auto flex flex-col">
          <h2 class="text-3xl font-bold mb-2 text-center flex-shrink-0">Choisis ton Deck</h2>
          <p class="text-sm text-gray-300 mb-8 text-center flex-shrink-0">Sélectionne un deck pour commencer la partie</p>
          
          <div id="deck-selection-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Les cartes de deck seront générées ici par JS -->
          </div>

          <div class="mt-6 text-center flex justify-center gap-3 flex-shrink-0">
            <button id="btn-view-scores-from-deck" class="px-4 py-2 bg-white/6 hover:bg-white/8 rounded-lg text-sm">Scores</button>
            <button id="btn-view-public-soluce" class="px-4 py-2 bg-indigo-600/60 border border-indigo-500 rounded-lg text-sm">Galerie Soluce</button> 
            <button id="btn-change-player" class="px-4 py-2 bg-white/6 hover:bg-white/8 rounded-lg text-sm">Changer Pseudo</button>
          </div>
        </div>
      </section>

      <!-- 
        Écran de jeu
      -->
      <section id="game-screen" class="screen hidden-screen p-6 z-30 flex-col">
        
        <div id="overlay-left" class="overlay-gradient"></div>
        <div id="overlay-right" class="overlay-gradient"></div>
        
        <div class="flex justify-between w-full mb-4 items-center px-6 flex-shrink-0">
          <div class="flex items-center gap-4">
              <div class="text-lg">Score: <span id="score-display">0</span></div>
              <div class="text-lg">Carte: <span id="index-display">1/10</span></div>
          </div>
          <button id="btn-quit-game" class="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded-lg">Quitter</button>
        </div>

        <!-- 
          CORRECTIF: L'écran de fin de partie est déplacé HORS de card-holder.
          Il est maintenant un frère de card-holder.
        -->
        <div id="card-holder" class="relative w-full max-w-lg mx-auto h-[420px] flex items-center justify-center px-6">
          
          <div id="indicator-left" class="swipe-indicator">TRANS</div>
          <div id="indicator-right" class="swipe-indicator">GIRL</div>

          <!-- LA CARTE DE JEU (clic pour agrandir) -->
          <div id="card" class="card-container relative w-full h-full bg-gradient-to-b from-gray-800/85 to-gray-900/70 rounded-2xl shadow-2xl p-6 flex flex-col justify-between items-center border border-white/6">
            <img id="card-image" src="" alt="Carte" class="w-full h-auto max-h-[72%] object-contain rounded-lg shadow-inner mt-4" onerror="this.onerror=null;this.src='https://placehold.co/400x550/2563EB/FFFFFF?text=Carte';" />
            
            <p id="card-text" class="text-lg text-center font-medium text-gray-100 mt-4 mb-2"></p>
          </div>
        </div>
        
        <!-- 
          ÉCRAN DE FIN DE PARTIE (maintenant à l'extérieur de card-holder)
          CORRECTIF: 'position: absolute' est restauré ici pour se superposer
        -->
        <div id="end-overlay" class="absolute inset-0 flex-col justify-center items-center text-center hidden z-40 bg-[#0b1220] p-6 overflow-y-auto">
          <h2 class="text-4xl font-extrabold text-teal-300 mb-6 pop">Fin de Partie</h2>
          
          <div class="circular-gauge mx-auto mb-6">
            <svg viewBox="0 0 200 200" width="200" height="200">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#06b6d4" />
                  <stop offset="50%" stop-color="#7c3aed" />
                  <stop offset="100%" stop-color="#ec4899" />
                </linearGradient>
              </defs>
              <circle class="gauge-bg" cx="100" cy="100" r="80" />
              <circle id="gauge-circle" class="gauge-progress" cx="100" cy="100" r="80" 
                      stroke-dasharray="502.65" stroke-dashoffset="502.65" />
            </svg>
            <div class="gauge-center">
              <div class="text-5xl font-black text-white" id="gauge-percentage">0%</div>
              <div class="text-xs text-gray-400 mt-1">d'erreurs</div>
            </div>
          </div>

          <p class="text-lg text-gray-300 mb-2">Vous êtes :</p>
          <div id="result-message" class="result-message text-2xl font-bold mb-4 px-4 py-3 rounded-lg"></div>

          <div id="error-recap" class="w-full mb-6 max-w-md mx-auto">
              <p id="recap-title" class="text-xl font-bold text-gray-100 mb-4">Résultat de la partie</p>
              <div id="recap-list" class="flex flex-wrap justify-center gap-2">
                  <!-- Les vignettes de résultats seront insérées ici -->
              </div>
          </div>

          <div class="flex gap-3 justify-center flex-wrap">
            <button id="btn-choose-deck" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">Choisir un autre Deck</button>
            <button id="btn-replay" class="px-4 py-2 bg-white/6 rounded-lg">Rejouer ce Deck</button>
            <button id="btn-view-scores-from-game" class="px-4 py-2 bg-white/6 rounded-lg">Voir Scores</button>
          </div>
        </div>

        <!-- BOUTONS DE DÉCISION (Flèches SVG) -->
        <div class="flex justify-between items-center arrow-btn-container mx-auto">
            <button id="btn-arrow-left" class="arrow-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" class="arrow-svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
            <button id="btn-arrow-right" class="arrow-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" class="arrow-svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </button>
        </div>

        <div id="message-box" class="mt-4 p-3 bg-yellow-900 text-yellow-300 rounded-lg text-center hidden msg">Message</div>
      </section>

      <!-- 
        Écran des scores
        CORRECTIF: 'overflow-y-auto' est supprimé. 'items-start' est conservé.
      -->
      <section id="scores-screen" class="screen hidden-screen glass p-6 z-20 flex-col items-start">
        <div class="w-full max-w-2xl mx-auto flex flex-col">
          <div class="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 class="text-2xl font-bold">Historique des Scores</h3>
            <button id="btn-back-from-scores" class="px-3 py-1 bg-indigo-600 rounded">Retour</button>
          </div>

          <div id="score-filter-buttons" class="flex gap-2 mb-4 flex-wrap flex-shrink-0">
            <button id="btn-filter-all" class="filter-btn active px-4 py-2 bg-white/6 border border-white/10 rounded-lg text-sm">Tous</button>
            <!-- Les filtres de deck seront générés dynamiquement -->
          </div>

          <div id="scores-list" class="space-y-2 p-3 bg-white/4 rounded-lg"></div>
        </div>
      </section>

      <!-- ÉCRAN ADMINISTRATEUR (Anciennement Soluce Screen) -->
      <!-- REFACTOR: 'overflow-y-auto' est supprimé. 'items-start' est conservé. -->
      <section id="soluce-screen" class="screen hidden-screen glass p-6 z-20 flex-col items-start">
        <div class="w-full max-w-2xl mx-auto flex flex-col">
          
          <!-- REFACTOR: En-tête de l'admin responsive -->
          <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 flex-shrink-0">
            <h3 class="text-2xl font-bold flex-shrink-0">Admin</h3>
            <!-- 
              REFACTOR: Conteneur de boutons qui passe en colonne sur mobile (flex-col)
              et en ligne (flex-row) sur sm:.
              Utilise sm:flex-1 pour prendre la place restante.
            -->
            <div class="flex flex-wrap items-center justify-center sm:flex-1 sm:justify-end gap-3">
              <button id="btn-toggle-edit" class="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded">Activer l'édition</button>
              
              <button id="btn-add-deck" class="px-4 py-1 bg-green-600 hover:bg-green-700 rounded-lg font-semibold" style="display: none;">Créer Deck</button>
              
              <button id="btn-export-data" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm" style="display: none;">Exporter</button>
              <button id="btn-import-data" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm" style="display: none;">Importer</button>
              <input type="file" id="import-file-input" class="hidden" accept=".json" />
              
              <button id="btn-back-from-soluce-admin" class="px-3 py-1 bg-indigo-600 rounded">Retour au Jeu</button>
            </div>
          </div>

          <p id="soluce-info-text" class="text-sm text-gray-300 mb-4 flex-shrink-0">Mode par défaut: Cliquez sur une vignette pour agrandir l'image. Utilisez les boutons ci-dessus pour changer de mode.</p>

          <div id="soluce-gallery-container" class="p-3 bg-white/4 rounded-lg">
            <!-- Les galeries de deck seront générées ici par JS -->
          </div>
          
        </div>
      </section>
      <!-- FIN ÉCRAN ADMINISTRATEUR -->

      <!-- NOUVEL ÉCRAN DE SOLUTION (PUBLIC) -->
      <!-- REFACTOR: 'overflow-y-auto' est supprimé. 'items-start' est conservé. -->
      <section id="public-soluce-screen" class="screen hidden-screen glass p-6 z-20 flex-col items-start">
        <div class="w-full max-w-2xl mx-auto flex flex-col">
          <div class="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 class="text-2xl font-bold">Galerie Solution</h3>
            <button id="btn-back-from-public-soluce" class="px-3 py-1 bg-indigo-600 rounded">Retour au Jeu</button>
          </div>

          <p class="text-sm text-gray-300 mb-4 flex-shrink-0">Cliquez sur une carte pour l'agrandir.</p>

          <div id="public-soluce-gallery-container" class="p-3 bg-white/4 rounded-lg">
            <!-- Contenu généré par generatePublicSoluceContainers() -->
          </div>
        </div>
      </section>
      <!-- FIN NOUVEL ÉCRAN PUBLIC -->

    </main>
  </div>

  <!-- MODALE MOT DE PASSE -->
  <div id="password-modal" class="base-modal">
    <span id="btn-close-password-modal" class="close-btn">&times;</span>
    <div id="password-modal-content" class="w-full max-w-xs text-center">
      <h4 class="text-xl font-bold mb-4">Mot de Passe Soluce</h4>
      <p class="text-sm text-gray-400 mb-4">Entrez le code à 4 chiffres pour accéder à la galerie.</p>
      <input type="password" id="password-input" maxlength="4" class="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white border border-pink-500/50 focus:border-pink-500 focus:ring-0" />
      <button id="btn-check-password" class="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold">Déverrouiller</button>
      <p id="password-error" class="text-sm text-red-400 mt-3 hidden">Code incorrect. Veuillez réessayer.</p>
    </div>
  </div>

  <!-- MODALE D'ÉDITION/AJOUT DE CARTE -->
  <div id="edit-card-modal" class="base-modal">
    <!-- REFACTOR: Bouton de fermeture a un ID -->
    <span id="btn-close-edit-modal" class="close-btn">&times;</span>
    <div id="edit-modal-content" class="w-full max-w-lg text-center flex flex-col">
        <h4 id="edit-modal-title" class="text-2xl font-bold mb-4 flex-shrink-0">Ajouter une nouvelle carte</h4>
        
        <form id="card-form" class="flex flex-col flex-grow min-h-0" onsubmit="return false;">
            <div class="flex-grow overflow-y-auto pr-2">
                <!-- Champ caché pour l'index de la carte (pour l'édition) -->
                <input type="hidden" id="edit-card-deck-index">
                <input type="hidden" id="edit-card-id">
                
                <label for="edit-deck-select">Sélectionner le Deck :</label>
                <select id="edit-deck-select">
                    <!-- Les options de deck seront générées dynamiquement -->
                </select>

                <label for="edit-card-text">Question / Texte (Ex: PC (GAUCHE) ou Console (DROITE) ?):</label>
                <input type="text" id="edit-card-text" required placeholder="Question / Texte" />

                <label for="edit-card-img">URL de l'Image (Ex: https://...):</label>
                <input type="url" id="edit-card-img" required placeholder="URL de l'Image" />
                
                <label for="edit-card-soluce-link">Lien Soluce (URL, Optionnel) :</label>
                <input type="url" id="edit-card-soluce-link" placeholder="Lien vers la solution ou la source" />

                <label for="edit-card-correct">Réponse Correcte :</label>
                <select id="edit-card-correct" required>
                    <option value="left">GAUCHE</option>
                    <option value="right">DROITE</option>
                </select>
            </div>
            
            <div class="mt-4 flex gap-3 pt-4 border-t border-white/10 flex-shrink-0">
                <button type="button" id="save-card-btn" class="flex-grow py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">Sauvegarder</button>
                <button type="button" id="btn-delete-card" class="flex-grow py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">Supprimer la carte</button>
                <button type="button" id="btn-cancel-edit-card" class="flex-grow py-2 bg-gray-500 hover:bg-gray-600 rounded-lg">Annuler</button>
            </div>
        </form>
    </div>
  </div>

  <!-- NOUVELLE MODALE D'AJOUT/MODIFICATION DE DECK -->
  <div id="deck-modal" class="base-modal">
    <span id="btn-close-deck-modal" class="close-btn">&times;</span>
    <div id="deck-modal-content" class="w-full max-w-lg text-center flex flex-col">
        <h4 id="deck-modal-title" class="text-2xl font-bold mb-4 flex-shrink-0">Créer un nouveau Deck</h4>
        <form id="deck-form" class="flex flex-col flex-grow min-h-0" onsubmit="return false;">
            
            <div class="flex-grow overflow-y-auto pr-2">
                <input type="hidden" id="edit-deck-id">
            
                <label for="deck-name">Nom du Deck :</label>
                <input type="text" id="deck-name" required placeholder="Ex: Deck Célébrités" />

                <label for="deck-emoji">Emoji (Ex: 🔥) :</label>
                <input type="text" id="deck-emoji" required placeholder="🔥" maxlength="2" />
                
                <label for="deck-indicator-left">Indicateur Gauche (Texte) :</label>
                <input type="text" id="deck-indicator-left" required placeholder="Ex: TRANS" maxlength="10" />
                
                <label for="deck-indicator-right">Indicateur Droit (Texte) :</label>
                <input type="text" id="deck-indicator-right" required placeholder="Ex: GIRL" maxlength="10" />

                <label>Couleur du Deck :</label>
                <div id="deck-color-selector" class="flex justify-center gap-3 mb-4">
                    <div class="color-swatch bg-purple-500" data-color-name="purple"></div>
                    <div class="color-swatch bg-cyan-500" data-color-name="cyan"></div>
                    <div class="color-swatch bg-pink-500" data-color-name="pink"></div>
                    <div class="color-swatch bg-green-500" data-color-name="green"></div>
                    <div class="color-swatch bg-yellow-500" data-color-name="yellow"></div>
                    <div class="color-swatch bg-gray-500" data-color-name="gray"></div>
                    <div class="color-swatch bg-red-500" data-color-name="red"></div>
                    <div class="color-swatch bg-blue-500" data-color-name="blue"></div>
                    <div class="color-swatch bg-indigo-500" data-color-name="indigo"></div>
                    <div class="color-swatch bg-emerald-500" data-color-name="emerald"></div>
                    <div class="color-swatch bg-orange-500" data-color-name="orange"></div>
                </div>
            </div>
            
            <div class="mt-4 flex gap-3 pt-4 border-t border-white/10 flex-shrink-0">
                <button type="button" id="btn-save-deck" class="flex-grow py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">Sauvegarder</button>
                <button type="button" id="btn-cancel-deck" class="flex-grow py-2 bg-gray-500 hover:bg-gray-600 rounded-lg">Annuler</button>
            </div>
        </form>
    </div>
  </div>


  <!-- MODALE PLEIN ÉCRAN POUR L'IMAGE -->
  <div id="image-modal" class="base-modal">
    <span id="btn-close-image-modal" class="close-btn">&times;</span>
    <div id="modal-content">
      <img id="modal-image" src="" alt="Image en grand" />
    </div>
  </div>

  <!-- NOUVELLE MODALE DE CONFIRMATION/ALERTE -->
  <div id="alert-modal" class="base-modal">
    <span id="btn-close-alert-modal" class="close-btn">&times;</span>
    <div id="alert-modal-content" class="w-full max-w-md text-center">
      <h4 id="alert-modal-title" class="text-2xl font-bold mb-4 text-white">Titre de l'alerte</h4>
      <p id="alert-modal-text" class="text-gray-300 mb-6">Message de l'alerte...</p>
      <div id="alert-modal-buttons" class="flex gap-3 justify-end">
        <!-- Boutons générés par JS -->
      </div>
    </div>
  </div>

</body>
</html>
