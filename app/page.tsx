"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SegmentType = "points" | "bonus" | "bankrupt" | "skip" | "prize" | "final";

type WheelSegment = {
  label: string;
  value: number;
  type: SegmentType;
  color: string;
  text: string;
};

type WordCard = {
  word: string;
  clue: string;
  category: string;
  level: number;
};

type Leader = {
  name: string;
  score: number;
  level: number;
};

type UpgradeId = "suit" | "microphone" | "spotlight" | "assistant" | "crown" | "carBadge";

type ShopItem = {
  id: UpgradeId;
  title: string;
  description: string;
  price: number;
  bonus: string;
};

type ChatMessage = {
  id: number;
  author: string;
  text: string;
  gift?: string;
};

type SaveState = {
  score: number;
  coins: number;
  level: number;
  round: number;
  leaders: Leader[];
  inventory: UpgradeId[];
  equipped: UpgradeId[];
  gifts: number;
};

const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");

const segments: WheelSegment[] = [
  { label: "900", value: 900, type: "points", color: "#f7c744", text: "#1c1438" },
  { label: "ПРИЗ", value: 1200, type: "prize", color: "#1d8dff", text: "#ffffff" },
  { label: "300", value: 300, type: "points", color: "#de2447", text: "#ffffff" },
  { label: "x2", value: 2, type: "bonus", color: "#35e0b6", text: "#071b21" },
  { label: "750", value: 750, type: "points", color: "#ff8c2a", text: "#1a1020" },
  { label: "БАНКРОТ", value: 0, type: "bankrupt", color: "#111827", text: "#ffffff" },
  { label: "500", value: 500, type: "points", color: "#ffe66d", text: "#1d1537" },
  { label: "ШОУ", value: 1500, type: "final", color: "#8b5cf6", text: "#ffffff" },
  { label: "450", value: 450, type: "points", color: "#ef4444", text: "#ffffff" },
  { label: "ХОД", value: 0, type: "skip", color: "#0ea5e9", text: "#ffffff" },
  { label: "1000", value: 1000, type: "points", color: "#facc15", text: "#1c1438" },
  { label: "БОНУС", value: 800, type: "bonus", color: "#22c55e", text: "#06170e" },
];

