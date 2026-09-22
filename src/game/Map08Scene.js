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


const MAP_ID = "MAP08";


export default class Map08Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map08_background",
      `${base}assets/maps/map08.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map08_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map08_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map08_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map08_right",
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
      "map08_background"
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
            "MAP08 intro error:",
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
      "power",
      "bio_lab",
      "study",
      "crystal",
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
      "MAP08 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "core",

        label:
          "중앙 동력 코어",

        x:
          385,

        y:
          285,

        radius:
          95
      },


      {
        id:
          "power",

        label:
          "비상 전력실",

        x:
          165,

        y:
          155,

        radius:
          95
      },


      {
        id:
          "bio_lab",

        label:
          "생체 실험실",

        x:
          615,

        y:
          155,

        radius:
          95
      },


      {
        id:
          "study",

        label:
          "침수 연구실",

        x:
          615,

        y:
          365,

        radius:
          95
      },


      {
        id:
          "crystal",

        label:
          "수정 격리실",

        x:
          155,

        y:
          365,

        radius:
          95
      },


      {
        id:
          "exit",

        label:
          "수문 제어실",

        x:
          385,

        y:
          500,

        radius:
          100
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        385,
        285,
        22,
        0x4ce7ff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xc9fbff,
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
            "#0d2430dd",

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
        [385, 285],

      power:
        [165, 155],

      bio_lab:
        [615, 155],

      study:
        [615, 365],

      crystal:
        [155, 365],

      exit:
        [385, 500]

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
        "map08_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map08_front"
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
          "map08_left"
        )
      ) {

        this.player.setTexture(
          "map08_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map08_right"
        )
      ) {

        this.player.setTexture(
          "map08_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map08_back"
      )
    ) {

      this.player.setTexture(
        "map08_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map08_front"
      )
    ) {

      this.player.setTexture(
        "map08_front"
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


        case "power":

          await this.handlePower();

          break;


        case "bio_lab":

          await this.handleBioLab();

          break;


        case "study":

          await this.handleStudy();

          break;


        case "crystal":

          await this.handleCrystal();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP08 interaction error:",
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

      "바닷물이 연구소 곳곳으로 밀려 들어오고 있다.",

      "나: 여긴 거의 물에 잠겼잖아!",

      "루미: 여기는 오래된 해저 연구소야.",

      "루미: 여덟 번째 언어 수정이 폭주하면서 전력과 수문 장치가 전부 멈췄어.",

      "루미: 연구소가 완전히 잠기기 전에 장치들을 복구해야 해.",

      "루미: 먼저 중앙의 동력 코어를 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "core";


    this.save();

  }


  /* =====================================================
     1. CENTRAL CORE
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
        "루미: MAP08 단어 데이터가 부족해."
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
        "루미: 동력 코어가 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "core"
    );


    this.state.shards =
      1;


    this.state.phase =
      "power";


    this.save();


    await GameUI.say([

      "중앙 동력 코어에 푸른 빛이 돌아왔다.",

      "루미: 첫 번째 말의 조각이야!",

      "나: 왼쪽 위 장비실에 전기가 들어오기 시작했어.",

      "루미: 비상 전력실로 가자!"

    ]);

  }


  /* =====================================================
     2. POWER ROOM
  ====================================================== */

  async handlePower() {

    if (
      this.state.phase !==
      "power"
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
        "루미: MAP08 단어 데이터가 부족해."
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
        "power"
      );


      await GameUI.say(
        "루미: 발전기가 다시 멈췄어. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "power"
    );


    this.state.phase =
      "bio_lab";


    this.save();


    await GameUI.say([

      "비상 발전기가 힘차게 돌아가기 시작했다.",

      "나: 오른쪽 위 실험 탱크에 불이 켜졌어!",

      "루미: 생체 실험실로 가자!"

    ]);

  }


  /* =====================================================
     3. BIO LAB
  ====================================================== */

  async handleBioLab() {

    if (
      this.state.phase !==
      "bio_lab"
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
        "루미: MAP08 영어 표현 데이터가 부족해."
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
        "bio_lab"
      );


      await GameUI.say(
        "루미: 실험 장치가 안정되지 않아. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "bio_lab"
    );


    this.state.shards =
      2;


    this.state.phase =
      "study";


    this.save();


    await GameUI.say([

      "생체 실험 탱크의 압력이 정상으로 돌아왔다.",

      "루미: 두 번째 말의 조각이야!",

      "나: 오른쪽 아래 연구실에서 경고등이 깜빡이고 있어.",

      "루미: 침수 연구실로 가자!"

    ]);

  }


  /* =====================================================
     4. FLOODED STUDY
  ====================================================== */

  async handleStudy() {

    if (
      this.state.phase !==
      "study"
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
        "루미: 문장 배열에 사용할 MAP08 영어 표현이 부족해."
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
        "study"
      );


      await GameUI.say(
        "루미: 제어 장치가 반응하지 않아. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "study"
    );


    this.state.phase =
      "crystal";


    this.save();


    await GameUI.say([

      "연구실의 배수 장치가 움직이기 시작했다.",

      "나: 왼쪽 아래 수정 격리실에서 강한 빛이 보여!",

      "루미: 수정 격리실로 가자!"

    ]);

  }


  /* =====================================================
     5. CRYSTAL CHAMBER
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


    if (!quiz) {

      await GameUI.say(
        "루미: 마지막 문제를 만들 MAP08 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `격리 장치의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "crystal"
      );


      await GameUI.say(
        "루미: 수정 격리 장치가 아직 잠겨 있어. 다시 해 보자!"
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

      "격리실의 수정에서 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 좋아! 이제 연구소의 수문을 열 수 있어.",

      "루미: 아래 중앙의 수문 제어실로 가자!"

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
        "루미: 중앙의 푸른 동력 코어를 조사해 봐!",

      power:
        "루미: 왼쪽 위 비상 전력실로 가자!",

      bio_lab:
        "루미: 오른쪽 위 생체 실험실로 가자!",

      study:
        "루미: 오른쪽 아래 침수 연구실로 가자!",

      crystal:
        "루미: 왼쪽 아래 수정 격리실로 가자!",

      exit:
        "루미: 아래 중앙의 수문 제어실로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 연구소의 장치들을 하나씩 복구하자!"
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

      "수문 제어 장치가 작동하며 연구소의 물이 빠져나가기 시작했다.",

      "멈춰 있던 기계들이 하나씩 다시 움직였다.",

      "루미: 여덟 번째 언어 수정도 복원됐어!",

      "나: 연구소가 완전히 잠기기 전에 해결했어!",

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
        "중앙 동력 코어의 문제를 풀자.",

      power:
        "비상 전력실의 단어 문제를 풀자.",

      bio_lab:
        "생체 실험실의 표현 문제를 풀자.",

      study:
        "침수 연구실의 문장 배열 문제를 풀자.",

      crystal:
        "수정 격리실의 마지막 시험을 풀자.",

      exit:
        "아래 중앙의 수문 제어실로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "침수된 연구소를 복구하자.";

  }

}
