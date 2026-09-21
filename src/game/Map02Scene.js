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
        "map02_mage_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map02_mage_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map02_mage_left",
        sprites.left
      );
    }

    if (sprites?.right) {
      this.load.image(
        "map02_mage_right",
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

          this.unlockInput();

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
     INPUT LOCK
  ====================================================== */

  lockInput() {

    this.inputLocked =
      true;


    if (
      this.player?.body
    ) {

      this.player.body.setVelocity(
        0,
        0
      );

    }


    if (
      this.prompt
    ) {

      this.prompt.setVisible(
        false
      );

    }

  }


  unlockInput() {

    this.inputLocked =
      false;


    this.interactionRunning =
      false;


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


  /* =====================================================
     COLLISION
  ====================================================== */

  createCollisions() {

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
      104,
      125,
      72
    );


    /*
      큰 시계
    */

    this.addWall(
      425,
      103,
      62,
      72
    );


    /*
      상단 오른쪽 책상
    */

    this.addWall(
      552,
      105,
      110,
      52
    );


    /*
      중앙 위 책장
    */

    this.addWall(
      388,
      182,
      190,
      48
    );


    /*
      왼쪽 중앙 책장
    */

    this.addWall(
      160,
      222,
      120,
      90
    );


    /*
      오른쪽 중앙 책장
    */

    this.addWall(
      558,
      224,
      80,
      108
    );


    /*
      오른쪽 중단 책장
    */

    this.addWall(
      650,
      274,
      94,
      65
    );


    /*
      중앙 테이블
    */

    this.addWall(
      385,
      352,
      180,
      90
    );


    /*
      가운데 기둥
    */

    this.addWall(
      260,
      360,
      42,
      120
    );


    this.addWall(
      558,
      360,
      42,
      120
    );


    /*
      하단 책장
    */

    this.addWall(
      282,
      470,
      100,
      62
    );


    this.addWall(
      472,
      470,
      100,
      62
    );


    /*
      오른쪽 아래 진열물
    */

    this.addWall(
      673,
      472,
      112,
      78
    );


    /*
      오른쪽 캐비닛
    */

    this.addWall(
      705,
      232,
      72,
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
     INTERACTABLES
     좌표는 물건 중심이 아니라
     실제 접근 가능한 바닥 쪽으로 잡음
  ====================================================== */

  createInteractables() {

    this.addInteractable({

      id:
        "bookshelf",

      label:
        "빛나는 책장",

      x:
        205,

      y:
        155,

      radius:
        65

    });


    this.addInteractable({

      id:
        "table",

      label:
        "중앙 테이블",

      x:
        385,

      y:
        415,

      radius:
        70

    });


    this.addInteractable({

      id:
        "clock",

      label:
        "큰 시계",

      x:
        425,

      y:
        155,

      radius:
        62

    });


    this.addInteractable({

      id:
        "magic_circle",

      label:
        "보라 마법진",

      x:
        647,

      y:
        505,

      radius:
        72

    });


    this.addInteractable({

      id:
        "cabinet",

      label:
        "잠긴 캐비닛",

      x:
        650,

      y:
        235,

      radius:
        70

    });


    this.addInteractable({

      id:
        "exit",

      label:
        "봉인된 문",

      x:
        640,

      y:
        125,

      radius:
        72

    });

  }


  addInteractable(
    data
  ) {

    this.interactables.push(
      data
    );

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
        0.14
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

    const positions = {

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


    const position =
      positions[
        this.state.phase
      ];


    if (
      !position
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
        position.x,
        position.y
      );

  }


  /* =====================================================
     PLAYER
  ====================================================== */

  createPlayer() {

    if (
      this.textures.exists(
        "map02_mage_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          530,
          "map02_mage_front"
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
      Math.abs(vx) >
      Math.abs(vy)
    ) {

      if (
        vx < 0
        &&
        this.textures.exists(
          "map02_mage_left"
        )
      ) {

        this.player.setTexture(
          "map02_mage_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map02_mage_right"
        )
      ) {

        this.player.setTexture(
          "map02_mage_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map02_mage_back"
      )
    ) {

      this.player.setTexture(
        "map02_mage_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map02_mage_front"
      )
    ) {

      this.player.setTexture(
        "map02_mage_front"
      );

    }

  }


  /* =====================================================
     NEAREST OBJECT
  ====================================================== */

  nearestObject() {

    let nearest =
      null;


    let bestDistance =
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
          bestDistance
      ) {

        nearest =
          object;


        bestDistance =
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


    this.interactionRunning =
      true;


    this.lockInput();


    try {

      if (
        object.id ===
        "bookshelf"
      ) {

        await this.handleBookshelf();

      }

      else if (
        object.id ===
        "table"
      ) {

        await this.handleTable();

      }

      else if (
        object.id ===
        "clock"
      ) {

        await this.handleClock();

      }

      else if (
        object.id ===
        "magic_circle"
      ) {

        await this.handleMagicCircle();

      }

      else if (
        object.id ===
        "cabinet"
      ) {

        await this.handleCabinet();

      }

      else if (
        object.id ===
        "exit"
      ) {

        await this.handleExit();

      }

    }

    catch (error) {

      console.error(
        "MAP02 interaction error:",
        error
      );


      await GameUI.say(
        "루미: 마법이 잠깐 꼬였어. 다시 조사해 보자!"
      );

    }

    finally {

      this.unlockInput();


      this.updateGuide();

    }

  }


  /* =====================================================
     INTRO
  ====================================================== */

  async playIntro() {

    await GameUI.say([

      "루미: 여기는 속삭이는 도서관이야.",

      "루미: 이곳의 책들은 언어 수정이 깨진 뒤 목소리를 잃었어.",

      "나: 여기에도 세 개의 말의 조각이 있는 거지?",

      "루미: 맞아. 도서관의 마법 장치들을 깨워야 해.",

      "루미: 먼저 위쪽의 빛나는 책장을 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "bookshelf";


    this.save();

  }


  /* =====================================================
     1. BOOKSHELF
     WORD -> KOREAN
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
        "루미: MAP02 단어와 한국어 뜻 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
    ) {

      this.markWrong(
        "bookshelf"
      );


      await GameUI.say(
        "루미: 단어의 뜻을 다시 생각해 봐!"
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


    this.save();


    await GameUI.say([

      "책장 사이에서 첫 번째 말의 조각이 떠올랐다.",

      "루미: 좋아! 이제 중앙 테이블을 조사해 보자."

    ]);

  }


  /* =====================================================
     2. TABLE
     KOREAN -> WORD
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
        "루미: 사용할 단어 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
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

      "나: 테이블 위의 마법 문양이 빛났어.",

      "루미: 위쪽의 큰 시계가 반응하고 있어!",

      "루미: 시계를 조사해 보자."

    ]);

  }


  /* =====================================================
     3. CLOCK
     WORD ORDER
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


    /*
      main.js의 wordOrder가
      정답일 때 resolve(true)하는 현재 구조 사용.
    */

    const success =
      await GameUI.wordOrder(
        expression.english
      );


    if (
      !success
    ) {

      this.markWrong(
        "clock"
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

      "시계가 울리며 두 번째 말의 조각이 나타났다.",

      "루미: 오른쪽 아래의 보라 마법진이 켜졌어!"

    ]);

  }


  /* =====================================================
     4. MAGIC CIRCLE
     EXPRESSION -> KOREAN
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
        "루미: 사용할 영어 표현 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(
        quiz.question,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
    ) {

      this.markWrong(
        "circle"
      );


      await GameUI.say(
        "루미: 문장 전체의 뜻을 다시 생각해 봐!"
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

      "마법진에서 보랏빛 빛줄기가 뻗어 나갔다.",

      "나: 오른쪽 캐비닛의 자물쇠가 풀린 것 같아.",

      "루미: 가서 확인해 보자!"

    ]);

  }


  /* =====================================================
     5. CABINET
     RANDOM REVIEW
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


    const success =
      await GameUI.choice(
        `캐비닛의 마지막 봉인!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
    ) {

      this.markWrong(
        "cabinet"
      );


      await GameUI.say(
        "루미: 자물쇠가 아직 풀리지 않았어. 다시 해 보자!"
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

      "철컥!",

      "캐비닛이 열리며 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 전부 모았어!",

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
        "루미: 위쪽 왼쪽의 빛나는 책장 앞에서 E를 눌러 봐!",

      table:
        "루미: 중앙 테이블 아래쪽으로 가서 조사해 봐!",

      clock:
        "루미: 위쪽 큰 시계 아래에서 E를 눌러 봐!",

      circle:
        "루미: 오른쪽 아래 보라 마법진으로 가자!",

      cabinet:
        "루미: 오른쪽 벽 쪽 캐비닛 근처를 조사해 봐!",

      exit:
        "루미: 오른쪽 위 봉인문 아래로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 도서관을 조금 더 살펴보자!"
    );

  }


  /* =====================================================
     USED CONTENT
  ====================================================== */

  rememberWord(
    english
  ) {

    if (
      !this.state.usedWords
        .includes(
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
      !this.state.usedExpressions
        .includes(
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

      "도서관의 봉인문이 천천히 열렸다.",

      "루미: 두 번째 언어 수정도 복원됐어!",

      "나: 좋아. 다음 장소로 가자!",

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

      window.WisdomGame
        .startMap(
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
        "빛나는 책장의 단어 문제를 풀자.",

      table:
        "중앙 테이블의 단어 문제를 풀자.",

      clock:
        "큰 시계의 문장 배열 문제를 풀자.",

      circle:
        "보라 마법진의 표현 문제를 풀자.",

      cabinet:
        "잠긴 캐비닛의 마지막 봉인을 풀자.",

      exit:
        "오른쪽 위 봉인문으로 나가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "도서관을 탐험하자.";

  }

}
