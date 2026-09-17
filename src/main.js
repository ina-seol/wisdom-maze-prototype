import Phaser from "phaser";
import "./style.css";

import Map01Scene from "./game/Map01Scene.js";

import {
  saveProfile,
  getProfile,
  newMapState,
  saveMapProgress,
  loadMapProgress,
  clearMapProgress,
  shuffle
} from "./data.js";


const titleScreen =
  document.querySelector("#title-screen");

const gameScreen =
  document.querySelector("#game-screen");

const setupModal =
  document.querySelector("#setup-modal");

const modal =
  document.querySelector("#modal");

const modalBody =
  document.querySelector("#modal-body");

const bgm =
  document.querySelector("#bgm");


let selectedGender = "male";
let phaserGame = null;


document
  .querySelector("#start-btn")
  .onclick = () => {

    setupModal.classList.remove("hidden");

  };


document
  .querySelector("#setup-cancel")
  .onclick = () => {

    setupModal.classList.add("hidden");

  };


document
  .querySelectorAll(".character-card")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".character-card")
        .forEach(v =>
          v.classList.remove("selected")
        );

      button.classList.add("selected");

      selectedGender =
        button.dataset.gender;
    };

  });


document
  .querySelector("#begin-btn")
  .onclick = async () => {

    const name =
      document
        .querySelector("#student-name")
        .value
        .trim();

    if (!name) {

      alert("이름을 입력해 주세요.");
      return;
    }

    const profile = {
      name,
      gender: selectedGender
    };

    saveProfile(profile);

    clearMapProgress(name);

    setupModal.classList.add("hidden");

    await launchGame(profile, false);
  };


document
  .querySelector("#continue-btn")
  .onclick = async () => {

    const profile = getProfile();

    if (!profile) {

      alert(
        "저장된 모험가 정보가 없습니다."
      );

      return;
    }

    await launchGame(profile, true);
  };


document
  .querySelector("#music-btn")
  .onclick = async event => {

    if (bgm.paused) {

      bgm.volume = 0.35;

      try {
        await bgm.play();
      } catch {}

      event.target.textContent =
        "음악 끄기";

    } else {

      bgm.pause();

      event.target.textContent =
        "음악 켜기";
    }

  };


async function launchGame(
  profile,
  resume
) {

  titleScreen.classList.add("hidden");

  gameScreen.classList.remove("hidden");

  document.querySelector(
    "#hud-name"
  ).textContent = profile.name;


  let state = resume
    ? loadMapProgress(profile.name)
    : null;


  if (!state || state.completed) {

    state = newMapState();

    saveMapProgress(
      profile.name,
      state
    );
  }


  const spriteUrls =
    await prepareCharacterSprites(
      profile.gender
    );


  window.WISDOM_PROFILE = {
    ...profile,
    spriteUrls
  };

  window.WISDOM_MAP_STATE = state;


  if (phaserGame) {

    phaserGame.destroy(true);

  }


  phaserGame =
    new Phaser.Game({

      type: Phaser.AUTO,

      width: 768,
      height: 576,

      parent: "phaser-root",

      backgroundColor: "#1b2034",

      pixelArt: true,

      physics: {

        default: "arcade",

        arcade: {
          gravity: {
            x: 0,
            y: 0
          },
          debug: false
        }
      },

      scale: {

        mode: Phaser.Scale.FIT,

        autoCenter:
          Phaser.Scale.CENTER_BOTH
      },

      scene: [
        Map01Scene
      ]
    });


  try {

    bgm.volume = 0.3;
    await bgm.play();

  } catch {}
}


