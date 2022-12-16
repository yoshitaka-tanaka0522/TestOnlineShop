// sessionStrageにkey(閲覧中かどうかのキー)を保存
// 閲覧中がなければ閲覧中をtrueにする
// localStorageに毎回ページが変わるごとにページを保存する
// sessionStrageのキーがないときにlocalStorageにページが保存されていた場合、そこにリダイレクトする
const browse = sessionStorage.getItem('browse');
if(browse === null) {
  // 最初にページを見たとき
  sessionStorage.setItem('browse', true);
  const page = localStorage.getItem('page');
  // 一回離脱して帰ってきたとき
  if(page !== null) {
    location.replace(page);
  }
}
localStorage.setItem('page', location.href);
