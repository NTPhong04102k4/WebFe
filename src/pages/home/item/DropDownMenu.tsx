import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router";
import { DropdownMenuProps } from "src/shared/components/header/data";
import styled from "styled-components";

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  dropdownOpen,
  toggleDropdown,
  closeDropdowns,
  items,
}) => {
  const navigate = useNavigate();
  const data = items.pages;
  const pathFeats = items.path ? items.path : "";
  return (
    <div className="relative  flex items-center justify-center">
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
