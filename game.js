let config = require("visual-config-exposer").default;

const DEBUG = true;

function getTeams() {
    let result = [];
    for (let key in config.settings.teams) {
        result.push(config.settings.teams[key]);
    }
    return result;
}

const Teams = getTeams();

const ChooseTeamText = "Choose your team";
const ChooseOversText = "Choose overs";

const ButtonSize = 100;
const ButtonOffset = 25;

const TeamSquareStroke = 255;

const OverButtonFillColor = 255;
const OverButtonTextColor = 0;
const OverButtonStrokeColor = 0;

const BallsPerOver = 6;

const GroundLineColor = 255;

const BallDiameter = 20;
const MinBallAngle = 130;
const MaxBallAngle = 200;
const BallGravityIncrementor = 600;
const MinBallSpeed = 700;
const MaxBallSpeed = 450;

let GroundHeight;
let MinBallHeight;
let MaxBallHeight;
let PlayerPositionX;

function init() {
    GroundHeight = height - height / 7;
    MinBallHeight = GroundHeight * 0.6;
    MaxBallHeight = GroundHeight * 0.4;
    PlayerPositionX = width * 0.2;
}

class TeamButton {
    constructor(x, y, data, onPress) {
        this.rect = new Rectangle(x, y, ButtonSize, ButtonSize);
        this.hoverRect = Rectangle.FromPosition(this.rect.center().x, this.rect.center().y, ButtonSize * 1.1);
        this.data = data;
        this.hover = false;
        this.onPress = onPress;
        this.lastPress = false;
    }

    update() {
        if (!this.hover) {
            if (this.rect.includes({ x: mouseX, y: mouseY })) {
                this.hover = true;
            }
        } else {
            if (!this.hoverRect.includes({ x: mouseX, y: mouseY })) {
                this.hover = false;
            }
        }

        if (this.hover && !mouseIsPressed && this.lastPress == true) {
            this.onPress();
        }
        this.lastPress = mouseIsPressed;
    }

    draw() {
        this.update();

        fill(this.data.color);
        strokeWeight(5);
        stroke(TeamSquareStroke);

        if (this.hover) {
            this.hoverRect.draw();
        } else {
            this.rect.draw();
        }
    }
}

class OverButton extends TeamButton {
    constructor(x, y, number, onPress) {
        super(x, y, null, onPress);
        this.number = number;
    }

    draw() {
        this.update();

        strokeWeight(5);
        stroke(OverButtonStrokeColor);
        fill(OverButtonFillColor);
        textAlign(CENTER, CENTER);
        let size;
        if (this.hover) {
            this.hoverRect.draw();
            size = this.hoverRect.h * 0.7;
        } else {
            this.rect.draw();
            size = this.rect.h * 0.7;
        }
        noStroke();
        fill(OverButtonTextColor);
        textSize(size);
        textAlign(CENTER, CENTER);
        text(this.number, this.rect.center().x, this.rect.center().y + size * 0.1);
    }
}

class Ball {
    constructor() {
        this.ix = width;
        this.iy = floor(random(MaxBallHeight, MinBallHeight));
        this.rect = Rectangle.FromPosition(this.ix, this.iy, BallDiameter);
        this.acc = {
            x: 0,
            y: 0,
        };
        this.gravity = 0;
        this.canThrow = true;
        this.thrown = false;
    }

    draw() {
        fill(255, 255, 0);
        circle(this.rect.center().x, this.rect.center().y, this.rect.w);
        this.rect.debug();
    }

    update() {
        if (this.thrown) {
            this.rect.x += this.acc.x * (deltaTime / 1000);
            this.rect.y += this.acc.y * (deltaTime / 1000);

            this.acc.y += this.gravity * (deltaTime / 1000);

            if (this.rect.bottom() > GroundHeight) {
                this.acc.y *= -0.7;
                // to prevent error
                this.rect.y = GroundHeight - 2 - this.rect.w;
            }
        }

        if (this.rect.right() < 0) {
            this.canThrow = true;
            this.thrown = false;
        }

        this.rect.x = floor(this.rect.x);
        this.rect.y = floor(this.rect.y);
    }

