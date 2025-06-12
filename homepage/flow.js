/*
    SETUP CANVAS
*/

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

window.onresize = function (e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


/*
    USEFUL FUNCTIONS
*/

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
    VECTOR CLASS
*/

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        this.x = this.x + other.x;
        this.y = this.y + other.y;
    }
    sub(other) {
        this.x = this.x - other.x;
        this.y = this.y - other.y;
    }
    scale(c) {
        this.x = this.x * c;
        this.y = this.y * c;
    }
    length() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }
    lengthSq() {
        return (this.x * this.x) + (this.y * this.y);
    }
    copy () {
        const v = new Vector(this.x, this.y);
        return v;
    }
    set (other) {
        this.x = other.x;
        this.y = other.y;
    }
}


/*
    DROPPING PAINT
*/

let drops = [];
const detail = 1000;

class Drop {
    constructor(x, y, r, color = 'black') {
        this.origin = new Vector(x, y);
        this.r = r;
        this.color = color;
        this.vertices = [];

        for (let i = 0; i < detail; i++) {
            const angle = (2 * Math.PI * i)/detail;
            const v = new Vector(Math.cos(angle), Math.sin(angle));
            v.scale(r);
            this.vertices[i] = v;
        }
    }
    marble(other) {
        let difference = other.origin.copy();
        difference.sub(this.origin);
        const r = this.r;
        for (let v of other.vertices) {
            v.add(difference); // now wrt to this.origin
            const m = v.lengthSq();
            const scalar = Math.sqrt(1 + (r*r)/m)
            v.scale(scalar);
            v.sub(difference); // again wrt to other.origin
        }
    }
    show() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        const last = this.vertices[detail-1];
        const o = this.origin;
        ctx.moveTo(o.x + last.x, o.y + last.y);
        for (let v of this.vertices) {
            ctx.lineTo(o.x + v.x, o.y + v.y);
        }
        ctx.fill();
    }
}

document.onmousedown = function (e) {
    const drop = new Drop(e.pageX, e.pageY, 100, randomRGB())

    for (let other of drops) {
        drop.marble(other);
    }

    drops.push(drop);
}


/*
    ANIMATION
*/

function draw() {
    for (let drop of drops) {
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
