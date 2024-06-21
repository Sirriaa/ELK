 escrowFactoryContract = new web3.eth.Contract(escrowFactoryAbi, escrowFactoryAddress); // 초기화
            console.log("Contract initialized:", escrowFactoryContract);

            document.getElementById('deposit-button').addEventListener('click', async () => {
    console.log("Deposit button clicked");
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log("Accounts received:", accounts);

    try {
        const walletResponse = await fetch('/get-wallet-address');
        const walletData = await walletResponse.json();
        const buyerAddress = walletData.walletAddress;
        console.log("Buyer wallet address:", buyerAddress);

        const productResponse = await fetch(`/get-product-details?productId=${productId}`);
        const productData = await productResponse.json();
        const sellerAddress = productData.wallet_address;
        console.log("Seller wallet address:", sellerAddress);

        const transactionAmount = Math.floor(parseFloat(productData.price) / 1000); // 가격을 코인 단위로 변환
        console.log("Transaction details:", transactionAmount);
        const checksumAddress = web3.utils.toChecksumAddress('0x05aa7e1a89db8df1668cb94565b3a3fb9275673e');

        console.log("Calling createEscrow with:", buyerAddress, sellerAddress, "from account", account);
        escrowFactoryContract.methods.createEscrow(buyerAddress, sellerAddress).send({
            from: account,
            value: web3.utils.toWei(transactionAmount.toString(), 'ether'), 
            gas: 3000000,
            gasPrice: web3.utils.toWei('10', 'gwei')
        })
        .on('receipt', (receipt) => {
            console.log("Transaction receipt:", receipt);
            document.getElementById('confirm-order-button').disabled = false;
            alert('Escrow created and deposit successful.');
        })
        .on('error', (error) => {
            console.error("Transaction error:", error);
            alert('Deposit failed. ' + error.message);
        });
    } catch (error) {
        console.error('Error fetching wallet or product details:', error);
        alert('Error processing your transaction: ' + error.message);
    }


});
