/* =====================================================
   WISDOM MAZE
   GLOBAL FEEDBACK SYSTEM

   - 모든 맵 공통
   - 정답 / 오답 진동
   - 간단한 효과음
   - 별도의 mp3 파일 필요 없음
===================================================== */


const FEEDBACK_ENABLED = true;


/* =====================================================
   VIBRATION
===================================================== */

function vibrate(
  pattern
) {

  if (
    !FEEDBACK_ENABLED
  ) {

    return;

  }


  if (
    typeof navigator ===
      "undefined"
    ||
    !(
      "vibrate"
      in
      navigator
    )
  ) {

    return;

  }


  try {

    navigator.vibrate(
      pattern
    );

  }

  catch (
    error
  ) {

    console.warn(
      "진동 실행 실패:",
      error
    );

  }

}


/* =====================================================
   WEB AUDIO
===================================================== */

let audioContext =
  null;


function getAudioContext() {

  if (
    audioContext
  ) {

    return audioContext;

  }


  const AudioContextClass =
    window.AudioContext
    ||
    window.webkitAudioContext;


  if (
    !AudioContextClass
  ) {

    return null;

  }


  audioContext =
    new AudioContextClass();


  return audioContext;

}


function beep({
  frequency = 440,
  duration = 0.08,
  volume = 0.08,
  type = "sine",
  delay = 0
} = {}) {

  if (
    !FEEDBACK_ENABLED
  ) {

    return;

  }


  const context =
    getAudioContext();


  if (
    !context
  ) {

    return;

  }


  /*
    모바일 브라우저에서는
    사용자 터치 이후 오디오가 풀린다.
  */

  if (
    context.state ===
    "suspended"
  ) {

    context
      .resume()
      .catch(
        () => {}
      );

  }


  const oscillator =
    context.createOscillator();


  const gain =
    context.createGain();


  const startTime =
    context.currentTime
    +
    delay;


  const endTime =
    startTime
    +
    duration;


  oscillator.type =
    type;


  oscillator.frequency.setValueAtTime(
    frequency,
    startTime
  );


  gain.gain.setValueAtTime(
    0.0001,
    startTime
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.01
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    endTime
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    context.destination
  );


  oscillator.start(
    startTime
  );


  oscillator.stop(
    endTime + 0.02
  );

}


/* =====================================================
   EFFECTS
===================================================== */

function playTap() {

  vibrate(
    12
  );


  beep({
    frequency:
      520,

    duration:
      0.035,

    volume:
      0.025
  });

}


function playCorrect() {

  vibrate(
    30
  );


  beep({
    frequency:
      660,

    duration:
      0.07,

    volume:
      0.06,

    type:
      "sine"
  });


  beep({
    frequency:
      880,

    duration:
      0.10,

    volume:
      0.065,

    delay:
      0.07,

    type:
      "sine"
  });

}


function playWrong() {

  vibrate(
    60
  );


  beep({
    frequency:
      180,

    duration:
      0.13,

    volume:
      0.055,

    type:
      "square"
  });


  beep({
    frequency:
      135,

    duration:
      0.12,

    volume:
      0.045,

    delay:
      0.09,

    type:
      "square"
  });

}


function playShard() {

  vibrate([
    20,
    40,
    20
  ]);


  beep({
    frequency:
      620,

    duration:
      0.06,

    volume:
      0.055
  });


  beep({
    frequency:
      820,

    duration:
      0.07,

    volume:
      0.055,

    delay:
      0.06
  });


  beep({
    frequency:
      1040,

    duration:
      0.11,

    volume:
      0.065,

    delay:
      0.13
  });

}


function playClear() {

  vibrate([
    30,
    50,
    30,
    70,
    45
  ]);


  beep({
    frequency:
      523,

    duration:
      0.09,

    volume:
      0.06
  });


  beep({
    frequency:
      659,

    duration:
      0.09,

    volume:
      0.06,

    delay:
      0.09
  });


  beep({
    frequency:
      784,

    duration:
      0.09,

    volume:
      0.065,

    delay:
      0.18
  });


  beep({
    frequency:
      1046,

    duration:
      0.18,

    volume:
      0.075,

    delay:
      0.27
  });

}


function playBossHit() {

  vibrate([
    45,
    30,
    65
  ]);


  beep({
    frequency:
      110,

    duration:
      0.07,

    volume:
      0.08,

    type:
      "square"
  });


  beep({
    frequency:
      70,

    duration:
      0.13,

    volume:
      0.07,

    delay:
      0.04,

    type:
      "sawtooth"
  });

}


/* =====================================================
   PUBLIC GLOBAL API
===================================================== */

window.WisdomFeedback = {

  tap:
    playTap,

  correct:
    playCorrect,

  wrong:
    playWrong,

  shard:
    playShard,

  clear:
    playClear,

  bossHit:
    playBossHit,

  vibrate

};


/* =====================================================
   PATCH GAME UI AUTOMATICALLY

   main.js 전체 실행이 끝난 뒤
   GameUI를 자동 감싼다.
===================================================== */

queueMicrotask(
  () => {

    const ui =
      window.GameUI;


    if (
      !ui
    ) {

      console.warn(
        "WisdomFeedback: GameUI를 찾지 못했습니다."
      );


      return;

    }


    /*
      객관식 문제
    */

    if (
      typeof ui.choice ===
      "function"
    ) {

      const originalChoice =
        ui.choice.bind(
          ui
        );


      ui.choice =
        async (
          ...args
        ) => {

          const result =
            await originalChoice(
              ...args
            );


          if (
            result
          ) {

            playCorrect();

          }

          else {

            playWrong();

          }


          return result;

        };

    }


    /*
      문장 순서 문제
    */

    if (
      typeof ui.wordOrder ===
      "function"
    ) {

      const originalWordOrder =
        ui.wordOrder.bind(
          ui
        );


      ui.wordOrder =
        async (
          ...args
        ) => {

          const result =
            await originalWordOrder(
              ...args
            );


          if (
            result
          ) {

            playCorrect();

          }

          else {

            playWrong();

          }


          return result;

        };

    }


    /*
      일반 맵 클리어 화면
    */

    if (
      typeof ui.finish ===
      "function"
    ) {

      const originalFinish =
        ui.finish.bind(
          ui
        );


      ui.finish =
        async (
          ...args
        ) => {

          playClear();


          return originalFinish(
            ...args
          );

        };

    }


    console.log(
      "WisdomFeedback 활성화 완료"
    );

  }
);


/* =====================================================
   FIRST USER INTERACTION
   모바일 오디오 잠금 해제
===================================================== */

function unlockAudio() {

  const context =
    getAudioContext();


  if (
    context?.state ===
    "suspended"
  ) {

    context
      .resume()
      .catch(
        () => {}
      );

  }


  document.removeEventListener(
    "pointerdown",
    unlockAudio
  );


  document.removeEventListener(
    "keydown",
    unlockAudio
  );

}


document.addEventListener(
  "pointerdown",
  unlockAudio,
  {
    once:
      true
  }
);


document.addEventListener(
  "keydown",
  unlockAudio,
  {
    once:
      true
  }
);
