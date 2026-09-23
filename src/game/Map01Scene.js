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


const MAP_ID = "MAP01";


export default class Map01Scene extends Phaser.Scene {

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
      "map01",
      `${base}assets/maps/map01.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "mage_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "mage_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "mage_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "mage_right",
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


    this.obstacles =
      [];


    this.interactables =
      [];


    /* -----------------------------------------------------
       BACKGROUND
    ------------------------------------------------------ */

    this.add.image(
      384,
      288,
      "map01"
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

    this.createGuides();

    this.createPlayer();

    this.createInput();

    this.updateHUD();


    this.time.delayedCall(
      250,
      async () => {

        if (
          !this.state.introDone
        ) {

          await this.playIntro();

        }


        this.inputLocked =
          false;

      }
    );

  }


  /* =====================================================
     STATE
  ====================================================== */

  prepareState() {

    const validPhases = [
      "blackboard",
      "desk_quiz",
      "desk_push",
      "locker",
      "chest_quiz",
      "chest",
      "final",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "blackboard";

    }


    this.state.introDone ??=
      false;


    this.state.shards ??=
      0;


    this.state.deskPushes ??=
      0;


    this.state.targetChest ??=
      null;


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


    /* 교탁 */

    this.addWall(
      378,
      151,
      275,
      73
    );


    /* 책상 1열 */

    [
      235,
      342,
      448,
      556
    ].forEach(
      x => {

        this.addWall(
          x,
          241,
          58,
          45
        );

      }
    );


    /* 책상 2열 */

    [
      235,
      342,
      450,
      556
    ].forEach(
      x => {

        this.addWall(
          x,
          328,
          58,
          45
        );

      }
    );


    /* 왼쪽 아래 책장 */

    this.addWall(
      100,
      464,
      120,
      84
    );


    /* 사물함 */

    this.addWall(
      292,
      468,
      105,
      82
    );


    /* 보물상자 구역 */

    this.addWall(
      548,
      466,
      185,
      74
    );


    /* 오른쪽 벽 장식 */

    this.addWall(
      727,
      307,
      42,
      185
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

    this.addInteractable({

      id:
        "blackboard",

      label:
        "칠판",

      x:
        365,

      y:
        115,

      radius:
        110

    });


    this.addInteractable({

      id:
        "glowing_desk",

      label:
        "빛나는 책상",

      x:
        450,

      y:
        328,

      radius:
        88

    });


    this.addInteractable({

      id:
        "locker",

      label:
        "마법 사물함",

      x:
        292,

      y:
        456,

      radius:
        100

    });


    this.addInteractable({

      id:
        "red_chest",

      type:
        "chest",

      color:
        "red",

      label:
        "붉은 상자",

      x:
        484,

      y:
        465,

      radius:
        72

    });


    this.addInteractable({

      id:
        "blue_chest",

      type:
        "chest",

      color:
        "blue",

      label:
        "푸른 상자",

      x:
        548,

      y:
        465,

      radius:
        72

    });


    this.addInteractable({

      id:
        "black_chest",

      type:
        "chest",

      color:
        "black",

      label:
        "검은 상자",

      x:
        612,

      y:
        465,

      radius:
        72

    });


    this.addInteractable({

      id:
        "exit",

      label:
        "봉인된 문",

      x:
        635,

      y:
        108,

      radius:
        100

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
     GUIDES
  ====================================================== */

  createGuides() {

    this.deskGuide =
      this.add.rectangle(
        450,
        328,
        68,
        56
      );


    this.deskGuide
      .setStrokeStyle(
        4,
        0xffe36a,
        1
      )
      .setFillStyle(
        0xffd850,
        0.03
      )
      .setDepth(
        40
      )
      .setVisible(
        false
      );


    this.tweens.add({

      targets:
        this.deskGuide,

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
            "#fff2a8",

          backgroundColor:
            "#10182bcc",

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


    this.updateGuides();

  }


  updateGuides() {

    this.deskGuide
      ?.setVisible(

        this.state.phase ===
          "desk_quiz"

        ||

        this.state.phase ===
          "desk_push"

      );

  }


  /* =====================================================
     PLAYER
  ====================================================== */

  createPlayer() {

    if (
      this.textures.exists(
        "mage_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          382,
          525,
          "mage_front"
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
          382,
          525,
          26,
          40,
          0x386ed0
        );


      this.physics.add.existing(
        this.player
      );

    }


    this.player
      .setDepth(
        100
      );


    this.player.body
      .setSize(
        20,
        20
      );


    this.player.body
      .setCollideWorldBounds(
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


  /* =====================================================
     UPDATE
  ====================================================== */

 update() {

  if (
    !this.player?.body
  ) {

    return;

  }


  /*
    MAP02 이후처럼 recoverStuckInput()이 있는 Scene에서는
    자동 복구도 같이 실행.
    없는 Scene에서는 그냥 넘어감.
  */

  if (
    typeof this.recoverStuckInput ===
    "function"
  ) {

    this.recoverStuckInput();

  }


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


  /*
    대화/퀴즈 중에는 이동 금지.
    이때 눌린 조사 입력도 버린다.
  */

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


  /*
    MAP12 보스전에서는 이동하지 않음.
    다른 맵에서는 phase가 boss가 아니므로 영향 없음.
  */

  if (
    this.state?.phase ===
    "boss"
  ) {

    this.player.body.setVelocity(
      0,
      0
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


  /* =========================
     LEFT / RIGHT
  ========================= */

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


  /* =========================
     UP / DOWN
  ========================= */

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


  /*
    대각선 이동 속도 보정
  */

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


  /* =========================
     INTERACT
  ========================= */

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


  /*
    터치 조사 버튼은 1회 입력이므로
    읽은 직후 반드시 false 처리
  */

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

  /* =====================================================
     DIRECTION
  ====================================================== */

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
          "mage_left"
        )
      ) {

        this.player.setTexture(
          "mage_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "mage_right"
        )
      ) {

        this.player.setTexture(
          "mage_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "mage_back"
      )
    ) {

      this.player.setTexture(
        "mage_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "mage_front"
      )
    ) {

      this.player.setTexture(
        "mage_front"
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

        bestDistance =
          distance;


        nearest =
          object;

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
    ) {

      return;

    }


    const object =
      this.nearestObject();


    if (!object) {

      return;

    }


    this.inputLocked =
      true;


    this.player.body
      .setVelocity(
        0,
        0
      );


    try {

      if (
        object.id ===
        "blackboard"
      ) {

        await this.handleBlackboard();

      }

      else if (
        object.id ===
        "glowing_desk"
      ) {

        await this.handleDesk();

      }

      else if (
        object.id ===
        "locker"
      ) {

        await this.handleLocker();

      }

      else if (
        object.type ===
        "chest"
      ) {

        await this.handleChest(
          object
        );

      }

      else if (
        object.id ===
        "exit"
      ) {

        await this.handleExit();

      }

    }

    finally {

      this.inputLocked =
        false;


      this.updateGuides();

    }

  }


  /* =====================================================
     INTRO
  ====================================================== */

  async playIntro() {

    await GameUI.say([

      "…눈을 뜨자 낯선 교실이 보였다.",

      "나: 여긴 어디지?",

      "루미: 언어 수정이 깨지면서 우리가 책 속 세계에 떨어졌어!",

      "루미: 이 교실에는 세 개의 말의 조각이 숨어 있어.",

      "나: 어떻게 찾으면 돼?",

      "루미: 영어 문제를 풀면 마법 장치가 반응할 거야.",

      "루미: 먼저 앞쪽 칠판을 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "blackboard";


    this.save();

  }


  /* =====================================================
     PUZZLE 1
     ENGLISH WORD -> KOREAN
  ====================================================== */

  async handleBlackboard() {

    if (
      this.state.phase !==
      "blackboard"
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
        "루미: MAP01의 단어와 한국어 뜻 데이터가 부족해."
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
        "blackboard"
      );


      await GameUI.say(
        "루미: 영어 단어와 한국어 뜻을 다시 생각해 봐!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "blackboard"
    );


    this.state.shards =
      1;


    this.state.phase =
      "desk_quiz";


    this.save();


    await GameUI.say([

      "루미: 정답이야! 첫 번째 말의 조각이 나타났어.",

      "나: 하나 찾았다!",

      "루미: 이번에는 가운데 아래쪽의 빛나는 책상으로 가자!"

    ]);

  }


  /* =====================================================
     PUZZLE 2
     KOREAN -> ENGLISH WORD
  ====================================================== */

  async handleDesk() {

    if (
      this.state.phase !==
        "desk_quiz"

      &&

      this.state.phase !==
        "desk_push"
    ) {

      await this.showHint();

      return;

    }


    /* -----------------------------------------------------
       QUIZ
    ------------------------------------------------------ */

    if (
      this.state.phase ===
      "desk_quiz"
    ) {

      const quiz =
        QuizEngine.koreanToWord(

          this.content.words,

          this.state.usedWords

        );


      if (!quiz) {

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


      if (!success) {

        this.markWrong(
          "desk_quiz"
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
        "desk_quiz"
      );


      this.state.phase =
        "desk_push";


      this.save();


      await GameUI.say([

        "루미: 정답!",

        "나: 이 책상 아래에서 뭔가 빛나는 것 같아.",

        "루미: 책상을 두 번 밀어보자!"

      ]);


      return;

    }


    /* -----------------------------------------------------
       PUSH
    ------------------------------------------------------ */

    this.state.deskPushes++;


    this.cameras.main.shake(
      100,
      0.006
    );


    if (
      this.state.deskPushes <
      2
    ) {

      this.save();


      await GameUI.say(
        "쿵! 책상이 조금 움직였다. 한 번 더 밀어보자."
      );


      return;

    }


    this.state.deskPushes =
      2;


    this.state.phase =
      "locker";


    this.save();


    await GameUI.say([

      "쿵!",

      "책상 아래에서 작은 열쇠가 나타났다.",

      "나: 열쇠다!",

      "루미: 왼쪽 아래 회색 사물함에 써보자!"

    ]);

  }


  /* =====================================================
     PUZZLE 3
     WORD ORDER
  ====================================================== */

  async handleLocker() {

    if (
      this.state.phase !==
      "locker"
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
        "루미: MAP01의 영어 표현과 한국어 뜻 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    await GameUI.say(
      `루미: "${expression.korean}"라는 뜻이 되도록 영어 문장을 완성해 봐!`
    );


    const success =
      await GameUI.wordOrder(
        expression.english
      );


    if (!success) {

      this.markWrong(
        "locker"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "locker"
    );


    this.state.shards =
      2;


    this.state.phase =
      "chest_quiz";


    this.save();


    await GameUI.say([

      "루미: 두 번째 말의 조각을 찾았어!",

      "나: 이제 하나 남았네.",

      "루미: 오른쪽 아래의 보물상자들을 조사해 보자!"

    ]);

  }


  /* =====================================================
     PUZZLE 4
     EXPRESSION -> KOREAN
  ====================================================== */

  async handleChest(
    object
  ) {

    /* -----------------------------------------------------
       QUIZ FIRST
    ------------------------------------------------------ */

    if (
      this.state.phase ===
      "chest_quiz"
    ) {

      const quiz =
        QuizEngine.expressionToKorean(

          this.content.expressions,

          this.state.usedExpressions

        );


      if (!quiz) {

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


      if (!success) {

        this.markWrong(
          "chest_quiz"
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
        "chest_quiz"
      );


      this.state.targetChest =
        Phaser.Utils.Array.GetRandom([
          "red",
          "blue",
          "black"
        ]);


      this.state.phase =
        "chest";


      this.save();


      await GameUI.say([

        "루미: 정답!",

        `루미: ${chestName(this.state.targetChest)} 상자에서 강한 마력이 느껴져!`,

        `루미: ${chestName(this.state.targetChest)} 상자를 조사해 봐.`

      ]);


      return;

    }


    /* -----------------------------------------------------
       FIND CORRECT CHEST
    ------------------------------------------------------ */

    if (
      this.state.phase !==
      "chest"
    ) {

      await this.showHint();

      return;

    }


    if (
      object.color !==
      this.state.targetChest
    ) {

      this.state.wrongAttempts++;


      this.save();


      await GameUI.say(
        `루미: 그 상자가 아니야. ${chestName(this.state.targetChest)} 상자를 찾아봐!`
      );


      return;

    }


    this.state.shards =
      3;


    this.state.phase =
      "final";


    this.save();


    await GameUI.say([

      "상자를 열자 세 번째 말의 조각이 나타났다!",

      "나: 세 개를 전부 모았어!",

      "루미: 이제 마지막 복습 문제만 풀면 봉인이 풀릴 거야!"

    ]);


    await this.runFinalQuiz();

  }


  /* =====================================================
     FINAL REVIEW
  ====================================================== */

  async runFinalQuiz() {

    if (
      this.state.phase !==
      "final"
    ) {

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
        "루미: 복습 문제를 만들 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const success =
      await GameUI.choice(

        `마지막 복습!\n${quiz.question}`,

        quiz.options,

        quiz.correctIndex

      );


    if (!success) {

      this.markWrong(
        "final"
      );


      await GameUI.say(
        "루미: 거의 다 왔어. 마지막 문제를 다시 풀어보자!"
      );


      return;

    }


    this.markCorrect(
      "final"
    );


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "정답!",

      "교실 전체에 푸른 빛이 퍼졌다.",

      "나: 문에 걸린 봉인이 사라졌어!",

      "루미: 오른쪽 위 봉인된 문으로 가자!"

    ]);

  }


  /* =====================================================
     EXIT
  ====================================================== */

  async handleExit() {

    if (
      this.state.phase ===
      "final"
    ) {

      await this.runFinalQuiz();

      return;

    }


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

      blackboard:
        "루미: 교실 앞쪽의 큰 칠판을 조사해 봐!",

      desk_quiz:
        "루미: 아래쪽 책상 줄의 노란빛으로 빛나는 책상을 찾아봐!",

      desk_push:
        "루미: 방금 문제를 풀었던 빛나는 책상을 다시 조사해!",

      locker:
        "루미: 왼쪽 아래 책장 옆의 회색 사물함으로 가자!",

      chest_quiz:
        "루미: 오른쪽 아래 보물상자 중 하나를 조사해 봐!",

      chest:
        `루미: ${chestName(this.state.targetChest)} 상자를 찾아봐!`,

      final:
        "루미: 마지막 복습 문제를 풀어야 해!",

      exit:
        "루미: 오른쪽 위의 푸른 봉인문으로 가자!"

    };


    await GameUI.say(

      hints[
        this.state.phase
      ]
      ||
      "루미: 주변을 잘 살펴보자!"

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

      "봉인된 문이 천천히 열렸다.",

      "루미: 첫 번째 언어 수정이 복원됐어!",

      "나: 좋아. 다음 세계로 가자!",

      nextMap
        ? `루미: 다음 목적지는 ${nextMap}이야!`
        : "루미: 모든 언어 수정을 복원했어!"

    ]);


    /*
      MAP02가 등록되어 있으면
      자동 이동
    */

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


    /*
      다음 맵이 아직 없으면
      결과 화면
    */

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

    this.updateGuides();

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

      blackboard:
        "칠판의 단어 뜻 문제를 풀자.",

      desk_quiz:
        "빛나는 책상의 단어 문제를 풀자.",

      desk_push:
        `빛나는 책상을 밀자. ${this.state.deskPushes}/2`,

      locker:
        "사물함의 문장 배열 문제를 풀자.",

      chest_quiz:
        "보물상자의 영어 표현 문제를 풀자.",

      chest:
        `${chestName(this.state.targetChest)} 상자를 조사하자.`,

      final:
        "마지막 복습 문제를 풀자.",

      exit:
        "오른쪽 위 봉인된 문으로 나가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "교실을 탐험하자.";

  }

}


/* =====================================================
   CHEST NAME
===================================================== */

function chestName(
  color
) {

  switch (
    color
  ) {

    case "red":
      return "붉은";

    case "blue":
      return "푸른";

    case "black":
      return "검은";

    default:
      return "빛나는";

  }

}
