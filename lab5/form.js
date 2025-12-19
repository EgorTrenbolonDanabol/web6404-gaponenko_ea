// Класс для хранения данных формы
class UserFormData {
    constructor(username, password, agree) {
        this.username = username;
        this.password = password;
        this.agree = agree;
    }

    // Метод вывода на консоль
    printToConsole() {
        console.log('%c=== Данные формы ===', 'color: #1abc9c; font-size: 14px; font-weight: bold;');
        console.log('Логин: ' + this.username);
        console.log('Пароль: ***');
        console.log('Согласие: ' + (this.agree ? 'Да' : 'Нет'));
    }
}

// Когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userForm');
    const messageEl = document.getElementById('formMessage');
    const agreeEl = document.getElementById('agree'); 
    if (!form || !messageEl || !agreeEl) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const agreeEl = document.getElementById('agree');
        if (!agreeEl.checked) {
            alert('Вы должны согласиться на обработку данных!');
            return;
        }

        // Получаем значения из формы
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const agree = agreeEl.checked;

     
        const userData = new UserFormData(username, password, agree);

    
        userData.printToConsole();

        // Отправляем на сервер
        const payload = { username: username, password: password };
        fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(resp => resp.text()) 
        .then(text => {
            let data;

            try {
                data = JSON.parse(text); // пробуем преобразовать в объект
            } catch {
                data = text; // если не JSON, оставляем как текст
            }

            if (typeof data === 'object') {
                // Если пришёл объект (JSON)
                if (data.value) {
                    messageEl.textContent = data.value;
                    messageEl.style.color = 'green';   
                } else {
                    messageEl.textContent = JSON.stringify(data);
                }
            } else {
                messageEl.textContent = data;
                messageEl.style.color = 'red'; 
            }
        })

        .catch(err => {
            console.error('Ошибка:', err);
            messageEl.textContent = 'Произошла ошибка: ' + err.message;
            messageEl.style.color = 'red';
        });
    });
});
