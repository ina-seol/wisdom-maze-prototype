import Phaser from "phaser";

import "./style.css";


/* =====================================================
   MAP SCENES
===================================================== */

import Map01Scene from "./game/Map01Scene.js";
import Map02Scene from "./game/Map02Scene.js";
import Map03Scene from "./game/Map03Scene.js";
import Map04Scene from "./game/Map04Scene.js";
import Map05Scene from "./game/Map05Scene.js";
import Map06Scene from "./game/Map06Scene.js";
import Map07Scene from "./game/Map07Scene.js";
import Map08Scene from "./game/Map08Scene.js";
import Map09Scene from "./game/Map09Scene.js";
import Map10Scene from "./game/Map10Scene.js";
import Map11Scene from "./game/Map11Scene.js";
import Map12Scene from "./game/Map12Scene.js";


/* =====================================================
   DATA
===================================================== */

import {
  saveProfile,
  getProfile,
  clearAllProgress,
  getCurrentMap,
  shuffle
} from "./data.js";


/* =====================================================
   ALL GAME SCENES
===================================================== */

const GAME_SCENES = [
  Map01Scene,
  Map02Scene,
  Map03Scene,
  Map04Scene,
  Map05Scene,
  Map06Scene,
  Map07Scene,
  Map08Scene,
  Map09Scene,
  Map10Scene,
  Map11Scene,
  Map12Scene
];


/* =====================================================
   BASE PATH
===================================================== */

const base =
  import.meta.env.BASE_URL;


/* =====================================================
   DOM
===================================================== */

const titleScreen =
  document.querySelector(
    "#title-screen"
  );


const titleBg =
  document.querySelector(
    ".title-bg"
  );


const gameScreen =
  document.querySelector(
    "#game-screen"
  );


const setupModal =
  document.querySelector(
    "#setup-modal"
  );


const modal =
  document.querySelector(
    "#modal"
  );


const modalBody =
  document.querySelector(
    "#modal-body"
  );


const startBtn =
  document.querySelector(
    "#start-btn"
  );


const continueBtn =
  document.querySelector(
    "#continue-btn"
  );


const adminBtn =
  document.querySelector(
    "#admin-btn"
  );


const musicBtn =
  document.querySelector(
    "#music-btn"
  );


const beginBtn =
  document.querySelector(
    "#begin-btn"
  );


const cancelBtn =
  document.querySelector(
    "#setup-cancel"
  );


const studentNameInput =
  document.querySelector(
    "#student-name"
  );


const hudName =
  document.querySelector(
    "#hud-name"
  );


const bgm =
  document.querySelector(
    "#bgm"
  );


const malePreview =
  document.querySelector(
    "#male-preview"
  );


const femalePreview =
  document.querySelector(
    "#female-preview"
  );


/* =====================================================
   ASSETS
===================================================== */

const ASSETS = {

  malePortrait:
    `${base}assets/portraits/male_portrait.png`,

  femalePortrait:
    `${base}assets/portraits/female_portrait.png`,

  lumiPortrait:
    `${base}assets/portraits/lumi_portrait.png`,

  bossPortrait:
    `${base}assets/portraits/boss_portrait.png`,

  maleSprite:
    `${base}assets/male.png`,

  femaleSprite:
    `${base}assets/female.png`

};


/* =====================================================
   TITLE IMAGE
===================================================== */

if (
  titleBg
) {

  titleBg.style.backgroundImage =
    `url("${base}assets/title.png")`;

}


/* =====================================================
   CHARACTER PREVIEW
===================================================== */

if (
  malePreview
) {

  malePreview.src =
    ASSETS.malePortrait;

}


if (
  femalePreview
) {

  femalePreview.src =
    ASSETS.femalePortrait;

}


/* =====================================================
   MUSIC
===================================================== */

if (
  bgm
) {

  bgm.src =
    `${base}assets/theme.mp3`;


  bgm.volume =
    0.45;

}


