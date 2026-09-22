import {
  getRecords,
  MAP_NAMES
} from "./data.js";


/* =====================================================
   WISDOM MAZE
   MOBILE CONTROLS + LOCAL RECORD BOARD
===================================================== */


/* =====================================================
   GLOBAL TOUCH INPUT

   모든 Phaser Scene에서 이 객체를 읽는다.

   window.WisdomTouchInput.up
   window.WisdomTouchInput.down
   window.WisdomTouchInput.left
   window.WisdomTouchInput.right
   window.WisdomTouchInput.interactPressed
===================================================== */

window.WisdomTouchInput = {

  up: false,

  down: false,

  left: false,

  right: false,

  interactPressed: false

};


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


function formatTime(
  seconds
) {

  const value =
    Math.max(
      0,
      Number(
        seconds
      ) || 0
    );


  const hours =
    Math.floor(
      value / 3600
    );


  const minutes =
    Math.floor(
      (
        value % 3600
      ) / 60
    );


  const secs =
    Math.floor(
      value % 60
    );


  if (
    hours > 0
  ) {

    return (
      `${hours}시간 ${minutes}분 ${secs}초`
    );

  }


  if (
    minutes > 0
  ) {

    return (
      `${minutes}분 ${secs}초`
    );

  }


  return `${secs}초`;

}


/* =====================================================
   TOUCH INPUT HELPERS
===================================================== */

function getTouchInput() {

  if (
    !window.WisdomTouchInput
  ) {

    window.WisdomTouchInput = {

      up: false,

      down: false,

      left: false,

      right: false,

      interactPressed: false

    };

  }


  return window.WisdomTouchInput;

}


function setDirection(
  direction,
  pressed
) {

  const touch =
    getTouchInput();


  if (
    ![
      "up",
      "down",
      "left",
      "right"
    ].includes(
      direction
    )
  ) {

    return;

  }


  touch[direction] =
    Boolean(
      pressed
    );

}


function pressInteract() {

  const touch =
    getTouchInput();


  touch.interactPressed =
    true;

}


function releaseAllTouchInput() {

  const touch =
    getTouchInput();


  touch.up =
    false;


  touch.down =
    false;


  touch.left =
    false;


  touch.right =
    false;


  touch.interactPressed =
    false;


  document
    .querySelectorAll(
      "#mobile-game-controls .pressed"
    )
    .forEach(
      button => {

        button.classList.remove(
          "pressed"
        );

      }
    );

}


/* =====================================================
   MOBILE CONTROL UI
===================================================== */

function createMobileControls() {

  if (
    document.querySelector(
      "#mobile-game-controls"
    )
  ) {

    return;

  }


  const controls =
    document.createElement(
      "div"
    );


  controls.id =
    "mobile-game-controls";


  controls.setAttribute(
    "aria-label",
    "모바일 게임 조작"
  );


  controls.innerHTML = `

    <div class="wisdom-mobile-dpad">

      <button
        type="button"
        class="wisdom-touch-key wisdom-touch-up"
        data-direction="up"
        aria-label="위로 이동"
      >
        ▲
      </button>


      <button
        type="button"
        class="wisdom-touch-key wisdom-touch-left"
        data-direction="left"
        aria-label="왼쪽으로 이동"
      >
        ◀
      </button>


      <div
        class="wisdom-touch-center"
        aria-hidden="true"
      >
      </div>


      <button
        type="button"
        class="wisdom-touch-key wisdom-touch-right"
        data-direction="right"
        aria-label="오른쪽으로 이동"
      >
        ▶
      </button>


      <button
        type="button"
        class="wisdom-touch-key wisdom-touch-down"
        data-direction="down"
        aria-label="아래로 이동"
      >
        ▼
      </button>

    </div>


    <div class="wisdom-mobile-action-area">

      <button
        type="button"
        id="mobile-interact"
        class="wisdom-mobile-interact"
        aria-label="조사"
      >
        <span class="wisdom-interact-main">
          조사
        </span>

        <span class="wisdom-interact-sub">
          E
        </span>
      </button>

    </div>

  `;


  /*
    중요:
    body 끝에 붙이지 않고
    게임 화면 바로 아래에 붙인다.
  */

  const gameScreen =
    document.querySelector(
      "#game-screen"
    );


  if (
    gameScreen
  ) {

    gameScreen.insertAdjacentElement(
      "afterend",
      controls
    );

  }

  else {

    /*
      game-screen을 못 찾는 경우에만
      fallback
    */

    document.body.appendChild(
      controls
    );

  }


  setupDirectionButtons(
    controls
  );


  setupInteractButton(
    controls
  );


  updateMobileControlsVisibility();

}


