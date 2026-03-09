import type { FC } from 'react';
import NewsletterForm from './NewsletterForm';

type FooterProps = {
  businessId: string;
};

const Footer: FC<FooterProps> = ({ businessId }) => {
  return (
    <footer className="footer">
      <div className="container">
        <NewsletterForm businessId={businessId} />
        <p>&copy; {new Date().getFullYear()} Grimaldi's Pizzeria. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;