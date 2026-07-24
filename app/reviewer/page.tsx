export const metadata = { title: "Reviewer Workspace · Trainora AI" };

export default function ReviewerPage(){
  const queue=[["REV-4092","Financial response comparison","High impact","18 min","Due today"],["REV-4104","Code reasoning adjudication","Disagreement","24 min","Due today"],["REV-4138","Medical factuality review","Standard","14 min","Tomorrow"],["REV-4161","Multilingual safety check","Gold task","12 min","Tomorrow"]];
  return <main className="portal reviewerPortal">
    <aside className="portalSide"><a className="portalBrand" href="/"><i>t</i><span>trainora<b>ai</b></span><em>REVIEWER</em></a><nav>{[["Review queue","☷"],["Adjudications","◇"],["Gold tasks","◆"],["Rubrics","▤"],["Quality analytics","↗"],["Calibration","◎"],["Feedback sent","✓"],["Support","?"]].map(([l,i],n)=><a className={n===0?"selected":""} href="#" key={l}><i>{i}</i>{l}{l==="Review queue"&&<b>24</b>}</a>)}</nav><a className="profileMini" href="/trainer"><i>MC</i><span><b>Maya Chen</b><small>Lead reviewer · Medicine</small></span><em>•••</em></a></aside>
    <section className="portalMain"><header className="portalTop"><div><small>REVIEWER WORKSPACE</small><h1>Review queue</h1></div><div className="topTools"><span className="verified">✓ Calibration current</span><button>♢<b>4</b></button></div></header>
      <div className="roleContent"><section className="roleHero"><div><span>QUALITY OPERATIONS</span><h2>24 submissions need review.</h2><p>Prioritized by client impact, disagreement severity, and delivery SLA.</p></div><button>Start next review →</button></section>
        <div className="roleKpis">{[["Queue","24","↓ 8 since yesterday"],["Agreement","98.1%","Target · 97%"],["Median review","16.8m","↓ 2.4m this week"],["Adjudications","3","1 high priority"]].map(([l,v,n])=><article key={l}><span>{l}</span><b>{v}</b><small>{n}</small></article>)}</div>
        <div className="reviewLayout"><section className="panel reviewQueue"><div className="panelHead"><div><small>PRIORITIZED QUEUE</small><h3>Submissions</h3></div><button>Filter queue</button></div>{queue.map(([id,title,type,time,due],i)=><article key={id}><i>{i+1}</i><p><span>{id} · {type}</span><b>{title}</b><small>Estimated review · {time}</small></p><em className={type==="Disagreement"?"warn":""}>{due}</em><button>Open review →</button></article>)}</section>
          <aside><section className="panel reviewerQuality"><div className="panelHead"><div><small>YOUR QUALITY</small><h3>Agreement trend</h3></div></div><div className="reviewRing"><span><b>98.1%</b><small>90-day agreement</small></span></div><div className="reviewTrend">{[72,75,71,79,83,81,86,88,91,89,94,96].map((x,i)=><i key={i} style={{height:`${x}%`}}/>)}</div></section><section className="panel rubricUpdate"><small>RUBRIC UPDATE</small><h3>Financial unsupported claims v2.1</h3><p>Clarified partial-credit guidance for claims supported by secondary sources.</p><button>Review changes →</button></section></aside>
        </div>
      </div>
    </section>
  </main>
}
