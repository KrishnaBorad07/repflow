import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle, CalendarDays, Camera, TrendingUp, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import RepFlowLogo from '../components/common/RepFlowLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text font-sans">
      {/* Nav */}
      <nav className="h-[72px] px-6 lg:px-14 flex items-center justify-between border-b border-hairline-2">
        <div className="flex items-center">
          <RepFlowLogo height={24} />
        </div>
        <div className="hidden md:flex gap-8 text-sm text-muted">
          <span className="hover:text-text cursor-pointer">Features</span>
          <span className="hover:text-text cursor-pointer">How it works</span>
          <span className="hover:text-text cursor-pointer">Pricing</span>
        </div>
        <div className="flex gap-2.5">
          <Link to="/login"><Button variant="ghost" size="md">Log in</Button></Link>
          <Link to="/signup"><Button variant="primary" size="md">Get started</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-14 py-16 lg:py-[88px] grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-[1280px] mx-auto">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border border-hairline bg-surface text-xs text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Real-time form coaching, now in beta
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-5xl sm:text-6xl lg:text-[84px] font-semibold leading-[0.96] tracking-tighter">
            Train smarter.<br />
            <span className="text-accent">Lift sharper.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg lg:text-[19px] leading-relaxed text-muted max-w-[480px] mt-5">
            RepFlow is your AI training partner. Personalized plans, real-time form feedback through your camera, and a coach in your pocket — all in one.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3 mt-9">
            <Link to="/signup"><Button variant="primary" size="lg">Get started — free <ChevronRight size={16} strokeWidth={2} /></Button></Link>
            <Button variant="secondary" size="lg"><PlayCircle size={16} /> Watch demo</Button>
          </motion.div>
          <div className="flex gap-7 mt-14">
            <HeroStat value="42,118" label="Active members" />
            <HeroStat value="1.2M" label="Workouts logged" />
            <HeroStat value="8.4 / 10" label="Avg form score" />
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* Features */}
      <section className="px-6 lg:px-14 pb-24 max-w-[1280px] mx-auto">
        <div className="kicker">Built for serious training</div>
        <h2 className="text-3xl lg:text-[44px] font-semibold tracking-tight mt-3 mb-12 max-w-[720px]">Four ways RepFlow makes every rep count.</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <FeatureCard n="01" title="Adaptive AI plans" body="Plans rebuild themselves around your goals, equipment, recovery, and what's actually working." Icon={CalendarDays} />
          <FeatureCard n="02" title="Real-time form coaching" body="Pose tracking through your camera flags depth, tempo, and bar path — set by set, rep by rep." Icon={Camera} />
          <FeatureCard n="03" title="Honest progress tracking" body="No vanity metrics. Volume, intensity, form quality, and what's actually improving." Icon={TrendingUp} />
          <FeatureCard n="04" title="A coach you can ask" body="Plateaus, soreness, swap requests — RepFlow's AI coach knows your history and answers in seconds." Icon={Sparkles} />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 lg:px-14 py-24 border-y border-hairline-2 bg-[#0F1115]">
        <div className="max-w-[1280px] mx-auto">
          <div className="kicker">How it works</div>
          <h2 className="text-3xl lg:text-[44px] font-semibold tracking-tight mt-3 mb-12">Up and running in three steps.</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <StepCard n="1" title="Tell us about you" body="A 90-second quiz. Goal, experience, equipment, schedule, anything we should avoid." />
            <StepCard n="2" title="Get your plan" body="An adaptive 8-week plan tailored to your week. Swap anything, regenerate anytime." />
            <StepCard n="3" title="Train with feedback" body="Open camera, follow the demo, lift. RepFlow counts reps and corrects form live." />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-14 py-24 max-w-[1280px] mx-auto">
        <div className="grid sm:grid-cols-3 gap-12 pb-16 border-b border-hairline-2">
          <BigStat value="2,100+" label="Exercises in library" />
          <BigStat value="98.4%" label="Rep detection accuracy" />
          <BigStat value="12 min" label="Avg time to plan" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-12">
          <QuoteCard name="Maya R." meta="Powerlifter · 3 yr" body="The form feedback caught a hip shift I'd had for years. My squat finally feels symmetrical." />
          <QuoteCard name="Devon L." meta="Beginner · 4 mo" body="It's the first app that doesn't make me feel dumb. Plans actually fit my schedule." />
          <QuoteCard name="Priya S." meta="Hybrid athlete" body="Asked the coach why my deadlift stalled. It pointed at sleep and bumped my volume down. Worked." />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-14 pb-24 max-w-[1280px] mx-auto">
        <div className="bg-accent text-accent-ink rounded-3xl p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight leading-none">Start your fitness journey today.</h2>
            <p className="mt-3.5 text-[17px] opacity-75 max-w-[560px]">It's free to start. No credit card. Cancel anytime.</p>
          </div>
          <Link to="/signup">
            <button className="h-14 px-7 rounded-xl bg-background text-accent font-semibold text-base flex items-center gap-2.5 shrink-0">
              Sign up — free <ChevronRight size={18} strokeWidth={2} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-14 py-10 border-t border-hairline-2 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-dim max-w-[1280px] mx-auto">
        <div className="flex items-center gap-3">
          <RepFlowLogo height={18} />
          <span className="text-muted">· Made by Jash</span>
        </div>
        <div className="flex gap-7">
          <span className="hover:text-text cursor-pointer">About</span>
          <span className="hover:text-text cursor-pointer">Privacy</span>
          <span className="hover:text-text cursor-pointer">Terms</span>
          <span className="hover:text-text cursor-pointer">Contact</span>
        </div>
      </footer>
    </div>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <div className="font-mono tabular-nums text-[22px] font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-[400px] lg:h-[620px] hidden lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(200,255,61,0.18),transparent_60%)]" />
      <div className="absolute right-20 top-10 w-[280px] h-[580px] bg-surface rounded-[40px] border border-hairline p-3.5 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
        <div className="w-full h-full rounded-[28px] bg-background overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2418] to-[#0f140e]" />
          <SkeletonOverlay />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <span className="chip bg-black/50 backdrop-blur-lg">Squat</span>
            <div className="bg-accent text-accent-ink px-3 py-1.5 rounded-pill font-bold text-[13px] font-mono">5 / 10</div>
          </div>
          <div className="absolute bottom-[70px] left-4 right-4">
            <div className="bg-background/80 backdrop-blur-xl rounded-[14px] p-3 border border-accent/30">
              <div className="text-[11px] text-accent tracking-widest font-semibold">FORM CUE</div>
              <div className="text-sm font-medium mt-1">Push your knees outward</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-0 top-60 w-[280px] bg-surface border border-hairline rounded-2xl p-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles size={16} className="text-accent" />
          <span className="kicker !text-accent">AI Insight</span>
        </div>
        <div className="text-sm leading-relaxed">Bench press has plateaued for 2 weeks. Try adding pause reps to break through.</div>
        <div className="mt-3 h-px bg-hairline" />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-muted">+ 12% volume this week</span>
          <svg width="80" height="22" viewBox="0 0 80 22"><path d="M2,16 L12,12 L22,14 L32,10 L42,11 L52,7 L62,8 L72,3" fill="none" stroke="#C8FF3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
}

