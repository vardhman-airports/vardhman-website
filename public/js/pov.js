// public/js/pov.js
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('postModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // Close modal when clicking the X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});

// Function to show post in modal
async function showPost(postId) {
    const modal = document.getElementById('postModal');
    const modalContent = document.getElementById('modalContent');
    
    try {
        // Show loading state
        modalContent.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading post...</p>
            </div>
        `;
        modal.style.display = 'block';
        
        // Fetch post data
        const response = await fetch(`/pov/post/${postId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const post = await response.json();
        
        // Populate modal with post data
        modalContent.innerHTML = `
            <h2 class="modal-post-title">${escapeHtml(post.title)}</h2>
            <div class="modal-post-meta">
                <span class="modal-post-author">By ${escapeHtml(post.author)}</span>
                <span class="modal-post-date">${formatDate(post.createdAt)}</span>
            </div>
            <div class="modal-post-content">${escapeHtml(post.content)}</div>
            ${post.pdfFile ? `
                <div class="modal-post-actions" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <a href="/pov/download/${post.id}" class="btn-primary">Download PDF</a>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Error loading post:', error);
        modalContent.innerHTML = `
            <div class="error-state">
                <h3>Error Loading Post</h3>
                <p>Sorry, there was an error loading the post. Please try again.</p>
                <button onclick="showPost('${postId}')" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add some CSS for loading and error states
const style = document.createElement('style');
style.textContent = `
    .loading-state {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }
    
    .spinner {
        border: 3px solid #f3f4f6;
        border-top: 3px solid #2563eb;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-state {
        text-align: center;
        padding: 2rem;
        color: #dc2626;
    }
    
    .error-state h3 {
        margin-bottom: 1rem;
    }
    
    .error-state p {
        margin-bottom: 1.5rem;
        color: #6b7280;
    }
    
    .modal-post-actions {
        text-align: center;
    }
    
    .modal-post-actions .btn-primary {
        background-color: #059669;
        color: #fff;
        padding: 0.75rem 2rem;
        font-size: 1rem;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        transition: background-color 0.3s ease;
    }
    
    .modal-post-actions .btn-primary:hover {
        background-color: #047857;
    }
`;
document.head.appendChild(style);