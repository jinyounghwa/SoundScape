# SoundScape — Product Requirements Document v1.0

> **Web Audio API 기반 프로그래매틱 백색소음 생성기**
>
> Version 1.0 | 2026.02.09 | Author: 진영화 | Status: Draft

---

## 1. 프로젝트 개요

### 1.1 배경

디지털 환경에서 집중력 저하, 수면 장애, 스트레스 관리에 대한 수요가 지속적으로 증가하고 있다. 기존 백색소음 서비스들은 대부분 사전 녹음된 오디오 파일에 의존하여 저작권 문제, 서버 비용, 커스터마이징 한계라는 제약이 있다.

SoundScape는 Web Audio API를 활용해 브라우저에서 실시간으로 소리를 합성하는 프로그래매틱 접근 방식을 채택한다. 이를 통해 **무한한 커스터마이징, 제로 저작권 리스크, 제로 스토리지 비용**이라는 차별점을 확보한다.

### 1.2 프로젝트 목표

- Web Audio API 기반 실시간 소리 합성 엔진 구현
- 집중, 수면, 릴랙스 등 다양한 시나리오 지원
- 소리 믹싱, 타이머/뽀모도로, 프리셋 저장, 시각적 피드백 기능 제공
- 포트폴리오/사이드 프로젝트로 완전 무료 운영
- 1인 개발 체제에서 2주 내 MVP 출시

### 1.3 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 서비스명 | SoundScape |
| 타입 | 웹 서비스 (SPA) |
| 타겟 유저 | 집중이 필요한 직장인/학생, 수면에 어려움을 겪는 사람, 릴랙스가 필요한 모든 사람 |
| 수익 모델 | 완전 무료 (포트폴리오/사이드 프로젝트) |
| 개발 인원 | 1인 (기획 + 프론트엔드 + 백엔드) |
| 목표 일정 | MVP 2주, 안정화 1주 (총 3주) |

---

## 2. 타겟 사용자 분석

### 2.1 페르소나

| 페르소나 | 특성 | 니즈 |
|----------|------|------|
| 집중 모드 김개발 | 재택근무 개발자, 카페 소음에 민감 | 코딩 시 방해 없는 배경음, 뽀모도로 타이머 |
| 수면 케어 이직장 | 30대 직장인, 불면증 | 잠들기 전 자연 소리 믹스, 자동 종료 타이머 |
| 릴랙스 박학생 | 대학생, 시험 기간 스트레스 | 짧은 휴식 시간 명상용 앰비언스 |

### 2.2 사용 시나리오

1. **출근 후 집중 모드**: 뽀모도로 25분 세팅 + "카페 앰비언스" 프리셋 선택 후 코딩 시작
2. **취침 전 수면 모드**: "빗소리 + 바람" 믹스 커스텀 + 30분 타이머 후 자동 페이드아웃
3. **시험 전 릴랙스**: "파도 + 새소리" 프리셋으로 10분 명상 후 공부 복귀

---

## 3. 기능 명세

### 3.1 핵심 기능 목록

| 기능 | 우선순위 | 설명 |
|------|----------|------|
| 소리 엔진 | P0 (필수) | Web Audio API 기반 실시간 노이즈 합성 (White/Pink/Brown) |
| 자연 소리 합성 | P0 (필수) | 빗소리, 바람, 파도, 불꽃, 새소리 등 오실레이터 + 필터 조합 |
| 소리 믹싱 | P0 (필수) | 최대 5개 소리 레이어 동시 재생, 개별 볼륨 조절 |
| 마스터 볼륨 | P0 (필수) | 전체 볼륨 통합 제어 |
| 뽀모도로 타이머 | P1 (중요) | 25분 집중 / 5분 휴식 사이클, 세션 카운터 |
| 슬립 타이머 | P1 (중요) | 지정 시간 후 페이드아웃 자동 종료 (15/30/45/60분) |
| 프리셋 시스템 | P1 (중요) | 기본 프리셋 제공 + 사용자 커스텀 프리셋 저장 (LocalStorage) |
| 시각적 애니메이션 | P2 (선호) | 소리에 반응하는 파형/파티클 비주얼라이저 (Canvas/WebGL) |
| 반응형 UI | P0 (필수) | 데스크탑/태블릿/모바일 대응 |
| PWA 지원 | P2 (선호) | 오프라인 사용, 홈 화면 추가 가능 |

### 3.2 소리 엔진 상세

#### 3.2.1 노이즈 타입

