import Phaser from "phaser";
import "./style.css";

import Map01Scene from "./game/Map01Scene.js";

import {
  saveProfile,
  getProfile,
  newMapState,
  loadMapProgress,
  clearMapProgress,
  shuffle
} from "./data.js";


/* =========================================================
   BASE URL
   GitHub Pages:
   /wisdom-maze-prototype/
========================================================= */

const base = import.meta.env.BASE_URL;


/* =========================================================
   DOM
========================================================= */

const titleScreen =
  document.querySelector("#title-screen");

const titleBg =
  document.querySelector(".title-bg");

const gameScreen =
  document.querySelector("#game-screen");

const setupModal =
  document.querySelector("#setup-modal");

const modal =
  document.querySelector("#modal");

const modalBody =
  document.querySelector("#modal-body");

const startBtn =
  document.querySelector("#start-btn");

const continueBtn =
  document.querySelector("#continue-btn");

const adminBtn =
  document.querySelector("#admin-btn");

const musicBtn =
  document.querySelector("#music-btn");

const beginBtn =
  document.querySelector("#begin-btn");

const cancelBtn =
  document.querySelector("#setup-cancel");

const studentNameInput =
  document.querySelector("#student-name");

const bgm =
  document.querySelector("#bgm");

const hudName =
  document.querySelector("#hud-name");


/* =========================================================
   TITLE IMAGE
========================================================= */

if (titleBg) {

  titleBg.style.backgroundImage =
    `url("${base}assets/title.png")`;

}


/* =========================================================
   MUSIC
========================================================= */

if (bgm) {

  bgm.src =
    `${base}assets/theme.mp3`;

  bgm.volume =
    0.45;

}


