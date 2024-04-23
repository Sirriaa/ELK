window.addEventListener('resize', adjustLayoutForMobile);

// 예시: 모달을 열 때 키보드로 닫을 수 있도록 함
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

  // 상품 카테고리 변경 이벤트
    categorySelect.addEventListener('change', function() {
        const category = this.value;
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    });


//------------------------ 메타마스크 연동 ---------------------
document.getElementById('registerBtn').addEventListener('click', function() {
    // 회원가입 모달 표시 로직 추가
    document.getElementById('registerModal').style.display = 'block';
});

