// === Сцена 1: Стартовая ===
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('playButton', './img/buttonDefault.png'); // Кнопка
        this.load.image('borderLeft', './img/edge_left.png'); // Левая часть контура
        this.load.image('borderRight', './img/edge_right.png'); // Правая часть контура
        this.load.image('borderTop', './img/edge_top.png'); // Верхняя часть контура
    }

    create() {
        // Кнопка Play
        const playButton = this.add.image(300, 300, 'playButton').setInteractive();
        this.add.text(playButton.x, playButton.y, 'Play', {
            fontSize: '20px',
            fill: '#000',
        }).setOrigin(0.5);

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene', { score: 0, lives: 3, time: 60 });
        });

        // Текст заголовка
        this.add.text(300, 100, 'Arkanoid', {
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

        // Загрузка GIF-картинки взрыва
        this.load.image('explosion', './img/fireball_side_small_explode.gif');
    }

    create() {
        // Добавляем контур
        const borderLeft = this.add.image(0, 200, 'borderLeft').setOrigin(0.5, 0.5);
        const borderRight = this.add.image(600, 200, 'borderRight').setOrigin(0.5, 0.5);
        const borderTop = this.add.image(300, 0, 'borderTop').setOrigin(0.5, 0.5);

        // Настройка размеров и позиции
        borderLeft.displayHeight = 400; // Высота игрового поля
        borderRight.displayHeight = 400;
        borderTop.displayWidth = 600; // Ширина игрового поля

        // Текст для отображения очков, жизней и таймера
        this.scoreText = this.add.text(10, 10, 'Score: ' + this.score, { fontSize: '16px', fill: '#FFF' });
        this.livesText = this.add.text(10, 30, 'Lives: ' + this.lives, { fontSize: '16px', fill: '#FFF' });
        this.timerText = this.add.text(500, 10, 'Time: ' + this.remainingTime, { fontSize: '16px', fill: '#FFF' });

        // Таймер на 1 минуту
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Платформа
        this.paddle = this.physics.add.sprite(300, 370, 'paddle').setImmovable();
        this.paddle.body.collideWorldBounds = true;

        // Мяч
        this.ball = this.physics.add.sprite(300, 350, 'ball');
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
            this.paddle.x = Phaser.Math.Clamp(pointer.x, this.paddle.width / 2, this.sys.game.config.width - this.paddle.width / 2);
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

        if (this.ball.y > this.sys.game.config.height) {
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
        this.bricks = this.physics.add.staticGroup();
    
        const offsetX = 20; // Отступ слева и справа
        const offsetY = 70; // Отступ сверху
        const blockWidth = (600 - offsetX * 2) / 10; // Ширина блока с учётом отступов
        const blockHeight = 20; // Высота блока
        const rows = 3; // Количество рядов
        const colors = ['brickRed', 'brickYellow', 'brickGreen']; // Цвета блоков
        const points = [10, 15, 20]; // Очки за каждый цвет
    
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 10; col++) {
                const x = col * blockWidth + offsetX + blockWidth / 2;
                const y = row * blockHeight + offsetY;
                const colorIndex = row % colors.length; // Циклический выбор цвета
                const brick = this.bricks.create(x, y, colors[colorIndex]).setOrigin(0.5, 0.5);
                brick.displayWidth = blockWidth; // Подгоняем ширину блока
                brick.displayHeight = blockHeight; // Подгоняем высоту блока
                brick.setData('points', points[colorIndex]); // Устанавливаем очки
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
        this.ball.setVelocity(0);
        this.ball.setData('onPaddle', true);
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - 30;
    }

    loseLife() {
        this.lives -= 1;
        this.livesText.setText('Lives: ' + this.lives);

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
    
        // Отображение текста очков чуть правее
        const scoreText = this.add.text(brick.x + 20, brick.y, `+${points}`, {
            fontSize: '14px',
            fill: '#FFFF00'
        }).setOrigin(0.5);
    
        this.time.delayedCall(300, () => {
            scoreText.destroy();
        });
    
        // Отображение GIF взрыва чуть левее
        const explosion = this.add.image(brick.x - 20, brick.y, 'explosion');
        explosion.setScale(0.6);
    
        this.time.delayedCall(200, () => {
            explosion.destroy();
        });
    
        brick.destroy();
    
        if (this.bricks.countActive() === 0) {
            this.scene.start('EndScene', { score: this.score });
        }
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
        this.add.text(300, 150, `Game Over!`, { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
        this.add.text(300, 200, `Score: ${this.finalScore}`, { fontSize: '20px', fill: '#FFD700' }).setOrigin(0.5);

        const playAgain = this.add.text(300, 300, 'Play Again', { fontSize: '20px', fill: '#FFD700' })
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
    width: 600,
    height: 400,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [StartScene, GameScene, EndScene]
};

const game = new Phaser.Game(config);
