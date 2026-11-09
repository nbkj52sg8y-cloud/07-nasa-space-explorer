// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const apodDialog = document.getElementById('apodDialog');
const closeApodDialog = document.getElementById('closeApodDialog');
const apodModalImage = document.getElementById('apodModalImage');
const apodModalTitle = document.getElementById('apodModalTitle');
const apodModalDate = document.getElementById('apodModalDate');
const apodModalExplanation = document.getElementById('apodModalExplanation');
const spaceFact = document.getElementById('spaceFact');

// Keep a collection of space facts and show one at random when the page loads.
const spaceFacts = [
	'A day on Venus is longer than its year.',
	'Sunlight takes about 8 minutes and 20 seconds to reach Earth.',
	'Footprints on the Moon can last for millions of years because there is no wind or rain to wash them away.',
	'Mars can have blue sunsets.',
	'Saturn is less dense than water, so it would float in a large enough ocean.'
];
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
spaceFact.textContent = randomFact;

// NASA provides DEMO_KEY for trying the API. Replace it with your own key for regular use.
const apiKey = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Show a short message in the gallery while loading or when something goes wrong.
function showMessage(message) {
	const placeholder = document.createElement('div');
	const text = document.createElement('p');

	placeholder.className = 'placeholder';
	text.textContent = message;
	placeholder.append(text);
	gallery.replaceChildren(placeholder);
}

// Show the selected APOD with its full-size image and details.
function showApodDetails(apod, imageUrl) {
	apodModalImage.src = apod.media_type === 'image' ? apod.hdurl || apod.url : imageUrl;
	apodModalImage.alt = apod.title;
	apodModalTitle.textContent = apod.title;
	apodModalDate.dateTime = apod.date;
	apodModalDate.textContent = apod.date;
	apodModalExplanation.textContent = apod.explanation;
	apodDialog.showModal();
}

// Add one APOD result to the gallery.
function addApodToGallery(apod) {
	const card = document.createElement('article');
	const title = document.createElement('h2');
	const date = document.createElement('time');
	const explanation = document.createElement('p');
	const imageUrl = apod.media_type === 'image' ? apod.url : apod.thumbnail_url;

	card.className = 'gallery-item';
	title.textContent = apod.title;
	date.dateTime = apod.date;
	date.textContent = apod.date;
	explanation.textContent = apod.explanation;

	if (imageUrl) {
		const image = document.createElement('img');
		image.src = imageUrl;
		image.alt = apod.title;
		image.loading = 'lazy';
		card.append(image);
		card.tabIndex = 0;
		card.setAttribute('role', 'button');
		card.setAttribute('aria-label', `View ${apod.title} from ${apod.date}`);
		card.addEventListener('click', () => showApodDetails(apod, imageUrl));
		card.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				showApodDetails(apod, imageUrl);
			}
		});
	} else if (apod.media_type === 'video') {
		const mediaLink = document.createElement('a');
		mediaLink.href = apod.url;
		mediaLink.textContent = 'View APOD media';
		mediaLink.target = '_blank';
		mediaLink.rel = 'noopener noreferrer';
		card.append(mediaLink);
	}


closeApodDialog.addEventListener('click', () => apodDialog.close());
apodDialog.addEventListener('click', (event) => {
	if (event.target === apodDialog) {
		apodDialog.close();
	}
});
	card.append(title, date, explanation);
	gallery.append(card);
}

// Fetch the selected dates from NASA's Astronomy Picture of the Day API.
async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		showMessage('Choose a valid start and end date.');
		return;
	}

	const query = new URLSearchParams({
		start_date: startDate,
		end_date: endDate,
		thumbs: true,
		api_key: apiKey
	});

	getImagesButton.disabled = true;
	showMessage('Loading space images...');

	try {
		const response = await fetch(`https://api.nasa.gov/planetary/apod?${query}`);
		const data = await response.json().catch(() => null);

		if (!response.ok) {
			throw new Error(data?.error?.message || 'NASA APOD is temporarily unavailable. Please try again.');
		}

		if (!data) {
			throw new Error('NASA returned an invalid response. Please try again.');
		}

		const apods = Array.isArray(data) ? data : [data];
		gallery.replaceChildren();

		// Show the newest date first.
		apods.reverse().forEach(addApodToGallery);
	} catch (error) {
		showMessage(error.message || 'Unable to load space images. Please try again.');
	} finally {
		getImagesButton.disabled = false;
	}
}

getImagesButton.addEventListener('click', getSpaceImages);
