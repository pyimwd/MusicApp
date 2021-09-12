// NOTE : D.O.M
const searchField = document.querySelector("#search-music-form");
const searchResultDisplay = document.querySelector(".display-search-result");
const totalResult = document.querySelector("#totalCount");
const searchOption = document.querySelector('#search-option');
const resultsTable = document.querySelector("#results-table");
const resultsBody = document.querySelector("#results-body");
const nextResults = document.querySelector("#nextResults");
const userInput = document.querySelector("#search-field");
const userInputValue = document.querySelector("#user-input-value")
const loader = document.querySelector("#loader");
const mybutton = document.querySelector("#myBtn");

// NOTE : Set the offset
let offset = 0;

// NOTE : Hide next results button throw CSS set new attribute when there are less than 100 results to display
const hideNextResultsBtn = () => {
    nextResults.setAttribute("class", "hide-btn");
};

// NOTE : Display next results button throw CSS set new attribute when there are more than 100 results to display
const displayNextResultsBtn = () => {
    nextResults.setAttribute("class", "display-btn");
};

// NOTE : Display loader throw CSS set new attribute when loading is processing
const displayLoader = () => {
    loader.setAttribute("class", "display-loader");
};

// NOTE : Hide loader throw CSS set new attribute when loading is done
const hideLoader = () => {
    loader.setAttribute("class", "hide-loader");
};

// NOTE : Display results throw CSS set new attribute
const displayResults = () => {
    resultsTable.setAttribute("class", "display-table");
};

// NOTE : Hide results throw CSS set new attribute
const hideResults = () => {
    resultsTable.setAttribute("class", "hide-table");
};

// NOTE : Clear user input function
const clearInput = () => {
    userInput.value = '';
};

// NOTE : display next results function
const moreResults = () => {
    nextResults.addEventListener("click", function () {

        displayLoader();

        let text = userInput.value;
        offset++;

        if (searchOption.value === "Tous") {
            getEverything(text, offset);
        }

        else if (searchOption.value === "Artiste") {
            getArtist(text, offset);
        }

        else if (searchOption.value === "Titre") {
            getTitle(text, offset);
        }
        else if (searchOption.value === "Album") {
            getRelease(text, offset);
        };
    });
};

// NOTE : Add and display datas 
function addResult(recording, number) {

    const singleResult = document.createElement("tr");
    singleResult.className = "result";

    const rank = document.createElement("td");
    rank.className = "ranking";

    if (offset > 0) {
        number = number - offset;
        const numberIncrement = number += (100 * offset);
        rank.textContent = numberIncrement;
    } else {
        rank.textContent = number;
    };

    const artist = document.createElement("td");
    artist.className = "artist";
    artist.textContent = recording["artist-credit"][0].name;

    const title = document.createElement("td");
    title.className = "title";
    title.textContent = recording.title;

    const release = document.createElement("td");
    release.className = "album";
    release.textContent = recording.hasOwnProperty('releases') ? recording.releases[0].title : 'None';

    const moreInfoButton = document.createElement("button");
    moreInfoButton.className = "more-info-button";
    moreInfoButton.textContent = "+";

    moreInfoButton.addEventListener('click', function () {
        showModal();
        addModalContent(recording);
        getCovers(recording);
    });

    resultsBody.appendChild(singleResult);
    singleResult.appendChild(rank);
    singleResult.appendChild(artist);
    singleResult.appendChild(title);
    singleResult.appendChild(release);
    singleResult.appendChild(moreInfoButton);
};

// NOTE : Add count results or no results, and remove previous count results
function displayResultsCount(count) {
    // NOTE : Remove previous count results
    const totalResultWithChild = totalResult.hasChildNodes();
    if (totalResultWithChild) {
        totalResult.removeChild(totalResult.childNodes[0])
    };

    if (count > 0) {
        displayResults();
        const results = document.createElement("span");
        results.className = "totalResult";
        results.textContent = "Nombre de résultats : " + count;
        totalResult.appendChild(results);

        userInputValue.textContent = "Vous avez recherché - " + userInput.value + " - (dans la catégorie  " + searchOption.value + ")";
    } else {
        const noResults = document.createElement("span");
        noResults.className = "noneResult";
        noResults.textContent = "Pas de résultat. Essayez une nouvelle recherche";
        totalResult.appendChild(noResults);
    }
};

