window.addEventListener('resize', adjustLayoutForMobile);

// 예시: 모달을 열 때 키보드로 닫을 수 있도록 함
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

    // Escape 키를 이용한 모달 닫기
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
            if (registerModal && registerModal.style.display === 'block') {
                registerModal.style.display = 'none';
            }
        }
    });



//------------------------ 메타마스크 연동 ---------------------
document.getElementById('registerBtn').addEventListener('click', function() {
    // 회원가입 모달 표시 로직 추가
    document.getElementById('registerModal').style.display = 'block';
});

