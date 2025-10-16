import React from "react";
import styled from "styled-components";

import { RootNavigation } from "./navigation/RootNavigation";
import { AuthProvider } from "./contexts/AuthContext";
import { DebugPanel } from "./shared/components/DebugPanel";

function App() {
  return (
    <AuthProvider>
      <Container>
        <RootNavigation />
        {/* Debug Panel - Remove in production */}
        {process.env.NODE_ENV === "development" && <DebugPanel />}
      </Container>
    </AuthProvider>
  );
}

export default App;
const Container = styled.div`
  display: flex;
`;
