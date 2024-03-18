export function playAudio(audioSrc, onEndedCallback) {
  const audio = new Audio("data:audio/mp3;base64," + audioSrc);
  audio.play();
  audio.onended = onEndedCallback;
  return audio;
}
