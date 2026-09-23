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


const MAP_ID = "MAP10";


export default class Map10Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map10_background",
      `${base}assets/maps/map10.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map10_front",
        sprites.front
      );
    }


    if (sprites?.back) {
      this.load.image(
        "map10_back",
        sprites.back
      );
    }


    if (sprites?.left) {
      this.load.image(
        "map10_left",
        sprites.left
      );
    }


    if (sprites?.right) {
      this.load.image(
        "map10_right",
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
      "map10_background"
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
            "MAP10 intro error:",
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
      "control",
      "power",
      "conveyor",
      "assembly",
      "server",
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
      "MAP10 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "core",

        label:
          "로봇 코어",

        x:
          385,

        y:
          255,

        radius:
          95
      },


      {
        id:
          "control",

        label:
          "중앙 제어실",

        x:
          145,

        y:
          115,

        radius:
          95
      },


      {
        id:
          "power",

        label:
          "동력 공급실",

        x:
          625,

        y:
          120,

        radius:
          95
      },


      {
        id:
          "conveyor",

        label:
          "고장난 컨베이어",

        x:
          150,

        y:
          315,

        radius:
          95
      },


      {
        id:
          "assembly",

        label:
          "로봇 조립실",

        x:
          620,

        y:
          310,

        radius:
          95
      },


      {
        id:
          "server",

        label:
          "명령 서버",

        x:
          610,

        y:
          455,

        radius:
          95
      },


      {
        id:
          "exit",

        label:
          "공장 출구",

        x:
          385,

        y:
          75,

        radius:
          100
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        385,
        255,
        21,
        0x36c8ff,
        0.18
      )
        .setStrokeStyle(
          4,
          0xc7f4ff,
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
            "#101820dd",

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
        [385, 255],

      control:
        [145, 115],

      power:
        [625, 120],

      conveyor:
        [150, 315],

      assembly:
        [620, 310],

      server:
        [610, 455],

      exit:
        [385, 75]

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
        "map10_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map10_front"
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
          "map10_left"
        )
      ) {

        this.player.setTexture(
          "map10_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map10_right"
        )
      ) {

        this.player.setTexture(
          "map10_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map10_back"
      )
    ) {

      this.player.setTexture(
        "map10_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map10_front"
      )
    ) {

      this.player.setTexture(
        "map10_front"
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


        case "control":

          await this.handleControl();

          break;


        case "power":

          await this.handlePower();

          break;


        case "conveyor":

          await this.handleConveyor();

          break;


        case "assembly":

          await this.handleAssembly();

          break;


        case "server":

          await this.handleServer();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP10 interaction error:",
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

      "거대한 로봇 공장 안에서 경고등이 붉게 깜빡이고 있다.",

      "나: 로봇들이 전부 멈춰 있거나 이상하게 움직이고 있어!",

      "루미: 열 번째 언어 수정 때문에 명령 체계가 완전히 꼬였어.",

      "루미: 제어 장치들을 순서대로 복구해야 해.",

      "루미: 먼저 중앙의 로봇 코어를 조사하자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "core";


    this.save();

  }


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
        "루미: MAP10 단어 데이터가 부족해."
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
        "루미: 코어가 반응하지 않아. 단어 뜻을 다시 생각해 보자!"
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
      "control";


    this.save();


    await GameUI.say([

      "중앙 로봇 코어에 푸른 전력이 들어왔다.",

      "루미: 좋아! 이제 왼쪽 위 제어실을 복구하자!"

    ]);

  }


  async handleControl() {

    if (
      this.state.phase !==
      "control"
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
        "루미: MAP10 단어 데이터가 부족해."
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
        "control"
      );


      await GameUI.say(
        "루미: 제어 화면이 아직 오류 상태야. 영어 단어를 다시 골라 보자!"
      );


      return;

    }


    this.rememberWord(
      quiz.itemKey
    );


    this.markCorrect(
      "control"
    );


    this.state.shards =
      1;


    this.state.phase =
      "power";


    this.save();


    await GameUI.say([

      "제어실의 모니터가 정상 신호를 표시하기 시작했다.",

      "루미: 첫 번째 말의 조각이야!",

      "루미: 이번엔 오른쪽 위 동력 공급실로 가자!"

    ]);

  }


  async handlePower() {

    if (
      this.state.phase !==
      "power"
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
        "루미: MAP10 영어 표현 데이터가 부족해."
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
        "루미: 전력이 연결되지 않아. 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "power"
    );


    this.state.phase =
      "conveyor";


    this.save();


    await GameUI.say([

      "동력 공급실의 푸른 에너지 캡슐이 모두 켜졌다.",

      "나: 왼쪽 아래의 컨베이어가 움직이려 하고 있어!",

      "루미: 고장난 컨베이어로 가자!"

    ]);

  }


  async handleConveyor() {

    if (
      this.state.phase !==
      "conveyor"
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
        "루미: 문장 배열에 사용할 MAP10 영어 표현이 부족해."
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
        "conveyor"
      );


      await GameUI.say(
        "루미: 컨베이어 명령이 잘못됐어. 문장 순서를 다시 확인해 보자!"
      );


      return;

    }


    this.rememberExpression(
      expression.english
    );


    this.markCorrect(
      "conveyor"
    );


    this.state.shards =
      2;


    this.state.phase =
      "assembly";


    this.save();


    await GameUI.say([

      "멈춰 있던 컨베이어 벨트가 움직이기 시작했다.",

      "루미: 두 번째 말의 조각을 찾았어!",

      "나: 오른쪽 조립실의 로봇들도 반응하고 있어!",

      "루미: 로봇 조립실로 가자!"

    ]);

  }


  async handleAssembly() {

    if (
      this.state.phase !==
      "assembly"
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
        "루미: MAP10 영어 표현 데이터가 부족해."
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
        "assembly"
      );


      await GameUI.say(
        "루미: 조립 명령이 아직 잘못됐어. 영어 표현을 다시 골라 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "assembly"
    );


    this.state.phase =
      "server";


    this.save();


    await GameUI.say([

      "조립 로봇들이 정상적으로 움직이기 시작했다.",

      "나: 오른쪽 아래 서버실에 파란 불이 들어왔어!",

      "루미: 이제 명령 서버를 복구하자!"

    ]);

  }


  async handleServer() {

    if (
      this.state.phase !==
      "server"
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
        "루미: 마지막 문제를 만들 MAP10 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `로봇 공장의 마지막 명령!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "server"
      );


      await GameUI.say(
        "루미: 명령 서버가 아직 오류 상태야. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "server"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "명령 서버의 붉은 경고등이 모두 파란색으로 바뀌었다.",

      "세 번째 말의 조각이 중앙 코어로 날아갔다.",

      "나: 공장 전체가 정상으로 돌아오고 있어!",

      "루미: 좋아! 위쪽 중앙의 공장 출구로 가자!"

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

      core:
        "루미: 가운데의 거대한 푸른 로봇 코어를 조사해 봐!",

      control:
        "루미: 왼쪽 위 모니터가 가득한 제어실로 가자!",

      power:
        "루미: 오른쪽 위 푸른 에너지 장치가 있는 동력실로 가자!",

      conveyor:
        "루미: 왼쪽 중간의 망가진 컨베이어 벨트로 가자!",

      assembly:
        "루미: 오른쪽 중간 로봇들이 서 있는 조립실로 가자!",

      server:
        "루미: 오른쪽 아래의 명령 서버 구역으로 가자!",

      exit:
        "루미: 위쪽 중앙의 붉은 공장 출구로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 공장의 푸른 전력선을 따라가 보자!"
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

      "공장 전체의 경고등이 꺼지고 정상 가동 신호가 켜졌다.",

      "로봇들이 다시 정확한 명령대로 움직이기 시작했다.",

      "루미: 열 번째 언어 수정도 복원됐어!",

      "나: 이제 로봇들이 제멋대로 움직이지 않겠네!",

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
        "중앙 로봇 코어를 활성화하자.",

      control:
        "왼쪽 위 제어실을 복구하자.",

      power:
        "오른쪽 위 동력 공급실을 복구하자.",

      conveyor:
        "고장난 컨베이어의 명령을 복구하자.",

      assembly:
        "로봇 조립실의 명령을 복구하자.",

      server:
        "명령 서버의 마지막 오류를 해결하자.",

      exit:
        "위쪽 중앙의 공장 출구로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "명령을 잃은 로봇 공장을 복구하자.";

  }

}
