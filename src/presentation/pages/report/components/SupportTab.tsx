import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/common/app-routes";
import reportIcons from "@presentation/pages/report/components/icons";

const panelClassName =
  "group flex h-full cursor-pointer flex-col px-6 py-6 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-300 sm:px-8 sm:py-8";

function SupportTab() {
  return (
    <section className="border border-gray-200 bg-white">
      <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:divide-gray-200">
        <Link to={APP_ROUTES.contact} className={panelClassName}>
          <h2 className="text-xl font-extrabold leading-none text-gray-900">
            Ayuda jurídica:
          </h2>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-base leading-6 text-gray-600">
              Visita nuestra página de ayuda jurídica para saber cómo proceder
              con tu caso.
            </p>
            <img
              src={reportIcons.legalHelp}
              alt=""
              aria-hidden
              className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28"
            />
          </div>
        </Link>

        <Link to={APP_ROUTES.contact} className={panelClassName}>
          <h2 className="text-xl font-extrabold leading-none text-gray-900">
            Soporte:
          </h2>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-base leading-6 text-gray-600">
              Visita nuestra página de soporte para contactarte con uno de
              nuestros especialistas.
            </p>
            <img
              src={reportIcons.customerService}
              alt=""
              aria-hidden
              className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28"
            />
          </div>
        </Link>
      </div>

      <div className="border-t border-gray-200 px-6 py-10 text-center sm:px-8 sm:py-12">
        <h2 className="text-2xl font-extrabold text-gray-900">
          ¿Eres tú el reportado?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-700">
          En <span className="font-extrabold text-gray-900">FraudeBot</span>{" "}
          estamos en contra de las calumnias y el falso levantamiento de
          reportes.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-700">
          Puedes dar tu versión de los hechos enviando un email al
        </p>
        <a
          href="mailto:reportes@fraudebot.com"
          className="mt-4 inline-block cursor-pointer text-base text-sky-400 underline decoration-1 underline-offset-2 hover:text-sky-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
        >
          reportes@fraudebot.com
        </a>
        <img
          src={reportIcons.agreement}
          alt=""
          aria-hidden
          className="mx-auto mt-8 h-40 w-40 object-contain sm:h-44 sm:w-44"
        />
      </div>
    </section>
  );
}

export default SupportTab;
