'use client';

import PageHeader from '@/components/PageHeader';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
}

// 더미 상품 데이터
const products: Product[] = [
  {
    id: 1,
    name: '마인드 케어 가이드북',
    description: '마음 건강을 위한 30일 가이드',
    price: '25,000원',
    image: '📘',
  },
  {
    id: 2,
    name: '명상 음악 앨범',
    description: '깊은 이완을 위한 프리미엄 사운드',
    price: '15,000원',
    image: '🎵',
  },
  {
    id: 3,
    name: '감정 일기장',
    description: '매일의 감정을 기록하는 프리미엄 노트',
    price: '18,000원',
    image: '📔',
  },
  {
    id: 4,
    name: '릴렉스 아로마 세트',
    description: '스트레스 해소를 위한 아로마 오일',
    price: '35,000원',
    image: '🌿',
  },
  {
    id: 5,
    name: '수면 개선 프로그램',
    description: '21일 수면 패턴 개선 코스',
    price: '49,000원',
    image: '🌙',
  },
  {
    id: 6,
    name: '마인드풀니스 카드덱',
    description: '매일 한 장, 마음챙김 연습',
    price: '22,000원',
    image: '🃏',
  },
];

export default function MallPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="마인드피티 몰" />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 배너 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">마인드피티 몰</h2>
            <p className="text-indigo-100">마음 건강을 위한 특별한 상품들</p>
          </div>

          {/* 상품 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-5xl mb-4 text-center">{product.image}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {product.price}
                  </span>
                  <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 안내 문구 */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              * 현재 UI 데모 버전입니다. 실제 결제 기능은 추후 연동 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
