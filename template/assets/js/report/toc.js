export function computePageIndex(sections, data) {
  const idx = {};
  let page = 1;
  for (const s of sections) {
    idx[s.id] = page;
    page += s.countPages(data);
  }
  idx._total = page - 1;
  return idx;
}