/*
  캐릭터시트의 배경은 파란색이므로
  가장자리에서 연결된 파란 영역만 투명화한다.

  남자 캐릭터의 파란 로브는 검은 외곽선으로
  배경과 분리되어 있기 때문에 그대로 남는다.
*/
async function prepareCharacterSprites(
  gender
) {

  const base = import.meta.env.BASE_URL;

const url =
  gender === "female"
    ? `${base}assets/female.png`
    : `${base}assets/male.png`;

  try {

    const image =
      await loadImage(url);


    const W = image.naturalWidth;
    const H = image.naturalHeight;


    const crops = {

      front: {
        x: W * 0.015,
        y: H * 0.21,
        w: W * 0.23,
        h: H * 0.60
      },

      back: {
        x: W * 0.255,
        y: H * 0.21,
        w: W * 0.22,
        h: H * 0.60
      },

      side: {
        x: W * 0.49,
        y: H * 0.21,
        w: W * 0.21,
        h: H * 0.60
      }
    };


    return {

      front:
        cropAndRemoveBackground(
          image,
          crops.front
        ),

      back:
        cropAndRemoveBackground(
          image,
          crops.back
        ),

      side:
        cropAndRemoveBackground(
          image,
          crops.side
        )
    };

  } catch (error) {

    console.warn(
      "캐릭터시트 가공 실패",
      error
    );

    return null;
  }
}


function loadImage(url) {

  return new Promise(
    (resolve, reject) => {

      const image = new Image();

      image.onload =
        () => resolve(image);

      image.onerror =
        reject;

      image.src = url;
    }
  );
}


function cropAndRemoveBackground(
  image,
  crop
) {

  const canvas =
    document.createElement("canvas");

  const width =
    Math.round(crop.w);

  const height =
    Math.round(crop.h);


  canvas.width = width;
  canvas.height = height;


  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  ctx.drawImage(

    image,

    crop.x,
    crop.y,
    crop.w,
    crop.h,

    0,
    0,
    width,
    height

  );


  const data =
    ctx.getImageData(
      0,
      0,
      width,
      height
    );


  const pixels =
    data.data;

  const visited =
    new Uint8Array(
      width * height
    );

  const queue =
    new Int32Array(
      width * height
    );

  let head = 0;
  let tail = 0;


  function isBlueBackground(index) {

    const offset =
      index * 4;

    const r =
      pixels[offset];

    const g =
      pixels[offset + 1];

    const b =
      pixels[offset + 2];

    return (
      b > 80 &&
      b > r + 15 &&
      b > g + 4
    );
  }


  function enqueue(index) {

    if (
      visited[index] ||
      !isBlueBackground(index)
    ) {
      return;
    }

    visited[index] = 1;

    queue[tail++] = index;
  }


  for (
    let x = 0;
    x < width;
    x++
  ) {

    enqueue(x);

    enqueue(
      (height - 1) * width + x
    );
  }


  for (
    let y = 0;
    y < height;
    y++
  ) {

    enqueue(y * width);

    enqueue(
      y * width + width - 1
    );
  }


  while (head < tail) {

    const index =
      queue[head++];

    const x =
      index % width;

    const y =
      Math.floor(
        index / width
      );

    pixels[
      index * 4 + 3
    ] = 0;


    if (x > 0)
      enqueue(index - 1);

    if (x < width - 1)
      enqueue(index + 1);

    if (y > 0)
      enqueue(index - width);

    if (y < height - 1)
      enqueue(index + width);
  }


  ctx.putImageData(
    data,
    0,
    0
  );


  return canvas.toDataURL(
    "image/png"
  );
}


/* ------------------------
   게임 UI
------------------------ */

