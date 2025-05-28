document.addEventListener('DOMContentLoaded', function() {
    const mediaBlocks = document.querySelectorAll('.media-block');
    let clickCount = 0;
    let lastClickedBlock = null;
    const clickTimeout = 1000; // 1 секунда для тройного клика

    mediaBlocks.forEach(block => {
        block.addEventListener('click', function() {
            // Если кликнули на другой блок, сбрасываем счётчик
            if (lastClickedBlock !== this) {
                clickCount = 0;
                lastClickedBlock = this;
            }

            clickCount++;
            
            // Если сделали 3 клика за отведённое время
            if (clickCount === 3) {
                window.location.href = '/easter-egg';
            }

            // Сбрасываем счётчик через заданное время
            setTimeout(() => {
                clickCount = 0;
            }, clickTimeout);
        });
    });
});