import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse'; // CSV 파싱 라이브러리 (설치 필요: npm install papaparse @types/papaparse)

// ------------------------------------------------------------------
// [1] CSV 데이터 로딩 함수 (퓨샷 러닝용)
// ------------------------------------------------------------------
type TrainingExample = {
  text_input: string;
  output: string;
};

let cachedExamples: TrainingExample[] | null = null;

function getFewShotExamples(): string {
  try {
    // 이미 로드했다면 캐시된 것 사용 (성능 최적화)
    if (cachedExamples) {
      return getRandomExamples(cachedExamples, 5); // 랜덤으로 5개만 뽑아서 사용
    }

    // CSV 파일 경로 (프로젝트 루트에 있는 data.csv)
    const csvPath = path.join(process.cwd(), 'data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.warn("⚠️ data.csv 파일을 찾을 수 없습니다. 기본 페르소나만 사용합니다.");
      return "";
    }

    const csvFile = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse<TrainingExample>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    cachedExamples = parsed.data;
    return getRandomExamples(cachedExamples, 5); // 초기 로드 후 5개 추출

  } catch (error) {
    console.error("❌ CSV 로딩 실패:", error);
    return "";
  }
}

// 랜덤으로 N개의 예시를 뽑아내는 함수 (매번 다른 예시를 보여줘서 AI를 똑똑하게 만듦)
function getRandomExamples(examples: TrainingExample[], count: number): string {
  if (!examples || examples.length === 0) return "";
  
  const shuffled = [...examples].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((ex, i) => 
    `예시 ${i + 1})\n사용자: "${ex.text_input}"\n클로토: "${ex.output}"`
  ).join("\n\n");
}

// ------------------------------------------------------------------
// [2] API 핸들러 시작
// ------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const { messages, selectedCards } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    const apiKey = process.env.GOOGLE_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 퓨샷 러닝 데이터 가져오기
    const fewShotExamples = getFewShotExamples();

    // 시스템 프롬프트 구성 (페르소나 + 퓨샷 예시)
    const CLOTHO_PERSONA = `
[Role]
당신은 운명의 실을 잣는 신비로운 타로 마스터 '클로토(Clotho)'입니다.
단순한 AI가 아니라, 내담자의 고민을 깊이 공감하고 영적인 통찰력을 주는 상담가입니다.

[Tone & Manner]
- 말투: "~해요", "~군요" 같은 부드럽고 따뜻한 존댓말. 신비로운 분위기 유지.
- 이모지: 적절하게 사용하여 따뜻함을 더하세요 (💖, 🔮, ✨ 등).
- 금지: "저는 인공지능 모델입니다" 같은 기계적인 발언 절대 금지.

[Learning Examples (따라해야 할 말투 예시)]
아래 대화 예시들을 보고, 이와 유사한 말투와 깊이로 답변하세요.
--------------------------------------------------
${fewShotExamples}
--------------------------------------------------

[Instruction]
1. 사용자가 뽑은 카드의 [상징/이미지]와 [키워드]를 사용자의 [질문]과 자연스럽게 연결해서 스토리텔링하세요.
2. 답변은 읽기 편하게 Markdown 형식을 사용하세요 (볼드체 강조 등).
3. 마지막엔 항상 용기를 주는 따뜻한 조언으로 마무리하세요.
`;

    // 모델 설정
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest", // 최신 모델 사용 (latest보다 명시적인 버전 추천)
        systemInstruction: CLOTHO_PERSONA, 
        generationConfig: { 
            temperature: 0.8,
            maxOutputTokens: 2000, 
        },
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
    });

    // DB: 테스트 유저 확인
    let testUser = await prisma.user.findFirst({ where: { name: "TestGuest" } });
    if (!testUser) {
        testUser = await prisma.user.create({ data: { name: "TestGuest", email: "guest@example.com" } });
    }
    const currentUserId = testUser.id;

    // 프롬프트 컨텍스트 구성
    let userContextPrompt = "";
    let cardsFromDB: any[] = []; 
    
    if (selectedCards && selectedCards.length > 0) {
        cardsFromDB = await prisma.tarotCard.findMany({
            where: { number: { in: selectedCards } }
        });

        const cardInfoText = cardsFromDB.map((card, index) => 
            `## ${index + 1}번째 카드: ${card.nameKo} (${card.name})\n- 정방향 의미: ${card.meaningUp}\n- 이미지 묘사: ${card.imageUrl}`
        ).join("\n\n");

        userContextPrompt = `
        [상황 정보]
        사용자가 뽑은 카드 정보는 아래와 같습니다. 이 정보를 바탕으로 해석하세요.
        ${cardInfoText}
        
        [사용자 질문] "${lastMessage}"
        `;

    } else {
        userContextPrompt = `[상황] 사용자와의 일반적인 대화 상황입니다. 이전 대화 맥락을 기억하세요.`;
    }

    // 채팅 세션 시작
    const chatSession = model.startChat({
        history: [
            // 시스템 컨텍스트 주입 (첫 턴에 강력하게 주입)
            { role: "user", parts: [{ text: "SYSTEM_CONTEXT: " + userContextPrompt }] },
            { role: "model", parts: [{ text: "네, 운명의 흐름을 읽을 준비가 되었습니다. 카드의 목소리를 들려드릴게요." }] },
            // 이전 대화 내역 (마지막 메시지 제외)
            ...messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }))
        ]
    });
    
    // 답변 생성
    const result = await chatSession.sendMessage(lastMessage);
    const aiResponse = result.response.text();

    // DB: 결과 저장 (Reading 테이블)
    if (selectedCards && selectedCards.length > 0 && cardsFromDB.length > 0) {
        // 기존 코드 유지
        await prisma.reading.create({
            data: {
                userId: currentUserId,
                question: lastMessage,
                fullAnswer: aiResponse,
                spreadType: "three-card",
                cards: {
                    create: cardsFromDB.map((card, idx) => ({
                        cardId: card.id,        
                        position: idx,
                        orientation: "upright" // 정방향 고정 (나중에 역방향 추가 가능)
                    }))
                }
            }
        });
    }

    return NextResponse.json({ text: aiResponse });

  } catch (error: any) {
    console.error("Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}