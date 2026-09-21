import "./style.css";

import {

  MAP_IDS,

  MAP_NAMES,

  getTeacherPin,

  getAllMapContent,

  getMapContent,

  saveMapContent,

  saveAllMapContent,

  parseAllMapsTxt,

  serializeAllMapsTxt

} from "./data.js";


const base =
  import.meta.env.BASE_URL;


/* =====================================================
   DOM
===================================================== */

const loginScreen =
  document.querySelector(
    "#admin-login"
  );

const adminApp =
  document.querySelector(
    "#admin-app"
  );

const pinInput =
  document.querySelector(
    "#teacher-pin"
  );

const loginButton =
  document.querySelector(
    "#teacher-login"
  );

const backTitle =
  document.querySelector(
    "#back-title"
  );

const adminHome =
  document.querySelector(
    "#admin-home"
  );

const mapSelect =
  document.querySelector(
    "#map-select"
  );

const txtUpload =
  document.querySelector(
    "#txt-upload"
  );

const wordsEditor =
  document.querySelector(
    "#words-editor"
  );

const expressionsEditor =
  document.querySelector(
    "#expressions-editor"
  );

const wordCount =
  document.querySelector(
    "#word-count"
  );

const expressionCount =
  document.querySelector(
    "#expression-count"
  );

const saveButton =
  document.querySelector(
    "#save-content"
  );

const downloadButton =
  document.querySelector(
    "#download-txt"
  );

const saveTitle =
  document.querySelector(
    "#save-title"
  );

const status =
  document.querySelector(
    "#save-status"
  );


let currentMap =
  "MAP01";


/* =====================================================
   BUILD MAP SELECT
===================================================== */

for (
  const mapId of
  MAP_IDS
) {

  const option =
    document.createElement(
      "option"
    );


  option.value =
    mapId;


  option.textContent =
    `${mapId} · ${MAP_NAMES[mapId]}`;


  mapSelect.appendChild(
    option
  );

}


/* =====================================================
   LOGIN
===================================================== */

function login() {

  if (
    pinInput.value.trim()
    !==
    getTeacherPin()
  ) {

    alert(
      "PIN이 올바르지 않습니다."
    );


    return;

  }


  loginScreen
    .classList
    .add(
      "hidden"
    );


  adminApp
    .classList
    .remove(
      "hidden"
    );


  loadCurrentMap();

}


loginButton
  ?.addEventListener(
    "click",
    login
  );


pinInput
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        login();

      }

    }
  );


/* =====================================================
   HOME
===================================================== */

function goHome() {

  window.location.href =
    `${base}index.html`;

}


backTitle
  ?.addEventListener(
    "click",
    goHome
  );


adminHome
  ?.addEventListener(
    "click",
    goHome
  );


/* =====================================================
   MAP
===================================================== */

mapSelect
  ?.addEventListener(
    "change",
    () => {

      currentMap =
        mapSelect.value;


      loadCurrentMap();

    }
  );


function loadCurrentMap() {

  const data =
    getMapContent(
      currentMap
    );


  wordsEditor.value =
    data.words
      .map(
        formatPair
      )
      .join(
        "\n"
      );


  expressionsEditor.value =
    data.expressions
      .map(
        formatPair
      )
      .join(
        "\n"
      );


  saveTitle.textContent =
    `${currentMap} · ${MAP_NAMES[currentMap]} 저장`;


  status.textContent =
    `${currentMap} 편집 중`;


  updateCounts();

}


/* =====================================================
   EDITOR PARSER
===================================================== */

function parseEditor(
  textarea
) {

  return textarea.value

    .split(/\r?\n/)

    .map(
      line =>
        line.trim()
    )

    .filter(Boolean)

    .slice(
      0,
      20
    )

    .map(
      line => {

        const index =
          line.indexOf(
            "|"
          );


        if (
          index === -1
        ) {

          return {

            english:
              line,

            korean:
              ""

          };

        }


        return {

          english:
            line
              .slice(
                0,
                index
              )
              .trim(),

          korean:
            line
              .slice(
                index + 1
              )
              .trim()

        };

      }
    )

    .filter(
      item =>
        item.english
    );

}


function formatPair(
  item
) {

  return item.korean

    ? `${item.english} | ${item.korean}`

    : item.english;

}


/* =====================================================
   COUNTS
===================================================== */

function updateCounts() {

  wordCount.textContent =
    parseEditor(
      wordsEditor
    ).length;


  expressionCount.textContent =
    parseEditor(
      expressionsEditor
    ).length;

}


wordsEditor
  ?.addEventListener(
    "input",
    updateCounts
  );


expressionsEditor
  ?.addEventListener(
    "input",
    updateCounts
  );


/* =====================================================
   SAVE CURRENT
===================================================== */

saveButton
  ?.addEventListener(
    "click",
    () => {

      const words =
        parseEditor(
          wordsEditor
        );


      const expressions =
        parseEditor(
          expressionsEditor
        );


      /*
        객관식 오답 선택지 때문에
        4개 이상 권장.
      */

      if (
        words.length <
        4
      ) {

        alert(
          "객관식 문제를 위해 단어를 최소 4개 입력해 주세요."
        );


        return;

      }


      if (
        expressions.length <
        4
      ) {

        alert(
          "객관식 문제를 위해 영어 표현을 최소 4개 입력해 주세요."
        );


        return;

      }


      const invalidWord =
        words.find(
          item =>
            !item.korean
        );


      if (
        invalidWord
      ) {

        alert(
          `한국어 뜻이 없습니다: ${invalidWord.english}`
        );


        return;

      }


      const invalidExpression =
        expressions.find(
          item =>
            !item.korean
        );


      if (
        invalidExpression
      ) {

        alert(
          `한국어 뜻이 없습니다: ${invalidExpression.english}`
        );


        return;

      }


      saveMapContent(
        currentMap,
        {
          words,
          expressions
        }
      );


      status.textContent =
        `${currentMap} 저장 완료 · 단어 ${words.length}개 · 표현 ${expressions.length}개`;

    }
  );


/* =====================================================
   IMPORT ALL
===================================================== */

txtUpload
  ?.addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];


      if (!file) {

        return;

      }


      try {

        const text =
          await file.text();


        const maps =
          parseAllMapsTxt(
            text
          );


        saveAllMapContent(
          maps
        );


        loadCurrentMap();


        status.textContent =
          "전체 MAP TXT를 불러왔습니다.";

      }

      catch (
        error
      ) {

        console.error(
          error
        );


        alert(
          "TXT 파일을 읽지 못했습니다."
        );

      }

    }
  );


/* =====================================================
   EXPORT ALL
===================================================== */

downloadButton
  ?.addEventListener(
    "click",
    () => {

      /*
        현재 편집중 내용 먼저 저장
      */

      saveMapContent(
        currentMap,
        {

          words:
            parseEditor(
              wordsEditor
            ),

          expressions:
            parseEditor(
              expressionsEditor
            )

        }
      );


      const text =
        serializeAllMapsTxt(
          getAllMapContent()
        );


      const blob =
        new Blob(
          [text],
          {
            type:
              "text/plain;charset=utf-8"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const anchor =
        document.createElement(
          "a"
        );


      anchor.href =
        url;


      anchor.download =
        "wisdom-maze-map01-map12.txt";


      document.body.appendChild(
        anchor
      );


      anchor.click();


      anchor.remove();


      URL.revokeObjectURL(
        url
      );

    }
  );
  }
);
