import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const app = document.getElementById('app');

app.innerHTML = `
  <h1 class="text-center mb-4">RSS Aggregator</h1>
  <form id="rss-form">
    <div class="mb-3">
      <input 
        type="text" 
        class="form-control" 
        id="rss-url" 
        placeholder="https://example.com/rss.xml" 
        required
      >
    </div>
    <button type="submit" class="btn btn-primary">Add</button>
  </form>
  <div id="feeds" class="mt-4"></div>
`;

document.getElementById('rss-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const url = document.getElementById('rss-url').value;
  addFeed(url);
});

function addFeed(url) {
  // Здесь будет логика добавления RSS (на промисах)
  console.log('Добавляем RSS:', url);
}