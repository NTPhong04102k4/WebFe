import React from "react";
import styled from "styled-components";

import { RootNavigation } from "./navigation/RootNavigation";

function App() {
  return (
    <Container>
      <RootNavigation />
    </Container>
  );
}

export default App;
const Container = styled.div`
  display: flex;
`;
