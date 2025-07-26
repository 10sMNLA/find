document.addEventListener('DOMContentLoaded', () => {
  const regionSelect = document.getElementById('region-select');
  const citySelect = document.getElementById('city-select');
  const courtList = document.getElementById('court-list');
  const courtDetailsContainer = document.getElementById('court-details-container');
  const courtPhoto = document.getElementById('court-photo');
  const courtName = document.getElementById('court-name');
  const courtDetails = document.getElementById('court-details');

  let map, markersLayer;

  function initMap() {
    const mapCenter = [12.8797, 121.774];
    map = L.map('map').setView(mapCenter, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }

  function populateCities(region) {
    const cities = [...new Set(courtsData
      .filter(court => !region || court.region === region)
      .map(court => court.city))];

    citySelect.innerHTML = '<option value="">All</option>';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });

    citySelect.disabled = cities.length === 0;
  }

  function filterCourts() {
    const selectedRegion = regionSelect.value;
    const selectedCity = citySelect.value;

    return courtsData.filter(court => {
      return (!selectedRegion || court.region === selectedRegion) &&
             (!selectedCity || court.city === selectedCity);
    });
  }

  function showCourtDetails(court) {
    if (!court) {
      courtDetailsContainer.classList.add('hidden');
      return;
    }
    courtPhoto.src = court.photo;
    courtPhoto.alt = court.name;
    courtName.textContent = court.name;
    courtDetails.innerHTML = `
      <li><strong>City:</strong> ${court.city}</li>
      <li><strong>Region:</strong> ${court.region}</li>
      <li><strong>Surface:</strong> ${court.surface}</li>
      <li><strong>Indoor:</strong> ${court.indoor ? 'Yes' : 'No'}</li>
      <li><strong>Lights:</strong> ${court.lights ? 'Yes' : 'No'}</li>
    `;
    courtDetailsContainer.classList.remove('hidden');
  }

  function renderCourtList() {
    const courts = filterCourts();
    courtList.innerHTML = '';
    markersLayer.clearLayers();
    showCourtDetails(null); // clear details when filter changes

    if (courts.length === 0) {
      courtList.textContent = 'No courts found.';
      return;
    }

    courts.forEach(court => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<h3>${court.name}</h3><p>${court.city}, ${court.region}</p>`;
      card.addEventListener('click', () => {
        map.setView([court.lat, court.lng], 14);
        showCourtDetails(court);
      });
      courtList.appendChild(card);

      if (court.lat && court.lng) {
        const marker = L.marker([court.lat, court.lng]).addTo(markersLayer);
        marker.on('click', () => {
          map.setView([court.lat, court.lng], 14);
          showCourtDetails(court);
        });
      }
    });
  }

  regionSelect.addEventListener('change', () => {
    populateCities(regionSelect.value);
    citySelect.value = '';
    renderCourtList();
  });

  citySelect.addEventListener('change', () => {
    renderCourtList();
  });

  initMap();
  populateCities('');
  renderCourtList();
});


// Move court details below map container on each update
function repositionCourtDetails() {
  const mapContainer = document.getElementById("map");
  const courtDetails = document.getElementById("court-details-container");
  if (mapContainer && courtDetails && mapContainer.nextSibling !== courtDetails) {
    mapContainer.parentNode.insertBefore(courtDetails, mapContainer.nextSibling);
  }
}
document.addEventListener("DOMContentLoaded", repositionCourtDetails);
// Also call reposition after every court selection
const originalUpdateCourtDetails = updateCourtDetails;
updateCourtDetails = function(court) {
  originalUpdateCourtDetails(court);
  repositionCourtDetails();
};
