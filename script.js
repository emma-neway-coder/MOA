const form = document.querySelector('#invitation-form');
const card = document.querySelector('#card');
const status = document.querySelector('#status');
const fields = ['title','purpose','host','capacity','date','time','place','address','closing'];
const get = id => form.elements[id].value.trim();
const put = (id, value) => { document.getElementById(id).textContent = value; };

function dateLabel(value, time) {
  if (!value) return '날짜를 입력해 주세요';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '날짜를 입력해 주세요';
  return `${new Intl.DateTimeFormat('ko-KR', {year:'numeric', month:'long', day:'numeric', weekday:'long'}).format(date)}${time ? ' ' + time : ''}`;
}

function render() {
  const theme = form.elements.theme.value;
  card.className = `card theme-${theme}`;
  put('card-title', get('title') || '모임 이름을 적어주세요');
  put('card-purpose', get('purpose') || '함께하고 싶은 마음을 들려주세요.');
  put('card-date', dateLabel(get('date'), get('time')));
  put('card-place', get('place') || '장소를 입력해 주세요');
  put('card-address', get('address'));
  put('card-capacity', `${get('capacity')}명과 함께`);
  document.querySelector('#capacity-detail').hidden = !get('capacity');
  put('card-closing', get('closing'));
  put('card-host', get('host'));
  const address = get('address').split('\n')[0].trim();
  const map = document.querySelector('#map-link');
  map.hidden = !address;
  if (address) map.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function serialize() {
  const data = Object.fromEntries(fields.map(key => [key, get(key)]));
  data.theme = form.elements.theme.value;
  return data;
}

function loadShared() {
  const encoded = new URL(location.href).searchParams.get('invite');
  if (!encoded) return;
  try {
    const decoded = decodeURIComponent(Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
    const data = JSON.parse(decoded);
    for (const key of fields) if (typeof data[key] === 'string') form.elements[key].value = data[key];
    if (['lime','mint','blue','orange','pink','gray'].includes(data.theme)) form.elements.theme.value = data.theme;
    status.textContent = '공유된 초대장을 불러왔어요. 내용을 수정할 수도 있습니다.';
  } catch { status.textContent = '공유 링크를 읽지 못했어요. 새 초대장을 만들어 주세요.'; }
}

form.addEventListener('input', render);
form.addEventListener('change', render);
document.querySelector('#share').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const json = JSON.stringify(serialize());
  const encoded = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const url = new URL(location.href);
  url.search = new URLSearchParams({invite: encoded}).toString();
  try {
    await navigator.clipboard.writeText(url.href);
    status.textContent = '공유 링크를 복사했어요.';
  } catch {
    window.prompt('아래 링크를 복사해 주세요.', url.href);
    status.textContent = '링크를 만들어 드렸어요.';
  }
});
document.querySelector('#print').addEventListener('click', () => window.print());
if (!form.elements.date.value) {
  const date = new Date(); date.setDate(date.getDate() + 14);
  form.elements.date.value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
loadShared();
render();
