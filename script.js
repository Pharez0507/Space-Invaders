const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const newGameButton = document.getElementById("newGameButton");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const livesElement = document.getElementById("lives");
// Add these event listeners after your existing ones
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchmove", touchMoveHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);

function touchStartHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (touchX < canvas.width / 2) {
        leftPressed = true;
    } else {
        rightPressed = true;
    }
}

function touchMoveHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    leftPressed = false;
    rightPressed = false;

    if (touchX < canvas.width / 2) {
        leftPressed = true;
    } else {
        rightPressed = true;
    }
}

function touchEndHandler(e) {
    e.preventDefault();
    leftPressed = false;
    rightPressed = false;
    fireBullet();
}

const spaceshipWidth = 50;
const spaceshipHeight = 30;
let spaceshipX = (canvas.width - spaceshipWidth) / 2;

const bulletWidth = 5;
const bulletHeight = 10;
let bullets = [];

const alienWidth = 40;
const alienHeight = 30;
const alienRowCount = 5;
const alienColumnCount = 10;
const alienPadding = 10;
const alienOffsetTop = 30;
const alienOffsetLeft = 30;
let aliens = [];

let rightPressed = false;
let leftPressed = false;
let spacePressed = false;

let score = 0;
let level = 1;
let lives = 3;
let gameStarted = false;
let gamePaused = false;

let alienDirection = 1;
let alienSpeed = 1;

function initAliens() {
    aliens = [];
    for (let c = 0; c < alienColumnCount; c++) {
        aliens[c] = [];
        for (let r = 0; r < alienRowCount; r++) {
            aliens[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

initAliens();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchmove", touchMoveHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.key == " " || e.key == "Spacebar") {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    } else if (e.key == " " || e.key == "Spacebar") {
        spacePressed = false;
    }
}

function touchStartHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (touchX < canvas.width / 2) {
        leftPressed = true;
    } else {
        rightPressed = true;
    }
}

function touchMoveHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    leftPressed = false;
    rightPressed = false;

    if (touchX < canvas.width / 2) {
        leftPressed = true;
    } else {
        rightPressed = true;
    }
}

function touchEndHandler(e) {
    e.preventDefault();
    leftPressed = false;
    rightPressed = false;
    fireBullet();
}

function drawSpaceship() {
    ctx.beginPath();
    ctx.moveTo(spaceshipX + spaceshipWidth / 2, canvas.height - spaceshipHeight);
    ctx.lineTo(spaceshipX, canvas.height);
    ctx.lineTo(spaceshipX + spaceshipWidth, canvas.height);
    ctx.closePath();
    ctx.fillStyle = "#0095DD";
    ctx.fill();
}

function drawBullet(bullet) {
    ctx.beginPath();
    ctx.rect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function drawAliens() {
    for (let c = 0; c < alienColumnCount; c++) {
        for (let r = 0; r < alienRowCount; r++) {
            if (aliens[c][r].status == 1) {
                let alienX = c * (alienWidth + alienPadding) + alienOffsetLeft;
                let alienY = r * (alienHeight + alienPadding) + alienOffsetTop;
                aliens[c][r].x = alienX;
                aliens[c][r].y = alienY;
                ctx.beginPath();
                ctx.rect(alienX, alienY, alienWidth, alienHeight);
                ctx.fillStyle = "#00FF00";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < alienColumnCount; c++) {
        for (let r = 0; r < alienRowCount; r++) {
            let alien = aliens[c][r];
            if (alien.status == 1) {
                bullets.forEach((bullet, bulletIndex) => {
                    if (
                        bullet.x > alien.x &&
                        bullet.x < alien.x + alienWidth &&
                        bullet.y > alien.y &&
                        bullet.y < alien.y + alienHeight
                    ) {
                        alien.status = 0;
                        bullets.splice(bulletIndex, 1);
                        score += 10;
                        scoreElement.textContent = `Score: ${score}`;
                        if (score % 500 === 0) {
                            level++;
                            levelElement.textContent = `Level: ${level}`;
                            alienSpeed += 0.5;
                        }
                    }
                });

                if (
                    alien.y + alienHeight > canvas.height - spaceshipHeight &&
                    alien.x < spaceshipX + spaceshipWidth &&
                    alien.x + alienWidth > spaceshipX
                ) {
                    lives--;
                    livesElement.textContent = `Lives: ${lives}`;
                    if (lives <= 0) {
                        gameOver();
                    } else {
                        resetLevel();
                    }
                }
            }
        }
    }
}

function moveAliens() {
    let dropDown = false;
    for (let c = 0; c < alienColumnCount; c++) {
        for (let r = 0; r < alienRowCount; r++) {
            if (aliens[c][r].status == 1) {
                if (aliens[c][r].x + alienWidth > canvas.width || aliens[c][r].x < 0) {
                    alienDirection *= -1;
                    dropDown = true;
                    break;
                }
            }
        }
        if (dropDown) {
            break;
        }
    }

    for (let c = 0; c < alienColumnCount; c++) {
        for (let r = 0; r < alienRowCount; r++) {
            if (aliens[c][r].status == 1) {
                aliens[c][r].x += alienDirection * alienSpeed;
                if (dropDown) {
                    aliens[c][r].y += alienHeight;
                }
            }
        }
    }
}

function fireBullet() {
    if (bullets.length < 3) {
        bullets.push({
            x: spaceshipX + spaceshipWidth / 2 - bulletWidth / 2,
            y: canvas.height - spaceshipHeight - bulletHeight
        });
    }
}

function resetLevel() {
    spaceshipX = (canvas.width - spaceshipWidth) / 2;
    bullets = [];
    initAliens();
}

function gameOver() {
    gameStarted = false;
    overlay.style.display = "flex";
    startButton.style.display = "none";
    pauseButton.style.display = "none";
    newGameButton.style.display = "block";
}

function draw() {
    if (!gameStarted || gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpaceship();
    drawAliens();
    bullets.forEach(drawBullet);
    collisionDetection();
    moveAliens();

    if (rightPressed && spaceshipX < canvas.width - spaceshipWidth) {
        spaceshipX += 7;
    } else if (leftPressed && spaceshipX > 0) {
        spaceshipX -= 7;
    }

    if (spacePressed) {
        fireBullet();
        spacePressed = false;
    }

    bullets.forEach((bullet, index) => {
        bullet.y -= 7;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    requestAnimationFrame(draw);
}

startButton.addEventListener("click", () => {
    gameStarted = true;
    overlay.style.display = "none";
    startButton.style.display = "none";
    pauseButton.style.display = "block";
    draw();
});

pauseButton.addEventListener("click", () => {
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? "Resume" : "Pause";
    if (!gamePaused) {
        draw();
    }
});

newGameButton.addEventListener("click", () => {
    score = 0;
    level = 1;
    lives = 3;
    alienSpeed = 1;
    scoreElement.textContent = `Score: ${score}`;
    levelElement.textContent = `Level: ${level}`;
    livesElement.textContent = `Lives: ${lives}`;
    resetLevel();
    gameStarted = true;
    gamePaused = false;
    overlay.style.display = "none";
    newGameButton.style.display = "none";
    pauseButton.style.display = "block";
    pauseButton.textContent = "Pause";
    draw();
});

// Initial draw to show the game before starting
drawSpaceship();
drawAliens();