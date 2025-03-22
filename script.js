// DOM Elements
const mainPageBtn = document.getElementById('mainPageBtn');
const knownWordsBtn = document.getElementById('knownWordsBtn');
const mainPage = document.getElementById('mainPage');
const knownWordsPage = document.getElementById('knownWordsPage');
const wordContainer = document.getElementById('wordContainer');
const knownWordContainer = document.getElementById('knownWordContainer');
const searchInput = document.getElementById('searchInput');
const knownSearchInput = document.getElementById('knownSearchInput');
const clearSearch = document.getElementById('clearSearch');
const clearKnownSearch = document.getElementById('clearKnownSearch');
const blueTheme = document.getElementById('blueTheme');
const greenTheme = document.getElementById('greenTheme');
const whiteTheme = document.getElementById('whiteTheme');

// Global variables
let dictionary = {};
let knownWords = JSON.parse(localStorage.getItem('knownWords')) || {};

// Pagination settings
const wordsPerPage = 50; // Increased from 20 to 50 words per page

// Fetch dictionary data
async function fetchDictionary() {
    try {
        showLoading(wordContainer);
        console.log('Attempting to fetch dictionary...');
        
        // Create a hardcoded dictionary as a fallback
        const fallbackDictionary = {
            "a": "bir",
            "ability": "kabiliyet, yetenek, beceri",
            "able": "yapabilmek, yapabilen",
            "about": "hakkında, ilgili, konusunda",
            "above": "yukarıda",
            "accept": "kabul etmek",
            "according": "göre",
            "account": "hesap, açıklama",
            "across": "karşısında",
            "act": "eylem, davranış"
        };
        
        try {
            // Try to fetch the dictionary file
            const response = await fetch('ingilizce.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Response received, length:', text.length);
            
            // Try to parse the JSON
            dictionary = JSON.parse(text);
            console.log('Dictionary loaded successfully:', Object.keys(dictionary).length, 'words');
        } catch (error) {
            console.error('Error loading or parsing dictionary:', error);
            console.log('Using fallback dictionary instead');
            dictionary = fallbackDictionary;
        }
        
        // Display words regardless of which dictionary was used
        displayWords(dictionary, wordContainer, false);
    } catch (error) {
        console.error('Unexpected error:', error);
        wordContainer.innerHTML = `<div class="no-results">Error loading dictionary. Please try again later.</div>`;
    }
}

// Display words in container
function displayWords(wordsObj, container, isKnownWordsPage) {
    container.innerHTML = '';
    
    // Get words and sort alphabetically
    const words = Object.keys(wordsObj).sort();
    
    if (words.length === 0) {
        container.innerHTML = `<div class="no-results">No words found.</div>`;
        return;
    }
    
    // Counter for word numbering
    let wordCounter = 1;
    
    words.forEach(word => {
        // Skip known words on main page
        if (!isKnownWordsPage && knownWords[word]) return;
        // Skip unknown words on known words page
        if (isKnownWordsPage && !knownWords[word]) return;
        
        const translation = wordsObj[word];
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        
        // Add word number
        const wordNumber = document.createElement('div');
        wordNumber.className = 'word-number';
        wordNumber.textContent = wordCounter++;
        
        const wordContent = document.createElement('div');
        wordContent.className = 'word-content';
        
        const englishWord = document.createElement('div');
        englishWord.className = 'english-word';
        englishWord.textContent = word;
        
        const turkishTranslation = document.createElement('div');
        turkishTranslation.className = 'turkish-translation';
        turkishTranslation.textContent = translation;
        
        wordContent.appendChild(englishWord);
        wordContent.appendChild(turkishTranslation);
        
        const knowButton = document.createElement('button');
        knowButton.className = 'know-button';
        
        if (isKnownWordsPage) {
            knowButton.textContent = 'Bilmiyorum';
            knowButton.addEventListener('click', () => {
                delete knownWords[word];
                localStorage.setItem('knownWords', JSON.stringify(knownWords));
                wordCard.remove();
                updateWordCounts();
            });
        } else {
            knowButton.textContent = 'Bunu Biliyorum';
            knowButton.addEventListener('click', () => {
                knownWords[word] = true;
                localStorage.setItem('knownWords', JSON.stringify(knownWords));
                wordCard.remove();
                updateWordCounts();
            });
        }
        
        wordCard.appendChild(wordNumber);
        wordCard.appendChild(wordContent);
        wordCard.appendChild(knowButton);
        container.appendChild(wordCard);
    });
    
    updateWordCounts();
}

