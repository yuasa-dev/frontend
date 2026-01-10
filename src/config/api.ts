// 環境変数からAPIのベースURLを取得
// 開発環境ではViteのプロキシ設定で/apiがバックエンドにプロキシされる
// 本番環境ではVITE_API_URLを設定してバックエンドのURLを指定する
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
