import {
  getRecords,
  MAP_NAMES
} from "./data.js";


/* =====================================================
   WISDOM MAZE
   MOBILE CONTROLS + LOCAL RECORD BOARD
===================================================== */


/* =====================================================
   HELPERS
===================================================== */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatTime(seconds) {

  const value =
    Math.max(
      0,
      Number(seconds) || 0
    );


  const hours =
    Math.floor(
      value / 3600
    );


  const minutes =
    Math.floor(
      (value % 3600) / 60
    );


  const secs =
    Math.floor(
      value % 60
    );


  if (hours > 0) {

    return `${hours}시간 ${minutes}분 ${secs}초`;

  }


  if (minutes > 0) {

    return `${minutes}분 ${secs}초`;

  }


  return `${secs}초`;

}


/* =====================================================
   SYNTHETIC KEYBOARD
   Phaser 기존 키보드 코드를 그대로 사용하기 위함
===================================================== */

const pressedKeys =
  new Set();


function dispatchKeyboard(
  type,
  key,
  code
) {

  const event =
    new KeyboardEvent(
      type,
      {
        key,
        code,

        bubbles:
          true,

        cancelable:
          true
      }
    );


  window.dispatchEvent(
    event
  );

}


function pressKey(
  key,
  code
) {

  if (
    pressedKeys.has(
      code
    )
  ) {

    return;

  }


  pressedKeys.add(
    code
  );


  dispatchKeyboard(
    "keydown",
    key,
    code
  );

}


function releaseKey(
  key,
  code
) {

  if (
    !pressedKeys.has(
      code
    )
  ) {

    return;

  }


  pressedKeys.delete(
    code
  );


  dispatchKeyboard(
    "keyup",
    key,
    code
  );

}


function tapKey(
  key,
  code
) {

  pressKey(
    key,
    code
  );


  window.setTimeout(
    () => {

      releaseKey(
        key,
        code
      );

    },
    80
  );

}


/* =====================================================
   RELEASE ALL
===================================================== */

function releaseAllKeys() {

  releaseKey(
    "ArrowUp",
    "ArrowUp"
  );


  releaseKey(
    "ArrowDown",
    "ArrowDown"
  );


  releaseKey(
    "ArrowLeft",
    "ArrowLeft"
  );


  releaseKey(
    "ArrowRight",
    "ArrowRight"
  );


  releaseKey(
    "e",
    "KeyE"
  );

}


window.addEventListener(
  "blur",
  releaseAllKeys
);


document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      releaseAllKeys();

    }

  }
);


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


  controls.innerHTML = `

    <div class="mobile-dpad">

      <button
        type="button"
        class="touch-key touch-up"
        data-key="up"
        aria-label="위로 이동"
      >
        ▲
      </button>

      <button
        type="button"
        class="touch-key touch-left"
        data-key="left"
        aria-label="왼쪽으로 이동"
      >
        ◀
      </button>

      <div class="touch-center">
      </div>

      <button
        type="button"
        class="touch-key touch-right"
        data-key="right"
        aria-label="오른쪽으로 이동"
      >
        ▶
      </button>

      <button
        type="button"
        class="touch-key touch-down"
        data-key="down"
        aria-label="아래로 이동"
      >
        ▼
      </button>

    </div>


    <button
      type="button"
      id="mobile-interact"
      class="mobile-interact"
      aria-label="조사하기"
    >
      조사
    </button>

  `;


  document.body.appendChild(
    controls
  );


  const keyMap = {

    up: {
      key:
        "ArrowUp",

      code:
        "ArrowUp"
    },

    down: {
      key:
        "ArrowDown",

      code:
        "ArrowDown"
    },

    left: {
      key:
        "ArrowLeft",

      code:
        "ArrowLeft"
    },

    right: {
      key:
        "ArrowRight",

      code:
        "ArrowRight"
    }

  };


  controls
    .querySelectorAll(
      ".touch-key"
    )
    .forEach(
      button => {

        const info =
          keyMap[
            button.dataset.key
          ];


        if (!info) {

          return;

        }


        const start =
          event => {

            event.preventDefault();


            pressKey(
              info.key,
              info.code
            );


            button.classList.add(
              "pressed"
            );

          };


        const end =
          event => {

            event.preventDefault();


            releaseKey(
              info.key,
              info.code
            );


            button.classList.remove(
              "pressed"
            );

          };


        button.addEventListener(
          "pointerdown",
          start
        );


        button.addEventListener(
          "pointerup",
          end
        );


        button.addEventListener(
          "pointercancel",
          end
        );


        button.addEventListener(
          "pointerleave",
          event => {

            if (
              event.buttons !== 0
            ) {

              end(
                event
              );

            }

          }
        );

      }
    );


  const interact =
    controls.querySelector(
      "#mobile-interact"
    );


  interact
    ?.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();


        interact.classList.add(
          "pressed"
        );


        tapKey(
          "e",
          "KeyE"
        );

      }
    );


  [
    "pointerup",
    "pointercancel",
    "pointerleave"
  ].forEach(
    name => {

      interact
        ?.addEventListener(
          name,
          () => {

            interact.classList.remove(
              "pressed"
            );

          }
        );

    }
  );


  updateMobileControlsVisibility();

}


