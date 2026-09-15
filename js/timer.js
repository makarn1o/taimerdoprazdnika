/* Расчёт оставшегося времени и красивый формат даты на русском. */
(function (global) {
  "use strict";

  var ns = (global.EventCountdown = global.EventCountdown || {});

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  ns.timer = {
    /* Ближайший Новый год: 1 января следующего календарного года. */
    nextNewYearIso: function () {
      var year = new Date().getFullYear() + 1;
      return year + "-01-01";
    },

    formatDate: function (isoDate) {
      var parts = isoDate.split("-");
      var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    },

    remaining: function (isoDate) {
      var parts = isoDate.split("-");
      var target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
      var diff = target.getTime() - Date.now();

      if (diff <= 0) {
        return { arrived: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      var totalSeconds = Math.floor(diff / 1000);
      return {
        arrived: false,
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
      };
    },

    pad: pad
  };
})(window);
