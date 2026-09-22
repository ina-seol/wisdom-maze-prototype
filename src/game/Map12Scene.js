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
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map12_background",
      `${base}assets/maps/map12.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map12_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map12_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map12_left",
        sprites.left
      );
    }

    if (sprites?.right) {
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
            "MAP12 intro error:",
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
      "crystal_circle",
      "left_library",
      "right_library",
      "moon_altar",
      "sun_altar",
      "throne",
      "boss"
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


    this.state.bossHp ??=
      5;


    this.state.bossStarted ??=
      false;


    this.state.endingSeen ??=
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
          "열두 수정의 원",

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
          "기억의 서고",

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
          "기록의 서고",

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
        22,
        0xffd765,
        0.18
      )
        .setStrokeStyle(
          4,
          0xffffff,
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
            "#171426dd",

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


    if (
      this.state.phase ===
      "boss"
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
    ) {

      return;

    }


    const object =
      this.nearestObject();


    if (!object) {

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

    catch (error) {

      console.error(
        "MAP12 interaction error:",
        error
      );

    }

    finally {

      if (
        this.state.phase !==
        "boss"
      ) {

        this.forceUnlock();

      }


      this.updateGuide();

    }

  }


  async playIntro() {

    await GameUI.say([

      "마지막 성의 문이 열렸다.",

      "성 안에는 지금까지 되찾은 언어 수정들이 모두 모여 있었다.",

      "나: 드디어 마지막 장소야.",

      "루미: 하지만 이상해. 수정들이 빛나지 않아.",

      "루미: 누군가 모든 언어의 힘을 이곳에서 묶어 두고 있어.",

      "루미: 먼저 중앙의 열두 수정의 원을 조사하자."

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


    if (!quiz) {

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


    if (!correct) {

      this.markWrong(
        "crystal_circle"
      );


      await GameUI.say(
        "루미: 수정들이 아직 반응하지 않아. 다시 해 보자!"
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

      "열두 개의 수정 중 하나가 강하게 빛났다.",

      "루미: 왼쪽 위 기억의 서고가 열렸어.",

      "루미: 그곳에서 사라진 단어의 기억을 되찾자!"

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


    if (!quiz) {

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


    if (!correct) {

      this.markWrong(
        "left_library"
      );


      await GameUI.say(
        "루미: 기억이 아직 흐릿해. 영어 단어를 다시 찾아보자!"
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

      "잊혀졌던 단어들이 책장 위로 다시 나타났다.",

      "나: 오른쪽 서고에서도 빛이 나!",

      "루미: 기록의 서고로 가자!"

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


    if (!quiz) {

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


    if (!correct) {

      this.markWrong(
        "right_library"
      );


      await GameUI.say(
        "루미: 문장의 기록이 아직 복원되지 않았어!"
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

      "기록의 서고에 문장들이 다시 떠올랐다.",

      "루미: 두 번째 말의 조각이야.",

      "루미: 이제 왼쪽 아래 달의 제단으로 가자."

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


    if (!expression) {

      await GameUI.say(
        "루미: MAP12 문장 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    await GameUI.say(
      `루미: "${expression.korean}"라는 뜻이 되도록 문장을 완성해 봐!`
    );


    const correct =
      await GameUI.wordOrder(
        expression.english
      );


    if (!correct) {

      this.markWrong(
        "moon_altar"
      );


      await GameUI.say(
        "루미: 달의 제단이 반응하지 않아. 문장 순서를 다시 맞춰 보자!"
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

      "달의 제단에서 은빛 마법이 퍼져 나갔다.",

      "나: 반대쪽 태양 제단도 깨어났어!",

      "루미: 오른쪽 아래 태양의 제단으로 가자."

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


    if (!quiz) {

      await GameUI.say(
        "루미: MAP12 표현 데이터가 부족해."
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
        "sun_altar"
      );


      await GameUI.say(
        "루미: 태양의 제단이 아직 잠들어 있어!"
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

      "달과 태양의 빛이 중앙 수정진에서 하나가 되었다.",

      "열두 개의 수정이 동시에 빛나기 시작했다.",

      "루미: 이제 마지막이야.",

      "루미: 가운데 위 침묵의 왕좌로 가자."

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


    this.state.bossStarted =
      true;


    this.save();


    this.guide
      ?.setVisible(
        false
      );


    await this.startBossBattle();

  }


  /* =====================================================
     BOSS
  ====================================================== */

  async startBossBattle() {

    this.lockInput();


    await this.bossSay(
      "침묵의 군주",
      "드디어 여기까지 왔군."
    );


    await this.bossSay(
      "침묵의 군주",
      "너희는 왜 사라져야 할 말들을 다시 되찾으려 하지?"
    );


    await GameUI.say([

      "나: 사라져야 할 말 같은 건 없어.",

      "나: 누군가와 이야기하고, 마음을 전하려면 말이 필요해.",

      "루미: 그리고 우리는 지금까지 그걸 직접 배워 왔어."

    ]);


    await this.bossSay(
      "침묵의 군주",
      "그렇다면 증명해 보아라."
    );


    await this.bossSay(
      "침묵의 군주",
      "너희가 되찾은 언어가 정말 침묵보다 강한지."
    );


    this.state.bossHp =
      5;


    this.save();


    while (
      this.state.bossHp >
      0
    ) {

      const round =
        6 -
        this.state.bossHp;


      const correct =
        await this.runBossQuiz(
          round
        );


      if (
        correct
      ) {

        this.state.bossHp--;


        this.state.firstTryCorrect++;


        this.save();


        if (
          this.state.bossHp >
          0
        ) {

          await this.bossSay(
            "침묵의 군주",
            `...좋아. 하지만 아직 ${this.state.bossHp}개의 침묵이 남아 있다.`
          );

        }

      }

      else {

        this.state.wrongAttempts++;


        this.save();


        await this.bossSay(
          "침묵의 군주",
          "그 정도로는 침묵을 깨뜨릴 수 없다."
        );


        await GameUI.say(
          "루미: 괜찮아! 다시 도전하면 돼!"
        );

      }

    }


    await this.finishBossBattle();

  }


  async runBossQuiz(
    round
  ) {

    this.state.questionsShown++;


    let quiz =
      null;


    if (
      round === 1
    ) {

      quiz =
        QuizEngine.wordToKorean(
          this.content.words,
          this.state.usedWords
        );

    }

    else if (
      round === 2
    ) {

      quiz =
        QuizEngine.koreanToWord(
          this.content.words,
          this.state.usedWords
        );

    }

    else if (
      round === 3
    ) {

      quiz =
        QuizEngine.expressionToKorean(
          this.content.expressions,
          this.state.usedExpressions
        );

    }

    else if (
      round === 4
    ) {

      quiz =
        QuizEngine.koreanToExpression(
          this.content.expressions,
          this.state.usedExpressions
        );

    }

    else {

      quiz =
        QuizEngine.randomReview(
          this.content,
          this.state.usedWords,
          this.state.usedExpressions
        );

    }


    if (
      !quiz
    ) {

      await GameUI.say(
        "루미: 최종 시험용 학습 데이터가 부족해."
      );


      return false;

    }


    return await GameUI.choice(
      `최종 시험 ${round}/5\n${quiz.question}`,
      quiz.options,
      quiz.correctIndex
    );

  }


  async finishBossBattle() {

    await this.bossSay(
      "침묵의 군주",
      "...이럴 수가."
    );


    await this.bossSay(
      "침묵의 군주",
      "잊힌 말들이... 다시 빛나고 있다."
    );


    await GameUI.say([

      "열두 개의 언어 수정이 공중으로 떠올랐다.",

      "각 수정에서 수많은 단어와 문장이 별빛처럼 퍼져 나갔다.",

      "나: 이제 끝난 거야?",

      "루미: 응. 세계의 언어가 모두 돌아오고 있어."

    ]);


    await this.bossSay(
      "침묵의 군주",
      "나는 침묵만이 상처 없는 세상을 만들 수 있다고 생각했다."
    );


    await this.bossSay(
      "침묵의 군주",
      "하지만 너희는 말이 서로를 상처 입히는 것만이 아니라..."
    );


    await this.bossSay(
      "침묵의 군주",
      "서로를 이해하게 만들 수도 있다는 것을 보여 주었군."
    );


    this.state.completed =
      true;


    this.state.endingSeen =
      true;


    this.save();


    await this.playTrueEnding();

  }


  /* =====================================================
     TRUE ENDING
  ====================================================== */

  async playTrueEnding() {

    await GameUI.say([

      "침묵의 성을 뒤덮고 있던 어둠이 천천히 사라졌다.",

      "열두 개의 언어 수정이 원래의 빛을 되찾았다.",

      "그리고 사라졌던 말들이 다시 세계 곳곳으로 흘러갔다.",

      "마을에서는 다시 인사가 들렸고,",

      "학교에서는 아이들의 목소리가 들렸으며,",

      "책 속에는 사라졌던 문장들이 다시 나타났다."

    ]);


    await GameUI.say([

      "나: 루미, 우리가 정말 전부 되찾은 거야?",

      "루미: 응.",

      "루미: 하지만 중요한 건 수정을 되찾은 것만이 아니야.",

      "루미: 네가 지금까지 수많은 단어와 문장을 직접 사용했다는 거야.",

      "나: 그러네.",

      "루미: 언어는 정답을 외우는 힘이 아니야.",

      "루미: 서로를 이해하게 만드는 힘이야."

    ]);


    await this.showEndingScreen();

  }


  async showEndingScreen() {

    this.inputLocked =
      true;


    if (
      this.player?.body
    ) {

      this.player.body.setVelocity(
        0,
        0
      );

    }


    const modal =
      document.querySelector(
        "#modal"
      );


    const body =
      document.querySelector(
        "#modal-body"
      );


    if (
      !modal
      ||
      !body
    ) {

      return;

    }


    modal.classList.remove(
      "hidden"
    );


    body.innerHTML = `

      <div
        style="
          text-align:center;
          padding:28px 18px;
        "
      >

        <div
          style="
            color:#ffeaa4;
            font-size:15px;
            letter-spacing:5px;
            margin-bottom:8px;
          "
        >
          WISDOM MAZE
        </div>

        <h1
          style="
            color:#ffffff;
            font-size:42px;
            margin:8px 0 22px;
          "
        >
          THE END
        </h1>

        <p
          style="
            color:#e8efff;
            font-size:18px;
            line-height:1.8;
          "
        >
          열두 개의 언어 수정이 모두 복원되었습니다.
        </p>

        <p
          style="
            color:#ffe99b;
            font-size:21px;
            line-height:1.9;
            margin:24px 0;
          "
        >
          “언어는 정답을 외우는 힘이 아니라,<br>
          서로를 이해하게 만드는 힘이었다.”
        </p>

        <p
          style="
            color:#bcd2ff;
            font-size:15px;
            line-height:1.7;
          "
        >
          ${this.escapeHtml(
            this.profile.name
          )}의 모험이 끝났습니다.
        </p>

        <button
          id="map12-ending-home"
          class="big-gold"
          type="button"
          style="
            margin-top:28px;
          "
        >
          타이틀로 돌아가기
        </button>

      </div>

    `;


    document
      .querySelector(
        "#map12-ending-home"
      )
      ?.addEventListener(
        "click",
        () => {

          modal.classList.add(
            "hidden"
          );


          window.WisdomGame
            ?.goTitle();

        },
        {
          once:
            true
        }
      );

  }


  /* =====================================================
     BOSS PORTRAIT DIALOGUE
  ====================================================== */

  async bossSay(
    speaker,
    text
  ) {

    return new Promise(
      resolve => {

        const modal =
          document.querySelector(
            "#modal"
          );


        const body =
          document.querySelector(
            "#modal-body"
          );


        if (
          !modal
          ||
          !body
        ) {

          resolve();

          return;

        }


        const base =
          import.meta.env.BASE_URL;


        const portrait =
          `${base}assets/portraits/boss_portrait.png`;


        modal.classList.remove(
          "hidden"
        );


        body.innerHTML = `

          <div class="dialogue-layout">

            <div class="dialogue-portrait-box">

              <img
                class="dialogue-portrait"
                src="${portrait}"
                alt="${this.escapeHtml(
                  speaker
                )}"
                style="
                  object-position:center 18%;
                "
              />

            </div>

            <div class="dialogue-content">

              <div
                class="dialogue-speaker"
                style="
                  color:#caa4ff;
                "
              >
                ${this.escapeHtml(
                  speaker
                )}
              </div>

              <p class="dialogue-text">
                ${this.escapeHtml(
                  text
                )}
              </p>

              <button
                id="boss-dialog-next"
                class="big-gold"
                type="button"
              >
                다음
              </button>

            </div>

          </div>

        `;


        document
          .querySelector(
            "#boss-dialog-next"
          )
          ?.addEventListener(
            "click",
            () => {

              modal.classList.add(
                "hidden"
              );


              resolve();

            },
            {
              once:
                true
            }
          );

      }
    );

  }


  async showHint() {

    this.state.hintsUsed++;


    this.save();


    const hints = {

      crystal_circle:
        "루미: 중앙의 열두 수정이 둘러싼 큰 마법진을 조사해 봐!",

      left_library:
        "루미: 왼쪽 위 기억의 서고로 가자!",

      right_library:
        "루미: 오른쪽 위 기록의 서고로 가자!",

      moon_altar:
        "루미: 왼쪽 아래 달의 제단으로 가자!",

      sun_altar:
        "루미: 오른쪽 아래 태양의 제단으로 가자!",

      throne:
        "루미: 가운데 위 침묵의 왕좌로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 열두 수정의 빛을 따라가자!"
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

      if (
        this.state.phase ===
        "boss"
      ) {

        shards.textContent =
          `침묵 ${this.state.bossHp}/5`;

      }

      else {

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

    }


    const objective =
      document.querySelector(
        "#hud-objective"
      );


    if (!objective) {

      return;

    }


    const objectives = {

      crystal_circle:
        "열두 수정의 원을 활성화하자.",

      left_library:
        "기억의 서고에서 단어를 복원하자.",

      right_library:
        "기록의 서고에서 표현을 복원하자.",

      moon_altar:
        "달의 제단에서 문장을 완성하자.",

      sun_altar:
        "태양의 제단을 활성화하자.",

      throne:
        "침묵의 왕좌로 가자.",

      boss:
        `침묵의 군주를 물리치자. 남은 침묵 ${this.state.bossHp}/5`

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "침묵의 언어 성을 복원하자.";

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

}
