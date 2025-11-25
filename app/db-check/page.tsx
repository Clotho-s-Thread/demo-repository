import { PrismaClient } from '@prisma/client';

// [수정 1] Prisma Client 인스턴스 관리 (싱글톤 패턴)
// 개발 모드에서 파일이 저장될 때마다 DB 연결이 무한대로 늘어나는 것을 막습니다.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// [수정 2] 동적 렌더링 강제 설정
// 배포할 때 미리 화면을 만들지 말고, 사람이 접속할 때마다 실행하라는 명령어입니다.
// 이게 없으면 배포 과정(Build)에서 DB 연결을 시도하다가 에러가 나서 배포가 실패할 수 있습니다.
export const dynamic = 'force-dynamic';

export default async function DbCheckPage() {
  // DB 연결 테스트를 위한 변수
  let dbStatus = "확인 중...";
  let dbTime = "";
  let errorMsg = "";

  try {
    // 1. DB에 간단한 쿼리 날리기 (현재 시간 가져오기)
    const result: any = await prisma.$queryRaw`SELECT NOW()`;
    
    // 2. 성공하면 결과 저장
    dbStatus = "✅ 연결 성공 (Connected)";
    // 날짜 형식을 보기 좋게 문자열로 변환
    dbTime = result[0]?.now?.toString() || "시간 정보 없음";
    
  } catch (e: any) {
    // 3. 실패하면 에러 메시지 저장
    dbStatus = "❌ 연결 실패 (Error)";
    errorMsg = e.message;
    console.error(e);
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        Clotho's Thread - DB Connection Test
      </h1>

      <div style={{ marginTop: '30px', padding: '20px', borderRadius: '8px', border: '1px solid #444', background: '#222' }}>
        <h2>Status: <span style={{ color: errorMsg ? '#ff4444' : '#00cc88' }}>{dbStatus}</span></h2>
        
        {!errorMsg && (
          <div style={{ marginTop: '20px' }}>
            <p><strong>Database Time:</strong> {dbTime}</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              * 이 시간은 Vercel 서버가 아니라, <strong>PostgreSQL DB에서 직접 가져온 시간</strong>입니다.
            </p>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#330000', color: '#ffaaaa', borderRadius: '4px' }}>
             <h3>Error Details:</h3>
             <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{errorMsg}</pre>
          </div>
        )}
      </div>
    </div>
  );
}