/* =====================================================
   DIRECTION BUTTONS
===================================================== */

function setupDirectionButtons(
  controls
) {

  controls
    .querySelectorAll(
      ".wisdom-touch-key"
    )
    .forEach(
      button => {

        const direction =
          button.dataset.direction;


        if (
          !direction
        ) {

          return;

        }


        const start =
          event => {

            event.preventDefault();

            event.stopPropagation();


            setDirection(
              direction,
              true
            );


            button.classList.add(
              "pressed"
            );


            /*
              pointer capture를 사용하면
              손가락이 버튼 밖으로 약간 나가도
              pointerup을 받을 수 있다.
            */

            try {

              button.setPointerCapture(
                event.pointerId
              );

            }

            catch {

              // 지원하지 않는 브라우저는 무시

            }

          };


        const end =
          event => {

            event.preventDefault();

            event.stopPropagation();


            setDirection(
              direction,
              false
            );


            button.classList.remove(
              "pressed"
            );


            try {

              if (
                button.hasPointerCapture(
                  event.pointerId
                )
              ) {

                button.releasePointerCapture(
                  event.pointerId
                );

              }

            }

            catch {

              // 무시

            }

          };


        button.addEventListener(
          "pointerdown",
          start,
          {
            passive: false
          }
        );


        button.addEventListener(
          "pointerup",
          end,
          {
            passive: false
          }
        );


        button.addEventListener(
          "pointercancel",
          end,
          {
            passive: false
          }
        );


        button.addEventListener(
          "contextmenu",
          event => {

            event.preventDefault();

          }
        );

      }
    );

}


/* =====================================================
   INTERACT BUTTON
===================================================== */

function setupInteractButton(
  controls
) {

  const interact =
    controls.querySelector(
      "#mobile-interact"
    );


  if (
    !interact
  ) {

    return;

  }


  interact.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      event.stopPropagation();


      /*
        조사 입력은 Scene에서 한번 읽고
        false로 돌려놓는다.
      */

      pressInteract();


      interact.classList.add(
        "pressed"
      );

    },
    {
      passive: false
    }
  );


  const release =
    event => {

      event.preventDefault();

      event.stopPropagation();


      interact.classList.remove(
        "pressed"
      );

    };


  interact.addEventListener(
    "pointerup",
    release,
    {
      passive: false
    }
  );


  interact.addEventListener(
    "pointercancel",
    release,
    {
      passive: false
    }
  );


  interact.addEventListener(
    "contextmenu",
    event => {

      event.preventDefault();

    }
  );

}


/* =====================================================
   MOBILE CONTROL VISIBILITY
===================================================== */

function updateMobileControlsVisibility() {

  const controls =
    document.querySelector(
      "#mobile-game-controls"
    );


  const gameScreen =
    document.querySelector(
      "#game-screen"
    );


  if (
    !controls
  ) {

    return;

  }


  if (
    !gameScreen
  ) {

    controls.classList.remove(
      "mobile-controls-visible"
    );


    releaseAllTouchInput();


    return;

  }


  const gameVisible =
    !gameScreen.classList.contains(
      "hidden"
    );


  controls.classList.toggle(
    "mobile-controls-visible",
    gameVisible
  );


  if (
    !gameVisible
  ) {

    releaseAllTouchInput();

  }

}


/* =====================================================
   WATCH GAME SCREEN
===================================================== */

function observeGameScreen() {

  const gameScreen =
    document.querySelector(
      "#game-screen"
    );


  if (
    !gameScreen
  ) {

    return;

  }


  const observer =
    new MutationObserver(
      () => {

        updateMobileControlsVisibility();

      }
    );


  observer.observe(
    gameScreen,
    {

      attributes:
        true,

      attributeFilter:
        [
          "class",
          "style"
        ]

    }
  );

}


