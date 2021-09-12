// NOTE : Modal D.O.M 
const overlap = document.querySelector(".overlap");
const modal = document.querySelector("#modal");
const modalTitle = document.querySelector(".modal-title");
const modalContent = document.querySelector("#modal .modal-content");
const modalButton = document.querySelector(".btn-modal");
const modalCover = document.querySelector('.modal-cover');

function showModal() {
    overlap.hidden = false;
}

function hideModal() {
    overlap.hidden = true;
}

modalButton.addEventListener("click", function () {
    hideModal();
    modalContent.textContent = " ";
});