if (musicBtn && bgm) {

  musicBtn.textContent =
    "음악 켜기";


  musicBtn.addEventListener(
    "click",

    async () => {

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


/* =========================================================
   CHARACTER SELECT
========================================================= */

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


/* =========================================================
   START
========================================================= */

if (startBtn) {

  startBtn.addEventListener(
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


      if (studentNameInput) {

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
}


/* =========================================================
   CANCEL
========================================================= */

if (cancelBtn) {

  cancelBtn.addEventListener(
    "click",

    () => {

      setupModal?.classList.add(
        "hidden"
      );

    }
  );
}


/* =========================================================
   BEGIN GAME
========================================================= */

if (beginBtn) {

  beginBtn.addEventListener(
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
}


/* =========================================================
   ENTER KEY ON NAME
========================================================= */

if (studentNameInput) {

  studentNameInput.addEventListener(
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
}


/* =========================================================
   CONTINUE
========================================================= */

if (continueBtn) {

  continueBtn.addEventListener(
    "click",

    async () => {

      const profile =
        getProfile();


      if (
        !profile?.name
      ) {

        alert(
          "저장된 모험 기록이 없습니다.\n먼저 게임을 시작해 주세요."
        );

        return;
      }


      await launchGame(
        profile,
        true
      );

    }
  );
}


/* =========================================================
   ADMIN
========================================================= */

if (adminBtn) {

  adminBtn.addEventListener(
    "click",

    () => {

      window.location.href =
        `${base}admin.html`;

    }
  );
}


/* =========================================================
   PHASER
========================================================= */

let phaserGame =
  null;


async function launchGame(
  profile,
  continueGame
) {

  /*
    혹시 이전 Phaser가 남아 있으면 제거
  */

  if (phaserGame) {

    phaserGame.destroy(
      true
    );

    phaserGame =
      null;
  }


  /*
    캐릭터 이미지 준비
  */

  const spriteUrls =
    await prepareCharacterSprites(
      profile.gender
    );


  /*
    진행상황
  */

  let state = null;


  if (continueGame) {

    state =
      loadMapProgress(
        profile.name
      );

  }


  if (!state) {

    state =
      newMapState();

  }


  /*
    Phaser Scene에서 사용
  */

  window.WISDOM_PROFILE = {

    ...profile,

    spriteUrls

  };


  window.WISDOM_MAP_STATE =
    state;


  /*
    UI 변경
  */

  titleScreen?.classList.add(
    "hidden"
  );


  gameScreen?.classList.remove(
    "hidden"
  );


  if (hudName) {

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
        "#101827",

      pixelArt:
        true,

      roundPixels:
        true,

      physics: {

        default:
          "arcade",

        arcade: {

          debug:
            false,

          gravity: {

            y:
              0

          }

        }

      },

      scene: [
        Map01Scene
      ]

    });
}


/* =========================================================
   CHARACTER IMAGE PREPARATION
========================================================= */

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
      현재 캐릭터 시트에서
      앞 / 뒤 / 옆 방향을 잘라내기 위한
      프로토타입 좌표.

      원본 에셋 비율이 바뀌면
      여기만 조정하면 됨.
    */


    const cellWidth =
      Math.floor(
        image.width / 4
      );


    const cellHeight =
      Math.floor(
        image.height / 4
      );


    /*
      정면
    */

    const front =
      cropImage(

        image,

        0,

        0,

        cellWidth,

        cellHeight

      );


    /*
      후면
    */

    const back =
      cropImage(

        image,

        cellWidth,

        0,

        cellWidth,

        cellHeight

      );


    /*
      측면
    */

    const side =
      cropImage(

        image,

        cellWidth * 2,

        0,

        cellWidth,

        cellHeight

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
      실패 시에도 Phaser에서
      최소한 같은 이미지를 로딩할 수 있도록
      원본 사용
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


/* =========================================================
   LOAD IMAGE
========================================================= */

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


/* =========================================================
   CROP IMAGE
========================================================= */

function cropImage(
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


  removeEdgeBackground(
    canvas
  );


  return canvas.toDataURL(
    "image/png"
  );
}


/* =========================================================
   REMOVE BLUE BACKGROUND
========================================================= */

function removeEdgeBackground(
  canvas
) {

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true
      }
    );


  const width =
    canvas.width;


  const height =
    canvas.height;


  if (
    width <= 0 ||
    height <= 0
  ) {

    return;

  }


  const imageData =
    context.getImageData(
      0,
      0,
      width,
      height
    );


  const data =
    imageData.data;


  /*
    모서리 색상 기준으로
    배경색 추정
  */

  const corners = [

    getPixel(
      data,
      width,
      0,
      0
    ),

    getPixel(
      data,
      width,
      width - 1,
      0
    ),

    getPixel(
      data,
      width,
      0,
      height - 1
    ),

    getPixel(
      data,
      width,
      width - 1,
      height - 1
    )

  ];


  const bg = {

    r:
      Math.round(
        corners.reduce(
          (sum, p) =>
            sum + p.r,
          0
        ) / corners.length
      ),

    g:
      Math.round(
        corners.reduce(
          (sum, p) =>
            sum + p.g,
          0
        ) / corners.length
      ),

    b:
      Math.round(
        corners.reduce(
          (sum, p) =>
            sum + p.b,
          0
        ) / corners.length
      )

  };


  const tolerance =
    45;


  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

    const r =
      data[i];

    const g =
      data[i + 1];

    const b =
      data[i + 2];


    const distance =
      Math.sqrt(

        (r - bg.r) ** 2 +

        (g - bg.g) ** 2 +

        (b - bg.b) ** 2

      );


    /*
      캐릭터 내부 색상을 너무 많이
      날리지 않도록 비교적 보수적으로 처리
    */

    if (
      distance <
      tolerance
    ) {

      data[i + 3] =
        0;

    }

  }


  context.putImageData(
    imageData,
    0,
    0
  );
}


function getPixel(
  data,
  width,
  x,
  y
) {

  const index =
    (
      y * width +
      x
    ) * 4;


  return {

    r:
      data[index],

    g:
      data[index + 1],

    b:
      data[index + 2]

  };
}


/* =========================================================
   GAME UI
========================================================= */

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
    영어 문제 / 단서
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


        const shuffled =
          shuffle(
            words
          );


        let selected =
          [];


        openModal();


        modalBody.innerHTML = `

          <p class="dialogue-text">
            단어를 올바른 순서대로 선택해 문장을 완성하세요.
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
              .join(
                " "
              ) ||
            " ";

        }


        shuffled.forEach(
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
                  .join(
                    " "
                  );


              if (
                normalizeSentence(
                  answer
                ) ===
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


              if (phaserGame) {

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


/* =========================================================
   DIALOG HELPERS
========================================================= */

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


/* =========================================================
   UTILS
========================================================= */

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
    value
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