/* =====================================================
   SAFETY RELEASE
===================================================== */

window.addEventListener(
  "blur",
  () => {

    releaseAllTouchInput();

  }
);


document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      releaseAllTouchInput();

    }

  }
);


window.addEventListener(
  "pagehide",
  () => {

    releaseAllTouchInput();

  }
);


/* =====================================================
   RECORD NORMALIZATION
===================================================== */

function normalizeRecord(
  record
) {

  return {

    mapId:
      String(
        record?.mapId
        ??
        ""
      ),


    studentName:
      String(
        record?.studentName
        ??
        record?.name
        ??
        "이름 없음"
      ),


    playTime:
      Number(
        record?.playTime
        ??
        record?.seconds
        ??
        0
      ),


    questionsShown:
      Number(
        record?.questionsShown
        ??
        0
      ),


    firstTryCorrect:
      Number(
        record?.firstTryCorrect
        ??
        record?.firstTry
        ??
        0
      ),


    wrongAttempts:
      Number(
        record?.wrongAttempts
        ??
        record?.wrong
        ??
        0
      ),


    hintsUsed:
      Number(
        record?.hintsUsed
        ??
        0
      ),


    completed:
      record?.completed !==
      false,


    completedAt:
      record?.completedAt
      ??
      record?.createdAt
      ??
      ""

  };

}


/* =====================================================
   BUILD PLAYER RECORDS
===================================================== */

function buildPlayerRanking() {

  const records =
    getRecords()
      .map(
        normalizeRecord
      )
      .filter(
        record =>

          record.studentName

          &&

          record.completed

          &&

          record.mapId
      );


  const players =
    new Map();


  for (
    const record of
    records
  ) {

    if (
      !players.has(
        record.studentName
      )
    ) {

      players.set(
        record.studentName,
        {

          name:
            record.studentName,

          maps:
            new Map()

        }
      );

    }


    const player =
      players.get(
        record.studentName
      );


    const previous =
      player.maps.get(
        record.mapId
      );


    /*
      같은 닉네임이
      같은 맵을 여러 번 완료했다면
      가장 빠른 기록을 대표 기록으로 사용
    */

    if (
      !previous

      ||

      record.playTime <
      previous.playTime
    ) {

      player.maps.set(
        record.mapId,
        record
      );

    }

  }


  const ranking =
    [];


  for (
    const player of
    players.values()
  ) {

    const bestRecords =
      [
        ...player.maps.values()
      ];


    const totalTime =
      bestRecords.reduce(
        (
          sum,
          record
        ) =>

          sum +
          record.playTime,

        0
      );


    const totalQuestions =
      bestRecords.reduce(
        (
          sum,
          record
        ) =>

          sum +
          record.questionsShown,

        0
      );


    const firstCorrect =
      bestRecords.reduce(
        (
          sum,
          record
        ) =>

          sum +
          record.firstTryCorrect,

        0
      );


    const wrongAttempts =
      bestRecords.reduce(
        (
          sum,
          record
        ) =>

          sum +
          record.wrongAttempts,

        0
      );


    const hintsUsed =
      bestRecords.reduce(
        (
          sum,
          record
        ) =>

          sum +
          record.hintsUsed,

        0
      );


    const accuracy =
      totalQuestions > 0

        ? Math.round(
            (
              firstCorrect /
              totalQuestions
            )
            *
            100
          )

        : 0;


    ranking.push({

      name:
        player.name,

      clearedMaps:
        bestRecords.length,

      totalTime,

      totalQuestions,

      firstCorrect,

      wrongAttempts,

      hintsUsed,

      accuracy,

      records:
        bestRecords.sort(
          (
            a,
            b
          ) =>

            a.mapId.localeCompare(
              b.mapId
            )
        )

    });

  }


  ranking.sort(
    (
      a,
      b
    ) => {

      if (
        b.clearedMaps !==
        a.clearedMaps
      ) {

        return (
          b.clearedMaps -
          a.clearedMaps
        );

      }


      return (
        a.totalTime -
        b.totalTime
      );

    }
  );


  return ranking;

}


