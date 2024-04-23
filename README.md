window.addEventListener('resize', adjustLayoutForMobile);

// 예시: 모달을 열 때 키보드로 닫을 수 있도록 함
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

    // 모달 닫기 버튼에 대한 참조 가져오기 및 이벤트 리스너 추가
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
console.log('Hello, world!');

//------------------------ 메타마스크 연동 ---------------------
document.getElementById('registerBtn').addEventListener('click', function() {
    // 회원가입 모달 표시 로직 추가
    document.getElementById('registerModal').style.display = 'block';
});