searchField.addEventListener("submit", function (ev) {
    ev.preventDefault();

    // Supprimer les résultats précédents
    const hasPreviousResults = resultsBody.hasChildNodes();
    if (hasPreviousResults === true) {
        while (resultsBody.firstChild) {
            resultsBody.removeChild(resultsBody.firstChild);
        };
    };

    offset = 0;
    let text = ev.target['name'].value;

    // NOTE : Display next results
    moreResults();

    displayLoader();

    if (searchOption.value === "Tous") {
        getEverything(text);
    }
    else if (searchOption.value === "Artiste") {
        getArtist(text);
    }
    else if (searchOption.value === "Titre") {
        getTitle(text);
    }
    else if (searchOption.value === "Album") {
        getRelease(text);
    };
});

// NOTE : get Everything data
function getEverything(text, offset) {

    hideNextResultsBtn();

    const request = new XMLHttpRequest();
    // offset = 0;

    request.open("GET", `https://musicbrainz.org/ws/2/recording/?inc=ratings&fmt=json&limit=100&offset=${offset}&query="${text}"`, true);

    request.addEventListener("readystatechange", function () {

        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {

                hideLoader();

                const response = JSON.parse(request.responseText);

                displayResultsCount(response.count);

                response.recordings.forEach((recording, index) => {
                    addResult(recording, index + response.offset + 1);
                });

                if (response.count > 100) {
                    displayNextResultsBtn()
                };

            } else {
                hideLoader();
                console.error(request.status);
            }
        }
    });
    request.send()
};

// NOTE : get Artist data
function getArtist(text, offset) {

    hideNextResultsBtn();

    const request = new XMLHttpRequest();

    request.open("GET", `https://musicbrainz.org/ws/2/recording/?inc=ratings&fmt=json&limit=100&offset=${offset}&query=artist:"${text}"`, true);

    request.addEventListener("readystatechange", function () {

        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {

                hideLoader();

                const response = JSON.parse(request.responseText);

                displayResultsCount(response.count);

                response.recordings.forEach((recording, index) => {
                    addResult(recording, index + response.offset + 1);
                });

                if (response.count > 100) {
                    displayNextResultsBtn()
                };

            } else {
                hideLoader();
                console.error(request.status);
            }
        }
    });
    request.send()
};

// NOTE : get Title data
function getTitle(text, offset) {

    hideNextResultsBtn();

    const request = new XMLHttpRequest();

    request.open("GET", `https://musicbrainz.org/ws/2/recording/?inc=ratings&fmt=json&limit=100&offset=${offset}&query=recording:"${text}"`, true);

    request.addEventListener("readystatechange", function () {

        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {

                hideLoader();

                const response = JSON.parse(request.responseText);

                displayResultsCount(response.count);

                response.recordings.forEach((recording, index) => {
                    addResult(recording, index + response.offset + 1);
                });

                if (response.count > 100) {
                    displayNextResultsBtn()
                };

            } else {
                hideLoader();
                console.error(request.status);
            }
        }
    });
    request.send()
};

// NOTE : get Release data
function getRelease(text, offset) {

    hideNextResultsBtn();

    const request = new XMLHttpRequest();

    request.open("GET", `https://musicbrainz.org/ws/2/recording/?inc=ratings&fmt=json&limit=100&offset=${offset}&query=release:"${text}"`, true);

    request.addEventListener("readystatechange", function () {

        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {

                hideLoader();

                const response = JSON.parse(request.responseText);

                displayResultsCount(response.count);

                response.recordings.forEach((recording, index) => {
                    addResult(recording, index + response.offset + 1);
                });

                if (response.count > 100) {
                    displayNextResultsBtn()
                };
            } else {
                hideLoader();
                console.error(request.status);
            }
        }
    });
    request.send();
};

