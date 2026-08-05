import { RouterProvider } from "@tanstack/react-router";
import { router } from "./app/router";
import { useAuth } from "./app/providers/auth/auth-context";

function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

export default App;
