// Функциональность для загрузки товаров (GraphQL)
async function loadItems(fields) {
    const query = `
      query GetItems($fields: [String!]!) {
        items(fields: $fields) {
          html
        }
      }
    `;
    
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { fields: fields }
      })
    });
  
    const { data } = await response.json();
    const container = document.getElementById('items-container');
    container.innerHTML = '';
  
    data.items.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.classList.add('card');
      itemCard.innerHTML = item.html;
      container.appendChild(itemCard);
    });
  }
  
  function submitSelection() {
    const selectedFields = [];
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
      selectedFields.push(checkbox.value);
    });
  
    loadItems(selectedFields);
  }
  
  // --- Чат на стороне фронтенда ---
  
  // Подключение к серверу через WebSocket (на порту 8000)
  const socket = new WebSocket("ws://localhost:8000");
  
  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };
  
  socket.onmessage = (event) => {
    // Добавляем полученное сообщение в чат
    addChatMessage(event.data);
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error: ', error);
  };
  
  // Элементы управления чатом
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
  
  // Отправка сообщения при клике и при нажатии Enter
  sendChatMessageButton.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
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
    // Автопрокрутка вниз
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  }
  