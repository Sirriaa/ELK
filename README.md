window.addEventListener('resize', adjustLayoutForMobile);

// 예시: 모달을 열 때 키보드로 닫을 수 있도록 함
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

       // 상품 상세 모달 표시 함수
    function showModal(product) {
        modal.style.display = "block";
        modalBody.innerHTML = `<h2>${product.name}</h2><p>${product.description}</p><p>Price: $${product.price}</p>`;
    }


//------------------------ 메타마스크 연동 ---------------------
document.getElementById('registerBtn').addEventListener('click', function() {
    // 회원가입 모달 표시 로직 추가
    document.getElementById('registerModal').style.display = 'block';
});

