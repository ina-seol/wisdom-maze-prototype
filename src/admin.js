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

  serializeAllMapsTxt,

  parseAllMapsCsv,

  serializeAllMapsCsv,

  serializeCsvTemplate

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


const downloadTxtButton =
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
   CSV UI
===================================================== */

let csvUpload =
  null;


let downloadCsvButton =
  null;


let templateCsvButton =
  null;


function createCsvControls() {

  if (
    document.querySelector(
      "#csv-tools"
    )
  ) {

    csvUpload =
      document.querySelector(
        "#csv-upload"
      );


    downloadCsvButton =
      document.querySelector(
        "#download-csv"
      );


    templateCsvButton =
      document.querySelector(
        "#download-csv-template"
      );


    return;

  }


  const tools =
    document.createElement(
      "div"
    );


  tools.id =
    "csv-tools";


  tools.style.cssText = `

    margin:
      14px 0;

    padding:
      16px;

    border:
      1px solid
      rgba(
        110,
        145,
        220,
        0.35
      );

    border-radius:
      14px;

    background:
      rgba(
        14,
        25,
        50,
        0.75
      );

  `;


  tools.innerHTML = `

    <div
      style="
        margin-bottom:10px;
        color:#ffe188;
        font-weight:900;
        font-size:15px;
      "
    >
      CSV / Excel 학습자료
    </div>


    <div
      style="
        margin-bottom:12px;
        color:#adbfdf;
        font-size:12px;
        line-height:1.7;
      "
    >
      Excel 또는 Google Sheets에서
      <strong>CSV UTF-8</strong> 형식으로 저장한 뒤 업로드할 수 있습니다.<br>

      열 순서:
      <strong>map, type, english, korean</strong>
    </div>


    <div
      style="
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        align-items:center;
      "
    >

      <label
        for="csv-upload"
        class="admin-secondary"
        style="
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-height:40px;
          padding:0 14px;
          border:1px solid #556f9f;
          border-radius:9px;
          color:white;
          background:#20365c;
          cursor:pointer;
          font-weight:800;
        "
      >
        CSV 업로드
      </label>


      <input
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        hidden
      >


      <button
        id="download-csv-template"
        type="button"
        style="
          min-height:40px;
          padding:0 14px;
          border:1px solid #556f9f;
          border-radius:9px;
          color:white;
          background:#20365c;
          cursor:pointer;
          font-weight:800;
        "
      >
        CSV 템플릿
      </button>


      <button
        id="download-csv"
        type="button"
        style="
          min-height:40px;
          padding:0 14px;
          border:1px solid #d6aa46;
          border-radius:9px;
          color:#302000;
          background:#ffd96c;
          cursor:pointer;
          font-weight:900;
        "
      >
        전체 CSV 다운로드
      </button>

    </div>


    <div
      style="
        margin-top:10px;
        color:#7f96bf;
        font-size:11px;
        line-height:1.6;
      "
    >
      type에는
      <strong>word</strong>
      또는
      <strong>expression</strong>을 입력하세요.
      한 맵당 단어 20개, 표현 20개까지 사용합니다.
    </div>

  `;


  const target =
    txtUpload
      ?.closest(
        "section"
      )
    ??
    txtUpload
      ?.parentElement
    ??
    mapSelect
      ?.parentElement
    ??
    adminApp;


  if (
    target
  ) {

    if (
      txtUpload?.parentElement
    ) {

      txtUpload
        .parentElement
        .insertAdjacentElement(
          "afterend",
          tools
        );

    }

    else {

      target.appendChild(
        tools
      );

    }

  }


  csvUpload =
    tools.querySelector(
      "#csv-upload"
    );


  downloadCsvButton =
    tools.querySelector(
      "#download-csv"
    );


  templateCsvButton =
    tools.querySelector(
      "#download-csv-template"
    );

}


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


    pinInput
      ?.focus();


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
   LOAD CURRENT MAP
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


  setStatus(
    `${currentMap} 편집 중`
  );


  updateCounts();

}


/* =====================================================
   EDITOR
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

    .split(
      /\r?\n/
    )

    .map(
      line =>
        line.trim()
    )

    .filter(
      Boolean
    )

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
   STATUS
===================================================== */

function setStatus(
  message
) {

  if (
    status
  ) {

    status.textContent =
      message;

  }

}


/* =====================================================
   VALIDATION
===================================================== */

