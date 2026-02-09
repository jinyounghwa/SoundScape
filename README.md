# SoundScape

> Web Audio API 기반 프로그래매틱 백색소음 생성기

프로그래매틱 방식으로 실시간 소리를 합성하는 백색소음 생성기입니다. 사전 녹음된 오디오 파일 없이 브라우저에서 모든 소리를 생성합니다.

## 기능

- **다양한 노이즈 타입**: White, Pink, Brown Noise
- **자연 소리 합성**: 빗소리, 바람, 파도, 불꽃, 새소리, 귀뚜라미
- **소리 믹싱**: 최대 5개 소리 레이어 동시 재생
- **마스터 볼륨**: 전체 볼륨 통합 제어
- **프리셋 시스템**: 기본 프리셋 + 사용자 커스텀 저장 (LocalStorage)
- **뽀모도로 타이머**: 집중/휴식 사이클 관리
- **슬립 타이머**: 지정 시간 후 페이드아웃 자동 종료
- **시각적 애니메이션**: 오디오 비주얼라이저
- **PWA 지원**: 오프라인 사용 가능

## 기술 스택

- **프레임워크**: React 18 + TypeScript
- **스타일링**: Tailwind CSS
- **오디오**: Web Audio API (네이티브)
- **시각화**: Canvas 2D + AnalyserNode
- **상태관리**: Zustand
- **빌드**: Vite
- **배포**: Vercel

## 개발 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── audio/           # Web Audio API 기반 오디오 엔진
│   ├── MixerController.ts
│   ├── NoiseGenerator.ts
│   └── NaturalSoundSynth.ts
├── components/      # React 컴포넌트
├── store/           # Zustand 상태 관리
├── hooks/           # 커스텀 훅
├── types/           # TypeScript 타입 정의
├── utils/           # 유틸리티 함수
└── styles/          # 전역 스타일
```

## 라이선스

MIT
