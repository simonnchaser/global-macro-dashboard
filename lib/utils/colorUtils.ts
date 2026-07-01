/**
 * 변화량에 따른 색상을 반환하는 유틸리티 함수
 */

/**
 * 변화량(change)에 따른 Tailwind CSS 색상 클래스를 반환
 * @param change - 변화량 (양수/음수/0)
 * @returns Tailwind CSS 색상 클래스
 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-slate-400'; // 변화 없음 (0)
}

/**
 * 값에 따른 Tailwind CSS 색상 클래스를 반환
 * @param change - 변화량 (양수/음수/0)
 * @returns Tailwind CSS 색상 클래스
 */
export function getValueColor(change: number): string {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-slate-200'; // 변화 없음 (0)
}
