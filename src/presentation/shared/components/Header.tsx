import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/common/app-routes";
import FraudeBotLogo from "@presentation/assets/fraudebot-logo.webp";

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    function closeMenu() {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
    }

    return (
        <header className="absolute left-0 right-0 top-0 z-40 mx-auto w-full max-w-6xl bg-white px-4 font-[Nunito] shadow-sm sm:rounded-b sm:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
                <Link
                    to={APP_ROUTES.home}
                    className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
                    aria-label="FraudeBot, ir al inicio"
                >
                    <img src={FraudeBotLogo} alt="" className="h-12 sm:h-14" />
                </Link>

                <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
                    <Link to={APP_ROUTES.home} className="rounded font-semibold text-gray-700 transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Inicio</Link>
                    <Link to={APP_ROUTES.report} className="rounded font-semibold text-gray-700 transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Reportar</Link>
                    <Link to={APP_ROUTES.search} className="rounded font-semibold text-gray-700 transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Búsqueda</Link>
                    <Link to={APP_ROUTES.contact} className="rounded font-semibold text-gray-700 transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Contacto</Link>
                </nav>

                <button
                    ref={menuButtonRef}
                    type="button"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-300 text-2xl text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 md:hidden"
                    aria-expanded={isMenuOpen}
                    aria-controls="mobile-navigation"
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
                </button>
            </div>

            {isMenuOpen && (
                <nav id="mobile-navigation" className="border-t border-gray-200 pb-4 md:hidden" aria-label="Navegación móvil">
                    <div className="flex flex-col gap-1 pt-2">
                        <Link to={APP_ROUTES.home} onClick={closeMenu} className="rounded px-3 py-3 font-semibold text-gray-800 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600">Inicio</Link>
                        <Link to={APP_ROUTES.report} onClick={closeMenu} className="rounded px-3 py-3 font-semibold text-gray-800 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600">Reportar</Link>
                        <Link to={APP_ROUTES.search} onClick={closeMenu} className="rounded px-3 py-3 font-semibold text-gray-800 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600">Búsqueda</Link>
                        <Link to={APP_ROUTES.contact} onClick={closeMenu} className="rounded px-3 py-3 font-semibold text-gray-800 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600">Contacto</Link>
                    </div>
                </nav>
            )}
        </header>
    );
}

export default Header;