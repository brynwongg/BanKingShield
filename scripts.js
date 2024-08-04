let currentUser = null;

// Function to get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Function to update the navigation bar based on authentication status
function updateNavbar() {
    const nav = document.querySelector('nav');
    if (currentUser) {
        nav.innerHTML = `
            <a href="account.html">Account</a>
            <a href="topup.html">Top Up</a>
            <a href="transfer.html">Transfer</a>
            <a href="rewards.html">Rewards</a>
            <a href="logout.html">Logout</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="index.html">Home</a>
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
            <a href="contact.html">Contact</a>
        `;
    }
}

// Function to validate password
function validatePassword(password) {
    const minLength = 6;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasLetters && hasNumbers && hasSpecialChars;
}

// Function to handle login
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Save user data to localStorage
        alert('Login successful');
        updateNavbar(); // Update navbar after successful login
        window.location.href = 'account.html'; // Redirect to the account page
    } else {
        alert('Login failed. Please check your username and password.');
    }
}

// Function to handle registration
function register(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const contact = document.getElementById('contact').value;
    const password = document.getElementById('password').value;

    const users = getUsers();

    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    if (!validatePassword(password)) {
        alert('Password must be at least 6 characters long and include a mix of letters, numbers, and special characters.');
        return;
    }

    users.push({ username, password, balance: 0, points: 0 });
    saveUsers(users);
    alert('Registration successful');
    window.location.href = 'login.html'; // Redirect to login page
}

// Function to handle top-up
function topUp(event) {
    event.preventDefault();
    const currency = document.getElementById('currency').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const mode = document.getElementById('mode').value;
    const password = document.getElementById('topupPassword').value;

    if (currentUser.password === password) {
        // Calculate points based on top-up amount
        const pointsEarned = amount; // $1 = 1 point

        // Store top-up details in localStorage and redirect to OTP page
        localStorage.setItem('topUpDetails', JSON.stringify({ currency, amount, mode, pointsEarned }));
        window.location.href = 'otp.html'; // Redirect to OTP page
    } else {
        alert('Top-up failed. Incorrect password.');
    }
}

// Function to handle transfer
function transfer(event) {
    event.preventDefault();
    const currency = document.getElementById('transferCurrency').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const recipient = document.getElementById('recipient').value;
    const password = document.getElementById('transferPassword').value;

    const users = getUsers();
    const recipientUser = users.find(user => user.username === recipient);

    if (!recipientUser) {
        alert('Recipient not found');
        return;
    }

    if (currentUser.password === password) {
        if (currentUser.balance >= amount) {
            // Store transfer details in localStorage and redirect to OTP page
            localStorage.setItem('transferDetails', JSON.stringify({ currency, amount, recipient }));
            window.location.href = 'otp.html'; // Redirect to OTP page
        } else {
            alert('Insufficient balance');
        }
    } else {
        alert('Transfer failed. Incorrect password.');
    }
}

// Function to handle OTP verification
function verifyOTP(event) {
    event.preventDefault();
    const otp = document.getElementById('otp').value;
    const validOTP = '123456'; // Example OTP, replace with actual OTP generation logic

    if (otp === validOTP) {
        const topUpDetails = JSON.parse(localStorage.getItem('topUpDetails'));
        if (topUpDetails) {
            currentUser.balance += topUpDetails.amount; // Update balance
            currentUser.points += topUpDetails.pointsEarned; // Update points
            localStorage.removeItem('topUpDetails'); // Clear top-up details

            // Update user data in localStorage
            const users = getUsers();
            const updatedUsers = users.map(user =>
                user.username === currentUser.username ? currentUser : user
            );
            saveUsers(updatedUsers);
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Update current user data
            alert('Top-up successful');
            window.location.href = 'account.html'; // Redirect to account page
            return;
        }

        const transferDetails = JSON.parse(localStorage.getItem('transferDetails'));
        if (transferDetails) {
            const users = getUsers();
            const recipientUser = users.find(user => user.username === transferDetails.recipient);
            if (recipientUser) {
                currentUser.balance -= transferDetails.amount;
                recipientUser.balance += transferDetails.amount;
                saveUsers(users); // Update all users
                localStorage.removeItem('transferDetails'); // Clear transfer details
                localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Update current user data
                alert('Transfer successful');
                window.location.href = 'account.html'; // Redirect to account page
                return;
            }
        }

        alert('Invalid OTP');
    } else {
        alert('Invalid OTP');
    }
}


