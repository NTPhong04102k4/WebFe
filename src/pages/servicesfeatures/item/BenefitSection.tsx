import styled from "styled-components";
import { DATA_SUGGEST } from "../../home/item/data";

export const BenefitsSection: React.FC = () => (
    <BenefitsWrapper>
      <BenefitsTitle>Customers Get Great benefits!</BenefitsTitle>
      <BenefitsContainer>
        {DATA_SUGGEST.map((item) => (
          <BenefitItem key={item.id}>
            <BenefitIcon src={item.icon} alt={item.title} />
            <BenefitTitle>{item.title}</BenefitTitle>
            <BenefitDescription>{item.script}</BenefitDescription>
          </BenefitItem>
        ))}
      </BenefitsContainer>
    </BenefitsWrapper>
  );
  
const BenefitsWrapper = styled.div`
margin: 48px 0;
`;

const BenefitsTitle = styled.h2`
font-size: 32px;
font-weight: bold;
font-family: sans-serif;
color: #000000;
margin-bottom: 24px;
`;

const BenefitsContainer = styled.div`
display: flex;
gap: 24px;
color: #6b7280;
align-items: self-start;
`;

const BenefitItem = styled.div`
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
transition: transform 0.3s;

&:hover {
  transform: scale(1.05);
}
`;

const BenefitIcon = styled.img`
width: 64px;
height: 64px;
margin-bottom: 16px;
`;

const BenefitTitle = styled.h3`
font-size: 18px;
font-weight: bold;
color: #000000;
margin-bottom: 8px;
`;

const BenefitDescription = styled.p`
font-size: 14px;
color: #6b7280;
text-align: start;
`;
