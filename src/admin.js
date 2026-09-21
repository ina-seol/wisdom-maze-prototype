import "./style.css";

import {
  getTeacherPin,
  getUnit1Content,
  saveUnit1Content,
  parseTxt,
  serializeTxt
} from "./data.js";


const base =
  import.meta.env.BASE_URL;


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

const status =
  document.querySelector(
    "#save-status"
  );


/* =====================================================
   LOGIN
===================================================== */

function login() {

  const entered =
    pinInput.value.trim();


  const correct =
    getTeacherPin();


  if (
    entered !== correct
  ) {

    alert(
      "PIN이 올바르지 않습니다."
    );

    return;

  }


  loginScreen.classList.add(
    "hidden"
  );


  adminApp.classList.remove(
    "hidden"
  );


  loadCurrentContent();

}


loginButton?.addEventListener(
  "click",
  login
);


pinInput?.addEventListener(
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


backTitle?.addEventListener(
  "click",
  goHome
);


adminHome?.addEventListener(
  "click",
  goHome
);


/* =====================================================
   LOAD
===================================================== */

function loadCurrentContent() {

  const data =
    getUnit1Content();


  wordsEditor.value =
    data.words.join(
      "\n"
    );


  expressionsEditor.value =
    data.expressions.join(
      "\n"
    );


  updateCounts();

}


/* =====================================================
   TXT
===================================================== */

txtUpload?.addEventListener(
  "change",

  async event => {

    const file =
      event.target.files?.[0];


    if (
      !file
    ) {

      return;

    }


    try {

      const text =
        await file.text();


      const parsed =
        parseTxt(
          text
        );


      if (
        parsed.words.length === 0 &&
        parsed.expressions.length === 0
      ) {

        alert(
          "TXT에서 [WORDS] 또는 [EXPRESSIONS] 내용을 찾지 못했습니다."
        );

        return;

      }


      wordsEditor.value =
        parsed.words.join(
          "\n"
        );


      expressionsEditor.value =
        parsed.expressions.join(
          "\n"
        );


      updateCounts();


      status.textContent =
        "TXT를 불러왔습니다. 아래 저장 버튼을 눌러 적용하세요.";

    }

    catch (error) {

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
   EDITOR
===================================================== */

function linesFrom(
  textarea
) {

  return textarea.value

    .split(/\r?\n/)

    .map(
      line =>
        line.trim()
    )

    .filter(Boolean);

}


function updateCounts() {

  const words =
    linesFrom(
      wordsEditor
    );


  const expressions =
    linesFrom(
      expressionsEditor
    );


  wordCount.textContent =
    words.length;


  expressionCount.textContent =
    expressions.length;


  wordCount.style.color =
    words.length > 20

      ? "#ff7a7a"

      : "";


  expressionCount.style.color =
    expressions.length > 20

      ? "#ff7a7a"

      : "";

}


wordsEditor?.addEventListener(
  "input",
  updateCounts
);


expressionsEditor?.addEventListener(
  "input",
  updateCounts
);


/* =====================================================
   SAVE
===================================================== */

saveButton?.addEventListener(
  "click",

  () => {

    const words =
      linesFrom(
        wordsEditor
      );


    const expressions =
      linesFrom(
        expressionsEditor
      );


    if (
      words.length === 0
    ) {

      alert(
        "단어를 하나 이상 입력하세요."
      );

      return;

    }


    if (
      expressions.length === 0
    ) {

      alert(
        "표현을 하나 이상 입력하세요."
      );

      return;

    }


    if (
      words.length > 20
    ) {

      alert(
        "단어는 최대 20개까지 가능합니다."
      );

      return;

    }


    if (
      expressions.length > 20
    ) {

      alert(
        "표현은 최대 20개까지 가능합니다."
      );

      return;

    }


    const data = {

      words:
        [...new Set(words)],

      expressions:
        [...new Set(expressions)]

    };


    saveUnit1Content(
      data
    );


    status.textContent =
      `저장 완료 · 단어 ${data.words.length}개 · 표현 ${data.expressions.length}개`;


    alert(
      "MAP 01 문제를 저장했습니다."
    );

  }
);


/* =====================================================
   DOWNLOAD
===================================================== */

downloadButton?.addEventListener(
  "click",

  () => {

    const data = {

      words:
        linesFrom(
          wordsEditor
        ).slice(
          0,
          20
        ),

      expressions:
        linesFrom(
          expressionsEditor
        ).slice(
          0,
          20
        )

    };


    const text =
      serializeTxt(
        data
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


    const a =
      document.createElement(
        "a"
      );


    a.href =
      url;


    a.download =
      "map01-english.txt";


    document.body.appendChild(
      a
    );


    a.click();


    a.remove();


    URL.revokeObjectURL(
      url
    );

  }
);
