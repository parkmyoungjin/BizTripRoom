'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Save, Plus, Trash2, Train } from 'lucide-react';
import Link from 'next/link';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [trainImages, setTrainImages] = useState<{departure: string[], return: string[]}>({ departure: [], return: [] });

  // 컴포넌트 마운트 시 서버에서 데이터 로드
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 기존 데이터 로드
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          setTripInfo(data.tripInfo || defaultTripInfo);
          setAttendees(data.attendees || defaultAttendees);
          setMessages(data.chatMessages || defaultMessages);
        }

        // 기차표 이미지 목록 로드
        const imagesResponse = await fetch('/api/upload-images');
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setTrainImages(imagesData);
        }
      } catch (error: unknown) {
        console.error('데이터 로드 오류:', error);
        // 오류 시 기본값 사용
      }
    };

    loadAllData();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        alert('비밀번호가 틀렸습니다.');
        setPassword('');
      }
    } catch {
      alert('로그인 중 오류가 발생했습니다.');
      setPassword('');
    } finally {
      setIsLoading(false);
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

  // 이미지 업로드 핸들러
  const handleImageUpload = async (type: 'departure' | 'return', files: FileList) => {
    if (!files.length) return;

    setUploadingImages(true);
    
    try {
      const formData = new FormData();
      formData.append('type', type);
      
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        
        // 이미지 목록 새로고침
        const imagesResponse = await fetch('/api/upload-images');
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setTrainImages(imagesData);
        }
      } else {
        alert('업로드 실패: ' + result.error);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    }
    
    setUploadingImages(false);
  };

  // 저장 처리
  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    setIsSaving(true);
    
    try {
      const dataToSave = {
        tripInfo,
        attendees,
        chatMessages: messages
      };
      
      console.log('저장할 데이터:', dataToSave); // 디버깅용
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const now = new Date().toLocaleString('ko-KR');
          alert(`모든 정보가 성공적으로 저장되었습니다!\n저장 시간: ${now}\n\n메인 페이지에서 변경사항을 확인하세요.`);
          console.log('저장 완료:', now);
        } else {
          alert('저장 중 오류가 발생했습니다: ' + result.error);
        }
      } else {
        alert('서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
    
    setIsSaving(false);
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-700 w-full max-w-md p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <Lock className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">관리자 로그인</h1>
            <p className="text-sm sm:text-base text-gray-300 mt-2">출장 정보를 수정하려면 로그인해주세요.</p>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading || !password.trim()}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 관리자 페이지 메인
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 모바일 친화적 헤더 */}
              <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">관리자 페이지</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  isSaving 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 inline" />
                {isSaving ? '저장 중...' : '저장'}
              </button>
              <Link 
                href="/" 
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
              >
                메인으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 최적화 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* 출장 기본 정보 편집 */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">출장 기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">출장 제목</label>
                <input
                  type="text"
                  value={tripInfo.title}
                  onChange={(e) => setTripInfo({...tripInfo, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">날짜</label>
                <input
                  type="text"
                  value={tripInfo.date}
                  onChange={(e) => setTripInfo({...tripInfo, date: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">장소</label>
                <input
                  type="text"
                  value={tripInfo.location}
                  onChange={(e) => setTripInfo({...tripInfo, location: e.target.value})}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-white mb-2">설명</label>
                <textarea
                  value={tripInfo.description}
                  onChange={(e) => setTripInfo({...tripInfo, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* 일정 편집 */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-0">출장 일정</h2>
              <button
                onClick={addScheduleItem}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2 inline" />
                일정 추가
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {tripInfo.schedule.map((item, index) => (
                <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">시간</label>
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                        placeholder="09:00"
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">활동</label>
                      <input
                        type="text"
                        value={item.activity}
                        onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)}
                        placeholder="활동명"
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-whtie mb-1">이모지</label>
                      <input
                        type="text"
                        value={item.emoji}
                        onChange={(e) => updateScheduleItem(index, 'emoji', e.target.value)}
                        placeholder="🏨"
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => deleteScheduleItem(index)}
                        className="w-full bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 참석자 편집 */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-whtie mb-2 sm:mb-0">참석자 관리</h2>
              <button
                onClick={addAttendee}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2 inline" />
                참석자 추가
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-whtie mb-1">이름</label>
                      <input
                        type="text"
                        value={attendee.name}
                        onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">직급</label>
                      <input
                        type="text"
                        value={attendee.position}
                        onChange={(e) => updateAttendee(attendee.id, 'position', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white mb-1">참석 여부</label>
                      <select
                        value={attendee.confirmed ? 'true' : 'false'}
                        onChange={(e) => updateAttendee(attendee.id, 'confirmed', e.target.value === 'true')}
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="true">참석 확정</option>
                        <option value="false">미확정</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => deleteAttendee(attendee.id)}
                        className="w-full bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 기차표 이미지 관리 섹션 */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <Train className="mr-2 h-5 w-5 text-blue-400" />
              기차표 이미지 관리
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 출발 기차표 업로드 */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold">출발 기차표</h3>
                  <p className="text-sm opacity-90">현재 {trainImages.departure?.length || 0}개</p>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    출발 기차표 이미지들 선택 (여러 개 선택 가능)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload('departure', e.target.files)}
                    disabled={uploadingImages}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-400">
                    JPG, PNG 파일을 여러 개 선택할 수 있습니다. 기존 이미지는 모두 교체됩니다.
                  </p>
                </div>

                {/* 출발 기차표 미리보기 */}
                {trainImages.departure && trainImages.departure.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">현재 출발 기차표들:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {trainImages.departure.map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`출발 기차표 ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-gray-600"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 도착 기차표 업로드 */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold">도착 기차표</h3>
                  <p className="text-sm opacity-90">현재 {trainImages.return?.length || 0}개</p>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    도착 기차표 이미지들 선택 (여러 개 선택 가능)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload('return', e.target.files)}
                    disabled={uploadingImages}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-400">
                    JPG, PNG 파일을 여러 개 선택할 수 있습니다. 기존 이미지는 모두 교체됩니다.
                  </p>
                </div>

                {/* 도착 기차표 미리보기 */}
                {trainImages.return && trainImages.return.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">현재 도착 기차표들:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {trainImages.return.map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`도착 기차표 ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-gray-600"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {uploadingImages && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  이미지 업로드 중...
                </div>
              </div>
            )}
          </div>

          {/* 채팅 메시지 관리 */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">질문 & 답변 관리</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-blue-400">{message.author}</span>
                        <span className="text-xs text-white">{message.time}</span>
                      </div>
                      <p className="text-sm sm:text-base text-white">{message.content}</p>
                    </div>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-red-200 transition-colors self-start"
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      질문 삭제
                    </button>
                  </div>
                  
                  {/* 답변 목록 */}
                  {message.replies.length > 0 && (
                    <div className="mt-3 space-y-2 border-l-2 border-blue-200 pl-3 sm:pl-4">
                      {message.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-800 p-2 sm:p-3 rounded border">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs sm:text-sm text-whtie">{reply.author}</span>
                                <span className="text-xs text-whtie">{reply.time}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-white">{reply.content}</p>
                            </div>
                            <button
                              onClick={() => deleteReply(message.id, reply.id)}
                              className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors self-start"
                            >
                              <Trash2 className="h-3 w-3 inline mr-1" />
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
} 