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


const MAP_ID = "MAP09";


export default class Map09Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map09_background",
      `${base}assets/maps/map09.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map09_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map09_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map09_left",
        sprites.left
      );
    }

    if (sprites?.right) {
      this.load.image(
        "map09_right",
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


    this.lockStartedAt =
      Date.now();


    this.interactables =
      [];


    this.add.image(
      384,
      288,
      "map09_background"
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
            "MAP09 intro error:",
            error
          );

        }

        finally {

          this.forceUnlock();

        }

      }
    );

  }


  prepareState() {

    const validPhases = [
      "core",
      "prehistoric",
      "ancient",
      "medieval",
      "industrial",
      "future",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "core";

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
      "MAP09 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "core",

        label:
          "시간 코어",

        x:
          385,

        y:
          270,

        radius:
          90
      },


      {
        id:
          "prehistoric",

        label:
          "선사시대 전시관",

        x:
          150,

        y:
          120,

        radius:
          90
      },


      {
        id:
          "ancient",

        label:
          "고대 문명 전시관",

        x:
          625,

        y:
          120,

        radius:
          90
      },


      {
        id:
          "medieval",

        label:
          "왕국 전시관",

        x:
          150,

        y:
          320,

        radius:
          90
      },


      {
        id:
          "industrial",

        label:
          "산업혁명 전시관",

        x:
          620,

        y:
          320,

        radius:
          90
      },


      {
        id:
          "future",

        label:
          "우주 미래 전시관",

        x:
          385,

        y:
          455,

        radius:
          95
      },


      {
        id:
          "exit",

        label:
          "시간의 문",

        x:
          385,

        y:
          85,

        radius:
          95
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        385,
        270,
        21,
        0x6acaff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xd2f5ff,
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
            "#ffffff",

          backgroundColor:
            "#15213bdd",

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

      core:
        [385, 270],

      prehistoric:
        [150, 120],

      ancient:
        [625, 120],

      medieval:
        [150, 320],

      industrial:
        [620, 320],

      future:
        [385, 455],

      exit:
        [385, 85]

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


  createPlayer() {

    if (
      this.textures.exists(
        "map09_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map09_front"
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

  }


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
          "map09_left"
        )
      ) {

        this.player.setTexture(
          "map09_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map09_right"
        )
      ) {

        this.player.setTexture(
          "map09_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map09_back"
      )
    ) {

      this.player.setTexture(
        "map09_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map09_front"
      )
    ) {

      this.player.setTexture(
        "map09_front"
      );

    }

  }


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

        case "core":

          await this.handleCore();

          break;


        case "prehistoric":

          await this.handlePrehistoric();

          break;


        case "ancient":

          await this.handleAncient();

          break;


        case "medieval":

          await this.handleMedieval();

          break;


        case "industrial":

          await this.handleIndustrial();

          break;


        case "future":

          await this.handleFuture();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP09 interaction error:",
        error
      );

    }

    finally {

      this.forceUnlock();

      this.updateGuide();

    }

  }


  async playIntro() {

    await GameUI.say([

      "거대한 박물관 안의 모든 시계가 멈춰 있다.",

      "나: 정말 시간이 멈춘 것 같아.",

      "루미: 아홉 번째 언어 수정이 박물관의 여러 시대를 뒤섞어 버렸어.",

      "루미: 서로 다른 시대의 전시관을 순서대로 다시 활성화해야 해.",

      "루미: 먼저 중앙의 시간 코어를 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "core";


    this.save();

  }


  /* =====================================================
     1. TIME CORE
  ====================================================== */

  async handleCore() {

    if (
      this.state.phase !==
      "core"
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
        "루미: MAP09 단어 데이터가 부족해."
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


    if (!correct) {

      this.markWrong(
        "core"
      );


      await GameUI.say(
        "루미: 시간 코어가 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "core"
    );


    this.state.phase =
      "prehistoric";


    this.save();


    await GameUI.say([

      "시간 코어의 첫 번째 고리가 움직이기 시작했다.",

      "루미: 좋아! 왼쪽 위 선사시대 전시관부터 복구하자!"

    ]);

  }


  /* =====================================================
     2. PREHISTORIC
  ====================================================== */

  async handlePrehistoric() {

    if (
      this.state.phase !==
      "prehistoric"
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
        "루미: MAP09 단어 데이터가 부족해."
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


    if (!correct) {

      this.markWrong(
        "prehistoric"
      );


      await GameUI.say(
        "루미: 화석의 시간이 아직 멈춰 있어. 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "prehistoric"
    );


    this.state.shards =
      1;


    this.state.phase =
      "ancient";


    this.save();


    await GameUI.say([

      "공룡 화석 주변의 먼지가 다시 움직이기 시작했다.",

      "루미: 첫 번째 말의 조각이야!",

      "루미: 다음은 오른쪽 위 고대 문명 전시관이야!"

    ]);

  }


  /* =====================================================
     3. ANCIENT
  ====================================================== */

  async handleAncient() {

    if (
      this.state.phase !==
      "ancient"
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
        "루미: MAP09 영어 표현 데이터가 부족해."
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


    if (!correct) {

      this.markWrong(
        "ancient"
      );


      await GameUI.say(
        "루미: 고대 전시관의 시간이 움직이지 않아. 표현 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "ancient"
    );


    this.state.phase =
      "medieval";


    this.save();


    await GameUI.say([

      "고대 조각상과 유물에 빛이 돌아왔다.",

      "루미: 다음은 왼쪽 중간의 왕국 전시관이야!"

    ]);

  }


  /* =====================================================
     4. MEDIEVAL
  ====================================================== */

  async handleMedieval() {

    if (
      this.state.phase !==
      "medieval"
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
        "루미: 문장 배열에 사용할 MAP09 영어 표현이 부족해."
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


    if (!correct) {

      this.markWrong(
        "medieval"
      );


      await GameUI.say(
        "루미: 왕국 전시관의 시간이 아직 멈춰 있어. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "medieval"
    );


    this.state.shards =
      2;


    this.state.phase =
      "industrial";


    this.save();


    await GameUI.say([

      "기사의 갑옷과 오래된 왕국 유물들이 다시 움직였다.",

      "루미: 두 번째 말의 조각을 찾았어!",

      "루미: 이제 오른쪽 중간의 산업혁명 전시관으로 가자!"

    ]);

  }


  /* =====================================================
     5. INDUSTRIAL
  ====================================================== */

  async handleIndustrial() {

    if (
      this.state.phase !==
      "industrial"
    ) {

      await this.showHint();

      return;

    }


    const quiz =
      QuizEngine.koreanToExpression(
        this.content.expressions,
        this.state.usedExpressions
      );


    if (!quiz) {

      await GameUI.say(
        "루미: MAP09 영어 표현 데이터가 부족해."
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


    if (!correct) {

      this.markWrong(
        "industrial"
      );


      await GameUI.say(
        "루미: 증기기관이 움직이지 않아. 영어 표현을 다시 골라 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "industrial"
    );


    this.state.phase =
      "future";


    this.save();


    await GameUI.say([

      "멈춰 있던 증기기관의 톱니바퀴가 돌아가기 시작했다.",

      "나: 아래쪽 미래 전시관에서도 빛이 나!",

      "루미: 마지막 시대를 복구하자!"

    ]);

  }


  /* =====================================================
     6. FUTURE
  ====================================================== */

  async handleFuture() {

    if (
      this.state.phase !==
      "future"
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
        "루미: 마지막 문제를 만들 MAP09 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `시간 박물관의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "future"
      );


      await GameUI.say(
        "루미: 미래 전시관의 시간이 아직 복구되지 않았어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "future"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "우주 전시관의 행성과 별들이 다시 움직이기 시작했다.",

      "세 번째 말의 조각이 시간 코어로 날아갔다.",

      "나: 박물관의 모든 시대가 다시 움직이고 있어!",

      "루미: 좋아! 가운데 위의 시간의 문으로 가자!"

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


  async showHint() {

    this.state.hintsUsed++;


    this.save();


    const hints = {

      core:
        "루미: 가운데의 거대한 시간 코어를 조사해 봐!",

      prehistoric:
        "루미: 왼쪽 위 공룡 화석이 있는 선사시대 전시관으로 가자!",

      ancient:
        "루미: 오른쪽 위 조각상과 유물이 있는 고대 문명 전시관으로 가자!",

      medieval:
        "루미: 왼쪽 중간 갑옷과 왕국 유물이 있는 전시관으로 가자!",

      industrial:
        "루미: 오른쪽 중간 증기기관과 기계가 있는 전시관으로 가자!",

      future:
        "루미: 아래쪽의 우주와 미래 전시관으로 가자!",

      exit:
        "루미: 가운데 위쪽의 큰 시계 아래 시간의 문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 시대의 흐름을 순서대로 따라가 보자!"
    );

  }


  rememberWord(
    english
  ) {

    if (!english) {
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

    if (!english) {
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

      "거대한 시계의 바늘이 다시 움직이기 시작했다.",

      "박물관 전체에 멈춰 있던 시간이 한꺼번에 흐르기 시작했다.",

      "루미: 아홉 번째 언어 수정도 복원됐어!",

      "나: 과거부터 미래까지 전부 다시 움직이고 있어!",

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

      core:
        "중앙 시간 코어를 활성화하자.",

      prehistoric:
        "선사시대 전시관의 시간을 복구하자.",

      ancient:
        "고대 문명 전시관의 시간을 복구하자.",

      medieval:
        "왕국 전시관의 문장 문제를 풀자.",

      industrial:
        "산업혁명 전시관의 시간을 복구하자.",

      future:
        "우주 미래 전시관의 마지막 시험을 풀자.",

      exit:
        "가운데 위쪽 시간의 문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "멈춰버린 시간 박물관을 복구하자.";

  }

}
