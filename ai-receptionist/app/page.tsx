import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          P.F. Chang's AI Receptionist
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Welcome to the AI-powered receptionist system for P.F. Chang's Scottsdale Headquarters
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Start Chat
          </Link>
          <Link
            href="/admin"
            className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
