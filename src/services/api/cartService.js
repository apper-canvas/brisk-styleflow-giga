// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const getCartItems = async () => {
  try {
    const tableName = 'cart_item';
    
    const params = {
      fields: [
        { field: { "Name": "Name" } },
        { field: { "Name": "quantity" } },
        { field: { "Name": "size" } },
        { field: { "Name": "color" } },
        { field: { "Name": "added_at" } },
        { 
          field: { "name": "product" },
          referenceField: { field: { "Name": "Name" } }
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    } else {
      return response.data.map(item => ({
        Id: item.Id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        addedAt: item.added_at,
        product: item.product ? {
          Id: item.product.Id,
          name: item.product.Name,
          brand: item.product.brand,
          price: item.product.price,
          discountPrice: item.product.discount_price,
          images: item.product.images ? item.product.images.split(',') : []
        } : null
      })).filter(item => item.product);
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching cart items:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const addToCart = async (cartItem) => {
  try {
    const tableName = 'cart_item';
    
    const params = {
      records: [
        {
          Name: `Cart Item - ${cartItem.productId}`,
          product: parseInt(cartItem.productId),
          quantity: cartItem.quantity,
          size: cartItem.size,
          color: cartItem.color,
          added_at: new Date().toISOString()
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
      
      return successfulRecords.map(result => result.data)[0];
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error adding to cart:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const updateCartItem = async (id, updateData) => {
  try {
    const tableName = 'cart_item';
    
    const params = {
      records: [
        {
          Id: id,
          quantity: updateData.quantity
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
      
      return successfulUpdates.map(result => result.data)[0];
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating cart item:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const removeFromCart = async (id) => {
  try {
    const tableName = 'cart_item';
    
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
      console.error("Error removing from cart:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

export const clearCart = async () => {
  try {
    // First get all cart items to delete them
    const cartItems = await getCartItems();
    const itemIds = cartItems.map(item => item.Id);
    
    if (itemIds.length === 0) {
      return { success: true };
    }
    
    const tableName = 'cart_item';
    
    const params = {
      RecordIds: itemIds
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return false;
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error clearing cart:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

export const getWishlistItems = async () => {
  try {
    const tableName = 'wishlist_item';
    
    const params = {
      fields: [
        { field: { "Name": "Name" } },
        { field: { "Name": "added_at" } },
        { 
          field: { "name": "product" },
          referenceField: { field: { "Name": "Name" } }
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    } else {
      return response.data.map(item => item.product ? {
        Id: item.product.Id,
        name: item.product.Name,
        brand: item.product.brand,
        price: item.product.price,
        discountPrice: item.product.discount_price,
        images: item.product.images ? item.product.images.split(',') : [],
        sizes: item.product.sizes ? item.product.sizes.split(',') : [],
        colors: item.product.colors ? item.product.colors.split(',') : [],
        category: item.product.category,
        inStock: item.product.in_stock
      } : null).filter(Boolean);
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching wishlist items:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const addToWishlist = async (productId) => {
  try {
    const tableName = 'wishlist_item';
    
    const params = {
      records: [
        {
          Name: `Wishlist Item - ${productId}`,
          product: parseInt(productId),
          added_at: new Date().toISOString()
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
      
      return successfulRecords.map(result => result.data)[0];
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error adding to wishlist:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    // First find the wishlist item with this product ID
    const tableName = 'wishlist_item';
    
    const findParams = {
      fields: [
        { field: { "Name": "Name" } }
      ],
      where: [
        {
          FieldName: "product",
          Operator: "EqualTo",
          Values: [parseInt(productId)]
        }
      ]
    };
    
    const findResponse = await apperClient.fetchRecords(tableName, findParams);
    
    if (!findResponse || !findResponse.data || findResponse.data.length === 0) {
      return { success: false, message: "Product not found in wishlist" };
    }
    
    const wishlistItemId = findResponse.data[0].Id;
    
    const params = {
      RecordIds: [wishlistItemId]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return false;
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error removing from wishlist:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};