// === Сцена 1: Стартовая ===
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('playButton', './img/start-btn.png'); // Кнопка
        this.load.image('borderLeft', './img/edge_left.png'); // Левая часть контура
        this.load.image('borderRight', './img/edge_right.png'); // Правая часть контура
        this.load.image('borderTop', './img/edge_top.png'); // Верхняя часть контура
    }

    create() {
        // Кнопка Play
        const { width, height } = this.cameras.main;
        const playButton = this.add.image(width / 2, height / 2, 'playButton').setInteractive();
        playButton.setScale(0.5);

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene', { score: 0, lives: 3, time: 60 });
        });

        // Текст заголовка
        this.add.text(width / 2, height / 6, 'Arkanoid', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
    }
}

// === Сцена 2: Игровая ===
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.score = data.score;
        this.lives = data.lives;
        this.remainingTime = data.time;
    }

    preload() {
        this.load.image('paddle', './img/paddleRed.png');
        this.load.image('ball', './img/ballBlue.png');
        this.load.image('brickRed', './img/element_red_rectangle.png');
        this.load.image('brickYellow', './img/element_yellow_rectangle.png');
        this.load.image('brickGreen', './img/element_green_rectangle.png');
        this.load.image('borderLeft', './img/edge_left.png'); // Левая часть контура
        this.load.image('borderRight', './img/edge_right.png'); // Правая часть контура
        this.load.image('borderTop', './img/edge_top.png'); // Верхняя часть контура
        this.load.image('explosion', './img/fireball_side_small_explode.gif'); // Загрузка GIF-картинки взрыва
    }

    create() {
        const { width, height } = this.cameras.main;

        // Добавляем контур
        const borderLeft = this.add.image(0, height / 2, 'borderLeft').setOrigin(0.5, 0.5);
        const borderRight = this.add.image(width, height / 2, 'borderRight').setOrigin(0.5, 0.5);
        const borderTop = this.add.image(width / 2, 0, 'borderTop').setOrigin(0.5, 0.5);

        // Настройка размеров и позиции
        borderLeft.displayHeight = height;
        borderRight.displayHeight = height;
        borderTop.displayWidth = width;

        // Текст для отображения очков, жизней и таймера
        this.scoreText = this.add.text(10, 10, 'Score: ' + this.score, { fontSize: '16px', fill: '#FFF' });
        this.livesText = this.add.text(10, 30, 'Lives: ' + this.lives, { fontSize: '16px', fill: '#FFF' });
        this.timerText = this.add.text(width - 100, 10, 'Time: ' + this.remainingTime, { fontSize: '16px', fill: '#FFF' });

        // Таймер на 1 минуту
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Платформа
        this.paddle = this.physics.add.sprite(width / 2, height - 30, 'paddle').setImmovable();
        this.paddle.body.collideWorldBounds = true;

        // Мяч
        this.ball = this.physics.add.sprite(width / 2, height - 50, 'ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);
        this.ball.setData('onPaddle', true);

        // Отключаем коллизию мяча с нижней границей
        this.physics.world.setBoundsCollision(true, true, true, false);

        // Блоки
        this.createBricks();

        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', this.startBall, this);

        this.input.on('pointerdown', this.startBall, this);
        this.input.on('pointermove', (pointer) => {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, this.paddle.width / 2, width - this.paddle.width / 2);
            if (this.ball.getData('onPaddle')) {
                this.ball.x = this.paddle.x;
            }
        });

        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    }

    update() {
        if (this.cursors.left.isDown) {
            this.paddle.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.paddle.setVelocityX(300);
        } else {
            this.paddle.setVelocityX(0);
        }

        if (this.ball.getData('onPaddle')) {
            this.ball.x = this.paddle.x;
        }

        if (this.ball.y > this.cameras.main.height) {
            this.loseLife();
        }
    }

    updateTimer() {
        this.remainingTime--;
        this.timerText.setText('Time: ' + this.remainingTime);

        if (this.remainingTime <= 0) {
            this.scene.start('EndScene', { score: this.score });
        }
    }

    createBricks() {
        const { width } = this.cameras.main;
        const offsetX = width * 0.05;
        const offsetY = 70;
        const blockWidth = (width - offsetX * 2) / 10;
        const blockHeight = 20;
        const rows = 3;
        const colors = ['brickRed', 'brickYellow', 'brickGreen'];
        const points = [10, 15, 20];

        this.bricks = this.physics.add.staticGroup();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 10; col++) {
                const x = col * blockWidth + offsetX + blockWidth / 2;
                const y = row * blockHeight + offsetY;
                const colorIndex = row % colors.length;
                const brick = this.bricks.create(x, y, colors[colorIndex]).setOrigin(0.5, 0.5);
                brick.displayWidth = blockWidth;
                brick.displayHeight = blockHeight;
                brick.setData('points', points[colorIndex]);
            }
        }
    }

    startBall() {
        if (this.ball.getData('onPaddle')) {
            this.ball.setVelocity(-200, -300);
            this.ball.setData('onPaddle', false);
        }
    }

    resetBall() {
        const { width, height } = this.cameras.main;
        this.ball.setVelocity(0);
        this.ball.setData('onPaddle', true);
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - 20;
    }

    loseLife() {
        this.lives -= 1;
        this.score -= 20;
        this.livesText.setText('Lives: ' + this.lives);
        this.scoreText.setText('Score: ' + this.score);

        if (this.lives <= 0) {
            this.scene.start('EndScene', { score: this.score });
        } else {
            this.resetBall();
        }
    }

    hitPaddle(ball, paddle) {
        const diff = ball.x - paddle.x;
        ball.setVelocityX(diff * 10);
    }

    hitBrick(ball, brick) {
        const points = brick.getData('points');
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        brick.destroy();
    }
}

// === Сцена 3: Конечная ===
class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    init(data) {
        this.finalScore = data.score;
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, height / 2 - 50, `Game Over!`, {
            fontSize: '24px',
            fill: '#FFF'
        }).setOrigin(0.5);
        this.add.text(width / 2, height / 2, `Score: ${this.finalScore}`, {
            fontSize: '20px',
            fill: '#FFD700'
        }).setOrigin(0.5);

        const playAgain = this.add.text(width / 2, height / 2 + 50, 'Play Again', {
            fontSize: '20px',
            fill: '#FFD700'
        })
            .setInteractive()
            .setOrigin(0.5);

        playAgain.on('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }
}

// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [StartScene, GameScene, EndScene]
};

const game = new Phaser.Game(config);
