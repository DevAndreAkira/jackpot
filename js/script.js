// & Execução

const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

app.renderer.resize(window.innerWidth, window.innerHeight);

let volMusic = localStorage.getItem("volume") ? (localStorage.getItem("volume") / 50) : .1;

let soundTrack, countTitle, musicText;
let seActive = true;
let itensMenu = [];
let preloadeCount = 0;

//^ Preloader  

const containerLoading = new PIXI.Container();
app.stage.addChild(containerLoading);

const soundAsset = [
    "./sound/jazz_sample.mp3",
    "./sound/click.wav",
    "./sound/Coin.ogg"
];

app.loader.baseUrul = "img";
const imgsAsset = [
    "./img/favicon/android-chrome-192x192.png",
    "./img/favicon/android-chrome-384x384.png",
    "./img/favicon/apple-touch-icon.png",
    "./img/favicon/favicon-16x16.png",
    "./img/favicon/favicon-32x32.png",
    "./img/favicon/mstile-150x150.png",
    "./img/slot-machine_fhrtsl.png",
    "./img/body_btvubu1.png"
];

app.loader
    .add(soundAsset)
    .add(imgsAsset)
    .load(gameTitle);

app.loader.onProgress.add(showProgress);
app.loader.onComplete.add(doneLoading);
app.loader.onError.add(reportError);

app.loader.load()

createMusic(soundAsset[0], volMusic, true);

// & Execução

// * Funções

function showProgress(e) {
    if (preloadeCount === 0) {
        createText("Loading...", 0xffffff, app.screen.width / 2, app.screen.height / 2, false, containerLoading);
        preloadeCount = true;
    }
    console.log(e.progress)
}

function reportError(e) {
    console.error("Error: " + e.message);
}

function doneLoading(e) {
    console.log("Loading is done!");
    containerLoading.destroy();
}

function gameTitle() {
    countTitle = 0;
    const containerTitle = new PIXI.Container();
    app.stage.addChild(containerTitle);

    createText("Start game", '#ffffff', (app.screen.width / 2), (app.screen.height / 2) - 50, true, containerTitle, startGame, true);
    createText("Options", '#ffffff', (app.screen.width / 2), (app.screen.height / 2), true, containerTitle, optionsGame, true);
    createText("Exit", '#ffffff', (app.screen.width / 2), (app.screen.height / 2) + 50, true, containerTitle, exitGame, true);
}

function createEffect(caminho, vol) {
    const soundCard = PIXI.sound.Sound.from(caminho);
    soundCard.volume = vol;
    soundCard.play();
}

function createMusic(caminho, vol, looping) {
    soundTrack = PIXI.sound.Sound.from(caminho);
    soundTrack.volume = vol;
    soundTrack.loop = looping;
    soundTrack.play();
}

function createText(valor, cor, alignX, alignY, interativo, container, funcLink, destroyer) {
    const basicText = new PIXI.Text(valor, {
        fill: cor
    });
    basicText.anchor.set(.5);
    basicText.x = alignX;
    basicText.y = alignY;
    if (interativo === true) {
        basicText.interactive = true;
        basicText.cursor = 'pointer';
        basicText.on('pointerdown', () => {
            seActive ? createEffect(soundAsset[1], .1) : '';
            // if (seActive) {
            //     createEffect(soundAsset[1], .1);
            // }
            if (destroyer === true) {
                container.destroy();
            }
            funcLink();
        })
    }
    container.addChild(basicText);
    countTitle = countTitle + 1;
}