    throw() {
        let angle = radians(random(MinBallAngle, MaxBallAngle));
        this.acc = p5.Vector.fromAngle(angle);
        this.acc.x *= floor(random(MinBallSpeed, MaxBallSpeed));
        this.gravity = BallGravityIncrementor;
        this.rect.x = this.ix;
        this.rect.y = floor(random(MaxBallHeight, MinBallHeight));
        this.canThrow = false;
        this.thrown = true;

        this.acc.x = floor(this.acc.x);
        this.acc.y = floor(this.acc.y);
    }
}

class Game {
    constructor() {
        this.defaults();

        init();

        this.chose = false;

        this.teamButtons = [];
        this.overButtons = [];

        let step = ButtonSize + ButtonOffset;
        let sx = width / 2 - (Teams.length / 2) * step;
        let y = height / 3;

        for (let i = 0; i < Teams.length; i++) {
            let x = sx + step * i;
            this.teamButtons.push(
                new TeamButton(x, y, { color: Teams[i] }, () => {
                    if (!this.team) {
                        this.team = Teams[i];
                    }
                })
            );
        }

        sx = width / 2 - (3 / 2) * step;
        for (let i = 0; i < 3; i++) {
            let x = sx + step * i;
            let n;
            if (i == 0) n = 2;
            if (i == 1) n = 5;
            if (i == 2) n = 10;
            this.overButtons.push(
                new OverButton(x, y, n, () => {
                    if (!this.overCount) {
                        this.overCount = n;
                    }
                })
            );
        }

        this.team = undefined;
        this.overCount = undefined;
        this.ballCount = undefined;

        this.ball = new Ball();
    }

    permaUpdate() {
        // choose team state;
        if (!this.chose) {
            this.choose();
        } else {
            this.updateGame();
        }
    }

    updateGame() {
        if (DEBUG) {
            fill(255, 0, 0);
            rect(width - 10, MinBallHeight - 5, 10, 10);
            rect(width - 10, MaxBallHeight - 5, 10, 10);
            rect(PlayerPositionX, GroundHeight - 30, 10, 30);
        }

        stroke(GroundLineColor);
        strokeWeight(3);
        line(0, GroundHeight, width, GroundHeight);

        if (!this.paused) {
            this.ball.update();
        }
        this.ball.draw();

        if (DEBUG) {
            this.debugHUD();
        }
    }

    debugHUD() {
        let sy = 30;
        let sx = 30;
        let spacing = 17;
        noStroke();
        fill(0);
        textAlign(LEFT);
        textSize(spacing * 0.8);
        textFont("Monaco");
        text("Ball X: " + this.ball.rect.center().x, sx, sy);
        text("Ball Y: " + this.ball.rect.center().y, sx, sy + spacing);
        text("Ball Acc X: " + this.ball.acc.x, sx, sy + spacing * 2);
        text("Ball Acc Y: " + this.ball.acc.y, sx, sy + spacing * 3);
        text("Overs: " + this.overCount, sx, sy + spacing * 4);
        text("Ball count: " + this.ballCount, sx, sy + spacing * 5);
    }

    choose() {
        // draw choose team text
        textFont(config.preGameScreen.fontFamily);
        textSize(this.instructionsFontSize * 1.6);
        textAlign(CENTER);
        noStroke();
        fill(config.settings.textColor);

        if (!this.team) {
            text(ChooseTeamText, 20, 40, width - 40, this.instructionsFontSize * 1.8);
            this.teamButtons.map((b) => {
                b.draw();
            });
        } else if (!this.overCount) {
            text(ChooseOversText, 20, 40, width - 40, this.instructionsFontSize * 1.8);

            this.overButtons.map((b) => {
                b.draw();
            });
        }

        if (this.team && this.overCount) {
            this.chose = true;
            this.ballCount = this.overCount * BallsPerOver;
        }
    }

