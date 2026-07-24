import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainora AI — The expert intelligence network",
  description: "Verified human expertise for training, evaluating, and improving advanced AI systems.",
};

const services = [
  ["↗", "RLHF & preference data", "Human preferences that sharpen model behavior.", "Domain experts"],
  ["⌘", "Supervised fine-tuning", "Gold-standard examples for specialized models.", "Writers & specialists"],
  ["◈", "Model evaluations", "Rigorous scoring across quality, safety, and accuracy.", "Expert evaluators"],
  ["◎", "Red teaming", "Adversarial testing for critical failure modes.", "Safety researchers"],
  ["✓", "Factuality verification", "Evidence-backed review of complex responses.", "Researchers"],
  ["</>", "Code evaluation", "Production-grade review across languages and stacks.", "Software engineers"],
  ["文", "Multilingual evaluation", "Native-language quality across cultures and regions.", "Linguists"],
  ["◇", "Benchmark development", "Purpose-built tests for your model and domain.", "Research scientists"],
];

const qualityStages = [
  ["01", "Expert qualification", "Identity, credentials, experience, and skills are verified."],
  ["02", "Project assessment", "Specialists complete targeted assessments before accessing work."],
  ["03", "Structured execution", "Rubrics, examples, and task controls improve consistency."],
  ["04", "Multi-stage review", "Peer review, gold tasks, consensus, and senior adjudication."],
  ["05", "Measurable delivery", "Quality reports, lineage, and audit history accompany every dataset."],
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top"><span>t</span> trainora<span className="ai">ai</span></a>
        <nav aria-label="Main navigation">
          <a href="#platform">Platform</a><a href="#solutions">Solutions</a><a href="#network">Expert Network</a>
          <a href="#quality">Quality</a><a href="#security">Security</a><a href="#resources">Resources</a>
        </nav>
        <div className="navActions"><a href="/trainer">Sign in</a><a href="/apply">Apply as an expert</a><a className="button small" href="#contact">Talk to sales</a></div>
      </header>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <p className="eyebrow"><i /> The human intelligence layer for AI</p>
          <h1>The right experts make <em>better AI</em> possible.</h1>
          <p className="lede">Access a trusted global network of specialists who evaluate models, create high-quality training data, test safety, and improve advanced AI systems.</p>
          <div className="actions"><a className="button" href="#contact">Start a project <b>↗</b></a><a className="textLink" href="/apply">Join the expert network <b>→</b></a></div>
          <p className="trust"><span>✓</span> Verified expertise&nbsp;&nbsp; <span>✓</span> Measurable quality&nbsp;&nbsp; <span>✓</span> Enterprise delivery</p>
        </div>
        <NetworkVisual />
      </section>

      <section className="proof">
        <div className="metrics shell">
          {[
            ["75,000+", "Verified experts"], ["120+", "Countries"], ["150+", "Disciplines"],
            ["40+", "Languages"], ["98.4%", "Review agreement"],
          ].map(([n,l]) => <div key={l}><strong>{n}</strong><span>{l}</span></div>)}
        </div>
        <div className="logos shell"><p>Trusted by teams building advanced AI products*</p><div>{["NEXORA","VECTOR LABS","HELIX AI","LUMINOVA","CINDER","NORTHSTAR"].map(x=><b key={x}>{x}</b>)}</div><small>*Illustrative company names</small></div>
      </section>

      <section className="section shell" id="platform">
        <div className="sectionIntro"><p className="eyebrow">Built for AI development</p><h2>Human intelligence,<br/><em>structured to scale.</em></h2><p>From early model training to production evaluation, access the experts, workflows, and quality controls required for dependable human feedback.</p></div>
        <div className="featureStack">
          <Feature n="01" label="Expert data creation" title="Build high-quality training datasets" text="Create fine-tuning examples, preference data, multilingual responses, complex reasoning tasks, and specialized domain content." steps={["Prompt creation","Ideal response","Expert review","Approved"]} />
          <Feature n="02" label="Model evaluation" title="Understand where models succeed—and fail" text="Evaluate performance with configurable rubrics, pairwise comparisons, safety testing, factuality checks, and expert scoring." steps={["Model A · 8.7","Model B · 7.4","Confidence · High","Agreement · 96%"]} />
          <Feature n="03" label="Continuous improvement" title="Create a continuous human feedback loop" text="Monitor quality, identify regressions, generate new evaluation tasks, and deliver reviewed data into your workflow." steps={["Evaluate","Find insight","Retrain","Improve"]} />
        </div>
      </section>

      <section className="network" id="network">
        <div className="shell">
          <p className="eyebrow light">The expert network</p>
          <div className="networkHead"><h2>A global network of professionals.<br/><em>Not generic annotators.</em></h2><p>We recruit, verify, evaluate, and manage specialists with proven education, professional experience, and domain expertise.</p></div>
          <div className="world">
            <div className="mapDots" aria-hidden="true">{Array.from({length: 44},(_,i)=><i key={i} style={{"--x":`${(i*37)%94+3}%`,"--y":`${(i*53)%74+12}%`} as React.CSSProperties}/>)}</div>
            <span className="cluster c1">38,200<br/><small>North America</small></span><span className="cluster c2">17,640<br/><small>Europe</small></span><span className="cluster c3">12,480<br/><small>Asia Pacific</small></span>
          </div>
          <div className="chips">{["Software engineers","Doctors","Legal professionals","Scientists","Mathematicians","Financial analysts","Researchers","Linguists"].map(x=><span key={x}>{x}</span>)}</div>
          <a className="button pale" href="/apply">Explore our expert network →</a>
        </div>
      </section>

      <section className="section shell quality" id="quality">
        <div><p className="eyebrow">Quality system</p><h2>Quality is designed into <em>every task.</em></h2>
          <div className="stages">{qualityStages.map(([n,t,d])=><div className="stage" key={n}><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></div>)}</div>
        </div>
        <div className="scorecard">
          <p>LIVE PROJECT QUALITY</p><strong>98.4<small>%</small></strong><span>Reviewer agreement <i>+1.8%</i></span>
          {[["Task acceptance","96.8%"],["Traceable submissions","100%"],["Revision rate","2.1%"]].map(([a,b])=><div className="bar" key={a}><p><span>{a}</span><b>{b}</b></p><i><em style={{width:b}}/></i></div>)}
          <div className="audit"><span>✓</span><p><b>Every submission is traceable</b><br/>Expert, reviewer, rubric, and decision history</p></div>
        </div>
      </section>

      <section className="section tint" id="solutions"><div className="shell"><p className="eyebrow">Solutions</p><h2>Every stage of <em>AI development.</em></h2><div className="serviceGrid">{services.map(([i,t,d,e])=><article key={t}><span>{i}</span><h3>{t}</h3><p>{d}</p><small>{e}</small><a href="#contact">Learn more →</a></article>)}</div></div></section>

      <section className="section shell workflow">
        <p className="eyebrow">From brief to production</p><h2>One connected workflow.</h2>
        <div className="timeline">{[
          ["01","Define your objective","Set the task, model, expertise, language, volume, and quality bar."],
          ["02","Build your expert team","We identify, qualify, and assign the most relevant specialists."],
          ["03","Create and review","Experts work while reviewers monitor quality and consistency."],
          ["04","Export and integrate","Receive approved datasets through secure APIs and cloud storage."],
        ].map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="section shell platformPreview">
        <div className="sectionIntro compact"><p className="eyebrow">Trainora workspace</p><h2>One platform for workforce, tasks, and quality.</h2></div>
        <div className="browser">
          <div className="browserTop"><i/><i/><i/><span>trainora.ai/workspace</span></div>
          <div className="app">
            <aside><b>t.</b>{["Overview","Projects","Experts","Tasks","Reviews","Datasets"].map((x,i)=><span className={i===0?"active":""} key={x}>{x}</span>)}</aside>
            <div className="dash"><small>PROJECT / FINANCE MODEL EVALUATION</small><h3>Project overview</h3><div className="dashStats"><div><span>Completion</span><b>78%</b></div><div><span>Reviewer agreement</span><b>96.9%</b></div><div><span>Dataset readiness</span><b>On track</b></div></div><div className="chart"><p>Task throughput <span>Last 30 days</span></p><div className="bars">{[34,47,43,58,51,67,73,65,82,78,91,86].map((x,i)=><i key={i} style={{height:`${x}%`}}/>)}</div></div></div>
          </div>
        </div>
      </section>

      <section className="security" id="security"><div className="shell"><div><p className="eyebrow light">Security</p><h2>Built for sensitive<br/><em>AI development.</em></h2><p>Controls for confidential model data, proprietary prompts, and restricted datasets—designed for SOC 2 readiness and enterprise security requirements.</p><a className="button pale" href="#contact">Review our security approach →</a></div><div className="securityGrid">{["Role-based permissions","Project-level isolation","Encryption at rest & in transit","Complete audit trails","Restricted downloads","Enterprise authentication","Identity verification","Configurable retention"].map(x=><span key={x}>✓ {x}</span>)}</div></div></section>

      <section className="section experts shell" id="experts">
        <div className="portraitStack"><div className="portrait p1">LM<small>Medical specialist</small></div><div className="portrait p2">AK<small>Software engineer</small></div><div className="portrait p3">SR<small>Legal expert</small></div></div>
        <div><p className="eyebrow">For experts</p><h2>Turn your expertise into <em>meaningful AI work.</em></h2><p className="lede">Join projects matched to your knowledge, experience, and availability—with clear instructions, feedback, and transparent compensation.</p><div className="benefits">{["Work matched to your expertise","Transparent project rates","Flexible remote opportunities","Reliable payment tracking","Clear review feedback","Specialized projects"].map(x=><span key={x}>✓ {x}</span>)}</div><a className="button" href="/apply">Apply to become an expert →</a></div>
      </section>

      <section className="case shell">
        <div><p className="eyebrow">Illustrative project</p><h2>Improving factual accuracy in a financial research model.</h2><p>A verified team of financial analysts, accountants, and compliance professionals evaluated complex regulatory and market responses.</p></div>
        <div className="caseResults">{[["12,400","Responses evaluated"],["96.9%","Reviewer agreement"],["38%","Fewer unsupported claims"],["6 weeks","Dataset delivery"]].map(([n,l])=><div key={l}><b>{n}</b><span>{l}</span></div>)}</div>
      </section>

      <section className="section shell" id="resources"><p className="eyebrow">Research & insights</p><h2>Building better systems,<br/><em>one insight at a time.</em></h2><div className="resources">{[
        ["Guide · 8 min","Building reliable human evaluation programs"],
        ["Research · 11 min","Designing effective AI response rubrics"],
        ["Perspective · 6 min","How expert feedback improves model performance"],
      ].map(([m,t],i)=><article key={t}><span>0{i+1}</span><small>{m}</small><h3>{t}</h3><a href="#contact">Read insight ↗</a></article>)}</div></section>

      <section className="finalCta" id="contact"><div className="orbits"/><div><p className="eyebrow light">Start a project</p><h2>Build better AI with<br/><em>better human feedback.</em></h2><p>Tell us what you are developing. We’ll help design the expert workforce, workflow, and quality system required to improve it.</p><div className="actions center"><a className="button pale" href="mailto:hello@trainora.ai">Start a project →</a><a className="textLink lightLink" href="mailto:hello@trainora.ai">Schedule a consultation</a></div></div></section>

      <Footer />
    </main>
  );
}

