"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const field = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();
export async function login(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: field(fd, "email"),
    password: field(fd, "password"),
  });
  if (error) redirect("/connexion?erreur=identifiants");
  revalidatePath("/", "layout");
  redirect("/espace");
}
export async function signup(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: field(fd, "email"),
    password: field(fd, "password"),
    options: { data: { nom_complet: field(fd, "nom_complet") } },
  });
  if (error) redirect("/connexion?erreur=creation");
  redirect("/connexion?confirmation=envoyee");
}
