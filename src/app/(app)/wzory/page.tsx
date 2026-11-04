import { Page, PageHeader } from "@/components/layout/AppShell";
import FormulaBrowser from "@/components/topic/FormulaBrowser";

export const metadata = { title: "Wzory – Matma" };

export default function FormulasPage() {
  return (
    <Page>
      <PageHeader title="Wzory" subtitle="Wszystkie wzory z działów w jednym miejscu – wpisz, czego szukasz." />
      <FormulaBrowser />
    </Page>
  );
}
