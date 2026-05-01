import React, { useState, useEffect } from "react";
import { logger } from "src/utils/logger";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoCartOutline, IoMoon, IoSunny } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router";
import styled from "styled-components";
import { DropdownMenuProps, FEATURES, menuItems } from "./data";
import { useAuth } from "src/shared/hooks/auth";
import { UserMenu } from "src/shared/components/UserMenu";
import { useTheme } from "src/shared/context/ThemeContext";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    logger.log("🔍 Header - Auth state changed:", {
      isAuthenticated,
      user,
      userName: user?.fullName || user?.username || "No user",
      userObject: user,
    });
  }, [isAuthenticated, user]);

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

  useEffect(() => {
    if (
      isAuthenticated &&
      location.pathname.startsWith("/auth/") &&
      !location.pathname.startsWith("/auth/login/admin")
    ) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleNavigate = (path: string) => {
    if (
      isAuthenticated &&
      path.startsWith("/auth/") &&
      !path.startsWith("/auth/login/admin")
    ) {
      return;
    }
    navigate(path);
  };

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
    logger.log("🔍 getUserName called with user:", user);
    if (!user) {
      logger.log("❌ No user object");
      return "";
    }
    if (user.fullName) {
      logger.log("✅ Using fullName:", user.fullName);
      return user.fullName;
    }
    if (user.username) {
      logger.log("✅ Using username:", user.username);
      return user.username;
    }
    logger.log("⚠️ No fullName or username found");
    return "User";
  };

  return (
    <HeaderContainer>
      <Logo>BOXCARS</Logo>
      <NavMenu>
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
          label="Pages"
          dropdownOpen={dropdownOpen.pages}
          toggleDropdown={() => toggleDropdown(FEATURES.PAGES)}
          closeDropdowns={closeDropdowns}
          items={menuItems.pages}
        />
        <NavItem
          onClick={() => {
            closeDropdowns();
            handleNavigate("/about");
          }}
        >
          About
        </NavItem>
        <NavItem
          onClick={() => {
            closeDropdowns();
            handleNavigate("/contact");
          }}
        >
          Contact
        </NavItem>

        <ThemeToggleButton
          type="button"
          onClick={() => {
            closeDropdowns();
            toggleTheme();
          }}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <IoSunny size={22} /> : <IoMoon size={22} />}
        </ThemeToggleButton>

        {isAuthenticated ? (
          <>
            <NavItem>
              <IoCartOutline size={24} />
            </NavItem>
            <UserMenu
              theme="dark"
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
            <NavItem onClick={() => handleNavigate("/auth/login")}>
              Sign in
            </NavItem>
            <ButtonSignIn onClick={() => handleNavigate("/login/admin")}>
              Admin
            </ButtonSignIn>
          </>
        )}
      </NavMenu>
    </HeaderContainer>
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

  const handlePathClick = (path: string | null | undefined) => {
    if (!path) return;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.open(path, "_blank", "noopener,noreferrer");
    } else {
      navigate(path);
    }
  };

  return (
    <DropdownWrapper>
      <NavItem
        onClick={() => handlePathClick(items.path)}
        onMouseEnter={toggleDropdown}
      >
        {label} <IoMdArrowDropdown size={16} />
      </NavItem>
      {dropdownOpen && (
        <DropdownContent onMouseLeave={closeDropdowns}>
          {data.map((item) => (
            <DropdownItem
              key={item.name}
              onClick={() => {
                handlePathClick(item.path);
                closeDropdowns();
              }}
            >
              {item.name}
            </DropdownItem>
          ))}
        </DropdownContent>
      )}
    </DropdownWrapper>
  );
};

const HeaderContainer = styled.div`
  width: 100%;
  padding: 1rem 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 20;
  background-color: #050b2b;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 2%;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1%;
  }
`;

const Logo = styled.h2`
  font-weight: bold;
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const NavMenu = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  position: relative;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
    font-size: 0.875rem;
  }
`;

const NavItem = styled.h1`
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
  white-space: nowrap;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    gap: 2px;
  }
`;

const ThemeToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.55);
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const ButtonSignIn = styled.button`
  border-radius: 25px;
  padding: 10px 10px;
  font-size: 16px;
  font-weight: 500;
  border-width: 1px 2px;
  background-color: #fff;
  cursor: pointer;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 8px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 6px;
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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

  @media (max-width: 480px) {
    min-width: 140px;
  }
`;

const DropdownItem = styled.a`
  padding: 12px 16px;
  text-decoration: none;
  color: #000;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #f1f1f1;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;
