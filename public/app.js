    document.addEventListener('DOMContentLoaded', () => {
    // 요소 참조
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const productList = document.getElementById('product-list');
    const modal = document.getElementById('productModal'); // 올바른 modal 참조
    const modalBody = document.getElementById('product-modal-body'); // 올바른 modalBody 참조
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const mypageButton = document.getElementById('mypageBtn');
    const registerButton = document.getElementById('registerBtn');
    const connectWalletButton = document.getElementById('connectWalletButton');
    const registerModal = document.getElementById('registerModal');
 

     // 예제로 사용자 로그인 여부를 간단히 확인하고 이미지 변경
    const isLoggedIn = true; // 로그인 상태 확인 로직 필요
    if (isLoggedIn) {
        document.getElementById('profileImage').src = '/default-profile.png'; // 사용자 프로필 이미지 경로
    }  
    
    let userWalletAddress = '';

    // 사용자 지갑 주소를 가져오는 함수
    async function getWalletAddress() {
        try {
            const response = await fetch('/get-wallet-address');
            const data = await response.json();
            if (data.walletAddress) {
                userWalletAddress = data.walletAddress;
                return data.walletAddress;
            } else {
                throw new Error('Wallet address not found in session');
            }
        } catch (error) {
            console.error('Error fetching wallet address:', error);
            return null;
        }
    }



   // 게시글 로드 함수
async function loadPosts() {
    const walletAddress = await getWalletAddress();
    fetch('/products')
        .then(response => response.json())
        .then(posts => {
            const container = document.getElementById('product-list');
            container.innerHTML = ''; // 초기화
            posts.forEach(post => {
                const imageUrl = post.image_url ? post.image_url.replace(/\\/g, '/') : 'path/to/default/image.jpg'; // 백슬래시를 슬래시로 변환
                console.log(`Final image URL: ${imageUrl}`); // 최종 사용되는 이미지 URL 로그 출력

                const postDiv = document.createElement('div');
                postDiv.className = 'product-item';
                postDiv.innerHTML = `
                    <div class="product-info" data-product-id="${post.id}">
                        <h3>${post.title} - ${post.nickname}</h3>
                        <p>${post.content}</p>
                        <p>Price: ${post.price}</p>
                        <img src="${imageUrl}" alt="${post.title}" class="product-image">
                        ${post.wallet_address === walletAddress ? `
                        <button class="edit-button" onclick="editPost(${post.id})">Edit</button>
                        <button class="delete-button" onclick="deletePost(${post.id})">Delete</button>` : ''}
                    </div>
                `;
                container.appendChild(postDiv);
            });

            // 상품 목록 클릭 시 이벤트 위임을 사용하여 처리
            container.addEventListener('click', function(event) {
                const productItem = event.target.closest('.product-info');
                if (productItem) {
                    const productId = productItem.getAttribute('data-product-id');
                    if (productId) {
                        showModal(productId);
                    } else {
                        console.error('Product ID not found.');
                    }
                }
            });
        })
        .catch(error => console.error('Failed to load posts:', error));
}



function showModal(productId) {
    fetch(`/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const imageUrl = product.image_url ? product.image_url.replace(/\\/g, '/') : 'path/to/default/image.jpg';
            modalBody.innerHTML = `
                <h2>${product.title}</h2>
                <p>${product.content}</p>
                <p>Price: ${product.price}</p>
                <img src="${imageUrl}" alt="${product.title}" style="width:100%;">
            `;
            const newUrl = `${window.location.pathname}?productId=${productId}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            modal.style.display = 'block';

            requestTransactionButton.onclick = function (event) {
                event.preventDefault();  // 폼 제출이나 네비게이션 같은 기본 동작 방지
                event.stopPropagation(); // Stop the event from bubbling up
                fetch('/api/request-transaction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId, buyerWalletAddress: userWalletAddress })
                })
                    .then(response => {
                        if (response.ok) {
                            alert('거래 요청이 완료되었습니다.');
                            requestTransactionButton.textContent = '대기중';
                            requestTransactionButton.disabled = true;
                        } else {
                            throw new Error('거래 요청 실패');
                        }
                    })
                    .catch(error => {
                        console.error('Error requesting transaction:', error);
                        alert('거래 요청 중 오류가 발생했습니다.');
                    });
            };
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            alert('거래 요청 중 오류가 발생했습니다.');
        });
}

    // 모달 닫기 로직 추가
    document.querySelector('.close-button').onclick = function() {
        modal.style.display = 'none';
    };

    // ESC 키를 이용하여 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        modal.style.display = 'none';
    }

    loadPosts()

    // 게시글 수정 함수
    window.editPost = function(postId) {
    fetch(`/products/${postId}`)
        .then(response => response.json())
        .then(data => {
            const mypageUrl = `/mypage.html?postId=${postId}&title=${encodeURIComponent(data.title)}&content=${encodeURIComponent(data.content)}&nickname=${encodeURIComponent(data.nickname)}&price=${data.price}&imageUrl=${encodeURIComponent(data.imageUrl)}`;
            window.open(mypageUrl, 'mypageWindow', 'width=800,height=600');
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            alert('Failed to load product details.');
        });
}