/* =====================================================
   RECORD BUTTON
===================================================== */

function createRecordButton() {

  if (
    document.querySelector(
      "#records-btn"
    )
  ) {

    return;

  }


  const container =
    document.querySelector(
      ".title-small-buttons"
    );


  if (
    !container
  ) {

    return;

  }


  const button =
    document.createElement(
      "button"
    );


  button.id =
    "records-btn";


  button.type =
    "button";


  button.className =
    "text-button";


  button.textContent =
    "기록 보기";


  container.prepend(
    button
  );


  button.addEventListener(
    "click",
    showRecordBoard
  );

}


/* =====================================================
   RECORD BOARD
===================================================== */

function showRecordBoard() {

  const existing =
    document.querySelector(
      "#record-overlay"
    );


  existing?.remove();


  const ranking =
    buildPlayerRanking();


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "record-overlay";


  overlay.className =
    "record-overlay";


  let rows =
    "";


  if (
    ranking.length ===
    0
  ) {

    rows = `

      <div class="record-empty">

        아직 저장된 기록이 없습니다.

        <br><br>

        모험을 완료하면
        이곳에 기록이 표시됩니다.

      </div>

    `;

  }

  else {

    rows =
      ranking
        .map(
          (
            player,
            index
          ) => {

            const completeText =
              player.clearedMaps >= 12

                ? "전체 클리어"

                : `${player.clearedMaps}/12 맵`;


            return `

              <button
                type="button"
                class="record-player-row"
                data-player="${escapeHtml(
                  player.name
                )}"
              >

                <span class="record-rank">

                  ${index + 1}

                </span>


                <span class="record-player-name">

                  ${escapeHtml(
                    player.name
                  )}

                </span>


                <span class="record-map-count">

                  ${completeText}

                </span>


                <span class="record-time">

                  ${formatTime(
                    player.totalTime
                  )}

                </span>


                <span class="record-accuracy">

                  ${player.accuracy}%

                </span>

              </button>

            `;

          }
        )
        .join("");

  }


  overlay.innerHTML = `

    <section class="record-panel">

      <header class="record-header">

        <div>

          <div class="record-small-title">

            WISDOM MAZE RECORDS

          </div>


          <h2>

            모험 기록

          </h2>


          <p>

            이 기기에 저장된 닉네임별 최고 기록

          </p>

        </div>


        <button
          id="record-close"
          class="record-close"
          type="button"
          aria-label="닫기"
        >
          ×
        </button>

      </header>


      <div class="record-columns">

        <span>
          순위
        </span>

        <span>
          닉네임
        </span>

        <span>
          클리어
        </span>

        <span>
          해결시간
        </span>

        <span>
          정답률
        </span>

      </div>


      <div class="record-list">

        ${rows}

      </div>


      <div class="record-note">

        같은 닉네임으로 같은 맵을 여러 번 완료한 경우
        가장 빠른 클리어 기록을 표시합니다.

      </div>

    </section>

  `;


  document.body.appendChild(
    overlay
  );


  const close =
    () => {

      overlay.remove();

    };


  overlay
    .querySelector(
      "#record-close"
    )
    ?.addEventListener(
      "click",
      close
    );


  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        overlay
      ) {

        close();

      }

    }
  );


  overlay
    .querySelectorAll(
      ".record-player-row"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const player =
              ranking.find(
                item =>

                  item.name ===
                  button.dataset.player
              );


            if (
              player
            ) {

              showPlayerDetail(
                player
              );

            }

          }
        );

      }
    );

}


/* =====================================================
   PLAYER DETAIL
===================================================== */

