export function formatNumber(num: number) {
  return String(num).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
