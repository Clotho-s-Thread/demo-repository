import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 이 줄이 있어야 배포 때 에러가 안 납니다!
export const dynamic = 'force-dynamic';

export default async function DbCheckPage() {
  let dbStatus = "확인 중...";
  let dbTime = "";
  let errorMsg = "";

  try {
    const result: any = await prisma.$queryRaw`SELECT NOW()`;
    dbStatus = "✅ 연결 성공 (Connected)";
    dbTime = result[0]?.now?.toString() || "시간 정보 없음";
  } catch (e: any) {
    dbStatus = "❌ 연결 실패 (Error)";
    errorMsg = e.message;
    console.error(e);
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1>Clotho's Thread - DB Connection Test</h1>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #444' }}>
        <h2>Status: {dbStatus}</h2>
        {dbTime && <p>Time: {dbTime}</p>}
        {errorMsg && <pre style={{ color: 'red' }}>{errorMsg}</pre>}
      </div>
    </div>
  );
}