import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const Products = ({ user }) => {
  // Categories data - consider fetching from API in production
  const categoriesData = [
    { id: 1, name: 'Crops' },
    { id: 2, name: 'Livestock' },
    { id: 3, name: 'Farm Products' },
    { id: 4, name: 'Farm Machinery' },
    { id: 5, name: 'Fertilizers' }
  ];

  const subcategoriesData = {
    1: [ 
      { id: 1, name: 'Food Crops' },
      { id: 2, name: 'Industrial Crops' }
    ],
    2: [ 
      { id: 3, name: 'Meat & Poultry' },
      { id: 4, name: 'Dairy Products' },
      { id: 5, name: 'Other Animal Products' }
    ],
    3: [
      { id: 6, name: 'Farm Products' }
    ],
    4: [
      { id: 7, name: 'Utility Tractors' },
      { id: 8, name: 'Garden Tractors' }
    ],
    5: [ 
      { id: 9, name: 'Primary Nutrients' },
      { id: 10, name: 'Secondary Nutrients' }
    ]
  };

  // State management
  const [activeTab, setActiveTab] = useState('browse');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    image: null,
    category_id: '',
    subcategory_id: '',
    stock: 0
  });

  // Fetch products with proper error handling
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      
      // Add filter params if needed
      if (activeTab === 'myProducts' && user?.id) {
        params.user_id = user.id;
      }
      
      const response = await axios.get('/api/products', {
        params,
        withCredentials: true
      });
      
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to load products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load products when component mounts or tab changes
  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setProductData({
      ...productData,
      category_id: categoryId,
      subcategory_id: ''
    });
  };

  // Handle file upload and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select an image file (JPEG, JPG, PNG, GIF)');
      e.target.value = '';
      return;
    }
  
    setProductData({ ...productData, image: file });
    
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productData.name || !productData.price) {
      alert('Product name and price are required');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('description', productData.description);
    formData.append('category_id', productData.category_id);
    formData.append('subcategory_id', productData.subcategory_id);
    formData.append('stock', productData.stock);
    
    if (productData.image) {
      formData.append('image', productData.image);
    }
  
    try {
      setIsLoading(true);
      
      await axios.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      alert('Product added successfully!');
      setShowAddModal(false);
      setProductData({
        name: '',
        price: '',
        description: '',
        image: null,
        category_id: '',
        subcategory_id: '',
        stock: 0
      });
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to cart/commands
  const addToCommands = (product) => {
    const existingCommands = JSON.parse(localStorage.getItem('commands')) || [];
    const existingIndex = existingCommands.findIndex(cmd => cmd.id === product.id);
    
    if (existingIndex >= 0) {
      existingCommands[existingIndex].quantity = (existingCommands[existingIndex].quantity || 1) + 1;
    } else {
      existingCommands.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('commands', JSON.stringify(existingCommands));
    alert('Product added to your commands!');
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || 
      Number(product.category_id) === Number(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container">
      <p></p>
      <Navbar user={user} />
      
      <div className="products-page">
        <div className="tabs">
          <button 
            className={activeTab === 'browse' ? 'active' : ''}
            onClick={() => setActiveTab('browse')}
          >
            Browse Products
          </button>
          
          {user && (
            <>
              <button 
                className="add-product-btn"
                onClick={() => setShowAddModal(true)}
                disabled={isLoading}
              >
                + Add Product
              </button>
            </>
          )}
        </div>

        <div className="search-filters">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categoriesData.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <p className="no-products">No products found</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                {product.image_url ? (
    <img 
      src={product.image_url}
      alt={product.name}
      className="product-image"
      onError={(e) => {
        e.target.onerror = null; 
        e.target.src = '/placeholder.jpg';
      }}
    />
  ) : (
    <div className="image-placeholder">No Image</div>
  )}
                
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price} DT</p>
                  <p className="stock">Stock: {product.stock}</p>
                  <p className="category">
                    {categoriesData.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                  </p>
                  
                  <button 
                    onClick={() => addToCommands(product)}
                    className="add-to-command"
                    disabled={isLoading}
                  >
                    Add to Cart
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Product</h2>
              
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
                disabled={isLoading}
              >
                &times;
              </button>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product Name*</label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({...productData, name: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Price (DT)*</label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData({...productData, price: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({...productData, description: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="image-upload-container">
                    <label className="file-upload-label">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                        disabled={isLoading}
                      />
                      Choose Image
                    </label>
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Category*</label>
                  <select
                    value={productData.category_id}
                    onChange={(e) => setProductData({...productData, category_id: e.target.value})}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select category</option>
                    {categoriesData.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subcategory</label>
                  <select
                    value={productData.subcategory_id}
                    onChange={(e) => setProductData({...productData, subcategory_id: e.target.value})}
                    disabled={!productData.category_id || isLoading}
                  >
                    <option value="">Select subcategory</option>
                    {productData.category_id && 
                      subcategoriesData[productData.category_id]?.map(subcat => (
                        <option key={subcat.id} value={subcat.id}>
                          {subcat.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock*</label>
                  <input
                    type="number"
                    value={productData.stock}
                    onChange={(e) => setProductData({...productData, stock: e.target.value})}
                    min="0"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;