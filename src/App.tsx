import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">POS System</h1>
        <button className="btn btn-primary">Test DaisyUI Button</button>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default App;
