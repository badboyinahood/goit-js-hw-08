// Данные
const images = [
    { preview:"https://cdn.pixabay.com/photo/2019/05/14/16/43/rchids-4202820__480.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/14/16/43/rchids-4202820_1280.jpg", description:"Hokkaido Flower" },
    { preview:"https://cdn.pixabay.com/photo/2019/05/14/22/05/container-4203677__340.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/14/22/05/container-4203677_1280.jpg", description:"Container Haulage Freight" },
    { preview:"https://cdn.pixabay.com/photo/2019/05/16/09/47/beach-4206785__340.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/16/09/47/beach-4206785_1280.jpg", description:"Aerial Beach View" },
    { preview:"https://cdn.pixabay.com/photo/2016/11/18/16/19/flowers-1835619__340.jpg",
      original:"https://cdn.pixabay.com/photo/2016/11/18/16/19/flowers-1835619_1280.jpg", description:"Flower Blooms" },
    { preview:"https://cdn.pixabay.com/photo/2018/09/13/10/36/mountains-3674334__340.jpg",
      original:"https://cdn.pixabay.com/photo/2018/09/13/10/36/mountains-3674334_1280.jpg", description:"Alpine Mountains" },
    { preview:"https://cdn.pixabay.com/photo/2019/05/16/23/04/landscape-4208571__340.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/16/23/04/landscape-4208571_1280.jpg", description:"Mountain Lake Sailing" },
    { preview:"https://cdn.pixabay.com/photo/2019/05/17/09/27/the-alps-4209272__340.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/17/09/27/the-alps-4209272_1280.jpg", description:"Alpine Spring Meadows" },
    { preview:"https://cdn.pixabay.com/photo/2019/05/16/21/10/landscape-4208255__340.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/16/21/10/landscape-4208255_1280.jpg", description:"Nature Landscape" },
    { preview:"https://cdn.pixabay.com/photo/2019/05/17/04/35/lighthouse-4208843__340.jpg",
      original:"https://cdn.pixabay.com/photo/2019/05/17/04/35/lighthouse-4208843_1280.jpg", description:"Lighthouse Coast Sea" },
  ];
  
  // 1) Разметка 3×3 (одной операцией)
  const gallery = document.querySelector(".gallery");
  gallery.insertAdjacentHTML(
    "beforeend",
    images.map(({preview, original, description}) => `
      <li class="gallery-item">
        <a class="gallery-link" href="${original}">
          <img class="gallery-image" src="${preview}" data-source="${original}" alt="${description}" />
        </a>
      </li>`
    ).join("")
  );
  
  // 2) Viewer
  const viewer        = document.getElementById("viewer");
  const viewerImg     = document.getElementById("viewerImg");
  const viewerPrev    = document.getElementById("viewerPrev");
  const viewerNext    = document.getElementById("viewerNext");
  const viewerClose   = document.getElementById("viewerClose");
  const viewerCounter = document.getElementById("viewerCounter");
  
  let current = 0;
  const total = images.length;
  
  // делегирование
  gallery.addEventListener("click", (e) => {
    e.preventDefault();
    const img = e.target.closest(".gallery-image");
    if (!img) return;
  
    const idx = [...gallery.querySelectorAll(".gallery-image")].indexOf(img);
    openViewer(idx);
  });
  
  viewerPrev.addEventListener("click", () => showRelative(-1));
  viewerNext.addEventListener("click", () => showRelative(1));
  viewerClose.addEventListener("click", closeViewer);
  
  document.addEventListener("keydown", (e) => {
    if (!viewer.classList.contains("open")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowLeft") showRelative(-1);
    if (e.key === "ArrowRight") showRelative(1);
  });
  
  // клик по фону — закрыть (клики по контролам/картинке игнорируются)
  viewer.addEventListener("click", (e) => {
    const controls = [viewerPrev, viewerNext, viewerClose, viewerImg];
    if (controls.some(el => el.contains(e.target))) return;
    closeViewer();
  });
  
  function openViewer(index) {
    current = index;
    updateCounter();
  
    // ставимо зображення в центр (без зсувів)
    setImage(images[current].original, images[current].description, "centered");
  
    // відкриваємо в'ювер (вмикає білий фон)
    viewer.classList.add("open");
    document.body.classList.add("viewer-lock");
  
    // перезапуск анімації проявлення
    viewerImg.classList.remove("fade-in");
    // форсуємо reflow, щоб анімація гарантовано перезапустилася
    void viewerImg.offsetWidth;
    viewerImg.classList.add("fade-in");
    viewerImg.addEventListener("animationend", () => {
      viewerImg.classList.remove("fade-in");
    }, { once: true });
  }
  
  
  function closeViewer() {
    // скидаємо можливі класи слайду/фейду, перезапускаємо fade-out «з нуля»
    viewerImg.classList.remove("fade-in", "enter-right", "enter-left", "leave-left", "leave-right");
    void viewerImg.offsetWidth; // reflow, щоб гарантувати старт анімації
  
    viewerImg.classList.add("fade-out");
    viewerImg.addEventListener(
      "animationend",
      () => {
        viewerImg.classList.remove("fade-out");
        viewer.classList.remove("open");          // прибираємо білий фон
        document.body.classList.remove("viewer-lock");
        viewerImg.className = "viewer__img centered"; // чистий стан для наступного відкриття
      },
      { once: true }
    );
  }
  
  
  function updateCounter() {
    viewerCounter.textContent = `${current + 1}/${total}`;
  }
  
  /**
   * Правильные направления:
   *  - step > 0 (правая кнопка): текущая уезжает ВЛЕВО, новая въезжает СПРАВА
   *  - step < 0 (левая кнопка):  текущая уезжает ВПРАВО, новая въезжает СЛЕВА
   */
  function showRelative(step) {
    const next = (current + step + total) % total;
    slideTo(next, step > 0 ? "right" : "left");
  }
  
  function slideTo(nextIndex, direction) {
    // фикс направления: тут было перепутано у некоторых — оставляй ровно так!
    const leaveClass = direction === "right" ? "leave-left" : "leave-right";
    const enterClass = direction === "right" ? "enter-right" : "enter-left";
  
    // старт уезда текущей
    viewerImg.className = `viewer__img ${leaveClass}`;
  
    viewerImg.addEventListener("transitionend", onLeaveEnd, { once: true });
  
    function onLeaveEnd() {
      current = nextIndex;
      updateCounter();
  
      // ставим новую картинку и начальную "сторону" въезда
      setImage(images[current].original, images[current].description, enterClass);
  
      // следующий кадр — едет в центр
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          viewerImg.className = "viewer__img centered";
        });
      });
    }
  }
  
  function setImage(src, alt, cls="centered") {
    viewerImg.src = src;
    viewerImg.alt = alt || "";
    viewerImg.className = `viewer__img ${cls}`;
  }
  