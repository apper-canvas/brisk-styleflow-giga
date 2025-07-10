// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const getReviews = async (productId) => {
  try {
    const tableName = 'review';
    
    const params = {
      fields: [
        { field: { "Name": "Name" } },
        { field: { "Name": "user_name" } },
        { field: { "Name": "rating" } },
        { field: { "Name": "comment" } },
        { field: { "Name": "created_at" } },
        { field: { "Name": "updated_at" } }
      ],
      where: [
        {
          FieldName: "product",
          Operator: "EqualTo",
          Values: [parseInt(productId)]
        }
      ],
      orderBy: [
        {
          fieldName: "created_at",
          sorttype: "DESC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    } else {
      return response.data.map(review => ({
        Id: review.Id,
        productId: productId,
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching reviews:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const addReview = async (reviewData) => {
  try {
    const tableName = 'review';
    
    const params = {
      records: [
        {
          Name: `Review by ${reviewData.userName}`,
          product: parseInt(reviewData.productId),
          user_name: reviewData.userName,
          rating: reviewData.rating,
          comment: reviewData.comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
      }
      
      const newReview = successfulRecords.map(result => result.data)[0];
      return {
        Id: newReview.Id,
        productId: reviewData.productId,
        userName: newReview.user_name,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.created_at,
        updatedAt: newReview.updated_at
      };
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error adding review:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const tableName = 'review';
    
    const params = {
      records: [
        {
          Id: id,
          user_name: reviewData.userName,
          rating: reviewData.rating,
          comment: reviewData.comment,
          updated_at: new Date().toISOString()
        }
      ]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${failedUpdates}`);
      }
      
      const updatedReview = successfulUpdates.map(result => result.data)[0];
      return {
        Id: updatedReview.Id,
        productId: reviewData.productId,
        userName: updatedReview.user_name,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        createdAt: updatedReview.created_at,
        updatedAt: updatedReview.updated_at
      };
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating review:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const deleteReview = async (id) => {
  try {
    const tableName = 'review';
    
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return false;
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting review:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

export const getReviewsSummary = async (productId) => {
  try {
    const reviews = await getReviews(productId);
    
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const ratingBreakdown = reviews.reduce((breakdown, review) => {
      breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
      return breakdown;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    
    return {
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingBreakdown
    };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching review summary:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
};