function startGame() {
    const containerstart = new PIXI.Container();
    app.stage.addChild(containerstart);

    let coins = 10;

    var IMG_MACHINE = imgsAsset[6];
    var IMG_BODY = imgsAsset[7];

    var STATE_ZERO = 0;
    var STATE_INIT = 1;
    var STATE_MOVING = 2;
    var STATE_CHECK_WIN = 3;

    var SLOT_NUMBER = 3;
    var INITIAL_X = app.screen.width / 2 - (115);
    var TILE_HEIGHT = 100;
    var TILE_WIDTH = TILE_HEIGHT;
    var N_CYCLE = 5;
    var TOT_TILES = 7;
    var gameStatus = 0;
    var finalTileY = [];
    var slotSprite = [];
    var preChoosedPosition = [];

    var renderer = PIXI.autoDetectRenderer(
        window.innerWidth, window.innerHeight,
        { antialiasing: false, transparent: false, resolution: 1 }
    );

    var loader = [
        IMG_MACHINE,
        IMG_BODY
    ];

    const coinsText = new PIXI.Text(`Coins: ${coins}`, {
        fill: 0xffffff
    });
    coinsText.anchor.set(.5);
    coinsText.x = (app.screen.width / 2);
    coinsText.y = (app.screen.height / 2 - 275);
    containerstart.addChild(coinsText);

    createText("Back", '#ffffff', (app.screen.width / 2), (app.screen.height / 2 + 225), true, containerstart, voltar, true);

    setup();

    function setup() {
        bodySlot = new PIXI.Sprite.from(loader[0]);

        bodySprite = new PIXI.Sprite.from(loader[1]);
        bodySprite.anchor.set(0.5);
        bodySprite.x = app.screen.width / 2 + 2;
        bodySprite.y = app.screen.height / 2 - 70;
        containerstart.addChild(bodySprite);

        const spinButton = new PIXI.Text("Press Enter\nor click here", {
            fill: 0xffffff,
            align: 'center'
        });

        // Execute a function when the user presses a key on the keyboard
        document.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                coins = coins - 1;
                coinsText.text = `Coins: ${coins}`;
                startAnimation();
            }
        });

        spinButton.anchor.set(.5);
        spinButton.x = app.screen.width / 2;
        spinButton.y = (app.screen.height / 2) + 150;
        spinButton.interactive = true;
        spinButton.cursor = 'pointer';
        containerstart.addChild(spinButton);

        spinButton.on("pointerdown", () => {
            coins = coins - 1;
            coinsText.text = `Coins: ${coins}`;
            startAnimation();
        })

        texture1 = PIXI.utils.TextureCache[loader[0]];
        preChoosedPosition = [1, 2, 3];
        for (var i = 0; i < SLOT_NUMBER; i++) {
            slotSprite[i] = new PIXI.TilingSprite(texture1, TILE_WIDTH, TILE_HEIGHT + 20);
            slotSprite[i].anchor.set(.5);
            slotSprite[i].tilePosition.x = 0;
            slotSprite[i].tilePosition.y = (-preChoosedPosition[i] * TILE_HEIGHT) + 10;
            slotSprite[i].x = INITIAL_X + (i * 115);
            slotSprite[i].y = app.screen.height / 2;
            containerstart.addChild(slotSprite[i]);
        }
        draw();
    }

    //functions draw
    function draw() {
        var INC = [15, 20, 25];
        console.info("draw(" + gameStatus + ")");
        if (gameStatus == STATE_ZERO) {
            gameStatus = STATE_INIT;
        } else
            if (gameStatus == STATE_INIT) {
                gameStatus = STATE_CHECK_WIN;

            } else if (gameStatus == STATE_MOVING) {
                console.log("moving");

                for (var i = 0; i < SLOT_NUMBER; i++) {
                    if (finalTileY[i] > 0) {
                        slotSprite[i].tilePosition.y = slotSprite[i].tilePosition.y + INC[i];
                        finalTileY[i] = finalTileY[i] - INC[i];
                    }
                }

                if (finalTileY[0] - 5 <= 0) {
                    gameStatus = STATE_CHECK_WIN;
                }
            } else if (gameStatus == STATE_CHECK_WIN) {
                console.log("checking win");
                var test = true;
                for (var i = 1; i < SLOT_NUMBER; i++) {
                    if (preChoosedPosition[i] != preChoosedPosition[i - 1]) {
                        test = false;
                    }
                }
                if (test) {
                    // alert("Congratulations, you won!");
                }
                return;
            }

        var INC = [15, 20, 25];

        //functions draw
        function draw() {
            if (gameStatus == STATE_ZERO) {
                gameStatus = STATE_INIT;
            } else
                if (gameStatus == STATE_INIT) {
                    console.log("waiting start");
                    gameStatus = STATE_CHECK_WIN;
                } else if (gameStatus == STATE_MOVING) {
                    console.log("moving");
                    for (var i = 0; i < SLOT_NUMBER; i++) {
                        if (finalTileY[i] > 0) {
                            slotSprite[i].tilePosition.y = slotSprite[i].tilePosition.y + INC[i];
                            finalTileY[i] = finalTileY[i] - INC[i];
                        }
                    }
                    if (finalTileY[0] - 5 <= 0) {
                        gameStatus = STATE_CHECK_WIN;
                    }
                } else if (gameStatus == STATE_CHECK_WIN) {
                    console.log("checking win");
                    var test = true;
                    for (var i = 1; i < SLOT_NUMBER; i++) {
                        if (preChoosedPosition[i] != preChoosedPosition[i - 1]) {
                            test = false;
                        }
                    }
                    if (test) {
                        seActive ? createEffect(soundAsset[2], .1) : '';
                        // alert("Congratulations, you won!"); 
                        coins = coins + 10;
                    }
                    return coinsText.text = `Coins: ${coins}`;;
                }
            renderer.render(containerstart);
            requestAnimationFrame(draw);
        }
        renderer.render(containerstart);
        requestAnimationFrame(draw);
    }
    //draw

    function startAnimation() {

        if (gameStatus == STATE_INIT || gameStatus == STATE_CHECK_WIN) {
            preChoosedPosition = getRandomPositions();
            for (var i = 0; i < SLOT_NUMBER; i++) {
                slotSprite[i].tilePosition.y = (-preChoosedPosition[i] * TILE_HEIGHT) + 10;
                finalTileY[i] = (N_CYCLE * TILE_HEIGHT * TOT_TILES);
            }
            gameStatus = STATE_MOVING;
            draw();
        }
        console.log(coins);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomPositions() {
        var x = getRandomInt(0, 80);
        if (x > 50) {
            x = getRandomInt(0, 6);
            return [x, x, x];
        }
        return [getRandomInt(0, 6), getRandomInt(0, 6), getRandomInt(0, 6)];
    }

}

