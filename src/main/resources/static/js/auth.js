const API_BASE = '/api';

const loginTab = document.getElementById('loginTabBtn');
const registerTab = document.getElementById('registerTabBtn');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

function showLoginForm(){
    loginFormDiv.classList.add('active-form');
    registerFormDiv.classList.remove('active-form');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
}

function showRegisterForm(){
    registerFormDiv.classList.add('active-form');
    loginFormDiv.classList.remove('active-form');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
}

loginTab.addEventListener('click', showLoginForm);
registerTab.addEventListener('click', showRegisterForm);

document.getElementById('loginBtn').addEventListener('click', async () =>{
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password})
        });
        if (response.ok){
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = '/tasks.html';
        } else {
            const err = await response.text();
            errorDiv.innerText = err || 'Login failed';
        }
    } catch (err) {
        errorDiv.innerText = 'Network error';
    }
});

document.getElementById('registerBtn').addEventListener('click', async () =>{
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const errorDiv = document.getElementById('regError');

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password})
        });
        if (response.ok){
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = '/tasks.html';
        } else {
            const err = await response.text();
            errorDiv.innerText = err || 'Registration failed';
        }
    } catch (err) {
        errorDiv.innerText = 'Network error';
    }
});

showLoginForm();

