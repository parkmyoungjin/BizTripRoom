import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KV_KEY = 'biz-trip-data';

// 타입 정의
interface Attendee {
  id: number;
  name: string;
  position: string;
  confirmed: boolean;
}

interface ChatMessage {
  id: number;
  type?: string;
  author: string;
  content: string;
  time: string;
  replies: Array<{
    id: number;
    author: string;
    content: string;
    time: string;
  }>;
}

interface TripInfo {
  title: string;
  date: string;
  location: string;
  description: string;
  schedule: Array<{
    time: string;
    activity: string;
    emoji?: string;
    color?: string;
  }>;
}

interface TripData {
  tripInfo: TripInfo;
  attendees: Attendee[];
  chatMessages: ChatMessage[];
  lastUpdated?: string;
}

// 초기 데이터 (KV에 데이터가 없을 때만 사용)
const initialData: TripData = {
  tripInfo: {
    title: "",
    date: "",
    location: "",
    description: "",
    schedule: []
  },
  attendees: [],
  chatMessages: [],
  lastUpdated: new Date().toISOString()
};

// KV에서 데이터 읽기
async function readData(): Promise<TripData> {
  try {
    const data = await kv.get<TripData>(KV_KEY);
    return data || initialData;
  } catch (error) {
    console.error('KV 데이터 읽기 오류:', error);
    return initialData;
  }
}

// KV에 데이터 쓰기
async function writeData(data: TripData): Promise<void> {
  try {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    await kv.set(KV_KEY, dataWithTimestamp);
  } catch (error) {
    console.error('KV 데이터 쓰기 오류:', error);
    throw new Error('데이터 저장에 실패했습니다');
  }
}

// GET: 데이터 조회
export async function GET() {
  try {
    const data = await readData();
    console.log('데이터 조회 요청 - 반환할 데이터:', {
      tripInfo: data.tripInfo?.title,
      attendees: data.attendees?.length,
      chatMessages: data.chatMessages?.length,
      lastUpdated: data.lastUpdated
    });
    
    // 캐시 방지 헤더 추가
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 데이터 저장
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as TripData;
    console.log('데이터 저장 요청:', {
      tripInfo: data.tripInfo?.title,
      attendees: data.attendees?.length,
      chatMessages: data.chatMessages?.length
    });
    
    await writeData(data);
    
    const savedTime = new Date().toLocaleString('ko-KR');
    console.log('KV 데이터 저장 완료:', savedTime);
    
    return NextResponse.json({ 
      success: true, 
      message: '데이터가 저장되었습니다',
      savedAt: savedTime
    });
  } catch (error) {
    console.error('데이터 저장 오류:', error);
    return NextResponse.json(
      { error: '데이터 저장에 실패했습니다' },
      { status: 500 }
    );
  }
} 