// ===============================
// 📌 TIME-TABLE HELPER FUNCTIONS
// ===============================

// Convert "Tiết 1" -> [1]
// Convert "Tiết 1-3" -> [1,2,3]
export function extractTiet(ca: string): number[] {
  if (!ca) return [];

  const match = ca.match(/\d+/g);
  if (!match) return [];

  // Nếu chỉ một số → Tiết 1
  if (match.length === 1) {
    return [Number(match[0])];
  }

  // Nếu có dạng 1-3
  const start = Number(match[0]);
  const end = Number(match[1]);
  const list: number[] = [];

  for (let i = start; i <= end; i++) {
    list.push(i);
  }

  return list;
}

// Convert ca_dau="Tiết 1", ca_cuoi="Tiết 3" -> [1,2,3]
export function rangeOfTiet(ca_dau: string, ca_cuoi: string): number[] {
  const startArr = extractTiet(ca_dau);
  const endArr = extractTiet(ca_cuoi);

  if (!startArr.length || !endArr.length) return [];

  const start = startArr[0];
  const end = endArr[0];

  const list: number[] = [];
  for (let i = start; i <= end; i++) list.push(i);

  return list;
}

// Check trùng tiết giữa 2 lớp
export function isTietConflict(
  thuA: string,
  tietA: number[],
  thuB: string,
  tietB: number[]
): boolean {
  if (!thuA || !thuB) return false;
  if (thuA !== thuB) return false;

  return tietA.some(t => tietB.includes(t));
}

// Check giảng viên/ phòng/ sinh viên bận giờ đó
export function isScheduleConflict(
  newThu: string,
  newTiet: number[],
  existingList: { thu: string; tiet: number[] }[]
): boolean {
  if (!existingList || !Array.isArray(existingList)) return false;

  for (const item of existingList) {
    if (isTietConflict(newThu, newTiet, item.thu, item.tiet)) {
      return true;
    }
  }
  return false;
}

// Chọn danh sách thứ hợp lệ (ưu tiên tránh CN)
export function chooseBestThu(): string[] {
  return ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
}

// Chọn ca học hợp lệ (lấy từ DB)
export function chooseCaHoc(caHocList: { ca: string }[]): string[] {
  if (!Array.isArray(caHocList)) return [];

  return caHocList
    .map(c => c?.ca)
    .filter(x => typeof x === "string" && x.trim().length > 0);
}

// Nếu cần convert ca → số tiết
export function tietFromCa(ca: string): number[] {
  return extractTiet(ca);
}
