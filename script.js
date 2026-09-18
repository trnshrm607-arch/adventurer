const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const gameMessage = document.getElementById("gameMessage");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let food;
let direction;
let nextDirection;
let score = 0;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let gameLoop = null;

highScoreElement.textContent = highScore;

function initializeGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    scoreElement.textContent = score;

    gameRunning = false;
    gamePaused = false;
    gameOver = false;

    createFood();
    drawGame();

    gameMessage.textContent = "Press Start Game to play";
    pauseBtn.textContent = "Pause";
}

function startGame() {
    if (gameRunning && !gamePaused) {
        return;
    }

    if (gameOver) {
        initializeGame();
    }

    gameRunning = true;
    gamePaused = false;
    gameOver = false;

    gameMessage.textContent = "";
    pauseBtn.textContent = "Pause";

    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 110);
}

function togglePause() {
    if (!gameRunning || gameOver) {
        return;
    }

    gamePaused = !gamePaused;

    if (gamePaused) {
        clearInterval(gameLoop);
        gameMessage.textContent = "Game Paused";
        pauseBtn.textContent = "Resume";
    } else {
        gameMessage.textContent = "";
        pauseBtn.textContent = "Pause";

        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, 110);
    }
}

function restartGame() {
    clearInterval(gameLoop);
    initializeGame();
    startGame();
}

function updateGame() {
    if (!gameRunning || gamePaused || gameOver) {
        return;
    }

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (checkWallCollision(head) || checkSelfCollision(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }

        createFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function checkWallCollision(head) {
    return (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    );
}

function checkSelfCollision(head) {
    return snake.some(segment =>
        segment.x === head.x && segment.y === head.y
    );
}

function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake &&
        snake.some(segment =>
            segment.x === newFood.x && segment.y === newFood.y
        )
    );

    food = newFood;
}

function drawGame() {
    // Background
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#162033";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Food
    drawFood();

    // Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#4ade80" : "#22c55e";

        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4
        );

        if (index === 0) {
            drawEyes(segment);
        }
    });
}

function drawFood() {
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 3;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
}

function drawEyes(head) {
    ctx.fillStyle = "#111827";

    const baseX = head.x * gridSize;
    const baseY = head.y * gridSize;

    let eye1;
    let eye2;

    if (direction.x === 1) {
        eye1 = { x: baseX + 14, y: baseY + 6 };
        eye2 = { x: baseX + 14, y: baseY + 14 };
    } else if (direction.x === -1) {
        eye1 = { x: baseX + 6, y: baseY + 6 };
        eye2 = { x: baseX + 6, y: baseY + 14 };
    } else if (direction.y === -1) {
        eye1 = { x: baseX + 6, y: baseY + 6 };
        eye2 = { x: baseX + 14, y: baseY + 6 };
    } else {
        eye1 = { x: baseX + 6, y: baseY + 14 };
        eye2 = { x: baseX + 14, y: baseY + 14 };
    }

    ctx.fillRect(eye1.x, eye1.y, 3, 3);
    ctx.fillRect(eye2.x, eye2.y, 3, 3);
}

function endGame() {
    clearInterval(gameLoop);

    gameRunning = false;
    gameOver = true;
    gamePaused = false;

    gameMessage.textContent = `Game Over! Score: ${score}`;
    pauseBtn.textContent = "Pause";
}

function changeDirection(newDirection) {
    if (!gameRunning || gameOver) {
        return;
    }

    // Prevent reversing directly into the snake
    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {
        return;
    }

    nextDirection = newDirection;
}

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "]
            .includes(key)
    ) {
        event.preventDefault();
    }

    switch (key) {
        case "arrowup":
        case "w":
            changeDirection({ x: 0, y: -1 });
            break;

        case "arrowdown":
        case "s":
            changeDirection({ x: 0, y: 1 });
            break;

        case "arrowleft":
        case "a":
            changeDirection({ x: -1, y: 0 });
            break;

        case "arrowright":
        case "d":
            changeDirection({ x: 1, y: 0 });
            break;

        case " ":
            togglePause();
            break;
    }
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restartGame);

// Initial screen
initializeGame();