// Filter words based on search input
function filterWords(searchText, container, isKnownWordsPage) {
    const filteredWords = {};
    const lowerSearchText = searchText.toLowerCase();
    
    Object.keys(dictionary).forEach(word => {
        // Skip known words on main page
        if (!isKnownWordsPage && knownWords[word]) return;
        // Skip unknown words on known words page
        if (isKnownWordsPage && !knownWords[word]) return;
        
        const translation = dictionary[word];
        
        if (word.toLowerCase().includes(lowerSearchText) || 
            translation.toLowerCase().includes(lowerSearchText)) {
            filteredWords[word] = translation;
        }
    });
    
    displayWords(filteredWords, container, isKnownWordsPage);
}

// Show loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading"></div>';
}

// Update word counts in tab buttons
function updateWordCounts() {
    const totalWords = Object.keys(dictionary).length;
    const knownWordsCount = Object.keys(knownWords).length;
    
    mainPageBtn.textContent = `Main Page (${totalWords - knownWordsCount})`;
    knownWordsBtn.textContent = `Known Words (${knownWordsCount})`;
}

// Switch between pages
function switchPage(pageToShow) {
    mainPage.classList.remove('active');
    knownWordsPage.classList.remove('active');
    mainPageBtn.classList.remove('active');
    knownWordsBtn.classList.remove('active');
    
    pageToShow.classList.add('active');
    
    if (pageToShow === mainPage) {
        mainPageBtn.classList.add('active');
    } else {
        knownWordsBtn.classList.add('active');
        displayWords(dictionary, knownWordContainer, true);
    }
}

// Change theme
function changeTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    
    // Update active state of theme buttons
    blueTheme.classList.remove('active');
    greenTheme.classList.remove('active');
    whiteTheme.classList.remove('active');
    
    if (theme === 'theme-blue') {
        blueTheme.classList.add('active');
    } else if (theme === 'theme-green') {
        greenTheme.classList.add('active');
    } else if (theme === 'theme-white') {
        whiteTheme.classList.add('active');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'theme-blue';
    changeTheme(savedTheme);
    
    // Fetch dictionary data
    fetchDictionary();
    
    // Navigation buttons
    mainPageBtn.addEventListener('click', () => switchPage(mainPage));
    knownWordsBtn.addEventListener('click', () => switchPage(knownWordsPage));
    
    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.trim();
        if (searchText) {
            filterWords(searchText, wordContainer, false);
        } else {
            displayWords(dictionary, wordContainer, false);
        }
    });
    
    knownSearchInput.addEventListener('input', () => {
        const searchText = knownSearchInput.value.trim();
        if (searchText) {
            filterWords(searchText, knownWordContainer, true);
        } else {
            displayWords(dictionary, knownWordContainer, true);
        }
    });
    
    // Clear search buttons
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        displayWords(dictionary, wordContainer, false);
    });
    
    clearKnownSearch.addEventListener('click', () => {
        knownSearchInput.value = '';
        displayWords(dictionary, knownWordContainer, true);
    });
    
    // Theme buttons
    blueTheme.addEventListener('click', () => changeTheme('theme-blue'));
    greenTheme.addEventListener('click', () => changeTheme('theme-green'));
    whiteTheme.addEventListener('click', () => changeTheme('theme-white'));
});