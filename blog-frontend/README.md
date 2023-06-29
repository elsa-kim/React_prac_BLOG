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

#### API 연동

axios 사용해 API 연동, 리덕스에서 비동기 작업 쉽게 관리하기 위해 redux-saga와 createRequestSaga 유틸 함수 사용

- axios 인스턴스 만들기 : API 클라이언트에 공통된 설정 쉽게 넣어줄 수 있음, 클라이언트 쉽게 교체 가능
- 프록시 설정
  - CORS(Cross Origin Request) 오류 : 네트워크 요청 할 때 주소 다른 경우 발생, 해당 오류 해결하려면 다른 주소에서도 API 호출할 수 있게 서버 쪽 코드 수정해야 하지만 최종적으로 프로젝트 완성 후 리액트 앱도 같은 호스트에서 제공할 것이기 때문에 불필요한 설정임 => 프록시 기능 사용
  - 프록시(proxy) : 웹팩 개발 서버에서 지원하는 기능으로, 개발서버로 요청하는 API들을 우리가 프록시로 정해 둔 서버로 그대로 전달해주고 그 응답을 웹 애플리케이션에서 사용할 수 있게 해줌
  - CRA로 만든 프로젝트에서 프록시 설정할 땐 package.json 파일 수정 후 서버 껐다가 다시 실행
  - API 함수 작성 : 리액트 애플리케이션에서 client.get('/api.posts') 하면 웹팩 개발 서버가 프록시 역할 해서 http://localhost:4000/api/posts에 대신 요청한 뒤 결과물을 응답
- redux-saga 통해 더 쉽게 API 요청할 수 있도록 리덕스 모듈과 createRequestSaga 유틸 함수 설정

#### 로그인 상태 유지

회원가입 및 로그인 하면 사용자 정보를 localStorage에 저장하도록 작업,
페이지 새로고침했을 때도 로그인 상태 유자하려면 리액트 앱이 브라우저에서 맨 처음 렌더링 될 때 localStorage에서 값 불러와 리덕스 스토어 안에 넣도록 구현

- App 컴포넌트에서 useEffect 사용해 처리하는 방법
- App 컴포넌트를 클래스형 컴포넌트로 변환해 componentDidMount 메서드 만들고 그 안에서 처리하는 방법
- 프로젝트 엔트리 파일인 index.js에서 처리하는 방법 => 사용
  - componentDidMount와 useEffect는 컴포넌트가 한번 렌더링된 이후에 실행되기 때문에 사용자가 아주 짧은 깜박임 현상 경험할 수 있음
  - index.js에서 사용자 정보 불러오도록 처리하고 컴포넌트 렌더링하면 깜박임 현상 발생하지 않음

#### 글쓰기 페이지 기능

- 글 작성 에디터는 Quill 라이브러리 사용
  - quill 에디터는 일반 input이나 textarea가 아니기 때문에 onChange와 value 값 사용해 상태 관리할 수 없음
- 에디터 하단 컴포넌트 UI 구현
  - TagBox 컴포넌트에서 모든 작업 하는게 아닌, TagItem, TagList 컴포넌트 추가로 만들어 렌더링 최적화
    - 추가로 React.memo 사용해 컴포넌트 감싸주면 해당 컴포넌트가 받아오는 props가 실제로 바뀌었을 때만 리렌더링 해줌
  - TagBox는 input 바뀔때, 태그 목록 바뀔 때 렌더링

#### 포스트 조회 기능

- 포스트 제목, 작성자 계정명, 작성 시간, 태그, 제목 보여줌

#### HTML 필터링

- sanitize-html 라이브러리 사용 : HTML 제거하는 기능, 특정 HTML만 허용하는 기능 등 가지고 있어 악성 스크립트 삽입 막을 수 있음
- 백엔드에 sanitize-html 설치

#### 페이지네이션

- SUCCESS 액션 발생시킬 때 meta 값을 response로 넣어 HTTP 헤더 및 상태 코드 쉽게 조회 가능
- Pagination 컴포넌트에서 props로 현재 선택된 계정명, 태그, 현재 페이지 숫자, 마지막 페이지 숫자를 가져오고 사용자가 이 컴포넌트에 있는 버튼 클릭 시 props로 받아온 값 사용해 이동해야 할 다음 경로 설정

#### 포스트 수정/삭제 기능

- 포스트 읽는 화면에서 포스트 작성자에게만 수정, 삭제 버튼 나타나도록 렌더링
- PostActionButtons(수정/삭제) 렌더링 방법
  1. PostViewer에서 직접 렌더링 : PostActionButtons에 onEdit, onRemove 등 props 전달 시 무조건 PostViewer 거쳐 전달해야 함, 컴포넌트가 받아오는 props가 너무 많아져 관리 힘들 수 있음
  2. PostActionButtons의 컨테이너 컴포넌트 만들고 PostViewer 내부에서 바로 렌더링
  3. props를 JSX 형태로 받아와 렌더링 : 컨테이너 컴포넌트 새로 만들 필요 없이 기존 PostViewerContainer에서 필요한 로직 작성 => 사용
- 삭제 버튼 누르면 모달 사용해 사용자 확인 한번 더 요청 후 삭제
