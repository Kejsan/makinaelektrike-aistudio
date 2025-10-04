
export interface Dealer {
  id: string;
  name: string;
  companyName?: string;
  contactName?: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  social_links?: { facebook?: string; instagram?: string; twitter?: string; youtube?: string; };
  brands: string[];
  languages: string[];
  notes?: string;
  typeOfCars: string;
  priceRange?: string;
  modelsAvailable: string[];
  image_url?: string;
  isFeatured?: boolean;
  approved?: boolean;
  ownerUid?: string;
  imageGallery?: string[];
}

export interface Model {
  id: string;
  brand: string;
  model_name: string;
  ownerDealerId?: string;
  createdBy?: string;
  updatedBy?: string;
  body_type?: string;
  battery_capacity?: number; // in kWh
  range_wltp?: number; // in km
  power_kw?: number; // in kW
  torque_nm?: number; // in Nm
  acceleration_0_100?: number; // in s
  top_speed?: number; // in km/h
  drive_type?: string;
  seats?: number;
  charging_ac?: string;
  charging_dc?: string;
  notes?: string;
  image_url?: string;
  isFeatured?: boolean;
}

export interface DealerModel {
  dealer_id: string;
  model_id: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
}