musicBtn
  ?.addEventListener(
    "click",
    async () => {

      if (
        !bgm
      ) {

        return;

      }


      if (
        bgm.paused
      ) {

        try {

          await bgm.play();


          musicBtn.textContent =
            "음악 끄기";

        }

        catch (error) {

          console.error(
            "음악 재생 실패:",
            error
          );

        }

      }

      else {

        bgm.pause();


        musicBtn.textContent =
          "음악 켜기";

      }

    }
  );


/* =====================================================
   CHARACTER SELECT
===================================================== */

let selectedGender =
  "male";


const characterCards =
  document.querySelectorAll(
    ".character-card"
  );


characterCards.forEach(
  card => {

    card.addEventListener(
      "click",
      () => {

        characterCards.forEach(
          item => {

            item.classList.remove(
              "selected"
            );

          }
        );


        card.classList.add(
          "selected"
        );


        selectedGender =
          card.dataset.gender
          ||
          "male";

      }
    );

  }
);


/* =====================================================
   NEW GAME
===================================================== */

startBtn
  ?.addEventListener(
    "click",
    () => {

      selectedGender =
        "male";


      characterCards.forEach(
        card => {

          card.classList.toggle(
            "selected",
            card.dataset.gender ===
              "male"
          );

        }
      );


      if (
        studentNameInput
      ) {

        studentNameInput.value =
          "";

      }


      setupModal
        ?.classList
        .remove(
          "hidden"
        );


      setTimeout(
        () => {

          studentNameInput
            ?.focus();

        },
        50
      );

    }
  );


cancelBtn
  ?.addEventListener(
    "click",
    () => {

      setupModal
        ?.classList
        .add(
          "hidden"
        );

    }
  );


beginBtn
  ?.addEventListener(
    "click",
    async () => {

      const name =
        studentNameInput
          ?.value
          .trim();


      if (
        !name
      ) {

        alert(
          "이름을 입력해 주세요."
        );


        studentNameInput
          ?.focus();


        return;

      }


      const profile = {

        name,

        gender:
          selectedGender,

        currentMap:
          "MAP01"

      };


      /*
        같은 이름으로 새 게임 시작 시
        기존 맵 진행도 초기화
      */

      clearAllProgress(
        name
      );


      saveProfile(
        profile
      );


      setupModal
        ?.classList
        .add(
          "hidden"
        );


      await launchGame(
        profile,
        "MAP01"
      );

    }
  );


studentNameInput
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();


        beginBtn
          ?.click();

      }

    }
  );


/* =====================================================
   CONTINUE
===================================================== */

continueBtn
  ?.addEventListener(
    "click",
    async () => {

      const profile =
        getProfile();


      if (
        !profile?.name
      ) {

        alert(
          "저장된 기록이 없습니다."
        );


        return;

      }


      const mapId =
        profile.currentMap
        ||
        getCurrentMap()
        ||
        "MAP01";


      await launchGame(
        profile,
        mapId
      );

    }
  );


/* =====================================================
   ADMIN
===================================================== */

adminBtn
  ?.addEventListener(
    "click",
    () => {

      window.location.href =
        `${base}admin.html`;

    }
  );


/* =====================================================
   PHASER GAME
===================================================== */

let phaserGame =
  null;