| 노이즈 타입 | 특성 | 생성 방식 | 사용 시나리오 |
|-------------|------|-----------|---------------|
| White Noise | 전 주파수 균등 에너지 | AudioBuffer + Math.random() | 집중, 마스킹 |
| Pink Noise | 저주파 강조, 자연스러운 | White + 1/f 필터 | 수면, 릴랙스 |
| Brown Noise | 깊은 저주파 | White + 더 강한 저주파 필터 | 깊은 수면 |

#### 3.2.2 자연 소리 합성

| 소리 | 합성 방법 |
|------|-----------|
| 빗소리 | 필터링된 노이즈 + 랜덤 간격 짧은 버스트 (물방울) |
| 바람 | 저주파 오실레이터 + LFO로 변조된 노이즈 |
| 파도 | 노이즈 + 주기적 볼륨 엔벨로프 (밀려오고 빠지는 패턴) |
| 불꽃 | 크래클 노이즈 + 랜덤 팝 사운드 |
| 새소리 | 고주파 오실레이터 + 빠른 피치 엔벨로프 |
| 귀뚜라미 | 고주파 사인파 빠른 on/off 반복 |

### 3.3 뽀모도로 타이머

- 기본값: 집중 25분 / 짧은 휴식 5분 / 긴 휴식 15분 (4세션 후)
- 사용자 커스텀 시간 설정 가능
- 세션 전환 시 부드러운 알림음 (Web Audio로 합성)
- 완료된 세션 수 표시
- 집중/휴식 모드에 따라 다른 프리셋 자동 전환 옵션

### 3.4 슬립 타이머

- 프리셋 시간: 15분, 30분, 45분, 60분, 커스텀
- 종료 시 3분간 점진적 페이드아웃
- 남은 시간 시각적 표시 (원형 프로그레스)

### 3.5 프리셋 시스템

**기본 프리셋 (Built-in):**

| 프리셋명 | 구성 | 추천 용도 |
|----------|------|-----------|
| Deep Focus | Brown Noise 60% + 빗소리 30% | 코딩, 독서 |
| Cafe Vibe | Pink Noise 20% + 대화 웅성거림 40% | 카페 분위기 재현 |
| Night Rain | 빗소리 50% + 바람 20% + 귀뚜라미 10% | 수면 |
| Ocean Calm | 파도 60% + 바람 15% + 새소리 10% | 명상, 릴랙스 |
| Campfire | 불꽃 50% + 귀뚜라미 20% + 바람 10% | 편안한 분위기 |

**사용자 커스텀 프리셋:**

- 현재 믹스 상태를 이름 붙여 저장 (LocalStorage)
- 저장/불러오기/삭제 기능
- 최대 20개까지 저장 가능

### 3.6 시각적 애니메이션

- AnalyserNode를 활용한 실시간 주파수 데이터 추출
- Canvas 2D 기반 파형 비주얼라이저 (원형 또는 선형)
- 소리 레이어별 색상 차별화로 현재 믹스 상태 직관적 표현
- 다크 모드 기본, 부드러운 색상 팔레트 사용 (수면 방해 최소화)
- 비주얼라이저 on/off 토글 (배터리 절약)

---

## 4. 기술 스택

### 4.1 아키텍처

프론트엔드 SPA 중심의 클라이언트 사이드 아키텍처를 채택한다. 소리 합성이 모두 브라우저에서 이루어지므로 별도 백엔드 서버가 불필요하며, 정적 호스팅만으로 서비스가 가능하다.

```
[Browser Client]
├── React 18 + TypeScript (UI Layer)
├── Zustand (State Management)
├── Web Audio API (Audio Engine)
│   ├── NoiseGenerator (White/Pink/Brown)
│   ├── NaturalSoundSynth (Rain/Wind/Wave/Fire/Bird)
│   ├── MixerController (Layer Mixing)
│   └── AnalyserNode (Visualizer Data)
├── Canvas 2D (Visualizer)
├── LocalStorage (Preset & Settings)
└── Service Worker (PWA/Offline)

[Deploy]
└── Vercel / Cloudflare Pages (Static Hosting + CDN)
```

### 4.2 기술 스택 상세

| 영역 | 기술 | 선정 이유 |
|------|------|-----------|
| 프레임워크 | React 18 + TypeScript | 컴포넌트 기반, 상태관리 용이, 타입 안정성 |
| 스타일링 | Tailwind CSS | 유틸리티 기반 빠른 UI 개발, 다크모드 내장 |
| 오디오 | Web Audio API (네이티브) | 별도 라이브러리 불필요, 고성능 실시간 합성 |
| 시각화 | Canvas 2D / AnalyserNode | 브라우저 네이티브, 추가 의존성 없음 |
| 상태관리 | Zustand | 경량, 보일러플레이트 최소, LocalStorage 미들웨어 |
| 빌드 | Vite | 빠른 HMR, 작은 번들 사이즈 |
| 배포 | Vercel 또는 Cloudflare Pages | 무료, 글로벌 CDN, 자동 배포 |
| PWA | Vite PWA Plugin | 서비스 워커 자동 생성 |

