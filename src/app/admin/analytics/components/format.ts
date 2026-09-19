// 유입 분석 화면 공통 표시 형식

const PAGE_NAMES: Record<string, string> = {
  '': '홈',
  about: '회사 소개',
  services: '서비스',
  portfolio: '포트폴리오',
  press: '뉴스·프레스',
  contact: '문의하기',
  quote: '견적',
  faq: 'FAQ',
  experience: '체험',
  'formula-lab': 'AI 포뮬러 랩',
  demo: '데모',
}

/** '/services/acscent' → '서비스' (알 수 없는 경로는 빈 문자열) */
export function pageName(path: string): string {
  const first = path.split('/')[1] ?? ''
  return PAGE_NAMES[first] ?? ''
}

const CITY_NAMES: Record<string, string> = {
  Seoul: '서울',
  Busan: '부산',
  Incheon: '인천',
  Daegu: '대구',
  Daejeon: '대전',
  Gwangju: '광주',
  Ulsan: '울산',
  Sejong: '세종',
  Suwon: '수원',
  Seongnam: '성남',
  Goyang: '고양',
  Yongin: '용인',
  Bucheon: '부천',
  Ansan: '안산',
  Anyang: '안양',
  Hwaseong: '화성',
  Pyeongtaek: '평택',
  'Namyangju-si': '남양주',
  Namyangju: '남양주',
  Paju: '파주',
  Gimpo: '김포',
  Hanam: '하남',
  Siheung: '시흥',
  Cheongju: '청주',
  Cheonan: '천안',
  Jeonju: '전주',
  Changwon: '창원',
  Pohang: '포항',
  Jeju: '제주',
  'Jeju City': '제주',
  Gangneung: '강릉',
  Chuncheon: '춘천',
  Wonju: '원주',
}

let regionNames: Intl.DisplayNames | null = null

export function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(['ko'], { type: 'region' })
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

/** 'KR\tSeoul' → '서울', 'US\tAshburn' → 'Ashburn (미국)' */
export function cityName(key: string): string {
  const [country, city] = key.split('\t')
  const name = CITY_NAMES[city] ?? city
  return country && country !== 'KR' ? `${name} (${countryName(country)})` : name
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ko-KR')
}

export function formatPercent(ratio: number, digits = 1): string {
  if (!Number.isFinite(ratio)) return '-'
  return `${(ratio * 100).toFixed(digits).replace(/\.0$/, '')}%`
}

/** 합계 대비 비율 */
export function share(value: number, total: number): number {
  return total > 0 ? value / total : 0
}
