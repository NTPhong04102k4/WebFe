// LoadingScreen.tsx
import React from 'react';

import styled, { keyframes } from 'styled-components';


export const LoadingScreen=React.memo(()=>{
  return (
    <Container>
      <Loading />
      <TextLoading>Loading...</TextLoading>
    </Container>
  );
});


  
  
const spin = keyframes`
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
`;

const Container = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: 100vh; /* Chiếm toàn bộ chiều cao của viewport */
background-color: #f0f0f0; /* Màu nền */
width: 100vw;
`;

const Loading = styled.div`
border: 8px solid #f3f3f3; /* Màu nền */
border-top: 8px solid #959899; /* Màu của phần trên */
border-radius: 50%;
width: 40px; /* Đường kính của spinner */
height: 40px;
animation: ${spin} 1s linear infinite; /* Hiệu ứng quay */
`;

const TextLoading = styled.h2`
margin-top: 20px; /* Khoảng cách với loader */
color: #333; /* Màu chữ */
`;