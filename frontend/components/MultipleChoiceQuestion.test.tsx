import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { Question } from '../types';
import React from 'react';

const mockQuestion: Question = {
  wordId: '1',
  type: 'choice',
  questionText: 'Select the correct meaning',
  word: {
    word: 'apple',
    definition: 'fruit',
    partOfSpeech: 'noun',
    example: 'I eat an apple.'
  },
  options: [
    { id: 'opt1', text: 'Option 1', isCorrect: false },
    { id: 'opt2', text: 'Option 2', isCorrect: true },
    { id: 'opt3', text: 'Option 3', isCorrect: false },
    { id: 'opt4', text: 'Option 4', isCorrect: false }
  ]
};

describe('MultipleChoiceQuestion', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all options with keyboard hints', () => {
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        selectedOptionId={null}
        onSelect={() => {}}
        showFeedback={false}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onSelect when an option is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        selectedOptionId={null}
        onSelect={handleSelect}
        showFeedback={false}
      />
    );

    fireEvent.click(screen.getByText('Option 2'));
    expect(handleSelect).toHaveBeenCalledWith('opt2');
  });

  it('displays feedback correctly', () => {
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        selectedOptionId="opt2"
        onSelect={() => {}}
        showFeedback={true}
      />
    );

    // Option 2 is correct and selected
    const correctBtn = screen.getByText('Option 2').closest('button');
    expect(correctBtn).toBeDisabled();
    // In our implementation, feedback styling is applied via classes,
    // here we just check if it renders without error.
  });
});
