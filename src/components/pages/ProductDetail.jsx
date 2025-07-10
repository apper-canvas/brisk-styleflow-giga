import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import StarRating from "@/components/atoms/StarRating";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import ProductReviews from "@/components/organisms/ProductReviews";
import { getProductById } from "@/services/api/productService";
import { addToCart, addToWishlist } from "@/services/api/cartService";
import { getReviewsSummary } from "@/services/api/reviewService";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [productData, reviewData] = await Promise.all([
        getProductById(parseInt(productId)),
        getReviewsSummary(parseInt(productId))
      ]);
      
      setProduct(productData);
      setReviewSummary(reviewData);
      setSelectedSize(productData.sizes?.[0] || "");
      setSelectedColor(productData.colors?.[0] || "");
    } catch (err) {
      setError("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    setIsAddingToCart(true);
    try {
await addToCart({
        productId: product.Id,
        quantity,
        size: selectedSize,
        color: selectedColor
      });
      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(product.Id);
      toast.success("Added to wishlist!");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-200 rounded-lg shimmer-effect" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded shimmer-effect" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded shimmer-effect" />
            <div className="h-6 bg-gray-200 rounded w-3/4 shimmer-effect" />
            <div className="h-8 bg-gray-200 rounded w-1/2 shimmer-effect" />
            <div className="h-32 bg-gray-200 rounded shimmer-effect" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Error message={error} onRetry={loadProduct} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Error message="Product not found" />
      </div>
    );
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={product.images?.[selectedImageIndex] || "/api/placeholder/600/600"}
              alt={product.name}
              className="w-full h-96 lg:h-[600px] object-cover"
            />
            {discountPercentage > 0 && (
              <Badge variant="sale" className="absolute top-4 left-4 transform -rotate-12">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`
                    h-20 rounded-md overflow-hidden border-2 transition-colors
                    ${selectedImageIndex === index ? "border-primary" : "border-gray-200"}
                  `}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
className="space-y-6"
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-secondary">{product.brand}</h1>
              {reviewSummary && reviewSummary.totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewSummary.averageRating} readOnly size={16} />
                  <span className="text-sm text-gray-600">
                    ({reviewSummary.totalReviews} review{reviewSummary.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-lg">{product.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-secondary">
                  ₹{product.discountPrice.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <Badge variant="success" className="text-sm">
                  {discountPercentage}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-secondary">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold text-secondary mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      px-4 py-2 border rounded-md font-medium transition-colors
                      ${selectedSize === size 
                        ? "border-primary bg-primary text-white" 
                        : "border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold text-secondary mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      px-4 py-2 border rounded-md font-medium transition-colors
                      ${selectedColor === color 
                        ? "border-primary bg-primary text-white" 
                        : "border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-secondary mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="Minus" size={16} />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="Plus" size={16} />
                </button>
              </div>
              
              {!product.inStock && (
                <Badge variant="error">Out of Stock</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className="flex-1 flex items-center justify-center gap-2"
              size="lg"
            >
              {isAddingToCart ? (
                <ApperIcon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <ApperIcon name="ShoppingCart" size={20} />
              )}
              {!product.inStock ? "Out of Stock" : "Add to Cart"}
            </Button>
            
            <Button
              onClick={handleAddToWishlist}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Heart" size={20} />
              Wishlist
            </Button>
          </div>

          {/* Product Description */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-secondary mb-3">Product Details</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || "A premium quality product designed for style and comfort. Made with high-quality materials and attention to detail."}
            </p>
          </div>
</motion.div>
      </div>
      
      {/* Product Reviews */}
      <ProductReviews productId={parseInt(productId)} />
    </div>
  );
};

export default ProductDetail;