async function launchGame(
  profile,
  startMapId = "MAP01"
) {

  /*
    이미 게임이 떠 있다면 완전히 종료
  */

  if (
    phaserGame
  ) {

    phaserGame.destroy(
      true
    );


    phaserGame =
      null;

  }


  /*
    캐릭터 방향별 이미지 준비
  */

  const spriteUrls =
    await prepareCharacterSprites(
      profile.gender
    );


  const portraitUrl =
    profile.gender ===
      "female"

      ? ASSETS.femalePortrait

      : ASSETS.malePortrait;


  /*
    모든 Scene이 사용하는 전역 프로필
  */

  window.WISDOM_PROFILE = {

    ...profile,

    currentMap:
      startMapId,

    spriteUrls,

    portraitUrl,

    bossPortraitUrl:
      ASSETS.bossPortrait

  };


  titleScreen
    ?.classList
    .add(
      "hidden"
    );


  gameScreen
    ?.classList
    .remove(
      "hidden"
    );


  if (
    hudName
  ) {

    hudName.textContent =
      profile.name;

  }


  /*
    Phaser 생성
  */

  phaserGame =
    new Phaser.Game({

      type:
        Phaser.AUTO,

      width:
        768,

      height:
        576,

      parent:
        "phaser-root",

      backgroundColor:
        "#081120",

      pixelArt:
        true,

      roundPixels:
        true,

      physics: {

        default:
          "arcade",

        arcade: {

          gravity: {
            y: 0
          },

          debug:
            false

        }

      },

      scene:
        GAME_SCENES

    });


  /*
    Phaser가 완전히 준비된 뒤
    원하는 MAP으로 이동.
  */

  phaserGame.events.once(
    Phaser.Core.Events.READY,
    () => {

      startRegisteredMap(
        startMapId
      );

    }
  );

}


/* =====================================================
   START REGISTERED MAP
===================================================== */

function startRegisteredMap(
  mapId
) {

  if (
    !phaserGame
  ) {

    return false;

  }


  if (
    phaserGame.scene.keys[
      mapId
    ]
  ) {

    phaserGame.scene.start(
      mapId
    );


    return true;

  }


  console.warn(
    `${mapId} Scene이 등록되어 있지 않습니다.`
  );


  /*
    혹시 맵 파일이 누락돼도
    MAP01로 복구
  */

  if (
    phaserGame.scene.keys.MAP01
  ) {

    phaserGame.scene.start(
      "MAP01"
    );


    return true;

  }


  return false;

}


/* =====================================================
   GLOBAL GAME CONTROL
===================================================== */

window.WisdomGame = {


  hasMap(
    mapId
  ) {

    if (
      !phaserGame
    ) {

      return false;

    }


    return Boolean(
      phaserGame.scene.keys[
        mapId
      ]
    );

  },


  startMap(
    mapId
  ) {

    if (
      !phaserGame
    ) {

      return false;

    }


    if (
      !phaserGame.scene.keys[
        mapId
      ]
    ) {

      console.warn(
        `${mapId} Scene이 없습니다.`
      );


      return false;

    }


    /*
      프로필 현재 맵 저장
    */

    const profile =
      getProfile();


    if (
      profile
    ) {

      const updatedProfile = {

        ...profile,

        currentMap:
          mapId

      };


      saveProfile(
        updatedProfile
      );

    }


    if (
      window.WISDOM_PROFILE
    ) {

      window.WISDOM_PROFILE.currentMap =
        mapId;

    }


    /*
      혹시 실행 중인 다른 Scene이 있다면 정리
    */

    for (
      const scene of
      phaserGame.scene.getScenes(
        true
      )
    ) {

      if (
        scene.scene.key !==
        mapId
      ) {

        scene.scene.stop();

      }

    }


    phaserGame.scene.start(
      mapId
    );


    return true;

  },


  goTitle() {

    if (
      phaserGame
    ) {

      phaserGame.destroy(
        true
      );


      phaserGame =
        null;

    }


    closeModal();


    gameScreen
      ?.classList
      .add(
        "hidden"
      );


    titleScreen
      ?.classList
      .remove(
        "hidden"
      );


    if (
      hudName
    ) {

      hudName.textContent =
        "";

    }

  }

};


/* =====================================================
   CHARACTER SPRITE PREPARATION
===================================================== */

