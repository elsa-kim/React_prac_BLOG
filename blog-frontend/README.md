### 라우트 컴포넌트

프로젝트 처음 만들고 설계 시작할 때 리액트 라우터 적용하는 것을 가장 먼저하면 좋음, 만들게 될 주요 페이지의 라우트 컴포넌트 만들기(src/pages)

- 5개 페이지
  - LoginPage.js : 로그인
  - RegisterPage.js : 회원가입
  - WritePage.js : 글쓰기
  - PostPage.js : 포스트 읽기
  - PostListPage.js : 포스트 목록

### styled-components 사용

styled-components로 만든 컴포넌트 바로 내보내면 자동 import가 제대로 작동하지 않아 리액트 컴포넌트 만들어 그 안에 렌더링해주기

- 이 프로젝트에서 각 컴포넌트의 최상위 컴포넌트 선언 시 이름 뒤 Block 단어

### 리덕스 적용

Ducks 패턴 사용해 액션타입, 액션 생성 함수, 리듀서가 하나의 파일에 다 정의되어 있는 리덕스 모듈 작성

### 기능 구현

#### 회원가입과 로그인

##### UI 준비

프레젠테이셔널 컴포넌트들은 components 디렉터리에 작성하고, 그 안에 기능별로 디렉터리 새로 만들어서 컴포넌트 분류

- common 디렉터리 : 여기저기 재사용 되는 컴포넌트
- auth : 회원 인증에 관련된 컴포넌트
- write : 글쓰기에 관련된 컴포넌트
- post : post 읽기에 관련된 컴포넌트

##### Snippet 직접 만들어 사용하기

1. https://snippet-generator.app/ 로 들어가 Snippet으로 사용하고 싶은 코드 좌측 텍스트 박스에 붙여 넣고 수정

- ${TM_FILENAME_BASE} : 확장자 제외한 파일 이름
- 상단 Snippet 설명(Description...)과 줄임 단어(Tab trigger...) 입력 후 우측 하단 Copy snippet 버튼 누르면 Snippet 복사됨

2. VS Code 열어 Code > 기본설정 > 사용자 코드 조각

- 언어 선택(javascriptreact)
- JSON 파일 안에 복사한 Snippet 붙여 넣고 저장
