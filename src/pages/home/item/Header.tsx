import React, { useEffect, useRef, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import styled from "styled-components";
import { LiaSearchSolid } from "react-icons/lia";
import { useNavigate } from "react-router";
import { CarDetail, FeatBrand } from "../../home/item/typeData";
import bgcTitleImg from "src/assets/images/homepage/bgc_title.jpg";
import homepageOnlImg from "src/assets/images/homepage/homepage_onl.png";
import latestBlogCarImg from "src/assets/images/homepage/latest_blog_car_4.jpg";
import { HeaderBar } from "./Headerbar";

const DATA_BGC = [bgcTitleImg, homepageOnlImg, latestBlogCarImg];
export interface SearchableCarProps {
  data: CarDetail[];
  onSelect?: (car: CarDetail) => void;
}

export const HeaderHome = ({
  data,
  carsData = [],
}: {
  SearchableCarProps?: SearchableCarProps;
  data: FeatBrand[];
  carsData?: CarDetail[];
}) => {
  const navigate = useNavigate();
  const [idxSelectBgc, setIdxSelectBgc] = useState(0);
  const DATA = data;
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIdxSelectBgc((prev) => (prev < DATA_BGC.length - 1 ? prev + 1 : 0));
    }, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);
  const [searchText, setSearchText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<CarDetail[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filterCars = (text: string) => {
    const filteredSuggestions = carsData.filter((car: CarDetail) => {
      return (
        car.name.toLowerCase().includes(text.toLowerCase()) ||
        car.body.toLowerCase().includes(text.toLowerCase())
      );
    });
    setSuggestions(filteredSuggestions);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const text = e.target.value;
    setSearchText(text);
    filterCars(text);
    setSelectedIndex(-1);
  };

  const scrollToSelected = (index: number) => {
    if (suggestionsRef.current) {
      const container = suggestionsRef.current;
      const selectedItem = container.children[index] as HTMLElement;

      if (selectedItem) {
        // Lấy kích thước và vị trí của container
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        const scrollBottom = scrollTop + containerHeight;

        // Lấy kích thước và vị trí của item được chọn
        const itemHeight = selectedItem.offsetHeight;
        const itemTop = selectedItem.offsetTop;
        const itemBottom = itemTop + itemHeight;

        // Logic scroll mới
        if (itemBottom > scrollBottom) {
          // Nếu item nằm dưới vùng nhìn thấy
          container.scrollTop = itemBottom - containerHeight;
        } else if (itemTop < scrollTop) {
          // Nếu item nằm trên vùng nhìn thấy
          container.scrollTop = itemTop;
        }
      }
    }
  };

  const ensureScrollIntoView = (index: number) => {
    requestAnimationFrame(() => {
      scrollToSelected(index);
    });
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (!isInputFocused || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const nextIndex = prev === suggestions.length - 1 ? prev : prev + 1;
          ensureScrollIntoView(nextIndex);
          return nextIndex;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const nextIndex = prev <= 0 ? suggestions.length - 1 : prev - 1;
          ensureScrollIntoView(nextIndex);
          return nextIndex;
        });
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
          navigate("/cars/details", {
            state: { subItem: suggestions[selectedIndex] },
          });
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsInputFocused(false);
        inputRef.current?.blur();
        setSuggestions([]);
        break;

      default:
        break;
    }
  };

  const handleSelect = (car: CarDetail): void => {
    setSearchText(`${car.name} - ${car.body}`);
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsInputFocused(false);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
      if (isInputFocused) {
        handleKeyDown(e);
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [selectedIndex, suggestions, isInputFocused]);

  return (
    <div className="flex flex-col items-center justify-center">
      <HeaderBar />
      <SlideShown img={DATA_BGC[idxSelectBgc]}>
        <Content>The World's Largest Used Car Dealership</Content>
        <Title>Find Your Perfect Vehicle Online</Title>
        <div className="inline-flex w-full pl-7 pr-7 justify-between bg-transparent">
          <ButtonIcon
            onClick={() => {
              setIdxSelectBgc((prev) =>
                prev > 0 ? prev - 1 : DATA_BGC.length
              );
            }}
          >
            <SlArrowLeft size={24} color="#FFF" />
          </ButtonIcon>
          <ButtonIcon
            onClick={() => {
              setIdxSelectBgc((prev) =>
                prev < DATA_BGC.length ? prev + 1 : 0
              );
            }}
          >
            <SlArrowRight size={24} color="#FFF" />
          </ButtonIcon>
        </div>
        <FooterSlideShown>
          {DATA.map((item, index) => {
            if (!item) {
              return null;
            }
            const propsItemExpand = item.data;
            return (
              <div key={item.id} className="flex flex-row flex-1 w-full">
                <ItemFooter>
                  <TextButton
                    onClick={() => {
                      item.id === 0
                        ? navigate("/listings/car_old")
                        : navigate("/listings/all");
                    }}
                  >
                    {propsItemExpand ? item?.name : item?.name + " :"}
                  </TextButton>
                  {propsItemExpand ? (
                    <FaCaretDown
                      size={24}
                      color="#FFF"
                      className="cursor-pointer"
                      onClick={() => {
                        item.id === 0
                          ? navigate("/listings/car_old")
                          : navigate("/listings/all");
                      }}
                    />
                  ) : (
                    <div className="inline-flex 2xl:gap-8 justify-between gap-4 items-center">
                      <p className="font-medium text-[#FFF] text-[18px]">
                        All Prices
                      </p>
                      <div className="relative">
                        <div className="border-white border rounded w-auto flex flex-row justify-center items-center">
                          <input
                            ref={inputRef}
                            className="text-[16px] focus:outline-none font-medium bg-transparent p-3 text-white w-full"
                            placeholder="Search Cars"
                            value={searchText}
                            onChange={handleChange}
                            onFocus={() => setIsInputFocused(true)}
                            onClick={() => setIsInputFocused(true)}
                          />
                          <div className="cursor-default mr-3 p-1 hover:scale-105 w-9 transition duration-300 flex items-center justify-center active:scale-95">
                            <LiaSearchSolid size={24} color="#fff" />
                          </div>
                        </div>

                        {isInputFocused && suggestions.length > 0 && (
                          <div
                            ref={suggestionsRef}
                            className="absolute w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto z-50"
                          >
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={suggestion.id}
                                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                                  index === selectedIndex ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleSelect(suggestion)}
                                onMouseEnter={() => setSelectedIndex(index)}
                              >
                                {suggestion.name} - {suggestion.body}{" "}
                                {suggestion.priceBuy}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </ItemFooter>
                <div
                  className={`${
                    propsItemExpand && "w-[1px]"
                  } bg-white mt-2 mb-2 h-[80%]`}
                />
              </div>
            );
          })}
        </FooterSlideShown>
      </SlideShown>
    </div>
  );
};
const SlideShown = styled.div<{ img: string }>`
  width: 90%;
  margin-right: 90px;
  margin-left: 90px;
  background-image: url(${(props) => props.img || homepageOnlImg});
  background-position: center;
  background-size: cover;
  display: flex;
  border-radius: 16px 16px 0px 0px;
  aspect-ratio: 8/4;
  height: auto;

  @media screen and (min-width: 1920px) {
    height: 800px;
  }
  flex-direction: column;
  position: relative;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 1px 1px 1px #363636;
  &:hover {
    box-shadow: 0px 1px 2px 2px #363636;
  }

  transition: all 0.3s ease;
`;
const Content = styled.h2`
  font-size: 18px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 400;
  text-align: center;
  align-self: center;
  align-items: center;
  position: absolute;
  top: 150px;
  color: #fff;
`;
const Title = styled.h1`
  /* font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; */
  font-size: 32px;
  font-weight: 500;
  align-self: center;
  text-align: center;
  position: absolute;
  top: 200px;
  color: #fff;
  font-weight: 700;
`;
const ButtonIcon = styled.button`
  border-radius: 25px;
  padding: 5px 10px 5px 10px;
  width: 60px;
  height: 40px;
  justify-content: center;
  align-items: center;
  display: flex;
  background-color: #cfc9c9;
`;
const FooterSlideShown = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #050b20;
  height: 96px;
  position: absolute;
  bottom: 0;
  width: 85%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  @media screen and (min-width: 768px) {
    height: 80px;
  }
  @media screen and (min-width: 1920px) {
    height: 96px;
  }
`;
const ItemFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px 10px 20px;
  flex: 1;
  min-width: max-content;
  flex-direction: row;
  gap: 16px;
`;
const TextButton = styled.h2`
  font-size: 18px;
  font-family: "Times New Roman", Times, serif;
  font-weight: 400;
  color: #ffffff;
  cursor: pointer;
`;
