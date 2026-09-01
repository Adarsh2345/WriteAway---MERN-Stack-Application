import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";

// Page routes get filled in as each page is built.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<div className="container" style={{ paddingTop: "3rem" }}>Home coming soon</div>} />
      </Route>
    </Routes>
  );
}

export default App;