    onMousePress() {
        if (this.chose && this.ball.canThrow) {
            this.ball.throw();
            this.ballCount -= 1;
        }
    }

    finishGame() {
        if (!this.finished) {
            this.finished = true;
        }
    }

    defaults() {
        noStroke();

        this.pressed = false;

        this.score = 0;

        // turn this var to true to end the game
        this.finished = false;

        this.particles = [];

        this.instructionsFontSize = height / 30;
        this.scoreFontSize = height / 20;
        this.delayBeforeExit = 1.2;

        // Don'touch these
        this.started = false;
        this.c_instructionsFontSize = 0;
        this.c_scoreFontSize = 0;
    }

    mousePressed() {
        if (mouseIsPressed && !this.mouse_pressed) {
            this.mouse_pressed = true;
            this.onMousePress();
        } else if (!mouseIsPressed) {
            this.mouse_pressed = false;
        }
    }

    calcBgImageSize() {
        // background image size calculations
        this.bgImage = window.images.background;
        let originalRatios = {
            width: window.innerWidth / this.bgImage.width,
            height: window.innerHeight / this.bgImage.height,
        };

        let coverRatio = Math.max(originalRatios.width, originalRatios.height);
        this.bgImageWidth = this.bgImage.width * coverRatio;
        this.bgImageHeight = this.bgImage.height * coverRatio;
    }

    draw() {
        clear();
        try {
            image(
                this.bgImage,
                width / 2 - this.bgImageWidth / 2,
                height / 2 - this.bgImageHeight / 2,
                this.bgImageWidth,
                this.bgImageHeight
            );
        } catch (err) {
            this.calcBgImageSize();
        }

        if (window.currentScreen == "gameScreen") {
            // Draw fps if in debug mode
            if (DEBUG) {
                noStroke();
                fill(0);
                textAlign(LEFT, BOTTOM);
                textFont("Arial");
                textSize(16);
                text(floor(frameRate()), 0, 15);
            }

            this.mousePressed();

            this.permaUpdate();

            if (this.started) {
                this.updateGame();
            }

            this.particles = this.particles.filter((p) => {
                p.draw();
                return !p.dead;
            });

            // Animate instructions font size
            // in and out
            // if (this.instructionsFontSize - this.c_instructionsFontSize > 0.1 && !this.started) {
            // this.c_instructionsFontSize = lerp(this.c_instructionsFontSize, this.instructionsFontSize, 0.2);
            // }

            // if (this.c_instructionsFontSize > 0.1) {
            // if (this.started) {
            // this.c_instructionsFontSize = lerp(this.c_instructionsFontSize, 0, 0.4);
            // }

            // (NORMAL);
            // noStroke();
            // fill(color(config.settings.textColor));
            // textFont(config.preGameScreen.fontFamily);
            // textSize(this.c_instructionsFontSize);
            // textAlign(CENTER);

            // text(config.settings.instructions1, width / 2, height / 10);
            // text(config.settings.instructions2, width / 2, (height / 10) * 1.5);
            // text(config.settings.instructions3, width / 2, (height / 10) * 2);
            // }

            if (this.started) {
                this.c_scoreFontSize = lerp(this.c_scoreFontSize, this.scoreFontSize, 0.2);

                textStyle(NORMAL);
                noStroke();
                fill(color(config.settings.textColor));
                textAlign(CENTER);
                textSize(this.c_scoreFontSize);
                textFont(config.preGameScreen.fontFamily);
                text(this.score, width / 2, height / 6);
            }

            if (this.finished) {
                this.delayBeforeExit -= deltaTime / 1000;

                if (this.delayBeforeExit < 0) {
                    window.setEndScreenWithScore(this.score);
                }
            }
        }
    }
}

// Helper functions

function playSound(sound) {
    if (window.soundEnabled) {
        sound.play();
    }
}

function randomFromArray(arr) {
    return arr[floor(random(arr.length))];
}

function setGradient(x, y, w, h, c1, c2) {
    for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(x, i, x + w, i);
    }
}

