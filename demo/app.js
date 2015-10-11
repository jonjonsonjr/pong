var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var height = 40;
var width = 10;
var ballHeight = 10;
var ballWidth = 10;
var maxHeight = canvas.height;
var maxWidth = canvas.width;
var baseLat;
var baseLng;
var ratio;
var gameHeight;
var gameWidth;
var theta;
var alpha;
var leftScore = 0;
var rightScore = 0;

var left = {
  x: 0,
  y: (maxHeight + 1) / 2,
  width: width,
  height: height,
  color: 'white',
  clear: function () {
    context.clearRect(this.x, this.y, this.width, this.height);
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = "#111111";
    context.fill();
  },
  draw: function () {
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
  }
};

var right = {
  x: maxWidth - width,
  y: (maxHeight + 1) / 2,
  width: width,
  height: height,
  color: 'white',
  clear: function () {
    context.clearRect(this.x, this.y, this.width, this.height);
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = "#111111";
    context.fill();
  },
  draw: function () {
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
  }
};

var ball = {
  x: maxWidth / 2,
  y: (maxHeight + 1) / 2,
  vx: 1,
  vy: 1,
  width: ballWidth,
  height: ballHeight,
  color: 'white',
  clear: function () {
    context.clearRect(this.x, this.y, this.width, this.height);
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = "#111111";
    context.fill();
  },
  draw: function () {
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
  },
  move: function () {
    if (this.y + this.vy < 0) {
      this.vy = -this.vy;
    }

    if (this.y + this.vy >= canvas.height - this.height) {
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
    } else if (ball.x + ball.width >= canvas.width) {
      console.log('left scores');
      leftScore++;
      reset();
      return;
    }

    this.y += this.vy;
    this.x += this.vx;
    this.draw();
    redraw();
  }
};

reset();

function reset() {
  score = 0;
  context.clearRect(0, 0, canvas.width, canvas.height);
  left.draw();
  right.draw();
  ball.x = canvas.width / 2;
}

function redraw() {
  context.beginPath();
  context.rect(0, 0, width * maxWidth, height * maxHeight);
  context.fillStyle = "black";
  context.fill();

  left.clear();
  right.clear();
  ball.clear();

  left.draw();
  right.draw();
  ball.draw();
}

window.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case 38: right.moveUp(1); break;
    case 40: right.moveDown(1); break;
    case 83: left.moveDown(1); break;
    case 87: left.moveUp(1); break;
  }
}, true);

var clicked = 0;
var leftStart;
var rightStart;

window.addEventListener("click", function (e) {
  var x = e.clientX;
  var y = e.clientY;

  console.log(x, y);

  if (clicked == 0) {
    leftStart = {lng: x, lat: y};
  } else if (clicked == 1) {
    rightStart = {lng: x, lat: y};
    createGame(leftStart.lat, leftStart.lng, rightStart.lat, rightStart.lng);
  } else if (clicked % 2 == 0) {
    var d = getDistance(y, x);
    left.y = Math.min(maxHeight - this.height, Math.max(0, (maxHeight / 2) + d));
  } else {
    var d = getDistance(y, x);
    right.y = Math.min(maxHeight - this.height, Math.max(0, (maxHeight / 2) + d));
  }

  clicked++;
});

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


  setInterval(function () {
    ball.move();
    console.log(getGameState());
  }, 30);
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
    score: score
  };
}
