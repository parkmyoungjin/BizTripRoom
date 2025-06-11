import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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

// KV 키 정의
const TRIP_DATA_KEY = 'trip-data';
const LAST_UPDATE_KEY = 'last-update';

// Vercel KV에서 데이터 읽기
async function readDataFromKV(): Promise<typeof defaultTripData> {
  try {
    // Vercel KV가 설정되어 있는지 확인
    if (!process.env.KV_REST_API_URL) {
      console.log('Vercel KV가 설정되지 않았습니다. 기본 데이터를 사용합니다.');
      return { ...defaultTripData };
    }

    const data = await kv.get<typeof defaultTripData>(TRIP_DATA_KEY);
    
    if (!data) {
      console.log('KV에 저장된 데이터가 없습니다. 기본 데이터를 반환합니다.');
      // 기본 데이터를 KV에 저장
      await writeDataToKV(defaultTripData);
      return { ...defaultTripData };
    }
    
    // 데이터 구조 검증 및 기본값 병합
    return {
      tripInfo: data.tripInfo || defaultTripData.tripInfo,
      attendees: data.attendees || defaultTripData.attendees,
      chatMessages: data.chatMessages || defaultTripData.chatMessages,
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error('KV에서 데이터를 읽는 중 오류 발생:', error);
    return { ...defaultTripData };
  }
}

// Vercel KV에 데이터 쓰기
async function writeDataToKV(data: typeof defaultTripData): Promise<boolean> {
  try {
    // Vercel KV가 설정되어 있는지 확인
    if (!process.env.KV_REST_API_URL) {
      console.error('Vercel KV가 설정되지 않았습니다.');
      return false;
    }

    const dataToWrite = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // 데이터와 업데이트 시간을 모두 저장
    await Promise.all([
      kv.set(TRIP_DATA_KEY, dataToWrite),
      kv.set(LAST_UPDATE_KEY, dataToWrite.lastUpdated)
    ]);
    
    console.log('KV에 데이터 저장 성공');
    return true;
  } catch (error) {
    console.error('KV에 데이터 저장 실패:', error);
    return false;
  }
}

// 마지막 업데이트 시간 확인
async function getLastUpdateTime(): Promise<string | null> {
  try {
    if (!process.env.KV_REST_API_URL) {
      return null;
    }
    
    const lastUpdate = await kv.get<string>(LAST_UPDATE_KEY);
    return lastUpdate;
  } catch (error) {
    console.error('마지막 업데이트 시간 조회 실패:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientLastUpdate = searchParams.get('lastUpdate');
    
    // 클라이언트가 마지막 업데이트 시간을 보냈다면, 변경사항이 있는지 확인
    if (clientLastUpdate) {
      const serverLastUpdate = await getLastUpdateTime();
      
      if (serverLastUpdate && serverLastUpdate === clientLastUpdate) {
        // 변경사항이 없음
        return NextResponse.json({ 
          noChanges: true 
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
      }
    }
    
    const data = await readDataFromKV();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Last-Update': data.lastUpdated,
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
    
    const success = await writeDataToKV(dataToSave);
    
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