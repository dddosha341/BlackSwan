document.addEventListener('DOMContentLoaded', function() {
    const mediaBlocks = document.querySelectorAll('.media-block');
    let clickCount = 0;
    let lastClickedBlock = null;
    const clickTimeout = 1000; 

    mediaBlocks.forEach(block => {
        block.addEventListener('click', function() {
            if (lastClickedBlock !== this) {
                clickCount = 0;
                lastClickedBlock = this;
            }

            clickCount++;
            
            if (clickCount === 3) {
                window.location.href = '/easter-egg';
            }

            setTimeout(() => {
                clickCount = 0;
            }, clickTimeout);
        });
    });
});