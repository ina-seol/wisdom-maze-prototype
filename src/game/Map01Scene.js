import Phaser from "phaser";

import {
  getUnit1Content,
  chooseObjectWord,
  findExpression,
  randomBoxColor,
  saveMapProgress,
  saveRecord
} from "../data.js";


export default class Map01Scene
  extends Phaser.Scene {

  constructor() {

    super(
      "MAP01"
    );

  }


  preload() {

    const base =
      import.meta.env.BASE_URL;


    this.load.image(
      "map01",
      `${base}assets/maps/map01.png`
    );


    const sprites =
      window.WISDOM_PROFILE
        ?.spriteUrls;


    if (
      sprites?.front
    ) {

      this.load.image(
        "mage_front",
        sprites.front
      );

    }


    if (
      sprites?.back
    ) {

      this.load.image(
        "mage_back",
        sprites.back
      );

    }


    if (
      sprites?.side
    ) {

      this.load.image(
        "mage_side",
        sprites.side
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


    /*
      이전 저장데이터 호환
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


    this.inputLocked =
      true;


    this.interactables =
      [];


    this.obstacles =
      [];


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


    this.p2Sentence =
      findExpression(
        this.content.expressions,
        /under.*desk|desk.*under/i,
        "Look under the desk."
      );


    this.p3Sentence =
      findExpression(
        this.content.expressions,
        /open.*box/i,
        "Open the box."
      );


    /*
      MAP
    */

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


    this.createCollisionAreas();

    this.createInteractables();

    this.createPlayer();

    this.createInput();

    this.updateHUD();


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
      앞쪽 교탁
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
      우측 가구
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

    this.addInteractable({

      id:
        "blackboard",

      label:
        "칠판",

      x:
        390,

      y:
        110,

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
            "책상",

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

    const hasFront =
      this.textures.exists(
        "mage_front"
      );


    if (
      !hasFront
    ) {

      /*
        절대로 캐릭터가 사라지지 않도록
        임시 마법사 표시
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


      this.hasDirectionalSprites =
        false;

    }

    else {

      this.player =
        this.physics.add.image(
          385,
          400,
          "mage_front"
        );


      this.player.setDisplaySize(
        48,
        64
      );


      this.hasDirectionalSprites =
        true;

    }


    this.player.setDepth(
      100
    );


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
     INPUT / MOVEMENT
  ====================================================== */

  createInput() {

    this.cursors =
      this.input.keyboard
        .createCursorKeys();


    this.keys =
      this.input.keyboard.addKeys({

        up: "W",
        down: "S",
        left: "A",
        right: "D",

        interact: "E",

        enter: "ENTER",

        space: "SPACE"

      });

  }


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


    if (
      vx &&
      vy
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


  updateDirection(
    vx,
    vy
  ) {

    if (
      !this.hasDirectionalSprites
    ) {
      return;
    }


    if (
      Math.abs(vx) >
      Math.abs(vy)
    ) {

      this.player.setTexture(
        "mage_side"
      );


      this.player.setFlipX(
        vx < 0
      );


      return;

    }


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

      "…일어나 봐.",

      "루미: 큰일이야! 언어 수정이 산산조각 나면서 책 속 세계로 떨어진 것 같아.",

      "여기는 교실인 것 같은데… 출입문이 마법으로 봉인되어 있어.",

      "이곳에 흩어진 세 개의 말의 조각을 찾아야 해.",

      "먼저 주변을 조사해 보자."

    ]);


    this.state.introDone =
      true;


    this.state.phase =
      "p1";


    this.save();

  }


  /* =====================================================
     INTERACTION
  ====================================================== */

  nearestObject() {

    let nearest =
      null;


    let distanceLimit =
      85;


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
        distanceLimit
      ) {

        distanceLimit =
          distance;


        nearest =
          object;

      }

    }


    return nearest;

  }


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


      await GameUI.say(
        "주변에는 특별한 것이 없다."
      );


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


    await this.handleObject(
      object
    );


    this.inputLocked =
      false;

  }


  async handleObject(
    object
  ) {

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


    if (
      this.state.phase ===
      "final"
    ) {

      await this.handleFinalObject(
        object
      );

      return;

    }


    if (
      object.id ===
      "blackboard"
    ) {

      await this.blackboard();

      return;

    }


    if (
      object.id ===
      "push_desk"
    ) {

      await this.pushHeavyDesk();

      return;

    }


    if (
      object.targetDesk
    ) {

      await this.targetDesk();

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
      object.tag === "box" &&
      this.state.phase === "box"
    ) {

      await this.boxPuzzle(
        object
      );

      return;

    }


    if (
      object.id ===
      "exit"
    ) {

      await this.exitDoor();

      return;

    }


    await GameUI.say(
      `${object.label}을(를) 살펴봤지만 특별한 것은 없다.`
    );

  }


  /* =====================================================
     PUZZLE 1
  ====================================================== */

  async blackboard() {

    if (
      this.state.phase !==
      "p1"
    ) {

      await GameUI.say(
        "칠판에는 희미한 마법의 흔적만 남아 있다."
      );

      return;

    }


    this.state.phase =
      "p1_active";


    this.state.questionsShown++;


    this.save();


    await GameUI.english(

      "영어 단어가 가리키는 물건을 교실에서 찾아 조사하세요.",

      this.state
        .p1Target
        .toUpperCase()

    );

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


    this.state.questionsShown++;


    this.save();


    await GameUI.say(
      "첫 번째 말의 조각을 발견했다!"
    );


    await GameUI.english(

      "문장을 읽고 알맞은 장소를 찾아보세요.",

      this.p2Sentence

    );

  }


  /* =====================================================
     PUZZLE 2
  ====================================================== */

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


    this.state.pushSteps++;


    if (
      this.state.pushSteps >
      2
    ) {

      this.state.pushSteps =
        2;

    }


    this.save();


    if (
      this.state.pushSteps <
      2
    ) {

      await GameUI.say(
        "책상을 조금 밀었다."
      );

    }

    else {

      await GameUI.say(
        "책상을 밀어 통로를 열었다!"
      );

    }

  }


  async targetDesk() {

    if (
      this.state.phase !==
      "p2"
    ) {

      await GameUI.say(
        "평범한 책상이다."
      );

      return;

    }


    if (
      this.state.pushSteps <
      2
    ) {

      await GameUI.say(
        "무거운 책상이 길을 막고 있다."
      );

      return;

    }


    this.correct(
      "p2"
    );


    this.state.lockerKey =
      true;


    this.state.p2Solved =
      true;


    this.state.phase =
      "locker";


    this.save();


    await GameUI.say(
      "책상 아래에서 사물함 열쇠를 발견했다!"
    );

  }


  /* =====================================================
     LOCKER
  ====================================================== */

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


    if (
      !success
    ) {
      return;
    }


    this.correct(
      "p3"
    );


    this.state.shards =
      2;


    this.state.p3Solved =
      true;


    this.state.phase =
      "box";


    this.state.questionsShown++;


    this.save();


    await GameUI.say(
      "두 번째 말의 조각을 발견했다!"
    );


    await GameUI.english(

      "문장을 읽고 알맞은 상자를 조사하세요.",

      `The key is behind the ${this.state.boxTargetColor} box.`

    );

  }


  /* =====================================================
     BOX
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
        "이 상자 뒤에는 아무것도 없다."
      );


      return;

    }


    this.correct(
      "p4"
    );


    this.state.shards =
      3;


    this.state.p4Solved =
      true;


    this.state.phase =
      "final_ready";


    this.save();


    await GameUI.say([

      "세 번째 말의 조각을 발견했다!",

      "세 개의 조각을 모두 모았다.",

      "봉인된 출구를 조사해 보자."

    ]);

  }


  /* =====================================================
     FINAL
  ====================================================== */

  async exitDoor() {

    if (
      this.state.phase ===
      "p1_active" &&
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
      "푸른 마법이 문을 봉인하고 있다."
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


    await GameUI.english(

      "세 개의 단서를 기억하고 해당 물건을 순서대로 조사하세요.",

      `${this.state.p1Target.toUpperCase()}

Open the box.

${this.p2Sentence}`

    );

  }


  async handleFinalObject(
    object
  ) {

    this.finalSequence ||= [

      this.state.p1Target,

      "box",

      "desk"

    ];


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
        "순서가 맞지 않는다."
      );


      return;

    }


    this.state.finalStep++;


    this.save();


    await GameUI.say(
      `기억의 문양 ${this.state.finalStep} / 3`
    );


    if (
      this.state.finalStep >=
      3
    ) {

      this.state.phase =
        "exit";


      this.state.finalSolved =
        true;


      this.save();


      await GameUI.say(
        "봉인이 풀렸다! 출구를 조사하자."
      );

    }

  }


  /* =====================================================
     CLEAR
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
        new Date().toISOString()

    });


    await GameUI.say([

      "교실의 봉인이 완전히 사라졌다.",

      "루미: 첫 번째 언어 수정을 되찾았어!",

      "하지만 아직 열한 개의 세계가 남아 있어."

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


  save() {

    window.WISDOM_MAP_STATE =
      this.state;


    saveMapProgress(
      this.profile.name,
      this.state
    );


    this.updateHUD();

  }


  updateHUD() {

    const shard =
      document.querySelector(
        "#hud-shards"
      );


    if (
      shard
    ) {

      shard.textContent = [

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


    const messages = {

      intro:
        "주변을 조사해 보자.",

      p1:
        "칠판을 조사해 보자.",

      p1_active:
        "영어 단어가 가리키는 물건을 찾자.",

      p2:
        "영어 문장을 읽고 책상을 조사하자.",

      locker:
        "열쇠에 맞는 사물함을 찾아보자.",

      box:
        "영어 단서에 맞는 상자를 찾자.",

      final_ready:
        "출구를 조사해 보자.",

      final:
        `기억의 문양 ${this.state.finalStep} / 3`,

      exit:
        "봉인이 풀렸다. 출구로 나가자!"

    };


    objective.textContent =
      messages[
        this.state.phase
      ]
      ||
      "교실을 탐험해 보자.";

  }

}
