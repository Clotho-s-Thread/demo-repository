// scripts/generate-embeddings.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// .env 파일의 API 키를 가져오기 위한 설정
dotenv.config();

// DB 연결 및 AI 모델 초기화
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// 🧠 딥러닝 모델 선택: 텍스트를 벡터로 변환하는 전용 모델
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function main() {
  console.log("============================================");
  console.log("🚀 [Deep Learning] 타로 카드 벡터 임베딩 생성 시작");
  console.log("============================================");

  // 1. DB에서 카드 데이터 가져오기
  const cards = await prisma.tarotCard.findMany();
  console.log(`📋 총 ${cards.length}장의 타로 카드를 로드했습니다.\n`);

  // 2. 각 카드를 순회하며 임베딩 생성
  for (const card of cards) {
    try {
      // 임베딩할 텍스트 조합 (카드 이름 + 정방향 의미)
      // 이 텍스트가 딥러닝 모델을 통과하여 숫자로 변합니다.
      const textToEmbed = `카드: ${card.nameKo} (${card.name})\n의미: ${card.meaningUp}`;

      // 🧠 Gemini API 호출 (임베딩 생성)
      const result = await model.embedContent(textToEmbed);
      const embedding = result.embedding.values; // 벡터 값 (예: [0.123, -0.987, ...])

      // 로그 출력 (보고서 캡처용)
      console.log(`✅ [Embedding Generated] 카드명: ${card.nameKo}`);
      console.log(`   - 입력 텍스트 길이: ${textToEmbed.length}자`);
      console.log(`   - 생성된 벡터 차원수: ${embedding.length} dimensions`); // 보통 768 차원
      console.log(`   - 벡터 데이터 샘플: [${embedding.slice(0, 3).join(", ")} ... ]`); // 앞부분만 살짝 출력
      console.log("--------------------------------------------");

      // (선택 사항) 나중에 pgvector를 쓴다면 여기서 DB에 저장합니다.
      // 지금은 '생성 기술을 구현했다'는 것이 중요하므로 출력만 합니다.

    } catch (error) {
      console.error(`❌ 에러 발생 (${card.nameKo}):`, error);
    }
  }

  console.log("\n============================================");
  console.log("🎉 모든 카드의 벡터 임베딩 변환 작업 완료!");
  console.log("============================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });