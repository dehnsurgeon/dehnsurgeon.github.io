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
function randomRGB(redmin = 0, greenmin = 0, bluemin = 0, redmax = 255, greenmax = 255, bluemax = 255) {
    return `rgb(${random(redmin, redmax)},${random(greenmin, greenmax)},${random(bluemin, bluemax)})`;
}

function modexp(a, b, n) {
    let c = 1;
    for (let i = 0; i < b; i++) {
        c = (c*a) % n;
    }
    return c;
}

const smallprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
function millerrabin(n, k=50) {
    if (n < 2) {
        return false;
    }
    for (let p of smallprimes) {
        if (n % p === 0) {
            return (n === p);
        }
    }
    let s = 0;
    let d = n-1;
    while (d % 2 === 0) {
        d = d/2;
        s++;
    }
    let x = 0;
    let y = 0;
    for (let i = 0; i < k; i++) {
        x = modexp(random(2, n-2), d, n);
        for (let j = 0; j < s; j++) {
            y = (x*x) % n;
            if ((y === 1) && (x !== 1) && (x !== n-1)) {
                return false;
            }
            x = y;
        }
        if (y !== 1) {
            return false;
        }
    }
    return true;
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

// TODO: improve efficiency

let drops = [];
const detail = 10000;
const dropcap = 30;
const opacityincrease = 0.02;
const opacitydescrease = 0.01;
const dropradius = 2*Math.sqrt(width + height);

class Drop {
    constructor(x, y, r, color, opacity = 0) {
        this.origin = new Vector(x, y);
        this.color = color;
        this.opacity = opacity;
        this.young = true;
        this.marblecount = 0;
        this.vertices = [];

        for (let i = 0; i < detail; i++) {
            const angle = (2 * Math.PI * i)/detail;
            const v = new Vector(Math.cos(angle), Math.sin(angle));
            v.scale(r);
            this.vertices[i] = v;
        }
    }
    marble(other, r) {
        // TODO: add "simplification" of vertices after marbling
        let difference = other.origin.copy();
        difference.sub(this.origin);
        for (let v of other.vertices) {
            v.add(difference); // now wrt to this.origin
            const m = v.lengthSq();
            const scalar = Math.sqrt(1 + (r*r)/m)
            v.scale(scalar);
            v.sub(difference); // again wrt to other.origin
        }
        other.marblecount++;
        if (other.young && other.marblecount > dropcap/3) {
            other.young = false;
        }
    }
    show() {
        ctx.beginPath();
        ctx.fillStyle = this.color.slice(0,3) + 'a' + this.color.slice(3,-1) + ',' + this.opacity + ')';
        let a = 0;
        if (this.young) {
            a = opacityincrease;
        } else {
            a = -opacitydescrease;
        }
        this.opacity = Math.min(Math.max(this.opacity + a, 0), 1);
        const last = this.vertices[detail-1];
        const o = this.origin;
        ctx.moveTo(o.x + last.x, o.y + last.y);
        for (let v of this.vertices) {
            ctx.lineTo(o.x + v.x, o.y + v.y);
        }
        ctx.fill();
    }
}

function dropink(x, y, r, color) {
    const drop = new Drop(x, y, r, color)
    for (let other of drops) {
        drop.marble(other, r);
    }
    drops.push(drop);
    if (drops.length > dropcap) {
        drops.shift();
    }
}

/*
document.onmousedown = function (e) {
    dropink(e.pageX, e.pageY, dropradius, randomRGB());
}
*/


/*
    ANIMATION
*/

function draw() {
    for (let drop of drops) {
        drop.show();
    }
}

const step = 20;
let counter = 0;
// animation loop
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    if ((counter % step === 0) && millerrabin(counter/step)) {
        dropink(random(width/4, (3*width)/4), random(height/4, (3*height)/4), dropradius, randomRGB(100, 50, 100, 200, 150, 200));
    }
    counter++;
    requestAnimationFrame(loop);
}

loop();
