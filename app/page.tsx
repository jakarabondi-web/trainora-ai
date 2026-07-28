import type { Metadata } from "next";
import { DashboardIcon, type DashboardIconName } from "./components/DashboardIcon";

export const metadata: Metadata = {
  title: "Trainora AI — The expert intelligence network",
  description: "Verified human expertise for training, evaluating, and improving advanced AI systems.",
};

const services: [DashboardIconName,string,string,string][] = [
  ["feedback", "RLHF & preference data", "Human preferences that sharpen model behavior.", "Domain experts"],
  ["brain", "Supervised fine-tuning", "Gold-standard examples for specialized models.", "Writers & specialists"],
  ["reports", "Model evaluations", "Rigorous scoring across quality, safety, and accuracy.", "Expert evaluators"],
  ["security", "Red teaming", "Adversarial testing for critical failure modes.", "Safety researchers"],
  ["quality", "Factuality verification", "Evidence-backed review of complex responses.", "Researchers"],
  ["code", "Code evaluation", "Production-grade review across languages and stacks.", "Software engineers"],
  ["language", "Multilingual evaluation", "Native-language quality across cultures and regions.", "Linguists"],
  ["target", "Benchmark development", "Purpose-built tests for your model and domain.", "Research scientists"],
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
        <a className="brand" href="#top"><span><DashboardIcon name="brain" size={19}/></span> trainora<span className="ai">ai</span></a>
        <nav aria-label="Main navigation">
          <a href="#platform">Platform</a><a href="#solutions">Solutions</a><a href="#network">Expert Network</a>
          <a href="#quality">Quality</a><a href="#security">Security</a><a href="#resources">Resources</a>
        </nav>
        <div className="navActions"><a href="/login">Sign in</a><a href="/apply">Apply as an expert</a><a className="button small" href="#contact">Talk to sales</a></div>
      </header>

      <section className="hero shell" id="top">
        <TechLiveBackground/>
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

      <LiveWorldNetwork/>

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

      <section className="section tint" id="solutions"><div className="shell"><p className="eyebrow">Solutions</p><h2>Every stage of <em>AI development.</em></h2><div className="serviceGrid">{services.map(([icon,t,d,e])=><article key={t}><span><DashboardIcon name={icon} size={24}/></span><h3>{t}</h3><p>{d}</p><small>{e}</small><a href="#contact">Learn more →</a></article>)}</div></div></section>

      <ScaleWorkflow/>

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

      <FAQSection/>

      <section className="finalCta" id="contact"><div className="orbits"/><div><p className="eyebrow light">Start a project</p><h2>Build better AI with<br/><em>better human feedback.</em></h2><p>Tell us what you are developing. We’ll help design the expert workforce, workflow, and quality system required to improve it.</p><div className="actions center"><a className="button pale" href="mailto:hello@trainora.ai">Start a project →</a><a className="textLink lightLink" href="mailto:hello@trainora.ai">Schedule a consultation</a></div></div></section>

      <Footer />
    </main>
  );
}

function NetworkVisual() {
  const people = [["AK","Software Engineering","pA"],["LM","Medicine","pB"],["SR","Law","pC"],["JN","Mathematics","pD"],["MT","Finance","pE"],["YL","Linguistics","pF"]];
  return <div className="networkVisual" aria-label="A network of verified experts connected to an AI model">
    <div className="rings r1"/><div className="rings r2"/><div className="core"><i><DashboardIcon name="brain" size={30}/></i><b>AI MODEL</b><span>Evaluation active</span></div>
    {people.map(([n,d,c],i)=><div className={`person ${c}`} key={d}><span>{n}</span><p><b>{d}</b><small>✓ Verified expert</small></p></div>)}
    <div className="qualityPill qp1">● Quality&nbsp; <b>98.4%</b></div><div className="qualityPill qp2">✓ Review complete</div>
  </div>
}

