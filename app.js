 // 모달 닫기 버튼 및 외부 클릭 이벤트 리스너
    closeButton.addEventListener('click', () => modal.style.display = "none");
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        } else if (event.target === registerModal) {
            registerModal.style.display = "none";
        }
    });
