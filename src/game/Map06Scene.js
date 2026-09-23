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


const MAP_ID = "MAP06";


export default class Map06Scene extends Phaser.Scene {

  constructor() {

    super(
      MAP_ID
    );

  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map06_background",
      `${base}assets/maps/map06.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (
      sprites?.front
    ) {

      this.load.image(
        "map06_front",
        sprites.front
      );

    }


    if (
      sprites?.back
    ) {

      this.load.image(
        "map06_back",
        sprites.back
      );

    }


    if (
      sprites?.left
    ) {

      this.load.image(
        "map06_left",
        sprites.left
      );

    }


    if (
      sprites?.right
    ) {

      this.load.image(
        "map06_right",
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
      "map06_background"
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
            "MAP06 intro error:",
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

      "chest",
      "compass",
      "map_table",
      "helm",
      "cabin",
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
        "chest";

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
      "MAP06 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "chest",

        label:
          "잠긴 보물상자",

        x:
          175,

        y:
          240,

        radius:
          82
      },


      {
        id:
          "compass",

        label:
          "폭풍 나침반",

        x:
          515,

        y:
          230,

        radius:
          85
      },


      {
        id:
          "map_table",

        label:
          "항해 지도",

        x:
          575,

        y:
          320,

        radius:
          85
      },


      {
        id:
          "helm",

        label:
          "갑판 조타륜",

        x:
          385,

        y:
          475,

        radius:
          90
      },


      {
        id:
          "cabin",

        label:
          "선장실",

        x:
          385,

        y:
          135,

        radius:
          92
      },


      {
        id:
          "exit",

        label:
          "폭풍 조타 장치",

        x:
          170,

        y:
          170,

        radius:
          90
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        175,
        240,
        21,
        0xffc85c,
        0.18
      )
        .setStrokeStyle(
          4,
          0xffefaa,
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
            "#151b28dd",

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

      chest:
        [175, 240],

      compass:
        [515, 230],

      map_table:
        [575, 320],

      helm:
        [385, 475],

      cabin:
        [385, 135],

      exit:
        [170, 170]

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
        "map06_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map06_front"
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

        up:
          false,

        down:
          false,

        left:
          false,

        right:
          false,

        interactPressed:
          false

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
          "map06_left"
        )
      ) {

        this.player.setTexture(
          "map06_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map06_right"
        )
      ) {

        this.player.setTexture(
          "map06_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map06_back"
      )
    ) {

      this.player.setTexture(
        "map06_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map06_front"
      )
    ) {

      this.player.setTexture(
        "map06_front"
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

        case "chest":

          await this.handleChest();

          break;


        case "compass":

          await this.handleCompass();

          break;


        case "map_table":

          await this.handleMapTable();

          break;


        case "helm":

          await this.handleHelm();

          break;


        case "cabin":

          await this.handleCabin();

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
        "MAP06 interaction error:",
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

      "쾅—! 거대한 번개가 검은 바다를 갈랐다.",

      "나: 배가 엄청 흔들리고 있어!",

      "루미: 여기는 폭풍 속 해적선이야.",

      "루미: 여섯 번째 언어 수정 때문에 이 배가 끝없는 폭풍에 갇혔어.",

      "루미: 먼저 왼쪽의 잠긴 보물상자를 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "chest";


    this.save();

  }


  async handleChest() {

    if (
      this.state.phase !==
      "chest"
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
        "루미: MAP06 단어 데이터가 부족해."
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
        "chest"
      );


      await GameUI.say(
        "루미: 자물쇠가 열리지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "chest"
    );


    this.state.shards =
      1;


    this.state.phase =
      "compass";


    this.save();


    await GameUI.say([

      "철컥!",

      "보물상자가 열리며 첫 번째 말의 조각이 나타났다.",

      "루미: 오른쪽의 폭풍 나침반이 빛나기 시작했어!",

      "루미: 폭풍 나침반으로 가자!"

    ]);

  }


  async handleCompass() {

    if (
      this.state.phase !==
      "compass"
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
        "루미: MAP06 단어 데이터가 부족해."
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
        "compass"
      );


      await GameUI.say(
        "루미: 나침반 바늘이 흔들리고 있어. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "compass"
    );


    this.state.phase =
      "map_table";


    this.save();


    await GameUI.say([

      "폭풍 나침반의 바늘이 한 방향을 가리켰다.",

      "나: 오른쪽 항해 지도에 빛이 들어왔어!",

      "루미: 항해 지도를 조사하자!"

    ]);

  }


  async handleMapTable() {

    if (
      this.state.phase !==
      "map_table"
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
        "루미: MAP06 영어 표현 데이터가 부족해."
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
        "map_table"
      );


      await GameUI.say(
        "루미: 항로가 나타나지 않아. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "map_table"
    );


    this.state.shards =
      2;


    this.state.phase =
      "helm";


    this.save();


    await GameUI.say([

      "항해 지도 위에 푸른 항로가 나타났다.",

      "루미: 두 번째 말의 조각이야!",

      "나: 아래쪽의 조타륜이 움직이고 있어.",

      "루미: 갑판 조타륜으로 가자!"

    ]);

  }


  async handleHelm() {

    if (
      this.state.phase !==
      "helm"
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
        "루미: 문장 배열에 사용할 MAP06 영어 표현이 부족해."
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
        "helm"
      );


      await GameUI.say(
        "루미: 조타륜이 잠겼어. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "helm"
    );


    this.state.phase =
      "cabin";


    this.save();


    await GameUI.say([

      "조타륜이 돌아가며 배가 거대한 파도를 피했다.",

      "나: 위쪽 선장실에서 불빛이 켜졌어!",

      "루미: 선장실로 가자!"

    ]);

  }


  async handleCabin() {

    if (
      this.state.phase !==
      "cabin"
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
        "루미: 마지막 문제를 만들 MAP06 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `선장의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !correct
    ) {

      this.markWrong(
        "cabin"
      );


      await GameUI.say(
        "루미: 선장실의 봉인이 아직 풀리지 않았어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "cabin"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "선장실에서 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 좋아! 이제 폭풍을 끝낼 수 있어.",

      "루미: 왼쪽 위의 폭풍 조타 장치로 가자!"

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

      chest:
        "루미: 왼쪽의 잠긴 보물상자를 조사해 봐!",

      compass:
        "루미: 오른쪽의 폭풍 나침반으로 가자!",

      map_table:
        "루미: 오른쪽의 항해 지도 테이블로 가자!",

      helm:
        "루미: 아래쪽 중앙의 갑판 조타륜으로 가자!",

      cabin:
        "루미: 위쪽 중앙의 선장실로 가자!",

      exit:
        "루미: 왼쪽 위의 폭풍 조타 장치로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 갑판의 항해 장치를 따라가 보자!"
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

      "폭풍 조타 장치가 푸른 빛을 뿜어냈다.",

      "거대한 번개가 멀어지고 파도가 천천히 잦아들었다.",

      "루미: 여섯 번째 언어 수정도 복원됐어!",

      "나: 드디어 바다가 조용해졌어!",

      nextMap
        ? `루미: 다음 목적지는 ${nextMap}이야!`
        : "루미: 모든 언어 수정을 복원했어!"

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

      chest:
        "잠긴 보물상자의 문제를 풀자.",

      compass:
        "폭풍 나침반의 단어 문제를 풀자.",

      map_table:
        "항해 지도의 표현 문제를 풀자.",

      helm:
        "갑판 조타륜의 문장 배열 문제를 풀자.",

      cabin:
        "선장실의 마지막 시험을 풀자.",

      exit:
        "왼쪽 위 폭풍 조타 장치로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "폭풍 속 해적선을 탐험하자.";

  }

}
