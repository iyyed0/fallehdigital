import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import './JobOffers.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

const JobOffers = ({ user }) => {
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('allJobs');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    start_date: '',
    end_date: ''
  });

  // JobOffers.js
const fetchOffers = async () => {
  try {
    setIsLoading(true);
    
    // Include filter parameter based on activeTab
    const params = {};
    if (activeTab === 'myJobs') {
      params.filter = 'my';
    }
    
    const response = await axios.get('/api/job-offers', {
      params,
      withCredentials: true
    });
    
    setOffers(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    
    if (error.response?.status === 401) {
      navigate('/login');
    } else {
      alert('Failed to load job offers. Please try again later.');
    }
  } finally {
    setIsLoading(false);
  }
};

// Update useEffect to depend on activeTab
useEffect(() => {
  fetchOffers();
}, [activeTab]); // Re-fetch when tab changes

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleApply = async (offerId) => {
    try {
      setIsLoading(true);
      await axios.post(`/api/job-offers/${offerId}/apply`, {}, {
        withCredentials: true
      });
      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, status: 'pending' } : offer
      ));
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      alert(error.response?.data?.message || 'Failed to apply');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post('/api/job-offers', newOffer, {
        withCredentials: true
      });
      await fetchOffers();
      setNewOffer({
        title: '',
        description: '',
        location: '',
        salary: '',
        start_date: '',
        end_date: ''
      });
      setShowAddModal(false);
      alert('Job offer created successfully!');
    } catch (error) {
      console.error('Error adding offer:', error);
      alert(error.response?.data?.message || 'Failed to create job offer');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || 
                          offer.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus = !statusFilter || offer.status === statusFilter;
    const matchesTab = activeTab === 'allJobs' || 
                      (activeTab === 'myJobs' && offer.user_id === user?.id);
    
    return matchesSearch && matchesLocation && matchesStatus && matchesTab;
  });

  return (
    <div className="app-container">
      <p></p>
      
      <div className="job-offers-page">
        <div className="tabs">
          <button 
            className={activeTab === 'allJobs' ? 'active' : ''}
            onClick={() => setActiveTab('allJobs')}
          >
            All Jobs
          </button>
          {user && (
            <button 
              className={activeTab === 'myJobs' ? 'active' : ''}
              onClick={() => setActiveTab('myJobs')}
            >
              My Jobs
            </button>
          )}
          {user && (
            <button 
              className="add-job-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add Job Offer
            </button>
          )}
        </div>

        <div className="search-filters">
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="filter-group">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Locations</option>
              <option value="Tunis">Tunis</option>
              <option value="Sfax">Sfax</option>
              <option value="Sousse">Sousse</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="filled">Filled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading job offers...</div>
        ) : filteredOffers.length === 0 ? (
          <p className="no-offers">No job offers found</p>
        ) : (
          <div className="offers-grid">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-info">
                  <h3>{offer.title}</h3>
                  <p className="location">{offer.location}</p>
                  <p className="salary">{offer.salary ? `${offer.salary} DT` : 'Salary negotiable'}</p>
                  <p className={`status ${offer.status}`}>{offer.status}</p>
                  <p className="dates">
                    {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                  </p>
                  <p className="description">{offer.description}</p>
                </div>
                <div className="offer-actions">
                  {offer.status === 'available' && user && (
                    <button 
                      onClick={() => handleApply(offer.id)}
                      className="apply-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                  {user && offer.user_id === user.id && (
                    <button className="view-applications-btn">
                      View Applications
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Job Offer</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
                disabled={isLoading}
              >
                &times;
              </button>

              <form onSubmit={handleAddOffer}>
                <div className="form-group">
                  <label>Job Title*</label>
                  <input
                    type="text"
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Description*</label>
                  <textarea
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Location*</label>
                  <input
                    type="text"
                    value={newOffer.location}
                    onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Salary (DT)</label>
                  <input
                    type="number"
                    value={newOffer.salary}
                    onChange={(e) => setNewOffer({...newOffer, salary: e.target.value})}
                    min="0"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Start Date*</label>
                  <input
                    type="date"
                    value={newOffer.start_date}
                    onChange={(e) => setNewOffer({...newOffer, start_date: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>End Date*</label>
                  <input
                    type="date"
                    value={newOffer.end_date}
                    onChange={(e) => setNewOffer({...newOffer, end_date: e.target.value})}
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
                    {isLoading ? 'Submitting...' : 'Add Job Offer'}
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

export default JobOffers;