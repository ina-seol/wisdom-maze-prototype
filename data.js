export const DEFAULT_UNIT1 = {

  words: [
    "key",
    "door",
    "desk",
    "chair",
    "window",
    "clock",
    "book",
    "box",
    "bag",
    "map",
    "under",
    "behind"
  ],

  expressions: [
    "Where is the key?",
    "It is under the desk.",
    "Look under the desk.",
    "Open the box.",
    "I found the key."
  ]
};


const KEYS = {
  content: "wisdom_unit1_content_v1",
  profile: "wisdom_profile_v1",
  progressPrefix: "wisdom_map01_",
  records: "wisdom_records_v1",
  pin: "wisdom_teacher_pin_v1"
};


export function getUnit1Content() {

  try {

    const data = JSON.parse(
      localStorage.getItem(KEYS.content)
    );

    if (data?.words && data?.expressions) {
      return data;
    }

  } catch {}

  return structuredClone(DEFAULT_UNIT1);
}


export function saveUnit1Content(data) {

  localStorage.setItem(
    KEYS.content,
    JSON.stringify(data)
  );
}


export function parseTxt(text) {

  const result = {
    words: [],
    expressions: []
  };

  let section = "";

  for (const raw of text.split(/\r?\n/)) {

    const line = raw.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line === "[WORDS]") {
      section = "words";
      continue;
    }

    if (line === "[EXPRESSIONS]") {
      section = "expressions";
      continue;
    }

    if (line.startsWith("[")) {
      section = "";
      continue;
    }

    if (
      section === "words" &&
      result.words.length < 20
    ) {
      result.words.push(line);
    }

    if (
      section === "expressions" &&
      result.expressions.length < 20
    ) {
      result.expressions.push(line);
    }

  }

  result.words = [...new Set(result.words)];
  result.expressions = [...new Set(result.expressions)];

  return result;
}


export function serializeTxt(data) {

  return `# 지혜의 미로 탐험대
# MAP 01

[WORDS]
${data.words.join("\n")}

[EXPRESSIONS]
${data.expressions.join("\n")}
`;
}


export function saveProfile(profile) {

  localStorage.setItem(
    KEYS.profile,
    JSON.stringify(profile)
  );
}


export function getProfile() {

  try {

    return JSON.parse(
      localStorage.getItem(KEYS.profile)
    );

  } catch {

    return null;
  }
}


function profileKey(name) {

  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}


export function newMapState() {

  return {

    introDone: false,

    phase: "intro",

    shards: 0,

    p1Target: null,
    p1Started: false,
    p1Solved: false,

    pushSteps: 0,
    lockerKey: false,

    p2Solved: false,

    p3Solved: false,

    boxTargetColor: null,
    p4Solved: false,

    finalStep: 0,
    finalSolved: false,

    completed: false,

    questionsShown: 0,
    firstTryCorrect: 0,
    wrongAttempts: 0,
    hintsUsed: 0,

    mistakes: {},

    sessionStartedAt: Date.now()
  };
}


export function saveMapProgress(name, state) {

  localStorage.setItem(
    KEYS.progressPrefix + profileKey(name),
    JSON.stringify(state)
  );
}


export function loadMapProgress(name) {

  try {

    return JSON.parse(
      localStorage.getItem(
        KEYS.progressPrefix + profileKey(name)
      )
    );

  } catch {

    return null;
  }
}


export function clearMapProgress(name) {

  localStorage.removeItem(
    KEYS.progressPrefix + profileKey(name)
  );
}


export function saveRecord(record) {

  let records = {};

  try {

    records =
      JSON.parse(
        localStorage.getItem(KEYS.records)
      ) || {};

  } catch {}

  records[profileKey(record.studentName)] = record;

  localStorage.setItem(
    KEYS.records,
    JSON.stringify(records)
  );
}


export function getTeacherPin() {

  return (
    localStorage.getItem(KEYS.pin) ||
    "1234"
  );
}


export function chooseObjectWord(words) {

  const allowed = [
    "window",
    "clock",
    "desk",
    "chair",
    "book",
    "bag",
    "box",
    "door"
  ];

  const candidates = words
    .map(v => v.toLowerCase())
    .filter(v => allowed.includes(v));

  if (!candidates.length) {
    return "clock";
  }

  return candidates[
    Math.floor(Math.random() * candidates.length)
  ];
}


export function findExpression(
  expressions,
  regex,
  fallback
) {

  const candidate =
    expressions.find(expression =>
      regex.test(expression)
    );

  return candidate || fallback;
}


export function randomBoxColor() {

  return ["red", "blue", "old"][
    Math.floor(Math.random() * 3)
  ];
}


export function shuffle(items) {

  const array = [...items];

  for (let i = array.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] =
      [array[j], array[i]];
  }

  return array;
}