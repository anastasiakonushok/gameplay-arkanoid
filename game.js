class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        this.load.image('stars', './img/background.png'); // Фон со звёздами
    }

    create() {
        const { width, height } = this.cameras.main;

        // Анимация звёздного фона
        const stars = this.add.tileSprite(width / 2, height / 2, width, height, 'stars');
        this.time.addEvent({
            delay: 10,
            callback: () => {
                stars.tilePositionY -= 1; // Движение звёзд вниз
            },
            loop: true
        });

        // Ползущий текст
        const introText = this.add.text(width / 2 - 10, height, `
            Давным-давно в далёкой-далёкой галактике...


            ЭПИЗОД I
            Пробуждение Арканоида


            Галактика в опасности. На горизонте появился вражеский корабль, угрожающий уничтожить мирные планеты.

            Твоя миссия:
            разрушить блоки защиты корабля, победить врага и спасти планету.
            
            Да пребудет с тобой сила!
        `, {
            fontFamily: 'Rubik',
            fontSize: '16px',
            color: '#FFFF00',
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);

        // Анимация движения текста вверх
        this.tweens.add({
            targets: introText,
            y: -200,
            duration: 15000, // Длительность анимации (15 секунд)
            ease: 'Linear',
            onComplete: () => {
                this.scene.start('StartScene'); // Переход к StartScene после окончания
            }
        });

        // Текст "Нажмите, чтобы пропустить"
        const skipText = this.add.text(width / 2, height - 30, 'Нажмите, чтобы пропустить', {
            fontSize: '14px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // Переход к StartScene при клике
        this.input.once('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }
}



// === Сцена 1: Стартовая ===
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('background-start', './img/star-wars-back.png');
        this.load.image('logo', './img/arkanoid-logo.png');
        this.load.image('playButton', './img/start-btn.png'); // Кнопка
        this.load.image('borderLeft', './img/edge_left.png'); // Левая часть контура
        this.load.image('borderRight', './img/edge_right.png'); // Правая часть контура
        this.load.image('borderTop', './img/edge_top.png'); // Верхняя часть контура
    }

    create() {
        const { width, height } = this.cameras.main;

        const backgroundStart = this.add.image(width / 2, height / 2, 'background-start');
        backgroundStart.setDisplaySize(width, height); // Масштабируем фон под размеры сцены
        // Кнопка Play

        const playButton = this.add.image(width / 2, height / 2 + 100, 'playButton').setInteractive();
        playButton.setScale(0.5);

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene', { score: 0, lives: 3, time: 60 });
        });
        const logo = this.add.image(width / 2, 80, 'logo').setInteractive();
        logo.setScale(1);
        // // Текст заголовка
        // this.add.text(180, 50, 'Arkanoid', {
        //     fontSize: '24px',
        //     fill: '#FFFFFF'
        // }).setOrigin(0.5);
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
        this.load.image('background', './img/background.png');
        this.load.image('paddle', './img/paddleRed.png');
        this.load.image('ball', './img/ballBlue.png');
        this.load.image('brickRed', './img/element_red_rectangle.png');
        this.load.image('brickYellow', './img/element_yellow_rectangle.png');
        this.load.image('brickGreen', './img/element_green_rectangle.png');
        this.load.image('borderLeft', './img/edge_left.png');
        this.load.image('borderRight', './img/edge_right.png');
        this.load.image('borderTop', './img/edge_top.png');

        // Загрузка GIF-картинки взрыва
        this.load.image('explosion', './img/fireball_side_small_explode.gif');
    }

    create() {

        const { width, height } = this.cameras.main;
        const background = this.add.image(width / 2, height / 2, 'background');
        background.setDisplaySize(width, height);
        // Левая граница: высота на всю длину камеры
        const borderLeft = this.add.image(0, height / 2, 'borderLeft')
            .setOrigin(0.5, 0.5); // Центрирование относительно своей позиции
        borderLeft.displayHeight = height; // Задаем высоту равной высоте камеры

        // Правая граница: высота на всю длину камеры
        const borderRight = this.add.image(width, height / 2, 'borderRight')
            .setOrigin(0.5, 0.5); // Центрирование относительно своей позиции
        borderRight.displayHeight = height; // Задаем высоту равной высоте камеры

        // Верхняя граница: ширина на всю длину камеры
        const borderTop = this.add.image(width / 2, 0, 'borderTop')
            .setOrigin(0.5, 0.5); // Центрирование относительно своей позиции
        borderTop.displayWidth = width; // Задаем ширину равной ширине камеры

        // Настройка размеров и позиции
        borderLeft.displayHeight = height; // Высота игрового поля
        borderRight.displayHeight = height;
        borderTop.displayWidth = width; // Полная ширина экрана

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
        this.paddle = this.physics.add.sprite(width / 2, height - 50, 'paddle').setImmovable();
        this.paddle.body.collideWorldBounds = true;

        // Мяч
        this.ball = this.physics.add.sprite(width / 2, this.paddle.y - 20, 'ball');
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
        const blockWidth = (350 - offsetX * 2) / 10; // Ширина блока с учётом отступов
        const blockHeight = 20; // Высота блока
        const rows = 3; // Количество рядов
        const colors = ['brickRed', 'brickYellow', 'brickGreen']; // Цвета блоков
        const points = [20, 15, 10]; // Очки за каждый цвет

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
        const { width, height } = this.cameras.main;

        this.lives -= 1;
        this.score -= 20;
        this.livesText.setText('Lives: ' + this.lives);
        this.scoreText.setText('Score: ' + this.score);

        const message = this.add.text(this.paddle.x + 80, this.paddle.y - 20, `-20`, {
            fontSize: '16px',
            fill: '#FF0000',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            message.destroy();
        });

        if (this.lives <= 0) {
            this.time.delayedCall(1500, () => {
                this.scene.start('EndScene', { score: this.score });
            });
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
        const scoreText = this.add.text(brick.x + 20, brick.y, `+${points}`, {
            fontSize: '14px',
            fill: '#FFFF00'
        }).setOrigin(0.5);

        this.time.delayedCall(300, () => {
            scoreText.destroy();
        });
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
    preload() {
        this.load.image('background-end', './img/start-back.png');
    }
    create() {
        const { width, height } = this.cameras.main;
        const backgroundEnd = this.add.image(width / 2, height / 2, 'background-end');
        backgroundEnd.setDisplaySize(width, height);

        this.add.text(170, 150, `Game Over!`, { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
        this.add.text(170, 200, `Score: ${this.finalScore}`, { fontSize: '20px', fill: '#FFD700' }).setOrigin(0.5);

        const playAgain = this.add.text(170, 300, 'Play Again', { fontSize: '20px', fill: '#FFD700' })
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
    parent: 'game-container', // Контейнер для игры
    width: 350, // Базовая ширина
    height: 600, // Базовая высота
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT, // Подгонка игры под экран
        autoCenter: Phaser.Scale.CENTER_BOTH, // Центрирование по экрану
        maxWidth: 350, // Максимальная ширина для Desktop
        maxHeight: 600, // Максимальная высота для Desktop
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [IntroScene, StartScene, GameScene, EndScene]
};


// Загрузка шрифта перед запуском игры
document.fonts.load('16px Rubik').then(() => {
    const game = new Phaser.Game(config); // Инициализация игры
}).catch((error) => {
    console.error('Ошибка при загрузке шрифта:', error);
    const game = new Phaser.Game(config); // Всё равно запускаем игру, даже если шрифт не загрузился
});
const game = new Phaser.Game(config);

