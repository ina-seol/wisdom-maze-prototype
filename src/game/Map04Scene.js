import Phaser from "phaser";

import {
  getMapContent,
  newMapState,
  loadMapProgress,
  saveMapProgress,
  saveRecord,
  saveProfile,
  getNextMapId,
  setCurrentMap
} from "../data.js";


const MAP_ID = "MAP04";


export default class Map04Scene extends Phaser.Scene {

  constructor() {

    super(
      MAP_ID
    );

  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map04_background",
      `${base}assets/maps/map04.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {

      this.load.image(
        "map04_front",
        sprites.front
      );

    }


    if (sprites?.back) {

      this.load.image(
        "map04_back",
        sprites.back
      );

    }


    if (sprites?.left) {

      this.load.image(
        "map04_left",
        sprites.left
      );

    }


    if (sprites?.right) {

      this.load.image(
        "map04_right",
        sprites.right
      );

    }

  }


  create() {

    this.profile =
      window.WISDOM_PROFILE;


    this.content =
      getMapContent(
        MAP_ID
      );


    this.state =
      loadMapProgress(
        MAP_ID,
        this.profile.name
      )
      ||
      newMapState(
        MAP_ID
      );


    this.prepareState();


    this.inputLocked =
      true;


    this.interactionRunning =
      false;


    this.lockStartedAt =
      Date.now();


    this.interactables =
      [];


    this.add.image(
      384,
      288,
      "map04_background"
    )
      .setDisplaySize(
        768,
        576
      )
      .setDepth(
        -100
      );


    this.physics.world.setBounds(
      0,
      0,
      768,
      576
    );


    this.createInteractables();

    this.createGuide();

    this.createPlayer();

    this.createInput();

    this.updateHUD();


    this.time.delayedCall(
      250,
      async () => {

        try {

          if (
            !this.state.introDone
          ) {

            await this.playIntro();

          }

        }

        catch (
          error
        ) {

          console.error(
            "MAP04 intro error:",
            error
          );

        }

        finally {

          this.forceUnlock();

        }

      }
    );

  }


  prepareState() {

    const validPhases = [

      "fountain",
      "observatory",
      "library",
      "time_circle",
      "crystal",
      "exit"

    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
      &&
      !this.state.completed
    ) {

      this.state.phase =
        "fountain";

    }


    this.state.introDone ??=
      false;


    this.state.shards ??=
      0;


    this.state.questionsShown ??=
      0;


    this.state.firstTryCorrect ??=
      0;


    this.state.wrongAttempts ??=
      0;


    this.state.hintsUsed ??=
      0;


    this.state.mistakes ??=
      {};


    this.state.usedWords ??=
      [];


    this.state.usedExpressions ??=
      [];


    this.state.completed ??=
      false;


    this.state.sessionStartedAt ??=
      Date.now();

  }


  lockInput() {

    this.inputLocked =
      true;


    this.interactionRunning =
      true;


    this.lockStartedAt =
      Date.now();


    if (
      this.player?.body
    ) {

      this.player.body.setVelocity(
        0,
        0
      );

    }


    this.prompt
      ?.setVisible(
        false
      );

  }


  forceUnlock() {

    this.inputLocked =
      false;


    this.interactionRunning =
      false;


    this.lockStartedAt =
      0;


    if (
      this.input?.keyboard
    ) {

      this.input.keyboard.enabled =
        true;

    }


    if (
      this.player?.body
    ) {

      this.player.body.enable =
        true;


      this.player.body.setVelocity(
        0,
        0
      );

    }

  }


  recoverStuckInput() {

    if (
      !this.inputLocked
    ) {

      return;

    }


    const modal =
      document.querySelector(
        "#modal"
      );


    const modalVisible =
      Boolean(
        modal
        &&
        !modal.classList.contains(
          "hidden"
        )
      );


    if (
      modalVisible
    ) {

      return;

    }


    if (
      !this.lockStartedAt
    ) {

      return;

    }


    if (
      Date.now()
      -
      this.lockStartedAt
      <
      200
    ) {

      return;

    }


    console.warn(
      "MAP04 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "fountain",

        label:
          "푸른 수정 분수",

        x:
          385,

        y:
          310,

        radius:
          80
      },


      {
        id:
          "observatory",

        label:
          "고대 관측소",

        x:
          145,

        y:
          160,

        radius:
          85
      },


      {
        id:
          "library",

        label:
          "푸른 서고",

        x:
          650,

        y:
          160,

        radius:
          85
      },


      {
        id:
          "time_circle",

        label:
          "시간 마법진",

        x:
          385,

        y:
          465,

        radius:
          88
      },


      {
        id:
          "crystal",

        label:
          "시간 수정",

        x:
          625,

        y:
          490,

        radius:
          88
      },


      {
        id:
          "exit",

        label:
          "고대 사원 문",

        x:
          385,

        y:
          140,

        radius:
          95
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        385,
        310,
        20,
        0x6adfff,
        0.2
      )
        .setStrokeStyle(
          4,
          0xdcfbff,
          1
        )
        .setDepth(
          50
        );


    this.tweens.add({

      targets:
        this.guide,

      alpha: {
        from:
          0.25,

        to:
          1
      },

      duration:
        650,

      yoyo:
        true,

      repeat:
        -1

    });


    this.prompt =
      this.add.text(
        384,
        535,
        "",
        {

          fontFamily:
            "Arial",

          fontSize:
            "16px",

          fontStyle:
            "bold",

          color:
            "#ffffff",

          backgroundColor:
            "#102a2edd",

          padding: {

            x:
              10,

            y:
              6

          }

        }
      )
        .setOrigin(
          0.5
        )
        .setDepth(
          500
        )
        .setVisible(
          false
        );


    this.updateGuide();

  }


  updateGuide() {

    const points = {

      fountain:
        [385, 310],

      observatory:
        [145, 160],

      library:
        [650, 160],

      time_circle:
        [385, 465],

      crystal:
        [625, 490],

      exit:
        [385, 140]

    };


    const point =
      points[
        this.state.phase
      ];


    if (
      !point
    ) {

      this.guide
        ?.setVisible(
          false
        );


      return;

    }


    this.guide
      ?.setVisible(
        true
      )
      .setPosition(
        point[0],
        point[1]
      );

  }


  createPlayer() {

    if (
      this.textures.exists(
        "map04_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map04_front"
        );


      const targetHeight =
        64;


      const ratio =
        this.player.width /
        this.player.height;


      this.player.setDisplaySize(
        targetHeight * ratio,
        targetHeight
      );

    }

    else {

      this.player =
        this.add.rectangle(
          384,
          525,
          26,
          40,
          0x386ed0
        );


      this.physics.add.existing(
        this.player
      );

    }


    this.player.setDepth(
      100
    );


    this.player.body.setSize(
      20,
      20
    );


    this.player.body.setCollideWorldBounds(
      true
    );

  }


  createInput() {

    this.cursors =
      this.input.keyboard
        .createCursorKeys();


    this.keys =
      this.input.keyboard.addKeys({

        up:
          "W",

        down:
          "S",

        left:
          "A",

        right:
          "D",

        interact:
          "E",

        enter:
          "ENTER"

      });

  }


  update() {

    if (
      !this.player?.body
    ) {

      return;

    }


    this.recoverStuckInput();


    const touch =
      window.WisdomTouchInput
      ||
      {

        up: false,
        down: false,
        left: false,
        right: false,
        interactPressed: false

      };


    if (
      this.inputLocked
    ) {

      this.player.body.setVelocity(
        0,
        0
      );


      this.prompt
        ?.setVisible(
          false
        );


      if (
        window.WisdomTouchInput
      ) {

        window.WisdomTouchInput.interactPressed =
          false;

      }


      return;

    }


    const speed =
      145;


    let vx =
      0;


    let vy =
      0;


    if (
      this.cursors.left.isDown
      ||
      this.keys.left.isDown
      ||
      touch.left
    ) {

      vx =
        -speed;

    }

    else if (
      this.cursors.right.isDown
      ||
      this.keys.right.isDown
      ||
      touch.right
    ) {

      vx =
        speed;

    }


    if (
      this.cursors.up.isDown
      ||
      this.keys.up.isDown
      ||
      touch.up
    ) {

      vy =
        -speed;

    }

    else if (
      this.cursors.down.isDown
      ||
      this.keys.down.isDown
      ||
      touch.down
    ) {

      vy =
        speed;

    }


    if (
      vx !== 0
      &&
      vy !== 0
    ) {

      vx *=
        0.707;


      vy *=
        0.707;

    }


    this.player.body.setVelocity(
      vx,
      vy
    );


    this.updateDirection(
      vx,
      vy
    );


    this.updatePrompt();


    const keyboardInteract =
      Phaser.Input.Keyboard.JustDown(
        this.keys.interact
      )
      ||
      Phaser.Input.Keyboard.JustDown(
        this.keys.enter
      );


    const touchInteract =
      Boolean(
        touch.interactPressed
      );


    if (
      touchInteract
      &&
      window.WisdomTouchInput
    ) {

      window.WisdomTouchInput.interactPressed =
        false;

    }


    if (
      keyboardInteract
      ||
      touchInteract
    ) {

      this.interact();

    }

  }


  updateDirection(
    vx,
    vy
  ) {

    if (
      Math.abs(
        vx
      )
      >
      Math.abs(
        vy
      )
    ) {

      if (
        vx < 0
        &&
        this.textures.exists(
          "map04_left"
        )
      ) {

        this.player.setTexture(
          "map04_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map04_right"
        )
      ) {

        this.player.setTexture(
          "map04_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map04_back"
      )
    ) {

      this.player.setTexture(
        "map04_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map04_front"
      )
    ) {

      this.player.setTexture(
        "map04_front"
      );

    }

  }


  nearestObject() {

    let nearest =
      null;


    let shortest =
      Infinity;


    for (
      const object of
      this.interactables
    ) {

      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          object.x,
          object.y
        );


      if (
        distance <=
          object.radius
        &&
        distance <
          shortest
      ) {

        nearest =
          object;


        shortest =
          distance;

      }

    }


    return nearest;

  }


  updatePrompt() {

    const object =
      this.nearestObject();


    if (
      !object
    ) {

      this.prompt
        ?.setVisible(
          false
        );


      return;

    }


    this.prompt
      ?.setText(
        `[E] ${object.label} 조사`
      )
      .setVisible(
        true
      );

  }


  async interact() {

    if (
      this.inputLocked
      ||
      this.interactionRunning
    ) {

      return;

    }


    const object =
      this.nearestObject();


    if (
      !object
    ) {

      return;

    }


    this.lockInput();


    try {

      switch (
        object.id
      ) {

        case "fountain":

          await this.handleFountain();

          break;


        case "observatory":

          await this.handleObservatory();

          break;


        case "library":

          await this.handleLibrary();

          break;


        case "time_circle":

          await this.handleTimeCircle();

          break;


        case "crystal":

          await this.handleCrystal();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (
      error
    ) {

      console.error(
        "MAP04 interaction error:",
        error
      );

    }

    finally {

      this.forceUnlock();

      this.updateGuide();

    }

  }


  async playIntro() {

    await GameUI.say([

      "안개 낀 마을을 지나자 오래된 고대 유적이 나타났다.",

      "거대한 사원과 수정 장치들이 멈춰 있었다.",

      "나: 이곳은 시간이 멈춘 것 같아.",

      "루미: 맞아. 네 번째 언어 수정 때문에 이 유적의 시간이 뒤틀렸어.",

      "루미: 먼저 중앙의 푸른 수정 분수를 조사하자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "fountain";


    this.save();

  }


  async handleFountain() {

    if (
      this.state.phase !==
      "fountain"
    ) {

      await this.showHint();

      return;

    }


    const quiz =
      QuizEngine.wordToKorean(
        this.content.words,
        this.state.usedWords
      );


    if (
      !quiz
    ) {

      await GameUI.say(
        "루미: MAP04 단어 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !correct
    ) {

      this.markWrong(
        "fountain"
      );


      await GameUI.say(
        "루미: 수정 분수가 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "fountain"
    );


    this.state.shards =
      1;


    this.state.phase =
      "observatory";


    this.save();


    await GameUI.say([

      "푸른 수정 분수에서 빛이 솟아올랐다.",

      "루미: 첫 번째 말의 조각이야!",

      "루미: 왼쪽 위의 고대 관측소가 움직이기 시작했어. 그곳으로 가자!"

    ]);

  }


  async handleObservatory() {

    if (
      this.state.phase !==
      "observatory"
    ) {

      await this.showHint();

      return;

    }


    const quiz =
      QuizEngine.koreanToWord(
        this.content.words,
        this.state.usedWords
      );


    if (
      !quiz
    ) {

      await GameUI.say(
        "루미: MAP04 단어 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !correct
    ) {

      this.markWrong(
        "observatory"
      );


      await GameUI.say(
        "루미: 관측 장치가 멈췄어. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "observatory"
    );


    this.state.phase =
      "library";


    this.save();


    await GameUI.say([

      "고대 관측 장치가 천천히 회전하기 시작했다.",

      "나: 오른쪽 위 서고에도 빛이 들어왔어.",

      "루미: 좋아. 이제 푸른 서고로 가자!"

    ]);

  }


  async handleLibrary() {

    if (
      this.state.phase !==
      "library"
    ) {

      await this.showHint();

      return;

    }


    const quiz =
      QuizEngine.expressionToKorean(
        this.content.expressions,
        this.state.usedExpressions
      );


    if (
      !quiz
    ) {

      await GameUI.say(
        "루미: MAP04 영어 표현 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !correct
    ) {

      this.markWrong(
        "library"
      );


      await GameUI.say(
        "루미: 고대 기록이 아직 읽히지 않아. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "library"
    );


    this.state.shards =
      2;


    this.state.phase =
      "time_circle";


    this.save();


    await GameUI.say([

      "서고의 오래된 기록들이 푸른빛으로 떠올랐다.",

      "루미: 두 번째 말의 조각이야!",

      "루미: 이제 아래쪽 중앙의 시간 마법진으로 가자!"

    ]);

  }


  async handleTimeCircle() {

    if (
      this.state.phase !==
      "time_circle"
    ) {

      await this.showHint();

      return;

    }


    const expression =
      QuizEngine.pickExpression(
        this.content.expressions,
        this.state.usedExpressions
      );


    if (
      !expression
    ) {

      await GameUI.say(
        "루미: MAP04 문장 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    await GameUI.say(
      `루미: "${expression.korean}"라는 뜻이 되도록 영어 문장을 만들어 봐!`
    );


    const correct =
      await GameUI.wordOrder(
        expression.english
      );


    if (
      !correct
    ) {

      this.markWrong(
        "time_circle"
      );


      await GameUI.say(
        "루미: 시간 마법진이 다시 멈췄어. 문장 순서를 다시 맞춰 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "time_circle"
    );


    this.state.phase =
      "crystal";


    this.save();


    await GameUI.say([

      "시간 마법진의 룬이 순서대로 빛났다.",

      "유적 전체의 시간이 다시 흐르기 시작했다.",

      "나: 오른쪽 아래 수정 동굴도 빛나고 있어.",

      "루미: 마지막 시간 수정으로 가자!"

    ]);

  }


  async handleCrystal() {

    if (
      this.state.phase !==
      "crystal"
    ) {

      await this.showHint();

      return;

    }


    const quiz =
      QuizEngine.randomReview(
        this.content,
        this.state.usedWords,
        this.state.usedExpressions
      );


    if (
      !quiz
    ) {

      await GameUI.say(
        "루미: 마지막 문제를 만들 MAP04 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !correct
    ) {

      this.markWrong(
        "crystal"
      );


      await GameUI.say(
        "루미: 수정의 빛이 약해졌어. 마지막 문제를 다시 풀어 보자!"
      );


      return;

    }


    this.markCorrect(
      "crystal"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "시간 수정이 강렬한 푸른빛을 내뿜었다.",

      "세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 찾았어!",

      "루미: 좋아! 가운데 위쪽의 큰 고대 사원 문이 열렸어.",

      "루미: 고대 사원 문으로 가자!"

    ]);

  }


  async handleExit() {

    if (
      this.state.phase !==
      "exit"
    ) {

      await this.showHint();

      return;

    }


    await this.completeMap();

  }


  async showHint() {

    this.state.hintsUsed++;


    this.save();


    const hints = {

      fountain:
        "루미: 중앙의 푸른 수정 분수를 조사해 봐!",

      observatory:
        "루미: 왼쪽 위의 고대 관측소로 가자!",

      library:
        "루미: 오른쪽 위의 푸른 서고로 가자!",

      time_circle:
        "루미: 아래쪽 중앙의 시간 마법진을 조사해 봐!",

      crystal:
        "루미: 오른쪽 아래의 빛나는 시간 수정으로 가자!",

      exit:
        "루미: 가운데 위쪽의 큰 고대 사원 문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 유적에서 빛나는 장치를 따라가자!"
    );

  }


  rememberWord(
    english
  ) {

    if (
      !english
    ) {

      return;

    }


    if (
      !this.state.usedWords.includes(
        english
      )
    ) {

      this.state.usedWords.push(
        english
      );

    }

  }


  rememberExpression(
    english
  ) {

    if (
      !english
    ) {

      return;

    }


    if (
      !this.state.usedExpressions.includes(
        english
      )
    ) {

      this.state.usedExpressions.push(
        english
      );

    }

  }


  markCorrect(
    id
  ) {

    if (
      !this.state.mistakes[id]
    ) {

      this.state.firstTryCorrect++;

    }

  }


  markWrong(
    id
  ) {

    this.state.wrongAttempts++;


    this.state.mistakes[id] =
      (
        this.state.mistakes[id]
        ||
        0
      )
      +
      1;


    this.save();

  }


  async completeMap() {

    if (
      this.state.completed
    ) {

      return;

    }


    this.state.completed =
      true;


    const seconds =
      Math.max(
        1,
        Math.floor(
          (
            Date.now()
            -
            this.state.sessionStartedAt
          )
          /
          1000
        )
      );


    this.save();


    saveRecord({

      mapId:
        MAP_ID,

      studentName:
        this.profile.name,

      character:
        this.profile.gender,

      completed:
        true,

      playTime:
        seconds,

      questionsShown:
        this.state.questionsShown,

      firstTryCorrect:
        this.state.firstTryCorrect,

      wrongAttempts:
        this.state.wrongAttempts,

      hintsUsed:
        this.state.hintsUsed,

      completedAt:
        new Date()
          .toISOString()

    });


    const nextMap =
      getNextMapId(
        MAP_ID
      );


    if (
      nextMap
    ) {

      setCurrentMap(
        nextMap
      );


      this.profile.currentMap =
        nextMap;


      saveProfile(
        this.profile
      );

    }


    await GameUI.say([

      "유적 전체를 뒤덮고 있던 시간의 왜곡이 사라졌다.",

      "네 번째 언어 수정이 원래의 빛을 되찾았다.",

      "루미: 좋아! 네 번째 미로도 해결했어!",

      nextMap
        ? `루미: 다음 목적지는 ${nextMap}이야!`
        : "루미: 모든 모험이 끝났어!"

    ]);


    if (
      nextMap
      &&
      window.WisdomGame
        ?.hasMap(
          nextMap
        )
    ) {

      window.WisdomGame.startMap(
        nextMap
      );


      return;

    }


    await GameUI.finish({

      mapId:
        MAP_ID,

      name:
        this.profile.name,

      seconds,

      firstTry:
        this.state.firstTryCorrect,

      wrong:
        this.state.wrongAttempts

    });

  }


  save() {

    saveMapProgress(
      MAP_ID,
      this.profile.name,
      this.state
    );


    this.updateHUD();

    this.updateGuide();

  }


  updateHUD() {

    const shards =
      document.querySelector(
        "#hud-shards"
      );


    if (
      shards
    ) {

      shards.textContent = [

        this.state.shards >= 1
          ? "◆"
          : "◇",

        this.state.shards >= 2
          ? "◆"
          : "◇",

        this.state.shards >= 3
          ? "◆"
          : "◇"

      ].join(
        " "
      );

    }


    const objective =
      document.querySelector(
        "#hud-objective"
      );


    if (
      !objective
    ) {

      return;

    }


    const objectives = {

      fountain:
        "중앙의 푸른 수정 분수를 활성화하자.",

      observatory:
        "왼쪽 위 고대 관측소를 복구하자.",

      library:
        "오른쪽 위 푸른 서고의 기록을 복원하자.",

      time_circle:
        "아래쪽 중앙의 시간 마법진을 복구하자.",

      crystal:
        "오른쪽 아래의 시간 수정을 복원하자.",

      exit:
        "가운데 위쪽의 큰 고대 사원 문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "시간이 뒤틀린 고대 유적을 복원하자.";

  }

}
