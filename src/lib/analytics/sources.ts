// ============================================================
// 유입 분석 - 채널·소스 분류와 표시 이름
// 서버(/api/track)가 리퍼러·UTM·User-Agent를 분류할 때와
// 관리자 화면이 저장된 키를 한글 이름으로 보여줄 때 함께 쓴다.
// ============================================================

export const CHANNELS = ['direct', 'search', 'social', 'ai', 'email', 'referral', 'campaign'] as const
export type Channel = (typeof CHANNELS)[number]

export const CHANNEL_LABELS: Record<Channel, string> = {
  direct: '직접 유입',
  search: '검색',
  social: '소셜·커뮤니티',
  ai: 'AI 서비스',
  email: '이메일',
  referral: '외부 사이트',
  campaign: '캠페인(UTM)',
}

export const CHANNEL_DESCRIPTIONS: Record<Channel, string> = {
  direct: '주소 직접 입력, 북마크, 리퍼러를 남기지 않는 앱',
  search: '네이버·구글·다음 등 검색 결과와 지도',
  social: '인스타그램, 블로그, 카페, 카카오톡 등',
  ai: 'ChatGPT, Perplexity, Gemini 등 AI 답변의 링크',
  email: '웹메일에서 누른 링크',
  referral: '그 밖의 다른 웹사이트',
  campaign: 'utm_source 등 캠페인 태그가 붙은 링크',
}

interface SourceRule {
  key: string
  label: string
  channel: Channel
  host: RegExp
}

// 위에서부터 먼저 맞는 규칙을 쓴다 (예: mail.google.com 은 google 검색보다 먼저)
const SOURCE_RULES: SourceRule[] = [
  // 네이버
  { key: 'naver_blog', label: '네이버 블로그', channel: 'social', host: /^(m\.)?blog\.naver\.com$/ },
  { key: 'naver_cafe', label: '네이버 카페', channel: 'social', host: /^(m\.)?cafe\.naver\.com$/ },
  { key: 'naver_mail', label: '네이버 메일', channel: 'email', host: /^(m\.)?mail\.naver\.com$/ },
  { key: 'naver_place', label: '네이버 지도·플레이스', channel: 'search', host: /^(m\.|pcmap\.)?(map|place)\.naver\.com$/ },
  { key: 'naver', label: '네이버 검색', channel: 'search', host: /^((m|www)\.)?(search\.)?naver\.com$/ },
  // 카카오·다음
  { key: 'daum_mail', label: '다음 메일', channel: 'email', host: /^(m\.)?mail\.daum\.net$/ },
  { key: 'daum', label: '다음 검색', channel: 'search', host: /^((m|www)\.)?(search\.)?daum\.net$/ },
  { key: 'kakao', label: '카카오', channel: 'social', host: /(^|\.)kakao\.com$|(^|\.)kakao\.me$/ },
  // 구글
  { key: 'gmail', label: 'Gmail', channel: 'email', host: /^mail\.google\.com$/ },
  { key: 'gemini', label: 'Gemini', channel: 'ai', host: /^gemini\.google\.com$/ },
  { key: 'google', label: 'Google 검색', channel: 'search', host: /^(www\.)?google\.[a-z.]+$/ },
  // 그 밖의 검색엔진
  { key: 'bing', label: 'Bing', channel: 'search', host: /(^|\.)bing\.com$/ },
  { key: 'yahoo', label: 'Yahoo', channel: 'search', host: /(^|\.)search\.yahoo\.[a-z.]+$|(^|\.)yahoo\.co\.jp$/ },
  { key: 'duckduckgo', label: 'DuckDuckGo', channel: 'search', host: /(^|\.)duckduckgo\.com$/ },
  { key: 'zum', label: '줌', channel: 'search', host: /(^|\.)zum\.com$/ },
  { key: 'nate', label: '네이트', channel: 'search', host: /(^|\.)nate\.com$/ },
  { key: 'baidu', label: 'Baidu', channel: 'search', host: /(^|\.)baidu\.com$/ },
  { key: 'yandex', label: 'Yandex', channel: 'search', host: /(^|\.)yandex\.[a-z.]+$/ },
  { key: 'ecosia', label: 'Ecosia', channel: 'search', host: /(^|\.)ecosia\.org$/ },
  { key: 'brave', label: 'Brave 검색', channel: 'search', host: /^search\.brave\.com$/ },
  // AI 서비스
  { key: 'chatgpt', label: 'ChatGPT', channel: 'ai', host: /^(chatgpt\.com|chat\.openai\.com)$/ },
  { key: 'perplexity', label: 'Perplexity', channel: 'ai', host: /(^|\.)perplexity\.ai$/ },
  { key: 'claude', label: 'Claude', channel: 'ai', host: /^claude\.ai$/ },
  { key: 'copilot', label: 'Copilot', channel: 'ai', host: /^copilot\.microsoft\.com$/ },
  { key: 'wrtn', label: '뤼튼', channel: 'ai', host: /(^|\.)wrtn\.(ai|io)$/ },
  { key: 'liner', label: 'Liner', channel: 'ai', host: /(^|\.)getliner\.com$|(^|\.)liner\.com$/ },
  // 소셜·커뮤니티
  { key: 'instagram', label: 'Instagram', channel: 'social', host: /(^|\.)instagram\.com$/ },
  { key: 'facebook', label: 'Facebook', channel: 'social', host: /(^|\.)facebook\.com$|^fb\.me$/ },
  { key: 'youtube', label: 'YouTube', channel: 'social', host: /(^|\.)youtube\.com$|^youtu\.be$/ },
  { key: 'x', label: 'X(트위터)', channel: 'social', host: /^(t\.co|(www\.)?x\.com|(www\.|mobile\.)?twitter\.com)$/ },
  { key: 'linkedin', label: 'LinkedIn', channel: 'social', host: /(^|\.)linkedin\.com$|^lnkd\.in$/ },
  { key: 'threads', label: 'Threads', channel: 'social', host: /(^|\.)threads\.(net|com)$/ },
  { key: 'band', label: '밴드', channel: 'social', host: /(^|\.)band\.us$/ },
  { key: 'tiktok', label: 'TikTok', channel: 'social', host: /(^|\.)tiktok\.com$/ },
  { key: 'pinterest', label: 'Pinterest', channel: 'social', host: /(^|\.)pinterest\.[a-z.]+$|^pin\.it$/ },
  { key: 'tistory', label: '티스토리', channel: 'social', host: /(^|\.)tistory\.com$/ },
  { key: 'brunch', label: '브런치', channel: 'social', host: /(^|\.)brunch\.co\.kr$/ },
  { key: 'linktree', label: 'Linktree', channel: 'social', host: /^linktr\.ee$/ },
  { key: 'reddit', label: 'Reddit', channel: 'social', host: /(^|\.)reddit\.com$/ },
  // 웹메일
  { key: 'outlook', label: 'Outlook', channel: 'email', host: /^outlook\.(live|office|office365)\.com$/ },
]

