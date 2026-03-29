'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  Eye, ArrowRight, ChevronDown, Play, Activity, Users, Clock, Bell,
  Camera, Cpu, TrendingUp, MapPin, Download, Star, Check, Shield, BarChart3,
} from 'lucide-react';

function Counter({ to, suffix = '', duration = 2200 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function StatPill({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ animation: `float ${3.5 + delay * 2}s ease-in-out ${delay}s infinite` }}
      className="flex items-center gap-2.5 bg-cv-surface/90 backdrop-blur-xl border border-cv-border px-4 py-2.5 rounded-full shadow-xl"
    >
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-cv-sub text-xs font-mono">{label}</span>
      <span className="text-cv-text text-xs font-semibold">{value}</span>
    </motion.div>
  );
}

/* ── Real Video Demo ──────────────────────────────────────── */
function RealVideoDemo() {
  const [active, setActive] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [liveStats, setLiveStats] = useState({ tin: 24, tout: 18, occ: 6, fps: 28.4, queue: 4, alert: false });
  const videoRef = useRef<HTMLVideoElement>(null);

  // When tab changes, reload the video source instead of remounting
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {/* autoplay blocked — user will click play */});
    }
  }, [active]);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveStats(p => {
        const ni = p.tin + (Math.random() > 0.65 ? 1 : 0);
        const no = p.tout + (Math.random() > 0.8 ? 1 : 0);
        const q  = Math.floor(Math.random() * 9);
        return { tin: ni, tout: no, occ: Math.max(0, ni - no), fps: 24 + Math.random() * 9, queue: q, alert: q >= 6 };
      });
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  const scenarios = [
    { label: 'Retail Store', icon: '🏪', video: '/demo-retail.mp4' },
    { label: 'Event Gate',   icon: '🎪', video: '/demo-event.mp4'  },
    { label: 'Corridor',     icon: '🚶', video: '/demo-corridor.mp4' },
  ];

  return (
    <section id="demo" className="py-28 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 bg-cv-card border border-cv-border px-4 py-2 rounded-full mb-6">
          <div className="w-2 h-2 bg-cv-green rounded-full animate-pulse" />
          <span className="text-cv-sub text-xs font-mono tracking-widest">LIVE SYSTEM OUTPUT</span>
        </div>
        <h2 className="font-display text-5xl md:text-6xl text-cv-text mb-5">Real output. Real video.</h2>
        <p className="text-cv-sub text-lg max-w-2xl mx-auto leading-relaxed">
          Actual annotated output from the pipeline — bounding boxes, persistent track IDs,
          zone overlays, counting lines, and live alerts on real CCTV footage.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {scenarios.map((s, i) => (
          <motion.button key={s.label} onClick={() => setActive(i)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              active === i
                ? 'bg-cv-accent text-white shadow-lg shadow-cv-accent/25'
                : 'bg-cv-card border border-cv-border text-cv-sub hover:text-cv-text'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Video — 3 cols */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} className="lg:col-span-3"
        >
          <div className="relative rounded-2xl overflow-hidden border border-cv-border bg-black scanlines">
            {/*
              ════════════════════════════════════════════
              HOW TO ADD YOUR REAL ANNOTATED VIDEO:
              ════════════════════════════════════════════
              1. Run the Colab pipeline on your video
              2. Download the annotated output MP4
              3. Copy/paste it into:
                 crowdvision/frontend/public/demo-retail.mp4
              4. For 3 tabs, add 3 videos:
                 public/demo-retail.mp4
                 public/demo-event.mp4
                 public/demo-corridor.mp4
              If you only have 1 video, use same file for all.
              ════════════════════════════════════════════
            */}
            {/* ── VIDEO PLAYER ──────────────────────────────────────────
                File must be at: crowdvision/frontend/public/demo-event.mp4
                (and demo-retail.mp4, demo-corridor.mp4 for the other tabs)
                ──────────────────────────────────────────────────────── */}
            {!videoError ? (
              <video
                ref={videoRef}
                src={scenarios[active].video}
                loop
                muted
                playsInline
                controls
                className="w-full object-cover"
                style={{ aspectRatio: '16/9', display: 'block' }}
                onError={() => setVideoError(true)}
                onLoadedData={() => setVideoError(false)}
              />
            ) : (
              /* Fallback: video file missing from /public/ */
              <div className="flex flex-col items-center justify-center bg-cv-surface"
                style={{ aspectRatio: '16/9' }}>
                <Camera size={36} className="text-cv-accent/40 mb-3" />
                <p className="text-cv-sub text-sm font-semibold mb-1">Video not found</p>
                <p className="text-cv-sub text-xs text-center px-8 font-mono mb-2">
                  Place your annotated output video at:
                </p>
                <code className="text-cv-accent text-xs bg-cv-card px-3 py-1.5 rounded-lg">
                  frontend/public/{scenarios[active].video.replace('/', '')}
                </code>
              </div>
            )}

            {/* Overlay UI — appears on top of video */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top-left cam info */}
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-cv-green font-mono text-[11px]">
                  CAM-0{active + 1}  {scenarios[active].label.toUpperCase()}
                </p>
                <p className="text-cv-sub font-mono text-[10px]">
                  {new Date().toLocaleTimeString()}  |  FPS: {liveStats.fps.toFixed(1)}
                </p>
              </div>

              {/* Top-right counters */}
              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm rounded-lg px-3 py-2 text-right">
                <p className="text-cv-green font-mono text-[11px]">IN: {liveStats.tin}</p>
                <p className="text-blue-400 font-mono text-[10px]">OUT: {liveStats.tout}</p>
                <p className={`font-mono text-[10px] ${liveStats.occ >= 8 ? 'text-cv-red' : 'text-cv-text'}`}>
                  OCC: {liveStats.occ}
                </p>
              </div>

              {/* REC blink */}
              <div className="absolute top-3 right-32 flex items-center gap-1">
                <div className="w-2 h-2 bg-cv-red rounded-full animate-pulse" />
                <span className="text-cv-red font-mono text-[10px]">REC</span>
              </div>

              {/* Alert banner */}
              <AnimatePresence>
                {liveStats.alert && (
                  <motion.div
                    initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
                    className="absolute top-14 left-1/2 -translate-x-1/2 bg-cv-red/90 text-white font-mono text-[11px] px-4 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    ⚠ QUEUE OVERFLOW — {liveStats.queue} PERSONS
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom zone label */}
              <div className="absolute bottom-3 left-3 bg-purple-900/70 border border-purple-500/40 rounded-lg px-3 py-1.5">
                <p className="text-purple-300 font-mono text-[10px]">[ QUEUE ZONE ] {liveStats.queue} persons</p>
              </div>

              {/* Scan line */}
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cv-accent/30 to-transparent"
                style={{ animation: 'scan 5s linear infinite' }} />
            </div>
          </div>

          {/* Caption + CTA */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-cv-text font-medium text-sm">{scenarios[active].label} — annotated output</p>
              <p className="text-cv-sub text-xs font-mono mt-0.5">
                YOLOv8n detection · ByteTrack IDs · polygon zones · IN/OUT line
              </p>
            </div>
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-cv-accent hover:bg-cv-accentL text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                <Play size={12} fill="currentColor" /> Try with your video
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Live stat cards — 2 cols */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-3"
        >
          {[
            { label: 'TOTAL IN',    value: liveStats.tin,   color: 'text-cv-green',  bg: 'bg-cv-green/10',    border: 'border-cv-green/20'    },
            { label: 'TOTAL OUT',   value: liveStats.tout,  color: 'text-blue-400',  bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
            { label: 'OCCUPANCY',   value: liveStats.occ,   color: liveStats.occ>=8?'text-cv-red':'text-cv-amber', bg: liveStats.occ>=8?'bg-cv-red/10':'bg-cv-amber/10', border: liveStats.occ>=8?'border-cv-red/30':'border-cv-amber/20' },
            { label: 'QUEUE ZONE',  value: liveStats.queue, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20'   },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`flex items-center justify-between ${bg} border ${border} rounded-xl px-4 py-3`}>
              <span className="text-cv-sub text-xs font-mono">{label}</span>
              <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className={`font-display text-2xl ${color}`}>{value}</motion.span>
            </div>
          ))}

          {/* Recent alerts */}
          <div className="bg-cv-card border border-cv-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={13} className="text-cv-amber" />
              <span className="text-cv-sub text-xs font-mono">RECENT ALERTS</span>
            </div>
            {[
              { t: '09:14:22', msg: 'Queue overflow — 7/6', lvl: 'WARN' },
              { t: '09:12:08', msg: 'Rapid influx — 3.1/s', lvl: 'WARN' },
              { t: '09:08:51', msg: 'Overcrowding — 11/10', lvl: 'CRIT' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 mb-2 text-[10px]">
                <span className={`font-mono font-bold ${a.lvl==='CRIT'?'text-cv-red':'text-cv-amber'}`}>{a.lvl}</span>
                <span className="text-cv-sub font-mono">{a.t}</span>
                <span className="text-cv-sub">{a.msg}</span>
              </div>
            ))}
          </div>

          {/* FPS bar */}
          <div className="bg-cv-card border border-cv-border rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-cv-sub text-xs font-mono">INFERENCE FPS</span>
              <span className="text-cv-cyan font-mono text-xs font-bold">{liveStats.fps.toFixed(1)}</span>
            </div>
            <div className="h-1.5 bg-cv-border rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-cv-accent to-cv-cyan rounded-full"
                animate={{ width: `${(liveStats.fps/35)*100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-cv-sub text-[10px] font-mono mt-1.5">T4 GPU · YOLOv8n · 640px input</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Feature grid ─────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: Activity,  title: 'ByteTrack Tracking',   desc: 'Persistent ID per person across frames. No double-counting on occlusion.',          tag: 'CORE',  g: 'from-violet-600 to-indigo-700' },
    { icon: MapPin,    title: 'Polygon Zone Counting', desc: 'Draw any shape zone. Count occupancy inside in real time using pointPolygonTest.',  tag: 'ZONES', g: 'from-rose-600 to-pink-700'     },
    { icon: Clock,     title: 'Dwell Time Per Person', desc: 'Stopwatch per track_id inside queue zone. Average updated live on the HUD.',        tag: 'NEW',   g: 'from-amber-600 to-orange-700'  },
    { icon: Shield,    title: 'Sustained Alert Engine', desc: '30-second timer before email fires. No alert fatigue from momentary spikes.',      tag: 'SMART', g: 'from-emerald-600 to-teal-700'  },
    { icon: Cpu,       title: 'ONNX Edge Export',      desc: '1.3× speedup benchmarked. Runs on RPi 4 (5-8 FPS) and Jetson Nano (20-25 FPS).',  tag: 'EDGE',  g: 'from-cyan-600 to-blue-700'     },
    { icon: BarChart3, title: 'Full Analytics Export',  desc: '6-panel dashboard + density heatmap + 4 CSV files + evaluation metrics chart.',   tag: 'DATA',  g: 'from-purple-600 to-violet-700' },
  ];
  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-cv-card border border-cv-border px-4 py-2 rounded-full mb-5">
          <Star size={12} className="text-cv-amber" />
          <span className="text-cv-sub text-xs font-mono tracking-widest">WHAT MAKES THIS DIFFERENT</span>
        </div>
        <h2 className="font-display text-5xl text-cv-text mb-4">Built beyond the basics</h2>
        <p className="text-cv-sub max-w-xl mx-auto">
          Every feature addresses a specific professor feedback point or a real production requirement.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group glow-border bg-cv-card rounded-2xl p-6 cursor-default relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${f.g} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.g} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cv-sub bg-cv-border px-2 py-1 rounded-md">{f.tag}</span>
            </div>
            <h3 className="font-display text-xl text-cv-text mb-2">{f.title}</h3>
            <p className="text-cv-sub text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Outputs showcase ─────────────────────────────────────── */
function Outputs() {
  const items = [
    { e: '🎬', t: 'Annotated Video (MP4)',  d: 'Bounding boxes, track IDs, zones, HUD, alerts baked in' },
    { e: '🌡️', t: 'Density Heatmap (PNG)', d: 'JET colormap — where people spent the most time'         },
    { e: '📊', t: '6-Panel Dashboard',      d: 'Occupancy · IN/OUT · rate · zones · alerts · hourly'     },
    { e: '⚡', t: 'ONNX Benchmark Chart',   d: 'PT vs ONNX vs RPi4 vs Jetson speed comparison'           },
    { e: '📋', t: '4 CSV Logs',             d: 'frame_stats · events · dwell_times · alerts'             },
    { e: '📦', t: 'One-click ZIP',          d: 'All outputs bundled — download from dashboard'            },
  ];
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-cv-card border border-cv-border px-4 py-2 rounded-full mb-5">
          <Download size={12} className="text-cv-cyan" />
          <span className="text-cv-sub text-xs font-mono tracking-widest">WHAT YOU GET</span>
        </div>
        <h2 className="font-display text-5xl text-cv-text mb-4">Everything. In one ZIP.</h2>
        <p className="text-cv-sub max-w-xl mx-auto">Upload a video, run the pipeline, get six deliverables automatically.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((o, i) => (
          <motion.div key={o.t}
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="glow-border bg-cv-card rounded-xl p-5 flex gap-4 hover:border-cv-accent/40 transition-colors duration-200"
          >
            <span className="text-2xl">{o.e}</span>
            <div>
              <p className="text-cv-text font-semibold text-sm mb-1">{o.t}</p>
              <p className="text-cv-sub text-xs leading-relaxed">{o.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Industries ───────────────────────────────────────────── */
function Industries() {
  const list = [
    { e: '🏪', n: 'Retail', co: 'Shoppers Stop · DMart',
      u: 'Checkout queue, hourly footfall, shelf traffic heatmap',
      s: '₹31,370 vs ₹1,80,000/yr per camera (commercial)' },
    { e: '🎪', n: 'Events', co: 'BookMyShow',
      u: 'Gate entry surge, crowd density, multi-camera combined count',
      s: 'Safety compliance without dedicated staff' },
    { e: '🏥', n: 'Healthcare', co: 'Eka Care',
      u: 'OPD queue dwell time, patient wait estimation, threshold alerts',
      s: 'Average wait shown live — updated every second' },
  ];
  return (
    <section id="industries" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} className="text-center mb-14">
        <h2 className="font-display text-5xl text-cv-text mb-4">Three industries. One pipeline.</h2>
        <p className="text-cv-sub max-w-xl mx-auto">Configured by changing two numbers in CONFIG. Same code, different thresholds.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {list.map((ind, i) => (
          <motion.div key={ind.n}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="glow-border bg-cv-card rounded-2xl p-7"
          >
            <div className="text-4xl mb-4">{ind.e}</div>
            <h3 className="font-display text-2xl text-cv-text mb-1">{ind.n}</h3>
            <p className="text-cv-accent text-xs font-mono mb-4">{ind.co}</p>
            <p className="text-cv-sub text-sm leading-relaxed mb-4">{ind.u}</p>
            <div className="bg-cv-surface border border-cv-border rounded-lg px-3 py-2">
              <p className="text-cv-green text-xs font-mono">{ind.s}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
        <div className="glow-border bg-cv-card rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cv-accent/5 via-transparent to-cv-cyan/5" />
          <div className="relative">
            <h2 className="font-display text-5xl text-cv-text mb-5">Ready to count every person?</h2>
            <p className="text-cv-sub text-lg mb-8 leading-relaxed">
              Upload your video. Get annotated output, heatmap, charts, and CSV — in minutes.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(108,99,255,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="bg-cv-accent hover:bg-cv-accentL text-white font-semibold px-10 py-5 rounded-2xl text-lg inline-flex items-center gap-3 transition-colors"
              >
                <Play size={20} fill="currentColor" /> Start Analysis — Free
              </motion.button>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {['No sign-up required', 'Works on CPU', 'Download everything'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-cv-sub text-sm">
                  <Check size={14} className="text-cv-green" /><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  useEffect(() => scrollY.on('change', v => setScrolled(v > 30)), [scrollY]);

  return (
    <main className="noise mesh-bg min-h-screen overflow-x-hidden">
      {/* Nav */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-cv-surface/90 backdrop-blur-xl border-b border-cv-border' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-cv-accent to-cv-cyan rounded-lg flex items-center justify-center">
            <Eye size={15} className="text-white" />
          </div>
          <span className="font-display text-xl text-cv-text">CrowdVision</span>
          <span className="hidden md:block text-[10px] font-mono text-cv-sub bg-cv-card border border-cv-border px-2 py-0.5 rounded-md ml-1">Team 9</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[['Demo','#demo'],['Features','#features'],['Industries','#industries']].map(([l,h])=>(
            <a key={l} href={h} className="text-cv-sub hover:text-cv-text text-sm transition-colors">{l}</a>
          ))}
        </div>
        <Link href="/dashboard">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="bg-cv-accent hover:bg-cv-accentL text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            Analyse Video <ArrowRight size={14} />
          </motion.button>
        </Link>
      </motion.nav>

      {/* Hero */}
      <motion.section style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-36 pb-10 px-6 flex flex-col items-center text-center min-h-screen justify-center"
      >
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 bg-cv-card border border-cv-border px-4 py-2 rounded-full mb-8">
          <div className="w-2 h-2 bg-cv-green rounded-full animate-pulse" />
          <span className="text-cv-sub text-xs font-mono tracking-widest">YOLOv8n + ByteTrack · COCO Pretrained · Edge-Ready</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl md:text-8xl lg:text-9xl text-cv-text max-w-5xl leading-none mb-6"
        >
          Count every{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-cv-accent via-purple-400 to-cv-cyan bg-clip-text text-transparent">person</span>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.6 }}
              className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-cv-accent to-cv-cyan origin-left" />
          </span>
          <br />in every frame.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-cv-sub text-xl max-w-2xl leading-relaxed mb-12"
        >
          Upload any CCTV video. Get AI-powered people counting, queue analytics,
          dwell time estimation, overcrowding alerts, and a density heatmap.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link href="/dashboard">
            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(108,99,255,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="bg-cv-accent hover:bg-cv-accentL text-white font-semibold px-10 py-5 rounded-2xl text-lg transition-all flex items-center gap-3">
              <Play size={20} fill="currentColor" /> Analyse your video
            </motion.button>
          </Link>
          <a href="#demo">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="glow-border bg-cv-card text-cv-text font-semibold px-10 py-5 rounded-2xl text-lg flex items-center gap-3">
              <Eye size={20} /> See real output
            </motion.button>
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16"
        >
          {[
            { label: 'Detection Accuracy', to: 94, suffix: '%' },
            { label: 'FPS on GPU',          to: 100, suffix: '+' },
            { label: 'Alert Types',         to: 4,   suffix: ''  },
            { label: 'Output Files',        to: 7,   suffix: ''  },
          ].map(({ label, to, suffix }) => (
            <div key={label} className="text-center">
              <p className="font-display text-5xl text-cv-text mb-2">
                <Counter to={to} suffix={suffix} />
              </p>
              <p className="text-cv-sub text-sm font-mono">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Floating pills */}
        <div className="absolute left-8 top-1/2 hidden xl:flex flex-col gap-3">
          <StatPill label="DETECTED"   value="8 persons" color="bg-cv-green" delay={0.8} />
          <StatPill label="AVG WAIT"   value="42.1 sec"  color="bg-cv-amber" delay={1.0} />
        </div>
        <div className="absolute right-8 top-1/2 hidden xl:flex flex-col gap-3">
          <StatPill label="ENTRY RATE" value="2.3/sec"   color="bg-cv-cyan"  delay={0.9} />
          <StatPill label="ALERTS"     value="3 today"   color="bg-cv-red"   delay={1.1} />
        </div>

        <motion.a href="#demo" animate={{ y: [0,8,0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={28} className="text-cv-sub" />
        </motion.a>
      </motion.section>

      <RealVideoDemo />
      <Features />
      <Outputs />
      <Industries />
      <CTA />

      <footer className="border-t border-cv-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cv-accent to-cv-cyan rounded-lg flex items-center justify-center">
              <Eye size={13} className="text-white" />
            </div>
            <span className="font-display text-lg text-cv-text">CrowdVision</span>
          </div>
          <p className="text-cv-sub text-sm text-center">Team 9 · PGDM AI&DS · Adani Institute of Digital Technology Management</p>
          <p className="text-cv-muted text-xs font-mono">YOLOv8 · ByteTrack · FastAPI · Next.js</p>
        </div>
      </footer>
    </main>
  );
}
