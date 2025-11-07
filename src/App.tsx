import React from "react";
import styled from "styled-components";

import { RootNavigation } from "./navigation/RootNavigation";
import { DebugPanel } from "./shared/components/DebugPanel";

function App() {
  return (
    <Container>
      <RootNavigation />
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === "development" && <DebugPanel />}
    </Container>
  );
}

export default App;
const Container = styled.div`
  display: flex;
`;
