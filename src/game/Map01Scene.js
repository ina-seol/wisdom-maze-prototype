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

    super("MAP01");

  }


  preload() {

    const urls =
      window
        .WISDOM_PROFILE
        ?.spriteUrls;


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

    this.interactables = [];

    this.inputLocked = true;


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


    this.drawClassroom();

    this.createPlayer();

    this.createInput();

    this.updateHUD();


    this.time.delayedCall(
      250,
      async () => {

        if (!this.state.introDone) {

          await this.playIntro();

        }

        this.inputLocked = false;
      }
    );
  }


  drawClassroom() {

    const graphics =
      this.add.graphics();


    /* 바닥 */

    for (
      let y = 0;
      y < 576;
      y += 32
    ) {

      for (
        let x = 0;
        x < 768;
        x += 32
      ) {

        graphics.fillStyle(
          ((x + y) / 32) % 2
            ? 0x9b744e
            : 0xa78159
        );

        graphics.fillRect(
          x,
          y,
          32,
          32
        );
      }
    }


    /* 벽 */

    this.wall(
      384,
      15,
      768,
      30
    );

    this.wall(
      15,
      288,
      30,
      576
    );

    this.wall(
      753,
      288,
      30,
      576
    );

    this.wall(
      384,
      561,
      768,
      30
    );


    /* 칠판 */

    this.object(
      "blackboard",
      "칠판",
      170,
      62,
      210,
      55,
      0x274f3c,
      "blackboard",
      true
    );


    /* 시계 */

    this.object(
      "clock",
      "시계",
      490,
      62,
      48,
      48,
      0xd8ca8c,
      "clock"
    );


    /* 창문 */

    this.object(
      "window",
      "창문",
      52,
      160,
      60,
      130,
      0x72bce0,
      "window"
    );


    /* 출구 */

    this.object(
      "exit",
      "출구",
      680,
      68,
      65,
      88,
      0x43301f,
      "door",
      true
    );


    /* 교사용 책상 */

    this.furniture(
      400,
      145,
      160,
      55,
      0x704f36
    );


    const desks = [

      [180, 235],
      [320, 235],
      [460, 235],
      [600, 235],

      [180, 330],
      [320, 330],
      [460, 330],
      [600, 330]
    ];


    desks.forEach(
      ([x, y], index) => {

        const target =
          index === 6;

        this.object(
          `desk_${index}`,
          target
            ? "붉은 공책이 놓인 책상"
            : "책상",
          x,
          y,
          75,
          42,
          target
            ? 0x8c5945
            : 0x745239,
          "desk",
          true,
          {
            targetDesk: target
          }
        );
      }
    );


    /* 의자 */

    this.object(
      "chair",
      "의자",
      250,
      395,
      38,
      38,
      0x625044,
      "chair"
    );


    /* 책 */

    this.object(
      "book",
      "책",
      260,
      118,
      34,
      24,
      0x7a2942,
      "book"
    );


    /* 가방 */

    this.object(
      "bag",
      "가방",
      330,
      120,
      42,
      35,
      0x324d73,
      "bag"
    );


    /* 밀 수 있는 책상 */

    this.pushDesk =
      this.object(

        "push_desk",
        "무거운 책상",

        455,
        430 +
          this.state.pushSteps * 32,

        82,
        44,

        0x68472f,

        "pushDesk",

        true
      );


    /* 사물함 */

    this.object(
      "locker_a",
      "왼쪽 사물함",
      95,
      475,
      48,
      85,
      0x5e6876,
      "lockerA",
      true
    );


    this.object(
      "locker_b",
      "가운데 사물함",
      150,
      475,
      48,
      85,
      0x697585,
      "lockerB",
      true
    );


    this.object(
      "locker_c",
      "오른쪽 사물함",
      205,
      475,
      48,
      85,
      0x5e6876,
      "lockerC",
      true
    );


    /* 상자 */

    this.object(
      "red_box",
      "붉은 상자",
      520,
      475,
      60,
      50,
      0xa33d35,
      "box",
      true,
      {
        color: "red"
      }
    );


    this.object(
      "old_box",
      "낡은 상자",
      605,
      475,
      60,
      50,
      0x72563a,
      "box",
      true,
      {
        color: "old"
      }
    );


    this.object(
      "blue_box",
      "푸른 상자",
      690,
      475,
      60,
      50,
      0x31558b,
      "box",
      true,
      {
        color: "blue"
      }
    );
  }


  wall(x, y, w, h) {

    const object =
      this.add.rectangle(
        x,
        y,
        w,
        h,
        0x3b3340
      );

    this.physics.add.existing(
      object,
      true
    );

    this.collideLater(object);
  }


  furniture(
    x,
    y,
    w,
    h,
    color
  ) {

    const object =
      this.add.rectangle(
        x,
        y,
        w,
        h,
        color
      );

    object.setStrokeStyle(
      3,
      0x332419
    );

    this.physics.add.existing(
      object,
      true
    );

    this.collideLater(object);

    return object;
  }


  object(
    id,
    label,
    x,
    y,
    w,
    h,
    color,
    tag,
    collision = false,
    extra = {}
  ) {

    const visual =
      this.add.rectangle(
        x,
        y,
        w,
        h,
        color
      );

    visual.setStrokeStyle(
      3,
      0x251d26
    );


    this.add.text(
      x,
      y,
      label,
      {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#fff6d5",
        backgroundColor:
          "rgba(20,20,35,.65)",
        padding: {
          x: 4,
          y: 2
        }
      }
    )
    .setOrigin(0.5);


    if (collision) {

      this.physics.add.existing(
        visual,
        true
      );

      this.collideLater(
        visual
      );
    }


    const item = {

      id,
      label,
      x,
      y,
      tag,
      visual,

      ...extra
    };


    this.interactables.push(
      item
    );


    return item;
  }


  collideLater(object) {

    if (!this.pendingColliders) {

      this.pendingColliders = [];
    }

    this.pendingColliders.push(
      object
    );
  }


  createPlayer() {

    const hasSprites =
      this.textures.exists(
        "mage_front"
      );


    if (hasSprites) {

      this.player =
        this.physics.add.image(
          375,
          290,
          "mage_front"
        );

      this.player.setDisplaySize(
        48,
        78
      );

      this.player.body.setSize(
        24,
        30
      );

    } else {

      this.player =
        this.add.rectangle(
          375,
          290,
          28,
          45,
          this.profile.gender ===
            "female"
            ? 0x2c8451
            : 0x374aa8
        );

      this.physics.add.existing(
        this.player
      );
    }


    this.player.body.setCollideWorldBounds(
      true
    );


    for (
      const obstacle of
      this.pendingColliders || []
    ) {

      this.physics.add.collider(
        this.player,
        obstacle
      );
    }


    this.hasMageSprites =
      hasSprites;
  }


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

    if (
      !this.player ||
      this.inputLocked
    ) {

      if (this.player?.body) {

        this.player.body.setVelocity(
          0,
          0
        );
      }

      return;
    }


    const speed = 145;

    let vx = 0;
    let vy = 0;


    if (
      this.cursors.left.isDown ||
      this.keys.A.isDown
    ) {
      vx = -speed;
    }

    else if (
      this.cursors.right.isDown ||
      this.keys.D.isDown
    ) {
      vx = speed;
    }


    if (
      this.cursors.up.isDown ||
      this.keys.W.isDown
    ) {
      vy = -speed;
    }

    else if (
      this.cursors.down.isDown ||
      this.keys.S.isDown
    ) {
      vy = speed;
    }


    if (vx && vy) {

      vx *= 0.707;
      vy *= 0.707;
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
        .JustDown(this.keys.E) ||

      Phaser.Input.Keyboard
        .JustDown(this.keys.ENTER) ||

      Phaser.Input.Keyboard
        .JustDown(this.keys.SPACE)
    ) {

      this.interact();
    }
  }


  updateDirection(vx, vy) {

    if (!this.hasMageSprites) {
      return;
    }


    if (Math.abs(vx) >
        Math.abs(vy)) {

      this.player
        .setTexture("mage_side")
        .setFlipX(vx < 0);

    } else if (vy < 0) {

      this.player
        .setTexture("mage_back")
        .setFlipX(false);

    } else if (vy > 0) {

      this.player
        .setTexture("mage_front")
        .setFlipX(false);
    }
  }


  async playIntro() {

    this.inputLocked = true;


    await GameUI.say([

      "…일어나 봐.",

      "루미: 큰일이야! 언어 수정이 산산조각 나면서 책 속 세계로 떨어진 것 같아.",

      "여기는 교실인 것 같은데… 출입문이 봉인되어 있어.",

      "루미: 이곳에 흩어진 세 개의 '말의 조각'을 찾아야 해.",

      "주변의 물건을 조사해 보자."
    ]);


    this.state.introDone = true;

    this.state.phase = "p1";

    this.save();

    this.updateHUD();
  }


  nearestObject() {

    let nearest = null;
    let best = 70;


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


      if (distance < best) {

        best = distance;

        nearest = object;
      }
    }

    return nearest;
  }


  async interact() {

    const object =
      this.nearestObject();

    if (!object) {

      await GameUI.say(
        "주변에는 특별한 것이 없다."
      );

      return;
    }


    this.inputLocked = true;

    this.player.body.setVelocity(
      0,
      0
    );


    try {

      await this.handleObject(
        object
      );

    } finally {

      this.inputLocked = false;
    }
  }


  async handleObject(object) {

    /*
      Puzzle 1이 활성화되어 있다면
      실제 맵 오브젝트가 정답이 된다.
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

      } else if (
        object.id !==
        "blackboard"
      ) {

        this.wrong("p1");

        await GameUI.say(
          "아무 일도 일어나지 않았다."
        );

        return;
      }
    }


    /*
      Final Puzzle
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


    switch (object.id) {

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


      case "locker_c":

        await GameUI.say(
          "텅 비어 있다."
        );

        break;


      case "locker_b":

        await this.middleLocker();

        break;


      case "exit":

        await this.exitDoor();

        break;


      default:

        if (
          object.targetDesk
        ) {

          await this.targetDesk();

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


        await GameUI.say(
          `${object.label}을(를) 살펴봤지만 특별한 것은 없다.`
        );
    }
  }


  async blackboard() {

    if (
      this.state.phase !==
      "p1"
    ) {

      await GameUI.say(
        "칠판의 글씨는 이미 사라졌다."
      );

      return;
    }


    this.state.p1Started = true;
    this.state.phase =
      "p1_active";

    this.state.questionsShown++;

    this.save();


    await GameUI.english(

      "칠판의 영어 단어가 가리키는 물건을 교실에서 찾아 조사해 보자.",

      this.state
        .p1Target
        .toUpperCase()
    );


    this.updateHUD();
  }


  async solveP1() {

    this.correct("p1");

    this.state.p1Solved = true;

    this.state.shards = 1;

    this.state.phase = "p2";

    this.save();


    await GameUI.say([

      "정답이다!",

      "첫 번째 말의 조각을 발견했다.",

      "교실 뒤쪽에서 무거운 책상이 움직이는 소리가 들린다."
    ]);


    this.state.questionsShown++;

    this.save();


    await GameUI.english(

      "새로운 문장이 나타났다. 문장을 읽고 알맞은 장소를 찾아보자.",

      this.p2Sentence
    );


    this.updateHUD();
  }


  async pushHeavyDesk() {

    if (
      this.state.phase !==
        "p2" &&
      this.state.pushSteps < 2
    ) {

      await GameUI.say(
        "무거운 책상이다."
      );

      return;
    }


    if (
      this.state.pushSteps >= 2
    ) {

      await GameUI.say(
        "책상을 충분히 옮겼다."
      );

      return;
    }


    this.state.pushSteps++;


    this.pushDesk.y += 32;

    this.pushDesk.visual.y += 32;


    if (
      this.pushDesk.visual.body
    ) {

      this.pushDesk.visual.body
        .updateFromGameObject();
    }


    this.save();


    if (
      this.state.pushSteps === 2
    ) {

      await GameUI.say(
        "통로가 열렸다!"
      );

    } else {

      await GameUI.say(
        "책상이 한 칸 밀렸다."
      );
    }
  }


  async targetDesk() {

    if (
      this.state.phase !== "p2"
    ) {

      await GameUI.say(
        "붉은 공책이 놓여 있다."
      );

      return;
    }


    if (
      this.state.pushSteps < 2
    ) {

      await GameUI.say(
        "앞의 무거운 책상이 길을 막고 있다."
      );

      return;
    }


    this.correct("p2");

    this.state.p2Solved = true;
    this.state.lockerKey = true;
    this.state.phase = "locker";

    this.save();


    await GameUI.say([

      "책상 아래에서 작은 열쇠를 발견했다.",

      "낡은 사물함 열쇠를 얻었다."
    ]);


    this.updateHUD();
  }


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


    if (!this.state.lockerKey) {

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


    this.correct("p3");

    this.state.p3Solved = true;

    this.state.shards = 2;

    this.state.phase = "box";

    this.save();


    await GameUI.say(
      "두 번째 말의 조각을 발견했다!"
    );


    const colorNames = {

      red: "red",
      blue: "blue",
      old: "old"
    };


    const clue =
      `The key is behind the ${
        colorNames[
          this.state
            .boxTargetColor
        ]
      } box.`;


    this.state.questionsShown++;

    this.save();


    await GameUI.english(

      "상자 뒤에 무언가 숨겨져 있다. 문장을 읽고 알맞은 상자를 조사해 보자.",

      clue
    );


    this.updateHUD();
  }


  async boxPuzzle(object) {

    if (
      object.color !==
      this.state.boxTargetColor
    ) {

      this.wrong("p4");

      await GameUI.say(
        "상자 뒤에는 아무것도 없다."
      );

      return;
    }


    this.correct("p4");

    this.state.p4Solved = true;

    this.state.shards = 3;

    this.state.phase =
      "final_ready";

    this.save();


    await GameUI.say([

      "상자 뒤에서 작은 버튼을 발견했다.",

      "딸깍!",

      "교실의 시계가 빠르게 돌아가더니 마지막 말의 조각이 나타났다.",

      "세 개의 말의 조각을 모두 찾았다!"
    ]);


    this.updateHUD();
  }


  async exitDoor() {

    /*
      P1 target이 door인 경우
    */

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
      "푸른 힘이 문을 단단히 봉인하고 있다."
    );
  }


  async startFinal() {

    this.state.phase = "final";
    this.state.finalStep = 0;

    this.save();


    this.finalSequence = [

      this.state.p1Target,

      "box",

      "desk"
    ];


    await GameUI.say(

      "루미: 마지막으로 지금까지 발견한 말을 순서대로 다시 떠올려 봐!"
    );


    await GameUI.english(

      "아래 세 단서를 순서대로 기억하고, 교실에서 해당 물건을 조사하자.",

      `${this.state.p1Target.toUpperCase()}
→ Open the box.
→ ${this.p2Sentence}`
    );


    this.updateHUD();
  }


  async handleFinalObject(
    object
  ) {

    if (!this.finalSequence) {

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
      object.tag !== expected
    ) {

      this.wrong("final");

      await GameUI.say(
        "문양이 잠깐 흔들렸다. 지금까지 맞힌 것은 그대로 유지된다."
      );

      return;
    }


    this.state.finalStep++;

    this.save();


    await GameUI.say(

      `문양 ${
        this.state.finalStep
      } / 3이 빛났다.`
    );


    if (
      this.state.finalStep >= 3
    ) {

      this.state.finalSolved = true;

      this.state.phase = "exit";

      this.save();


      await GameUI.say([

        "세 개의 문양이 모두 빛난다.",

        "교실의 봉인이 완전히 풀렸다!",

        "출구로 나가자."
      ]);
    }


    this.updateHUD();
  }


  async completeMap() {

    if (this.state.completed) {
      return;
    }


    this.state.completed = true;

    this.save();


    const seconds =
      Math.round(
        (
          Date.now() -
          this.state
            .sessionStartedAt
        ) / 1000
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


    this.inputLocked = true;


    await GameUI.say([

      "교실 문 너머에서 눈부신 빛이 쏟아진다.",

      "루미: 해냈어! 그런데 수정은 모두 열두 조각이야.",

      "캐릭터: 그럼 전부 되찾으면 되는 거지?",

      "루미: 응. 우리의 모험은 이제 시작이야!"
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


  correct(id) {

    if (
      !this.state.mistakes[id]
    ) {

      this.state.firstTryCorrect++;
    }
  }


  wrong(id) {

    this.state.wrongAttempts++;

    this.state.mistakes[id] =
      (this.state.mistakes[id] || 0) +
      1;

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

    const shardText = [

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


    document.querySelector(
      "#hud-shards"
    ).textContent =
      shardText;


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
          "책상을 밀고 영어 단서가 가리키는 곳을 찾아보자.";

        break;


      case "locker":

        objective =
          "열쇠에 맞는 사물함을 찾아보자.";

        break;


      case "box":

        objective =
          "영어 단서를 읽고 올바른 상자를 찾아보자.";

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
    }


    document.querySelector(
      "#hud-objective"
    ).textContent =
      objective;
  }
}
