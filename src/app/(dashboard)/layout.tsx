import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.16),_transparent_30%),linear-gradient(180deg,_#FBFAF4_0%,_#F4EFE2_100%)]">
      <main className="pb-24">{children}</main>
      <Navbar />
    </div>
  )
}
