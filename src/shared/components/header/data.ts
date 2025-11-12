export interface MenuItem {
  name: string;
  path: string;
}

export interface DropdownMenuProps {
  label: string;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  closeDropdowns: () => void;
  items: { pages: MenuItem[]; path: string | null | undefined };
}

export enum FEATURES {
  HOME = "home",
  LISTINGS = "listings",
  BLOGS = "blogs",
  PAGES = "pages",
}

export const menuItems: {
  [key: string]: { pages: MenuItem[]; path: string | null | undefined };
} = {
  home: {
    pages: [
      { name: "Calculator", path: "/home/calculator" },
      { name: "Services", path: "/home/services" },
      { name: "Premium", path: "/home/premium" },
      { name: "Accessory", path: "/home/accessory" },
      { name: "Shop", path: "/home/shop" },
    ],
    path: "/home",
  },

  listings: {
    pages: [
      { name: "All Listings", path: "/listings/all" },

      { name: "Car Old Listings", path: "/listings/car_old" },
    ],
    path: "/listings/all",
  },

  pages: {
    pages: [
      { name: "FAQs", path: "/pages/faqs" },
      {
        name: "Terms & Conditions",
        path: "https://sites.google.com/view/privacy-policy-ntphong",
      },
      {
        name: "Privacy Policy",
        path: "https://sites.google.com/view/privacy-policy-ntphong",
      },
    ],
    path: "/pages/faqs",
  },
};
