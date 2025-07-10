import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import QuickViewModal from "./QuickViewModal";
import { addToCart, addToWishlist } from "@/services/api/cartService";
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }

    setIsLoading(true);
    try {
      await addToCart({
        productId: product.Id,
        quantity: 1,
        size: product.sizes?.[0] || "M",
        color: product.colors?.[0] || "Default"
      });
      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToWishlist(product.Id);
      toast.success("Added to wishlist!");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
};

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Delay showing quick view to prevent accidental triggers
    setTimeout(() => {
      if (isHovered) {
        setShowQuickView(true);
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowQuickView(false);
  };

  const handleMouseMove = (e) => {
    if (showQuickView) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="product-card group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
      <Link to={`/product/${product.Id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0] || "/api/placeholder/300/400"}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {discountPercentage > 0 && (
            <Badge variant="sale" className="absolute top-2 left-2 transform -rotate-12">
              {discountPercentage}% OFF
            </Badge>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute top-2 right-2 flex flex-col gap-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToWishlist}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              <ApperIcon name="Heart" size={16} />
            </Button>
          </motion.div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-secondary line-clamp-1">{product.brand}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.name}</p>
          
          <div className="flex items-center gap-2 mt-2">
{product.discountPrice ? (
              <>
                <span className="text-lg font-semibold text-secondary">
                  ₹{(product.discountPrice || 0).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{(product.price || 0).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-secondary">
                ₹{(product.price || 0).toLocaleString()}
              </span>
            )}
          </div>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              height: isHovered ? "auto" : 0 
            }}
            className="overflow-hidden mt-3"
          >
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock || isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? (
                <ApperIcon name="Loader2" size={16} className="animate-spin" />
              ) : !product.inStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </Button>
          </motion.div>
        </div>
</Link>
      </motion.div>
      
      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isVisible={showQuickView}
        onClose={() => setShowQuickView(false)}
        mousePosition={mousePosition}
      />
    </>
  );
};

export default ProductCard;