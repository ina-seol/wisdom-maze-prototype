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


const MAP_ID = "MAP03";


export default class Map03Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map03_background",
      `${base}assets/maps/map03.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map03_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map03_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map03_left",
        sprites.left
      );
    }

    if (sprites?.right) {
      this.load.image(
        "map03_right",
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
      "map03_background"
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
            "MAP03 intro error:",
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
      "sign",
      "well",
      "house",
      "shrine",
      "barn",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "sign";

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
      "MAP03 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "sign",

        label:
          "낡은 표지판",

        x:
          292,

        y:
          270,

        radius:
          80
      },


      {
        id:
          "well",

        label:
          "마을 우물",

        x:
          382,

        y:
          315,

        radius:
          85
      },


      {
        id:
          "house",

        label:
          "안개 낀 집",

        x:
          557,

        y:
          225,

        radius:
          85
      },


      {
        id:
          "shrine",

        label:
          "고대 석상",

        x:
          145,

        y:
          105,

        radius:
          90
      },


      {
        id:
          "barn",

        label:
          "낡은 창고",

        x:
          625,

        y:
          390,

        radius:
          90
      },


      {
        id:
          "exit",

        label:
          "마을 출구",

        x:
          385,

        y:
          105,

        radius:
          95
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        292,
        270,
        21,
        0xb9d8ff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xe6f3ff,
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
            "#1c2230dd",

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

      sign:
        [292, 270],

      well:
        [382, 315],

      house:
        [557, 225],

      shrine:
        [145, 105],

      barn:
        [625, 390],

      exit:
        [385, 105]

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
        "map03_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map03_front"
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
          "map03_left"
        )
      ) {

        this.player.setTexture(
          "map03_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map03_right"
        )
      ) {

        this.player.setTexture(
          "map03_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map03_back"
      )
    ) {

      this.player.setTexture(
        "map03_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map03_front"
      )
    ) {

      this.player.setTexture(
        "map03_front"
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

        case "sign":

          await this.handleSign();

          break;


        case "well":

          await this.handleWell();

          break;


        case "house":

          await this.handleHouse();

          break;


        case "shrine":

          await this.handleShrine();

          break;


        case "barn":

          await this.handleBarn();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP03 interaction error:",
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

      "짙은 안개가 마을 전체를 덮고 있다.",

      "나: 앞이 잘 안 보여.",

      "루미: 세 번째 언어 수정 때문에 마을의 길이 사라져 버렸어.",

      "루미: 먼저 앞쪽의 낡은 표지판을 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "sign";


    this.save();

  }


  async handleSign() {

    if (
      this.state.phase !==
      "sign"
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
        "루미: MAP03 단어 데이터가 부족해."
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
        "sign"
      );


      await GameUI.say(
        "루미: 단어의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "sign"
    );


    this.state.shards =
      1;


    this.state.phase =
      "well";


    this.save();


    await GameUI.say([

      "표지판의 글자가 다시 나타났다.",

      "루미: 첫 번째 말의 조각이야!",

      "루미: 이제 마을 중앙의 우물로 가자!"

    ]);

  }


  async handleWell() {

    if (
      this.state.phase !==
      "well"
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
        "루미: MAP03 단어 데이터가 부족해."
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
        "well"
      );


      await GameUI.say(
        "루미: 뜻에 맞는 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "well"
    );


    this.state.phase =
      "house";


    this.save();


    await GameUI.say([

      "우물 속에서 푸른 빛이 올라왔다.",

      "나: 오른쪽 집 쪽으로 빛이 이어지고 있어.",

      "루미: 안개 낀 집으로 가자!"

    ]);

  }


  async handleHouse() {

    if (
      this.state.phase !==
      "house"
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
        "루미: MAP03 영어 표현 데이터가 부족해."
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
        "house"
      );


      await GameUI.say(
        "루미: 영어 표현 전체의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "house"
    );


    this.state.shards =
      2;


    this.state.phase =
      "shrine";


    this.save();


    await GameUI.say([

      "집 안의 창문에 빛이 돌아왔다.",

      "루미: 두 번째 말의 조각을 찾았어!",

      "나: 왼쪽 위 석상에서 이상한 빛이 나.",

      "루미: 고대 석상으로 가자!"

    ]);

  }


  async handleShrine() {

    if (
      this.state.phase !==
      "shrine"
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
        "루미: 문장 배열에 사용할 MAP03 영어 표현이 부족해."
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
        "shrine"
      );


      await GameUI.say(
        "루미: 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "shrine"
    );


    this.state.phase =
      "barn";


    this.save();


    await GameUI.say([

      "고대 석상 주위의 안개가 걷히기 시작했다.",

      "나: 오른쪽 아래 창고가 보이기 시작했어!",

      "루미: 낡은 창고로 가자!"

    ]);

  }


  async handleBarn() {

    if (
      this.state.phase !==
      "barn"
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
        "루미: 마지막 문제를 만들 MAP03 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `안개의 마지막 시험!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "barn"
      );


      await GameUI.say(
        "루미: 창고의 봉인이 아직 풀리지 않았어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "barn"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "창고 안에서 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 좋아! 마을 위쪽의 출구가 다시 나타났어.",

      "루미: 마을 출구로 가자!"

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

      sign:
        "루미: 앞쪽의 낡은 표지판을 조사해 봐!",

      well:
        "루미: 마을 중앙의 우물로 가자!",

      house:
        "루미: 오른쪽의 안개 낀 집으로 가자!",

      shrine:
        "루미: 왼쪽 위 고대 석상으로 가자!",

      barn:
        "루미: 오른쪽 아래의 낡은 창고로 가자!",

      exit:
        "루미: 위쪽 중앙의 마을 출구로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 안개 속의 빛을 따라가 보자!"
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

      "마을을 뒤덮었던 안개가 천천히 사라졌다.",

      "루미: 세 번째 언어 수정도 복원됐어!",

      "나: 이제 길이 제대로 보여!",

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

      sign:
        "낡은 표지판의 문제를 풀자.",

      well:
        "마을 우물의 단어 문제를 풀자.",

      house:
        "안개 낀 집의 표현 문제를 풀자.",

      shrine:
        "고대 석상의 문장 배열 문제를 풀자.",

      barn:
        "낡은 창고의 마지막 시험을 풀자.",

      exit:
        "위쪽 중앙의 마을 출구로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "안개 낀 숲속 마을을 탐험하자.";

  }

}
