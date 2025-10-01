// Константы типов объектов размещения
// Соответствуют данным из таблицы listing_types в БД

export interface ListingType {
  id: number;
  slug: string;
  name: string;
}

export const LISTING_TYPES: ListingType[] = [
  { id: 1, slug: "hotel", name: "Отель" },
  { id: 2, slug: "apartment", name: "Апартаменты" },
  { id: 3, slug: "hostel", name: "Хостел" },
  { id: 4, slug: "guest_house", name: "Гостевой дом" }
];

// Хелперы для работы с типами объектов
export const getListingTypeBySlug = (slug: string): ListingType | undefined => {
  return LISTING_TYPES.find(type => type.slug === slug);
};

export const getListingTypeById = (id: number): ListingType | undefined => {
  return LISTING_TYPES.find(type => type.id === id);
};
