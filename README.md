# SoundScape

> Web Audio API 기반 프로그래매틱 백색소음 생성기

사전 녹음된 오디오 파일 없이, 브라우저에서 **실시간으로 소리를 합성**하는 앰비언트 사운드 믹서입니다. Web Audio API의 오실레이터, 필터, 노이즈 버퍼를 조합하여 무한한 커스터마이징이 가능하며, 저작권 걱정 없이 자유롭게 사용할 수 있습니다.

## 주요 기능

### 소리 엔진
- **노이즈 생성**: White, Pink, Brown Noise를 AudioBuffer로 실시간 합성
- **자연 소리 합성**: 빗소리, 바람, 파도, 불꽃, 새소리, 귀뚜라미, 숲, 도시, 카페 등 14종
- **소리 믹싱**: 최대 5개 레이어 동시 재생 및 개별 볼륨 조절
- **마스터 볼륨**: 전체 출력 통합 제어

### 프리셋 시스템
- **12개 기본 프리셋**: Deep Focus, Cafe Vibe, Night Rain, Ocean Calm 등
- **카테고리 분류**: 집중(Focus), 수면(Sleep), 릴랙스(Relax), 자연(Nature)
- **커스텀 프리셋**: 현재 믹스를 아이콘/카테고리/설명과 함께 저장 (LocalStorage)

### 타이머
- **뽀모도로 타이머**: 25분 집중 / 5분 휴식 사이클, 세션 카운터
- **슬립 타이머**: 15/30/45/60분 후 점진적 페이드아웃 자동 종료
- **원형 프로그레스**: 남은 시간 시각적 표시

### UI/UX
- **오디오 비주얼라이저**: AnalyserNode + Canvas 2D 실시간 주파수 시각화
- **다크/라이트 모드**: 테마 전환 지원
- **글래스모피즘 디자인**: 반투명 카드 기반 프리미엄 UI
- **토스트 알림**: 사용자 액션에 대한 즉각적 피드백
- **키보드 단축키**: Space 재생/정지

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 스타일링 | Tailwind CSS |
| 오디오 엔진 | Web Audio API (네이티브) |
| 시각화 | Canvas 2D + AnalyserNode |
| 상태관리 | Zustand + LocalStorage 영속화 |
| 빌드 | Vite |
| 테스트 | Vitest + Testing Library |
| 배포 | Vercel |

## 아키텍처

```
Browser Client
├── UI Layer (React + Tailwind)
│   ├── SoundLibrary      # 소리 선택 및 레이어 추가
│   ├── SoundCard          # 개별 소리 레이어 제어
│   ├── MasterVolume       # 마스터 볼륨
│   ├── PresetBrowser      # 프리셋 탐색/로드/삭제
│   ├── SavePresetModal    # 프리셋 저장
│   ├── TimerPanel         # 뽀모도로/슬립 타이머
│   └── Visualizer         # 오디오 비주얼라이저
│
├── Audio Engine (Web Audio API)
│   ├── NoiseGenerator     # White/Pink/Brown 노이즈 버퍼 생성
│   ├── NaturalSoundSynth  # 자연 소리 합성 (오실레이터 + 필터)
│   └── MixerController    # 레이어 믹싱, 볼륨, 페이드
│
├── State (Zustand)
│   └── LocalStorage 영속화 (프리셋, 설정)
│
└── Hooks
    └── useAudioEngine     # 오디오 엔진 React 통합
```

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 테스트
npm test

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── audio/                # Web Audio API 오디오 엔진
│   ├── NoiseGenerator.ts     # White/Pink/Brown 노이즈 생성
│   ├── NaturalSoundSynth.ts  # 자연 소리 합성
│   └── MixerController.ts    # 레이어 믹싱 컨트롤러
├── components/           # React UI 컴포넌트
│   ├── SoundLibrary.tsx      # 소리 라이브러리 브라우저
│   ├── SoundCard.tsx         # 소리 레이어 카드
│   ├── MasterVolume.tsx      # 마스터 볼륨 컨트롤
│   ├── PresetBrowser.tsx     # 프리셋 탐색/관리
│   ├── SavePresetModal.tsx   # 프리셋 저장 모달
│   ├── TimerPanel.tsx        # 타이머 패널
│   ├── Visualizer.tsx        # 오디오 비주얼라이저
│   ├── Toast.tsx             # 토스트 알림
│   └── Icons.tsx             # SVG 아이콘
├── hooks/
│   └── useAudioEngine.ts # 오디오 엔진 커스텀 훅
├── store/
│   └── index.ts          # Zustand 스토어
├── types/
│   └── index.ts          # TypeScript 타입 정의
└── styles/
    └── index.css         # 글로벌 스타일 + 애니메이션
```

## 소리 합성 원리

모든 소리는 Web Audio API 노드 그래프로 실시간 합성됩니다.

| 소리 | 합성 방법 |
|------|-----------|
| White Noise | AudioBuffer + `Math.random()` 균등 분포 |
| Pink Noise | White Noise + 1/f 필터 (저주파 강조) |
| Brown Noise | White Noise + 강한 로우패스 필터 |
| 빗소리 | 필터링된 노이즈 + 랜덤 간격 물방울 버스트 |
| 바람 | 저주파 오실레이터 + LFO 변조 노이즈 |
| 파도 | 노이즈 + 주기적 볼륨 엔벨로프 |
| 불꽃 | 크래클 노이즈 + 랜덤 팝 사운드 |
| 새소리 | 고주파 오실레이터 + 피치 엔벨로프 |
| 귀뚜라미 | 고주파 사인파 빠른 on/off 반복 |

## 브라우저 지원

Chrome, Safari, Firefox, Edge 최신 2개 버전을 지원합니다.

> **참고**: iOS Safari에서는 사용자 인터랙션 후 `AudioContext.resume()` 호출이 필요하며, 앱에서 자동으로 처리됩니다.

## 라이선스

MIT
