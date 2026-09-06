'use client';

import StaplerDashboard from '@/components/StaplerDashboard';
import Image from 'next/image';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Main Navbar */}
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white px-4 sm:px-8 py-3.5 shadow-lg sticky top-0 z-40 border-b border-blue-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="relative p-0.5 bg-gradient-to-br from-cyan-400 via-teal-400 to-indigo-500 rounded-2xl shadow-md shadow-cyan-950/50">
              <Image
                src="/hpb-logo.jpg"
                alt="HPB Surgery KKH Logo"
                width={48}
                height={48}
                className="rounded-[14px] object-cover block"
                priority
              />
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                <span>HPB KKH</span>
                <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Surgery Unit
                </span>
              </h1>
              <p className="text-xs text-blue-200/90 font-light">
                หน่วยศัลยศาสตร์ตับ ถุงน้ำดี และตับอ่อน โรงพยาบาลขอนแก่น
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <StaplerDashboard />
      </main>
    </div>
  );
}
