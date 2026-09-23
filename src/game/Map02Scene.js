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


const MAP_ID = "MAP02";


export default class Map02Scene extends Phaser.Scene {

  constructor() {
    super(MAP_ID);
  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map02_background",
      `${base}assets/maps/map02.png`
    );


    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {
      this.load.image(
        "map02_front",
        sprites.front
      );
    }

    if (sprites?.back) {
      this.load.image(
        "map02_back",
        sprites.back
      );
    }

    if (sprites?.left) {
      this.load.image(
        "map02_left",
        sprites.left
      );
    }

    if (sprites?.right) {
      this.load.image(
        "map02_right",
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
      "map02_background"
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
            "MAP02 intro error:",
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
      "bookshelf",
      "table",
      "clock",
      "circle",
      "cabinet",
      "exit"
    ];


    if (
      !validPhases.includes(
        this.state.phase
      )
    ) {

      this.state.phase =
        "bookshelf";

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
      "MAP02 input lock 자동 복구"
    );


    this.forceUnlock();

  }


  createInteractables() {

    this.interactables = [

      {
        id:
          "bookshelf",

        label:
          "빛나는 책장",

        x:
          205,

        y:
          155,

        radius:
          80
      },


      {
        id:
          "table",

        label:
          "중앙 테이블",

        x:
          385,

        y:
          415,

        radius:
          85
      },


      {
        id:
          "clock",

        label:
          "큰 시계",

        x:
          425,

        y:
          155,

        radius:
          80
      },


      {
        id:
          "magic_circle",

        label:
          "보라 마법진",

        x:
          647,

        y:
          505,

        radius:
          90
      },


      {
        id:
          "cabinet",

        label:
          "잠긴 캐비닛",

        x:
          650,

        y:
          235,

        radius:
          85
      },


      {
        id:
          "exit",

        label:
          "푸른 봉인문",

        x:
          640,

        y:
          125,

        radius:
          90
      }

    ];

  }


  createGuide() {

    this.guide =
      this.add.circle(
        205,
        155,
        21,
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
            "#181426dd",

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

      bookshelf:
        [205, 155],

      table:
        [385, 415],

      clock:
        [425, 155],

      circle:
        [647, 505],

      cabinet:
        [650, 235],

      exit:
        [640, 125]

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
        "map02_front"
      )
    ) {

      this.player =
        this.physics.add.image(
          384,
          525,
          "map02_front"
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
          "map02_left"
        )
      ) {

        this.player.setTexture(
          "map02_left"
        );

      }

      else if (
        vx > 0
        &&
        this.textures.exists(
          "map02_right"
        )
      ) {

        this.player.setTexture(
          "map02_right"
        );

      }


