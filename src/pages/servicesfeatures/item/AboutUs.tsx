import { GoArrowUpRight } from "react-icons/go";
import styled from "styled-components";

export const AboutUsSection: React.FC = () => (
    <AboutUsWrapper>
      <AboutUsContent>
        <ServiceOptionsTitle>
          Service Options Offered by BoxCar
        </ServiceOptionsTitle>
        <ServiceOptionsDescription>
          Choose from thousands of vehicles from multiple brands and buy
          online with Click & Drive, or visit us at one of our dealerships
          today.
        </ServiceOptionsDescription>
        <ServiceOptionsButton>
          See Your Service Options <GoArrowUpRight size={18} color="#fff" />
        </ServiceOptionsButton>
      </AboutUsContent>
      <ServiceImage
        src={require("src/assets/images/services/service1.png")}
        alt="Service Options"
      />
    </AboutUsWrapper>
  );
  
const AboutUsWrapper = styled.div`
display: flex;
justify-content: space-between;
margin-top: 48px;
`;

const AboutUsContent = styled.div`
width: 60%;
display: flex;
flex-direction: column;
justify-content: center;
gap: 16px;
`;

const ServiceOptionsTitle = styled.h2`
font-size: 32px;
font-weight: bold;
font-family: sans-serif;
color: #000000;
width: 70%;
`;

const ServiceOptionsDescription = styled.p`
font-size: 16px;
font-weight: normal;
font-family: sans-serif;
color: #6b7280;
width: 85%;
`;

const ServiceOptionsButton = styled.button`
background-color: #1574e5;
color: white;
padding: 14px ;
border-radius: 12px;
display: inline-flex;
align-items: center;
gap: 8px;

transition: transform 0.3s;
cursor: pointer;
border: none;
font-size: 16px;
font-weight: 500;
width: auto;
align-self: self-start;
&:hover {
  transform: scale(1.05);
}

&:active {
  transform: scale(1);
}
`;

const ServiceImage = styled.img`
width: 35%;
height: auto;
aspect-ratio: 1;
border-radius: 12px;
background-size: cover;
background-position: center;
transition: transform 0.3s;

&:hover {
  transform: scale(1.05);
}

&:active {
  transform: scale(1);
}
`;

