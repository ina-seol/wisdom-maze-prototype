import Phaser from "phaser";

import "./style.css";

import Map01Scene
  from "./game/Map01Scene.js";

import {
  saveProfile,
  getProfile,
  newMapState,
  loadMapProgress,
  clearMapProgress,
  shuffle
} from "./data.js";


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
   ASSET PATHS
===================================================== */

if (titleBg) {

  titleBg.style.backgroundImage =
    `url("${base}assets/title.png")`;

}


if (malePreview) {

  malePreview.src =
    `${base}assets/portraits/male_portrait.png`;

}


if (femalePreview) {

  femalePreview.src =
    `${base}assets/portraits/female_portrait.png`;

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

if (
  musicBtn &&
  bgm
) {

  musicBtn.textContent =
    "음악 켜기";


  musicBtn.addEventListener(
    "click",
    async () => {

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

          musicBtn.textContent =
            "음악 켜기";

        }

      }

      else {

        bgm.pause();

        musicBtn.textContent =
          "음악 켜기";

      }

    }
  );

}


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
          card.dataset.gender;

      }
    );

  }
);


/* =====================================================
   START BUTTON
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


    setupModal?.classList.remove(
      "hidden"
    );


    setTimeout(
      () => {

        studentNameInput?.focus();

      },
      50
    );

  }
);


/* =====================================================
   CANCEL
===================================================== */

cancelBtn?.addEventListener(
  "click",
  () => {

    setupModal?.classList.add(
      "hidden"
    );

  }
);


/* =====================================================
   BEGIN GAME
===================================================== */

beginBtn?.addEventListener(
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

      studentNameInput?.focus();

      return;

    }


    const profile = {

      name,

      gender:
        selectedGender

    };


    saveProfile(
      profile
    );


    clearMapProgress(
      name
    );


    setupModal?.classList.add(
      "hidden"
    );


    await launchGame(
      profile,
      false
    );

  }
);


/* =====================================================
   ENTER ON NAME INPUT
===================================================== */

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
        "저장된 모험 기록이 없습니다."
      );

      return;

    }


    await launchGame(
      profile,
      true
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
  continueGame
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


  let state =
    null;


  if (
    continueGame
  ) {

    state =
      loadMapProgress(
        profile.name
      );

  }


  if (
    !state
  ) {

    state =
      newMapState();

  }


  window.WISDOM_PROFILE = {

    ...profile,

    spriteUrls

  };


  window.WISDOM_MAP_STATE =
    state;


  titleScreen?.classList.add(
    "hidden"
  );


  gameScreen?.classList.remove(
    "hidden"
  );


  if (
    hudName
  ) {

    hudName.textContent =
      profile.name;

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

      scene: [
        Map01Scene
      ]

    });

}


/* =====================================================
   CHARACTER SPRITE PREPARATION

   새 PNG 시트:
   [정면][후면][왼쪽][오른쪽]
===================================================== */

async function prepareCharacterSprites(
  gender
) {

  const imageUrl =
    gender === "female"

      ? `${base}assets/female.png`

      : `${base}assets/male.png`;


  try {

    const image =
      await loadImage(
        imageUrl
      );


    const frameWidth =
      Math.floor(
        image.width / 4
      );


    const frameHeight =
      image.height;


    const front =
      cropCharacter(
        image,
        0,
        0,
        frameWidth,
        frameHeight
      );


    const back =
      cropCharacter(
        image,
        frameWidth,
        0,
        frameWidth,
        frameHeight
      );


    const left =
      cropCharacter(
        image,
        frameWidth * 2,
        0,
        frameWidth,
        frameHeight
      );


    const right =
      cropCharacter(
        image,
        frameWidth * 3,
        0,
        frameWidth,
        frameHeight
      );


    return {

      front,
      back,
      left,
      right,

      /*
        옛 MapScene 호환
      */

      side:
        right

    };

  }

  catch (error) {

    console.error(
      "캐릭터 이미지 준비 실패:",
      error
    );


    return {

      front:
        imageUrl,

      back:
        imageUrl,

      left:
        imageUrl,

      right:
        imageUrl,

      side:
        imageUrl

    };

  }

}


/* =====================================================
   IMAGE LOADER
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
   CROP SPRITE

   새 캐릭터 PNG는 이미 투명 배경이므로
   별도 배경제거를 하지 않는다.
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

  const gender =
    window.WISDOM_PROFILE
      ?.gender
      || "male";


  if (
    gender ===
    "female"
  ) {

    return `${base}assets/portraits/female_portrait.png`;

  }


  return `${base}assets/portraits/male_portrait.png`;

}


function getLumiPortrait() {

  return `${base}assets/portraits/lumi_portrait.png`;

}


function getPlayerName() {

  return window.WISDOM_PROFILE
    ?.name
    || "모험가";

}


/* =====================================================
   GAME UI
===================================================== */

window.GameUI = {


  /* -----------------------------------------------------
     NORMAL DIALOG
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
     ENGLISH CLUE
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
     MULTIPLE CHOICE
  ------------------------------------------------------ */

  async choice(
    question,
    options,
    correctIndex
  ) {

    return new Promise(
      resolve => {

        openModal();


        let selectedIndex =
          -1;


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

          <p
            id="quiz-feedback"
            class="quiz-feedback"
          ></p>

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

                selectedIndex =
                  index;


                document
                  .querySelectorAll(
                    ".quiz-option"
                  )
                  .forEach(
                    element => {

                      element.classList.remove(
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
          sentence
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


        const resetButton =
          document.querySelector(
            "#sentence-reset"
          );


        const submitButton =
          document.querySelector(
            "#sentence-submit"
          );


        function updateAnswer() {

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
                  index,
                  button

                });


                updateAnswer();

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


              updateAnswer();

            }
          );


        submitButton
          ?.addEventListener(
            "click",
            () => {

              const answer =
                selected
                  .map(
                    item =>
                      item.word
                  )
                  .join(
                    " "
                  );


              if (
                normalizeSentence(
                  answer
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
            MAP 01 CLEAR!
          </h2>

          <p class="dialogue-text result-message">
            ${escapeHtml(result.name)}의 첫 번째 모험 완료!
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
                ${result.firstTry}
              </strong>
            </div>

            <div>
              <span>
                오답 횟수
              </span>

              <strong>
                ${result.wrong}
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


              if (
                phaserGame
              ) {

                phaserGame.destroy(
                  true
                );


                phaserGame =
                  null;

              }


              gameScreen?.classList.add(
                "hidden"
              );


              titleScreen?.classList.remove(
                "hidden"
              );


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
   RPG DIALOGUE
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
            );

      }


      /*
        SYSTEM MESSAGE
      */

      const portraitHTML =
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

          ${portraitHTML}

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

   대화창이나 문제창이 열려 있을 때:
   Enter 또는 Space = 확인
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
      modal?.classList.contains(
        "hidden"
      )
    ) {

      return;

    }


    /*
      사용자가 버튼 자체에 포커스하고
      Space를 누른 경우 브라우저 기본 클릭과
      중복되지 않도록 막는다.
    */

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
        button &&
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

  modal?.classList.remove(
    "hidden"
  );

}


function closeModal() {

  modal?.classList.add(
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
    Number.isFinite(
      Number(seconds)
    )
      ? Number(seconds)
      : 0;


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
