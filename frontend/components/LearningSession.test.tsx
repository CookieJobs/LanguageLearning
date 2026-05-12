import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LearningSession } from './LearningSession';
import { Question } from '../types';
import React from 'react';

const mockQuestion: Question = {
  wordId: '1',
  type: 'choice',
  questionText: 'Select correct',
  word: {
    word: 'apple',
    definition: 'fruit',
    partOfSpeech: 'noun',
    example: 'I eat an apple.'
  },
  options: [
    { id: '1', text: 'Option 1', isCorrect: true },
    { id: '2', text: 'Option 2', isCorrect: false },
    { id: '3', text: 'Option 3', isCorrect: false },
    { id: '4', text: 'Option 4', isCorrect: false }
  ]
};

// Mock dependencies
vi.mock('../services/geminiService', () => ({
  evaluateSentence: vi.fn()
}));

vi.mock('../contexts/PetContext', () => ({
  usePet: () => ({
    refreshWallet: vi.fn(),
    refreshPet: vi.fn(),
  })
}));

// Mock Audio
global.Audio = vi.fn().mockImplementation(function() {
  return {
    play: vi.fn().mockResolvedValue(undefined),
    catch: vi.fn(),
    pause: vi.fn(),
    currentTime: 0
  };
}) as any;

// Mock speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    cancel: vi.fn(),
    speak: vi.fn()
  },
  writable: true
});

describe('LearningSession Keyboard Interaction', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('selects option when number key is pressed', () => {
    render(
      <LearningSession
        question={mockQuestion}
        currentIndex={0}
        totalCount={10}
        onSuccess={() => {}}
        onSkip={() => {}}
        onExit={() => {}}
      />
    );

    // Initial state: nothing selected (we check indirectly via class or just assume logic works if event fires)
    // But better to check if 'Option 2' button gets selected style
    // Since we don't have easy access to state, we rely on the fact that pressing '2' should select option index 1.
    
    // Simulate pressing '2'
    fireEvent.keyDown(window, { key: '2' });

    // The component should update. We can check if the button for "Option 2" has selected style.
    // In our implementation, selected button has `border-duo-blue`
    const opt2 = screen.getByText('Option 2').closest('button');
    expect(opt2).toHaveClass('border-duo-blue');
  });

  it('submits answer when Enter is pressed with selection', async () => {
    render(
      <LearningSession
        question={mockQuestion}
        currentIndex={0}
        totalCount={10}
        onSuccess={() => {}}
        onSkip={() => {}}
        onExit={() => {}}
      />
    );

    // Select option 1
    fireEvent.keyDown(window, { key: '1' });
    
    // Press Enter to submit
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
    });

    // Should show feedback. Correct answer is Option 1.
    // There are multiple elements with "Correct!" (h3 and p or others), so getAllByText
    expect(screen.getAllByText('Correct!')[0]).toBeInTheDocument();
  });

  it('goes to next question when Enter is pressed after feedback', async () => {
    const handleSuccess = vi.fn();
    render(
      <LearningSession
        question={mockQuestion}
        currentIndex={0}
        totalCount={10}
        onSuccess={handleSuccess}
        onSkip={() => {}}
        onExit={() => {}}
      />
    );

    // Select correct option
    fireEvent.keyDown(window, { key: '1' });
    
    // Submit
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
    });

    // Verify feedback shown
    expect(screen.getAllByText('Correct!')[0]).toBeInTheDocument();

    // Press Enter again to go next
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(handleSuccess).toHaveBeenCalled();
  });
});

describe('LearningSession Layout & DOM Position', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders feedback and question side-by-side without layout shift', async () => {
    render(
      <LearningSession
        question={mockQuestion}
        currentIndex={0}
        totalCount={10}
        onSuccess={() => {}}
        onSkip={() => {}}
        onExit={() => {}}
      />
    );

    const questionContainer = screen.getByTestId('question-container');
    const feedbackContainer = screen.getByTestId('feedback-container');

    // Both containers should be present in the DOM immediately
    expect(questionContainer).toBeInTheDocument();
    expect(feedbackContainer).toBeInTheDocument();

    // The parent of these containers should have flex-row related layout classes
    const flexRowParent = questionContainer.parentElement;
    expect(flexRowParent).toHaveClass('flex', 'w-full', 'justify-center', 'items-start');
    
    // Test the gap requirement
    expect(flexRowParent).toHaveClass('gap-2', 'md:gap-4');

    // Verify width distribution for mobile/desktop responsiveness
    expect(feedbackContainer).toHaveClass('w-[40%]', 'md:flex-1', 'max-w-[320px]', 'shrink');
    expect(questionContainer).toHaveClass('w-[60%]', 'md:w-[540px]', 'shrink');

    // Select option 1 and submit to show feedback
    fireEvent.keyDown(window, { key: '1' });
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' });
    });

    // Feedback should appear inside the feedback container
    expect(screen.getAllByText('Correct!')[0]).toBeInTheDocument();
    expect(feedbackContainer).toContainElement(screen.getAllByText('Correct!')[0]);
    
    // Verify that the feedback container structure maintains layout
    // The items-start on flexRowParent prevents height changes from pushing items up
  });
});
