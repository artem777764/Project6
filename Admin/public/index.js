// Функции для управления товарами

async function addProduct() {
    const name = document.getElementById('addName').value;
    const description = document.getElementById('addDescription').value;
    const price = parseFloat(document.getElementById('addPrice').value);
    const categories = document.getElementById('addCategory').value;

    await fetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, categories })
    });

    document.getElementById('addName').value = '';
    document.getElementById('addDescription').value = '';
    document.getElementById('addPrice').value = '';
    document.getElementById('addCategory').value = '';

    alert('Товар добавлен!');
}

async function editProduct() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const description = document.getElementById('editDescription').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const categories = document.getElementById('editCategory').value;

    await fetch(`/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, categories })
    });

    document.getElementById('editId').value = '';
    document.getElementById('editName').value = '';
    document.getElementById('editDescription').value = '';
    document.getElementById('editPrice').value = '';
    document.getElementById('editCategory').value = '';

    alert('Товар изменён!');
}

async function deleteProduct() {
    const id = document.getElementById('deleteId').value;

    await fetch(`/items/${id}`, {
        method: 'DELETE'
    });

    document.getElementById('deleteId').value = '';

    alert('Товар удалён!');
}

// --- Чат для второго фронтенда ---

// Подключаемся к WebSocket серверу (порт 8000)
const socket = new WebSocket("ws://localhost:8000");

socket.onopen = () => {
    console.log("Connected to WebSocket server");
};

socket.onmessage = (event) => {
    // Если полученные данные представляют Blob, преобразуем их в текст
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
            addChatMessage(reader.result);
        };
        reader.readAsText(event.data);
    } else {
        addChatMessage(event.data);
    }
};

socket.onerror = (error) => {
    console.error("WebSocket error: ", error);
};

// Элементы чата
const chatContainer = document.getElementById('chat-container');
const openChatButton = document.getElementById('open-chat-button');
const closeChatButton = document.getElementById('close-chat-button');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-message-input');
const sendChatMessageButton = document.getElementById('send-chat-message');

// Открытие чата
openChatButton.addEventListener('click', () => {
    chatContainer.style.display = 'flex';
    openChatButton.style.display = 'none';
});

// Закрытие чата
closeChatButton.addEventListener('click', () => {
    chatContainer.style.display = 'none';
    openChatButton.style.display = 'block';
});

// Отправка сообщения (при клике и при нажатии Enter)
sendChatMessageButton.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

function sendChatMessage() {
    const message = chatInput.value;
    if (message.trim() !== '') {
        socket.send(message);
        chatInput.value = '';
    }
}

function addChatMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.innerText = message;
    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}
