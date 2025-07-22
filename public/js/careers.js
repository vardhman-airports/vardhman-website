// public/js/careers.js

let currentJobId = null;
let currentJobTitle = null;

// Show job details modal
function showJobDetails(jobId) {
    currentJobId = jobId;
    
    fetch(`/careers/job/${jobId}`)
        .then(response => response.json())
        .then(job => {
            if (job.error) {
                alert('Job not found');
                return;
            }
            
            // Populate modal header
            document.getElementById('modalHeader').innerHTML = `
                <h2 class="modal-job-title">${job.title}</h2>
                <div class="modal-job-meta">
                    <div class="modal-job-meta-item">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        ${job.location}
                    </div>
                    <div class="modal-job-meta-item">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"/>
                        </svg>
                        ${job.type}
                    </div>
                    <div class="modal-job-meta-item">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0a2 2 0 002-2v-4a2 2 0 00-2-2V9a2 2 0 00-2-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
                        </svg>
                        ${job.department}
                    </div>
                    ${job.experience ? `
                        <div class="modal-job-meta-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ${job.experience}
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Populate modal body
            let modalBodyContent = `
                <div class="modal-section">
                    <h3>Job Description</h3>
                    <p>${job.description}</p>
                </div>
            `;
            
            if (job.responsibilities) {
                modalBodyContent += `
                    <div class="modal-section">
                        <h3>Key Responsibilities</h3>
                        <div>${formatTextWithBullets(job.responsibilities)}</div>
                    </div>
                `;
            }
            
            if (job.requirements) {
                modalBodyContent += `
                    <div class="modal-section">
                        <h3>Requirements</h3>
                        <div>${formatTextWithBullets(job.requirements)}</div>
                    </div>
                `;
            }
            
            if (job.qualifications) {
                modalBodyContent += `
                    <div class="modal-section">
                        <h3>Qualifications</h3>
                        <div>${formatTextWithBullets(job.qualifications)}</div>
                    </div>
                `;
            }
            
            if (job.benefits) {
                modalBodyContent += `
                    <div class="modal-section">
                        <h3>Benefits</h3>
                        <div>${formatTextWithBullets(job.benefits)}</div>
                    </div>
                `;
            }
            
            document.getElementById('modalBody').innerHTML = modalBodyContent;
            
            // Set up apply button
            document.getElementById('modalApplyBtn').onclick = function() {
                closeJobModal();
                showApplicationForm(job.id, job.title);
            };
            
            // Show modal
            document.getElementById('jobModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading job details');
        });
}

// Show application form modal
function showApplicationForm(jobId, jobTitle) {
    currentJobId = jobId;
    currentJobTitle = jobTitle;
    
    document.getElementById('applicationJobTitle').textContent = `Apply for ${jobTitle}`;
    document.getElementById('applicationAlert').innerHTML = '';
    document.getElementById('applicationForm').reset();
    document.getElementById('applicationModal').style.display = 'block';
}

// Close job details modal
function closeJobModal() {
    document.getElementById('jobModal').style.display = 'none';
}

// Close application form modal
function closeApplicationModal() {
    document.getElementById('applicationModal').style.display = 'none';
    document.getElementById('applicationForm').reset();
    document.getElementById('applicationAlert').innerHTML = '';
}

// Format text with bullets for better display
function formatTextWithBullets(text) {
    if (!text) return '';
    
    // Split by common bullet point indicators
    const lines = text.split(/\n|•/).filter(line => line.trim().length > 0);
    
    if (lines.length > 1) {
        return '<ul>' + lines.map(line => `<li>${line.trim()}</li>`).join('') + '</ul>';
    } else {
        return `<p>${text}</p>`;
    }
}

// Handle application form submission
document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    fetch(`/careers/apply/${currentJobId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('applicationAlert').innerHTML = `
                <div class="alert alert-success">
                    ${data.message}
                </div>
            `;
            
            // Reset form
            document.getElementById('applicationForm').reset();
            
            // Close modal after 2 seconds
            setTimeout(() => {
                closeApplicationModal();
            }, 2000);
        } else {
            document.getElementById('applicationAlert').innerHTML = `
                <div class="alert alert-error">
                    ${data.error || 'An error occurred while submitting your application.'}
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('applicationAlert').innerHTML = `
            <div class="alert alert-error">
                An error occurred while submitting your application. Please try again.
            </div>
        `;
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

// Modal close functionality
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking the X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const jobModal = document.getElementById('jobModal');
        const applicationModal = document.getElementById('applicationModal');
        
        if (event.target === jobModal) {
            jobModal.style.display = 'none';
        }
        
        if (event.target === applicationModal) {
            applicationModal.style.display = 'none';
        }
    });
    
    // File input validation
    const fileInput = document.getElementById('applicantResume');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('File size must be less than 5MB');
                    this.value = '';
                    return;
                }
                
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Only PDF, DOC, and DOCX files are allowed');
                    this.value = '';
                    return;
                }
            }
        });
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const jobModal = document.getElementById('jobModal');
        const applicationModal = document.getElementById('applicationModal');
        
        if (jobModal.style.display === 'block') {
            closeJobModal();
        }
        
        if (applicationModal.style.display === 'block') {
            closeApplicationModal();
        }
    }
});