import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 총 78장 타로 카드 데이터 (메이저 22장 + 마이너 56장)
const tarotData = [
  // --- 메이저 아르카나 (0~21) ---
  { number: 0, name: "The Fool", nameKo: "바보", meaningUp: "새로운 시작, 모험, 순수함, 자유", meaningRev: "무모함, 어리석음, 무책임, 잘못된 선택", imageUrl: "/images/tarot/0_fool.jpg" },
  { number: 1, name: "The Magician", nameKo: "마법사", meaningUp: "창조력, 숙련된 기술, 의지력, 자신감", meaningRev: "속임수, 조작, 재능 낭비, 불안정", imageUrl: "/images/tarot/1_magician.jpg" },
  { number: 2, name: "The High Priestess", nameKo: "고위 여사제", meaningUp: "직관, 신비, 지혜, 무의식", meaningRev: "비밀 누설, 피상적인 지식, 감정적 불안, 직관 무시", imageUrl: "/images/tarot/2_priestess.jpg" },
  { number: 3, name: "The Empress", nameKo: "여황제", meaningUp: "풍요, 모성애, 자연, 예술적 재능", meaningRev: "태만, 의존성, 과보호, 허영심", imageUrl: "/images/tarot/3_empress.jpg" },
  { number: 4, name: "The Emperor", nameKo: "황제", meaningUp: "권위, 구조, 통제, 아버지상", meaningRev: "독재, 지배욕, 완고함, 무능력", imageUrl: "/images/tarot/4_emperor.jpg" },
  { number: 5, name: "The Hierophant", nameKo: "교황", meaningUp: "전통, 가르침, 영적 지도자, 사회적 규범", meaningRev: "인습에 얽매임, 편협함, 반항, 독단적", imageUrl: "/images/tarot/5_hierophant.jpg" },
  { number: 6, name: "The Lovers", nameKo: "연인", meaningUp: "사랑, 조화, 가치관의 선택, 결합", meaningRev: "이별, 불화, 잘못된 선택, 유혹", imageUrl: "/images/tarot/6_lovers.jpg" },
  { number: 7, name: "The Chariot", nameKo: "전차", meaningUp: "승리, 의지력, 통제, 목표 달성", meaningRev: "통제력 상실, 폭주, 무모함, 패배", imageUrl: "/images/tarot/7_chariot.jpg" },
  { number: 8, name: "Strength", nameKo: "힘", meaningUp: "인내, 내면의 힘, 용기, 포용력", meaningRev: "나약함, 자신감 부족, 두려움, 억압", imageUrl: "/images/tarot/8_strength.jpg" },
  { number: 9, name: "The Hermit", nameKo: "은둔자", meaningUp: "성찰, 고독, 내면의 탐구, 지혜", meaningRev: "고립, 외로움, 현실 도피, 폐쇄성", imageUrl: "/images/tarot/9_hermit.jpg" },
  { number: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", meaningUp: "운명, 변화, 행운, 기회", meaningRev: "불운, 피할 수 없는 변화, 저항, 쇠퇴", imageUrl: "/images/tarot/10_wheel.jpg" },
  { number: 11, name: "Justice", nameKo: "정의", meaningUp: "공정함, 진실, 균형, 책임", meaningRev: "불공정, 편견, 책임 회피, 우유부단", imageUrl: "/images/tarot/11_justice.jpg" },
  { number: 12, name: "The Hanged Man", nameKo: "매달린 사람", meaningUp: "희생, 새로운 관점, 정체, 깨달음", meaningRev: "무의미한 희생, 아집, 정체, 헛고생", imageUrl: "/images/tarot/12_hanged.jpg" },
  { number: 13, name: "Death", nameKo: "죽음", meaningUp: "종결, 새로운 시작, 변화, 이별", meaningRev: "변화에 대한 저항, 정체, 두려움, 무기력", imageUrl: "/images/tarot/13_death.jpg" },
  { number: 14, name: "Temperance", nameKo: "절제", meaningUp: "균형, 중용, 인내, 조화", meaningRev: "불균형, 무절제, 극단적, 조화로움 깨짐", imageUrl: "/images/tarot/14_temperance.jpg" },
  { number: 15, name: "The Devil", nameKo: "악마", meaningUp: "속박, 유혹, 물질주의, 집착", meaningRev: "해방, 속박에서 벗어남, 새로운 시작, 깨달음", imageUrl: "/images/tarot/15_devil.jpg" },
  { number: 16, name: "The Tower", nameKo: "탑", meaningUp: "갑작스러운 변화, 붕괴, 재난, 각성", meaningRev: "재난을 피함, 변화 거부, 억압된 감정, 두려움", imageUrl: "/images/tarot/16_tower.jpg" },
  { number: 17, name: "The Star", nameKo: "별", meaningUp: "희망, 영감, 치유, 평온", meaningRev: "실망, 비관주의, 절망, 영감 부족", imageUrl: "/images/tarot/17_star.jpg" },
  { number: 18, name: "The Moon", nameKo: "달", meaningUp: "불안, 환상, 직관, 잠재의식", meaningRev: "혼란 해소, 진실 폭로, 불안 극복, 깨달음", imageUrl: "/images/tarot/18_moon.jpg" },
  { number: 19, name: "The Sun", nameKo: "태양", meaningUp: "성공, 활력, 기쁨, 긍정", meaningRev: "일시적 우울, 늦은 성공, 과장, 활력 저하", imageUrl: "/images/tarot/19_sun.jpg" },
  { number: 20, name: "Judgement", nameKo: "심판", meaningUp: "부활, 소명, 결단, 용서", meaningRev: "후회, 자기 혐오, 결정 지연, 변화 거부", imageUrl: "/images/tarot/20_judgement.jpg" },
  { number: 21, name: "The World", nameKo: "세계", meaningUp: "완성, 통합, 성취, 여행", meaningRev: "미완성, 정체, 성공 직전의 좌절, 준비 부족", imageUrl: "/images/tarot/21_world.jpg" },

  // --- 마이너 아르카나 : 지팡이 (Wands, 행동과 열정) (22~35) ---
  { number: 22, name: "Ace of Wands", nameKo: "완드 에이스", meaningUp: "새로운 영감, 열정, 창조력, 시작", meaningRev: "창조력 상실, 지연, 동기 부족, 막힘", imageUrl: "/images/tarot/22_wands_ace.jpg" },
  { number: 23, name: "Two of Wands", nameKo: "완드 2", meaningUp: "계획, 미래 지향, 결정, 탐험", meaningRev: "계획 차질, 선택의 두려움, 미루기", imageUrl: "/images/tarot/23_wands_2.jpg" },
  { number: 24, name: "Three of Wands", nameKo: "완드 3", meaningUp: "성장, 확장, 준비된 기회, 리더십", meaningRev: "지연, 성과 부족, 시야가 좁음", imageUrl: "/images/tarot/24_wands_3.jpg" },
  { number: 25, name: "Four of Wands", nameKo: "완드 4", 단: "축하, 안정, 휴식, 커뮤니티", meaningUp: "축하, 귀환, 안정된 환경, 평화", meaningRev: "일시적 평화, 집안의 불화, 축하 연기", imageUrl: "/images/tarot/25_wands_4.jpg" },
  { number: 26, name: "Five of Wands", nameKo: "완드 5", meaningUp: "경쟁, 의견 충돌, 사소한 갈등, 스포츠", meaningRev: "갈등 회피, 내적 갈등, 타협", imageUrl: "/images/tarot/26_wands_5.jpg" },
  { number: 27, name: "Six of Wands", nameKo: "완드 6", meaningUp: "승리, 인정, 대중의 찬사, 자신감", meaningRev: "자만심, 인정받지 못함, 추락", imageUrl: "/images/tarot/27_wands_6.jpg" },
  { number: 28, name: "Seven of Wands", nameKo: "완드 7", meaningUp: "방어, 고군분투, 유리한 위치, 용기", meaningRev: "압도당함, 포기, 방어 실패", imageUrl: "/images/tarot/28_wands_7.jpg" },
  { number: 29, name: "Eight of Wands", nameKo: "완드 8", meaningUp: "빠른 진행, 소식, 이동, 행동력", meaningRev: "지연, 섣부른 행동, 소통 단절", imageUrl: "/images/tarot/29_wands_8.jpg" },
  { number: 30, name: "Nine of Wands", nameKo: "완드 9", meaningUp: "인내, 방어태세, 지침, 끈기", meaningRev: "피해망상, 완고함, 한계에 다다름", imageUrl: "/images/tarot/30_wands_9.jpg" },
  { number: 31, name: "Ten of Wands", nameKo: "완드 10", meaningUp: "과로, 무거운 책임, 부담감, 목적지 임박", meaningRev: "부담을 내려놓음, 완전한 소진, 책임 회피", imageUrl: "/images/tarot/31_wands_10.jpg" },
  { number: 32, name: "Page of Wands", nameKo: "완드 시종", meaningUp: "탐험, 흥미로운 소식, 열정적인 시작", meaningRev: "조급함, 미숙함, 계획 없는 행동", imageUrl: "/images/tarot/32_wands_page.jpg" },
  { number: 33, name: "Knight of Wands", nameKo: "완드 기사", meaningUp: "에너지, 충동, 모험, 정열적인 인물", meaningRev: "무모함, 분노, 일관성 부족", imageUrl: "/images/tarot/33_wands_knight.jpg" },
  { number: 34, name: "Queen of Wands", nameKo: "완드 여왕", meaningUp: "카리스마, 매력, 활기찬, 독립성", meaningRev: "질투심, 이기적임, 변덕스러운 성질", imageUrl: "/images/tarot/34_wands_queen.jpg" },
  { number: 35, name: "King of Wands", nameKo: "완드 왕", meaningUp: "리더십, 비전, 카리스마, 창조적 권력", meaningRev: "독재적, 충동적, 지배하려 함", imageUrl: "/images/tarot/35_wands_king.jpg" },

  // --- 마이너 아르카나 : 컵 (Cups, 감정과 관계) (36~49) ---
  { number: 36, name: "Ace of Cups", nameKo: "컵 에이스", meaningUp: "새로운 사랑, 풍부한 감정, 직관, 자비", meaningRev: "감정적 메마름, 억압, 짝사랑", imageUrl: "/images/tarot/36_cups_ace.jpg" },
  { number: 37, name: "Two of Cups", nameKo: "컵 2", meaningUp: "화합, 파트너십, 사랑, 상호 존중", meaningRev: "불균형, 불화, 관계의 단절", imageUrl: "/images/tarot/37_cups_2.jpg" },
  { number: 38, name: "Three of Cups", nameKo: "컵 3", meaningUp: "축하, 우정, 즐거움, 공동체 의식", meaningRev: "과음, 소외감, 가십거리", imageUrl: "/images/tarot/38_cups_3.jpg" },
  { number: 39, name: "Four of Cups", nameKo: "컵 4", meaningUp: "무관심, 권태, 명상, 기회 간과", meaningRev: "새로운 동기, 자각, 정체기 극복", imageUrl: "/images/tarot/39_cups_4.jpg" },
  { number: 40, name: "Five of Cups", nameKo: "컵 5", meaningUp: "상실, 후회, 슬픔, 비관주의", meaningRev: "수용, 치유의 시작, 남은 것에 집중", imageUrl: "/images/tarot/40_cups_5.jpg" },
  { number: 41, name: "Six of Cups", nameKo: "컵 6", meaningUp: "향수, 과거의 추억, 순수함, 재회", meaningRev: "과거에 얽매임, 비현실성, 독립성 부족", imageUrl: "/images/tarot/41_cups_6.jpg" },
  { number: 42, name: "Seven of Cups", nameKo: "컵 7", meaningUp: "환상, 선택의 여지, 몽상, 비현실성", meaningRev: "현실 직시, 명확한 결단, 환상에서 깸", imageUrl: "/images/tarot/42_cups_7.jpg" },
  { number: 43, name: "Eight of Cups", nameKo: "컵 8", meaningUp: "미련 없는 떠남, 더 나은 것을 찾음, 실망", meaningRev: "회피, 떠나지 못함, 두려움", imageUrl: "/images/tarot/43_cups_8.jpg" },
  { number: 44, name: "Nine of Cups", nameKo: "컵 9", meaningUp: "소원 성취, 만족, 풍요, 행복", meaningRev: "탐욕, 자만심, 물질적 불만족", imageUrl: "/images/tarot/44_cups_9.jpg" },
  { number: 45, name: "Ten of Cups", nameKo: "컵 10", meaningUp: "조화로운 가정, 완벽한 행복, 유대감", meaningRev: "가정 불화, 가치관 충돌, 깨진 관계", imageUrl: "/images/tarot/45_cups_10.jpg" },
  { number: 46, name: "Page of Cups", nameKo: "컵 시종", meaningUp: "감성적 소식, 창의성, 직관적, 놀라움", meaningRev: "정서적 미성숙, 불안, 창의력 부족", imageUrl: "/images/tarot/46_cups_page.jpg" },
  { number: 47, name: "Knight of Cups", nameKo: "컵 기사", meaningUp: "로맨티스트, 몽상가, 매력적인, 제안", meaningRev: "비현실적, 변덕스러움, 질투", imageUrl: "/images/tarot/47_cups_knight.jpg" },
  { number: 48, name: "Queen of Cups", nameKo: "컵 여왕", meaningUp: "공감, 직관, 따뜻함, 정서적 지지", meaningRev: "감정적 의존, 우울함, 피해의식", imageUrl: "/images/tarot/48_cups_queen.jpg" },
  { number: 49, name: "King of Cups", nameKo: "컵 왕", meaningUp: "감정 통제, 관용, 외교적, 현명함", meaningRev: "감정적 조작, 냉담함, 억압된 감정", imageUrl: "/images/tarot/49_cups_king.jpg" },

  // --- 마이너 아르카나 : 소드 (Swords, 지성과 갈등) (50~63) ---
  { number: 50, name: "Ace of Swords", nameKo: "소드 에이스", meaningUp: "명확성, 진실, 새로운 생각, 돌파구", meaningRev: "혼란, 잘못된 정보, 판단력 흐려짐", imageUrl: "/images/tarot/50_swords_ace.jpg" },
  { number: 51, name: "Two of Swords", nameKo: "소드 2", meaningUp: "교착 상태, 회피, 힘든 결정, 맹점", meaningRev: "진실 직시, 결단력, 갈등 폭발", imageUrl: "/images/tarot/51_swords_2.jpg" },
  { number: 52, name: "Three of Swords", nameKo: "소드 3", meaningUp: "슬픔, 마음의 상처, 이별, 고통", meaningRev: "치유, 상처 극복, 고통의 완화", imageUrl: "/images/tarot/52_swords_3.jpg" },
  { number: 53, name: "Four of Swords", nameKo: "소드 4", meaningUp: "휴식, 회복, 명상, 정비의 시간", meaningRev: "강제 휴식, 소진, 회복 불능", imageUrl: "/images/tarot/53_swords_4.jpg" },
  { number: 54, name: "Five of Swords", nameKo: "소드 5", meaningUp: "갈등, 이기적인 승리, 패배감, 배신", meaningRev: "화해, 갈등 해소, 후회", imageUrl: "/images/tarot/54_swords_5.jpg" },
  { number: 55, name: "Six of Swords", nameKo: "소드 6", meaningUp: "전환, 이동, 회복, 평온한 곳으로 향함", meaningRev: "갇힘, 이동 지연, 미해결된 문제", imageUrl: "/images/tarot/55_swords_6.jpg" },
  { number: 56, name: "Seven of Swords", nameKo: "소드 7", meaningUp: "속임수, 전략, 은밀함, 도피", meaningRev: "고백, 전략 실패, 양심의 가책", imageUrl: "/images/tarot/56_swords_7.jpg" },
  { number: 57, name: "Eight of Swords", nameKo: "소드 8", meaningUp: "억압, 제한, 갇힌 느낌, 무기력", meaningRev: "해방, 시각 변화, 주도권 되찾음", imageUrl: "/images/tarot/57_swords_8.jpg" },
  { number: 58, name: "Nine of Swords", nameKo: "소드 9", meaningUp: "불안, 악몽, 걱정, 죄책감", meaningRev: "안도감, 객관적 현실 파악, 두려움 극복", imageUrl: "/images/tarot/58_swords_9.jpg" },
  { number: 59, name: "Ten of Swords", nameKo: "소드 10", meaningUp: "파멸, 바닥, 갑작스러운 끝, 희생양", meaningRev: "회복의 시작, 생존, 최악을 벗어남", imageUrl: "/images/tarot/59_swords_10.jpg" },
  { number: 60, name: "Page of Swords", nameKo: "소드 시종", meaningUp: "호기심, 경계심, 예리함, 새로운 아이디어", meaningRev: "냉소적, 가십거리, 준비 없는 발언", imageUrl: "/images/tarot/60_swords_page.jpg" },
  { number: 61, name: "Knight of Swords", nameKo: "소드 기사", meaningUp: "돌진, 논쟁, 날카로운 지성, 신속함", meaningRev: "무례함, 성급한 결정, 무모함", imageUrl: "/images/tarot/61_swords_knight.jpg" },
  { number: 62, name: "Queen of Swords", nameKo: "소드 여왕", meaningUp: "독립적, 객관적, 예리한 판단, 명확성", meaningRev: "냉혹함, 지나치게 비판적, 고립", imageUrl: "/images/tarot/62_swords_queen.jpg" },
  { number: 63, name: "King of Swords", nameKo: "소드 왕", meaningUp: "지적 권위, 논리, 진실, 공정함", meaningRev: "권력 남용, 잔인함, 논리적 오류", imageUrl: "/images/tarot/63_swords_king.jpg" },

  // --- 마이너 아르카나 : 펜타클 (Pentacles, 물질과 현실) (64~77) ---
  { number: 64, name: "Ace of Pentacles", nameKo: "펜타클 에이스", meaningUp: "새로운 재정적 기회, 번영, 안정, 시작", meaningRev: "금전적 손실, 기회 놓침, 불안정", imageUrl: "/images/tarot/64_pentacles_ace.jpg" },
  { number: 65, name: "Two of Pentacles", nameKo: "펜타클 2", meaningUp: "균형, 적응력, 재정 관리, 융통성", meaningRev: "불균형, 압도됨, 재정적 어려움", imageUrl: "/images/tarot/65_pentacles_2.jpg" },
  { number: 66, name: "Three of Pentacles", nameKo: "펜타클 3", meaningUp: "팀워크, 협업, 장인정신, 배움", meaningRev: "불화, 기술 부족, 개인 플레이", imageUrl: "/images/tarot/66_pentacles_3.jpg" },
  { number: 67, name: "Four of Pentacles", nameKo: "펜타클 4", meaningUp: "소유욕, 안정, 인색함, 통제", meaningRev: "집착을 버림, 관대함, 통제력 상실", imageUrl: "/images/tarot/67_pentacles_4.jpg" },
  { number: 68, name: "Five of Pentacles", nameKo: "펜타클 5", meaningUp: "빈곤, 소외, 경제적 고난, 고독", meaningRev: "회복, 도움의 손길, 재정적 개선", imageUrl: "/images/tarot/68_pentacles_5.jpg" },
  { number: 69, name: "Six of Pentacles", nameKo: "펜타클 6", meaningUp: "자선, 나눔, 공정함, 베풂과 받음", meaningRev: "이기심, 불공정, 대가를 바라는 친절", imageUrl: "/images/tarot/69_pentacles_6.jpg" },
  { number: 70, name: "Seven of Pentacles", nameKo: "펜타클 7", meaningUp: "인내, 장기 투자, 수확 대기, 평가", meaningRev: "조급함, 노력의 낭비, 투자 실패", imageUrl: "/images/tarot/70_pentacles_7.jpg" },
  { number: 71, name: "Eight of Pentacles", nameKo: "펜타클 8", meaningUp: "헌신, 장인정신, 반복적 노력, 숙련", meaningRev: "완벽주의, 의욕 상실, 기술 부족", imageUrl: "/images/tarot/71_pentacles_8.jpg" },
  { number: 72, name: "Nine of Pentacles", nameKo: "펜타클 9", meaningUp: "풍요, 자족, 독립, 결실을 즐김", meaningRev: "재정적 불안정, 허세, 헛된 소비", imageUrl: "/images/tarot/72_pentacles_9.jpg" },
  { number: 73, name: "Ten of Pentacles", nameKo: "펜타클 10", meaningUp: "유산, 장기적 부, 가족의 안정, 완성", meaningRev: "재정적 분쟁, 가족 불화, 유산 갈등", imageUrl: "/images/tarot/73_pentacles_10.jpg" },
  { number: 74, name: "Page of Pentacles", nameKo: "펜타클 시종", meaningUp: "학구열, 실용적 접근, 새로운 목표", meaningRev: "지연, 끈기 부족, 계획 차질", imageUrl: "/images/tarot/74_pentacles_page.jpg" },
  { number: 75, name: "Knight of Pentacles", nameKo: "펜타클 기사", meaningUp: "근면함, 신뢰, 보수적, 인내심", meaningRev: "게으름, 정체, 지루함, 고집", imageUrl: "/images/tarot/75_pentacles_knight.jpg" },
  { number: 76, name: "Queen of Pentacles", nameKo: "펜타클 여왕", meaningUp: "실용적, 따뜻함, 번영, 모성애적 현실", meaningRev: "물질주의, 질투, 스스로 돌보지 않음", imageUrl: "/images/tarot/76_pentacles_queen.jpg" },
  { number: 77, name: "King of Pentacles", nameKo: "펜타클 왕", meaningUp: "재정적 성공, 비즈니스 감각, 안정감", meaningRev: "탐욕, 부패, 물질에 대한 집착", imageUrl: "/images/tarot/77_pentacles_king.jpg" }
]

async function main() {
  console.log('🌱 총 78장의 타로 카드 데이터 (정/역방향 포함) 넣는 중...')
  
  for (const card of tarotData) {
    // number가 겹치면 update 속성을 통해 기존 데이터를 덮어씌움
    await prisma.tarotCard.upsert({
      where: { number: card.number },
      update: {
        meaningUp: card.meaningUp,
        meaningRev: card.meaningRev,
        imageUrl: card.imageUrl, // 이미지 경로 업데이트
      },
      create: {
        number: card.number,
        name: card.name,
        nameKo: card.nameKo,
        meaningUp: card.meaningUp,
        meaningRev: card.meaningRev,
        imageUrl: card.imageUrl,
      },
    })
  }
  console.log('✅ 총 78장 타로 카드 완벽하게 DB 입력 완료!')
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