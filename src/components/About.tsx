import type { FC } from 'react';

type AboutProps = {
  description: string;
};

const About: FC<AboutProps> = ({ description }) => {
  return (
    <section className="about" id="about">
      <div className="container">
        <h2>About Us</h2>
        <p>{description}</p>
      </div>
    </section>
  );
};

export default About;