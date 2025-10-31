class CommentsSystem {
    constructor() {
        this.comments = JSON.parse(localStorage.getItem('blogComments')) || {};
    }

    // Добавить комментарий
    addComment(postId, author, text) {
        if (!this.comments[postId]) {
            this.comments[postId] = [];
        }
        
        const comment = {
            id: Date.now().toString(),
            postId: postId,
            author: author.trim() || 'Аноним',
            text: text.trim(),
            date: new Date().toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: Date.now()
        };
        
        this.comments[postId].unshift(comment);
        this.saveToStorage();
        return comment;
    }

    // Получить комментарии для поста
    getComments(postId) {
        return this.comments[postId] || [];
    }

    // Удалить комментарий (только для админа)
    deleteComment(postId, commentId) {
        if (this.comments[postId]) {
            this.comments[postId] = this.comments[postId].filter(c => c.id !== commentId);
            this.saveToStorage();
        }
    }

    // Сохранить в localStorage
    saveToStorage() {
        localStorage.setItem('blogComments', JSON.stringify(this.comments));
    }
}

const commentsSystem = new CommentsSystem();