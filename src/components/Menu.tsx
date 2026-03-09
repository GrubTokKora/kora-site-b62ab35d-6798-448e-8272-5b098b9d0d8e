import type { FC } from 'react';

const menuItems = [
  { name: "Margherita Pizza", description: "Fresh mozzarella, San Marzano tomatoes, basil, and a drizzle of olive oil.", price: "$18" },
  { name: "Pepperoni Pizza", description: "Classic pepperoni on our signature coal-fired crust.", price: "$20" },
  { name: "White Pizza", description: "Ricotta, mozzarella, garlic, and fresh herbs. No tomato sauce.", price: "$22" },
  { name: "The Don", description: "Italian sausage, meatballs, and pepperoni. A meat lover's dream.", price: "$25" },
  { name: "Calzone", description: "Stuffed with ricotta and mozzarella. Add your favorite toppings.", price: "$16" },
];

const Menu: FC = () => {
  return (
    <section className="menu" id="menu">
      <div className="container">
        <h2>Our Menu</h2>
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.name} className="menu-item">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="price">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menu;