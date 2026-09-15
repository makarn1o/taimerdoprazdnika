/* Сохранение выбранного события в localStorage браузера. */
(function (global) {
  "use strict";

  var ns = (global.EventCountdown = global.EventCountdown || {});
  var KEY = "event-countdown-selection";

  ns.storage = {
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    },
    save: function (eventData) {
      try {
        localStorage.setItem(KEY, JSON.stringify(eventData));
      } catch (error) {
        /* Если хранилище недоступно, таймер всё равно работает до перезагрузки. */
      }
    }
  };
})(window);
