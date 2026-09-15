/* Главный контроллер страницы: выбор события, подтверждение, отрисовка таймера. */
(function (global) {
  "use strict";

  var ns = global.EventCountdown;
  if (!ns) {
    return;
  }

  var PRESETS = {
    birthday: { name: "День рождения", needDate: true, badge: "Праздник" },
    vacation: { name: "Каникулы", needDate: true, badge: "Отдых" },
    newyear: { name: "Новый год", needDate: false, badge: "Зима" },
    custom: { name: "", needDate: true, badge: "Своё событие" }
  };

  var els = {
    badge: document.getElementById("event-badge"),
    title: document.getElementById("event-title"),
    date: document.getElementById("event-date"),
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    arrived: document.getElementById("arrived-message"),
    form: document.getElementById("event-form"),
    nameInput: document.getElementById("event-name-input"),
    dateInput: document.getElementById("event-date-input"),
    fact: document.getElementById("daily-fact"),
    quote: document.getElementById("daily-quote"),
    image: document.getElementById("daily-image"),
    imageCaption: document.getElementById("daily-image-caption"),
    formError: document.getElementById("form-error"),
    modal: document.getElementById("confirm-modal"),
    confirmText: document.getElementById("confirm-text"),
    confirmOk: document.getElementById("confirm-ok"),
    confirmCancel: document.getElementById("confirm-cancel")
  };

  var selectedPreset = "custom";
  var pendingEvent = null;
  var activeEvent = null;
  var tickId = null;

  function setPresetActive(presetId) {
    selectedPreset = presetId;
    var buttons = document.querySelectorAll(".preset");
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].classList.toggle("is-active", buttons[i].getAttribute("data-preset") === presetId);
    }

    var preset = PRESETS[presetId];
    if (presetId === "newyear") {
      els.nameInput.value = preset.name;
      els.dateInput.value = ns.timer.nextNewYearIso();
    } else if (presetId !== "custom") {
      els.nameInput.value = preset.name;
    } else if (!els.nameInput.value) {
      els.nameInput.value = "";
    }
  }

  function readFormEvent() {
    var name = els.nameInput.value.trim();
    var date = els.dateInput.value;
    var preset = PRESETS[selectedPreset];

    if (selectedPreset !== "custom" && !name) {
      name = preset.name;
    }

    return {
      preset: selectedPreset,
      name: name,
      date: date,
      badge: preset.badge
    };
  }

  function validate(eventData) {
    if (!eventData.name) {
      return "Введи название события.";
    }
    if (!eventData.date) {
      return "Выбери дату события.";
    }
    return "";
  }

  function renderDaily() {
    var daily = ns.content.forToday();
    els.fact.textContent = daily.fact;
    els.quote.textContent = "«" + daily.quote + "»";
    els.image.src = daily.picture.src;
    els.image.alt = daily.picture.caption;
    els.imageCaption.textContent = daily.picture.caption;
  }

  function paintCountdown(parts) {
    els.days.textContent = ns.timer.pad(parts.days);
    els.hours.textContent = ns.timer.pad(parts.hours);
    els.minutes.textContent = ns.timer.pad(parts.minutes);
    els.seconds.textContent = ns.timer.pad(parts.seconds);
    els.arrived.classList.toggle("hidden", !parts.arrived);
  }

  function tick() {
    if (!activeEvent) {
      return;
    }
    paintCountdown(ns.timer.remaining(activeEvent.date));
  }

  function applyEvent(eventData) {
    activeEvent = eventData;
    ns.storage.save(eventData);
    setPresetActive(eventData.preset);
    els.nameInput.value = eventData.name;
    els.dateInput.value = eventData.date;
    els.badge.textContent = eventData.badge;
    els.title.textContent = eventData.name;
    els.date.textContent = ns.timer.formatDate(eventData.date);

    if (tickId) {
      clearInterval(tickId);
    }
    tick();
    tickId = setInterval(tick, 1000);
  }

  function openModal(eventData) {
    pendingEvent = eventData;
    els.confirmText.textContent =
      "Запустить таймер для события «" +
      eventData.name +
      "» на дату " +
      ns.timer.formatDate(eventData.date) +
      "?";
    els.modal.classList.remove("hidden");
    els.confirmOk.focus();
  }

  function closeModal() {
    pendingEvent = null;
    els.modal.classList.add("hidden");
  }

  function showFormError(message) {
    if (!message) {
      els.formError.classList.add("hidden");
      els.formError.textContent = "";
      return;
    }
    els.formError.textContent = message;
    els.formError.classList.remove("hidden");
  }

  function requestApply() {
    var eventData = readFormEvent();
    var error = validate(eventData);
    if (error) {
      showFormError(error);
      return;
    }
    showFormError("");
    openModal(eventData);
  }

  var presetButtons = document.querySelectorAll(".preset");
  for (var i = 0; i < presetButtons.length; i += 1) {
    presetButtons[i].addEventListener("click", function () {
      var presetId = this.getAttribute("data-preset");
      setPresetActive(presetId);
      if (presetId === "newyear") {
        requestApply();
      }
    });
  }

  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    requestApply();
  });

  els.confirmOk.addEventListener("click", function () {
    if (pendingEvent) {
      applyEvent(pendingEvent);
    }
    closeModal();
  });

  els.confirmCancel.addEventListener("click", closeModal);
  els.modal.addEventListener("click", function (event) {
    if (event.target.getAttribute("data-close") === "true") {
      closeModal();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !els.modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  renderDaily();
  setPresetActive("newyear");

  var saved = ns.storage.load();
  if (saved && saved.name && saved.date) {
    applyEvent(saved);
  }
})(window);
