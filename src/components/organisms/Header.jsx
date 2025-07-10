import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "../../App";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const categories = [
    { name: "Men", path: "/category/men" },
    { name: "Women", path: "/category/women" },
    { name: "Kids", path: "/category/kids" },
    { name: "Beauty", path: "/category/beauty" },
    { name: "Home & Living", path: "/category/home" }
  ];

  return (
    <header className="bg-surface shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Sparkles" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-secondary font-display">
              Style<span className="text-primary">Flow</span>
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="text-secondary font-medium hover:text-primary transition-colors duration-200"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/wishlist")}
              className="relative p-2"
            >
              <ApperIcon name="Heart" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cart")}
              className="relative p-2"
            >
              <ApperIcon name="ShoppingBag" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
</Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2 text-gray-600 hover:text-primary"
            >
              <ApperIcon name="LogOut" size={20} />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-surface border-t border-gray-200"
        >
          <nav className="container mx-auto px-4 py-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="block py-2 text-secondary font-medium hover:text-primary transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;