### 4.3 핵심 모듈 구조

| 모듈 | 책임 | 주요 클래스/함수 |
|------|------|------------------|
| AudioEngine | Web Audio 컨텍스트 관리, 노드 그래프 구성 | AudioContext, GainNode, createBuffer() |
| NoiseGenerator | White/Pink/Brown 노이즈 버퍼 생성 | generateWhite(), generatePink(), generateBrown() |
| NaturalSoundSynth | 자연 소리 합성 (빗소리, 바람 등) | Rain, Wind, Wave, Fire, Bird 클래스 |
| MixerController | 레이어 믹싱, 개별/마스터 볼륨 제어 | addLayer(), setVolume(), getMasterGain() |
| TimerManager | 뽀모도로/슬립 타이머 로직 | PomodoroTimer, SleepTimer |
| PresetStore | 프리셋 CRUD, LocalStorage 동기화 | save(), load(), delete(), getDefaults() |
| Visualizer | Canvas 기반 오디오 시각화 | WaveformRenderer, FrequencyRenderer |

---

## 5. UI/UX 설계

### 5.1 디자인 원칙

1. **Calm First** — 어두운 톤 기반, 시각적 자극 최소화
2. **One-Tap Play** — 메인 화면에서 즉시 재생 가능
3. **Progressive Disclosure** — 기본 기능은 심플하게, 고급 기능은 필요 시 접근
4. **Responsive** — 데스크탑, 태블릿, 모바일 완벽 대응

### 5.2 화면 구성

| 화면 | 구성 요소 | 비고 |
|------|-----------|------|
| 메인 (재생) | 비주얼라이저 영역, 소리 레이어 카드들, 마스터 볼륨, 재생/정지 버튼 | 랜딩 = 메인 화면 |
| 믹서 패널 | 활성 소리 레이어 리스트, 개별 볼륨 슬라이더, 레이어 추가/제거 | 하단 시트 또는 사이드 패널 |
| 타이머 패널 | 뽀모도로/슬립 모드 전환, 시간 설정, 프로그레스 표시 | 모달 또는 오버레이 |
| 프리셋 브라우저 | 기본 프리셋 목록, 내 프리셋 목록, 저장/불러오기/삭제 | 하단 시트 |
| 설정 | 테마(다크/라이트), 비주얼라이저 on/off, 알림음 설정 | 별도 페이지 또는 모달 |

### 5.3 컬러 시스템

| 역할 | 다크 모드 | 라이트 모드 |
|------|-----------|-------------|
| 배경 | #0F0F1A | #FAFAFA |
| 카드 배경 | #1A1A2E | #FFFFFF |
| Primary (집중) | #6366F1 (인디고) | #4F46E5 |
| Secondary (수면) | #8B5CF6 (바이올렛) | #7C3AED |
| Accent (릴랙스) | #06B6D4 (시안) | #0891B2 |
| 텍스트 | #E2E8F0 | #1E293B |

---

## 6. 데이터 설계

### 6.1 LocalStorage 스키마

백엔드 없이 모든 사용자 데이터를 LocalStorage에 저장한다.

| 키 | 타입 | 설명 |
|----|------|------|
| soundscape_presets | Preset[] | 사용자 저장 프리셋 배열 |
| soundscape_settings | Settings | 앱 설정 (테마, 비주얼라이저 등) |
| soundscape_pomodoro | PomodoroConfig | 뽀모도로 커스텀 설정 |
| soundscape_stats | Stats | 누적 사용 통계 (선택) |

### 6.2 주요 데이터 모델

```typescript
interface Preset {
  id: string;
  name: string;
  layers: SoundLayer[];
  createdAt: number;
  isDefault: boolean;
}

interface SoundLayer {
  type: SoundType;
  volume: number; // 0-1
  enabled: boolean;
  params?: Record<string, number>;
}

type SoundType =
  | 'white' | 'pink' | 'brown'
  | 'rain' | 'wind' | 'wave'
  | 'fire' | 'bird' | 'cricket';

interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoSwitchPreset: boolean;
  focusPresetId?: string;
  breakPresetId?: string;
}

interface Settings {
  theme: 'dark' | 'light';
  visualizerEnabled: boolean;
  notificationSound: boolean;
}
```

---

## 7. 비기능적 요구사항

