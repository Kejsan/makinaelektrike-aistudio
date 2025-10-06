import { Dealer, Model, DealerModel, BlogPost } from '../types';

// Data derived from CSV files
export const initialDealers: Dealer[] = [
    { id: "1", name: "Connect Drive (BYD Electric Cars Albania)", address: "Siri Kodra Street, Tirana, Albania", city: "Tirana", lat: 41.3389, lng: 19.8245, phone: "+355 69 941 4270", email: "info@connectgroup.al", website: "https://connectdrive.al", social_links: { instagram: "@connectdrive_byd", facebook: "Facebook" }, brands: ["BYD"], modelsAvailable: ["BYD Atto 3", "BYD Dolphin", "BYD Han EV", "BYD Song", "BYD Seagull", "BYD Sealion", "BYD Yuan"], typeOfCars: "New (custom orders)", languages: ["Albanian", "English"], notes: "Official BYD partner in Albania with up to 6-year warranty; offers custom orders and full support", image_url: "https://picsum.photos/seed/connect-drive/800/600", isFeatured: true },
    { id: "2", name: "Albanian Motor Company (Hyundai)", address: "Autostrada Tiranë – Durrës, Km 2, Mëzez, Tiranë", city: "Tirana", lat: 41.3315, lng: 19.7788, phone: "+355 67 40 44 406", website: "https://www.hyundai.al", social_links: { instagram: "@hyundaimotors.albania", facebook: "Facebook" }, brands: ["Hyundai"], modelsAvailable: ["Kona Electric", "IONIQ 5", "IONIQ 6", "Tucson Hybrid"], typeOfCars: "New", languages: ["Albanian", "English"], notes: "Official Hyundai dealer; provides sales, service and test drives; 5-year warranty. Service phone: +355 67 55 22 285", image_url: "https://picsum.photos/seed/albanian-motor/800/600", isFeatured: true },
    { id: "3", name: "MG Motor Albania", address: "Auto. Tirana – Durres, Km 10, Kashar, Tirana", city: "Tirana", lat: 41.3488, lng: 19.7186, phone: "+355 69 440 1111", email: "mg@grandautomotive.hr", website: "https://www.mgmotor.al", social_links: { instagram: "@mgmotoralbania", facebook: "Facebook" }, brands: ["MG Motor"], modelsAvailable: ["MG ZS EV", "MG 4", "MG 5", "MG Marvel R", "MG EHS"], typeOfCars: "New", languages: ["Albanian", "English"], notes: "Part of Albanian Motor Company; sells electric and hybrid MG models", image_url: "https://picsum.photos/seed/mg-motor/800/600", isFeatured: true },
    { id: "4", name: "iDrive", address: "Rruga e Kavajes, nd. 4, h. nr 26, Tirane", city: "Tirana", lat: 41.3259, lng: 19.8142, phone: "+355 69 70 22 802", email: "gimitushka@yahoo.com", website: "", social_links: { instagram: "@idrive_eev", facebook: "Facebook" }, brands: ["Various EV Brands"], modelsAvailable: ["Varies (imports EVs on demand)"], typeOfCars: "New and used", languages: ["Albanian"], notes: "Importer and reseller of electric vehicles; sells EVs through social media and classifieds. WhatsApp: +355 69 70 22 802, Other phone: +355 69 702 3002", image_url: "https://picsum.photos/seed/idrive/800/600", isFeatured: true },
    { id: "5", name: "Mechatronic Auto", address: "Kashar, Albania", city: "Tirana", lat: 41.3545, lng: 19.7305, phone: "+355 69 10 00 00", email: "info@mechatronicauto.al", website: "https://mechatronicauto.al", social_links: { instagram: "@mechatronicauto_al", facebook: "Facebook" }, brands: ["BYD", "AutoEV"], modelsAvailable: ["BYD Dolphin", "AutoEV R200", "AutoEV R300", "and other EVs"], typeOfCars: "New", languages: ["Albanian", "English"], notes: "Provides EV sales, service and charging solutions; sells electric cars and scooters. Other phone: +355 69 10 00 01", image_url: "https://picsum.photos/seed/mechatronic-auto/800/600" },
    { id: "6", name: "ECA Electric Cars Albania", address: "Autostrada Tiranë-Elbasan KM.2 (TEG-Tiranë, Godina Park Place)", city: "Tirana", lat: 41.3168, lng: 19.8973, phone: "+355 67 40 23 808", email: "info@eca.al", website: "https://eca.al", social_links: { instagram: "@electric_cars_albania", facebook: "Facebook", twitter: "Twitter", youtube: "YouTube" }, brands: ["Tesla", "Toyota", "Honda", "Volkswagen", "SRM", "GEAK"], modelsAvailable: ["Honda e-NS1", "VW ID.3 Pure", "VW ID.4 Pro Performance", "VW ID.6 Pro Performance", "Toyota BZ4X", "Tesla Model Y Dual Motor", "SRM Van"], typeOfCars: "New", languages: ["Albanian", "English"], notes: "Showroom near TEG; test drive booking available; chargers and services", image_url: "https://picsum.photos/seed/eca-electric/800/600" },
    { id: "7", name: "Tirana Electric Motors", address: "Autostrada Tiranë – Durrës KM.5", city: "Tirana", lat: 41.3399, lng: 19.7479, phone: "+355 69 20 63 834", website: "https://tiranaelectricmotors.com", social_links: { instagram: "Tirana Electric Motors", twitter: "Twitter", youtube: "YouTube" }, brands: ["Neta Auto", "BYD", "Volkswagen", "Maxus", "Audi", "Xpeng"], modelsAvailable: ["BYD Song Plus", "BYD Yuan Plus", "BYD Tang L", "Volkswagen ID.3 Pure Long Range", "Volkswagen ID.6 X Pro", "Maxus Dana V1", "Audi Q4 e-Tron", "Xpeng G9", "BYD Sealion 07"], typeOfCars: "New", languages: ["Albanian", "English"], priceRange: "€18,999–33,999", notes: "Official distributor of Neta Auto; provides charging stations and technical assistance", image_url: "https://picsum.photos/seed/tirana-electric/800/600" },
    { id: "8", name: "Panda Electric Motors", address: "Fshati Mëzez, Njësia Administrative Kashar, Tiranë", city: "Tirana", lat: 41.3325, lng: 19.7616, phone: "+355 68 902 5777", email: "ebegaj3@gmail.com", website: "N/A", social_links: { instagram: "@panda_electric_motors", facebook: "Facebook" }, brands: ["BYD", "Aion", "Zeekr"], modelsAvailable: ["BYD Tang", "BYD Yuan Plus", "Aion V", "Aion Y"], typeOfCars: "New", languages: ["Albanian"], notes: "Specializes in importing new EVs with 0 km; offers service and parts. Former website: pe-motors.com", image_url: "https://picsum.photos/seed/panda-electric/800/600" },
    { id: "9", name: "AutoEuropa", address: "Autostrada Km 5, Durrës – Tiranë, Durrës 2019, Albania (Sukth)", city: "Durrës", lat: 41.3508, lng: 19.5397, phone: "+355 69 700 6655", email: "info@autoeuropa.com.al", website: "https://autoeuropa.com.al", social_links: { facebook: "AutoEuropa", instagram: "Instagram" }, brands: ["Volkswagen"], modelsAvailable: ["Volkswagen ID.4 Pro", "Volkswagen ID.6 Pro", "Volkswagen ID.3 Pure"], typeOfCars: "New and Used", languages: ["Albanian", "English"], priceRange: "€27,900–46,900", notes: "Showroom in Sukth near Durrës; 24/7 customer support", image_url: "https://picsum.photos/seed/autoeuropa/800/600" },
    { id: "10", name: "Go Electric Albania", address: "Rruga Dervish Hima 3, Kullat, Kulla Nr 3, Kati 1, Tirana", city: "Tirana", lat: 41.3225, lng: 19.8187, phone: "+355 67 208 3625", email: "gfc_al@yahoo.com", website: "N/A", social_links: { instagram: "@goelectric_albania", facebook: "Facebook" }, brands: ["BYD", "Avatr", "Zeekr", "Denza"], modelsAvailable: ["Denza N8", "Avatr 12", "BYD Sealion"], typeOfCars: "New", languages: ["Albanian"], notes: "Provides 5-year/100,000 km warranty on vehicles; imports and sells EVs. Other email: xhorxhidusha@icloud.com", image_url: "https://picsum.photos/seed/go-electric/800/600" },
    { id: "11", name: "SENA EV SH.P.K", address: "Qerekë, Krujë", city: "Krujë", lat: 41.4883, lng: 19.7153, phone: "+355 69 347 3384", email: "senaelectricvehicle@gmail.com", website: "http://www.senaelectricvehicle.al", social_links: { instagram: "@sena.electricvehicle", facebook: "Facebook" }, brands: ["BYD", "Avatr", "Aion"], modelsAvailable: ["BYD Song L", "BYD Sealion", "Avatr", "Aion series"], typeOfCars: "New", languages: ["Albanian"], notes: "Offers vehicles by order; provides maintenance and repair services", image_url: "https://picsum.photos/seed/sena-ev/800/600" },
    { id: "12", name: "Electric Vehicle Albania (EVA)", address: "Rruga Pjeter Bogdani, Lagja 14, Yzberish, Tirana 1050", city: "Tirana", lat: 41.3175, lng: 19.7891, phone: "+355 69 581 0531", email: "electricvehiclealbania@gmail.com", website: "", social_links: { instagram: "@eva_auto_electric_albania", facebook: "Facebook" }, brands: ["BYD", "Aion", "Zeekr", "Hozon"], modelsAvailable: ["BYD G9 Max", "Zeekr X", "Aion V Pro", "Aion Y Plus", "BYD Song Plus", "BYD Yuan Plus"], typeOfCars: "New", languages: ["Albanian"], notes: "Sells 100% electric cars with 0 km; offers WhatsApp contact for quotes", image_url: "https://picsum.photos/seed/eva-albania/800/600" },
];

