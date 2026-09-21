import Phaser from "phaser";

import {
  getUnit1Content,
  saveMapProgress,
  saveRecord,
  shuffle
} from "../data.js";


export default class Map01Scene extends Phaser.Scene {

  constructor() {

    super("MAP01");

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


    this.state =
      window.WISDOM_MAP_STATE;


    this.content =
      getUnit1Content();


    this.prepareState();


    this.inputLocked =
      true;


    this.obstacles =
      [];


    this.interactables =
      [];


    /* MAP */

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


    this.createCollisionAreas();

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

      "chest",

      "final",

      "exit"

    ];


    this.state.introDone ??=
      false;


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "blackboard";

    }


    this.state.shards ??=
      0;


    this.state.deskPushes ??=
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


    this.state.completed ??=
      false;


    this.state.sessionStartedAt ??=
      Date.now();


    if (
      !this.state.blackboardWord
    ) {

      this.state.blackboardWord =
        this.pickRandomWord();

    }


    if (
      !this.state.deskExpression
    ) {

      this.state.deskExpression =
        this.pickRandomExpression();

    }


    if (
      !this.state.lockerExpression
    ) {

      this.state.lockerExpression =
        this.pickRandomExpression(
          this.state.deskExpression
        );

    }


    if (
      !this.state.finalWord
    ) {

      this.state.finalWord =
        this.pickRandomWord(
          this.state.blackboardWord
        );

    }


    if (
      !this.state.targetChest
    ) {

      this.state.targetChest =
        Phaser.Utils.Array.GetRandom([
          "red",
          "blue",
          "black"
        ]);

    }

  }


  /* =====================================================
     COLLISION
  ====================================================== */

  createCollisionAreas() {

    /* 외벽 */

    this.addObstacle(
      384,
      8,
      768,
      16
    );


    this.addObstacle(
      8,
      288,
      16,
      576
    );


    this.addObstacle(
      760,
      288,
      16,
      576
    );


    this.addObstacle(
      384,
      568,
      768,
      16
    );


    /*
      상단 칠판 벽
    */

    this.addObstacle(
      385,
      61,
      405,
      70
    );


    /*
      왼쪽 위 장식장
    */

    this.addObstacle(
      140,
      108,
      105,
      68
    );


    /*
      교탁
    */

    this.addObstacle(
      378,
      151,
      275,
      73
    );


    /*
      책상 1열
    */

    this.addObstacle(
      235,
      241,
      58,
      45
    );


    this.addObstacle(
      342,
      241,
      58,
      45
    );


    this.addObstacle(
      448,
      241,
      58,
      45
    );


    this.addObstacle(
      556,
      241,
      58,
      45
    );


    /*
      책상 2열
    */

    this.addObstacle(
      235,
      328,
      58,
      45
    );


    this.addObstacle(
      342,
      328,
      58,
      45
    );


    /*
      빛나는 책상
    */

    this.addObstacle(
      450,
      328,
      58,
      45
    );


    this.addObstacle(
      556,
      328,
      58,
      45
    );


    /*
      책장
    */

    this.addObstacle(
      100,
      464,
      120,
      84
    );


    /*
      사물함
    */

    this.addObstacle(
      292,
      468,
      105,
      82
    );


    /*
      보물상자
    */

    this.addObstacle(
      548,
      466,
      185,
      74
    );


    /*
      오른쪽 장식
    */

    this.addObstacle(
      727,
      307,
      42,
      185
    );

  }


  addObstacle(
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
      칠판
    */

    this.addInteractable({

      id:
        "blackboard",

      label:
        "칠판",

      x:
        365,

      y:
        112,

      radius:
        110

    });


    /*
      빛나는 책상

      하단 책상줄
      왼쪽에서 세 번째
    */

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
        92

    });


    /*
      사물함
    */

    this.addInteractable({

      id:
        "locker",

      label:
        "마법 사물함",

      x:
        292,

      y:
        455,

      radius:
        100

    });


    /*
      상자
    */

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
        485,

      y:
        463,

      radius:
        82

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
        463,

      radius:
        82

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
        463,

      radius:
        82

    });


    /*
      출구
    */

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
        105

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

      alpha:
        {
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


    this.interactionPrompt =
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

    this.deskGuide?.setVisible(

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


    this.player.setDepth(
      100
    );


    this.player.body.setSize(
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


    if (
      this.inputLocked
    ) {

      this.player.body
        .setVelocity(
          0,
          0
        );


      this.interactionPrompt
        ?.setVisible(
          false
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
      vx !== 0 &&
      vy !== 0
    ) {

      vx *=
        0.707;

      vy *=
        0.707;

    }


    this.player.body
      .setVelocity(
        vx,
        vy
      );


    this.updateDirection(
      vx,
      vy
    );


    this.updateInteractionPrompt();


    if (
      Phaser.Input.Keyboard
        .JustDown(
          this.keys.interact
        )

      ||

      Phaser.Input.Keyboard
        .JustDown(
          this.keys.enter
        )
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
      Math.abs(vx) >
      Math.abs(vy)
    ) {

      if (
        vx < 0 &&
        this.textures.exists(
          "mage_left"
        )
      ) {

        this.player.setTexture(
          "mage_left"
        );

      }

      else if (
        vx > 0 &&
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
      vy < 0 &&
      this.textures.exists(
        "mage_back"
      )
    ) {

      this.player.setTexture(
        "mage_back"
      );

    }

    else if (
      vy > 0 &&
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

        bestDistance =
          distance;


        nearest =
          object;

      }

    }


    return nearest;

  }


  updateInteractionPrompt() {

    const object =
      this.nearestObject();


    if (!object) {

      this.interactionPrompt
        ?.setVisible(
          false
        );

      return;

    }


    this.interactionPrompt
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

      await this.handleObject(
        object
      );

    }

    finally {

      this.inputLocked =
        false;


      this.updateGuides();

    }

  }


  /* =====================================================
     ROUTER
  ====================================================== */

  async handleObject(
    object
  ) {

    if (
      object.id ===
      "blackboard"
    ) {

      await this.handleBlackboard();

      return;

    }


    if (
      object.id ===
      "glowing_desk"
    ) {

      await this.handleGlowingDesk();

      return;

    }


    if (
      object.id ===
      "locker"
    ) {

      await this.handleLocker();

      return;

    }


    if (
      object.type ===
      "chest"
    ) {

      await this.handleChest(
        object
      );

      return;

    }


    if (
      object.id ===
      "exit"
    ) {

      await this.handleExit();

    }

  }


  /* =====================================================
     INTRO
  ====================================================== */

  async playIntro() {

    await GameUI.say([

      "…눈을 뜨자 낯선 교실이 보였다.",

      "나: 여긴 어디지?",

      "루미: 드디어 정신이 들었구나!",

      "루미: 언어 수정이 깨지면서 우리가 책 속 세계에 떨어진 것 같아.",

      "나: 그럼 여기서 빠져나가려면 어떻게 해야 해?",

      "루미: 이 교실에 숨겨진 세 개의 말의 조각을 모으면 돼!",

      "루미: 먼저 앞쪽 칠판을 조사해 봐!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "blackboard";


    this.save();

  }


  /* =====================================================
     BLACKBOARD
  ====================================================== */

  async handleBlackboard() {

    if (
      this.state.phase !==
      "blackboard"
    ) {

      await this.phaseHint();

      return;

    }


    const target =
      this.state.blackboardWord;


    const options =
      buildSpellingOptions(
        target
      );


    this.state.questionsShown++;


    const answer =
      await GameUI.choice(

        `다음 중 "${target}"와 철자가 정확히 같은 단어를 고르세요.`,

        options,

        options.indexOf(
          target
        )

      );


    if (!answer) {

      this.wrong(
        "blackboard"
      );


      await GameUI.say(
        "루미: 철자를 한 글자씩 천천히 비교해 봐!"
      );


      return;

    }


    this.correct(
      "blackboard"
    );


    this.state.shards =
      1;


    this.state.phase =
      "desk_quiz";


    this.save();


    await GameUI.say([

      "루미: 정답이야! 첫 번째 말의 조각을 찾았어!",

      "나: 하나 찾았다!",

      "루미: 가운데 아래쪽에 노란빛으로 빛나는 책상이 보여?",

      "루미: 그 책상으로 가보자!"

    ]);

  }


  /* =====================================================
     GLOWING DESK
  ====================================================== */

  async handleGlowingDesk() {

    if (
      this.state.phase !==
        "desk_quiz"

      &&

      this.state.phase !==
        "desk_push"
    ) {

      await this.phaseHint();

      return;

    }


    if (
      this.state.phase ===
      "desk_quiz"
    ) {

      const sentence =
        this.state.deskExpression;


      const question =
        buildMissingWordQuestion(
          sentence,
          this.content.words
        );


      this.state.questionsShown++;


      const result =
        question

          ? await GameUI.choice(

              question.prompt,

              question.options,

              question.correctIndex

            )

          : await GameUI.wordOrder(
              sentence
            );


      if (!result) {

        this.wrong(
          "desk_quiz"
        );


        await GameUI.say(
          "루미: 문장을 다시 천천히 읽어 봐!"
        );


        return;

      }


      this.correct(
        "desk_quiz"
      );


      this.state.phase =
        "desk_push";


      this.save();


      await GameUI.say([

        "루미: 맞았어!",

        "루미: 이 책상 아래에서 뭔가 빛나.",

        "나: 그럼 밀어보자!",

        "루미: 좋아. 두 번 밀어봐!"

      ]);


      return;

    }


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

      "책상 아래에서 작은 열쇠를 발견했다.",

      "나: 열쇠다!",

      "루미: 왼쪽 아래에 있는 사물함 열쇠일지도 몰라!"

    ]);

  }


  /* =====================================================
     LOCKER
  ====================================================== */

  async handleLocker() {

    if (
      this.state.phase !==
      "locker"
    ) {

      await this.phaseHint();

      return;

    }


    this.state.questionsShown++;


    await GameUI.say(
      "열쇠를 넣자 사물함 안에서 흩어진 영어 단어들이 떠올랐다."
    );


    const result =
      await GameUI.wordOrder(
        this.state.lockerExpression
      );


    if (!result) {

      this.wrong(
        "locker"
      );


      return;

    }


    this.correct(
      "locker"
    );


    this.state.shards =
      2;


    this.state.phase =
      "chest";


    this.save();


    const chestName =
      chestColorName(
        this.state.targetChest
      );


    await GameUI.say([

      "루미: 두 번째 말의 조각이야!",

      "나: 이제 하나 남았네.",

      `루미: 맞아! 오른쪽 아래의 ${chestName} 상자가 빛나고 있어.`

    ]);

  }


  /* =====================================================
     CHEST
  ====================================================== */

  async handleChest(
    object
  ) {

    if (
      this.state.phase !==
      "chest"
    ) {

      await this.phaseHint();

      return;

    }


    if (
      object.color !==
      this.state.targetChest
    ) {

      this.wrong(
        "chest"
      );


      await GameUI.say(
        `루미: 그 상자가 아니야. ${chestColorName(this.state.targetChest)} 상자를 찾아봐!`
      );


      return;

    }


    this.correct(
      "chest"
    );


    this.state.shards =
      3;


    this.state.phase =
      "final";


    this.save();


    await GameUI.say([

      "상자를 열자 세 번째 말의 조각이 떠올랐다!",

      "나: 세 개를 다 모았어!",

      "루미: 좋아! 이제 마지막 확인 문제만 풀면 문이 열릴 거야."

    ]);


    await this.startFinalQuiz();

  }


  /* =====================================================
     FINAL
  ====================================================== */

  async startFinalQuiz() {

    if (
      this.state.phase !==
      "final"
    ) {

      return;

    }


    const target =
      this.state.finalWord;


    const options =
      buildSpellingOptions(
        target
      );


    this.state.questionsShown++;


    const answer =
      await GameUI.choice(

        `마지막 확인! "${target}"와 철자가 정확히 같은 단어를 고르세요.`,

        options,

        options.indexOf(
          target
        )

      );


    if (!answer) {

      this.wrong(
        "final"
      );


      await GameUI.say(
        "루미: 괜찮아. 다시 한 번 확인해 봐!"
      );


      return;

    }


    this.correct(
      "final"
    );


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "정답!",

      "교실 전체에 푸른 빛이 퍼졌다.",

      "나: 문에 걸린 마법이 사라졌어!",

      "루미: 성공이야! 오른쪽 위 출구로 가자!"

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

      await this.startFinalQuiz();

      return;

    }


    if (
      this.state.phase !==
      "exit"
    ) {

      await this.phaseHint();

      return;

    }


    await this.completeMap();

  }


  /* =====================================================
     HINT
  ====================================================== */

  async phaseHint() {

    this.state.hintsUsed++;


    this.save();


    switch (
      this.state.phase
    ) {

      case "blackboard":

        await GameUI.say(
          "루미: 앞쪽 큰 칠판을 조사해 봐!"
        );

        break;


      case "desk_quiz":

      case "desk_push":

        await GameUI.say(
          "루미: 가운데 아래쪽의 노란빛 책상! 바로 그 책상이야."
        );

        break;


      case "locker":

        await GameUI.say(
          "루미: 왼쪽 아래 책장 옆의 회색 사물함을 확인해 봐."
        );

        break;


      case "chest":

        await GameUI.say(
          `루미: 오른쪽 아래 ${chestColorName(this.state.targetChest)} 상자를 찾아봐!`
        );

        break;


      case "final":

        await GameUI.say(
          "루미: 마지막 영어 문제를 풀어야 해!"
        );

        break;


      case "exit":

        await GameUI.say(
          "루미: 오른쪽 위 봉인문으로 가자!"
        );

        break;

    }

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
            Date.now() -
            this.state.sessionStartedAt
          )
          / 1000
        )
      );


    this.save();


    saveRecord({

      mapId:
        "MAP_01_CLASSROOM",

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


    await GameUI.say([

      "봉인된 문이 천천히 열렸다.",

      "루미: 해냈어! 첫 번째 언어 수정이 다시 빛나기 시작했어!",

      "나: 좋아. 다음 조각도 찾으러 가자!",

      "루미: 응! 다음 세계로 출발!"

    ]);


    await GameUI.finish({

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
     RANDOM
  ====================================================== */

  pickRandomWord(
    exclude = null
  ) {

    let words =
      this.content.words
        .map(
          item =>
            String(item)
              .trim()
        )
        .filter(Boolean);


    if (
      exclude &&
      words.length > 1
    ) {

      words =
        words.filter(
          item =>
            item !== exclude
        );

    }


    return Phaser.Utils.Array.GetRandom(
      words.length
        ? words
        : ["magic"]
    );

  }


  pickRandomExpression(
    exclude = null
  ) {

    let expressions =
      this.content.expressions
        .map(
          item =>
            String(item)
              .trim()
        )
        .filter(Boolean);


    if (
      exclude &&
      expressions.length > 1
    ) {

      expressions =
        expressions.filter(
          item =>
            item !== exclude
        );

    }


    return Phaser.Utils.Array.GetRandom(
      expressions.length
        ? expressions
        : ["Open the magic box."]
    );

  }


  /* =====================================================
     SCORE
  ====================================================== */

  correct(
    id
  ) {

    if (
      !this.state.mistakes[id]
    ) {

      this.state.firstTryCorrect++;

    }

  }


  wrong(
    id
  ) {

    this.state.wrongAttempts++;


    this.state.mistakes[id] =
      (
        this.state.mistakes[id]
        || 0
      ) + 1;


    this.save();

  }


  /* =====================================================
     SAVE
  ====================================================== */

  save() {

    window.WISDOM_MAP_STATE =
      this.state;


    saveMapProgress(
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

    const shardElement =
      document.querySelector(
        "#hud-shards"
      );


    if (
      shardElement
    ) {

      shardElement.textContent = [

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


    const objectiveElement =
      document.querySelector(
        "#hud-objective"
      );


    if (
      !objectiveElement
    ) {

      return;

    }


    const objectives = {

      blackboard:
        "교실 앞쪽 칠판을 조사하자.",

      desk_quiz:
        "노란빛으로 빛나는 책상을 조사하자.",

      desk_push:
        `빛나는 책상을 밀자. ${this.state.deskPushes}/2`,

      locker:
        "왼쪽 아래 사물함을 조사하자.",

      chest:
        `${chestColorName(this.state.targetChest)} 상자를 조사하자.`,

      final:
        "마지막 영어 문제를 풀자.",

      exit:
        "오른쪽 위 봉인문으로 나가자."

    };


    objectiveElement.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "교실을 탐험하자.";

  }

}


/* =====================================================
   QUIZ HELPERS
===================================================== */

function buildSpellingOptions(
  correct
) {

  const options =
    new Set([
      correct
    ]);


  let safety =
    0;


  while (
    options.size < 4 &&
    safety < 30
  ) {

    safety++;

    options.add(
      mutateWord(
        correct
      )
    );

  }


  const fallbacks = [

    `${correct}s`,

    `${correct}e`,

    `a${correct}`,

    `${correct}ing`

  ];


  for (
    const fallback of fallbacks
  ) {

    if (
      options.size >= 4
    ) {

      break;

    }


    options.add(
      fallback
    );

  }


  return shuffle(
    [...options]
  ).slice(
    0,
    4
  );

}


function mutateWord(
  word
) {

  const source =
    String(word);


  if (
    source.length <= 2
  ) {

    return `${source}e`;

  }


  const chars =
    source.split("");


  const mode =
    Math.floor(
      Math.random() * 3
    );


  if (
    mode === 0
  ) {

    const index =
      Phaser.Math.Between(
        0,
        chars.length - 2
      );


    [
      chars[index],
      chars[index + 1]
    ] =
    [
      chars[index + 1],
      chars[index]
    ];


    return chars.join("");

  }


  if (
    mode === 1
  ) {

    const index =
      Phaser.Math.Between(
        1,
        chars.length - 1
      );


    chars.splice(
      index,
      1
    );


    return chars.join("");

  }


  const index =
    Phaser.Math.Between(
      0,
      chars.length - 1
    );


  chars.splice(
    index,
    0,
    chars[index]
  );


  return chars.join("");

}


function buildMissingWordQuestion(
  sentence,
  unitWords
) {

  const tokens =
    String(sentence)
      .trim()
      .split(/\s+/);


  const candidates =
    tokens
      .map(
        (
          token,
          index
        ) => ({

          index,

          clean:
            cleanWord(
              token
            )

        })
      )
      .filter(
        item =>
          item.clean.length >= 3
      );


  if (
    candidates.length === 0
  ) {

    return null;

  }


  const target =
    Phaser.Utils.Array.GetRandom(
      candidates
    );


  const correct =
    target.clean;


  const displayTokens =
    [...tokens];


  displayTokens[
    target.index
  ] =
    "□□□□";


  const distractors =
    unitWords
      .map(
        word =>
          cleanWord(
            word
          )
      )
      .filter(
        word =>
          word &&
          word.toLowerCase() !==
            correct.toLowerCase()
      );


  const options =
    [correct];


  for (
    const word of
    shuffle(
      [...new Set(distractors)]
    )
  ) {

    if (
      options.length >= 4
    ) {

      break;

    }


    options.push(
      word
    );

  }


  while (
    options.length < 4
  ) {

    const fake =
      mutateWord(
        correct
      );


    if (
      !options.includes(
        fake
      )
    ) {

      options.push(
        fake
      );

    }

  }


  const shuffled =
    shuffle(
      options
    );


  return {

    prompt:
      `빈칸에 들어갈 알맞은 단어를 고르세요.\n\n${displayTokens.join(" ")}`,

    options:
      shuffled,

    correctIndex:
      shuffled.indexOf(
        correct
      )

  };

}


function cleanWord(
  value
) {

  return String(
    value
  )
    .replace(
      /^[^A-Za-z]+|[^A-Za-z]+$/g,
      ""
    )
    .trim();

}


function chestColorName(
  color
) {

  switch (color) {

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
