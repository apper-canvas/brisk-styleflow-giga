// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const getProducts = async (filters = {}, sortBy = "featured", limit = null) => {
  try {
    const tableName = 'product';
    
    const params = {
      fields: [
        { field: { "Name": "Name" } },
        { field: { "Name": "brand" } },
        { field: { "Name": "price" } },
        { field: { "Name": "discount_price" } },
        { field: { "Name": "images" } },
        { field: { "Name": "sizes" } },
        { field: { "Name": "colors" } },
        { field: { "Name": "category" } },
        { field: { "Name": "subcategory" } },
        { field: { "Name": "in_stock" } },
        { field: { "Name": "description" } }
      ],
      orderBy: [
        {
          fieldName: sortBy === "price-low" ? "price" : sortBy === "price-high" ? "price" : "Id",
          sorttype: sortBy === "price-high" || sortBy === "newest" ? "DESC" : "ASC"
        }
      ]
    };

    if (limit) {
      params.pagingInfo = { limit, offset: 0 };
    }

    // Add filters
    if (filters.search || filters.categories?.length > 0 || filters.brands?.length > 0) {
      params.where = [];
      
      if (filters.search) {
        params.where.push({
          FieldName: "Name",
          Operator: "Contains",
          Values: [filters.search]
        });
      }
      
      if (filters.categories?.length > 0) {
        params.where.push({
          FieldName: "category",
          Operator: "ExactMatch",
          Values: filters.categories
        });
      }
      
      if (filters.brands?.length > 0) {
        params.where.push({
          FieldName: "brand",
          Operator: "ExactMatch",
          Values: filters.brands
        });
      }
    }
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    } else {
      // Transform database response to match UI expectations
      return response.data.map(product => ({
        Id: product.Id,
        name: product.Name,
        brand: product.brand,
        price: product.price,
        discountPrice: product.discount_price,
        images: product.images ? product.images.split(',') : [],
        sizes: product.sizes ? product.sizes.split(',') : [],
        colors: product.colors ? product.colors.split(',') : [],
        category: product.category,
        subcategory: product.subcategory,
        inStock: product.in_stock,
        description: product.description
      }));
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching products:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const tableName = 'product';
    
    const params = {
      fields: [
        { field: { "Name": "Name" } },
        { field: { "Name": "brand" } },
        { field: { "Name": "price" } },
        { field: { "Name": "discount_price" } },
        { field: { "Name": "images" } },
        { field: { "Name": "sizes" } },
        { field: { "Name": "colors" } },
        { field: { "Name": "category" } },
        { field: { "Name": "subcategory" } },
        { field: { "Name": "in_stock" } },
        { field: { "Name": "description" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response || !response.data) {
      return null;
    } else {
      // Transform database response to match UI expectations
      const product = response.data;
      return {
        Id: product.Id,
        name: product.Name,
        brand: product.brand,
        price: product.price,
        discountPrice: product.discount_price,
        images: product.images ? product.images.split(',') : [],
        sizes: product.sizes ? product.sizes.split(',') : [],
        colors: product.colors ? product.colors.split(',') : [],
        category: product.category,
        subcategory: product.subcategory,
        inStock: product.in_stock,
        description: product.description
      };
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching product with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    const tableName = 'product';
    
    const params = {
      records: [
        {
          Name: productData.name,
          brand: productData.brand,
          price: productData.price,
          discount_price: productData.discountPrice,
          images: Array.isArray(productData.images) ? productData.images.join(',') : productData.images,
          sizes: Array.isArray(productData.sizes) ? productData.sizes.join(',') : productData.sizes,
          colors: Array.isArray(productData.colors) ? productData.colors.join(',') : productData.colors,
          category: productData.category,
          subcategory: productData.subcategory,
          in_stock: productData.inStock,
          description: productData.description
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
      
      return successfulRecords.map(result => result.data);
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating product:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const tableName = 'product';
    
    const params = {
      records: [
        {
          Id: id,
          Name: productData.name,
          brand: productData.brand,
          price: productData.price,
          discount_price: productData.discountPrice,
          images: Array.isArray(productData.images) ? productData.images.join(',') : productData.images,
          sizes: Array.isArray(productData.sizes) ? productData.sizes.join(',') : productData.sizes,
          colors: Array.isArray(productData.colors) ? productData.colors.join(',') : productData.colors,
          category: productData.category,
          subcategory: productData.subcategory,
          in_stock: productData.inStock,
          description: productData.description
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
      
      return successfulUpdates.map(result => result.data);
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating product:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};

export const deleteProduct = async (id) => {
  try {
    const tableName = 'product';
    
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${failedDeletions}`);
      }
      
      return successfulDeletions.length === 1;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting product:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
  }
};