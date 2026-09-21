/* =====================================================
   MAP CONFIG
===================================================== */

export const MAP_IDS =
  Array.from(
    { length: 12 },
    (_, index) =>
      `MAP${String(index + 1).padStart(2, "0")}`
  );


export const MAP_NAMES = {

  MAP01:
    "잠겨버린 교실",

  MAP02:
    "속삭이는 도서관",

  MAP03:
    "안개 낀 숲속 마을",

  MAP04:
    "모래시계 유적",

  MAP05:
    "거울 유령 저택",

  MAP06:
    "폭풍 속 해적선",

  MAP07:
    "뒤틀린 마법 학교",

  MAP08:
    "침수된 연구소",

  MAP09:
    "멈춰버린 시간 박물관",

  MAP10:
    "명령을 잃은 로봇 공장",

  MAP11:
    "녹아내리는 얼음 성",

  MAP12:
    "침묵의 언어 성"

};


/* =====================================================
   DEFAULT DATA
===================================================== */

const DEFAULT_MAPS = {};


for (
  const mapId of MAP_IDS
) {

  DEFAULT_MAPS[mapId] = {

    words: [],

    expressions: []

  };

}


/*
  MAP01 기본 예시
*/

DEFAULT_MAPS.MAP01 = {

  words: [

    {
      english: "door",
      korean: "문"
    },

    {
      english: "key",
      korean: "열쇠"
    },

    {
      english: "desk",
      korean: "책상"
    },

    {
      english: "window",
      korean: "창문"
    },

    {
      english: "clock",
      korean: "시계"
    },

    {
      english: "book",
      korean: "책"
    },

    {
      english: "bag",
      korean: "가방"
    },

    {
      english: "box",
      korean: "상자"
    }

  ],


  expressions: [

    {
      english:
        "Open the door.",

      korean:
        "문을 여세요."
    },

    {
      english:
        "Where is the key?",

      korean:
        "열쇠는 어디에 있나요?"
    },

    {
      english:
        "It is under the desk.",

      korean:
        "그것은 책상 아래에 있습니다."
    },

    {
      english:
        "Look at the window.",

      korean:
        "창문을 보세요."
    },

    {
      english:
        "I found the key.",

      korean:
        "열쇠를 찾았어요."
    }

  ]

};


/*
  MAP02 예시
*/

DEFAULT_MAPS.MAP02 = {

  words: [

    {
      english: "library",
      korean: "도서관"
    },

    {
      english: "shelf",
      korean: "책장"
    },

    {
      english: "magic",
      korean: "마법"
    },

    {
      english: "purple",
      korean: "보라색"
    },

    {
      english: "read",
      korean: "읽다"
    },

    {
      english: "table",
      korean: "탁자"
    }

  ],


  expressions: [

    {
      english:
        "Find the purple book.",

      korean:
        "보라색 책을 찾으세요."
    },

    {
      english:
        "Read the magic book.",

      korean:
        "마법 책을 읽으세요."
    },

    {
      english:
        "Look under the table.",

      korean:
        "탁자 아래를 보세요."
    },

    {
      english:
        "Open the library door.",

      korean:
        "도서관 문을 여세요."
    }

  ]

};


/* =====================================================
   STORAGE
===================================================== */

const KEYS = {

  content:
    "wisdom_all_maps_content_v3",

  profile:
    "wisdom_profile_v3",

  progressPrefix:
    "wisdom_progress_v3_",

  records:
    "wisdom_records_v3",

  pin:
    "wisdom_teacher_pin_v1"

};


/* =====================================================
   NORMALIZE DATA
===================================================== */

function normalizePair(
  item
) {

  if (
    typeof item === "string"
  ) {

    return {

      english:
        item.trim(),

      korean:
        ""

    };

  }


  return {

    english:
      String(
        item?.english ?? ""
      ).trim(),

    korean:
      String(
        item?.korean ?? ""
      ).trim()

  };

}


function normalizeMapData(
  data
) {

  return {

    words:
      Array.isArray(
        data?.words
      )

        ? data.words
            .map(
              normalizePair
            )
            .filter(
              item =>
                item.english
            )
            .slice(
              0,
              20
            )

        : [],


    expressions:
      Array.isArray(
        data?.expressions
      )

        ? data.expressions
            .map(
              normalizePair
            )
            .filter(
              item =>
                item.english
            )
            .slice(
              0,
              20
            )

        : []

  };

}


