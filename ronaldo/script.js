document.addEventListener('keydown', function(event) {
    if (event.key === 'p' || event.key === 'P') {
        document.body.classList.toggle('punch');
    }
});