| 항목 | 목표 | 측정 방법 |
|------|------|-----------|
| 초기 로딩 | < 2초 (3G 기준) | Lighthouse Performance |
| 오디오 지연 | < 50ms (재생 버튼 클릭 후) | Performance API |
| 번들 사이즈 | < 200KB (gzipped) | Vite build 분석 |
| 브라우저 지원 | Chrome, Safari, Firefox, Edge (최신 2버전) | 수동 테스트 |
| 모바일 대응 | iOS Safari, Android Chrome | 실기기 테스트 |
| 접근성 | WCAG 2.1 AA 기본 준수 | axe-core 검사 |
| 오프라인 | PWA로 오프라인 재생 가능 | Service Worker 검증 |

---

## 8. 개발 일정

DailyDev Pro 방식으로 하루 2시간 세션 기준, 총 3주(15세션) 내 완료를 목표로 한다.

| 주차 | 세션 | 마일스톤 | 산출물 |
|------|------|----------|--------|
| Week 1 | Day 1-2 | 프로젝트 셋업 + 소리 엔진 코어 | Vite + React + TS 세팅, White/Pink/Brown 노이즈 생성 |
| Week 1 | Day 3-4 | 자연 소리 합성 + 믹서 | Rain, Wind, Wave 등 합성, 레이어 믹싱 구현 |
| Week 1 | Day 5 | UI 기본 레이아웃 | 메인 화면, 소리 카드, 마스터 볼륨 UI |
| Week 2 | Day 6-7 | 타이머 시스템 | 뽀모도로 + 슬립 타이머 완성 |
| Week 2 | Day 8-9 | 프리셋 시스템 | 기본 프리셋 + 커스텀 저장/불러오기 |
| Week 2 | Day 10 | 비주얼라이저 | Canvas 파형 애니메이션 |
| Week 3 | Day 11-12 | UI 폴리싱 + 반응형 | 모바일 대응, 다크/라이트 테마 |
| Week 3 | Day 13 | PWA + 오프라인 | 서비스 워커, 매니페스트 |
| Week 3 | Day 14-15 | 테스트 + 배포 | 크로스 브라우저 테스트, Vercel 배포 |

---

## 9. 리스크 및 대응

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| iOS Safari Web Audio 제약 | 높음 | 사용자 인터랙션 후 AudioContext.resume() 호출, 화면 안내 |
| 모바일 백그라운드 재생 제한 | 중간 | PWA + Media Session API 활용, 한계 명시 |
| 자연 소리 품질 미흡 | 중간 | 파라미터 튜닝에 충분한 시간 할당, 필요 시 CC0 샘플 보완 |
| LocalStorage 용량 제한 (5MB) | 낮음 | 프리셋 20개 제한, 데이터 최적화 |
| 브라우저 호환성 이슈 | 중간 | Web Audio API 지원 여부 체크 후 폴백 메시지 |

---

## 10. 성공 지표

포트폴리오 프로젝트로서의 성공 기준:

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| Lighthouse 점수 | Performance 90+, Accessibility 90+ | Lighthouse CI |
| 코드 품질 | TypeScript strict 모드, 컴포넌트 단위 테스트 | ESLint + Vitest |
| GitHub Stars | 50+ (3개월 내) | GitHub 대시보드 |
| 기술 블로그 | Web Audio API 관련 포스트 2편 이상 | 개인 블로그 |
| 면접 활용 | 프로젝트 기반 기술 면접 준비 완료 | 자체 평가 |

---

## 11. 향후 확장 계획 (Post-MVP)

- **AI 추천**: 시간대/날씨 기반 자동 소리 믹스 추천
- **커뮤니티 프리셋**: 사용자 간 프리셋 공유 (Supabase 연동)
- **Spotify 연동**: 배경음악 + 백색소음 레이어링
- **Apple Watch / Wear OS**: 원격 제어
- **한국어 ASMR 합성**: TTS 기반 부드러운 음성 가이드
- **Swift 네이티브 앱**: iOS/macOS 앱 출시

---

## Appendix: Web Audio API 핵심 개념

- **AudioContext**: 모든 오디오 작업의 기반이 되는 컨텍스트. 하나의 앱에 하나만 생성 권장.
- **AudioNode**: 소리 처리의 기본 단위. 소스(OscillatorNode, AudioBufferSourceNode), 이펙트(GainNode, BiquadFilterNode), 출력(AudioDestinationNode)으로 구성.
- **AnalyserNode**: 실시간 주파수/시간 도메인 데이터 추출. 비주얼라이저에 활용.
- **노드 그래프**: Source → Effect → Analyser → Destination 형태의 체인으로 연결하여 소리 흐름 제어.
