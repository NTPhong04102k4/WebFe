import React, { useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { DropdownMenuProps, FEATURES, menuItems } from "./data";

export function Header() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState<{
    home: boolean;
    listings: boolean;
    blogs: boolean;
    pages: boolean;
  }>({
    home: false,
    listings: false,
    blogs: false,
    pages: false,
  });

  const toggleDropdown = (
    name: FEATURES.LISTINGS | FEATURES.BLOGS | FEATURES.PAGES | FEATURES.HOME
  ) => {
    setDropdownOpen(() => ({
      listings: name === FEATURES.LISTINGS,
      blogs: name === FEATURES.BLOGS,
      pages: name === FEATURES.PAGES,
      home: name === FEATURES.HOME,
    }));
  };

  const closeDropdowns = () => {
    setDropdownOpen({
      listings: false,
      blogs: false,
      pages: false,
      home: false,
    });
  };

  return (
    <div className="w-full px-[5%] py-4 flex items-center justify-between relative z-20 bg-[#050b2b]">
      <h2 className="font-bold text-white text-2xl">BOXCARS</h2>
      <div className="inline-flex gap-4 relative">
        <DropdownMenu
          label="Home"
          dropdownOpen={dropdownOpen.home}
          toggleDropdown={() => toggleDropdown(FEATURES.HOME)}
          closeDropdowns={closeDropdowns}
          items={menuItems.home}
        />
        <DropdownMenu
          label="Listings"
          dropdownOpen={dropdownOpen.listings}
          toggleDropdown={() => toggleDropdown(FEATURES.LISTINGS)}
          closeDropdowns={closeDropdowns}
          items={menuItems.listings}
        />
        <DropdownMenu
          label="Blog"
          dropdownOpen={dropdownOpen.blogs}
          toggleDropdown={() => toggleDropdown(FEATURES.BLOGS)}
          closeDropdowns={closeDropdowns}
          items={menuItems.blog}
        />
        <DropdownMenu
          label="Pages"
          dropdownOpen={dropdownOpen.pages}
          toggleDropdown={() => toggleDropdown(FEATURES.PAGES)}
          closeDropdowns={closeDropdowns}
          items={menuItems.pages}
        />
        <Func onClick={() => navigate("/about")}>About</Func>
        <Func onClick={() => navigate("/contact")}>Contact</Func>
        <Func onClick={() => navigate("/auth/login")}>
          <FaRegUser size={24} /> Sign in
        </Func>
        <ButtonSignIn
          style={{ width: 120 }}
          onClick={() => navigate("/auth/login/admin/page_manage")}
        >
          Admin
        </ButtonSignIn>
      </div>
    </div>
  );
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  dropdownOpen,
  toggleDropdown,
  closeDropdowns,
  items,
}) => {
  const navigate = useNavigate();
  const data = items.pages;
  const pathFeats = items.path ? items.path : "/error";
  return (
    <div className="relative  flex items-center justify-center   ">
      <Func onClick={() => navigate(pathFeats)} onMouseEnter={toggleDropdown}>
        {label} <IoMdArrowDropdown size={16} />
      </Func>
      {dropdownOpen && (
        <DropdownContent onMouseLeave={closeDropdowns}>
          {data.map((item) => (
            <DropdownItem
              key={item.name}
              onClick={() => {
                navigate(item.path);
                closeDropdowns();
              }}
            >
              {item.name}
            </DropdownItem>
          ))}
        </DropdownContent>
      )}
    </div>
  );
};

const Func = styled.h1`
  font-size: 16px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  position: relative;
  cursor: pointer;
  color: #fff;
`;

const ButtonSignIn = styled.button`
  border-radius: 25px;
  padding: 10px 10px;
  font-size: 16px;
  font-weight: 500;
  border-width: 1px 2px;
  background-color: #fff;
  cursor: pointer;
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-width: 160px;
`;

const DropdownItem = styled.a`
  padding: 12px 16px;
  text-decoration: none;
  color: #000;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;
