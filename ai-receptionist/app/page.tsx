import Link from "next/link";
import { Phone, MessageSquare, Shield, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            P.F. Chang&apos;s AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-8 pt-24 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live &amp; Operational
          </div>
          <h1 className="text-6xl font-bold tracking-tight leading-tight mb-6 text-gray-900 dark:text-white">
            AI-Powered Receptionist for{" "}
            <span className="text-red-600">Scottsdale HQ</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-12 max-w-2xl">
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
              className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all font-semibold text-lg border border-gray-200 dark:border-white/10"
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
              className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            P.F. Chang&apos;s Scottsdale Headquarters AI Receptionist
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-mono">
            +1 (866) 283-8130
          </p>
        </div>
      </div>
    </div>
  );
}
