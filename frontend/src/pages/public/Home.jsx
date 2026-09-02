import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowRight, Bot, ChevronRight, Clock3, FileText, HardDrive, Menu, ShieldCheck, Sparkles, Ticket, UsersRound, X, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const operations = [
  { eyebrow: '01 / INTAKE', title: 'Turn noise into a signal.', metric: '24', metricLabel: 'requests organized today', detail: 'Employees can describe a problem once. The right people get the context, priority, attachments, and next step.', ticket: { id: 'TKT-1042', title: 'VPN access is failing from home', status: 'Needs triage', tone: 'bg-amber-300 text-amber-950' } },
  { eyebrow: '02 / ORCHESTRATE', title: 'Keep every handoff in motion.', metric: '92%', metricLabel: 'SLA compliance this month', detail: 'Managers see workload and risk before the queue slows down. Technicians get a focused workspace—not another inbox.', ticket: { id: 'TKT-1042', title: 'VPN access is failing from home', status: 'Assigned to Taylor', tone: 'bg-[#d8b99a] text-[#4a2c20]' } },
  { eyebrow: '03 / LEARN', title: 'Make every resolution reusable.', metric: '3.4h', metricLabel: 'average time to resolution', detail: 'Practical fixes become trusted knowledge. The next similar request starts with a better answer than the last.', ticket: { id: 'TKT-1042', title: 'VPN access is failing from home', status: 'Resolution confirmed', tone: 'bg-emerald-300 text-emerald-950' } },
];

const capabilities = [
  { icon: Ticket, number: '01', title: 'Incident command', text: 'Requests, ownership, updates, evidence, and resolution in one auditable timeline.' },
  { icon: Clock3, number: '02', title: 'SLA clarity', text: 'Bring deadlines, warning thresholds, and breach risk to the surface before they hurt trust.' },
  { icon: Bot, number: '03', title: 'Useful AI', text: 'Use AI to assist triage and surface real internal knowledge. Decisions stay with your team.' },
  { icon: HardDrive, number: '04', title: 'Asset intelligence', text: 'Connect support work with the laptops, licenses, warranties, repairs, and people behind it.' },
  { icon: FileText, number: '05', title: 'Living knowledge', text: 'Turn repeat fixes into searchable guidance for faster, more consistent support.' },
  { icon: ShieldCheck, number: '06', title: 'Purposeful access', text: 'Dedicated workspaces for employees, technicians, managers, administrators, and asset managers.' },
];