export const initialModels: Model[] = [
    { id: "1", brand: "Honda", model_name: "e:Ny1 (e:NS1)", body_type: "Compact SUV", battery_capacity: 68.8, range_wltp: 412, power_kw: 150, torque_nm: 310, acceleration_0_100: 7.6, top_speed: 160, drive_type: "FWD", seats: 5, charging_ac: "11 kW", charging_dc: "150 kW", image_url: 'https://picsum.photos/seed/honda-eny1/800/600', isFeatured: true },
    { id: "2", brand: "Volkswagen", model_name: "ID.3 Pro", body_type: "Hatchback", battery_capacity: 62, range_wltp: 429, power_kw: 150, torque_nm: 310, acceleration_0_100: 7.3, top_speed: 160, drive_type: "RWD", seats: 5, charging_ac: "11 kW", charging_dc: "120 kW", image_url: 'https://picsum.photos/seed/vw-id3/800/600', isFeatured: true },
    { id: "3", brand: "Volkswagen", model_name: "ID.4 Pro", body_type: "Mid-size SUV", battery_capacity: 82, range_wltp: 574, power_kw: 210, torque_nm: 545, acceleration_0_100: 6.7, top_speed: 180, drive_type: "AWD", seats: 5, charging_ac: "11 kW", charging_dc: "175 kW", image_url: 'https://picsum.photos/seed/vw-id4/800/600', isFeatured: true },
    { id: "4", brand: "Volkswagen", model_name: "ID.6 X Pro", body_type: "Large SUV", battery_capacity: 83.4, range_wltp: 588, power_kw: 152, acceleration_0_100: 6.6, top_speed: 160, drive_type: "AWD", seats: 7, image_url: 'https://picsum.photos/seed/vw-id6/800/600', isFeatured: true },
    { id: "5", brand: "Toyota", model_name: "bZ4X AWD", body_type: "Compact SUV", battery_capacity: 71.4, range_wltp: 461, power_kw: 160, torque_nm: 336, acceleration_0_100: 6.9, top_speed: 160, drive_type: "AWD", seats: 5, charging_ac: "11 kW", charging_dc: "150 kW", image_url: 'https://picsum.photos/seed/toyota-bz4x/800/600' },
    { id: "6", brand: "Tesla", model_name: "Model Y Long Range AWD", body_type: "Mid-size SUV", battery_capacity: 78.1, range_wltp: 542, power_kw: 378, torque_nm: 493, acceleration_0_100: 5, top_speed: 217, drive_type: "AWD", seats: 5, charging_ac: "11 kW", charging_dc: "250 kW", image_url: 'https://picsum.photos/seed/tesla-y/800/600' },
    { id: "7", brand: "BYD", model_name: "Atto 3 (Yuan Plus)", body_type: "Compact SUV", battery_capacity: 60.5, range_wltp: 420, power_kw: 150, torque_nm: 310, acceleration_0_100: 7.3, top_speed: 160, drive_type: "FWD", seats: 5, charging_ac: "6.6 kW", charging_dc: "80 kW", image_url: 'https://picsum.photos/seed/byd-atto3/800/600' },
    { id: "8", brand: "BYD", model_name: "Dolphin", body_type: "Hatchback", battery_capacity: 60.4, range_wltp: 427, power_kw: 150, torque_nm: 310, acceleration_0_100: 7, top_speed: 160, drive_type: "FWD", seats: 5, charging_dc: "88 kW", image_url: 'https://picsum.photos/seed/byd-dolphin/800/600' },
    { id: "9", brand: "BYD", model_name: "Han EV", body_type: "Luxury Sedan", battery_capacity: 85.4, range_wltp: 521, power_kw: 380, torque_nm: 700, acceleration_0_100: 3.9, top_speed: 180, drive_type: "AWD", seats: 5, charging_ac: "7 kW", charging_dc: "120 kW", image_url: 'https://picsum.photos/seed/byd-han/800/600' },
    { id: "10", brand: "Zeekr", model_name: "X Privilege AWD", body_type: "Compact SUV", battery_capacity: 69, range_wltp: 400, power_kw: 315, torque_nm: 543, acceleration_0_100: 3.8, top_speed: 180, drive_type: "AWD", seats: 5, charging_dc: "150 kW", image_url: 'https://picsum.photos/seed/zeekr-x/800/600' },
    { id: "11", brand: "Hyundai", model_name: "Kona Electric", body_type: "Compact SUV", battery_capacity: 68.5, range_wltp: 514, power_kw: 160, torque_nm: 255, acceleration_0_100: 7.8, top_speed: 170, drive_type: "FWD", seats: 5, charging_ac: "11 kW", charging_dc: "105 kW", image_url: 'https://picsum.photos/seed/hyundai-kona/800/600' },
    { id: "12", brand: "Hyundai", model_name: "IONIQ 5", body_type: "Crossover SUV", battery_capacity: 84, range_wltp: 570, power_kw: 168, torque_nm: 350, acceleration_0_100: 7.5, top_speed: 185, drive_type: "RWD", seats: 5, charging_ac: "11 kW", charging_dc: "263 kW", image_url: 'https://picsum.photos/seed/hyundai-ioniq5/800/600' },
    { id: "13", brand: "Hyundai", model_name: "IONIQ 6", body_type: "Sedan", battery_capacity: 77.4, range_wltp: 614, power_kw: 168, torque_nm: 350, acceleration_0_100: 7.4, top_speed: 185, drive_type: "RWD", seats: 5, charging_ac: "11 kW", charging_dc: "233 kW", image_url: 'https://picsum.photos/seed/hyundai-ioniq6/800/600' },
    { id: "14", brand: "MG Motor", model_name: "MG ZS EV", body_type: "Compact SUV", battery_capacity: 72.6, range_wltp: 440, power_kw: 115, torque_nm: 280, acceleration_0_100: 8.4, top_speed: 175, drive_type: "FWD", seats: 5, charging_ac: "7.4 kW", charging_dc: "94 kW", image_url: 'https://picsum.photos/seed/mg-zs/800/600' },
    { id: "15", brand: "MG Motor", model_name: "MG 4", body_type: "Hatchback", battery_capacity: 64, range_wltp: 450, power_kw: 150, torque_nm: 250, acceleration_0_100: 7.9, top_speed: 160, drive_type: "RWD", seats: 5, charging_ac: "6.6 kW", charging_dc: "142 kW", image_url: 'https://picsum.photos/seed/mg-4/800/600' },
    { id: "16", brand: "Hyundai", model_name: "Tucson Plug-in Hybrid", body_type: "Compact SUV (PHEV)", battery_capacity: 13.8, range_wltp: 56, power_kw: 195, torque_nm: 350, acceleration_0_100: null, top_speed: 191, drive_type: "AWD", seats: 5, charging_ac: "7.2 kW", charging_dc: null, image_url: 'https://picsum.photos/seed/hyundai-tucson-phev/800/600' },
    { id: "17", brand: "AutoEV", model_name: "R200", body_type: "Electric Scooter", battery_capacity: null, range_wltp: 130, power_kw: 3.5, torque_nm: null, acceleration_0_100: null, top_speed: 100, drive_type: "Electric two-wheeler", seats: 2, charging_ac: "Unknown", charging_dc: null, image_url: 'https://picsum.photos/seed/autoev-r200/800/600' },
    { id: "18", brand: "AutoEV", model_name: "RX200", body_type: "Electric Scooter", battery_capacity: null, range_wltp: 150, power_kw: 4, torque_nm: null, acceleration_0_100: null, top_speed: 120, drive_type: "Electric two-wheeler", seats: 2, charging_ac: "Unknown", charging_dc: null, image_url: 'https://picsum.photos/seed/autoev-rx200/800/600' },
    { id: "19", brand: "Maxus", model_name: "Dana V1", body_type: "Electric Van", battery_capacity: 51, range_wltp: 350, power_kw: 122, torque_nm: null, acceleration_0_100: null, top_speed: 100, drive_type: "FWD", seats: 2, charging_ac: null, charging_dc: "80% in 45 min", image_url: 'https://picsum.photos/seed/maxus-dana-v1/800/600' },
    { id: "20", brand: "BYD", model_name: "Sealion 07", body_type: "Mid-size SUV", battery_capacity: 82.5, range_wltp: 456, power_kw: 390, torque_nm: 690, acceleration_0_100: 4.5, top_speed: 215, drive_type: "AWD", seats: 5, charging_ac: "11 kW", charging_dc: "150 kW", image_url: 'https://picsum.photos/seed/byd-sealion07/800/600' },
    { id: "21", brand: "BYD", model_name: "Seagull (Long Range)", body_type: "City Hatchback", battery_capacity: 38.88, range_wltp: 405, power_kw: 55, torque_nm: 135, acceleration_0_100: null, top_speed: 130, drive_type: "FWD", seats: 5, charging_ac: "6.6 kW", charging_dc: "40 kW", image_url: 'https://picsum.photos/seed/byd-seagull/800/600' },
    { id: "22", brand: "BYD", model_name: "Seal (RWD)", body_type: "Mid-size Sedan", battery_capacity: 82.5, range_wltp: 570, power_kw: 230, torque_nm: 360, acceleration_0_100: 5.9, top_speed: 180, drive_type: "RWD", seats: 5, charging_ac: "11 kW", charging_dc: "150 kW", image_url: 'https://picsum.photos/seed/byd-seal-rwd/800/600' },
    { id: "23", brand: "BYD", model_name: "Seal (AWD)", body_type: "Mid-size Sedan", battery_capacity: 82.5, range_wltp: 520, power_kw: 390, torque_nm: 670, acceleration_0_100: 3.8, top_speed: 180, drive_type: "AWD", seats: 5, charging_ac: "11 kW", charging_dc: "150 kW", image_url: 'https://picsum.photos/seed/byd-seal-awd/800/600' },
    { id: "24", brand: "Xpeng", model_name: "G9 AWD Long Range", body_type: "Mid-size SUV", battery_capacity: 98, range_wltp: 520, power_kw: 405, torque_nm: 717, acceleration_0_100: 3.9, top_speed: 200, drive_type: "AWD", seats: 5, charging_ac: "11 kW", charging_dc: "300 kW", image_url: 'https://picsum.photos/seed/xpeng-g9/800/600' },
    { id: "25", brand: "MG Motor", model_name: "MG5 EV Long Range", body_type: "Estate/Wagon", battery_capacity: 61.1, range_wltp: 400, power_kw: 115, torque_nm: 280, acceleration_0_100: 7.7, top_speed: 185, drive_type: "FWD", seats: 5, charging_ac: "11 kW", charging_dc: "87 kW", image_url: 'https://picsum.photos/seed/mg-5/800/600' },
    { id: "26", brand: "MG Motor", model_name: "Marvel R Performance", body_type: "Compact SUV", battery_capacity: 75, range_wltp: 370, power_kw: 212, torque_nm: 665, acceleration_0_100: 4.9, top_speed: 200, drive_type: "Tri-motor AWD", seats: 5, charging_ac: "11 kW", charging_dc: "94 kW", image_url: 'https://picsum.photos/seed/mg-marvel-r/800/600' },
    { id: "27", brand: "MG Motor", model_name: "EHS Plug-in Hybrid", body_type: "Compact SUV (PHEV)", battery_capacity: 16.6, range_wltp: 52, power_kw: 190, torque_nm: 370, acceleration_0_100: 6.9, top_speed: 190, drive_type: "FWD", seats: 5, charging_ac: "3.7 kW", charging_dc: null, image_url: 'https://picsum.photos/seed/mg-ehs-phev/800/600' },
    { id: "28", brand: "SRM", model_name: "T3L EV", body_type: "Cargo Van", battery_capacity: 42, range_wltp: 290, power_kw: 60, torque_nm: null, acceleration_0_100: null, top_speed: 80, drive_type: "FWD", seats: 2, charging_ac: "Inaccurate", charging_dc: null, image_url: 'https://picsum.photos/seed/srm-t3l/800/600' },
    { id: "29", brand: "BYD", model_name: "Tang AWD", body_type: "Full-size SUV", battery_capacity: 89, range_wltp: 400, power_kw: 380, torque_nm: 680, acceleration_0_100: 4.6, top_speed: 180, drive_type: "AWD", seats: 7, charging_ac: "7.4 kW", charging_dc: "110 kW", image_url: 'https://picsum.photos/seed/byd-tang/800/600' },
    { id: "30", brand: "BYD", model_name: "Song Plus EV", body_type: "Mid-size SUV", battery_capacity: 71.7, range_wltp: 505, power_kw: 137, torque_nm: 280, acceleration_0_100: 7.7, top_speed: 180, drive_type: "FWD", seats: 5, charging_ac: "6.6 kW", charging_dc: "90 kW", image_url: 'https://picsum.photos/seed/byd-song-plus/800/600' },
    { id: "31", brand: "BYD", model_name: "Song L", body_type: "Large Hatchback/SUV", battery_capacity: 87, range_wltp: 662, power_kw: 386, torque_nm: null, acceleration_0_100: 4.3, top_speed: 201, drive_type: "AWD", seats: 5, charging_ac: null, charging_dc: null, image_url: 'https://picsum.photos/seed/byd-song-l/800/600' },
    { id: "32", brand: "GAC Aion", model_name: "Y Plus", body_type: "Compact MPV/SUV", battery_capacity: 63, range_wltp: 610, power_kw: 150, torque_nm: null, acceleration_0_100: 8.5, top_speed: 150, drive_type: "FWD", seats: 5, charging_ac: null, charging_dc: "80 kW", image_url: 'https://picsum.photos/seed/gac-aion-y-plus/800/600' },
    { id: "33", brand: "GAC Aion", model_name: "V", body_type: "Compact SUV", battery_capacity: 72.3, range_wltp: 600, power_kw: 135, torque_nm: null, acceleration_0_100: null, top_speed: 175, drive_type: "FWD", seats: 5, charging_ac: "Unknown", charging_dc: null, image_url: 'https://picsum.photos/seed/gac-aion-v/800/600' },
    { id: "34", brand: "Denza", model_name: "N8 PHEX", body_type: "Luxury SUV (PHEV)", battery_capacity: 45.8, range_wltp: 216, power_kw: 360, torque_nm: 675, acceleration_0_100: 4.3, top_speed: 190, drive_type: "AWD (PHEV)", seats: 7, charging_ac: null, charging_dc: "90 kW", image_url: 'https://picsum.photos/seed/denza-n8/800/600' },
    { id: "35", brand: "Avatr", model_name: "12 RWD", body_type: "Executive Sedan", battery_capacity: 94.5, range_wltp: 700, power_kw: 230, torque_nm: 370, acceleration_0_100: 6.7, top_speed: 215, drive_type: "RWD", seats: 5, charging_ac: "Unknown", charging_dc: null, image_url: 'https://picsum.photos/seed/avatr-12-rwd/800/600' },
    { id: "36", brand: "Avatr", model_name: "12 AWD", body_type: "Executive Sedan", battery_capacity: 94.5, range_wltp: 650, power_kw: 425, torque_nm: 650, acceleration_0_100: 3.9, top_speed: 220, drive_type: "AWD", seats: 5, charging_ac: "Unknown", charging_dc: null, image_url: 'https://picsum.photos/seed/avatr-12-awd/800/600' }
];

