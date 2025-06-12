'use client';

import React, { useState, useEffect } from 'react';
import { X, Train } from 'lucide-react';

interface TrainTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrainTicketModal: React.FC<TrainTicketModalProps> = ({ isOpen, onClose }) => {
  const [trainImages, setTrainImages] = useState<{departure: string[], return: string[]}>({ departure: [], return: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTrainImages();
    }
  }, [isOpen]);

  const loadTrainImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload-images');
      if (response.ok) {
        const data = await response.json();
        setTrainImages(data);
      }
    } catch (error) {
      console.error('기차표 이미지 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
              <Train className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              기차표 확인
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">기차표를 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* 출발 기차표 섹션 */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center">
                    <Train className="mr-2 h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                    출발 기차표 ({trainImages.departure?.length || 0}매)
                  </h3>
                  <p className="text-sm opacity-90 mt-1">출장지로 가는 기차표</p>
                </div>
                
                {trainImages.departure && trainImages.departure.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {trainImages.departure.map((url, index) => (
                      <div key={`departure-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-center">
                          <img 
                            src={url}
                            alt={`출발 기차표 ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Train className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                    <p>등록된 출발 기차표가 없습니다.</p>
                    <p className="text-sm mt-1">관리자 페이지에서 이미지를 업로드해주세요.</p>
                  </div>
                )}
              </div>

              {/* 도착 기차표 섹션 */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center">
                    <Train className="mr-2 h-4 w-4 sm:h-5 sm:w-5 rotate-[270deg]" />
                    도착 기차표 ({trainImages.return?.length || 0}매)
                  </h3>
                  <p className="text-sm opacity-90 mt-1">복귀하는 기차표</p>
                </div>
                
                {trainImages.return && trainImages.return.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {trainImages.return.map((url, index) => (
                      <div key={`return-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-center">
                          <img 
                            src={url}
                            alt={`도착 기차표 ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Train className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                    <p>등록된 도착 기차표가 없습니다.</p>
                    <p className="text-sm mt-1">관리자 페이지에서 이미지를 업로드해주세요.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 닫기 버튼 */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainTicketModal; 