function normalizeAllMaps(
  source
) {

  const result =
    {};


  for (
    const mapId of
    MAP_IDS
  ) {

    result[mapId] =
      normalizeMapData(

        source?.[mapId]
        ??
        DEFAULT_MAPS[mapId]

      );

  }


  return result;

}


/* =====================================================
   CONTENT
===================================================== */

export function getAllMapContent() {

  try {

    const raw =
      localStorage.getItem(
        KEYS.content
      );


    if (raw) {

      return normalizeAllMaps(
        JSON.parse(
          raw
        )
      );

    }

  }

  catch (
    error
  ) {

    console.error(
      "학습 데이터 읽기 실패:",
      error
    );

  }


  return normalizeAllMaps(
    DEFAULT_MAPS
  );

}


export function saveAllMapContent(
  maps
) {

  localStorage.setItem(

    KEYS.content,

    JSON.stringify(
      normalizeAllMaps(
        maps
      )
    )

  );

}


export function getMapContent(
  mapId
) {

  const maps =
    getAllMapContent();


  return normalizeMapData(
    maps[mapId]
    ??
    {
      words: [],
      expressions: []
    }
  );

}


export function saveMapContent(
  mapId,
  data
) {

  const maps =
    getAllMapContent();


  maps[mapId] =
    normalizeMapData(
      data
    );


  saveAllMapContent(
    maps
  );

}


/* =====================================================
   TXT
===================================================== */

export function parseAllMapsTxt(
  text
) {

  const result =
    {};


  for (
    const mapId of
    MAP_IDS
  ) {

    result[mapId] = {

      words: [],

      expressions: []

    };

  }


  let currentMap =
    null;


  let currentSection =
    null;


  const lines =
    String(text)
      .split(/\r?\n/);


  for (
    const raw of
    lines
  ) {

    const line =
      raw.trim();


    if (
      !line ||
      line.startsWith("#")
    ) {

      continue;

    }


    /*
      [MAP01]
      [MAP1]
    */

    const mapMatch =
      line.match(
        /^\[MAP(\d{1,2})\]$/i
      );


    if (mapMatch) {

      const number =
        Number(
          mapMatch[1]
        );


      if (
        number >= 1 &&
        number <= 12
      ) {

        currentMap =
          `MAP${String(number).padStart(2, "0")}`;

      }

      else {

        currentMap =
          null;

      }


      currentSection =
        null;


      continue;

    }


    if (
      line.toUpperCase() ===
      "[WORDS]"
    ) {

      currentSection =
        "words";


      continue;

    }


    if (
      line.toUpperCase() ===
      "[EXPRESSIONS]"
    ) {

      currentSection =
        "expressions";


      continue;

    }


    if (
      line.startsWith("[")
    ) {

      currentSection =
        null;


      continue;

    }


    if (
      !currentMap ||
      !currentSection
    ) {

      continue;

    }


    const item =
      parsePairLine(
        line
      );


    if (
      !item.english
    ) {

      continue;

    }


    if (
      result[currentMap][currentSection]
        .length <
      20
    ) {

      result[currentMap][currentSection]
        .push(
          item
        );

    }

  }


  return normalizeAllMaps(
    result
  );

}


