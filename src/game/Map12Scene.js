import Phaser from "phaser";

import {
  getMapContent,
  newMapState,
  loadMapProgress,
  saveMapProgress,
  saveRecord,
  saveProfile
} from "../data.js";


const MAP_ID = "MAP12";


export default class Map12Scene extends Phaser.Scene {

  constructor() {

    super(
      MAP_ID
    );

  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map12_background",
      `${base}assets/maps/map12.png`
    );


    this.load.image(
      "map12_boss_portrait",
      `${base}assets/portraits/boss_portrait.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (
      sprites?.front
    ) {

      this.load.image(
        "map12_front",
        sprites.front
      );

    }


    if (
      sprites?.back
    ) {

      this.load.image(
        "map12_back",
        sprites.back
      );

    }


    if (
      sprites?.left
    ) {

      this.load.image(
        "map12_left",
        sprites.left
      );

    }


    if (
      sprites?.right
    ) {

      this.load.image(
        "map12_right",
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


    this.bossBattleRunning =
      false;


    this.interactables =
      [];


    this.add.image(
      384,
      288,
      "map12_background"
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

    this.createBossHud();

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

        catch (
          error
        ) {

          console.error(
            "MAP12 intro error:",
            error
          );

        }

        finally {

          if (
            this.state.phase !==
            "ending"
          ) {

            this.forceUnlock();

          }

        }

      }
    );

  }


  prepareState() {

    const validPhases = [

      "crystal_circle",
      "left_library",
      "right_library",
      "moon_altar",
      "sun_altar",
      "throne",
      "boss",
      "ending"

    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
      &&
      !this.state.completed
    ) {

      this.state.phase =
        "crystal_circle";

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


    this.state.bossHp ??=
      5;


    this.state.bossRound ??=
      1;


    /*
      예전 저장 데이터에서 bossHp가 0인데
      completed가 false일 경우 복구
    */

    if (
      !this.state.completed
      &&
      this.state.phase ===
      "boss"
      &&
      this.state.bossHp <= 0
    ) {

      this.state.bossHp =
        5;


      this.state.bossRound =
        1;

    }

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


    if (
      this.state.phase ===
      "boss"
      ||
      this.state.phase ===
      "ending"
      ||
      this.bossBattleRunning
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
      "MAP12 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "crystal_circle",

        label:
          "중앙 수정 원",

        x:
          385,

        y:
          290,

        radius:
          105
      },


      {
        id:
          "left_library",

        label:
          "왼쪽 고대 서고",

        x:
          115,

        y:
          120,

        radius:
          90
      },


      {
        id:
          "right_library",

        label:
          "오른쪽 고대 서고",

        x:
          655,

        y:
          120,

        radius:
          90
      },


      {
        id:
          "moon_altar",

        label:
          "달의 제단",

        x:
          110,

        y:
          420,

        radius:
          95
      },


      {
        id:
          "sun_altar",

        label:
          "태양의 제단",

        x:
          660,

        y:
          420,

        radius:
          95
      },


      {
        id:
          "throne",

        label:
          "침묵의 왕좌",

        x:
          385,

        y:
          115,

        radius:
          105
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        385,
        290,
        23,
        0xc185ff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xf1dcff,
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
            "#160f29dd",

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

      crystal_circle:
        [385, 290],

      left_library:
        [115, 120],

      right_library:
        [655, 120],

      moon_altar:
        [110, 420],

      sun_altar:
        [660, 420],

      throne:
        [385, 115]

    };


    const point =
      points[
        this.state.phase
      ];


    if (
      !point
      ||
      this.state.phase ===
      "boss"
      ||
      this.state.phase ===
      "ending"
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
        "map12_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map12_front"
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


  createBossHud() {

    this.bossHud =
      this.add.container(
        384,
        55
      )
        .setDepth(
          900
        )
        .setVisible(
          false
        );


    const panel =
      this.add.rectangle(
        0,
        0,
        400,
        54,
        0x090510,
        0.9
      )
        .setStrokeStyle(
          2,
          0x8f52c9,
          1
        );


    this.bossNameText =
      this.add.text(
        -185,
        -17,
        "침묵의 군주",
        {

          fontFamily:
            "Arial",

          fontSize:
            "13px",

          fontStyle:
            "bold",

          color:
            "#f0ddff"

        }
      );


    this.bossHpText =
      this.add.text(
        185,
        -17,
        "",
        {

          fontFamily:
            "Arial",

          fontSize:
            "13px",

          fontStyle:
            "bold",

          color:
            "#ffb3f5"

        }
      )
        .setOrigin(
          1,
          0
        );


    this.bossHpBarBack =
      this.add.rectangle(
        0,
        13,
        360,
        12,
        0x26132f,
        1
      );


    this.bossHpBar =
      this.add.rectangle(
        -180,
        13,
        360,
        12,
        0xb45cff,
        1
      )
        .setOrigin(
          0,
          0.5
        );


    this.bossHud.add([
      panel,
      this.bossNameText,
      this.bossHpText,
      this.bossHpBarBack,
      this.bossHpBar
    ]);


    this.updateBossHud();

  }


  updateBossHud() {

    if (
      !this.bossHud
    ) {

      return;

    }


    const hp =
      Phaser.Math.Clamp(
        Number(
          this.state.bossHp
        )
        ||
        0,
        0,
        5
      );


    this.bossHpText
      ?.setText(
        `HP ${hp} / 5`
      );


    this.bossHpBar
      ?.setDisplaySize(
        360
        *
        (
          hp / 5
        ),
        12
      );

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


    /*
      보스전 / 엔딩 중에는 이동 금지
    */

    if (
      this.state.phase ===
      "boss"
      ||
      this.state.phase ===
      "ending"
      ||
      this.bossBattleRunning
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
          "map12_left"
        )
      ) {

        this.player.setTexture(
          "map12_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map12_right"
        )
      ) {

        this.player.setTexture(
          "map12_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map12_back"
      )
    ) {

      this.player.setTexture(
        "map12_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map12_front"
      )
    ) {

      this.player.setTexture(
        "map12_front"
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
      ||
      this.bossBattleRunning
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

        case "crystal_circle":

          await this.handleCrystalCircle();

          break;


        case "left_library":

          await this.handleLeftLibrary();

          break;


        case "right_library":

          await this.handleRightLibrary();

          break;


        case "moon_altar":

          await this.handleMoonAltar();

          break;


        case "sun_altar":

          await this.handleSunAltar();

          break;


        case "throne":

          await this.handleThrone();

          break;

      }

    }

    catch (
      error
    ) {

      console.error(
        "MAP12 interaction error:",
        error
      );

    }

    finally {

      if (
        this.state.phase !==
        "boss"
        &&
        this.state.phase !==
        "ending"
      ) {

        this.forceUnlock();

      }


      this.updateGuide();

    }

  }


  async playIntro() {

    await GameUI.say([

      "얼음 성의 마지막 문 너머에는 거대한 검은 성이 기다리고 있었다.",

      "성 안에는 소리조차 사라진 듯한 침묵이 감돌았다.",

      "나: 여기가 마지막 장소구나.",

      "루미: 응. 열두 번째 언어 수정과 모든 혼란의 근원이 이 안에 있어.",

      "루미: 중앙의 수정 원부터 복원하자.",

      "루미: 이번엔 정말 마지막이야."

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "crystal_circle";


    this.save();

  }


  async handleCrystalCircle() {

    if (
      this.state.phase !==
      "crystal_circle"
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
        "루미: MAP12 단어 데이터가 부족해."
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
        "crystal_circle"
      );


      await GameUI.say(
        "루미: 수정들이 아직 깨어나지 않았어. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "crystal_circle"
    );


    this.state.shards =
      1;


    this.state.phase =
      "left_library";


    this.save();


    await GameUI.say([

      "중앙의 열두 수정이 희미하게 빛나기 시작했다.",

      "루미: 첫 번째 말의 조각이야.",

      "루미: 왼쪽 위 고대 서고의 봉인이 약해졌어!"

    ]);

  }


  async handleLeftLibrary() {

    if (
      this.state.phase !==
      "left_library"
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
        "루미: MAP12 단어 데이터가 부족해."
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
        "left_library"
      );


      await GameUI.say(
        "루미: 기록이 읽히지 않아. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "left_library"
    );


    this.state.phase =
      "right_library";


    this.save();


    await GameUI.say([

      "왼쪽 서고의 글자들이 다시 모습을 드러냈다.",

      "나: 반대쪽 서고에서도 빛이 나.",

      "루미: 오른쪽 고대 서고로 가자!"

    ]);

  }


  async handleRightLibrary() {

    if (
      this.state.phase !==
      "right_library"
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
        "루미: MAP12 영어 표현 데이터가 부족해."
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
        "right_library"
      );


      await GameUI.say(
        "루미: 문장의 의미가 아직 봉인되어 있어. 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "right_library"
    );


    this.state.shards =
      2;


    this.state.phase =
      "moon_altar";


    this.save();


    await GameUI.say([

      "오른쪽 서고의 봉인이 풀리며 두 번째 말의 조각이 나타났다.",

      "루미: 이제 아래 왼쪽의 달의 제단으로 가자!"

    ]);

  }


  async handleMoonAltar() {

    if (
      this.state.phase !==
      "moon_altar"
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
        "루미: MAP12 문장 데이터가 부족해."
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
        "moon_altar"
      );


      await GameUI.say(
        "루미: 달의 제단이 다시 어두워졌어. 문장 순서를 다시 맞춰 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "moon_altar"
    );


    this.state.phase =
      "sun_altar";


    this.save();


    await GameUI.say([

      "달의 제단에서 은빛 빛줄기가 왕좌를 향해 뻗어 나갔다.",

      "루미: 이제 오른쪽 아래 태양의 제단이야!"

    ]);

  }


  async handleSunAltar() {

    if (
      this.state.phase !==
      "sun_altar"
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
        "루미: MAP12 영어 표현 데이터가 부족해."
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
        "sun_altar"
      );


      await GameUI.say(
        "루미: 태양의 제단이 반응하지 않아. 영어 표현을 다시 골라 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "sun_altar"
    );


    this.state.shards =
      3;


    this.state.phase =
      "throne";


    this.save();


    await GameUI.say([

      "태양의 제단에서 황금빛이 솟아올랐다.",

      "세 번째 말의 조각이 중앙 수정 원으로 날아갔다.",

      "나: 세 조각을 모두 모았어.",

      "루미: 왕좌의 봉인이 풀렸어.",

      "루미: 이제 침묵의 군주를 만나러 가자."

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


    this.state.phase =
      "boss";


    this.state.bossHp =
      5;


    this.state.bossRound =
      1;


    this.save();


    this.guide
      ?.setVisible(
        false
      );


    this.prompt
      ?.setVisible(
        false
      );


    await this.startBossBattle();

  }


  async showHint() {

    this.state.hintsUsed++;


    this.save();


    const hints = {

      crystal_circle:
        "루미: 중앙의 수정 원을 조사해!",

      left_library:
        "루미: 왼쪽 위 고대 서고로 가자!",

      right_library:
        "루미: 오른쪽 위 고대 서고로 가자!",

      moon_altar:
        "루미: 왼쪽 아래 달의 제단으로 가자!",

      sun_altar:
        "루미: 오른쪽 아래 태양의 제단으로 가자!",

      throne:
        "루미: 중앙 위쪽 침묵의 왕좌로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 마지막 수정의 빛을 따라가자!"
    );

  }


  async startBossBattle() {

    if (
      this.bossBattleRunning
    ) {

      return;

    }


    this.bossBattleRunning =
      true;


    this.inputLocked =
      true;


    this.interactionRunning =
      true;


    this.bossHud
      ?.setVisible(
        true
      );


    this.updateBossHud();


    try {

      await this.bossSay([

        "침묵의 군주: 결국 여기까지 왔군.",

        "침묵의 군주: 인간은 언제나 말로 서로를 상처 입힌다.",

        "침묵의 군주: 그러니 모든 말을 없애면 갈등도 사라지지.",

        "나: 아니야.",

        "나: 말은 상처를 주기도 하지만, 서로를 이해하게 만들 수도 있어.",

        "루미: 우리가 되찾은 열한 개의 수정이 그 증거야.",

        "침묵의 군주: 그렇다면 보여 보아라.",

        "침묵의 군주: 네가 되찾은 언어의 힘을!"

      ]);


      while (
        this.state.bossHp > 0
      ) {

        const round =
          Phaser.Math.Clamp(
            this.state.bossRound,
            1,
            5
          );


        const correct =
          await this.runBossRound(
            round
          );


        if (
          correct
        ) {

          this.state.bossHp =
            Math.max(
              0,
              this.state.bossHp - 1
            );


          this.state.bossRound =
            Math.min(
              5,
              round + 1
            );


          this.save();

          this.updateBossHud();


          if (
            this.state.bossHp > 0
          ) {

            await this.bossSay(
              this.getBossDamageDialogue(
                this.state.bossHp
              )
            );

          }

        }

      }


      await this.finishBossBattle();

    }

    catch (
      error
    ) {

      console.error(
        "MAP12 boss battle error:",
        error
      );


      /*
        치명적 오류가 나더라도
        게임 입력이 영구 잠기지 않도록 한다.
      */

      this.state.phase =
        "throne";


      this.bossHud
        ?.setVisible(
          false
        );


      this.forceUnlock();

    }

    finally {

      this.bossBattleRunning =
        false;

    }

  }


  async runBossRound(
    round
  ) {

    let quiz =
      null;


    let correct =
      false;


    const attemptKey =
      `boss_round_${round}`;


    /*
      ROUND 1
      영어 단어 -> 뜻
    */

    if (
      round === 1
    ) {

      quiz =
        QuizEngine.wordToKorean(
          this.content.words,
          this.state.usedWords
        );


      if (
        !quiz
      ) {

        await this.bossSay(
          "루미: 보스 문제를 만들 MAP12 단어 데이터가 부족해."
        );


        return false;

      }


      this.state.questionsShown++;


      correct =
        await GameUI.choice(
          `침묵의 군주 · 1단계\n${quiz.question}`,
          quiz.options,
          quiz.correctIndex
        );


      if (
        correct
      ) {

        this.rememberWord(
          quiz.itemKey
        );

      }

    }


    /*
      ROUND 2
      한국어 뜻 -> 영어 단어
    */

    else if (
      round === 2
    ) {

      quiz =
        QuizEngine.koreanToWord(
          this.content.words,
          this.state.usedWords
        );


      if (
        !quiz
      ) {

        await this.bossSay(
          "루미: 보스 문제를 만들 MAP12 단어 데이터가 부족해."
        );


        return false;

      }


      this.state.questionsShown++;


      correct =
        await GameUI.choice(
          `침묵의 군주 · 2단계\n${quiz.question}`,
          quiz.options,
          quiz.correctIndex
        );


      if (
        correct
      ) {

        this.rememberWord(
          quiz.itemKey
        );

      }

    }


    /*
      ROUND 3
      영어 표현 -> 뜻
    */

    else if (
      round === 3
    ) {

      quiz =
        QuizEngine.expressionToKorean(
          this.content.expressions,
          this.state.usedExpressions
        );


      if (
        !quiz
      ) {

        await this.bossSay(
          "루미: 보스 문제를 만들 MAP12 표현 데이터가 부족해."
        );


        return false;

      }


      this.state.questionsShown++;


      correct =
        await GameUI.choice(
          `침묵의 군주 · 3단계\n${quiz.question}`,
          quiz.options,
          quiz.correctIndex
        );


      if (
        correct
      ) {

        this.rememberExpression(
          quiz.itemKey
        );

      }

    }


    /*
      ROUND 4
      한국어 뜻 -> 영어 표현
    */

    else if (
      round === 4
    ) {

      quiz =
        QuizEngine.koreanToExpression(
          this.content.expressions,
          this.state.usedExpressions
        );


      if (
        !quiz
      ) {

        await this.bossSay(
          "루미: 보스 문제를 만들 MAP12 표현 데이터가 부족해."
        );


        return false;

      }


      this.state.questionsShown++;


      correct =
        await GameUI.choice(
          `침묵의 군주 · 4단계\n${quiz.question}`,
          quiz.options,
          quiz.correctIndex
        );


      if (
        correct
      ) {

        this.rememberExpression(
          quiz.itemKey
        );

      }

    }


    /*
      ROUND 5
      최종 랜덤 복습
    */

    else {

      quiz =
        QuizEngine.randomReview(
          this.content,
          this.state.usedWords,
          this.state.usedExpressions
        );


      if (
        !quiz
      ) {

        await this.bossSay(
          "루미: 최종 문제를 만들 MAP12 학습 데이터가 부족해."
        );


        return false;

      }


      this.state.questionsShown++;


      correct =
        await GameUI.choice(
          `침묵의 군주 · 최종 단계\n${quiz.question}`,
          quiz.options,
          quiz.correctIndex
        );

    }


    if (
      !correct
    ) {

      this.markWrong(
        attemptKey
      );


      await this.bossSay([

        "침묵의 군주: 그 정도인가?",

        "루미: 괜찮아! 틀렸다고 끝나는 게 아니야.",

        `루미: ${round}단계 문제를 다시 풀어 보자!`

      ]);


      return false;

    }


    this.markCorrect(
      attemptKey
    );


    this.save();


    return true;

  }


  getBossDamageDialogue(
    hp
  ) {

    if (
      hp === 4
    ) {

      return [

        "침묵의 군주: ...!",

        "루미: 통했어! 계속 가자!"

      ];

    }


    if (
      hp === 3
    ) {

      return [

        "침묵의 군주: 언어 따위가 이런 힘을...",

        "나: 아직 끝나지 않았어."

      ];

    }


    if (
      hp === 2
    ) {

      return [

        "침묵의 군주: 침묵이야말로 완전한 세계다!",

        "루미: 서로 이해할 기회까지 없애 버린 세계가 완전할 리 없어!"

      ];

    }


    if (
      hp === 1
    ) {

      return [

        "침묵의 군주: 그만...!",

        "나: 마지막 문제야."

      ];

    }


    return [
      "루미: 조금만 더!"
    ];

  }


  async finishBossBattle() {

    this.state.bossHp =
      0;


    this.state.completed =
      true;


    this.state.phase =
      "ending";


    this.save();


    this.updateBossHud();


    await this.bossSay([

      "침묵의 군주: 어째서...",

      "침묵의 군주: 말은 갈등만을 낳는 것이 아니었단 말인가...",

      "나: 언어는 정답을 외우는 힘이 아니야.",

      "나: 서로를 이해하게 만드는 힘이야.",

      "루미: 누군가에게 말을 건네는 순간, 새로운 길이 생길 수도 있어."

    ]);


    this.bossHud
      ?.setVisible(
        false
      );


    /*
      MAP12 기록 저장
    */

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


    this.profile.currentMap =
      MAP_ID;


    this.profile.gameCompleted =
      true;


    saveProfile(
      this.profile
    );


    await this.playTrueEnding(
      seconds
    );

  }


  async playTrueEnding(
    seconds
  ) {

    await GameUI.say([

      "침묵의 군주의 갑옷이 빛으로 흩어졌다.",

      "성 중앙의 마지막 수정이 하늘로 떠올랐다.",

      "그 순간 지금까지 되찾은 열한 개의 수정이 하나씩 나타났다.",

      "열두 개의 언어 수정이 서로 연결되며 거대한 빛의 원을 만들었다.",

      "잃어버렸던 말들이 세상 곳곳으로 다시 퍼져 나갔다.",

      "사람들은 다시 서로의 목소리를 들을 수 있게 되었다.",

      "나: 끝난 거지?",

      "루미: 응.",

      "루미: 하지만 언어의 모험은 아마 계속될 거야.",

      "루미: 새로운 말을 배우고, 누군가를 이해하려고 하는 동안에는."

    ]);


    this.showEndingScreen(
      seconds
    );

  }


  showEndingScreen(
    seconds
  ) {

    const old =
      document.querySelector(
        "#wisdom-final-ending"
      );


    old?.remove();


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "wisdom-final-ending";


    overlay.innerHTML = `

      <div class="wisdom-ending-card">

        <div class="wisdom-ending-small">
          WISDOM MAZE
        </div>

        <h1>
          THE END
        </h1>

        <div class="wisdom-ending-crystals">
          ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆
        </div>

        <h2>
          열두 언어 수정 복원 완료
        </h2>

        <p class="wisdom-ending-player">
          ${this.escapeHtml(
            this.profile?.name
            ??
            "모험가"
          )}
        </p>

        <p class="wisdom-ending-message">
          언어는 정답을 외우는 힘이 아니라<br>
          서로를 이해하게 만드는 힘입니다.
        </p>

        <div class="wisdom-ending-time">
          마지막 모험 기록 ·
          ${this.formatTime(
            seconds
          )}
        </div>

        <button
          type="button"
          id="wisdom-ending-title"
        >
          타이틀로 돌아가기
        </button>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    this.injectEndingStyle();


    overlay
      .querySelector(
        "#wisdom-ending-title"
      )
      ?.addEventListener(
        "click",
        () => {

          overlay.remove();


          if (
            window.WisdomGame
              ?.showTitle
          ) {

            window.WisdomGame.showTitle();

            return;

          }


          window.location.reload();

        }
      );

  }


