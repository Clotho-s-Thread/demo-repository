import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

const CLOTHO_PERSONA = `
[Role]
당신은 운명의 실을 잣는 신비로운 타로 마스터 '클로토(Clotho)'입니다.
단순한 AI가 아니라, 내담자의 고민을 깊이 공감하고 영적인 통찰력을 주는 상담가입니다.

[Tone & Manner]
- 말투: "~해요", "~군요" 같은 부드럽고 따뜻한 존댓말. 신비로운 분위기 유지.
- 금지: "저는 인공지능 모델입니다" 같은 기계적인 발언 절대 금지.

[Instruction]
1. 사용자가 뽑은 카드의 [상징/이미지]와 [키워드]를 사용자의 [질문]과 자연스럽게 연결해서 스토리텔링하세요.
2. 답변은 읽기 편하게 Markdown 형식을 사용하세요 (볼드체 강조 등).
3. 마지막엔 항상 용기를 주는 따뜻한 조언으로 마무리하세요.
`;

export async function POST(req: Request) {
  try {
    const { messages, selectedCards } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    
    const apiKey = process.env.GOOGLE_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 👇 [복귀] 라이브러리 업데이트 후에는 이 모델이 가장 확실합니다.
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
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

    let testUser = await prisma.user.findFirst({ where: { name: "TestGuest" } });
    if (!testUser) {
        testUser = await prisma.user.create({ data: { name: "TestGuest", email: "guest@example.com" } });
    }
    const currentUserId = testUser.id;

    let systemPrompt = "";
    let cardsFromDB: any[] = []; 
    
    if (selectedCards && selectedCards.length > 0) {
        cardsFromDB = await prisma.tarotCard.findMany({
            where: { number: { in: selectedCards } }
        });

        const cardInfoText = cardsFromDB.map((card, index) => 
            `## ${index + 1}번째 카드: ${card.nameKo} (${card.name})\n- 정방향 의미: ${card.meaningUp}\n- 이미지 묘사: ${card.imageUrl}`
        ).join("\n\n");

        systemPrompt = `
        [상황 정보]
        사용자가 뽑은 카드 정보는 아래와 같습니다. 이 정보를 바탕으로 해석하세요.
        ${cardInfoText}
        
        [사용자 질문] "${lastMessage}"
        `;

    } else {
        systemPrompt = `[상황] 사용자와의 일반적인 대화 상황입니다. 이전 대화 맥락을 기억하세요.`;
    }

    const chatSession = model.startChat({
        history: [
            { role: "user", parts: [{ text: "SYSTEM_CONTEXT: " + systemPrompt }] },
            { role: "model", parts: [{ text: "네, 운명의 흐름을 읽을 준비가 되었습니다." }] },
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
                    create: cardsFromDB.map((card, idx) => ({
                        cardId: card.id,        
                        position: idx,
                        orientation: "upright"
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