import React, { useCallback, useState, useMemo } from "react";
import styled from "styled-components";
// Import data from a separate file
import { DATA_BLOG } from "../home/item/data";
import { ServicesSection } from "./item/ServiceProps";
import { BenefitsSection } from "./item/BenefitSection";
import { AboutUsSection } from "./item/AboutUs";
import { ScheduleServices } from "./item/ScheduleServices";
const ITEMS_PER_PAGE = 4;

const Services: React.FC = React.memo(() => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const maxPage = useMemo(
    () => Math.floor((DATA_BLOG.length - 1) / ITEMS_PER_PAGE),
    []
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 0 && newPage <= maxPage) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentPage(newPage);
          setIsAnimating(false);
        }, 300);
      }
    },
    [maxPage]
  );

  const currentPageItems = useMemo(
    () =>
      DATA_BLOG.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
      ),
    [currentPage]
  );

  return (
    <Container>
      <ContentWrapper>
        <BreadcrumbWrapper>
          <Breadcrumb>
            <span className="text-blue-500">Home</span>/ Services
          </Breadcrumb>
        </BreadcrumbWrapper>
        <AboutUsSection />
        <BenefitsSection />
        <ServicesSection
          currentPageItems={currentPageItems}
          isAnimating={isAnimating}
          currentPage={currentPage}
          maxPage={maxPage}
          onPageChange={handlePageChange}
        />
        <ScheduleServices />
      </ContentWrapper>
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-height: 100vh;

  background-color: #050b2b;
`;

const ContentWrapper = styled.div`
  background-color: white;
  border-bottom-left-radius: 75px;
  padding: 5%;
`;

const BreadcrumbWrapper = styled.div`
  margin-top: 32px;
`;

const Breadcrumb = styled.div`
  font-size: 16px;
  font-weight: normal;
  font-family: sans-serif;
  color: #000000;
`;

export default Services;
