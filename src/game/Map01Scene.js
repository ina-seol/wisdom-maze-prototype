import Phaser from "phaser";

import {
  getUnit1Content,
  chooseObjectWord,
  findExpression,
  randomBoxColor,
  saveMapProgress,
  saveRecord
} from "../data.js";


export default class Map01Scene extends Phaser.Scene {

  constructor() {

    super("MAP01");

  }


  /* =====================================================
     PRELOAD
  ====================================================== */

  preload() {

    const base =
      import.meta.env.BASE_URL;


    /*
      MAP01
    */

    this.load.image(
      "map01",
      `${base}assets/maps/map01.png`
    );


    /*
      main.js에서 잘라 넘겨준 캐릭터 방향 이미지
    */

    const sprites =
      window.WISDOM_PROFILE?.spriteUrls;


    if (sprites?.front) {

      this.load.image(
        "mage_front",
        sprites.front
      );

    }


    if (sprites?.back) {

      this.load.image(
        "mage_back",
        sprites.back
      );

    }


    if (sprites?.left) {

      this.load.image(
        "mage_left",
        sprites.left
      );

    }


    if (sprites?.right) {

      this.load.image(
        "mage_right",
        sprites.right
      );

    }


    /*
      이전 버전 호환
    */

    if (sprites?.side) {

      this.load.image(
        "mage_side",
        sprites.side
      );

    }

  }


  /* =====================================================
     CREATE
  ====================================================== */

