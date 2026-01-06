const { GoogleGenerativeAI } = require("@google/generative-ai");

// 새로 받은 정상 키
const apiKey = "AIzaSyBPrk3bSy_RYSBkibtsh4cPlKbblStegJA";
const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
  console.log("🔍 사용 가능한 모델 찾는 중...");
  try {
    // 1. 모델 하나만 골라서 테스트 ("gemini-pro"는 가장 기본이라 무조건 있어야 함)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("hello");
    console.log("✅ 성공! 'gemini-pro' 모델 사용 가능!");
    console.log("응답:", (await result.response).text());
  } catch (e) {
    console.log("❌ gemini-pro 실패:", e.message);
  }

  try {
    // 2. 1.5 flash 테스트
    const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result2 = await model2.generateContent("hello");
    console.log("✅ 성공! 'gemini-1.5-flash' 모델 사용 가능!");
  } catch (e) {
    console.log("❌ gemini-1.5-flash 실패:", e.message);
  }
}

check();