/**
 * TriviaModal - Modal for sponsor trivia questions with multiple choice
 * Shows when a sponsor question appears randomly during gameplay
 */

import React, { useState, useEffect } from 'react';
import type { SponsorQuestion } from '../services/GameApiService';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './TriviaModal.css';

interface TriviaModalProps {
  question: SponsorQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswer?: string) => void;
  onSkip?: () => void;
}

export const TriviaModal: React.FC<TriviaModalProps> = ({ question, onAnswer, onSkip }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    // Play sound when modal opens
    soundService.play(SOUND_MAPPINGS.WORD_FORMED);
    
    // Generate multiple choice options
    if (question.options && question.options.length > 0) {
      // Use provided options
      setShuffledOptions([...question.options].sort(() => Math.random() - 0.5));
    } else {
      // Generate options from answer (fallback)
      const options = [question.answer];
      // Add some dummy options (in production, these would come from backend)
      const dummyOptions = ['OPTION1', 'OPTION2', 'OPTION3'];
      options.push(...dummyOptions.slice(0, 3));
      setShuffledOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [question]);

  const handleSelectAnswer = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer.trim()) {
      return;
    }

    const correct = selectedAnswer.toUpperCase().trim() === question.answer.toUpperCase().trim();
    setIsCorrect(correct);
    setShowResult(true);

    // Play result sound
    if (correct) {
      soundService.play(SOUND_MAPPINGS.LEVEL_UP || SOUND_MAPPINGS.WORD_FORMED);
    } else {
      soundService.play(SOUND_MAPPINGS.WORD_FORMED);
    }

    // Auto-close after showing result
    setTimeout(() => {
      onAnswer(correct, correct ? selectedAnswer : undefined);
    }, correct ? 3000 : 2000); // Longer delay if correct to show success message
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onAnswer(false, undefined);
    }
  };

  return (
    <div className="trivia-modal-overlay">
      <div className="trivia-modal">
        {question.sponsorLogo && (
          <div className="trivia-sponsor-logo">
            <img src={question.sponsorLogo} alt={question.sponsor} />
          </div>
        )}

        <div className="trivia-header">
          <h2>Sponsor Challenge</h2>
          <p className="trivia-sponsor-name">by {question.sponsor}</p>
        </div>

        <div className="trivia-content">
          <div className="trivia-question">
            <p>{question.question}</p>
            {question.hint && (
              <p className="trivia-hint">💡 Hint: {question.hint}</p>
            )}
          </div>

          {!showResult ? (
            <>
              <div className="trivia-options">
                {shuffledOptions.map((option, index) => (
                  <button
                    key={index}
                    className={`trivia-option ${selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() => handleSelectAnswer(option)}
                  >
                    <span className="option-label">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>

              <div className="trivia-actions">
                <button 
                  onClick={handleSubmit} 
                  className="trivia-submit-btn" 
                  disabled={!selectedAnswer.trim()}
                >
                  Submit Answer
                </button>
                {onSkip && (
                  <button onClick={handleSkip} className="trivia-skip-btn">
                    Skip
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={`trivia-result ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? (
                <>
                  <div className="trivia-result-icon">✅</div>
                  <p className="trivia-result-title">Correct!</p>
                  <p className="trivia-result-message">
                    Now find the word <strong>{question.answer}</strong> on the board!
                  </p>
                  <p className="trivia-points">+{question.points} points when found</p>
                </>
              ) : (
                <>
                  <div className="trivia-result-icon">❌</div>
                  <p className="trivia-result-title">Incorrect</p>
                  <p className="trivia-result-message">
                    The answer was <strong>{question.answer}</strong>
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="trivia-footer">
          <p className="trivia-category">Category: {question.category}</p>
          <p className="trivia-difficulty">Difficulty: {question.difficulty}</p>
        </div>
      </div>
    </div>
  );
};