async function prepareCharacterSprites(
  gender
) {

  const sourceUrl =
    gender ===
      "female"

      ? ASSETS.femaleSprite

      : ASSETS.maleSprite;


  try {

    const image =
      await loadImage(
        sourceUrl
      );


    /*
      현재 male.png / female.png는
      4방향이 가로로 붙어 있는 구조.

      FRONT | BACK | LEFT | RIGHT
    */

    const frameWidth =
      Math.floor(
        image.width / 4
      );


    const frameHeight =
      image.height;


    return {

      front:
        cropCharacter(
          image,
          0,
          0,
          frameWidth,
          frameHeight
        ),

      back:
        cropCharacter(
          image,
          frameWidth,
          0,
          frameWidth,
          frameHeight
        ),

      left:
        cropCharacter(
          image,
          frameWidth * 2,
          0,
          frameWidth,
          frameHeight
        ),

      right:
        cropCharacter(
          image,
          frameWidth * 3,
          0,
          frameWidth,
          frameHeight
        )

    };

  }

  catch (error) {

    console.error(
      "캐릭터 스프라이트 준비 실패:",
      error
    );


    return {};

  }

}


/* =====================================================
   LOAD IMAGE
===================================================== */

function loadImage(
  src
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const image =
        new Image();


      image.onload =
        () => {

          resolve(
            image
          );

        };


      image.onerror =
        () => {

          reject(
            new Error(
              `이미지 로딩 실패: ${src}`
            )
          );

        };


      image.src =
        src;

    }
  );

}


/* =====================================================
   CROP CHARACTER FRAME
===================================================== */

function cropCharacter(
  image,
  sx,
  sy,
  sw,
  sh
) {

  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    sw;


  canvas.height =
    sh;


  const context =
    canvas.getContext(
      "2d"
    );


  if (
    !context
  ) {

    return "";

  }


  context.imageSmoothingEnabled =
    false;


  context.clearRect(
    0,
    0,
    sw,
    sh
  );


  context.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    sw,
    sh
  );


  return canvas.toDataURL(
    "image/png"
  );

}


/* =====================================================
   PORTRAIT HELPERS
===================================================== */

function getPlayerPortrait() {

  if (
    window.WISDOM_PROFILE
      ?.portraitUrl
  ) {

    return window.WISDOM_PROFILE
      .portraitUrl;

  }


  return (
    window.WISDOM_PROFILE
      ?.gender ===
    "female"
  )

    ? ASSETS.femalePortrait

    : ASSETS.malePortrait;

}


function getLumiPortrait() {

  return ASSETS.lumiPortrait;

}


function getBossPortrait() {

  return ASSETS.bossPortrait;

}


function getPlayerName() {

  return (
    window.WISDOM_PROFILE
      ?.name
    ||
    "모험가"
  );

}


/* =====================================================
   QUIZ ENGINE
===================================================== */

