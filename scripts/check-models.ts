// scripts/check-models.ts
import dotenv from "dotenv";

dotenv.config();

async function checkModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ .env 파일에 GOOGLE_API_KEY가 없습니다!");
    return;
  }

  console.log(`🔑 API 키 확인: ${apiKey.substring(0, 5)}...`);
  console.log("📡 구글 서버에 모델 목록 조회 중...");

  try {
    // Gemini API에 직접 모델 목록 요청
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("\n❌ API 에러 발생:");
      console.error(JSON.stringify(data.error, null, 2));
      console.log("\n💡 힌트: 구글 클라우드 콘솔에서 API가 활성화되지 않았거나, 키가 잘못되었을 수 있습니다.");
    } else {
      console.log("\n✅ 사용 가능한 모델 목록:");
      // 'generateContent' 기능을 지원하는 모델만 필터링해서 보여줌
      const chatModels = data.models?.filter((m: any) => m.supportedGenerationMethods.includes("generateContent"));
      chatModels.forEach((m: any) => {
        console.log(`- ${m.name.replace("models/", "")}`); // "models/gemini-pro" -> "gemini-pro"
      });
      
      console.log("\n👉 위 목록에 있는 이름 중 하나를 route.ts에 적으면 무조건 됩니다!");
    }
  } catch (error) {
    console.error("❌ 네트워크 오류:", error);
  }
}

checkModels();