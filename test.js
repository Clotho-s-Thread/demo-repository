const { GoogleGenerativeAI } = require("@google/generative-ai");

// 아까 주신 그 키
const apiKey = "AIzaSyBPrk3bSy_RYSBkibtsh4cPlKbblStegJA";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log("🔍 사용 가능한 모델 목록 조회 중...");
  
  try {
    // 현재 이 키로 사용할 수 있는 모델을 다 보여달라고 요청
    const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; 
    // (참고: 위 방식 대신 더 확실한 모델 리스트 조회 함수 사용)
    
    // 이 부분은 SDK 버전에 따라 다를 수 있으니, 가장 확실한 방법은 
    // 그냥 기본 모델로 통신이 되는지 보는 것입니다.
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    console.log("✅ 'gemini-pro' 모델은 살아있음!");
    
  } catch (error) {
    console.log("❌ 실패 원인:", error.message);
    
    if (error.message.includes("API not enabled")) {
        console.log("👉 결론: 구글 클라우드에서 [ENABLE] 버튼을 안 눌렀습니다!");
    } else {
        console.log("👉 결론: 프로젝트 설정이 꼬였습니다.");
    }
  }
}

listModels();