window.QuizEngine = {


  /*
    영어 단어
    →
    한국어 뜻
  */

  wordToKorean(
    words,
    used = []
  ) {

    const pool =
      usablePairs(
        words
      );


    const target =
      pickUnused(
        pool,
        used
      );


    if (
      !target
    ) {

      return null;

    }


    const options =
      buildOptions(
        target.korean,
        pool.map(
          item =>
            item.korean
        )
      );


    return {

      type:
        "wordToKorean",

      itemKey:
        target.english,

      question:
        `"${target.english}"의 뜻은 무엇일까요?`,

      options,

      correctIndex:
        options.indexOf(
          target.korean
        )

    };

  },


  /*
    한국어 뜻
    →
    영어 단어
  */

  koreanToWord(
    words,
    used = []
  ) {

    const pool =
      usablePairs(
        words
      );


    const target =
      pickUnused(
        pool,
        used
      );


    if (
      !target
    ) {

      return null;

    }


    const options =
      buildOptions(
        target.english,
        pool.map(
          item =>
            item.english
        )
      );


    return {

      type:
        "koreanToWord",

      itemKey:
        target.english,

      question:
        `"${target.korean}"에 해당하는 영어 단어는 무엇일까요?`,

      options,

      correctIndex:
        options.indexOf(
          target.english
        )

    };

  },


  /*
    영어 표현
    →
    한국어 뜻
  */

  expressionToKorean(
    expressions,
    used = []
  ) {

    const pool =
      usablePairs(
        expressions
      );


    const target =
      pickUnused(
        pool,
        used
      );


    if (
      !target
    ) {

      return null;

    }


    const options =
      buildOptions(
        target.korean,
        pool.map(
          item =>
            item.korean
        )
      );


    return {

      type:
        "expressionToKorean",

      itemKey:
        target.english,

      question:
        `"${target.english}"의 뜻은 무엇일까요?`,

      options,

      correctIndex:
        options.indexOf(
          target.korean
        )

    };

  },


  /*
    한국어 뜻
    →
    영어 표현
  */

  koreanToExpression(
    expressions,
    used = []
  ) {

    const pool =
      usablePairs(
        expressions
      );


    const target =
      pickUnused(
        pool,
        used
      );


    if (
      !target
    ) {

      return null;

    }


    const options =
      buildOptions(
        target.english,
        pool.map(
          item =>
            item.english
        )
      );


    return {

      type:
        "koreanToExpression",

      itemKey:
        target.english,

      question:
        `"${target.korean}"에 해당하는 영어 표현은 무엇일까요?`,

      options,

      correctIndex:
        options.indexOf(
          target.english
        )

    };

  },


  /*
    문장 배열용 표현 하나 선택
  */

  pickExpression(
    expressions,
    used = []
  ) {

    return pickUnused(
      usablePairs(
        expressions
      ),
      used
    );

  },


  /*
    랜덤 복습
  */

  randomReview(
    content,
    usedWords = [],
    usedExpressions = []
  ) {

    const makers =
      [];


    if (
      usablePairs(
        content?.words
      ).length
    ) {

      makers.push(
        () =>
          this.wordToKorean(
            content.words,
            usedWords
          )
      );


      makers.push(
        () =>
          this.koreanToWord(
            content.words,
            usedWords
          )
      );

    }


    if (
      usablePairs(
        content?.expressions
      ).length
    ) {

      makers.push(
        () =>
          this.expressionToKorean(
            content.expressions,
            usedExpressions
          )
      );


      makers.push(
        () =>
          this.koreanToExpression(
            content.expressions,
            usedExpressions
          )
      );

    }


    if (
      !makers.length
    ) {

      return null;

    }


    const maker =
      shuffle(
        makers
      )[0];


    return maker();

  }

};


/* =====================================================
   QUIZ HELPERS
===================================================== */

function usablePairs(
  items
) {

  if (
    !Array.isArray(
      items
    )
  ) {

    return [];

  }


  return items.filter(
    item =>
      item?.english
      &&
      item?.korean
  );

}


/* =====================================================
   UNUSED-FIRST PICK
===================================================== */

function pickUnused(
  items,
  used = []
) {

  if (
    !items.length
  ) {

    return null;

  }


  const unused =
    items.filter(
      item =>
        !used.includes(
          item.english
        )
    );


  const source =
    unused.length
      ? unused
      : items;


  return shuffle(
    source
  )[0];

}


/* =====================================================
   BUILD MULTIPLE CHOICE OPTIONS
===================================================== */

function buildOptions(
  correct,
  pool
) {

  const values =
    [
      ...new Set(
        pool.filter(
          Boolean
        )
      )
    ];


  const wrong =
    shuffle(
      values.filter(
        value =>
          value !==
          correct
      )
    );


  return shuffle([

    correct,

    ...wrong.slice(
      0,
      3
    )

  ]);

}


/* =====================================================
   GAME UI
===================================================== */

