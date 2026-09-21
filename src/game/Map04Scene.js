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
    super(MAP_ID);
  }


  /* =====================================================
     PRELOAD
  ====================================================== */

  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map04",
      `${base}assets/maps/map04.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map04_mage_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map04_mage_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map04_mage_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map04_mage_right",
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


    this.obstacles =
      [];


    this.interactables =
      [];


    this.add.image(
      384,
      288,
      "map04"
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
            "MAP04 intro error:",
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


    this.prompt
      ?.setVisible(
        false
      );

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
     COLLISIONS
  ====================================================== */

  createCollisions() {

    /* 바깥 벽 */

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


    /* 상단 중앙 신전 */

    this.addWall(
      385,
      92,
      210,
      112
    );


    /* 왼쪽 상단 천문대 */

    this.addWall(
      95,
      108,
      145,
      100
    );


    /* 오른쪽 상단 서고 */

    this.addWall(
      680,
      112,
      120,
      105
    );


    /* 중앙 수정 분수 */

    this.addWall(
      385,
      257,
      82,
      72
    );


    /* 좌측 중앙 절벽 */

    this.addWall(
      190,
      275,
      125,
      110
    );


    /* 우측 중앙 장터 */

    this.addWall(
      665,
      302,
      115,
      86
    );


    /* 왼쪽 아래 종탑 */

    this.addWall(
      80,
      420,
      90,
      100
    );


    /* 오른쪽 아래 수정 바위 */

    this.addWall(
      655,
      480,
      115,
      105
    );


    /* 중앙 하단 계단 */

    this.addWall(
      385,
      345,
      82,
      70
    );


    /* 하단 원 주변 기둥 */

    this.addWall(
      310,
      455,
      28,
      90
    );


    this.addWall(
      455,
      455,
      28,
      90
    );


    /* 좌측 아래 다리 */

    this.addWall(
      185,
      476,
      135,
      32
    );


    /* 우측 아래 다리 */

    this.addWall(
      547,
      475,
      120,
      32
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
  ====================================================== */

  createInteractables() {

    /*
      중앙 수정 분수
      실제 물체보다 아래쪽 접근점
    */

    this.addInteractable({

      id:
        "fountain",

      label:
        "시간 수정 분수",

      x:
        385,

      y:
        310,

      radius:
        65

    });


    /*
      왼쪽 상단 천문대
    */

    this.addInteractable({

      id:
        "observatory",

      label:
        "고대 천문대",

      x:
        145,

      y:
        160,

      radius:
        72

    });


    /*
      오른쪽 위 고대 서고
    */

    this.addInteractable({

      id:
        "library",

      label:
        "시간의 서고",

      x:
        650,

      y:
        160,

      radius:
        72

    });


    /*
      하단 중앙 룬 원
    */

    this.addInteractable({

      id:
        "time_circle",

      label:
        "시간 마법진",

      x:
        385,

      y:
        465,

      radius:
        70

    });


    /*
      오른쪽 아래 보라 수정
    */

    this.addInteractable({

      id:
        "crystal",

      label:
        "보라 시간 수정",

      x:
        625,

      y:
        490,

      radius:
        78

    });


    /*
      상단 중앙 신전 출구
    */

    this.addInteractable({

      id:
        "exit",

      label:
        "시간 신전의 문",

      x:
        385,

      y:
        150,

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
        385,
        310,
        20,
        0x64cfff,
        0.15
      )
        .setStrokeStyle(
          4,
          0x9de7ff,
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
            "#dcf6ff",

          backgroundColor:
            "#101b2bdd",

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

      fountain: {
        x: 385,
        y: 310
      },

      observatory: {
        x: 145,
        y: 160
      },

      library: {
        x: 650,
        y: 160
      },

      time_circle: {
        x: 385,
        y: 465
      },

      crystal: {
        x: 625,
        y: 490
      },

      exit: {
        x: 385,
        y: 150
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
        "map04_mage_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          385,
          525,
          "map04_mage_front"
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
          385,
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
          "map04_mage_left"
        )
      ) {

        this.player.setTexture(
          "map04_mage_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map04_mage_right"
        )
      ) {

        this.player.setTexture(
          "map04_mage_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map04_mage_back"
      )
    ) {

      this.player.setTexture(
        "map04_mage_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map04_mage_front"
      )
    ) {

      this.player.setTexture(
        "map04_mage_front"
      );

    }

  }


  /* =====================================================
     NEAREST
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
        "fountain"
      ) {

        await this.handleFountain();

      }

      else if (
        object.id ===
        "observatory"
      ) {

        await this.handleObservatory();

      }

      else if (
        object.id ===
        "library"
      ) {

        await this.handleLibrary();

      }

      else if (
        object.id ===
        "time_circle"
      ) {

        await this.handleTimeCircle();

      }

      else if (
        object.id ===
        "crystal"
      ) {

        await this.handleCrystal();

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
        "MAP04 interaction error:",
        error
      );


      await GameUI.say(
        "루미: 시간 마법이 잠깐 뒤틀렸어. 다시 조사해 보자!"
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

      "거대한 폭포 사이로 오래된 신전이 모습을 드러냈다.",

      "나: 여긴 시간이 멈춘 것처럼 조용해.",

      "루미: 이곳은 모래시계 유적이야.",

      "루미: 언어 수정이 깨지면서 이곳의 시간이 뒤엉켜 버렸어.",

      "나: 시간도 영어 문제로 되돌릴 수 있을까?",

      "루미: 물론이지! 먼저 중앙의 푸른 시간 수정 분수로 가자."

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "fountain";


    this.save();

  }


  /* =====================================================
     1. FOUNTAIN
     WORD -> KOREAN
  ====================================================== */

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
        "루미: MAP04 단어와 한국어 뜻 데이터가 부족해."
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
        "fountain"
      );


      await GameUI.say(
        "루미: 시간 수정이 아직 반응하지 않아. 뜻을 다시 생각해 봐!"
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

      "푸른 수정이 강하게 빛나며 첫 번째 말의 조각이 나타났다.",

      "루미: 좋아! 왼쪽 위의 천문대로 가자."

    ]);

  }


  /* =====================================================
     2. OBSERVATORY
     KOREAN -> ENGLISH
  ====================================================== */

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
        "observatory"
      );


      await GameUI.say(
        "루미: 한국어 뜻과 맞는 영어 단어를 다시 골라 봐!"
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

      "천문대의 망원경이 스스로 움직이기 시작했다.",

      "나: 빛이 오른쪽 위 건물을 가리키고 있어.",

      "루미: 시간의 서고로 가자!"

    ]);

  }


  /* =====================================================
     3. LIBRARY
     EXPRESSION -> KOREAN
  ====================================================== */

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
        "library"
      );


      await GameUI.say(
        "루미: 영어 표현 전체의 뜻을 다시 생각해 봐!"
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

      "오래된 책장이 열리며 두 번째 말의 조각이 나타났다.",

      "루미: 이제 아래쪽 중앙의 시간 마법진으로 가자!"

    ]);

  }


  /* =====================================================
     4. TIME CIRCLE
     WORD ORDER
  ====================================================== */

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
        "루미: 문장 배열에 사용할 MAP04 영어 표현이 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    await GameUI.say(
      `루미: "${expression.korean}"라는 뜻이 되도록 영어 문장을 만들어 봐!`
    );


    const success =
      await GameUI.wordOrder(
        expression.english
      );


    if (
      !success
    ) {

      this.markWrong(
        "time_circle"
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

      "마법진의 시곗바늘 같은 문양이 빠르게 회전하기 시작했다.",

      "나: 오른쪽 아래 수정 동굴에서 빛이 나!",

      "루미: 마지막 시간 수정으로 가자!"

    ]);

  }


  /* =====================================================
     5. CRYSTAL
     RANDOM REVIEW
  ====================================================== */

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


    const success =
      await GameUI.choice(
        `시간 수정의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
    ) {

      this.markWrong(
        "crystal"
      );


      await GameUI.say(
        "루미: 수정의 시간이 되감겼어. 다시 도전하자!"
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

      "보라 수정이 눈부시게 빛나며 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 전부 모았어!",

      "루미: 시간이 다시 흐르기 시작했어.",

      "루미: 위쪽 중앙의 시간 신전으로 가자!"

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

      fountain:
        "루미: 맵 중앙의 푸른 수정 분수 아래에서 E를 눌러 봐!",

      observatory:
        "루미: 왼쪽 위 둥근 지붕의 천문대로 가자!",

      library:
        "루미: 오른쪽 위의 책이 가득한 작은 서고로 가자!",

      time_circle:
        "루미: 아래쪽 중앙의 별 모양 마법진을 조사해 봐!",

      crystal:
        "루미: 오른쪽 아래 절벽의 보라 수정을 찾아가자!",

      exit:
        "루미: 위쪽 중앙의 커다란 신전문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 유적의 마법 장치를 찾아보자!"
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

      "멈춰 있던 폭포와 신전의 불꽃이 다시 움직이기 시작했다.",

      "루미: 네 번째 언어 수정도 복원됐어!",

      "나: 시간이 완전히 돌아왔어.",

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

      fountain:
        "중앙 시간 수정의 단어 문제를 풀자.",

      observatory:
        "왼쪽 천문대의 단어 문제를 풀자.",

      library:
        "오른쪽 서고의 영어 표현 문제를 풀자.",

      time_circle:
        "하단 시간 마법진의 문장 배열 문제를 풀자.",

      crystal:
        "보라 시간 수정의 마지막 시험을 풀자.",

      exit:
        "상단 중앙 시간 신전으로 들어가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "모래시계 유적을 탐험하자.";

  }

}
