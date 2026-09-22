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
    "별빛 공중도시",

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
   DEFAULT CONTENT
===================================================== */

const DEFAULT_MAPS = {};


for (
  const mapId of
  MAP_IDS
) {

  DEFAULT_MAPS[mapId] = {

    words:
      [],

    expressions:
      []

  };

}


/* -----------------------------------------------------
   MAP01 DEFAULT
------------------------------------------------------ */

DEFAULT_MAPS.MAP01 = {

  words: [

    {
      english:
        "door",

      korean:
        "문"
    },

    {
      english:
        "key",

      korean:
        "열쇠"
    },

    {
      english:
        "desk",

      korean:
        "책상"
    },

    {
      english:
        "window",

      korean:
        "창문"
    },

    {
      english:
        "clock",

      korean:
        "시계"
    },

    {
      english:
        "book",

      korean:
        "책"
    },

    {
      english:
        "bag",

      korean:
        "가방"
    },

    {
      english:
        "box",

      korean:
        "상자"
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


/* -----------------------------------------------------
   MAP02 DEFAULT
------------------------------------------------------ */

DEFAULT_MAPS.MAP02 = {

  words: [

    {
      english:
        "library",

      korean:
        "도서관"
    },

    {
      english:
        "bookshelf",

      korean:
        "책장"
    },

    {
      english:
        "clock",

      korean:
        "시계"
    },

    {
      english:
        "table",

      korean:
        "테이블"
    },

    {
      english:
        "magic",

      korean:
        "마법"
    },

    {
      english:
        "cabinet",

      korean:
        "캐비닛"
    },

    {
      english:
        "book",

      korean:
        "책"
    },

    {
      english:
        "read",

      korean:
        "읽다"
    }

  ],


  expressions: [

    {
      english:
        "Read the old book.",

      korean:
        "오래된 책을 읽으세요."
    },

    {
      english:
        "Look at the clock.",

      korean:
        "시계를 보세요."
    },

    {
      english:
        "Open the locked cabinet.",

      korean:
        "잠긴 캐비닛을 여세요."
    },

    {
      english:
        "Go to the magic circle.",

      korean:
        "마법진으로 가세요."
    },

    {
      english:
        "Find the hidden clue.",

      korean:
        "숨겨진 단서를 찾으세요."
    },

    {
      english:
        "The key is on the table.",

      korean:
        "열쇠는 테이블 위에 있습니다."
    }

  ]

};


/* =====================================================
   STORAGE KEYS
===================================================== */

const KEYS = {

  content:
    "wisdom_all_maps_content_v4",

  profile:
    "wisdom_profile_v4",

  progressPrefix:
    "wisdom_progress_v4_",

  records:
    "wisdom_records_v4",

  pin:
    "wisdom_teacher_pin_v1"

};


/* =====================================================
   BASIC HELPERS
===================================================== */

function clone(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


function normalizePair(
  item
) {

  if (
    typeof item ===
    "string"
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
        item?.english
        ??
        ""
      ).trim(),

    korean:
      String(
        item?.korean
        ??
        ""
      ).trim()

  };

}


function normalizeMapData(
  data
) {

  const words =
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

      : [];


  const expressions =
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

      : [];


  return {

    words,

    expressions

  };

}


function normalizeAllMaps(
  source
) {

  const result = {};


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


function emptyAllMaps() {

  const result = {};


  for (
    const mapId of
    MAP_IDS
  ) {

    result[mapId] = {

      words:
        [],

      expressions:
        []

    };

  }


  return result;

}


function safeStudentKey(
  name
) {

  return String(
    name
    ??
    ""
  )
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


/* =====================================================
   CONTENT
===================================================== */

export function getAllMapContent() {

  try {

    const raw =
      localStorage.getItem(
        KEYS.content
      );


    if (
      raw
    ) {

      const parsed =
        JSON.parse(
          raw
        );


      return normalizeAllMaps(
        parsed
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
    clone(
      DEFAULT_MAPS
    )
  );

}


export function saveAllMapContent(
  maps
) {

  const normalized =
    normalizeAllMaps(
      maps
    );


  localStorage.setItem(
    KEYS.content,
    JSON.stringify(
      normalized
    )
  );

}


export function getMapContent(
  mapId
) {

  const maps =
    getAllMapContent();


  return normalizeMapData(
    maps?.[mapId]
    ??
    {
      words:
        [],

      expressions:
        []
    }
  );

}


export function saveMapContent(
  mapId,
  data
) {

  if (
    !MAP_IDS.includes(
      mapId
    )
  ) {

    console.warn(
      `알 수 없는 MAP ID: ${mapId}`
    );


    return;

  }


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
   TXT PARSER
===================================================== */

export function parseAllMapsTxt(
  text
) {

  const result =
    emptyAllMaps();


  let currentMap =
    null;


  let currentSection =
    null;


  const lines =
    String(
      text
      ??
      ""
    )
      .replace(
        /^\uFEFF/,
        ""
      )
      .split(
        /\r?\n/
      );


  for (
    const rawLine of
    lines
  ) {

    const line =
      rawLine.trim();


    if (
      !line
    ) {

      continue;

    }


    if (
      line.startsWith(
        "#"
      )
    ) {

      continue;

    }


    const mapMatch =
      line.match(
        /^\[MAP(\d{1,2})\]$/i
      );


    if (
      mapMatch
    ) {

      const number =
        Number(
          mapMatch[1]
        );


      if (
        number >= 1
        &&
        number <= 12
      ) {

        currentMap =
          `MAP${String(
            number
          ).padStart(
            2,
            "0"
          )}`;

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
      line.toUpperCase()
      ===
      "[WORDS]"
    ) {

      currentSection =
        "words";


      continue;

    }


    if (
      line.toUpperCase()
      ===
      "[EXPRESSIONS]"
    ) {

      currentSection =
        "expressions";


      continue;

    }


    if (
      line.startsWith(
        "["
      )
      &&
      line.endsWith(
        "]"
      )
    ) {

      currentSection =
        null;


      continue;

    }


    if (
      !currentMap
      ||
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
        .length
      >=
      20
    ) {

      continue;

    }


    result[currentMap][currentSection]
      .push(
        item
      );

  }


  return result;

}


function parsePairLine(
  line
) {

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


/* =====================================================
   TXT SERIALIZER
===================================================== */

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

    "#",

    "# 입력 형식:",

    "# 영어 | 한국어 뜻",

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
      normalized[mapId]
        .expressions
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

    return (
      `${item.english} | ${item.korean}`
    );

  }


  return item.english;

}


/* =====================================================
   CSV PARSER

   기본 형식:

   map,type,english,korean
   MAP01,word,door,문
   MAP01,expression,Open the door.,문을 여세요.

===================================================== */

export function parseAllMapsCsv(
  csvText
) {

  const result =
    emptyAllMaps();


  const rows =
    parseCsvRows(
      String(
        csvText
        ??
        ""
      )
        .replace(
          /^\uFEFF/,
          ""
        )
    );


  if (
    rows.length ===
    0
  ) {

    return result;

  }


  const firstRow =
    rows[0]
      .map(
        value =>
          normalizeCsvHeader(
            value
          )
      );


  const hasHeader =
    firstRow.includes(
      "map"
    )
    &&
    firstRow.includes(
      "type"
    )
    &&
    firstRow.includes(
      "english"
    );


  let mapIndex =
    0;


  let typeIndex =
    1;


  let englishIndex =
    2;


  let koreanIndex =
    3;


  let startIndex =
    0;


  if (
    hasHeader
  ) {

    mapIndex =
      firstRow.indexOf(
        "map"
      );


    typeIndex =
      firstRow.indexOf(
        "type"
      );


    englishIndex =
      firstRow.indexOf(
        "english"
      );


    koreanIndex =
      firstRow.indexOf(
        "korean"
      );


    startIndex =
      1;

  }


  for (
    let i =
      startIndex;

    i <
    rows.length;

    i++
  ) {

    const row =
      rows[i];


    if (
      !row
      ||
      row.every(
        value =>
          !String(
            value
            ??
            ""
          ).trim()
      )
    ) {

      continue;

    }


    const rawMap =
      String(
        row[mapIndex]
        ??
        ""
      ).trim();


    const mapId =
      normalizeCsvMapId(
        rawMap
      );


    if (
      !mapId
    ) {

      continue;

    }


    const type =
      normalizeCsvType(
        row[typeIndex]
      );


    if (
      !type
    ) {

      continue;

    }


    const english =
      String(
        row[englishIndex]
        ??
        ""
      ).trim();


    const korean =
      koreanIndex >= 0

        ? String(
            row[koreanIndex]
            ??
            ""
          ).trim()

        : "";


    if (
      !english
    ) {

      continue;

    }


    const section =
      type ===
      "word"

        ? "words"

        : "expressions";


    if (
      result[mapId][section]
        .length
      >=
      20
    ) {

      continue;

    }


    result[mapId][section]
      .push({

        english,

        korean

      });

  }


  return result;

}


/* =====================================================
   CSV ROW PARSER
   - 쉼표
   - 따옴표
   - 따옴표 안 줄바꿈
   모두 지원
===================================================== */

function parseCsvRows(
  text
) {

  const rows =
    [];


  let row =
    [];


  let value =
    "";


  let quoted =
    false;


  for (
    let i =
      0;

    i <
    text.length;

    i++
  ) {

    const char =
      text[i];


    const next =
      text[i + 1];


    if (
      char ===
      '"'
    ) {

      if (
        quoted
        &&
        next ===
        '"'
      ) {

        value +=
          '"';


        i++;


        continue;

      }


      quoted =
        !quoted;


      continue;

    }


    if (
      char ===
      ","
      &&
      !quoted
    ) {

      row.push(
        value
      );


      value =
        "";


      continue;

    }


    if (
      (
        char ===
        "\n"
        ||
        char ===
        "\r"
      )
      &&
      !quoted
    ) {

      if (
        char ===
        "\r"
        &&
        next ===
        "\n"
      ) {

        i++;

      }


      row.push(
        value
      );


      rows.push(
        row
      );


      row =
        [];


      value =
        "";


      continue;

    }


    value +=
      char;

  }


  row.push(
    value
  );


  if (
    row.length > 1
    ||
    row.some(
      cell =>
        String(
          cell
          ??
          ""
        ).trim()
    )
  ) {

    rows.push(
      row
    );

  }


  return rows;

}


function normalizeCsvHeader(
  value
) {

  const text =
    String(
      value
      ??
      ""
    )
      .trim()
      .toLowerCase();


  const aliases = {

    map:
      "map",

    mapid:
      "map",

    "map id":
      "map",

    맵:
      "map",

    type:
      "type",

    종류:
      "type",

    유형:
      "type",

    english:
      "english",

    eng:
      "english",

    영어:
      "english",

    korean:
      "korean",

    kor:
      "korean",

    한국어:
      "korean",

    뜻:
      "korean",

    의미:
      "korean"

  };


  return (
    aliases[text]
    ??
    text
  );

}


function normalizeCsvMapId(
  value
) {

  const text =
    String(
      value
      ??
      ""
    )
      .trim()
      .toUpperCase();


  const match =
    text.match(
      /^MAP\s*0?(\d{1,2})$/
    );


  if (
    !match
  ) {

    return null;

  }


  const number =
    Number(
      match[1]
    );


  if (
    number < 1
    ||
    number > 12
  ) {

    return null;

  }


  return (
    `MAP${String(
      number
    ).padStart(
      2,
      "0"
    )}`
  );

}


function normalizeCsvType(
  value
) {

  const text =
    String(
      value
      ??
      ""
    )
      .trim()
      .toLowerCase();


  if (
    [
      "word",
      "words",
      "vocab",
      "vocabulary",
      "단어"
    ].includes(
      text
    )
  ) {

    return "word";

  }


  if (
    [
      "expression",
      "expressions",
      "sentence",
      "sentences",
      "phrase",
      "phrases",
      "표현",
      "문장"
    ].includes(
      text
    )
  ) {

    return "expression";

  }


  return null;

}


/* =====================================================
   CSV SERIALIZER
===================================================== */

export function serializeAllMapsCsv(
  maps
) {

  const normalized =
    normalizeAllMaps(
      maps
    );


  const rows = [

    [
      "map",
      "type",
      "english",
      "korean"
    ]

  ];


  for (
    const mapId of
    MAP_IDS
  ) {

    for (
      const item of
      normalized[mapId].words
    ) {

      rows.push([

        mapId,

        "word",

        item.english,

        item.korean

      ]);

    }


    for (
      const item of
      normalized[mapId]
        .expressions
    ) {

      rows.push([

        mapId,

        "expression",

        item.english,

        item.korean

      ]);

    }

  }


  return rows
    .map(
      row =>
        row
          .map(
            csvEscape
          )
          .join(
            ","
          )
    )
    .join(
      "\r\n"
    );

}


export function serializeCsvTemplate() {

  const rows = [

    [
      "map",
      "type",
      "english",
      "korean"
    ],

    [
      "MAP01",
      "word",
      "door",
      "문"
    ],

    [
      "MAP01",
      "word",
      "key",
      "열쇠"
    ],

    [
      "MAP01",
      "word",
      "book",
      "책"
    ],

    [
      "MAP01",
      "word",
      "desk",
      "책상"
    ],

    [
      "MAP01",
      "expression",
      "Open the door.",
      "문을 여세요."
    ],

    [
      "MAP01",
      "expression",
      "Where is the key?",
      "열쇠는 어디에 있나요?"
    ],

    [
      "MAP01",
      "expression",
      "Look at the book.",
      "책을 보세요."
    ],

    [
      "MAP01",
      "expression",
      "The key is on the desk.",
      "열쇠는 책상 위에 있습니다."
    ]

  ];


  return rows
    .map(
      row =>
        row
          .map(
            csvEscape
          )
          .join(
            ","
          )
    )
    .join(
      "\r\n"
    );

}


function csvEscape(
  value
) {

  const text =
    String(
      value
      ??
      ""
    );


  if (
    text.includes(
      ","
    )
    ||
    text.includes(
      '"'
    )
    ||
    text.includes(
      "\n"
    )
    ||
    text.includes(
      "\r"
    )
  ) {

    return (
      '"'
      +
      text.replaceAll(
        '"',
        '""'
      )
      +
      '"'
    );

  }


  return text;

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

    const raw =
      localStorage.getItem(
        KEYS.profile
      );


    if (
      !raw
    ) {

      return null;

    }


    return JSON.parse(
      raw
    );

  }

  catch {

    return null;

  }

}


/* =====================================================
   CURRENT MAP
===================================================== */

export function setCurrentMap(
  mapId
) {

  if (
    !MAP_IDS.includes(
      mapId
    )
  ) {

    return;

  }


  const profile =
    getProfile();


  if (
    !profile
  ) {

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


  if (
    profile?.currentMap
    &&
    MAP_IDS.includes(
      profile.currentMap
    )
  ) {

    return profile.currentMap;

  }


  return "MAP01";

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
    index ===
    -1
  ) {

    return null;

  }


  if (
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
   PROGRESS
===================================================== */

export function saveMapProgress(
  mapId,
  studentName,
  state
) {

  if (
    !mapId
    ||
    !studentName
  ) {

    return;

  }


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

    const raw =
      localStorage.getItem(
        progressKey(
          mapId,
          studentName
        )
      );


    if (
      !raw
    ) {

      return null;

    }


    return JSON.parse(
      raw
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
   RECORDS
===================================================== */

export function saveRecord(
  record
) {

  let records =
    [];


  try {

    const raw =
      localStorage.getItem(
        KEYS.records
      );


    if (
      raw
    ) {

      const parsed =
        JSON.parse(
          raw
        );


      if (
        Array.isArray(
          parsed
        )
      ) {

        records =
          parsed;

      }

    }

  }

  catch {}


  records.push(
    record
  );


  /*
    기록이 무한히 늘어나지 않게
    최근 2000개까지만 보관
  */

  if (
    records.length >
    2000
  ) {

    records =
      records.slice(
        -2000
      );

  }


  localStorage.setItem(
    KEYS.records,
    JSON.stringify(
      records
    )
  );

}


export function getRecords() {

  try {

    const raw =
      localStorage.getItem(
        KEYS.records
      );


    if (
      !raw
    ) {

      return [];

    }


    const parsed =
      JSON.parse(
        raw
      );


    return Array.isArray(
      parsed
    )

      ? parsed

      : [];

  }

  catch {

    return [];

  }

}


/* =====================================================
   TEACHER PIN
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
    [
      ...items
    ];


  for (
    let i =
      array.length - 1;

    i >
    0;

    i--
  ) {

    const j =
      Math.floor(
        Math.random()
        *
        (
          i + 1
        )
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
