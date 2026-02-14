import Link from "next/link";
import { Phone, MessageSquare, Shield, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">P.F. Chang&apos;s AI</span>
        </div>
        <Link
          href="/admin/login"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Admin Login
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-8 pt-24 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-400 text-sm mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live &amp; Operational
          </div>
          <h1 className="text-6xl font-bold tracking-tight leading-tight mb-6">
            AI-Powered Receptionist for{" "}
            <span className="text-red-500">Scottsdale HQ</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-2xl">
            Handling calls, scheduling appointments, and answering questions 24/7
            with natural voice AI. Every interaction is logged, analyzed, and available
            in real-time.
          </p>
          <div className="flex gap-4">
            <Link
              href="tel:+18662838130"
              className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all font-semibold text-lg shadow-lg shadow-red-600/20"
            >
              Call Now
            </Link>
            <Link
              href="/admin/login"
              className="px-8 py-4 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all font-semibold text-lg border border-white/10"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Phone,
              title: "Voice AI",
              desc: "Natural conversations powered by OpenAI, handling complex inquiries with ease.",
            },
            {
              icon: MessageSquare,
              title: "Smart Routing",
              desc: "Automatically identifies caller intent and routes to the right department.",
            },
            {
              icon: Clock,
              title: "24/7 Availability",
              desc: "Never miss a call. The AI receptionist is always on, always ready.",
            },
            {
              icon: Shield,
              title: "Secure Dashboard",
              desc: "Real-time analytics and call transcripts in a protected admin panel.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phone number bar */}
      <div className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            P.F. Chang&apos;s Scottsdale Headquarters AI Receptionist
          </p>
          <p className="text-gray-500 text-sm font-mono">
            +1 (866) 283-8130
          </p>
        </div>
      </div>
    </div>
  );
}