function TechLiveBackground(){
  const nodes=Array.from({length:22},(_,index)=>({
    left:`${(index*43)%97}%`,
    top:`${(index*67)%86+6}%`,
    delay:`${-(index%8)*.7}s`,
    size:`${index%4===0?7:4}px`,
  }));
  const streams=[
    [8,18,34,-12],[20,72,31,18],[37,12,29,31],[48,66,36,-24],
    [61,22,28,17],[72,76,24,-29],[79,34,19,23],[12,46,22,35],
  ];
  return <div className="techLiveBackground" aria-hidden="true">
    <div className="techGrid"/>
    {streams.map(([left,top,width,rotation],index)=><i className="dataStream" key={index} style={{left:`${left}%`,top:`${top}%`,width:`${width}%`,transform:`rotate(${rotation}deg)`,animationDelay:`${-index*.55}s`}}/>)}
    {nodes.map((node,index)=><b className="techNode" key={index} style={{left:node.left,top:node.top,width:node.size,height:node.size,animationDelay:node.delay}}/>)}
    <span className="techSignal signalA"><DashboardIcon name="quality" size={15}/> Quality 98.4%</span>
    <span className="techSignal signalB"><DashboardIcon name="globe" size={15}/> 120 countries</span>
    <span className="techSignal signalC"><DashboardIcon name="activity" size={15}/> Live evaluation</span>
  </div>;
}

function LiveWorldNetwork(){
  const hubs=[
    ["North America","14,820","20%","34%","AK"],["Latin America","8,240","31%","62%","MR"],
    ["Europe","17,640","49%","29%","EV"],["Africa","6,320","51%","58%","NO"],
    ["Middle East","5,410","60%","43%","SA"],["South Asia","9,870","68%","56%","RP"],
    ["East Asia","11,490","78%","35%","JL"],["Oceania","4,280","84%","70%","TM"],
  ];
  return <section className="luminousNetwork" id="network">
    <div className="shell luminousNetworkHead">
      <div><p className="eyebrow">Global signal atlas</p><h2>A global network of<br/><em>exceptional experts.</em></h2></div>
      <p>Verified professionals across every major region—matched by discipline, language, quality, availability, and security requirements.</p>
    </div>
    <div className="shell luminousMapShell">
      <div className="liveNetworkStats">
        <span><DashboardIcon name="users" size={18}/><b>75,000+</b><small>Verified experts</small></span>
        <span><DashboardIcon name="globe" size={18}/><b>120+</b><small>Countries</small></span>
        <span><DashboardIcon name="quality" size={18}/><b>98.4%</b><small>Review agreement</small></span>
        <em><i/> Live network</em>
      </div>
      <div className="luminousWorld" aria-label="Live map of Trainora experts around the world">
        <img src="/trainora-world-grid-2k.png" alt="Complete dotted world map showing Trainora's global expert network"/>
        <svg className="worldRoutes" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
          <path d="M215 180 Q360 45 490 165"/><path d="M225 190 Q405 285 520 285"/>
          <path d="M500 170 Q630 70 785 180"/><path d="M520 285 Q690 360 845 335"/>
          <path d="M585 220 Q690 125 785 180"/><path d="M675 280 Q760 225 845 335"/>
        </svg>
        {hubs.map(([region,count,left,top,initials],index)=><div className={`worldHub hub${index+1}`} key={region} style={{left,top,animationDelay:`${-index*.55}s`}}>
          <i><b/></i><span><strong>{initials}</strong><p><b>{region}</b><small>{count} experts · verified</small></p></span>
        </div>)}
        <div className="worldSignal signalQuality"><DashboardIcon name="quality" size={15}/><span><b>96.8%</b> live quality</span></div>
        <div className="worldSignal signalCoverage"><DashboardIcon name="activity" size={15}/><span><b>24/7</b> coverage</span></div>
      </div>
      <div className="networkDomainRow"><span>Explore by expertise</span>{["Software engineering","Medicine","Law","Finance","Mathematics","Linguistics"].map((domain,index)=><a href="/apply" key={domain} className={index===0?"active":""}>{domain}</a>)}<a href="/apply">All disciplines →</a></div>
    </div>
  </section>;
}

function ScaleWorkflow(){
  const steps:[string,DashboardIconName,string,string,string][]=[
    ["01","target","Define","Set the model, discipline, language, volume, and quality bar.","Objective locked"],
    ["02","users","Match","Match verified professionals to the work and security requirements.","Experts matched"],
    ["03","feedback","Create & review","Create, compare, calibrate, and adjudicate every response.","Quality verified"],
    ["04","integrations","Integrate","Move approved, traceable data securely into your AI workflow.","Dataset ready"],
  ];
  return <section className="scaleWorkflow">
    <div className="shell">
      <header><div><p className="eyebrow">From objective to outcomes</p><h2>Human intelligence <em>at scale.</em></h2></div><p>One continuous system turns a project brief into reviewed, production-ready data.</p></header>
      <div className="scaleSteps">
        <div className="scaleFlowLine"><i/></div>
        {steps.map(([number,icon,title,description,status],index)=><article key={number} style={{"--step-delay":`${index*.35}s`} as React.CSSProperties}>
          <div className={`scaleIcon scaleIcon${index+1}`}>
            <span/><i/><DashboardIcon name={icon} size={43}/>
          </div>
          <b>{number}</b><h3>{title}</h3><p>{description}</p><small><i/> {status}</small>
        </article>)}
      </div>
    </div>
  </section>;
}

