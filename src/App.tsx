import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';

const BUSINESS_ID = "b62ab35d-6798-448e-8272-5b098b9d0d8e";

const businessDetails = {
  name: "Grimaldi's Pizzeria",
  description: "Casual, Brooklyn-based pizzeria chain serving brick-oven pies & calzones, plus wine & beer.",
  summary: "Grimaldi's Pizzeria is renowned for its classic, coal-fired brick oven pizzas, offering a traditional New York-style experience with fresh ingredients and a crispy, smoky crust. They primarily serve whole pies with various toppings.",
  address: "1 Front St, Brooklyn, NY 11201, USA",
};

function App() {
  return (
    <>
      <Header name={businessDetails.name} />
      <main>
        <Hero name={businessDetails.name} summary={businessDetails.summary} />
        <About description={businessDetails.description} />
        <Menu />
        <Contact address={businessDetails.address} />
      </main>
      <Footer businessId={BUSINESS_ID} />
    </>
  );
}

export default App;