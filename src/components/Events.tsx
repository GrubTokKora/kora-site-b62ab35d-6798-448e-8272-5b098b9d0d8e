import type { FC } from 'react';

const events = [
  {
    name: "Holi-Dhuleti Celebration",
    date: "March 25, 2025",
    description: "Join us for a vibrant celebration of Holi-Dhuleti! We're offering special colorful pizzas and drinks to celebrate the festival of colors. A feast for your eyes and your taste buds!",
  },
  {
    name: "Diwali: Festival of Lights Celebration",
    date: "April 30, 2026",
    description: "Celebrate Diwali, the festival of lights, with us! We'll be lighting up our pizzeria with special decorations and offering a unique 'Diya' pizza, glowing with golden corn and bright peppers. A truly illuminating dining experience!",
  },
];

const Events: FC = () => {
  return (
    <section className="events" id="events">
      <div className="container">
        <h2>Upcoming Events</h2>
        <div className="events-grid">
          {events.map(event => (
            <div key={event.name} className="event-item">
              <h3>{event.name}</h3>
              <p className="event-date">{event.date}</p>
              <p>{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;