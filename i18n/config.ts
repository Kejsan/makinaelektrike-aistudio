import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const enTranslations = {
    "header": {
        "home": "Home",
        "dealers": "Dealers",
        "models": "Models",
        "blog": "Blog",
        "about": "About",
        "favorites": "Favorites",
        "admin": "Admin"
    },
    "footer": {
        "description": "Your guide to electric and hybrid vehicles in Albania. Find dealerships, compare models, and join the electric revolution.",
        "explore": "Explore",
        "aboutUs": "About Us",
        "contact": "Contact",
        "legal": "Legal",
        "privacy": "Privacy Policy",
        "terms": "Terms of Service",
        "rightsReserved": "All rights reserved."
    },
    "home": {
        "heroTitle": "Drive the Future.",
        "heroSubtitle": "Discover Electric Mobility in Albania.",
        "heroCta": "Find Your EV",
        "searchTitle": "Find Your Perfect Electric Car",
        "cityPlaceholder": "City",
        "brandPlaceholder": "Brand",
        "typePlaceholder": "Car Type",
        "searchButton": "Search",
        "featuredDealers": "Featured Dealerships",
        "featuredModels": "Popular Models",
        "seeAllDealers": "See All Dealerships",
        "seeAllModels": "See All Models",
        "fromOurBlog": "From Our Blog",
        "seeAllPosts": "See All Posts"
    },
    "dealersPage": {
        "title": "Dealerships in Albania",
        "filters": "Filters",
        "city": "City",
        "brand": "Brand",
        "language": "Language Spoken",
        "noResults": "No dealerships found matching your criteria.",
        "viewDetails": "View Details",
        "clearFilters": "Clear Filters",
        "mapTitle": "Dealer Locations on Map",
        "sortBy": "Sort by",
        "sortOptions": {
            "name_asc": "Name (A-Z)",
            "name_desc": "Name (Z-A)",
            "city_asc": "City (A-Z)",
            "city_desc": "City (Z-A)"
        },
        "allCities": "All Cities",
        "allBrands": "All Brands",
        "allLanguages": "All Languages"
    },
    "dealerDetails": {
        "brandsSold": "Brands Sold",
        "contactInfo": "Contact Information",
        "address": "Address",
        "phone": "Phone",
        "email": "Email",
        "website": "Website",
        "languagesSpoken": "Languages Spoken",
        "notes": "Notes",
        "modelsAvailable": "Models Available at this Dealership",
        "backLink": "Back to all dealers",
        "locationOnMap": "Location on Map"
    },
    "modelsPage": {
        "title": "Electric & Hybrid Models",
        "filters": "Filters",
        "brand": "Brand",
        "bodyType": "Body Type",
        "range": "Range (WLTP)",
        "noResults": "No models found matching your criteria.",
        "viewDetails": "View Details",
        "clearFilters": "Clear Filters",
        "sortBy": "Sort by",
        "sortOptions": {
            "model_asc": "Model Name (A-Z)",
            "model_desc": "Model Name (Z-A)",
            "brand_asc": "Brand (A-Z)",
            "brand_desc": "Brand (Z-A)",
            "range_desc": "Range (High to Low)",
            "range_asc": "Range (Low to High)"
        },
        "allBrands": "All Brands",
        "allBodyTypes": "All Body Types",
        "compare": "Compare"
    },
    "modelDetails": {
        "specifications": "Specifications",
        "brand": "Brand",
        "battery": "Battery",
        "range": "Range (WLTP)",
        "power": "Power",
        "torque": "Torque",
        "acceleration": "0-100 km/h",
        "topSpeed": "Top Speed",
        "drive": "Drive",
        "seats": "Seats",
        "chargingAC": "AC Charging",
        "chargingDC": "DC Charging",
        "notes": "Notes",
        "availableAt": "Available at these Dealerships",
        "contactDealer": "Contact Dealer",
        "backLink": "Back to all models"
    },
    "blogPage": {
        "title": "Our Blog",
        "subtitle": "News, guides, and insights into the world of electric vehicles."
    },
    "aboutPage": {
      "title": "About Makina Elektrike",
      "p1": "Makina Elektrike is the premier online directory for electric and hybrid vehicles in Albania. Our mission is to accelerate the adoption of sustainable transportation by providing a comprehensive, user-friendly platform for prospective buyers.",
      "p2": "We connect you with a wide network of official dealerships and importers, offering detailed information on the latest EV models available in the country. From technical specifications to dealership locations, we aim to be your one-stop resource for everything electric.",
      "p3": "Whether you're a seasoned EV enthusiast or just starting to explore your options, Makina Elektrike is here to guide you on your journey towards a cleaner, greener future on the road."
    },
    "contactPage": {
      "title": "Contact Us",
      "p1": "Have a question, feedback, or a business inquiry? We'd love to hear from you. Reach out to us via the channels below, and our team will get back to you as soon as possible.",
      "email": "Email",
      "phone": "Phone",
      "address": "Address",
      "addressDetails": "Tirana, Albania"
    },
    "favoritesPage": {
        "title": "My Favorites",
        "subtitle": "Your handpicked collection of electric vehicles and dealerships.",
        "dealers": "Favorite Dealerships",
        "models": "Favorite Models",
        "noDealers": "You haven't favorited any dealerships yet.",
        "noModels": "You haven't favorited any models yet."
    },
    "admin": {
        "loginTitle": "Admin Access",
        "emailLabel": "Email",
        "passwordLabel": "Password",
        "loginButton": "Login",
        "loginWithGoogle": "Login with Google",
        "or": "OR",
        "manageDealers": "Manage Dealers",
        "manageModels": "Manage Models",
        "manageBlog": "Manage Blog",
        "dashboard": "Dashboard",
        "addNewDealer": "Add New Dealer",
        "addNewModel": "Add New Model",
        "editDealer": "Edit Dealer",
        "editModel": "Edit Model",
        "actions": "Actions",
        "name": "Name",
        "city": "City",
        "brand": "Brand",
        "brands": "Brands",
        "featured": "Featured",
        "deleteConfirm": "Are you sure you want to delete this item?",
        "featureLimitError": "You can only feature a maximum of 4 items.",
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "logout": "Logout"
    },
    "compare": {
        "title": "Compare Models",
        "selectPrompt": "Select up to 3 models to compare from the list.",
        "maxSelected": "You can select a maximum of 3 models.",
        "searchPlaceholder": "Search for a model...",
        "clear": "Clear Selection",
        "feature": "Feature",
        "noModelsSelected": "Select models from the left to see a comparison.",
        "remove": "Remove"
    }
};
const sqTranslations = {
    "header": {
        "home": "Kryefaqja",
        "dealers": "Shitësit",
        "models": "Modelet",
        "blog": "Blogu",
        "about": "Rreth Nesh",
        "favorites": "Të Preferuarat",
        "admin": "Admin"
    },
    "footer": {
        "description": "Udhëzuesi juaj për automjetet elektrike dhe hibride në Shqipëri. Gjeni shitës, krahasoni modele dhe bashkohuni me revolucionin elektrik.",
        "explore": "Eksploro",
        "aboutUs": "Rreth Nesh",
        "contact": "Kontaktoni",
        "legal": "Ligjore",
        "privacy": "Politika e Privatësisë",
        "terms": "Kushtet e Shërbimit",
        "rightsReserved": "Të gjitha të drejtat e rezervuara."
    },
    "home": {
        "heroTitle": "Ngisni të Ardhmen.",
        "heroSubtitle": "Zbuloni Lëvizshmërinë Elektrike në Shqipëri.",
        "heroCta": "Gjeni EV-në Tuaj",
        "searchTitle": "Gjeni Makinën Tuaj Elektrike Perfekte",
        "cityPlaceholder": "Qyteti",
        "brandPlaceholder": "Marka",
        "typePlaceholder": "Tipi i Makinës",
        "searchButton": "Kërko",
        "featuredDealers": "Shitësit e Përzgjedhur",
        "featuredModels": "Modelet Popullore",
        "seeAllDealers": "Shiko të gjithë Shitësit",
        "seeAllModels": "Shiko të gjitha Modelet",
        "fromOurBlog": "Nga Blogu Ynë",
        "seeAllPosts": "Shiko të gjitha Postimet"
    },
    "dealersPage": {
        "title": "Konçesionarët në Shqipëri",
        "filters": "Filtrat",
        "city": "Qyteti",
        "brand": "Marka",
        "language": "Gjuha e Folur",
        "noResults": "Nuk u gjet asnjë konçesionar që përputhet me kriteret tuaja.",
        "viewDetails": "Shiko Detajet",
        "clearFilters": "Pastro Filtrat",
        "mapTitle": "Vendndodhjet e Shitësve në Hartë",
        "sortBy": "Rendit sipas",
        "sortOptions": {
            "name_asc": "Emri (A-Z)",
            "name_desc": "Emri (Z-A)",
            "city_asc": "Qyteti (A-Z)",
            "city_desc": "Qyteti (Z-A)"
        },
        "allCities": "Të gjitha Qytetet",
        "allBrands": "Të gjitha Markat",
        "allLanguages": "Të gjitha Gjuhët"
    },
    "dealerDetails": {
        "brandsSold": "Markat e Shitura",
        "contactInfo": "Informacioni i Kontaktit",
        "address": "Adresa",
        "phone": "Telefoni",
        "email": "Email",
        "website": "Faqja e Internetit",
        "languagesSpoken": "Gjuhët e Folura",
        "notes": "Shënime",
        "modelsAvailable": "Modelet e Disponueshme në këtë Konçesionar",
        "backLink": "Kthehu te të gjithë shitësit",
        "locationOnMap": "Vendndodhja në Hartë"
    },
    "modelsPage": {
        "title": "Modelet Elektrike & Hibride",
        "filters": "Filtrat",
        "brand": "Marka",
        "bodyType": "Tipi i Karrocerisë",
        "range": "Autonomia (WLTP)",
        "noResults": "Nuk u gjet asnjë model që përputhet me kriteret tuaja.",
        "viewDetails": "Shiko Detajet",
        "clearFilters": "Pastro Filtrat",
        "sortBy": "Rendit sipas",
        "sortOptions": {
            "model_asc": "Emri i Modelit (A-Z)",
            "model_desc": "Emri i Modelit (Z-A)",
            "brand_asc": "Marka (A-Z)",
            "brand_desc": "Marka (Z-A)",
            "range_desc": "Autonomia (Lartë-Poshtë)",
            "range_asc": "Autonomia (Poshtë-Lartë)"
        },
        "allBrands": "Të gjitha Markat",
        "allBodyTypes": "Të gjithë Tipet",
        "compare": "Krahaso"
    },
    "modelDetails": {
        "specifications": "Specifikimet",
        "brand": "Marka",
        "battery": "Bateria",
        "range": "Autonomia (WLTP)",
        "power": "Fuqia",
        "torque": "Forca Rrotulluese",
        "acceleration": "0-100 km/h",
        "topSpeed": "Shpejtësia Maksimale",
        "drive": "Tërheqja",
        "seats": "Vende",
        "chargingAC": "Karikimi AC",
        "chargingDC": "Karikimi DC",
        "notes": "Shënime",
        "availableAt": "E disponueshme te këta Shitës",
        "contactDealer": "Kontakto Shitësin",
        "backLink": "Kthehu te të gjitha modelet"
    },
    "blogPage": {
        "title": "Blogu Ynë",
        "subtitle": "Lajme, udhëzues dhe njohuri nga bota e automjeteve elektrike."
    },
    "aboutPage": {
      "title": "Rreth Makina Elektrike",
      "p1": "Makina Elektrike është drejtoria kryesore online për automjetet elektrike dhe hibride në Shqipëri. Misioni ynë është të përshpejtojmë adoptimin e transportit të qëndrueshëm duke ofruar një platformë gjithëpërfshirëse dhe të lehtë për t'u përdorur për blerësit e ardhshëm.",
      "p2": "Ne ju lidhim me një rrjet të gjerë konçesionarësh zyrtarë dhe importuesish, duke ofruar informacion të detajuar mbi modelet më të fundit EV të disponueshme në vend. Nga specifikimet teknike deri te vendndodhjet e konçesionarëve, ne synojmë të jemi burimi juaj i vetëm për gjithçka elektrike.",
      "p3": "Pavarësisht nëse jeni një entuziast i hershëm i EV-ve apo sapo keni filluar të eksploroni opsionet tuaja, Makina Elektrike është këtu për t'ju udhëhequr në udhëtimin tuaj drejt një të ardhmeje më të pastër dhe më të gjelbër në rrugë."
    },
    "contactPage": {
      "title": "Na Kontaktoni",
      "p1": "Keni një pyetje, feedback, apo një kërkesë biznesi? Do të donim të dëgjonim nga ju. Na kontaktoni përmes kanaleve më poshtë, dhe ekipi ynë do t'ju kthejë përgjigje sa më shpejt të jetë e mundur.",
      "email": "Email",
      "phone": "Telefon",
      "address": "Adresa",
      "addressDetails": "Tiranë, Shqipëri"
    },
    "favoritesPage": {
        "title": "Të Preferuarat e Mia",
        "subtitle": "Koleksioni juaj i zgjedhur i automjeteve elektrike dhe konçesionarëve.",
        "dealers": "Shitësit e Preferuar",
        "models": "Modelet e Preferuara",
        "noDealers": "Ju nuk keni shtuar ende asnjë shitës te të preferuarat.",
        "noModels": "Ju nuk keni shtuar ende asnjë model te të preferuarat."
    },
    "admin": {
        "loginTitle": "Akses Admin",
        "emailLabel": "Email",
        "passwordLabel": "Fjalëkalimi",
        "loginButton": "Hyr",
        "loginWithGoogle": "Hyr me Google",
        "or": "OSE",
        "manageDealers": "Menaxho Shitësit",
        "manageModels": "Menaxho Modelet",
        "manageBlog": "Menaxho Blogun",
        "dashboard": "Paneli",
        "addNewDealer": "Shto Shitës të Ri",
        "addNewModel": "Shto Model të Ri",
        "editDealer": "Modifiko Shitësin",
        "editModel": "Modifiko Modelin",
        "actions": "Veprimet",
        "name": "Emri",
        "city": "Qyteti",
        "brand": "Marka",
        "brands": "Markat",
        "featured": "I Përzgjedhur",
        "deleteConfirm": "Jeni të sigurt që doni ta fshini këtë element?",
        "featureLimitError": "Mund të përzgjidhni maksimumi 4 elementë.",
        "save": "Ruaj",
        "cancel": "Anulo",
        "delete": "Fshi",
        "edit": "Modifiko",
        "logout": "Dil"
    },
    "compare": {
        "title": "Krahaso Modelet",
        "selectPrompt": "Zgjidhni deri në 3 modele për të krahasuar nga lista.",
        "maxSelected": "Mund të zgjidhni maksimumi 3 modele.",
        "searchPlaceholder": "Kërko për një model...",
        "clear": "Pastro Zgjedhjen",
        "feature": "Veçoria",
        "noModelsSelected": "Zgjidhni modele nga e majta për të parë një krahasim.",
        "remove": "Hiqe"
    }
};
const itTranslations = {
    "header": {
        "home": "Home",
        "dealers": "Concessionari",
        "models": "Modelli",
        "blog": "Blog",
        "about": "Chi Siamo",
        "favorites": "Preferiti",
        "admin": "Admin"
    },
    "footer": {
        "description": "La tua guida ai veicoli elettrici e ibridi in Albania. Trova concessionari, confronta modelli e unisciti alla rivoluzione elettrica.",
        "explore": "Esplora",
        "aboutUs": "Chi Siamo",
        "contact": "Contatti",
        "legal": "Legale",
        "privacy": "Politica sulla Privacy",
        "terms": "Termini di Servizio",
        "rightsReserved": "Tutti i diritti riservati."
    },
    "home": {
        "heroTitle": "Guida il Futuro.",
        "heroSubtitle": "Scopri la Mobilità Elettrica in Albania.",
        "heroCta": "Trova il Tuo EV",
        "searchTitle": "Trova la Tua Auto Elettrica Perfetta",
        "cityPlaceholder": "Città",
        "brandPlaceholder": "Marca",
        "typePlaceholder": "Tipo di Auto",
        "searchButton": "Cerca",
        "featuredDealers": "Concessionari in Evidenza",
        "featuredModels": "Modelli Popolari",
        "seeAllDealers": "Vedi tutti i Concessionari",
        "seeAllModels": "Vedi tutti i Modelli",
        "fromOurBlog": "Dal Nostro Blog",
        "seeAllPosts": "Vedi tutti gli Articoli"
    },
    "dealersPage": {
        "title": "Concessionari in Albania",
        "filters": "Filtri",
        "city": "Città",
        "brand": "Marca",
        "language": "Lingua Parlata",
        "noResults": "Nessun concessionario trovato che corrisponda ai tuoi criteri.",
        "viewDetails": "Vedi Dettagli",
        "clearFilters": "Cancella Filtri",
        "mapTitle": "Posizioni dei Concessionari sulla Mappa",
        "sortBy": "Ordina per",
        "sortOptions": {
            "name_asc": "Nome (A-Z)",
            "name_desc": "Nome (Z-A)",
            "city_asc": "Città (A-Z)",
            "city_desc": "Città (Z-A)"
        },
        "allCities": "Tutte le Città",
        "allBrands": "Tutte le Marche",
        "allLanguages": "Tutte le Lingue"
    },
    "dealerDetails": {
        "brandsSold": "Marche Vendute",
        "contactInfo": "Informazioni di Contatto",
        "address": "Indirizzo",
        "phone": "Telefono",
        "email": "Email",
        "website": "Sito Web",
        "languagesSpoken": "Lingue Parlate",
        "notes": "Note",
        "modelsAvailable": "Modelli Disponibili presso questo Concessionario",
        "backLink": "Torna a tutti i concessionari",
        "locationOnMap": "Posizione sulla Mappa"
    },
    "modelsPage": {
        "title": "Modelli Elettrici e Ibridi",
        "filters": "Filtri",
        "brand": "Marca",
        "bodyType": "Tipo di Carrozzeria",
        "range": "Autonomia (WLTP)",
        "noResults": "Nessun modello trovato che corrisponda ai tuoi criteri.",
        "viewDetails": "Vedi Dettagli",
        "clearFilters": "Cancella Filtri",
        "sortBy": "Ordina per",
        "sortOptions": {
            "model_asc": "Nome Modello (A-Z)",
            "model_desc": "Nome Modello (Z-A)",
            "brand_asc": "Marca (A-Z)",
            "brand_desc": "Marca (Z-A)",
            "range_desc": "Autonomia (Decrescente)",
            "range_asc": "Autonomia (Crescente)"
        },
        "allBrands": "Tutte le Marche",
        "allBodyTypes": "Tutti i Tipi",
        "compare": "Confronta"
    },
    "modelDetails": {
        "specifications": "Specifiche",
        "brand": "Marca",
        "battery": "Batteria",
        "range": "Autonomia (WLTP)",
        "power": "Potenza",
        "torque": "Coppia",
        "acceleration": "0-100 km/h",
        "topSpeed": "Velocità Massima",
        "drive": "Trazione",
        "seats": "Posti",
        "chargingAC": "Ricarica AC",
        "chargingDC": "Ricarica DC",
        "notes": "Note",
        "availableAt": "Disponibile presso questi Concessionari",
        "contactDealer": "Contatta il Concessionario",
        "backLink": "Torna a tutti i modelli"
    },
    "blogPage": {
        "title": "Il Nostro Blog",
        "subtitle": "Notizie, guide e approfondimenti sul mondo dei veicoli elettrici."
    },
    "aboutPage": {
      "title": "Chi Siamo - Makina Elektrike",
      "p1": "Makina Elektrike è la principale directory online per veicoli elettrici e ibridi in Albania. La nostra missione è accelerare l'adozione di trasporti sostenibili fornendo una piattaforma completa e facile da usare per i potenziali acquirenti.",
      "p2": "Ti mettiamo in contatto con una vasta rete di concessionari e importatori ufficiali, offrendo informazioni dettagliate sugli ultimi modelli di veicoli elettrici disponibili nel paese. Dalle specifiche tecniche alle sedi dei concessionari, il nostro obiettivo è essere la tua risorsa unica per tutto ciò che è elettrico.",
      "p3": "Che tu sia un appassionato di veicoli elettrici di lunga data o che tu stia appena iniziando a esplorare le tue opzioni, Makina Elektrike è qui per guidarti nel tuo viaggio verso un futuro più pulito e più verde sulla strada."
    },
    "contactPage": {
      "title": "Contattaci",
      "p1": "Hai una domanda, un feedback o una richiesta commerciale? Ci piacerebbe sentirti. Contattaci tramite i canali sottostanti e il nostro team ti risponderà il prima possibile.",
      "email": "Email",
      "phone": "Telefono",
      "address": "Indirizzo",
      "addressDetails": "Tirana, Albania"
    },
     "favoritesPage": {
        "title": "I Miei Preferiti",
        "subtitle": "La tua raccolta personalizzata di veicoli elettrici e concessionari.",
        "dealers": "Concessionari Preferiti",
        "models": "Modelli Preferiti",
        "noDealers": "Non hai ancora aggiunto nessun concessionario ai preferiti.",
        "noModels": "Non hai ancora aggiunto nessun modello ai preferiti."
    },
    "admin": {
        "loginTitle": "Accesso Admin",
        "emailLabel": "Email",
        "passwordLabel": "Password",
        "loginButton": "Accedi",
        "loginWithGoogle": "Accedi con Google",
        "or": "O",
        "manageDealers": "Gestisci Concessionari",
        "manageModels": "Gestisci Modelli",
        "manageBlog": "Gestisci Blog",
        "dashboard": "Pannello di Controllo",
        "addNewDealer": "Aggiungi Nuovo Concessionario",
        "addNewModel": "Aggiungi Nuovo Modello",
        "editDealer": "Modifica Concessionario",
        "editModel": "Modifica Modello",
        "actions": "Azioni",
        "name": "Nome",
        "city": "Città",
        "brand": "Marca",
        "brands": "Marche",
        "featured": "In Evidenza",
        "deleteConfirm": "Sei sicuro di voler eliminare questo elemento?",
        "featureLimitError": "Puoi mettere in evidenza un massimo di 4 elementi.",
        "save": "Salva",
        "cancel": "Annulla",
        "delete": "Elimina",
        "edit": "Modifica",
        "logout": "Esci"
    },
    "compare": {
        "title": "Confronta Modelli",
        "selectPrompt": "Seleziona fino a 3 modelli da confrontare dalla lista.",
        "maxSelected": "Puoi selezionare un massimo di 3 modelli.",
        "searchPlaceholder": "Cerca un modello...",
        "clear": "Cancella Selezione",
        "feature": "Caratteristica",
        "noModelsSelected": "Seleziona i modelli a sinistra per vedere un confronto.",
        "remove": "Rimuovi"
    }
};

const resources = {
  en: {
    translation: enTranslations,
  },
  sq: {
    translation: sqTranslations,
  },
  it: {
    translation: itTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;