import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function Navbar() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex items-center justify-between h-20">

          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >

            <div className="w-8 h-8 border-2 border-primary flex items-center justify-center">
              <div className="w-3 h-3 bg-primary"/>
            </div>

            <h1 className="text-2xl font-bold">
              <span className="text-primary">
                PANDA
              </span>

              <span className="ml-2">
                MOTORS
              </span>
            </h1>

          </div>


          <nav className="hidden md:flex items-center space-x-8">

            <a href="#inventory">
              INVENTORY
            </a>

            <a href="#services">
              SERVICES
            </a>

            <a href="#about">
              ABOUT
            </a>

            <a href="#contact">
              CONTACT
            </a>


            <Button
              onClick={() => navigate("/login")}
            >
              LOGIN
            </Button>


            <Button
              variant="outline"
              onClick={() => navigate("/register")}
            >
              REGISTER
            </Button>

          </nav>


          <button
            className="md:hidden"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
          >

            {
              mobileMenuOpen 
              ? <X/>
              : <Menu/>
            }

          </button>


        </div>

      </div>

    </header>
  );
}