// Function to display balance and points
function displayAccountInfo() {
    if (currentUser) {
        document.getElementById('balance').textContent = `${currentUser.balance.toFixed(2)} USD`;
        document.getElementById('points').textContent = `${currentUser.points} Points`;
    } else {
        alert('User not authenticated');
    }
}

// Function to display points on the rewards page
function displayRewards() {
    if (currentUser) {
        document.getElementById('rewardsPoints').textContent = `${currentUser.points} Points`;
    } else {
        alert('User not authenticated');
    }
}

// Function to manage access to pages
function checkAuthentication() {
    const restrictedPages = ['account.html', 'topup.html', 'transfer.html', 'rewards.html'];
    if (restrictedPages.includes(window.location.pathname.split('/').pop()) && !currentUser) {
        window.location.href = 'login.html'; // Redirect to login page
    }
}

// Function to handle logout
function logout() {
    if (currentUser) {
        // Update user data in localStorage before clearing currentUser
        const users = getUsers();
        const updatedUsers = users.map(user =>
            user.username === currentUser.username ? currentUser : user
        );
        saveUsers(updatedUsers);
    }

    localStorage.removeItem('currentUser'); // Remove user data from localStorage
    currentUser = null;
    updateNavbar(); // Update navbar after logout
    window.location.href = 'index.html'; // Redirect to home page
}


// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }

    updateNavbar(); // Update navbar based on login status

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', register);
    }

    const topupForm = document.getElementById('topupForm');
    if (topupForm) {
        topupForm.addEventListener('submit', topUp);
    }

    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', transfer);
    }

    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', verifyOTP);
    }

    const balancePage = document.getElementById('balance');
    if (balancePage) {
        displayAccountInfo();
    }

    const rewardsPage = document.getElementById('rewardsPoints');
    if (rewardsPage) {
        displayRewards();
    }

    checkAuthentication(); // Check authentication for restricted pages

    const logoutLink = document.querySelector('nav a[href="logout.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }
});

// Function to handle reward redemption
function redeemReward(event) {
    event.preventDefault();
    const selectedReward = document.getElementById('reward').value;
    let pointsToDeduct = 0;

    switch (selectedReward) {
        case 'giftCard':
            pointsToDeduct = 1000;
            break;
        case 'discountVoucher':
            pointsToDeduct = 500;
            break;
        case 'holiday':
            pointsToDeduct = 10000;
            break;
        default:
            alert('Invalid reward selection.');
            return;
    }

    if (currentUser.points >= pointsToDeduct) {
        currentUser.points -= pointsToDeduct;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updatePointsDisplay(); // Update points display on the page
        alert('Reward redeemed successfully!');
    } else {
        alert('You do not have enough points to redeem this reward.');
    }
}

// Function to display points balance
function displayPoints() {
    if (currentUser) {
        document.getElementById('points').textContent = `${currentUser.points} Points`;
    } else {
        alert('User not authenticated');
    }
}

// Function to update points display on the Rewards and Account pages
function updatePointsDisplay() {
    const pointsElement = document.getElementById('points');
    if (pointsElement) {
        pointsElement.textContent = `${currentUser.points} Points`;
    }
}

// Event listeners for reward redemption
document.addEventListener('DOMContentLoaded', function () {
    const redeemForm = document.getElementById('redeemForm');
    if (redeemForm) {
        redeemForm.addEventListener('submit', redeemReward);
    }

    const pointsElement = document.getElementById('points');
    if (pointsElement) {
        displayPoints();
    }
});
