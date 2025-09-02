
import { Outlet } from "react-router-dom";
import {
    Menu,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Linkedin,
  } from "lucide-react";
  import { Link, NavLink } from "react-router-dom";
  import { useState, useEffect, useRef } from "react";
  

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div>
         <header className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="Plogging Ethiopia Logo"
                  className="h-28 w-auto ml-5"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-12 mr-10">
              {[
                { name: "Home", to: "/" },
                { name: "About", to: "/about" },
                { name: "Membership", to: "/membership" },
                { name: "Gallery", to: "/gallery" },
                { name: "Blog", to: "/blog" },
                { name: "Event", to: "/events" },
                { name: "Contact", to: "/contact" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative pb-1 font-normal text-xl transition-colors ${
                      isActive
                        ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                        : "text-black hover:text-green-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-3">
                {[
                  { name: "Home", to: "/" },
                  { name: "About", to: "/about" },
                  { name: "Membership", to: "/membership" },
                  { name: "Gallery", to: "/gallery" },
                  { name: "Blog", to: "/blog" },
                  { name: "Event", to: "/events" },
                  { name: "Contact", to: "/contact" },
                ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "text-green-600 font-medium"
                        : "text-gray-700 hover:text-green-600"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
      <Outlet />
      <footer className="w-full flex flex-col items-center bg-green-500/10">
        <section className="flex justify-between w-[80%] py-10 md:flex-row flex-col gap-10">
          {/* Useful Links */}
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-green-500 font-semibold">Useful Links</h1>
            <a className="hover:text-green-500" href="/">
              Home
            </a>
            <a className="hover:text-green-500" href="/gallery">
              Gallery
            </a>
            <a className="hover:text-green-500" href="/blog">
              Blog
            </a>
            <a className="hover:text-green-500" href="/contact">
              Contact Us
            </a>
          </div>

          {/* Subscribe */}
          <div className="flex flex-col md:items-center gap-3">
            <h1 className="uppercase font-semibold text-green-700">
              Subscribe
            </h1>
            <p className="text-sm text-gray-700 text-center md:text-left">
              Sign up with your email address to receive news and updates.
            </p>
            <form className="flex w-full max-w-md">
              <input
                name="email"
                type="email"
                className="p-2 rounded-l-md border-2 border-green-500 w-full border-r-0 focus:outline-none text-gray-800"
                placeholder="Your email address"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 border-2 border-green-500 text-white font-bold py-2 px-4 rounded-r-md"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-green-600 font-semibold">Social Media</h1>
            <div className="flex gap-6 items-center">
              <Facebook className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Instagram className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Twitter className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Youtube className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Linkedin className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
            </div>
          </div>
        </section>

        {/* Footer Bottom */}
        <div className="w-full flex py-2 text-white items-center justify-around bg-green-500/80 text-sm">
          <p>&copy; 2024 Plogging-Ethiopia, All rights reserved.</p>
          <p>
            Powered by{" "}
            <a
              href="https://kasmasolution.com"
              className="hover:text-white/70 cursor-pointer"
            >
              Kasma Tech Solution
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
