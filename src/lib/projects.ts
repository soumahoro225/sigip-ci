export type Risk = "Normal" | "À surveiller" | "Critique";
export type Project = {
  id: number | string;
  name: string;
  code: string;
  city: string;
  region: string;
  sector: string;
  ministry: string;
  budget: number;
  physical: number;
  financial: number;
  status: string;
  risk: Risk;
  lat: number;
  lng: number;
};

const places = [
  ["Abidjan", "District d'Abidjan", 5.348, -4.027],
  ["Yamoussoukro", "District de Yamoussoukro", 6.82, -5.28],
  ["Adzopé", "La Mé", 6.11, -3.86],
  ["Agboville", "Agnéby-Tiassa", 5.93, -4.22],
  ["Aboisso", "Sud-Comoé", 5.47, -3.2],
  ["Bongouanou", "Moronou", 6.65, -4.2],
  ["Dimbokro", "N'Zi", 6.65, -4.71],
  ["Daoukro", "Iffou", 7.06, -3.96],
  ["Bouaké", "Gbêkê", 7.69, -5.03],
  ["Katiola", "Hambol", 8.14, -5.1],
  ["Korhogo", "Poro", 9.46, -5.63],
  ["Boundiali", "Bagoué", 9.52, -6.49],
  ["Ferkessédougou", "Tchologo", 9.59, -5.2],
  ["San-Pédro", "San-Pédro", 4.75, -6.64],
  ["Sassandra", "Gbôklè", 4.95, -6.09],
  ["Soubré", "Nawa", 5.79, -6.61],
  ["Man", "Tonkpi", 7.41, -7.55],
  ["Duékoué", "Guémon", 6.74, -7.35],
  ["Guiglo", "Cavally", 6.54, -7.49],
  ["Daloa", "Haut-Sassandra", 6.88, -6.45],
  ["Bouaflé", "Marahoué", 6.98, -5.75],
  ["Bondoukou", "Gontougo", 8.04, -2.8],
  ["Bouna", "Bounkani", 9.27, -2.99],
  ["Odienné", "Kabadougou", 9.51, -7.56],
  ["Minignan", "Folon", 9.99, -7.84],
  ["Abengourou", "Indénié-Djuablin", 6.73, -3.5],
  ["Gagnoa", "Gôh", 6.13, -5.95],
  ["Divo", "Lôh-Djiboua", 5.84, -5.36],
  ["Séguéla", "Worodougou", 7.96, -6.67],
  ["Mankono", "Béré", 8.06, -6.19],
  ["Touba", "Bafing", 8.28, -7.68],
  ["Toumodi", "Bélier", 6.56, -5.02],
  ["Dabou", "Grands-Ponts", 5.33, -4.38],
] as const;
const sectors = [
  "Routes",
  "Santé",
  "Éducation",
  "Eau",
  "Énergie",
  "Assainissement",
];
const names = [
  "Réhabilitation de l’axe régional",
  "Extension du centre hospitalier",
  "Programme hydraulique urbain",
  "Construction de collèges de proximité",
  "Renforcement du réseau électrique",
  "Programme d’assainissement intégré",
];
const ministriesBySector: Record<string, string> = {
  Routes: "Ministère de l’Équipement et de l’Entretien routier",
  Santé: "Ministère de la Santé, de l’Hygiène publique et de la CMU",
  Éducation: "Ministère de l’Éducation nationale et de l’Alphabétisation",
  Eau: "Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité",
  Énergie: "Ministère des Mines, du Pétrole et de l’Énergie",
  Assainissement:
    "Ministère de l’Hydraulique, de l’Assainissement et de la Salubrité",
};
export const projects: Project[] = Array.from({ length: 60 }, (_, i) => {
  const p = places[i % places.length],
    physical = (i * 17 + 24) % 96,
    financial = Math.min(99, physical + (i % 4) * 14);
  const risk: Risk =
    financial - physical > 25 || (physical < 35 && i % 3 === 0)
      ? "Critique"
      : financial - physical > 12 || i % 5 === 0
        ? "À surveiller"
        : "Normal";
  return {
    id: i + 1,
    code: `SIGIP-26-${String(i + 1).padStart(3, "0")}`,
    name: `${names[i % names.length]} — ${p[0]}`,
    city: p[0],
    region: p[1],
    sector: sectors[i % sectors.length],
    ministry: ministriesBySector[sectors[i % sectors.length]],
    budget: 2.5 + (i % 12) * 3.4,
    physical,
    financial,
    status:
      physical > 85 ? "Achevé" : risk === "Critique" ? "En retard" : "En cours",
    risk,
    lat: p[2] + ((i % 3) - 1) * 0.07,
    lng: p[3] + ((i % 4) - 1.5) * 0.06,
  };
});