function parsePairLine(
  line
) {

  const separator =
    line.indexOf(
      "|"
    );


  if (
    separator === -1
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


export function serializeAllMapsTxt(
  maps
) {

  const normalized =
    normalizeAllMaps(
      maps
    );


  const lines = [

    "# 지혜의 미로 탐험대",
    "# MAP01 ~ MAP12 학습 데이터",
    "# 형식: 영어 | 한국어 뜻",
    ""

  ];


  for (
    const mapId of
    MAP_IDS
  ) {

    lines.push(
      `[${mapId}]`
    );


    lines.push(
      ""
    );


    lines.push(
      "[WORDS]"
    );


    for (
      const item of
      normalized[mapId].words
    ) {

      lines.push(
        pairToText(
          item
        )
      );

    }


    lines.push(
      ""
    );


    lines.push(
      "[EXPRESSIONS]"
    );


    for (
      const item of
      normalized[mapId].expressions
    ) {

      lines.push(
        pairToText(
          item
        )
      );

    }


    lines.push(
      "",
      ""
    );

  }


  return lines.join(
    "\n"
  );

}


function pairToText(
  item
) {

  if (
    item.korean
  ) {

    return `${item.english} | ${item.korean}`;

  }


  return item.english;

}


/* =====================================================
   PROFILE
===================================================== */

export function saveProfile(
  profile
) {

  localStorage.setItem(
    KEYS.profile,
    JSON.stringify(
      profile
    )
  );

}


export function getProfile() {

  try {

    return JSON.parse(
      localStorage.getItem(
        KEYS.profile
      )
    );

  }

  catch {

    return null;

  }

}


/* =====================================================
   GENERIC MAP STATE
===================================================== */

export function newMapState(
  mapId
) {

  return {

    mapId,

    introDone:
      false,

    phase:
      "start",

    shards:
      0,

    questionsShown:
      0,

    firstTryCorrect:
      0,

    wrongAttempts:
      0,

    hintsUsed:
      0,

    mistakes:
      {},

    usedWords:
      [],

    usedExpressions:
      [],

    completed:
      false,

    sessionStartedAt:
      Date.now()

  };

}


/* =====================================================
   GENERIC PROGRESS
===================================================== */

function safeStudentKey(
  name
) {

  return String(name)
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      "_"
    )
    .replace(
      /[^a-z0-9가-힣_-]/g,
      ""
    );

}


function progressKey(
  mapId,
  studentName
) {

  return (
    KEYS.progressPrefix
    +
    safeStudentKey(
      studentName
    )
    +
    "_"
    +
    mapId
  );

}


export function saveMapProgress(
  mapId,
  studentName,
  state
) {

  localStorage.setItem(

    progressKey(
      mapId,
      studentName
    ),

    JSON.stringify(
      state
    )

  );

}


export function loadMapProgress(
  mapId,
  studentName
) {

  try {

    return JSON.parse(

      localStorage.getItem(

        progressKey(
          mapId,
          studentName
        )

      )

    );

  }

  catch {

    return null;

  }

}


export function clearMapProgress(
  mapId,
  studentName
) {

  localStorage.removeItem(

    progressKey(
      mapId,
      studentName
    )

  );

}


export function clearAllProgress(
  studentName
) {

  for (
    const mapId of
    MAP_IDS
  ) {

    clearMapProgress(
      mapId,
      studentName
    );

  }

}


/* =====================================================
   CURRENT MAP
===================================================== */

export function setCurrentMap(
  mapId
) {

  const profile =
    getProfile();


  if (!profile) {
    return;
  }


  saveProfile({

    ...profile,

    currentMap:
      mapId

  });

}


export function getCurrentMap() {

  const profile =
    getProfile();


  return (
    profile?.currentMap
    ||
    "MAP01"
  );

}


/* =====================================================
   NEXT MAP
===================================================== */

export function getNextMapId(
  currentMap
) {

  const index =
    MAP_IDS.indexOf(
      currentMap
    );


  if (
    index === -1
    ||
    index >=
      MAP_IDS.length - 1
  ) {

    return null;

  }


  return MAP_IDS[
    index + 1
  ];

}


/* =====================================================
   RECORDS
===================================================== */

export function saveRecord(
  record
) {

  let records =
    [];


  try {

    records =
      JSON.parse(
        localStorage.getItem(
          KEYS.records
        )
      )
      ||
      [];

  }

  catch {}


  if (
    !Array.isArray(
      records
    )
  ) {

    records =
      [];

  }


  records.push(
    record
  );


  localStorage.setItem(
    KEYS.records,
    JSON.stringify(
      records
    )
  );

}


export function getRecords() {

  try {

    const records =
      JSON.parse(
        localStorage.getItem(
          KEYS.records
        )
      );


    return Array.isArray(
      records
    )
      ? records
      : [];

  }

  catch {

    return [];

  }

}


/* =====================================================
   TEACHER
===================================================== */

export function getTeacherPin() {

  return (
    localStorage.getItem(
      KEYS.pin
    )
    ||
    "1234"
  );

}


/* =====================================================
   SHUFFLE
===================================================== */

export function shuffle(
  items
) {

  const array =
    [...items];


  for (
    let i =
      array.length - 1;

    i > 0;

    i--
  ) {

    const j =
      Math.floor(
        Math.random()
        *
        (i + 1)
      );


    [
      array[i],
      array[j]
    ] =
    [
      array[j],
      array[i]
    ];

  }


  return array;

}
