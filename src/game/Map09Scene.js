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
      "clock",
      "gallery",
      "archive",
      "statue",
      "hourglass",
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
        "clock";
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
          "clock",

        label:
          "중앙 대형 시계",

        x:
          385,

        y:
          285,

        radius:
          95
      },

      {
        id:
          "gallery",

        label:
          "과거 전시관",

        x:
          150,

        y:
          155,

        radius:
          95
      },

      {
        id:
          "archive",

        label:
          "시간 기록 보관소",

        x:
          620,

        y:
          155,

        radius:
          95
      },

      {
        id:
          "statue",

        label:
          "멈춘 시간 조각상",

        x:
          155,

        y:
          380,

        radius:
          95
      },

      {
        id:
          "hourglass",

        label:
          "거대한 모래시계",

        x:
          620,

        y:
          380,

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
        0xffd66a,
        0.18
      )
        .setStrokeStyle(
          4,
          0xfff1b8,
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
            "#2a2314dd",

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
      clock:
        [385, 285],

      gallery:
        [150, 155],

      archive:
        [620, 155],

      statue:
        [155, 380],

      hourglass:
        [620, 380],

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
        case "clock":
          await this.handleClock();
          break;

        case "gallery":
          await this.handleGallery();
          break;

        case "archive":
          await this.handleArchive();
          break;

        case "statue":
          await this.handleStatue();
          break;

        case "hourglass":
          await this.handleHourglass();
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
      "거대한 박물관 안은 이상할 정도로 조용했다.",
      "나: 사람도 없고, 시계도 전부 멈춰 있어.",
      "루미: 여기는 시간이 멈춰버린 박물관이야.",
      "루미: 아홉 번째 언어 수정의 힘 때문에 과거와 현재의 시간이 뒤섞였어.",
      "루미: 박물관의 시간 장치들을 순서대로 복구해야 해.",
      "루미: 먼저 중앙의 대형 시계를 조사해 보자!"
    ]);

    this.state.introDone =
      true;

    this.state.phase =
      "clock";

    this.save();
  }

  async handleClock() {
    if (
      this.state.phase !==
      "clock"
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

    if (
      !correct
    ) {
      this.markWrong(
        "clock"
      );

      await GameUI.say(
        "루미: 시계바늘이 움직이지 않아. 단어 뜻을 다시 생각해 보자!"
      );

      return;
    }

    this.rememberWord(
      quiz.itemKey
    );

    this.markCorrect(
      "clock"
    );

    this.state.shards =
      1;

    this.state.phase =
      "gallery";

    this.save();

    await GameUI.say([
      "중앙 시계의 초침이 다시 움직이기 시작했다.",
      "루미: 첫 번째 말의 조각이야!",
      "나: 왼쪽 위 전시관의 조명이 켜졌어.",
      "루미: 과거 전시관으로 가자!"
    ]);
  }

  async handleGallery() {
    if (
      this.state.phase !==
      "gallery"
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

    if (
      !correct
    ) {
      this.markWrong(
        "gallery"
      );

      await GameUI.say(
        "루미: 전시물이 다시 멈췄어. 영어 단어를 다시 골라 보자!"
      );

      return;
    }

    this.rememberWord(
      quiz.itemKey
    );

    this.markCorrect(
      "gallery"
    );

    this.state.phase =
      "archive";

    this.save();

    await GameUI.say([
      "정지해 있던 전시물들이 천천히 움직이기 시작했다.",
      "나: 오른쪽 위 기록 보관소에도 빛이 들어왔어.",
      "루미: 시간 기록 보관소로 가자!"
    ]);
  }

  async handleArchive() {
    if (
      this.state.phase !==
      "archive"
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

    if (
      !correct
    ) {
      this.markWrong(
        "archive"
      );

      await GameUI.say(
        "루미: 시간 기록을 읽을 수 없어. 영어 표현의 뜻을 다시 생각해 보자!"
      );

      return;
    }

    this.rememberExpression(
      quiz.itemKey
    );

    this.markCorrect(
      "archive"
    );

    this.state.shards =
      2;

    this.state.phase =
      "statue";

    this.save();

    await GameUI.say([
      "보관소의 기록들이 다시 시간 순서대로 정렬되었다.",
      "루미: 두 번째 말의 조각이야!",
      "나: 왼쪽 아래 조각상이 빛나고 있어.",
      "루미: 멈춘 시간 조각상으로 가자!"
    ]);
  }

  async handleStatue() {
    if (
      this.state.phase !==
      "statue"
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

    if (
      !correct
    ) {
      this.markWrong(
        "statue"
      );

      await GameUI.say(
        "루미: 조각상이 다시 굳어 버렸어. 문장 순서를 다시 확인해 보자!"
      );

      return;
    }

    this.rememberExpression(
      expression.english
    );

    this.markCorrect(
      "statue"
    );

    this.state.phase =
      "hourglass";

    this.save();

    await GameUI.say([
      "조각상을 감싸던 시간의 얼음이 사라졌다.",
      "나: 오른쪽 아래 거대한 모래시계가 움직이기 시작했어.",
      "루미: 마지막 시험이야. 거대한 모래시계로 가자!"
    ]);
  }

  async handleHourglass() {
    if (
      this.state.phase !==
      "hourglass"
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
        "루미: 마지막 문제를 만들 MAP09 학습 데이터가 부족해."
      );

      return;
    }

    this.state.questionsShown++;

    const correct =
      await GameUI.choice(
        `모래시계의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );

    if (
      !correct
    ) {
      this.markWrong(
        "hourglass"
      );

      await GameUI.say(
        "루미: 모래가 다시 멈췄어. 마지막 문제를 다시 풀어 보자!"
      );

      return;
    }

    this.markCorrect(
      "hourglass"
    );

    this.state.shards =
      3;

    this.state.phase =
      "exit";

    this.save();

    await GameUI.say([
      "거대한 모래시계의 모래가 다시 흐르기 시작했다.",
      "세 번째 말의 조각이 나타났다.",
      "나: 박물관의 시간이 다시 움직이고 있어!",
      "루미: 좋아! 아래 중앙의 시간의 문이 열렸어.",
      "루미: 시간의 문으로 가자!"
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
      clock:
        "루미: 중앙의 대형 시계를 조사해 봐!",

      gallery:
        "루미: 왼쪽 위의 과거 전시관으로 가자!",

      archive:
        "루미: 오른쪽 위의 시간 기록 보관소로 가자!",

      statue:
        "루미: 왼쪽 아래의 멈춘 시간 조각상을 조사해 봐!",

      hourglass:
        "루미: 오른쪽 아래의 거대한 모래시계로 가자!",

      exit:
        "루미: 아래 중앙의 시간의 문으로 가자!"
    };

    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 시간이 다시 흐르는 곳을 따라가자!"
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
      "박물관의 모든 시계가 다시 움직이기 시작했다.",
      "멈춰 있던 전시물과 장치들이 원래의 시간으로 돌아왔다.",
      "루미: 아홉 번째 언어 수정도 복원됐어!",
      "나: 시간이 다시 흐르고 있어!",

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
      clock:
        "중앙 대형 시계를 다시 움직이자.",

      gallery:
        "과거 전시관의 시간을 복구하자.",

      archive:
        "시간 기록 보관소를 복구하자.",

      statue:
        "멈춘 시간 조각상을 해방하자.",

      hourglass:
        "거대한 모래시계의 마지막 시험을 풀자.",

      exit:
        "아래 중앙의 시간의 문으로 가자."
    };

    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "멈춰버린 시간 박물관의 시간을 복원하자.";
  }

}
