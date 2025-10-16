import React from 'react';
import { Blog } from '../../home/item/typeData';
import { GoArrowUpRight } from 'react-icons/go';
import styled from 'styled-components';

interface ServicesProps {
    currentPageItems: Blog[];
    isAnimating: boolean;
    currentPage: number;
    maxPage: number;
    onPageChange: (newPage: number) => void;
  }
  
 export  const ServicesSection: React.FC<ServicesProps> = ({ 
    currentPageItems, 
    isAnimating, 
    currentPage, 
    maxPage, 
    onPageChange 
  }) => (
    <ServicesWrapper>
      <ServicesTitle>Our Services</ServicesTitle>
      <ServicesContainer isAnimating={isAnimating}>
        {currentPageItems.map((item: Blog) => (
          <ServiceItem key={item.id} isAnimating={isAnimating}>
            <ServiceImage src={item.img} alt={item.name} />
            <ServiceName>{item.name}</ServiceName>
            <ServiceDescription>{item.script}</ServiceDescription>
            <ServiceExploreButton>
              Explore More <GoArrowUpRight size={24} color="#000" />
            </ServiceExploreButton>
          </ServiceItem>
        ))}
      </ServicesContainer>
      <NavigationWrapper>
        <NavigationButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
          Previous
        </NavigationButton>
        <NavigationButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= maxPage}>
          Next
        </NavigationButton>
      </NavigationWrapper>
    </ServicesWrapper>
  );
  
 
  const ServiceImage = styled.img`
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    transition: transform 0.3s;
  font: 20px;
    &:hover {
      transform: scale(1.01);
    }
  
    &:active {
      transform: scale(1);
    }
  `;
  
  
  const ServicesWrapper = styled.div`
    margin-top: 48px;
   
  `;
  
  const ServicesTitle = styled.h2`
    font-size: 32px;
    font-weight: bold;
    font-family: sans-serif;
    color: #000000;
    margin-bottom: 24px;
  `;
  
  const ServicesContainer = styled.div<{ isAnimating: boolean }>`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    transition: transform 0.3s;
    /* transform: ${props => props.isAnimating ? 'translateX(-100%)' : 'translateX(0)'}; */
  `;
  
  const ServiceItem = styled.div<{ isAnimating: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: #f3f4f6;
    border-radius: 12px;
   
    transition: transform 0.5s;
    transform: ${props => props.isAnimating ? 'translateX(100%)' : 'translateX(0)'};
  
    &:hover {
      transform: scale(1.05);
    }
  `;
  
  const ServiceName = styled.h3`
    font-size: 18px;
    font-weight: bold;
    color: #000000;
    margin: 16px 0 8px;
    margin-left: 12px;
  `;
  
  const ServiceDescription = styled.p`
    font-size: 16px;
    color: #6b7280;
    flex-grow: 1;
  
    margin-left: 12px;
  `;
  
  const ServiceExploreButton = styled.button`
    background-color: transparent;
    color: #000000;
    border: none;
  margin-top: 6px;
  margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.3s;
    align-self: flex-start;
    width: auto;
    margin-left: 12px;
    font-size: 16px;
    &:hover {
      color: #1574e5;
    }
  `;
  
  const NavigationWrapper = styled.div`
    display: flex;
    gap: 24px;
    margin-top: 24px;
  `;
  
  const NavigationButton = styled.button`
    background-color: #1574e5;
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    border: none;
    font-size: 16px;
    font-weight: 500;
    width: 100px;
    &:hover {
      opacity: 0.8;
    }
  
    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `;
  