// 리퍼러를 남기지 않는 인앱 브라우저 → 어느 앱에서 들어왔는지로 소스를 대신한다
const IN_APP_LABELS: Record<string, string> = {
  kakaotalk: '카카오톡',
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  naver_app: '네이버 앱',
  daum_app: '다음 앱',
  line: 'LINE',
  band: '밴드',
  everytime: '에브리타임',
}

// utm_source 로 흔히 쓰는 값을 같은 소스 키로 모은다
const UTM_SOURCE_ALIASES: Record<string, string> = {
  ig: 'instagram',
  insta: 'instagram',
  fb: 'facebook',
  meta: 'facebook',
  yt: 'youtube',
  kakaotalk: 'kakao',
  kakao_talk: 'kakao',
  twitter: 'x',
  blog: 'naver_blog',
  naverblog: 'naver_blog',
}

const EXTRA_SOURCE_LABELS: Record<string, string> = {
  direct: '직접 입력·북마크',
  unknown: '알 수 없음',
  ...IN_APP_LABELS,
}

/** 저장된 소스 키를 화면에 보여줄 이름으로 바꾼다. 모르는 키(외부 사이트 호스트 등)는 그대로 보여준다 */
export function sourceLabel(key: string): string {
  return (
    SOURCE_RULES.find((rule) => rule.key === key)?.label ??
    EXTRA_SOURCE_LABELS[key] ??
    key
  )
}

export function inAppLabel(key: string): string {
  return IN_APP_LABELS[key] ?? key
}

// ============================================================
// 분류 (서버 전용으로 쓰지만 순수 함수라 어디서든 import 가능)
// ============================================================

export interface SessionOrigin {
  /** 세션 첫 페이지의 document.referrer (사이트 내부 이동이면 빈 문자열) */
  ref: string
  utm: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  /** 세션 첫 페이지 경로 */
  landing: string
}

export interface ClassifiedOrigin {
  channel: Channel
  source: string
  medium: string | null
  campaign: string | null
  keyword: string | null
  referrer: string | null
}

const KEYWORD_PARAMS = ['query', 'q', 'p', 'wd', 'text', 'keyword']

