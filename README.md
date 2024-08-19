이 프로젝트는 이더리움 기반의 중고거래 DApp(분산형 애플리케이션)으로, 사용자들이 가상 지갑을 연결하여 로그인하고, 신원 인증된 개인이 자신의 상품을 안전하게 관리할 수 있도록 설계되었습니다. 애플리케이션은 이더리움 네트워크와 직접 연결되며, Docker를 활용해 자체 블록체인 서버를 구축하여 스마트 컨트랙트를 통한 거래와 사용자 간의 상호작용을 원활히 처리합니다.

프로젝트 개요
플랫폼: 이 프로젝트는 이더리움 네트워크를 기반으로 한 중고거래 DApp으로, 탈중앙화된 방식으로 거래를 지원합니다.
사용자 인증: 사용자들은 Metamask와 같은 가상 지갑을 연결해 로그인하며, 신원 인증이 완료된 사용자만이 상품을 등록하고 거래할 수 있습니다.
스마트 컨트랙트: 이 시스템은 사용자들이 안전하게 거래할 수 있도록 스마트 컨트랙트를 통해 코인을 발행하고, 거래를 중재하는 에스크로(escrow) 기능을 구현했습니다.
코인 발행: 프로젝트에서는 FreshCoin이라는 토큰을 발행하며, 초기 공급량은 10,000개로 설정되었습니다. 이 토큰은 ERC-20 표준을 따르며, 사용자들 간의 거래를 안전하게 수행하는 데 사용됩니다.
기술적 구성
블록체인 서버: Docker를 사용해 자체 블록체인 서버를 구축했습니다. 이 서버는 개발 및 테스트 환경에서 이더리움 네트워크의 모방 환경을 제공하여 스마트 컨트랙트 배포 및 테스트를 쉽게 할 수 있습니다.
Metamask 통합: 사용자들은 Metamask를 이용해 블록체인 네트워크와 상호작용하며, 상품 거래, 토큰 전송 등의 기능을 안전하게 수행할 수 있습니다.
스마트 컨트랙트: Solidity로 작성된 스마트 컨트랙트는 에스크로 기능을 포함해, 거래 과정에서 발생할 수 있는 잠재적 위험을 줄이고, 거래가 완료될 때까지 자금을 안전하게 보호합니다.
데이터베이스 및 백엔드
데이터베이스: SQL 기반의 PostgreSQL을 사용해 데이터를 관리합니다. PostgreSQL은 높은 안정성과 성능을 제공하여 사용자와 상품 정보를 안전하게 저장하고, 관리합니다.
세션 관리: 세션 관리는 POST 요청을 통해 처리되며, 사용자 인증 및 권한 부여를 효율적으로 관리합니다.
주요 프레임워크 및 도구
Docker: Docker를 사용하여 블록체인 서버를 컨테이너화하고, 배포와 유지보수를 쉽게 할 수 있습니다.
Node.js: Node.js는 애플리케이션의 백엔드 로직을 처리하는 데 사용됩니다. 빠르고 비동기 처리가 가능한 Node.js는 높은 성능을 요구하는 블록체인 기반 DApp에 적합합니다.
PostgreSQL: 데이터베이스 관리에 사용된 PostgreSQL은 데이터 무결성을 유지하며, 대규모 데이터 처리에 강점을 가지고 있습니다.
시너지 효과
이 프로젝트에서 사용된 Docker, Node.js, PostgreSQL의 조합은 시스템의 기동성과 사용 편의성을 극대화합니다. Docker는 환경에 구애받지 않는 배포를 가능하게 하고, Node.js는 빠르고 효율적인 서버 운영을 지원하며, PostgreSQL은 안정적인 데이터 관리를 책임집니다. 이러한 구성은 전체 시스템의 효율성과 안정성을 크게 향상시킵니다.

이 DApp은 사용자가 블록체인 네트워크를 통해 안전하고 신뢰할 수 있는 거래 환경을 제공받을 수 있도록 설계되었으며, 이러한 기술적 조합을 통해 사용자 경험을 최적화하는 데 중점을 두고 있습니다.
