// Load saved user and trips from browser localStorage
let currentUser = localStorage.getItem('travelUser');
let trips = JSON.parse(localStorage.getItem('travelTrips')) || [];

// Check login status on page load
window.onload = function() {
    if (currentUser) {
        showDashboard();
    }
};

// Handle User Login / Registration
document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (username) {
        localStorage.setItem('travelUser', username);
        currentUser = username;
        showDashboard();
    }
});

function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('display-user').innerText = currentUser;
    renderTrips();
}

function logout() {
    localStorage.removeItem('travelUser');
    location.reload();
}

// Add or Update Trip
document.getElementById('trip-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('edit-index').value);
    const tripData = {
        title: document.getElementById('trip-title').value,
        destination: document.getElementById('destination').value,
        date: document.getElementById('trip-date').value,
        time: document.getElementById('trip-time').value,
        budget: parseFloat(document.getElementById('budget').value),
        travelers: parseInt(document.getElementById('travelers').value) || 1,
        itinerary: document.getElementById('itinerary').value,
        favorite: editIndex >= 0 ? trips[editIndex].favorite : false
    };

    if (editIndex >= 0) {
        trips[editIndex] = tripData;
    } else {
        trips.push(tripData);
    }

    saveAndRender();
    resetForm();
});

// Display Trips with Search & Filter
function renderTrips() {
    const container = document.getElementById('trips-container');
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-select').value;
    
    container.innerHTML = '';
    let totalBudget = 0;
    let totalFavs = 0;

    trips.forEach((trip, index) => {
        totalBudget += trip.budget;
        if (trip.favorite) totalFavs++;

        // Apply Search & Favorite Filter
        const matchesSearch = trip.title.toLowerCase().includes(searchQuery) || 
                              trip.destination.toLowerCase().includes(searchQuery);
        const matchesFilter = filterType === 'all' || (filterType === 'favorites' && trip.favorite);

        if (matchesSearch && matchesFilter) {
            const travelersCount = trip.travelers || 1;
            const perPerson = Math.round(trip.budget / travelersCount);

            const card = document.createElement('div');
            card.className = 'trip-card';
            card.innerHTML = `
                <div>
                    <div class="trip-header">
                        <h4>${trip.title} ${trip.favorite ? '★' : ''}</h4>
                        <span class="badge">₹${trip.budget.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="trip-details">
                        <p><strong>Destination:</strong> ${trip.destination}</p>
                        <p><strong>Date & Time:</strong> ${trip.date} at ${trip.time}</p>
                        <p><strong>Split Cost:</strong> ₹${perPerson.toLocaleString('en-IN')} / person (${travelersCount} travelers)</p>
                        <p><strong>Itinerary:</strong> ${trip.itinerary}</p>
                    </div>
                </div>
                <div class="trip-actions">
                    <button class="fav-btn" onclick="toggleFavorite(${index})">
                        ${trip.favorite ? 'Unfavorite' : '★ Favorite'}
                    </button>
                    <button class="btn-secondary" onclick="editTrip(${index})">Edit</button>
                    <button class="btn-secondary" onclick="shareTrip(${index})">Share</button>
                    <button class="btn-danger" onclick="deleteTrip(${index})">Delete</button>
                </div>
            `;
            container.appendChild(card);
        }
    });

    // Update Summary Counters
    document.getElementById('total-trips').innerText = trips.length;
    document.getElementById('total-budget').innerText = '₹' + totalBudget.toLocaleString('en-IN');
    document.getElementById('total-favs').innerText = totalFavs;
}

// Edit Trip
function editTrip(index) {
    const trip = trips[index];
    document.getElementById('edit-index').value = index;
    document.getElementById('trip-title').value = trip.title;
    document.getElementById('destination').value = trip.destination;
    document.getElementById('trip-date').value = trip.date;
    document.getElementById('trip-time').value = trip.time;
    document.getElementById('budget').value = trip.budget;
    document.getElementById('travelers').value = trip.travelers || 1;
    document.getElementById('itinerary').value = trip.itinerary;

    document.getElementById('form-title').innerText = 'Edit Trip Details';
    document.getElementById('save-btn').innerText = 'Update Trip';
    document.getElementById('cancel-edit').classList.remove('hidden');
}

function resetForm() {
    document.getElementById('trip-form').reset();
    document.getElementById('travelers').value = 1;
    document.getElementById('edit-index').value = '-1';
    document.getElementById('form-title').innerText = 'Plan a New Trip';
    document.getElementById('save-btn').innerText = 'Add Trip';
    document.getElementById('cancel-edit').classList.add('hidden');
}

// Delete Trip
function deleteTrip(index) {
    if (confirm('Are you sure you want to delete this trip?')) {
        trips.splice(index, 1);
        saveAndRender();
    }
}

// Toggle Favorite
function toggleFavorite(index) {
    trips[index].favorite = !trips[index].favorite;
    saveAndRender();
}

// Share Trip Details
function shareTrip(index) {
    const trip = trips[index];
    const travelersCount = trip.travelers || 1;
    const perPerson = Math.round(trip.budget / travelersCount);
    const shareText = `Trip Plan: ${trip.title} to ${trip.destination} on ${trip.date} (${trip.time}). Total Budget: ₹${trip.budget} (₹${perPerson}/person for ${travelersCount} travelers). Itinerary: ${trip.itinerary}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        alert('Trip details copied to clipboard! You can paste and share it anywhere.');
    });
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('theme-btn');
    if (document.body.classList.contains('dark-mode')) {
        btn.innerText = '☀️ Light Mode';
    } else {
        btn.innerText = '🌙 Dark Mode';
    }
}

function saveAndRender() {
    localStorage.setItem('travelTrips', JSON.stringify(trips));
    renderTrips();
}