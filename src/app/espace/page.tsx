import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  FolderKanban,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
export default async function Espace() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/connexion");
  const [{ data: profil }, { count }] = await Promise.all([
    supabase
      .from("profils")
      .select("nom_complet,role,ministeres(nom,sigle)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("projets").select("*", { count: "exact", head: true }),
  ]);
  const role = String(profil?.role ?? "lecture_seule").replaceAll("_", " ");
  const ministereRelation = profil?.ministeres as unknown as {
    nom: string;
  } | null;
  const ministere = ministereRelation?.nom ?? "Non affecté";
  return (
    <main className="securePage">
      <header>
        <div>
          <small>ESPACE AUTHENTIFIÉ</small>
          <h1>Centre de pilotage</h1>
        </div>
        <form action={logout}>
          <button>
            <LogOut />
            Déconnexion
          </button>
        </form>
      </header>
      <section className="secureHero">
        <div className="secureIcon">
          <ShieldCheck />
        </div>
        <div>
          <small>SESSION VÉRIFIÉE</small>
          <h2>{profil?.nom_complet ?? "Utilisateur SIGIP-CI"}</h2>
          <p>
            Votre accès est protégé par les politiques de sécurité Supabase.
          </p>
        </div>
        <span className="roleBadge">{role}</span>
      </section>
      <section className="secureGrid">
        <article>
          <Building2 />
          <small>MINISTÈRE DE RATTACHEMENT</small>
          <b>{ministere}</b>
          <p>L’administrateur attribuera votre périmètre.</p>
        </article>
        <article>
          <FolderKanban />
          <small>PROJETS ACCESSIBLES</small>
          <b>{count ?? 0}</b>
          <p>Selon votre rôle et votre ministère.</p>
        </article>
        <article>
          <ShieldCheck />
          <small>NIVEAU D’AUTORISATION</small>
          <b>{role}</b>
          <p>Contrôlé au niveau de chaque ligne de données.</p>
        </article>
      </section>
      <Link href="/" className="secureBack">
        <ArrowLeft />
        Ouvrir le tableau de bord national
      </Link>
    </main>
  );
}
