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
    super(MAP_ID);
  }


  /* =====================================================
     PRELOAD
  ====================================================== */

  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map06",
      `${base}assets/maps/map06.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map06_mage_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map06_mage_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map06_mage_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map06_mage_right",
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
      "map06"
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
            "MAP06 intro error:",
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


  /* =====================================================
     INPUT LOCK
  ====================================================== */

  lockInput() {

    this.inputLocked =
      true;


    this.player?.body
      ?.setVelocity(
        0,
        0
      );


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


    this.player?.body
      ?.setVelocity(
        0,
        0
      );

  }


  /* =====================================================
     COLLISIONS
  ====================================================== */

  createCollisions() {

    /*
      화면 외곽
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
      상단 선장실
    */

    this.addWall(
      385,
      75,
      245,
      85
    );


    /*
      왼쪽 위 조타륜 구조물
    */

    this.addWall(
      170,
      130,
      110,
      70
    );


    /*
      오른쪽 위 대포
    */

    this.addWall(
      650,
      125,
      120,
      65
    );


    /*
      중앙 돛대
    */

    this.addWall(
      385,
      285,
      65,
      140
    );


    /*
      왼쪽 화물구역
    */

    this.addWall(
      155,
      260,
      110,
      80
    );


    /*
      우측 지도 테이블
    */

    this.addWall(
      585,
      275,
      120,
      65
    );


    /*
      중앙 아래 쇠창살
    */

    this.addWall(
      385,
      370,
      120,
      55
    );


    /*
      하단 좌측 대포
    */

    this.addWall(
      225,
      410,
      80,
      55
    );


    /*
      하단 우측 대포
    */

    this.addWall(
      545,
      410,
      80,
      55
    );


    /*
      하단 중앙 조타륜
    */

    this.addWall(
      385,
      440,
      80,
      65
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

     물체 중심보다 접근 가능한 바닥 쪽에 배치
  ====================================================== */

  createInteractables() {

    /*
      왼쪽 중단 보물상자
    */

    this.addInteractable({

      id:
        "chest",

      label:
        "잠긴 보물상자",

      x:
        175,

      y:
        240,

      radius:
        70

    });


    /*
      오른쪽 중앙 파란 나침반
    */

    this.addInteractable({

      id:
        "compass",

      label:
        "폭풍 나침반",

      x:
        515,

      y:
        230,

      radius:
        72

    });


    /*
      오른쪽 항해지도 테이블
    */

    this.addInteractable({

      id:
        "map_table",

      label:
        "항해 지도",

      x:
        575,

      y:
        320,

      radius:
        72

    });


    /*
      아래쪽 중앙 조타륜
    */

    this.addInteractable({

      id:
        "helm",

      label:
        "갑판 조타륜",

      x:
        385,

      y:
        475,

      radius:
        72

    });


    /*
      상단 중앙 선장실 문
    */

    this.addInteractable({

      id:
        "cabin",

      label:
        "선장실",

      x:
        385,

      y:
        130,

      radius:
        75

    });


    /*
      상단 왼쪽 키 장치
    */

    this.addInteractable({

      id:
        "exit",

      label:
        "폭풍 조타 장치",

      x:
        170,

      y:
        170,

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
        175,
        240,
        20,
        0xffc84d,
        0.15
      )
        .setStrokeStyle(
          4,
          0xffec99,
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
            "#fff2c6",

          backgroundColor:
            "#151b28dd",

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

      chest: {
        x: 175,
        y: 240
      },

      compass: {
        x: 515,
        y: 230
      },

      map_table: {
        x: 575,
        y: 320
      },

      helm: {
        x: 385,
        y: 475
      },

      cabin: {
        x: 385,
        y: 130
      },

      exit: {
        x: 170,
        y: 170
      }

    };


    const position =
      positions[
        this.state.phase
      ];


    if (!position) {

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
        "map06_mage_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          385,
          515,
          "map06_mage_front"
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
          515,
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
          "map06_mage_left"
        )
      ) {

        this.player.setTexture(
          "map06_mage_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map06_mage_right"
        )
      ) {

        this.player.setTexture(
          "map06_mage_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map06_mage_back"
      )
    ) {

      this.player.setTexture(
        "map06_mage_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map06_mage_front"
      )
    ) {

      this.player.setTexture(
        "map06_mage_front"
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


    if (!object) {

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


    if (!object) {

      return;

    }


    this.interactionRunning =
      true;


    this.lockInput();


    try {

      if (
        object.id ===
        "chest"
      ) {

        await this.handleChest();

      }

      else if (
        object.id ===
        "compass"
      ) {

        await this.handleCompass();

      }

      else if (
        object.id ===
        "map_table"
      ) {

        await this.handleMapTable();

      }

      else if (
        object.id ===
        "helm"
      ) {

        await this.handleHelm();

      }

      else if (
        object.id ===
        "cabin"
      ) {

        await this.handleCabin();

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
        "MAP06 interaction error:",
        error
      );


      await GameUI.say(
        "루미: 번개 때문에 마법이 꼬였어. 다시 조사해 보자!"
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

      "쾅—! 거대한 번개가 바다를 갈랐다.",

      "나: 여긴 배 위잖아?! 파도가 엄청 커!",

      "루미: 여기는 폭풍 속 해적선이야!",

      "루미: 언어 수정이 깨지면서 배가 영원한 폭풍에 갇혀 버렸어.",

      "나: 폭풍을 멈추려면 어떻게 해야 해?",

      "루미: 항해 장치들을 복원해야 해. 먼저 왼쪽의 잠긴 보물상자를 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "chest";


    this.save();

  }


  /* =====================================================
     1. CHEST
     WORD -> KOREAN
  ====================================================== */

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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP06 단어와 한국어 뜻 데이터가 부족해."
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
        "chest"
      );


      await GameUI.say(
        "루미: 자물쇠가 열리지 않아. 단어 뜻을 다시 생각해 봐!"
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

      "루미: 오른쪽의 푸른 폭풍 나침반이 빛나고 있어!"

    ]);

  }


  /* =====================================================
     2. COMPASS
     KOREAN -> WORD
  ====================================================== */

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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP06 단어 데이터가 부족해."
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
        "compass"
      );


      await GameUI.say(
        "루미: 나침반이 빙빙 돌고 있어. 영어 단어를 다시 골라 봐!"
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

      "나: 저쪽 항해 지도가 빛나고 있어.",

      "루미: 오른쪽 지도 테이블로 가자!"

    ]);

  }


  /* =====================================================
     3. MAP TABLE
     EXPRESSION -> KOREAN
  ====================================================== */

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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP06 영어 표현 데이터가 부족해."
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
        "map_table"
      );


      await GameUI.say(
        "루미: 항로가 나타나지 않아. 문장의 뜻을 다시 생각해 봐!"
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

      "두 번째 말의 조각이 지도 위에서 떠올랐다.",

      "루미: 이제 아래쪽 중앙 조타륜으로 가자!"

    ]);

  }


  /* =====================================================
     4. HELM
     WORD ORDER
  ====================================================== */

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


    if (!expression) {

      await GameUI.say(
        "루미: 문장 배열에 사용할 MAP06 영어 표현이 부족해."
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
        "helm"
      );


      await GameUI.say(
        "루미: 조타륜이 다시 잠겼어. 문장 순서를 다시 확인해 보자!"
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

      "조타륜이 돌아가자 배가 거대한 파도를 피했다.",

      "나: 선장실 문이 열리는 소리가 들렸어!",

      "루미: 위쪽 중앙 선장실로 가자!"

    ]);

  }


  /* =====================================================
     5. CAPTAIN CABIN
     RANDOM REVIEW
  ====================================================== */

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


    if (!quiz) {

      await GameUI.say(
        "루미: 마지막 문제를 만들 MAP06 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(
        `선장의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!success) {

      this.markWrong(
        "cabin"
      );


      await GameUI.say(
        "루미: 선장실의 봉인이 아직 풀리지 않았어!"
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

      "선장실 안에서 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 이제 폭풍을 끝낼 수 있어.",

      "루미: 왼쪽 위의 폭풍 조타 장치로 가자!"

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

      chest:
        "루미: 왼쪽 중간의 금빛 자물쇠 보물상자를 찾아봐!",

      compass:
        "루미: 오른쪽 중앙의 푸른 폭풍 나침반으로 가자!",

      map_table:
        "루미: 오른쪽의 항해 지도 테이블을 조사해 봐!",

      helm:
        "루미: 아래쪽 중앙의 큰 조타륜으로 가자!",

      cabin:
        "루미: 위쪽 중앙 선장실 문을 조사해 봐!",

      exit:
        "루미: 왼쪽 위 조타 장치로 가서 폭풍을 끝내자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 갑판의 항해 장치들을 살펴보자!"
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

      "폭풍 조타 장치가 푸르게 빛났다.",

      "거대한 번개가 멀어지고 파도가 천천히 잦아들었다.",

      "루미: 여섯 번째 언어 수정도 복원됐어!",

      "나: 드디어 바다가 조용해졌네.",

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

      chest:
        "잠긴 보물상자의 단어 문제를 풀자.",

      compass:
        "폭풍 나침반의 단어 문제를 풀자.",

      map_table:
        "항해 지도의 표현 문제를 풀자.",

      helm:
        "조타륜의 문장 배열 문제를 풀자.",

      cabin:
        "선장실의 마지막 시험을 풀자.",

      exit:
        "폭풍 조타 장치로 폭풍을 끝내자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "폭풍 속 해적선을 탐험하자.";

  }

}
