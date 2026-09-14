import Footer from "@/presentation/shared/components/Footer";
import Header from "@/presentation/shared/components/Header";
import ReportFormWizard from "@/presentation/pages/report-form/components/ReportFormWizard";

function ReportForm() {
  return (
    <>
      <title>FraudeBot - Reportar</title>
      <Header />
      <main className="flex min-h-screen flex-col bg-white px-4 pb-20 pt-28 font-[Nunito]">
        <h1 className="sr-only">Reportar un fraude</h1>
        <ReportFormWizard />
      </main>
      <Footer />
    </>
  );
}

export default ReportForm;
