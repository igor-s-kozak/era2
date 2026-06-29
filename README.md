# 📦 Деплой на GitHub Pages

## 🚀 Роутинг

Проект использует **React Router DOM** с `HashRouter` для корректной работы на GitHub Pages.

### Почему HashRouter?

GitHub Pages не поддерживает клиентский роутинг (SPA) из коробки. При прямом переходе по URL типа `/video` сервер возвращает 404, так как физически такой страницы не существует.

**Решение:** использование `HashRouter` добавляет `#` в URL, и всё, что идет после `#`, не отправляется на сервер, а обрабатывается на клиенте.

### Примеры URL:

Очередь генераций
[/queue](https://igor-s-kozak.github.io/era2/#/queue)

Другие экраны на которых можно посмотреть статус загрузок:

[/video](https://igor-s-kozak.github.io/era2/#/video)
[/audio](https://igor-s-kozak.github.io/era2/#/audio)