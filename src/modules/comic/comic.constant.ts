export enum ComicStatus {
  COMPLETED = 'Đã hoàn thành',
  UPDATING = 'Đang cập nhật',
  DROPPED = 'Ngừng cập nhật',
  DELETED = 'Đã xóa',
}

export enum ComicSource {
  TruyenQQTop = 'truyenqqtop.com',
  TruyenQQVip = 'truyenqqvip.com',
  TruyenQQ = 'truyenqq.net',
  NetTruyen = 'nettruyen.vn',
}

export const RequireRefererMap: Map<ComicSource, boolean> = new Map<ComicSource, boolean>([
  [ComicSource.TruyenQQTop, true],
  [ComicSource.TruyenQQVip, true],
  [ComicSource.TruyenQQ, true],
  [ComicSource.NetTruyen, false],
]);

export enum Sort {
  Desc = 'desc',
  Asc = 'asc',
}

export const featureHardCoded: string[] = [
  'http://truyenqqvip.com/truyen-tranh/kimetsu-no-yaiba-2624',
  'http://truyenqqvip.com/truyen-tranh/boku-no-hero-academia-380',
  'http://truyenqqvip.com/truyen-tranh/black-clover-499',
  'http://truyenqqvip.com/truyen-tranh/dao-hai-tac-128',
  'http://truyenqqvip.com/truyen-tranh/dai-chien-titan-462',
  'http://truyenqqvip.com/truyen-tranh/onepunch-man-244',
  'http://truyenqqvip.com/truyen-tranh/fairy-tail-100-year-quest-5212',
  'http://truyenqqvip.com/truyen-tranh/kingdom-vuong-gia-thien-ha-245',
  'http://truyenqqvip.com/truyen-tranh/that-hinh-dai-toi-740',
];