window.GameUI = {


  /* ===================================================
     DIALOGUE
  =================================================== */

  async say(
    messages
  ) {

    const list =
      Array.isArray(
        messages
      )

        ? messages

        : [messages];


    for (
      const message of
      list
    ) {

      await showDialogue(
        message
      );

    }

  },


  /* ===================================================
     MULTIPLE CHOICE
  =================================================== */

  async choice(
    question,
    options,
    correctIndex
  ) {

    return new Promise(
      resolve => {

        let selectedIndex =
          -1;


        openModal();


        modalBody.innerHTML = `

          <div class="quiz-header">
            영어 퀴즈
          </div>

          <p class="dialogue-text">
            ${escapeHtml(
              question
            )}
          </p>

          <div
            id="quiz-options"
            class="quiz-options"
          ></div>

          <button
            id="quiz-submit"
            class="big-gold"
            type="button"
            disabled
          >
            확인
          </button>

        `;


        const optionArea =
          document.querySelector(
            "#quiz-options"
          );


        const submit =
          document.querySelector(
            "#quiz-submit"
          );


        if (
          !optionArea
          ||
          !submit
        ) {

          closeModal();

          resolve(
            false
          );

          return;

        }


        options.forEach(
          (
            option,
            index
          ) => {

            const button =
              document.createElement(
                "button"
              );


            button.type =
              "button";


            button.className =
              "quiz-option";


            button.textContent =
              String(
                option
              );


            button.addEventListener(
              "click",
              () => {

                selectedIndex =
                  index;


                document
                  .querySelectorAll(
                    ".quiz-option"
                  )
                  .forEach(
                    item => {

                      item.classList.remove(
                        "selected"
                      );

                    }
                  );


                button.classList.add(
                  "selected"
                );


                submit.disabled =
                  false;

              }
            );


            optionArea.appendChild(
              button
            );

          }
        );


        submit.addEventListener(
          "click",
          () => {

            if (
              selectedIndex <
              0
            ) {

              return;

            }


            const correct =
              selectedIndex ===
              correctIndex;


            closeModal();


            resolve(
              correct
            );

          },
          {
            once:
              true
          }
        );

      }
    );

  },


  /* ===================================================
     WORD ORDER

     중요:
     오답이어도 반드시 resolve(false)
     → Scene finally 실행
     → 방향키 잠금 복구
  =================================================== */

  async wordOrder(
    sentence
  ) {

    return new Promise(
      resolve => {

        const words =
          String(
            sentence
          )
            .trim()
            .split(
              /\s+/
            )
            .filter(
              Boolean
            );


        if (
          words.length <
          1
        ) {

          resolve(
            false
          );

          return;

        }


        const mixed =
          shuffle(
            words
          );


        let selected =
          [];


        openModal();


        modalBody.innerHTML = `

          <div class="quiz-header">
            문장 만들기
          </div>

          <p class="dialogue-text">
            단어를 올바른 순서대로 선택하세요.
          </p>

          <div
            id="sentence-answer"
            class="english-box"
          >
            &nbsp;
          </div>

          <div
            id="sentence-tokens"
            class="token-area"
          ></div>

          <div class="quiz-actions">

            <button
              id="sentence-reset"
              class="text-button"
              type="button"
            >
              다시 선택
            </button>

            <button
              id="sentence-submit"
              class="big-gold"
              type="button"
            >
              확인
            </button>

          </div>

        `;


        const tokenArea =
          document.querySelector(
            "#sentence-tokens"
          );


        const answerArea =
          document.querySelector(
            "#sentence-answer"
          );


        const resetButton =
          document.querySelector(
            "#sentence-reset"
          );


        const submitButton =
          document.querySelector(
            "#sentence-submit"
          );


        if (
          !tokenArea
          ||
          !answerArea
          ||
          !submitButton
        ) {

          closeModal();

          resolve(
            false
          );

          return;

        }


        function renderAnswer() {

          answerArea.textContent =
            selected
              .map(
                item =>
                  item.word
              )
              .join(
                " "
              )
            ||
            " ";

        }


        mixed.forEach(
          (
            word,
            index
          ) => {

            const button =
              document.createElement(
                "button"
              );


            button.type =
              "button";


            button.className =
              "token";


            button.textContent =
              word;


            button.dataset.index =
              String(
                index
              );


            button.addEventListener(
              "click",
              () => {

                if (
                  button.disabled
                ) {

                  return;

                }


                button.disabled =
                  true;


                selected.push({

                  word,

                  button

                });


                renderAnswer();

              }
            );


            tokenArea.appendChild(
              button
            );

          }
        );


        resetButton
          ?.addEventListener(
            "click",
            () => {

              selected.forEach(
                item => {

                  item.button.disabled =
                    false;

                }
              );


              selected =
                [];


              renderAnswer();

            }
          );


        submitButton.addEventListener(
          "click",
          () => {

            const result =
              selected
                .map(
                  item =>
                    item.word
                )
                .join(
                  " "
                );


            const correct =
              normalizeSentence(
                result
              )
              ===
              normalizeSentence(
                sentence
              );


            /*
              반드시 모달 닫기
            */

            closeModal();


            /*
              정답 / 오답 모두 Promise 종료
            */

            resolve(
              correct
            );

          },
          {
            once:
              true
          }
        );

      }
    );

  },


  /* ===================================================
     SIMPLE ENGLISH DISPLAY
  =================================================== */

  async english(
    description,
    englishText
  ) {

    return new Promise(
      resolve => {

        openModal();


        modalBody.innerHTML = `

          <p class="dialogue-text">
            ${escapeHtml(
              description
            )}
          </p>

          <div class="english-box">
            ${escapeHtml(
              englishText
            )}
          </div>

          <button
            id="english-ok"
            class="big-gold"
            type="button"
          >
            확인
          </button>

        `;


        const button =
          document.querySelector(
            "#english-ok"
          );


        if (
          !button
        ) {

          closeModal();

          resolve(
            true
          );

          return;

        }


        button.addEventListener(
          "click",
          () => {

            closeModal();


            resolve(
              true
            );

          },
          {
            once:
              true
          }
        );

      }
    );

  },


  /* ===================================================
     NORMAL MAP CLEAR
  =================================================== */

  async finish(
    result
  ) {

    return new Promise(
      resolve => {

        openModal();


        modalBody.innerHTML = `

          <h2 class="clear-title">
            ${escapeHtml(
              result.mapId
              ??
              "MAP"
            )}
            CLEAR!
          </h2>

          <p class="dialogue-text">
            ${escapeHtml(
              result.name
            )}의 모험 완료!
          </p>

          <div class="result-box">

            <div>
              <span>
                플레이 시간
              </span>

              <strong>
                ${formatTime(
                  result.seconds
                )}
              </strong>
            </div>

            <div>
              <span>
                첫 시도 정답
              </span>

              <strong>
                ${
                  Number(
                    result.firstTry
                  )
                  ||
                  0
                }
              </strong>
            </div>

            <div>
              <span>
                오답 횟수
              </span>

              <strong>
                ${
                  Number(
                    result.wrong
                  )
                  ||
                  0
                }
              </strong>
            </div>

            <div>
              <span>
                말의 조각
              </span>

              <strong>
                ◆ ◆ ◆
              </strong>
            </div>

          </div>

          <button
            id="finish-home"
            class="big-gold"
            type="button"
          >
            타이틀로 돌아가기
          </button>

        `;


        const button =
          document.querySelector(
            "#finish-home"
          );


        if (
          !button
        ) {

          closeModal();

          resolve(
            true
          );

          return;

        }


        button.addEventListener(
          "click",
          () => {

            closeModal();


            window.WisdomGame
              ?.goTitle();


            resolve(
              true
            );

          },
          {
            once:
              true
          }
        );

      }
    );

  }

};


