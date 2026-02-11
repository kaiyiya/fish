/**
 * 鱼类名称映射：英文类别名 -> 中文名称
 */
export const FISH_NAME_MAP: Record<string, string> = {
  black_sea_sprat: '黑海鲱鱼',
  gilt_head_bream: '金头鲷',
  mackerel: '鲭鱼',
  red_mullet: '红鲻鱼',
  red_sea_bream: '红鲷',
  sea_bass: '鲈鱼',
  shrimp: '虾',
  striped_red_mullet: '条纹红鲻鱼',
  trout: '鳟鱼',
  salmon: '三文鱼',
  tuna: '金枪鱼',
  cod: '鳕鱼',
  carp: '鲤鱼',
  tilapia: '罗非鱼',
  catfish: '鲶鱼',
  eel: '鳗鱼',
  sardine: '沙丁鱼',
  anchovy: '凤尾鱼',
  herring: '鲱鱼',
};

/**
 * 将英文鱼类名称转换为中文
 */
export function getFishNameCN(enName: string): string {
  return FISH_NAME_MAP[enName] || enName;
}
