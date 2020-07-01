let config = require("visual-config-exposer").default;

const DEBUG = true;

let Teams;
const ChooseTeamText = "Choose your team";
const ChooseOversText = "Choose overs";

const ButtonSize = 80;
const ButtonOffset = 25;

const TeamSquareStroke = 255;

const OverButtonFillColor = 255;
const OverButtonTextColor = 0;
const OverButtonStrokeColor = 0;

const BallsPerOver = 6;

let BallTarget;
let BallTargetSize;
let BallMinX;
let BallMaxX;
const BallSize = 100;

const BatSize = 160;
let BatPos;
let MaxBatAngle;
let BatAngle;
let TimeGap;

function init() {
    GroundHeight = height - height / 7;
    MinBallHeight = GroundHeight * 0.6;
    MaxBallHeight = GroundHeight * 0.4;
    PlayerPositionX = width * 0.2;

    let spawnArea = 150;
    BallMinX = width / 2 - spawnArea / 2;
    BallMaxX = width / 2 + spawnArea / 2;

    BallTarget = createVector(width / 2, height * 0.6);
    BallTargetSize = height / 5;

    stadium.init();

    let bx = width / 2 + stadium.size.width * 0.2;
    let by = (height / 2) * 1.2;
    BatPos = createVector(bx, by);
    MaxBatAngle = -PI * 0.6;
    BatAngle = -PI / 10;

    Teams = getTeams();

    TimeGap = parseFloat(config.settings.timeGap);
}

function getTeams() {
    let result = [];
    for (let key in config.settings.teams) {
        let team = new Team();
        team.name = config.settings.teams[key].name;
        team.logo = window.images.teamLogos[team.name];
        let players = [];
        for (let key2 in config.settings.teams[key].players) {
            let p = config.settings.teams[key].players[key2];
            let player = new TeamPlayer();
            player.name = p.name;
            player.head = window.images.playerHeads[p.name];
            player.body = p.body;
            player.legs = p.legs;
            player.cap = p.cap;
            players.push(player);
        }
        team.players = players;
        result.push(team);
    }
    return result;
}

