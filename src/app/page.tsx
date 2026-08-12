import { Dashboard } from "@/components/dashboard";
import type { Project, Risk } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JoinedProject = {
  id: string;
  code_projet: string;
  nom: string;
  localite: string | null;
  cout_total: number;
  budget_engage: number;
  montant_decaisse: number;
  avancement_physique: number;
  avancement_financier: number;
  statut: string;
  score_risque: number;
  niveau_risque: "normal" | "surveillance" | "critique";
  latitude: number | null;
  longitude: number | null;
  ministeres: { nom: string } | { nom: string }[] | null;
  secteurs: { nom: string } | { nom: string }[] | null;
  regions: { nom: string } | { nom: string }[] | null;
};

function relationName(value: { nom: string } | { nom: string }[] | null) {
  return Array.isArray(value) ? (value[0]?.nom ?? "") : (value?.nom ?? "");
}

function riskLabel(value: JoinedProject["niveau_risque"]): Risk {
  return value === "critique"
    ? "Critique"
    : value === "surveillance"
      ? "À surveiller"
      : "Normal";
}

function statusLabel(value: string) {
  if (value === "en_retard") return "En retard";
  if (value === "acheve") return "Achevé";
  return "En cours";
}

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projets")
    .select(
      "id,code_projet,nom,localite,cout_total,budget_engage,montant_decaisse,avancement_physique,avancement_financier,statut,score_risque,niveau_risque,latitude,longitude,ministeres(nom),secteurs(nom),regions(nom)",
    )
    .eq("is_demo", true)
    .order("code_projet");

  const rows = (data ?? []) as unknown as JoinedProject[];
  const projects: Project[] = rows
    .filter((row) => row.latitude !== null && row.longitude !== null)
    .map((row) => ({
      id: row.id,
      code: row.code_projet,
      name: row.nom,
      city: row.localite ?? relationName(row.regions),
      region: relationName(row.regions),
      sector: relationName(row.secteurs),
      ministry: relationName(row.ministeres),
      budget: Number(row.budget_engage) / 1_000_000_000,
      physical: Number(row.avancement_physique),
      financial: Number(row.avancement_financier),
      status: statusLabel(row.statut),
      risk: riskLabel(row.niveau_risque),
      lat: Number(row.latitude),
      lng: Number(row.longitude),
    }));

  return (
    <Dashboard
      initialProjects={projects}
      source={!error && projects.length ? "supabase" : "fallback"}
    />
  );
}
