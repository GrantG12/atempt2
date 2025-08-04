// Animate sections when they enter the viewport
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');

    function animateSections() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight - 100 && rect.bottom > 100;

            // For sections with .from-right, use slide-in-right
            if (section.classList.contains('from-right')) {
                if (isInView) {
                    section.classList.add('slide-in-right');
                } else {
                    section.classList.remove('slide-in-right');
                }
            } else {
                // Default: slide-in from left
                if (isInView) {
                    section.classList.add('slide-in');
                } else {
                    section.classList.remove('slide-in');
                }
            }
        });
    }

    // Initial check
    animateSections();

    // Animate on scroll
    window.addEventListener('scroll', animateSections);
});

// NFL College Guessing Game
document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const startGameBtn = document.getElementById('start-game');
    const gameStart = document.getElementById('game-start');
    const gamePlay = document.getElementById('game-play');
    const playerNameEl = document.getElementById('player-name');
    
    const conferenceClue = document.getElementById('conference-clue');
    const colorClue = document.getElementById('color-clue');

    const collegeGuessInput = document.getElementById('college-guess');
    const submitGuessBtn = document.getElementById('submit-guess');
    const nextPlayerBtn = document.getElementById('next-player');
    const resultEl = document.getElementById('result');
    const currentScoreEl = document.getElementById('current-score');
    
    // New DOM elements for Lives and High Score
    const livesEl = document.getElementById('lives');
    const highScoreEl = document.getElementById('high-score');
    const gameOverScreen = document.getElementById('game-over'); // Assuming you'll add this
    const finalScoreEl = document.getElementById('final-score'); // Assuming you'll add this
    const playAgainBtn = document.getElementById('play-again'); // Assuming you'll add this

    // Game variables
    let currentPlayer = null;
    let score = 0;
    let lives = 5; // Initialize lives
    let highScore = localStorage.getItem('nflCollegeHighScore') || 0; // Load high score from local storage
    let players = [];
    let usedPlayers = [];

    // Initialize game
    async function initGame() {
        try {
            const response = await fetch('players.json'); 
            if (!response.ok) {
                throw new Error('Failed to load player data');
            }
            players = await response.json();
            
            usedPlayers = [];
            score = 0;
            lives = 5; // Reset lives at the start of a new game
            updateScore();
            updateLives(); // Display initial lives
            updateHighScoreDisplay(); // Display initial high score

            gameStart.style.display = 'none';
            gamePlay.style.display = 'block';
            gameOverScreen.style.display = 'none'; // Hide game over screen
            getRandomPlayer();
        } catch (error) {
            console.error('Error loading player data:', error);
            // Fallback players
            players = [
                {
                    "name": "Tom Brady",
                    "conference": "BIG TEN",
                    "color": ["Blue", "Yellow"],
                    "college": "Michigan"
                },
                {
                    "name": "Peyton Manning",
                    "conference": "SEC",
                    "color": ["Orange", "White"],
                    "college": "Tennessee"
                }
            ];
            usedPlayers = [];
            score = 0;
            lives = 5; // Reset lives for fallback game
            updateScore();
            updateLives();
            updateHighScoreDisplay();

            gameStart.style.display = 'none';
            gamePlay.style.display = 'block';
            gameOverScreen.style.display = 'none';
            getRandomPlayer();
        }
    }

    // Get a random player not yet used
    function getRandomPlayer() {
        // Before getting a new player, check for game over
        if (lives <= 0) {
            endGame();
            return; // Stop function execution
        }

        if (players.length === 0) {
            // All players used, reset
            players = [...usedPlayers];
            usedPlayers = [];
            // Optional: If you want to end the game or do something special when all players are guessed
            // if (players.length === 0) {
            //     alert("You've guessed all players! Congratulations!");
            //     endGame();
            //     return;
            // }
        }

        const randomIndex = Math.floor(Math.random() * players.length);
        currentPlayer = players[randomIndex];
        players.splice(randomIndex, 1);
        usedPlayers.push(currentPlayer);

        displayPlayerInfo();
        resetGuess();
    }

    // Display player information
    function displayPlayerInfo() {
        playerNameEl.textContent = currentPlayer.name;
        
        conferenceClue.textContent = `Conference: ${currentPlayer.conference || 'N/A'}`;
        colorClue.textContent = `Colors: ${currentPlayer.color ? currentPlayer.color.join(", ") : 'N/A'}`;
    }

    // Reset guess input and result
    function resetGuess() {
        collegeGuessInput.value = '';
        resultEl.textContent = '';
        resultEl.style.color = ''; // Reset color
        collegeGuessInput.disabled = false;
        submitGuessBtn.style.display = 'inline-block';
        nextPlayerBtn.style.display = 'none';
    }

    // Check the player's guess
    function checkGuess() {
        const guess = collegeGuessInput.value.trim().toLowerCase();
        const correctAnswer = currentPlayer.college.toLowerCase();

        if (guess === correctAnswer) {
            resultEl.textContent = "Correct!";
            resultEl.style.color = "#00ff95";
            score += 10;
            // Update high score immediately if current score exceeds it
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('nflCollegeHighScore', highScore);
                updateHighScoreDisplay();
            }
        } else {
            lives--; // Decrement a life if incorrect
            resultEl.textContent = `Incorrect! The correct answer was ${currentPlayer.college}.`;
            resultEl.style.color = "#ff5555";
            updateLives(); // Update lives display
        }

        updateScore();
        collegeGuessInput.disabled = true;
        submitGuessBtn.style.display = 'none';
        
        // Decide whether to show next player or end game
        if (lives <= 0) {
            endGame();
        } else {
            nextPlayerBtn.style.display = 'inline-block';
        }
    }

    // Update score display
    function updateScore() {
        currentScoreEl.textContent = score;
    }

    // New: Update lives display
    function updateLives() {
        livesEl.textContent = lives;
    }

    // New: Update high score display
    function updateHighScoreDisplay() {
        highScoreEl.textContent = highScore;
    }

    // New: End the game
    function endGame() {
        gameOverScreen.style.display = 'block';
        finalScoreEl.textContent = score;

        // Check and update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('nflCollegeHighScore', highScore); // Save to local storage
            updateHighScoreDisplay();
        }
    }

    // Event listeners
    startGameBtn.addEventListener('click', initGame);
    submitGuessBtn.addEventListener('click', checkGuess);
    nextPlayerBtn.addEventListener('click', getRandomPlayer);
    playAgainBtn.addEventListener('click', initGame); // New: Event listener for play again button

    // Allow pressing Enter to submit guess
    collegeGuessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !collegeGuessInput.disabled) { // Only submit if input is not disabled
            checkGuess();
        }
    });

    // Initialize high score display on page load
    updateHighScoreDisplay();
});