function clean(value: string | undefined | null, max: number): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function parseReferrer(ref: string): URL | null {
  if (!ref) return null
  try {
    const url = new URL(ref)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function extractKeyword(url: URL): string | null {
  for (const param of KEYWORD_PARAMS) {
    const value = clean(url.searchParams.get(param), 100)
    if (value) return value
  }
  return null
}

/**
 * 세션 시작 정보(리퍼러·UTM)와 인앱 브라우저 여부로 유입 채널과 소스를 정한다.
 * @param ownHosts 사이트 자신의 호스트 (여기서 온 리퍼러는 내부 이동으로 보고 직접 유입 처리)
 */
export function classifyOrigin(
  origin: SessionOrigin,
  inApp: string | null,
  ownHosts: string[]
): ClassifiedOrigin {
  const refUrl = parseReferrer(origin.ref)
  const refHost = refUrl && !ownHosts.includes(refUrl.hostname) ? refUrl.hostname.toLowerCase() : null
  const keyword = clean(origin.utm.term, 100) ?? (refUrl && refHost ? extractKeyword(refUrl) : null)

  const utmSource = clean(origin.utm.source, 60)?.toLowerCase() ?? null
  const utmMedium = clean(origin.utm.medium, 60)?.toLowerCase() ?? null
  if (utmSource || utmMedium) {
    const source = utmSource ? UTM_SOURCE_ALIASES[utmSource] ?? utmSource : refHost ?? 'unknown'
    return {
      channel: utmMedium === 'email' || utmMedium === 'newsletter' ? 'email' : 'campaign',
      source,
      medium: utmMedium,
      campaign: clean(origin.utm.campaign, 100),
      keyword,
      referrer: refHost,
    }
  }

  if (refHost) {
    const rule = SOURCE_RULES.find((r) => r.host.test(refHost))
    return {
      channel: rule?.channel ?? 'referral',
      source: rule?.key ?? refHost.replace(/^www\./, ''),
      medium: null,
      campaign: null,
      keyword,
      referrer: refHost,
    }
  }

  // 카카오톡·인스타그램 인앱 브라우저는 리퍼러를 넘기지 않는 경우가 많다
  if (inApp) {
    return { channel: 'social', source: inApp, medium: null, campaign: null, keyword: null, referrer: null }
  }

  return { channel: 'direct', source: 'direct', medium: null, campaign: null, keyword: null, referrer: null }
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export const DEVICE_LABELS: Record<DeviceType, string> = {
  mobile: '모바일',
  tablet: '태블릿',
  desktop: 'PC',
}

export interface ParsedAgent {
  device: DeviceType
  os: string
  browser: string
  inApp: string | null
}

function detectInApp(ua: string): string | null {
  if (/KAKAOTALK/i.test(ua)) return 'kakaotalk'
  if (/Instagram/.test(ua)) return 'instagram'
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return 'facebook'
  if (/Barcelona/.test(ua)) return 'threads'
  if (/NAVER\(inapp/.test(ua)) return 'naver_app'
  if (/DaumApps/.test(ua)) return 'daum_app'
  if (/\bLine\//.test(ua)) return 'line'
  if (/\bBAND\//.test(ua)) return 'band'
  if (/everytimeApp/.test(ua)) return 'everytime'
  return null
}

/**
 * @param touchPoints navigator.maxTouchPoints - iPadOS Safari는 Mac으로 보고하므로 이것으로 구분한다
 */
export function parseUserAgent(ua: string, touchPoints: number): ParsedAgent {
  const inApp = detectInApp(ua)
  const ipadAsMac = /Macintosh/.test(ua) && touchPoints > 1

  let os = '기타'
  if (/iPhone|iPad|iPod/.test(ua) || ipadAsMac) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/CrOS/.test(ua)) os = 'ChromeOS'
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  let device: DeviceType = 'desktop'
  if (/iPad|Tablet|PlayBook|Silk/.test(ua) || ipadAsMac || (/Android/.test(ua) && !/Mobile/.test(ua))) {
    device = 'tablet'
  } else if (/Mobi|iPhone|iPod|Android/.test(ua)) {
    device = 'mobile'
  }

  let browser = '기타'
  if (inApp) browser = inAppLabel(inApp)
  else if (/Whale\//.test(ua)) browser = 'Whale'
  else if (/SamsungBrowser\//.test(ua)) browser = 'Samsung Internet'
  else if (/Edg(e|A|iOS)?\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Firefox\/|FxiOS\//.test(ua)) browser = 'Firefox'
  else if (/CriOS\/|Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  return { device, os, browser, inApp }
}

const BOT_PATTERN =
  /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|preview|scrap|facebookexternalhit|embedly|yeti|daum\/|daumoa|mediapartners|python|curl|wget|httpclient|axios|node-fetch|go-http|java\/|\+https?:\/\//i

export function isBotAgent(ua: string): boolean {
  return !ua || BOT_PATTERN.test(ua)
}

// ============================================================
// 이벤트
// ============================================================

/** 사이트에서 기록하는 행동 이벤트 */
export const EVENT_LABELS: Record<string, string> = {
  inquiry_submit: '문의·견적 접수',
  click_tel: '전화번호 클릭',
  click_email: '이메일 주소 클릭',
  click_outbound: '외부 링크 클릭',
}

export const INQUIRY_KIND_LABELS: Record<string, string> = {
  contact: '일반 문의',
  quote: '견적 요청',
}
