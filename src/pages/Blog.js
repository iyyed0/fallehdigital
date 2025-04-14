import React, { useState } from 'react';
import './Blog.css';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [activePost, setActivePost] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Current user simulation (replace with actual auth)
  const currentUser = 'Current User';

  const handlePostSubmit = (e) => {
    e.preventDefault();
    const post = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      author: currentUser,
      date: new Date().toLocaleString(),
      modified: false,
      upvotes: 0,
      downvotes: 0,
      comments: []
    };
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '' });
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleUpdatePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            content: editContent,
            modified: true,
            date: `Modified on ${new Date().toLocaleString()}`
          }
        : post
    ));
    setEditingPost(null);
  };

  const handleDeletePost = (postId) => {
    // Completely remove the post from the array
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleCommentSubmit = (postId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      content: newComment,
      author: currentUser,
      date: new Date().toLocaleString()
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
    setNewComment('');
  };

  const handleVote = (postId, type) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, [type]: post[type] + 1 }
        : post
    ));
  };

  return (
    <div className="blog-container">
      
      <h1>Community Blog</h1>
      
      {/* Create Post Form */}
      <div className="create-post">
        <h2>Create a New Post</h2>
        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Post Title"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              required
            />
          </div>
          <button type="submit">Publish Post</button>
        </form>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet. Be the first to share!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              {/* Modified indicator */}
              {post.modified && (
                <div className="post-status modified-status">[MODIFIED]</div>
              )}
              
              <div className="post-header">
                <h3>{post.title}</h3>
                <span className="post-meta">
                  By {post.author} • {post.date}
                </span>
              </div>
              
              <div className="post-content">
                {editingPost === post.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                ) : (
                  <p>{post.content}</p>
                )}
              </div>
              
              {/* Post actions */}
              <div className="post-actions">
                <div className="vote-buttons">
                  <button 
                    onClick={() => handleVote(post.id, 'upvotes')}
                    className="vote-btn upvote"
                  >
                    👍 {post.upvotes}
                  </button>
                  <button 
                    onClick={() => handleVote(post.id, 'downvotes')}
                    className="vote-btn downvote"
                  >
                    👎 {post.downvotes}
                  </button>
                  <button 
                    onClick={() => setActivePost(activePost === post.id ? null : post.id)}
                    className="comment-btn"
                  >
                    💬 {post.comments.length}
                  </button>
                </div>
                
                {/* Owner actions */}
                {post.author === currentUser && (
                  <div className="owner-actions">
                    {editingPost === post.id ? (
                      <>
                        <button onClick={() => handleUpdatePost(post.id)}>Save</button>
                        <button onClick={() => setEditingPost(null)}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditPost(post)}>Edit</button>
                    )}
                    <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {activePost === post.id && (
                <div className="comments-section">
                  <div className="comments-list">
                    {post.comments.length === 0 ? (
                      <p className="no-comments">No comments yet</p>
                    ) : (
                      post.comments.map(comment => (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <strong>{comment.author}</strong>
                            <span>{comment.date}</span>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="add-comment">
                    <textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button onClick={() => handleCommentSubmit(post.id)}>
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Blog;