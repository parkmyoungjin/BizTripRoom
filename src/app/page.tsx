'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  RefreshCw, 
  Settings
} from 'lucide-react';

// 기본 데이터 (localStorage에 데이터가 없을 때 사용)
const defaultTripInfo = {
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
};

const defaultAttendees = [
  { id: 1, name: "김철수", position: "팀장", confirmed: true },
  { id: 2, name: "이영희", position: "대리", confirmed: true },
  { id: 3, name: "박민수", position: "사원", confirmed: false },
  { id: 4, name: "정수진", position: "과장", confirmed: true },
];

// 기본 메시지 데이터
const defaultMessages = [
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
];

export default function Home() {
  const [tripInfo, setTripInfo] = useState(defaultTripInfo);
  const [attendees, setAttendees] = useState(defaultAttendees);
  const [messages, setMessages] = useState(defaultMessages);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [buildTimestamp, setBuildTimestamp] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 클라이언트에서만 타임스탬프 설정 (hydration 오류 방지)
  useEffect(() => {
    setBuildTimestamp(Date.now().toString());
  }, []);

  // 서버에서 데이터 로드 (캐시 방지 개선)
  const loadDataFromServer = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      // 캐시 방지를 위한 타임스탬프 추가
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/data?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('서버에서 받은 데이터:', data); // 디버깅용
        setTripInfo(data.tripInfo || defaultTripInfo);
        setAttendees(data.attendees || defaultAttendees);
        setMessages(data.chatMessages || defaultMessages);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
        
        if (forceRefresh) {
          console.log('강제 새로고침 완료');
        }
      } else {
        console.error('데이터 로드 실패:', response.status);
      }
    } catch (error: unknown) {
      console.error('데이터 로드 오류:', error);
    } finally {
      if (forceRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  // 서버에 데이터 저장
  const saveDataToServer = async (updatedData: {
    tripInfo: typeof defaultTripInfo
    attendees: typeof defaultAttendees
    chatMessages: typeof defaultMessages
  }) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.success;
      }
      return false;
    } catch (error: unknown) {
      console.error('데이터 저장 실패:', error);
      return false;
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDataFromServer();
  }, []);

  // 정기적으로 데이터 새로고침 (5초마다로 단축)
  useEffect(() => {
    const interval = setInterval(() => {
      loadDataFromServer();
    }, 5000); // 10초에서 5초로 단축
    
    return () => clearInterval(interval);
  }, []);

  // 페이지 포커스/가시성 변경 시 강제 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log('페이지 포커스 - 강제 새로고침 실행');
      loadDataFromServer(true); // 포커스 시 강제 새로고침
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('페이지 표시 - 강제 새로고침 실행');
        loadDataFromServer(true); // 가시성 변경 시 강제 새로고침
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 질문 추가
  const addQuestion = async () => {
    if (!newQuestion.trim() || !authorName.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      type: 'question',
      author: authorName,
      content: newQuestion,
      time: new Date().toLocaleString(),
      replies: []
    };
    
    const updatedMessages = [...messages, newMessage];
    const updatedData = {
      tripInfo,
      attendees,
      chatMessages: updatedMessages
    };
    
    const success = await saveDataToServer(updatedData);
    if (success) {
      setMessages(updatedMessages);
      setNewQuestion('');
      setAuthorName('');
    } else {
      alert('질문 저장에 실패했습니다.');
    }
  };

  // 답변 추가
  const addReply = async (messageId: number) => {
    if (!newReply.trim() || !authorName.trim()) return;
    
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          replies: [...msg.replies, {
            id: Date.now(),
            author: authorName,
            content: newReply,
            time: new Date().toLocaleString()
          }]
        };
      }
      return msg;
    });
    
    const updatedData = {
      tripInfo,
      attendees,
      chatMessages: updatedMessages
    };
    
    const success = await saveDataToServer(updatedData);
    if (success) {
      setMessages(updatedMessages);
      setNewReply('');
      setReplyTo(null);
      setAuthorName('');
    } else {
      alert('답변 저장에 실패했습니다.');
    }
  };

  const handleQuestionClick = (questionId: number) => {
    setReplyTo(questionId);
    setShowReplyModal(true);
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyTo(null);
    setNewReply('');
    setAuthorName('');
  };

  // 강제 새로고침 함수
  const handleForceRefresh = async () => {
    await loadDataFromServer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tripInfo.title}</h1>
                <p className="text-gray-600 mt-2">출장 정보 및 소통 공간</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleForceRefresh}
                disabled={isRefreshing}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isRefreshing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
                title="데이터 강제 새로고침"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '새로고침 중...' : '새로고침'}
              </button>
              <Link 
                href="/admin"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                관리자
              </Link>
            </div>
          </div>
          {lastUpdated && (
            <div className="mt-2 text-xs text-gray-500">
              마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 출장 기본 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">출장 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">날짜: {tripInfo.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">장소: {tripInfo.location}</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600">{tripInfo.description}</p>
        </div>

        {/* 일정표 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">일정표</h2>
          
          {/* 가로 타임라인 형태의 일정 */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {(tripInfo.schedule || [])
                .sort((a, b) => {
                  const getMinutes = (time: string) => {
                    const [h, m] = time.split(':').map(Number);
                    return h * 60 + m;
                  };
                  return getMinutes(a.time) - getMinutes(b.time);
                })
                .map((item, index, array) => (
                  <div key={index} className="flex flex-col items-center min-w-[140px]">
                    {/* 시간 */}
                    <div className="text-sm font-bold text-gray-800 mb-2">{item.time}</div>
                    
                    {/* 연결선과 원 */}
                    <div className="flex items-center w-full">
                      {/* 이전 연결선 */}
                      {index > 0 && (
                        <div className="flex-1 h-0.5 bg-gray-300"></div>
                      )}
                      
                      {/* 중앙 원 */}
                      <div 
                        className="w-6 h-6 rounded-full border-4 border-white shadow-md flex-shrink-0 mx-2"
                        style={{ backgroundColor: item.color || '#6B7280' }}
                      ></div>
                      
                      {/* 다음 연결선 */}
                      {index < array.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gray-300"></div>
                      )}
                    </div>
                    
                    {/* 활동 카드 */}
                    <div className="mt-3 text-center">
                      <div className="text-2xl mb-2">{item.emoji || '📅'}</div>
                      <div className="bg-gray-50 rounded-lg p-3 min-h-[80px] flex flex-col justify-center">
                        <div className="font-medium text-gray-800 text-sm leading-tight mb-2">
                          {item.activity}
                        </div>
                        <div 
                          className="px-2 py-1 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: item.color || '#6B7280' }}
                        >
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          {/* 스크롤 힌트 (모바일용) */}
          <div className="text-center text-xs text-gray-500 mt-2 md:hidden">
            ← 좌우로 스크롤하여 전체 일정을 확인하세요 →
          </div>
          
          {/* 간단한 범례 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">📋 일정 요약</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>총 {(tripInfo.schedule || []).length}개 활동</div>
              <div>
                {(tripInfo.schedule || []).length > 0 && (
                  <>
                    {(tripInfo.schedule || [])[0]?.time} ~ {(tripInfo.schedule || [])[(tripInfo.schedule || []).length - 1]?.time}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 참석자 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">참석자 목록</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{attendee.name}</span>
                <span className="text-gray-600">({attendee.position})</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                  attendee.confirmed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {attendee.confirmed ? '참석 확정' : '미확정'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            질문 및 소통
          </h2>
          
          {/* 채팅 메시지 영역 */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* 질문 (왼쪽 말풍선) */}
                <div className="flex justify-start">
                  <div 
                    className="bg-gray-100 rounded-lg p-3 max-w-xs cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleQuestionClick(message.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm">{message.author}</span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                    <div className="text-xs text-blue-600 mt-1">답변하려면 클릭하세요</div>
                  </div>
                </div>
                
                {/* 답변들 (오른쪽 말풍선) */}
                {message.replies.map((reply) => (
                  <div key={reply.id} className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.author}</span>
                        <span className="text-xs text-blue-100">{reply.time}</span>
                      </div>
                      <p>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 새 질문 작성 */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="내용을 입력하세요..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addQuestion}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 답변 모달 */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">답변 작성</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">답변자 이름</label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">답변 내용</label>
                <textarea
                  placeholder="답변을 입력하세요..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => addReply(replyTo || 0)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  답변 추가
                </button>
                <button
                  onClick={closeReplyModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2025 출장 정보 공유 시스템</p>
          {buildTimestamp && (
            <p className="text-xs text-gray-400 mt-2">Build: {buildTimestamp}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
