"use client";
import {useMemo,useState} from "react";
import {Activity,AlertTriangle,BarChart3,ChevronDown,Landmark,Layers3,Map,Search,ShieldCheck,WalletCards} from "lucide-react";
import {ProjectMap} from "@/components/map";
import {projects,Project} from "@/lib/projects";

const fcfa=(n:number)=>`${n.toLocaleString("fr-FR",{maximumFractionDigits:1})} Md`;
export default function Dashboard(){
 const [sector,setSector]=useState("Tous les secteurs"),[selected,setSelected]=useState<Project>(projects[1]);
 const visible=useMemo(()=>sector==="Tous les secteurs"?projects:projects.filter(p=>p.sector===sector),[sector]);
 const budget=visible.reduce((s,p)=>s+p.budget,0), critical=visible.filter(p=>p.risk==="Critique").length;
 return <main className="shell">
  <aside><div className="brand"><span>SI</span><div><b>SIGIP-CI</b><small>Investissements publics</small></div></div><nav><a className="active"><BarChart3/>Vue nationale</a><a><Map/>Carte des projets</a><a><Layers3/>Portefeuille</a><a><Activity/>Alertes <em>{critical}</em></a><a><ShieldCheck/>Inspections</a></nav><div className="asideFoot"><Landmark/><div><b>République de Côte d’Ivoire</b><small>Plateforme de démonstration</small></div></div></aside>
  <section className="workspace"><header><div><small>OBSERVATOIRE NATIONAL</small><h1>Tableau de bord des investissements</h1></div><div className="update"><span></span><div><small>Dernière actualisation</small><b>13 août 2026 · 09:45</b></div><button>IS</button></div></header>
   <div className="notice">DONNÉES DE DÉMONSTRATION <span>Les informations présentées sont fictives et conçues pour le prototype SIGIP-CI.</span></div>
   <div className="kpis"><Kpi label="Projets suivis" value={String(visible.length)} note="Portefeuille national"/><Kpi label="Budget engagé" value={fcfa(budget)} note="Milliards FCFA"/><Kpi label="Budget décaissé" value={fcfa(budget*.61)} note="61 % du budget"/><Kpi label="Exécution physique" value="57,4 %" note="Moyenne nationale"/><Kpi danger label="Projets critiques" value={String(critical)} note="Action requise"/></div>
   <div className="toolbar"><div className="search"><Search/><input placeholder="Rechercher un projet, une localité…"/></div>{["Ministère","Région","Statut"].map(x=><button className="filter" key={x}>{x}<ChevronDown/></button>)}<label className="filter"><select value={sector} onChange={e=>setSector(e.target.value)}><option>Tous les secteurs</option>{["Routes","Santé","Éducation","Eau","Énergie","Assainissement"].map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></label></div>
   <div className="content"><div className="mapCard"><div className="mapTitle"><div><b>Répartition nationale des projets</b><small>{visible.length} opérations géolocalisées</small></div><div className="legend"><i className="g"/>Normal <i className="a"/>À surveiller <i className="r"/>Critique</div></div><ProjectMap projects={visible} onSelect={setSelected}/></div>
   <article className="detail"><div className="risk"><span className={selected.risk==="Critique"?"r":selected.risk==="À surveiller"?"a":"g"}>{selected.risk}</span><small>{selected.code}</small></div><h2>{selected.name}</h2><p>{selected.city} · {selected.region}</p><div className="facts"><Fact label="Budget engagé" value={`${selected.budget.toFixed(1)} milliards FCFA`}/><Fact label="Échéance" value="Décembre 2026"/></div><Progress label="Avancement physique" value={selected.physical}/><Progress label="Avancement financier" value={selected.financial} orange/><div className="alert"><AlertTriangle/><div><b>Anomalie détectée</b><p>Le décaissement financier est supérieur à l’avancement physique. Une vérification est recommandée.</p></div></div><button className="open">Ouvrir la fiche complète</button></article></div>
  </section></main>
}
function Kpi({label,value,note,danger=false}:{label:string,value:string,note:string,danger?:boolean}){return <div className={`kpi ${danger?"danger":""}`}><div><small>{label}</small><b>{value}</b><span>{note}</span></div><WalletCards/></div>}
function Fact({label,value}:{label:string,value:string}){return <div><small>{label}</small><b>{value}</b></div>}
function Progress({label,value,orange=false}:{label:string,value:number,orange?:boolean}){return <div className="progress"><div><span>{label}</span><b>{value} %</b></div><i><u style={{width:`${value}%`}} className={orange?"orange":""}/></i></div>}
