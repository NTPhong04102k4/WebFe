import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FaRegUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router";
import { useAppDispatch } from "src/redux/hook";
import { clearCredentials } from "src/redux/Slice/AuthSlice";
import { authAPI } from "src/services/api/functions/auth/authFn";

type UserMenuProps = {
  name: string;
  closeAll: () => void;
  theme: "light" | "dark";
};

export const UserMenu: React.FC<UserMenuProps> = ({
  name,
  closeAll,
  theme = "light",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  async function handleLogout() {
    try {
      await authAPI.userLogout();
      dispatch(clearCredentials());
      setIsOpen(false);
      closeAll();
      navigate("/home");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear credentials and redirect even if API call fails
      dispatch(clearCredentials());
      setIsOpen(false);
      closeAll();
      navigate("/home");
    }
  }

  const handleNavigateToProfile = () => {
    navigate("/profile");
    setIsOpen(false);
    closeAll();
  };

  const handleNavigateToContact = () => {
    navigate("/contact");
    setIsOpen(false);
    closeAll();
  };

  return (
    <Wrapper ref={ref}>
      <Button
        onClick={() => {
          closeAll();
          setIsOpen((p) => !p);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        $theme={theme}
      >
        <FaRegUser size={18} />
        <span>{name || "User"}</span>
        <IoMdArrowDropdown size={16} />
      </Button>
      {isOpen && (
        <Dropdown role="menu" $theme={theme}>
          <Item
            role="menuitem"
            onClick={handleNavigateToProfile}
            $theme={theme}
          >
            Hồ sơ cá nhân
          </Item>
          <Item
            role="menuitem"
            onClick={handleNavigateToContact}
            $theme={theme}
          >
            Hỗ trợ cá nhân
          </Item>
          <Item role="menuitem" onClick={handleLogout} $theme={theme}>
            Đăng xuất
          </Item>
        </Dropdown>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Button = styled.button<{ $theme: "light" | "dark" }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: ${({ $theme }) => ($theme === "light" ? "#000" : "#fff")};
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 8px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid ${({ $theme }) => ($theme === "light" ? "#000" : "#fff")};
    outline-offset: 2px;
  }
`;

const Dropdown = styled.div<{ $theme: "light" | "dark" }>`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background-color: ${({ $theme }) =>
    $theme === "light" ? "#fff" : "#050b2b"};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  overflow: hidden;
  border: 1px solid
    ${({ $theme }) => ($theme === "light" ? "#e5e7eb" : "#1e293b")};
`;

const Item = styled.button<{ $theme: "light" | "dark" }>`
  text-align: left;
  padding: 12px 14px;
  background: ${({ $theme }) => ($theme === "light" ? "#fff" : "#050b2b")};
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: ${({ $theme }) => ($theme === "light" ? "#111827" : "#f9fafb")};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ $theme }) =>
      $theme === "light" ? "#f3f4f6" : "#1e293b"};
  }

  &:focus-visible {
    outline: 2px solid
      ${({ $theme }) => ($theme === "light" ? "#3b82f6" : "#60a5fa")};
    outline-offset: -2px;
  }
`;
