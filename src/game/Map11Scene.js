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
      &&
      !this.state.completed
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
          "중앙 얼음 룬",

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
          "달의 탑",

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
          "태양의 탑",

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
          "왼쪽 얼음 다리",

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
          "오른쪽 얼음 다리",

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
          "최상층 봉인문",

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
        0x8eeaff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xe4fbff,
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
            "#ffffff",

          backgroundColor:
            "#102939dd",

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
      );


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

      "거대한 얼음 성 안에는 차가운 바람만 불고 있었다.",

      "나: 성 전체가 얼어붙었어.",

      "루미: 열한 번째 언어 수정이 얼음 성의 마력을 폭주시킨 것 같아.",

      "루미: 달과 태양의 힘을 다시 연결해야 왕좌의 봉인을 풀 수 있어.",

      "루미: 먼저 중앙의 얼음 룬을 조사하자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "center_rune";


    this.save();

  }


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


    if (
      !quiz
    ) {

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


    if (
      !correct
    ) {

      this.markWrong(
        "center_rune"
      );


      await GameUI.say(
        "루미: 얼음 룬이 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "center_rune"
    );


    this.state.shards =
      1;


    this.state.phase =
      "moon_tower";


    this.save();


    await GameUI.say([

      "중앙 얼음 룬에서 푸른빛이 퍼졌다.",

      "루미: 첫 번째 말의 조각이야!",

      "나: 왼쪽 위 탑에 달빛이 들어왔어.",

      "루미: 달의 탑으로 가자!"

    ]);

  }


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


    if (
      !quiz
    ) {

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


    if (
      !correct
    ) {

      this.markWrong(
        "moon_tower"
      );


      await GameUI.say(
        "루미: 달의 룬이 흐려졌어. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "moon_tower"
    );


    this.state.phase =
      "sun_tower";


    this.save();


    await GameUI.say([

      "달의 탑이 푸른빛으로 빛났다.",

      "나: 반대편 태양의 탑도 반응하고 있어.",

      "루미: 오른쪽 위 태양의 탑으로 가자!"

    ]);

  }


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


    if (
      !quiz
    ) {

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


    if (
      !correct
    ) {

      this.markWrong(
        "sun_tower"
      );


      await GameUI.say(
        "루미: 태양의 룬이 꺼졌어. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "sun_tower"
    );


    this.state.shards =
      2;


    this.state.phase =
      "left_bridge";


    this.save();


    await GameUI.say([

      "태양의 탑에서 황금빛이 퍼졌다.",

      "루미: 두 번째 말의 조각이야!",

      "나: 왼쪽 얼음 다리에 룬이 나타났어.",

      "루미: 왼쪽 다리부터 복구하자!"

    ]);

  }


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


    if (
      !expression
    ) {

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


    if (
      !correct
    ) {

      this.markWrong(
        "left_bridge"
      );


      await GameUI.say(
        "루미: 얼음 다리가 다시 갈라졌어. 문장 순서를 다시 맞춰 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "left_bridge"
    );


    this.state.phase =
      "right_bridge";


    this.save();


    await GameUI.say([

      "왼쪽 얼음 다리가 단단하게 이어졌다.",

      "나: 오른쪽 다리에도 문장이 나타났어.",

      "루미: 이번엔 오른쪽 얼음 다리야!"

    ]);

  }


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


    if (
      !quiz
    ) {

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


    if (
      !correct
    ) {

      this.markWrong(
        "right_bridge"
      );


      await GameUI.say(
        "루미: 오른쪽 다리의 마력이 부족해. 영어 표현을 다시 골라 보자!"
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

      "오른쪽 얼음 다리도 완전히 복구되었다.",

      "나: 왕좌의 봉인이 깨지고 있어!",

      "루미: 좋아. 이제 중앙 위쪽 얼음 왕좌로 가자!"

    ]);

  }


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


    if (
      !quiz
    ) {

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


    if (
      !correct
    ) {

      this.markWrong(
        "throne"
      );


      await GameUI.say(
        "루미: 왕좌의 봉인이 아직 남아 있어. 다시 풀어 보자!"
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

      "얼음 왕좌에서 세 번째 말의 조각이 나타났다.",

      "성 전체를 뒤덮었던 얼음이 천천히 녹기 시작했다.",

      "나: 마지막 문이 열렸어!",

      "루미: 위쪽 중앙 최상층 봉인문으로 가자!",

      "루미: 이제 마지막 언어 수정이 기다리고 있어."

    ]);

  }


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
        "루미: 가운데의 푸른 얼음 룬을 조사해 봐!",

      moon_tower:
        "루미: 왼쪽 위 달의 탑으로 가자!",

      sun_tower:
        "루미: 오른쪽 위 태양의 탑으로 가자!",

      left_bridge:
        "루미: 왼쪽 아래 얼음 다리의 룬을 조사해 봐!",

      right_bridge:
        "루미: 오른쪽 아래 얼음 다리로 가자!",

      throne:
        "루미: 중앙 위쪽의 얼음 왕좌로 가자!",

      exit:
        "루미: 가장 위쪽 중앙의 최상층 봉인문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 얼음 성의 빛나는 룬을 따라가자!"
    );

  }


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

      "얼음 성의 봉인이 완전히 사라졌다.",

      "열한 번째 언어 수정이 원래의 빛을 되찾았다.",

      "루미: 이제 남은 건 마지막 하나뿐이야.",

      "나: 열두 번째 언어 수정...",


      nextMap
        ? "루미: 침묵의 언어 성으로 가자."
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
        "중앙 얼음 룬을 활성화하자.",

      moon_tower:
        "왼쪽 위 달의 탑을 복구하자.",

      sun_tower:
        "오른쪽 위 태양의 탑을 복구하자.",

      left_bridge:
        "왼쪽 얼음 다리를 복구하자.",

      right_bridge:
        "오른쪽 얼음 다리를 복구하자.",

      throne:
        "얼음 왕좌의 마지막 봉인을 풀자.",

      exit:
        "최상층 봉인문을 지나 마지막 미로로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "녹아내리는 얼음 성의 언어 수정을 복원하자.";

  }

}
