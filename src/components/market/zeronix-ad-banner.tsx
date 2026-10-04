import Link from "next/link";
import { ArrowUpRight, Cpu, HardDrive, ShieldCheck, Zap } from "lucide-react";

export function ZeronixAdBanner() {
  return (
    <Link
      href="/feed?q=Zeronix"
      className="zeronix-ad group relative block overflow-hidden rounded-xl border border-[#2d1b72] bg-[#160d3e] text-white shadow-[0_12px_30px_rgba(40,16,95,0.16)]"
      aria-label="Zeronix UAE technology offers"
    >
      <div className="zeronix-ad-orb zeronix-ad-orb-one" aria-hidden />
      <div className="zeronix-ad-orb zeronix-ad-orb-two" aria-hidden />
      <div className="relative h-[238px] p-4">
        <div className="zeronix-ad-slide zeronix-ad-slide-one">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-200">ZERONIX UAE</span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] text-violet-100">LIVE DEALS</span>
          </div>
          <h3 className="mt-7 max-w-[190px] text-xl leading-tight font-bold">Powering your next build.</h3>
          <p className="mt-2 max-w-[195px] text-[11px] leading-relaxed text-violet-200">Enterprise hardware, trusted supply, delivered across the UAE.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-white">Explore offers <ArrowUpRight className="size-3" /></span>
        </div>

        <div className="zeronix-ad-slide zeronix-ad-slide-two">
          <span className="text-[10px] font-bold tracking-[0.2em] text-violet-200">ZERONIX UAE</span>
          <h3 className="mt-5 text-lg leading-tight font-bold">Built for business.</h3>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              [Cpu, "Compute"],
              [HardDrive, "Storage"],
              [ShieldCheck, "Secure"],
            ].map(([Icon, label]) => (
              <div key={label as string} className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-1 py-2 text-center">
                <Icon className="size-4 text-violet-200" aria-hidden />
                <span className="text-[9px] text-violet-100">{label as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="zeronix-ad-slide zeronix-ad-slide-three">
          <span className="text-[10px] font-bold tracking-[0.2em] text-violet-200">ZERONIX UAE</span>
          <div className="mt-5 flex items-center gap-2"><Zap className="size-5 text-amber-300" fill="currentColor" /><span className="text-2xl font-black">BULK READY</span></div>
          <p className="mt-3 max-w-[205px] text-[11px] leading-relaxed text-violet-200">Source verified IT stock at wholesale quantities with one trusted partner.</p>
          <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#28105f]">Find your stock</span>
        </div>

        <div className="zeronix-ad-slide zeronix-ad-slide-four">
          <span className="text-[10px] font-bold tracking-[0.2em] text-violet-200">ZERONIX UAE</span>
          <h3 className="mt-7 text-xl leading-tight font-bold">Your supply, upgraded.</h3>
          <p className="mt-2 text-[11px] text-violet-200">Available now on SouqFeed.</p>
          <div className="mt-5 flex items-center justify-between"><span className="rounded-full bg-violet-500/30 px-3 py-1.5 text-[10px] font-semibold">Shop Zeronix</span><ArrowUpRight className="size-5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[9px] text-violet-300"><span>ZERONIX.AE · UAE IT SUPPLY</span><span>15s</span></div>
    </Link>
  );
}
