'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Building2 } from 'lucide-react';

interface Attendee {
  name: string;
  department: string;
  position: string;
}

export default function AttendeesPage() {
  const attendees: Attendee[] = [
    { name: "홍석경", department: "중환자실", position: "교수(중환자실장)" },
    { name: "허진원", department: "중환자실", position: "교수(중환자부실장)" },
    { name: "박은희", department: "응급간호팀", position: "간호사(팀장)" },
    { name: "이민정", department: "음압격리중환자실", position: "간호사(UM)" },
    { name: "김지윤", department: "감염관리팀", position: "간호사(팀장)" },
    { name: "김선경", department: "감염관리팀", position: "간호사(UM)" },
    { name: "박지혜", department: "감염관리팀", position: "간호사(팀원)" },
    { name: "정정효", department: "기술팀", position: "시설직(UM)" },
    { name: "김태영", department: "기술팀", position: "시설직(팀원)" },
    { name: "김규희", department: "기술팀", position: "시설직(팀원)" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/"
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm sm:text-base">돌아가기</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">아산병원 참석자</h1>
            <div className="w-16"></div> {/* 중앙 정렬을 위한 여백 */}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
          {/* 제목 섹션 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <Users className="mr-3 h-6 w-6" />
              서울아산병원 참석자 명단
            </h2>
            <p className="mt-2 text-blue-100 text-sm sm:text-base">
              총 {attendees.length}명이 참석 예정입니다
            </p>
          </div>

          {/* 참석자 목록 */}
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-2 text-sm sm:text-base font-semibold text-gray-300">
                      성명
                    </th>
                    <th className="text-left py-3 px-2 text-sm sm:text-base font-semibold text-gray-300">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        소속
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 text-sm sm:text-base font-semibold text-gray-300">
                      기타
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="font-medium text-white text-sm sm:text-base">
                          {attendee.name}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-gray-300 text-sm sm:text-base">
                          {attendee.department}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                          {attendee.position}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="bg-gray-700 p-4 sm:p-6 border-t border-gray-600">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {attendees.filter(a => a.position.includes('교수')).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-300">교수</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {attendees.filter(a => a.position.includes('팀장')).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-300">팀장</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {attendees.filter(a => a.position.includes('UM')).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-300">UM</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {attendees.filter(a => a.position.includes('팀원')).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-300">팀원</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 