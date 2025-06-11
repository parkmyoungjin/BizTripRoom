import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

// 기본 데이터
const defaultTripData = {
  tripInfo: {
    title: "서울아산병원 출장",
    date: "2025년 6월 18일",
    location: "서울아산병원",
    description: "업무 관련 출장입니다.",
    schedule: [
      { time: "09:00", activity: "집합 및 출발", emoji: "🚌", color: "#3B82F6" },
      { time: "10:30", activity: "서울아산병원 도착", emoji: "🏥", color: "#10B981" },
      { time: "11:00", activity: "미팅 시작", emoji: "💼", color: "#8B5CF6" },
      { time: "12:00", activity: "점심 식사", emoji: "🍽️", color: "#F59E0B" },
      { time: "14:00", activity: "오후 미팅", emoji: "📊", color: "#EF4444" },
      { time: "16:00", activity: "마무리 및 복귀", emoji: "🏃", color: "#6B7280" }
    ]
  },
  attendees: [
    { id: 1, name: "김철수", position: "팀장", confirmed: true },
    { id: 2, name: "이영희", position: "대리", confirmed: true },
    { id: 3, name: "박민수", position: "사원", confirmed: false },
    { id: 4, name: "정수진", position: "과장", confirmed: true },
  ],
  chatMessages: [
    { 
      id: 1, 
      type: "question", 
      author: "김철수", 
      content: "집합 장소가 어디인가요?", 
      time: "2시간 전",
      replies: [
        { id: 1, author: "정수진", content: "서울역 2번 출구에서 집합입니다.", time: "1시간 30분 전" }
      ]
    },
    { 
      id: 2, 
      type: "question", 
      author: "이영희", 
      content: "점심은 어디서 먹나요?", 
      time: "1시간 전",
      replies: []
    }
  ],
  lastUpdated: new Date().toISOString()
};

// 메모리 캐시 (빠른 액세스용)
let memoryCache: typeof defaultTripData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5초 캐시

// 파일 경로 설정
const getDataFilePath = () => {
  if (process.env.VERCEL) {
    // Vercel 환경에서는 /tmp 디렉토리 사용
    return '/tmp/trip-data.json';
  } else {
    // 로컬 환경에서는 data 폴더 사용
    return path.join(process.cwd(), 'data', 'trip-data.json');
  }
};

// 데이터 파일에서 읽기
async function readDataFromFile(): Promise<typeof defaultTripData> {
  try {
    const filePath = getDataFilePath();
    
    // 로컬 환경에서만 디렉토리 생성
    if (!process.env.VERCEL) {
      const dir = path.dirname(filePath);
      try {
        await mkdir(dir, { recursive: true });
      } catch {
        // 디렉토리가 이미 있으면 무시
      }
    }
    
    const data = await readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    
    // 데이터 구조 검증 및 기본값 병합
    return {
      tripInfo: parsedData.tripInfo || defaultTripData.tripInfo,
      attendees: parsedData.attendees || defaultTripData.attendees,
      chatMessages: parsedData.chatMessages || defaultTripData.chatMessages,
      lastUpdated: parsedData.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.log('파일에서 데이터를 읽을 수 없어 기본 데이터를 사용합니다:', error);
    return { ...defaultTripData };
  }
}

// 데이터 파일에 쓰기
async function writeDataToFile(data: typeof defaultTripData): Promise<boolean> {
  try {
    const filePath = getDataFilePath();
    
    // 로컬 환경에서만 디렉토리 생성
    if (!process.env.VERCEL) {
      const dir = path.dirname(filePath);
      try {
        await mkdir(dir, { recursive: true });
      } catch {
        // 디렉토리가 이미 있으면 무시
      }
    }
    
    const dataToWrite = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    await writeFile(filePath, JSON.stringify(dataToWrite, null, 2), 'utf-8');
    
    // 캐시 업데이트
    memoryCache = dataToWrite;
    cacheTimestamp = Date.now();
    
    console.log('데이터 파일 저장 성공:', filePath);
    return true;
  } catch (error) {
    console.error('데이터 파일 저장 실패:', error);
    return false;
  }
}

// 캐시된 데이터 가져오기
async function getCachedData(): Promise<typeof defaultTripData> {
  const now = Date.now();
  
  // 캐시가 유효한 경우
  if (memoryCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return memoryCache;
  }
  
  // 캐시가 없거나 만료된 경우 파일에서 읽기
  const data = await readDataFromFile();
  memoryCache = data;
  cacheTimestamp = now;
  
  return data;
}

export async function GET() {
  try {
    const data = await getCachedData();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newData = await request.json();
    
    // 데이터 구조 검증
    const dataToSave = {
      tripInfo: newData.tripInfo || defaultTripData.tripInfo,
      attendees: newData.attendees || defaultTripData.attendees,
      chatMessages: newData.chatMessages || defaultTripData.chatMessages,
      lastUpdated: new Date().toISOString()
    };
    
    const success = await writeDataToFile(dataToSave);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '데이터가 성공적으로 저장되었습니다.',
        data: dataToSave
      });
    } else {
      return NextResponse.json(
        { error: '데이터 저장에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('데이터 저장 오류:', error);
    return NextResponse.json(
      { error: '데이터 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
} 