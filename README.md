# English Buddy Classroom

영어회화 연습용 단일 페이지 웹앱입니다.

## 기능

- 100일 분량의 대화 주제를 제공
- 짧은 영어 문장 중심 자유 대화
- 음성 인식(Web Speech API)으로 말한 내용 텍스트 변환
- 튜터 답변 음성 재생(TTS)
- `feedback please` 입력 시 대화 종료 + 한국어 피드백 보고서 생성

## 실행

정적 파일 앱이라 서버 없이도 열 수 있지만, 로컬 서버 실행을 권장합니다.

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.
