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


const MAP_ID = "MAP11";


export default class Map11Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map11_background",
      `${base}assets/maps/map11.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map11_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map11_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map11_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map11_right",
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
      "map11_background"
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
            "MAP11 intro error:",
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
      "center_rune",
      "moon_tower",
      "sun_tower",
      "left_bridge",
      "right_bridge",
      "throne",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "center_rune";

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
      "MAP11 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "center_rune",

        label:
          "얼음 문양",

        x:
          385,

        y:
          305,

        radius:
          92
      },


      {
        id:
          "moon_tower",

        label:
          "달 수정탑",

        x:
          105,

        y:
          155,

        radius:
          95
      },


      {
        id:
          "sun_tower",

        label:
          "태양 수정탑",

        x:
          665,

        y:
          155,

        radius:
          95
      },


      {
        id:
          "left_bridge",

        label:
          "금이 간 얼음 다리",

        x:
          150,

        y:
          355,

        radius:
          95
      },


      {
        id:
          "right_bridge",

        label:
          "무너지는 얼음 다리",

        x:
          620,

        y:
          355,

        radius:
          95
      },


      {
        id:
          "throne",

        label:
          "얼음 왕좌",

        x:
          385,

        y:
          175,

        radius:
          95
      },


      {
        id:
          "exit",

        label:
          "얼음 성 봉인문",

        x:
          385,

        y:
          65,

        radius:
          100
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        385,
        305,
        21,
        0x6bdcff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xd7f8ff,
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
            "#11243ddd",

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

      center_rune:
        [385, 305],

      moon_tower:
        [105, 155],

      sun_tower:
        [665, 155],

      left_bridge:
        [150, 355],

      right_bridge:
        [620, 355],

      throne:
        [385, 175],

      exit:
        [385, 65]

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
        "map11_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map11_front"
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
          "map11_left"
        )
      ) {

        this.player.setTexture(
          "map11_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map11_right"
        )
      ) {

        this.player.setTexture(
          "map11_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map11_back"
      )
    ) {

      this.player.setTexture(
        "map11_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map11_front"
      )
    ) {

      this.player.setTexture(
        "map11_front"
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

        case "center_rune":

          await this.handleCenterRune();

          break;


        case "moon_tower":

          await this.handleMoonTower();

          break;


        case "sun_tower":

          await this.handleSunTower();

          break;


        case "left_bridge":

          await this.handleLeftBridge();

          break;


        case "right_bridge":

          await this.handleRightBridge();

          break;


        case "throne":

          await this.handleThrone();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP11 interaction error:",
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

      "얼음 성 곳곳에서 거대한 균열 소리가 울렸다.",

      "나: 성이 무너지고 있어!",

      "루미: 열한 번째 언어 수정의 힘이 약해지면서 얼음 마법이 녹고 있어.",

      "루미: 수정탑과 다리, 왕좌의 봉인을 빠르게 복구해야 해.",

      "루미: 먼저 중앙의 얼음 문양을 조사하자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "center_rune";


    this.save();

  }


  /* =====================================================
     1. CENTER RUNE
  ====================================================== */

  async handleCenterRune() {

    if (
      this.state.phase !==
      "center_rune"
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
        "루미: MAP11 단어 데이터가 부족해."
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
        "center_rune"
      );


      await GameUI.say(
        "루미: 얼음 문양이 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "center_rune"
    );


    this.state.phase =
      "moon_tower";


    this.save();


    await GameUI.say([

      "중앙 얼음 문양에 푸른 빛이 퍼졌다.",

      "루미: 좋아! 먼저 왼쪽 위 달 수정탑을 복구하자!"

    ]);

  }


  /* =====================================================
     2. MOON TOWER
  ====================================================== */

  async handleMoonTower() {

    if (
      this.state.phase !==
      "moon_tower"
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
        "루미: MAP11 단어 데이터가 부족해."
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
        "moon_tower"
      );


      await GameUI.say(
        "루미: 달 수정이 아직 흐려. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "moon_tower"
    );


    this.state.shards =
      1;


    this.state.phase =
      "sun_tower";


    this.save();


    await GameUI.say([

      "달 수정탑의 빛이 되살아났다.",

      "루미: 첫 번째 말의 조각이야!",

      "루미: 이제 오른쪽 위 태양 수정탑으로 가자!"

    ]);

  }


  /* =====================================================
     3. SUN TOWER
  ====================================================== */

  async handleSunTower() {

    if (
      this.state.phase !==
      "sun_tower"
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
        "루미: MAP11 영어 표현 데이터가 부족해."
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
        "sun_tower"
      );


      await GameUI.say(
        "루미: 태양 수정이 아직 깨져 있어. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "sun_tower"
    );


    this.state.phase =
      "left_bridge";


    this.save();


    await GameUI.say([

      "태양 수정탑의 얼음 결정이 다시 굳기 시작했다.",

      "나: 왼쪽 아래의 갈라진 다리도 빛나고 있어.",

      "루미: 금이 간 얼음 다리로 가자!"

    ]);

  }


  /* =====================================================
     4. LEFT BRIDGE
  ====================================================== */

  async handleLeftBridge() {

    if (
      this.state.phase !==
      "left_bridge"
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
        "루미: 문장 배열에 사용할 MAP11 영어 표현이 부족해."
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
        "left_bridge"
      );


      await GameUI.say(
        "루미: 얼음 다리가 아직 갈라져 있어. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "left_bridge"
    );


    this.state.shards =
      2;


    this.state.phase =
      "right_bridge";


    this.save();


    await GameUI.say([

      "금이 간 얼음 다리가 다시 단단하게 얼어붙었다.",

      "루미: 두 번째 말의 조각을 찾았어!",

      "루미: 이번엔 오른쪽의 무너지는 얼음 다리를 복구하자!"

    ]);

  }


  /* =====================================================
     5. RIGHT BRIDGE
  ====================================================== */

  async handleRightBridge() {

    if (
      this.state.phase !==
      "right_bridge"
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
        "루미: MAP11 영어 표현 데이터가 부족해."
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
        "right_bridge"
      );


      await GameUI.say(
        "루미: 다리가 계속 녹고 있어. 영어 표현을 다시 골라 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "right_bridge"
    );


    this.state.phase =
      "throne";


    this.save();


    await GameUI.say([

      "오른쪽 얼음 다리가 다시 연결됐다.",

      "나: 중앙 위쪽 왕좌에서 강한 빛이 나오고 있어!",

      "루미: 얼음 왕좌로 가자!"

    ]);

  }


  /* =====================================================
     6. THRONE
  ====================================================== */

  async handleThrone() {

    if (
      this.state.phase !==
      "throne"
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
        "루미: 마지막 문제를 만들 MAP11 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `얼음 왕좌의 마지막 봉인!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "throne"
      );


      await GameUI.say(
        "루미: 왕좌의 봉인이 아직 풀리지 않았어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "throne"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "얼음 왕좌가 눈부신 푸른빛으로 빛났다.",

      "세 번째 말의 조각이 왕좌 위로 떠올랐다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 좋아! 위쪽 중앙 봉인문이 열렸어.",

      "루미: 얼음 성 봉인문으로 가자!"

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

      center_rune:
        "루미: 중앙의 큰 눈꽃 문양을 조사해 봐!",

      moon_tower:
        "루미: 왼쪽 위 달 모양이 있는 수정탑으로 가자!",

      sun_tower:
        "루미: 오른쪽 위 태양 모양이 있는 수정탑으로 가자!",

      left_bridge:
        "루미: 왼쪽 중간의 금이 간 얼음 다리로 가자!",

      right_bridge:
        "루미: 오른쪽 중간의 무너지는 얼음 다리로 가자!",

      throne:
        "루미: 가운데 위쪽의 거대한 얼음 왕좌로 가자!",

      exit:
        "루미: 맨 위 중앙의 빛나는 봉인문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 얼음 마법의 빛을 따라가자!"
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

      "얼음 성 전체의 균열이 푸른빛으로 봉합되기 시작했다.",

      "녹아내리던 얼음 폭포와 다리도 다시 단단하게 얼어붙었다.",

      "루미: 열한 번째 언어 수정도 복원됐어!",

      "나: 이제 마지막 하나만 남았네.",

      nextMap
        ? `루미: 맞아. 마지막 목적지는 ${nextMap}이야!`
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

      center_rune:
        "중앙 얼음 문양을 활성화하자.",

      moon_tower:
        "왼쪽 달 수정탑을 복구하자.",

      sun_tower:
        "오른쪽 태양 수정탑을 복구하자.",

      left_bridge:
        "금이 간 얼음 다리를 복구하자.",

      right_bridge:
        "무너지는 얼음 다리를 복구하자.",

      throne:
        "얼음 왕좌의 마지막 봉인을 풀자.",

      exit:
        "상단 중앙의 얼음 성 봉인문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "녹아내리는 얼음 성을 복원하자.";

  }

}
