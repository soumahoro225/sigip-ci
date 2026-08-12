import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  WalletCards,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Relation = { nom: string; sigle?: string | null } | null;
type ProjectRow = {
  id: string;
  code_projet: string;
  nom: string;
  description: string | null;
  localite: string | null;
  entreprise: string | null;
  cout_total: number;
  budget_engage: number;
  montant_decaisse: number;
  avancement_physique: number;
  avancement_financier: number;
  date_debut: string | null;
  date_fin_prevue: string | null;
  statut: string;
  score_risque: number;
  niveau_risque: "normal" | "surveillance" | "critique";
  ministeres: Relation | Relation[];
  secteurs: Relation | Relation[];
  regions: Relation | Relation[];
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function relation(value: Relation | Relation[]) {
  return Array.isArray(value) ? value[0] : value;
}

function money(value: number) {
  return `${(Number(value) / 1_000_000_000).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  })} milliards FCFA`;
}

function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
        new Date(`${value}T00:00:00`),
      )
    : "Non renseignée";
}

function status(value: string) {
  if (value === "en_retard") return "En retard";
  if (value === "acheve") return "Achevé";
  if (value === "suspendu") return "Suspendu";
  return "En cours";
}

function risk(value: ProjectRow["niveau_risque"]) {
  if (value === "critique") return "Critique";
  if (value === "surveillance") return "À surveiller";
  return "Normal";
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projets")
    .select(
      "id,code_projet,nom,description,localite,entreprise,cout_total,budget_engage,montant_decaisse,avancement_physique,avancement_financier,date_debut,date_fin_prevue,statut,score_risque,niveau_risque,ministeres(nom,sigle),secteurs(nom),regions(nom)",
    )
    .eq("id", id)
    .eq("is_demo", true)
    .maybeSingle();

  if (error || !data) notFound();
  const project = data as unknown as ProjectRow;
  const ministry = relation(project.ministeres);
  const sector = relation(project.secteurs);
  const region = relation(project.regions);
  const gap =
    Number(project.avancement_financier) - Number(project.avancement_physique);
  const findings = [
    ...(gap >= 15
      ? [
          `L’avancement financier dépasse l’avancement physique de ${gap.toFixed(0)} points.`,
        ]
      : []),
    ...(project.statut === "en_retard"
      ? ["Le calendrier contractuel indique un retard d’exécution."]
      : []),
    ...(Number(project.montant_decaisse) > Number(project.budget_engage)
      ? ["Le montant décaissé dépasse le budget actuellement engagé."]
      : []),
  ];

  return (
    <main className="projectPage">
      <div className="projectTopbar">
        <Link href="/" className="projectBack">
          <ArrowLeft /> Retour au tableau de bord
        </Link>
        <span>Données de démonstration · Supabase</span>
      </div>

      <section className="projectHero">
        <div>
          <div className="projectEyebrow">
            <span className={`projectRisk ${project.niveau_risque}`}>
              {risk(project.niveau_risque)}
            </span>
            <small>{project.code_projet}</small>
          </div>
          <h1>{project.nom}</h1>
          <p>
            <MapPin /> {project.localite ?? region?.nom ?? "Côte d’Ivoire"}
          </p>
        </div>
        <div className="projectScore">
          <small>Score de risque</small>
          <b>{Number(project.score_risque).toFixed(0)}</b>
          <span>/ 100</span>
        </div>
      </section>

      <section className="projectKpis">
        <ProjectKpi label="Coût total" value={money(project.cout_total)} />
        <ProjectKpi
          label="Budget engagé"
          value={money(project.budget_engage)}
        />
        <ProjectKpi
          label="Montant décaissé"
          value={money(project.montant_decaisse)}
        />
        <ProjectKpi label="Statut" value={status(project.statut)} />
      </section>

      <div className="projectGrid">
        <section className="projectCard projectMain">
          <h2>Exécution du projet</h2>
          <ProjectProgress
            label="Avancement physique"
            value={Number(project.avancement_physique)}
          />
          <ProjectProgress
            label="Avancement financier"
            value={Number(project.avancement_financier)}
            financial
          />
          <h2>Description</h2>
          <p className="projectDescription">
            {project.description ??
              "Aucune description détaillée n’a encore été renseignée pour ce projet."}
          </p>
        </section>

        <section className="projectCard">
          <h2>Diagnostic du risque</h2>
          {findings.length ? (
            <div className="riskFindings">
              {findings.map((finding) => (
                <div key={finding}>
                  <AlertTriangle /> <span>{finding}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="riskClear">
              <CheckCircle2 />
              <span>Aucune anomalie automatique majeure détectée.</span>
            </div>
          )}
        </section>

        <section className="projectCard projectMain">
          <h2>Informations contractuelles</h2>
          <div className="projectInfo">
            <Info icon={<Building2 />} label="Ministère" value={ministry?.nom} />
            <Info icon={<WalletCards />} label="Secteur" value={sector?.nom} />
            <Info
              icon={<MapPin />}
              label="Région"
              value={region?.nom}
            />
            <Info
              icon={<Building2 />}
              label="Entreprise"
              value={project.entreprise}
            />
            <Info
              icon={<CalendarDays />}
              label="Date de début"
              value={date(project.date_debut)}
            />
            <Info
              icon={<CalendarDays />}
              label="Fin prévue"
              value={date(project.date_fin_prevue)}
            />
          </div>
        </section>

        <section className="projectCard">
          <h2>Suivi documentaire</h2>
          <div className="emptyState">
            <CalendarDays />
            <b>Aucune inspection publiée</b>
            <p>Les rapports, photos et contrôles terrain apparaîtront ici.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectKpi({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <small>{label}</small>
      <b>{value}</b>
    </article>
  );
}

function ProjectProgress({
  label,
  value,
  financial = false,
}: {
  label: string;
  value: number;
  financial?: boolean;
}) {
  return (
    <div className="projectProgress">
      <div>
        <span>{label}</span>
        <b>{value.toFixed(0)} %</b>
      </div>
      <i>
        <u
          className={financial ? "financial" : ""}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </i>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      {icon}
      <span>
        <small>{label}</small>
        <b>{value || "Non renseigné"}</b>
      </span>
    </div>
  );
}
