import "./style.css";

import {
  getTeacherPin,
  getUnit1Content,
  saveUnit1Content,
  parseTxt,
  serializeTxt
} from "./data.js";


const login =
  document.querySelector(
    "#admin-login"
  );

const app =
  document.querySelector(
    "#admin-app"
  );

const pin =
  document.querySelector(
    "#admin-pin"
  );


const wordsEditor =
  document.querySelector(
    "#words-editor"
  );

const expressionsEditor =
  document.querySelector(
    "#expressions-editor"
  );


document
  .querySelector(
    "#admin-login-btn"
  )
  .onclick = () => {

    if (
      pin.value !==
      getTeacherPin()
    ) {

      alert(
        "PIN 번호가 올바르지 않습니다."
      );

      return;
    }


    login.classList.add(
      "hidden"
    );

    app.classList.remove(
      "hidden"
    );

    loadCurrent();
  };


document
  .querySelector(
    "#txt-upload"
  )
  .onchange = async event => {

    const file =
      event.target.files?.[0];

    if (!file) return;


    const text =
      await file.text();

    const parsed =
      parseTxt(text);


    wordsEditor.value =
      parsed.words.join("\n");

    expressionsEditor.value =
      parsed.expressions.join("\n");

    updatePreview();
  };


document
  .querySelector(
    "#save-content"
  )
  .onclick = () => {

    const words =
      cleanLines(
        wordsEditor.value
      );

    const expressions =
      cleanLines(
        expressionsEditor.value
      );


    if (
      words.length > 20 ||
      expressions.length > 20
    ) {

      alert(
        "단어와 표현은 각각 최대 20개까지 입력할 수 있습니다."
      );

      return;
    }


    saveUnit1Content({

      words,
      expressions,

      updatedAt:
        new Date()
          .toISOString()
    });


    updatePreview();

    alert(
      "MAP01 학습 내용을 저장했습니다."
    );
  };


document
  .querySelector(
    "#sample-download"
  )
  .onclick = () => {

    const blob =
      new Blob(

        [
          serializeTxt(
            getUnit1Content()
          )
        ],

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
      document.createElement("a");

    a.href = url;

    a.download =
      "unit01_sample.txt";

    a.click();


    URL.revokeObjectURL(
      url
    );
  };


wordsEditor.oninput =
  updatePreview;

expressionsEditor.oninput =
  updatePreview;


function loadCurrent() {

  const content =
    getUnit1Content();

  wordsEditor.value =
    content.words.join("\n");

  expressionsEditor.value =
    content.expressions.join("\n");

  updatePreview();
}


function cleanLines(text) {

  return [
    ...new Set(

      text
        .split(/\r?\n/)
        .map(v => v.trim())
        .filter(Boolean)

    )
  ];
}


function updatePreview() {

  const words =
    cleanLines(
      wordsEditor.value
    );

  const expressions =
    cleanLines(
      expressionsEditor.value
    );


  document.querySelector(
    "#word-count"
  ).textContent =
    `${words.length} / 20`;


  document.querySelector(
    "#expression-count"
  ).textContent =
    `${expressions.length} / 20`;


  const preview =
    document.querySelector(
      "#content-preview"
    );


  preview.innerHTML = "";


  const wordTitle =
    document.createElement("h3");

  wordTitle.textContent =
    "단어";


  const wordLine =
    document.createElement("p");

  wordLine.textContent =
    words.join(" · ");


  const expressionTitle =
    document.createElement("h3");

  expressionTitle.textContent =
    "표현";


  const expressionList =
    document.createElement("div");


  expressions.forEach(
    expression => {

      const p =
        document.createElement("p");

      p.className =
        "english-preview";

      p.textContent =
        expression;

      expressionList.appendChild(
        p
      );
    }
  );


  preview.append(

    wordTitle,
    wordLine,

    expressionTitle,
    expressionList
  );
}