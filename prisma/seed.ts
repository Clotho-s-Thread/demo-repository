// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 데이터 심기(Seeding) 시작...')

  // 기존 데이터가 있다면 충돌나지 않게 삭제 (선택사항)
  // await prisma.tarotCard.deleteMany()

  // 1. 바보 (The Fool)
  await prisma.tarotCard.upsert({
    where: { name: 'The Fool' },
    update: {},
    create: {
      name: 'The Fool',
      number: 0,
      image: 'https://upload.wikimedia.org/wikipedia/en/9/90/RWS_Tarot_00_Fool.jpg', // 임시 이미지
      meaningUp: '새로운 시작, 모험, 순수함, 자유로운 영혼',
      meaningDown: '경솔함, 무책임, 위험을 감수함, 어리석음',
    },
  })

  // 2. 마법사 (The Magician)
  await prisma.tarotCard.upsert({
    where: { name: 'The Magician' },
    update: {},
    create: {
      name: 'The Magician',
      number: 1,
      image: 'https://upload.wikimedia.org/wikipedia/en/d/de/RWS_Tarot_01_Magician.jpg',
      meaningUp: '창조력, 기술, 의지력, 자신감',
      meaningDown: '속임수, 교활함, 재능의 오용, 소통 부재',
    },
  })

  // 3. 여황제 (The Empress)
  await prisma.tarotCard.upsert({
    where: { name: 'The Empress' },
    update: {},
    create: {
      name: 'The Empress',
      number: 3,
      image: 'https://upload.wikimedia.org/wikipedia/en/d/d2/RWS_Tarot_03_Empress.jpg',
      meaningUp: '풍요, 여성성, 자연, 양육',
      meaningDown: '과한 보호, 게으름, 낭비, 의존적',
    },
  })

  console.log('✅ 데이터 심기 완료! (3장)')
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