function NetworkVisual() {
  const people = [["AK","Software Engineering","pA"],["LM","Medicine","pB"],["SR","Law","pC"],["JN","Mathematics","pD"],["MT","Finance","pE"],["YL","Linguistics","pF"]];
  return <div className="networkVisual" aria-label="A network of verified experts connected to an AI model">
    <div className="rings r1"/><div className="rings r2"/><div className="core"><i>✦</i><b>AI MODEL</b><span>Evaluation active</span></div>
    {people.map(([n,d,c],i)=><div className={`person ${c}`} key={d}><span>{n}</span><p><b>{d}</b><small>✓ Verified expert</small></p></div>)}
    <div className="qualityPill qp1">● Quality&nbsp; <b>98.4%</b></div><div className="qualityPill qp2">✓ Review complete</div>
  </div>
}

function Feature({n,label,title,text,steps}:{n:string,label:string,title:string,text:string,steps:string[]}) {
  return <article className="feature"><div className="featureText"><span>{n} / {label}</span><h3>{title}</h3><p>{text}</p><a href="#contact">Explore capability →</a></div><div className="miniFlow">{steps.map((s,i)=><div key={s}><i>{i===steps.length-1?"✓":i+1}</i><span>{s}</span>{i<steps.length-1&&<b>→</b>}</div>)}</div></article>
}

function Footer() {
  const cols = {Platform:["Expert Network","Projects","Evaluations","Quality","APIs"],Solutions:["Model Training","Model Evaluation","Red Teaming","Multilingual AI"],Experts:["Apply","Disciplines","How work functions","Payments"],Company:["About","Careers","Security","Contact"],Resources:["Research","Guides","Documentation","Help Center"]};
  return <footer><div className="shell footerTop"><div className="footerBrand"><a className="brand inverse" href="#top"><span>t</span> trainora<span className="ai">ai</span></a><p>The expert intelligence network for advanced AI development.</p></div>{Object.entries(cols).map(([h,links])=><div className="footerCol" key={h}><b>{h}</b>{links.map(x=><a href="#top" key={x}>{x}</a>)}</div>)}</div><div className="shell footerBottom"><span>© 2026 Trainora AI</span><span>Privacy · Terms · Cookies · Accessibility</span><span className="status">● All systems operational</span></div></footer>
}
