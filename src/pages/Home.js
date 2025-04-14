import React from 'react';
import './Home.css';
import Navbar from '../components/Navbar/Navbar';
import Stats from '../components/Stats/Stats';
import ProductCard from '../components/ProductCard/ProductCard';
import BlogPost from '../components/BlogPost/BlogPost';
import Footer from '../components/Footer/Footer';
import Organic from '../components/hero-section/Organic';


const Home = () => {
  // Sample data - replace with real data from your backend
  const products = [
    { title: 'Healthy Cattle', description: 'Labore justo vero ipsum...' },
    { title: 'Fresh Vegetables', description: 'Labore justo vero ipsum...' },
    { title: 'Modern Truck', description: 'Labore justo vero ipsum...' },
    { title: 'Fresh Fruits', description: 'Labore justo vero ipsum...' },
    { title: 'Farming Plans', description: 'Labore justo vero ipsum...' }
  ];

  const blogPosts = [
    { title: 'How to Improve Farming Efficiency', date: 'Feb 24, 2025' },
    { title: 'Best Organic Farming Techniques', date: 'Feb 20, 2025' },
    { title: 'Sustainable Farming Practices', date: 'Feb 18, 2025' }
  ];

  return (
    
    <div className="home-page">
      
      
      <header className="hero-section">
      
        
        <Organic />
      </header>

      <section className="about-section">
        <h2>Our Farm</h2>
        <Stats />
      </section>

      <section className="products-section">
        <h2>Our Products</h2>
        <p>Our platform helps farmers sell their organic products...</p>
        <div className="products-grid">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </section>

      <section className="blog-section">
        <h2>Latest Articles From Our Blog</h2>
        <div className="blog-posts">
          {blogPosts.map((post, index) => (
            <BlogPost key={index} {...post} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
  
};

export default Home;