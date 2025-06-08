// setup canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// generate random number
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generate random color
function randomRGB() {
    return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

// draw circle
function circle(x, y, r, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

/*
    DROPS
*/

let drops = [];

class Drop {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
    show() {
        circle(this.x, this.y, this.r, 'black');
    }
}

document.onmousedown = function (e) {
    let drop = new Drop(e.pageX, e.pageY, 50)
    drops.push(drop);
}


/*
    BALLS
*/

class Ball {
    constructor(x, y, velX, velY, color, size) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.color = color;
        this.size = size;
    }
    draw() { 
        circle(this.x, this.y, this.size, this.color);
    }
    update() {
        if (this.x + this.size >= width) {
            this.velX = -this.velX;
        }

        if (this.x - this.size <= 0) {
            this.velX = -this.velX;
        }

        if (this.y + this.size >= height) {
            this.velY = -this.velY;
        }

        if (this.y - this.size <= 0) {
            this.velY = -this.velY;
        }

        this.x += this.velX;
        this.y += this.velY;
    }
    collisionDetect() {
        for (const ball of balls) {
            if (this !== ball) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + ball.size) {
                    ball.color = this.color = randomRGB();
                }
            }
        }
    }
}

const balls = [];

while (balls.length < 25) {
    const size = random(10, 20);
    const ball = new Ball(
        // ball position always drawn at least one ball width
        // away from the edge of the canvas, to avoid drawing errors
        random(0 + size, width - size),
        random(0 + size, height - size),
        random(-7, 7),
        random(-7, 7),
        randomRGB(),
        size,
    );

    balls.push(ball);
}


/*
    ANIMATION
*/

function draw() {
    /*for (const ball of balls) {
        ball.draw();
        ball.update();
        ball.collisionDetect();
    }*/
    for (const drop of drops) {
        drop.show();
    }
}

// animation loop
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    requestAnimationFrame(loop);
}

loop();