class TeamButton {
    constructor(x, y, data, onPress) {
        this.rect = new Rectangle(x, y, ButtonSize, ButtonSize);
        this.hoverRect = Rectangle.FromPosition(
            this.rect.center().x,
            this.rect.center().y,
            ButtonSize * 1.1
        );
        this.data = data;
        this.hover = false;
        this.onPress = onPress;
        this.lastPress = false;

        this.rect.cornerRadius = 12;
        this.hoverRect.cornerRadius = 12;

        if (this.data) {
            this.img = this.data.logo;
            this.text = this.data.text;
            this.imgSizeNormal = calculateAspectRatioFit(
                this.img.width,
                this.img.height,
                this.rect.w * 0.8,
                this.rect.h * 0.8
            );
            this.imgSizeHover = calculateAspectRatioFit(
                this.img.width,
                this.img.height,
                this.hoverRect.w * 0.8,
                this.hoverRect.h * 0.8
            );
            this.text = this.data.name;
            this.textBox = new Rectangle(
                this.hoverRect.x,
                this.hoverRect.bottom() * 1.02,
                this.hoverRect.w,
                this.hoverRect.h
            );
        }
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

        strokeWeight(5);
        stroke(TeamSquareStroke);
        noFill();

        imageMode(CENTER);
        if (this.hover) {
            this.hoverRect.draw();
            if (this.img) {
                image(
                    this.img,
                    this.hoverRect.center().x,
                    this.hoverRect.center().y,
                    this.imgSizeHover.width,
                    this.imgSizeHover.height
                );
            }
        } else {
            this.rect.draw();
            if (this.img) {
                image(
                    this.img,
                    this.rect.center().x,
                    this.rect.center().y,
                    this.imgSizeNormal.width,
                    this.imgSizeNormal.height
                );
            }
        }

        textSize(17);
        textAlign(CENTER, TOP);
        fill(255);
        noStroke();
        text(this.text, this.textBox.x, this.textBox.y, this.textBox.w, this.textBox.h);

        imageMode(CORNER);
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

const wickets = {};
const stadium = {
    init: () => {
        stadium.x = width / 2;
        stadium.y = height / 2;
        stadium.img = window.images.stadium;
        stadium.size = calculateAspectRatioFit(
            stadium.img.width,
            stadium.img.height,
            width,
            height
        );

        wickets.img = window.images.wickets;
        wickets.x = width / 2;
        wickets.y = (stadium.size.height / 2) * 1.2;
        wickets.size = calculateAspectRatioFit(wickets.img.width, wickets.img.height, 90, 90);
        wickets.color = color(config.settings.wickets);
    },
    draw: () => {
        imageMode(CENTER);

        image(stadium.img, stadium.x, stadium.y, stadium.size.width, stadium.size.height);

        tint(wickets.color);
        image(wickets.img, wickets.x, wickets.y, wickets.size.width, wickets.size.height);
        noTint();
        imageMode(CORNER);
    },
};

class Bat {
    constructor() {
        this.img = window.images.cricketBat;
        this.size = calculateAspectRatioFit(this.img.width, this.img.height, BatSize, BatSize);
        this.pos = BatPos;
        this.scale = 1;
        this.rotation = BatAngle;
        this.pivotPoint = createVector(0, this.size.height * 0.25);
    }

    get canHit() {
        return this.rotation < MaxBatAngle / 3;
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        scale(this.scale);
        rotate(this.rotation);
        imageMode(CENTER);
        image(this.img, 0, -this.pivotPoint.y, this.size.width, this.size.height);
        imageMode(CORNER);
        pop();

        if (DEBUG) {
            noStroke();
            fill(255, 0, 255);
            circle(this.pos.x + this.pivotPoint.x, this.pos.y + this.pivotPoint.y, 10);
            fill(0, 255, 255);
            circle(this.pos.x, this.pos.y, 10);
        }
    }

    update() {
        if (this.rotation < BatAngle - 0.001) {
            this.rotation = lerp(this.rotation, BatAngle, 0.2);
        }
    }

    onMousePress() {
        if (this.rotation > BatAngle - 0.001) {
            shifty.tween({
                from: {
                    rot: this.rotation,
                },
                to: {
                    rot: MaxBatAngle,
                },
                duration: 50,
                easing: "easeOutQuad",
                step: (state) => {
                    this.rotation = state.rot;
                },
            });
        }
    }
}

class Ball {
    constructor() {
        this.img = window.images.cricketBall;
        // check if the ball can be hit by comparing it's scale
        this.hitPoints = {
            min: 0.3,
            max: 0.2,
        };

        this.setDefaults();
    }

    setDefaults() {
        this.pos = createVector(0, height / 2 + BallSize, 0);
        this.vel = createVector(0, 0, 0);
        this.size = BallSize;
        this.rotation = 0;
        this.scale = 1;
        this.passedTarget = false;
        this.beenHit = false;
        this.perspective = 1;
        this.minsz = 0.18;
        this.maxsz = 0.35;
        this.rotDir = random(100) < 50 ? -1 : 1;
        this.rotSpeed = random(PI / PI / 2);
    }

    update() {
        this.pos.add(this.vel);

        this.rotation += (this.rotDir * this.rotSpeed * deltaTime) / 1000;

        let s = this.perspective / (this.perspective + this.pos.z);
        let x = this.pos.x * s + width / 2;
        let y = this.pos.y * s + height / 2;

        this.drawPos = createVector(x, y);

        this.scale = map(y, height, BallTarget.y, 1, this.hitPoints.max);

        if (this.drawPos.y < BallTarget.y * 0.95 && this.pos.z > 0 && !this.passedTarget) {
            this.passedTarget = true;
        }
    }

    draw() {
        if (this.pos.z > 0) {
            push();
            translate(this.drawPos.x, this.drawPos.y);
            scale(this.scale);
            rotate(this.rotation);
            imageMode(CENTER);
            image(this.img, 0, 0, this.size, this.size);
            imageMode(CORNER);
            pop();
        }
    }

    throw() {
        this.setDefaults();

        let x = 0;
        let r = random(100);
        if (r < 33) {
            x = -stadium.size.width / 2;
        } else if (r < 66) {
            x = stadium.size.width / 2;
        }
        this.pos.x = x;

        let sz = random(this.minsz, this.maxsz);
        let sx = BallTarget.x - x - width / 2;
        sx *= 0.015;
        this.vel = createVector(sx, 0, sz);

        if (DEBUG) {
            // console.log("Ball vel", this.vel);
        }
    }

    get canBeHit() {
        this.distTilTarget = abs(this.drawPos.y - BallTarget.y);
        return this.distTilTarget < 10;
    }

    checkBat(bat) {
        if (this.canBeHit && bat.canHit && !this.beenHit) {
            this.vel.z *= -1.3;
            let vx = map(this.vel.z, this.minsz, this.maxsz, 25, 40);
            this.vel.x = vx;
            this.beenHit = true;
            let score = map(this.distTilTarget, 1, 9, 6, 1);
            score = floor(score);
            score = constrain(score, 1, 6);
            return score;
        }
    }
}

class ScoreBoard {
    constructor() {
        this.textSize = 25;
        this.font = config.preGameScreen.fontFamily;

        this.height = 70;
        this.horizontalOffset = 20;
        this.horizontalPadding = 20;

        this.rect = new Rectangle(
            width / 2 - stadium.size.width / 2 + this.horizontalOffset,
            height - this.height - 10,
            stadium.size.width - this.horizontalOffset * 2,
            this.height
        );

        this.textColor = 0;

        this.rect.cornerRadius = 20;
    }

    draw(game) {
        noFill();
        fill(255, 255, 255, 90);
        noStroke();
        this.rect.draw();
        textSize(this.textSize);
        noStroke();
        fill(this.textColor);
        textAlign(LEFT, CENTER);
        textFont(this.font);
        text(
            `Wickets: ${game.tournament.wickets}`,
            this.rect.x + this.horizontalPadding,
            this.rect.center().y
        );
        textAlign(CENTER, CENTER);
        text(`Balls: ${game.tournament.balls}`, this.rect.center().x, this.rect.center().y);
        textAlign(RIGHT, CENTER);
        text(
            `Overs: ${game.tournament.overs}`,
            this.rect.right() - this.horizontalPadding,
            this.rect.center().y
        );
        textAlign(CENTER, TOP);

        textAlign(RIGHT, TOP);
        text(`Score: ${game.tournament.score}`, width / 2 - this.textSize, this.textSize / 2);

        textAlign(LEFT, TOP);
        text(`Goal: ${game.tournament.againstScore}`, width / 2 + this.textSize, this.textSize / 2);

        textAlign(CENTER, TOP);
        text(
            `${Teams[game.tournament.teamIndex].name} : ${
                Teams[game.tournament.teamIndex].players[game.tournament.currentPlayerIndex].name
            }`,
            width / 2,
            this.textSize * 2
        );
    }
}

class PauseButton extends TeamButton {
    constructor(onPress) {
        let size = 45;
        let x = width - size;
        let y = size;
        super(x, y, null, onPress);

        this.rect = Rectangle.FromPosition(x, y, size);
        this.hoverRect = Rectangle.FromPosition(x, y, size * 1.1);
        this.rect.cornerRadius = 12;
        this.hoverRect.cornerRadius = 12;

        this.size = size;
    }

    draw() {
        strokeWeight(5);
        stroke(0);
        fill(255);
        if (this.hover) {
            this.hoverRect.draw();
            strokeWeight(8);
            line(
                this.hoverRect.x + this.hoverRect.w * 0.3,
                this.hoverRect.y + this.hoverRect.h * 0.3,
                this.hoverRect.x + this.hoverRect.w * 0.3,
                this.hoverRect.y + this.hoverRect.h * 0.7
            );
            line(
                this.hoverRect.x + this.hoverRect.w * 0.7,
                this.hoverRect.y + this.hoverRect.h * 0.3,
                this.hoverRect.x + this.hoverRect.w * 0.7,
                this.hoverRect.y + this.hoverRect.h * 0.7
            );
        } else {
            this.rect.draw();
            strokeWeight(8);
            line(
                this.rect.x + this.rect.w * 0.3,
                this.rect.y + this.rect.h * 0.3,
                this.rect.x + this.rect.w * 0.3,
                this.rect.y + this.rect.h * 0.7
            );
            line(
                this.rect.x + this.rect.w * 0.7,
                this.rect.y + this.rect.h * 0.3,
                this.rect.x + this.rect.w * 0.7,
                this.rect.y + this.rect.h * 0.7
            );
        }
    }
}

class BodyPart {
    constructor(img) {
        this.img = img;
        this.size = createVector();
        this.scale = createVector(1, 1);
        this.rotation = 0;
        this.pos = createVector(0, 0);
        this.pivot = createVector(0, 0);
        this.offset = createVector(0, 0);
        this.color = color("#ffffff");

        this.calculateSize();
    }

    calculateSize() {
        this.actualSize = calculateAspectRatioFit(
            this.img.width,
            this.img.height,
            this.size.x,
            this.size.y
        );
    }

    draw() {
        push();
        translate(
            this.pos.x + this.offset.x + this.pivot.x,
            this.pos.y + this.offset.y + this.pivot.y
        );
        scale(this.scale.x, this.scale.y);
        rotate(this.rotation);
        imageMode(CENTER);
        tint(this.color);
        image(
            this.img,
            -this.pivot.x,
            -this.pivot.y,
            this.actualSize.width,
            this.actualSize.height
        );
        imageMode(CORNER);
        pop();
    }
}

class Player {
    constructor(player) {
        this.name = player.name;

        this.legImg = window.images.player.leg;
        this.capImg = window.images.player.cap;
        this.bodyImg = window.images.player.body;

        this.headImg = player.head;
        this.name = player.name;
        this.bodyColor = player.body;
        this.legsColor = player.legs;
        this.capColor = player.cap;

        this.setupParts();
        this.setupAnimations();
    }

    setupParts() {
        let center = createVector(
            width / 2 + (stadium.size.width / 2) * 0.65,
            BatPos.y - BatSize * 0.2
        );
        let mainSize = 100;

        this.body = new BodyPart(this.bodyImg);
        this.body.size = createVector(mainSize, mainSize);
        this.body.rotation = radians(-7.7);
        this.body.color = this.bodyColor;
        this.body.calculateSize();
        this.body.pos = createVector(center.x, center.y + this.body.actualSize.height * 0.05);
        center = this.body.pos;

        this.head = new BodyPart(this.headImg);
        this.head.pos = createVector(
            center.x - this.body.actualSize.width * 0.12,
            center.y - this.body.actualSize.height * 0.7
        );
        this.head.size = createVector(
            this.body.actualSize.width * 0.6,
            this.body.actualSize.width * 0.6
        );
        this.head.rotation = radians(-15);
        this.head.calculateSize();

        this.leftLeg = new BodyPart(this.legImg);
        this.leftLeg.pos = createVector(
            center.x - this.body.actualSize.width * 0.25,
            center.y + this.body.actualSize.height * 0.75
        );

        this.rightLeg = new BodyPart(this.legImg);
        this.rightLeg.pos = createVector(
            center.x + this.body.actualSize.width * 0.25,
            center.y + this.body.actualSize.height * 0.75
        );

        this.rightLeg.size = this.leftLeg.size = createVector(
            this.body.size.x * 0.9,
            this.body.size.y * 0.9
        );
        this.rightLeg.calculateSize();
        this.leftLeg.calculateSize();
        this.rightLeg.pivot = this.leftLeg.pivot = createVector(0, this.leftLeg.actualSize.height);

        this.leftLeg.color = this.rightLeg.color = this.legsColor;

        this.cap = new BodyPart(this.capImg);
        this.cap.pos = createVector(
            this.head.pos.x - this.head.actualSize.width * 0.45,
            center.y - this.body.actualSize.height * 0.95
        );
        this.cap.size = createVector(this.body.size.x * 0.9, this.body.size.y * 0.9);
        this.cap.color = this.capColor;
        this.cap.rotation = radians(-15);
        this.cap.calculateSize();
    }

    setupAnimations() {
        let animDuration = 400;

        let bodyAnimMaxScale = 1;
        let bodyAnimMinScale = 0.98;
        let bodyAnimMinOffset = 0;
        let bodyAnimMaxOffset = 5;

        let bodyAnim = () => {
            shifty
                .tween({
                    from: {
                        scale: bodyAnimMinScale,
                        offset: bodyAnimMinOffset,
                    },
                    to: {
                        scale: bodyAnimMaxScale,
                        offset: bodyAnimMaxOffset,
                    },
                    duration: animDuration,
                    easing: "easeInQuad",
                    step: (state) => {
                        this.body.scale = createVector(state.scale, state.scale);
                        this.body.offset.y = state.offset;
                    },
                })
                .then(() =>
                    shifty.tween({
                        from: {
                            scale: bodyAnimMaxScale,
                            offset: bodyAnimMaxOffset,
                        },
                        to: {
                            scale: bodyAnimMinScale,
                            offset: bodyAnimMinOffset,
                        },
                        duration: animDuration,
                        easing: "easeInQuad",
                        step: (state) => {
                            this.body.scale = createVector(state.scale, state.scale);
                            this.body.offset.y = state.offset;
                        },
                    })
                )
                .then(bodyAnim);
        };

        let headAnimMinOffset = 0;
        let headAnimMaxOffset = 6;
        let headAnim = () => {
            shifty
                .tween({
                    from: {
                        offset: headAnimMinOffset,
                    },
                    to: {
                        offset: headAnimMaxOffset,
                    },
                    duration: animDuration,
                    easing: "easeInQuad",
                    step: (state) => {
                        this.head.offset.y = this.cap.offset.y = state.offset;
                    },
                })
                .then(() =>
                    shifty.tween({
                        from: {
                            offset: headAnimMaxOffset,
                        },
                        to: {
                            offset: headAnimMinOffset,
                        },
                        duration: animDuration,
                        easing: "easeInQuad",
                        step: (state) => {
                            this.head.offset.y = this.cap.offset.y = state.offset;
                        },
                    })
                )
                .then(headAnim);
        };

        let legsMinScale = 0.96;
        let legsMaxScale = 1;

        let legsAnim = () => {
            shifty
                .tween({
                    from: {
                        scale: legsMinScale,
                    },
                    to: {
                        scale: legsMaxScale,
                    },
                    duration: animDuration,
                    easing: "easeInQuad",
                    step: (state) => {
                        this.leftLeg.scale.y = this.rightLeg.scale.y = state.scale;
                    },
                })
                .then(() =>
                    shifty.tween({
                        from: {
                            scale: legsMaxScale,
                        },
                        to: {
                            scale: legsMinScale,
                        },
                        duration: animDuration,
                        easing: "easeInQuad",
                        step: (state) => {
                            this.leftLeg.scale.y = this.rightLeg.scale.y = state.scale;
                        },
                    })
                )
                .then(legsAnim);
        };

        bodyAnim();
        headAnim();
        legsAnim();
    }

    update() {}

    draw() {
        this.leftLeg.draw();
        this.rightLeg.draw();
        this.head.draw();
        this.body.draw();
        this.cap.draw();
    }
}

class Team {
    constructor() {
        this.name;
        this.logo;
        this.players;
    }
}

class TeamPlayer {
    constructor() {
        this.name;
        this.head;
        this.body;
        this.legs;
        this.cap;
    }
}

class Game {
    constructor() {
        this.defaults();

        init();

        this.chose = false;

        this.teamButtons = [];
        this.overButtons = [];
        this.pauseButton = new PauseButton(() => {
            this.paused = !this.paused;
        });

        let step = ButtonSize + ButtonOffset;
        let sx = width / 2 - (Teams.length / 2) * step + ButtonOffset / 2;
        let y = height / 3;

        for (let i = 0; i < Teams.length; i++) {
            let x = sx + step * i;

            let data = Teams[i];
            this.teamButtons.push(
                new TeamButton(x, y, data, () => {
                    this.tournament.teamIndex = i;
                })
            );
        }

        sx = width / 2 - (3 / 2) * step + ButtonOffset / 2;
        for (let i = 0; i < 3; i++) {
            let x = sx + step * i;
            let n;
            let w;
            if (i == 0) {
                n = 2;
                w = 3;
            }
            if (i == 1) {
                n = 5;
                w = 4;
            }
            if (i == 2) {
                n = 10;
                w = 6;
            }
            this.overButtons.push(
                new OverButton(x, y, n, () => {
                    if (!this.overCount) {
                        this.tournament.maxOvers = n;
                        this.tournament.maxWickets = w;
                    }
                })
            );
        }

        this.bat = new Bat();
        this.ball = new Ball();
        this.ballcd = TimeGap;

        this.tournament = {
            teamIndex: null,
            currentPlayerIndex: null,
            againstIndex: null,
            wins: 0,
            gamesPlayed: 0,
            maxWickets: null,
            maxOvers: null,
            wickets: null,
            overs: null,
            balls: null,
            score: 0,
            againstScore: 0,
            playedAgainst: [],
        };

        this.endRound = false;

        this.scoreboard = new ScoreBoard();
    }

    calculateAgainstScore() {
        let maxScore = this.tournament.maxOvers * BallsPerOver * 6;
        let minScore = maxScore * 0.3;
        let avgScore = maxScore * 0.6;
        let veryGoodScore = maxScore * 0.8;

        let r = random(100);
        let score;
        if (r < 60) {
            score = floor(random(minScore, avgScore * 1.1));
        } else if (r < 90) {
            score = floor(random(avgScore, veryGoodScore));
        } else {
            score = floor(random(avgScore, maxScore));
        }

        return score;
    }

    initVsScreen() {
        this.vsScreenCd = 3;
        this.c_vsScreenCd = this.vsScreenCd;
        this.drawVs = true;

        this.vs_t1 = Teams[this.tournament.teamIndex];
        this.vs_t2 = Teams[this.tournament.againstIndex];

        let size = 100;
        this.vs_size1 = calculateAspectRatioFit(
            this.vs_t1.logo.width,
            this.vs_t1.logo.height,
            size,
            size
        );
        this.vs_size2 = calculateAspectRatioFit(
            this.vs_t2.logo.width,
            this.vs_t2.logo.height,
            size,
            size
        );

        this.canAnim = true;

        this.teamFontSize = 30;
        this.vsFontSize = 45;

        this.paused = true;

        this.offset = 0;
    }

    drawVsScreen() {
        stadium.draw();

        if (this.canAnim && this.c_vsScreenCd < this.vsScreenCd / 4) {
            this.canAnim = false;
            shifty.tween({
                from: {
                    offset: this.offset,
                    teamFontSize: this.teamFontSize,
                    vsFontSize: this.vsFontSize,
                },
                to: {
                    offset: width / 2,
                    teamFontSize: 0,
                    vsFontSize: 0,
                },
                easing: "easeInQuad",
                duration: this.c_vsScreenCd * 1000,
                step: (state) => {
                    this.offset = state.offset;
                    this.teamFontSize = state.teamFontSize;
                    this.vsFontSize = state.vsFontSize;
                },
            });
        }

        textSize(this.teamFontSize);
        fill(0);
        noStroke();
        textFont(config.preGameScreen.fontFamily);
        textAlign(RIGHT, CENTER);
        text(this.vs_t1.name, width / 2 - this.offset, height / 3 - this.vs_size1.height * 1.2);

        textAlign(LEFT, CENTER);
        text(this.vs_t2.name, width / 2 + this.offset, height / 3 + this.vs_size2.height * 1.2);

        textStyle(BOLD);
        textSize(this.vsFontSize);
        textAlign(CENTER, CENTER);
        text("VS", width / 2, height / 3);
        textStyle(NORMAL);

        imageMode(CENTER);
        image(
            this.vs_t1.logo,
            width / 2 + this.vs_size1.width * 1.5 + this.offset,
            height / 3 - this.vs_size1.height * 1.2,
            this.vs_size1.width,
            this.vs_size1.height
        );
        image(
            this.vs_t2.logo,
            width / 2 - this.vs_size2.width * 1.5 - this.offset,
            height / 3 + this.vs_size2.height * 1.2,
            this.vs_size2.width,
            this.vs_size2.height
        );
        imageMode(CORNER);

        textAlign(CENTER, TOP);
        textSize(this.teamFontSize);
        text(
            `You need to score more than ${this.vs_t2.name}'s score of ${this.tournament.againstScore}`,
            width / 2 - stadium.size.width / 2 + 50,
            height - height / 3,
            stadium.size.width - 100,
            height / 3
        );
    }

    getAgainstTeamIndex() {
        let r = floor(random(Teams.length));
        if (r == this.tournament.teamIndex || this.tournament.playedAgainst.includes(r)) {
            return this.getAgainstTeamIndex();
        }
        this.tournament.playedAgainst.push(r);
        return r;
    }

    permaUpdate() {
        stadium.draw();
        // choose team state;
        if (!this.chose) {
            this.choose();
        } else {
            this.updateGame();

            if (this.paused && !this.drawVs) {
                fill(0, 0, 0, 80);
                noStroke();
                rect(0, 0, width, height);
                fill(255);
                textSize(40);
                textAlign(CENTER, CENTER);
                textFont(config.preGameScreen.fontFamily);
                text("Paused", width / 2, height / 2);
            }

            if (this.chose) {
                this.pauseButton.update();
                this.pauseButton.draw();
            }

            if (this.drawVs) {
                this.drawVsScreen();
                this.c_vsScreenCd -= deltaTime / 1000;
                if (this.c_vsScreenCd < 0) {
                    this.drawVs = false;
                    this.paused = false;
                }
            }
        }
    }

    nextPlayer() {
        this.tournament.currentPlayerIndex++;
        if (this.tournament.currentPlayerIndex == Teams[this.tournament.teamIndex].players.length) {
            this.tournament.currentPlayerIndex = 0;
        }
        this.makePlayer(this.tournament.teamIndex, this.tournament.currentPlayerIndex);
        this.resetBallsAndWickets();
    }

    updateGame() {
        if (!this.paused) {
            this.ball.update();
            this.bat.update();

            let score = this.ball.checkBat(this.bat);
            if (score) {
                let pos = randomPointInCircle(width / 2, height / 2, 100);
                let acc = {
                    x: random(-3, 3),
                    y: random(-6, -2),
                };
                let ft = new FloatingText(score, pos.x, pos.y, acc, random(25, 40), 255);
                ft.setLifespan(random(0.4, 0.7));
                this.particles.push(ft);

                this.tournament.score += score;
            }

            if (this.ball.passedTarget && !this.endRound) {
                this.tournament.wickets--;
                this.endRound = true;

                if (this.tournament.wickets == 0) {
                    this.nextPlayer();
                }
            }

            if (this.player) {
                this.player.update();

                this.ballcd -= deltaTime / 1000;
                if (this.ballcd < 0 && this.tournament.balls > 0) {
                    this.ballcd = TimeGap;
                    this.ball.throw();
                    this.tournament.balls--;
                    this.endRound = false;
                }

                if (this.tournament.balls == 0) {
                    this.nextPlayer();
                }

                if (this.tournament.score > this.tournament.againstScore) {
                    this.tournament.wins++;
                    this.initMatch();
                }
            }
        }

        if (this.player) {
            this.player.draw();
        }

        this.bat.draw();
        this.ball.draw();

        this.scoreboard.draw(this);

        if (DEBUG) {
            // this.debugHUD();
        }
    }

    debugHUD() {
        fill(255, 0, 0);
        noStroke();
        rect(BallMinX - 5, height - 10, 10, 10);
        rect(BallMaxX - 5, height - 10, 10, 10);

        let sy = 50;
        let sx = 50;
        let spacing = 17;
        fill(0);
        textAlign(LEFT);
        textSize(spacing * 0.8);
        textFont("Monaco");
        text(`ball pos: x:${this.ball.pos.x} y:${this.ball.pos.y} z:${this.ball.pos.z}`, sx, sy);
        text(
            `ball acc: x:${this.ball.vel.x} y:${this.ball.vel.y} z:${this.ball.vel.z}`,
            sx,
            sy + spacing * 2
        );
        text(`ball draw coords: x:${this.ball.drawX} y:${this.ball.drawY}`, sx, sy + spacing * 4);
        text(`ball scale: ${this.ball.scale}`, sx, sy + spacing * 6);
        text(`ball graivty: ${this.ball.gravity}`, sx, sy + spacing * 8);
        text(`ball rotation: ${this.ball.rotation}`, sx, sy + spacing * 9);
        text(`ball rotation speed: ${this.ball.rotSpeed}`, sx, sy + spacing * 10);
        text(`ball rotation dir: ${this.ball.rotDir}`, sx, sy + spacing * 11);
        text(`bat rotation: ${this.bat.rotation}`, sx, sy + spacing * 13);
        text(`bat canHit: ${this.bat.canHit}`, sx, sy + spacing * 14);
        text(`ball canBeHit: ${this.ball.canBeHit}`, sx, sy + spacing * 15);

        text(
            `ball draw pos: x:${this.ball.drawPos.x} y: ${this.ball.drawPos.y}`,
            sx,
            sy + spacing * 17
        );

        let size = map(this.ball.drawPos.y, height, BallTarget.y, BallTargetSize, 10);
        noFill();
        stroke(255, 0, 0);
        if (this.ball.canBeHit) {
            strokeWeight(7);
        } else {
            strokeWeight(1);
        }
        if (size > 0) {
            circle(BallTarget.x, BallTarget.y, size);
        }
    }

    choose() {
        textFont(config.preGameScreen.fontFamily);
        textSize(this.instructionsFontSize * 1.6);
        textAlign(CENTER);
        noStroke();
        fill(config.settings.textColor);

        if (this.tournament.teamIndex === null) {
            text(ChooseTeamText, 20, 40, width - 40, this.instructionsFontSize * 1.8);
            this.teamButtons.map((b) => {
                b.draw();
            });
        } else if (this.tournament.overs === null) {
            text(ChooseOversText, 20, 40, width - 40, this.instructionsFontSize * 1.8);

            this.overButtons.map((b) => {
                b.draw();
            });
        }

        if (this.tournament.teamIndex !== null && this.tournament.maxOvers !== null) {
            this.chose = true;
            this.tournament.overs = this.tournament.maxOvers;
            this.tournament.currentPlayerIndex = 0;

            this.resetBallsAndWickets();

            this.makePlayer(this.tournament.teamIndex, this.tournament.currentPlayerIndex);
            this.initMatch();
        }
    }

    initMatch() {
        this.tournament.againstIndex = this.getAgainstTeamIndex();
        this.initVsScreen();
        this.tournament.againstScore = this.calculateAgainstScore();
        this.tournament.gamesPlayed++;
        this.tournament.score = 0;
        this.tournament.playerIndex = 0;
        this.ball = new Ball();
    }

    resetBallsAndWickets() {
        this.tournament.wickets = this.tournament.maxWickets;
        this.tournament.balls = this.tournament.maxOvers * BallsPerOver;
    }

    makePlayer(teamIndex, playerIndex) {
        let p = Teams[teamIndex].players[playerIndex];
        this.player = new Player(p);
    }

    onMousePress() {
        if (
            this.chose &&
            mouseX > width / 2 - stadium.size.width / 2 &&
            mouseX < width / 2 + stadium.size.width / 2
        ) {
            this.bat.onMousePress();
        }
        // console.log(this.ball.pos.z);
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

        // Don'1t touch these
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
    try {
        if (window.soundEnabled) {
            sound.play();
        }
    } catch (err) {
        console.log("error playing sound");
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

function randomPointInCircle(x, y, r) {
    let r_ = random(0, r);
    let a = random(0, TWO_PI);
    let x_ = x + cos(a) * r_;
    let y_ = y + sin(a) * r_;
    return createVector(x_, y_);
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
        this.cornerRadius = 0;
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
        rect(this.x, this.y, this.w, this.h, this.cornerRadius);
    }

    textInside(txt) {
        text(txt, this.x, this.y, this.w, this.h);
    }

    static FromPosition(x, y, w, h = w) {
        return new Rectangle(x - w / 2, y - h / 2, w, h);
    }
}

function intersectRect(r1, r2) {
    return !(
        r2.left() > r1.right() ||
        r2.right() < r1.left() ||
        r2.top() > r1.bottom() ||
        r2.bottom() < r1.top()
    );
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
