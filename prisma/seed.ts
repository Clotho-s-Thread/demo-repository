import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 메이저 아르카나 22장 데이터
const tarotData = [
  { number: 0, name: "The Fool", nameKo: "바보", meaningUp: "새로운 시작, 모험, 순수함, 자유", imageUrl: "/images/tarot/0_fool.jpg" },
  { number: 1, name: "The Magician", nameKo: "마법사", meaningUp: "창조력, 숙련된 기술, 의지력, 자신감", imageUrl: "/images/tarot/1_magician.jpg" },
  { number: 2, name: "The High Priestess", nameKo: "고위 여사제", meaningUp: "직관, 신비, 지혜, 무의식", imageUrl: "/images/tarot/2_priestess.jpg" },
  { number: 3, name: "The Empress", nameKo: "여황제", meaningUp: "풍요, 모성애, 자연, 예술적 재능", imageUrl: "/images/tarot/3_empress.jpg" },
  { number: 4, name: "The Emperor", nameKo: "황제", meaningUp: "권위, 구조, 통제, 아버지상", imageUrl: "/images/tarot/4_emperor.jpg" },
  { number: 5, name: "The Hierophant", nameKo: "교황", meaningUp: "전통, 가르침, 영적 지도자, 사회적 규범", imageUrl: "/images/tarot/5_hierophant.jpg" },
  { number: 6, name: "The Lovers", nameKo: "연인", meaningUp: "사랑, 조화, 가치관의 선택, 결합", imageUrl: "/images/tarot/6_lovers.jpg" },
  { number: 7, name: "The Chariot", nameKo: "전차", meaningUp: "승리, 의지력, 통제, 목표 달성", imageUrl: "/images/tarot/7_chariot.jpg" },
  { number: 8, name: "Strength", nameKo: "힘", meaningUp: "인내, 내면의 힘, 용기, 포용력", imageUrl: "/images/tarot/8_strength.jpg" },
  { number: 9, name: "The Hermit", nameKo: "은둔자", meaningUp: "성찰, 고독, 내면의 탐구, 지혜", imageUrl: "/images/tarot/9_hermit.jpg" },
  { number: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", meaningUp: "운명, 변화, 행운, 기회", imageUrl: "/images/tarot/10_wheel.jpg" },
  { number: 11, name: "Justice", nameKo: "정의", meaningUp: "공정함, 진실, 균형, 책임", imageUrl: "/images/tarot/11_justice.jpg" },
  { number: 12, name: "The Hanged Man", nameKo: "매달린 사람", meaningUp: "희생, 새로운 관점, 정체, 깨달음", imageUrl: "/images/tarot/12_hanged.jpg" },
  { number: 13, name: "Death", nameKo: "죽음", meaningUp: "종결, 새로운 시작, 변화, 이별", imageUrl: "/images/tarot/13_death.jpg" },
  { number: 14, name: "Temperance", nameKo: "절제", meaningUp: "균형, 중용, 인내, 조화", imageUrl: "/images/tarot/14_temperance.jpg" },
  { number: 15, name: "The Devil", nameKo: "악마", meaningUp: "속박, 유혹, 물질주의, 집착", imageUrl: "/images/tarot/15_devil.jpg" },
  { number: 16, name: "The Tower", nameKo: "탑", meaningUp: "갑작스러운 변화, 붕괴, 재난, 각성", imageUrl: "/images/tarot/16_tower.jpg" },
  { number: 17, name: "The Star", nameKo: "별", meaningUp: "희망, 영감, 치유, 평온", imageUrl: "/images/tarot/17_star.jpg" },
  { number: 18, name: "The Moon", nameKo: "달", meaningUp: "불안, 환상, 직관, 잠재의식", imageUrl: "/images/tarot/18_moon.jpg" },
  { number: 19, name: "The Sun", nameKo: "태양", meaningUp: "성공, 활력, 기쁨, 긍정", imageUrl: "/images/tarot/19_sun.jpg" },
  { number: 20, name: "Judgement", nameKo: "심판", meaningUp: "부활, 소명, 결단, 용서", imageUrl: "/images/tarot/20_judgement.jpg" },
  { number: 21, name: "The World", nameKo: "세계", meaningUp: "완성, 통합, 성취, 여행", imageUrl: "/images/tarot/21_world.jpg" },
]

async function main() {
  console.log('🌱 타로 카드 데이터 넣는 중...')
  
  // 기존 데이터가 있다면 중복 방지를 위해 삭제 (선택사항)
  // await prisma.tarotCard.deleteMany() 

  for (const card of tarotData) {
    // number가 겹치면 업데이트, 없으면 생성 (upsert)
    await prisma.tarotCard.upsert({
      where: { number: card.number },
      update: {},
      create: {
        number: card.number,
        name: card.name,
        nameKo: card.nameKo,
        meaningUp: card.meaningUp,
        imageUrl: card.imageUrl,
        meaningRev: "역방향 의미는 추후 업데이트",
      },
    })
  }
  console.log('✅ 메이저 아르카나 22장 DB 입력 완료!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })