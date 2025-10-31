class ReactionsSystem {
    constructor() {
        this.reactions = JSON.parse(localStorage.getItem('blogReactions')) || {};
        this.userVotes = JSON.parse(localStorage.getItem('blogUserVotes')) || {};
    }

    // Добавить реакцию (можно поставить только одну)
    addReaction(postId, type) {
        const userId = this.getUserId();
        
        if (!this.reactions[postId]) {
            this.reactions[postId] = { likes: 0, dislikes: 0 };
        }
        
        if (!this.userVotes[postId]) {
            this.userVotes[postId] = {};
        }
        
        // Если пользователь уже голосовал за этот пост
        const previousVote = this.userVotes[postId][userId];
        if (previousVote) {
            // Убираем предыдущий голос
            this.reactions[postId][previousVote]--;
        }
        
        // Добавляем новый голос
        this.reactions[postId][type]++;
        this.userVotes[postId][userId] = type;
        
        this.saveToStorage();
        return {
            reactions: this.reactions[postId],
            userVote: type
        };
    }

    // Получить реакции для поста
    getReactions(postId) {
        return this.reactions[postId] || { likes: 0, dislikes: 0 };
    }

    // Получить голос пользователя для поста
    getUserVote(postId) {
        const userId = this.getUserId();
        return this.userVotes[postId]?.[userId] || null;
    }

    // Генерируем уникальный ID пользователя (на основе браузера)
    getUserId() {
        let userId = localStorage.getItem('blogUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('blogUserId', userId);
        }
        return userId;
    }

    // Удалить все реакции (для очистки)
    clearAllReactions() {
        this.reactions = {};
        this.userVotes = {};
        this.saveToStorage();
    }

    // Сохранить в localStorage
    saveToStorage() {
        localStorage.setItem('blogReactions', JSON.stringify(this.reactions));
        localStorage.setItem('blogUserVotes', JSON.stringify(this.userVotes));
    }
}

const reactionsSystem = new ReactionsSystem();