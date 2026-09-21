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
   MAP SELECT
===================================================== */

function buildMapSelect() {

  if (
    !mapSelect
  ) {

    return;

  }


  mapSelect.innerHTML =
    "";


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


  mapSelect.value =
    currentMap;

}


buildMapSelect();


/* =====================================================
   LOGIN
===================================================== */

function login() {

  const inputPin =
    pinInput
      ?.value
      .trim();


  if (
    inputPin !==
    getTeacherPin()
  ) {

    alert(
      "PIN이 올바르지 않습니다."
    );


    pinInput?.focus();


    return;

  }


  loginScreen
    ?.classList
    .add(
      "hidden"
    );


  adminApp
    ?.classList
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

        event.preventDefault();


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
   MAP CHANGE
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


/* =====================================================
   LOAD MAP
===================================================== */

function loadCurrentMap() {

  const data =
    getMapContent(
      currentMap
    );


  if (
    wordsEditor
  ) {

    wordsEditor.value =
      data.words
        .map(
          formatPair
        )
        .join(
          "\n"
        );

  }


  if (
    expressionsEditor
  ) {

    expressionsEditor.value =
      data.expressions
        .map(
          formatPair
        )
        .join(
          "\n"
        );

  }


  if (
    saveTitle
  ) {

    saveTitle.textContent =
      `${currentMap} · ${MAP_NAMES[currentMap]} 저장`;

  }


  if (
    status
  ) {

    status.textContent =
      `${currentMap} 편집 중`;

  }


  updateCounts();

}


/* =====================================================
   EDITOR PARSER
===================================================== */

function parseEditor(
  textarea
) {

  if (
    !textarea
  ) {

    return [];

  }


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

        const separator =
          line.indexOf(
            "|"
          );


        if (
          separator ===
          -1
        ) {

          return {

            english:
              line.trim(),

            korean:
              ""

          };

        }


        return {

          english:
            line
              .slice(
                0,
                separator
              )
              .trim(),

          korean:
            line
              .slice(
                separator + 1
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

  if (
    item.korean
  ) {

    return (
      `${item.english} | ${item.korean}`
    );

  }


  return item.english;

}


/* =====================================================
   COUNTS
===================================================== */

function updateCounts() {

  const words =
    parseEditor(
      wordsEditor
    );


  const expressions =
    parseEditor(
      expressionsEditor
    );


  if (
    wordCount
  ) {

    wordCount.textContent =
      words.length;

  }


  if (
    expressionCount
  ) {

    expressionCount.textContent =
      expressions.length;

  }

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
   VALIDATION
===================================================== */

function validateCurrentMap(
  words,
  expressions
) {

  /*
    4지선다를 위해
    최소 4단어 권장
  */

  if (
    words.length <
    4
  ) {

    alert(
      "객관식 문제를 만들기 위해 단어를 최소 4개 입력해 주세요."
    );


    return false;

  }


  if (
    expressions.length <
    4
  ) {

    alert(
      "객관식 문제를 만들기 위해 영어 표현을 최소 4개 입력해 주세요."
    );


    return false;

  }


  const missingWordMeaning =
    words.find(
      item =>
        !item.korean
    );


  if (
    missingWordMeaning
  ) {

    alert(
      `한국어 뜻이 없습니다:\n${missingWordMeaning.english}`
    );


    return false;

  }


  const missingExpressionMeaning =
    expressions.find(
      item =>
        !item.korean
    );


  if (
    missingExpressionMeaning
  ) {

    alert(
      `한국어 뜻이 없습니다:\n${missingExpressionMeaning.english}`
    );


    return false;

  }


  return true;

}


/* =====================================================
   SAVE CURRENT MAP
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


      if (
        !validateCurrentMap(
          words,
          expressions
        )
      ) {

        return;

      }


      saveMapContent(
        currentMap,
        {
          words,
          expressions
        }
      );


      if (
        status
      ) {

        status.textContent =
          `${currentMap} 저장 완료 · 단어 ${words.length}개 · 표현 ${expressions.length}개`;

      }

    }
  );


/* =====================================================
   TXT IMPORT
===================================================== */

txtUpload
  ?.addEventListener(
    "change",
    async event => {

      const file =
        event.target
          .files?.[0];


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


        if (
          status
        ) {

          status.textContent =
            "MAP01~MAP12 전체 TXT를 불러왔습니다.";

        }

      }

      catch (error) {

        console.error(
          "TXT 불러오기 실패:",
          error
        );


        alert(
          "TXT 파일을 읽지 못했습니다."
        );

      }


      /*
        같은 파일을 다시 선택할 수 있게
      */

      event.target.value =
        "";

    }
  );


/* =====================================================
   TXT EXPORT
===================================================== */

downloadButton
  ?.addEventListener(
    "click",
    () => {

      /*
        다운로드 전에
        현재 편집 화면을 먼저 저장
      */

      const words =
        parseEditor(
          wordsEditor
        );


      const expressions =
        parseEditor(
          expressionsEditor
        );


      saveMapContent(
        currentMap,
        {
          words,
          expressions
        }
      );


      const maps =
        getAllMapContent();


      const text =
        serializeAllMapsTxt(
          maps
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


      document.body
        .appendChild(
          anchor
        );


      anchor.click();


      anchor.remove();


      URL.revokeObjectURL(
        url
      );


      if (
        status
      ) {

        status.textContent =
          "MAP01~MAP12 전체 TXT를 저장했습니다.";

      }

    }
  );
