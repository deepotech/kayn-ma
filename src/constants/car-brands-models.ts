export interface CarModel {
    slug: string;
    ar: string;
    fr: string;
}

export interface CarBrand {
    slug: string;
    ar: string;
    fr: string;
    models: CarModel[];
}

export const carCatalog: CarBrand[] = [
    {
        slug: "dacia",
        ar: "داسيا",
        fr: "Dacia",
        models: [
            { slug: "logan", ar: "لوغان", fr: "Logan" },
            { slug: "sandero", ar: "سانديرو", fr: "Sandero" },
            { slug: "duster", ar: "داستر", fr: "Duster" },
            { slug: "dokker", ar: "دوكر", fr: "Dokker" },
            { slug: "lodgy", ar: "لودجي", fr: "Lodgy" },
            { slug: "spring", ar: "سبرينغ", fr: "Spring" },
            { slug: "jogger", ar: "جوكر", fr: "Jogger" },
            { slug: "logan-mcv", ar: "لوغان MCV", fr: "Logan MCV" },
            { slug: "sandero-stepway", ar: "سانديرو ستيبواي", fr: "Sandero Stepway" },
            { slug: "pick-up", ar: "بيك أب", fr: "Pick-up" }
        ]
    },
    {
        slug: "renault",
        ar: "رونو",
        fr: "Renault",
        models: [
            { slug: "clio", ar: "كليو", fr: "Clio" },
            { slug: "megane", ar: "ميجان", fr: "Megane" },
            { slug: "kangoo", ar: "كانغو", fr: "Kangoo" },
            { slug: "captur", ar: "كابتور", fr: "Captur" },
            { slug: "kadjar", ar: "كاجار", fr: "Kadjar" },
            { slug: "talisman", ar: "تاليسمان", fr: "Talisman" },
            { slug: "scenic", ar: "سينيك", fr: "Scenic" },
            { slug: "symbol", ar: "سامبول", fr: "Symbol" },
            { slug: "master", ar: "ماستر", fr: "Master" },
            { slug: "traffic", ar: "ترافيك", fr: "Trafic" },
            { slug: "koleos", ar: "كوليوس", fr: "Koleos" },
            { slug: "express", ar: "إكسبرس", fr: "Express" },
            { slug: "arkana", ar: "أركانا", fr: "Arkana" },
            { slug: "austral", ar: "أوسترال", fr: "Austral" },
            { slug: "zoe", ar: "زوي", fr: "Zoe" }
        ]
    },
    {
        slug: "peugeot",
        ar: "بيجو",
        fr: "Peugeot",
        models: [
            { slug: "208", ar: "208", fr: "208" },
            { slug: "308", ar: "308", fr: "308" },
            { slug: "2008", ar: "2008", fr: "2008" },
            { slug: "3008", ar: "3008", fr: "3008" },
            { slug: "5008", ar: "5008", fr: "5008" },
            { slug: "partner", ar: "بارتنر", fr: "Partner" },
            { slug: "301", ar: "301", fr: "301" },
            { slug: "508", ar: "508", fr: "508" },
            { slug: "rifter", ar: "ريفتر", fr: "Rifter" },
            { slug: "boxer", ar: "بوكسر", fr: "Boxer" },
            { slug: "expert", ar: "إكسبرت", fr: "Expert" },
            { slug: "206", ar: "206", fr: "206" },
            { slug: "207", ar: "207", fr: "207" },
            { slug: "bipper", ar: "بيبر", fr: "Bipper" },
            { slug: "408", ar: "408", fr: "408" }
        ]
    },
    {
        slug: "citroen",
        ar: "سيتروين",
        fr: "Citroën",
        models: [
            { slug: "c3", ar: "C3", fr: "C3" },
            { slug: "c4", ar: "C4", fr: "C4" },
            { slug: "berlingo", ar: "بيرلينغو", fr: "Berlingo" },
            { slug: "c-elysee", ar: "سي إليزيه", fr: "C-Elysée" },
            { slug: "c3-aircross", ar: "C3 إيركروس", fr: "C3 Aircross" },
            { slug: "c5-aircross", ar: "C5 إيركروس", fr: "C5 Aircross" },
            { slug: "c5", ar: "C5", fr: "C5" },
            { slug: "c1", ar: "C1", fr: "C1" },
            { slug: "c4-cactus", ar: "C4 كاكتوس", fr: "C4 Cactus" },
            { slug: "jumpy", ar: "جامبي", fr: "Jumpy" },
            { slug: "jumper", ar: "جامبر", fr: "Jumper" },
            { slug: "ds3", ar: "DS3", fr: "DS3" },
            { slug: "ds4", ar: "DS4", fr: "DS4" },
            { slug: "ds5", ar: "DS5", fr: "DS5" },
            { slug: "ami", ar: "أمي", fr: "Ami" }
        ]
    },
    {
        slug: "volkswagen",
        ar: "فولكسفاغن",
        fr: "Volkswagen",
        models: [
            { slug: "golf", ar: "غولف", fr: "Golf" },
            { slug: "polo", ar: "بولو", fr: "Polo" },
            { slug: "passat", ar: "باسات", fr: "Passat" },
            { slug: "tiguan", ar: "تيغوان", fr: "Tiguan" },
            { slug: "touareg", ar: "طوارق", fr: "Touareg" },
            { slug: "caddy", ar: "كادي", fr: "Caddy" },
            { slug: "t-roc", ar: "تي روك", fr: "T-Roc" },
            { slug: "arteon", ar: "أرتيون", fr: "Arteon" },
            { slug: "jetta", ar: "جيتا", fr: "Jetta" },
            { slug: "amarok", ar: "أماروك", fr: "Amarok" },
            { slug: "scirocco", ar: "شيروكو", fr: "Scirocco" },
            { slug: "transporter", ar: "ترانسبورتر", fr: "Transporter" },
            { slug: "crafter", ar: "كرافتر", fr: "Crafter" },
            { slug: "touran", ar: "توران", fr: "Touran" },
            { slug: "id4", ar: "ID.4", fr: "ID.4" }
        ]
    },
    {
        slug: "audi",
        ar: "أودي",
        fr: "Audi",
        models: [
            { slug: "a1", ar: "A1", fr: "A1" },
            { slug: "a3", ar: "A3", fr: "A3" },
            { slug: "a4", ar: "A4", fr: "A4" },
            { slug: "a5", ar: "A5", fr: "A5" },
            { slug: "a6", ar: "A6", fr: "A6" },
            { slug: "a7", ar: "A7", fr: "A7" },
            { slug: "a8", ar: "A8", fr: "A8" },
            { slug: "q2", ar: "Q2", fr: "Q2" },
            { slug: "q3", ar: "Q3", fr: "Q3" },
            { slug: "q5", ar: "Q5", fr: "Q5" },
            { slug: "q7", ar: "Q7", fr: "Q7" },
            { slug: "q8", ar: "Q8", fr: "Q8" },
            { slug: "e-tron", ar: "إي ترون", fr: "e-tron" },
            { slug: "rs-3", ar: "RS 3", fr: "RS 3" },
            { slug: "tt", ar: "TT", fr: "TT" }
        ]
    },
    {
        slug: "bmw",
        ar: "بي إم دبليو",
        fr: "BMW",
        models: [
            { slug: "series-1", ar: "الفئة 1", fr: "Série 1" },
            { slug: "series-2", ar: "الفئة 2", fr: "Série 2" },
            { slug: "series-3", ar: "الفئة 3", fr: "Série 3" },
            { slug: "series-4", ar: "الفئة 4", fr: "Série 4" },
            { slug: "series-5", ar: "الفئة 5", fr: "Série 5" },
            { slug: "series-7", ar: "الفئة 7", fr: "Série 7" },
            { slug: "x1", ar: "X1", fr: "X1" },
            { slug: "x2", ar: "X2", fr: "X2" },
            { slug: "x3", ar: "X3", fr: "X3" },
            { slug: "x4", ar: "X4", fr: "X4" },
            { slug: "x5", ar: "X5", fr: "X5" },
            { slug: "x6", ar: "X6", fr: "X6" },
            { slug: "x7", ar: "X7", fr: "X7" },
            { slug: "m3", ar: "M3", fr: "M3" },
            { slug: "m4", ar: "M4", fr: "M4" }
        ]
    },
    {
        slug: "mercedes-benz",
        ar: "مرسيدس بنز",
        fr: "Mercedes-Benz",
        models: [
            { slug: "a-class", ar: "الفئة A", fr: "Classe A" },
            { slug: "b-class", ar: "الفئة B", fr: "Classe B" },
            { slug: "c-class", ar: "الفئة C", fr: "Classe C" },
            { slug: "e-class", ar: "الفئة E", fr: "Classe E" },
            { slug: "s-class", ar: "الفئة S", fr: "Classe S" },
            { slug: "cla", ar: "CLA", fr: "CLA" },
            { slug: "gla", ar: "GLA", fr: "GLA" },
            { slug: "glc", ar: "GLC", fr: "GLC" },
            { slug: "gle", ar: "GLE", fr: "GLE" },
            { slug: "gls", ar: "GLS", fr: "GLS" },
            { slug: "g-class", ar: "الفئة G", fr: "Classe G" },
            { slug: "amg-gt", ar: "AMG GT", fr: "AMG GT" },
            { slug: "vito", ar: "فيتو", fr: "Vito" },
            { slug: "sprinter", ar: "سبرينتر", fr: "Sprinter" },
            { slug: "eqc", ar: "EQC", fr: "EQC" }
        ]
    },
    {
        slug: "toyota",
        ar: "تويوتا",
        fr: "Toyota",
        models: [
            { slug: "yaris", ar: "ياريس", fr: "Yaris" },
            { slug: "corolla", ar: "كورولا", fr: "Corolla" },
            { slug: "c-hr", ar: "C-HR", fr: "C-HR" },
            { slug: "rav4", ar: "RAV4", fr: "RAV4" },
            { slug: "land-cruiser", ar: "لاند كروزر", fr: "Land Cruiser" },
            { slug: "prado", ar: "برادو", fr: "Prado" },
            { slug: "hilux", ar: "هايلكس", fr: "Hilux" },
            { slug: "fortuner", ar: "فورتشنر", fr: "Fortuner" },
            { slug: "aygo", ar: "أيغو", fr: "Aygo" },
            { slug: "auris", ar: "أوريس", fr: "Auris" },
            { slug: "avensis", ar: "أفينسيس", fr: "Avensis" },
            { slug: "camry", ar: "كامري", fr: "Camry" },
            { slug: "prius", ar: "بريوس", fr: "Prius" },
            { slug: "hiace", ar: "هايس", fr: "HiAce" },
            { slug: "supra", ar: "سوبرا", fr: "Supra" }
        ]
    },
    {
        slug: "hyundai",
        ar: "هيونداي",
        fr: "Hyundai",
        models: [
            { slug: "i10", ar: "i10", fr: "i10" },
            { slug: "i20", ar: "i20", fr: "i20" },
            { slug: "i30", ar: "i30", fr: "i30" },
            { slug: "i40", ar: "i40", fr: "i40" },
            { slug: "accent", ar: "أكسنت", fr: "Accent" },
            { slug: "elantra", ar: "إلانترا", fr: "Elantra" },
            { slug: "sonata", ar: "سوناتا", fr: "Sonata" },
            { slug: "tucson", ar: "توكسون", fr: "Tucson" },
            { slug: "santa-fe", ar: "سانتا في", fr: "Santa Fe" },
            { slug: "creta", ar: "كريتا", fr: "Creta" },
            { slug: "kona", ar: "كونا", fr: "Kona" },
            { slug: "h1", ar: "H1", fr: "H1" },
            { slug: "ioniq", ar: "أيونيك", fr: "Ioniq" },
            { slug: "ix35", ar: "ix35", fr: "ix35" },
            { slug: "atos", ar: "أتوس", fr: "Atos" }
        ]
    },
    {
        slug: "kia",
        ar: "كيا",
        fr: "Kia",
        models: [
            { slug: "picanto", ar: "بيكانتو", fr: "Picanto" },
            { slug: "rio", ar: "ريو", fr: "Rio" },
            { slug: "ceed", ar: "سيد", fr: "Ceed" },
            { slug: "cerato", ar: "سيراتو", fr: "Cerato" },
            { slug: "optima", ar: "أوبتيما", fr: "Optima" },
            { slug: "k5", ar: "K5", fr: "K5" },
            { slug: "sportage", ar: "سبورتاج", fr: "Sportage" },
            { slug: "sorento", ar: "سورينتو", fr: "Sorento" },
            { slug: "seltos", ar: "سيلتوس", fr: "Seltos" },
            { slug: "stonic", ar: "ستونيك", fr: "Stonic" },
            { slug: "niro", ar: "نيرو", fr: "Niro" },
            { slug: "soul", ar: "سول", fr: "Soul" },
            { slug: "carens", ar: "كارينز", fr: "Carens" },
            { slug: "carnival", ar: "كرنفال", fr: "Carnival" },
            { slug: "ev6", ar: "EV6", fr: "EV6" }
        ]
    },
    {
        slug: "nissan",
        ar: "نيسان",
        fr: "Nissan",
        models: [
            { slug: "micra", ar: "ميكرا", fr: "Micra" },
            { slug: "sunny", ar: "صني", fr: "Sunny" },
            { slug: "tiida", ar: "تيدا", fr: "Tiida" },
            { slug: "sentra", ar: "سنترا", fr: "Sentra" },
            { slug: "qashqai", ar: "قاشقاي", fr: "Qashqai" },
            { slug: "juke", ar: "جوك", fr: "Juke" },
            { slug: "x-trail", ar: "إكس تريل", fr: "X-Trail" },
            { slug: "navara", ar: "نافارا", fr: "Navara" },
            { slug: "pathfinder", ar: "باثفايندر", fr: "Pathfinder" },
            { slug: "patrol", ar: "باترول", fr: "Patrol" },
            { slug: "note", ar: "نوت", fr: "Note" },
            { slug: "kicks", ar: "كيكس", fr: "Kicks" },
            { slug: "leaf", ar: "ليف", fr: "Leaf" },
            { slug: "gt-r", ar: "GT-R", fr: "GT-R" },
            { slug: "ariya", ar: "أريا", fr: "Ariya" }
        ]
    },
    {
        slug: "ford",
        ar: "فورد",
        fr: "Ford",
        models: [
            { slug: "fiesta", ar: "فييستا", fr: "Fiesta" },
            { slug: "focus", ar: "فوكس", fr: "Focus" },
            { slug: "fusion", ar: "فيوجن", fr: "Fusion" },
            { slug: "mondeo", ar: "موندو", fr: "Mondeo" },
            { slug: "kuga", ar: "كوغا", fr: "Kuga" },
            { slug: "ecosport", ar: "إيكوسبورت", fr: "EcoSport" },
            { slug: "ranger", ar: "رانجر", fr: "Ranger" },
            { slug: "transit", ar: "ترانزيت", fr: "Transit" },
            { slug: "tourneo", ar: "تورنيو", fr: "Tourneo" },
            { slug: "mustang", ar: "موستانج", fr: "Mustang" },
            { slug: "edge", ar: "إيدج", fr: "Edge" },
            { slug: "explorer", ar: "إكسبلورر", fr: "Explorer" },
            { slug: "puma", ar: "بوما", fr: "Puma" },
            { slug: "c-max", ar: "C-Max", fr: "C-Max" },
            { slug: "s-max", ar: "S-Max", fr: "S-Max" }
        ]
    },
    {
        slug: "opel",
        ar: "أوبل",
        fr: "Opel",
        models: [
            { slug: "corsa", ar: "كورسا", fr: "Corsa" },
            { slug: "astra", ar: "أسترا", fr: "Astra" },
            { slug: "insignia", ar: "إنسيجنيا", fr: "Insignia" },
            { slug: "mokka", ar: "موكا", fr: "Mokka" },
            { slug: "crossland", ar: "كروس لاند", fr: "Crossland" },
            { slug: "grandland", ar: "جراند لاند", fr: "Grandland" },
            { slug: "zafira", ar: "زافيرا", fr: "Zafira" },
            { slug: "combo", ar: "كومبو", fr: "Combo" },
            { slug: "vivaro", ar: "فيفارو", fr: "Vivaro" },
            { slug: "movano", ar: "موفانو", fr: "Movano" },
            { slug: "adam", ar: "آدم", fr: "Adam" },
            { slug: "karl", ar: "كارل", fr: "Karl" },
            { slug: "meriva", ar: "ميريفا", fr: "Meriva" },
            { slug: "vectra", ar: "فيكترا", fr: "Vectra" },
            { slug: "tigra", ar: "تيجرا", fr: "Tigra" }
        ]
    },
    {
        slug: "fiat",
        ar: "فيات",
        fr: "Fiat",
        models: [
            { slug: "500", ar: "500", fr: "500" },
            { slug: "panda", ar: "باندا", fr: "Panda" },
            { slug: "tipo", ar: "تيبو", fr: "Tipo" },
            { slug: "punto", ar: "بونتو", fr: "Punto" },
            { slug: "doblo", ar: "دوبلو", fr: "Doblò" },
            { slug: "fiorino", ar: "فيورينو", fr: "Fiorino" },
            { slug: "ducato", ar: "دوكاتو", fr: "Ducato" },
            { slug: "qubo", ar: "كوبو", fr: "Qubo" },
            { slug: "500x", ar: "500X", fr: "500X" },
            { slug: "500l", ar: "500L", fr: "500L" },
            { slug: "fullback", ar: "فولباك", fr: "Fullback" },
            { slug: "uno", ar: "أونو", fr: "Uno" },
            { slug: "palio", ar: "باليو", fr: "Palio" },
            { slug: "linea", ar: "لينيا", fr: "Linea" },
            { slug: "bravo", ar: "برافو", fr: "Bravo" }
        ]
    },
    {
        slug: "seat",
        ar: "سيات",
        fr: "Seat",
        models: [
            { slug: "ibiza", ar: "إيبيزا", fr: "Ibiza" },
            { slug: "leon", ar: "ليون", fr: "Leon" },
            { slug: "ateca", ar: "أتيكا", fr: "Ateca" },
            { slug: "arona", ar: "أرونا", fr: "Arona" },
            { slug: "tarraco", ar: "تاراكو", fr: "Tarraco" },
            { slug: "toledo", ar: "توليدو", fr: "Toledo" },
            { slug: "alhambra", ar: "الحمراء", fr: "Alhambra" },
            { slug: "mii", ar: "مي", fr: "Mii" },
            { slug: "altea", ar: "ألتيا", fr: "Altea" },
            { slug: "exeo", ar: "إكسيو", fr: "Exeo" }
        ]
    },
    {
        slug: "skoda",
        ar: "سكودا",
        fr: "Skoda",
        models: [
            { slug: "octavia", ar: "أوكتافيا", fr: "Octavia" },
            { slug: "fabia", ar: "فابيا", fr: "Fabia" },
            { slug: "superb", ar: "سوبيرب", fr: "Superb" },
            { slug: "kodiaq", ar: "كودياك", fr: "Kodiaq" },
            { slug: "karoq", ar: "كاروك", fr: "Karoq" },
            { slug: "kamiq", ar: "كاميك", fr: "Kamiq" },
            { slug: "scala", ar: "سكالا", fr: "Scala" },
            { slug: "yeti", ar: "يتي", fr: "Yeti" },
            { slug: "rapid", ar: "رابيد", fr: "Rapid" },
            { slug: "citigo", ar: "سيتيغو", fr: "Citigo" }
        ]
    },
    {
        slug: "suzuki",
        ar: "سوزوكي",
        fr: "Suzuki",
        models: [
            { slug: "swift", ar: "سويفت", fr: "Swift" },
            { slug: "celerio", ar: "سيليريو", fr: "Celerio" },
            { slug: "baleno", ar: "بالينو", fr: "Baleno" },
            { slug: "jimny", ar: "جيمني", fr: "Jimny" },
            { slug: "vitara", ar: "فيتارا", fr: "Vitara" },
            { slug: "ignis", ar: "إجنيس", fr: "Ignis" },
            { slug: "sx4", ar: "SX4", fr: "SX4" },
            { slug: "alto", ar: "ألتو", fr: "Alto" },
            { slug: "ciaz", ar: "سياز", fr: "Ciaz" },
            { slug: "ertiga", ar: "إرتيجا", fr: "Ertiga" }
        ]
    },
    {
        slug: "honda",
        ar: "هوندا",
        fr: "Honda",
        models: [
            { slug: "civic", ar: "سيفيك", fr: "Civic" },
            { slug: "city", ar: "سيتي", fr: "City" },
            { slug: "accord", ar: "أكورد", fr: "Accord" },
            { slug: "cr-v", ar: "CR-V", fr: "CR-V" },
            { slug: "hr-v", ar: "HR-V", fr: "HR-V" },
            { slug: "jazz", ar: "جاز", fr: "Jazz" },
            { slug: "pilot", ar: "بايلوت", fr: "Pilot" },
            { slug: "odyssey", ar: "أوديسي", fr: "Odyssey" },
            { slug: "cr-z", ar: "CR-Z", fr: "CR-Z" }
        ]
    },
    {
        slug: "mazda",
        ar: "مازدا",
        fr: "Mazda",
        models: [
            { slug: "mazda-3", ar: "مازدا 3", fr: "Mazda 3" },
            { slug: "mazda-6", ar: "مازدا 6", fr: "Mazda 6" },
            { slug: "mazda-2", ar: "مازدا 2", fr: "Mazda 2" },
            { slug: "cx-3", ar: "CX-3", fr: "CX-3" },
            { slug: "cx-5", ar: "CX-5", fr: "CX-5" },
            { slug: "cx-30", ar: "CX-30", fr: "CX-30" },
            { slug: "cx-9", ar: "CX-9", fr: "CX-9" },
            { slug: "bt-50", ar: "BT-50", fr: "BT-50" },
            { slug: "mx-5", ar: "MX-5", fr: "MX-5" }
        ]
    },
    {
        slug: "mitsubishi",
        ar: "ميتسوبيشي",
        fr: "Mitsubishi",
        models: [
            { slug: "l200", ar: "L200", fr: "L200" },
            { slug: "pajero", ar: "باجيرو", fr: "Pajero" },
            { slug: "outlander", ar: "أوتلاندر", fr: "Outlander" },
            { slug: "asx", ar: "ASX", fr: "ASX" },
            { slug: "eclipse-cross", ar: "إكليبس كروس", fr: "Eclipse Cross" },
            { slug: "mirage", ar: "ميراج", fr: "Mirage" },
            { slug: "attrage", ar: "أتراج", fr: "Attrage" },
            { slug: "lancer", ar: "لانسر", fr: "Lancer" },
            { slug: "pajero-sport", ar: "باجيرو سبورت", fr: "Pajero Sport" }
        ]
    },
    {
        slug: "volvo",
        ar: "فولفو",
        fr: "Volvo",
        models: [
            { slug: "xc40", ar: "XC40", fr: "XC40" },
            { slug: "xc60", ar: "XC60", fr: "XC60" },
            { slug: "xc90", ar: "XC90", fr: "XC90" },
            { slug: "s60", ar: "S60", fr: "S60" },
            { slug: "s90", ar: "S90", fr: "S90" },
            { slug: "v40", ar: "V40", fr: "V40" },
            { slug: "v60", ar: "V60", fr: "V60" },
            { slug: "v90", ar: "V90", fr: "V90" },
            { slug: "c40", ar: "C40", fr: "C40" }
        ]
    },
    {
        slug: "land-rover",
        ar: "لاند روفر",
        fr: "Land Rover",
        models: [
            { slug: "range-rover", ar: "رنج روفر", fr: "Range Rover" },
            { slug: "range-rover-sport", ar: "رنج روفر سبورت", fr: "Range Rover Sport" },
            { slug: "range-rover-evoque", ar: "إيفوك", fr: "Range Rover Evoque" },
            { slug: "range-rover-velar", ar: "فيلار", fr: "Range Rover Velar" },
            { slug: "defender", ar: "ديفندر", fr: "Defender" },
            { slug: "discovery", ar: "ديسكفري", fr: "Discovery" },
            { slug: "discovery-sport", ar: "ديسكفري سبورت", fr: "Discovery Sport" },
            { slug: "freelander", ar: "فريلاندر", fr: "Freelander" }
        ]
    },
    {
        slug: "jeep",
        ar: "جيب",
        fr: "Jeep",
        models: [
            { slug: "wrangler", ar: "رانجلر", fr: "Wrangler" },
            { slug: "grand-cherokee", ar: "جراند شيروكي", fr: "Grand Cherokee" },
            { slug: "cherokee", ar: "شيروكي", fr: "Cherokee" },
            { slug: "compass", ar: "كومباس", fr: "Compass" },
            { slug: "renegade", ar: "رينيجيد", fr: "Renegade" }
        ]
    },
    {
        slug: "mini",
        ar: "ميني",
        fr: "Mini",
        models: [
            { slug: "cooper", ar: "كوبر", fr: "Cooper" },
            { slug: "countryman", ar: "كونتري مان", fr: "Countryman" },
            { slug: "clubman", ar: "كلوب مان", fr: "Clubman" },
            { slug: "paceman", ar: "بيسمان", fr: "Paceman" },
            { slug: "convertible", ar: "كابريوليه", fr: "Convertible" }
        ]
    },
    {
        slug: "tesla",
        ar: "تسلا",
        fr: "Tesla",
        models: [
            { slug: "model-3", ar: "موديل 3", fr: "Model 3" },
            { slug: "model-y", ar: "موديل Y", fr: "Model Y" },
            { slug: "model-s", ar: "موديل S", fr: "Model S" },
            { slug: "model-x", ar: "موديل X", fr: "Model X" }
        ]
    },
    {
        slug: "porsche",
        ar: "بورش",
        fr: "Porsche",
        models: [
            { slug: "cayenne", ar: "كايين", fr: "Cayenne" },
            { slug: "macan", ar: "ماكان", fr: "Macan" },
            { slug: "panamera", ar: "باناميرا", fr: "Panamera" },
            { slug: "911", ar: "911", fr: "911" },
            { slug: "taycan", ar: "تايكان", fr: "Taycan" },
            { slug: "boxster", ar: "بوكستر", fr: "Boxster" }
        ]
    },
    {
        slug: "chevrolet",
        ar: "شيفروليه",
        fr: "Chevrolet",
        models: [
            { slug: "spark", ar: "سبارك", fr: "Spark" },
            { slug: "aveo", ar: "أفيو", fr: "Aveo" },
            { slug: "cruze", ar: "كروز", fr: "Cruze" },
            { slug: "malibu", ar: "ماليبو", fr: "Malibu" },
            { slug: "captiva", ar: "كابتيفا", fr: "Captiva" },
            { slug: "trax", ar: "تراكس", fr: "Trax" },
            { slug: "equinox", ar: "إيكوينوكس", fr: "Equinox" },
            { slug: "traverse", ar: "ترافيرس", fr: "Traverse" },
            { slug: "tahoe", ar: "تاهو", fr: "Tahoe" },
            { slug: "silverado", ar: "سيلفرادو", fr: "Silverado" }
        ]
    },
    {
        slug: "dodge",
        ar: "دودج",
        fr: "Dodge",
        models: [
            { slug: "charger", ar: "تشارجر", fr: "Charger" },
            { slug: "challenger", ar: "تشالنجر", fr: "Challenger" },
            { slug: "durango", ar: "دورانجو", fr: "Durango" },
            { slug: "journey", ar: "جورني", fr: "Journey" },
            { slug: "grand-caravan", ar: "جراند كارافان", fr: "Grand Caravan" },
            { slug: "ram", ar: "رام", fr: "RAM" }
        ]
    },
    {
        slug: "jaguar",
        ar: "جاغوار",
        fr: "Jaguar",
        models: [
            { slug: "xe", ar: "XE", fr: "XE" },
            { slug: "xf", ar: "XF", fr: "XF" },
            { slug: "xj", ar: "XJ", fr: "XJ" },
            { slug: "f-pace", ar: "F-Pace", fr: "F-Pace" },
            { slug: "e-pace", ar: "E-Pace", fr: "E-Pace" },
            { slug: "f-type", ar: "F-Type", fr: "F-Type" },
            { slug: "i-pace", ar: "I-Pace", fr: "I-Pace" }
        ]
    },
    {
        slug: "subaru",
        ar: "سوبارو",
        fr: "Subaru",
        models: [
            { slug: "impreza", ar: "إمبريزا", fr: "Impreza" },
            { slug: "xv", ar: "XV", fr: "XV" },
            { slug: "forester", ar: "فورستر", fr: "Forester" },
            { slug: "outback", ar: "أوتباك", fr: "Outback" },
            { slug: "legacy", ar: "ليغاسي", fr: "Legacy" },
            { slug: "brz", ar: "BRZ", fr: "BRZ" },
            { slug: "wrx", ar: "WRX", fr: "WRX" }
        ]
    },
    {
        slug: "lexus",
        ar: "لكزس",
        fr: "Lexus",
        models: [
            { slug: "is", ar: "IS", fr: "IS" },
            { slug: "es", ar: "ES", fr: "ES" },
            { slug: "gs", ar: "GS", fr: "GS" },
            { slug: "ls", ar: "LS", fr: "LS" },
            { slug: "nx", ar: "NX", fr: "NX" },
            { slug: "rx", ar: "RX", fr: "RX" },
            { slug: "ux", ar: "UX", fr: "UX" },
            { slug: "gx", ar: "GX", fr: "GX" },
            { slug: "lx", ar: "LX", fr: "LX" },
            { slug: "lc", ar: "LC", fr: "LC" }
        ]
    },
    {
        slug: "alfa-romeo",
        ar: "ألفا روميو",
        fr: "Alfa Romeo",
        models: [
            { slug: "giulia", ar: "جوليا", fr: "Giulia" },
            { slug: "stelvio", ar: "ستيلفيو", fr: "Stelvio" },
            { slug: "giulietta", ar: "جولييتا", fr: "Giulietta" },
            { slug: "tonale", ar: "تونالي", fr: "Tonale" },
            { slug: "mito", ar: "ميتو", fr: "MiTo" }
        ]
    },
    {
        slug: "mg",
        ar: "إم جي",
        fr: "MG",
        models: [
            { slug: "zs", ar: "ZS", fr: "ZS" },
            { slug: "hs", ar: "HS", fr: "HS" },
            { slug: "rx5", ar: "RX5", fr: "RX5" },
            { slug: "5", ar: "MG 5", fr: "MG 5" },
            { slug: "6", ar: "MG 6", fr: "MG 6" },
            { slug: "marvel-r", ar: "Marvel R", fr: "Marvel R" },
            { slug: "ehs", ar: "EHS", fr: "EHS" },
            { slug: "zs-ev", ar: "ZS EV", fr: "ZS EV" },
            { slug: "3", ar: "MG 3", fr: "MG 3" },
            { slug: "gt", ar: "GT", fr: "GT" }
        ]
    },
    {
        slug: "chery",
        ar: "شيري",
        fr: "Chery",
        models: [
            { slug: "tiggo-2", ar: "تيجو 2", fr: "Tiggo 2" },
            { slug: "tiggo-3", ar: "تيجو 3", fr: "Tiggo 3" },
            { slug: "tiggo-4", ar: "تيجو 4", fr: "Tiggo 4" },
            { slug: "tiggo-5", ar: "تيجو 5", fr: "Tiggo 5" },
            { slug: "tiggo-7", ar: "تيجو 7", fr: "Tiggo 7" },
            { slug: "tiggo-8", ar: "تيجو 8", fr: "Tiggo 8" },
            { slug: "arrizo-5", ar: "أريزو 5", fr: "Arrizo 5" },
            { slug: "arrizo-6", ar: "أريزو 6", fr: "Arrizo 6" },
            { slug: "qq", ar: "QQ", fr: "QQ" }
        ]
    },
    {
        slug: "changan",
        ar: "شانجان",
        fr: "Changan",
        models: [
            { slug: "cs35", ar: "CS35", fr: "CS35" },
            { slug: "cs55", ar: "CS55", fr: "CS55" },
            { slug: "cs75", ar: "CS75", fr: "CS75" },
            { slug: "cs85", ar: "CS85", fr: "CS85" },
            { slug: "cs95", ar: "CS95", fr: "CS95" },
            { slug: "eado", ar: "إيادو", fr: "Eado" },
            { slug: "alsvin", ar: "ألسفين", fr: "Alsvin" },
            { slug: "uni-t", ar: "UNI-T", fr: "UNI-T" },
            { slug: "uni-k", ar: "UNI-K", fr: "UNI-K" }
        ]
    },
    {
        slug: "haval",
        ar: "هافال",
        fr: "Haval",
        models: [
            { slug: "h2", ar: "H2", fr: "H2" },
            { slug: "h6", ar: "H6", fr: "H6" },
            { slug: "h9", ar: "H9", fr: "H9" },
            { slug: "jolion", ar: "جوليون", fr: "Jolion" },
            { slug: "big-dog", ar: "بيج دوج", fr: "Big Dog" },
            { slug: "dargo", ar: "دارغو", fr: "Dargo" },
            { slug: "f7", ar: "F7", fr: "F7" }
        ]
    },
    {
        slug: "great-wall",
        ar: "جريت وول",
        fr: "Great Wall",
        models: [
            { slug: "wingle-5", ar: "وينجل 5", fr: "Wingle 5" },
            { slug: "wingle-7", ar: "وينجل 7", fr: "Wingle 7" },
            { slug: "poer", ar: "بور", fr: "Poer" },
            { slug: "cannon", ar: "كانون", fr: "Cannon" }
        ]
    },
    {
        slug: "geely",
        ar: "جيلي",
        fr: "Geely",
        models: [
            { slug: "coolray", ar: "كولراي", fr: "Coolray" },
            { slug: "azkarra", ar: "أزكارا", fr: "Azkarra" },
            { slug: "okavango", ar: "أوكافانغو", fr: "Okavango" },
            { slug: "emgrand", ar: "إمجراند", fr: "Emgrand" },
            { slug: "gc9", ar: "GC9", fr: "GC9" },
            { slug: "atlas", ar: "أطلس", fr: "Atlas" },
            { slug: "tugella", ar: "توجيلا", fr: "Tugella" }
        ]
    },
    {
        slug: "dfsk",
        ar: "دي إف إس كي",
        fr: "DFSK",
        models: [
            { slug: "glory-580", ar: "جلوري 580", fr: "Glory 580" },
            { slug: "glory-500", ar: "جلوري 500", fr: "Glory 500" },
            { slug: "glory-330", ar: "جلوري 330", fr: "Glory 330" },
            { slug: "c37", ar: "C37", fr: "C37" },
            { slug: "mini-truck", ar: "ميني تراك", fr: "Mini Truck" },
            { slug: "k01", ar: "K01", fr: "K01" }
        ]
    },
    {
        slug: "ssangyong",
        ar: "سانغ يونغ",
        fr: "SsangYong",
        models: [
            { slug: "tivoli", ar: "تيفولي", fr: "Tivoli" },
            { slug: "korando", ar: "كوراندو", fr: "Korando" },
            { slug: "rexton", ar: "ريكستون", fr: "Rexton" },
            { slug: "musso", ar: "موسو", fr: "Musso" },
            { slug: "xlv", ar: "XLV", fr: "XLV" },
            { slug: "rodius", ar: "روديوس", fr: "Rodius" }
        ]
    },
    {
        slug: "isuzu",
        ar: "إيسوزو",
        fr: "Isuzu",
        models: [
            { slug: "d-max", ar: "D-Max", fr: "D-Max" },
            { slug: "mu-x", ar: "MU-X", fr: "MU-X" },
            { slug: "npr", ar: "NPR", fr: "NPR" },
            { slug: "nqr", ar: "NQR", fr: "NQR" },
            { slug: "elf", ar: "إلف", fr: "Elf" }
        ]
    },
    {
        slug: "gac",
        ar: "جي أي سي",
        fr: "GAC",
        models: [
            { slug: "gs3", ar: "GS3", fr: "GS3" },
            { slug: "gs4", ar: "GS4", fr: "GS4" },
            { slug: "gs5", ar: "GS5", fr: "GS5" },
            { slug: "gs8", ar: "GS8", fr: "GS8" },
            { slug: "ga4", ar: "GA4", fr: "GA4" },
            { slug: "ga6", ar: "GA6", fr: "GA6" },
            { slug: "empow", ar: "إمباو", fr: "Empow" }
        ]
    },
    {
        slug: "byd",
        ar: "بي واي دي",
        fr: "BYD",
        models: [
            { slug: "tang", ar: "تانغ", fr: "Tang" },
            { slug: "han", ar: "هان", fr: "Han" },
            { slug: "song", ar: "سونغ", fr: "Song" },
            { slug: "yuan", ar: "يوان", fr: "Yuan" },
            { slug: "atto-3", ar: "أتو 3", fr: "Atto 3" },
            { slug: "dolphin", ar: "دولفين", fr: "Dolphin" },
            { slug: "seal", ar: "سيل", fr: "Seal" },
            { slug: "f3", ar: "F3", fr: "F3" }
        ]
    },
    {
        slug: "daihatsu",
        ar: "دايهاتسو",
        fr: "Daihatsu",
        models: [
            { slug: "terios", ar: "تيريوس", fr: "Terios" },
            { slug: "sirion", ar: "سيريون", fr: "Sirion" },
            { slug: "materia", ar: "ماتيريا", fr: "Materia" },
            { slug: "gran-max", ar: "جران ماكس", fr: "Gran Max" },
            { slug: "rocky", ar: "روكي", fr: "Rocky" }
        ]
    },
    {
        slug: "infiniti",
        ar: "إنفينيتي",
        fr: "Infiniti",
        models: [
            { slug: "q50", ar: "Q50", fr: "Q50" },
            { slug: "q60", ar: "Q60", fr: "Q60" },
            { slug: "q70", ar: "Q70", fr: "Q70" },
            { slug: "qx50", ar: "QX50", fr: "QX50" },
            { slug: "qx55", ar: "QX55", fr: "QX55" },
            { slug: "qx60", ar: "QX60", fr: "QX60" },
            { slug: "qx80", ar: "QX80", fr: "QX80" }
        ]
    },
    {
        slug: "cadillac",
        ar: "كاديلاك",
        fr: "Cadillac",
        models: [
            { slug: "ct4", ar: "CT4", fr: "CT4" },
            { slug: "ct5", ar: "CT5", fr: "CT5" },
            { slug: "xt4", ar: "XT4", fr: "XT4" },
            { slug: "xt5", ar: "XT5", fr: "XT5" },
            { slug: "xt6", ar: "XT6", fr: "XT6" },
            { slug: "escalade", ar: "إسكاليد", fr: "Escalade" }
        ]
    },
    {
        slug: "gmc",
        ar: "جي إم سي",
        fr: "GMC",
        models: [
            { slug: "sierra", ar: "سييرا", fr: "Sierra" },
            { slug: "yukon", ar: "يوكن", fr: "Yukon" },
            { slug: "acadia", ar: "أكاديا", fr: "Acadia" },
            { slug: "terrain", ar: "تيرين", fr: "Terrain" },
            { slug: "canyon", ar: "كانيون", fr: "Canyon" },
            { slug: "savana", ar: "سافانا", fr: "Savana" }
        ]
    },
    {
        slug: "chrysler",
        ar: "كرايسلر",
        fr: "Chrysler",
        models: [
            { slug: "300", ar: "300", fr: "300" },
            { slug: "pacifica", ar: "باسيفيكا", fr: "Pacifica" },
            { slug: "voyager", ar: "فوياجر", fr: "Voyager" }
        ]
    },
    {
        slug: "cupra",
        ar: "كوبرا",
        fr: "Cupra",
        models: [
            { slug: "leon", ar: "ليون", fr: "Leon" },
            { slug: "formentor", ar: "فورمنتور", fr: "Formentor" },
            { slug: "born", ar: "بورن", fr: "Born" },
            { slug: "ateca", ar: "أتيكا", fr: "Ateca" }
        ]
    },
    {
        slug: "ds",
        ar: "دي إس",
        fr: "DS",
        models: [
            { slug: "ds3", ar: "DS 3", fr: "DS 3" },
            { slug: "ds4", ar: "DS 4", fr: "DS 4" },
            { slug: "ds5", ar: "DS 5", fr: "DS 5" },
            { slug: "ds7", ar: "DS 7", fr: "DS 7" },
            { slug: "ds9", ar: "DS 9", fr: "DS 9" }
        ]
    }
];

export function getBrandName(brand: CarBrand | undefined, locale: string): string {
    if (!brand) return '';
    return locale === 'ar' ? brand.ar : brand.fr;
}

export function getModelName(model: CarModel | undefined, locale: string): string {
    if (!model) return '';
    return locale === 'ar' ? model.ar : model.fr;
}