function optionsGame() {
    const containerOptions = new PIXI.Container();
    app.stage.addChild(containerOptions);

    createText("Sound music", '#ffffff', (app.screen.width / 2) - 100, (app.screen.height / 2) - 50, true, containerOptions);
    createText("←", '#ffffff', (app.screen.width / 2) + 50, (app.screen.height / 2) - 50, true, containerOptions, diminuiMusic);
    createText("→", '#ffffff', (app.screen.width / 2) + 150, (app.screen.height / 2) - 50, true, containerOptions, aumentoMusic);

    createText("Sound effect", '#ffffff', (app.screen.width / 2) - 100, (app.screen.height / 2), true, containerOptions);
    createText("Off", '#ffffff', (app.screen.width / 2) + 75, (app.screen.height / 2), true, containerOptions, hiddenEffect);
    createText("On", '#ffffff', (app.screen.width / 2) + 125, (app.screen.height / 2), true, containerOptions, showEffect);

    musicText = new PIXI.Text(calculoSoundMusic(), {
        fill: 0xffffff
    });
    musicText.anchor.set(.5);
    musicText.x = (app.screen.width / 2) + 100;
    musicText.y = (app.screen.height / 2) - 50;
    containerOptions.addChild(musicText);

    createText("Back", '#ffffff', (app.screen.width / 2), (app.screen.height / 2) + 100, true, containerOptions, voltar, true);
}

function hiddenEffect() {
    seActive = false;
}

function showEffect() {
    seActive = true;
}

function calculoSoundMusic() {
    return Math.round(volMusic * 50)
}

function aumentoMusic() {
    if (calculoSoundMusic(volMusic) === 10) {
        console.log('%cLimite', 'background: red');
    }
    else {
        volMusic = volMusic + .02;
        soundTrack.pause();
        soundTrack._volume = volMusic;
        soundTrack.resume();
        musicText.text = calculoSoundMusic(volMusic)
        console.log("Aumento: " + calculoSoundMusic(volMusic));
        localStorage.setItem("volume", calculoSoundMusic(volMusic))
    }
}

function diminuiMusic() {
    if (volMusic < 0) {
        console.log('%cMudo', 'background: red');
    }
    else {
        volMusic = volMusic - .02;
        soundTrack.pause();
        soundTrack._volume = volMusic;
        soundTrack.resume();
        musicText.text = calculoSoundMusic(volMusic);
        console.log("Diminui: " + calculoSoundMusic(volMusic));
        localStorage.setItem("volume", calculoSoundMusic(volMusic))
    }
}

function voltar() {
    gameTitle();
}

function exitGame() {
    window.close();
}

// * Funções
