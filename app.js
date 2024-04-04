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

    // 모달 닫기 버튼 및 외부 클릭 이벤트 리스너
    closeButton.addEventListener('click', () => modal.style.display = "none");
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        } else if (event.target === registerModal) {
            registerModal.style.display = "none";
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
