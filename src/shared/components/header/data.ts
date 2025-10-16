export interface MenuItem {
  name: string;
  path: string;
}

export interface DropdownMenuProps {
  label: string;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  closeDropdowns: () => void;
  items: {pages:MenuItem[],path:string|null|undefined};
}

export enum FEATURES {
  HOME = "home",
  LISTINGS = "listings",
  BLOGS = "blogs",
  PAGES = "pages",
}

export const menuItems: { [key: string]: { pages: MenuItem[]; path: string|null|undefined } } =
  {
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
    blog: {
        pages: [
        { name: "Blogs", path: "/home/blog/all_blogs" },
        { name: "Last Posts", path: "/home/blog/last_post" },
        { name: "Previous Posts", path: "/home/blog/previous_post" },
      ],   
      path: "/home/blog/all_blogs",
    },

    pages: {
        pages: [
        { name: "FAQs", path: "/pages/faqs" },
        { name: "Terms & Conditions", path: "/pages/term_&_condition" },
        { name: "Privacy Policy", path: "/pages/privacy" },
      ],
      path: null,
    },
  };