  create() {

    this.profile =
      window.WISDOM_PROFILE;


    this.state =
      window.WISDOM_MAP_STATE;


    this.content =
      getUnit1Content();


    /*
      오래된 저장 데이터와 호환
    */

    this.state.mistakes ||=
      {};

    this.state.shards ||=
      0;

    this.state.questionsShown ||=
      0;

    this.state.firstTryCorrect ||=
      0;

    this.state.wrongAttempts ||=
      0;

    this.state.hintsUsed ||=
      0;

    this.state.pushSteps ||=
      0;

    this.state.finalStep ||=
      0;

    this.state.sessionStartedAt ||=
      Date.now();


    /*
      예전 저장 데이터가 intro에 멈춰있는 경우
    */

    if (
      this.state.introDone &&
      this.state.phase === "intro"
    ) {

      this.state.phase =
        "p1";

    }


    this.inputLocked =
      true;


    this.interactables =
      [];


    this.obstacles =
      [];


    /* =====================================================
       문제 데이터 준비
    ====================================================== */

    if (
      !this.state.p1Target
    ) {

      this.state.p1Target =
        chooseObjectWord(
          this.content.words
        );

    }


    if (
      !this.state.boxTargetColor
    ) {

      this.state.boxTargetColor =
        randomBoxColor();

    }


    /*
      책상 아래 관련 문장
    */

    this.p2Sentence =
      findExpression(
        this.content.expressions,
        /under.*desk|desk.*under/i,
        "Look under the desk."
      );


    /*
      상자 관련 문장
    */

    this.p3Sentence =
      findExpression(
        this.content.expressions,
        /open.*box/i,
        "Open the box."
      );


    /* =====================================================
       MAP
    ====================================================== */

    this.add.image(
      384,
      288,
      "map01"
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


    /*
      충돌 / 조사
    */

    this.createCollisionAreas();

    this.createInteractables();


    /*
      플레이어
    */

    this.createPlayer();


    /*
      입력
    */

    this.createInput();


    this.updateHUD();


    /*
      오프닝
    */

    this.time.delayedCall(
      300,

      async () => {

        if (
          !this.state.introDone
        ) {

          await this.playIntro();

        }


        this.inputLocked =
          false;

      }
    );

  }


  /* =====================================================
     COLLISION
  ====================================================== */

  createCollisionAreas() {

    /*
      외벽
    */

    this.addObstacle(
      384,
      15,
      768,
      30
    );


    this.addObstacle(
      15,
      288,
      30,
      576
    );


    this.addObstacle(
      753,
      288,
      30,
      576
    );


    this.addObstacle(
      384,
      563,
      768,
      26
    );


    /*
      교탁
    */

    this.addObstacle(
      390,
      150,
      150,
      55
    );


    /*
      학생 책상
    */

    const desks = [

      [210, 250],
      [335, 250],
      [460, 250],
      [585, 250],

      [210, 345],
      [335, 345],
      [460, 345],
      [585, 345]

    ];


    desks.forEach(
      ([x, y]) => {

        this.addObstacle(
          x,
          y,
          70,
          45
        );

      }
    );


    /*
      책장
    */

    this.addObstacle(
      110,
      465,
      110,
      90
    );


    /*
      사물함
    */

    this.addObstacle(
      315,
      475,
      130,
      95
    );


    /*
      상자
    */

    this.addObstacle(
      580,
      480,
      190,
      70
    );


    /*
      오른쪽 가구
    */

    this.addObstacle(
      710,
      330,
      50,
      180
    );

  }


  addObstacle(
    x,
    y,
    width,
    height
  ) {

    const zone =
      this.add.zone(
        x,
        y,
        width,
        height
      );


    this.physics.add.existing(
      zone,
      true
    );


    this.obstacles.push(
      zone
    );


    return zone;

  }


  /* =====================================================
     INTERACTABLES
  ====================================================== */

  createInteractables() {

    /*
      칠판
    */

    this.addInteractable({

      id:
        "blackboard",

      label:
        "칠판",

      x:
        390,

      y:
        105,

      tag:
        "blackboard"

    });


    /*
      시계
    */

    this.addInteractable({

      id:
        "clock",

      label:
        "시계",

      x:
        590,

      y:
        75,

      tag:
        "clock"

    });


    /*
      창문
    */

    this.addInteractable({

      id:
        "window",

      label:
        "창문",

      x:
        70,

      y:
        220,

      tag:
        "window"

    });


    /*
      출구
    */

    this.addInteractable({

      id:
        "exit",

      label:
        "봉인된 문",

      x:
        680,

      y:
        95,

      tag:
        "door"

    });


    /*
      책상
    */

    const desks = [

      {
        id:
          "desk_01",

        x:
          210,

        y:
          250
      },

      {
        id:
          "desk_02",

        x:
          335,

        y:
          250
      },

      {
        id:
          "desk_03",

        x:
          460,

        y:
          250
      },

      {
        id:
          "desk_04",

        x:
          585,

        y:
          250
      },

      {
        id:
          "desk_05",

        x:
          210,

        y:
          345
      },

      {
        id:
          "desk_06",

        x:
          335,

        y:
          345,

        targetDesk:
          true
      },

      {
        id:
          "desk_07",

        x:
          460,

        y:
          345
      },

      {
        id:
          "desk_08",

        x:
          585,

        y:
          345
      }

    ];


    desks.forEach(
      desk => {

        this.addInteractable({

          id:
            desk.id,

          label:
            desk.targetDesk
              ? "빛나는 책상"
              : "책상",

          x:
            desk.x,

          y:
            desk.y,

          tag:
            "desk",

          targetDesk:
            Boolean(
              desk.targetDesk
            )

        });

      }
    );


    /*
      책
    */

    this.addInteractable({

      id:
        "book",

      label:
        "책",

      x:
        220,

      y:
        235,

      tag:
        "book"

    });


    /*
      가방
    */

    this.addInteractable({

      id:
        "bag",

      label:
        "가방",

      x:
        480,

      y:
        285,

      tag:
        "bag"

    });


    /*
      의자
    */

    this.addInteractable({

      id:
        "chair",

      label:
        "의자",

      x:
        585,

      y:
        365,

      tag:
        "chair"

    });


    /*
      사물함
    */

    this.addInteractable({

      id:
        "locker_a",

      label:
        "왼쪽 사물함",

      x:
        280,

      y:
        465,

      tag:
        "locker"

    });


    this.addInteractable({

      id:
        "locker_b",

      label:
        "가운데 사물함",

      x:
        330,

      y:
        465,

      tag:
        "locker"

    });


    this.addInteractable({

      id:
        "locker_c",

      label:
        "오른쪽 사물함",

      x:
        380,

      y:
        465,

      tag:
        "locker"

    });


    /*
      상자
    */

    this.addInteractable({

      id:
        "red_box",

      label:
        "붉은 상자",

      x:
        510,

      y:
        470,

      tag:
        "box",

      color:
        "red"

    });


    this.addInteractable({

      id:
        "blue_box",

      label:
        "푸른 상자",

      x:
        575,

      y:
        470,

      tag:
        "box",

      color:
        "blue"

    });


    this.addInteractable({

      id:
        "old_box",

      label:
        "낡은 상자",

      x:
        645,

      y:
        470,

      tag:
        "box",

      color:
        "old"

    });


    /*
      밀 수 있는 책상
    */

    this.addInteractable({

      id:
        "push_desk",

      label:
        "무거운 책상",

      x:
        460,

      y:
        345,

      tag:
        "pushDesk"

    });

  }


  addInteractable(
    data
  ) {

    this.interactables.push(
      data
    );

  }


  /* =====================================================
     PLAYER
  ====================================================== */

  createPlayer() {

    this.hasDirectionalSprites =
      this.textures.exists(
        "mage_front"
      )
      &&
      this.textures.exists(
        "mage_back"
      );


    if (
      this.hasDirectionalSprites
    ) {

      this.player =
        this.physics.add.image(
          385,
          400,
          "mage_front"
        );


      /*
        비율 유지
      */

      const targetHeight =
        76;


      const ratio =
        this.player.width /
        this.player.height;


      this.player.setDisplaySize(
        targetHeight * ratio,
        targetHeight
      );

    }

    else {

      /*
        캐릭터 로딩 실패 시
      */

      this.player =
        this.add.rectangle(
          385,
          400,
          28,
          44,
          0x386ed0
        );


      this.physics.add.existing(
        this.player
      );

    }


    this.player.setDepth(
      100
    );


    /*
      발 쪽만 충돌
    */

    this.player.body.setSize(
      22,
      24
    );


    this.player.body.setCollideWorldBounds(
      true
    );


    for (
      const obstacle of
      this.obstacles
    ) {

      this.physics.add.collider(
        this.player,
        obstacle
      );

    }

  }


  /* =====================================================
     INPUT
  ====================================================== */

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
          "ENTER",

        space:
          "SPACE"

      });

  }


  /* =====================================================
     UPDATE
  ====================================================== */

  update() {

    if (
      !this.player?.body
    ) {

      return;

    }


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


    /*
      좌우
    */

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


    /*
      상하
    */

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


    /*
      대각선 속도 보정
    */

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


    /*
      조사키
    */

    if (

      Phaser.Input.Keyboard
        .JustDown(
          this.keys.interact
        )

      ||

      Phaser.Input.Keyboard
        .JustDown(
          this.keys.enter
        )

      ||

      Phaser.Input.Keyboard
        .JustDown(
          this.keys.space
        )

    ) {

      this.interact();

    }

  }


  /* =====================================================
     DIRECTION
  ====================================================== */

  updateDirection(
    vx,
    vy
  ) {

    if (
      !this.hasDirectionalSprites
    ) {

      return;

    }


    /*
      좌우
    */

    if (
      Math.abs(vx) >
      Math.abs(vy)
    ) {

      if (
        vx < 0
      ) {

        if (
          this.textures.exists(
            "mage_left"
          )
        ) {

          this.player.setTexture(
            "mage_left"
          );


          this.player.setFlipX(
            false
          );

        }

        else if (
          this.textures.exists(
            "mage_side"
          )
        ) {

          this.player.setTexture(
            "mage_side"
          );


          this.player.setFlipX(
            true
          );

        }

      }

      else if (
        vx > 0
      ) {

        if (
          this.textures.exists(
            "mage_right"
          )
        ) {

          this.player.setTexture(
            "mage_right"
          );


          this.player.setFlipX(
            false
          );

        }

        else if (
          this.textures.exists(
            "mage_side"
          )
        ) {

          this.player.setTexture(
            "mage_side"
          );


          this.player.setFlipX(
            false
          );

        }

      }


      return;

    }


    /*
      위
    */

    if (
      vy < 0
    ) {

      this.player.setTexture(
        "mage_back"
      );


      this.player.setFlipX(
        false
      );

    }


    /*
      아래
    */

    else if (
      vy > 0
    ) {

      this.player.setTexture(
        "mage_front"
      );


      this.player.setFlipX(
        false
      );

    }

  }


  /* =====================================================
     INTRO
  ====================================================== */

  async playIntro() {

    await GameUI.say([

      "…눈을 떠 보니 낯선 교실이었다.",

      "루미: 드디어 정신이 들었구나!",

      "루미: 언어 수정이 산산조각 나면서 우리도 책 속 세계로 떨어진 것 같아.",

      "루미: 이 교실에는 세 개의 말의 조각이 숨겨져 있어.",

      "루미: 먼저 칠판을 조사해 봐!"

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "p1";


    this.save();

  }


  /* =====================================================
     NEAREST
  ====================================================== */

  nearestObject() {

    let nearest =
      null;


    /*
      이전 85보다 넓힘
    */

    let bestDistance =
      115;


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
        distance <
        bestDistance
      ) {

        bestDistance =
          distance;


        nearest =
          object;

      }

    }


    return nearest;

  }


  /* =====================================================
     INTERACT
  ====================================================== */

  async interact() {

    if (
      this.inputLocked
    ) {

      return;

    }


    const object =
      this.nearestObject();


    if (
      !object
    ) {

      this.inputLocked =
        true;


      await this.phaseHint();


      this.inputLocked =
        false;


      return;

    }


    this.inputLocked =
      true;


    this.player.body.setVelocity(
      0,
      0
    );


    try {

      await this.handleObject(
        object
      );

    }

    finally {

      this.inputLocked =
        false;

    }

  }


  /* =====================================================
     OBJECT HANDLER
  ====================================================== */

  async handleObject(
    object
  ) {

    /*
      P1 실제 물건 찾기
    */

    if (
      this.state.phase ===
      "p1_active"
    ) {

      if (
        object.tag ===
        this.state.p1Target
      ) {

        await this.solveP1();


        return;

      }


      if (
        object.id !==
        "blackboard"
      ) {

        this.wrong(
          "p1"
        );


        await GameUI.say(
          "루미: 칠판에 나온 영어 단어가 이 물건을 뜻하는지 다시 생각해 봐."
        );


        return;

      }

    }


    /*
      최종 기억 퍼즐
    */

    if (
      this.state.phase ===
      "final"
    ) {

      await this.handleFinalObject(
        object
      );


      return;

    }


    /*
      칠판
    */

    if (
      object.id ===
      "blackboard"
    ) {

      await this.blackboard();


      return;

    }


    /*
      밀 수 있는 책상
    */

    if (
      object.id ===
      "push_desk"
    ) {

      await this.pushHeavyDesk();


      return;

    }


    /*
      목표 책상
    */

    if (
      object.targetDesk
    ) {

      await this.targetDesk();


      return;

    }


    /*
      사물함
    */

    if (
      object.id ===
      "locker_a"
    ) {

      if (
        this.state.phase ===
        "locker"
      ) {

        await GameUI.say(
          "루미: 이 사물함에는 열쇠가 맞지 않는 것 같아."
        );

      }

      else {

        await this.phaseHint();

      }


      return;

    }


    if (
      object.id ===
      "locker_b"
    ) {

      await this.middleLocker();


      return;

    }


    if (
      object.id ===
      "locker_c"
    ) {

      if (
        this.state.phase ===
        "locker"
      ) {

        await GameUI.say(
          "루미: 여기도 아니야. 다른 사물함을 확인해 보자."
        );

      }

      else {

        await this.phaseHint();

      }


      return;

    }


    /*
      상자
    */

    if (
      object.tag ===
      "box"
    ) {

      if (
        this.state.phase ===
        "box"
      ) {

        await this.boxPuzzle(
          object
        );

      }

      else {

        await this.phaseHint();

      }


      return;

    }


    /*
      출구
    */

    if (
      object.id ===
      "exit"
    ) {

      await this.exitDoor();


      return;

    }


    /*
      그 외
    */

    await this.phaseHint();

  }


  /* =====================================================
     PHASE HINT
  ====================================================== */

  async phaseHint() {

    this.state.hintsUsed++;


    this.save();


    switch (
      this.state.phase
    ) {

      case "p1":

        await GameUI.say(
          "루미: 먼저 칠판을 조사해 봐."
        );

        break;


      case "p1_active":

        await GameUI.say(
          "루미: 칠판에 나온 영어 단어가 어떤 물건인지 생각해 봐."
        );

        break;


      case "p2":

        await GameUI.say(
          "루미: 영어 문장에서 desk가 나왔지? 무거운 책상을 찾아봐."
        );

        break;


      case "locker":

        await GameUI.say(
          "루미: 책상 아래에서 얻은 열쇠가 맞는 사물함을 찾아보자."
        );

        break;


      case "box":

        await GameUI.say(
          "루미: 영어 문장에 나온 상자의 색을 잘 확인해 봐."
        );

        break;


      case "final_ready":

        await GameUI.say(
          "루미: 세 조각을 다 모았어! 이제 봉인된 문으로 가자."
        );

        break;


      case "final":

        await GameUI.say(
          "루미: 지금까지 만났던 물건들을 순서대로 다시 조사해야 해."
        );

        break;


      case "exit":

        await GameUI.say(
          "루미: 봉인이 풀렸어! 출구를 조사해!"
        );

        break;


      default:

        await GameUI.say(
          "루미: 교실을 조금 더 살펴보자."
        );

    }

  }


  /* =====================================================
     PUZZLE 1
  ====================================================== */

  async blackboard() {

    /*
      처음 칠판
    */

    if (
      this.state.phase ===
      "p1"
    ) {

      this.state.phase =
        "p1_active";


      this.state.questionsShown++;


      this.save();


      await GameUI.say([

        "루미: 봐! 칠판에서 마법 글씨가 나타났어.",

        "루미: 저 영어 단어가 뜻하는 물건을 교실에서 찾아 조사해 봐."

      ]);


      await GameUI.english(

        "이 단어가 가리키는 물건을 찾아 조사하세요.",

        this.state.p1Target
          .toUpperCase()

      );


      return;

    }


    /*
      다시 확인
    */

    if (
      this.state.phase ===
      "p1_active"
    ) {

      await GameUI.english(

        "칠판에는 아직 같은 단어가 떠 있다.",

        this.state.p1Target
          .toUpperCase()

      );


      return;

    }


    await GameUI.say(
      "루미: 칠판의 마법 글씨는 이미 사라졌어."
    );

  }


  /* =====================================================
     P1 SOLVE + CHOICE QUIZ
  ====================================================== */

  async solveP1() {

    this.correct(
      "p1"
    );


    this.state.p1Solved =
      true;


    this.state.shards =
      1;


    this.save();


    await GameUI.say([

      "루미: 맞았어!",

      "루미: 첫 번째 말의 조각을 찾았어!"

    ]);


    /*
      다음 객관식 문제
    */

    const correctSentence =
      this.p2Sentence;


    const pool =
      this.content.expressions
        .filter(
          item =>
            item !==
            correctSentence
        );


    const options =
      buildQuizOptions(
        correctSentence,
        pool
      );


    let solved =
      false;


    let firstTry =
      true;


    while (
      !solved
    ) {

      this.state.questionsShown++;


      const answer =
        await GameUI.choice(

          "책상 아래를 살펴보라는 뜻의 영어 문장을 고르세요.",

          options,

          options.indexOf(
            correctSentence
          )

        );


      if (
        answer
      ) {

        if (
          firstTry
        ) {

          this.correct(
            "p2_choice"
          );

        }


        solved =
          true;

      }

      else {

        firstTry =
          false;


        this.wrong(
          "p2_choice"
        );


        await GameUI.say(
          "루미: desk와 위치 표현을 잘 살펴봐."
        );

      }

    }


    this.state.phase =
      "p2";


    this.save();


    await GameUI.say([

      "루미: 좋아! 이제 그 문장을 실제로 따라 해보자.",

      "루미: 무거운 책상을 찾아 두 번 밀어봐."

    ]);


    await GameUI.english(

      "이 문장을 기억하세요.",

      this.p2Sentence

    );

  }


  /* =====================================================
     PUZZLE 2 - PUSH DESK
  ====================================================== */

  async pushHeavyDesk() {

    if (
      this.state.phase !==
      "p2"
    ) {

      await this.phaseHint();


      return;

    }


    if (
      this.state.pushSteps >=
      2
    ) {

      await GameUI.say(
        "루미: 책상은 이미 충분히 움직였어. 이제 빛나는 책상을 조사해 봐."
      );


      return;

    }


    this.state.pushSteps++;


    this.save();


    if (
      this.state.pushSteps ===
      1
    ) {

      await GameUI.say(
        "무거운 책상을 힘껏 밀었다. 조금 움직였다."
      );

    }

    else {

      await GameUI.say([

        "책상을 한 번 더 밀었다.",

        "루미: 좋아! 뒤쪽으로 갈 수 있게 됐어."

      ]);

    }

  }


  /* =====================================================
     TARGET DESK
  ====================================================== */

  async targetDesk() {

    if (
      this.state.phase !==
      "p2"
    ) {

      await this.phaseHint();


      return;

    }


    if (
      this.state.pushSteps <
      2
    ) {

      await GameUI.say(
        "루미: 앞의 무거운 책상을 먼저 움직여야 가까이 갈 수 있어."
      );


      return;

    }


    this.correct(
      "p2"
    );


    this.state.p2Solved =
      true;


    this.state.lockerKey =
      true;


    this.state.phase =
      "locker";


    this.save();


    await GameUI.say([

      "책상 아래에서 작은 열쇠를 발견했다.",

      "루미: 사물함 열쇠 같아! 교실 뒤쪽 사물함을 확인해 봐."

    ]);

  }


  /* =====================================================
     LOCKER + WORD ORDER
  ====================================================== */

  async middleLocker() {

    if (
      this.state.phase !==
      "locker"
    ) {

      await this.phaseHint();


      return;

    }


    if (
      !this.state.lockerKey
    ) {

      await GameUI.say(
        "사물함은 잠겨 있다."
      );


      return;

    }


    this.state.questionsShown++;


    this.save();


    await GameUI.say(
      "루미: 사물함 안쪽에 흩어진 영어 단어들이 보여!"
    );


    const success =
      await GameUI.wordOrder(
        this.p3Sentence
      );


    if (
      !success
    ) {

      return;

    }


    this.correct(
      "p3"
    );


    this.state.p3Solved =
      true;


    this.state.shards =
      2;


    this.state.phase =
      "box";


    this.save();


    await GameUI.say([

      "두 번째 말의 조각을 발견했다!",

      "루미: 이제 상자들 쪽에서 마지막 마력이 느껴져."

    ]);


    /*
      색상 단서
    */

    const clue =
      `The key is behind the ${this.state.boxTargetColor} box.`;


    this.state.questionsShown++;


    this.save();


    await GameUI.english(

      "문장을 읽고 알맞은 상자를 조사하세요.",

      clue

    );

  }


  /* =====================================================
     BOX PUZZLE
  ====================================================== */

  async boxPuzzle(
    object
  ) {

    if (
      object.color !==
      this.state.boxTargetColor
    ) {

      this.wrong(
        "p4"
      );


      await GameUI.say(
        "루미: 이 상자는 아닌 것 같아. 문장 속 색을 다시 확인해 봐."
      );


      return;

    }


    this.correct(
      "p4"
    );


    this.state.p4Solved =
      true;


    this.state.shards =
      3;


    this.state.phase =
      "final_ready";


    this.save();


    await GameUI.say([

      "상자 뒤에서 마지막 말의 조각이 나타났다!",

      "루미: 세 개를 다 모았어!",

      "루미: 이제 봉인된 문을 조사해 봐."

    ]);

  }


  /* =====================================================
     EXIT
  ====================================================== */

  async exitDoor() {

    /*
      P1 정답이 door인 경우
    */

    if (
      this.state.phase ===
      "p1_active"
      &&
      this.state.p1Target ===
      "door"
    ) {

      await this.solveP1();


      return;

    }


    /*
      최종 퍼즐 시작
    */

    if (
      this.state.phase ===
      "final_ready"
    ) {

      await this.startFinal();


      return;

    }


    /*
      탈출
    */

    if (
      this.state.phase ===
      "exit"
    ) {

      await this.completeMap();


      return;

    }


    await this.phaseHint();

  }


  /* =====================================================
     FINAL
  ====================================================== */

  async startFinal() {

    this.state.phase =
      "final";


    this.state.finalStep =
      0;


    this.finalSequence = [

      this.state.p1Target,

      "box",

      "desk"

    ];


    this.save();


    await GameUI.say([

      "루미: 문에 세 개의 빈 문양이 나타났어.",

      "루미: 지금까지 배운 단서를 순서대로 떠올려야 해!"

    ]);


    await GameUI.english(

      "아래 단서를 기억하고 해당 물건들을 순서대로 조사하세요.",

      `${this.state.p1Target.toUpperCase()}

Open the box.

${this.p2Sentence}`

    );

  }


  async handleFinalObject(
    object
  ) {

    if (
      !this.finalSequence
    ) {

      this.finalSequence = [

        this.state.p1Target,

        "box",

        "desk"

      ];

    }


    const expected =
      this.finalSequence[
        this.state.finalStep
      ];


    if (
      object.tag !==
      expected
    ) {

      this.wrong(
        "final"
      );


      await GameUI.say(
        "루미: 순서가 아닌 것 같아. 지금까지 맞힌 문양은 유지되니까 다시 생각해 봐!"
      );


      return;

    }


    this.state.finalStep++;


    this.save();


    await GameUI.say(
      `기억의 문양 ${this.state.finalStep} / 3이 빛났다.`
    );


    if (
      this.state.finalStep >=
      3
    ) {

      this.state.finalSolved =
        true;


      this.state.phase =
        "exit";


      this.save();


      await GameUI.say([

        "세 개의 문양이 모두 빛났다!",

        "루미: 봉인이 풀렸어!",

        "루미: 출구를 조사하면 이 교실에서 나갈 수 있어."

      ]);

    }

  }


  /* =====================================================
     COMPLETE
  ====================================================== */

  async completeMap() {

    if (
      this.state.completed
    ) {

      return;

    }


    this.state.completed =
      true;


    this.save();


    const seconds =
      Math.max(

        1,

        Math.round(
          (
            Date.now() -
            this.state.sessionStartedAt
          )
          / 1000
        )

      );


    saveRecord({

      mapId:
        "MAP_01_CLASSROOM",

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


    this.inputLocked =
      true;


    await GameUI.say([

      "봉인된 교실 문이 천천히 열렸다.",

      "루미: 해냈어! 첫 번째 언어 수정이 다시 빛나기 시작했어!",

      "나: 아직 더 많은 조각이 남아 있는 거지?",

      "루미: 응! 다음 세계로 가자!"

    ]);


    await GameUI.finish({

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
     SCORE
  ====================================================== */

  correct(
    id
  ) {

    if (
      !this.state.mistakes[id]
    ) {

      this.state.firstTryCorrect++;

    }

  }


  wrong(
    id
  ) {

    this.state.wrongAttempts++;


    this.state.mistakes[id] =
      (
        this.state.mistakes[id]
        || 0
      ) + 1;


    this.save();

  }


  /* =====================================================
     SAVE
  ====================================================== */

  save() {

    window.WISDOM_MAP_STATE =
      this.state;


    saveMapProgress(
      this.profile.name,
      this.state
    );


    this.updateHUD();

  }


  /* =====================================================
     HUD
  ====================================================== */

  updateHUD() {

    const shardElement =
      document.querySelector(
        "#hud-shards"
      );


    if (
      shardElement
    ) {

      shardElement.textContent = [

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


    const objectiveElement =
      document.querySelector(
        "#hud-objective"
      );


    if (
      !objectiveElement
    ) {

      return;

    }


    const objectives = {

      intro:
        "주변을 살펴보자.",

      p1:
        "칠판을 조사해 보자.",

      p1_active:
        "영어 단어가 뜻하는 물건을 찾아보자.",

      p2:
        "무거운 책상을 찾아 두 번 밀자.",

      locker:
        "열쇠에 맞는 사물함을 찾자.",

      box:
        "영어 단서에 맞는 상자를 조사하자.",

      final_ready:
        "봉인된 출구를 조사하자.",

      final:
        `기억의 문양 ${this.state.finalStep} / 3`,

      exit:
        "봉인이 풀렸다. 출구로 나가자!"

    };


    objectiveElement.textContent =
      objectives[
        this.state.phase
      ]
      ||
      "교실을 탐험해 보자.";

  }

}


/* =====================================================
   QUIZ OPTION BUILDER
===================================================== */

function buildQuizOptions(
  correct,
  pool
) {

  const unique =
    [...new Set(pool)]
      .filter(Boolean)
      .filter(
        item =>
          item !== correct
      );


  /*
    랜덤 섞기
  */

  const shuffled =
    [...unique];


  for (
    let i =
      shuffled.length - 1;

    i > 0;

    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    [
      shuffled[i],
      shuffled[j]
    ] =
    [
      shuffled[j],
      shuffled[i]
    ];

  }


  const options = [

    correct,

    ...shuffled.slice(
      0,
      3
    )

  ];


  /*
    교사가 표현을 4개 미만으로 넣었을 때
    객관식이 깨지지 않도록 보충
  */

  const fallbacks = [

    "Open the door.",

    "Look at the window.",

    "The book is on the desk.",

    "Close the box.",

    "Where is the key?"

  ];


  for (
    const fallback of
    fallbacks
  ) {

    if (
      options.length >=
      4
    ) {

      break;

    }


    if (
      !options.includes(
        fallback
      )
    ) {

      options.push(
        fallback
      );

    }

  }


  /*
    최종 4개 섞기
  */

  for (
    let i =
      options.length - 1;

    i > 0;

    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    [
      options[i],
      options[j]
    ] =
    [
      options[j],
      options[i]
    ];

  }


  return options.slice(
    0,
    4
  );

}
