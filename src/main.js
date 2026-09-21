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
   BASE URL
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

/*
  타이틀
*/

if (titleBg) {

  titleBg.style.backgroundImage =
    `url("${base}assets/title.png")`;

}


/*
  캐릭터 선택 화면

  실제 캐릭터 시트:
  4열 × 1행

  1 = 정면
  2 = 후면
  3 = 측면
  4 = 측면 변형
*/

if (malePreview) {

  malePreview.style.backgroundImage =
    `url("${base}assets/male.png")`;

}


if (femalePreview) {

  femalePreview.style.backgroundImage =
    `url("${base}assets/female.png")`;

}


/*
  음악
*/

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
   GAME START BUTTON
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
   CANCEL SETUP
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
   ENTER KEY
===================================================== */

studentNameInput?.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

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
   PHASER
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


  /*
    선택한 성별 캐릭터를
    정면 / 후면 / 측면으로 잘라냄
  */

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


  /*
    화면 전환
  */

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

            y:
              0

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
   CHARACTER SPRITES
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


    /*
      실제 업로드된 캐릭터 시트 구조:

      ┌────┬────┬────┬────┐
      │앞  │뒤  │옆  │옆2 │
      └────┴────┴────┴────┘

      = 4열 × 1행
    */

    const columns =
      4;


    const frameWidth =
      Math.floor(
        image.width /
        columns
      );


    /*
      세로는 전체 높이를 사용해야 함
    */

    const frameHeight =
      image.height;


    /*
      정면
    */

    const front =
      cropCharacter(

        image,

        0,

        0,

        frameWidth,

        frameHeight

      );


    /*
      후면
    */

    const back =
      cropCharacter(

        image,

        frameWidth,

        0,

        frameWidth,

        frameHeight

      );


    /*
      오른쪽 측면
    */

    const side =
      cropCharacter(

        image,

        frameWidth * 2,

        0,

        frameWidth,

        frameHeight

      );


    return {

      front,
      back,
      side

    };

  }

  catch (error) {

    console.error(
      "캐릭터 이미지 준비 실패:",
      error
    );


    /*
      최소한 캐릭터 파일 자체를
      fallback으로 전달
    */

    return {

      front:
        imageUrl,

      back:
        imageUrl,

      side:
        imageUrl

    };

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
   CROP CHARACTER
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


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.imageSmoothingEnabled =
    false;


  ctx.drawImage(

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


  /*
    중요:
    현재는 배경색 제거를 하지 않는다.

    이전에는 배경 제거 과정에서
    캐릭터까지 사라질 수 있었음.
  */


  return canvas.toDataURL(
    "image/png"
  );

}


/* =====================================================
   GAME UI
===================================================== */

window.GameUI = {


  /*
    일반 대화
  */

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


  /*
    영어 단서
  */

  async english(
    description,
    englishText
  ) {

    return new Promise(
      resolve => {

        openModal();


        modalBody.innerHTML = `

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

            }
          );

      }
    );

  },


  /*
    문장 순서 맞추기
  */

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

        `;


        const tokenArea =
          document.querySelector(
            "#sentence-tokens"
          );


        const answerArea =
          document.querySelector(
            "#sentence-answer"
          );


        function updateAnswer() {

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


        document
          .querySelector(
            "#sentence-reset"
          )
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


        document
          .querySelector(
            "#sentence-submit"
          )
          ?.addEventListener(
            "click",
            () => {

              const answer =
                selected
                  .map(
                    item =>
                      item.word
                  )
                  .join(" ");


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


  /*
    결과창
  */

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

          <p class="dialogue-text">
            ${escapeHtml(result.name)}의 첫 번째 모험 완료!
          </p>

          <div class="result-box">

            <div>
              플레이 시간
              <strong>
                ${formatTime(result.seconds)}
              </strong>
            </div>

            <div>
              첫 시도 정답
              <strong>
                ${result.firstTry}
              </strong>
            </div>

            <div>
              오답 횟수
              <strong>
                ${result.wrong}
              </strong>
            </div>

            <div>
              말의 조각
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
  text
) {

  return new Promise(
    resolve => {

      openModal();


      modalBody.innerHTML = `

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

          }
        );

    }
  );

}


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
   UTILS
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

  const minutes =
    Math.floor(
      seconds / 60
    );


  const remain =
    seconds % 60;


  return `${minutes}분 ${remain}초`;

}
