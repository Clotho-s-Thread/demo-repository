// test.js
fetch('http://localhost:3000/api/tarot/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "요즘 프로젝트 준비하느라 너무 힘든데, 앞으로 상황이 좀 나아질까요?" }
    ],
    selectedCards: [
      { number: 0, isReversed: false },
      { number: 13, isReversed: true }, // 죽음 역방향 테스트
      { number: 19, isReversed: false }
    ]
  })
})
.then(res => res.json())
.then(data => console.log("\n🔮 클로토의 답변:\n", data.text))
.catch(err => console.error("❌ 에러 발생:", err));