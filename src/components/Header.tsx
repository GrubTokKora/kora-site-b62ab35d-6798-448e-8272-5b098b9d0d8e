import type { FC } from 'react';

type HeaderProps = {
  name: string;
};

const Header: FC<HeaderProps> = ({ name }) => {
  return (
    <header className="header">
      <div className="container">
        <a href="#home" className="logo">{name}</a>
        <nav>
          <a href="#about">About</a>
          <a href="#menu">Menu</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;