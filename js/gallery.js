// 1) Дані галереї
const images = [
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/14/16/43/rchids-4202820__480.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/14/16/43/rchids-4202820_1280.jpg",
    description: "Hokkaido Flower",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/14/22/05/container-4203677__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/14/22/05/container-4203677_1280.jpg",
    description: "Container Haulage Freight",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/16/09/47/beach-4206785__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/16/09/47/beach-4206785_1280.jpg",
    description: "Aerial Beach View",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2016/11/18/16/19/flowers-1835619__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2016/11/18/16/19/flowers-1835619_1280.jpg",
    description: "Flower Blooms",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2018/09/13/10/36/mountains-3674334__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2018/09/13/10/36/mountains-3674334_1280.jpg",
    description: "Alpine Mountains",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/16/23/04/landscape-4208571__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/16/23/04/landscape-4208571_1280.jpg",
    description: "Mountain Lake Sailing",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/17/09/27/the-alps-4209272__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/17/09/27/the-alps-4209272_1280.jpg",
    description: "Alpine Spring Meadows",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/16/21/10/landscape-4208255__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/16/21/10/landscape-4208255_1280.jpg",
    description: "Nature Landscape",
  },
  {
    preview:
      "https://cdn.pixabay.com/photo/2019/05/17/04/35/lighthouse-4208843__340.jpg",
    original:
      "https://cdn.pixabay.com/photo/2019/05/17/04/35/lighthouse-4208843_1280.jpg",
    description: "Lighthouse Coast Sea",
  },
];

// 2) Створюємо розмітку галереї (строго за шаблоном)
const gallery = document.querySelector(".gallery");
const markup = images
  .map(
    ({ preview, original, description }) => `
<li class="gallery-item">
  <a class="gallery-link" href="${original}">
    <img
      class="gallery-image"
      src="${preview}"
      data-source="${original}"
      alt="${description}"
    />
  </a>
</li>`
  )
  .join("");
gallery.insertAdjacentHTML("beforeend", markup);

// 3) Логіка basicLightbox
let instance = null;
let current = 0;

gallery.addEventListener("click", onGalleryClick);
document.addEventListener("keydown", onKeyNav);

function onGalleryClick(e) {
  e.preventDefault();
  const img = e.target.closest(".gallery-image");
  if (!img) return;

  current = [...gallery.querySelectorAll(".gallery-image")].indexOf(img);
  openLightbox(current);
}

function openLightbox(index) {
  const { original, description } = images[index];

  instance = basicLightbox.create(
    `
    <div class="lb-wrap">
      <div class="lb-counter">${index + 1}/${images.length}</div>
      <button class="lb-close" aria-label="Закрити">✕</button>

      <div class="lb-nav">
        <button class="lb-btn lb-prev" aria-label="Попереднє">‹</button>
        <button class="lb-btn lb-next" aria-label="Наступне">›</button>
      </div>

      <img class="lb-img" src="${original}" alt="${description}" />
    </div>
    `,
    {
      onShow: (inst) => {
        const root = inst.element();
        root.querySelector(".lb-close").addEventListener("click", () => inst.close());
        root.querySelector(".lb-prev").addEventListener("click", () => nav(-1));
        root.querySelector(".lb-next").addEventListener("click", () => nav(1));
      },
      onClose: () => { instance = null; }
    }
  );

  instance.show();
}


let isAnimating = false;

function nav(step) {
  if (!instance || isAnimating) return;

  const nextIndex = (current + step + images.length) % images.length;
  const nextSrc   = images[nextIndex].original;
  const nextAlt   = images[nextIndex].description;

  // 1) Прелоад наступного зображення, щоби не було «мигання»
  const pre = new Image();
  pre.onload = () => {
    animateSwap(step, nextIndex, nextSrc, nextAlt);
  };
  pre.src = nextSrc;
}

function animateSwap(step, nextIndex, nextSrc, nextAlt) {
  const root = instance.element();
  const imgEl = root.querySelector(".lb-img");
  const counterEl = root.querySelector(".lb-counter");

  isAnimating = true;

  // 2) Анімуємо вихід поточного
  const leaveClass = step > 0 ? "anim-leave-left" : "anim-leave-right";
  imgEl.classList.remove("anim-enter-right", "anim-enter-left",
                         "anim-leave-left", "anim-leave-right");
  // форсуємо reflow, щоб гарантовано стартувала нова анімація
  void imgEl.offsetWidth;
  imgEl.classList.add(leaveClass);

  imgEl.addEventListener("animationend", function onLeaveEnd() {
    imgEl.removeEventListener("animationend", onLeaveEnd);

    // 3) Підміняємо джерело і запускаємо в'їзд нового
    imgEl.src = nextSrc;
    imgEl.alt = nextAlt;

    const enterClass = step > 0 ? "anim-enter-right" : "anim-enter-left";
    imgEl.classList.remove("anim-leave-left", "anim-leave-right");
    void imgEl.offsetWidth;
    imgEl.classList.add(enterClass);

    imgEl.addEventListener("animationend", function onEnterEnd() {
      imgEl.removeEventListener("animationend", onEnterEnd);
      imgEl.classList.remove("anim-enter-right", "anim-enter-left");
      // 4) Оновлюємо індекс/лічильник і розблоковуємо навігацію
      current = nextIndex;
      counterEl.textContent = `${current + 1}/${images.length}`;
      isAnimating = false;
    }, { once: true });
  }, { once: true });
}

// Клавіатурна навігація лишається та ж
document.addEventListener("keydown", onKeyNav);
function onKeyNav(e) {
  if (!instance || isAnimating) return;
  if (e.key === "Escape") instance.close();
  if (e.key === "ArrowLeft") nav(-1);
  if (e.key === "ArrowRight") nav(1);
}
