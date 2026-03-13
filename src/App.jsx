import AppRoutes from "./routes/AppRoutes";
import { ProductTaxonomyProvider } from "./context/ProductTaxonomyContext";

const App = () => (
  <ProductTaxonomyProvider>
    <AppRoutes />
  </ProductTaxonomyProvider>
);

export default App;
