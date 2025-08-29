const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PADDLE_SPEED = 6;
const AI_SPEED = 4;

// Paddle objects
const leftPaddle = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const rightPaddle = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    speed: 6,
    dx: 6 * (Math.random() > 0.5 ? 1 : -1),
    dy: 6 * (Math.random() > 0.5 ? 1 : -1)
};

// Mouse control for left paddle
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;

    // Clamp paddle within canvas
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > canvas.height)
        leftPaddle.y = canvas.height - leftPaddle.height;
});

// Draw functions
function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Paddle collision
function collide(paddle, ball) {
    return (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// Game loop
function update() {
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top/bottom)
    if (ball.y < 0) {
        ball.y = 0;
        ball.dy *= -1;
    }
    if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Paddle collision (left)
    if (collide(leftPaddle, ball)) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.dx *= -1;
        // Add a bit of randomness to bounce
        let angle = (ball.y + ball.size / 2 - (leftPaddle.y + leftPaddle.height / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy = ball.speed * angle;
    }

    // Paddle collision (right)
    if (collide(rightPaddle, ball)) {
        ball.x = rightPaddle.x - ball.size;
        ball.dx *= -1;
        // Add a bit of randomness to bounce
        let angle = (ball.y + ball.size / 2 - (rightPaddle.y + rightPaddle.height / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy = ball.speed * angle;
    }

    // Score (left or right wall)
    if (ball.x < 0 || ball.x + ball.size > canvas.width) {
        resetBall();
    }

    // AI movement for right paddle (tracks ball's y)
    if (rightPaddle.y + rightPaddle.height / 2 < ball.y + ball.size / 2) {
        rightPaddle.y += AI_SPEED;
    } else if (rightPaddle.y + rightPaddle.height / 2 > ball.y + ball.size / 2) {
        rightPaddle.y -= AI_SPEED;
    }
    // Clamp right paddle
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > canvas.height)
        rightPaddle.y = canvas.height - rightPaddle.height;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2 - ball.size / 2;
    ball.y = canvas.height / 2 - ball.size / 2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Render function
function render() {
    clearCanvas();
    drawNet();
    drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    drawBall(ball.x, ball.y, ball.size);
}

// Main game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();