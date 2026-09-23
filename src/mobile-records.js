import {
  getRecords,
  MAP_NAMES
} from "./data.js";


/* =====================================================
   WISDOM MAZE
   MOBILE TOUCH CONTROLS + LOCAL RECORDS
===================================================== */


/* =====================================================
   GLOBAL TOUCH STATE
===================================================== */

window.WisdomTouchInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  interactPressed: false
};


function touchState() {

  if (!window.WisdomTouchInput) {

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


function clearTouchInput() {

  const touch =
    touchState();


  touch.up = false;
  touch.down = false;
  touch.left = false;
  touch.right = false;
  touch.interactPressed = false;


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
   MOBILE CONTROLS
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

    <div class="mobile-control-inner">

      <div
        class="mobile-dpad"
        aria-label="이동 방향키"
      >

        <button
          type="button"
          class="mobile-key key-up"
          data-direction="up"
          aria-label="위로 이동"
        >
          ▲
        </button>


        <button
          type="button"
          class="mobile-key key-left"
          data-direction="left"
          aria-label="왼쪽으로 이동"
        >
          ◀
        </button>


        <div
          class="mobile-dpad-center"
          aria-hidden="true"
        ></div>


        <button
          type="button"
          class="mobile-key key-right"
          data-direction="right"
          aria-label="오른쪽으로 이동"
        >
          ▶
        </button>


        <button
          type="button"
          class="mobile-key key-down"
          data-direction="down"
          aria-label="아래로 이동"
        >
          ▼
        </button>

      </div>


      <button
        type="button"
        id="mobile-interact"
        class="mobile-interact"
        aria-label="조사"
      >
        <strong>
          조사
        </strong>

        <span>
          E
        </span>
      </button>

    </div>

  `;


  /*
    맵(.game-stage) 바로 밑에 붙인다.
  */

  const gameStage =
    document.querySelector(
      "#game-screen .game-stage"
    );


  if (gameStage) {

    gameStage.insertAdjacentElement(
      "afterend",
      controls
    );

  }

  else {

    const gameScreen =
      document.querySelector(
        "#game-screen"
      );


    if (gameScreen) {

      gameScreen.appendChild(
        controls
      );

    }

    else {

      document.body.appendChild(
        controls
      );

    }

  }


  setupDirectionButtons(
    controls
  );


  setupInteractButton(
    controls
  );


  updateMobileVisibility();
}


/* =====================================================
   DIRECTION BUTTONS
===================================================== */

function setupDirectionButtons(
  controls
) {

  const buttons =
    controls.querySelectorAll(
      ".mobile-key"
    );


  buttons.forEach(
    button => {

      const direction =
        button.dataset.direction;


      const press =
        event => {

          event.preventDefault();
          event.stopPropagation();


          const touch =
            touchState();


          touch[direction] =
            true;


          button.classList.add(
            "pressed"
          );


          try {

            button.setPointerCapture(
              event.pointerId
            );

          }

          catch {
            // 일부 모바일 브라우저에서는 없어도 됨
          }

        };


      const release =
        event => {

          event.preventDefault();
          event.stopPropagation();


          const touch =
            touchState();


          touch[direction] =
            false;


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
        press,
        {
          passive: false
        }
      );


      button.addEventListener(
        "pointerup",
        release,
        {
          passive: false
        }
      );


      button.addEventListener(
        "pointercancel",
        release,
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

  const button =
    controls.querySelector(
      "#mobile-interact"
    );


  if (!button) {

    return;
  }


  button.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();
      event.stopPropagation();


      /*
        Scene update()에서 한 번 사용 후
        false로 돌려놓는다.
      */

      touchState()
        .interactPressed =
        true;


      button.classList.add(
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


      button.classList.remove(
        "pressed"
      );

    };


  button.addEventListener(
    "pointerup",
    release,
    {
      passive: false
    }
  );


  button.addEventListener(
    "pointercancel",
    release,
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


/* =====================================================
   VISIBILITY
===================================================== */

function updateMobileVisibility() {

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


  const visible =
    !gameScreen.classList.contains(
      "hidden"
    );


  controls.classList.toggle(
    "visible",
    visible
  );


  if (!visible) {

    clearTouchInput();

  }

}


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

        updateMobileVisibility();

      }
    );


  observer.observe(
    gameScreen,
    {
      attributes: true,

      attributeFilter: [
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
  clearTouchInput
);


window.addEventListener(
  "pagehide",
  clearTouchInput
);


document.addEventListener(
  "visibilitychange",
  () => {

    if (document.hidden) {

      clearTouchInput();

    }

  }
);


/* =====================================================
   RECORD HELPERS
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

  const total =
    Math.max(
      0,
      Number(seconds) || 0
    );


  const hours =
    Math.floor(
      total / 3600
    );


  const minutes =
    Math.floor(
      (total % 3600) / 60
    );


  const secs =
    Math.floor(
      total % 60
    );


  if (hours > 0) {

    return (
      `${hours}시간 ${minutes}분 ${secs}초`
    );

  }


  if (minutes > 0) {

    return (
      `${minutes}분 ${secs}초`
    );

  }


  return `${secs}초`;
}


/* =====================================================
   RECORD RANKING
===================================================== */

function buildRanking() {

  const raw =
    getRecords();


  const players =
    new Map();


  for (
    const source of
    raw
  ) {

    const record = {

      mapId:
        String(
          source?.mapId ?? ""
        ),

      name:
        String(
          source?.studentName
          ??
          source?.name
          ??
          ""
        ).trim(),

      playTime:
        Number(
          source?.playTime
          ??
          source?.seconds
          ??
          0
        ),

      questions:
        Number(
          source?.questionsShown
          ??
          0
        ),

      firstCorrect:
        Number(
          source?.firstTryCorrect
          ??
          source?.firstTry
          ??
          0
        ),

      wrong:
        Number(
          source?.wrongAttempts
          ??
          source?.wrong
          ??
          0
        ),

      hints:
        Number(
          source?.hintsUsed
          ??
          0
        ),

      completed:
        source?.completed !==
        false

    };


    if (
      !record.name
      ||
      !record.mapId
      ||
      !record.completed
    ) {

      continue;
    }


    if (
      !players.has(
        record.name
      )
    ) {

      players.set(
        record.name,
        new Map()
      );

    }


    const maps =
      players.get(
        record.name
      );


    const previous =
      maps.get(
        record.mapId
      );


    if (
      !previous
      ||
      record.playTime <
      previous.playTime
    ) {

      maps.set(
        record.mapId,
        record
      );

    }

  }


  const result =
    [];


  for (
    const [
      name,
      maps
    ] of
    players.entries()
  ) {

    const records =
      [
        ...maps.values()
      ]
        .sort(
          (
            a,
            b
          ) =>

            a.mapId.localeCompare(
              b.mapId
            )
        );


    const totalTime =
      records.reduce(
        (
          sum,
          item
        ) =>

          sum +
          item.playTime,

        0
      );


    const totalQuestions =
      records.reduce(
        (
          sum,
          item
        ) =>

          sum +
          item.questions,

        0
      );


    const firstCorrect =
      records.reduce(
        (
          sum,
          item
        ) =>

          sum +
          item.firstCorrect,

        0
      );


    const wrong =
      records.reduce(
        (
          sum,
          item
        ) =>

          sum +
          item.wrong,

        0
      );


    const hints =
      records.reduce(
        (
          sum,
          item
        ) =>

          sum +
          item.hints,

        0
      );


    const accuracy =
      totalQuestions > 0

        ? Math.round(
            firstCorrect /
            totalQuestions *
            100
          )

        : 0;


    result.push({

      name,

      records,

      cleared:
        records.length,

      totalTime,

      accuracy,

      wrong,

      hints

    });

  }


  result.sort(
    (
      a,
      b
    ) => {

      if (
        b.cleared !==
        a.cleared
      ) {

        return (
          b.cleared -
          a.cleared
        );

      }


      return (
        a.totalTime -
        b.totalTime
      );

    }
  );


  return result;
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

  document
    .querySelector(
      "#record-overlay"
    )
    ?.remove();


  const ranking =
    buildRanking();


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "record-overlay";


  overlay.className =
    "wisdom-record-overlay";


  const playerRows =
    ranking.length

      ? ranking
          .map(
            (
              player,
              index
            ) => `

              <button
                type="button"
                class="wisdom-record-player"
                data-index="${index}"
              >

                <strong>
                  ${index + 1}.
                  ${escapeHtml(
                    player.name
                  )}
                </strong>

                <span>
                  ${player.cleared}/12 맵
                </span>

                <span>
                  ${formatTime(
                    player.totalTime
                  )}
                </span>

                <span>
                  정답률 ${player.accuracy}%
                </span>

              </button>

            `
          )
          .join("")

      : `

        <div class="wisdom-record-empty">

          아직 저장된 클리어 기록이 없습니다.

        </div>

      `;


  overlay.innerHTML = `

    <div class="wisdom-record-panel">

      <header>

        <div>

          <small>
            WISDOM MAZE RECORDS
          </small>

          <h2>
            모험 기록
          </h2>

        </div>


        <button
          type="button"
          id="record-close"
          class="wisdom-record-close"
        >
          ×
        </button>

      </header>


      <div class="wisdom-record-list">

        ${playerRows}

      </div>


      <div
        id="record-player-detail"
        class="wisdom-record-detail"
      ></div>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  overlay
    .querySelector(
      "#record-close"
    )
    ?.addEventListener(
      "click",
      () => {

        overlay.remove();

      }
    );


  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        overlay
      ) {

        overlay.remove();

      }

    }
  );


  overlay
    .querySelectorAll(
      ".wisdom-record-player"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );


            showRecordDetail(
              ranking[index],
              overlay
            );

          }
        );

      }
    );
}


