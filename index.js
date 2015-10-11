var height = 40;
var width = 10;
var ballHeight = 10;
var ballWidth = 10;
var maxHeight = 400;
var maxWidth = 800;
var leftScore = 0;
var rightScore = 0;

var leftStart;
var rightStart;

var baseLat;
var baseLng;

var gameHeight;
var gameWidth;

var theta;
var alpha;

var players = {};

var updateFn;
var interval;

var left = {
  x: 0,
  y: maxHeight / 2,
  width: width,
  height: height
};

var right = {
  x: maxWidth - width,
  y: maxHeight / 2,
  width: width,
  height: height
};

var ball = {
  x: maxWidth / 2,
  y: (maxHeight + 1) / 2,
  vx: 1,
  vy: 1,
  width: ballWidth,
  height: ballHeight,
  move: function () {
    if (this.y + this.vy < 0) {
      this.vy = -this.vy;
    }

    if (this.y + this.vy >= maxHeight - this.height) {
      this.vy = -this.vy;
    }

    if (left.x < ball.x + ball.width &&
         left.x + left.width > ball.x &&
         left.y < ball.y + ball.height &&
         left.height + left.y > ball.y) {
      this.vx = -this.vx;
    }

    if (right.x < ball.x + ball.width &&
         right.x + right.width > ball.x &&
         right.y < ball.y + ball.height &&
         right.height + right.y > ball.y) {
      this.vx = -this.vx;
    }

    if (ball.x <= 0) {
      console.log('right scores');
      rightScore++;
      reset();
      return;
    } else if (ball.x + ball.width >= maxWidth) {
      console.log('left scores');
      leftScore++;
      reset();
      return;
    }

    this.y += this.vy;
    this.x += this.vx;
  }
};

function reset() {
  score = 0;
  ball.x = maxWidth / 2;
}


function createGame(leftLat, leftLng, rightLat, rightLng) {
  var dy = rightLat - leftLat;
  var dx = rightLng - leftLng;
  var d = Math.sqrt(dx * dx + dy * dy);

  theta = Math.atan2(dy, dx);
  alpha = (Math.PI / 2.0) - theta;

  baseLat = leftLat;
  baseLng = leftLng;

  gameWidth = d;
  gameHeight = d / 2;

  reset();

  interval = setInterval(function () {
    ball.move();
    updateFn(getGameState());
  }, 100);
}

function getDistance(lat, lng) {
  var dy = lat - baseLat;
  var dx = lng - baseLng;
  var d = Math.sqrt(dx * dx + dy * dy);

  var beta = Math.atan2(dy, dx);
  var gamma = beta - theta;

  return d * Math.sin(gamma);
}

function toGPS(start, y) {
  var d = y - (maxHeight / 2);
  var dl = d * (gameHeight / maxHeight);
  var angle = theta - (Math.PI / 2);
  var dx = dl * Math.cos(angle);
  var dy = dl * Math.sin(angle);

  return {
    lat: start.lat - dy,
    lng: start.lng - dx
  };
}

function getBallGPS() {
  var dx = ball.x;
  var dy = ball.y - (maxHeight / 2);
  var dxl = dx * (gameWidth / maxWidth);
  var dyl = dy * (gameHeight / maxHeight);
  var d = Math.sqrt(dxl * dxl + dyl * dyl);
  var dlat = d * Math.sin(theta);
  var dlng = d * Math.cos(theta);

  return {
    lat: leftStart.lat + dlat,
    lng: leftStart.lng + dlng,
    width: ball.width * (gameWidth / maxWidth),
    height: ball.height * (gameHeight / maxHeight)
  };
}

function getGameState() {
  var leftDude = toGPS(leftStart, left.y);
  leftDude.width = left.width * (gameWidth / maxWidth);
  leftDude.height = left.height * (gameHeight / maxHeight);

  var rightDude = toGPS(rightStart, right.y);
  rightDude.width = right.width * (gameWidth / maxWidth);
  rightDude.height = right.height * (gameHeight / maxHeight);

  var score = {
    left: leftScore,
    right: rightScore
  };

  return {
    left: leftDude,
    right: rightDude,
    ball: getBallGPS(),
    score: score,
    theta: theta
  };
}

module.exports = {
  registerPlayer: function (id, loc) {
    if (Object.keys(players).length == 0) {
      players[id] = left;
      leftStart = loc;
    } else {
      players[id] = right;
      rightStart = loc;
      createGame(leftStart.lat, leftStart.lng, rightStart.lat, rightStart.lng);
    }
  },
  updatePlayer: function (id, loc) {
    var player = players[id];
    var d = getDistance(loc.lat, loc.lng);
    player.y = Math.min(maxHeight - player.height, Math.max(0, (maxHeight / 2) + d));
  },
  onUpdate: function (cb) {
    updateFn = cb;
  },
  reset: function () {
    clearInterval(interval);
    players = {};
    leftScore = 0;
    rightScore = 0;
    reset();
  }
};
