import { JSX } from "react";

function App(): JSX.Element {
  return (
    <div style={{ minHeight: "100vh" }}>
      <h1
        className="p-8 text-2xl"
        style={{ color: "var(--text-primary)" }}
      >
        Narrative Forge
      </h1>
    </div>
  );
}

export default App;