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
      "map02",
      `${base}assets/maps/map02.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map02_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map02_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map02_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map02_right",
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
      0;


    this.obstacles =
      [];


    this.interactables =
      [];


    this.add.image(
      384,
      288,
      "map02"
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

    const phases = [
      "bookshelf",
      "table",
      "clock",
      "circle",
      "cabinet",
      "exit"
    ];


    if (
      !phases.includes(
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

      this.player.body.setVelocity(
        0,
        0
      );

    }

  }


  /*
    핵심 안전장치.

    모달이 닫혔는데도 Scene이 잠겨 있으면
    자동으로 잠금을 풀어버림.
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
      modal
      &&
      !modal.classList.contains(
        "hidden"
      );


    if (
      modalVisible
    ) {

      return;

    }


    /*
      모달이 닫힌 직후 약간의 여유를 둠.
    */

    if (
      this.lockStartedAt
      &&
      Date.now() -
        this.lockStartedAt
        <
        150
    ) {

      return;

    }


    console.warn(
      "MAP02: stuck input detected. Force unlock."
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

    this.wall(
      384,
      8,
      768,
      16
    );


    this.wall(
      8,
      288,
      16,
      576
    );


    this.wall(
      760,
      288,
      16,
      576
    );


    this.wall(
      384,
      568,
      768,
      16
    );


    /*
      왼쪽 위 책장
    */

    this.wall(
      205,
      104,
      125,
      72
    );


    /*
      시계
    */

    this.wall(
      425,
      103,
      62,
      72
    );


    /*
      오른쪽 위 가구
    */

    this.wall(
      552,
      105,
      110,
      52
    );


    /*
      중앙 위 책장
    */

    this.wall(
      388,
      182,
      190,
      48
    );


    /*
      왼쪽 중앙
    */

    this.wall(
      160,
      222,
      120,
      90
    );


    /*
      오른쪽 중앙
    */

    this.wall(
      558,
      224,
      80,
      108
    );


    this.wall(
      650,
      274,
      94,
      65
    );


    /*
      중앙 테이블
    */

    this.wall(
      385,
      352,
      180,
      90
    );


    /*
      기둥
    */

    this.wall(
      260,
      360,
      42,
      120
    );


    this.wall(
      558,
      360,
      42,
      120
    );


    /*
      아래 책장
    */

    this.wall(
      282,
      470,
      100,
      62
    );


    this.wall(
      472,
      470,
      100,
      62
    );


    /*
      오른쪽 아래
    */

    this.wall(
      673,
      472,
      112,
      78
    );


    /*
      캐비닛
    */

    this.wall(
      705,
      232,
      72,
      70
    );

  }


  wall(
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
        id: "bookshelf",
        label: "빛나는 책장",
        x: 205,
        y: 155,
        radius: 70
      },

      {
        id: "table",
        label: "중앙 테이블",
        x: 385,
        y: 415,
        radius: 75
      },

      {
        id: "clock",
        label: "큰 시계",
        x: 425,
        y: 155,
        radius: 68
      },

      {
        id: "magic_circle",
        label: "보라 마법진",
        x: 647,
        y: 505,
        radius: 78
      },

      {
        id: "cabinet",
        label: "잠긴 캐비닛",
        x: 650,
        y: 235,
        radius: 75
      },

      {
        id: "exit",
        label: "봉인된 문",
        x: 640,
        y: 125,
        radius: 78
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
        0xb77cff,
        0.15
      )
        .setStrokeStyle(
          4,
          0xd9b6ff,
          1
        )
        .setDepth(
          50
        );


    this.tweens.add({

      targets:
        this.guide,

      alpha: {
        from: 0.25,
        to: 1
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
            "#f7eaff",

          backgroundColor:
            "#181226dd",

          padding: {
            x: 10,
            y: 6
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

      bookshelf:
        [205, 155],

      table:
        [385, 415],

      clock:
        [425, 155],

      circle:
        [647, 505],

      cabinet:
        [650, 235],

      exit:
        [640, 125]

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


  /* =====================================================
     PLAYER
  ====================================================== */

  createPlayer() {

    if (
      this.textures.exists(
        "map02_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          530,
          "map02_front"
        );


      const height =
        64;


      const ratio =
        this.player.width /
        this.player.height;


      this.player.setDisplaySize(
        height * ratio,
        height
      );

    }

    else {

      this.player =
        this.add.rectangle(
          384,
          530,
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

        up: "W",
        down: "S",
        left: "A",
        right: "D",
        interact: "E",
        enter: "ENTER"

      });

  }


  update() {

    if (
      !this.player?.body
    ) {

      return;

    }


    /*
      항상 먼저 잠금 상태 검사.
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

      vx *= 0.707;

      vy *= 0.707;

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
      Math.abs(vx) >
      Math.abs(vy)
    ) {

      if (
        vx < 0
        &&
        this.textures.exists(
          "map02_left"
        )
      ) {

        this.player.setTexture(
          "map02_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map02_right"
        )
      ) {

        this.player.setTexture(
          "map02_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map02_back"
      )
    ) {

      this.player.setTexture(
        "map02_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map02_front"
      )
    ) {

      this.player.setTexture(
        "map02_front"
      );

    }

  }


  /* =====================================================
     NEAREST
  ====================================================== */

  nearestObject() {

    let result =
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

        result =
          object;


        shortest =
          distance;

      }

    }


    return result;

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
      .setText(
        `[E] ${object.label} 조사`
      )
      .setVisible(
        true
      );

  }


  /* =====================================================
     INTERACT
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
        제일 중요.
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

      "루미: 오래된 책들이 언어 수정의 힘을 잃고 잠들어 있어.",

      "나: 이번에도 말의 조각 세 개를 찾아야 하는 거지?",

      "루미: 맞아! 먼저 위쪽 왼쪽의 빛나는 책장을 조사해 보자."

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "bookshelf";


    this.save();

  }


  /* =====================================================
     BOOKSHELF
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


    /*
      대화 전에 진행 상태부터 저장.
    */

    this.state.shards =
      1;


    this.state.phase =
      "table";


    this.save();


    await GameUI.say([

      "책장 사이에서 첫 번째 말의 조각이 나타났다.",

      "루미: 좋아! 이제 중앙의 큰 테이블로 가자."

    ]);

  }


  /* =====================================================
     TABLE
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
        "루미: 한국어 뜻에 맞는 영어 단어를 다시 골라 봐!"
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

      "테이블의 마법 문양이 빛나기 시작했다.",

      "루미: 위쪽의 큰 시계가 움직이고 있어!"

    ]);

  }


  /* =====================================================
     CLOCK
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
      `루미: "${expression.korean}"라는 뜻이 되도록 문장을 만들어 봐!`
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

      "두 번째 말의 조각이 나타났다.",

      "루미: 오른쪽 아래 보라 마법진으로 가자!"

    ]);

  }


  /* =====================================================
     MAGIC CIRCLE
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
        "루미: MAP02 영어 표현 데이터가 부족해."
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


    /*
      반드시 먼저 상태를 다음 단계로 넘김.
    */

    this.state.phase =
      "cabinet";


    this.save();


    await GameUI.say([

      "보라 마법진이 강하게 빛났다.",

      "나: 오른쪽 캐비닛의 자물쇠가 풀렸어!",

      "루미: 이제 캐비닛으로 가자!"

    ]);

  }


  /* =====================================================
     CABINET
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
        `마지막 봉인!\n${quiz.question}`,
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
        "루미: 봉인이 아직 남아 있어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "cabinet"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "캐비닛 안에서 세 번째 말의 조각이 나타났다.",

      "나: 세 개를 모두 모았어!",

      "루미: 오른쪽 위 봉인문으로 가자!"

    ]);

  }


  /* =====================================================
     EXIT
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
        "루미: 위쪽 왼쪽의 빛나는 책장을 찾아봐!",

      table:
        "루미: 중앙 테이블 아래쪽에서 E를 눌러 봐!",

      clock:
        "루미: 위쪽 큰 시계로 가자!",

      circle:
        "루미: 오른쪽 아래 보라 마법진으로 가자!",

      cabinet:
        "루미: 오른쪽 벽의 잠긴 캐비닛으로 가자!",

      exit:
        "루미: 오른쪽 위 봉인문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 도서관을 둘러보자!"
    );

  }


  /* =====================================================
     SCORE / MEMORY
  ====================================================== */

  rememberWord(
    word
  ) {

    if (
      !this.state.usedWords.includes(
        word
      )
    ) {

      this.state.usedWords.push(
        word
      );

    }

  }


  rememberExpression(
    expression
  ) {

    if (
      !this.state.usedExpressions.includes(
        expression
      )
    ) {

      this.state.usedExpressions.push(
        expression
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
        new Date().toISOString()

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

      "봉인된 도서관 문이 열렸다.",

      "루미: 두 번째 언어 수정도 복원됐어!",

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
     SAVE / HUD
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

      ].join(" ");

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


    const texts = {

      bookshelf:
        "빛나는 책장의 문제를 풀자.",

      table:
        "중앙 테이블을 조사하자.",

      clock:
        "큰 시계의 문장 문제를 풀자.",

      circle:
        "보라 마법진의 문제를 풀자.",

      cabinet:
        "잠긴 캐비닛의 봉인을 풀자.",

      exit:
        "오른쪽 위 봉인문으로 나가자."

    };


    objective.textContent =
      texts[
        this.state.phase
      ]
      ||
      "도서관을 탐험하자.";

  }

}
