"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Landmark,
  Layers3,
  Map,
  Search,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { ProjectMap } from "@/components/map";
import { projects as demoProjects, Project } from "@/lib/projects";

const fcfa = (n: number) =>
  `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Md`;
export function Dashboard({
  initialProjects,
  source,
}: {
  initialProjects: Project[];
  source: "supabase" | "fallback";
}) {
  const data = useMemo(
    () => (initialProjects.length ? initialProjects : demoProjects),
    [initialProjects],
  );
  const [sector, setSector] = useState(""),
    [ministry, setMinistry] = useState(""),
    [region, setRegion] = useState(""),
    [status, setStatus] = useState(""),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Project>(data[1]);
  const ministries = useMemo(
    () => [...new Set(data.map((p) => p.ministry))].sort(),
    [data],
  );
  const regions = useMemo(
    () => [...new Set(data.map((p) => p.region))].sort(),
    [data],
  );
  const visible = useMemo(
    () =>
      data.filter(
        (p) =>
          (!sector || p.sector === sector) &&
          (!ministry || p.ministry === ministry) &&
          (!region || p.region === region) &&
          (!status || p.status === status) &&
          (!query ||
            `${p.name} ${p.city} ${p.code}`
              .toLocaleLowerCase("fr")
              .includes(query.toLocaleLowerCase("fr"))),
      ),
    [data, sector, ministry, region, status, query],
  );
  const activeProject =
    visible.find((project) => project.id === selected.id) ??
    visible[0] ??
    selected;
  const budget = visible.reduce((s, p) => s + p.budget, 0);
  const disbursed = visible.reduce(
    (s, p) => s + (p.budget * p.financial) / 100,
    0,
  );
  const physicalAverage = visible.length
    ? visible.reduce((s, p) => s + p.physical, 0) / visible.length
    : 0;
  const critical = visible.filter((p) => p.risk === "Critique").length;
  const hasFilters = Boolean(sector || ministry || region || status || query);
  const resetFilters = () => {
    setSector("");
    setMinistry("");
    setRegion("");
    setStatus("");
    setQuery("");
  };
  return (
    <main className="shell">
      <aside>
        <div className="brand">
          <span>SI</span>
          <div>
            <b>SIGIP-CI</b>
            <small>Investissements publics</small>
          </div>
        </div>
        <nav>
          <a className="active">
            <BarChart3 />
            Vue nationale
          </a>
          <a>
            <Map />
            Carte des projets
          </a>
          <a>
            <Layers3 />
            Portefeuille
          </a>
          <a>
            <Activity />
            Alertes <em>{critical}</em>
          </a>
          <a>
            <ShieldCheck />
            Inspections
          </a>
        </nav>
        <div className="asideFoot">
          <Landmark />
          <div>
            <b>République de Côte d’Ivoire</b>
            <small>Plateforme de démonstration</small>
          </div>
        </div>
      </aside>
      <section className="workspace">
        <header>
          <div>
            <small>OBSERVATOIRE NATIONAL</small>
            <h1>Tableau de bord des investissements</h1>
          </div>
          <div className="update">
            <span></span>
            <div>
              <small>Dernière actualisation</small>
              <b>13 août 2026 · 09:45</b>
            </div>
            <Link
              href="/connexion"
              className="userButton"
              aria-label="Connexion"
            >
              IS
            </Link>
          </div>
        </header>
        <div className="notice">
          DONNÉES DE DÉMONSTRATION{" "}
          <strong className="dataSource">
            {source === "supabase"
              ? "SOURCE : SUPABASE / POSTGIS"
              : "SOURCE DE SECOURS LOCALE"}
          </strong>{" "}
          <span>
            Les informations présentées sont fictives et conçues pour le
            prototype SIGIP-CI.
          </span>
        </div>
        <div className="kpis">
          <Kpi
            label="Projets suivis"
            value={String(visible.length)}
            note="Portefeuille national"
          />
          <Kpi
            label="Budget engagé"
            value={fcfa(budget)}
            note="Milliards FCFA"
          />
          <Kpi
            label="Budget décaissé"
            value={fcfa(disbursed)}
            note="Décaissement calculé"
          />
          <Kpi
            label="Exécution physique"
            value={`${physicalAverage.toFixed(1).replace(".", ",")} %`}
            note={hasFilters ? "Moyenne filtrée" : "Moyenne nationale"}
          />
          <Kpi
            danger
            label="Projets critiques"
            value={String(critical)}
            note="Action requise"
          />
        </div>
        <div className="toolbar">
          <div className="search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet, une localité…"
            />
          </div>
          <FilterSelect
            label="Tous les ministères"
            value={ministry}
            onChange={setMinistry}
            options={ministries}
          />
          <FilterSelect
            label="Toutes les régions"
            value={region}
            onChange={setRegion}
            options={regions}
          />
          <FilterSelect
            label="Tous les statuts"
            value={status}
            onChange={setStatus}
            options={["En cours", "En retard", "Achevé"]}
          />
          <label className="filter">
            <select value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">Tous les secteurs</option>
              {[
                "Routes",
                "Santé",
                "Éducation",
                "Eau",
                "Énergie",
                "Assainissement",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <ChevronDown />
          </label>
          {hasFilters && (
            <button
              className="resetFilter"
              onClick={resetFilters}
              title="Réinitialiser les filtres"
            >
              <RotateCcw />
            </button>
          )}
        </div>
        <div className="content">
          <div className="mapCard">
            <div className="mapTitle">
              <div>
                <b>Répartition nationale des projets</b>
                <small>{visible.length} opérations géolocalisées</small>
              </div>
              <div className="legend">
                <i className="g" />
                Normal <i className="a" />À surveiller <i className="r" />
                Critique
              </div>
            </div>
            <ProjectMap projects={visible} onSelect={setSelected} />
          </div>
          <article className="detail">
            <div className="risk">
              <span
                className={
                  activeProject.risk === "Critique"
                    ? "r"
                    : activeProject.risk === "À surveiller"
                      ? "a"
                      : "g"
                }
              >
                {activeProject.risk}
              </span>
              <small>{activeProject.code}</small>
            </div>
            <h2>{activeProject.name}</h2>
            <p>
              {activeProject.city} · {activeProject.region}
            </p>
            <div className="facts">
              <Fact
                label="Budget engagé"
                value={`${activeProject.budget.toFixed(1)} milliards FCFA`}
              />
              <Fact label="Échéance" value="Décembre 2026" />
            </div>
            <Progress
              label="Avancement physique"
              value={activeProject.physical}
            />
            <Progress
              label="Avancement financier"
              value={activeProject.financial}
              orange
            />
            <div className="alert">
              <AlertTriangle />
              <div>
                <b>Anomalie détectée</b>
                <p>
                  Le décaissement financier est supérieur à l’avancement
                  physique. Une vérification est recommandée.
                </p>
              </div>
            </div>
            <button className="open">Ouvrir la fiche complète</button>
          </article>
        </div>
      </section>
    </main>
  );
}
function Kpi({
  label,
  value,
  note,
  danger = false,
}: {
  label: string;
  value: string;
  note: string;
  danger?: boolean;
}) {
  return (
    <div className={`kpi ${danger ? "danger" : ""}`}>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        <span>{note}</span>
      </div>
      <WalletCards />
    </div>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
function Progress({
  label,
  value,
  orange = false,
}: {
  label: string;
  value: number;
  orange?: boolean;
}) {
  return (
    <div className="progress">
      <div>
        <span>{label}</span>
        <b>{value} %</b>
      </div>
      <i>
        <u style={{ width: `${value}%` }} className={orange ? "orange" : ""} />
      </i>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="filter">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown />
    </label>
  );
}