class FloatingText {
    constructor(text, x, y, acc, size, color) {
        this.x = x;
        this.text = text;
        this.y = y;
        this.acc = acc;
        this.size = size;
        this.color = color;
        this.lifespan = 1;
        this.iLifespan = 1;
        this.easing = "easeInQuad";
        this.dead = false;
        this.startEase = false;
        this.font = "Arial";
        this.style = NORMAL;
        this.align = CENTER;
    }

    setLifespan(amt) {
        this.lifespan = amt;
        this.iLifespan = amt;
    }

    draw() {
        if (!this.startEase) {
            shifty.tween({
                from: { size: this.size },
                to: { size: 0 },
                duration: this.iLifespan * 1000,
                easing: this.easing,
                step: (state) => {
                    this.size = state.size;
                },
            });
            this.startEase = true;
        }

        this.lifespan -= deltaTime / 1000;
        this.dead = this.lifespan <= 0;

        if (!this.dead) {
            this.x += this.acc.x;
            this.y += this.acc.y;

            noStroke();
            fill(this.color);
            textAlign(this.align);
            textSize(this.size);
            textStyle(this.style);
            textFont(this.font);
            text(this.text, this.x, this.y);
        }
    }
}

class Particle {
    constructor(x, y, acc, size, _color) {
        this.x = x;
        this.y = y;
        this.acc = acc;
        this.size = size;
        this.lifespan = random(0.5, 0.1);
        this.iLifespan = this.lifespan;
        this.iSize = this.size;
        this.dead = false;
        if (_color) {
            this.color = _color;
        }
        this.image;
        this.rotation = 0;
        this.rotSpeed = 0;
        this.easing = "easeOutSine";
        this.startEase = false;
    }

    setLifespan(lifespan) {
        this.lifespan = lifespan;
        this.iLifespan = lifespan;
    }

    draw() {
        if (!this.startEase) {
            this.startEase = true;
            shifty.tween({
                from: { size: this.iSize },
                to: { size: 0 },
                duration: this.iLifespan * 1000,
                easing: this.easing,
                step: (state) => {
                    this.size = state.size;
                },
            });
        }

        this.lifespan -= deltaTime / 1000;

        this.rotation += (this.rotSpeed * deltaTime) / 1000;

        this.dead = this.lifespan <= 0;

        if (!this.dead) {
            this.x += this.acc.x;
            this.y += this.acc.y;

            if (this.image) {
                imageMode(CENTER);
                image(this.image, this.x, this.y, this.size, this.size);
                imageMode(CORNER);
            } else {
                fill(this.color);
                circle(this.x, this.y, this.size);
            }
        }
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.debugColor = color(255, 0, 0);
    }

    center() {
        return createVector(this.x + this.w / 2, this.y + this.h / 2);
    }

    top() {
        return this.y;
    }

    bottom() {
        return this.y + this.h;
    }

    left() {
        return this.x;
    }

    right() {
        return this.x + this.w;
    }

    includes(v) {
        if (v != null) {
            return v.x > this.x && v.y > this.y && v.x < this.right() && v.y < this.bottom();
        }
        return false;
    }

    debug() {
        if (DEBUG) {
            stroke(this.debugColor);
            strokeWeight(1);
            rectMode(CORNER);
            noFill();
            rect(this.x, this.y, this.w, this.h);
        }
    }

    draw() {
        rect(this.x, this.y, this.w, this.h);
    }

    textInside(txt) {
        text(txt, this.x, this.y, this.w, this.h);
    }

    static FromPosition(x, y, w, h = w) {
        return new Rectangle(x - w / 2, y - h / 2, w, h);
    }
}

function intersectRect(r1, r2) {
    return !(r2.left() > r1.right() || r2.right() < r1.left() || r2.top() > r1.bottom() || r2.bottom() < r1.top());
}

function randomParticleAcc(amt) {
    let x = random(-amt, amt);
    let y = random(-amt, amt);
    return { x, y };
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
}

//------------------------------

module.exports = Game;