function validateCurrentMap(
  words,
  expressions
) {

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
   SAVE CURRENT EDITOR
===================================================== */

function saveCurrentEditor(
  validate = true
) {

  const words =
    parseEditor(
      wordsEditor
    );


  const expressions =
    parseEditor(
      expressionsEditor
    );


  if (
    validate
    &&
    !validateCurrentMap(
      words,
      expressions
    )
  ) {

    return false;

  }


  saveMapContent(
    currentMap,
    {

      words,

      expressions

    }
  );


  return true;

}


/* =====================================================
   SAVE BUTTON
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


      setStatus(
        `${currentMap} 저장 완료 · 단어 ${words.length}개 · 표현 ${expressions.length}개`
      );

    }
  );


/* =====================================================
   IMPORT VALIDATION
===================================================== */

function countImportedContent(
  maps
) {

  let wordTotal =
    0;


  let expressionTotal =
    0;


  let activeMaps =
    0;


  for (
    const mapId of
    MAP_IDS
  ) {

    const words =
      maps?.[mapId]?.words
      ??
      [];


    const expressions =
      maps?.[mapId]?.expressions
      ??
      [];


    wordTotal +=
      words.length;


    expressionTotal +=
      expressions.length;


    if (
      words.length > 0
      ||
      expressions.length > 0
    ) {

      activeMaps++;

    }

  }


  return {

    wordTotal,

    expressionTotal,

    activeMaps

  };

}


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


      if (
        !file
      ) {

        return;

      }


      try {

        const text =
          await file.text();


        const maps =
          parseAllMapsTxt(
            text
          );


        const counts =
          countImportedContent(
            maps
          );


        if (
          counts.wordTotal ===
          0
          &&
          counts.expressionTotal ===
          0
        ) {

          throw new Error(
            "TXT에 사용할 수 있는 학습자료가 없습니다."
          );

        }


        const ok =
          confirm(
            `TXT 학습자료를 불러옵니다.\n\n`
            +
            `맵: ${counts.activeMaps}개\n`
            +
            `단어: ${counts.wordTotal}개\n`
            +
            `표현: ${counts.expressionTotal}개\n\n`
            +
            `현재 저장된 MAP01~MAP12 학습자료를 교체할까요?`
          );


        if (
          !ok
        ) {

          return;

        }


        saveAllMapContent(
          maps
        );


        loadCurrentMap();


        setStatus(
          `TXT 불러오기 완료 · ${counts.activeMaps}개 맵 · 단어 ${counts.wordTotal}개 · 표현 ${counts.expressionTotal}개`
        );

      }

      catch (
        error
      ) {

        console.error(
          "TXT 불러오기 실패:",
          error
        );


        alert(
          error?.message
          ||
          "TXT 파일을 읽지 못했습니다."
        );

      }

      finally {

        event.target.value =
          "";

      }

    }
  );


/* =====================================================
   TXT EXPORT
===================================================== */

downloadTxtButton
  ?.addEventListener(
    "click",
    () => {

      /*
        다운로드 직전 현재 편집 내용도 반영
      */

      saveCurrentEditor(
        false
      );


      const maps =
        getAllMapContent();


      const text =
        serializeAllMapsTxt(
          maps
        );


      downloadTextFile({

        filename:
          "wisdom-maze-map01-map12.txt",

        content:
          text,

        type:
          "text/plain;charset=utf-8",

        bom:
          false

      });


      setStatus(
        "MAP01~MAP12 전체 TXT를 다운로드했습니다."
      );

    }
  );


/* =====================================================
   CSV IMPORT
===================================================== */

function setupCsvImport() {

  csvUpload
    ?.addEventListener(
      "change",
      async event => {

        const file =
          event.target
            .files?.[0];


        if (
          !file
        ) {

          return;

        }


        try {

          const text =
            await file.text();


          const maps =
            parseAllMapsCsv(
              text
            );


          const counts =
            countImportedContent(
              maps
            );


          if (
            counts.wordTotal ===
            0
            &&
            counts.expressionTotal ===
            0
          ) {

            throw new Error(
              "CSV에서 사용할 수 있는 학습자료를 찾지 못했습니다.\n\n열 이름을 확인해 주세요:\nmap,type,english,korean"
            );

          }


          const ok =
            confirm(
              `CSV 학습자료를 불러옵니다.\n\n`
              +
              `맵: ${counts.activeMaps}개\n`
              +
              `단어: ${counts.wordTotal}개\n`
              +
              `표현: ${counts.expressionTotal}개\n\n`
              +
              `현재 저장된 MAP01~MAP12 학습자료를 교체할까요?`
            );


          if (
            !ok
          ) {

            return;

          }


          saveAllMapContent(
            maps
          );


          loadCurrentMap();


          setStatus(
            `CSV 불러오기 완료 · ${counts.activeMaps}개 맵 · 단어 ${counts.wordTotal}개 · 표현 ${counts.expressionTotal}개`
          );


          alert(
            "CSV 학습자료를 성공적으로 불러왔습니다."
          );

        }

        catch (
          error
        ) {

          console.error(
            "CSV 불러오기 실패:",
            error
          );


          alert(
            error?.message
            ||
            "CSV 파일을 읽지 못했습니다."
          );

        }

        finally {

          event.target.value =
            "";

        }

      }
    );

}


/* =====================================================
   CSV EXPORT
===================================================== */

function setupCsvExport() {

  downloadCsvButton
    ?.addEventListener(
      "click",
      () => {

        /*
          현재 화면에서 수정 중인 내용도
          CSV에 포함
        */

        saveCurrentEditor(
          false
        );


        const maps =
          getAllMapContent();


        const csv =
          serializeAllMapsCsv(
            maps
          );


        downloadTextFile({

          filename:
            "wisdom-maze-map01-map12.csv",

          content:
            csv,

          type:
            "text/csv;charset=utf-8",

          bom:
            true

        });


        setStatus(
          "MAP01~MAP12 전체 CSV를 다운로드했습니다."
        );

      }
    );


  templateCsvButton
    ?.addEventListener(
      "click",
      () => {

        const csv =
          serializeCsvTemplate();


        downloadTextFile({

          filename:
            "wisdom-maze-csv-template.csv",

          content:
            csv,

          type:
            "text/csv;charset=utf-8",

          bom:
            true

        });


        setStatus(
          "CSV 입력 템플릿을 다운로드했습니다."
        );

      }
    );

}


/* =====================================================
   DOWNLOAD HELPER
===================================================== */

function downloadTextFile({

  filename,

  content,

  type,

  bom =
    false

}) {

  const data =
    bom

      ? "\uFEFF" +
        content

      : content;


  const blob =
    new Blob(
      [
        data
      ],
      {
        type
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
    filename;


  document.body
    .appendChild(
      anchor
    );


  anchor.click();


  anchor.remove();


  window.setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );

}


/* =====================================================
   INITIALIZE
===================================================== */

function init() {

  buildMapSelect();

  createCsvControls();

  setupCsvImport();

  setupCsvExport();

  loadCurrentMap();

}


init();