// NOTE : Add data function to the modal
function addModalContent(recording) {

    getRatings(recording.id);

    // NOTE : Add artist and title to the modal title
    modalTitle.textContent = recording["artist-credit"][0].name + " - " + recording.title;

    // NOTE : Add artist to the modal (artiste)
    const artist = document.createElement("li");
    const artistContent = document.createElement("span");
    artist.className = "artist bold";
    artistContent.className = "modal-content";
    artist.textContent = "Artist : ";
    artistContent.textContent = recording["artist-credit"][0].name;
    artist.appendChild(artistContent);

    // NOTE : Add title to the modal (titre)
    const title = document.createElement("li");
    const titleContent = document.createElement("span");
    title.className = "title bold";
    titleContent.className = "modal-content";
    title.textContent = "Title : ";
    titleContent.textContent = recording.title;
    title.appendChild(titleContent)

    // NOTE : Add release to the modal (album)
    const release = document.createElement("li");
    const releaseContent = document.createElement("span");
    release.className = "album bold";
    releaseContent.className = "modal-content";
    release.textContent = "Release : ";
    releaseContent.textContent = (recording.hasOwnProperty('releases') ? recording.releases[0].title : 'None');
    release.appendChild(releaseContent);

    // NOTE : Add length to the modal (durée)
    const length = document.createElement("li");
    const lengthContent = document.createElement("span");
    length.className = "length bold";
    lengthContent.className = "modal-content";
    length.textContent = "Length : ";
    lengthContent.textContent = (convertMillisecondsToMinutesAndSeconds(recording));
    length.appendChild(lengthContent);


    // NOTE : RATING DOM (note du titre)
    const rating = document.createElement("li");
    const ratingContent = document.createElement("span");
    rating.className = "rating bold";
    ratingContent.className = "modal-content rating-content";
    rating.textContent = "Rating : ";
    rating.appendChild(ratingContent);

    // NOTE : Get tags (genres)
    const recordingHasTags = recording && recording.tags && recording.tags.length;
    const recordingTagsArray = [];

    const getTags = (recordingHasTags) => {
        if (recordingHasTags > 0) {
            for (let i = 0; i < recording.tags.length; i++) {
                recordingTagsArray.push(recording.tags[i].name)
            }
        }
        return recordingTagsArray;
    };
    const recordingTags = getTags(recordingHasTags);
    const tag = document.createElement("li");
    tag.className = "tag bold";
    const tagContent = document.createElement("span");
    tagContent.className = "modal-content";
    tag.textContent = "Tag : ";

    if (recordingTags.length === 0) {
        tagContent.textContent = "N/C";
        tag.appendChild(tagContent);
    } else {
        tagContent.textContent = recordingTagsArray.join(", ");
        tag.appendChild(tagContent);
    }

    modalContent.appendChild(artist);
    modalContent.appendChild(title);
    modalContent.appendChild(release);
    modalContent.appendChild(tag);
    modalContent.appendChild(length);
    modalContent.appendChild(rating);
};

// NOTE : Function to convert milliseconds to minutes and seconds
function convertMillisecondsToMinutesAndSeconds(recording) {
    const minutes = Math.floor(recording.length / 60000);
    const seconds = ((recording.length % 60000) / 1000).toFixed(0);
    if ((isNaN(minutes)) & (isNaN(seconds))) {
        return "N/C";
    } else {
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };
};

// NOTE : Get ratings and add it to the modal
function getRatings(recordingId) {

    const requestRatings = new XMLHttpRequest();

    requestRatings.open("GET", `https://musicbrainz.org/ws/2/recording/${recordingId}?inc=ratings&fmt=json`, true);

    requestRatings.addEventListener("readystatechange", function () {

        if (requestRatings.readyState === XMLHttpRequest.DONE) {
            if (requestRatings.status === 200) {

                const response = JSON.parse(requestRatings.responseText);

                const ratingValue = response.rating.value;

                if (ratingValue === null) {
                    const ratingContent = document.querySelector(".rating-content");
                    ratingContent.textContent = "N/C";
                } else {
                    const ratingContent = document.querySelector(".rating-content");
                    ratingContent.textContent = ratingValue + " / 5";
                };

            } else {
                console.error(requestRatings.status);
            }
        }
    });
    requestRatings.send()
};

// NOTE : Get covers art and add it to the modal
const getReleasesId = (recording) => {
    const releases = recording.releases;
    const releaseIdArray = [];
    if (releases !== undefined) {
        for (let i = 0; i < releases.length; i++) {
            releaseIdArray.push(releases[i].id);
        };
    };
    return releaseIdArray;
};

function getCovers(recording) {

    const releasesId = getReleasesId(recording);

    const coverArtWrapper = document.createElement("div");
    coverArtWrapper.className = "cover-art-wrapper";
    modalCover.appendChild(coverArtWrapper);

    for (let i = 0; i < releasesId.length; i++) {

        const requestCover = new XMLHttpRequest();
        requestCover.open('GET', `http://coverartarchive.org/release/${releasesId[i]}`, true);

        requestCover.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        requestCover.setRequestHeader("Accept", "application/json");

        requestCover.addEventListener("readystatechange", function () {

            if (requestCover.readyState === XMLHttpRequest.DONE) {
                if (requestCover.status === 200) {

                    let releaseResponse = JSON.parse(requestCover.responseText);

                    // Covers
                    releaseResponse.images.forEach(function (image) {
                        const img = document.createElement('img');
                        img.className = "coverImg";
                        img.src = (image.thumbnails.small);
                        coverArtWrapper.appendChild(img);
                    });

                } else {
                    console.error(requestCover.status);
                }
            }
        });
        requestCover.send();
    };
};

// NOTE : Scroll to the top Button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