function showRecordDetail(
  player,
  overlay
) {

  if (!player) {

    return;
  }


  const container =
    overlay.querySelector(
      "#record-player-detail"
    );


  if (!container) {

    return;
  }


  container.innerHTML = `

    <h3>
      ${escapeHtml(
        player.name
      )}
    </h3>


    <p>
      클리어 ${player.cleared}/12
      · 총 ${formatTime(
        player.totalTime
      )}
      · 정답률 ${player.accuracy}%
      · 오답 ${player.wrong}
      · 힌트 ${player.hints}
    </p>


    <div class="wisdom-record-maps">

      ${player.records
        .map(
          item => `

            <div>

              <span>

                ${escapeHtml(
                  item.mapId
                )}

                ${escapeHtml(
                  MAP_NAMES[
                    item.mapId
                  ]
                  ??
                  ""
                )}

              </span>

              <strong>

                ${formatTime(
                  item.playTime
                )}

              </strong>

            </div>

          `
        )
        .join("")}

    </div>

  `;
}


/* =====================================================
   STYLE
===================================================== */

function injectStyles() {

  if (
    document.querySelector(
      "#wisdom-mobile-style"
    )
  ) {

    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "wisdom-mobile-style";


  style.textContent = `

    /* ================================================
       MOBILE TOUCH CONTROLS
    ================================================ */

    #mobile-game-controls {
      display: none;
      box-sizing: border-box;
    }


    @media (max-width: 900px) {

      #game-screen .game-controls {
        display: none !important;
      }


      #mobile-game-controls.visible {

        display: block;

        width: 100%;

        padding: 10px 14px 14px;

        box-sizing: border-box;

        background:
          linear-gradient(
            180deg,
            #121d34,
            #08101f
          );

        border-top:
          1px solid
          rgba(130,160,220,.35);

        border-bottom-left-radius:
          14px;

        border-bottom-right-radius:
          14px;

        user-select: none;

        -webkit-user-select: none;

        -webkit-touch-callout: none;
      }


      .mobile-control-inner {

        width: 100%;

        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 24px;
      }


      .mobile-dpad {

        width: 166px;

        height: 166px;

        flex: 0 0 166px;

        display: grid;

        grid-template-columns:
          repeat(3, 50px);

        grid-template-rows:
          repeat(3, 50px);

        gap: 8px;

        align-content: center;

        justify-content: center;

        touch-action: none;
      }


      .mobile-key {

        width: 50px;

        height: 50px;

        padding: 0;

        border:
          2px solid
          #7da6e9;

        border-radius:
          13px;

        color:
          white;

        font-size:
          20px;

        font-weight:
          900;

        background:
          linear-gradient(
            #456ca9,
            #223a68
          );

        box-shadow:
          0 5px 0 #071126;

        touch-action: none;

        -webkit-tap-highlight-color:
          transparent;
      }


      .mobile-key.pressed {

        transform:
          translateY(4px);

        box-shadow:
          0 1px 0 #071126;

        background:
          #5f8bd2;
      }


      .key-up {
        grid-column: 2;
        grid-row: 1;
      }


      .key-left {
        grid-column: 1;
        grid-row: 2;
      }


      .mobile-dpad-center {

        grid-column: 2;
        grid-row: 2;

        border-radius: 50%;

        background:
          rgba(255,255,255,.04);
      }


      .key-right {
        grid-column: 3;
        grid-row: 2;
      }


      .key-down {
        grid-column: 2;
        grid-row: 3;
      }


      .mobile-interact {

        width: 94px;

        height: 94px;

        flex: 0 0 94px;

        padding: 0;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        border:
          3px solid
          #ffe287;

        border-radius: 50%;

        color:
          #352100;

        background:
          linear-gradient(
            #fff4ae,
            #f0b63d
          );

        box-shadow:
          0 6px 0 #75500d;

        touch-action: none;

        -webkit-tap-highlight-color:
          transparent;
      }


      .mobile-interact strong {
        font-size: 18px;
      }


      .mobile-interact span {
        margin-top: 2px;
        font-size: 10px;
        opacity: .65;
      }


      .mobile-interact.pressed {

        transform:
          translateY(5px);

        box-shadow:
          0 1px 0 #75500d;
      }

    }


    @media (max-width: 380px) {

      #mobile-game-controls.visible {
        padding:
          8px 8px 12px;
      }


      .mobile-control-inner {
        gap: 8px;
      }


      .mobile-dpad {

        width: 148px;

        height: 148px;

        flex-basis: 148px;

        grid-template-columns:
          repeat(3, 44px);

        grid-template-rows:
          repeat(3, 44px);

        gap: 6px;
      }


      .mobile-key {

        width: 44px;

        height: 44px;

        font-size: 18px;
      }


      .mobile-interact {

        width: 80px;

        height: 80px;

        flex-basis: 80px;
      }

    }


    /* ================================================
       RECORD UI
    ================================================ */

    .wisdom-record-overlay {

      position: fixed;

      inset: 0;

      z-index: 30000;

      display: flex;

      align-items: center;

      justify-content: center;

      padding: 16px;

      box-sizing: border-box;

      background:
        rgba(2,5,12,.9);
    }


    .wisdom-record-panel {

      width: min(760px, 100%);

      max-height: 90vh;

      overflow-y: auto;

      padding: 22px;

      box-sizing: border-box;

      border:
        2px solid
        #435b8c;

      border-radius:
        18px;

      color: white;

      background:
        #10192d;
    }


    .wisdom-record-panel header {

      display: flex;

      justify-content: space-between;

      align-items: flex-start;

      gap: 20px;

      margin-bottom: 18px;
    }


    .wisdom-record-panel h2 {

      margin: 4px 0;

    }


    .wisdom-record-panel small {

      color:
        #ffd96b;
    }


    .wisdom-record-close {

      width: 42px;

      height: 42px;

      border:
        1px solid #5570a2;

      border-radius:
        9px;

      color: white;

      font-size: 24px;

      background:
        #1b2b4c;
    }


    .wisdom-record-list {

      display: grid;

      gap: 8px;
    }


    .wisdom-record-player {

      width: 100%;

      padding: 12px;

      display: grid;

      grid-template-columns:
        1.5fr
        .8fr
        1fr
        .8fr;

      gap: 8px;

      border:
        1px solid
        #344c77;

      border-radius:
        10px;

      color: white;

      text-align: left;

      background:
        #17243f;
    }


    .wisdom-record-player span {

      color:
        #c4d4ef;

      font-size:
        13px;
    }


    .wisdom-record-detail {

      margin-top: 18px;

      padding-top: 18px;

      border-top:
        1px solid
        #344c77;
    }


    .wisdom-record-maps {

      display: grid;

      gap: 6px;
    }


    .wisdom-record-maps div {

      display: flex;

      justify-content: space-between;

      gap: 12px;

      padding: 9px 4px;

      border-bottom:
        1px solid
        rgba(120,150,200,.15);
    }


    .wisdom-record-empty {

      padding: 36px 10px;

      color:
        #aabbda;

      text-align: center;
    }


    @media (max-width: 600px) {

      .wisdom-record-player {

        grid-template-columns:
          1fr 1fr;

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

function init() {

  injectStyles();

  createMobileControls();

  createRecordButton();

  observeGameScreen();

  updateMobileVisibility();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

}

else {

  init();

}
