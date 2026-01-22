"use client";

import { useState } from "react";

const sampleWords = [
  { word: "Ephemeral", definition: "Lasting for a very short time", example: "The ephemeral beauty of cherry blossoms makes them even more precious." },
  { word: "Ubiquitous", definition: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern society." },
  { word: "Serendipity", definition: "The occurrence of events by chance in a happy way", example: "Finding that rare book was pure serendipity." },
  { word: "Eloquent", definition: "Fluent or persuasive in speaking or writing", example: "Her eloquent speech moved the entire audience." },
  { word: "Resilient", definition: "Able to recover quickly from difficulties", example: "Children are remarkably resilient and adapt to new situations." },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  const currentWord = sampleWords[currentIndex];

  const nextWord = () => {
    setShowDefinition(false);
    setCurrentIndex((prev) => (prev + 1) % sampleWords.length);
  };

  const prevWord = () => {
    setShowDefinition(false);
    setCurrentIndex((prev) => (prev - 1 + sampleWords.length) % sampleWords.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col">
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            Rise<span className="text-pink-400">Vocab</span>
          </h1>
          <nav className="flex gap-6 text-white/80">
            <a href="#" className="hover:text-white transition-colors">Learn</a>
            <a href="#" className="hover:text-white transition-colors">Practice</a>
            <a href="#" className="hover:text-white transition-colors">Progress</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => setShowDefinition(!showDefinition)}
          >
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Word of the Day</p>
              <h2 className="text-5xl font-bold text-white mb-6">{currentWord.word}</h2>

              <div className={"transition-all duration-300 " + (showDefinition ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden")}>
                <div className="border-t border-white/20 pt-6 mt-2">
                  <p className="text-xl text-pink-300 mb-4">{currentWord.definition}</p>
                  <p className="text-white/70 italic">&quot;{currentWord.example}&quot;</p>
                </div>
              </div>

              {!showDefinition && (
                <p className="text-white/50 text-sm">Tap to reveal definition</p>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevWord}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
            >
              Previous
            </button>
            <button
              onClick={nextWord}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-all font-semibold"
            >
              Next Word
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {sampleWords.map((_, index) => (
              <div
                key={index}
                className={"w-2 h-2 rounded-full transition-all " + (index === currentIndex ? "bg-pink-400 w-6" : "bg-white/30")}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-white/50 text-sm">
        <p>Build your vocabulary, one word at a time.</p>
      </footer>
    </div>
  );
}
