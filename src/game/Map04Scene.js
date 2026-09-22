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
const FLOW_VERSION = 3;


export default class Map04Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map04_background",
      `${base}assets/maps/map04.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map04_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map04_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map04_left",
        sprites.left
      );
    }

    if (sprites?.right) {
      this.load.image(
        "map04_right",
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


    this.add.image(
      384,
      288,
      "map04_background"
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

          if (!this.state.introDone) {
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

          this.forceUnlock();

        }

      }
    );

  }


  /* =====================================================
     STATE
  ====================================================== */

  prepareState() {

    /*
      예전 MAP04 저장값이 이미 꼬여 있을 수 있으므로
      새 진행 구조 최초 적용 시 MAP04만 초기화.
    */

    if (
      this.state.flowVersion !==
      FLOW_VERSION
    ) {

      this.state.flowVersion =
        FLOW_VERSION;

      this.state.introDone =
        false;

      this.state.phase =
        "fountain";

      this.state.shards =
        0;

      this.state.questionsShown =
        0;

      this.state.firstTryCorrect =
        0;

      this.state.wrongAttempts =
        0;

      this.state.hintsUsed =
        0;

      this.state.mistakes =
        {};

      this.state.usedWords =
        [];

      this.state.usedExpressions =
        [];

      this.state.completed =
        false;

      this.state.sessionStartedAt =
        Date.now();


      this.saveRaw();

      return;

    }


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
      &&
      !this.state.completed
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
     INPUT
  ====================================================== */

  lockInput() {

    this.inputLocked =
      true;

    this.interactionRunning =
      true;

    this.lockStartedAt =
      Date.now();


    if (this.player?.body) {

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


    if (this.input?.keyboard) {

      this.input.keyboard.enabled =
        true;

    }


    if (this.player?.body) {

      this.player.body.enable =
        true;

      this.player.body.setVelocity(
        0,
        0
      );

    }

  }


  recoverStuckInput() {

    if (!this.inputLocked) {
      return;
    }


    const modal =
      document.querySelector(
        "#modal"
      );


    const modalVisible =
      Boolean(
        modal &&
        !modal.classList.contains(
          "hidden"
        )
      );


    if (modalVisible) {
      return;
    }


    if (!this.lockStartedAt) {
      return;
    }


    if (
      Date.now() -
      this.lockStartedAt <
      200
    ) {

      return;

    }


    console.warn(
      "MAP04 입력 잠금 자동 복구"
    );


    this.forceUnlock();

  }


  /* =====================================================
     OBJECTS
  ====================================================== */

  createInteractables() {

    this.interactables = {

      fountain: {
        id: "fountain",
        label: "푸른 수정 분수",
        x: 385,
        y: 310,
        radius: 90
      },

      observatory: {
        id: "observatory",
        label: "고대 천문대",
        x: 145,
        y: 160,
        radius: 95
      },

      library: {
        id: "library",
        label: "푸른 서재",
        x: 650,
        y: 160,
        radius: 95
      },

      time_circle: {
        id: "time_circle",
        label: "시간 마법진",
        x: 385,
        y: 465,
        radius: 100
      },

      crystal: {
        id: "crystal",
        label: "보라 수정 제단",
        x: 625,
        y: 490,
        radius: 100
      },

      exit: {
        id: "exit",
        label: "고대 사원 문",
        x: 385,
        y: 140,
        radius: 105
      }

    };

  }


  /*
    핵심.

    현재 phase에 해당하는 오브젝트 하나만 반환.
    다른 물건 근처에서 E를 눌러도 아무 일도 안 일어남.
  */

  currentTarget() {

    return (
      this.interactables[
        this.state.phase
      ]
      ||
      null
    );

  }


  targetInRange() {

    const target =
      this.currentTarget();


    if (
      !target ||
      !this.player
    ) {

      return null;

    }


    const distance =
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        target.x,
        target.y
      );


    if (
      distance <=
      target.radius
    ) {

      return target;

    }


    return null;

  }


  /* =====================================================
     GUIDE
  ====================================================== */

  createGuide() {

    this.guide =
      this.add.circle(
        385,
        310,
        21,
        0x55ccff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xcaf6ff,
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
            "#18253bdd",

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

    const target =
      this.currentTarget();


    if (
      !target ||
      this.state.completed
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
        target.x,
        target.y
      );

  }


  /* =====================================================
     PLAYER
  ====================================================== */

  createPlayer() {

    if (
      this.textures.exists(
        "map04_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map04_front"
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

        up: "W",
        down: "S",
        left: "A",
        right: "D",
        interact: "E",
        enter: "ENTER"

      });

  }


  update() {

    if (!this.player?.body) {
      return;
    }


    this.recoverStuckInput();


    if (this.inputLocked) {

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
      this.cursors.left.isDown ||
      this.keys.left.isDown
    ) {

      vx =
        -speed;

    }

    else if (
      this.cursors.right.isDown ||
      this.keys.right.isDown
    ) {

      vx =
        speed;

    }


    if (
      this.cursors.up.isDown ||
      this.keys.up.isDown
    ) {

      vy =
        -speed;

    }

    else if (
      this.cursors.down.isDown ||
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
        vx < 0 &&
        this.textures.exists(
          "map04_left"
        )
      ) {

        this.player.setTexture(
          "map04_left"
        );

      }

      else if (
        vx > 0 &&
        this.textures.exists(
          "map04_right"
        )
      ) {

        this.player.setTexture(
          "map04_right"
        );

      }


      return;

    }


    if (
      vy < 0 &&
      this.textures.exists(
        "map04_back"
      )
    ) {

      this.player.setTexture(
        "map04_back"
      );

    }

    else if (
      vy > 0 &&
      this.textures.exists(
        "map04_front"
      )
    ) {

      this.player.setTexture(
        "map04_front"
      );

    }

  }


  updatePrompt() {

    const target =
      this.targetInRange();


    if (!target) {

      this.prompt
        ?.setVisible(
          false
        );

      return;

    }


    this.prompt
      ?.setText(
        `[E] ${target.label} 조사`
      )
      .setVisible(
        true
      );

  }


  /* =====================================================
     INTERACTION
  ====================================================== */

  async interact() {

    if (
      this.inputLocked ||
      this.interactionRunning
    ) {

      return;

    }


    /*
      현재 미션 대상만 조사 가능.
    */

    const target =
      this.targetInRange();


    if (!target) {

      return;

    }


    this.lockInput();


    try {

      switch (
        this.state.phase
      ) {

        case "fountain":

          await this.handleFountain();

          break;


        case "observatory":

          await this.handleObservatory();

          break;


        case "library":

          await this.handleLibrary();

          break;


        case "time_circle":

          await this.handleTimeCircle();

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
        "MAP04 interaction error:",
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

      "시간이 뒤틀린 고대 유적이 눈앞에 나타났다.",

      "나: 여긴 시간이 멈춘 것 같아.",

      "루미: 네 번째 언어 수정 때문에 유적의 시간이 엉켜 버렸어.",

      "루미: 순서대로 장치를 복구해야 해.",

      "루미: 먼저 중앙의 푸른 수정 분수를 조사하자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "fountain";


    this.save();

  }


  /* =====================================================
     1. FOUNTAIN
  ====================================================== */

  async handleFountain() {

    if (
      this.state.phase !==
      "fountain"
    ) {

      return;

    }


    const quiz =
      QuizEngine.wordToKorean(
        this.content.words,
        this.state.usedWords
      );


    if (!quiz) {

      await GameUI.say(
        "루미: MAP04 단어 데이터가 부족해."
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
        "fountain"
      );


      await GameUI.say(
        "루미: 수정 분수가 반응하지 않아. 다시 해 보자!"
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


    /*
      오직 여기서만
      fountain → observatory
    */

    this.state.phase =
      "observatory";


    this.save();


    await GameUI.say([

      "푸른 수정 분수가 다시 흐르기 시작했다.",

      "루미: 첫 번째 말의 조각이야!",

      "루미: 이제 왼쪽 위의 고대 천문대로 가자!"

    ]);

  }


  /* =====================================================
     2. OBSERVATORY
  ====================================================== */

  async handleObservatory() {

    if (
      this.state.phase !==
      "observatory"
    ) {

      return;

    }


    const quiz =
      QuizEngine.koreanToWord(
        this.content.words,
        this.state.usedWords
      );


    if (!quiz) {

      await GameUI.say(
        "루미: MAP04 단어 데이터가 부족해."
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
        "observatory"
      );


      await GameUI.say(
        "루미: 천문대가 아직 반응하지 않아. 다시 해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "observatory"
    );


    /*
      observatory → library
    */

    this.state.phase =
      "library";


    this.save();


    await GameUI.say([

      "천문대의 별자리 장치가 움직이기 시작했다.",

      "나: 오른쪽 위에서 푸른 빛이 보여!",

      "루미: 좋아! 이제 오른쪽 위 푸른 서재로 가자!"

    ]);

  }


  /* =====================================================
     3. LIBRARY
  ====================================================== */

  async handleLibrary() {

    if (
      this.state.phase !==
      "library"
    ) {

      return;

    }


    const quiz =
      QuizEngine.expressionToKorean(
        this.content.expressions,
        this.state.usedExpressions
      );


    if (!quiz) {

      await GameUI.say(
        "루미: MAP04 영어 표현 데이터가 부족해."
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
        "library"
      );


      await GameUI.say(
        "루미: 서재의 봉인이 풀리지 않았어. 다시 해 보자!"
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


    /*
      library → time_circle
    */

    this.state.phase =
      "time_circle";


    this.save();


    await GameUI.say([

      "푸른 서재의 책들이 제자리로 돌아왔다.",

      "루미: 두 번째 말의 조각을 찾았어!",

      "루미: 이제 중앙 아래쪽 시간 마법진으로 가자!"

    ]);

  }


  /* =====================================================
     4. TIME CIRCLE
  ====================================================== */

  async handleTimeCircle() {

    if (
      this.state.phase !==
      "time_circle"
    ) {

      return;

    }


    const expression =
      QuizEngine.pickExpression(
        this.content.expressions,
        this.state.usedExpressions
      );


    if (!expression) {

      await GameUI.say(
        "루미: 문장 배열에 사용할 MAP04 표현 데이터가 부족해."
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
        "time_circle"
      );


      await GameUI.say(
        "루미: 시간 마법진이 반응하지 않아. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "time_circle"
    );


    /*
      time_circle → crystal
    */

    this.state.phase =
      "crystal";


    this.save();


    await GameUI.say([

      "시간 마법진이 다시 회전하기 시작했다.",

      "나: 오른쪽 아래 보라 수정이 빛나!",

      "루미: 보라 수정 제단으로 가자!"

    ]);

  }


  /* =====================================================
     5. CRYSTAL
  ====================================================== */

  async handleCrystal() {

    if (
      this.state.phase !==
      "crystal"
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
        "루미: 마지막 문제를 만들 MAP04 데이터가 부족해."
      );

      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `시간 수정의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "crystal"
      );


      await GameUI.say(
        "루미: 마지막 봉인이 아직 남아 있어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "crystal"
    );


    this.state.shards =
      3;


    /*
      crystal 단계에서만
      exit로 이동 가능.
    */

    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "보라 수정에서 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 가운데 위쪽의 큰 고대 사원 문이 열렸어!",

      "루미: 이제 고대 사원 문으로 가자!"

    ]);

  }


  /* =====================================================
     6. EXIT
  ====================================================== */

  async handleExit() {

    if (
      this.state.phase !==
      "exit"
    ) {

      return;

    }


    await this.completeMap();

  }


  /* =====================================================
     MEMORY / SCORE
  ====================================================== */

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


  /* =====================================================
     CLEAR
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


    if (nextMap) {

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

      "가운데 위의 고대 사원 문이 열렸다.",

      "유적 전체의 시간이 다시 흐르기 시작했다.",

      "루미: 네 번째 언어 수정도 복원됐어!",

      nextMap
        ? `루미: 다음 목적지는 ${nextMap}이야!`
        : "루미: 모든 언어 수정을 복원했어!"

    ]);


    if (
      nextMap &&
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

  saveRaw() {

    saveMapProgress(
      MAP_ID,
      this.profile.name,
      this.state
    );

  }


  save() {

    this.saveRaw();

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


    if (shards) {

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


    if (!objective) {
      return;
    }


    const objectives = {

      fountain:
        "중앙 푸른 수정 분수를 조사하자.",

      observatory:
        "왼쪽 위 고대 천문대를 조사하자.",

      library:
        "오른쪽 위 푸른 서재를 조사하자.",

      time_circle:
        "중앙 아래 시간 마법진을 조사하자.",

      crystal:
        "오른쪽 아래 보라 수정 제단을 조사하자.",

      exit:
        "가운데 위 큰 고대 사원 문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "시간 유적을 복원하자.";

  }

}
