// --- Configuration & Constants ---
// Emoji sets for different cards. We need up to 10 pairs (20 cards) for "Hard" mode.
const EMOJIS = ['🚀', '🎸', '🍔', '🎨', '🧩', '🌟', '💎', '🎮', '🕹️', '🏆'];

// Difficulty settings defining rows x cols.
const DIFFICULTIES = {
    easy: { pairs: 6, cols: 4, classname: 'easy' },     // 12 cards -> 4 cols, 3 rows
    medium: { pairs: 8, cols: 4, classname: 'medium' }, // 16 cards -> 4 cols, 4 rows
    hard: { pairs: 10, cols: 5, classname: 'hard' }     // 20 cards -> 5 cols, 4 rows
};

// --- State Variables ---
let currentDifficulty = 'medium';
let cardsArray = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isBoardLocked = false;
let timerStarted = false;
let timeElapsed = 0;
let timerInterval = null;

// --- DOM Elements ---
const gameBoardContainer = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves-display');
const timeDisplay = document.getElementById('time-display');
const difficultySelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart-btn');
const winModal = document.getElementById('win-modal');
const playAgainBtn = document.getElementById('play-again-btn');
const finalTimeDisplay = document.getElementById('final-time');
const finalMovesDisplay = document.getElementById('final-moves');

// --- Initialization ---
function initGame() {
    // Reset State
    matchedPairs = 0;
    moves = 0;
    flippedCards = [];
    isBoardLocked = false;
    timeElapsed = 0;
    timerStarted = false;
    clearInterval(timerInterval);
    
    // Update UI
    movesDisplay.textContent = moves;
    timeDisplay.textContent = formatTime(timeElapsed);
    winModal.classList.remove('active');
    
    // Setup Board
    currentDifficulty = difficultySelect.value;
    const { pairs, classname } = DIFFICULTIES[currentDifficulty];
    
    // Create Deck
    const selectedEmojis = EMOJIS.slice(0, pairs);
    cardsArray = [...selectedEmojis, ...selectedEmojis]; // Duplicate to make pairs
    cardsArray = shuffleArray(cardsArray);
    
    // Render Board
    gameBoardContainer.className = `game-board ${classname}`;
    gameBoardContainer.innerHTML = '';
    
    cardsArray.forEach((emoji, index) => {
        const cardElement = createCardElement(emoji, index);
        gameBoardContainer.appendChild(cardElement);
    });
}

// --- Helper Functions ---
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    timerInterval = setInterval(() => {
        timeElapsed++;
        timeDisplay.textContent = formatTime(timeElapsed);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// --- Card Interactions ---
function createCardElement(emoji, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-face', 'card-back');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-face', 'card-front');
    cardFront.textContent = emoji;

    card.appendChild(cardBack);
    card.appendChild(cardFront);

    card.addEventListener('click', onCardClick);
    return card;
}

function onCardClick() {
    // Prevent clicking if board is locked, card is already flipped or matched
    if (isBoardLocked) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    // Start timer on first move
    startTimer();

    // Flip card
    this.classList.add('flipped');
    flippedCards.push(this);

    // Check for match when two cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    isBoardLocked = true; // prevent more clicks
    
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;

    if (isMatch) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            matchedPairs++;
            
            // Check win condition
            if (matchedPairs === DIFFICULTIES[currentDifficulty].pairs) {
                gameWon();
            }
            
            resetBoard();
        }, 500); // Wait a bit for the flip animation to finish before pulsing
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            resetBoard();
        }, 1000); // Let them see the cards for 1s
    }
}

function resetBoard() {
    flippedCards = [];
    isBoardLocked = false;
}

function gameWon() {
    stopTimer();
    setTimeout(() => {
        finalTimeDisplay.textContent = formatTime(timeElapsed);
        finalMovesDisplay.textContent = moves;
        winModal.classList.add('active');
    }, 600); // Show modal slightly after last match animation
}

// --- Event Listeners ---
difficultySelect.addEventListener('change', initGame);
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Start game initially
initGame();
