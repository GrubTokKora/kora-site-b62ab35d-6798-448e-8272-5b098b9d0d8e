import type { FC } from 'react';

type HeroProps = {
  name: string;
  summary: string;
};

const Hero: FC<HeroProps> = ({ name, summary }) => {
  return (
    <section className="hero" id="home">
      <div className="container">
        <h1>{name}</h1>
        <p>{summary}</p>
        <a href="#menu" className="btn">View Our Menu</a>
      </div>
    </section>
  );
};

export default Hero;