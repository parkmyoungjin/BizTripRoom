import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { kv } from '@vercel/kv';

const TRAIN_IMAGES_KEY = 'train-images';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string; // 'departure' or 'return'
    const files = formData.getAll('images') as File[];

    if (!type || !files.length) {
      return NextResponse.json({ error: '타입과 이미지 파일이 필요합니다.' }, { status: 400 });
    }

    // 기존 이미지 데이터 가져오기
    const existingData = await kv.get(TRAIN_IMAGES_KEY) as {departure: string[], return: string[]} || { departure: [], return: [] };
    
    // 기존 이미지들 삭제 (Vercel Blob에서)
    const existingUrls = existingData[type as keyof typeof existingData] || [];
    for (const url of existingUrls) {
      try {
        await del(url);
      } catch (error) {
        console.log('기존 이미지 삭제 실패:', error);
      }
    }

    // 새 이미지들 업로드
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = `train-ticket-${type}-${i + 1}-${Date.now()}.jpg`;
      
      const blob = await put(filename, file, {
        access: 'public',
      });
      
      uploadedUrls.push(blob.url);
    }

    // KV에 새 URL 목록 저장
    const updatedData = {
      ...existingData,
      [type as keyof typeof existingData]: uploadedUrls
    };

    await kv.set(TRAIN_IMAGES_KEY, updatedData);

    return NextResponse.json({ 
      success: true, 
      message: `${type === 'departure' ? '출발' : '도착'} 기차표 ${files.length}개가 업로드되었습니다.`,
      urls: uploadedUrls
    });

  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await kv.get(TRAIN_IMAGES_KEY) as {departure: string[], return: string[]} || { departure: [], return: [] };
    return NextResponse.json(data);
  } catch (error) {
    console.error('이미지 목록 조회 오류:', error);
    return NextResponse.json({ error: '이미지 목록 조회에 실패했습니다.' }, { status: 500 });
  }
} 