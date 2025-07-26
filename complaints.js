// Hostel Complaint Registration System

class ComplaintSystem {
    constructor() {
        this.complaints = JSON.parse(localStorage.getItem('hostelComplaints')) || [];
        this.currentUser = null;
        this.complaintIdCounter = parseInt(localStorage.getItem('complaintIdCounter')) || 1;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.showLoginSection();
    }

    bindEvents() {
        // Password toggle functionality
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('password');
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', function() {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    passwordToggle.textContent = '🙈';
                } else {
                    passwordInput.type = 'password';
                    passwordToggle.textContent = '👁️';
                }
            });
        }

        // Forgot password functionality
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Password reset functionality would be implemented here.\n\nFor demo purposes:\n- Any username (3-20 chars)\n- Any password (6+ chars)');
            });
        }

        // Load remembered credentials
        this.loadRememberedCredentials();

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('studentLogoutBtn').addEventListener('click', () => this.logout());

        // Student view toggles
        document.getElementById('submitComplaintBtn').addEventListener('click', () => {
            this.showSubmitComplaintView();
        });
        document.getElementById('myComplaintsBtn').addEventListener('click', () => {
            this.showMyComplaintsView();
        });

        // Complaint form submission
        document.getElementById('complaintForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComplaint();
        });

        // Filters
        document.getElementById('adminStatusFilter')?.addEventListener('change', () => this.filterAdminComplaints());
        document.getElementById('adminCategoryFilter')?.addEventListener('change', () => this.filterAdminComplaints());
        document.getElementById('adminPriorityFilter')?.addEventListener('change', () => this.filterAdminComplaints());

        document.getElementById('studentStatusFilter')?.addEventListener('change', () => this.filterStudentComplaints());
        document.getElementById('studentCategoryFilter')?.addEventListener('change', () => this.filterStudentComplaints());
        document.getElementById('studentSortBy')?.addEventListener('change', () => this.filterStudentComplaints());

        // Modal close
        document.querySelector('.close')?.addEventListener('click', () => {
            document.getElementById('complaintModal').style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('complaintModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    setupFormValidation() {
        // Phone number validation
        const phoneInput = document.getElementById('contactNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                // Remove non-numeric characters
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                
                // Limit to 10 digits
                if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                }
                
                this.validatePhoneNumber(e.target);
            });
        }

        // Room number validation
        const roomInput = document.getElementById('roomNumber');
        if (roomInput) {
            roomInput.addEventListener('input', (e) => {
                // Convert to uppercase for consistency
                e.target.value = e.target.value.toUpperCase();
                this.validateRoomNumber(e.target);
            });
        }

        // Description character counter
        const descriptionInput = document.getElementById('complaintDescription');
        if (descriptionInput) {
            // Add character counter
            const counterDiv = document.createElement('div');
            counterDiv.className = 'char-counter';
            descriptionInput.parentNode.appendChild(counterDiv);
            
            descriptionInput.addEventListener('input', (e) => {
                this.updateCharacterCounter(e.target, counterDiv, 10, 500);
            });
        }

        // Title character counter
        const titleInput = document.getElementById('complaintTitle');
        if (titleInput) {
            const counterDiv = document.createElement('div');
            counterDiv.className = 'char-counter';
            titleInput.parentNode.appendChild(counterDiv);
            
            titleInput.addEventListener('input', (e) => {
                this.updateCharacterCounter(e.target, counterDiv, 5, 100);
            });
        }

        // Username validation
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                // Remove invalid characters
                e.target.value = e.target.value.replace(/[^A-Za-z0-9_]/g, '');
                this.validateUsername(e.target);
            });
        }
    }

    validatePhoneNumber(input) {
        const value = input.value;
        const isValid = /^[0-9]{10}$/.test(value);
        
        if (value.length === 0) {
            this.setInputValidation(input, null, '');
        } else if (value.length < 10) {
            this.setInputValidation(input, false, `Enter ${10 - value.length} more digits`);
        } else if (isValid) {
            this.setInputValidation(input, true, 'Valid phone number');
        } else {
            this.setInputValidation(input, false, 'Invalid phone number format');
        }
    }

    validateRoomNumber(input) {
        const value = input.value;
        const isValid = /^[A-Za-z0-9\-]{1,10}$/.test(value);
        
        if (value.length === 0) {
            this.setInputValidation(input, null, '');
        } else if (isValid) {
            this.setInputValidation(input, true, 'Valid room number');
        } else {
            this.setInputValidation(input, false, 'Use only letters, numbers, and hyphens');
        }
    }

    validateUsername(input) {
        const value = input.value;
        const isValid = /^[A-Za-z0-9_]{3,20}$/.test(value);
        
        if (value.length === 0) {
            this.setInputValidation(input, null, '');
        } else if (value.length < 3) {
            this.setInputValidation(input, false, `Enter ${3 - value.length} more characters`);
        } else if (isValid) {
            this.setInputValidation(input, true, 'Valid username');
        } else {
            this.setInputValidation(input, false, 'Invalid username format');
        }
    }

    updateCharacterCounter(input, counterDiv, minLength, maxLength) {
        const currentLength = input.value.length;
        counterDiv.textContent = `${currentLength}/${maxLength}`;
        
        if (currentLength < minLength) {
            counterDiv.className = 'char-counter danger';
            counterDiv.textContent += ` (${minLength - currentLength} more needed)`;
        } else if (currentLength > maxLength * 0.9) {
            counterDiv.className = 'char-counter warning';
        } else {
            counterDiv.className = 'char-counter';
        }
    }

    setInputValidation(input, isValid, message) {
        // Remove existing validation message
        const existingMsg = input.parentNode.querySelector('.validation-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        if (message) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `validation-message ${isValid === true ? 'valid' : isValid === false ? 'invalid' : 'neutral'}`;
            msgDiv.textContent = message;
            msgDiv.style.fontSize = '0.75rem';
            msgDiv.style.marginTop = '2px';
            msgDiv.style.color = isValid === true ? '#28a745' : isValid === false ? '#dc3545' : '#666';
            
            input.parentNode.appendChild(msgDiv);
        }
    }

    loadRememberedCredentials() {
        if (localStorage.getItem('rememberMe') === 'true') {
            document.getElementById('username').value = localStorage.getItem('rememberedUsername') || '';
            document.getElementById('userRole').value = localStorage.getItem('rememberedRole') || '';
            document.getElementById('rememberMe').checked = true;
        }
    }

    handleLogin() {
        const userRole = document.getElementById('userRole').value;
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginButton = document.getElementById('loginButton');

        // Show loading state
        loginButton.disabled = true;
        document.querySelector('.login-text').style.display = 'none';
        document.querySelector('.login-spinner').style.display = 'inline';

        // Validation
        if (!userRole) {
            this.showMessage('Please select your role.', 'error');
            return;
        }

        if (!username) {
            this.showMessage('Please enter your username.', 'error');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            this.showMessage('Username must be between 3-20 characters.', 'error');
            return;
        }

        if (!/^[A-Za-z0-9_]+$/.test(username)) {
            this.showMessage('Username can only contain letters, numbers, and underscores.', 'error');
            return;
        }

        if (!password) {
            this.showMessage('Please enter your password.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }

        // Simulate login process
        setTimeout(() => {
            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('rememberedUsername', username);
                localStorage.setItem('rememberedRole', userRole);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberedRole');
            }

            // Simple authentication (in real app, this would be server-side)
            this.currentUser = {
                username: username,
                role: userRole,
                loginTime: new Date()
            };

            // Reset loading state
            loginButton.disabled = false;
            document.querySelector('.login-text').style.display = 'inline';
            document.querySelector('.login-spinner').style.display = 'none';

            if (userRole === 'admin') {
                this.showAdminDashboard();
            } else {
                this.showStudentDashboard();
            }
            
            this.showMessage(`Welcome ${username}! You have successfully logged in.`, 'success');
        }, 1500);
    }

    logout() {
        this.currentUser = null;
        this.showLoginSection();
        document.getElementById('loginForm').reset();
        
        // Reset login button state
        const loginButton = document.getElementById('loginButton');
        loginButton.disabled = false;
        document.querySelector('.login-text').style.display = 'inline';
        document.querySelector('.login-spinner').style.display = 'none';
        
        // Load remembered credentials again
        this.loadRememberedCredentials();
    }

    showLoginSection() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'none';
    }

    showAdminDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        document.getElementById('studentDashboard').style.display = 'none';
        
        this.updateStats();
        this.displayAdminComplaints();
    }

    showStudentDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'block';
        
        document.getElementById('studentName').textContent = this.currentUser.username;
        this.showSubmitComplaintView();
    }

    showSubmitComplaintView() {
        document.getElementById('submitComplaintView').style.display = 'block';
        document.getElementById('myComplaintsView').style.display = 'none';
        
        // Update active button
        document.getElementById('submitComplaintBtn').classList.add('active');
        document.getElementById('myComplaintsBtn').classList.remove('active');
    }

    showMyComplaintsView() {
        document.getElementById('submitComplaintView').style.display = 'none';
        document.getElementById('myComplaintsView').style.display = 'block';
        
        // Update active button
        document.getElementById('submitComplaintBtn').classList.remove('active');
        document.getElementById('myComplaintsBtn').classList.add('active');
        
        this.displayStudentComplaints();
    }

    submitComplaint() {
        const form = document.getElementById('complaintForm');
        
        // Validate form before submission
        if (!this.validateComplaintForm(form)) {
            this.showMessage('Please fix the validation errors before submitting.', 'error');
            return;
        }

        const formData = new FormData(form);
        
        // Additional validation
        const phoneNumber = formData.get('contactNumber');
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            this.showMessage('Please enter a valid 10-digit phone number.', 'error');
            return;
        }

        const roomNumber = formData.get('roomNumber');
        if (!/^[A-Za-z0-9\-]{1,10}$/.test(roomNumber)) {
            this.showMessage('Please enter a valid room number.', 'error');
            return;
        }

        const title = formData.get('complaintTitle');
        if (title.length < 5 || title.length > 100) {
            this.showMessage('Complaint title must be between 5-100 characters.', 'error');
            return;
        }

        const description = formData.get('complaintDescription');
        if (description.length < 10 || description.length > 500) {
            this.showMessage('Description must be between 10-500 characters.', 'error');
            return;
        }

        const complaint = {
            id: this.complaintIdCounter++,
            title: title.trim(),
            category: formData.get('complaintCategory'),
            roomNumber: roomNumber.toUpperCase().trim(),
            description: description.trim(),
            priority: formData.get('priority'),
            contactNumber: phoneNumber,
            studentUsername: this.currentUser.username,
            status: 'pending',
            submittedDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            comments: []
        };

        this.complaints.push(complaint);
        this.saveData();
        
        this.showMessage('Complaint submitted successfully! You can track its status in "My Complaints" section.', 'success');
        form.reset();
        
        // Clear character counters
        const counters = form.querySelectorAll('.char-counter');
        counters.forEach(counter => counter.textContent = '');
        
        // Clear validation messages
        const validationMsgs = form.querySelectorAll('.validation-message');
        validationMsgs.forEach(msg => msg.remove());
    }

    validateComplaintForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.focus();
                return;
            }

            // Check specific field validations
            if (field.type === 'tel' && !/^[0-9]{10}$/.test(field.value)) {
                isValid = false;
            }
            
            if (field.hasAttribute('minlength') && field.value.length < parseInt(field.getAttribute('minlength'))) {
                isValid = false;
            }
            
            if (field.hasAttribute('maxlength') && field.value.length > parseInt(field.getAttribute('maxlength'))) {
                isValid = false;
            }
            
            if (field.hasAttribute('pattern') && !new RegExp(field.getAttribute('pattern')).test(field.value)) {
                isValid = false;
            }
        });

        return isValid;
    }

    updateStats() {
        const pending = this.complaints.filter(c => c.status === 'pending').length;
        const inProgress = this.complaints.filter(c => c.status === 'in-progress').length;
        const resolved = this.complaints.filter(c => c.status === 'resolved').length;
        const total = this.complaints.length;

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('inProgressCount').textContent = inProgress;
        document.getElementById('resolvedCount').textContent = resolved;
        document.getElementById('totalCount').textContent = total;
    }

    displayAdminComplaints() {
        const container = document.getElementById('adminComplaintsList');
        let complaints = [...this.complaints];

        // Apply filters
        const statusFilter = document.getElementById('adminStatusFilter').value;
        const categoryFilter = document.getElementById('adminCategoryFilter').value;
        const priorityFilter = document.getElementById('adminPriorityFilter').value;

        if (statusFilter) {
            complaints = complaints.filter(c => c.status === statusFilter);
        }
        if (categoryFilter) {
            complaints = complaints.filter(c => c.category === categoryFilter);
        }
        if (priorityFilter) {
            complaints = complaints.filter(c => c.priority === priorityFilter);
        }

        // Sort by date (newest first)
        complaints.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

        if (complaints.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No complaints found</h3>
                    <p>No complaints match your current filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = complaints.map(complaint => `
            <div class="complaint-item ${complaint.status}" onclick="complaintSystem.showComplaintDetails(${complaint.id})">
                <div class="complaint-header">
                    <div class="complaint-title">${complaint.title}</div>
                    <div class="complaint-meta">
                        <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ')}</span>
                        <span class="complaint-priority ${complaint.priority}">${complaint.priority}</span>
                    </div>
                </div>
                <div class="complaint-info">
                    <div class="complaint-detail"><strong>Student:</strong> ${complaint.studentUsername}</div>
                    <div class="complaint-detail"><strong>Room:</strong> ${complaint.roomNumber}</div>
                    <div class="complaint-detail"><strong>Category:</strong> ${this.getCategoryDisplay(complaint.category)}</div>
                    <div class="complaint-detail"><strong>Contact:</strong> ${complaint.contactNumber}</div>
                    <div class="complaint-detail"><strong>Submitted:</strong> ${this.formatDate(complaint.submittedDate)}</div>
                    <div class="complaint-detail"><strong>Last Updated:</strong> ${this.formatDate(complaint.lastUpdated)}</div>
                </div>
                <div class="complaint-description">${complaint.description}</div>
                <div class="complaint-actions">
                    <button class="action-btn update-status" onclick="event.stopPropagation(); complaintSystem.showStatusUpdateForm(${complaint.id})">Update Status</button>
                    <button class="action-btn add-comment" onclick="event.stopPropagation(); complaintSystem.showAddCommentForm(${complaint.id})">Add Comment</button>
                    <button class="action-btn view-details" onclick="event.stopPropagation(); complaintSystem.showComplaintDetails(${complaint.id})">View Details</button>
                </div>
            </div>
        `).join('');
    }

    displayStudentComplaints() {
        const container = document.getElementById('studentComplaintsList');
        let complaints = this.complaints.filter(c => c.studentUsername === this.currentUser.username);

        // Apply filters
        const statusFilter = document.getElementById('studentStatusFilter').value;
        const categoryFilter = document.getElementById('studentCategoryFilter').value;
        const sortBy = document.getElementById('studentSortBy').value;

        if (statusFilter) {
            complaints = complaints.filter(c => c.status === statusFilter);
        }
        if (categoryFilter) {
            complaints = complaints.filter(c => c.category === categoryFilter);
        }

        // Apply sorting
        switch (sortBy) {
            case 'date-desc':
                complaints.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
                break;
            case 'date-asc':
                complaints.sort((a, b) => new Date(a.submittedDate) - new Date(b.submittedDate));
                break;
            case 'priority':
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                complaints.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'status':
                const statusOrder = { 'pending': 3, 'in-progress': 2, 'resolved': 1 };
                complaints.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
                break;
        }

        if (complaints.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No complaints found</h3>
                    <p>You haven't submitted any complaints yet or no complaints match your filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = complaints.map(complaint => `
            <div class="complaint-item ${complaint.status}" onclick="complaintSystem.showComplaintDetails(${complaint.id})">
                <div class="complaint-header">
                    <div class="complaint-title">${complaint.title}</div>
                    <div class="complaint-meta">
                        <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ')}</span>
                        <span class="complaint-priority ${complaint.priority}">${complaint.priority}</span>
                    </div>
                </div>
                <div class="complaint-info">
                    <div class="complaint-detail"><strong>Room:</strong> ${complaint.roomNumber}</div>
                    <div class="complaint-detail"><strong>Category:</strong> ${this.getCategoryDisplay(complaint.category)}</div>
                    <div class="complaint-detail"><strong>Submitted:</strong> ${this.formatDate(complaint.submittedDate)}</div>
                    <div class="complaint-detail"><strong>Last Updated:</strong> ${this.formatDate(complaint.lastUpdated)}</div>
                </div>
                <div class="complaint-description">${complaint.description}</div>
                <div class="complaint-actions">
                    <button class="action-btn view-details" onclick="event.stopPropagation(); complaintSystem.showComplaintDetails(${complaint.id})">View Details</button>
                </div>
            </div>
        `).join('');
    }

    showComplaintDetails(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        const modal = document.getElementById('complaintModal');
        const detailsContainer = document.getElementById('complaintDetails');

        detailsContainer.innerHTML = `
            <h2>${complaint.title}</h2>
            <div class="complaint-info" style="margin: 20px 0;">
                <div class="complaint-detail"><strong>ID:</strong> #${complaint.id}</div>
                <div class="complaint-detail"><strong>Student:</strong> ${complaint.studentUsername}</div>
                <div class="complaint-detail"><strong>Room Number:</strong> ${complaint.roomNumber}</div>
                <div class="complaint-detail"><strong>Category:</strong> ${this.getCategoryDisplay(complaint.category)}</div>
                <div class="complaint-detail"><strong>Priority:</strong> <span class="complaint-priority ${complaint.priority}">${complaint.priority}</span></div>
                <div class="complaint-detail"><strong>Status:</strong> <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ')}</span></div>
                <div class="complaint-detail"><strong>Contact:</strong> ${complaint.contactNumber}</div>
                <div class="complaint-detail"><strong>Submitted:</strong> ${this.formatDate(complaint.submittedDate)}</div>
                <div class="complaint-detail"><strong>Last Updated:</strong> ${this.formatDate(complaint.lastUpdated)}</div>
            </div>
            <div class="complaint-description">
                <h4>Description:</h4>
                <p>${complaint.description}</p>
            </div>
            ${this.currentUser.role === 'admin' ? this.getStatusUpdateForm(complaint) : ''}
            ${this.getCommentsSection(complaint)}
        `;

        modal.style.display = 'block';
    }

    getStatusUpdateForm(complaint) {
        return `
            <div class="status-update-form">
                <h4>Update Status</h4>
                <select id="newStatus">
                    <option value="pending" ${complaint.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${complaint.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                </select>
                <textarea id="statusComment" placeholder="Add a comment about this status update..." rows="3"></textarea>
                <button onclick="complaintSystem.updateComplaintStatus(${complaint.id})">Update Status</button>
            </div>
        `;
    }

    getCommentsSection(complaint) {
        const commentsHtml = complaint.comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${comment.author} (${comment.role})</span>
                    <span class="comment-date">${this.formatDate(comment.date)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');

        return `
            <div class="comments-section">
                <h4>Comments & Updates</h4>
                ${commentsHtml || '<p>No comments yet.</p>'}
                ${this.currentUser.role === 'admin' ? `
                    <div style="margin-top: 15px;">
                        <textarea id="newComment" placeholder="Add a comment..." rows="3" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px;"></textarea>
                        <button onclick="complaintSystem.addComment(${complaint.id})" style="margin-top: 10px; background: #9b59b6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Add Comment</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateComplaintStatus(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        const newStatus = document.getElementById('newStatus').value;
        const comment = document.getElementById('statusComment').value;

        complaint.status = newStatus;
        complaint.lastUpdated = new Date().toISOString();

        if (comment) {
            complaint.comments.push({
                author: this.currentUser.username,
                role: this.currentUser.role,
                text: `Status updated to "${newStatus.replace('-', ' ')}": ${comment}`,
                date: new Date().toISOString()
            });
        } else {
            complaint.comments.push({
                author: this.currentUser.username,
                role: this.currentUser.role,
                text: `Status updated to "${newStatus.replace('-', ' ')}"`,
                date: new Date().toISOString()
            });
        }

        this.saveData();
        this.updateStats();
        this.displayAdminComplaints();
        
        // Close modal and show success message
        document.getElementById('complaintModal').style.display = 'none';
        this.showMessage('Complaint status updated successfully!', 'success');
    }

    addComment(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        const commentText = document.getElementById('newComment').value.trim();
        if (!commentText) return;

        complaint.comments.push({
            author: this.currentUser.username,
            role: this.currentUser.role,
            text: commentText,
            date: new Date().toISOString()
        });

        complaint.lastUpdated = new Date().toISOString();
        this.saveData();

        // Refresh the modal content
        this.showComplaintDetails(complaintId);
        this.showMessage('Comment added successfully!', 'success');
    }

    filterAdminComplaints() {
        this.displayAdminComplaints();
    }

    filterStudentComplaints() {
        this.displayStudentComplaints();
    }

    getCategoryDisplay(category) {
        const categories = {
            'water': 'Water Issues',
            'electricity': 'Electricity',
            'cleaning': 'Cleaning',
            'maintenance': 'Maintenance',
            'security': 'Security',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of the active dashboard
        const activeSection = document.querySelector('.dashboard[style*="block"]') || document.querySelector('.login-section');
        if (activeSection) {
            activeSection.insertBefore(messageDiv, activeSection.firstChild);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    saveData() {
        localStorage.setItem('hostelComplaints', JSON.stringify(this.complaints));
        localStorage.setItem('complaintIdCounter', this.complaintIdCounter.toString());
    }
}

// Initialize the complaint system when the page loads
let complaintSystem;
document.addEventListener('DOMContentLoaded', () => {
    complaintSystem = new ComplaintSystem();
});