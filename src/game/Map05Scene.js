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


const MAP_ID = "MAP05";


export default class Map05Scene extends Phaser.Scene {

  constructor() {

    super(
      MAP_ID
    );

  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map05_background",
      `${base}assets/maps/map05.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (
      sprites?.front
    ) {

      this.load.image(
        "map05_front",
        sprites.front
      );

    }


    if (
      sprites?.back
    ) {

      this.load.image(
        "map05_back",
        sprites.back
      );

    }


    if (
      sprites?.left
    ) {

      this.load.image(
        "map05_left",
        sprites.left
      );

    }


    if (
      sprites?.right
    ) {

      this.load.image(
        "map05_right",
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
      "map05_background"
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
            "MAP05 intro error:",
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
      "dock",
      "altar",
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
      "MAP05 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "fountain",

        label:
          "별빛 분수",

        x:
          384,

        y:
          305,

        radius:
          82
      },


      {
        id:
          "observatory",

        label:
          "천체 관측대",

        x:
          135,

        y:
          160,

        radius:
          85
      },


      {
        id:
          "library",

        label:
          "공중 서고",

        x:
          645,

        y:
          165,

        radius:
          85
      },


      {
        id:
          "dock",

        label:
          "하늘 선착장",

        x:
          384,

        y:
          460,

        radius:
          90
      },


      {
        id:
          "altar",

        label:
          "별 수정 제단",

        x:
          640,

        y:
          355,

        radius:
          90
      },


      {
        id:
          "exit",

        label:
          "별빛 성문",

        x:
          384,

        y:
          120,

        radius:
          95
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        384,
        305,
        20,
        0x91d8ff,
        0.2
      )
        .setStrokeStyle(
          4,
          0xf1fbff,
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
            "#15234ddd",

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
        [384, 305],

      observatory:
        [135, 160],

      library:
        [645, 165],

      dock:
        [384, 460],

      altar:
        [640, 355],

      exit:
        [384, 120]

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
        "map05_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map05_front"
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
          "map05_left"
        )
      ) {

        this.player.setTexture(
          "map05_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map05_right"
        )
      ) {

        this.player.setTexture(
          "map05_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map05_back"
      )
    ) {

      this.player.setTexture(
        "map05_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map05_front"
      )
    ) {

      this.player.setTexture(
        "map05_front"
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


        case "dock":

          await this.handleDock();

          break;


        case "altar":

          await this.handleAltar();

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
        "MAP05 interaction error:",
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

      "고대 사원의 문을 지나자 눈앞에 끝없는 구름바다가 펼쳐졌다.",

      "하늘 위에는 별빛으로 빛나는 도시가 떠 있었다.",

      "나: 도시가 하늘에 떠 있어!",

      "루미: 다섯 번째 언어 수정의 힘으로 만들어진 별빛 공중도시야.",

      "루미: 하지만 도시의 별빛이 점점 약해지고 있어.",

      "루미: 먼저 중앙의 별빛 분수를 조사하자!"

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
        "루미: MAP05 단어 데이터가 부족해."
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
        "루미: 별빛 분수가 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
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

      "별빛 분수가 푸른빛을 뿜어냈다.",

      "루미: 첫 번째 말의 조각이야!",

      "나: 왼쪽 위 관측대에도 불이 들어왔어.",

      "루미: 천체 관측대로 가자!"

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
        "루미: MAP05 단어 데이터가 부족해."
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
        "루미: 별의 위치가 맞지 않아. 영어 단어를 다시 골라 보자!"
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

      "천체 관측 장치가 밤하늘의 별을 가리켰다.",

      "나: 오른쪽 위 건물에서도 빛이 나고 있어.",

      "루미: 공중 서고로 가자!"

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
        "루미: MAP05 영어 표현 데이터가 부족해."
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
        "루미: 별빛 기록이 아직 읽히지 않아. 표현의 뜻을 다시 생각해 보자!"
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
      "dock";


    this.save();


    await GameUI.say([

      "공중 서고의 책들이 별빛처럼 반짝였다.",

      "루미: 두 번째 말의 조각을 찾았어!",

      "루미: 이제 아래쪽 중앙의 하늘 선착장으로 가자."

    ]);

  }


  async handleDock() {

    if (
      this.state.phase !==
      "dock"
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
        "루미: MAP05 문장 데이터가 부족해."
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
        "dock"
      );


      await GameUI.say(
        "루미: 별빛 길이 아직 이어지지 않았어. 문장 순서를 다시 맞춰 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "dock"
    );


    this.state.phase =
      "altar";


    this.save();


    await GameUI.say([

      "하늘 선착장에서 별빛으로 된 길이 펼쳐졌다.",

      "나: 오른쪽의 수정 제단까지 이어지고 있어.",

      "루미: 좋아! 별 수정 제단으로 가자!"

    ]);

  }


  async handleAltar() {

    if (
      this.state.phase !==
      "altar"
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
        "루미: 마지막 문제를 만들 MAP05 학습 데이터가 부족해."
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
        "altar"
      );


      await GameUI.say(
        "루미: 별 수정의 빛이 아직 약해. 마지막 문제를 다시 풀어 보자!"
      );


      return;

    }


    this.markCorrect(
      "altar"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "별 수정 제단에서 강한 빛이 하늘로 솟아올랐다.",

      "세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 찾았어!",

      "루미: 별빛 도시의 힘이 완전히 돌아왔어.",

      "루미: 이제 가운데 위의 별빛 성문으로 가자!"

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
        "루미: 중앙의 빛나는 별빛 분수를 조사해 봐!",

      observatory:
        "루미: 왼쪽 위의 천체 관측대로 가자!",

      library:
        "루미: 오른쪽 위의 공중 서고로 가자!",

      dock:
        "루미: 아래쪽 중앙의 하늘 선착장으로 가자!",

      altar:
        "루미: 오른쪽의 빛나는 별 수정 제단을 조사해 봐!",

      exit:
        "루미: 가운데 위쪽의 별빛 성문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 별빛이 가리키는 곳으로 가자!"
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

      "공중도시를 둘러싼 별빛이 다시 밝아졌다.",

      "다섯 번째 언어 수정이 원래의 힘을 되찾았다.",

      "루미: 좋아! 다섯 번째 미로도 해결했어!",

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
        "중앙의 별빛 분수를 활성화하자.",

      observatory:
        "왼쪽 위 천체 관측대를 복구하자.",

      library:
        "오른쪽 위 공중 서고의 기록을 복원하자.",

      dock:
        "하늘 선착장에서 별빛 길을 복구하자.",

      altar:
        "별 수정 제단을 활성화하자.",

      exit:
        "가운데 위 별빛 성문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "별빛 공중도시의 언어 수정을 복원하자.";

  }

}
