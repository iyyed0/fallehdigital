import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Commandes.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const Commandes = () => {
  const [commands, setCommands] = useState([]);

  // Load commands from localStorage on component mount
  useEffect(() => {
    const savedCommands = JSON.parse(localStorage.getItem('commands')) || [];
    setCommands(savedCommands);
  }, []);

  // Function to remove a command
  const removeCommand = (id) => {
    const updatedCommands = commands.filter(cmd => cmd.id !== id);
    setCommands(updatedCommands);
    localStorage.setItem('commands', JSON.stringify(updatedCommands));
  };

  return (
    <div className="commandes-container">
      
      <div className="commandes-content">
        <h1>Mes Commandes</h1>
        
        <div className="orders-list">
          {commands.length === 0 ? (
            <div className="empty-orders">
              <p>Aucune commande trouvée</p>
              <Link to="/products" className="browse-products-btn">
                Parcourir les produits
              </Link>
            </div>
          ) : (
            <>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((command, index) => (
                    <tr key={index} className="order-item">
                      <td className="product-info">
                        {command.image && (
                          <img 
                            src={`http://localhost:5000/uploads/${command.image}`} 
                            alt={command.name} 
                            className="product-image"
                          />
                        )}
                        <span>{command.name}</span>
                      </td>
                      <td>{command.price} DT</td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          defaultValue="1"
                          onChange={(e) => {
                            const updated = [...commands];
                            updated[index].quantity = e.target.value;
                            setCommands(updated);
                          }}
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => removeCommand(command.id)}
                          className="remove-btn"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="checkout-section">
                <div className="total-amount">
                  Total: {commands.reduce((sum, cmd) => sum + (cmd.price * (cmd.quantity || 1)), 0)} DT
                </div>
                <button className="checkout-btn">Passer la commande</button>
              </div>
              <div className="additional-actions">
                <Link to="/products" className="continue-shopping-btn">
                  Continuer vos achats
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Commandes;