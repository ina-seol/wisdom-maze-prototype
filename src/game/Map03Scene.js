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


const MAP_ID = "MAP03";


export default class Map03Scene extends Phaser.Scene {

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
      "map03",
      `${base}assets/maps/map03.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map03_mage_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map03_mage_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map03_mage_left",
        sprites.left
      );
    }

    if (sprites?.right) {
      this.load.image(
        "map03_mage_right",
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
      "map03"
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
            "MAP03 intro error:",
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
      "sign",
      "well",
      "house",
      "shrine",
      "barn",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "sign";

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

    /* 외벽 */

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


    /* 왼쪽 위 집 */

    this.addWall(
      145,
      195,
      140,
      82
    );


    /* 오른쪽 위 집 */

    this.addWall(
      555,
      175,
      145,
      90
    );


    /* 왼쪽 중단 집 */

    this.addWall(
      108,
      315,
      130,
      76
    );


    /* 오른쪽 아래 창고 */

    this.addWall(
      640,
      340,
      145,
      92
    );


    /* 중앙 우물 */

    this.addWall(
      382,
      267,
      74,
      62
    );


    /* 왼쪽 아래 작은 집/탁자 */

    this.addWall(
      130,
      430,
      120,
      74
    );


    /* 하단 중앙 왼쪽 나무 */

    this.addWall(
      270,
      425,
      90,
      88
    );


    /* 중앙 오른쪽 큰 나무 */

    this.addWall(
      483,
      355,
      105,
      95
    );


    /* 오른쪽 위 정원 울타리 */

    this.addWall(
      605,
      216,
      130,
      35
    );


    /* 왼쪽 상단 숲 바위 */

    this.addWall(
      73,
      102,
      70,
      150
    );


    /* 오른쪽 폭포/절벽 */

    this.addWall(
      728,
      115,
      45,
      210
    );


    /* 하단 강 가장자리 일부 */

    this.addWall(
      180,
      518,
      225,
      36
    );


    this.addWall(
      595,
      518,
      210,
      36
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
     물체 중심이 아니라 접근 가능한 바닥 좌표
  ====================================================== */

  createInteractables() {

    /* 중앙 왼쪽 표지판 */

    this.addInteractable({

      id:
        "sign",

      label:
        "낡은 표지판",

      x:
        292,

      y:
        270,

      radius:
        58

    });


    /* 중앙 우물 */

    this.addInteractable({

      id:
        "well",

      label:
        "푸른 우물",

      x:
        382,

      y:
        315,

      radius:
        62

    });


    /* 오른쪽 위 집 */

    this.addInteractable({

      id:
        "house",

      label:
        "불빛이 새는 집",

      x:
        557,

      y:
        225,

      radius:
        70

    });


    /* 왼쪽 위 돌 제단 */

    this.addInteractable({

      id:
        "shrine",

      label:
        "안개 속 석상",

      x:
        145,

      y:
        105,

      radius:
        72

    });


    /* 오른쪽 아래 잠긴 창고 */

    this.addInteractable({

      id:
        "barn",

      label:
        "잠긴 창고",

      x:
        625,

      y:
        390,

      radius:
        72

    });


    /* 맵 상단 중앙 덩굴문 */

    this.addInteractable({

      id:
        "exit",

      label:
        "덩굴로 봉인된 문",

      x:
        385,

      y:
        105,

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
        292,
        270,
        20,
        0x83d88f,
        0.15
      )
        .setStrokeStyle(
          4,
          0xc5ffb9,
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
            "#eaffdf",

          backgroundColor:
            "#132017dd",

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

      sign: {
        x: 292,
        y: 270
      },

      well: {
        x: 382,
        y: 315
      },

      house: {
        x: 557,
        y: 225
      },

      shrine: {
        x: 145,
        y: 105
      },

      barn: {
        x: 625,
        y: 390
      },

      exit: {
        x: 385,
        y: 105
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
        "map03_mage_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map03_mage_front"
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
      Math.abs(vx)
      >
      Math.abs(vy)
    ) {

      if (
        vx < 0
        &&
        this.textures.exists(
          "map03_mage_left"
        )
      ) {

        this.player.setTexture(
          "map03_mage_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map03_mage_right"
        )
      ) {

        this.player.setTexture(
          "map03_mage_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map03_mage_back"
      )
    ) {

      this.player.setTexture(
        "map03_mage_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map03_mage_front"
      )
    ) {

      this.player.setTexture(
        "map03_mage_front"
      );

    }

  }


  /* =====================================================
     INTERACTION SEARCH
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
        "sign"
      ) {

        await this.handleSign();

      }

      else if (
        object.id ===
        "well"
      ) {

        await this.handleWell();

      }

      else if (
        object.id ===
        "house"
      ) {

        await this.handleHouse();

      }

      else if (
        object.id ===
        "shrine"
      ) {

        await this.handleShrine();

      }

      else if (
        object.id ===
        "barn"
      ) {

        await this.handleBarn();

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
        "MAP03 interaction error:",
        error
      );


      await GameUI.say(
        "루미: 안개 마법이 잠깐 꼬였어. 다시 조사해 보자!"
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

      "짙은 안개가 마을 전체를 감싸고 있었다.",

      "나: 앞이 잘 안 보여.",

      "루미: 여기는 안개 낀 숲속 마을이야.",

      "루미: 언어 수정이 깨지면서 마을 사람들이 길을 잃었대.",

      "나: 이번에도 말의 조각 세 개를 찾으면 되는 거지?",

      "루미: 맞아! 우선 중앙 왼쪽의 낡은 표지판을 조사해 보자."

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "sign";


    this.save();

  }


  /* =====================================================
     1. SIGN
     WORD -> KOREAN
  ====================================================== */

  async handleSign() {

    if (
      this.state.phase !==
      "sign"
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
        "루미: MAP03 단어와 한국어 뜻 데이터가 부족해."
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
        "sign"
      );


      await GameUI.say(
        "루미: 표지판의 단어 뜻을 다시 생각해 봐!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "sign"
    );


    this.state.shards =
      1;


    this.state.phase =
      "well";


    this.save();


    await GameUI.say([

      "표지판의 글자가 빛나며 첫 번째 말의 조각이 나타났다.",

      "루미: 좋아! 이제 마을 중앙의 우물로 가자."

    ]);

  }


  /* =====================================================
     2. WELL
     KOREAN -> WORD
  ====================================================== */

  async handleWell() {

    if (
      this.state.phase !==
      "well"
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
        "루미: MAP03 단어 데이터가 부족해."
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
        "well"
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
      "well"
    );


    this.state.phase =
      "house";


    this.save();


    await GameUI.say([

      "우물 속 푸른빛이 마을 오른쪽으로 흘러갔다.",

      "나: 저 집 창문이 갑자기 밝아졌어.",

      "루미: 오른쪽 위의 불빛이 새는 집으로 가자!"

    ]);

  }


  /* =====================================================
     3. HOUSE
     EXPRESSION -> KOREAN
  ====================================================== */

  async handleHouse() {

    if (
      this.state.phase !==
      "house"
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
        "루미: MAP03 영어 표현 데이터가 부족해."
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
        "house"
      );


      await GameUI.say(
        "루미: 영어 표현 전체의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "house"
    );


    this.state.shards =
      2;


    this.state.phase =
      "shrine";


    this.save();


    await GameUI.say([

      "집 문 위의 룬 문자가 사라졌다.",

      "두 번째 말의 조각이 모습을 드러냈다.",

      "루미: 다음 단서는 왼쪽 위의 오래된 석상에서 느껴져!"

    ]);

  }


  /* =====================================================
     4. SHRINE
     WORD ORDER
  ====================================================== */

  async handleShrine() {

    if (
      this.state.phase !==
      "shrine"
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
        "루미: 문장 배열에 사용할 MAP03 영어 표현이 부족해."
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
        "shrine"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "shrine"
    );


    this.state.phase =
      "barn";


    this.save();


    await GameUI.say([

      "석상에 새겨진 문양이 초록빛으로 빛났다.",

      "나: 오른쪽 아래 창고에서 소리가 들렸어.",

      "루미: 잠긴 창고를 조사해 보자!"

    ]);

  }


  /* =====================================================
     5. BARN
     RANDOM REVIEW
  ====================================================== */

  async handleBarn() {

    if (
      this.state.phase !==
      "barn"
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
        "루미: 마지막 문제를 만들 MAP03 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(
        `창고의 마지막 봉인!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
    ) {

      this.markWrong(
        "barn"
      );


      await GameUI.say(
        "루미: 자물쇠가 아직 풀리지 않았어. 다시 도전해 보자!"
      );


      return;

    }


    this.markCorrect(
      "barn"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "철컥!",

      "잠긴 창고가 열리며 세 번째 말의 조각이 떠올랐다.",

      "나: 이번에도 세 개를 전부 찾았어!",

      "루미: 위쪽 중앙의 덩굴문으로 가자!"

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

      sign:
        "루미: 중앙 왼쪽의 낡은 표지판 앞에서 E를 눌러 봐!",

      well:
        "루미: 마을 중앙의 푸른 우물 아래쪽에서 조사해 봐!",

      house:
        "루미: 오른쪽 위의 불빛이 새는 집으로 가자!",

      shrine:
        "루미: 왼쪽 위 절벽의 오래된 석상을 조사해 봐!",

      barn:
        "루미: 오른쪽 아래의 잠긴 창고 앞으로 가자!",

      exit:
        "루미: 위쪽 중앙의 덩굴로 봉인된 문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 안개 속 길을 잘 살펴보자!"
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

      "덩굴이 천천히 갈라지며 숲길이 열렸다.",

      "루미: 세 번째 언어 수정도 복원됐어!",

      "나: 안개도 조금씩 걷히고 있어.",

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

      sign:
        "낡은 표지판의 단어 문제를 풀자.",

      well:
        "중앙 우물의 단어 문제를 풀자.",

      house:
        "불빛이 새는 집의 표현 문제를 풀자.",

      shrine:
        "안개 속 석상의 문장 배열 문제를 풀자.",

      barn:
        "잠긴 창고의 마지막 봉인을 풀자.",

      exit:
        "위쪽 중앙의 덩굴문으로 나가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "안개 낀 마을을 탐험하자.";

  }

}
