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


function chestName(color) {

  const names = {
    red: "붉은",
    blue: "푸른",
    black: "검은"
  };

  return names[color] || "";
}


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

    // Capture map entry and unfinished sessions, as well as quiz save points.
    this.save();
    this.time.addEvent({ delay: 15000, loop: true, callback: () => {
      if (!this.state.completed) this.save();
    }});
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.save());


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
            "MAP01 intro error:",
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
      &&
      !this.state.completed
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
     ★ MAP01 동선 완화 버전
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


    /*
      교탁

      기존보다 충돌 범위를 크게 줄여
      칠판 앞 접근을 편하게 함
    */

    this.addWall(
      378,
      151,
      210,
      46
    );


    /*
      책상 1열

      충돌 범위를 줄여
      좌우/중앙 통로를 넓힘
    */

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
          40,
          32
        );

      }
    );


    /*
      책상 2열
    */

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
          40,
          32
        );

      }
    );


    /*
      왼쪽 책장
    */

    this.addWall(
      100,
      464,
      100,
      68
    );


    /*
      사물함
    */

    this.addWall(
      292,
      468,
      86,
      68
    );


    /*
      오른쪽 벽 장식
    */

    this.addWall(
      727,
      307,
      30,
      160
    );


    /*
      보물상자 쪽은
      접근성을 위해 큰 충돌벽을 두지 않음.
    */

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
      ★ 칠판
      기존보다 조사 범위를 넓힘.
      정확히 교탁에 붙지 않아도 조사 가능.
    */

    this.addInteractable({
      id:
        "blackboard",

      label:
        "칠판",

      x:
        365,

      y:
        125,

      radius:
        150
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
        92
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
        105
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
        465,

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
        465,

      radius:
        82
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
        115
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
        365,
        170,
        22,
        0xffd85a,
        0.12
      )
        .setStrokeStyle(
          4,
          0xfff0a0,
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
            "#fff2a8",

          backgroundColor:
            "#10182bcc",

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

      blackboard:
        [365, 180],

      desk_quiz:
        [450, 328],

      desk_push:
        [450, 328],

      locker:
        [292, 430],

      chest_quiz:
        [548, 430],

      chest:
        this.getTargetChestPoint(),

      final:
        [635, 140],

      exit:
        [635, 140]

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


  getTargetChestPoint() {

    const points = {
      red:
        [484, 430],

      blue:
        [548, 430],

      black:
        [612, 430]
    };


    return (
      points[
        this.state.targetChest
      ]
      ||
      [548, 430]
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
          "ENTER",
        space: "SPACE"

      });

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
      "MAP01 input lock 자동 복구"
    );


    this.forceUnlock();

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
      )
      ||
      Phaser.Input.Keyboard.JustDown(this.keys.space);


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


  /* =====================================================
     DIRECTION
  ====================================================== */

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
     INTERACTION
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

    catch (error) {

      console.error(
        "MAP01 interaction error:",
        error
      );

    }

    finally {

      this.forceUnlock();

      this.updateGuide();

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

      "루미: 먼저 앞쪽 칠판을 조사해 보자!",

      "루미: 방향키로 움직이고, 가까이 가면 조사 버튼을 누르면 돼!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "blackboard";


    this.save();

  }


  /* =====================================================
     BLACKBOARD
     영어 단어 -> 한국어
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


    if (
      !quiz
    ) {

      await GameUI.say(
        "루미: MAP01 단어 데이터가 부족해."
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


    window.WisdomFeedback
      ?.shard();


    await GameUI.say([

      "루미: 정답이야! 첫 번째 말의 조각이 나타났어.",

      "나: 하나 찾았다!",

      "루미: 이번에는 가운데 아래쪽의 빛나는 책상으로 가자!"

    ]);

  }


  /* =====================================================
     DESK
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


    if (
      this.state.phase ===
      "desk_quiz"
    ) {

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

        "루미: 책상을 두 번 조사해서 밀어보자!"

      ]);


      return;

    }


    this.state.deskPushes++;


    this.cameras.main.shake(
      90,
      0.004
    );


    window.WisdomFeedback
      ?.vibrate(
        20
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
     LOCKER
     문장 배열
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


    if (
      !expression
    ) {

      await GameUI.say(
        "루미: MAP01 영어 표현 데이터가 부족해."
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


    if (
      !success
    ) {

      this.markWrong(
        "locker"
      );


      await GameUI.say(
        "루미: 문장 순서를 다시 생각해 보자!"
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


    window.WisdomFeedback
      ?.shard();


    await GameUI.say([

      "사물함의 자물쇠가 열렸다!",

      "루미: 두 번째 말의 조각이야!",

      "나: 이제 하나만 더 찾으면 돼.",

      "루미: 오른쪽 아래의 세 보물상자를 조사해 보자!"

    ]);

  }


  /* =====================================================
     CHESTS
  ====================================================== */

  async handleChest(
    object
  ) {

    if (
      this.state.phase ===
      "chest_quiz"
    ) {

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
          "chest_quiz"
        );


        await GameUI.say(
          "루미: 영어 표현의 뜻을 다시 생각해 보자!"
        );


        return;

      }


      this.rememberExpression(
        quiz.itemKey
      );


      this.markCorrect(
        "chest_quiz"
      );


      const colors = [
        "red",
        "blue",
        "black"
      ];


      this.state.targetChest =
        Phaser.Utils.Array.GetRandom(
          colors
        );


      this.state.phase =
        "chest";


      this.save();


      await GameUI.say([

        "루미: 정답!",

        "세 개의 상자가 동시에 빛났다.",

        `루미: 세 번째 조각은 ${chestName(
          this.state.targetChest
        )} 상자 안에 있어!`

      ]);


      return;

    }


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

      this.state.hintsUsed++;


      this.save();


      await GameUI.say(
        `루미: 여기는 아니야. ${chestName(
          this.state.targetChest
        )} 상자를 찾아봐!`
      );


      return;

    }


    this.state.shards =
      3;


    this.state.phase =
      "final";


    this.save();


    window.WisdomFeedback
      ?.shard();


    await GameUI.say([

      "찰칵!",

      "상자가 열리며 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 좋아! 이제 오른쪽 위 봉인문으로 가자.",

      "루미: 마지막 복습 문제만 통과하면 탈출할 수 있어!"

    ]);

  }


  /* =====================================================
     EXIT + FINAL QUIZ
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


  async runFinalQuiz() {

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
        `교실 탈출 마지막 문제!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (
      !success
    ) {

      this.markWrong(
        "final"
      );


      await GameUI.say(
        "루미: 거의 다 왔어! 마지막 문제를 다시 풀어보자!"
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

      "봉인문의 마법이 풀렸다!",

      "루미: 성공이야!",

      "나: 문이 열렸어!",

      "루미: 문을 한 번 더 조사하면 다음 미로로 갈 수 있어."

    ]);

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
        "루미: 가운데 아래쪽의 빛나는 책상으로 가자!",

      desk_push:
        "루미: 방금 문제를 풀었던 빛나는 책상을 다시 조사해!",

      locker:
        "루미: 왼쪽 아래 회색 사물함으로 가자!",

      chest_quiz:
        "루미: 오른쪽 아래 보물상자 중 하나를 조사해 봐!",

      chest:
        `루미: ${chestName(
          this.state.targetChest
        )} 상자를 찾아봐!`,

      final:
        "루미: 오른쪽 위 봉인문에서 마지막 문제를 풀자!",

      exit:
        "루미: 오른쪽 위 봉인문을 다시 조사해!"

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


    window.WisdomFeedback
      ?.clear();


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

      "봉인문이 활짝 열렸다.",

      "교실을 감싸고 있던 마법이 사라지기 시작했다.",

      "루미: 첫 번째 언어 수정이 복원됐어!",

      "나: 이제 시작이네.",

      nextMap
        ? "루미: 다음 미로로 가자!"
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

      blackboard:
        "앞쪽 칠판을 조사하자.",

      desk_quiz:
        "빛나는 책상의 문제를 풀자.",

      desk_push:
        "빛나는 책상을 두 번 밀어보자.",

      locker:
        "왼쪽 아래 마법 사물함을 열자.",

      chest_quiz:
        "오른쪽 아래 보물상자를 조사하자.",

      chest:
        `${chestName(
          this.state.targetChest
        )} 상자를 찾자.`,

      final:
        "오른쪽 위 봉인문의 마지막 문제를 풀자.",

      exit:
        "봉인문을 조사해 교실을 탈출하자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "잠겨버린 교실을 탈출하자.";

  }

}
