// === Сцена 0: Вступление ===
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

        // Обработчик пропуска сцены
        this.input.once('pointerdown', () => {

            this.scene.start('StartScene');
        });


        // Ползущий текст
        const introText = this.add.text(width / 2 - 10, height, `
            Давным-давно в далёкой-далёкой галактике...


            ЭПИЗОД I
            Пробуждение Арканоида


            Внимание, на горизонте замечен вражеский корабль. Ваша миссия защитить вашу мирную планету от имперских захватчиков. 

            В Вашем распоряжении "Небесный таран" - корабль используемый для отражения астероидов. Используйте его и захваченный астероид для уничтожения защитного поля вражеского корабля и спаси планету!
            
            Да пребудет с тобой сила!
        `, {
            fontFamily: 'Rubik',
            fontSize: '16px',
            color: '#FFFF00',
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);
        this.tweens.add({
            targets: introText,
            y: -200,
            duration: 15000, // Длительность анимации (15 секунд)
            ease: 'Linear',
            onComplete: () => {
                this.scene.start('StartScene');
            }
        });
        // Переход к StartScene при клике
        this.input.once('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }
    startNextScene(nextScene) {
        this.cameras.main.fadeOut(1000); // Затухание (1 секунда)
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(nextScene);
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
        this.load.image('playButton', './img/button-start.png'); // Кнопка
    }

    create() {
        const { width, height } = this.cameras.main;


        this.cameras.main.fadeIn(1000);


        const backgroundStart = this.add.image(width / 2, height / 2, 'background-start');
        backgroundStart.setDisplaySize(width, height); // Масштабируем фон под размеры сцены
        // Кнопка Play

        const playButton = this.add.image(width / 2, height / 2 + 100, 'playButton').setInteractive();
        playButton.setScale(0.4);
        playButton.on('pointerdown', () => {

            // Переход к `GameScene` и запуск её музыки
            this.scene.start('GameScene', { score: 0, lives: 3, time: 60 });
        });

        const logo = this.add.image(width / 2, 80, 'logo').setInteractive();
        logo.setScale(1);
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
        this.remainingTime = 90;
    }

    preload() {
        this.load.image('background', './img/game-back-planet.png');
        this.load.image('paddle', './img/paddle-space.png');
        this.load.image('ball', './img/ball-fire.png');
        this.load.image('brickRed', './img/element_red_rectangle.png');
        this.load.image('brickYellow', './img/element_yellow_rectangle.png');
        this.load.image('brickGreen', './img/element_green_rectangle.png');
        this.load.image('borderLeft', './img/edge_left.png');
        this.load.image('borderRight', './img/edge_right.png');
        this.load.image('borderTop', './img/edge_top.png');
        this.load.image('enemyShip', './img/space-shooter.png');
        this.load.image('heart', './img/heart.png'); // Иконка жизни
        this.load.image('star', './img/star.png');   // Иконка очков
        this.load.audio('backgroundMusic', './audio/imperial-march.mp3');

        // Загрузка GIF-картинки взрыва
        this.load.image('explosion', './img/fireball_side_small_explode.gif');
    }

    create() {

        const { width, height } = this.cameras.main;


        const background = this.add.image(width / 2, height / 2, 'background');
        background.setDisplaySize(width, height);


        // Создание корабля
        this.enemyShip = this.physics.add.sprite(width / 2, 70, 'enemyShip');
        this.enemyShip.setCollideWorldBounds(true); // Позволяет объекту столкнуться с границами мира
        this.enemyShip.setBounce(1); // Обеспечивает отскок при столкновении с границей
        this.enemyShip.setVelocityX(200); // Задает начальную скорость вправо
        this.enemyHits = 0;

        // Фоновая музыка
        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.2
        });
        this.backgroundMusic.play();
        this.events.on('shutdown', () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
                console.log('Background music stopped in GameScene');
            }
        });

        // Левая граница: высота на всю длину камеры
        const borderLeft = this.add.image(0, height / 2, 'borderLeft')
            .setOrigin(0.5, 0.5);
        borderLeft.displayHeight = height;

        // Правая граница: высота на всю длину камеры
        const borderRight = this.add.image(width, height / 2, 'borderRight')
            .setOrigin(0.5, 0.5);
        borderRight.displayHeight = height;

        // Верхняя граница: ширина на всю длину камеры
        const borderTop = this.add.image(width / 2, 0, 'borderTop')
            .setOrigin(0.5, 0.5);
        borderTop.displayWidth = width;

        // Настройка размеров и позиции
        borderLeft.displayHeight = height;
        borderRight.displayHeight = height;
        borderTop.displayWidth = width;

        // Иконка звезды для очков
        this.starIcon = this.add.image(30, 30, 'star').setScale(0.8).setOrigin(0.5, 0.5);
        this.scoreText = this.add.text(50, 25, this.score, { fontSize: '16px', fill: '#FFF' });

        // Иконка сердечка для жизней
        this.heartIcon = this.add.image(290, 30, 'heart').setScale(0.8).setOrigin(0.5, 0.5);
        this.livesText = this.add.text(310, 25, this.lives, { fontSize: '16px', fill: '#FFF' });

        this.timerText = this.add.text(width / 2, 30, '01:30', {
            fontSize: '24px',
            fill: '#FFFF00',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // Таймер на 1 минуту
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Платформа
        this.paddle = this.physics.add.sprite(width / 2, height - 100, 'paddle').setImmovable();
        this.paddle.body.collideWorldBounds = true;

        // Мяч
        this.ball = this.physics.add.sprite(width / 2, this.paddle.y - 20, 'ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);
        this.ball.setData('onPaddle', true);
        this.ball.setDisplaySize(30, 30);


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
        this.physics.add.collider(this.ball, this.enemyShip, this.hitEnemy, null, this);

    }

    update() {

        if (this.enemyShip && this.enemyShip.body) {
            if (this.enemyShip.body.blocked.left || this.enemyShip.body.blocked.right) {
                this.enemyShip.setVelocityX(-this.enemyShip.body.velocity.x); // Инвертируем направление
            }
        }


        if (this.ball && Math.abs(this.ball.body.velocity.x) < 50 && this.ball.body.velocity.y !== 0) {
            this.ball.setVelocityX(200 * (Math.random() > 0.5 ? 1 : -1));
        }


        if (this.cursors.left.isDown) {
            this.paddle.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.paddle.setVelocityX(300);
        } else {
            this.paddle.setVelocityX(0);
        }

        if (this.ball && this.ball.y > this.sys.game.config.height) {
            this.loseLife();
        }
    }


    cleanUp() {
        if (this.enemyCollider) {
            this.physics.world.removeCollider(this.enemyCollider);
            this.enemyCollider = null;
        }
        if (this.enemyShip) {
            this.enemyShip.destroy();
            this.enemyShip = null;
        }
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic.destroy();
        }
    }
    updateTimer() {
        this.remainingTime--;
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        this.timerText.setText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

        if (this.remainingTime <= 0) {
            this.timer.remove(); // Останавливаем таймер
            this.endGame(false); // Завершаем игру как провал
        }
    }



    createBricks() {
        this.bricks = this.physics.add.staticGroup();

        const offsetX = 20; // Отступ слева и справа
        const offsetY = 130; // Отступ сверху
        const blockWidth = (350 - offsetX * 2) / 10; // Ширина блока с учётом отступов
        const blockHeight = 20; // Высота блока
        const rows = 1; // Количество рядов красных блоков
        const colors = ['brickYellow', 'brickRed']; // Цвета блоков
        const points = [10, 20]; // Очки за каждый цвет


        for (let col = 0; col < 10; col++) {
            const x = col * blockWidth + offsetX + blockWidth / 2;
            const y = offsetY - blockHeight; // Ряд выше красных блоков
            const brick = this.bricks.create(x, y, colors[0]).setOrigin(0.5, 0.5);
            brick.displayWidth = blockWidth; // Подгоняем ширину блока
            brick.displayHeight = blockHeight; // Подгоняем высоту блока
            brick.setData('points', points[0]); // Устанавливаем очки
        }


        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 10; col++) {
                const x = col * blockWidth + offsetX + blockWidth / 2;
                const y = row * blockHeight + offsetY;
                const brick = this.bricks.create(x, y, colors[1]).setOrigin(0.5, 0.5);
                brick.displayWidth = blockWidth; // Подгоняем ширину блока
                brick.displayHeight = blockHeight; // Подгоняем высоту блока
                brick.setData('points', points[1]); // Устанавливаем очки
            }
        }
    }

    createExplosion(x, y) {
        const explosion = this.add.image(x, y, 'explosion'); // Добавляем изображение взрыва
        explosion.setScale(0.6); // Масштабируем изображение

        // Удаляем взрыв через 500 мс
        this.time.delayedCall(500, () => {
            explosion.destroy();
        });
    }

    hitEnemy(ball, enemyShip) {
        if (!enemyShip.active) return;

        this.enemyHits += 1;

        if (this.enemyHits >= 2) {
            this.createExplosion(enemyShip.x, enemyShip.y);
            enemyShip.destroy();
            this.enemyShip = null;

            this.checkMissionCompletion();
        } else {
            const hitText = this.add.text(enemyShip.x, enemyShip.y - 20, `Hit: ${this.enemyHits}/2`, {
                fontSize: '14px',
                fill: '#FFFF00',
            }).setOrigin(0.5);
            this.time.delayedCall(500, () => hitText.destroy());
        }

        ball.setVelocityY(-Math.abs(ball.body.velocity.y));
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
        this.ball.y = this.paddle.y - 35;
    }

    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        this.score = Math.max(0, this.score - 20);
        this.livesText.setText(this.lives);
        this.scoreText.setText(this.score);

        const message = this.add.text(this.paddle.x + 80, this.paddle.y - 20, `-20`, {
            fontSize: '16px',
            fill: '#FF0000',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            message.destroy();
        });

        if (this.lives <= 0) {
            this.endGame(false); // Завершаем игру как провал
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
        this.scoreText.setText(this.score);

        // Отображение очков за сбитый блок
        const scoreText = this.add.text(brick.x + 20, brick.y, `+${points}`, {
            fontSize: '14px',
            fill: '#FFFF00',
        }).setOrigin(0.5);
        this.time.delayedCall(300, () => scoreText.destroy());

        // Анимация взрыва
        this.createExplosion(brick.x, brick.y);

        brick.destroy(); // Уничтожаем блок

        this.checkMissionCompletion();
    }




    endGame(isMissionSuccessful) {
        this.scene.start('EndScene', {
            score: this.score,
            missionStatus: isMissionSuccessful ? 'success' : 'failure',
        });
    }
    checkMissionCompletion() {
        if (this.bricks.countActive() === 0 && !this.enemyShip) {
            this.timer.remove(); // Останавливаем таймер
            this.endGame(true); // Завершаем игру с успехом
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
        this.missionStatus = data.missionStatus; // Получаем статус миссии
    }

    preload() {
        this.load.image('background-end', './img/background.png');
        this.load.image('restart-btn', './img/restart-btn.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        const backgroundEnd = this.add.image(width / 2, height / 2, 'background-end');
        backgroundEnd.setDisplaySize(width, height);

        const missionText = this.missionStatus === 'success'
            ? 'Миссия выполнена! Поздравляю, враг отступил!'
            : 'Миссия провалена! Ваша планета осталась беззащитна';
        const missionColor = this.missionStatus === 'success' ? '#FFFF00' : '#FF0000';

        this.add.text(width / 2, 200, missionText, {
            fontFamily: 'Rubik',
            fontSize: '20px',
            fill: missionColor,
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);

        if (this.missionStatus === 'success') {
            this.add.text(width / 2, height / 2, `Счёт: ${this.finalScore}`, {
                fontFamily: 'Rubik',
                fontSize: '32px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center',
            }).setOrigin(0.5);
        }

        const playRestart = this.add.image(width / 2, height / 2 + 150, 'restart-btn').setInteractive();
        playRestart.setScale(0.4);

        playRestart.on('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }

}


// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    parent: 'game-container', // Контейнер для игры
    width: 350,
    height: 600,
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



document.fonts.load('16px Rubik').then(() => {
    const game = new Phaser.Game(config);
}).catch((error) => {
    console.error('Ошибка при загрузке шрифта:', error);
    const game = new Phaser.Game(config);
});
const game = new Phaser.Game(config);