/* =====================================================
   STANDARD DIALOGUE
===================================================== */

function showDialogue(
  rawText
) {

  return new Promise(
    resolve => {

      openModal();


      let text =
        String(
          rawText
          ??
          ""
        );


      let speaker =
        "";


      let portrait =
        null;


      /*
        루미
      */

      if (
        text.startsWith(
          "루미:"
        )
      ) {

        speaker =
          "루미";


        portrait =
          getLumiPortrait();


        text =
          text.replace(
            /^루미:\s*/,
            ""
          );

      }


      /*
        최종 보스도 공용 대화에서 사용 가능
      */

      else if (
        text.startsWith(
          "침묵의 군주:"
        )
        ||
        text.startsWith(
          "보스:"
        )
      ) {

        speaker =
          "침묵의 군주";


        portrait =
          getBossPortrait();


        text =
          text
            .replace(
              /^침묵의 군주:\s*/,
              ""
            )
            .replace(
              /^보스:\s*/,
              ""
            );

      }


      /*
        플레이어
      */

      else if (
        text.startsWith(
          "나:"
        )
        ||
        text.startsWith(
          "플레이어:"
        )
        ||
        text.startsWith(
          "학생:"
        )
      ) {

        speaker =
          getPlayerName();


        portrait =
          getPlayerPortrait();


        text =
          text
            .replace(
              /^나:\s*/,
              ""
            )
            .replace(
              /^플레이어:\s*/,
              ""
            )
            .replace(
              /^학생:\s*/,
              ""
            );

      }


      const portraitHtml =
        portrait

          ? `

            <div class="dialogue-portrait-box">

              <img
                class="dialogue-portrait"
                src="${portrait}"
                alt="${escapeHtml(
                  speaker
                )}"
              />

            </div>

          `

          : `

            <div class="dialogue-system-box">

              <div class="dialogue-system-icon">
                ✦
              </div>

            </div>

          `;


      modalBody.innerHTML = `

        <div class="dialogue-layout">

          ${portraitHtml}

          <div class="dialogue-content">

            ${
              speaker

                ? `

                  <div class="dialogue-speaker">
                    ${escapeHtml(
                      speaker
                    )}
                  </div>

                `

                : ""
            }

            <p class="dialogue-text">
              ${escapeHtml(
                text
              )}
            </p>

            <button
              id="dialog-next"
              class="big-gold"
              type="button"
            >
              다음
            </button>

          </div>

        </div>

      `;


      const button =
        document.querySelector(
          "#dialog-next"
        );


      if (
        !button
      ) {

        closeModal();

        resolve(
          true
        );

        return;

      }


      button.addEventListener(
        "click",
        () => {

          closeModal();


          resolve(
            true
          );

        },
        {
          once:
            true
        }
      );

    }
  );

}