function SkeletonOverlay() {
  const joints = [[140,90],[140,160],[110,200],[170,200],[120,290],[160,290],[110,380],[170,380],[100,470],[180,470]];
  return (
    <svg width="100%" height="100%" viewBox="0 0 280 580" className="absolute inset-0">
      {joints.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#C8FF3D" />)}
      <g stroke="#C8FF3D" strokeWidth="2.5" fill="none">
        <path d="M140,90 L140,160 L110,200 M140,160 L170,200 M140,160 L120,290 M140,160 L160,290 M120,290 L110,380 M160,290 L170,380 M110,380 L100,470 M170,380 L180,470" />
      </g>
      <circle cx="110" cy="380" r="11" fill="none" stroke="#E8C454" strokeWidth="2.5" />
      <circle cx="170" cy="380" r="11" fill="none" stroke="#E8C454" strokeWidth="2.5" />
    </svg>
  );
}

function FeatureCard({ n, title, body, Icon }) {
  return (
    <div className="card p-7 min-h-[200px] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
          <Icon size={20} className="text-accent" />
        </div>
        <span className="font-mono text-xs text-dim">{n}</span>
      </div>
      <div className="mt-auto">
        <div className="text-[22px] font-semibold tracking-tight mb-2">{title}</div>
        <div className="text-sm text-muted leading-relaxed max-w-[440px]">{body}</div>
      </div>
    </div>
  );
}

function StepCard({ n, title, body }) {
  return (
    <div className="card p-7">
      <div className="font-mono text-[56px] font-semibold text-accent leading-none tracking-tighter">{n}</div>
      <div className="text-xl font-semibold mt-[18px] tracking-tight">{title}</div>
      <div className="text-sm text-muted mt-2 leading-relaxed">{body}</div>
    </div>
  );
}

function BigStat({ value, label }) {
  return (
    <div>
      <div className="font-mono tabular-nums text-5xl lg:text-[64px] font-semibold tracking-tighter leading-none">{value}</div>
      <div className="mt-3 text-sm text-muted">{label}</div>
    </div>
  );
}

function QuoteCard({ name, meta, body }) {
  return (
    <div className="card p-6">
      <div className="text-[15px] leading-relaxed">"{body}"</div>
      <div className="mt-[18px] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-elevated border border-hairline" />
        <div>
          <div className="text-[13px] font-semibold">{name}</div>
          <div className="text-[11px] text-dim">{meta}</div>
        </div>
      </div>
    </div>
  );
}
