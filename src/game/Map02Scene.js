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


const MAP_ID = "MAP02";


export default class Map02Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  /* =====================================================
     PRELOAD
  ====================================================== */

  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map02_background",
      `${base}assets/maps/map02.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {

      this.load.image(
        "map02_player_front",
        sprites.front
      );

    }


    if (sprites?.back) {

      this.load.image(
        "map02_player_back",
        sprites.back
      );

    }


    if (sprites?.left) {

      this.load.image(
        "map02_player_left",
        sprites.left
      );

    }


    if (sprites?.right) {

      this.load.image(
        "map02_player_right",
        sprites.right
      );

    }

  }


  /* =====================================================
     CREATE
  ====================================================== */

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


    this.obstacles =
      [];


    this.interactables =
      [];


    this.add.image(
      384,
      288,
      "map02_background"
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


    this.createCollisions();

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

        catch (error) {

          console.error(
            "MAP02 intro error:",
            error
          );

        }

        finally {

          this.forceUnlock();

        }

      }
    );

  }


  /* =====================================================
     STATE
  ====================================================== */

  prepareState() {

    const validPhases = [
      "bookshelf",
      "table",
      "clock",
      "circle",
      "cabinet",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "bookshelf";

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


  /* =====================================================
     INPUT SAFETY
  ====================================================== */

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


  /*
    혹시 Promise가 꼬이더라도
    모달이 닫혀 있는데 캐릭터가 잠겨 있으면
    자동 복구.
  */

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
      "MAP02 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  /* =====================================================
     COLLISION
  ====================================================== */

  createCollisions() {

    /*
      외곽
    */

    this.addWall(
      384,
      8,
      768,
      16
    );


    this.addWall(
      8,
      288,
      16,
      576
    );


    this.addWall(
      760,
      288,
      16,
      576
    );


    this.addWall(
      384,
      568,
      768,
      16
    );


    /*
      상단 왼쪽 책장
    */

    this.addWall(
      205,
      105,
      125,
      70
    );


    /*
      상단 시계
    */

    this.addWall(
      425,
      105,
      65,
      70
    );


    /*
      상단 중앙 책장
    */

    this.addWall(
      385,
      182,
      190,
      48
    );


    /*
      왼쪽 중앙 가구
    */

    this.addWall(
      155,
      225,
      115,
      90
    );


    /*
      오른쪽 중앙 책장
    */

    this.addWall(
      555,
      225,
      80,
      105
    );


    /*
      중앙 큰 테이블
    */

    this.addWall(
      385,
      350,
      180,
      88
    );


    /*
      좌우 기둥
    */

    this.addWall(
      260,
      360,
      40,
      120
    );


    this.addWall(
      558,
      360,
      40,
      120
    );


    /*
      아래쪽 책장
    */

    this.addWall(
      282,
      470,
      100,
      60
    );


    this.addWall(
      472,
      470,
      100,
      60
    );


    /*
      우측 캐비닛
    */

    this.addWall(
      705,
      232,
      70,
      70
    );

  }


  addWall(
    x,
    y,
    width,
    height
  ) {

    const zone =
      this.add.zone(
        x,
        y,
        width,
        height
      );


    this.physics.add.existing(
      zone,
      true
    );


    this.obstacles.push(
      zone
    );

  }


  /* =====================================================
     INTERACTION POINTS
  ====================================================== */

  createInteractables() {

    this.interactables = [

      {
        id:
          "bookshelf",

        label:
          "빛나는 책장",

        x:
          205,

        y:
          155,

        radius:
          72
      },


      {
        id:
          "table",

        label:
          "중앙 테이블",

        x:
          385,

        y:
          415,

        radius:
          78
      },


      {
        id:
          "clock",

        label:
          "큰 시계",

        x:
          425,

        y:
          155,

        radius:
          70
      },


      {
        id:
          "magic_circle",

        label:
          "보라 마법진",

        x:
          647,

        y:
          505,

        radius:
          82
      },


      {
        id:
          "cabinet",

        label:
          "잠긴 캐비닛",

        x:
          650,

        y:
          235,

        radius:
          78
      },


      {
        id:
          "exit",

        label:
          "푸른 봉인문",

        x:
          640,

        y:
          125,

        radius:
          82
      }

    ];

  }


  /* =====================================================
     GUIDE
  ====================================================== */

  createGuide() {

    this.guide =
      this.add.circle(
        205,
        155,
        20,
        0x9f6cff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xe0c2ff,
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
            "#171426dd",

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

      bookshelf: {
        x: 205,
        y: 155
      },

      table: {
        x: 385,
        y: 415
      },

      clock: {
        x: 425,
        y: 155
      },

      circle: {
        x: 647,
        y: 505
      },

      cabinet: {
        x: 650,
        y: 235
      },

      exit: {
        x: 640,
        y: 125
      }

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
        point.x,
        point.y
      );

  }


  /* =====================================================
     PLAYER
  ====================================================== */

  createPlayer() {

    if (
      this.textures.exists(
        "map02_player_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          530,
          "map02_player_front"
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
          530,
          26,
          40,
          0x3c72d9
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


    for (
      const obstacle of
      this.obstacles
    ) {

      this.physics.add.collider(
        this.player,
        obstacle
      );

    }

  }


  /* =====================================================
     INPUT
  ====================================================== */

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


    /*
      매 프레임 잠금 이상 여부 검사
    */

    this.recoverStuckInput();


    if (
      this.inputLocked
    ) {

      this.player.body.setVelocity(
        0,
        0
      );


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
    ) {

      vx =
        -speed;

    }

    else if (
      this.cursors.right.isDown
      ||
      this.keys.right.isDown
    ) {

      vx =
        speed;

    }


    if (
      this.cursors.up.isDown
      ||
      this.keys.up.isDown
    ) {

      vy =
        -speed;

    }

    else if (
      this.cursors.down.isDown
      ||
      this.keys.down.isDown
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


    if (
      Phaser.Input.Keyboard.JustDown(
        this.keys.interact
      )
      ||
      Phaser.Input.Keyboard.JustDown(
        this.keys.enter
      )
    ) {

      this.interact();

    }

  }


  updateDirection(
    vx,
    vy
  ) {

    if (
      Math.abs(vx)
      >
      Math.abs(vy)
    ) {

      if (
        vx < 0
        &&
        this.textures.exists(
          "map02_player_left"
        )
      ) {

        this.player.setTexture(
          "map02_player_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map02_player_right"
        )
      ) {

        this.player.setTexture(
          "map02_player_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map02_player_back"
      )
    ) {

      this.player.setTexture(
        "map02_player_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map02_player_front"
      )
    ) {

      this.player.setTexture(
        "map02_player_front"
      );

    }

  }


  /* =====================================================
     NEAREST
  ====================================================== */

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


  /* =====================================================
     INTERACTION MASTER
  ====================================================== */

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


    /*
      모든 상호작용은 반드시 여기서 잠금.
    */

    this.lockInput();


    try {

      switch (
        object.id
      ) {

        case "bookshelf":

          await this.handleBookshelf();

          break;


        case "table":

          await this.handleTable();

          break;


        case "clock":

          await this.handleClock();

          break;


        case "magic_circle":

          await this.handleMagicCircle();

          break;


        case "cabinet":

          await this.handleCabinet();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP02 interaction error:",
        error
      );

    }

    finally {

      /*
        모든 상호작용은
        무조건 여기서 이동 복구.
      */

      this.forceUnlock();


      this.updateGuide();

    }

  }


  /* =====================================================
     INTRO
  ====================================================== */

  async playIntro() {

    await GameUI.say([

      "루미: 여기는 속삭이는 도서관이야.",

      "루미: 언어 수정의 힘을 잃은 책들이 잠들어 있어.",

      "나: 여기서도 말의 조각을 찾아야 하는 거지?",

      "루미: 맞아. 먼저 왼쪽 위의 빛나는 책장을 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "bookshelf";


    this.save();

  }


  /* =====================================================
     1. BOOKSHELF
  ====================================================== */

  async handleBookshelf() {

    if (
      this.state.phase !==
      "bookshelf"
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
        "루미: MAP02 단어 데이터가 부족해."
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
        "bookshelf"
      );


      await GameUI.say(
        "루미: 단어 뜻을 다시 생각해 봐!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "bookshelf"
    );


    this.state.shards =
      1;


    this.state.phase =
      "table";


    /*
      항상 대화보다 먼저 저장.
    */

    this.save();


    await GameUI.say([

      "책장 사이에서 첫 번째 말의 조각이 나타났다.",

      "루미: 좋아! 이제 중앙의 큰 테이블로 가자."

    ]);

  }


  /* =====================================================
     2. TABLE
  ====================================================== */

  async handleTable() {

    if (
      this.state.phase !==
      "table"
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
        "루미: MAP02 단어 데이터가 부족해."
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
        "table"
      );


      await GameUI.say(
        "루미: 뜻에 맞는 영어 단어를 다시 골라 봐!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "table"
    );


    this.state.phase =
      "clock";


    this.save();


    await GameUI.say([

      "테이블의 마법 문양이 빛났다.",

      "나: 큰 시계가 움직이기 시작했어!",

      "루미: 위쪽의 큰 시계를 조사하자."

    ]);

  }


  /* =====================================================
     3. CLOCK
  ====================================================== */

  async handleClock() {

    if (
      this.state.phase !==
      "clock"
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
        "루미: MAP02 영어 표현 데이터가 부족해."
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
        "clock"
      );


      await GameUI.say(
        "루미: 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "clock"
    );


    this.state.shards =
      2;


    this.state.phase =
      "circle";


    this.save();


    await GameUI.say([

      "뎅—!",

      "시계에서 두 번째 말의 조각이 나타났다.",

      "루미: 오른쪽 아래의 보라 마법진이 활성화됐어!"

    ]);

  }


  /* =====================================================
     4. MAGIC CIRCLE
  ====================================================== */

  async handleMagicCircle() {

    if (
      this.state.phase !==
      "circle"
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
        "루미: MAP02 표현 데이터가 부족해."
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
        "circle"
      );


      await GameUI.say(
        "루미: 영어 표현의 뜻을 다시 생각해 봐!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "circle"
    );


    this.state.phase =
      "cabinet";


    this.save();


    await GameUI.say([

      "보라 마법진의 빛이 도서관을 가로질렀다.",

      "나: 오른쪽 캐비닛의 자물쇠가 풀렸어!",

      "루미: 이제 오른쪽 캐비닛을 조사하자."

    ]);

  }


  /* =====================================================
     5. CABINET
  ====================================================== */

  async handleCabinet() {

    if (
      this.state.phase !==
      "cabinet"
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
        "루미: 마지막 문제를 만들 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `캐비닛의 마지막 봉인!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !correct
    ) {

      this.markWrong(
        "cabinet"
      );


      await GameUI.say(
        "루미: 아직 봉인이 남아 있어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "cabinet"
    );


    this.state.shards =
      3;


    /*
      중요:
      대사 출력 전에 이미 EXIT로 저장.
    */

    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "캐비닛 안에서 세 번째 말의 조각이 나타났다.",

      "나: 세 개를 모두 모았어!",

      "루미: 좋아! 도서관의 마지막 봉인이 풀렸어.",

      "루미: 오른쪽 위의 푸른 봉인문으로 가자!"

    ]);

  }


  /* =====================================================
     6. EXIT
  ====================================================== */

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


  /* =====================================================
     HINT
  ====================================================== */

  async showHint() {

    this.state.hintsUsed++;


    this.save();


    const hints = {

      bookshelf:
        "루미: 왼쪽 위의 빛나는 책장을 찾아봐!",

      table:
        "루미: 중앙 큰 테이블 아래쪽으로 가자!",

      clock:
        "루미: 위쪽의 큰 시계를 조사해 봐!",

      circle:
        "루미: 오른쪽 아래 보라 마법진으로 가자!",

      cabinet:
        "루미: 오른쪽 벽의 잠긴 캐비닛을 찾아봐!",

      exit:
        "루미: 오른쪽 위의 푸른 봉인문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 도서관을 살펴보자!"
    );

  }


  /* =====================================================
     MEMORY
  ====================================================== */

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


  /* =====================================================
     SCORE
  ====================================================== */

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


  /* =====================================================
     COMPLETE
  ====================================================== */

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

      "푸른 봉인문이 빛나며 천천히 열렸다.",

      "루미: 두 번째 언어 수정도 복원됐어!",

      "나: 다음 장소로 가자!",

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


  /* =====================================================
     SAVE
  ====================================================== */

  save() {

    saveMapProgress(
      MAP_ID,
      this.profile.name,
      this.state
    );


    this.updateHUD();

    this.updateGuide();

  }


  /* =====================================================
     HUD
  ====================================================== */

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

      bookshelf:
        "빛나는 책장의 문제를 풀자.",

      table:
        "중앙 테이블을 조사하자.",

      clock:
        "큰 시계의 문장 배열 문제를 풀자.",

      circle:
        "보라 마법진의 표현 문제를 풀자.",

      cabinet:
        "잠긴 캐비닛의 마지막 봉인을 풀자.",

      exit:
        "오른쪽 위 푸른 봉인문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "속삭이는 도서관을 탐험하자.";

  }

}