/* =====================================================
   SHOW CONTROLS ONLY DURING GAME
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
    ||
    !gameScreen
  ) {

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

    releaseAllKeys();

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


  if (!gameScreen) {

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
          "class"
        ]
    }
  );

}


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
   BEST RECORD PER MAP
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
      같은 맵을 여러 번 클리어했다면
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


  if (!container) {

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

        아직 저장된 기록이 없습니다.<br>

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
        가장 빠른 클리어 기록을 사용합니다.

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

    /* ==============================
       MOBILE CONTROLS
    ============================== */

    #mobile-game-controls {
      display: none;
    }


    @media (max-width: 900px) {

      body {
        overscroll-behavior: none;
      }


      #mobile-game-controls.mobile-controls-visible {
        width: min(768px, calc(100% - 12px));

        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 14px;

        margin: 4px auto 14px;

        padding: 8px 12px 12px;

        touch-action: none;

        user-select: none;

        -webkit-user-select: none;
      }


      .game-controls {
        display: none !important;
      }


      .mobile-dpad {
        width: 168px;
        height: 168px;

        display: grid;

        grid-template-columns:
          repeat(3, 52px);

        grid-template-rows:
          repeat(3, 52px);

        gap: 6px;
      }


      .touch-key,
      .mobile-interact {
        border:
          2px solid
          rgba(
            187,
            216,
            255,
            0.9
          );

        color:
          #ffffff;

        font-weight:
          900;

        background:
          linear-gradient(
            180deg,
            rgba(
              66,
              101,
              170,
              0.96
            ),
            rgba(
              24,
              44,
              84,
              0.96
            )
          );

        box-shadow:
          0 5px 0
          #0b1730;

        touch-action:
          none;

        -webkit-tap-highlight-color:
          transparent;
      }


      .touch-key {
        width: 52px;
        height: 52px;

        border-radius: 14px;

        font-size: 21px;
      }


      .touch-key.pressed,
      .mobile-interact.pressed {
        transform:
          translateY(
            4px
          );

        box-shadow:
          0 1px 0
          #0b1730;

        filter:
          brightness(
            1.2
          );
      }


      .touch-up {
        grid-column: 2;
        grid-row: 1;
      }


      .touch-left {
        grid-column: 1;
        grid-row: 2;
      }


      .touch-center {
        grid-column: 2;
        grid-row: 2;

        border-radius:
          50%;

        background:
          rgba(
            255,
            255,
            255,
            0.04
          );
      }


      .touch-right {
        grid-column: 3;
        grid-row: 2;
      }


      .touch-down {
        grid-column: 2;
        grid-row: 3;
      }


      .mobile-interact {
        width: 92px;
        height: 92px;

        border-radius:
          50%;

        border-color:
          #ffe49a;

        color:
          #3a2500;

        font-size:
          18px;

        background:
          linear-gradient(
            180deg,
            #fff2a7,
            #f4b83e
          );

        box-shadow:
          0 6px 0
          #875313;
      }

    }


    /* ==============================
       RECORD BOARD
    ============================== */

    .record-overlay,
    .record-detail {
      position: fixed;

      inset: 0;

      z-index: 20000;

      display: flex;

      align-items: center;

      justify-content: center;

      padding: 18px;

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
      position: relative;

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
        0 30px 100px
        rgba(
          0,
          0,
          0,
          0.75
        );
    }


    .record-header {
      display: flex;

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
        4px 0;

      font-size:
        28px;
    }


    .record-header p {
      margin:
        5px 0 0;

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
        0 0 42px;

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
      display: grid;

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
        8px 12px;

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
        13px 12px;

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
        45px 20px;

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
        20px 0;
    }


    .record-summary-grid div {
      padding:
        13px 8px;

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
        12px 4px;

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


    @media (
      max-width:
        620px
    ) {

      .record-columns {
        display:
          none;
      }


      .record-player-row {
        grid-template-columns:
          38px 1fr
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
          1fr 1fr;
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
