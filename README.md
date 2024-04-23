window.addEventListener('resize', adjustLayoutForMobile);

// 예시: 모달을 열 때 키보드로 닫을 수 있도록 함
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

    // 메타마스크 연동 이벤트 리스너 수정
    connectWalletButton.addEventListener('click', async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('Connected accounts:', accounts);
                // 이후 로직에 사용자 계정 정보 활용
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        } else {
            console.log('Ethereum object not found; make sure MetaMask is installed.');
            alert('MetaMask is not installed or not enabled.');
        }
    });

//------------------------ 메타마스크 연동 ---------------------
document.getElementById('registerBtn').addEventListener('click', function() {
    // 회원가입 모달 표시 로직 추가
    document.getElementById('registerModal').style.display = 'block';
});

