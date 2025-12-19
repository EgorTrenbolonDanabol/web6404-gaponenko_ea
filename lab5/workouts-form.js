document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    const nameEl = document.getElementById('fbName');
    const reviewEl = document.getElementById('fbReview');
    const nameHint = document.getElementById('fbNameHint');
    const reviewHint = document.getElementById('fbReviewHint');
    const submitBtn = document.getElementById('fbSubmit');
    const msgEl = document.getElementById('fbMessage');

    const tableBody = document.querySelector('#homeDataTable tbody');
    const fetchErrorEl = document.getElementById('homeFetchError');

    if (!form || !nameEl || !reviewEl) return;

    function validateName(value) {
        if (!value) return 'Имя обязательно';
        if (value.trim().length < 2) return 'Имя должно содержать не менее 2 символов';
        return '';
    }

    function validateReview(value) {
        if (!value) return 'Отзыв обязателен';
        if (value.trim().length < 10) return 'Отзыв должен быть не менее 10 символов';
        return '';
    }

    function updateState() {
        const n = nameEl.value;
        const r = reviewEl.value;
        const nMsg = validateName(n);
        const rMsg = validateReview(r);
        nameHint.textContent = nMsg;
        reviewHint.textContent = rMsg;
        submitBtn.disabled = !!(nMsg || rMsg);
    }

    nameEl.addEventListener('input', updateState);
    reviewEl.addEventListener('input', updateState);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        msgEl.textContent = '';
        const name = nameEl.value.trim();
        const review = reviewEl.value.trim();
        const nMsg = validateName(name);
        const rMsg = validateReview(review);
        nameHint.textContent = nMsg;
        reviewHint.textContent = rMsg;
        if (nMsg || rMsg) return;

        const payload = { name, review };
        msgEl.textContent = 'Отправка...';
        fetch('http://localhost:8000/home', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(resp => {
            if (!resp.ok) throw new Error('Сервер вернул ' + resp.status);
            return resp.text();
        })
        .then(text => {
            let data;
            try { data = JSON.parse(text); } catch { data = text; }
            msgEl.textContent = 'Отправлено';
            msgEl.style.color = 'green';
            console.log('POST response:', data);
        })
        .catch(err => {
            console.error('Ошибка отправки:', err);
            msgEl.textContent = 'Ошибка отправки: ' + err.message;
            msgEl.style.color = 'red';
        });
    });

    function renderItems(items) {
        tableBody.innerHTML = ''; // очищаем старые строки

        // Проверяем, что массив есть и не пустой
        if (!Array.isArray(items) || items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2" style="padding:6px">Нет данных</td></tr>';
            return;
        }

        const item = items[0]; // берём единственный объект

        const tr = document.createElement('tr');

        const td1 = document.createElement('td');
        td1.style.padding = '6px';
        td1.textContent = item.id ?? '';

        const td2 = document.createElement('td');
        td2.style.padding = '6px';
        td2.textContent = item.reminder ?? '';

        tr.appendChild(td1);
        tr.appendChild(td2);
        tableBody.appendChild(tr);
    }


    function fetchData() {
    fetchErrorEl.textContent = ''; // очищаем сообщение об ошибке

    fetch('http://localhost:8000/home', { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json(); 
        })
        .then(json => {
            // Берём массив внутри поля "data"
            const items = Array.isArray(json.data) ? json.data : [];
            renderItems(items);
        })
        .catch(err => {
            console.error('Ошибка при получении данных:', err);
            fetchErrorEl.textContent = 'Не удалось загрузить данные: ' + err.message;
        });
    }

    updateState();
    fetchData();
    setInterval(fetchData, 3000);
});