      return;

    }


    if (
      vy < 0
      &&
      this.textures.exists(
        "map02_back"
      )
    ) {

      this.player.setTexture(
        "map02_back"
      );

    }

    else if (
      vy > 0
      &&
      this.textures.exists(
        "map02_front"
      )
    ) {

      this.player.setTexture(
        "map02_front"
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

        case "bookshelf":

          await this.handleBookshelf();

          break;


        case "table":

          await this.handleTable();

          break;


        case "clock":

          await this.handleClock();

          break;


        case "magic_circle":

          await this.handleMagicCircle();

          break;


        case "cabinet":

          await this.handleCabinet();

          break;


        case "exit":

          await this.handleExit();

          break;

      }

    }

    catch (error) {

      console.error(
        "MAP02 interaction error:",
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

      "루미: 여기는 속삭이는 도서관이야.",

      "루미: 언어 수정의 힘 때문에 오래된 책들이 이상한 속삭임을 내고 있어.",

      "나: 이번에도 말의 조각을 찾아야 하는 거지?",

      "루미: 맞아! 먼저 왼쪽 위의 빛나는 책장을 조사해 보자!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "bookshelf";


    this.save();

  }


  async handleBookshelf() {

    if (
      this.state.phase !==
      "bookshelf"
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
        "루미: MAP02 단어 데이터가 부족해."
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
        "bookshelf"
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
      "bookshelf"
    );


    this.state.shards =
      1;


    this.state.phase =
      "table";


    this.save();


    await GameUI.say([

      "빛나는 책장 사이에서 첫 번째 말의 조각이 나타났다.",

      "루미: 좋아! 이제 중앙 테이블로 가자!"

    ]);

  }


  async handleTable() {

    if (
      this.state.phase !==
      "table"
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
        "루미: MAP02 단어 데이터가 부족해."
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
        "table"
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
      "table"
    );


    this.state.phase =
      "clock";


    this.save();


    await GameUI.say([

      "중앙 테이블의 마법 문양이 빛났다.",

      "나: 위쪽의 큰 시계가 움직이기 시작했어!",

      "루미: 큰 시계로 가자!"

    ]);

  }


  async handleClock() {

    if (
      this.state.phase !==
      "clock"
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
        "루미: MAP02 영어 표현 데이터가 부족해."
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
        "clock"
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
      "clock"
    );


    this.state.shards =
      2;


    this.state.phase =
      "circle";


    this.save();


    await GameUI.say([

      "큰 시계가 다시 움직이기 시작했다.",

      "루미: 두 번째 말의 조각이야!",

      "루미: 오른쪽 아래 보라 마법진으로 가자!"

    ]);

  }


  async handleMagicCircle() {

    if (
      this.state.phase !==
      "circle"
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
        "루미: MAP02 영어 표현 데이터가 부족해."
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
        "circle"
      );


      await GameUI.say(
        "루미: 영어 표현의 뜻을 다시 생각해 보자!"
      );


      return;

    }


    this.rememberExpression(
      quiz.itemKey
    );


    this.markCorrect(
      "circle"
    );


    this.state.phase =
      "cabinet";


    this.save();


    await GameUI.say([

      "보라 마법진에서 빛이 퍼져 나갔다.",

      "나: 오른쪽 캐비닛의 봉인이 풀렸어!",

      "루미: 잠긴 캐비닛으로 가자!"

    ]);

  }


  async handleCabinet() {

    if (
      this.state.phase !==
      "cabinet"
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
        "루미: 마지막 문제를 만들 MAP02 학습 데이터가 부족해."
      );


      return;

    }


    this.state.questionsShown++;


    const correct =
      await GameUI.choice(
        `캐비닛의 마지막 봉인!\n${quiz.question}`,
        quiz.options,
        quiz.correctIndex
      );


    if (!correct) {

      this.markWrong(
        "cabinet"
      );


      await GameUI.say(
        "루미: 캐비닛의 봉인이 아직 남아 있어. 다시 해 보자!"
      );


      return;

    }


    this.markCorrect(
      "cabinet"
    );


    this.state.shards =
      3;


    this.state.phase =
      "exit";


    this.save();


    await GameUI.say([

      "캐비닛 안에서 세 번째 말의 조각이 나타났다.",

      "나: 세 조각을 모두 모았어!",

      "루미: 좋아! 오른쪽 위의 푸른 봉인문이 열렸어.",

      "루미: 푸른 봉인문으로 가자!"

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

      bookshelf:
        "루미: 왼쪽 위의 빛나는 책장을 조사해 봐!",

      table:
        "루미: 중앙 테이블로 가자!",

      clock:
        "루미: 위쪽의 큰 시계를 조사해 봐!",

      circle:
        "루미: 오른쪽 아래 보라 마법진으로 가자!",

      cabinet:
        "루미: 오른쪽의 잠긴 캐비닛으로 가자!",

      exit:
        "루미: 오른쪽 위의 푸른 봉인문으로 가자!"

    };


    await GameUI.say(
      hints[
        this.state.phase
      ]
      ||
      "루미: 도서관의 빛을 따라가 보자!"
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

      "푸른 봉인문이 열리며 도서관의 속삭임이 사라졌다.",

      "루미: 두 번째 언어 수정도 복원됐어!",

      "나: 다음 장소로 가자!",

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

      bookshelf:
        "빛나는 책장의 문제를 풀자.",

      table:
        "중앙 테이블의 문제를 풀자.",

      clock:
        "큰 시계의 문장 배열 문제를 풀자.",

      circle:
        "보라 마법진의 표현 문제를 풀자.",

      cabinet:
        "잠긴 캐비닛의 마지막 시험을 풀자.",

      exit:
        "오른쪽 위 푸른 봉인문으로 가자."

    };


    objective.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "속삭이는 도서관을 탐험하자.";

  }

}
