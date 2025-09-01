const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const socket = io();
let playerSide = 'spectator';

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;

// Paddle objects
const leftPaddle = {
  x: 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

const rightPaddle = {
  x: canvas.width - PADDLE_WIDTH - 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

// Ball object
const ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  size: BALL_SIZE
};

// Scores
let leftScore = 0;
let rightScore = 0;

// Server communication
socket.on('player', side => {
  playerSide = side;
});

socket.on('state', state => {
  leftPaddle.y = state.leftPaddleY;
  rightPaddle.y = state.rightPaddleY;
  ball.x = state.ball.x;
  ball.y = state.ball.y;
  leftScore = state.scores.left;
  rightScore = state.scores.right;
});

// Send paddle movement to server
canvas.addEventListener('mousemove', e => {
  if (playerSide === 'spectator') return;
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  const paddle = playerSide === 'left' ? leftPaddle : rightPaddle;
  const newY = mouseY - paddle.height / 2;
  socket.emit('paddleMove', newY);
});

// Drawing helpers
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
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([8, 16]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawScore() {
  ctx.font = '32px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(leftScore, canvas.width / 4, 40);
  ctx.fillText(rightScore, canvas.width * 3 / 4, 40);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Render function
function render() {
  clearCanvas();
  drawNet();
  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
  drawBall(ball.x, ball.y, ball.size);
  drawScore();
}

// Main loop
function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
