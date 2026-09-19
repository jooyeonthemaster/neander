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

// Vercel이 넘겨주는 시·도 코드 (ISO 3166-2:KR)
const KR_REGIONS: Record<string, string> = {
  '11': '서울',
  '26': '부산',
  '27': '대구',
  '28': '인천',
  '29': '광주',
  '30': '대전',
  '31': '울산',
  '50': '세종',
  '41': '경기',
  '42': '강원',
  '51': '강원',
  '43': '충북',
  '44': '충남',
  '45': '전북',
  '52': '전북',
  '46': '전남',
  '47': '경북',
  '48': '경남',
  '49': '제주',
}

// Vercel은 서울 등 대도시를 구 단위(예: Mapo-gu)로 알려준다
const CITY_NAMES: Record<string, string> = {
  'Gangnam-gu': '강남구',
  'Gangdong-gu': '강동구',
  'Gangbuk-gu': '강북구',
  'Gangseo-gu': '강서구',
  'Gwanak-gu': '관악구',
  'Gwangjin-gu': '광진구',
  'Guro-gu': '구로구',
  'Geumcheon-gu': '금천구',
  'Nowon-gu': '노원구',
  'Dobong-gu': '도봉구',
  'Dongdaemun-gu': '동대문구',
  'Dongjak-gu': '동작구',
  'Mapo-gu': '마포구',
  'Seodaemun-gu': '서대문구',
  'Seocho-gu': '서초구',
  'Seongdong-gu': '성동구',
  'Seongbuk-gu': '성북구',
  'Songpa-gu': '송파구',
  'Yangcheon-gu': '양천구',
  'Yeongdeungpo-gu': '영등포구',
  'Yongsan-gu': '용산구',
  'Eunpyeong-gu': '은평구',
  'Jongno-gu': '종로구',
  'Jung-gu': '중구',
  'Jungnang-gu': '중랑구',
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

/** 'KR\t11' → '서울' */
export function regionName(key: string): string {
  const [country, region] = key.split('\t')
  if (country === 'KR') return KR_REGIONS[region] ?? region
  return `${region} (${countryName(country)})`
}

function localCity(city: string): string {
  return CITY_NAMES[city] ?? CITY_NAMES[city.replace(/-si$/, '')] ?? city
}

/** 'KR\t11\tMapo-gu' → '서울 마포구', 'US\tVA\tAshburn' → 'Ashburn (미국)' */
export function cityName(key: string): string {
  const [country, region, city] = key.split('\t')
  if (country !== 'KR') return `${city} (${countryName(country)})`
  const name = localCity(city)
  const regionLabel = KR_REGIONS[region]
  return regionLabel && regionLabel !== name ? `${regionLabel} ${name}` : name
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
