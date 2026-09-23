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


const MAP_ID = "MAP07";


export default class Map07Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map07_background",
      `${base}assets/maps/map07.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map07_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map07_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map07_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map07_right",
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
      "map07_background"
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
            "MAP07 intro error:",
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
      "magic_circle",
      "classroom",
      "lab",
      "library",
      "principal",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "magic_circle";

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
      "MAP07 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "magic_circle",

        label:
          "뒤틀린 중앙 마법진",

        x:
          385,

        y:
          285,

        radius:
          95
      },


      {
        id:
          "classroom",

        label:
          "마법 교실",

        x:
          165,

        y:
          145,

        radius:
          90
      },


      {
        id:
          "lab",

        label:
          "마법 실험실",

        x:
          160,

        y:
          365,

        radius:
          95
      },


      {
        id:
          "library",

        label:
          "뒤틀린 서고",

        x:
          600,

        y:
          280,

        radius:
          95
      },


      {
        id:
          "principal",

        label:
          "교장실",

        x:
          620,

        y:
          120,

        radius:
          95
      },


      {
        id:
          "exit",

        label:
          "학교 봉인문",

        x:
          385,

        y:
          490,

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
        0xaa66ff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xe0c8ff,
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
            "#1b1430dd",

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

      magic_circle:
        [385, 285],

      classroom:
        [165, 145],

      lab:
        [160, 365],

      library:
        [600, 280],

      principal:
        [620, 120],

      exit:
        [385, 490]

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
        "map07_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map07_front"
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


  /*
    MAP02 이후처럼 recoverStuckInput()이 있는 Scene에서는
    자동 복구도 같이 실행.
    없는 Scene에서는 그냥 넘어감.
  */

  if (
    typeof this.recoverStuckInput ===
    "function"
  ) {

    this.recoverStuckInput();

  }


  const touch =
    window.WisdomTouchInput
    ||
    {
      up: false,
      down: false,
      left: false,
      right: false,
      interactPressed: false
    };


  /*
    대화/퀴즈 중에는 이동 금지.
    이때 눌린 조사 입력도 버린다.
  */

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


  /*
    MAP12 보스전에서는 이동하지 않음.
    다른 맵에서는 phase가 boss가 아니므로 영향 없음.
  */

  if (
    this.state?.phase ===
    "boss"
  ) {

    this.player.body.setVelocity(
      0,
      0
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


  /* =========================
     LEFT / RIGHT
  ========================= */

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


  /* =========================
     UP / DOWN
  ========================= */

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


  /*
    대각선 이동 속도 보정
  */

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


  /* =========================
     INTERACT
  ========================= */

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


  /*
    터치 조사 버튼은 1회 입력이므로
    읽은 직후 반드시 false 처리
  */

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
          "map07_left"
        )
      ) {

        this.player.setTexture(
          "map07_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map07_right"
        )
      ) {

        this.player.setTexture(
          "map07_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map07_back"
      )
    ) {

      this.player.setTexture(
        "map07_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map07_front"
      )
    ) {

      this.player.setTexture(
        "map07_front"
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

        case "magic_circle":

          await this.handleMagicCircle();

          break;


        case "classroom":

          await this.handleClassroom();

          break;


        case "lab":

          await this.handleLab();

          break;


        case "library":

          await this.handleLibrary();

          break;


        case "principal":

          await this.handlePrincipal();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP07 interaction error:",
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

      "뒤틀린 마법 학교의 문이 열렸다.",

      "나: 학교 전체가 이상하게 흔들리고 있어.",

      "루미: 일곱 번째 언어 수정 때문에 학교의 주문들이 서로 뒤엉켜 버렸어.",

      "루미: 교실과 실험실의 주문을 하나씩 정상화해야 해.",

      "루미: 먼저 중앙의 뒤틀린 마법진을 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "magic_circle";


    this.save();

  }


  /* =====================================================
     1. CENTRAL MAGIC CIRCLE
  ====================================================== */

  async handleMagicCircle() {

    if (
      this.state.phase !==
      "magic_circle"
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
        "루미: MAP07 단어 데이터가 부족해."
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
        "magic_circle"
      );


      await GameUI.say(
        "루미: 중앙 마법진이 안정되지 않아. 단어 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "magic_circle"
    );


    this.state.shards =
      1;


    this.state.phase =
      "classroom";


    this.save();


    await GameUI.say([

      "뒤틀린 마법진의 일부가 정상으로 돌아왔다.",

      "루미: 첫 번째 말의 조각이 나타났어!",

      "나: 왼쪽 위 교실에서 빛이 나.",

      "루미: 마법 교실로 가자!"

    ]);

  }


  /* =====================================================
     2. CLASSROOM
  ====================================================== */

  async handleClassroom() {

    if (
      this.state.phase !==
      "classroom"
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
        "루미: MAP07 단어 데이터가 부족해."
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
        "classroom"
      );


      await GameUI.say(
        "루미: 칠판의 주문이 다시 꼬였어. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "classroom"
    );


    this.state.phase =
      "lab";


    this.save();


    await GameUI.say([

      "교실의 칠판과 책들이 제자리로 돌아왔다.",

      "나: 왼쪽 아래 실험실의 물약이 빛나고 있어!",

      "루미: 마법 실험실로 가자!"

    ]);

  }


  /* =====================================================
     3. MAGIC LAB
  ====================================================== */

  async handleLab() {

    if (
      this.state.phase !==
      "lab"
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
        "루미: MAP07 영어 표현 데이터가 부족해."
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
        "lab"
      );


      await GameUI.say(
        "루미: 물약이 이상하게 변했어. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "lab"
    );


    this.state.shards =
      2;


    this.state.phase =
      "library";


    this.save();


    await GameUI.say([

      "실험실의 물약들이 원래 색으로 돌아왔다.",

      "루미: 두 번째 말의 조각이야!",

      "나: 오른쪽 서고의 책들이 공중에 떠 있어.",

      "루미: 뒤틀린 서고로 가자!"

    ]);

  }


  /* =====================================================
     4. LIBRARY
  ====================================================== */

  async handleLibrary() {

    if (
      this.state.phase !==
      "library"
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
        "루미: 문장 배열에 사용할 MAP07 영어 표현이 부족해."
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
        "library"
      );


      await GameUI.say(
        "루미: 책들이 다시 뒤엉켰어. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "library"
    );


    this.state.phase =
      "principal";


    this.save();


    await GameUI.say([

      "떠다니던 책들이 서가로 돌아갔다.",

      "나: 오른쪽 위 교장실의 봉인이 약해졌어.",

      "루미: 마지막 시험이야. 교장실로 가자!"

    ]);

  }


  /* =====================================================
     5. PRINCIPAL
  ====================================================== */

  async handlePrincipal() {

    if (
      this.state.phase !==
      "principal"
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
        "루미: 마지막 문제를 만들 MAP07 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `교장실의 마지막 봉인!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "principal"
      );


      await GameUI.say(
        "루미: 교장실의 봉인이 아직 풀리지 않았어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "principal"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "교장실에서 세 번째 말의 조각이 나타났다.",

      "나: 학교의 마법이 정상으로 돌아오고 있어!",

      "루미: 좋아! 아래 중앙의 학교 봉인문이 열렸어.",

      "루미: 봉인문으로 가자!"

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

      magic_circle:
        "루미: 중앙의 뒤틀린 마법진을 조사해 봐!",

      classroom:
        "루미: 왼쪽 위의 마법 교실로 가자!",

      lab:
        "루미: 왼쪽 아래의 마법 실험실로 가자!",

      library:
        "루미: 오른쪽의 뒤틀린 서고를 조사해 봐!",

      principal:
        "루미: 오른쪽 위의 교장실로 가자!",

      exit:
        "루미: 아래쪽 중앙의 학교 봉인문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 뒤틀린 마법의 흐름을 따라가 보자!"
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

      "학교를 뒤틀던 보라 마법이 천천히 사라졌다.",

      "교실과 실험실의 주문이 다시 정상적으로 움직이기 시작했다.",

      "루미: 일곱 번째 언어 수정도 복원됐어!",

      "나: 마법 학교가 원래 모습으로 돌아왔어!",

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

      magic_circle:
        "중앙 뒤틀린 마법진의 문제를 풀자.",

      classroom:
        "마법 교실의 단어 문제를 풀자.",

      lab:
        "마법 실험실의 표현 문제를 풀자.",

      library:
        "뒤틀린 서고의 문장 배열 문제를 풀자.",

      principal:
        "교장실의 마지막 시험을 풀자.",

      exit:
        "아래 중앙의 학교 봉인문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "뒤틀린 마법 학교를 정상화하자.";

  }

}
