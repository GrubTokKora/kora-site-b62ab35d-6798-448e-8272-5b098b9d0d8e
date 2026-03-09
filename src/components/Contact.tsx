import type { FC } from 'react';

type ContactProps = {
  address: string;
};

const Contact: FC<ContactProps> = ({ address }) => {
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}`;

  return (
    <section className="contact" id="contact">
      <div className="container">
        <h2>Visit Us</h2>
        <p>{address}</p>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn">Get Directions</a>
      </div>
    </section>
  );
};

export default Contact;