window.GameUI = {

  async say(lines) {

    if (!Array.isArray(lines)) {
      lines = [lines];
    }

    for (const line of lines) {

      await showSimpleDialog(line);
    }
  },


  async english(
    instruction,
    english
  ) {

    return new Promise(resolve => {

      modal.classList.remove(
        "hidden"
      );

      modalBody.innerHTML = "";

      const p =
        document.createElement("p");

      p.textContent =
        instruction;


      const englishBox =
        document.createElement("div");

      englishBox.className =
        "english-box";

      englishBox.textContent =
        english;


      const button =
        document.createElement("button");

      button.className =
        "big-gold";

      button.textContent =
        "확인";


      button.onclick = () => {

        modal.classList.add(
          "hidden"
        );

        resolve();
      };


      modalBody.append(
        p,
        englishBox,
        button
      );
    });
  },


  async wordOrder(sentence) {

    return new Promise(resolve => {

      const words =
        sentence.split(/\s+/);

      let pool =
        shuffle(words);

      let answer = [];


      function draw() {

        modal.classList.remove(
          "hidden"
        );

        modalBody.innerHTML = "";


        const title =
          document.createElement("h2");

        title.textContent =
          "문장 복원";


        const instruction =
          document.createElement("p");

        instruction.textContent =
          "단어를 올바른 순서로 선택해 보자.";


        const answerBox =
          document.createElement("div");

        answerBox.className =
          "english-box";

        answerBox.textContent =
          answer.join(" ");


        const tokenArea =
          document.createElement("div");

        tokenArea.className =
          "token-area";


        pool.forEach(
          (word, index) => {

            const button =
              document.createElement(
                "button"
              );

            button.className =
              "token";

            button.textContent =
              word;

            button.onclick = () => {

              answer.push(word);

              pool.splice(
                index,
                1
              );

              draw();
            };

            tokenArea.appendChild(
              button
            );
          }
        );


        const reset =
          document.createElement(
            "button"
          );

        reset.textContent =
          "다시 배열";

        reset.onclick = () => {

          answer = [];

          pool =
            shuffle(words);

          draw();
        };


        const confirm =
          document.createElement(
            "button"
          );

        confirm.className =
          "big-gold";

        confirm.textContent =
          "정답 확인";

        confirm.onclick = () => {

          const correct =
            answer.join(" ") ===
            sentence;

          if (correct) {

            modal.classList.add(
              "hidden"
            );

            resolve(true);

          } else {

            alert(
              "문장이 아직 맞지 않아."
            );
          }
        };


        modalBody.append(
          title,
          instruction,
          answerBox,
          tokenArea,
          reset,
          confirm
        );
      }


      draw();
    });
  },


  async finish(stats) {

    return new Promise(resolve => {

      modal.classList.remove(
        "hidden"
      );

      modalBody.innerHTML = `
        <h1 class="clear-title">
          탈출 성공!
        </h1>

        <p>
          ${escapeHtml(stats.name)}의
          첫 번째 모험이 끝났습니다.
        </p>

        <div class="result-box">

          <div>
            플레이 시간
            <strong>
              ${formatTime(stats.seconds)}
            </strong>
          </div>

          <div>
            말의 조각
            <strong>3 / 3</strong>
          </div>

          <div>
            첫 시도 성공
            <strong>
              ${stats.firstTry}
            </strong>
          </div>

          <div>
            다시 시도
            <strong>
              ${stats.wrong}
            </strong>
          </div>

        </div>

        <button id="result-title"
                class="big-gold">
          처음 화면
        </button>
      `;


      document
        .querySelector(
          "#result-title"
        )
        .onclick = () => {

          location.reload();

          resolve();
        };
    });
  }
};


function showSimpleDialog(text) {

  return new Promise(resolve => {

    modal.classList.remove(
      "hidden"
    );

    modalBody.innerHTML = "";

    const paragraph =
      document.createElement("p");

    paragraph.className =
      "dialogue-text";

    paragraph.textContent =
      text;


    const button =
      document.createElement(
        "button"
      );

    button.className =
      "big-gold";

    button.textContent =
      "계속";


    button.onclick = () => {

      modal.classList.add(
        "hidden"
      );

      resolve();
    };


    modalBody.append(
      paragraph,
      button
    );
  });
}


function escapeHtml(text) {

  const element =
    document.createElement("div");

  element.textContent =
    String(text);

  return element.innerHTML;
}


function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const rest =
    seconds % 60;

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
