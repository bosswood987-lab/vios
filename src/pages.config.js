import SalleAttente from './pages/SalleAttente';
import Patients from './pages/Patients';
import DossierPatient from './pages/DossierPatient';
import Gestion from './pages/Gestion';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import Recettes from './pages/Recettes';
import DossiersRecents from './pages/DossiersRecents';
import RechercheAvancee from './pages/RechercheAvancee';
import DossiersATraiter from './pages/DossiersATraiter';
import Layout from './Layout.jsx';


export const PAGES = {
    "SalleAttente": SalleAttente,
    "Patients": Patients,
    "DossierPatient": DossierPatient,
    "Gestion": Gestion,
    "GestionUtilisateurs": GestionUtilisateurs,
    "Recettes": Recettes,
    "DossiersRecents": DossiersRecents,
    "RechercheAvancee": RechercheAvancee,
    "DossiersATraiter": DossiersATraiter,
}

export const pagesConfig = {
    mainPage: "SalleAttente",
    Pages: PAGES,
    Layout: Layout,
};