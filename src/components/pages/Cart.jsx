import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import CartItem from "@/components/molecules/CartItem";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { getCartItems, clearCart } from "@/services/api/cartService";
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
const loadCartItems = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getCartItems();
      setCartItems(data);
    } catch (err) {
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce((savings, item) => {
      if (item.product.discountPrice) {
        const saved = (item.product.price - item.product.discountPrice) * item.quantity;
        return savings + saved;
      }
      return savings;
    }, 0);
};

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful checkout
      await clearCart();
      
      // Update local state
      setCartItems([]);
      setShowCheckoutModal(false);
      
      // Show success message
      toast.success("Order placed successfully! You will receive a confirmation email shortly.");
      
    } catch (err) {
      toast.error("Failed to process checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 shimmer-effect" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg shimmer-effect" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg shimmer-effect" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Error message={error} onRetry={loadCartItems} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty 
          title="Your cart is empty"
          description="Add some amazing products to your cart and come back to checkout"
          actionText="Continue Shopping"
          actionLink="/"
          icon="ShoppingCart"
        />
      </div>
    );
  }

  const total = calculateTotal();
  const savings = calculateSavings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} item{cartItems.length > 1 ? "s" : ""} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CartItem
                  item={item}
                  onUpdate={loadCartItems}
                  onRemove={loadCartItems}
                />
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface p-6 rounded-lg shadow-card h-fit"
          >
            <h3 className="text-xl font-bold text-secondary mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total.toLocaleString()}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between text-success">
                  <span>You save</span>
                  <span className="font-medium">-₹{savings.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-success">FREE</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

<Button 
              className="w-full mb-4" 
              size="lg"
              onClick={() => setShowCheckoutModal(true)}
            >
              <ApperIcon name="CreditCard" size={20} className="mr-2" />
              Proceed to Checkout
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/">
                <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
                Continue Shopping
              </Link>
            </Button>
</motion.div>
        </div>

        {/* Checkout Confirmation Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-secondary">Confirm Order</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={checkoutLoading}
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    {cartItems.map((item) => (
                      <div key={item.Id} className="flex justify-between">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span>₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-success">
                      <span>You save</span>
                      <span>-₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-success">FREE</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={checkoutLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="CreditCard" size={16} className="mr-2" />
                      Confirm Order
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;