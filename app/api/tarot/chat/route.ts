import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 프론트엔드에서 보낸 '전체 대화 내역'을 받습니다.
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("API 키 없음");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 2. 모델 설정
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 1.0, 
            maxOutputTokens: 5000, 
        }
    });

    // 3. 페르소나 (시스템 프롬프트)
    // 채팅 모드에서는 시스템 프롬프트를 history의 맨 앞에 넣거나, 별도 systemInstruction으로 설정 가능합니다.
    const systemInstruction = `
    당신은 신비로운 타로 마스터 '클로토(Clotho)'입니다.
    
    [역할]
    - 처음 질문에는 반드시 타로 카드 3장을 가상으로 뽑아(과거/현재/미래) 해석해주세요.
    - 이후 이어지는 질문에는 앞서 뽑은 카드의 내용을 기억하고 추가적인 조언을 해주세요.
    - 말투: 신비롭고 따뜻한 존댓말. 이모지(🔮, 🌙) 사용.
    `;

    // 4. Gemini 채팅 기록 형식으로 변환 (Frontend 포맷 -> Gemini 포맷)
    // messages 배열의 마지막은 '이번 질문'이므로 제외하고, 그 앞부분을 history로 만듭니다.
    const lastMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model', // Gemini는 assistant 대신 model이라고 씀
      parts: [{ text: msg.content }],
    }));

    // 5. 채팅 세션 시작 (기억 주입)
    const chatSession = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] }, // 시스템 프롬프트를 첫 기억으로 주입
        { role: "model", parts: [{ text: "네, 알겠습니다. 클로토가 당신의 운명을 읽어드릴 준비가 되었습니다." }] },
        ...history
      ],
    });

    // 6. 이번 질문 던지기
    const result = await chatSession.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("에러 발생:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}