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
    const base = import.meta.env.BASE_URL;

    this.load.image(
      "map02",
      `${base}assets/maps/map02.png`
    );

    const sprites = window.WISDOM_PROFILE?.spriteUrls;

    if (sprites?.front) {
      this.load.image("mage_front", sprites.front);
    }

    if (sprites?.back) {
      this.load.image("mage_back", sprites.back);
    }

    if (sprites?.left) {
      this.load.image("mage_left", sprites.left);
    }

    if (sprites?.right) {
      this.load.image("mage_right", sprites.right);
    }
  }

  create() {
    this.profile = window.WISDOM_PROFILE;
    this.content = getMapContent(MAP_ID);

    this.state =
      loadMapProgress(MAP_ID, this.profile.name) ||
      newMapState(MAP_ID);

    this.prepareState();

    this.inputLocked = true;
    this.obstacles = [];
    this.interactables = [];

    this.add
      .image(384, 288, "map02")
      .setDisplaySize(768, 576)
      .setDepth(-100);

    this.physics.world.setBounds(0, 0, 768, 576);

    this.createCollisions();
    this.createInteractables();
    this.createGuides();
    this.createPlayer();
    this.createInput();
    this.updateHUD();

    this.time.delayedCall(250, async () => {
      if (!this.state.introDone) {
        await this.playIntro();
      }
      this.inputLocked = false;
    });
  }

  prepareState() {
    const phases = [
      "bookshelf",
      "table",
      "clock",
      "circle",
      "cabinet",
      "exit"
    ];

    if (!phases.includes(this.state.phase)) {
      this.state.phase = "bookshelf";
    }

    this.state.shards ??= 0;
    this.state.usedWords ??= [];
    this.state.usedExpressions ??= [];
    this.state.mistakes ??= {};
    this.state.questionsShown ??= 0;
    this.state.firstTryCorrect ??= 0;
    this.state.wrongAttempts ??= 0;
    this.state.hintsUsed ??= 0;
    this.state.completed ??= false;
    this.state.sessionStartedAt ??= Date.now();
    this.state.introDone ??= false;
  }

  createCollisions() {
    // 외벽
    this.wall(384, 8, 768, 16);
    this.wall(8, 288, 16, 576);
    this.wall(760, 288, 16, 576);
    this.wall(384, 568, 768, 16);

    // 상단 왼쪽 큰 책장/보랏빛 책장
    this.wall(214, 95, 110, 72);

    // 상단 시계
    this.wall(430, 95, 60, 70);

    // 상단 오른쪽 책상
    this.wall(555, 102, 92, 46);

    // 중앙 가로 책장
    this.wall(393, 172, 180, 46);

    // 왼쪽 중앙 책장 묶음
    this.wall(180, 208, 105, 78);

    // 오른쪽 중앙 책장 기둥 1
    this.wall(560, 212, 66, 100);

    // 오른쪽 중앙 책장 기둥 2
    this.wall(642, 262, 82, 60);

    // 중앙 테이블
    this.wall(386, 346, 170, 84);

    // 하단 중앙 좌우 책장
    this.wall(299, 464, 92, 54);
    this.wall(475, 464, 92, 54);

    // 오른쪽 아래 마법진 주변 진열물
    this.wall(666, 472, 110, 72);

    // 오른쪽 잠긴 캐비닛
    this.wall(703, 227, 74, 60);

    // 기둥들
    this.wall(260, 352, 40, 110);
    this.wall(558, 352, 40, 110);

    // 좌하단 책상
    this.wall(120, 468, 98, 62);

    // 좌측 벽면 책장 일부
    this.wall(88, 266, 56, 120);
  }

  wall(x, y, width, height) {
    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    this.obstacles.push(zone);
  }

  createInteractables() {
    this.addInteractable({
      id: "bookshelf",
      label: "빛나는 책장",
      x: 214,
      y: 95,
      radius: 95
    });

    this.addInteractable({
      id: "table",
      label: "중앙 테이블",
      x: 386,
      y: 346,
      radius: 105
    });

    this.addInteractable({
      id: "clock",
      label: "큰 시계",
      x: 430,
      y: 95,
      radius: 88
    });

    this.addInteractable({
      id: "magic_circle",
      label: "보라 마법진",
      x: 658,
      y: 476,
      radius: 90
    });

    this.addInteractable({
      id: "cabinet",
      label: "잠긴 캐비닛",
      x: 703,
      y: 227,
      radius: 80
    });

    this.addInteractable({
      id: "exit",
      label: "봉인된 문",
      x: 643,
      y: 56,
      radius: 96
    });
  }

  addInteractable(data) {
    this.interactables.push(data);
  }

  createGuides() {
    this.guide = this.add
      .circle(214, 95, 20, 0xffe36a, 0.18)
      .setStrokeStyle(4, 0xffe36a, 1)
      .setDepth(40);

    this.tweens.add({
      targets: this.guide,
      alpha: { from: 0.25, to: 1 },
      duration: 650,
      yoyo: true,
      repeat: -1
    });

    this.prompt = this.add
      .text(384, 535, "", {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#fff2a8",
        backgroundColor: "#10182bcc",
        padding: { x: 10, y: 6 }
      })
      .setOrigin(0.5)
      .setDepth(500)
      .setVisible(false);

    this.updateGuidePosition();
  }

  updateGuidePosition() {
    const guideMap = {
      bookshelf: { x: 214, y: 95 },
      table: { x: 386, y: 346 },
      clock: { x: 430, y: 95 },
      circle: { x: 658, y: 476 },
      cabinet: { x: 703, y: 227 },
      exit: { x: 643, y: 56 }
    };

    const pos = guideMap[this.state.phase];

    if (!pos) {
      this.guide.setVisible(false);
      return;
    }

    this.guide.setVisible(true);
    this.guide.setPosition(pos.x, pos.y);
  }

  createPlayer() {
    if (this.textures.exists("mage_front")) {
      this.player = this.physics.add.image(384, 540, "mage_front");

      const targetHeight = 64;
      const ratio = this.player.width / this.player.height;

      this.player.setDisplaySize(
        targetHeight * ratio,
        targetHeight
      );
    } else {
      this.player = this.add.rectangle(384, 540, 26, 40, 0x386ed0);
      this.physics.add.existing(this.player);
    }

    this.player.setDepth(100);
    this.player.body.setSize(20, 20);
    this.player.body.setCollideWorldBounds(true);

    for (const obstacle of this.obstacles) {
      this.physics.add.collider(this.player, obstacle);
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
      interact: "E",
      enter: "ENTER"
    });
  }

  update() {
    if (!this.player?.body) return;

    if (this.inputLocked) {
      this.player.body.setVelocity(0, 0);
      this.prompt?.setVisible(false);
      return;
    }

    const speed = 145;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.keys.left.isDown) {
      vx = -speed;
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      vx = speed;
    }

    if (this.cursors.up.isDown || this.keys.up.isDown) {
      vy = -speed;
    } else if (this.cursors.down.isDown || this.keys.down.isDown) {
      vy = speed;
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.body.setVelocity(vx, vy);
    this.updateDirection(vx, vy);
    this.updatePrompt();

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.interact) ||
      Phaser.Input.Keyboard.JustDown(this.keys.enter)
    ) {
      this.interact();
    }
  }

  updateDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx < 0 && this.textures.exists("mage_left")) {
        this.player.setTexture("mage_left");
      } else if (vx > 0 && this.textures.exists("mage_right")) {
        this.player.setTexture("mage_right");
      }
      return;
    }

    if (vy < 0 && this.textures.exists("mage_back")) {
      this.player.setTexture("mage_back");
    } else if (vy > 0 && this.textures.exists("mage_front")) {
      this.player.setTexture("mage_front");
    }
  }

  nearestObject() {
    let result = null;
    let best = Infinity;

    for (const object of this.interactables) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        object.x,
        object.y
      );

      if (distance <= object.radius && distance < best) {
        result = object;
        best = distance;
      }
    }

    return result;
  }

  updatePrompt() {
    const object = this.nearestObject();

    if (!object) {
      this.prompt.setVisible(false);
      return;
    }

    this.prompt
      .setText(`[E] ${object.label} 조사`)
      .setVisible(true);
  }

  async interact() {
    if (this.inputLocked) return;

    const object = this.nearestObject();
    if (!object) return;

    this.inputLocked = true;
    this.player.body.setVelocity(0, 0);

    try {
      if (object.id === "bookshelf") {
        await this.bookshelf();
      } else if (object.id === "table") {
        await this.table();
      } else if (object.id === "clock") {
        await this.clock();
      } else if (object.id === "magic_circle") {
        await this.magicCircle();
      } else if (object.id === "cabinet") {
        await this.cabinet();
      } else if (object.id === "exit") {
        await this.exitDoor();
      }
    } finally {
      this.inputLocked = false;
      this.updateGuidePosition();
    }
  }

  async playIntro() {
    await GameUI.say([
      "루미: 여긴 속삭이는 도서관이야.",
      "루미: 오래된 책들 사이에 언어 수정의 조각이 숨어 있어.",
      "나: 어디부터 조사하면 돼?",
      "루미: 먼저 위쪽의 빛나는 책장을 조사해 보자!"
    ]);

    this.state.introDone = true;
    this.state.phase = "bookshelf";
    this.save();
  }

  async bookshelf() {
    if (this.state.phase !== "bookshelf") {
      await this.hint();
      return;
    }

    const quiz = QuizEngine.wordToKorean(
      this.content.words,
      this.state.usedWords
    );

    if (!quiz) {
      await GameUI.say(
        "루미: MAP02 단어 데이터가 부족해. 교사용 페이지에서 단어와 뜻을 넣어 줘."
      );
      return;
    }

    this.state.questionsShown++;

    const success = await GameUI.choice(
      quiz.question,
      quiz.options,
      quiz.correctIndex
    );

    if (!success) {
      this.wrong("bookshelf");
      await GameUI.say("루미: 책장의 속삭임을 잘 들어 봐!");
      return;
    }

    this.rememberWord(quiz.itemKey);
    this.correct("bookshelf");
    this.state.shards = 1;
    this.state.phase = "table";
    this.save();

    await GameUI.say([
      "루미: 좋아! 첫 번째 말의 조각이 나타났어.",
      "나: 다음은 어디지?",
      "루미: 중앙 테이블을 조사해 보자!"
    ]);
  }

  async table() {
    if (this.state.phase !== "table") {
      await this.hint();
      return;
    }

    const quiz = QuizEngine.expressionToKorean(
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

    const success = await GameUI.choice(
      quiz.question,
      quiz.options,
      quiz.correctIndex
    );

    if (!success) {
      this.wrong("table");
      await GameUI.say("루미: 표현 전체의 뜻을 다시 생각해 봐!");
      return;
    }

    this.rememberExpression(quiz.itemKey);
    this.correct("table");
    this.state.shards = 2;
    this.state.phase = "clock";
    this.save();

    await GameUI.say([
      "루미: 두 번째 말의 조각이야!",
      "루미: 이제 위쪽 큰 시계를 조사해 봐."
    ]);
  }

  async clock() {
    if (this.state.phase !== "clock") {
      await this.hint();
      return;
    }

    const expression = QuizEngine.pickExpression(
      this.content.expressions,
      this.state.usedExpressions
    );

    if (!expression) {
      await GameUI.say(
        "루미: 문장 배열 문제를 만들 영어 표현이 부족해."
      );
      return;
    }

    this.state.questionsShown++;

    await GameUI.say(
      `루미: "${expression.korean}"라는 뜻이 되도록 문장을 만들어 봐!`
    );

    const success = await GameUI.wordOrder(
      expression.english
    );

    if (!success) {
      this.wrong("clock");
      return;
    }

    this.rememberExpression(expression.english);
    this.correct("clock");
    this.state.phase = "circle";
    this.save();

    await GameUI.say([
      "뎅— 시계가 울리며 도서관 바닥의 마법진이 빛나기 시작했다.",
      "루미: 오른쪽 아래의 보라 마법진으로 가자!"
    ]);
  }

  async magicCircle() {
    if (this.state.phase !== "circle") {
      await this.hint();
      return;
    }

    const quiz = QuizEngine.randomReview(
      this.content,
      this.state.usedWords,
      this.state.usedExpressions
    );

    if (!quiz) {
      await GameUI.say(
        "루미: 복습 문제를 만들 학습 데이터가 부족해."
      );
      return;
    }

    this.state.questionsShown++;

    const success = await GameUI.choice(
      `마법진의 복습 문제!\n${quiz.question}`,
      quiz.options,
      quiz.correctIndex
    );

    if (!success) {
      this.wrong("circle");
      await GameUI.say(
        "루미: 마법진이 아직 반응하지 않아. 다시 해 보자!"
      );
      return;
    }

    this.correct("circle");
    this.state.phase = "cabinet";
    this.save();

    await GameUI.say([
      "마법진의 빛이 오른쪽 캐비닛으로 흘러 들어갔다.",
      "루미: 좋아! 잠긴 캐비닛이 열릴 것 같아."
    ]);
  }

  async cabinet() {
    if (this.state.phase !== "cabinet") {
      await this.hint();
      return;
    }

    this.state.shards = 3;
    this.state.phase = "exit";
    this.save();

    await GameUI.say([
      "캐비닛 안에서 세 번째 말의 조각을 발견했다!",
      "나: 이제 다 모았어.",
      "루미: 오른쪽 위 봉인된 문으로 가자!"
    ]);
  }

  async exitDoor() {
    if (this.state.phase !== "exit") {
      await this.hint();
      return;
    }

    await this.completeMap();
  }

  async hint() {
    this.state.hintsUsed++;
    this.save();

    const hints = {
      bookshelf: "루미: 위쪽의 빛나는 책장을 조사해 봐!",
      table: "루미: 가운데 큰 테이블을 조사해 보자!",
      clock: "루미: 위쪽 큰 시계로 가 보자!",
      circle: "루미: 오른쪽 아래 보라 마법진을 조사해 봐!",
      cabinet: "루미: 오른쪽의 잠긴 캐비닛을 조사해!",
      exit: "루미: 오른쪽 위 봉인된 문으로 가자!"
    };

    await GameUI.say(
      hints[this.state.phase] || "루미: 주변을 잘 살펴보자!"
    );
  }

  rememberWord(english) {
    if (!this.state.usedWords.includes(english)) {
      this.state.usedWords.push(english);
    }
  }

  rememberExpression(english) {
    if (!this.state.usedExpressions.includes(english)) {
      this.state.usedExpressions.push(english);
    }
  }

  correct(id) {
    if (!this.state.mistakes[id]) {
      this.state.firstTryCorrect++;
    }
  }

  wrong(id) {
    this.state.wrongAttempts++;
    this.state.mistakes[id] =
      (this.state.mistakes[id] || 0) + 1;
    this.save();
  }

  async completeMap() {
    if (this.state.completed) {
      return;
    }

    this.state.completed = true;

    const seconds = Math.max(
      1,
      Math.floor(
        (Date.now() - this.state.sessionStartedAt) / 1000
      )
    );

    this.save();

    saveRecord({
      mapId: MAP_ID,
      studentName: this.profile.name,
      character: this.profile.gender,
      completed: true,
      playTime: seconds,
      questionsShown: this.state.questionsShown,
      firstTryCorrect: this.state.firstTryCorrect,
      wrongAttempts: this.state.wrongAttempts,
      hintsUsed: this.state.hintsUsed,
      completedAt: new Date().toISOString()
    });

    const nextMap = getNextMapId(MAP_ID);

    if (nextMap) {
      setCurrentMap(nextMap);
      this.profile.currentMap = nextMap;
      saveProfile(this.profile);
    }

    await GameUI.say([
      "봉인된 문이 천천히 열렸다.",
      "루미: 도서관의 언어 수정도 복원됐어!",
      nextMap
        ? `루미: 다음 목적지는 ${nextMap}이야!`
        : "루미: 모든 모험을 마쳤어!"
    ]);

    if (nextMap && window.WisdomGame?.hasMap(nextMap)) {
      window.WisdomGame.startMap(nextMap);
      return;
    }

    await GameUI.finish({
      mapId: MAP_ID,
      name: this.profile.name,
      seconds,
      firstTry: this.state.firstTryCorrect,
      wrong: this.state.wrongAttempts
    });
  }

  save() {
    saveMapProgress(
      MAP_ID,
      this.profile.name,
      this.state
    );

    this.updateHUD();
    this.updateGuidePosition();
  }

  updateHUD() {
    const shards = document.querySelector("#hud-shards");

    if (shards) {
      shards.textContent = [
        this.state.shards >= 1 ? "◆" : "◇",
        this.state.shards >= 2 ? "◆" : "◇",
        this.state.shards >= 3 ? "◆" : "◇"
      ].join(" ");
    }

    const objective = document.querySelector("#hud-objective");
    if (!objective) return;

    const objectives = {
      bookshelf: "빛나는 책장의 단어 문제를 풀자.",
      table: "중앙 테이블의 표현 문제를 풀자.",
      clock: "큰 시계의 문장 배열 문제를 풀자.",
      circle: "보라 마법진의 복습 문제를 풀자.",
      cabinet: "오른쪽 잠긴 캐비닛을 조사하자.",
      exit: "오른쪽 위 봉인된 문으로 나가자."
    };

    objective.textContent =
      objectives[this.state.phase] || "도서관을 탐험하자.";
  }
}
