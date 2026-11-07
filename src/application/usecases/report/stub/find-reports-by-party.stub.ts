import ApiCallerInterface from "@/core/base/api-caller.interface";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import FindReportsByPartyResult from "@/core/domain/report/models/find-reports-by-party.model";

const PAGE_SIZE = 10;

const extraReports = Array.from({ length: 22 }, (_, index) => {
  const id = String(1401 + index);

  return new PartyReportEntity(
    id,
    `Reporte de estafa #${id}`,
    `Detalle del reporte ${id}: me contactaron ofreciendo un trato que parecía legítimo y luego desaparecieron con el dinero.`,
    "2026-11-20",
  );
});

const stubReports: PartyReportEntity[] = [
  new PartyReportEntity(
    "1354",
    "¡Me estafó $2,000 MXN y estoy enojada!",
    "Estoy super enojada, me ofreció un lote de ropa por $2,000 MXN y le deposité en oxxo sin verificar.",
    "2026-11-20",
  ),
  new PartyReportEntity(
    "1314",
    "Estafado",
    "Hola, quiero reportar a este tipo que me estafó 1000 pesos. Pensé que era real y le creí.",
    "2026-11-18",
  ),
  new PartyReportEntity(
    "1287",
    "Cuidado parece estafa!",
    "El titular de la cuenta es MARISOL DOMINGUEZ NUEVO y el tipo quiere que pongamos el dinero en su cuenta.",
    "2026-11-15",
  ),
  ...extraReports,
];

class FindReportsByPartyStubUsecase implements ApiCallerInterface {
  public execute(
    _id: string,
    _type: "scammer" | "organization",
    page = 1,
  ): Promise<FindReportsByPartyResult> {
    const safePage = page > 0 ? page : 1;
    const start = (safePage - 1) * PAGE_SIZE;

    return Promise.resolve({
      data: stubReports.slice(start, start + PAGE_SIZE),
      total: stubReports.length,
      page: safePage,
      count: PAGE_SIZE,
    });
  }

  public cancel(): void {
    // No cancellation needed for stub usecase
  }
}

export default FindReportsByPartyStubUsecase;
