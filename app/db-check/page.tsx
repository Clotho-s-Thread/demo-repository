import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function DbCheckPage() {
  // DB 연결 테스트를 위한 변수
  let dbStatus = "확인 중...";
  let dbTime = "";
  let errorMsg = "";

  try {
    // 1. DB에 간단한 쿼리 날리기 (현재 시간 가져오기)
    // PostgreSQL 문법인 'SELECT NOW()'를 사용합니다.
    const result: any = await prisma.$queryRaw`SELECT NOW()`;
    
    // 2. 성공하면 결과 저장
    dbStatus = "✅ 연결 성공 (Connected)";
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
             <pre style={{ whiteSpace: 'pre-wrap' }}>{errorMsg}</pre>
          </div>
        )}
      </div>
    </div>
  );
}