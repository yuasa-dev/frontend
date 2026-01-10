import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          競馬予想共有アプリ
        </h1>
        <p className="text-gray-600 mb-8">
          みんなで予想を共有しよう
        </p>
        <Link
          to="/create"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          レースを作成する
        </Link>
      </div>
    </div>
  )
}
