"use client";
import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, BriefcaseBusiness, CalendarDays, Check, ChevronRight, Clock3, Download, FileCheck2, Flame, FolderKanban, GraduationCap, LayoutDashboard, Library, Moon, Search, ShieldCheck, Sparkles, Sun, Trophy, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { glossary, modules, prompts, simulations, type Module } from "./course-data";
import {ACCOUNT_EMAIL,supabase} from "./supabase";
import type {Session} from "@supabase/supabase-js";
type View = "dashboard" | "course" | "lesson" | "calendar" | "portfolio" | "glossary" | "simulations" | "ai" | "career" | "certificate";
type State = {
    completed: number[];
    scores: Record<number, number>;
    attempts: Record<number, number>;
    points: number;
    start: string;
    target: string;
    days: string[];
    minutes: number;
    portfolio: string[];
};
const initial: State = { completed: [], scores: {}, attempts: {}, points: 0, start: "2026-09-14", target: "2026-12-06", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], minutes: 90, portfolio: [] };
const labels: Record<View, string> = { dashboard: "Dashboard", course: "Course", calendar: "Calendar", portfolio: "Portfolio", glossary: "Glossary", simulations: "Simulations", ai: "AI for Paralegal Work", career: "Career Lab", certificate: "Certificate", lesson: "Lesson" };
export default function Home() { const [view, setView] = useState<View>("dashboard"), [lang, setLang] = useState<"es" | "en">("es"), [dark, setDark] = useState(false), [active, setActive] = useState(1), [state, setState] = useState<State>(initial), [ready, setReady] = useState(false), [query, setQuery] = useState(""),[session,setSession]=useState<Session|null|undefined>(undefined),[cloudReady,setCloudReady]=useState(false);
useEffect(()=>{const accept=async(next:Session|null)=>{if(next&&next.user.email!==ACCOUNT_EMAIL){await supabase.auth.signOut();setSession(null);return}setSession(next)};supabase.auth.getSession().then(({data})=>accept(data.session));const{data}=supabase.auth.onAuthStateChange((_event,next)=>{void accept(next)});return()=>data.subscription.unsubscribe()},[]);
useEffect(()=>{if(!session){setCloudReady(false);return}let cancelled=false;(async()=>{const{data}=await supabase.from("activity_responses").select("response").eq("user_id",session.user.id).eq("activity_id","app_state").maybeSingle();if(cancelled)return;if(data?.response)setState({...initial,...(data.response as State)});setCloudReady(true);await supabase.from("profiles").upsert({user_id:session.user.id,full_name:"Victoria Ressia",preferred_language:lang,timezone:"America/Argentina/Buenos_Aires"})})();return()=>{cancelled=true}},[session]);
useEffect(()=>{if(!session||!cloudReady)return;const timer=setTimeout(()=>{supabase.from("activity_responses").upsert({user_id:session.user.id,activity_id:"app_state",response:state,status:"submitted"}).then(()=>{})},600);return()=>clearTimeout(timer)},[state,session,cloudReady]);
useEffect(() => { try {
    const saved = localStorage.getItem("paralegal-initiation-v2");
    if (saved)
        setState({ ...initial, ...JSON.parse(saved) });
}
catch { } setReady(true); }, []); useEffect(() => { if (ready)
localStorage.setItem("paralegal-initiation-v2", JSON.stringify(state)); }, [state, ready]); useEffect(() => document.documentElement.classList.toggle("dark", dark), [dark]); const goModule = (id: number) => { setActive(id); setView("lesson"); scrollTo({ top: 0, behavior: "smooth" }); }; const results = useMemo(() => query.trim() ? modules.filter(m => (m.title + " " + m.es + " " + m.topics.join(" ")).toLowerCase().includes(query.toLowerCase())) : [], [query]);if(session===undefined)return <div className="auth-loading"><GraduationCap/><span>Preparing your academy…</span></div>;if(!session)return <Login/>;return <SidebarProvider>
<Sidebar collapsible="offcanvas">
<SidebarHeader>
<Brand />
</SidebarHeader>
<SidebarContent>
<SidebarGroup>
<SidebarGroupLabel>{lang === "es" ? "ESPACIO DE ESTUDIO" : "STUDY SPACE"}</SidebarGroupLabel>
<SidebarGroupContent>
<SidebarMenu>
<Nav icon={<LayoutDashboard />} label="Dashboard" active={view === "dashboard"} go={() => setView("dashboard")}/>
<Nav icon={<BookOpen />} label={lang === "es" ? "Programa" : "Course"} active={view === "course" || view === "lesson"} go={() => setView("course")}/>
<Nav icon={<CalendarDays />} label={lang === "es" ? "Calendario" : "Calendar"} active={view === "calendar"} go={() => setView("calendar")}/>
<Nav icon={<FolderKanban />} label="Portfolio" active={view === "portfolio"} go={() => setView("portfolio")}/>
<Nav icon={<Library />} label={lang === "es" ? "Glosario" : "Glossary"} active={view === "glossary"} go={() => setView("glossary")}/>
<Nav icon={<BriefcaseBusiness />} label={lang === "es" ? "Simulaciones" : "Simulations"} active={view === "simulations"} go={() => setView("simulations")}/>
<Nav icon={<Sparkles />} label="AI Lab" active={view === "ai"} go={() => setView("ai")}/>
<Nav icon={<Award />} label={lang === "es" ? "Carrera" : "Career"} active={view === "career"} go={() => setView("career")}/>
<Nav icon={<Award />} label={lang === "es" ? "Certificado" : "Certificate"} active={view === "certificate"} go={() => setView("certificate")}/>
</SidebarMenu>
</SidebarGroupContent>
</SidebarGroup>
<SidebarGroup>
<SidebarGroupLabel>12 WEEKS + 4 ADVANCED</SidebarGroupLabel>
<SidebarGroupContent>
<div className="modules">{modules.map(m => <button key={m.id} onClick={() => goModule(m.id)} className={active === m.id && view === "lesson" ? "active" : ""}>
<span>{String(m.id).padStart(2, "0")}</span>
<b>{m.title}</b>{state.completed.includes(m.id) && <Check />}</button>)}</div>
</SidebarGroupContent>
</SidebarGroup>
</SidebarContent>
<SidebarFooter>
<div className="privacy">
<ShieldCheck />Fictional practice material — no confidential client information.</div>
</SidebarFooter>
</Sidebar>
<SidebarInset>
<Top {...{ view, lang, setLang, dark, setDark, query, setQuery }}/>{query && <SearchResults items={results} go={goModule} clear={() => setQuery("")}/>}<main>{view === "dashboard" && <Dashboard {...{ state, lang }} go={goModule} nav={setView}/>} {view === "course" && <Course {...{ state, lang }} go={goModule}/>} {view === "lesson" && <Lesson module={modules[active - 1]} {...{ state, setState, lang }} go={goModule}/>} {view === "calendar" && <Calendar {...{ state, setState, lang }}/>} {view === "portfolio" && <Portfolio {...{ state, setState, lang }}/>} {view === "glossary" && <Glossary />} {view === "simulations" && <Simulations />} {view === "ai" && <AILab />} {view === "career" && <Career />} {view === "certificate" && <Certificate state={state}/>}</main>
</SidebarInset>
</SidebarProvider>; }
function Login(){const[username,setUsername]=useState(""),[password,setPassword]=useState(""),[register,setRegister]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");const normalized=username.trim().toLowerCase();const submit=async()=>{setMessage("");if(normalized.length<3){setMessage("El usuario debe tener al menos 3 caracteres.");return}if(password.length<8){setMessage("La contraseña debe tener al menos 8 caracteres.");return}setBusy(true);if(register){const{error}=await supabase.auth.signUp({email:ACCOUNT_EMAIL,password,options:{data:{username:normalized}}});setBusy(false);if(error)setMessage("La cuenta ya fue creada. Elegí Ingresar para acceder.");return}const{data,error}=await supabase.auth.signInWithPassword({email:ACCOUNT_EMAIL,password});if(error||data.user?.user_metadata?.username!==normalized){if(data.session)await supabase.auth.signOut();setMessage("Usuario o contraseña incorrectos.")}setBusy(false)};return <main className="login"><section><Brand/><p className="eyebrow">PRIVATE LEGAL ACADEMY</p><h1>Welcome, Victoria.</h1><p>{register?"Elegí un nombre de usuario y una contraseña personal. Solo puede crearse una cuenta.":"Ingresá con el usuario y la contraseña que registraste."}</p><label>Usuario<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Elegí tu usuario" autoComplete="username"/></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 caracteres o más" autoComplete={register?"new-password":"current-password"}/></label><Button size="lg" disabled={busy||normalized.length<3||password.length<8} onClick={submit}>{busy?"Please wait…":register?"Crear cuenta":"Ingresar a la academia"}<ChevronRight/></Button>{message&&<p className="error">{message}</p>}<button className="language-link" onClick={()=>{setRegister(!register);setMessage("")}}>{register?"¿Ya te registraste? Ingresar":"¿Primera vez? Crear cuenta"}</button><div className="login-note"><ShieldCheck/>Your progress syncs securely between devices. Never enter real client information.</div></section></main>}
function Brand() { return <button className="brand">
<span>
<GraduationCap />
</span>
<b>PARALEGAL<small>INITIATION</small>
</b>
</button>; }
function Nav({ icon, label, active, go }: any) { return <SidebarMenuItem>
<SidebarMenuButton isActive={active} onClick={go}>{icon}<span>{label}</span>
</SidebarMenuButton>
</SidebarMenuItem>; }
function Top({ view, lang, setLang, dark, setDark, query, setQuery }: any) { return <header className="top">
<div>
<SidebarTrigger />
<b>Paralegal Initiation</b>
<ChevronRight />
<span>{labels[view as View]}</span>
</div>
<div className="top-actions">
<label className="search">
<Search />
<input aria-label="Search course" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)}/>
<kbd>⌘K</kbd>
</label>
<button className="icon" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</button>
<button className="language" onClick={() => setLang(lang === "es" ? "en" : "es")}>{lang.toUpperCase()} <span>/ {lang === "es" ? "EN" : "ES"}</span>
</button>
<button className="avatar" title="Sign out" onClick={()=>supabase.auth.signOut()}>VR</button>
</div>
</header>; }
function SearchResults({ items, go, clear }: any) { return <div className="search-pop">
<div>
<b>Course search</b>
<button onClick={clear}>
<X />
</button>
</div>{items.length ? items.map((m: Module) => <button key={m.id} onClick={() => { go(m.id); clear(); }}>
<span>{m.id}</span>
<div>
<b>{m.title}</b>
<small>{m.topics.slice(0, 4).join(" · ")}</small>
</div>
<ChevronRight />
</button>) : <p>No matching lessons.</p>}</div>; }
function Dashboard({ state, lang, go, nav }: any) { const pct = Math.round(state.completed.filter((x: number) => x <= 12).length / 12 * 100), avg = average(state.scores), next = modules.find(m => !state.completed.includes(m.id)) || modules[11]; return <div className="shell">
<div className="welcome">
<div>
<p className="eyebrow">{lang === "es" ? "PROGRAMA PROFESIONAL · MIAMI" : "PROFESSIONAL PROGRAM · MIAMI"}</p>
<h1>{lang === "es" ? "Buen día, Victoria" : "Good morning, Victoria"} <i>✦</i>
</h1>
<p>{lang === "es" ? "Tu escritorio de formación jurídica" : "Your legal training desk"}</p>
</div>
<Button size="lg" onClick={() => go(next.id)}>{lang === "es" ? "Continuar" : "Continue"}<ChevronRight />
</Button>
</div>
<div className="dash">
<section className="hero">
<div>
<span className="pill">NEXT · MODULE {String(next.id).padStart(2, "0")}</span>
<h2>{next.title}</h2>
<p>{next.objective}</p>
<label>{pct}% <Progress value={pct}/>
<small>{state.completed.filter((x: number) => x <= 12).length} of 12 core modules</small>
</label>
<Button variant="secondary" onClick={() => go(next.id)}>Open module <ChevronRight />
</Button>
</div>
<div className="scales">§</div>
</section>
<section className="stats">
<Metric icon={<Clock3 />} l="Study plan" v={`${state.minutes}m`} s={`${state.days.length} days / week`}/>
<Metric icon={<Flame />} l="Professional streak" v={Math.min(state.completed.length, 7)} s="Modules in momentum"/>
<Metric icon={<Trophy />} l="Quiz average" v={avg ? `${avg}%` : "—"} s={`${Object.keys(state.scores).length} assessed`}/>
<Metric icon={<Award />} l="Points" v={state.points} s={`${pct}% core progress`}/>
</section>
<Panel title={lang === "es" ? "Ruta recomendada" : "Recommended path"} eyebrow="NEXT STEPS">{modules.slice(Math.max(0, next.id - 1), Math.min(16, next.id + 3)).map(m => <Route key={m.id} done={state.completed.includes(m.id)} title={`${m.id}. ${m.title}`} meta={`${m.minutes} min · ${m.level}`} go={() => go(m.id)}/>)}</Panel>
<Panel title={lang === "es" ? "Herramientas de práctica" : "Practice tools"} eyebrow="WORKSPACE">
<Quick icon={<CalendarDays />} a="Adaptive calendar" b="Recalculate your plan" go={() => nav("calendar")}/>
<Quick icon={<BriefcaseBusiness />} a="Simulations" b="Fictional case files" go={() => nav("simulations")}/>
<Quick icon={<Sparkles />} a="AI for Paralegal Work" b="Safe prompt library" go={() => nav("ai")}/>
<Quick icon={<FolderKanban />} a="Portfolio" b={`${state.portfolio.length} saved exercises`} go={() => nav("portfolio")}/>
</Panel>
<Panel title={pct === 100 && avg >= 70 ? "Certificate unlocked" : "Professional milestone"} eyebrow="COURSE GOAL">
<div className="goal-ring">
<strong>{pct}%</strong>
<Progress value={pct}/>
<p>Complete all 12 core modules and maintain a 70% quiz average.</p>
<Button variant="outline" onClick={() => nav("certificate")}>View certificate status</Button>
</div>
</Panel>
</div>
<Safety />
</div>; }
function Metric({ icon, l, v, s }: any) { return <div className="metric">
<span>{icon}</span>
<div>
<small>{l}</small>
<strong>{v}</strong>
<p>{s}</p>
</div>
</div>; }
function Panel({ title, eyebrow, children }: any) { return <section className="panel">
<p className="eyebrow">{eyebrow}</p>
<h3>{title}</h3>{children}</section>; }
function Route({ done, title, meta, go }: any) { return <button className="route" onClick={go}>
<span className={done ? "rd done" : "rd"}>{done && <Check />}</span>
<div>
<b>{title}</b>
<small>{meta}</small>
</div>
<ChevronRight />
</button>; }
function Quick({ icon, a, b, go }: any) { return <button className="task" onClick={go}>
<span>{icon}</span>
<div>
<b>{a}</b>
<small>{b}</small>
</div>
<ChevronRight />
</button>; }
function Course({ state, lang, go }: any) { return <div className="shell">
<PageHead eyebrow="CURRICULUM" title={lang === "es" ? "12 semanas para el próximo paso" : "12 weeks to your next step"} text={lang === "es" ? "Ruta sugerida, acceso libre. Los módulos 13–16 son avanzados y opcionales." : "Suggested path, open access. Modules 13–16 are optional advanced work."}/>
<div className="course-grid">{modules.map(m => <button className="course-card" key={m.id} onClick={() => go(m.id)}>
<div>
<span className="number">{String(m.id).padStart(2, "0")}</span>{state.completed.includes(m.id) && <span className="complete">
<Check /> Done</span>}</div>
<p>{m.id <= 12 ? `WEEK ${m.id}` : "ADVANCED"}</p>
<h2>{m.title}</h2>
<small>{m.es}</small>
<div className="chips">{m.topics.slice(0, 4).map(x => <span key={x}>{x}</span>)}</div>
<footer>
<span>
<Clock3 />{m.minutes} min</span>
<span>{m.level}</span>
<ChevronRight />
</footer>
</button>)}</div>
<Safety />
</div>; }
function Lesson({ module: m, state, setState, lang, go }: any) {
 const [answers,setAnswers]=useState<Record<number,number>>({}),[finished,setFinished]=useState(false),[activity,setActivity]=useState(""),[practiceResult,setPracticeResult]=useState<ReturnType<typeof assessPractice>|null>(null);
 const quiz=quizFor(m);
 useEffect(()=>{setAnswers({});setFinished(false);setActivity("");setPracticeResult(null)},[m.id]);
 const score=finished?Math.round(quiz.filter((q,i)=>answers[i]===q.answer).length/quiz.length*100):null;
 const finish=()=>{setFinished(true);const n=Math.round(quiz.filter((q,i)=>answers[i]===q.answer).length/quiz.length*100);setState((s:State)=>({...s,scores:{...s.scores,[m.id]:Math.max(s.scores[m.id]||0,n)},attempts:{...s.attempts,[m.id]:(s.attempts[m.id]||0)+1},points:s.points+(n>=70?25:5)}))};
 const toggle=()=>setState((s:State)=>({...s,completed:s.completed.includes(m.id)?s.completed.filter(x=>x!==m.id):[...s.completed,m.id],portfolio:s.completed.includes(m.id)?s.portfolio:[...new Set([...s.portfolio,m.deliverable])],points:s.completed.includes(m.id)?Math.max(0,s.points-50):s.points+50}));
 return <div className="shell lesson">
<header>
<div>
<p className="eyebrow">{m.id <= 12 ? `WEEK ${String(m.id).padStart(2, "0")}` : "ADVANCED MODULE"} · {m.level.toUpperCase()}</p>
<h1>{m.title}</h1>
<p>{m.es}</p>
</div>
<div className="meta">
<span>
<Clock3 />{m.minutes} min</span>
<span>{m.level}</span>
</div>
</header>
<div className="progress">
<Progress value={state.completed.includes(m.id) ? 100 : 35}/>
<small>{state.completed.includes(m.id) ? "Completed" : "In progress"}</small>
</div>
<div className="lesson-grid">
<article>
<Block c="objective" eyebrow="OBJECTIVE">
<h2>{m.objective}</h2>
</Block>
<Block eyebrow="01 · CORE CONCEPT">
<h2>{lang === "es" ? "Concepto central" : "Core concept"}</h2>
<p>{m.explanation}</p>
<Reading module={m}/>
</Block>
<Block eyebrow="02 · INTERACTIVE FLASHCARDS">
<h2>{lang==="es"?"Tocá para descubrir el significado":"Tap to reveal the meaning"}</h2>
<p>{lang==="es"?"Primero intentá definir el término. Después girá la tarjeta y compará.":"Define each term first, then flip the card and compare."}</p>
<div className="flip-grid">{m.topics.slice(0,8).map((term:string)=><FlipCard key={term} term={term} module={m}/>)}</div>
</Block>
<Block c="scenario" eyebrow="LAW FIRM SCENARIO · FICTIONAL">
<h2>{lang === "es" ? "En la práctica" : "At the firm"}</h2>
<p>{m.scenario}</p>
<div className="boundary">
<span>
<Check />Organize · document · escalate</span>
<span>
<X />Do not advise · decide · invent</span>
</div>
</Block>
<Block c="source" eyebrow="OFFICIAL SOURCE · VERIFIED">
<div>
<h2>{m.source}</h2>
<p>Read the official English-language source. Confirm current rules before real work.</p>
</div>
<Button asChild>
<a href={m.sourceUrl} target="_blank" rel="noreferrer">Read the Official Source<ChevronRight />
</a>
</Button>
</Block>
<Block c="video" eyebrow="RECOMMENDED RESOURCE">
<span className="videoicon">
<Video />
</span>
<div>
<h2>{m.video}</h2>
<div className="tags">
<span>{m.videoMeta}</span>
<span>{m.level}</span>
</div>
<p>
<b>Learning purpose:</b> connect the resource to the workflow. <b>Comprehension:</b> identify one safeguard before attorney review.</p>
<VideoPlayer url={m.videoUrl} title={m.video}/>
<Button variant="outline" asChild>
<a href={m.videoUrl} target="_blank" rel="noreferrer">Watch video / open resource <ChevronRight />
</a>
</Button>
</div>
</Block>
<Block eyebrow="PRACTICE · WORK PRODUCT">
<h2>{m.activity}</h2>
<textarea value={activity} onChange={e => setActivity(e.target.value)} placeholder="Write your response using fictional facts only…"/>
<div className="activity-actions">
<span>{activity.trim().split(/\s+/).filter(Boolean).length} words</span>
<Button variant="outline" disabled={activity.trim().split(/\s+/).filter(Boolean).length<12} onClick={()=>setPracticeResult(assessPractice(activity,m))}>Check my work</Button>
</div>{practiceResult&&<PracticeFeedback result={practiceResult} module={m}/>}</Block>
<Block eyebrow="KNOWLEDGE CHECK">
<div className="quizhead">
<h2>Quiz</h2>
<span>70% to pass</span>
</div>
{quiz.map((q,qi)=><div className="question" key={q.question}>
<b><i>{qi+1}</i>{q.question}</b>
<div>{q.options.map((o:string,oi:number)=><button key={o} disabled={finished} onClick={()=>setAnswers({...answers,[qi]:oi})} className={`${answers[qi]===oi?"picked":""} ${finished&&oi===q.answer?"correct":""} ${finished&&answers[qi]===oi&&oi!==q.answer?"wrong":""}`}>{o}{finished&&oi===q.answer&&<Check/>}{finished&&answers[qi]===oi&&oi!==q.answer&&<X/>}</button>)}</div>
{finished&&<p className="explain">{q.why} {qi===0&&<>Review: <a href={m.sourceUrl} target="_blank">official source</a>.</>}</p>}
</div>)}
{!finished ? <Button size="lg" disabled={Object.keys(answers).length<5} onClick={finish}>Finish Quiz</Button> : <div className="result">
<strong className={(score || 0) >= 70 ? "pass" : "fail"}>{score}%<small>{(score || 0) >= 70 ? "PASSED" : "REVIEW"}</small>
</strong>
<div>
<h3>{(score || 0) >= 70 ? "Strong professional judgment." : "Review the source and try again."}</h3>
<p>Best: {state.scores[m.id] || 0}% · Attempts: {state.attempts[m.id] || 0}</p>
<Button variant="outline" onClick={() => { setFinished(false); setAnswers({}); }}>Try Again</Button>
</div>
</div>}</Block>
<div className="finish">
<Button size="lg" variant={state.completed.includes(m.id) ? "outline" : "default"} onClick={toggle}>{state.completed.includes(m.id) ? <Check /> : <FileCheck2 />}{state.completed.includes(m.id) ? "Lesson completed" : "Mark as Completed"}</Button>{m.id < 16 && <button onClick={() => go(m.id + 1)}>Next: {modules[m.id].title} <ChevronRight />
</button>}</div>
</article>
<aside>
<b>IN THIS LESSON</b>{["Objective", "Core concept", "Scenario", "Official source", "Resource", "Practice", "Quiz"].map(x => <a key={x}>{x}</a>)}<div className="tocprivacy">
<ShieldCheck />Fictional practice only. Verify law and obtain attorney review.</div>
</aside>
</div>
</div>; }
function Block({ c = "", eyebrow, children }: any) { return <section className={`block ${c}`}>
<p className="eyebrow">{eyebrow}</p>{children}</section>; }
function Reading({module:m}:{module:Module}){const parts=readingFor(m);return <div className="reading">{parts.map((p,i)=><section key={p.title}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{p.title}</h3><p>{p.body}</p></div></section>)}</div>}
function FlipCard({term,module:m}:{term:string;module:Module}){const[flipped,setFlipped]=useState(false);return <button className={`flip-card ${flipped?"flipped":""}`} onClick={()=>setFlipped(!flipped)} aria-pressed={flipped}><span className="flip-inner"><span className="flip-front"><small>LEGAL TERM</small><b>{term}</b><em>Tap to reveal</em></span><span className="flip-back"><small>MEANING</small><b>{termMeaning(term,m)}</b><em>Tap to return</em></span></span></button>}
function VideoPlayer({url,title}:{url:string;title:string}){const id=url.match(/[?&]v=([\w-]+)/)?.[1];return id?<div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>:<div className="video-fallback"><Video/><span><b>Video opens on the provider’s site</b><small>If the provider restricts your region, use the reading above and the alternative resource button—no VPN is required for the lesson.</small></span></div>}
function PracticeFeedback({result,module:m}:any){return <div className={`practice-feedback ${result.pass?"practice-pass":"practice-review"}`}><header>{result.pass?<Check/>:<X/>}<div><b>{result.pass?"Practice work meets the learning target":"Practice work needs revision"}</b><span>{result.score}% · {result.pass?"Ready for a final attorney-review pass":"Use the corrections below and check again"}</span></div></header><div className="rubric">{result.checks.map((c:any)=><span key={c.label} className={c.ok?"ok":"missing"}>{c.ok?<Check/>:<X/>}{c.label}</span>)}</div>{!result.pass&&<div className="corrections"><b>What to add</b><ul>{result.checks.filter((c:any)=>!c.ok).map((c:any)=><li key={c.label}>{c.fix}</li>)}</ul></div>}<details><summary>Compare with a model response</summary><p>“I organized the fictional facts by source, marked unverified information and listed the missing items. I did not reach a legal conclusion. The next step is to confirm the controlling official source and submit the {m.deliverable} to the supervising attorney for review.”</p></details></div>}
function assessPractice(text:string,m:Module){const t=text.toLowerCase(),words=t.trim().split(/\s+/).filter(Boolean).length;const checks=[{label:"Enough substance",ok:words>=35,fix:"Expand the response to at least 35 words and explain the workflow."},{label:"Source or verification step",ok:/source|fuente|verify|verific|rule|regla|docket|record/.test(t),fix:"Name the source used or state exactly what must be verified."},{label:"Missing facts or uncertainty",ok:/missing|falta|unknown|uncertain|pendiente|confirm|assumption|supuesto/.test(t),fix:"Separate missing facts, assumptions or items that still require confirmation."},{label:"Attorney review or escalation",ok:/attorney|lawyer|abogad|supervis|review|revis|escal/.test(t),fix:"State when and why the work must be reviewed by the supervising attorney."},{label:"Module vocabulary",ok:m.topics.some(x=>t.includes(x.toLowerCase().split(" ")[0])),fix:`Use at least one precise module term, such as ${m.topics.slice(0,3).join(", ")}.`}];const score=Math.round(checks.filter(c=>c.ok).length/checks.length*100);return{checks,score,pass:score>=70}}
function quizFor(m:Module){return[
 {question:m.question,options:m.options,answer:m.answer,why:m.why},
 {question:`Which item belongs most directly to ${m.title}?`,options:[m.topics[0],"A personal legal recommendation","An invented citation"],answer:0,why:`${m.topics[0]} is a core subject of this module.`},
 {question:"When a key fact is missing, what should the paralegal do?",options:["Guess from context","Document the gap and request confirmation","Delete the issue"],answer:1,why:"Missing information must stay visible and be resolved through a documented follow-up."},
 {question:"Before relying on a legal rule or deadline, what is required?",options:["Independent verification in the controlling source","A confident tone","Automatic translation"],answer:0,why:"Rules, dates and deadlines must be checked against the controlling current source."},
 {question:"What is the correct final step for substantive work product?",options:["File it immediately","Send it to the client as legal advice","Submit it for supervising-attorney review"],answer:2,why:"The attorney reviews substantive work and remains professionally responsible."}
]}
function readingFor(m:Module){return[
 {title:"What this area controls",body:`${m.title} is not just vocabulary. It is a working system for deciding where information belongs, which source controls and when the attorney must intervene. In this module you will use ${m.topics.slice(0,4).join(", ")} as practical reference points. The goal is to recognize the task, preserve its context and avoid turning an organizational judgment into legal advice.`},
 {title:"How to work through it",body:`Begin with the assignment and the source. Identify the jurisdiction, matter, document, triggering event and requested deliverable. Separate verified facts from client statements and assumptions. Use a controlled checklist or log so another person can reconstruct your work. If a rule, date, status or instruction is uncertain, label it clearly instead of silently filling the gap.`},
 {title:"What professional judgment looks like",body:`Good paralegal work is accurate, neutral and reviewable. Accuracy means names, dates and references match the source. Neutrality means the work distinguishes facts from conclusions. Reviewability means the file shows what was checked, what is missing and what should happen next. The supervising attorney decides legal strategy, gives advice and approves work that will be filed or sent.`},
 {title:"A repeatable quality-control pass",body:`Before marking this module complete, confirm four things: the correct official source was used; the work product contains no invented facts; confidential or privileged information was handled according to firm procedure; and every unresolved issue has an owner and next step. Then read the result as if you were the attorney receiving it with no additional explanation.`}
]}
function termMeaning(term:string,m:Module){const known:Record<string,string>={"Paralegal":"Professional who performs delegated substantive legal work under attorney supervision.","Attorney supervision":"Direction, control and review by the lawyer responsible for the matter.","Confidentiality":"Duty to protect information relating to the representation.","Privilege":"Legal protection for qualifying confidential attorney–client communications.","Jurisdiction":"A court’s legal authority to hear and decide a matter.","Complaint":"Pleading that states claims and begins a civil action.","Answer":"The defendant’s formal response to a complaint.","Motion":"A request asking the court to issue a ruling.","Docket":"Chronological court record of filings, orders and events.","Discovery":"Formal process for obtaining information before trial.","PACER":"Federal judiciary system for public access to electronic court records.","CM/ECF":"Federal court system used to file and manage electronic case documents.","RFE":"USCIS Request for Evidence seeking additional material.","NOID":"Notice of Intent to Deny explaining a proposed adverse decision."};return known[term]||`${term} is a core ${m.title} concept. Recognize it in the source document, record its status, and confirm its legal effect with the supervising attorney.`}
function Calendar({ state, setState, lang }: any) { const toggleDay = (d: string) => setState((s: State) => ({ ...s, days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d] })); return <div className="shell">
<PageHead eyebrow="ADAPTIVE PLAN" title={lang === "es" ? "Calendario flexible" : "Flexible calendar"} text={lang === "es" ? "Reorganizá el plan sin penalizaciones. Estudiá cualquier módulo cuando quieras." : "Rebalance without penalties. Study any module at any time."}/>
<div className="settings-grid">
<label>Start date<input type="date" value={state.start} onChange={e => setState({ ...state, start: e.target.value })}/>
</label>
<label>Target date<input type="date" value={state.target} onChange={e => setState({ ...state, target: e.target.value })}/>
</label>
<label>Minutes per session<input type="number" min="20" step="10" value={state.minutes} onChange={e => setState({ ...state, minutes: Number(e.target.value) })}/>
</label>
<div>
<b>Available days</b>
<div className="day-pills">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <button key={d} className={state.days.includes(d) ? "on" : ""} onClick={() => toggleDay(d)}>{d}</button>)}</div>
</div>
</div>
<div className="schedule">
<div className="schedule-head">
<b>Expected vs. actual</b>
<span>{state.days.length} sessions/week · {state.minutes} min/session</span>
</div>{modules.slice(0, 12).map((m, i) => { const done = state.completed.includes(m.id); return <div className="week-row" key={m.id}>
<span>W{i + 1}</span>
<div>
<b>{m.title}</b>
<small>{m.minutes} min · {Math.ceil(m.minutes / Math.max(20, state.minutes))} session(s)</small>
</div>
<Progress value={done ? 100 : Math.max(0, 35 - i * 4)}/>
<strong>{done ? "100%" : i === 0 ? "35%" : "Planned"}</strong>
</div>; })}</div>
<Safety />
</div>; }
const portfolioItems = ["Client Intake Form", "Case Summary", "Case Chronology", "Document Checklist", "Legal Research Memo", "Professional Client Email", "Internal Email to Attorney", "Draft Legal Document", "Litigation Case File", "Family Law Case File", "Immigration Case File", "Personal Injury Case File", "Docket Summary", "Deadline Report"];
function Portfolio({ state, setState, lang }: any) { return <div className="shell">
<PageHead eyebrow="FICTIONAL WORK PRODUCT" title="Victoria’s Portfolio" text={lang === "es" ? "Guardá prácticas sin información real de clientes." : "Save practice work without real client information."}/>
<div className="portfolio-grid">{portfolioItems.map((x, i) => { const saved = state.portfolio.includes(x); return <article key={x}>
<span>{String(i + 1).padStart(2, "0")}</span>
<FileCheck2 />
<h3>{x}</h3>
<p>Fictional practice template · attorney review required</p>
<Button variant={saved ? "secondary" : "outline"} onClick={() => setState((s: State) => ({ ...s, portfolio: saved ? s.portfolio.filter(y => y !== x) : [...s.portfolio, x] }))}>{saved ? <>
<Check /> Saved</> : "Add practice item"}</Button>
</article>; })}</div>
<Safety />
</div>; }
function Glossary() { const [q, setQ] = useState(""); const items = glossary.filter(x => x.join(" ").toLowerCase().includes(q.toLowerCase())); return <div className="shell">
<PageHead eyebrow="LEGAL ENGLISH" title="Glossary & flashcards" text="Keep the legal term in English; use the Spanish explanation to confirm meaning."/>
<label className="big-search">
<Search />
<input value={q} onChange={e => setQ(e.target.value)} placeholder="Search terminology…"/>
</label>
<div className="glossary-grid">{items.map(x => <article key={x[0]} tabIndex={0}>
<p>LEGAL TERM</p>
<h3>{x[0]}</h3>
<b>{x[1]}</b>
<span>{x[2]}</span>
</article>)}</div>
<Safety />
</div>; }
function Simulations() { const [open, setOpen] = useState<number | null>(null), [draft, setDraft] = useState(""), [reveal, setReveal] = useState(false); return <div className="shell">
<PageHead eyebrow="CASE LAB" title="Progressive simulations" text="Complete the deliverable before opening the model checklist. Every name and document is fictional."/>
<div className="sim-grid">{simulations.map((s, i) => <article key={s.title} className={open === i ? "open" : ""}>
<p className="eyebrow">{s.area}</p>
<h2>{s.title}</h2>
<p>{s.brief}</p>
<div className="file-list">{s.items.map(x => <span key={x}>
<FileCheck2 />{x}</span>)}</div>
<Button onClick={() => { setOpen(open === i ? null : i); setReveal(false); }}>{open === i ? "Close case" : "Open case file"}</Button>{open === i && <div className="case-work">
<b>Known missing item</b>
<p>{s.missing}</p>
<b>Deliverables</b>
<ul>{s.deliverables.map(x => <li key={x}>{x}</li>)}</ul>
<textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Draft your case analysis…"/>
<Button variant="outline" disabled={!draft.trim()} onClick={() => setReveal(!reveal)}>{reveal ? "Hide model checklist" : "Submit & compare"}</Button>{reveal && <div className="model">
<b>Model checklist</b>
<p>Facts are sourced; missing items are explicit; deadlines name their source; uncertainties are assigned for attorney review.</p>
</div>}</div>}</article>)}</div>
<Safety />
</div>; }
function AILab() { const [selected, setSelected] = useState(prompts[0]), [purpose, setPurpose] = useState(""), [output, setOutput] = useState(""); const build = () => setOutput(`You are assisting with a fictional ${selected.toLowerCase()} exercise. Purpose: ${purpose || "organize the supplied facts"}. Use only the facts provided. Separate verified facts, missing information, assumptions, and questions for the supervising attorney. Do not give legal advice or invent citations. Mark every legal statement for verification against an official source.`); return <div className="shell">
<PageHead eyebrow="AI FOR PARALEGAL WORK" title="Use AI with professional judgment" text="AI can help structure work; it cannot replace confidentiality controls, official-source verification or attorney review."/>
<div className="ai-grid">
<Panel eyebrow="SAFE WORKFLOW" title="Before you prompt">
<ol className="steps">
<li>
<b>Sanitize</b>
<span>Remove names, identifiers, privileged communications and real client facts.</span>
</li>
<li>
<b>Scope</b>
<span>Ask for organization, not legal conclusions.</span>
</li>
<li>
<b>Verify</b>
<span>Check every citation, rule, date and factual claim.</span>
</li>
<li>
<b>Review</b>
<span>Send work product to the supervising attorney.</span>
</li>
</ol>
</Panel>
<Panel eyebrow="RED FLAGS" title="Stop and escalate">
<div className="redflags">{["Real client documents", "Privileged communications", "A request for legal advice", "Unverified citations", "An AI hallucination", "A filing-ready final draft"].map(x => <span key={x}>
<X />{x}</span>)}</div>
</Panel>
<section className="ai-lessons">
<p className="eyebrow">DAILY GPT SKILLS</p>
<h2>What GPT can help you do at the firm</h2>
<div className="ai-use-grid">{[
 ["Turn notes into structure","Paste only fictional or approved sanitized notes. Ask GPT to separate people, dates, events, documents and open questions. Compare every item with the original before using it."],
 ["Build a chronology","Request a table with date, event, source, confidence and missing information. Tell GPT not to infer dates or fill gaps. Sort the verified rows only after checking the sources."],
 ["Improve an email","Provide the audience, purpose and desired tone. Ask for a concise draft that preserves the facts. Confirm names, dates, attachments and attorney instructions before sending."],
 ["Create a document checklist","Describe the fictional matter and list documents already received. Ask GPT to organize them by category and mark—not invent—possible gaps for attorney review."],
 ["Compare two drafts","Ask for a change table: section, old language, new language and practical difference. GPT may miss changes, so use Track Changes or a document comparison tool as the controlling record."],
 ["Prepare attorney questions","Ask GPT to group unresolved issues by urgency, deadline, missing evidence and decision required. Rewrite the questions in your own words before escalation."]
 ].map(([title,body])=><article key={title}><Sparkles/><h3>{title}</h3><p>{body}</p></article>)}</div>
</section>
<section className="prompt-anatomy">
<p className="eyebrow">PROMPT ANATOMY</p><h2>A reliable prompt has five parts</h2>
<div>{[["1","Role","You are helping organize a fictional litigation file."],["2","Task","Create a chronology from the supplied notes."],["3","Constraints","Do not infer facts or provide legal advice."],["4","Format","Return a table with date, event, source and gaps."],["5","Verification","Flag every statement that needs source confirmation."]].map(x=><span key={x[0]}><b>{x[0]}</b><strong>{x[1]}</strong><small>{x[2]}</small></span>)}</div>
</section>
<section className="prompt-builder">
<p className="eyebrow">PROMPT LIBRARY</p>
<h2>Build a safe practice prompt</h2>
<div className="prompt-list">{prompts.map(p => <button className={selected === p ? "selected" : ""} onClick={() => setSelected(p)} key={p}>{p}</button>)}</div>
<label>Purpose<textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Describe the fictional task…"/>
</label>
<Button onClick={build}>
<Sparkles />Generate prompt</Button>{output && <div className="prompt-output">
<p>{output}</p>
<Button variant="outline" onClick={() => navigator.clipboard?.writeText(output)}>Copy prompt</Button>
</div>}</section>
</div>
<Safety />
</div>; }
function Career() { const skills = ["Ethics and confidentiality", "Court systems", "Document recognition", "Legal research", "Neutral writing", "Civil litigation", "Family law", "Docket review", "Technology", "Legal English", "Deadline control", "Professional communication", "Attorney supervision", "Professional judgment"], [checked, setChecked] = useState<string[]>([]); return <div className="shell">
<PageHead eyebrow="CAREER LAB · MIAMI" title="From Legal Assistant to Junior Paralegal" text="Build promotion evidence through reliable work product, judgment and communication—not title alone."/>
<div className="career-grid">
<Panel eyebrow="ROLE CLARITY" title="Legal Assistant vs. Paralegal">
<div className="compare">
<div>
<b>Legal Assistant</b>
<p>Administrative coordination, scheduling, correspondence and matter logistics.</p>
</div>
<div>
<b>Paralegal</b>
<p>Delegated substantive legal work, research, drafting and litigation support under attorney supervision.</p>
</div>
</div>
</Panel>
<Panel eyebrow="MIAMI SKILL SIGNALS" title="What to demonstrate">
<div className="chips large">{["Bilingual communication", "Civil litigation", "Family law", "Legal writing", "E-filing", "Discovery", "Deadlines", "Case management", "Word", "Excel", "Acrobat", "Outlook"].map(x => <span key={x}>{x}</span>)}</div>
</Panel>
<section className="readiness">
<p className="eyebrow">FINAL CHECKLIST</p>
<h2>I am ready to work as a junior paralegal if I can do these things.</h2>{skills.map(x => <label key={x}>
<input type="checkbox" checked={checked.includes(x)} onChange={() => setChecked(checked.includes(x) ? checked.filter(y => y !== x) : [...checked, x])}/>
<span>
<Check />
</span>{x}</label>)}<Progress value={checked.length / skills.length * 100}/>
<p>{checked.length} of {skills.length} demonstrated</p>
</section>
</div>
<Safety />
</div>; }
function Certificate({ state }: any) { const core = state.completed.filter((x: number) => x <= 12).length, avg = average(state.scores), unlocked = core === 12 && avg >= 70; return <div className="shell">
<PageHead eyebrow="COURSE COMPLETION" title="Certificate" text="Unlocked after all 12 core modules and a final quiz average of at least 70%."/>
<section className={`certificate ${unlocked ? "unlocked" : "locked"}`}>
<div className="seal">★<small>LEGAL<br />PAWS</small>
</div>
<p>FACULTAD VIRTUAL DE MICHIGÁN</p>
<h1>Certificate of Completion</h1>
<span>This certifies that</span>
<h2>Victoria Ressia</h2>
<span>has completed</span>
<h3>Paralegal Initiation</h3>
<div className="cert-data">
<b>{core}/12<small>Core modules</small>
</b>
<b>{avg || 0}%<small>Final average</small>
</b>
<b>{new Date().toLocaleDateString()}<small>Date</small>
</b>
</div>
<div className="cats">🐾　🎓🐈　⚖️🐈‍⬛　🐾</div>
<div className="signature">Dean Whiskers<small>Dean of Legal Paws</small>
</div>
<footer>Internal, non-accredited educational recognition.</footer>{!unlocked && <div className="lock-cover">
<Award />
<b>Keep building your record</b>
<span>{12 - core} core module(s) remaining · {avg >= 70 ? "quiz requirement met" : "70% quiz average required"}</span>
</div>}</section>
<Button size="lg" disabled={!unlocked} onClick={() => window.print()}>
<Download />Download / Print PDF</Button>
<Safety />
</div>; }
function PageHead({ eyebrow, title, text }: any) { return <header className="page-head">
<p className="eyebrow">{eyebrow}</p>
<h1>{title}</h1>
<p>{text}</p>
</header>; }
function Safety() { return <footer className="safety">
<ShieldCheck />
<span>
<b>Practice safely.</b> No real client names, confidential documents or privileged communications. Verify AI output and legal sources. Follow supervising-attorney instructions.</span>
</footer>; }
function average(scores: Record<number, number>) { const vals = Object.entries(scores).filter(([k]) => Number(k) <= 12).map(([, v]) => v); return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0; }
