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
    super(MAP_ID);
  }


  /* =====================================================
     PRELOAD
  ====================================================== */

  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map05",
      `${base}assets/maps/map05.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map05_mage_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map05_mage_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map05_mage_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map05_mage_right",
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
      "map05"
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
            "MAP05 intro error:",
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
      "dock",
      "altar",
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

    /*
      바깥 가장자리
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
      상단 중앙 차원문 건물
    */
    this.addWall(
      384,
      86,
      220,
      92
    );


    /*
      왼쪽 위 관측대
    */
    this.addWall(
      126,
      142,
      138,
      86
    );


    /*
      오른쪽 위 별 수정 제단
    */
    this.addWall(
      625,
      128,
      126,
      88
    );


    /*
      오른쪽 중앙 서고/정원
    */
    this.addWall(
      635,
      266,
      130,
      100
    );


    /*
      중앙 별빛 분수
    */
    this.addWall(
      384,
      255,
      88,
      72
    );


    /*
      왼쪽 중앙 화단/기둥
    */
    this.addWall(
      165,
      290,
      95,
      110
    );


    /*
      중앙 오른쪽 기둥
    */
    this.addWall(
      525,
      318,
      48,
      122
    );


    /*
      아래쪽 선착장
    */
    this.addWall(
      384,
      472,
      205,
      84
    );


    /*
      왼쪽 아래 보조 플랫폼
    */
    this.addWall(
      140,
      460,
      120,
      60
    );


    /*
      오른쪽 아래 보조 플랫폼
    */
    this.addWall(
      630,
      470,
      118,
      62
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
      중앙 분수
    */
    this.addInteractable({

      id:
        "fountain",

      label:
        "별빛 분수",

      x:
        384,

      y:
        308,

      radius:
        70

    });


    /*
      왼쪽 위 관측대
    */
    this.addInteractable({

      id:
        "observatory",

      label:
        "천체 관측대",

      x:
        145,

      y:
        190,

      radius:
        74

    });


    /*
      오른쪽 서고
    */
    this.addInteractable({

      id:
        "library",

      label:
        "공중 정원 서고",

      x:
        602,

      y:
        315,

      radius:
        74

    });


    /*
      아래쪽 선착장
    */
    this.addInteractable({

      id:
        "dock",

      label:
        "하늘 선착장",

      x:
        384,

      y:
        430,

      radius:
        76

    });


    /*
      오른쪽 위 별 제단
    */
    this.addInteractable({

      id:
        "altar",

      label:
        "별 수정 제단",

      x:
        615,

      y:
        185,

      radius:
        76

    });


    /*
      상단 중앙 출구
    */
    this.addInteractable({

      id:
        "exit",

      label:
        "차원의 문",

      x:
        384,

      y:
        140,

      radius:
        76

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
        384,
        308,
        20,
        0xffd66e,
        0.16
      )
        .setStrokeStyle(
          4,
          0xfff1a8,
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
            "#fff5d6",

          backgroundColor:
            "#22183add",

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
        x: 384,
        y: 308
      },

      observatory: {
        x: 145,
        y: 190
      },

      library: {
        x: 602,
        y: 315
      },

      dock: {
        x: 384,
        y: 430
      },

      altar: {
        x: 615,
        y: 185
      },

      exit: {
        x: 384,
        y: 140
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
        "map05_mage_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          520,
          "map05_mage_front"
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
          520,
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
          "map05_mage_left"
        )
      ) {

        this.player.setTexture(
          "map05_mage_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map05_mage_right"
        )
      ) {

        this.player.setTexture(
          "map05_mage_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map05_mage_back"
      )
    ) {

      this.player.setTexture(
        "map05_mage_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map05_mage_front"
      )
    ) {

      this.player.setTexture(
        "map05_mage_front"
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
        "dock"
      ) {

        await this.handleDock();

      }

      else if (
        object.id ===
        "altar"
      ) {

        await this.handleAltar();

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
        "MAP05 interaction error:",
        error
      );


      await GameUI.say(
        "루미: 별빛 마법이 흔들렸어. 다시 조사해 보자!"
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

      "구름 위로 떠 있는 성역이 눈앞에 펼쳐졌다.",

      "나: 우와... 마을이 하늘에 떠 있어!",

      "루미: 여긴 별빛 공중도시야.",

      "루미: 언어 수정이 깨지면서 하늘길과 별 마법이 뒤엉켜 버렸어.",

      "나: 이번에도 조각 세 개를 모으면 되는 거지?",

      "루미: 응! 먼저 중앙의 별빛 분수부터 조사해 보자."

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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP05 단어와 한국어 뜻 데이터가 부족해."
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


    if (!success) {

      this.markWrong(
        "fountain"
      );


      await GameUI.say(
        "루미: 분수가 아직 반응하지 않아. 단어 뜻을 다시 생각해 봐!"
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

      "별빛 분수에서 첫 번째 말의 조각이 떠올랐다.",

      "루미: 좋아! 이제 왼쪽의 천체 관측대로 가자."

    ]);

  }


  /* =====================================================
     2. OBSERVATORY
     KOREAN -> WORD
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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP05 단어 데이터가 부족해."
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


    if (!success) {

      this.markWrong(
        "observatory"
      );


      await GameUI.say(
        "루미: 한국어 뜻에 맞는 영어 단어를 다시 골라 보자!"
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

      "관측대의 렌즈가 빛나며 하늘 별자리가 움직였다.",

      "나: 저 빛이 오른쪽 서고를 가리켜!",

      "루미: 공중 정원 서고로 가자."

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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP05 영어 표현 데이터가 부족해."
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


    if (!success) {

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
      "dock";


    this.save();


    await GameUI.say([

      "서고의 책장 사이에서 두 번째 말의 조각이 나타났다.",

      "루미: 아래쪽 하늘 선착장에 바람의 길이 열렸어!",

      "나: 그쪽으로 내려가 보자."

    ]);

  }


  /* =====================================================
     4. DOCK
     WORD ORDER
  ====================================================== */

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


    if (!expression) {

      await GameUI.say(
        "루미: 문장 배열에 사용할 MAP05 영어 표현이 부족해."
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


    if (!success) {

      this.markWrong(
        "dock"
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

      "선착장의 바람 돛이 펄럭이며 하늘길이 이어졌다.",

      "나: 오른쪽 위 제단에서 별빛이 솟아오르고 있어.",

      "루미: 마지막 시험이 남았어. 별 수정 제단으로 가자!"

    ]);

  }


  /* =====================================================
     5. ALTAR
     RANDOM REVIEW
  ====================================================== */

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


    if (!quiz) {

      await GameUI.say(
        "루미: 마지막 문제를 만들 MAP05 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(
        `별 수정의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!success) {

      this.markWrong(
        "altar"
      );


      await GameUI.say(
        "루미: 제단의 봉인이 아직 풀리지 않았어. 다시 해 보자!"
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

      "별 수정 제단이 눈부시게 빛나며 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 다 모았어!",

      "루미: 좋아, 이제 상단 중앙의 차원의 문이 열릴 거야.",

      "루미: 차원의 문으로 가자!"

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
        "루미: 맵 중앙의 별빛 분수 아래쪽에서 E를 눌러 봐!",

      observatory:
        "루미: 왼쪽 위의 천체 관측대로 가자!",

      library:
        "루미: 오른쪽 중앙의 공중 정원 서고를 조사해 봐!",

      dock:
        "루미: 아래쪽 중앙의 하늘 선착장으로 가자!",

      altar:
        "루미: 오른쪽 위의 별 수정 제단을 조사해 봐!",

      exit:
        "루미: 위쪽 중앙의 차원의 문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 별빛이 이끄는 방향을 따라가 보자!"
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

      "차원의 문이 열리며 하늘길이 다시 이어졌다.",

      "루미: 다섯 번째 언어 수정도 복원됐어!",

      "나: 공중도시의 별빛도 원래대로 돌아왔어.",

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
        "중앙 별빛 분수의 단어 문제를 풀자.",

      observatory:
        "천체 관측대의 단어 문제를 풀자.",

      library:
        "공중 정원 서고의 표현 문제를 풀자.",

      dock:
        "하늘 선착장의 문장 배열 문제를 풀자.",

      altar:
        "별 수정 제단의 마지막 시험을 풀자.",

      exit:
        "상단 중앙의 차원의 문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "별빛 공중도시를 탐험하자.";

  }

}