function showPlayerDetail(
  player
) {

  const existing =
    document.querySelector(
      "#record-detail"
    );


  existing?.remove();


  const detail =
    document.createElement(
      "div"
    );


  detail.id =
    "record-detail";


  detail.className =
    "record-detail";


  const mapRows =
    player.records
      .map(
        record => {

          const mapName =
            MAP_NAMES[
              record.mapId
            ]
            ??
            record.mapId;


          return `

            <div class="record-map-row">

              <div>

                <strong>

                  ${escapeHtml(
                    record.mapId
                  )}

                </strong>


                <span>

                  ${escapeHtml(
                    mapName
                  )}

                </span>

              </div>


              <strong>

                ${formatTime(
                  record.playTime
                )}

              </strong>

            </div>

          `;

        }
      )
      .join("");


  detail.innerHTML = `

    <section class="record-detail-card">

      <button
        type="button"
        id="record-detail-close"
        class="record-close"
        aria-label="닫기"
      >
        ×
      </button>


      <h3>

        ${escapeHtml(
          player.name
        )}

      </h3>


      <div class="record-summary-grid">

        <div>

          <span>
            클리어
          </span>

          <strong>
            ${player.clearedMaps}/12
          </strong>

        </div>


        <div>

          <span>
            총 해결시간
          </span>

          <strong>
            ${formatTime(
              player.totalTime
            )}
          </strong>

        </div>


        <div>

          <span>
            첫 시도 정답률
          </span>

          <strong>
            ${player.accuracy}%
          </strong>

        </div>


        <div>

          <span>
            오답
          </span>

          <strong>
            ${player.wrongAttempts}
          </strong>

        </div>


        <div>

          <span>
            힌트
          </span>

          <strong>
            ${player.hintsUsed}
          </strong>

        </div>

      </div>


      <div class="record-map-list">

        ${mapRows}

      </div>

    </section>

  `;


  document.body.appendChild(
    detail
  );


  detail
    .querySelector(
      "#record-detail-close"
    )
    ?.addEventListener(
      "click",
      () => {

        detail.remove();

      }
    );


  detail.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        detail
      ) {

        detail.remove();

      }

    }
  );

}


/* =====================================================
   STYLE
===================================================== */