// 게시글 삭제 함수
window.deletePost = function(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
        fetch(`/products/${postId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert('Post deleted successfully!');
                    loadPosts(); // 게시글 목록 다시 로드
                } else {
                    alert('Failed to delete the post.');
                }
            })
            .catch(error => console.error('Error deleting post:', error));
    }
}

 // 서버로부터 제품 데이터를 로드
 async function loadProducts() {
    const response = await fetch('/products');  // API 경로 확인 필요
    const products = await response.json();

    // 제품 데이터를 DOM에 추가
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <p>${product.content}</p>
            <p>Price: $${product.price}</p>
            <img src="${product.imageUrl}" alt="${product.title}" style="width:100px; height:auto;">
        `;
        productListElement.appendChild(productDiv);
    });
}

// 예를 들어, 상품 정보를 로드하는 함수 내에서
function loadProducts() {
    fetch('/api/products')  // 상품 정보를 불러오는 API
      .then(response => response.json())
      .then(products => {
        products.forEach(product => {
          const productElement = document.createElement('div');
          productElement.innerHTML = `
            <h3>${product.title} - ${product.nickname}</h3>
            <p>${product.content}</p>
            <p>Price: ${product.price}</p>
            <img src="localhost:3000/uploads/${product.filename}" alt="${product.title}">
          `;
          document.getElementById('product-list').appendChild(productElement);
        });
      })
      .catch(error => console.error('Error loading products:', error));
  }
  
loadProducts();
  

//----------------------------------------------------------------------------------------
const requestTransactionButton = document.getElementById('request-transaction');

requestTransactionButton.addEventListener('click', function() {
    fetch('/get-wallet-address')
        .then(response => response.json())
        .then(data => {
            const productId = new URLSearchParams(window.location.search).get('productId');
            if (!productId) {
                alert('유효한 상품 ID가 제공되지 않았습니다.');
                return;  // 여기서 함수 중단
            }
            const encodedProductId = encodeURIComponent(productId);  // 제품 ID 인코딩
            
            if (data.walletAddress) {
                // 지갑 주소가 존재하면, 인코딩된 productId를 포함한 URL로 이동
                window.location.href = `coinTransaction.html?productId=${encodedProductId}`;
            } else {
                alert('지갑 주소로 가입된 사용자만 거래를 요청할 수 있습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('지갑 주소를 확인하는 중 오류가 발생했습니다.');
        });
});




//-------------------------------------------------------------------------------------------
    // 상품 목록을 화면에 표시하는 함수
      /*  function displayProducts(products) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // 기존 목록을 초기화
    
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <h3>${product.title}</h3>
                <img src="${product.imageUrl}" alt="${product.title}" style="width:100px; height:auto;"> // 이미지 표시 추가
                <p>${product.content}</p> // 상품 설명
                <p>Price: ${product.price}</p>
            `;
            productList.appendChild(productItem);
        });
    }
    */


fetch('/products')
        .then(response => response.json())
        .then(data => {
            productList.innerHTML = ''; // Clear the product list first
            data.forEach(product => {
                const productHtml = `
                    <div class="product-item" data-product-id="${product.id}">
                        <div class="product-info">
                            <h3>${product.title} - ${product.nickname}</h3>
                            <p>${product.content}</p>
                            <p>Price: ${product.price}</p>
                            <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
                        </div>
                    </div>
                `;
                productList.innerHTML += productHtml;
            });
        })
        .catch(error => console.error('Error loading the products:', error));

        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('.product-item').getAttribute('data-product-id');
                showModal(productId);
            });
        });


    

    // 상품 목록 클릭 시 이벤트 위임을 사용하여 처리
    productList.addEventListener('click', function(event) {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
            const productId = productItem.getAttribute('data-product-id');
            if (productId) {
                showModal(productId);
            } else {
                console.error('Product ID not found.');
            }
        }
    });



 
