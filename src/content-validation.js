export const MAX_CONTENT_ITEMS = 60;
export function validateMapContent(id, content) {
  const phonics = id === 'MAP01' && content?.mode === 'phonics';
  if (content?.mode && !phonics) throw new Error(`${id}: 지원하지 않는 학습 유형입니다.`);
  for (const section of ['words', 'expressions']) {
    const items = content?.[section];
    const minimum = phonics && section === 'expressions' ? 0 : 4;
    if (!Array.isArray(items) || items.length < minimum || items.length > MAX_CONTENT_ITEMS) throw new Error(`${id}: 단어와 표현을 각각 4~${MAX_CONTENT_ITEMS}개 넣어 주세요.`);
    if (items.some(item => !item?.english?.trim() || !item?.korean?.trim())) throw new Error(`${id}: 영어와 한국어 뜻이 모두 필요합니다.`);
    if (new Set(items.map(item => item.english.trim().toLowerCase())).size !== items.length) throw new Error(`${id}: 중복된 영어 항목을 확인해 주세요.`);
  }
}
export function validateAllMaps(maps) {
  for (let i = 1; i <= 12; i++) {
    const id = `MAP${String(i).padStart(2, '0')}`;
    validateMapContent(id, maps?.[id]);
  }
}
