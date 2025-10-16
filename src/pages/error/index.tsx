import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSearch = () => {
    if (value) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    } else {
      navigate('/contact');
    }
  };
  const errorIcon=require('src/assets/images/error.png');
  return (
    <Container>
      <ErrorIcon src={`${errorIcon}`} alt="icon_error"  />
      <Warning>404</Warning>
      <Text>Oops! Page not found</Text>
      <Content>
        Sorry, but the page you are looking for is not found. 
        Please make sure you have typed the correct URL.
      </Content>
      <ViewSearch>
        <Input 
          placeholder="Search here"
          value={value}
          onChange={handleInputChange}
        />
        <Button onClick={handleSearch}>Search</Button>
      </ViewSearch>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  align-items: center;
  padding-top: 100px;
`;

const Warning = styled.h1`
  font-size: 48px;
  color: #06a5ee;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Text = styled.h2`
  font-size: 24px;
  font-weight: 500;
  font-family: sans-serif;
  color: #3a3737;
  margin-bottom: 12px;
`;

const Content = styled.p`
  font-size: 16px;
  font-family: sans-serif;
  font-weight: 300;
  text-align: center;
  color: #524d4d;
  margin-bottom: 24px;
`;

const ViewSearch = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap:10px;
`;

const Input = styled.input`
  color: #000;
  font-size: 14px;
  font-weight: 400;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px ;
`;

const Button = styled.button`
  background-color: #049ff8;
  color: #FFF;
  font-size: 14px;
  font-family: sans-serif;
  border: none;
  border-radius: 6px;
  padding: 11px 15px;
  cursor: pointer;
  
  &:hover {
    background-color: #0388d3;
  }
`;
const ErrorIcon=styled.img`
  height: 120px;
  width: 120px;
  background: transparent;
  align-self: center;
`
export default ErrorPage;