const words: WordCard[] = [
  { word: "СОФИТЫ", clue: "Они создают магию сцены", category: "Телевидение", level: 1 },
  { word: "АПЛОДИСМЕНТЫ", clue: "Лучший звук успешного раунда", category: "Шоу", level: 1 },
  { word: "КИНОКАМЕРА", clue: "Главный глаз студии", category: "Техника", level: 1 },
  { word: "ПРОЖЕКТОР", clue: "Луч света для героя вечера", category: "Сцена", level: 2 },
  { word: "СЦЕНАРИЙ", clue: "План красивого эфира", category: "Телевидение", level: 2 },
  { word: "КОНФЕТТИ", clue: "Праздничный финальный штрих", category: "Праздник", level: 2 },
  { word: "РЕЖИССЕР", clue: "Человек, который держит темп эфира", category: "Профессии", level: 3 },
  { word: "ТЕЛЕСТУДИЯ", clue: "Здесь рождается большое шоу", category: "Места", level: 3 },
  { word: "ИНТРИГА", clue: "То, что удерживает внимание зрителей", category: "Драматургия", level: 3 },
  { word: "СУПЕРФИНАЛ", clue: "Последнее испытание чемпиона", category: "Финал", level: 4 },
  { word: "ДЖЕКПОТ", clue: "Мечта каждого участника", category: "Призы", level: 4 },
  { word: "ЭФИР", clue: "Момент, когда все видят шоу", category: "Телевидение", level: 4 },
  { word: "СИНХРОФАЗОТРОН", clue: "Ускоритель частиц из большой науки", category: "Наука", level: 5 },
  { word: "ПАЛИМПСЕСТ", clue: "Рукопись, где новый текст написан поверх старого", category: "История", level: 5 },
  { word: "КВИНТЭССЕНЦИЯ", clue: "Самая суть явления", category: "Философия", level: 5 },
  { word: "МЕРЧАНДАЙЗИНГ", clue: "Искусство продавать через выкладку и витрину", category: "Бизнес", level: 5 },
  { word: "НЕЙРОПЛАСТИЧНОСТЬ", clue: "Способность мозга перестраивать связи", category: "Биология", level: 6 },
  { word: "ГИПЕРБОЛИЗАЦИЯ", clue: "Намеренное художественное преувеличение", category: "Литература", level: 6 },
  { word: "ИНТЕРФЕРОМЕТРИЯ", clue: "Метод точных измерений с помощью волн", category: "Физика", level: 6 },
  { word: "КРИПТОГРАФИЯ", clue: "Наука о защите информации", category: "Технологии", level: 6 },
  { word: "ЭЛЕКТРОКАРДИОГРАММА", clue: "График электрической активности сердца", category: "Медицина", level: 7 },
  { word: "ДИВЕРСИФИКАЦИЯ", clue: "Распределение рисков по разным направлениям", category: "Финансы", level: 7 },
  { word: "МЕТАМАТЕРИАЛ", clue: "Материал со свойствами, заданными структурой", category: "Инженерия", level: 7 },
  { word: "ПСИХОЛИНГВИСТИКА", clue: "Наука о речи, языке и мышлении", category: "Лингвистика", level: 7 },
  { word: "ТЕРМОДИНАМИКА", clue: "Наука о тепле, энергии и работе", category: "Физика", level: 7 },
  { word: "БИОЛЮМИНЕСЦЕНЦИЯ", clue: "Живое свечение в природе", category: "Биология", level: 8 },
  { word: "ИНСТИТУЦИОНАЛИЗАЦИЯ", clue: "Превращение практики в устойчивый общественный институт", category: "Социология", level: 8 },
  { word: "ДЕЗОКСИРИБОНУКЛЕИНОВАЯ", clue: "Первая часть названия молекулы наследственности", category: "Генетика", level: 8 },
  { word: "КВАНТОВАЯЗАПУТАННОСТЬ", clue: "Связь состояний частиц на расстоянии", category: "Квантовая физика", level: 8 },
  { word: "НЕЙРОМАРКЕТИНГ", clue: "Маркетинг, изучающий реакции мозга", category: "Бизнес", level: 8 },
  { word: "АНТИКОНСТИТУЦИОННОСТЬ", clue: "Противоречие основному закону государства", category: "Право", level: 9 },
  { word: "ТРАНСГРЕССИЯ", clue: "Выход за границы нормы или запрета", category: "Культура", level: 9 },
  { word: "ГИДРОАЭРОДИНАМИКА", clue: "Движение жидкостей и газов", category: "Инженерия", level: 9 },
  { word: "ПАРАДИГМАЛЬНОСТЬ", clue: "Принадлежность к образцу мышления эпохи", category: "Наука", level: 9 },
  { word: "ИНТЕРТЕКСТУАЛЬНОСТЬ", clue: "Связь одного текста с другими текстами", category: "Литература", level: 9 },
  { word: "ЭКЗИСТЕНЦИАЛИЗМ", clue: "Философия выбора, свободы и ответственности", category: "Философия", level: 10 },
  { word: "ДИФФЕРЕНЦИРОВАНИЕ", clue: "Операция нахождения производной", category: "Математика", level: 10 },
  { word: "ФАЛЬСИФИЦИРУЕМОСТЬ", clue: "Критерий научности гипотезы", category: "Методология", level: 10 },
  { word: "ЭЛЕКТРОЭНЦЕФАЛОГРАФИЯ", clue: "Регистрация электрической активности мозга", category: "Медицина", level: 10 },
  { word: "МУЛЬТИМОДАЛЬНОСТЬ", clue: "Работа сразу с несколькими типами данных", category: "Искусственный интеллект", level: 10 },
  { word: "ГЕОИНФОРМАЦИОННАЯ", clue: "Связанная с цифровыми картами и пространственными данными", category: "География", level: 10 },
  { word: "АКСЕЛЕРАЦИЯ", clue: "Ускоренное развитие проекта или команды", category: "Стартапы", level: 5 },
  { word: "КОНВЕРГЕНЦИЯ", clue: "Сближение разных систем или идей", category: "Наука", level: 5 },
  { word: "РЕТРОСПЕКТИВА", clue: "Взгляд назад для улучшения будущих действий", category: "Менеджмент", level: 5 },
  { word: "ДИСКРЕТИЗАЦИЯ", clue: "Переход от непрерывного к отдельным значениям", category: "Математика", level: 6 },
  { word: "ВИЗУАЛИЗАЦИЯ", clue: "Превращение данных в понятную картину", category: "Данные", level: 6 },
  { word: "АВТОМАТИЗАЦИЯ", clue: "Передача повторяемых задач системе", category: "Технологии", level: 6 },
  { word: "ОРКЕСТРАЦИЯ", clue: "Координация множества процессов", category: "Разработка", level: 6 },
  { word: "РЕКОМБИНАЦИЯ", clue: "Создание нового из частей старого", category: "Биология", level: 6 },
  { word: "ГИПЕРПАРАМЕТР", clue: "Настройка модели до начала обучения", category: "Искусственный интеллект", level: 7 },
  { word: "КЛАСТЕРИЗАЦИЯ", clue: "Группировка похожих объектов", category: "Аналитика", level: 7 },
  { word: "СЕНТИМЕНТАЛЬНОСТЬ", clue: "Повышенная эмоциональная чувствительность", category: "Психология", level: 7 },
  { word: "ДЕЦЕНТРАЛИЗАЦИЯ", clue: "Распределение власти или управления", category: "Экономика", level: 7 },
  { word: "ИНКАПСУЛЯЦИЯ", clue: "Сокрытие внутренней реализации", category: "Программирование", level: 7 },
  { word: "РЕФАКТОРИНГ", clue: "Улучшение кода без изменения поведения", category: "Программирование", level: 7 },
  { word: "ПРОТОКОЛИРОВАНИЕ", clue: "Фиксация событий и действий", category: "Системы", level: 7 },
  { word: "ИНТЕРНАЦИОНАЛИЗАЦИЯ", clue: "Подготовка продукта к разным языкам и регионам", category: "Продукт", level: 8 },
  { word: "КОНТЕКСТУАЛИЗАЦИЯ", clue: "Помещение факта в нужные обстоятельства", category: "Коммуникации", level: 8 },
  { word: "МИКРОАРХИТЕКТУРА", clue: "Внутренняя организация вычислительного ядра", category: "Компьютеры", level: 8 },
  { word: "ПОЛИМОРФИЗМ", clue: "Разные формы одного интерфейса", category: "Программирование", level: 8 },
  { word: "АНТРОПОМОРФИЗАЦИЯ", clue: "Наделение нечеловеческого человеческими чертами", category: "Культура", level: 8 },
  { word: "ЭПИСТЕМОЛОГИЯ", clue: "Философия знания", category: "Философия", level: 8 },
  { word: "ГЕРМЕНЕВТИКА", clue: "Искусство и теория толкования текстов", category: "Философия", level: 8 },
  { word: "КОНФИГУРИРОВАНИЕ", clue: "Настройка системы под задачу", category: "Технологии", level: 8 },
  { word: "СУБСТАНЦИАЛЬНОСТЬ", clue: "Наличие самостоятельной сущности", category: "Философия", level: 9 },
  { word: "НЕЙРОИНТЕРФЕЙС", clue: "Связь мозга и цифровой системы", category: "Будущее", level: 9 },
  { word: "ТЕХНОСИНГУЛЯРНОСТЬ", clue: "Гипотетический скачок развития ИИ", category: "Футурология", level: 9 },
  { word: "МАКРОЭКОНОМИКА", clue: "Экономика на уровне страны и мира", category: "Экономика", level: 9 },
  { word: "ПРОКРАСТИНАЦИЯ", clue: "Откладывание важных дел", category: "Психология", level: 9 },
  { word: "КОНТРФАКТИЧНОСТЬ", clue: "Рассуждение о том, чего не произошло", category: "Логика", level: 9 },
  { word: "ИНТЕРПРЕТИРУЕМОСТЬ", clue: "Понятность решения модели или системы", category: "Искусственный интеллект", level: 9 },
  { word: "ПЕРСОНАЛИЗАЦИЯ", clue: "Настройка опыта под конкретного пользователя", category: "Продукт", level: 9 },
  { word: "ЭКСПЕРИМЕНТИРОВАНИЕ", clue: "Проверка гипотез через опыт", category: "Наука", level: 10 },
  { word: "КВАЗИЭКСПЕРИМЕНТ", clue: "Исследование без полного случайного распределения", category: "Методология", level: 10 },
  { word: "ДОСТОПРИМЕЧАТЕЛЬНОСТЬ", clue: "Место или объект, ради которого едут смотреть", category: "Путешествия", level: 10 },
  { word: "ИНФРАСТРУКТУРОУСТОЙЧИВОСТЬ", clue: "Способность систем выдерживать сбои", category: "Инженерия", level: 10 },
  { word: "ПРОИЗВОДИТЕЛЬНОСТЬ", clue: "Скорость и эффективность работы системы", category: "Технологии", level: 10 },
  { word: "КИБЕРБЕЗОПАСНОСТЬ", clue: "Защита цифровых систем от угроз", category: "Безопасность", level: 10 },
  { word: "ПСЕВДОСЛУЧАЙНОСТЬ", clue: "Случайность, созданная алгоритмом", category: "Математика", level: 10 },
  { word: "ТЕЛЕКОММУНИКАЦИЯ", clue: "Передача информации на расстоянии", category: "Связь", level: 10 },
  { word: "ТРАНСФОРМАТОРНАЯАРХИТЕКТУРА", clue: "Основа многих современных языковых моделей", category: "Искусственный интеллект", level: 10 },
  { word: "ВЫСОКОПРОИЗВОДИТЕЛЬНЫЙ", clue: "Способный быстро обрабатывать большие нагрузки", category: "Технологии", level: 10 },
];

