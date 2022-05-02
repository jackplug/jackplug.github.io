let buttonTriggers = document.querySelectorAll('[data-dialog]');

function openDialog(trigger) {
    let dialog = document.querySelector(trigger.dataset.dialog),
        dialogIsModal = trigger.dataset.modal && trigger.dataset.modal === 'true';

    if (!dialog) {
        return;
    }

    if (dialogIsModal) {
        dialog.showmodal();
    } else {
        dialog.show();
    }
}

buttonTriggers.forEach(buttonTrigger => {
    buttonTrigger.addEventListener('click', (event) => {
        openDialog(event.target);
    });
});