// Inferred many-to-many relationships
export const initialDealerModels: DealerModel[] = [
    // Connect Drive (id: 1)
    { dealer_id: "1", model_id: "7" }, { dealer_id: "1", model_id: "8" }, { dealer_id: "1", model_id: "9" }, { dealer_id: "1", model_id: "20" }, { dealer_id: "1", model_id: "21" }, { dealer_id: "1", model_id: "30" },
    // Albanian Motor Company (id: 2)
    { dealer_id: "2", model_id: "11" }, { dealer_id: "2", model_id: "12" }, { dealer_id: "2", model_id: "13" }, { dealer_id: "2", model_id: "16" },
    // MG Motor Albania (id: 3)
    { dealer_id: "3", model_id: "14" }, { dealer_id: "3", model_id: "15" }, { dealer_id: "3", model_id: "25" }, { dealer_id: "3", model_id: "26" }, { dealer_id: "3", model_id: "27" },
    // iDrive (id: 4) - no specific models
    // Mechatronic Auto (id: 5)
    { dealer_id: "5", model_id: "8" }, { dealer_id: "5", model_id: "17" }, { dealer_id: "5", model_id: "18" },
    // ECA Electric Cars (id: 6)
    { dealer_id: "6", model_id: "1" }, { dealer_id: "6", model_id: "2" }, { dealer_id: "6", model_id: "3" }, { dealer_id: "6", model_id: "4" }, { dealer_id: "6", model_id: "5" }, { dealer_id: "6", model_id: "6" }, { dealer_id: "6", model_id: "28" },
    // Tirana Electric Motors (id: 7)
    { dealer_id: "7", model_id: "7" }, { dealer_id: "7", model_id: "20" }, { dealer_id: "7", model_id: "24" }, { dealer_id: "7", model_id: "29" }, { dealer_id: "7", model_id: "30" }, { dealer_id: "7", model_id: "2" }, { dealer_id: "7", model_id: "4" }, { dealer_id: "7", model_id: "19" },
    // Panda Electric Motors (id: 8)
    { dealer_id: "8", model_id: "7" }, { dealer_id: "8", model_id: "29" }, { dealer_id: "8", model_id: "32" }, { dealer_id: "8", model_id: "33" },
    // AutoEuropa (id: 9)
    { dealer_id: "9", model_id: "2" }, { dealer_id: "9", model_id: "3" }, { dealer_id: "9", model_id: "4" },
    // Go Electric Albania (id: 10)
    { dealer_id: "10", model_id: "20" }, { dealer_id: "10", model_id: "34" }, { dealer_id: "10", model_id: "35" }, { dealer_id: "10", model_id: "36" },
    // SENA EV SH.P.K (id: 11)
    { dealer_id: "11", model_id: "20" }, { dealer_id: "11", model_id: "31" }, { dealer_id: "11", model_id: "32" }, { dealer_id: "11", model_id: "33" }, { dealer_id: "11", model_id: "35" }, { dealer_id: "11", model_id: "36" },
    // Electric Vehicle Albania (EVA) (id: 12)
    { dealer_id: "12", model_id: "7" }, { dealer_id: "12", model_id: "10" }, { dealer_id: "12", model_id: "24" }, { dealer_id: "12", model_id: "30" }, { dealer_id: "12", model_id: "32" }, { dealer_id: "12", model_id: "33" },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'makina-elektrike-vs-djegie-te-brendshme',
    title: 'Makina Elektrike vs. Makinë me Djegie të Brendshme: Cila Është Zgjedhja e Duhur për Ju?',
    excerpt: 'Zbuloni dallimet kryesore të kostos, mirëmbajtjes, performancës dhe ndikimit mjedisor për të zgjedhur makinën ideale për familjen tuaj.',
    author: 'Makina Elektrike',
    date: '2024-07-20',
    imageUrl: 'https://images.unsplash.com/photo-1617813488995-3493f8e903ac?auto=format&fit=crop&w=1200&q=80',
    readTime: '8 minuta lexim',
    metaDescription: 'Krahasim i detajuar mes makinave elektrike dhe atyre me djegie të brendshme për tregun shqiptar. Shikoni kostot, performancën dhe ndikimin mjedisor.',
    keywords: [
      'makina elektrike',
      'makina me djegie të brendshme',
      'krahasim EV',
      'kosto mirëmbajtjeje',
      'shpenzim karburanti',
      'mobilitet i gjelbër Shqipëri'
    ],
    sections: [
      {
        paragraphs: [
          'Shqipëria po përqafon gjithnjë e më shumë mobilitetin elektrik, ndërsa çmimet e karburanteve dhe normat e ndotjes vazhdojnë të rriten. Për të marrë një vendim të informuar, është thelbësore të kuptoni diferencat mes një makine elektrike (EV) dhe një makine me motor me djegie të brendshme (ICE). Ky udhëzues përdor të dhënat më të fundit nga tregu ynë dhe tendencat evropiane për të theksuar avantazhet dhe kompromiset e secilës teknologji.'
        ]
      },
      {
        heading: 'Kostoja totale e pronësisë',
        paragraphs: [
          'Ndërsa çmimi fillestar i një EV-je mund të duket më i lartë, kostoja totale e pronësisë në 5–7 vite rezulton shpesh më e ulët falë energjisë së lirë elektrike, taksave të reduktuara dhe mirëmbajtjes minimale. Një makinë me djegie kërkon ndryshime të shpeshta vaji, filtri dhe riparime të motorit që rrisin shpenzimet afatgjata.',
          'Në Shqipëri, karikimi në shtëpi kushton mesatarisht 4–5 herë më pak se furnizimi me karburant të njëjtit kilometrazh. Nëse kombinoni këtë kursim me subvencionet e mundshme bashkiake për instalimin e wallbox-eve, EV-të bëhen ekonomikisht të favorshme.'
        ],
        bullets: [
          'Kosto mesatare karburanti për 1 000 km: 160 € (ICE) vs. 35 € (EV).',
          'Mirëmbajtja mujore: rreth 50 € për ICE krahasuar me 15 € për EV.',
          'Vlera e rishitjes për EV-të po rritet me mbi 7% në vit sipas raporteve europiane.'
        ]
      },
      {
        heading: 'Performanca dhe përvoja e drejtimit',
        paragraphs: [
          'Makineritë elektrike ofrojnë çift rrotullues të menjëhershëm, duke siguruar përshpejtim linear dhe të qetë. Për qytetet si Tirana, kjo përkthehet në manovrim më të sigurt dhe më pak stres në trafik të dendur. Modelet e reja ofrojnë modalitete eco, sport dhe snow që përshtaten me terrene të ndryshme shqiptare.'
        ],
        bullets: [
          'Zhurmë e reduktuar me mbi 40% krahasuar me motorët me benzinë.',
          'Më pak vibrime dhe konsum i frena-ve falë frenimit rigjenerues.',
          'Qendra më e ulët e gravitetit që rrit stabilitetin në kthesat malore.'
        ]
      },
      {
        heading: 'Ndikimi mjedisor',
        paragraphs: [
          'Një EV prodhon zero emetime lokale CO₂ dhe redukton ndjeshëm zhurmën urbane. Edhe duke llogaritur prodhimin e baterive, cikli jetësor i një EV-je mbetet më pak ndotës. Për familjet shqiptare që duan të minimizojnë gjurmën e karbonit, kombinimi i karikimit nga panele diellore me një tarifë nate nga OSHEE maksimizon kursimet dhe qëndrueshmërinë.'
        ],
        bullets: [
          'Reduktim deri në 60% të emetimeve totale në 10 vite përdorimi.',
          'Benefite nga bashkitë për parkime të gjelbra dhe hyrje në zona të kufizuara.',
          'Mundësi për të përdorur energji të rinovueshme familjare.'
        ]
      },
      {
        heading: 'Kur ka kuptim të zgjidhni ICE',
        paragraphs: [
          'Ka ende skenarë ku një makinë me djegie të brendshme mund të jetë më praktike—veçanërisht nëse jetoni në zona pa infrastrukturë karikimi ose udhëtoni shpesh distanca shumë të gjata pa akses në stacione të shpejta. Megjithatë, me zgjerimin e rrjetit të karikimit publik dhe hyrjen e modeleve të reja me autonomi mbi 500 km, këto pengesa po zvogëlohen vazhdimisht.'
        ]
      },
      {
        heading: 'Përfundimi',
        paragraphs: [
          'Nëse kërkoni kursim afatgjatë, komoditet urban dhe impakt të ulët mjedisor, një makinë elektrike është zgjedhja e duhur. Mbani parasysh profilin tuaj të drejtimit, buxhetin fillestar dhe aksesin në karikim për të përzgjedhur modelin që i përshtatet më shumë nevojave tuaja.'
        ]
      }
    ]
  },
  {
    id: '2',
    slug: 'mite-rreth-makinave-elektrike',
    title: '5 Mite Rreth Makinave Elektrike që Duhet t\'i Harroni',
    excerpt: 'Demaskojmë keqkuptimet më të shpeshta rreth makinave elektrike për t\'ju ndihmuar të investoni me besim në teknologjinë e re.',
    author: 'Makina Elektrike',
    date: '2024-07-15',
    imageUrl: 'https://images.unsplash.com/photo-1617814066081-b7aa0cec7782?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 minuta lexim',
    metaDescription: 'Zbuloni të vërtetën pas 5 miteve më të zakonshme për makinat elektrike: autonomia, karikimi, kostoja, mirëmbajtja dhe performanca.',
    keywords: [
      'mite makinat elektrike',
      'ankthi i autonomisë',
      'karikimi në Shqipëri',
      'kosto EV',
      'mirëmbajtje EV'
    ],
    sections: [
      {
        paragraphs: [
          'Në tregun shqiptar ende qarkullojnë shumë mite që i bëjnë blerësit të hezitojnë ndaj makinave elektrike. Duke u bazuar në përvojën e pronarëve ekzistues dhe statistika nga prodhuesit kryesorë, ne sqarojmë pesë keqkuptimet kryesore për t\'ju afruar më shumë vendimit të duhur.'
        ]
      },
      {
        heading: 'Miti 1: “Autonomia nuk mjafton për udhëtimet e mia”',
        paragraphs: [
          'Modelet e reja arrijnë lehtësisht 350–550 km me një karikim të vetëm, që është më shumë sesa distanca Tiranë–Sarandë me një ndalesë sigurie. Duke planifikuar karikimin në shtëpi gjatë natës, EV-ja juaj është gjithmonë gati për përditshmërinë.'
        ],
        bullets: [
          'Stacione të reja të shpejta po instalohen përgjatë korridorit Tiranë–Durrës.',
          'Aplikacionet e karikimit lokal (p.sh. Elda Charge) ofrojnë hartë të azhurnuar të pikave publike.',
          'Frenimi rigjenerues rrit autonominë deri në 10% në trafikun urban.'
        ]
      },
      {
        heading: 'Miti 2: “Karikimi zgjat shumë”',
        paragraphs: [
          'Karikimi AC në shtëpi është i menduar për orët e natës; me një wallbox 11 kW plotësoni baterinë brenda 6–8 orësh. Në udhëtime të gjata përdorni karikuesit DC ku 20–80% arrihet për 25–35 minuta, kohë e mjaftueshme për një pushim kafeje.'
        ]
      },
      {
        heading: 'Miti 3: “Mirëmbajtja është e komplikuar”',
        paragraphs: [
          'EV-të kanë rreth 70% më pak pjesë lëvizëse se makinat me djegie. Nuk ka nevojë për ndërrim vaji, filtra karburanti apo rripa. Kontrollet periodike fokusohen te frenat, gomat dhe përditësimet software, duke e bërë mirëmbajtjen më të lirë dhe të parashikueshme.'
        ]
      },
      {
        heading: 'Miti 4: “Makinat elektrike janë shumë të shtrenjta”',
        paragraphs: [
          'Çmimet fillestare po bien dhe ofertat e financimit po shtohen. Kur përfshini kursimet nga energjia, taksat e reduktuara dhe mirëmbajtja minimale, kostoja reale mujore mund të jetë më e ulët se një SUV dizel i së njëjtës klasë.'
        ],
        bullets: [
          'Bankat shqiptare po ofrojnë kredi të gjelbra me norma interesi të favorshme.',
          'Shumë importe të reja vijnë me garanci 6–8 vjeçare për baterinë.',
          'Sigurimi i detyrueshëm është shpesh më i lirë për EV falë asistencës aktive të sigurisë.'
        ]
      },
      {
        heading: 'Miti 5: “Performanca bie në dimër”',
        paragraphs: [
          'Temperaturat e ulëta ndikojnë te çdo bateri, por prodhuesit kanë integruar menaxhim termik aktiv. Duke përfituar nga para-ngrohja përmes aplikacionit dhe karikimit të rregullt, humbja e autonomisë mbahet në 10–15%, e ngjashme me rritjen e konsumit të naftës në dimër.'
        ]
      },
      {
        heading: 'Fjalët e fundit',
        paragraphs: [
          'Teknologjia elektrike është testuar tashmë në tregjet më të mëdha dhe rezultatet janë pozitive. Koha për të thyer mitet ka ardhur, kështu që fokusohuni te nevojat tuaja reale dhe testoni një EV përpara se të merrni vendimin përfundimtar.'
        ]
      }
    ]
  },
  {
    id: '3',
    slug: 'zgjedhja-stacionit-karikimit-ne-shtepi',
    title: 'Si të Zgjidhni Stacionin e Duhur të Karikimit në Shtëpi?',
    excerpt: 'Udhëzues hap pas hapi për llojet e wallbox-eve, fuqinë, siguritë dhe kostot e instalimit për shoferët shqiptarë të makinave elektrike.',
    author: 'Makina Elektrike',
    date: '2024-07-10',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    readTime: '7 minuta lexim',
    metaDescription: 'Mësoni si të zgjidhni karikuesin ideal në shtëpi: fazë e vetme apo trefazore, fuqia, kabllot, subvencionet dhe licencat e nevojshme në Shqipëri.',
    keywords: [
      'stacion karikimi në shtëpi',
      'wallbox Shqipëri',
      'instalim karikuesi EV',
      'karikim trefazor',
      'subvencione energjie'
    ],
    sections: [
      {
        paragraphs: [
          'Karikimi në shtëpi është mënyra më komode dhe ekonomike për të mbajtur EV-në të gatshme. Zgjedhja e wallbox-it të duhur varet nga rrjeti elektrik i banesës, modeli i makinës dhe buxheti juaj. Ja si të ndërmerrni hapat e duhur pa surpriza.'
        ]
      },
      {
        heading: 'Vlerësoni infrastrukturën elektrike ekzistuese',
        paragraphs: [
          'Filloni me verifikimin e fuqisë së kontraktuar nga OSHEE. Shumica e apartamenteve kanë 5.5 kW, çka mund të kërkojë një rritje të kapacitetit për wallbox 11 kW. Konsultohuni me një elektrik të licencuar për të matur kabllot dhe për të kontrolluar panele të ndarë tokëzimi.'
        ],
        bullets: [
          'Sigurohuni që siguresat e përgjithshme të jenë të klasës C ose B.',
          'Përdorni kabllo të dedikuar 5x6 mm² për instalime trefazore.',
          'Instaloni mbrojtje ndaj rrjedhjeve DC (RCD Tipi B ose A-EV).' 
        ]
      },
      {
        heading: 'Zgjidhni fuqinë dhe lidhjen',
        paragraphs: [
          'Wallbox-et 7.4 kW (faza e vetme) janë të mjaftueshme për shumicën e EV-ve kompakte, duke shtuar rreth 35–40 km autonomi në orë karikimi. Nëse makina juaj mbështet karikim trefazor, një wallbox 11 kW ose 22 kW shkurton kohën ndjeshëm dhe është ideale për familje me dy automjete.'
        ],
        bullets: [
          'Kontrolloni në manual nëse automjeti pranon karikim 3-fazor.',
          'Wallbox 22 kW kërkon kontratë energjie >13 kW dhe instalim profesional.',
          'Zgjidhni kabllo Type 2 të fiksuar nëse parkoni gjithmonë në të njëjtin vend.'
        ]
      },
      {
        heading: 'Funksione smart dhe siguria',
        paragraphs: [
          'Zgjedhja e një wallbox-i inteligjent ju lejon të programoni karikimin gjatë tarifave të natës, të monitoroni konsumin përmes aplikacionit dhe të ndaloni aksesin e paautorizuar. Modelet me komunikim OCPP integrohen lehtësisht me menaxherë energjie ose panele diellore.'
        ],
        bullets: [
          'Autentikimi RFID për ndërtesa të përbashkëta.',
          'Mundësi “load balancing” për të shmangur fikjen e siguresave.',
          'Integrim me inverter fotovoltaik për karikim nga energjia diellore.'
        ]
      },
      {
        heading: 'Kosto, subvencione dhe dokumentacion',
        paragraphs: [
          'Çmimi i wallbox-it varion nga 450 € deri në 1 200 € në varësi të markës dhe funksioneve. Instalimi profesional në Shqipëri kushton zakonisht 150–300 €. Kontrolloni nismat bashkiake për subvencione dhe përgatitni dokumentet për rritje fuqie pranë OSHEE nëse është e nevojshme.'
        ]
      },
      {
        heading: 'Përfundimi',
        paragraphs: [
          'Duke zgjedhur pajisjen e duhur dhe instalues profesionist, ju siguroni karikim të shpejtë, të sigurt dhe ekonomik në shtëpi. Kjo është baza për një përvojë të këndshme me makinën tuaj elektrike.'
        ]
      }
    ]
  },
  {
    id: '4',
    slug: 'makinat-elektrike-per-familjet-ne-shqiperi',
    title: 'Top 7 Makinat Elektrike më të Përshtatshme për Familjet në Shqipëri',
    excerpt: 'Lista jonë e përzgjedhur e modeleve familjare me hapësirë, teknologji sigurie dhe autonomi të shkëlqyer për rrugët shqiptare.',
    author: 'Makina Elektrike',
    date: '2024-07-05',
    imageUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13f?auto=format&fit=crop&w=1200&q=80',
    readTime: '9 minuta lexim',
    metaDescription: 'Zbuloni 7 makinat elektrike më të mira për familjet në Shqipëri me hapësirë të bollshme, siguri të avancuar dhe autonomi të lartë.',
    keywords: [
      'makina elektrike familjare',
      'SUV elektrik Shqipëri',
      'modele EV 7 vende',
      'siguria EV',
      'autonomi e lartë'
    ],
    sections: [
      {
        paragraphs: [
          'Familjet shqiptare kërkojnë automjete që kombinojnë hapësirën, sigurinë dhe ekonominë. Duke analizuar modelet e disponueshme te shitësit tanë partnerë, kemi zgjedhur 7 opsionet më të mira që mbulojnë kategori të ndryshme buxheti dhe madhësie.'
        ]
      },
      {
        heading: '1. Tesla Model Y Long Range',
        paragraphs: [
          'Modeli më i shitur në Evropë falë autonomisë 542 km WLTP, përshpejtimit 0-100 km/h për 5 sekonda dhe hapësirës së madhe bagazhi. Ideale për udhëtime familjare dhe pushime të gjata brenda rajonit.',
          'Kabina minimaliste ofron ekran 15 inç me navigim “trip planner” që sugjeron stacionet DC në rrugët kombëtare.'
        ],
        bullets: [
          'Bagazh 854 litra dhe sedilje të pasme të palosshme 40/20/40.',
          'Autopilot standard me frenim emergjent dhe “lane keep assist”.',
          'Rrjet i gjerë Supercharger në Mal të Zi dhe Maqedoninë e Veriut për udhëtime ndërkufitare.'
        ]
      },
      {
        heading: '2. Hyundai IONIQ 5 (84 kWh)',
        paragraphs: [
          'Platformë 800V që mbështet karikim ultra të shpejtë 10-80% në 18 minuta në karikues 350 kW. Dysheme e sheshtë dhe rreshta të lëvizshëm japin hapësirë të bollshme për fëmijët dhe bagazh.'
        ],
        bullets: [
          'Funksion V2L për të furnizuar kampingun ose pajisjet e punës.',
          'Sedilje relaksi me shtrirje për udhëtime të gjata.',
          'Paketa e sigurisë SmartSense me 7 airbagë dhe monitorim kënd i verbër.'
        ]
      },
      {
        heading: '3. Volkswagen ID.4 Pro',
        paragraphs: [
          'SUV me dy motorë dhe autonomi 574 km që ofron kombinim të mirë mes çmimit dhe teknologjisë. ID.4 ka sistem infotainment të përditësueshëm “over the air” dhe sedilje të rehatshme për udhëtime në terrenet e ndryshme të vendit.'
        ]
      },
      {
        heading: '4. BYD Tang AWD',
        paragraphs: [
          'SUV 7-vendesh me interier premium, ekran rrotullues 15.6 inç dhe paketë sigurie “DiPilot”. Autonomi 400 km WLTP dhe garanci baterie 8 vite/160 000 km e bëjnë një zgjedhje të sigurt për familjet e mëdha.'
        ],
        bullets: [
          'Ftohje dhe ngrohje sediljesh në dy rreshtat e parë.',
          'Sistem audio 12 altoparlantësh nga Dirac.',
          'Ngarkesë maksimale 1 500 kg për rimorkio të lehta.'
        ]
      },
      {
        heading: '5. MG Marvel R',
        paragraphs: [
          'Cross-over sportiv me tri motorë dhe funksione premium për një çmim të arritshëm. Ofrohet me mbështetje teknike në Shqipëri dhe garanci të zgjeruar për komponentët elektrikë.'
        ]
      },
      {
        heading: '6. Toyota bZ4X AWD',
        paragraphs: [
          'Për familjet që kërkojnë siguri dhe besueshmëri, bZ4X sjell platformën e re e-TNGA me sistem AWD aktiv dhe paketë të plotë Toyota Safety Sense. Kabina e gjerë dhe materiali rezistent ndaj njollave e bëjnë praktik për përdorim ditor.'
        ]
      },
      {
        heading: '7. GAC Aion Y Plus',
        paragraphs: [
          'MPV kompakt me konfigurim fleksibël sediljesh dhe autonomi 610 km CLTC. E përkryer për familjet urbane që duan hapësirë të brendshme pa sakrifikuar efikasitetin.'
        ]
      },
      {
        heading: 'Si të zgjidhni modelin ideal',
        paragraphs: [
          'Përpara se të firmosni kontratën, testoni mënyrën e drejtimit, kontrolloni opsionet e karikimit në qytetin tuaj dhe vlerësoni paketat e garancisë. Mos harroni të konsideroni kostot e sigurimit dhe aksesin në servise të autorizuara brenda vendit.'
        ]
      }
    ]
  }
];

const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 500));

export const getDealers = () => simulateDelay(initialDealers);
export const getModels = () => simulateDelay(initialModels);

export const getDealerById = (id: string) => 
  simulateDelay(initialDealers.find(d => d.id === id));

export const getModelById = (id: string) => 
  simulateDelay(initialModels.find(m => m.id === id));

export const getModelsByDealerId = (dealerId: string) => {
    const modelIds = initialDealerModels
        .filter(dm => dm.dealer_id === dealerId)
        .map(dm => dm.model_id);
    const models = initialModels.filter(m => modelIds.includes(m.id));
    return simulateDelay(models);
};

export const getDealersByModelId = (modelId: string) => {
    const dealerIds = initialDealerModels
        .filter(dm => dm.model_id === modelId)
        .map(dm => dm.dealer_id);
    const dealers = initialDealers.filter(d => dealerIds.includes(d.id));
    return simulateDelay(dealers);
};
  
export const getBlogPosts = () => simulateDelay(blogPosts);
export const getBlogPostBySlug = (slug: string) =>
  simulateDelay(blogPosts.find(post => post.slug === slug));