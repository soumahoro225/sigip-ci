export type Risk = "Normal" | "À surveiller" | "Critique";
export type Project = { id:number; name:string; code:string; city:string; region:string; sector:string; ministry:string; budget:number; physical:number; financial:number; status:string; risk:Risk; lat:number; lng:number };

const places = [
  ["Abidjan","District d'Abidjan",5.348,-4.027],["Bouaké","Gbêkê",7.69,-5.03],["Korhogo","Poro",9.46,-5.63],
  ["San-Pédro","San-Pédro",4.75,-6.64],["Yamoussoukro","Yamoussoukro",6.82,-5.28],["Man","Tonkpi",7.41,-7.55],
  ["Daloa","Haut-Sassandra",6.88,-6.45],["Bondoukou","Gontougo",8.04,-2.80],["Odienné","Kabadougou",9.51,-7.56],["Abengourou","Indénié-Djuablin",6.73,-3.50]
] as const;
const sectors = ["Routes","Santé","Éducation","Eau","Énergie","Assainissement"];
const names = ["Réhabilitation de l’axe régional","Extension du centre hospitalier","Programme hydraulique urbain","Construction de collèges de proximité","Renforcement du réseau électrique","Programme d’assainissement intégré"];
export const projects: Project[] = Array.from({length:60},(_,i)=>{
  const p=places[i%places.length], physical=(i*17+24)%96, financial=Math.min(99,physical+(i%4)*14);
  const risk:Risk = financial-physical>25||physical<35&&i%3===0?"Critique":financial-physical>12||i%5===0?"À surveiller":"Normal";
  return {id:i+1,code:`SIGIP-26-${String(i+1).padStart(3,"0")}`,name:`${names[i%names.length]} — ${p[0]}`,city:p[0],region:p[1],sector:sectors[i%sectors.length],ministry:i%2?"Équipement et Entretien routier":"Plan et Développement",budget:2.5+(i%12)*3.4,physical,financial,status:physical>85?"Achevé":risk==="Critique"?"En retard":"En cours",risk,lat:p[2]+((i%3)-1)*.07,lng:p[3]+((i%4)-1.5)*.06};
});
