'use client';

import { useState, useEffect } from 'react';
import { Lock, Save, Plus, Trash2 } from 'lucide-react';

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

// 기본 데이터
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tripInfo, setTripInfo] = useState(defaultTripInfo);
  const [attendees, setAttendees] = useState(defaultAttendees);
  const [messages, setMessages] = useState(defaultMessages);

  const ADMIN_PASSWORD = "1234"; // 실제 운영에서는 환경변수나 데이터베이스에 저장

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    const savedTripInfo = localStorage.getItem('tripInfo');
    const savedAttendees = localStorage.getItem('attendees');
    const savedMessages = localStorage.getItem('chatMessages');
    
    if (savedTripInfo) {
      setTripInfo(JSON.parse(savedTripInfo));
    }
    
    if (savedAttendees) {
      setAttendees(JSON.parse(savedAttendees));
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
      setPassword('');
    }
  };

  const addAttendee = () => {
    const newAttendee = {
      id: attendees.length + 1,
      name: "",
      position: "",
      confirmed: false
    };
    setAttendees([...attendees, newAttendee]);
  };

  const updateAttendee = (id: number, field: string, value: string | boolean) => {
    setAttendees(attendees.map(attendee => 
      attendee.id === id ? { ...attendee, [field]: value } : attendee
    ));
  };

  const deleteAttendee = (id: number) => {
    setAttendees(attendees.filter(attendee => attendee.id !== id));
  };

  const addScheduleItem = () => {
    const newItem = { time: "", activity: "", emoji: "", color: "" };
    setTripInfo({
      ...tripInfo,
      schedule: [...tripInfo.schedule, newItem]
    });
  };

  const updateScheduleItem = (index: number, field: string, value: string) => {
    const newSchedule = tripInfo.schedule.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setTripInfo({ ...tripInfo, schedule: newSchedule });
  };

  const deleteScheduleItem = (index: number) => {
    const newSchedule = tripInfo.schedule.filter((_, i) => i !== index);
    setTripInfo({ ...tripInfo, schedule: newSchedule });
  };

  // 메시지 삭제 함수
  const deleteMessage = (messageId: number) => {
    const updatedMessages = messages.filter(message => message.id !== messageId);
    setMessages(updatedMessages);
  };

  // 답변 삭제 함수
  const deleteReply = (messageId: number, replyId: number) => {
    const updatedMessages = messages.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          replies: message.replies.filter(reply => reply.id !== replyId)
        };
      }
      return message;
    });
    setMessages(updatedMessages);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('tripInfo', JSON.stringify(tripInfo));
      localStorage.setItem('attendees', JSON.stringify(attendees));
      localStorage.setItem('chatMessages', JSON.stringify(messages));
      
      // 커스텀 이벤트 발생시켜 다른 컴포넌트에 변경 알림
      window.dispatchEvent(new Event('localStorageUpdate'));
      
      alert('저장되었습니다!');
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
            <p className="text-gray-600 mt-2">4자리 비밀번호를 입력하세요</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="비밀번호 (4자리)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              maxLength={4}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              변경사항 저장
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* 기본 정보 수정 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">출장 기본 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출장명</label>
              <input
                type="text"
                value={tripInfo.title}
                onChange={(e) => setTripInfo({...tripInfo, title: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <input
                type="text"
                value={tripInfo.date}
                onChange={(e) => setTripInfo({...tripInfo, date: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">장소</label>
              <input
                type="text"
                value={tripInfo.location}
                onChange={(e) => setTripInfo({...tripInfo, location: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={tripInfo.description}
                onChange={(e) => setTripInfo({...tripInfo, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 일정 관리 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">일정 관리</h2>
            <button
              onClick={addScheduleItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              일정 추가
            </button>
          </div>
          <div className="space-y-3">
            {tripInfo.schedule.map((item, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded-lg items-center">
                <input
                  type="text"
                  placeholder="시간 (예: 09:00)"
                  value={item.time}
                  onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="활동"
                  value={item.activity}
                  onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)}
                  className="col-span-2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="이모지 (예: 🚌)"
                  value={item.emoji || ''}
                  onChange={(e) => updateScheduleItem(index, 'emoji', e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                />
                <select
                  value={item.color || '#3B82F6'}
                  onChange={(e) => updateScheduleItem(index, 'color', e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="#3B82F6">파란색</option>
                  <option value="#10B981">초록색</option>
                  <option value="#8B5CF6">보라색</option>
                  <option value="#F59E0B">주황색</option>
                  <option value="#EF4444">빨간색</option>
                  <option value="#6B7280">회색</option>
                  <option value="#EAB308">노란색</option>
                  <option value="#EC4899">핑크색</option>
                </select>
                <button
                  onClick={() => deleteScheduleItem(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 참석자 관리 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">참석자 관리</h2>
            <button
              onClick={addAttendee}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              참석자 추가
            </button>
          </div>
          <div className="space-y-3">
            {attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="이름"
                  value={attendee.name}
                  onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                  className="w-32 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="직급"
                  value={attendee.position}
                  onChange={(e) => updateAttendee(attendee.id, 'position', e.target.value)}
                  className="w-32 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={attendee.confirmed}
                    onChange={(e) => updateAttendee(attendee.id, 'confirmed', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">참석 확정</span>
                </label>
                <button
                  onClick={() => deleteAttendee(attendee.id)}
                  className="text-red-600 hover:text-red-800 p-2 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 메시지 관리 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">채팅 메시지 관리</h2>
            <div className="text-sm text-gray-600">
              총 {messages.length}개의 메시지
            </div>
          </div>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                {/* 질문 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">{message.author}</span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{message.content}</p>
                  </div>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="text-red-600 hover:text-red-800 p-2 ml-2"
                    title="메시지 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {/* 답변들 */}
                {message.replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    <div className="text-sm font-medium text-gray-600 mb-2">답변 ({message.replies.length}개)</div>
                    {message.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-blue-600 text-sm">{reply.author}</span>
                            <span className="text-xs text-gray-500">{reply.time}</span>
                          </div>
                          <p className="text-gray-700 bg-blue-50 p-2 rounded text-sm">{reply.content}</p>
                        </div>
                        <button
                          onClick={() => deleteReply(message.id, reply.id)}
                          className="text-red-600 hover:text-red-800 p-1 ml-2"
                          title="답변 삭제"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                등록된 메시지가 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 