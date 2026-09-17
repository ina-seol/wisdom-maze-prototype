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


  preload() {

    const base = import.meta.env.BASE_URL;

    // MAP01 배경 이미지
    this.load.image(
      "map01",
      `${base}assets/maps/map01.png`
    );


    // 캐릭터시트에서 main.js가 추출한 이미지
    const urls =
      window.WISDOM_PROFILE?.spriteUrls;

    if (urls) {

      this.load.image(
        "mage_front",
        urls.front
      );

      this.load.image(
        "mage_back",
        urls.back
      );

      this.load.image(
        "mage_side",
        urls.side
      );
    }
  }


  create() {

    this.profile =
      window.WISDOM_PROFILE;

    this.state =
      window.WISDOM_MAP_STATE;

    this.content =
      getUnit1Content();


    this.inputLocked = true;

    this.interactables = [];

    this.obstacles = [];


    /*
      --------------------------------
      문제 콘텐츠 준비
      --------------------------------
    */

    if (!this.state.p1Target) {

      this.state.p1Target =
        chooseObjectWord(
          this.content.words
        );
    }


    if (!this.state.boxTargetColor) {

      this.state.boxTargetColor =
        randomBoxColor();
    }


    this.p2Sentence =
      findExpression(
        this.content.expressions,
        /under.*desk|desk.*under/i,
        "Look under the desk."
      );


    this.p3Sentence =
      findExpression(
        this.content.expressions,
        /^.{3,}\s+.{2,}/,
        "Open the box."
      );


    /*
      --------------------------------
      MAP 배경
      --------------------------------
    */

    this.mapImage =
      this.add.image(
        384,
        288,
        "map01"
      );

    this.mapImage
      .setDisplaySize(
        768,
        576
      )
      .setDepth(-100);


    /*
      --------------------------------
      충돌 영역 생성
      --------------------------------
    */

    this.createCollisionAreas();


    /*
      --------------------------------
      조사 영역 생성
      --------------------------------
    */

    this.createInteractables();


    /*
      --------------------------------
      플레이어
      --------------------------------
    */

    this.createPlayer();


    /*
      --------------------------------
      입력
      --------------------------------
    */

    this.createInput();


    /*
      --------------------------------
      HUD
      --------------------------------
    */

    this.updateHUD();


    /*
      --------------------------------
      오프닝
      --------------------------------
    */

    this.time.delayedCall(
      350,
      async () => {

        if (
          !this.state.introDone
        ) {

          await this.playIntro();
        }

        this.inputLocked = false;
      }
    );
  }


  /*
  ====================================================
  COLLISION
  ====================================================
  */

  createCollisionAreas() {

    /*
      배경 이미지 기준 768 x 576.

      현재 좌표는 새 MAP 이미지에 맞춘
      프로토타입용 값.

      실제 플레이하면서
      위치를 조금씩 미세조정하면 됨.
    */


    // 외곽 벽
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
      561,
      768,
      30
    );


    // 상단 칠판 벽
    this.addObstacle(
      400,
      82,
      360,
      75
    );


    // 교사용 책상
    this.addObstacle(
      390,
      150,
      150,
      70
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
          78,
          55
        );
      }
    );


    // 좌측 책장
    this.addObstacle(
      115,
      455,
      135,
      110
    );


    // 사물함 3개
    this.addObstacle(
      315,
      470,
      145,
      110
    );


    // 우측 상자 3개
    this.addObstacle(
      560,
      475,
      200,
      80
    );


    // 우측 장식/선반
    this.addObstacle(
      710,
      325,
      65,
      190
    );


    // 왼쪽 창문 벽
    this.addObstacle(
      55,
      255,
      60,
      300
    );


    // 출구
    this.exitObstacle =
      this.addObstacle(
        670,
        85,
        85,
        110
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


  /*
  ====================================================
  INTERACTABLES
  ====================================================
  */

  createInteractables() {

    /*
      화면에는 아무것도 그리지 않고
      조사 좌표만 만든다.
    */


    this.addInteractable({

      id:
        "blackboard",

      label:
        "칠판",

      x:
        390,

      y:
        95,

      tag:
        "blackboard"
    });


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
      학생 책상
    */

    const desks = [

      {
        id: "desk_01",
        x: 210,
        y: 250
      },

      {
        id: "desk_02",
        x: 335,
        y: 250
      },

      {
        id: "desk_03",
        x: 460,
        y: 250
      },

      {
        id: "desk_04",
        x: 585,
        y: 250
      },

      {
        id: "desk_05",
        x: 210,
        y: 345
      },

      {
        id: "desk_06",
        x: 335,
        y: 345,
        targetDesk: true
      },

      {
        id: "desk_07",
        x: 460,
        y: 345
      },

      {
        id: "desk_08",
        x: 585,
        y: 345
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
            !!desk.targetDesk
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
      세 개의 상자
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
      임시로 하단 책상 하나 사용
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
      {
        ...data
      }
    );
  }


  /*
  ====================================================
  PLAYER
  ====================================================
  */

  createPlayer() {

    const spriteExists =
      this.textures.exists(
        "mage_front"
      );


    if (spriteExists) {

      this.player =
        this.physics.add.image(
          380,
          385,
          "mage_front"
        );


      this.player.setDisplaySize(
        48,
        74
      );


      this.player.body.setSize(
        22,
        30
      );


      this.player.body.setOffset(
        (
          this.player.width -
          22
        ) / 2,
        this.player.height -
          32
      );

    } else {

      /*
        캐릭터 로딩 실패 시
        임시 사각형
      */

      this.player =
        this.add.rectangle(

          380,
          385,

          26,
          42,

          this.profile.gender ===
          "female"

            ? 0x3f8c58
            : 0x4053a5
        );


      this.physics.add.existing(
        this.player
      );
    }


    this.player.setDepth(
      100
    );


    this.player.body
      .setCollideWorldBounds(
        true
      );


    /*
      모든 장애물 충돌
    */

    for (
      const obstacle of
      this.obstacles
    ) {

      this.physics.add.collider(
        this.player,
        obstacle
      );
    }


    this.hasMageSprites =
      spriteExists;
  }


  /*
  ====================================================
  INPUT
  ====================================================
  */

  createInput() {

    this.cursors =
      this.input.keyboard
        .createCursorKeys();


    this.keys =
      this.input.keyboard.addKeys(
        "W,A,S,D,E,ENTER,SPACE"
      );
  }


  update() {

    if (!this.player) {
      return;
    }


    if (this.inputLocked) {

      this.player.body.setVelocity(
        0,
        0
      );

      return;
    }


    const speed =
      145;


    let vx = 0;
    let vy = 0;


    if (
      this.cursors.left.isDown ||
      this.keys.A.isDown
    ) {

      vx =
        -speed;
    }


    else if (
      this.cursors.right.isDown ||
      this.keys.D.isDown
    ) {

      vx =
        speed;
    }


    if (
      this.cursors.up.isDown ||
      this.keys.W.isDown
    ) {

      vy =
        -speed;
    }


    else if (
      this.cursors.down.isDown ||
      this.keys.S.isDown
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
          this.keys.E
        )

      ||

      Phaser.Input.Keyboard
        .JustDown(
          this.keys.ENTER
        )

      ||

      Phaser.Input.Keyboard
        .JustDown(
          this.keys.SPACE
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
      !this.hasMageSprites
    ) {

      return;
    }


    if (
      Math.abs(vx) >
      Math.abs(vy)
    ) {

      this.player
        .setTexture(
          "mage_side"
        )
        .setFlipX(
          vx < 0
        );

    }

    else if (
      vy < 0
    ) {

      this.player
        .setTexture(
          "mage_back"
        )
        .setFlipX(
          false
        );

    }

    else if (
      vy > 0
    ) {

      this.player
        .setTexture(
          "mage_front"
        )
        .setFlipX(
          false
        );
    }
  }


  /*
  ====================================================
  INTRO
  ====================================================
  */

  async playIntro() {

    this.inputLocked =
      true;


    await GameUI.say([

      "…일어나 봐.",

      "루미: 큰일이야! 언어 수정이 산산조각 나면서 책 속 세계로 떨어진 것 같아.",

      "여기는 교실인 것 같은데… 출입문이 마법으로 봉인되어 있어.",

      "루미: 이곳에 흩어진 세 개의 '말의 조각'을 찾아야 문을 열 수 있을 것 같아.",

      "먼저 주변을 조사해 보자."
    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "p1";


    this.save();


    this.updateHUD();
  }


  /*
  ====================================================
  INTERACTION
  ====================================================
  */

  nearestObject() {

    let nearest =
      null;

    let bestDistance =
      80;


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


  async interact() {

    if (this.inputLocked) {
      return;
    }


    const object =
      this.nearestObject();


    if (!object) {

      await GameUI.say(
        "주변에는 특별한 것이 없다."
      );

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


  async handleObject(
    object
  ) {

    /*
      ------------------------------
      P1 물건 찾기
      ------------------------------
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
          "아무 일도 일어나지 않았다."
        );


        return;
      }
    }


    /*
      ------------------------------
      FINAL
      ------------------------------
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
      ------------------------------
      일반 조사
      ------------------------------
    */

    switch (
      object.id
    ) {

      case "blackboard":

        await this.blackboard();

        break;


      case "push_desk":

        await this.pushHeavyDesk();

        break;


      case "locker_a":

        await GameUI.say(
          "체육복이 들어 있다."
        );

        break;


      case "locker_b":

        await this.middleLocker();

        break;


      case "locker_c":

        await GameUI.say(
          "텅 비어 있다."
        );

        break;


      case "exit":

        await this.exitDoor();

        break;


      default:

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
          상자 퍼즐
        */

        if (
          object.tag ===
          "box" &&
          this.state.phase ===
          "box"
        ) {

          await this.boxPuzzle(
            object
          );

          return;
        }


        await GameUI.say(
          `${object.label}을(를) 살펴봤지만 특별한 것은 없다.`
        );
    }
  }


  /*
  ====================================================
  PUZZLE 1
  ====================================================
  */

  async blackboard() {

    if (
      this.state.phase !==
      "p1"
    ) {

      await GameUI.say(
        "칠판의 영어 글씨는 이미 사라졌다."
      );

      return;
    }


    this.state.p1Started =
      true;


    this.state.phase =
      "p1_active";


    this.state.questionsShown++;


    this.save();


    await GameUI.english(

      "칠판에 영어 단어가 떠올랐다. 이 단어가 가리키는 물건을 교실에서 찾아 조사해 보자.",

      this.state
        .p1Target
        .toUpperCase()
    );


    this.updateHUD();
  }


  async solveP1() {

    this.correct(
      "p1"
    );


    this.state.p1Solved =
      true;


    this.state.shards =
      1;


    this.state.phase =
      "p2";


    this.save();


    await GameUI.say([

      "정답이다!",

      "첫 번째 말의 조각을 발견했다.",

      "교실 뒤쪽에서 빛이 번쩍였다."
    ]);


    this.state.questionsShown++;


    this.save();


    await GameUI.english(

      "새로운 문장이 나타났다. 문장을 읽고 알맞은 장소를 찾아보자.",

      this.p2Sentence
    );


    this.updateHUD();
  }


  /*
  ====================================================
  PUZZLE 2
  ====================================================
  */

  async pushHeavyDesk() {

    if (
      this.state.phase !==
      "p2"
    ) {

      await GameUI.say(
        "무거운 책상이다."
      );

      return;
    }


    if (
      this.state.pushSteps >=
      2
    ) {

      await GameUI.say(
        "통로는 이미 충분히 열려 있다."
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
        "책상을 조금 밀었다."
      );

    } else {

      await GameUI.say(
        "책상을 밀어 통로를 만들었다!"
      );
    }
  }


  async targetDesk() {

    if (
      this.state.phase !==
      "p2"
    ) {

      await GameUI.say(
        "책상 위에 낡은 공책이 놓여 있다."
      );

      return;
    }


    if (
      this.state.pushSteps <
      2
    ) {

      await GameUI.say(
        "앞에 있는 무거운 책상 때문에 가까이 갈 수 없다."
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

      "낡은 사물함 열쇠를 얻었다."
    ]);


    this.updateHUD();
  }


  /*
  ====================================================
  PUZZLE 3
  ====================================================
  */

  async middleLocker() {

    if (
      this.state.phase !==
      "locker"
    ) {

      await GameUI.say(
        "낡은 사물함이다."
      );

      return;
    }


    if (
      !this.state.lockerKey
    ) {

      await GameUI.say(
        "잠겨 있다."
      );

      return;
    }


    this.state.questionsShown++;


    this.save();


    const success =
      await GameUI.wordOrder(
        this.p3Sentence
      );


    if (!success) {
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


    await GameUI.say(
      "두 번째 말의 조각을 발견했다!"
    );


    const color =
      this.state
        .boxTargetColor;


    const clue =
      `The key is behind the ${color} box.`;


    this.state.questionsShown++;


    this.save();


    await GameUI.english(

      "상자 뒤 어딘가에 비밀 장치가 숨겨져 있다. 문장을 읽고 알맞은 상자를 조사해 보자.",

      clue
    );


    this.updateHUD();
  }


  /*
  ====================================================
  PUZZLE 4
  ====================================================
  */

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
        "상자 뒤에는 아무것도 없다."
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

      "상자 뒤에서 작은 마법 버튼을 발견했다.",

      "딸깍!",

      "교실의 시계가 빠르게 돌아가기 시작한다.",

      "마지막 말의 조각이 나타났다.",

      "세 개의 말의 조각을 모두 모았다!"
    ]);


    this.updateHUD();
  }


  /*
  ====================================================
  EXIT / FINAL
  ====================================================
  */

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


    if (
      this.state.phase ===
      "final_ready"
    ) {

      await this.startFinal();

      return;
    }


    if (
      this.state.phase ===
      "exit"
    ) {

      await this.completeMap();

      return;
    }


    await GameUI.say(
      "푸른 마법이 문을 단단히 봉인하고 있다."
    );
  }


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


    await GameUI.say(
      "루미: 마지막으로 지금까지 발견한 말을 순서대로 다시 떠올려 봐!"
    );


    await GameUI.english(

      "아래 세 가지 영어 단서를 기억하고, 교실에서 해당 물건을 순서대로 조사하자.",

      `${this.state.p1Target.toUpperCase()}

Open the box.

${this.p2Sentence}`
    );


    this.updateHUD();
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
        "문양이 잠깐 흔들렸다. 지금까지 맞힌 순서는 그대로 유지된다."
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

        "세 개의 문양이 모두 빛난다.",

        "교실을 감싸고 있던 봉인이 무너지기 시작한다.",

        "출구가 열렸다!"
      ]);
    }


    this.updateHUD();
  }


  /*
  ====================================================
  CLEAR
  ====================================================
  */

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
            this.state
              .sessionStartedAt
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
        this.state
          .questionsShown,

      firstTryCorrect:
        this.state
          .firstTryCorrect,

      wrongAttempts:
        this.state
          .wrongAttempts,

      hintsUsed:
        this.state
          .hintsUsed,

      completedAt:
        new Date()
          .toISOString()
    });


    this.inputLocked =
      true;


    await GameUI.say([

      "교실 문 너머에서 눈부신 빛이 쏟아진다.",

      "루미: 해냈어! 첫 번째 언어 수정이 원래의 빛을 되찾았어.",

      "하지만 아직 열한 개의 세계가 남아 있어.",

      "우리의 모험은 이제 시작이야!"
    ]);


    await GameUI.finish({

      name:
        this.profile.name,

      seconds,

      firstTry:
        this.state
          .firstTryCorrect,

      wrong:
        this.state
          .wrongAttempts
    });
  }


  /*
  ====================================================
  RECORD
  ====================================================
  */

  correct(
    id
  ) {

    if (
      !this.state
        .mistakes[id]
    ) {

      this.state
        .firstTryCorrect++;
    }
  }


  wrong(
    id
  ) {

    this.state
      .wrongAttempts++;


    this.state
      .mistakes[id] =
      (
        this.state
          .mistakes[id]
        || 0
      ) + 1;


    this.save();
  }


  /*
  ====================================================
  SAVE
  ====================================================
  */

  save() {

    window.WISDOM_MAP_STATE =
      this.state;


    saveMapProgress(

      this.profile.name,

      this.state
    );


    this.updateHUD();
  }


  /*
  ====================================================
  HUD
  ====================================================
  */

  updateHUD() {

    const shards = [

      this.state.shards >= 1
        ? "◆"
        : "◇",

      this.state.shards >= 2
        ? "◆"
        : "◇",

      this.state.shards >= 3
        ? "◆"
        : "◇"

    ].join(" ");


    document
      .querySelector(
        "#hud-shards"
      )
      .textContent =
        shards;


    let objective =
      "주변을 조사해 보자.";


    switch (
      this.state.phase
    ) {

      case "p1":

        objective =
          "칠판을 조사해 보자.";

        break;


      case "p1_active":

        objective =
          "영어 단어가 가리키는 물건을 찾아보자.";

        break;


      case "p2":

        objective =
          "영어 문장을 읽고 책상 주변을 조사해 보자.";

        break;


      case "locker":

        objective =
          "열쇠에 맞는 사물함을 찾아보자.";

        break;


      case "box":

        objective =
          "영어 단서를 읽고 알맞은 상자를 찾아보자.";

        break;


      case "final_ready":

        objective =
          "말의 조각을 모두 모았다. 출구를 조사하자.";

        break;


      case "final":

        objective =
          `기억의 문 ${this.state.finalStep} / 3`;

        break;


      case "exit":

        objective =
          "봉인이 풀렸다. 출구로 나가자!";

        break;


      default:

        objective =
          "교실을 탐험해 보자.";
    }


    document
      .querySelector(
        "#hud-objective"
      )
      .textContent =
        objective;
  }
}
