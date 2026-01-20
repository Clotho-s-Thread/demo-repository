import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 메이저 아르카나 22장 기초 데이터 (이미지는 임시 생성기 사용)
const SEED_DATA = [
  { number: 0, name: "The Fool", nameKo: "바보", mean: "순수, 새로운 시작, 자유, 모험" },
  { number: 1, name: "The Magician", nameKo: "마법사", mean: "창조, 수완, 능력, 자신감" },
  { number: 2, name: "The High Priestess", nameKo: "여사제", mean: "직관, 신비, 지혜, 무의식" },
  { number: 3, name: "The Empress", nameKo: "여황제", mean: "풍요, 모성, 자연, 아름다움" },
  { number: 4, name: "The Emperor", nameKo: "황제", mean: "권위, 구조, 통제, 아버지" },
  { number: 5, name: "The Hierophant", nameKo: "교황", mean: "전통, 신념, 가르침, 영적 인도" },
  { number: 6, name: "The Lovers", nameKo: "연인", mean: "사랑, 조화, 선택, 파트너십" },
  { number: 7, name: "The Chariot", nameKo: "전차", mean: "승리, 의지, 행동, 목표 달성" },
  { number: 8, name: "Strength", nameKo: "힘", mean: "인내, 용기, 부드러운 힘, 통제" },
  { number: 9, name: "The Hermit", nameKo: "은둔자", mean: "성찰, 고독, 탐구, 내면의 빛" },
  { number: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", mean: "변화, 주기, 운명, 기회" },
  { number: 11, name: "Justice", nameKo: "정의", mean: "공정, 균형, 책임, 진실" },
  { number: 12, name: "The Hanged Man", nameKo: "매달린 남자", mean: "희생, 새로운 관점, 정지, 깨달음" },
  { number: 13, name: "Death", nameKo: "죽음", mean: "종결, 변화, 새로운 시작, 이별" },
  { number: 14, name: "Temperance", nameKo: "절제", mean: "균형, 인내, 조화, 중용" },
  { number: 15, name: "The Devil", nameKo: "악마", mean: "속박, 유혹, 물질주의, 집착" },
  { number: 16, name: "The Tower", nameKo: "탑", mean: "붕괴, 갑작스러운 변화, 충격, 해방" },
  { number: 17, name: "The Star", nameKo: "별", mean: "희망, 영감, 평온, 치유" },
  { number: 18, name: "The Moon", nameKo: "달", mean: "불안, 환상, 잠재의식, 혼란" },
  { number: 19, name: "The Sun", nameKo: "태양", mean: "성공, 기쁨, 활력, 긍정" },
  { number: 20, name: "Judgement", nameKo: "심판", mean: "부활, 각성, 소명, 결정" },
  { number: 21, name: "The World", nameKo: "세계", mean: "완성, 통합, 성취, 해피엔딩" },
];

export async function GET() {
  try {
    // 기존 데이터 충돌 방지를 위해 upsert(없으면 생성, 있으면 업데이트) 사용
    const results = [];
    
    for (const card of SEED_DATA) {
      // 🎨 이미지 마법: placehold.co 서비스를 쓰면 URL만으로 이미지가 생성됨!
      // 예: https://placehold.co/300x500/black/gold?text=The+Fool
      const fakeImageUrl = `https://placehold.co/300x500/1a1a1a/d4af37/png?text=${encodeURIComponent(card.nameKo)}`;

      const res = await prisma.tarotCard.upsert({
        where: { number: card.number }, // 카드 번호(0~21)가 기준
        update: {
            // 이미 있으면 업데이트할 내용
            imageUrl: fakeImageUrl,
            meaningUp: card.mean
        },
        create: {
            // 없으면 새로 만들 내용
            number: card.number,
            name: card.name,
            nameKo: card.nameKo,
            imageUrl: fakeImageUrl, // ✨ 여기가 핵심! 가짜 이미지 URL
            meaningUp: card.mean,
            meaningRev: "역방향 해석 데이터 없음"
        }
      });
      results.push(res);
    }

    return NextResponse.json({ 
        message: "✅ DB에 테스트용 타로 카드 22장이 생성되었습니다!", 
        count: results.length 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}