function Feature({n,label,title,text,steps}:{n:string,label:string,title:string,text:string,steps:string[]}) {
  const iconSets:Record<string,DashboardIconName[]>={
    "01":["target","brain","feedback","quality"],
    "02":["reports","assessment","quality","users"],
    "03":["activity","sparkles","refresh","integrations"],
  };
  return <article className="feature"><div className="featureText"><span>{n} / {label}</span><h3>{title}</h3><p>{text}</p><a href="#contact">Explore capability →</a></div><div className="miniFlow techMiniFlow">{steps.map((s,i)=><div key={s}><i><em/><DashboardIcon name={iconSets[n][i]} size={22}/></i><strong>0{i+1}</strong><span>{s}</span>{i<steps.length-1&&<b>→</b>}</div>)}</div></article>
}

function FAQSection(){
  const questions=[
    ["How are experts verified?","Every applicant passes email verification, government-ID and selfie checks, credential review, role-specific assessments, and a final human approval decision."],
    ["What prevents substandard work?","Project assessments, gold tasks, calibration, peer review, consensus scoring, anomaly detection, and senior adjudication continuously protect quality."],
    ["Can Trainora support sensitive AI projects?","Projects can use role-based access, workspace isolation, restricted downloads, audit trails, configurable retention, and enhanced identity requirements."],
    ["How does data reach our development workflow?","Approved datasets can be exported in structured formats or delivered through secure APIs and cloud-storage integrations with full task lineage."],
    ["What does the trainer approval journey look like?","Applicants see each stage clearly: application received, email confirmed, identity checked, credentials reviewed, assessment passed, and final approval."],
    ["Can jobs be imported from other systems?","Super admins can publish manually, import validated CSV files, and synchronize public Greenhouse or Lever job feeds from the jobs operations console."],
  ];
  return <section className="faqSection" id="resources"><div className="shell faqLayout">
    <header><p className="eyebrow">Clear answers</p><h2>Questions that matter<br/><em>before you begin.</em></h2><p>Direct answers about expert quality, security, delivery, and joining the network.</p><a className="button" href="#contact">Ask another question →</a></header>
    <div className="faqList">{questions.map(([question,answer],index)=><details key={question} open={index===0}><summary><span>0{index+1}</span><b>{question}</b><i>+</i></summary><p>{answer}</p></details>)}</div>
  </div></section>;
}

function Footer() {
  const cols = {Platform:["Expert Network","Projects","Evaluations","Quality","APIs"],Solutions:["Model Training","Model Evaluation","Red Teaming","Multilingual AI"],Experts:["Apply","Disciplines","How work functions","Payments"],Company:["About","Careers","Security","Contact"],Resources:["Research","Guides","Documentation","Help Center"]};
  const destinations:Record<string,string>={Platform:"#platform","Expert Network":"#network",Projects:"#platform",Evaluations:"#quality",Quality:"#quality",APIs:"#platform",Solutions:"#solutions","Model Training":"#solutions","Model Evaluation":"#solutions","Red Teaming":"#solutions","Multilingual AI":"#solutions",Experts:"#experts",Apply:"/apply",Disciplines:"#network","How work functions":"/roles",Payments:"/trainer#payments",Company:"#contact",About:"#top",Careers:"#contact",Security:"#security",Contact:"#contact",Resources:"#resources",Research:"#resources",Guides:"#resources",Documentation:"/roles","Help Center":"#contact"};
  return <footer><div className="shell footerTop"><div className="footerBrand"><a className="brand inverse" href="#top"><span><DashboardIcon name="brain" size={19}/></span> trainora<span className="ai">ai</span></a><p>The expert intelligence network for advanced AI development.</p></div>{Object.entries(cols).map(([h,links])=><div className="footerCol" key={h}><b>{h}</b>{links.map(x=><a href={destinations[x]??"#top"} key={x}>{x}</a>)}</div>)}</div><div className="shell footerBottom"><span>© 2026 Trainora AI</span><span>Privacy · Terms · Cookies · Accessibility</span><span className="status">● All systems operational</span></div></footer>
}
