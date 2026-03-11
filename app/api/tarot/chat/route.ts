import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse'; 

// ------------------------------------------------------------------
// [1] CSV 데이터 로딩 함수 (퓨샷 러닝용) - 기존과 동일
// ------------------------------------------------------------------
type TrainingExample = {
  text_input: string;
  output: string;
};

let cachedExamples: TrainingExample[] | null = null;

function getFewShotExamples(): string {
  try {
    if (cachedExamples) {
      return getRandomExamples(cachedExamples, 5); 
    }

    const csvPath = path.join(process.cwd(), 'data.csv');
    if (!fs.existsSync(csvPath)) {
      return "";
    }

    const csvFile = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse<TrainingExample>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    cachedExamples = parsed.data;
    return getRandomExamples(cachedExamples, 5); 

  } catch (error) {
    console.error("❌ CSV 로딩 실패:", error);
    return "";
  }
}

function getRandomExamples(examples: TrainingExample[], count: number): string {
  if (!examples || examples.length === 0) return "";
  const shuffled = [...examples].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((ex, i) => 
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
    
    const fewShotExamples = getFewShotExamples();

    const CLOTHO_PERSONA = `
[Role]
당신은 운명의 실을 잣는 신비로운 타로 마스터 '클로토(Clotho)'입니다.
단순한 AI가 아니라, 내담자의 고민을 깊이 공감하고 영적인 통찰력을 주는 상담가입니다.

[Tone & Manner]
- 말투: "~해요", "~군요" 같은 부드럽고 따뜻한 존댓말. 신비로운 분위기 유지.
- 이모지: 적절하게 사용하여 따뜻함을 더하세요 (💖, 🔮, ✨ 등).
- 금지: "저는 인공지능 모델입니다" 같은 기계적인 발언 절대 금지.

[Instruction]
1. 사용자가 뽑은 카드의 [상징/이미지]와 [방향(정/역)에 따른 키워드]를 사용자의 [질문]과 자연스럽게 연결해서 스토리텔링하세요.
2. 역방향 카드일 경우, 무조건 나쁜 의미로만 해석하지 말고 조심해야 할 점이나 내면의 상태로 부드럽게 풀어주세요.
3. 답변은 읽기 편하게 Markdown 형식을 사용하세요.
4. 마지막엔 항상 용기를 주는 따뜻한 조언으로 마무리하세요.

[Learning Examples]
${fewShotExamples}
`;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: CLOTHO_PERSONA, 
        generationConfig: { temperature: 0.8, maxOutputTokens: 2000 }
    });

    let testUser = await prisma.user.findFirst({ where: { name: "TestGuest" } });
    if (!testUser) {
        testUser = await prisma.user.create({ data: { name: "TestGuest", email: "guest@example.com" } });
    }
    const currentUserId = testUser.id;

    let userContextPrompt = "";
    let cardsFromDB: any[] = []; 
    
    if (selectedCards && selectedCards.length > 0) {
        // 🛡️ 방어 코드 1: 예전 방식(숫자)으로 오든 새 방식(객체)으로 오든 안전하게 번호만 추출!
        const cardNumbers = selectedCards.map((c: any) => typeof c === 'number' ? c : c.number);
        
        cardsFromDB = await prisma.tarotCard.findMany({
            where: { number: { in: cardNumbers } }
        });

        const cardInfoText = selectedCards.map((selectedCard: any, index: number) => {
            // 🛡️ 방어 코드 2: 예전 방식(숫자)으로 오면 무조건 정방향(false)으로 간주
            const cardNumber = typeof selectedCard === 'number' ? selectedCard : selectedCard.number;
            const isReversed = typeof selectedCard === 'number' ? false : selectedCard.isReversed;

            const cardData = cardsFromDB.find(c => c.number === cardNumber);
            if (!cardData) return "";

            const directionStr = isReversed ? "역방향 (Reversed)" : "정방향 (Upright)";
            const meaningText = isReversed ? cardData.meaningRev : cardData.meaningUp;

            return `## ${index + 1}번째 카드: ${cardData.nameKo} (${cardData.name}) - [${directionStr}]\n- 적용될 의미: ${meaningText}\n- 이미지 묘사: ${cardData.imageUrl}`;
        }).join("\n\n");

        userContextPrompt = `
        [상황 정보]
        사용자가 뽑은 카드 정보는 아래와 같습니다. 카드의 방향(정방향/역방향)에 맞는 의미를 중심으로 해석하세요.
        ${cardInfoText}
        
        [사용자 질문] "${lastMessage}"
        `;

    } else {
        userContextPrompt = `[상황] 사용자와의 일반적인 대화 상황입니다. 이전 대화 맥락을 기억하세요.`;
    }

    const chatSession = model.startChat({
        history: [
            { role: "user", parts: [{ text: "SYSTEM_CONTEXT: " + userContextPrompt }] },
            { role: "model", parts: [{ text: "네, 운명의 흐름을 읽을 준비가 되었습니다. 카드의 목소리를 들려드릴게요." }] },
            ...messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }))
        ]
    });
    
    const result = await chatSession.sendMessage(lastMessage);
    const aiResponse = result.response.text();

    if (selectedCards && selectedCards.length > 0 && cardsFromDB.length > 0) {
        await prisma.reading.create({
            data: {
                userId: currentUserId,
                question: lastMessage,
                fullAnswer: aiResponse,
                spreadType: "three-card",
                cards: {
                    create: selectedCards.map((selectedCard: any, idx: number) => {
                        // 🛡️ 방어 코드 3: DB 저장 시에도 방어 로직 적용
                        const cardNumber = typeof selectedCard === 'number' ? selectedCard : selectedCard.number;
                        const isReversed = typeof selectedCard === 'number' ? false : selectedCard.isReversed;
                        
                        const cardData = cardsFromDB.find(c => c.number === cardNumber);
                        return {
                            cardId: cardData?.id,        
                            position: idx,
                            orientation: isReversed ? "reversed" : "upright"
                        };
                    })
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