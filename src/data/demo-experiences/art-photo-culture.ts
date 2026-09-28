import type { ProgramArtDirection } from './art-types';

/** Each program has its own publication, venue or instrument identity. */
export const photoCultureArtDirections: Record<string, ProgramArtDirection> = {
  'ai-style-profiler': {
    name: 'DRESS NOTE', concept: '옷장을 한 권의 독립 패션 매거진처럼 편집하는 화이트 에디토리얼',
    composition: 'editorial', light: true, headingFont: 'hahmlet', bodyFont: 'pretendard', titleWeight: 600, titleTracking: '-0.055em',
    canvas: '#f2f0e9', paper: '#fffef9', ink: '#282c27', muted: '#60675b', accent: '#4a6048', accentInk: '#ffffff', secondary: '#aa957c',
    imagePosition: '46% 43%', backdropOpacity: 0.13, backdropPosition: 'right center', motif: 'W/E', radius: '2px',
  },
  'ai-runway-photobooth': {
    name: 'THE COVER', concept: '백스테이지의 검은 벽과 패션지의 커다란 명조 타이틀',
    composition: 'immersive', light: false, headingFont: 'nanum-myeongjo', bodyFont: 'ibm-plex', titleWeight: 800, titleTracking: '-0.06em',
    canvas: '#161412', paper: '#24211e', ink: '#fffaf0', muted: '#c4bcb0', accent: '#eee4ce', accentInk: '#171412', secondary: '#b39a7c',
    imagePosition: '50% 24%', backdropOpacity: 0.5, backdropPosition: 'right top', motif: 'R', radius: '0px',
  },
  'ai-fashion-timemachine': {
    name: 'TIME WARDROBE', concept: '색 바랜 박물관 소장품 봉투와 시대를 넘나드는 황토색 승차권',
    composition: 'ticket', light: true, headingFont: 'do-hyeon', bodyFont: 'gowun-batang', titleWeight: 400, titleTracking: '-0.025em',
    canvas: '#e7d7b4', paper: '#fff7df', ink: '#503b27', muted: '#6b5138', accent: '#973b26', accentInk: '#fff9eb', secondary: '#b48b3e',
    imagePosition: '55% 42%', backdropOpacity: 0.19, backdropPosition: 'left center', motif: '↶', radius: '5px',
  },
  'ai-coord-recommender': {
    name: 'LOOK SERVICE', concept: '파란 작업 지시서와 흰 피팅룸으로 구성한 실용적인 스타일 데스크',
    composition: 'window', light: true, headingFont: 'ibm-plex', bodyFont: 'pretendard', titleWeight: 700, titleTracking: '-0.045em',
    canvas: '#e8edf4', paper: '#ffffff', ink: '#152b4e', muted: '#526780', accent: '#2157b6', accentInk: '#ffffff', secondary: '#a9bdd9',
    imagePosition: '60% 48%', backdropOpacity: 0.16, backdropPosition: 'right center', motif: '03', radius: '10px',
  },
  'ai-idol-makeup-booth': {
    name: 'DEBUT CLUB', concept: '체리색 벨벳과 조명 달린 거울을 품은 스타의 개인 분장실',
    composition: 'salon', light: false, headingFont: 'jua', bodyFont: 'sunflower', titleWeight: 400, titleTracking: '-0.02em',
    canvas: '#351325', paper: '#4b2037', ink: '#fff2f5', muted: '#e4b7cb', accent: '#ffc0d5', accentInk: '#47162d', secondary: '#d795b0',
    imagePosition: '54% 31%', backdropOpacity: 0.31, backdropPosition: 'left top', motif: '★', radius: '26px',
  },
  'ai-fan-photocard': {
    name: 'DEAR COLLECTOR', concept: '라일락 팝업 창과 레몬색 스티커가 놓인 팬의 카드 보관함',
    composition: 'window', light: true, headingFont: 'gugi', bodyFont: 'gowun-dodum', titleWeight: 400, titleTracking: '-0.04em',
    canvas: '#eae0f5', paper: '#fcf8ff', ink: '#452b61', muted: '#735b8d', accent: '#745097', accentInk: '#ffffff', secondary: '#e4d877',
    imagePosition: '50% 39%', backdropOpacity: 0.18, backdropPosition: 'left center', motif: 'PC', radius: '20px',
  },
  'ai-musicvideo-maker': {
    name: 'SIDE A', concept: '애시드 그린의 큰 활자와 검은 공연 포스터로 만든 뮤직비디오 편집석',
    composition: 'poster', light: false, headingFont: 'black-han', bodyFont: 'ibm-plex', titleWeight: 400, titleTracking: '-0.065em',
    canvas: '#191b17', paper: '#242820', ink: '#f4f9e8', muted: '#bac4ac', accent: '#d2f07b', accentInk: '#1c2815', secondary: '#b79fe2',
    imagePosition: '46% 32%', backdropOpacity: 0.45, backdropPosition: 'center top', motif: '▶', radius: '0px',
  },
  'ai-celeb-lookalike': {
    name: 'CASTING ROOM', concept: '은회색 콘택트 시트와 검정 인덱스 탭으로 고르는 캐스팅 보드',
    composition: 'gallery', light: true, headingFont: 'do-hyeon', bodyFont: 'pretendard', titleWeight: 400, titleTracking: '-0.035em',
    canvas: '#ebe9e5', paper: '#fdfcf8', ink: '#242424', muted: '#686764', accent: '#333330', accentInk: '#ffffff', secondary: '#ab6c50',
    imagePosition: '48% 27%', backdropOpacity: 0.14, backdropPosition: 'right center', motif: 'C', radius: '1px',
  },
  'ai-voice-lab': {
    name: 'TAKE ONE', concept: '호박색 VU 미터와 따뜻한 검정 금속을 닮은 아날로그 녹음 콘솔',
    composition: 'console', light: false, headingFont: 'ibm-plex', bodyFont: 'gowun-dodum', titleWeight: 700, titleTracking: '-0.04em',
    canvas: '#24221c', paper: '#322f27', ink: '#fff1d6', muted: '#c9baa0', accent: '#f0ba68', accentInk: '#2d2519', secondary: '#8fa591',
    imagePosition: '50% 58%', backdropOpacity: 0.23, backdropPosition: 'right bottom', motif: 'REC', radius: '12px',
  },
  'ai-hanbok-booth': {
    name: '옷의 결', concept: '옥빛 비단의 넓은 색면과 한지색 여백이 만나는 현대 한복 사진관',
    composition: 'split', light: true, headingFont: 'gowun-batang', bodyFont: 'sunflower', titleWeight: 700, titleTracking: '-0.045em',
    canvas: '#e5ebe2', paper: '#fffdf3', ink: '#243d36', muted: '#50675d', accent: '#356755', accentInk: '#ffffff', secondary: '#ba8175',
    imagePosition: '50% 38%', backdropOpacity: 0.22, backdropPosition: 'left center', motif: '결', radius: '3px',
  },
  'ai-traditional-painter': {
    name: '먹 한 점', concept: '먹빛 타이틀과 주홍 낙관이 살아 있는 여백 많은 화원의 종이',
    composition: 'journal', light: true, headingFont: 'song-myung', bodyFont: 'gowun-batang', titleWeight: 400, titleTracking: '-0.035em',
    canvas: '#eae4d5', paper: '#fffaf0', ink: '#33362f', muted: '#626457', accent: '#a84131', accentInk: '#fffaf0', secondary: '#798671',
    imagePosition: '62% 42%', backdropOpacity: 0.13, backdropPosition: 'right top', motif: '印', radius: '0px',
  },
  'ai-heritage-timemachine': {
    name: '시간의 문', concept: '짙은 녹청색 전시실 안으로 들어서는 황동색 문화유산의 문',
    composition: 'immersive', light: false, headingFont: 'gowun-batang', bodyFont: 'pretendard', titleWeight: 700, titleTracking: '-0.055em',
    canvas: '#122b2b', paper: '#203c3a', ink: '#f7ebce', muted: '#b9c7b6', accent: '#dfbd73', accentInk: '#263023', secondary: '#88b3a9',
    imagePosition: '49% 43%', backdropOpacity: 0.46, backdropPosition: 'center center', motif: '時', radius: '2px',
  },
  'ai-travel-style': {
    name: 'NEXT STOP', concept: '코발트색 출발 표시와 따뜻한 흰 종이로 만든 나만의 보딩패스',
    composition: 'ticket', light: true, headingFont: 'do-hyeon', bodyFont: 'ibm-plex', titleWeight: 400, titleTracking: '-0.03em',
    canvas: '#e8e6dd', paper: '#fffdf6', ink: '#193761', muted: '#536277', accent: '#245ba0', accentInk: '#ffffff', secondary: '#d79441',
    imagePosition: '58% 43%', backdropOpacity: 0.22, backdropPosition: 'left bottom', motif: '↗', radius: '12px',
  },
  'ai-wedding-booth': {
    name: '우리의 장면', concept: '와인색 활자와 넉넉한 크림색 여백으로 쓴 두 사람의 초대장',
    composition: 'salon', light: true, headingFont: 'nanum-myeongjo', bodyFont: 'gowun-batang', titleWeight: 700, titleTracking: '-0.05em',
    canvas: '#f2e8dd', paper: '#fffaf1', ink: '#542b35', muted: '#79575a', accent: '#85424f', accentInk: '#fff8ef', secondary: '#c59881',
    imagePosition: '50% 36%', backdropOpacity: 0.2, backdropPosition: 'center top', motif: '&', radius: '34px',
  },
  'ai-couple-chemistry': {
    name: '둘의 문장', concept: '서로 건네는 두 장의 엽서와 손글씨로 꾸민 따뜻한 대화 편집실',
    composition: 'journal', light: true, headingFont: 'gaegu', bodyFont: 'gowun-dodum', titleWeight: 700, titleTracking: '-0.035em',
    canvas: '#efe4d5', paper: '#fffcf3', ink: '#663c37', muted: '#79574f', accent: '#af5748', accentInk: '#fffaf2', secondary: '#788d76',
    imagePosition: '47% 48%', backdropOpacity: 0.13, backdropPosition: 'right center', motif: '둘', radius: '18px',
  },
  'ai-future-family': {
    name: '작은 가족책', concept: '버터색 책 표지와 코발트색 종이 조각으로 만든 상상 가족 그림책',
    composition: 'poster', light: true, headingFont: 'jua', bodyFont: 'gowun-dodum', titleWeight: 400, titleTracking: '-0.025em',
    canvas: '#f3e8ba', paper: '#fffbed', ink: '#3f4c59', muted: '#5d665c', accent: '#4d6b8e', accentInk: '#ffffff', secondary: '#cb7651',
    imagePosition: '52% 45%', backdropOpacity: 0.16, backdropPosition: 'left center', motif: '집', radius: '30px',
  },
  'ai-memory-movie': {
    name: 'AFTER CREDITS', concept: '검은 올리브색 극장과 담백한 크림색 자막으로 기록하는 사적인 시네마',
    composition: 'immersive', light: false, headingFont: 'song-myung', bodyFont: 'ibm-plex', titleWeight: 400, titleTracking: '-0.04em',
    canvas: '#21241f', paper: '#30332c', ink: '#f6edda', muted: '#c2bfaf', accent: '#e7ce9a', accentInk: '#2e2e21', secondary: '#bd9385',
    imagePosition: '54% 45%', backdropOpacity: 0.44, backdropPosition: 'center top', motif: '●', radius: '4px',
  },
};