/*

    function showModal(productId) {
        fetch(`/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                const modalBody = document.getElementById('product-modal-body');
                modalBody.innerHTML = `
                    <h2>${product.title}</h2>
                    <p>${product.content}</p>
                    <p>Price: ${product.price}</p>
                    <img src="${product.imageUrl}" alt="${product.title}" style="width:100%;">`;
    
                // URL 업데이트를 위해 history 상태를 변경
                const newUrl = `${window.location.pathname}?productId=${productId}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
    
                // 모달 표시
                const modal = document.getElementById('productModal');
                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
            });
    }
    


// 모달을 닫는 함수
function closeModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}




// ESC 키를 이용하여 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});


*/

    let products = []; // 이 배열은 서버로부터 가져온 상품 데이터를 담게 됩니다.

     // 상품 카테고리 변경 이벤트
     if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            console.log('Category changed');
            const category = this.value;
            const filteredProducts = products.filter(product => product.category === category);
            displayProducts(filteredProducts);
        });
    }

    // 검색 버튼 클릭 이벤트 리스너
    searchButton.addEventListener('click', () => {
        console.log('Search button clicked'); // 확인용 콘솔 출력
        const searchQuery = searchInput.value.trim().toLowerCase();
        console.log('Search query:', searchQuery); // 검색어 확인용 콘솔 출력

        fetch(`/products/search?title=${encodeURIComponent(searchQuery)}`)
            .then(response => response.json())
            .then(products => {
                console.log('Filtered products:', products); // 필터링된 제품 확인용 콘솔 출력
                displayProducts(products);
            })
            .catch(error => console.error('Error fetching products:', error));
    });

    function displayProducts(products) {
        productList.innerHTML = '';
        if (products.length === 0) {
            productList.innerHTML = '<p>No products found.</p>';
            return;
        }

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <h3>${product.title}</h3>
                <img src="${product.image_url}" alt="${product.title}" style="width: 30%; height: auto;" />
                <p>Category: ${product.category}</p>
                <p>Price: $${product.price}</p>
            `;
            productList.appendChild(productElement);
        });
    }

    // 초기 상태: 모든 제품을 표시합니다.
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            console.log('All products:', products); // 모든 제품 확인용 콘솔 출력
            displayProducts(products);
        })
        .catch(error => console.error('Error fetching products:', error));



    // 상품 정렬 이벤트
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            console.log('Sort option changed');
            let sortedProducts = [...products];
            if (this.value === 'priceLowHigh') {
                sortedProducts.sort((a, b) => a.price - b.price);
            } else if (this.value === 'priceHighLow') {
                sortedProducts.sort((a, b) => b.price - a.price);
            } else {
                sortedProducts = [...products]; // 기본 정렬 또는 다른 정렬 기준 적용
            }
            displayProducts(sortedProducts);
        });
    }



    // 로그인 및 회원가입 이벤트 리스너
    mypageButton.addEventListener('click', function() {
        // 로그인 로직 구현
    });

    registerButton.addEventListener('click', function() {
        registerModal.style.display = 'block';
        // 회원가입 로직 구현
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

    
    loadUserProfile();

});

async function loadUserProfile() {
    const walletAddress = localStorage.getItem('walletAddress'); // 로컬 스토리지에서 지갑 주소 가져오기
    if (!walletAddress) {
        console.error('No wallet address found');
        displayDefaultUserInfo();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/user-profile/${walletAddress}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        updateUserInfo(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        displayErrorToUser('Error loading user data. Please try again later.');
    }
}

function updateUserInfo(userData) {
    document.getElementById('userName').textContent = `Name: ${userData.name}`;
    document.getElementById('userAddress').textContent = `Address: ${userData.address}`;
    document.getElementById('userDetailAddress').textContent = `Detail Address: ${userData.detailaddress}`;
    document.getElementById('userPhone').textContent = `Phone: ${userData.phone}`;
}

function displayDefaultUserInfo() {
    document.getElementById('userName').textContent = 'Name: Not available';
    document.getElementById('userAddress').textContent = 'Address: Not available';
    document.getElementById('userDetailAddress').textContent = 'Detail Address: Not available';
    document.getElementById('userPhone').textContent = 'Phone: Not available';
}

function displayErrorToUser(message) {
    alert(message); // 실제 사용 시에는 alert 대신 사용자 친화적인 방식으로 표시
}


document.addEventListener('DOMContentLoaded', function() {
    fetchUserProfile();

    function fetchUserProfile() {
        fetch('/user-profile')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch user profile');
                return response.json();
            })
            .then(userData => {
                document.getElementById('userName').textContent = `Name: ${userData.name}`;
                document.getElementById('userAddress').textContent = `Address: ${userData.address}`;
                document.getElementById('userDetailAddress').textContent = `Detail Address: ${userData.detailaddress}`;
                document.getElementById('userPhone').textContent = `Phone: ${userData.phone}`;
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
    }
});


function adjustLayoutForMobile() {
    if (window.innerWidth < 768) {
        // 모바일 디바이스에 맞는 레이아웃 조정
    } else {
        // 데스크탑 디바이스에 맞는 레이아웃 조정
    }
}

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
// app.js 내부


//------------------------mypage-----------------------
var mypageBtn = document.getElementById('mypageBtn');
if (!mypageBtn.getAttribute('data-listener')) {
    mypageBtn.setAttribute('data-listener', 'true');
    mypageBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                window.open('mypage.html', 'mypageWindow', 'width=800,height=600');
            } else {
                alert('지갑을 연결해주세요.');
            }
        } else {
            alert('Ethereum object not found; make sure MetaMask is installed and enabled.');
        }
    });
}





// 예시: 상품 등록 함수
function submitProduct(title, content, price, nickname, imageUrl) {
    fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, price, nickname, imageUrl })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Product registered:", data);
        // 추가적으로 상품 목록 업데이트 또는 사용자에게 알림 등의 처리
    })
    .catch(error => console.error('Error registering product:', error));
}

  
  // 상품 목록 불러오기
  function fetchProducts() {
    fetch('/products')
      .then(response => response.json())
      .then(data => {
        data.forEach(product => displayProduct(product));
      })
      .catch(error => console.error('Error:', error));
  }
  
  // 상품 표시 함수
  function displayProduct(product) {
    // 상품을 화면에 표시하는 로직
  }

//------------------------ 메타마스크 연동 ---------------------
document.getElementById('registerBtn').addEventListener('click', function() {
    // 회원가입 모달 표시 로직 추가
    document.getElementById('registerModal').style.display = 'block';
    // 회원가입 성공 시 "Mypage" 버튼 표시
    registerSuccess();
    // 회원가입 성공 시 실행될 함수
    function registerSuccess() {
    // "Mypage" 버튼 표시
    document.getElementById('mypageBtn').style.display = 'inline-block';
}
});


document.getElementById('addressSearch').addEventListener('click', function() {
    new daum.Postcode({
        oncomplete: function(data) {
            // 팝업에서 검색 결과 항목을 클릭했을 때 실행할 코드를 작성하는 부분.
            // 예제를 그대로 사용할 경우, 주소 전체, 상세 주소를 입력하는 두 개의 필드가 존재하므로 아래와 같이 작성합니다.
            let fullAddress = data.address; // 최종 주소 변수
            let extraAddress = ''; // 조합형 주소 변수

            // 기본 주소가 도로명 타입일때 조합한다.
            if(data.addressType === 'R'){
                if(data.bname !== ''){
                    extraAddress += data.bname;
                }
                if(data.buildingName !== ''){
                    extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                }
                fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
            }

            document.getElementById('address').value = fullAddress; // 주소 넣기
            document.getElementById('detailAddress').focus(); // 상세입력 포커스 이동
        }
    }).open();
});


document.getElementById('loginButton').addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];

            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress })
            });

            const result = await response.json();
            if (result.success) {
                alert('Login successful');
                document.getElementById('profileImage').src = result.profileImageUrl || 'default-profile.png'; // 사용자 프로필 이미지 경로를 설정
                // 받은 사용자 정보를 표시
                document.getElementById('name').value = result.data.name;
                document.getElementById('address').value = result.data.address;
                document.getElementById('detailAddress').value = result.detailaddress;
                document.getElementById('phone').value = result.data.phone;
            } else {
                alert('Login failed: ' + result.message);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    } else {
        alert('MetaMask is not installed or not enabled.');
    }
});

// 로그인 요청을 보내고 응답을 처리하는 함수
async function handleLogin() {
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
    });
    const data = await response.json();

    if (data.success) {
        localStorage.setItem('isLoggedIn', true);
        localStorage.setItem('profileImagePath', data.profileImagePath);
        updateUIAfterLogin();
    } else {
        alert('Login failed: ' + data.message);
    }
}

function updateUIAfterLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const imagePath = localStorage.getItem('profileImagePath');
    console.log('Is logged in:', isLoggedIn);
    console.log('Image path:', imagePath);

    if (isLoggedIn) {
        document.getElementById('profileImage').src = imagePath || 'default-profile.png';
    }
}

document.addEventListener('DOMContentLoaded', updateUIAfterLogin);





document.getElementById('connectWalletButton').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];  // 첫 번째 계정 주소를 사용
            
            // 요소 참조 코드를 try 블록 안에 넣어 예외 처리
            const nameElement = document.getElementById('name');
            const addressElement = document.getElementById('address');
            const detailAddressElement = document.getElementById('detailAddress'); // ID 수정: detailAddress로 가정
            const phoneElement = document.getElementById('phone');
            
            if (!nameElement || !addressElement || !detailAddressElement || !phoneElement) {
                console.error('One or more form elements are missing.');
                alert('Form elements are missing, please check the page.');
                return;
            }

            const name = nameElement.value.trim();
            const address = addressElement.value.trim();
            const detailAddress = detailAddressElement.value.trim(); // 변수 이름 변경: CamelCase 사용
            const phone = phoneElement.value.trim();

            if (!name || !address || !detailAddress || !phone) {
                alert('Please fill in all fields.');
                return;
            }

            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, name, address, detailAddress, phone })
            });

            const data = await response.json();
            if (data.success) {
                console.log('Session set with:', data.session);
            } else {
                console.error('Session setup failed:', data.message);
            }
            

            // 웹3 인스턴스 초기화
            const web3 = new Web3(window.ethereum);

            // FRC 토큰 스마트 컨트랙트 정보
            const tokenContractAddress = '0xf37a7d3f8c0aed2101e254a3a3f1fef6a7e2fe25';
            const tokenABI = [
                {
                    "inputs": [],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Approval",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Transfer",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "name": "allowance",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_spender",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_value",
                            "type": "uint256"
                        }
                    ],
                    "name": "approve",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "name": "balanceOf",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "burn",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [
                        {
                            "internalType": "uint8",
                            "name": "",
                            "type": "uint8"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "initialSupply",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "mint",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "name",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "totalSupply",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_value",
                            "type": "uint256"
                        }
                    ],
                    "name": "transfer",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_value",
                            "type": "uint256"
                        }
                    ],
                    "name": "transferFrom",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];  // ABI는 스마트 컨트랙트에 따라 정의 필요
            const tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress);

            // FRC 토큰 잔액 조회
            const balance = await tokenContract.methods.balanceOf(walletAddress).call();

            // 잔액을 웹 페이지에 표시 (단위 변환 필요)
            const balanceInEther = web3.utils.fromWei(balance.toString(), 'ether');
            document.getElementById('walletBalance').innerText = `Wallet Balance: ${balanceInEther} FRC`;

        } catch (error) {
            console.error('Error with wallet interaction:', error);
            alert('Failed to interact with the wallet.');
        }
    } else {
        console.log('Ethereum object not found; make sure MetaMask is installed.');
        alert('MetaMask is not installed or not enabled.');
    }
});

