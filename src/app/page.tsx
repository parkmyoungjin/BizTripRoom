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
  Settings,
  Train
} from 'lucide-react';
import TrainTicketModal from '../components/TrainTicketModal';

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
  const [showTrainTicketModal, setShowTrainTicketModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 서버에서 데이터 로드 (효율적인 실시간 업데이트)
  const loadDataFromServer = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      // 마지막 업데이트 시간을 포함하여 변경사항만 확인
      const url = lastUpdated && !forceRefresh 
        ? `/api/data?lastUpdate=${encodeURIComponent(lastUpdated)}&t=${Date.now()}`
        : `/api/data?t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 변경사항이 없으면 업데이트하지 않음
        if (data.noChanges) {
          console.log('변경사항 없음 - 업데이트 건너뜀');
          return;
        }
        
        console.log('서버에서 받은 데이터:', data); // 디버깅용
        
        // 실제 데이터가 있는 경우에만 상태 업데이트
        if (data.tripInfo) {
          setTripInfo(data.tripInfo);
        }
        if (data.attendees) {
          setAttendees(data.attendees);
        }
        if (data.chatMessages) {
          setMessages(data.chatMessages);
        }
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }
        
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

  // 정기적으로 데이터 새로고침 (3초마다로 더 빠르게)
  useEffect(() => {
    const interval = setInterval(() => {
      loadDataFromServer();
    }, 3000); // 5초에서 3초로 단축하여 더 빠른 실시간 업데이트
    
    return () => clearInterval(interval);
  }, [lastUpdated]); // lastUpdated를 의존성에 추가하여 업데이트 시점 최적화

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
      setShowReplyModal(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 모바일 친화적 헤더 */}
              <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">출장 정보</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleForceRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg transition-colors ${
                  isRefreshing 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-900 text-blue-400 hover:bg-blue-800'
                }`}
                title="새로고침"
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link 
                href="/admin" 
                className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                title="관리자"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 친화적 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* 출장 정보 카드 - 모바일 우선 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                  <MapPin className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  {tripInfo.title}
                </h2>
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-blue-100">
                  <div className="flex items-center">
                    <Calendar className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="text-sm sm:text-base">{tripInfo.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="text-sm sm:text-base">{tripInfo.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">{tripInfo.description}</p>
                
                {/* 일정 - 모바일 최적화 */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      출장 일정
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowTrainTicketModal(true)}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <Train className="mr-1 h-4 w-4" />
                        기차표 확인
                      </button>
                      <Link
                        href="/attendees"
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Users className="mr-1 h-4 w-4" />
                        아산병원 참석자
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {tripInfo.schedule.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 sm:p-4 bg-gray-700 rounded-lg sm:rounded-xl border border-gray-600"
                      >
                        <div className="flex-shrink-0 w-16 sm:w-20 text-xs sm:text-sm font-medium text-gray-300">
                          {item.time}
                        </div>
                        <div className="flex-shrink-0 text-lg sm:text-xl mr-2 sm:mr-3">
                          {item.emoji}
                        </div>
                        <div className="flex-1 text-sm sm:text-base text-white font-medium">
                          {item.activity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 참석자 목록 - 모바일 최적화 */}
            <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center">
                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                참석자 현황
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {attendees.map((attendee) => (
                  <div 
                    key={attendee.id} 
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg sm:rounded-xl border border-gray-600"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                        attendee.confirmed ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-sm sm:text-base text-white">{attendee.name}</div>
                        <div className="text-xs sm:text-sm text-gray-300">{attendee.position}</div>
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm px-2 py-1 rounded-full font-medium ${
                      attendee.confirmed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attendee.confirmed ? '참석' : '미확인'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 채팅 영역 - 모바일 최적화 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 h-full flex flex-col">
              <div className="p-4 sm:p-6 border-b border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  질문 & 답변
                </h3>
              </div>
              
              {/* 메시지 목록 - 모바일 스크롤 최적화 */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-64 sm:max-h-96 lg:max-h-none">
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border border-gray-600 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-xs sm:text-sm text-blue-600">{message.author}</span>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                      <p className="text-sm sm:text-base text-white mb-2 sm:mb-3">{message.content}</p>
                      
                      {/* 답변 목록 */}
                      {message.replies.length > 0 && (
                        <div className="space-y-2 border-l-2 border-blue-500 pl-3 sm:pl-4">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="bg-gray-800 p-2 sm:p-3 rounded-md sm:rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                                              <span className="font-medium text-xs sm:text-sm text-gray-300">{reply.author}</span>
                              <span className="text-xs text-gray-500">{reply.time}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-200">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleQuestionClick(message.id)}
                        className="mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        답변하기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 질문 입력 폼 - 모바일 최적화 */}
              <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-700 rounded-b-xl sm:rounded-b-2xl">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-3 py-2 text-sm sm:text-base bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
                  />
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="질문을 입력하세요..."
                    className="w-full px-3 py-2 text-sm sm:text-base bg-gray-600 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-300"
                    rows={3}
                  />
                  <button
                    onClick={addQuestion}
                    disabled={!newQuestion.trim() || !authorName.trim()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    질문하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 모바일 답변 모달 */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md sm:w-full max-h-96 sm:max-h-80">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">답변 작성</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 placeholder-gray-300"
                />
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-500 placeholder-gray-300"
                  rows={3}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={closeReplyModal}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => replyTo && addReply(replyTo)}
                    disabled={!newReply.trim() || !authorName.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    답변하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기차표 모달 */}
      <TrainTicketModal 
        isOpen={showTrainTicketModal}
        onClose={() => setShowTrainTicketModal(false)}
      />

      {/* 상태 표시 */}
      {lastUpdated && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full opacity-75">
          마지막 업데이트: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
