import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import StarRating from "@/components/atoms/StarRating";
import Loading from "@/components/ui/Loading";
import ApperIcon from "@/components/ApperIcon";
import { getReviews, addReview, updateReview, deleteReview, getReviewsSummary } from "@/services/api/reviewService";
import { cn } from "@/utils/cn";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [filterRating, setFilterRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const reviewsPerPage = 5;

  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    rating: 0,
    comment: ""
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [reviewsData, summaryData] = await Promise.all([
        getReviews(productId),
        getReviewsSummary(productId)
      ]);
      
      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!formData.userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!formData.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      if (editingReview) {
await updateReview(editingReview.Id, {
          userName: formData.userName,
          rating: formData.rating,
          comment: formData.comment,
          productId
        });
        toast.success("Review updated successfully!");
      } else {
        await addReview({
          userName: formData.userName,
          rating: formData.rating,
          comment: formData.comment,
          productId
        });
        toast.success("Review added successfully!");
      }
      
      setFormData({ userName: "", rating: 0, comment: "" });
      setShowReviewForm(false);
      setEditingReview(null);
      loadReviews();
    } catch (error) {
      toast.error("Failed to save review. Please try again.");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
setFormData({
      userName: review.userName,
      rating: review.rating,
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteReview(reviewId);
      toast.success("Review deleted successfully!");
      loadReviews();
    } catch (error) {
      toast.error("Failed to delete review. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setFormData({ userName: "", rating: 0, comment: "" });
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews;
    
    if (filterRating > 0) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return sorted;
  };

  const getPaginatedReviews = () => {
    const filtered = getFilteredAndSortedReviews();
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredAndSortedReviews();
    return Math.ceil(filtered.length / reviewsPerPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-card">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadReviews} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-semibold text-secondary mb-4">Customer Reviews</h3>
        
        {summary && summary.totalReviews > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-secondary">
                  {summary.averageRating}
                </div>
                <div>
                  <StarRating rating={summary.averageRating} readOnly size={20} />
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8">{rating}</span>
                  <ApperIcon name="Star" size={12} className="text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${summary.totalReviews > 0 ? (summary.ratingBreakdown[rating] / summary.totalReviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {summary.ratingBreakdown[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="MessageCircle" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Add Review Button */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <Button 
          onClick={() => setShowReviewForm(true)}
          className="w-full md:w-auto"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-card p-6"
        >
          <h4 className="text-lg font-semibold text-secondary mb-4">
            {editingReview ? "Edit Review" : "Write a Review"}
          </h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size={24}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <Button type="submit">
                {editingReview ? "Update Review" : "Submit Review"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters and Sort */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterRating(0)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                  filterRating === 0 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                    filterRating === rating 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {rating} <ApperIcon name="Star" size={12} />
                  ({reviews.filter(r => r.rating === rating).length})
                </button>
              ))}
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {getPaginatedReviews().length > 0 ? (
        <div className="space-y-4">
          {getPaginatedReviews().map((review) => (
            <motion.div
              key={review.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-card p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-secondary">{review.userName}</h5>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} readOnly size={14} />
                      <span className="text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="p-1 text-gray-400 hover:text-primary transition-colors"
                  >
                    <ApperIcon name="Edit" size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.Id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              
              {review.updatedAt !== review.createdAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Edited on {formatDate(review.updatedAt)}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="text-center">
            <ApperIcon name="MessageCircle" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {filterRating > 0 
                ? `No reviews with ${filterRating} star${filterRating > 1 ? 's' : ''} found.`
                : "No reviews available."
              }
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {getTotalPages() > 1 && (
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex justify-center items-center gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            
            {[...Array(getTotalPages())].map((_, index) => (
              <Button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
              >
                {index + 1}
              </Button>
            ))}
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
              disabled={currentPage === getTotalPages()}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;