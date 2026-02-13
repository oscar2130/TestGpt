const topicText = document.getElementById("topicText");
const nextTopicBtn = document.getElementById("nextTopicBtn");
const randomTopicBtn = document.getElementById("randomTopicBtn");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const reportPanel = document.getElementById("reportPanel");
const reportText = document.getElementById("reportText");
const speechSupport = document.getElementById("speechSupport");
const startMicBtn = document.getElementById("startMicBtn");
const stopMicBtn = document.getElementById("stopMicBtn");
const speakBotBtn = document.getElementById("speakBotBtn");

let currentTopicIndex = 0;
let conversationHistory = [];
let conversationEnded = false;
let lastBotMessage = "";

function updateTopic() {
  topicText.textContent = curriculumTopics[currentTopicIndex];
}

function addMessage(role, text) {
  const entry = document.createElement("div");
  entry.className = `msg ${role}`;
  entry.textContent = `${role === "user" ? "You" : role === "bot" ? "Tutor" : "System"}: ${text}`;
  chatLog.appendChild(entry);
  chatLog.scrollTop = chatLog.scrollHeight;

  if (role === "user" || role === "bot") {
    conversationHistory.push({ role, text });
  }
}

function detectCorrections(userText) {
  const rules = [
    { pattern: /\bI goed\b/i, fix: "I went" },
    { pattern: /\bI am agree\b/i, fix: "I agree" },
    { pattern: /\bHe go\b/i, fix: "He goes" },
    { pattern: /\bShe go\b/i, fix: "She goes" },
    { pattern: /\bI no understand\b/i, fix: "I don't understand" },
    { pattern: /\bI can to\b/i, fix: "I can" },
    { pattern: /\bvery like\b/i, fix: "really like" },
    { pattern: /\bYesterday I go\b/i, fix: "Yesterday I went" }
  ];

  return rules
    .filter((rule) => rule.pattern.test(userText))
    .map((rule) => `- "${userText}" → "${userText.replace(rule.pattern, rule.fix)}"`);
}

function generateTutorReply(userText) {
  const lower = userText.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hi! Nice to meet you. How are you today?";
  }

  if (lower.includes("name")) {
    return "Great! My name is English Buddy. What is your name?";
  }

  if (lower.includes("i like")) {
    return "Nice sentence! Why do you like it?";
  }

  if (lower.includes("because")) {
    return "Good reason! Can you tell me one more thing?";
  }

  if (userText.length < 8) {
    return "Good try! Please make one short full sentence.";
  }

  return "Good job! Please tell me more in one or two short sentences.";
}

function buildFeedbackReport() {
  const userLines = conversationHistory.filter((m) => m.role === "user");
  const botLines = conversationHistory.filter((m) => m.role === "bot");

  const correctionList = userLines.flatMap((line) => detectCorrections(line.text));
  const usedExpressions = userLines.map((line) => `- ${line.text}`).slice(0, 12);

  const summary = [
    "[영어회화 피드백 보고서]",
    "",
    `1) 총 대화 문장 수: 사용자 ${userLines.length}문장, 튜터 ${botLines.length}문장`,
    `2) 학습 주제: ${curriculumTopics[currentTopicIndex]}`,
    "",
    "3) 잘한 점",
    "- 짧은 문장으로 계속 대화를 이어가려는 점이 좋아요.",
    "- 질문을 받으면 답하려고 시도한 점이 아주 좋아요.",
    "",
    "4) 수정하면 좋은 표현",
    correctionList.length ? correctionList.join("\n") : "- 큰 문법 오류는 발견되지 않았어요. 계속 자신 있게 말해보세요!",
    "",
    "5) 이번 대화에서 사용한 표현 (일부)",
    usedExpressions.length ? usedExpressions.join("\n") : "- 아직 기록된 사용자 문장이 없어요.",
    "",
    "6) 다음 연습 팁",
    "- 한 문장에 주어(I/He/She)와 동사를 꼭 넣어보세요.",
    "- 과거 이야기에는 went, ate 같은 과거형을 써보세요.",
    "- 내일은 오늘 주제로 5문장 다시 말해보면 좋아요."
  ];

  return summary.join("\n");
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function handleUserMessage(rawInput) {
  if (conversationEnded) {
    addMessage("system", "새로운 대화를 위해 페이지를 새로고침 해주세요.");
    return;
  }

  const text = rawInput.trim();
  if (!text) return;

  addMessage("user", text);

  if (text.toLowerCase() === "feedback please") {
    conversationEnded = true;
    const report = buildFeedbackReport();
    reportPanel.hidden = false;
    reportText.textContent = report;
    addMessage("system", "대화를 종료하고 피드백 보고서를 생성했어요.");
    return;
  }

  const reply = generateTutorReply(text);
  lastBotMessage = reply;
  addMessage("bot", reply);
  speakText(reply);
}

nextTopicBtn.addEventListener("click", () => {
  currentTopicIndex = (currentTopicIndex + 1) % curriculumTopics.length;
  updateTopic();
  addMessage("system", `주제가 변경되었어요: ${curriculumTopics[currentTopicIndex]}`);
});

randomTopicBtn.addEventListener("click", () => {
  currentTopicIndex = Math.floor(Math.random() * curriculumTopics.length);
  updateTopic();
  addMessage("system", `랜덤 주제로 바꿨어요: ${curriculumTopics[currentTopicIndex]}`);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleUserMessage(messageInput.value);
  messageInput.value = "";
  messageInput.focus();
});

speakBotBtn.addEventListener("click", () => {
  if (lastBotMessage) {
    speakText(lastBotMessage);
  }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  speechSupport.textContent = "브라우저 음성인식 지원: 가능";
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event) => {
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript;
      }
    }

    if (finalText) {
      handleUserMessage(finalText);
    }
  };

  recognition.onerror = () => {
    addMessage("system", "음성 인식 오류가 발생했어요. 다시 시도해 주세요.");
  };

  startMicBtn.addEventListener("click", () => recognition.start());
  stopMicBtn.addEventListener("click", () => recognition.stop());
} else {
  speechSupport.textContent = "브라우저 음성인식 지원: 미지원 (텍스트 입력은 가능)";
  startMicBtn.disabled = true;
  stopMicBtn.disabled = true;
}

updateTopic();
addMessage("bot", "Hello! I am your English buddy. Let's start with short sentences.");
lastBotMessage = "Hello! I am your English buddy. Let's start with short sentences.";