const shopItems: ShopItem[] = [
  { id: "suit", title: "Бархатный смокинг", description: "Персонаж выглядит дороже, доверие аудитории растет.", price: 2600, bonus: "+5% к призовым" },
  { id: "microphone", title: "Золотой микрофон", description: "Каждый правильный ответ звучит как главный момент вечера.", price: 4200, bonus: "+10% к очкам" },
  { id: "spotlight", title: "Личный прожектор", description: "Открытые буквы сияют ярче и дают монеты быстрее.", price: 5800, bonus: "+15% монет" },
  { id: "assistant", title: "Ассистент зала", description: "После победы добавляет премию за сложные слова.", price: 7600, bonus: "+сложность" },
  { id: "crown", title: "Корона чемпиона", description: "Финал превращается в премиальный режим.", price: 9800, bonus: "x1.25 финал" },
  { id: "carBadge", title: "Значок авто", description: "Призовые секторы выглядят еще эффектнее.", price: 12500, bonus: "+авто-статус" },
];

const initialChat: ChatMessage[] = [
  { id: 1, author: "МИРА", text: "Вот это студия. Крути на приз!" },
  { id: 2, author: "ЛЕВ", text: "Сложные слова дают больше хайпа." },
  { id: 3, author: "НИКА", text: "Жду финал и автомобиль.", gift: "Золотой свет" },
];

const defaultLeaders: Leader[] = [
  { name: "МИРА", score: 18400, level: 6 },
  { name: "ЛЕВ", score: 16100, level: 5 },
  { name: "НИКА", score: 13950, level: 4 },
  { name: "АРТ", score: 11100, level: 4 },
];

const storageKey = "grand-wheel-show-progress";

