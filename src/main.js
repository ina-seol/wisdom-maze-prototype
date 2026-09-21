import Phaser from "phaser";

import "./style.css";

import Map01Scene
  from "./game/Map01Scene.js";

import Map02Scene
  from "./game/Map02Scene.js";

import {
  saveProfile,
  getProfile,
  clearAllProgress,
  getCurrentMap,
  shuffle
} from "./data.js";


/* =====================================================
   SCENES
===================================================== */

const GAME_SCENES = [
  Map01Scene,
  Map02Scene
];


/* =====================================================
   BASE
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

  maleSprite:
    `${base}assets/male.png`,

  femaleSprite:
    `${base}assets/female.png`

};


/* =====================================================
   TITLE ASSETS
===================================================== */

if (titleBg) {

  titleBg.style.backgroundImage =
    `url("${base}assets/title.png")`;

}


if (malePreview) {

  malePreview.src =
    ASSETS.malePortrait;

}


if (femalePreview) {

  femalePreview.src =
    ASSETS.femalePortrait;

}


if (bgm) {

  bgm.src =
    `${base}assets/theme.mp3`;

  bgm.volume =
    0.45;

}


/* =====================================================
   MUSIC
===================================================== */

musicBtn?.addEventListener(
  "click",
  async () => {

    if (!bgm) {
      return;
    }


    if (bgm.paused) {

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

startBtn?.addEventListener(
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


cancelBtn?.addEventListener(
  "click",
  () => {

    setupModal
      ?.classList
      .add(
        "hidden"
      );

  }
);


beginBtn?.addEventListener(
  "click",
  async () => {

    const name =
      studentNameInput
        ?.value
        .trim();


    if (!name) {

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


    saveProfile(
      profile
    );


    clearAllProgress(
      name
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

continueBtn?.addEventListener(
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

adminBtn?.addEventListener(
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
    이전 게임 제거
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
    캐릭터 방향 이미지 준비
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


  window.WISDOM_PROFILE = {

    ...profile,

    currentMap:
      startMapId,

    spriteUrls,

    portraitUrl

  };


  /*
    UI 전환
  */

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
    게임 생성
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
    Phaser가 실제 scene들을 등록한 뒤
    원하는 맵 시작
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


  const sceneManager =
    phaserGame.scene;


  /*
    MAP02가 아직 등록되지 않았을 경우 등
  */

  if (
    sceneManager.keys[
      mapId
    ]
  ) {

    sceneManager.start(
      mapId
    );


    return true;

  }


  console.warn(
    `${mapId} Scene이 없습니다. MAP01으로 이동합니다.`
  );


  if (
    sceneManager.keys.MAP01
  ) {

    sceneManager.start(
      "MAP01"
    );


    return true;

  }


  return false;

}


/* =====================================================
   GLOBAL GAME CONTROL

   Map01Scene.js / Map02Scene.js에서 사용
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

      phaserGame
        .scene
        .keys[
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
      !phaserGame
        .scene
        .keys[
          mapId
        ]
    ) {

      console.warn(
        `${mapId} Scene이 없습니다.`
      );


      return false;

    }


    const profile =
      getProfile();


    if (
      profile
    ) {

      saveProfile({

        ...profile,

        currentMap:
          mapId

      });


      if (
        window.WISDOM_PROFILE
      ) {

        window.WISDOM_PROFILE.currentMap =
          mapId;

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

  }

};


/* =====================================================
   CHARACTER SPRITES

   4열 시트
   0 = front
   1 = back
   2 = left
   3 = right
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
   IMAGE
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
   PORTRAITS
===================================================== */

function getPlayerPortrait() {

  if (
    window.WISDOM_PROFILE
      ?.portraitUrl
  ) {

    return window.WISDOM_PROFILE
      .portraitUrl;

  }


  const gender =
    window.WISDOM_PROFILE
      ?.gender
      ||
      "male";


  return gender ===
    "female"

    ? ASSETS.femalePortrait

    : ASSETS.malePortrait;

}


function getLumiPortrait() {

  return ASSETS.lumiPortrait;

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


  /* -----------------------------------------------------
     영어 단어 → 한국어 뜻
  ------------------------------------------------------ */

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


    if (!target) {

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


  /* -----------------------------------------------------
     한국어 뜻 → 영어 단어
  ------------------------------------------------------ */

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


    if (!target) {

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


  /* -----------------------------------------------------
     영어 표현 → 한국어 뜻
  ------------------------------------------------------ */

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


    if (!target) {

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


  /* -----------------------------------------------------
     한국어 뜻 → 영어 표현
  ------------------------------------------------------ */

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


    if (!target) {

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


  /* -----------------------------------------------------
     문장 배열용 표현 선택
  ------------------------------------------------------ */

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


  /* -----------------------------------------------------
     랜덤 복습
  ------------------------------------------------------ */

  randomReview(
    content,
    usedWords = [],
    usedExpressions = []
  ) {

    const makers =
      [];


    const wordPool =
      usablePairs(
        content?.words
      );


    const expressionPool =
      usablePairs(
        content?.expressions
      );


    if (
      wordPool.length
    ) {

      makers.push(
        () =>
          this.wordToKorean(

            wordPool,

            usedWords

          )
      );


      makers.push(
        () =>
          this.koreanToWord(

            wordPool,

            usedWords

          )
      );

    }


    if (
      expressionPool.length
    ) {

      makers.push(
        () =>
          this.expressionToKorean(

            expressionPool,

            usedExpressions

          )
      );


      makers.push(
        () =>
          this.koreanToExpression(

            expressionPool,

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


  return shuffle(

    unused.length
      ? unused
      : items

  )[0];

}


function buildOptions(
  correct,
  pool
) {

  const values =
    [...new Set(
      pool.filter(
        Boolean
      )
    )];


  const wrong =
    shuffle(

      values.filter(
        value =>
          value !==
          correct
      )

    );


  /*
    단어/표현을 최소 4개 넣으면
    항상 4지선다.

    4개 미만이면 있는 것만 표시.
  */

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


  /* -----------------------------------------------------
     DIALOGUE
  ------------------------------------------------------ */

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


  /* -----------------------------------------------------
     MULTIPLE CHOICE
  ------------------------------------------------------ */

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
            ${escapeHtml(question)}
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
          !optionArea ||
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


  /* -----------------------------------------------------
     WORD ORDER
  ------------------------------------------------------ */

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
            .split(/\s+/)
            .filter(Boolean);


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


        function renderAnswer() {

          if (
            answerArea
          ) {

            answerArea.textContent =
              selected
                .map(
                  item =>
                    item.word
                )
                .join(" ")
              ||
              " ";

          }

        }


        mixed.forEach(
          word => {

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


            tokenArea
              ?.appendChild(
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


        submitButton
          ?.addEventListener(
            "click",
            () => {

              const result =
                selected
                  .map(
                    item =>
                      item.word
                  )
                  .join(" ");


              if (
                normalizeSentence(
                  result
                )
                ===
                normalizeSentence(
                  sentence
                )
              ) {

                closeModal();


                resolve(
                  true
                );

              }

              else if (
                answerArea
              ) {

                answerArea.textContent =
                  "순서를 다시 확인해 보세요.";

              }

            }
          );

      }
    );

  },


  /* -----------------------------------------------------
     SIMPLE ENGLISH DISPLAY
  ------------------------------------------------------ */

  async english(
    description,
    englishText
  ) {

    return new Promise(
      resolve => {

        openModal();


        modalBody.innerHTML = `

          <div class="question-layout">

            <div class="question-icon">
              ABC
            </div>

            <div class="question-content">

              <p class="dialogue-text">
                ${escapeHtml(description)}
              </p>

              <div class="english-box">
                ${escapeHtml(englishText)}
              </div>

              <button
                id="english-ok"
                class="big-gold"
                type="button"
              >
                확인
              </button>

            </div>

          </div>

        `;


        document
          .querySelector(
            "#english-ok"
          )
          ?.addEventListener(
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


  /* -----------------------------------------------------
     RESULT
  ------------------------------------------------------ */

  async finish(
    result
  ) {

    return new Promise(
      resolve => {

        openModal();


        modalBody.innerHTML = `

          <h2 class="clear-title">
            ${escapeHtml(result.mapId ?? "MAP")} CLEAR!
          </h2>

          <p class="dialogue-text result-message">
            ${escapeHtml(result.name)}의 모험 완료!
          </p>

          <div class="result-box">

            <div>
              <span>
                플레이 시간
              </span>

              <strong>
                ${formatTime(result.seconds)}
              </strong>
            </div>

            <div>
              <span>
                첫 시도 정답
              </span>

              <strong>
                ${Number(result.firstTry) || 0}
              </strong>
            </div>

            <div>
              <span>
                오답 횟수
              </span>

              <strong>
                ${Number(result.wrong) || 0}
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


        document
          .querySelector(
            "#finish-home"
          )
          ?.addEventListener(
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
   DIALOGUE
===================================================== */

function showDialogue(
  rawText
) {

  return new Promise(
    resolve => {

      openModal();


      let text =
        String(
          rawText ?? ""
        );


      let speaker =
        "";


      let portrait =
        null;


      /*
        LUMI
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
        PLAYER
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
                alt="${escapeHtml(speaker)}"
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
                    ${escapeHtml(speaker)}
                  </div>
                `

                : ""
            }

            <p class="dialogue-text">
              ${escapeHtml(text)}
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


      document
        .querySelector(
          "#dialog-next"
        )
        ?.addEventListener(
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
   ENTER / SPACE SUPPORT
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
      모달 닫혀 있으면
      Phaser가 Enter/E를 처리.
    */

    if (
      modal
        ?.classList
        .contains(
          "hidden"
        )
    ) {

      return;

    }


    event.preventDefault();


    const selectors = [

      "#dialog-next",

      "#english-ok",

      "#quiz-submit",

      "#sentence-submit",

      "#finish-home"

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
   HELPERS
===================================================== */

function escapeHtml(
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


function normalizeSentence(
  value
) {

  return String(
    value ?? ""
  )

    .trim()

    .replace(
      /\s+/g,
      " "
    )

    .toLowerCase();

}


function formatTime(
  seconds
) {

  const safeSeconds =
    Number(seconds)
    ||
    0;


  const minutes =
    Math.floor(
      safeSeconds / 60
    );


  const remain =
    Math.floor(
      safeSeconds % 60
    );


  return `${minutes}분 ${remain}초`;

}
