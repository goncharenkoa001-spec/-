// Админ-панель для управления постами блога

class BlogAdmin {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadPosts();
        this.setupEventListeners();
        this.updateFormState();
    }

    setupEventListeners() {
        document.getElementById('post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });
    }

    savePost() {
        const title = document.getElementById('post-title').value;
        const date = document.getElementById('post-date').value;
        const preview = document.getElementById('post-preview').value;
        const content = document.getElementById('post-content').value;
        
        // Медиа файлы
        const previewImage = document.getElementById('post-preview-image').value;
        const images = document.getElementById('post-images').value.split('\n').filter(url => url.trim());
        const videos = document.getElementById('post-videos').value.split('\n').filter(url => url.trim());
        const audios = document.getElementById('post-audios').value.split('\n').filter(url => url.trim());

        if (!title || !date || !preview || !content || !previewImage) {
            this.showAlert('Заполните все обязательные поля', 'error');
            return;
        }

        const postData = {
            id: this.currentEditId || Date.now().toString(),
            title,
            date: this.formatDate(date),
            preview,
            content,
            previewImage: previewImage.trim(),
            images: images.map(url => url.trim()),
            videos: videos.map(url => url.trim()),
            audios: audios.map(url => url.trim()),
            createdAt: this.currentEditId ? 
                (this.posts.find(p => p.id === this.currentEditId)?.createdAt || new Date().toISOString()) : 
                new Date().toISOString()
        };

        if (this.currentEditId) {
            // ОБНОВЛЕНИЕ существующего поста
            const index = this.posts.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                this.posts[index] = postData;
                this.showAlert('✅ Пост успешно обновлен!', 'success');
            }
        } else {
            // СОЗДАНИЕ нового поста
            this.posts.unshift(postData);
            this.showAlert('✅ Пост успешно опубликован!', 'success');
        }

        this.saveToStorage();
        this.loadPosts();
        this.resetForm();
        this.currentEditId = null;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }

    loadPosts() {
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = '';

        if (this.posts.length === 0) {
            postsList.innerHTML = '<p style="color: #7f91a4; text-align: center;">Пока нет постов</p>';
            return;
        }

        this.posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsList.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const div = document.createElement('div');
        div.className = 'post-item';
        
        // Определяем превью картинку (старый или новый формат)
        const previewImage = post.previewImage || post.image || 'нет изображения';
        const mediaCount = (post.images ? post.images.length : 0) + 
                          (post.videos ? post.videos.length : 0) + 
                          (post.audios ? post.audios.length : 0);
        
        div.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <span class="post-date">${post.date}</span>
            </div>
            <p style="color: #c5c5c5; margin-bottom: 0.5rem;">${post.preview.substring(0, 100)}...</p>
            <div style="margin: 0.5rem 0;">
                <small style="color: #7f91a4;">
                    📷 Превью: ${previewImage.split('/').pop()}<br>
                    📁 Медиа файлов: ${mediaCount}
                </small>
            </div>
            <div class="post-actions">
                <button onclick="admin.editPost('${post.id}')" class="btn">✏️ Редактировать</button>
                <button onclick="admin.deletePost('${post.id}')" class="btn btn-danger">🗑️ Удалить</button>
                <button onclick="admin.viewPost('${post.id}')" class="btn">👁️ Просмотр</button>
            </div>
        `;
        return div;
    }

    editPost(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;

        // Заполняем форму данными поста
        document.getElementById('post-title').value = post.title;
        
        // Конвертируем дату обратно в формат YYYY-MM-DD
        const dateParts = post.date.split(' ');
        const months = {
            'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
            'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
            'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12'
        };
        const formattedDate = `${dateParts[2]}-${months[dateParts[1]]}-${dateParts[0].padStart(2, '0')}`;
        
        document.getElementById('post-date').value = formattedDate;
        document.getElementById('post-preview').value = post.preview;
        document.getElementById('post-content').value = post.content;
        
        // Загрузка медиа файлов
        document.getElementById('post-preview-image').value = post.previewImage || '';
        document.getElementById('post-images').value = post.images ? post.images.join('\n') : '';
        document.getElementById('post-videos').value = post.videos ? post.videos.join('\n') : '';
        document.getElementById('post-audios').value = post.audios ? post.audios.join('\n') : '';

        // Обновляем превью
        updateMediaPreview('post-preview-image', post.previewImage || '');
        updateMediaPreview('post-images', post.images || []);
        
        // Обновляем отображение даты
        const today = new Date().toISOString().split('T')[0];
        if (formattedDate === today) {
            document.getElementById('current-date-display').textContent = 'Сегодня';
        } else {
            document.getElementById('current-date-display').textContent = 'Выбрана';
        }

        // Устанавливаем режим редактирования
        this.currentEditId = id;
        this.updateFormState();
        
        // Прокрутка к форме
        document.getElementById('new-post').scrollIntoView({ behavior: 'smooth' });
        this.showAlert(`✏️ Редактирование поста: "${post.title}"`, 'success');
    }

    updateFormState() {
        const submitBtn = document.getElementById('submit-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        
        if (this.currentEditId) {
            // Режим редактирования
            submitBtn.textContent = '💾 Обновить пост';
            submitBtn.style.background = '#27ae60';
            cancelBtn.classList.remove('hidden');
            
            // Добавляем информацию о редактируемом посте
            const post = this.posts.find(p => p.id === this.currentEditId);
            if (post) {
                document.querySelector('#new-post h2').innerHTML = 
                    `Редактирование поста: <span style="color: #5682a3;">"${post.title}"</span>`;
            }
        } else {
            // Режим создания
            submitBtn.textContent = '📝 Опубликовать пост';
            submitBtn.style.background = '';
            cancelBtn.classList.add('hidden');
            document.querySelector('#new-post h2').textContent = 'Создать новый пост';
        }
    }

    cancelEdit() {
        if (confirm('Отменить редактирование? Все несохраненные изменения будут потеряны.')) {
            this.resetForm();
            this.showAlert('Редактирование отменено', 'success');
        }
    }

    deletePost(id) {
        if (confirm('Вы уверены, что хотите удалить этот пост?')) {
            this.posts = this.posts.filter(p => p.id !== id);
            this.saveToStorage();
            this.loadPosts();
            
            // Если удаляем редактируемый пост, сбрасываем форму
            if (this.currentEditId === id) {
                this.resetForm();
            }
            
            this.showAlert('🗑️ Пост удален', 'success');
        }
    }

    viewPost(id) {
        const post = this.posts.find(p => p.id === id);
        if (post) {
            localStorage.setItem('currentViewPost', JSON.stringify(post));
            window.open('post-view.html', '_blank');
        }
    }

    resetForm() {
        document.getElementById('post-form').reset();
        setTodayDate();
        this.currentEditId = null;
        this.updateFormState();
        
        // Очищаем текстовые поля медиа
        document.getElementById('post-images').value = '';
        document.getElementById('post-videos').value = '';
        document.getElementById('post-audios').value = '';
        
        // Скрываем превью
        document.getElementById('preview-image-preview').classList.add('hidden');
        document.getElementById('images-preview').classList.add('hidden');
        document.getElementById('videos-preview').classList.add('hidden');
        document.getElementById('audios-preview').classList.add('hidden');
    }

    saveToStorage() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    clearAllPosts() {
        if (confirm('ВНИМАНИЕ! Вы уверены, что хотите удалить ВСЕ посты? Это действие нельзя отменить.')) {
            this.posts = [];
            this.saveToStorage();
            this.loadPosts();
            this.resetForm();
            this.showAlert('🗑️ Все посты удалены', 'success');
        }
    }

    convertOldPosts() {
        const oldPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        let convertedCount = 0;
        
        const newPosts = oldPosts.map(post => {
            if (post.previewImage !== undefined) {
                return post;
            }
            
            convertedCount++;
            return {
                ...post,
                previewImage: post.image || '',
                images: post.image ? [post.image] : [],
                videos: [],
                audios: []
            };
        });
        
        this.posts = newPosts;
        this.saveToStorage();
        this.loadPosts();
        
        this.showAlert(
            `🔄 Конвертировано ${convertedCount} постов в новый формат`, 
            'success'
        );
    }

    showAlert(message, type) {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.classList.remove('hidden');

        setTimeout(() => {
            alert.classList.add('hidden');
        }, 3000);
    }
}

// Инициализация админ-панели
const admin = new BlogAdmin();