import React, { useState } from "react";
import { PiDeviceMobileSpeaker } from "react-icons/pi";
import { IoCartOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { FEATURES, menuItems } from "src/shared/components/header/data";
import { DropdownMenu } from "./DropDownMenu";
import { useAuth } from "src/shared/hooks/auth/index.ts";
import { UserMenu } from "src/shared/components/UserMenu";

const HeaderBarComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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

  const getUserName = () => {
    if (!user) return "";
    if (user.fullName) return user.fullName;
    if (user.username) return user.username;
    return "User";
  };
  return (
    <HeaderBarContainer>
      <Features>
        <TitleHomePage>BOXCARS</TitleHomePage>
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
        <Func
          onClick={() => {
            closeDropdowns();
            navigate("/about");
          }}
        >
          About
        </Func>
        <Func
          onClick={() => {
            closeDropdowns();
            navigate("/contact");
          }}
        >
          Contact
        </Func>
        <Func>
          {" "}
          <PiDeviceMobileSpeaker /> +75 123 456 789
        </Func>
      </Features>
      <Features>
        {isAuthenticated ? (
          <>
            <Func>
              <IoCartOutline size={24} />
            </Func>
            <UserMenu
              theme={"light"}
              name={getUserName() || "User"}
              closeAll={() =>
                setDropdownOpen({
                  listings: false,
                  blogs: false,
                  pages: false,
                  home: false,
                })
              }
            />
          </>
        ) : (
          <>
            <Func onClick={() => navigate("/auth/login")}>Sign in</Func>
            <ButtonSignIn
              style={{ width: 130 }}
              onClick={() => navigate("/login/admin")}
            >
              Admin
            </ButtonSignIn>
          </>
        )}
      </Features>
    </HeaderBarContainer>
  );
};

export const HeaderBar = React.memo(HeaderBarComponent);
HeaderBar.displayName = "HeaderBar";

const HeaderBarContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  width: 90%;
  padding-top: 12px;
  padding-bottom: 12px;
  align-items: center;
`;
const Features = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;
const TitleHomePage = styled.h1`
  font-size: 24px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 600;
  align-self: center;
`;
const ButtonSignIn = styled.button`
  border-radius: 8px;
  padding: 10px 10px 10px 10px;
  font-size: 16px;
  font-weight: 500;
  border-width: 1px 2px 1px 2px;
  border-color: black;
`;
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
`;
