import Phaser from "phaser";

import "./style.css";

import {

  saveProfile,

  getProfile,

  clearAllProgress,

  getCurrentMap,

  shuffle

} from "./data.js";


/* =====================================================
   AUTOMATIC SCENE DISCOVERY

   Map01Scene.js
   Map02Scene.js
   Map03Scene.js
   ...

   파일이 존재하면 자동 등록.
===================================================== */

const sceneModules =
  import.meta.glob(
    "./game/Map*Scene.js",
    {
      eager: true
    }
  );


const GAME_SCENES =
  Object.entries(
    sceneModules
  )

    .sort(
      (
        [pathA],
        [pathB]
      ) =>
        pathA.localeCompare(
          pathB
        )
    )

    .map(
      ([, module]) =>
        module.default
    )

    .filter(Boolean);


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

      catch (
        error
      ) {

        console.error(
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
          item =>
            item.classList.remove(
              "selected"
            )
        );


        card.classList.add(
          "selected"
        );


        selectedGender =
          card.dataset.gender;

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
      () =>
        studentNameInput
          ?.focus(),
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


studentNameInput?.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();


      beginBtn?.click();

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


    await launchGame(

      profile,

      profile.currentMap
      ||
      getCurrentMap()
      ||
      "MAP01"

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
   GAME
===================================================== */

let phaserGame =
  null;


async function launchGame(
  profile,
  startMapId
) {

  if (
    phaserGame
  ) {

    phaserGame.destroy(
      true
    );


    phaserGame =
      null;

  }


  const spriteUrls =
    await prepareCharacterSprites(
      profile.gender
    );


  window.WISDOM_PROFILE = {

    ...profile,

    spriteUrls,

    portraitUrl:
      profile.gender ===
      "female"

        ? ASSETS.femalePortrait

        : ASSETS.malePortrait

  };


  window.WISDOM_START_MAP =
    startMapId;


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


  if (
    GAME_SCENES.length ===
    0
  ) {

    alert(
      "등록된 맵 Scene이 없습니다."
    );


    return;

  }


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

      /*
        자동으로 발견된 모든 맵
      */

      scene:
        GAME_SCENES

    });


  /*
    Phaser 준비 후 저장된 맵으로 이동.
  */

  phaserGame.events.once(
    Phaser.Core.Events.READY,
    () => {

      const manager =
        phaserGame.scene;


      if (
        manager.keys[
          startMapId
        ]
      ) {

        manager.start(
          startMapId
        );

      }

      else {

        console.warn(
          `${startMapId} Scene이 아직 없습니다. MAP01으로 시작합니다.`
        );


        if (
          manager.keys.MAP01
        ) {

          manager.start(
            "MAP01"
          );

        }

      }

    }
  );

}


/* =====================================================
   EXPOSE GAME CONTROL

   어떤 Scene에서도 사용 가능.

   WisdomGame.startMap("MAP02")
===================================================== */

window.WisdomGame = {


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
        `${mapId} Scene이 존재하지 않습니다.`
      );


      return false;

    }


    phaserGame.scene.start(
      mapId
    );


    return true;

  },


  hasMap(
    mapId
  ) {

    return Boolean(

      phaserGame
        ?.scene
        ?.keys?.[
          mapId
        ]

    );

  }

};


/* =====================================================
   SPRITE
===================================================== */

