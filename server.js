const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const BALL_SPEED = 6;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

// Game state
const state = {
  leftPaddle: { x: 10, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
  rightPaddle: { x: CANVAS_WIDTH - PADDLE_WIDTH - 10, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
  ball: {
    x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
    y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
    dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
  },
  scores: { left: 0, right: 0 }
};

const players = {};

io.on('connection', socket => {
  let side;
  if (!players.left) {
    players.left = socket.id;
    side = 'left';
  } else if (!players.right) {
    players.right = socket.id;
    side = 'right';
  } else {
    side = 'spectator';
  }

  socket.emit('player', side);

  socket.on('paddleMove', y => {
    if (side === 'left') {
      state.leftPaddle.y = clamp(y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);
    } else if (side === 'right') {
      state.rightPaddle.y = clamp(y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);
    }
  });

  socket.on('disconnect', () => {
    if (players.left === socket.id) delete players.left;
    if (players.right === socket.id) delete players.right;
  });
});

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function resetBall() {
  state.ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
  state.ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
  state.ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  state.ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  // Move ball
  state.ball.x += state.ball.dx;
  state.ball.y += state.ball.dy;

  // Wall collision
  if (state.ball.y < 0) {
    state.ball.y = 0;
    state.ball.dy *= -1;
  }
  if (state.ball.y + BALL_SIZE > CANVAS_HEIGHT) {
    state.ball.y = CANVAS_HEIGHT - BALL_SIZE;
    state.ball.dy *= -1;
  }

  // Paddle collision (left)
  if (
    state.ball.x < state.leftPaddle.x + PADDLE_WIDTH &&
    state.ball.x + BALL_SIZE > state.leftPaddle.x &&
    state.ball.y < state.leftPaddle.y + PADDLE_HEIGHT &&
    state.ball.y + BALL_SIZE > state.leftPaddle.y
  ) {
    state.ball.x = state.leftPaddle.x + PADDLE_WIDTH;
    state.ball.dx *= -1;
    let angle =
      (state.ball.y + BALL_SIZE / 2 - (state.leftPaddle.y + PADDLE_HEIGHT / 2)) /
      (PADDLE_HEIGHT / 2);
    state.ball.dy = BALL_SPEED * angle;
  }

  // Paddle collision (right)
  if (
    state.ball.x + BALL_SIZE > state.rightPaddle.x &&
    state.ball.x < state.rightPaddle.x + PADDLE_WIDTH &&
    state.ball.y < state.rightPaddle.y + PADDLE_HEIGHT &&
    state.ball.y + BALL_SIZE > state.rightPaddle.y
  ) {
    state.ball.x = state.rightPaddle.x - BALL_SIZE;
    state.ball.dx *= -1;
    let angle =
      (state.ball.y + BALL_SIZE / 2 - (state.rightPaddle.y + PADDLE_HEIGHT / 2)) /
      (PADDLE_HEIGHT / 2);
    state.ball.dy = BALL_SPEED * angle;
  }

  // Score
  if (state.ball.x < 0) {
    state.scores.right++;
    resetBall();
  } else if (state.ball.x + BALL_SIZE > CANVAS_WIDTH) {
    state.scores.left++;
    resetBall();
  }

  io.sockets.emit('state', {
    leftPaddleY: state.leftPaddle.y,
    rightPaddleY: state.rightPaddle.y,
    ball: { x: state.ball.x, y: state.ball.y },
    scores: state.scores
  });
}

setInterval(update, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
