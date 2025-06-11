import { NextRequest, NextResponse } from 'next/server';

// 메모리 기반 데이터 저장소 (Vercel 환경용)
let tripData = {
  tripInfo: {
    title: "부산 비즈니스 출장",
    date: "2024년 1월 15일 - 1월 17일",
    location: "부산광역시",
    description: "신규 거래처 미팅 및 지역 시장 조사를 위한 비즈니스 출장입니다.",
    schedule: [
      { time: "09:00", activity: "호텔 체크인", emoji: "🏨" },
      { time: "10:30", activity: "거래처 미팅", emoji: "🤝" },
      { time: "12:00", activity: "점심 식사", emoji: "🍽️" },
      { time: "14:00", activity: "시장 조사", emoji: "📊" },
      { time: "18:00", activity: "저녁 식사", emoji: "🌆" }
    ]
  },
  attendees: [
    { id: 1, name: "김철수", position: "팀장", isConfirmed: true },
    { id: 2, name: "이영희", position: "대리", isConfirmed: true },
    { id: 3, name: "박민수", position: "사원", isConfirmed: false },
    { id: 4, name: "정수진", position: "과장", isConfirmed: true }
  ],
  chatMessages: [
    {
      id: 1,
      type: "question",
      author: "김철수",
      content: "호텔 예약은 완료되었나요?",
      timestamp: "2024-01-10 14:30",
      replies: [
        {
          id: 1,
          author: "이영희",
          content: "네, 모든 참석자분들의 호텔 예약이 완료되었습니다.",
          timestamp: "2024-01-10 14:45"
        }
      ]
    },
    {
      id: 2,
      type: "question",
      author: "박민수",
      content: "출장 일정 중 개인 시간은 있나요?",
      timestamp: "2024-01-10 15:20",
      replies: [
        {
          id: 1,
          author: "김철수",
          content: "둘째 날 저녁 시간은 자유시간으로 배정되어 있습니다.",
          timestamp: "2024-01-10 15:25"
        }
      ]
    }
  ],
  lastUpdated: new Date().toISOString()
};

export async function GET() {
  try {
    return NextResponse.json(tripData);
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
    
    // 메모리에 데이터 저장
    tripData = {
      ...newData,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('데이터 저장 성공:', tripData);
    
    return NextResponse.json({ 
      success: true, 
      message: '데이터가 성공적으로 저장되었습니다.',
      data: tripData
    });
  } catch (error) {
    console.error('데이터 저장 오류:', error);
    return NextResponse.json(
      { error: '데이터 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
} 