function injectStyle() {

  if (
    document.querySelector(
      "#mobile-record-style"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "mobile-record-style";


  style.textContent = `

    /* =================================================
       MOBILE CONTROLS
    ================================================= */

    #mobile-game-controls {
      display: none;
      box-sizing: border-box;
    }


    @media (max-width: 900px) {

      body {
        overscroll-behavior: none;
      }


      #mobile-game-controls.mobile-controls-visible {

        display: flex;

        width: min(
          768px,
          100%
        );

        margin:
          0
          auto
          12px;

        padding:
          10px
          16px
          15px;

        box-sizing:
          border-box;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          20px;

        background:
          linear-gradient(
            180deg,
            #111b31,
            #08101f
          );

        border-top:
          1px solid
          rgba(
            125,
            158,
            220,
            0.34
          );

        border-bottom-left-radius:
          14px;

        border-bottom-right-radius:
          14px;

        touch-action:
          manipulation;

        user-select:
          none;

        -webkit-user-select:
          none;

        -webkit-touch-callout:
          none;
      }


      /*
        기존 PC 조작 안내가 있다면
        모바일에서는 감춘다.
      */

      .game-controls {
        display:
          none
          !important;
      }


      .wisdom-mobile-dpad {

        width:
          172px;

        height:
          172px;

        flex:
          0
          0
          172px;

        display:
          grid;

        grid-template-columns:
          repeat(
            3,
            52px
          );

        grid-template-rows:
          repeat(
            3,
            52px
          );

        gap:
          8px;

        align-content:
          center;

        justify-content:
          center;

        touch-action:
          none;
      }


      .wisdom-touch-key {

        width:
          52px;

        height:
          52px;

        padding:
          0;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        border:
          2px solid
          #7599d7;

        border-radius:
          14px;

        color:
          #ffffff;

        font-family:
          Arial,
          sans-serif;

        font-size:
          22px;

        font-weight:
          900;

        line-height:
          1;

        background:
          linear-gradient(
            180deg,
            #456aa7,
            #243a69
          );

        box-shadow:
          0
          5px
          0
          #0a1429;

        cursor:
          pointer;

        touch-action:
          none;

        user-select:
          none;

        -webkit-user-select:
          none;

        -webkit-tap-highlight-color:
          transparent;
      }


      .wisdom-touch-key.pressed {

        transform:
          translateY(
            4px
          );

        box-shadow:
          0
          1px
          0
          #0a1429;

        color:
          #ffffff;

        background:
          linear-gradient(
            180deg,
            #6f9fec,
            #365990
          );
      }


      .wisdom-touch-up {

        grid-column:
          2;

        grid-row:
          1;
      }


      .wisdom-touch-left {

        grid-column:
          1;

        grid-row:
          2;
      }


      .wisdom-touch-center {

        grid-column:
          2;

        grid-row:
          2;

        border:
          1px solid
          rgba(
            128,
            158,
            211,
            0.16
          );

        border-radius:
          50%;

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );
      }


      .wisdom-touch-right {

        grid-column:
          3;

        grid-row:
          2;
      }


      .wisdom-touch-down {

        grid-column:
          2;

        grid-row:
          3;
      }


      .wisdom-mobile-action-area {

        min-width:
          105px;

        flex:
          1;

        display:
          flex;

        align-items:
          center;

        justify-content:
          flex-end;

        padding-right:
          5px;

        touch-action:
          none;
      }


      .wisdom-mobile-interact {

        width:
          96px;

        height:
          96px;

        padding:
          0;

        display:
          flex;

        flex-direction:
          column;

        align-items:
          center;

        justify-content:
          center;

        gap:
          2px;

        border:
          3px solid
          #ffdf78;

        border-radius:
          50%;

        color:
          #372300;

        font-family:
          Arial,
          sans-serif;

        font-weight:
          900;

        background:
          linear-gradient(
            180deg,
            #fff3a6,
            #f4b840
          );

        box-shadow:
          0
          6px
          0
          #815011;

        cursor:
          pointer;

        touch-action:
          none;

        user-select:
          none;

        -webkit-user-select:
          none;

        -webkit-tap-highlight-color:
          transparent;
      }


      .wisdom-mobile-interact.pressed {

        transform:
          translateY(
            5px
          );

        box-shadow:
          0
          1px
          0
          #815011;

        background:
          linear-gradient(
            180deg,
            #fff8c9,
            #ffd15a
          );
      }


      .wisdom-interact-main {

        font-size:
          18px;

        line-height:
          1.1;
      }


      .wisdom-interact-sub {

        font-size:
          10px;

        opacity:
          0.7;
      }

    }


    /*
      아주 작은 휴대폰
    */

    @media (max-width: 390px) {

      #mobile-game-controls.mobile-controls-visible {

        padding:
          8px
          10px
          12px;

        gap:
          10px;
      }


      .wisdom-mobile-dpad {

        width:
          151px;

        height:
          151px;

        flex-basis:
          151px;

        grid-template-columns:
          repeat(
            3,
            46px
          );

        grid-template-rows:
          repeat(
            3,
            46px
          );

        gap:
          6px;
      }


      .wisdom-touch-key {

        width:
          46px;

        height:
          46px;

        font-size:
          19px;

        border-radius:
          12px;
      }


      .wisdom-mobile-interact {

        width:
          84px;

        height:
          84px;
      }


      .wisdom-interact-main {

        font-size:
          16px;
      }

    }


    /* =================================================
       RECORD BOARD
    ================================================= */

    .record-overlay,
    .record-detail {

      position:
        fixed;

      inset:
        0;

      z-index:
        20000;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      padding:
        18px;

      box-sizing:
        border-box;

      background:
        rgba(
          2,
          5,
          12,
          0.9
        );

      backdrop-filter:
        blur(
          8px
        );

    }


    .record-panel,
    .record-detail-card {

      position:
        relative;

      width:
        min(
          820px,
          100%
        );

      max-height:
        calc(
          100vh -
          36px
        );

      overflow-y:
        auto;

      padding:
        24px;

      box-sizing:
        border-box;

      border:
        2px solid
        #445b8b;

      border-radius:
        18px;

      color:
        #ffffff;

      background:
        linear-gradient(
          180deg,
          #17213c,
          #0a1121
        );

      box-shadow:
        0
        30px
        100px
        rgba(
          0,
          0,
          0,
          0.75
        );
    }


    .record-header {

      display:
        flex;

      align-items:
        flex-start;

      justify-content:
        space-between;

      gap:
        20px;

      margin-bottom:
        20px;
    }


    .record-header h2,
    .record-detail-card h3 {

      margin:
        4px
        0;

      font-size:
        28px;
    }


    .record-header p {

      margin:
        5px
        0
        0;

      color:
        #9fb2d8;
    }


    .record-small-title {

      color:
        #ffd966;

      font-size:
        11px;

      font-weight:
        900;

      letter-spacing:
        0.16em;
    }


    .record-close {

      width:
        42px;

      height:
        42px;

      flex:
        0
        0
        42px;

      padding:
        0;

      border:
        1px solid
        #53698f;

      border-radius:
        10px;

      color:
        #ffffff;

      font-size:
        25px;

      cursor:
        pointer;

      background:
        #1b2947;
    }


    .record-columns,
    .record-player-row {

      display:
        grid;

      grid-template-columns:
        55px
        minmax(
          110px,
          1.5fr
        )
        90px
        130px
        70px;

      align-items:
        center;

      gap:
        10px;
    }


    .record-columns {

      padding:
        8px
        12px;

      color:
        #91a7cf;

      font-size:
        11px;
    }


    .record-player-row {

      width:
        100%;

      margin-bottom:
        7px;

      padding:
        13px
        12px;

      border:
        1px solid
        #33486f;

      border-radius:
        12px;

      color:
        #ffffff;

      text-align:
        left;

      cursor:
        pointer;

      background:
        #101a30;
    }


    .record-player-row:hover {

      border-color:
        #7aa7ff;

      background:
        #172744;
    }


    .record-rank {

      color:
        #ffe179;

      font-size:
        18px;

      font-weight:
        900;
    }


    .record-player-name {

      overflow:
        hidden;

      font-weight:
        900;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;
    }


    .record-map-count,
    .record-time,
    .record-accuracy {

      color:
        #c6d8fa;

      font-size:
        13px;
    }


    .record-note {

      margin-top:
        18px;

      color:
        #8598bd;

      font-size:
        12px;

      line-height:
        1.6;
    }


    .record-empty {

      padding:
        45px
        20px;

      color:
        #aebddb;

      line-height:
        1.8;

      text-align:
        center;
    }


    .record-detail {

      z-index:
        21000;
    }


    .record-detail-card {

      width:
        min(
          650px,
          100%
        );
    }


    .record-detail-card
    > .record-close {

      position:
        absolute;

      top:
        16px;

      right:
        16px;
    }


    .record-summary-grid {

      display:
        grid;

      grid-template-columns:
        repeat(
          5,
          1fr
        );

      gap:
        10px;

      margin:
        20px
        0;
    }


    .record-summary-grid div {

      padding:
        13px
        8px;

      border:
        1px solid
        #33486f;

      border-radius:
        10px;

      text-align:
        center;

      background:
        #101a30;
    }


    .record-summary-grid span {

      display:
        block;

      margin-bottom:
        5px;

      color:
        #8fa5cd;

      font-size:
        11px;
    }


    .record-summary-grid strong {

      color:
        #ffe178;

      font-size:
        15px;
    }


    .record-map-row {

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        12px;

      padding:
        12px
        4px;

      border-bottom:
        1px solid
        rgba(
          113,
          137,
          181,
          0.2
        );
    }


    .record-map-row div {

      display:
        flex;

      flex-direction:
        column;

      gap:
        3px;
    }


    .record-map-row span {

      color:
        #9eb1d5;

      font-size:
        12px;
    }


    @media (max-width: 620px) {

      .record-columns {

        display:
          none;
      }


      .record-player-row {

        grid-template-columns:
          38px
          1fr
          auto;

        gap:
          7px;
      }


      .record-time {

        grid-column:
          2 / 3;
      }


      .record-accuracy {

        grid-column:
          3 / 4;
      }


      .record-summary-grid {

        grid-template-columns:
          1fr
          1fr;
      }


      .record-panel,
      .record-detail-card {

        padding:
          18px;
      }


      .record-header h2,
      .record-detail-card h3 {

        font-size:
          23px;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =====================================================
   INIT
===================================================== */

function initMobileRecords() {

  injectStyle();


  createMobileControls();


  createRecordButton();


  observeGameScreen();


  updateMobileControlsVisibility();

}


/* =====================================================
   DOM READY
===================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initMobileRecords
  );

}

else {

  initMobileRecords();

}