function Home() {
  const root = useRef(null);
  const pointerFrame = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeOperation, setActiveOperation] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scrollScale = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const operation = operations[activeOperation];

  useLayoutEffect(() => {
    if (reduceMotion || !root.current) return undefined;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
      timeline.from('[data-nav]', { opacity: 0, y: -14, duration: 0.5 })
        .from('[data-hero-kicker]', { opacity: 0, y: 18, duration: 0.52 }, '-=0.18')
        .from('[data-hero-word]', { opacity: 0, yPercent: 110, rotate: 2, duration: 0.78, stagger: 0.08 }, '-=0.22')
        .from('[data-hero-copy]', { opacity: 0, y: 16, duration: 0.5 }, '-=0.4')
        .from('[data-hero-panel]', { opacity: 0, y: 30, rotateX: -4, duration: 0.8 }, '-=0.46');
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.from(element, { opacity: 0, y: 32, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 82%', once: true } });
      });
    }, root);
    return () => context.revert();
  }, [reduceMotion]);

  const handlePointerMove = (event) => {
    if (reduceMotion || event.pointerType === 'touch' || !root.current) return;
    cancelAnimationFrame(pointerFrame.current);
    const { clientX, clientY } = event;
    pointerFrame.current = requestAnimationFrame(() => {
      root.current.style.setProperty('--pointer-x', `${clientX}px`);
      root.current.style.setProperty('--pointer-y', `${clientY}px`);
    });
  };

  return (
    <main ref={root} onPointerMove={handlePointerMove} className="min-h-screen overflow-x-hidden bg-[#f8f4ec] text-[#3c281e] selection:bg-[#8c5a3c] selection:text-white">
      <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-[#8c5a3c]" style={{ scaleX: scrollScale }} />
      <header data-nav className="relative z-40 mx-auto max-w-[1440px] px-4 pt-4 sm:px-7">
        <nav className="flex min-h-14 items-center justify-between rounded-2xl border border-[#6b4226]/15 bg-white/75 px-4 shadow-sm backdrop-blur-xl sm:px-5" aria-label="Primary navigation">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-[-0.03em]" aria-label="ServiceDesk Pro home"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6b4226] text-[#fffaf2]"><Ticket className="h-4 w-4" /></span>ServiceDesk<span className="text-[#8c5a3c]">Pro</span></Link>
          <div className="hidden items-center gap-7 text-sm text-[#70594b] md:flex"><a className="transition-colors hover:text-[#6b4226]" href="#platform">Platform</a><a className="transition-colors hover:text-[#6b4226]" href="#workflow">Workflow</a><a className="transition-colors hover:text-[#6b4226]" href="#impact">Impact</a></div>
          <div className="hidden items-center gap-3 md:flex"><Link to="/login" className="px-2 text-sm font-medium text-[#4a362b] transition-colors hover:text-[#8c5a3c]">Sign in</Link><Link to="/login" className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#3c281e] px-4 text-sm font-semibold text-[#fffaf2] transition-transform hover:bg-[#8c5a3c] active:scale-[0.98]">Enter workspace <ArrowRight className="h-4 w-4" /></Link></div>
          <button onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center rounded-lg text-[#3c281e] transition-colors hover:bg-[#eadcca] md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </nav>
        <motion.div initial={false} animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }} className="overflow-hidden md:hidden"><div className="mt-2 space-y-1 rounded-2xl border border-[#6b4226]/15 bg-[#fffaf2]/95 p-3 text-sm shadow-lg"><a onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-[#70594b] hover:bg-[#eadcca]" href="#platform">Platform</a><a onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-[#70594b] hover:bg-[#eadcca]" href="#workflow">Workflow</a><a onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-[#70594b] hover:bg-[#eadcca]" href="#impact">Impact</a><Link className="mt-2 flex rounded-lg bg-[#6b4226] px-3 py-2 font-semibold text-white" to="/login">Enter workspace</Link></div></motion.div>
      </header>

      <section className="relative isolate mx-auto max-w-[1440px] px-4 pb-12 pt-16 sm:px-7 lg:pb-20 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-80" style={{ backgroundImage: 'radial-gradient(500px circle at var(--pointer-x, 72%) var(--pointer-y, 12%), rgba(177,128,88,.20), transparent 48%), radial-gradient(700px circle at 78% 35%, rgba(221,193,158,.42), transparent 55%)' }} />
        <div className="absolute inset-x-4 top-8 -z-10 h-[440px] overflow-hidden rounded-[2rem] border border-[#6b4226]/10 bg-[linear-gradient(110deg,rgba(107,66,38,.055)_1px,transparent_1px),linear-gradient(rgba(107,66,38,.055)_1px,transparent_1px)] bg-[size:42px_42px] sm:inset-x-7" />
        <div className="grid gap-10 lg:grid-cols-[1.04fr_.96fr] lg:items-end"><div className="pt-8 lg:pb-8"><p data-hero-kicker className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8c5a3c]"><span className="h-2 w-2 rounded-full bg-[#8c5a3c] shadow-[0_0_18px_5px_rgba(140,90,60,.18)]" /> Service operations, in sync</p><h1 className="max-w-4xl text-[clamp(3.4rem,8.4vw,8.6rem)] font-semibold leading-[0.84] tracking-[-0.075em]"><span className="block overflow-hidden"><span data-hero-word className="block">MAKE IT</span></span><span className="block overflow-hidden text-[#8c5a3c]"><span data-hero-word className="block">MOVE.</span></span></h1><p data-hero-copy className="mt-8 max-w-xl text-base leading-7 text-[#70594b] sm:text-lg">The operational system for teams who want IT support to feel responsive, accountable, and a little more human.</p><div data-hero-copy className="mt-8 flex flex-wrap gap-3"><Link to="/login" className="inline-flex h-12 items-center gap-3 rounded-lg bg-[#6b4226] px-5 text-sm font-bold text-[#fffaf2] transition-transform hover:bg-[#8c5a3c] active:scale-[0.98]">Explore ServiceDesk Pro <ArrowDownRight className="h-4 w-4" /></Link><a href="#workflow" className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#6b4226]/20 px-5 text-sm font-semibold transition-colors hover:bg-[#eadcca]">See the flow <ChevronRight className="h-4 w-4" /></a></div></div>
          <motion.div data-hero-panel drag={reduceMotion ? false : 'x'} dragConstraints={{ left: -12, right: 12 }} dragElastic={0.08} whileHover={reduceMotion ? {} : { y: -5 }} className="cursor-grab rounded-[1.6rem] border border-[#6b4226]/20 bg-[#eadcca]/85 p-3 shadow-[0_30px_100px_rgba(74,44,32,.18)] active:cursor-grabbing"><div className="rounded-[1.15rem] border border-[#6b4226]/15 bg-[#fffaf2] p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Today’s support pulse</p><p className="mt-1 text-xs text-[#987c69]">Live operational overview</p></div><div className="flex items-center gap-1.5 rounded-full bg-[#d9b88e]/45 px-2.5 py-1 text-[11px] font-semibold text-[#6b4226]"><Zap className="h-3 w-3" /> On track</div></div><div className="mt-5 grid grid-cols-3 gap-2.5">{[['24','Open'],['06','At risk'],['91%','On SLA']].map(([value, label]) => <div key={label} className="rounded-xl border border-[#6b4226]/10 bg-[#f8f1e7] p-3"><p className="text-xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-[11px] text-[#987c69]">{label}</p></div>)}</div><div className="mt-3 rounded-xl border border-[#b9805a]/20 bg-[#f2e2cc] p-3.5"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#8c5a3c] text-white"><Bot className="h-4 w-4" /></span><div><p className="text-sm font-medium">“Chrome freezes when I work.”</p><p className="mt-1 text-xs leading-5 text-[#70594b]">AI suggests a performance issue and 2 verified knowledge articles.</p></div></div></div><div className="mt-3 space-y-2">{['Ticket classified · 09:42', 'Taylor accepted ownership · 09:48', 'SLA safely on track · 10:02'].map((label, index) => <div key={label} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-xs text-[#70594b]"><span className={`h-1.5 w-1.5 rounded-full ${index === 2 ? 'bg-[#8c5a3c]' : 'bg-[#c7ad94]'}`} />{label}<span className="ml-auto text-[10px] text-[#a68a76]">{index === 2 ? 'now' : `${20 - index * 6}m`}</span></div>)}</div></div><p className="px-2 pt-3 text-center text-[10px] uppercase tracking-[0.16em] text-[#987c69]">Drag to interact</p></motion.div>
        </div>
      </section>

      <section id="impact" className="border-y border-[#6b4226]/10 bg-[#eadcca]/45 py-5"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 text-sm text-[#70594b] sm:flex-row sm:items-center sm:justify-between sm:px-7"><span className="flex items-center gap-2"><span className="text-[#8c5a3c]">●</span> Stop losing support work in email, chat, and spreadsheets.</span><span className="flex items-center gap-2"><span className="text-[#8c5a3c]">●</span> Start making every request measurable.</span></div></section>

      <section id="workflow" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-7 lg:py-32"><div data-reveal className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c5a3c]">A system that compounds</p><h2 className="mt-5 max-w-md text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">The queue is only the beginning.</h2><p className="mt-6 max-w-md leading-7 text-[#70594b]">Support becomes strategic when every issue has a visible owner, every deadline has context, and every fix can help the next person.</p><div className="mt-9 flex gap-2">{operations.map((item, index) => <button key={item.eyebrow} onClick={() => setActiveOperation(index)} className={`h-2 rounded-full transition-all ${index === activeOperation ? 'w-10 bg-[#8c5a3c]' : 'w-2 bg-[#6b4226]/20 hover:bg-[#6b4226]/45'}`} aria-label={`Show ${item.eyebrow}`} aria-current={index === activeOperation} />)}</div></div><motion.div layout className="rounded-[1.6rem] border border-[#6b4226]/15 bg-[#eadcca] p-5 sm:p-7"><motion.div key={operation.eyebrow} initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="grid gap-8 sm:grid-cols-[1fr_.9fr]"><div><p className="text-xs font-semibold tracking-[0.17em] text-[#8c5a3c]">{operation.eyebrow}</p><h3 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.045em]">{operation.title}</h3><p className="mt-5 leading-7 text-[#70594b]">{operation.detail}</p><button onClick={() => setActiveOperation((current) => (current + 1) % operations.length)} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#8c5a3c]">Next operation <ArrowRight className="h-4 w-4" /></button></div><div className="rounded-2xl border border-[#6b4226]/15 bg-[#fffaf2]/80 p-4"><p className="text-4xl font-semibold tracking-[-0.06em] text-[#8c5a3c]">{operation.metric}</p><p className="mt-1 text-xs text-[#987c69]">{operation.metricLabel}</p><div className="mt-8 rounded-xl border border-[#6b4226]/10 bg-[#f8f1e7] p-3"><div className="flex items-center justify-between text-[11px] text-[#987c69]"><span>{operation.ticket.id}</span><span className={`rounded px-2 py-1 font-semibold ${operation.ticket.tone}`}>{operation.ticket.status}</span></div><p className="mt-5 text-sm font-medium leading-6">{operation.ticket.title}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#6b4226]/10"><motion.div className="h-full bg-[#8c5a3c]" animate={{ width: `${42 + activeOperation * 27}%` }} transition={{ duration: 0.38 }} /></div></div></div></motion.div></motion.div></div></section>

      <section id="platform" className="border-y border-[#6b4226]/10 bg-[#f1e7d8] py-24 lg:py-32"><div className="mx-auto max-w-[1440px] px-4 sm:px-7"><div data-reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c5a3c]">Designed for the real work</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">One connected platform.<br />No invisible work.</h2></div><p className="max-w-sm leading-7 text-[#70594b]">The pieces that turn a basic helpdesk into a calm, repeatable operating system.</p></div><div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [-webkit-overflow-scrolling:touch] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">{capabilities.map(({ icon: Icon, number, title, text }) => <motion.article key={title} data-reveal whileHover={reduceMotion ? {} : { y: -7 }} whileTap={reduceMotion ? {} : { scale: 0.985 }} transition={{ duration: 0.2 }} className="group min-w-[278px] snap-start rounded-2xl border border-[#6b4226]/12 bg-[#fffaf2] p-6 shadow-sm lg:min-w-0"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eadcca] text-[#8c5a3c] transition-colors group-hover:bg-[#8c5a3c] group-hover:text-white"><Icon className="h-5 w-5" /></span><span className="text-xs font-semibold text-[#b3947d]">{number}</span></div><h3 className="mt-12 text-xl font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#70594b]">{text}</p><span className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#4a362b] transition-colors group-hover:text-[#8c5a3c]">Explore <ArrowRight className="h-4 w-4" /></span></motion.article>)}</div><p className="mt-2 text-xs text-[#987c69] lg:hidden">Swipe to explore the platform.</p></div></section>

      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-7 lg:py-32"><div data-reveal className="relative overflow-hidden rounded-[2rem] border border-[#6b4226]/15 bg-[#d9b88e] px-6 py-14 text-[#3c281e] sm:px-12 sm:py-20"><div aria-hidden="true" className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[48px] border-[#6b4226]/10" /><div aria-hidden="true" className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-[#f7ead8]/60 blur-3xl" /><div className="relative max-w-3xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]"><Sparkles className="h-4 w-4" /> Better support starts here</p><h2 className="mt-6 text-4xl font-semibold leading-[0.92] tracking-[-0.06em] sm:text-6xl">Make every IT request move with purpose.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#5a4031]">Give teams the clarity to respond faster today—and the knowledge to work smarter tomorrow.</p><Link to="/login" className="mt-9 inline-flex h-12 items-center gap-3 rounded-lg bg-[#3c281e] px-5 text-sm font-bold text-[#fffaf2] transition-transform hover:bg-[#6b4226] active:scale-[0.98]">Enter your workspace <ArrowRight className="h-4 w-4" /></Link></div></div></section>
      <footer className="border-t border-[#6b4226]/10 py-7"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 text-xs text-[#987c69] sm:flex-row sm:items-center sm:justify-between sm:px-7"><p>© {new Date().getFullYear()} ServiceDesk Pro</p><p className="flex items-center gap-2"><UsersRound className="h-3.5 w-3.5 text-[#8c5a3c]" /> Built for teams who keep work moving.</p></div></footer>
    </main>
  );
}

export default Home;
