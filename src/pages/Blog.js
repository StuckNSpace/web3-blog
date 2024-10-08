import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import BlogABI from '../abis/BlogABI.json';
import DOMPurify from 'dompurify';

const Blog = () => {
  const [userAddress, setUserAddress] = useState(null);
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [activePostIndex, setActivePostIndex] = useState(null); // Track the active post
  const [loading, setLoading] = useState(false);
  const [hiddenPosts, setHiddenPosts] = useState(() => {
    const saved = localStorage.getItem('hiddenPosts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHidden, setShowHidden] = useState(false); // Toggle to show/hide hidden posts

  const contractAddress = '0x426fa663F3d77387F3a7CFA31E59fc2017F2B79B'; // Update with your contract address on Base

  useEffect(() => {
    if (window.ethereum) {
      fetchPosts();
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        closeActivePost(); // Close the post when escape is pressed
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed.');
    }
  };

  const addPost = async () => {
    if (!userAddress) {
      alert('You need to connect your wallet before posting.');
      return;
    }
    if (post.trim() === '') {
      alert('Post content cannot be empty.');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const blogContract = new Contract(contractAddress, BlogABI, signer);
      const tx = await blogContract.createPost(post);
      await tx.wait();

      alert('Post successfully added to the blockchain!');
      setPost(''); // Clear post input after submission

      fetchPosts(); // Reload the posts after submission
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true); // Start loading indicator
      const provider = new BrowserProvider(window.ethereum);
      const blogContract = new Contract(contractAddress, BlogABI, provider);

      const postCount = await blogContract.getPostCount();
      const postArray = [];

      for (let i = 0; i < postCount; i++) {
        const post = await blogContract.getPost(i);
        postArray.push({
          author: post[0],
          content: post[1],
        });
      }

      setPosts(postArray); // Store posts in state
      setLoading(false); // Stop loading indicator
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handlePostClick = (index) => {
    if (activePostIndex === index) {
      closeActivePost(); // Close post if already active
    } else {
      stopPreviousScript(); // Stop any previous scripts
      setActivePostIndex(index); // Open the clicked post
      setTimeout(() => {
        runScriptForPost(index); // Run the script after a short delay
        scrollToPost(index); // Scroll to the post container after opening
      }, 100);
      disablePageScroll(); // Disable scrolling and spacebar input for the page
    }
  };

  const stopPreviousScript = () => {
    const existingCanvas = document.querySelector("canvas");
    if (existingCanvas) {
      existingCanvas.remove(); // Remove any existing canvas elements
    }
  };

  const closeActivePost = () => {
    stopPreviousScript(); // Stop any active script
    setActivePostIndex(null); // Clear the active post
    enablePageScroll(); // Re-enable scrolling and spacebar input for the page
  };

  const runScriptForPost = (index) => {
    const postContent = posts[index].content;

    // Sanitize and inject content into the post container
    const postContainer = document.querySelector(`#post-${index}`);
    const sanitizedHTML = DOMPurify.sanitize(postContent, {
      ADD_TAGS: ['script', 'iframe', 'canvas'],
      ADD_ATTR: ['onload', 'src', 'width', 'height'],
    });
    
    postContainer.innerHTML = sanitizedHTML;

    // Execute scripts in the sanitized content
    const scriptsContainer = document.createElement('div');
    scriptsContainer.innerHTML = sanitizedHTML;

    const scriptElements = scriptsContainer.querySelectorAll('script');
    const externalScripts = Array.from(scriptElements).filter(script => script.src);
    const inlineScripts = Array.from(scriptElements).filter(script => !script.src);

    const loadExternalScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          reject();
        };
        document.body.appendChild(script);
      });
    };

    const executeInlineScripts = () => {
      inlineScripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        const scriptText = oldScript.textContent;

        newScript.textContent = `(function() { ${scriptText} })();`;

        document.body.appendChild(newScript);
      });
    };

    const loadExternalScriptsSequentially = async () => {
      for (const script of externalScripts) {
        try {
          await loadExternalScript(script.src);
        } catch (error) {
          console.error(error);
        }
      }
      executeInlineScripts();
    };

    loadExternalScriptsSequentially();
  };

  // Automatically scroll the page to the post container when opened
  const scrollToPost = (index) => {
    const postContainer = document.querySelector(`#post-${index}`);
    if (postContainer) {
      postContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const disablePageScroll = () => {
    const preventScroll = (event) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ']; // Arrow keys and spacebar
      if (keys.includes(event.key)) {
        event.preventDefault(); // Prevent default behavior
      }
    };

    window.addEventListener('keydown', preventScroll);
  };

  const enablePageScroll = () => {
    const preventScroll = (event) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
      if (keys.includes(event.key)) {
        event.preventDefault();
      }
    };

    window.removeEventListener('keydown', preventScroll); // Re-enable scrolling and spacebar after post is closed
  };

  const hidePost = (index) => {
    const updatedHiddenPosts = [...hiddenPosts, index];
    setHiddenPosts(updatedHiddenPosts);
    localStorage.setItem('hiddenPosts', JSON.stringify(updatedHiddenPosts)); // Save hidden posts to localStorage
  };

  const unhidePost = (index) => {
    const updatedHiddenPosts = hiddenPosts.filter((i) => i !== index);
    setHiddenPosts(updatedHiddenPosts);
    localStorage.setItem('hiddenPosts', JSON.stringify(updatedHiddenPosts)); // Update localStorage
  };

  const deletePost = (index) => {
    const updatedPosts = posts.filter((_, i) => i !== index);
    setPosts(updatedPosts);

    // Remove post from hiddenPosts if necessary
    const updatedHiddenPosts = hiddenPosts.filter((i) => i !== index);
    setHiddenPosts(updatedHiddenPosts);

    // Update localStorage
    localStorage.setItem('hiddenPosts', JSON.stringify(updatedHiddenPosts));
  };

  return (
    <div className="container">
      <h1>BASE Blog</h1>
      <p>Here you can make a post on chain!</p>

      {!userAddress ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <p>Connected as: {userAddress}</p>
      )}

      {userAddress && (
        <div>
          <h2>Create a New Post</h2>
          <textarea
            rows="5"
            placeholder="Write your blog post here, including HTML/JavaScript if needed..."
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />
          <br />
          <button onClick={addPost}>Submit Post</button>
        </div>
      )}

      <div>
        <h2>Posts</h2>
        {loading ? (
          <p className="loading">Loading posts...</p>
        ) : posts.length > 0 ? (
          posts.map((p, index) => (
            (!hiddenPosts.includes(index) || showHidden) && (
              <div key={index} className="post-container" style={{ position: 'relative' }}>
                <p><strong>{p.author}</strong> says:</p>
                <button onClick={() => handlePostClick(index)} style={{ fontSize: '0.8em', padding: '5px 10px' }}>
                  {activePostIndex === index ? 'Close Post' : 'View Post'}
                </button>
                <button onClick={() => hidePost(index)} style={{ fontSize: '0.8em', padding: '5px 10px' }}>
                  Hide Post
                </button>
                {showHidden && hiddenPosts.includes(index) && (
                  <>
                    <button style={{ fontSize: '0.8em', padding: '5px 10px' }} onClick={() => unhidePost(index)}>
                      Unhide Post
                    </button>
                    <button style={{ fontSize: '0.8em', padding: '5px 10px', backgroundColor: 'red', color: 'white' }} onClick={() => deletePost(index)}>
                      Delete Post
                    </button>
                  </>
                )}
                {activePostIndex === index && (
                  <div id={`post-${index}`} className="post-content" style={{ padding: '20px', border: '1px solid #ccc', minHeight: '600px', position: 'relative' }}>
                    {/* ESC to exit button */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '5px 10px',
                      fontSize: '0.8em',
                      borderRadius: '5px',
                    }}>
                      Press ESC to exit
                    </div>
                  </div>
                )}
              </div>
            )
          ))
        ) : (
          <p>No posts yet. Be the first to post!</p>
        )}
      </div>

      {/* Button to toggle the visibility of hidden posts */}
      <div style={{ position: 'fixed', bottom: '10px', left: '10px' }}>
        <button style={{ fontSize: '0.8em', padding: '5px 10px' }} onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? 'Hide Hidden Posts' : 'Show Hidden Posts'}
        </button>
      </div>
    </div>
  );
};

export default Blog;