  injectEndingStyle() {

    if (
      document.querySelector(
        "#wisdom-ending-style"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "wisdom-ending-style";


    style.textContent = `

      #wisdom-final-ending {

        position:
          fixed;

        inset:
          0;

        z-index:
          50000;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        padding:
          20px;

        box-sizing:
          border-box;

        background:
          radial-gradient(
            circle at center,
            rgba(62, 49, 112, .96),
            rgba(4, 5, 13, .99) 68%
          );

      }


      .wisdom-ending-card {

        width:
          min(600px, 100%);

        padding:
          38px 24px;

        box-sizing:
          border-box;

        border:
          2px solid
          rgba(211, 188, 255, .7);

        border-radius:
          24px;

        color:
          #ffffff;

        text-align:
          center;

        background:
          linear-gradient(
            180deg,
            rgba(27, 20, 52, .98),
            rgba(9, 9, 23, .98)
          );

        box-shadow:
          0 25px 100px
          rgba(0, 0, 0, .75);

      }


      .wisdom-ending-small {

        color:
          #d6c3ff;

        font-size:
          12px;

        font-weight:
          900;

        letter-spacing:
          .24em;

      }


      .wisdom-ending-card h1 {

        margin:
          12px 0 6px;

        color:
          #ffffff;

        font-size:
          clamp(
            44px,
            10vw,
            78px
          );

        line-height:
          1;

        letter-spacing:
          .08em;

      }


      .wisdom-ending-crystals {

        margin:
          20px 0;

        color:
          #bff7ff;

        font-size:
          18px;

        letter-spacing:
          5px;

        line-height:
          1.8;

      }


      .wisdom-ending-card h2 {

        margin:
          6px 0 14px;

        color:
          #ffe693;

        font-size:
          22px;

      }


      .wisdom-ending-player {

        margin:
          8px 0 22px;

        color:
          #e5d9ff;

        font-size:
          18px;

        font-weight:
          900;

      }


      .wisdom-ending-message {

        margin:
          0 auto 22px;

        color:
          #d8def2;

        font-size:
          16px;

        line-height:
          1.9;

      }


      .wisdom-ending-time {

        margin:
          0 0 24px;

        color:
          #9fb0d3;

        font-size:
          13px;

      }


      #wisdom-ending-title {

        min-width:
          210px;

        min-height:
          50px;

        padding:
          12px 22px;

        border:
          2px solid
          #f2d879;

        border-radius:
          12px;

        color:
          #291d00;

        font-size:
          15px;

        font-weight:
          900;

        background:
          linear-gradient(
            #fff1a2,
            #e6b745
          );

        cursor:
          pointer;

      }


      #wisdom-ending-title:active {

        transform:
          translateY(2px);

      }

    `;


    document.head.appendChild(
      style
    );

  }


  async bossSay(
    lines
  ) {

    const items =
      Array.isArray(
        lines
      )
        ? lines
        : [lines];


    /*
      보스 초상화를 직접 보여주는 전용 대화창
    */

    for (
      const line of
      items
    ) {

      await this.showBossLine(
        line
      );

    }

  }


  showBossLine(
    line
  ) {

    return new Promise(
      resolve => {

        const old =
          document.querySelector(
            "#wisdom-boss-dialogue"
          );


        old?.remove();


        const overlay =
          document.createElement(
            "div"
          );


        overlay.id =
          "wisdom-boss-dialogue";


        overlay.innerHTML = `

          <div class="wisdom-boss-box">

            <img
              class="wisdom-boss-portrait"
              src="${
                import.meta.env.BASE_URL
              }assets/portraits/boss_portrait.png"
              alt="침묵의 군주"
            >

            <div class="wisdom-boss-text">

              <div class="wisdom-boss-name">
                침묵의 군주
              </div>

              <div class="wisdom-boss-line">
                ${this.escapeHtml(
                  line
                )}
              </div>

              <button
                type="button"
                class="wisdom-boss-next"
              >
                계속
              </button>

            </div>

          </div>

        `;


        document.body.appendChild(
          overlay
        );


        this.injectBossDialogueStyle();


        const finish =
          () => {

            overlay.remove();

            resolve();

          };


        overlay
          .querySelector(
            ".wisdom-boss-next"
          )
          ?.addEventListener(
            "click",
            finish,
            {
              once:
                true
            }
          );

      }
    );

  }


  injectBossDialogueStyle() {

    if (
      document.querySelector(
        "#wisdom-boss-dialogue-style"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "wisdom-boss-dialogue-style";


    style.textContent = `

      #wisdom-boss-dialogue {

        position:
          fixed;

        left:
          0;

        right:
          0;

        bottom:
          0;

        z-index:
          40000;

        padding:
          14px;

        box-sizing:
          border-box;

        background:
          linear-gradient(
            transparent,
            rgba(0,0,0,.78)
          );

      }


      .wisdom-boss-box {

        width:
          min(760px, 100%);

        margin:
          0 auto;

        display:
          flex;

        align-items:
          stretch;

        gap:
          14px;

        padding:
          14px;

        box-sizing:
          border-box;

        border:
          2px solid
          #7443a2;

        border-radius:
          16px;

        color:
          white;

        background:
          rgba(13, 8, 24, .98);

      }


      .wisdom-boss-portrait {

        width:
          120px;

        height:
          120px;

        flex:
          0 0 120px;

        object-fit:
          cover;

        border:
          2px solid
          #9d64cf;

        border-radius:
          12px;

        background:
          #090510;

      }


      .wisdom-boss-text {

        min-width:
          0;

        flex:
          1;

        display:
          flex;

        flex-direction:
          column;

      }


      .wisdom-boss-name {

        margin-bottom:
          8px;

        color:
          #d59cff;

        font-size:
          14px;

        font-weight:
          900;

      }


      .wisdom-boss-line {

        flex:
          1;

        color:
          #f4efff;

        font-size:
          16px;

        line-height:
          1.65;

        white-space:
          pre-wrap;

      }


      .wisdom-boss-next {

        align-self:
          flex-end;

        min-width:
          82px;

        min-height:
          40px;

        margin-top:
          10px;

        border:
          1px solid
          #a96ddd;

        border-radius:
          9px;

        color:
          white;

        font-weight:
          800;

        background:
          #4b286c;

        cursor:
          pointer;

      }


      @media (max-width: 520px) {

        .wisdom-boss-box {

          gap:
            10px;

          padding:
            10px;

        }


        .wisdom-boss-portrait {

          width:
            82px;

          height:
            82px;

          flex-basis:
            82px;

        }


        .wisdom-boss-line {

          font-size:
            14px;

        }

      }

    `;


    document.head.appendChild(
      style
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


  save() {

    saveMapProgress(
      MAP_ID,
      this.profile.name,
      this.state
    );


    this.updateHUD();

    this.updateGuide();

    this.updateBossHud();

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

      crystal_circle:
        "중앙 수정 원을 깨우자.",

      left_library:
        "왼쪽 고대 서고의 기록을 복원하자.",

      right_library:
        "오른쪽 고대 서고의 기록을 복원하자.",

      moon_altar:
        "달의 제단을 활성화하자.",

      sun_altar:
        "태양의 제단을 활성화하자.",

      throne:
        "침묵의 왕좌로 가자.",

      boss:
        `침묵의 군주와 최종 대결 · HP ${this.state.bossHp}/5`,

      ending:
        "열두 언어 수정이 모두 복원되었다."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "침묵의 언어 성을 탐험하자.";

  }


  escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  formatTime(
    seconds
  ) {

    const total =
      Math.max(
        0,
        Number(
          seconds
        )
        ||
        0
      );


    const minutes =
      Math.floor(
        total / 60
      );


    const secs =
      Math.floor(
        total % 60
      );


    if (
      minutes > 0
    ) {

      return (
        `${minutes}분 ${secs}초`
      );

    }


    return `${secs}초`;

  }

}