function pickWord(level: number, previous?: string) {
  const pool = words.filter((item) => item.level <= Math.max(1, Math.min(level, 10)));
  const available = pool.filter((item) => item.word !== previous);
  return available[Math.floor(Math.random() * available.length)] || pool[0];
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const angleInRadians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(50, 50, 48, endAngle);
  const end = polarToCartesian(50, 50, 48, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M 50 50 L ${start.x} ${start.y} A 48 48 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function normalizeLetter(value: string) {
  return value.toUpperCase().replace("Ё", "Е").replace(/[^А-Я]/g, "").slice(0, 1);
}

function createTone(frequency: number, duration = 0.12, type: OscillatorType = "sine") {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.065, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
}

function shoutAutomobile() {
  if (typeof window === "undefined") {
    return;
  }

  createTone(392, 0.1, "triangle");
  window.setTimeout(() => createTone(523, 0.12, "triangle"), 80);
  window.setTimeout(() => createTone(784, 0.18, "square"), 170);

  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance("Автомобиль!");
  utterance.lang = "ru-RU";
  utterance.pitch = 1.25;
  utterance.rate = 0.92;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function useLocalProgress() {
  const [save, setSave] = useState<SaveState>({
    score: 0,
    coins: 0,
    level: 1,
    round: 1,
    leaders: defaultLeaders,
    inventory: [],
    equipped: [],
    gifts: 0,
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SaveState;
      setSave({
        score: Number(parsed.score) || 0,
        coins: Number(parsed.coins) || 0,
        level: Number(parsed.level) || 1,
        round: Number(parsed.round) || 1,
        leaders: Array.isArray(parsed.leaders) ? parsed.leaders : defaultLeaders,
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
        equipped: Array.isArray(parsed.equipped) ? parsed.equipped : [],
        gifts: Number(parsed.gifts) || 0,
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(save));
  }, [save]);

  return [save, setSave] as const;
}

function WordBoard({
  word,
  guessed,
  isFinal,
}: {
  word: string;
  guessed: string[];
  isFinal: boolean;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(2.15rem,1fr))] gap-2 sm:gap-3">
      {word.split("").map((letter, index) => {
        const revealed = guessed.includes(letter) || isFinal;
        return (
          <motion.div
            key={`${letter}-${index}`}
            initial={false}
            animate={revealed ? { rotateX: [105, -14, 0], rotateY: [8, -4, 0], scale: [0.78, 1.12, 1] } : { rotateX: 0 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: revealed ? index * 0.025 : 0 }}
            className={`relative grid aspect-[0.82] min-h-14 place-items-center overflow-hidden rounded-md border text-2xl font-black sm:text-4xl ${
              revealed
                ? "border-amber-200/80 bg-gradient-to-br from-amber-200 via-white to-cyan-100 text-slate-950 shadow-[0_0_32px_rgba(250,204,21,0.38)]"
                : "border-cyan-200/26 bg-slate-950/82 text-transparent shadow-inner"
            }`}
          >
            <span className="absolute inset-x-2 top-1 h-px bg-white/70" />
            {revealed ? (
              <>
                <motion.span
                  initial={{ x: "-140%", opacity: 0 }}
                  animate={{ x: "140%", opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.75, delay: index * 0.025 }}
                  className="absolute inset-y-0 w-1/2 rotate-12 bg-white/70 blur-sm"
                />
                <motion.span
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.35, 1.8] }}
                  transition={{ duration: 0.7, delay: index * 0.025 }}
                  className="absolute h-10 w-10 rounded-full border border-amber-300/70"
                />
              </>
            ) : null}
            <motion.span
              animate={revealed ? { textShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 18px rgba(250,204,21,.65)", "0 0 0 rgba(0,0,0,0)"] } : {}}
              transition={{ duration: 0.9, delay: index * 0.025 }}
              className="relative z-10"
            >
              {revealed ? letter : "?"}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}

function Confetti({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.45,
        rotate: Math.random() * 520,
        color: ["#facc15", "#38bdf8", "#ef4444", "#22c55e", "#ffffff"][index % 5],
      })),
    [],
  );

  return (
    <AnimatePresence>
      {active ? (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.span
              key={piece.id}
              initial={{ y: -40, x: 0, rotate: 0, opacity: 1 }}
              animate={{ y: "108vh", x: Math.sin(piece.id) * 120, rotate: piece.rotate, opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, delay: piece.delay, ease: "easeOut" }}
              className="absolute h-3 w-2 rounded-sm"
              style={{ left: `${piece.left}%`, backgroundColor: piece.color }}
            />
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function PrizeReveal({ active, onClose }: { active: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-black/38 p-4 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ y: 80, scale: 0.86, rotateX: 12 }}
            animate={{ y: 0, scale: 1, rotateX: 0 }}
            exit={{ y: 60, scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
            className="pointer-events-auto relative w-full max-w-3xl overflow-hidden rounded-md border border-amber-100/50 bg-gradient-to-br from-slate-950/94 via-blue-950/92 to-red-950/88 p-5 shadow-[0_0_110px_rgba(250,204,21,.34)] sm:p-7"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-20 rounded border border-white/18 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur transition hover:bg-white/18"
            >
              Закрыть
            </button>
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-1/2 top-0 h-full w-32 -translate-x-1/2 bg-amber-200/20 blur-3xl" />
              <div className="absolute -left-20 top-1/3 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -right-20 top-1/3 h-48 w-48 rounded-full bg-red-400/20 blur-3xl" />
            </div>
            <div className="relative">
              <div className="text-center text-[10px] font-black uppercase tracking-[0.34em] text-cyan-100/70">Суперприз студии</div>
              <motion.div
                initial={{ letterSpacing: "0.08em" }}
                animate={{ scale: [1, 1.08, 1], textShadow: ["0 0 12px rgba(250,204,21,.55)", "0 0 34px rgba(250,204,21,.95)", "0 0 12px rgba(250,204,21,.55)"] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="mt-3 text-center text-[clamp(2.4rem,9vw,6rem)] font-black uppercase leading-none text-amber-200"
              >
                Автомобиль!
              </motion.div>
              <div className="mx-auto mt-6 max-w-2xl">
                <svg viewBox="0 0 760 290" className="h-auto w-full drop-shadow-[0_0_34px_rgba(56,189,248,.45)]" role="img" aria-label="Неоновый автомобиль-приз">
                  <defs>
                    <linearGradient id="carPaint" x1="0" x2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="45%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="glass" x1="0" x2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.72" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0.4 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    d="M98 182 C138 125 196 101 288 99 L388 56 C427 40 488 47 526 84 L602 154 C665 163 703 183 721 215 L705 238 L72 238 L56 220 C60 201 73 190 98 182 Z"
                    fill="url(#carPaint)"
                    stroke="#fef3c7"
                    strokeWidth="5"
                  />
                  <path d="M296 107 L391 69 C423 58 465 62 494 91 L537 137 L257 137 Z" fill="url(#glass)" stroke="#e0f2fe" strokeWidth="5" />
                  <path d="M252 146 L635 146" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
                  <path d="M122 195 C180 178 241 171 310 174" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                  <path d="M548 177 C602 178 647 188 683 209" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                  <circle cx="196" cy="235" r="44" fill="#020617" stroke="#e0f2fe" strokeWidth="8" />
                  <circle cx="196" cy="235" r="20" fill="#facc15" />
                  <circle cx="596" cy="235" r="44" fill="#020617" stroke="#e0f2fe" strokeWidth="8" />
                  <circle cx="596" cy="235" r="20" fill="#facc15" />
                  <motion.path
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 0.55, repeat: Infinity }}
                    d="M704 202 L752 187 M704 219 L760 222 M93 204 L30 185 M82 224 L8 230"
                    stroke="#fde68a"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="mt-5 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/72">
                Леон Гранд объявляет главный приз раунда
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Wheel({
  rotation,
  spinning,
  onSpin,
}: {
  rotation: number;
  spinning: boolean;
  onSpin: () => void;
}) {
  const slice = 360 / segments.length;

  return (
    <div className="relative mx-auto grid w-full max-w-[520px] place-items-center">
      <div className="absolute -top-2 z-20 h-14 w-12 drop-shadow-[0_0_18px_rgba(250,204,21,0.9)]">
        <div className="mx-auto h-0 w-0 border-x-[18px] border-t-[44px] border-x-transparent border-t-amber-300" />
      </div>
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 40, damping: spinning ? 16 : 24, mass: 1.2 }}
        className="relative aspect-square w-full rounded-full border-[10px] border-amber-200/80 bg-black shadow-[0_0_80px_rgba(250,204,21,0.32),inset_0_0_30px_rgba(255,255,255,0.28)]"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full rounded-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {segments.map((segment, index) => {
            const start = index * slice;
            const end = start + slice;
            const labelAngle = start + slice / 2;
            return (
              <g key={segment.label + index}>
                <path d={describeArc(start, end)} fill={segment.color} stroke="rgba(255,255,255,.45)" strokeWidth="0.35" />
                <text
                  x="50"
                  y="16"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={segment.text}
                  fontSize={segment.label.length > 4 ? "3.2" : "4.8"}
                  fontWeight="900"
                  transform={`rotate(${labelAngle} 50 50)`}
                  filter="url(#glow)"
                >
                  {segment.label}
                </text>
              </g>
            );
          })}
          <circle cx="50" cy="50" r="20" fill="rgba(15,23,42,.82)" stroke="rgba(255,255,255,.62)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="10" fill="#facc15" stroke="#fff7ad" strokeWidth="1" />
        </svg>
      </motion.div>
      <motion.button
        type="button"
        onClick={onSpin}
        disabled={spinning}
        whileHover={{ scale: spinning ? 1 : 1.04 }}
        whileTap={{ scale: spinning ? 1 : 0.97 }}
        className="absolute grid size-28 place-items-center rounded-full border border-white/70 bg-slate-950/76 text-center text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_0_34px_rgba(59,130,246,0.42)] backdrop-blur-xl transition disabled:cursor-wait disabled:opacity-70 sm:size-32"
      >
        {spinning ? "Эфир" : "Крутить"}
      </motion.button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/12 bg-white/[0.075] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function HostPanel({ callout }: { callout: string }) {
  const isShouting = callout.includes("Автомобиль");

  return (
    <div className="relative overflow-hidden rounded-md border border-amber-100/28 bg-gradient-to-br from-white/[0.13] via-cyan-300/[0.08] to-red-500/[0.1] p-4 shadow-[0_22px_80px_rgba(0,0,0,.38)] backdrop-blur-2xl sm:p-5">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-200/20 blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/70 to-transparent" />
      <div className="relative grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
        <motion.div
          animate={isShouting ? { y: [0, -7, 0], scale: [1, 1.055, 1], rotate: [-1, 1.5, 0] } : { y: [0, -2, 0], scale: [1, 1.01, 1] }}
          transition={{ duration: isShouting ? 0.72 : 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto h-48 w-full max-w-[190px] overflow-hidden rounded-md border border-white/18 bg-slate-950 shadow-[0_0_40px_rgba(37,99,235,.25)] sm:h-52"
        >
          <motion.img
            src="/leon-grand-host.png"
            alt="Фотореалистичный ведущий Леон Гранд"
            animate={isShouting ? { scale: [1.08, 1.16, 1.1], x: [0, -4, 3, 0] } : { scale: 1.08 }}
            transition={{ duration: isShouting ? 0.62 : 0.4, repeat: isShouting ? Infinity : 0, ease: "easeInOut" }}
            className="h-full w-full object-cover object-[50%_24%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-white/8" />
          <motion.div
            animate={isShouting ? { opacity: [0.2, 0.82, 0.2] } : { opacity: [0.18, 0.36, 0.18] }}
            transition={{ duration: isShouting ? 0.42 : 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 border-2 border-amber-200/50 shadow-[inset_0_0_42px_rgba(250,204,21,.28)]"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-red-200/40 bg-red-600/72 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,.9)]" />
            Live
          </div>
          {isShouting ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
              className="absolute right-5 top-16 h-16 w-16 rounded-full border border-amber-100/70"
            />
          ) : null}
        </motion.div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.24em] text-amber-100/70">Ведущий Леон Гранд</div>
          <div className="mt-2 text-sm leading-6 text-white/68">
            Живой ведущий студии реагирует на колесо, финал и призовые секторы.
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={callout}
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: isShouting ? [1, 1.1, 1] : 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.34 }}
              className={`mt-2 font-black uppercase leading-none ${
                isShouting
                  ? "text-[clamp(2.1rem,7vw,3.4rem)] text-amber-200 drop-shadow-[0_0_18px_rgba(250,204,21,.8)]"
                  : "text-2xl text-white"
              }`}
            >
              {callout}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CharacterPanel({
  equipped,
  gifts,
  coins,
}: {
  equipped: UpgradeId[];
  gifts: number;
  coins: number;
}) {
  const prestige = 1 + equipped.length * 12 + gifts * 3;

  return (
    <div className="rounded-md border border-white/14 bg-white/[0.075] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Персонаж игрока</div>
          <div className="mt-1 text-sm text-white/70">Престиж {prestige} • монеты {coins.toLocaleString("ru-RU")}</div>
        </div>
        <motion.div
          animate={{ rotate: equipped.includes("crown") ? [0, 8, -8, 0] : 0 }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="grid size-14 place-items-center rounded-full border border-amber-200/50 bg-slate-950/70 text-2xl shadow-[0_0_24px_rgba(250,204,21,.22)]"
        >
          {equipped.includes("crown") ? "♛" : "★"}
        </motion.div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["suit", "microphone", "spotlight", "assistant", "crown", "carBadge"] as UpgradeId[]).map((id) => (
          <div
            key={id}
            className={`rounded border px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] ${
              equipped.includes(id) ? "border-amber-200/70 bg-amber-200/18 text-amber-100" : "border-white/10 bg-black/24 text-white/34"
            }`}
          >
            {id === "suit" ? "Смокинг" : id === "microphone" ? "Микро" : id === "spotlight" ? "Свет" : id === "assistant" ? "Зал" : id === "crown" ? "Корона" : "Авто"}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopPanel({
  coins,
  inventory,
  equipped,
  onBuy,
  onToggle,
}: {
  coins: number;
  inventory: UpgradeId[];
  equipped: UpgradeId[];
  onBuy: (item: ShopItem) => void;
  onToggle: (id: UpgradeId) => void;
}) {
  return (
    <div className="rounded-md border border-white/14 bg-white/[0.075] p-5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Магазин апгрейдов</div>
          <div className="mt-1 text-sm text-white/70">Покупайте стиль, бонусы и статус.</div>
        </div>
        <div className="text-right text-lg font-black text-amber-200">{coins.toLocaleString("ru-RU")}</div>
      </div>
      <div className="grid gap-2">
        {shopItems.map((item) => {
          const owned = inventory.includes(item.id);
          const active = equipped.includes(item.id);

          return (
            <div key={item.id} className="rounded border border-white/10 bg-black/24 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-white/56">{item.description}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100/70">{item.bonus}</div>
                </div>
                <button
                  type="button"
                  onClick={() => (owned ? onToggle(item.id) : onBuy(item))}
                  className={`shrink-0 rounded border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                    owned
                      ? active
                        ? "border-amber-200 bg-amber-200 text-slate-950"
                        : "border-white/18 bg-white/10 text-white"
                      : "border-cyan-200/40 bg-cyan-300/12 text-cyan-50 hover:bg-cyan-300/22"
                  }`}
                >
                  {owned ? (active ? "Вкл" : "Надеть") : item.price.toLocaleString("ru-RU")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  value,
  onChange,
  onSend,
  onGift,
}: {
  messages: ChatMessage[];
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onGift: (gift: string) => void;
}) {
  return (
    <div className="rounded-md border border-white/14 bg-white/[0.075] p-5 backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Live чат и подарки</div>
        <div className="rounded-full border border-emerald-200/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">online</div>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.slice(-8).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="rounded border border-white/10 bg-black/26 px-3 py-2"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">{message.author}</div>
              <div className="mt-1 text-sm leading-5 text-white/76">{message.text}</div>
              {message.gift ? <div className="mt-1 text-xs font-bold text-cyan-100">Подарок: {message.gift}</div> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          aria-label="Сообщение в чат"
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, 90))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend();
            }
          }}
          className="min-w-0 flex-1 rounded border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-amber-200"
          placeholder="Написать в чат"
        />
        <button type="button" onClick={onSend} className="rounded border border-amber-200/50 bg-amber-200/18 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-amber-50">
          Send
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Роза", "Кристалл", "Суперлайк"].map((gift) => (
          <button
            key={gift}
            type="button"
            onClick={() => onGift(gift)}
            className="rounded border border-white/12 bg-white/[0.06] px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/76 transition hover:border-cyan-200/60 hover:bg-cyan-300/14"
          >
            {gift}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [save, setSave] = useLocalProgress();
  const [card, setCard] = useState(() => pickWord(1));
  const [guessed, setGuessed] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<WheelSegment>(segments[0]);
  const [message, setMessage] = useState("Крутите колесо и называйте буквы.");
  const [timeLeft, setTimeLeft] = useState(90);
  const [combo, setCombo] = useState(1);
  const [finalMode, setFinalMode] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [playerName, setPlayerName] = useState("ИГРОК");
  const [hostCallout, setHostCallout] = useState("Добрый вечер, студия!");
  const [prizeReveal, setPrizeReveal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChat);
  const [chatInput, setChatInput] = useState("");
  const spinFrame = useRef<number>();
  const solvedAwardedRef = useRef("");

  const scoreBoost = 1 + (save.equipped.includes("suit") ? 0.05 : 0) + (save.equipped.includes("microphone") ? 0.1 : 0);
  const coinBoost = 1 + (save.equipped.includes("spotlight") ? 0.15 : 0);
  const finalMultiplier = finalMode && save.equipped.includes("crown") ? 2.5 : finalMode ? 2 : 1;

  const triggerAutomobileMoment = useCallback(() => {
    setHostCallout("Автомобиль!");
    setPrizeReveal(true);
    shoutAutomobile();
    window.setTimeout(() => setPrizeReveal(false), 5200);
  }, []);

  const uniqueLetters = useMemo(() => Array.from(new Set(card.word.split(""))), [card.word]);
  const solved = uniqueLetters.every((letter) => guessed.includes(letter));
  const progress = Math.round((guessed.filter((letter) => uniqueLetters.includes(letter)).length / uniqueLetters.length) * 100);

  const leaders = useMemo(
    () =>
      [...save.leaders, { name: playerName || "ИГРОК", score: save.score, level: save.level }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [playerName, save.leaders, save.level, save.score],
  );

  useEffect(() => {
    setCard(pickWord(save.level));
  }, [save.level]);

  useEffect(() => {
    if (solved && solvedAwardedRef.current !== card.word) {
      solvedAwardedRef.current = card.word;
      const solveBonus = Math.round((card.level * 850 + timeLeft * 18) * coinBoost);
      setConfetti(true);
      createTone(740, 0.16, "triangle");
      window.setTimeout(() => createTone(980, 0.2, "triangle"), 120);
      setSave((current) => ({ ...current, coins: current.coins + solveBonus }));
      setMessage(finalMode ? `Финал взят. Чемпионский свет ваш! +${solveBonus.toLocaleString("ru-RU")} монет.` : `Слово открыто. Публика в восторге! +${solveBonus.toLocaleString("ru-RU")} монет.`);
      setHostCallout(finalMode ? "Чемпион эфира!" : "Браво!");
      const id = window.setTimeout(() => setConfetti(false), 2700);
      return () => window.clearTimeout(id);
    }
  }, [card.level, coinBoost, finalMode, setSave, solved, timeLeft]);

  useEffect(() => {
    if (solved) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setMessage("Время раунда истекло. Новое слово уже на табло.");
          setHostCallout("Новый шанс!");
          solvedAwardedRef.current = "";
          setGuessed([]);
          setCombo(1);
          setCard((currentCard) => pickWord(save.level, currentCard.word));
          return finalMode ? 60 : 90;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finalMode, save.level, solved]);

  const resetRound = useCallback(
    (advanceLevel = false) => {
      setSave((current) => {
        const nextLevel = advanceLevel ? current.level + 1 : current.level;
        return {
          ...current,
          level: nextLevel,
          round: current.round + 1,
          leaders: leaders,
        };
      });
      setCard((currentCard) => pickWord(advanceLevel ? save.level + 1 : save.level, currentCard.word));
      solvedAwardedRef.current = "";
      setGuessed([]);
      setInput("");
      setCombo(1);
      setTimeLeft(finalMode ? 60 : 90);
      setFinalMode(false);
      setMessage("Новый раунд в эфире. Колесо готово.");
      setHostCallout("Крутите барабан!");
    },
    [finalMode, leaders, save.level, setSave],
  );

  const spinWheel = useCallback(() => {
    if (spinning || solved) {
      return;
    }

    createTone(230, 0.09, "sawtooth");
    setSpinning(true);
    setMessage("Колесо набирает ход...");
    setHostCallout("Поехали!");

    const duration = 3300 + Math.random() * 1500;
    const velocity = 980 + Math.random() * 900;
    const start = performance.now();
    const initial = rotation;

    const animate = (time: number) => {
      const elapsed = time - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const nextRotation = initial + velocity * ease + 1440 * ease;
      setRotation(nextRotation);

      if (t < 1) {
        spinFrame.current = requestAnimationFrame(animate);
        return;
      }

      const normalized = ((nextRotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalized) % 360;
      const segmentIndex = Math.floor(pointerAngle / (360 / segments.length)) % segments.length;
      const segment = segments[segmentIndex];

      setCurrentSegment(segment);
      setSpinning(false);
      createTone(segment.type === "bankrupt" ? 110 : 540, 0.16, segment.type === "bankrupt" ? "square" : "triangle");

      if (segment.type === "bankrupt") {
        setSave((current) => ({ ...current, score: 0 }));
        setCombo(1);
        setMessage("Банкрот. Счет обнулен, но шоу продолжается.");
        setHostCallout("Вот это поворот!");
      } else if (segment.type === "skip") {
        setCombo(1);
        setMessage("Пропуск хода. Следующее вращение может все изменить.");
        setHostCallout("Пауза в эфире!");
      } else if (segment.type === "final") {
        setFinalMode(true);
        setTimeLeft(60);
        setMessage("Открыт режим Финал: больше риск, выше награда.");
        setHostCallout("Финал!");
      } else if (segment.type === "prize") {
        setMessage("Сектор ПРИЗ. Ведущий уже набрал воздуха.");
        triggerAutomobileMoment();
      } else {
        setMessage(`Сектор ${segment.label}. Введите букву на табло.`);
        setHostCallout(`Сектор ${segment.label}!`);
      }
    };

    spinFrame.current = requestAnimationFrame(animate);
  }, [rotation, setSave, solved, spinning]);

  useEffect(() => {
    return () => {
      if (spinFrame.current) {
        cancelAnimationFrame(spinFrame.current);
      }
    };
  }, []);

  const guessLetter = useCallback(
    (rawLetter: string) => {
      const letter = normalizeLetter(rawLetter);

      if (!letter || solved) {
        return;
      }

      if (guessed.includes(letter)) {
        setMessage("Эта буква уже открывалась.");
        setHostCallout("Уже было!");
        return;
      }

      setGuessed((current) => [...current, letter]);
      setInput("");

      const matches = card.word.split("").filter((item) => item === letter).length;
      if (matches > 0) {
        const base = currentSegment.type === "bonus" ? currentSegment.value * 700 : currentSegment.value;
        const prizeBoost = currentSegment.type === "prize" ? 1600 : 0;
        const assistantBoost = save.equipped.includes("assistant") ? card.level * 120 : 0;
        const gained = Math.round((Math.max(200, base + prizeBoost) * matches * combo + assistantBoost) * finalMultiplier * scoreBoost);
        const earnedCoins = Math.max(40, Math.round((gained / 14) * coinBoost));
        setSave((current) => ({ ...current, score: current.score + gained, coins: current.coins + earnedCoins }));
        setCombo((current) => Math.min(current + 1, 5));
        setMessage(`Есть буква ${letter}: +${gained.toLocaleString("ru-RU")} очков и +${earnedCoins.toLocaleString("ru-RU")} монет.`);
        if (currentSegment.type === "prize") {
          triggerAutomobileMoment();
        } else {
          setHostCallout(`Есть ${letter}!`);
        }
        createTone(660 + matches * 80, 0.12, "triangle");
      } else {
        setCombo(1);
        setMessage(`Буквы ${letter} нет. Зал затаил дыхание.`);
        setHostCallout("Нет такой!");
        createTone(150, 0.12, "sine");
      }
    },
    [card.level, card.word, coinBoost, combo, currentSegment, finalMultiplier, guessed, save.equipped, scoreBoost, setSave, solved, triggerAutomobileMoment],
  );

  const buyItem = useCallback(
    (item: ShopItem) => {
      if (save.inventory.includes(item.id)) {
        return;
      }

      if (save.coins < item.price) {
        setMessage(`Не хватает монет для "${item.title}". Чат может помочь подарками.`);
        setHostCallout("Нужны подарки!");
        createTone(140, 0.12, "sine");
        return;
      }

      setSave((current) => ({
        ...current,
        coins: current.coins - item.price,
        inventory: [...current.inventory, item.id],
        equipped: [...current.equipped, item.id],
      }));
      setMessage(`Куплено: ${item.title}. Персонаж стал дороже.`);
      setHostCallout("Апгрейд!");
      createTone(720, 0.14, "triangle");
    },
    [save.coins, save.inventory, setSave],
  );

  const toggleItem = useCallback(
    (id: UpgradeId) => {
      setSave((current) => ({
        ...current,
        equipped: current.equipped.includes(id) ? current.equipped.filter((item) => item !== id) : [...current.equipped, id],
      }));
    },
    [setSave],
  );

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) {
      return;
    }

    setChatMessages((current) => [...current, { id: Date.now(), author: playerName || "ИГРОК", text }]);
    setChatInput("");
    setMessage("Сообщение ушло в live-чат. Аудитория реагирует.");
  }, [chatInput, playerName]);

  const sendGift = useCallback(
    (gift: string) => {
      const giftValue = gift === "Суперлайк" ? 900 : gift === "Кристалл" ? 520 : 260;
      const donor = ["МИРА", "ЛЕВ", "НИКА", "АРТ"][Math.floor(Math.random() * 4)];
      setChatMessages((current) => [
        ...current,
        { id: Date.now(), author: donor, text: "Держи подарок в эфире!", gift },
      ]);
      setSave((current) => ({ ...current, coins: current.coins + giftValue, gifts: current.gifts + 1 }));
      setHostCallout("Подарок!");
      setMessage(`Чат отправил "${gift}": +${giftValue.toLocaleString("ru-RU")} монет.`);
      createTone(610, 0.12, "triangle");
    },
    [setSave],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const letter = normalizeLetter(event.key);
      if (letter) {
        guessLetter(letter);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [guessLetter]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080816] text-white">
      <div className="studio-aurora" />
      <div className="led-wall" />
      <div className="stage-lights" />
      <Confetti active={confetti} />
      <PrizeReveal active={prizeReveal} onClose={() => setPrizeReveal(false)} />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-white/14 bg-white/[0.08] p-5 shadow-[0_24px_90px_rgba(0,0,0,.36)] backdrop-blur-2xl"
          >
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-cyan-100/70">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,.9)]" />
              Прямой эфир 2026
              <span className="rounded-full border border-amber-200/30 px-3 py-1 text-amber-100">{card.category}</span>
              {finalMode ? <span className="rounded-full border border-fuchsia-200/50 px-3 py-1 text-fuchsia-100">Финал</span> : null}
            </div>
            <h1 className="mt-3 max-w-4xl text-[clamp(2.1rem,6vw,5.8rem)] font-black uppercase leading-[0.95] tracking-normal text-white">
              Звездный Барабан
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/72 sm:text-base">
              Авторская интерактивная игра про колесо удачи, слова и сияющую сцену. Вращайте колесо, открывайте буквы и забирайте овации.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[560px]">
            <StatCard label="Счет" value={save.score.toLocaleString("ru-RU")} />
            <StatCard label="Монеты" value={save.coins.toLocaleString("ru-RU")} />
            <StatCard label="Уровень" value={save.level} />
            <StatCard label="Раунд" value={save.round} />
            <StatCard label="Таймер" value={`${timeLeft}с`} />
            <StatCard label="Подарки" value={save.gifts} />
          </div>
        </header>

        <div className="grid flex-1 gap-5 xl:grid-cols-[1fr_420px]">
          <section className="grid gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-md border border-white/14 bg-slate-950/52 p-4 shadow-[0_30px_110px_rgba(0,0,0,.46)] backdrop-blur-2xl sm:p-6"
            >
              <div className="audience" aria-hidden="true">
                {Array.from({ length: 52 }, (_, index) => (
                  <span key={index} style={{ animationDelay: `${(index % 9) * 0.13}s` }} />
                ))}
              </div>
              <div className="relative z-10 mx-auto max-w-5xl rounded-md border border-cyan-100/20 bg-black/38 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-amber-100/70">Категория: {card.category}</div>
                    <div className="mt-1 text-sm text-slate-100/72">{card.clue}</div>
                  </div>
                  <div className="h-2 w-44 overflow-hidden rounded-full bg-white/12">
                    <motion.div className="h-full bg-gradient-to-r from-cyan-300 via-amber-200 to-red-400" animate={{ width: `${progress}%` }} />
                  </div>
                </div>
                <WordBoard word={card.word} guessed={guessed} isFinal={false} />
              </div>

              <div className="relative z-10 mt-5 grid items-center gap-6 lg:grid-cols-[minmax(260px,1fr)_minmax(280px,520px)]">
                <div className="order-2 grid gap-4 lg:order-1">
                  <div className="rounded-md border border-white/14 bg-white/[0.07] p-4 backdrop-blur-xl">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Пульт участника</div>
                    <div className="mt-3 flex gap-3">
                      <input
                        aria-label="Введите букву"
                        value={input}
                        onChange={(event) => setInput(normalizeLetter(event.target.value))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            guessLetter(input);
                          }
                        }}
                        className="min-w-0 flex-1 rounded-md border border-white/18 bg-black/40 px-4 py-3 text-center text-2xl font-black uppercase text-white outline-none transition focus:border-amber-200"
                        placeholder="А"
                        maxLength={1}
                      />
                      <button
                        type="button"
                        onClick={() => guessLetter(input)}
                        className="rounded-md border border-amber-200/70 bg-amber-300 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_26px_rgba(250,204,21,.32)] transition hover:-translate-y-0.5"
                      >
                        Открыть
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-8 gap-1.5 sm:grid-cols-11">
                      {alphabet.map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          disabled={guessed.includes(letter) || solved}
                          onClick={() => guessLetter(letter)}
                          className="aspect-square rounded border border-white/10 bg-white/[0.055] text-[11px] font-bold text-white/78 transition hover:border-cyan-200/80 hover:bg-cyan-300/20 disabled:opacity-25"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => resetRound(solved)}
                      className="rounded-md border border-white/14 bg-white/[0.08] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.14]"
                    >
                      {solved ? "Следующий уровень" : "Новое слово"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSave({ score: 0, coins: 0, level: 1, round: 1, leaders: defaultLeaders, inventory: [], equipped: [], gifts: 0 });
                        solvedAwardedRef.current = "";
                        setGuessed([]);
                        setFinalMode(false);
                        setTimeLeft(90);
                        setMessage("Прогресс сброшен. Студия начинает заново.");
                        setHostCallout("Сначала!");
                      }}
                      className="rounded-md border border-red-200/24 bg-red-500/16 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-50 transition hover:bg-red-500/24"
                    >
                      Сброс
                    </button>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <Wheel rotation={rotation} spinning={spinning} onSpin={spinWheel} />
                </div>
              </div>
            </motion.div>
          </section>

          <aside className="grid content-start gap-5">
            <HostPanel callout={hostCallout} />
            <CharacterPanel equipped={save.equipped} gifts={save.gifts} coins={save.coins} />

            <div className="rounded-md border border-white/14 bg-white/[0.075] p-5 shadow-[0_22px_80px_rgba(0,0,0,.38)] backdrop-blur-2xl">
              <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Режиссерская сводка</div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={message}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 min-h-16 text-xl font-bold leading-7 text-white"
                >
                  {message}
                </motion.p>
              </AnimatePresence>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatCard label="Сектор" value={currentSegment.label} />
                <StatCard label="Комбо" value={`x${combo}`} />
              </div>
            </div>

            <ChatPanel
              messages={chatMessages}
              value={chatInput}
              onChange={setChatInput}
              onSend={sendChat}
              onGift={sendGift}
            />

            <ShopPanel
              coins={save.coins}
              inventory={save.inventory}
              equipped={save.equipped}
              onBuy={buyItem}
              onToggle={toggleItem}
            />

            <div className="rounded-md border border-white/14 bg-white/[0.075] p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Финал</div>
                  <div className="mt-1 text-sm text-white/70">60 секунд, двойные очки, праздничный финиш.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFinalMode(true);
                    setTimeLeft(60);
                    setMessage("Финал активирован вручную. В студии максимум света.");
                    setHostCallout("Финал!");
                  }}
                  className="rounded-md border border-fuchsia-200/50 bg-fuchsia-400/18 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-50 transition hover:bg-fuchsia-400/28"
                >
                  Старт
                </button>
              </div>
            </div>

            <div className="rounded-md border border-white/14 bg-white/[0.075] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/62">Рейтинг игроков</div>
                <input
                  aria-label="Имя игрока"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value.toUpperCase().replace(/[^А-ЯA-Z0-9]/g, "").slice(0, 8))}
                  className="w-28 rounded border border-white/12 bg-black/35 px-2 py-1 text-right text-xs font-bold uppercase text-white outline-none focus:border-amber-200"
                />
              </div>
              <div className="space-y-2">
                {leaders.map((leader, index) => (
                  <motion.div
                    key={`${leader.name}-${index}`}
                    layout
                    className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded border border-white/10 bg-black/24 px-3 py-2"
                  >
                    <span className="text-sm font-black text-amber-200">#{index + 1}</span>
                    <span className="font-bold text-white">{leader.name}</span>
                    <span className="text-sm text-cyan-100/74">{leader.score.toLocaleString("ru-RU")}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
