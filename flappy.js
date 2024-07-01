const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener('touchstart', function(event) {
    bird.velocityY = -4; // Adjust as per touch sensitivity
});

canvas.addEventListener('touchend', function(event) {
    bird.velocityY = 0; // Adjust as per touch sensitivity
});
let bird = {
    x: 50,
    y: 150,
    width: 136, 
    height: 96,
    velocityX: 0,
    velocityY: 0,
    image: new Image()
};
bird.image.src = 'download-removebg-preview.png'; // Ensure you have a bird image in your project directory

let pipes = [];
let gap;
let pipeSpeed;
let gravity = 0.3;
let score = 0;
let gameInterval;
let playerName = '';

let backgroundMusic = new Audio('background-music.mp3'); 
let runningMusic = new Audio('Flappy Bird Theme Song.mp3'); 
let wallHitSound = new Audio('flappy-bird-hit-sound-101soundboards.mp3'); 
let crossWallSound = new Audio('point-101soundboards.mp3'); 
backgroundMusic.loop = true;
runningMusic.loop = true;

function startGame(difficulty) {
    playerName = document.getElementById('player-name').value || 'Player'; 
    document.getElementById('game-info').style.display = 'none';
    canvas.style.display = 'block';
    backgroundMusic.play();
    switch (difficulty) {
        case 'easy':
            gap = 260;
            pipeSpeed = 2;
            break;
        case 'hard':
            gap = 195;
            pipeSpeed = 3;
            break;
        case 'advanced':
            gap = 130;
            pipeSpeed = 4;
            break;
    }
    countdown(3);
}

function countdown(seconds) {
    let countdownInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px serif';
        ctx.fillStyle = 'black';
        ctx.fillText(seconds, canvas.width / 2, canvas.height / 2);
        seconds--;
        if (seconds < 0) {
            clearInterval(countdownInterval);
            initGame();
        }
    }, 1000);
}

function initGame() {
    bird.y = 150;
    bird.velocityX = 0;
    bird.velocityY = 0;
    pipes = [];
    score = 0;
    createPipe();
    gameInterval = setInterval(updateGame, 20);
    runningMusic.play(); // Play running music
}

function createPipe() {
    let pipeHeight = Math.floor(Math.random() * (canvas.height - gap - 200)) + 100;
    pipes.push({ x: canvas.width, topHeight: pipeHeight, bottomY: pipeHeight + gap, passed: false });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Toggle dark theme at score 10
    if (score >= 10) {
        ctx.fillStyle = '#222'; // Dark background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white'; // White text color for score
    } else {
        ctx.fillStyle = 'white'; // Default light background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black'; // Black text color for score
    }

    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    bird.x += bird.velocityX;

    if (bird.y + bird.height > canvas.height || bird.y < 0 || bird.x + bird.width > canvas.width || bird.x < 0) {
        gameOver();
        return;
    }

    // Draw the bird
    ctx.drawImage(bird.image, bird.x, bird.y, bird.width, bird.height);

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (pipe.x + 50 < 0) {
            pipes.shift();
            score++;
            createPipe();
        }
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
        gradient.addColorStop(0, 'darkgreen');
        gradient.addColorStop(1, 'lightgreen');
        ctx.fillStyle = gradient;
        ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, 50, canvas.height - pipe.bottomY);

        // Check if the bird passes the pipe and play crossWallSound
        if (!pipe.passed && pipe.x + 50 < bird.x) {
            pipe.passed = true;
            crossWallSound.currentTime = 0; // Reset sound to start
            crossWallSound.play(); // Play the sound when crossing a wall
        }

        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + 50 &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)) {
            gameOver();
        }
    });

    ctx.font = '24px serif';
    ctx.fillText('Score: ' + score, 10, 30);
}

function gameOver() {
    clearInterval(gameInterval);
    backgroundMusic.pause(); // Stop background music
    runningMusic.pause(); // Stop running music
    wallHitSound.play(); // Play wall hit sound
    backgroundMusic.currentTime = 0; // Reset music to start
    runningMusic.currentTime = 0; // Reset running music to start
    ctx.font = '48px serif';
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText(`${playerName}'s Score: ${score}`, canvas.width / 2 - 150, canvas.height / 2 + 60);

    // Save score to localStorage
    saveScore(playerName, score);
    displayLeaderboard();
}

function saveScore(name, score) {
    let scores = JSON.parse(localStorage.getItem('flappyBirdScores')) || [];
    scores.push({ name: name, score: score });
    scores.sort((a, b) => b.score - a.score); // Sort scores in descending order
    if (scores.length > 10) scores = scores.slice(0, 10); // Keep only top 10 scores
    localStorage.setItem('flappyBirdScores', JSON.stringify(scores));
}

function displayLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; // Clear the leaderboard list

    let scores = JSON.parse(localStorage.getItem('flappyBirdScores')) || [];
    scores.slice(0, 3).forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${score.name} - ${score.score}`;
        leaderboardList.appendChild(listItem);
    });

    leaderboard.style.display = 'block';
}

function displayHighScores() {
    const highscoreBoard = document.getElementById('highscore-board');
    const highscoreList = document.getElementById('highscore-list');

    let scores = JSON.parse(localStorage.getItem('flappyBirdScores')) || [];
    scores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${score.name} - ${score.score}`;
        highscoreList.appendChild(listItem);
    });

    highscoreBoard.style.display = 'block';
}

// Function to clear high scores
function clearHighScores() {
    localStorage.removeItem('flappyBirdScores'); // Clear all high scores
}

// Call this function to display high scores on the front page
displayHighScores();

document.addEventListener('keydown', function (event) {
    switch(event.code) {
        case 'ArrowUp':
            bird.velocityY = -4;
            break;
        case 'ArrowDown':
            bird.velocityY = 4;
            break;
        case 'ArrowLeft':
            bird.velocityX = -4;
            break;
        case 'ArrowRight':
            bird.velocityX = 4;
            break;
    }
});

document.addEventListener('keyup', function (event) {
    switch(event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
            bird.velocityY = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            bird.velocityX = 0;
            break;
    }
});
