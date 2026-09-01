// Route table gets filled in as each page is built; this is a working shell
// for now to confirm the design system is wired in correctly.
function App() {
  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <h1 className="display-5">WriteAway</h1>
      <p className="text-muted">Design system check</p>
      <button className="btn btn-primary">Primary button</button>
    </div>
  );
}

export default App;