/* =====================================================
   GLOBAL ENTER / SPACE CONTROL
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.repeat
    ) {

      return;

    }


    if (
      event.key !==
        "Enter"
      &&
      event.code !==
        "Space"
    ) {

      return;

    }


    /*
      모달이 없거나 닫혀 있으면
      게임 Scene 키 입력에 맡긴다.
    */

    if (
      !modal
      ||
      modal.classList.contains(
        "hidden"
      )
    ) {

      return;

    }


    event.preventDefault();


    /*
      현재 열려 있는 UI에서
      사용할 수 있는 버튼 하나만 클릭
    */

    const selectors = [

      "#dialog-next",

      "#boss-dialog-next",

      "#english-ok",

      "#quiz-submit",

      "#sentence-submit",

      "#finish-home",

      "#map12-ending-home"

    ];


    for (
      const selector of
      selectors
    ) {

      const button =
        document.querySelector(
          selector
        );


      if (
        button
        &&
        !button.disabled
      ) {

        button.click();


        return;

      }

    }

  }
);


/* =====================================================
   MODAL
===================================================== */

function openModal() {

  modal
    ?.classList
    .remove(
      "hidden"
    );

}


function closeModal() {

  modal
    ?.classList
    .add(
      "hidden"
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
  value
) {

  return String(
    value
    ??
    ""
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


/* =====================================================
   SENTENCE NORMALIZER
===================================================== */

function normalizeSentence(
  value
) {

  return String(
    value
    ??
    ""
  )

    .trim()

    .replace(
      /\s+/g,
      " "
    )

    .toLowerCase();

}


/* =====================================================
   TIME FORMAT
===================================================== */

function formatTime(
  seconds
) {

  const safeSeconds =
    Math.max(
      0,
      Number(
        seconds
      )
      ||
      0
    );


  const minutes =
    Math.floor(
      safeSeconds /
      60
    );


  const remainingSeconds =
    Math.floor(
      safeSeconds %
      60
    );


  return (
    `${minutes}분 `
    +
    `${remainingSeconds}초`
  );

}
