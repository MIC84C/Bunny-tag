const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let rabbit, shark, carrot, box;
let rabbitTarget = null;
let carrotCollected = false;
let gameStarted = false;
let countdownText;
let scoreText;
let speedText;
let sharkSpeed = parseFloat(localStorage.getItem('sharkSpeed')) || 1;
let score = parseInt(localStorage.getItem('score')) || 0;

function preload() {
    this.load.audio('music', 'music.mp3');
}

function create() {
    // Start music
    const music = this.sound.add('music', { loop: true, volume: 0.5 });
    music.play();

    // Box (safe zone)
    box = this.add.rectangle(400, 225, 60, 60, 0x8B4513).setStrokeStyle(3, 0xffffff);

    // Carrot - random position
    carrot = this.add.graphics();
    carrot.x = Phaser.Math.Between(100, 700);
    carrot.y = Phaser.Math.Between(60, 390);
    drawCarrot(carrot);

    // Rabbit
    rabbit = this.add.circle(50, 225, 16, 0xffffff);

    // Shark
    shark = this.add.graphics();
    shark.x = 750;
    shark.y = 225;
    drawShark(shark);

    // Score display
    scoreText = this.add.text(10, 10, 'Score: ' + score, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setDepth(1);

    // Shark speed display
    speedText = this.add.text(10, 35, 'Shark Speed: ' + sharkSpeed, {
        fontSize: '20px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setDepth(1);

    // Tap to move rabbit
    this.input.on('pointerdown', function(pointer) {
        if (!gameStarted) return;
        rabbitTarget = { x: pointer.x, y: pointer.y };
    });

    // Countdown
    countdownText = this.add.text(400, 225, '3', {
        fontSize: '120px',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    let count = 3;
    const scene = this;

    scene.time.addEvent({
        delay: 1000,
        repeat: 2,
        callback: function() {
            count--;
            if (count > 0) {
                countdownText.setText(String(count));
            } else {
                countdownText.setText('GO!');
                scene.time.delayedCall(600, function() {
                    countdownText.setVisible(false);
                    gameStarted = true;
                });
            }
        }
    });
}

function drawCarrot(g) {
    g.clear();
    // Carrot body
    g.fillStyle(0xFF6600, 1);
    g.fillTriangle(0, 15, -8, -10, 8, -10);
    // Left leaf
    g.fillStyle(0x228B22, 1);
    g.fillTriangle(-2, -10, -14, -25, 2, -16);
    // Middle leaf
    g.fillTriangle(0, -12, -4, -28, 4, -28);
    // Right leaf
    g.fillTriangle(2, -10, 14, -25, -2, -16);
}

function drawShark(g) {
    g.clear();
    // Body
    g.fillStyle(0x4444ff, 1);
    g.fillEllipse(0, 0, 50, 25);
    // Fin
    g.fillTriangle(-5, -12, 5, -28, 15, -12);
    // Tail
    g.fillTriangle(25, 0, 40, -15, 40, 15);
    // Eye
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-14, -3, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-15, -3, 2);
}

function update() {
    if (!gameStarted) return;
    moveRabbit();
    moveShark();
    checkCollisions();
}

function moveRabbit() {
    if (!rabbitTarget) return;

    const speed = 8;
    const dx = rabbitTarget.x - rabbit.x;
    const dy = rabbitTarget.y - rabbit.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
        rabbit.x = rabbitTarget.x;
        rabbit.y = rabbitTarget.y;
        rabbitTarget = null;
    } else {
        rabbit.x += (dx / dist) * speed;
        rabbit.y += (dy / dist) * speed;
    }
}

function moveShark() {
    const speed = sharkSpeed;

    const dx = rabbit.x - shark.x;
    const dy = rabbit.y - shark.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > speed) {
        shark.x += (dx / dist) * speed;
        shark.y += (dy / dist) * speed;
    }
    shark.rotation = Math.atan2(dy, dx) + Math.PI;
    if (speedText) speedText.setText('Shark Speed: ' + sharkSpeed);
}

function checkCollisions() {
    // Rabbit eats carrot
    if (!carrotCollected && carrot.alpha > 0) {
        const d = Phaser.Math.Distance.Between(rabbit.x, rabbit.y, carrot.x, carrot.y);
        if (d < 20) {
            carrot.setAlpha(0);
            carrotCollected = true;
        }
    }

    // Shark tags rabbit
    const sharkDist = Phaser.Math.Distance.Between(rabbit.x, rabbit.y, shark.x, shark.y);
    if (sharkDist < 24) {
        rabbit.setFillStyle(0xff0000);
        gameStarted = false;
        if (!document.getElementById('loseText')) {
            sharkSpeed = 1;
            localStorage.setItem('sharkSpeed', 1);
            score = 0;
            localStorage.setItem('score', 0);
            const msg = document.createElement('div');
            msg.id = 'loseText';
            msg.innerHTML = "Oh no, Ame ate Levi<br><br><button onclick='location.reload()' style='font-size:32px;padding:10px 30px;cursor:pointer;border:none;border-radius:10px;background:white;color:red;font-weight:bold;'>Play Again</button>";
            msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:white;text-shadow:3px 3px 6px black;text-align:center;';
            document.body.appendChild(msg);
        }
    }

    // Rabbit reaches box
    if (carrotCollected) {
        const boxDist = Phaser.Math.Distance.Between(rabbit.x, rabbit.y, box.x, box.y);
        if (boxDist < 30) {
            rabbit.setFillStyle(0xffff00);
            gameStarted = false;
            if (!document.getElementById('winText')) {
                sharkSpeed += 0.5;
                localStorage.setItem('sharkSpeed', sharkSpeed);
                score += 1;
                localStorage.setItem('score', score);
                const msg = document.createElement('div');
                msg.id = 'winText';
                msg.innerHTML = "Winner winner Levi's dinner<br><br><button onclick='location.reload()' style='font-size:32px;padding:10px 30px;cursor:pointer;border:none;border-radius:10px;background:white;color:green;font-weight:bold;'>Play Again</button>";
                msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:white;text-shadow:3px 3px 6px black;text-align:center;';
                document.body.appendChild(msg);
            }
        }
    }
}