async function prepareCharacterSprites(
  gender
) {

  const url =
    gender ===
    "female"

      ? ASSETS.femaleSprite

      : ASSETS.maleSprite;


  try {

    const image =
      await loadImage(
        url
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

  catch (
    error
  ) {

    console.error(
      "캐릭터 이미지 로딩 실패:",
      error
    );


    return {};

  }

}


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
        () =>
          resolve(
            image
          );


      image.onerror =
        () =>
          reject(
            new Error(
              `이미지 로딩 실패: ${src}`
            )
          );


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


  context.imageSmoothingEnabled =
    false;


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

  return (
    window.WISDOM_PROFILE
      ?.portraitUrl

    ||

    ASSETS.malePortrait
  );

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


  wordToKorean(
    words,
    used = []
  ) {

    const target =
      pickUnused(
        usablePairs(
          words
        ),
        used
      );


    if (!target) {
      return null;
    }


    const options =
      buildOptions(

        target.korean,

        usablePairs(
          words
        ).map(
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


  randomReview(
    content,
    usedWords = [],
    usedExpressions = []
  ) {

    const makers =
      [];


    if (
      usablePairs(
        content.words
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
        content.expressions
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


    if (!makers.length) {

      return null;

    }


    return shuffle(
      makers
    )[0]();

  }

};


function usablePairs(
  items
) {

  return (
    Array.isArray(
      items
    )
      ? items
      : []
  ).filter(
    item =>
      item?.english
      &&
      item?.korean
  );

}


function pickUnused(
  items,
  used
) {

  if (!items.length) {

    return null;

  }


  const available =
    items.filter(
      item =>
        !used.includes(
          item.english
        )
    );


  return shuffle(

    available.length
      ? available
      : items

  )[0];

}


function buildOptions(
  correct,
  pool
) {

  const unique =
    [...new Set(
      pool.filter(Boolean)
    )];


  const wrong =
    shuffle(

      unique.filter(
        item =>
          item !==
          correct
      )

    );


  return shuffle(
    [
      correct,
      ...wrong.slice(
        0,
        3
      )
    ]
  );

}


/* =====================================================
   GAME UI
===================================================== */

window.GameUI = {


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


  async choice(
    question,
    options,
    correctIndex
  ) {

    return new Promise(
      resolve => {

        let selected =
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


        const area =
          document.querySelector(
            "#quiz-options"
          );


        const submit =
          document.querySelector(
            "#quiz-submit"
          );


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
              option;


            button.addEventListener(
              "click",
              () => {

                selected =
                  index;


                document
                  .querySelectorAll(
                    ".quiz-option"
                  )
                  .forEach(
                    item =>
                      item.classList.remove(
                        "selected"
                      )
                  );


                button.classList.add(
                  "selected"
                );


                submit.disabled =
                  false;

              }
            );


            area.appendChild(
              button
            );

          }
        );


        submit.addEventListener(
          "click",
          () => {

            if (
              selected <
              0
            ) {

              return;

            }


            closeModal();


            resolve(
              selected ===
              correctIndex
            );

          },
          {
            once: true
          }
        );

      }
    );

  },


  async wordOrder(
    sentence
  ) {

    return new Promise(
      resolve => {

        const words =
          String(sentence)
            .trim()
            .split(/\s+/);


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


        function render() {

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


                render();

              }
            );


            tokenArea.appendChild(
              button
            );

          }
        );


        document
          .querySelector(
            "#sentence-reset"
          )
          ?.addEventListener(
            "click",
            () => {

              selected.forEach(
                item =>
                  item.button.disabled =
                    false
              );


              selected =
                [];


              render();

            }
          );


        document
          .querySelector(
            "#sentence-submit"
          )
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

              else {

                answerArea.textContent =
                  "순서를 다시 확인해 보세요.";

              }

            }
          );

      }
    );

  },


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
              <span>플레이 시간</span>

              <strong>
                ${formatTime(result.seconds)}
              </strong>
            </div>

            <div>
              <span>첫 시도 정답</span>

              <strong>
                ${result.firstTry}
              </strong>
            </div>

            <div>
              <span>오답 횟수</span>

              <strong>
                ${result.wrong}
              </strong>
            </div>

            <div>
              <span>말의 조각</span>

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


              resolve(
                true
              );

            },
            {
              once: true
            }
          );

      }
    );

  }

};


/* =====================================================
   DIALOG
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

      else if (
        text.startsWith("나:")
        ||
        text.startsWith("플레이어:")
        ||
        text.startsWith("학생:")
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
            once: true
          }
        );

    }
  );

}


/* =====================================================
   ENTER / SPACE
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

  const value =
    Number(
      seconds
    )
    ||
    0;


  return (
    `${Math.floor(value / 60)}분 `
    +
    `${Math.floor(value % 60)}초`
  );

}
