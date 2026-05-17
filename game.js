const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    backgroundColor: '#3a7d44',
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

function preload() {}

function create() {
    // Box (safe zone)
    box = this.add.rectangle(400, 225, 60, 60, 0x8B4513).setStrokeStyle(3, 0xffffff);

    // Carrot
    carrot = this.add.circle(200, 300, 12, 0xFF6600);

    // Rabbit
    rabbit = this.add.circle(50, 225, 16, 0xffffff);

    // Shark
    shark = this.add.circle(750, 225, 20, 0x0000ff);

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
    const speed = 1;

    const dx = rabbit.x - shark.x;
    const dy = rabbit.y - shark.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > speed) {
        shark.x += (dx / dist) * speed;
        shark.y += (dy / dist) * speed;
    }
}

function checkCollisions() {
    // Rabbit eats carrot
    if (!carrotCollected && carrot.visible) {
        const d = Phaser.Math.Distance.Between(rabbit.x, rabbit.y, carrot.x, carrot.y);
        if (d < 20) {
            carrot.setVisible(false);
            carrotCollected = true;
        }
    }

    // Shark tags rabbit
    const sharkDist = Phaser.Math.Distance.Between(rabbit.x, rabbit.y, shark.x, shark.y);
    if (sharkDist < 24) {
        rabbit.setFillStyle(0xff0000);
        gameStarted = false;
        if (!document.getElementById('loseText')) {
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
                const msg = document.createElement('div');
                msg.id = 'winText';
                msg.innerHTML = "Winner winner Levi's dinner<br><br><button onclick='location.reload()' style='font-size:32px;padding:10px 30px;cursor:pointer;border:none;border-radius:10px;background:white;color:green;font-weight:bold;'>Play Again</button>";
                msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:white;text-shadow:3px 3px 6px black;text-align:center;';
                document.body.appendChild(msg);
            }
        }
    }
}