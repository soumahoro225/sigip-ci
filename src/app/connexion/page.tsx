import Link from "next/link";
import { Landmark, LockKeyhole, Mail, UserRound } from "lucide-react";
import { login, signup } from "./actions";
export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; confirmation?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="authPage">
      <section className="authIntro">
        <div className="authBrand">
          <span>SI</span>
          <div>
            <b>SIGIP-CI</b>
            <small>Gouvernance des investissements publics</small>
          </div>
        </div>
        <div>
          <small>ESPACE INSTITUTIONNEL SÉCURISÉ</small>
          <h1>Piloter l’investissement public avec une vision territoriale.</h1>
          <p>
            Accédez aux projets, inspections, alertes et indicateurs relevant de
            votre périmètre administratif.
          </p>
        </div>
        <div className="authSeal">
          <Landmark />
          <span>
            République de Côte d’Ivoire
            <br />
            <small>Accès réservé aux utilisateurs autorisés</small>
          </span>
        </div>
      </section>
      <section className="authPanel">
        <Link href="/" className="backLink">
          ← Retour à la démonstration
        </Link>
        <form className="authForm">
          <div>
            <small>AUTHENTIFICATION</small>
            <h2>Bienvenue sur SIGIP-CI</h2>
            <p>Connectez-vous avec vos identifiants professionnels.</p>
          </div>
          {query.erreur && (
            <div className="formError">
              Connexion impossible. Vérifiez les informations saisies.
            </div>
          )}
          {query.confirmation && (
            <div className="formSuccess">
              Compte créé. Consultez votre messagerie pour confirmer votre
              adresse.
            </div>
          )}
          <label>
            <span>
              Nom complet <em>— création uniquement</em>
            </span>
            <div>
              <UserRound />
              <input
                name="nom_complet"
                autoComplete="name"
                placeholder="Ex. Ibrahim Soumahoro"
              />
            </div>
          </label>
          <label>
            <span>Adresse professionnelle</span>
            <div>
              <Mail />
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="prenom.nom@administration.gouv.ci"
              />
            </div>
          </label>
          <label>
            <span>Mot de passe</span>
            <div>
              <LockKeyhole />
              <input
                name="password"
                type="password"
                minLength={8}
                autoComplete="current-password"
                required
                placeholder="8 caractères minimum"
              />
            </div>
          </label>
          <button formAction={login} className="primaryAuth">
            Se connecter
          </button>
          <button formAction={signup} className="secondaryAuth">
            Créer un compte de démonstration
          </button>
          <p className="securityNote">
            <LockKeyhole />
            Connexion sécurisée · accès contrôlé par rôle et ministère
          </p>
        </form>
      </section>
    </main>
  );
}
