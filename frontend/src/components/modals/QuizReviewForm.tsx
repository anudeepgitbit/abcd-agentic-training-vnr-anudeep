// src/components/QuizReviewForm.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';

export interface QuestionSuggestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizReviewFormProps {
  suggestions: QuestionSuggestion[];
  topic: string;
  onSubmit: (title: string, selectedQuestions: QuestionSuggestion[]) => Promise<void>;
  onCancel: () => void;
}

export const QuizReviewForm: React.FC<QuizReviewFormProps> = ({ suggestions, topic, onSubmit, onCancel }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(suggestions.map((_, index) => index))
  );
  const [quizTitle, setQuizTitle] = useState<string>(`${topic} Quiz`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectQuestion = (index: number, checked: boolean) => {
    const newSelection = new Set(selectedIndices);
    if (checked) {
      newSelection.add(index);
    } else {
      newSelection.delete(index);
    }
    setSelectedIndices(newSelection);
  };

  const handleSubmit = async () => {
    if (!quizTitle.trim()) {
        alert("Please enter a quiz title.");
        return;
    }
    setIsSubmitting(true);
    const selectedQuestions = suggestions.filter((_, index) => selectedIndices.has(index));
    await onSubmit(quizTitle, selectedQuestions);
    setIsSubmitting(false); // The parent component will handle unmounting
  };

  return (
    <Card className="shadow-card h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Review & Create Quiz</CardTitle>
        <CardDescription>Select the questions you want to include in the final quiz.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2 mb-4">
          <Label htmlFor="quizTitle" className="font-semibold">Quiz Title</Label>
          <Input id="quizTitle" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
        </div>
        {suggestions.map((q, index) => (
          <div key={index} className="border rounded-lg p-4 flex items-start gap-4 transition-colors hover:bg-muted/50">
            <Checkbox
              id={`q-${index}`}
              checked={selectedIndices.has(index)}
              onCheckedChange={(checked) => handleSelectQuestion(index, !!checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor={`q-${index}`} className="font-semibold cursor-pointer">{index + 1}. {q.question}</label>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {q.options.map((opt, optIndex) => (
                  <p key={optIndex} className={`${optIndex === q.correctAnswerIndex ? 'font-bold text-primary' : ''}`}>
                    {String.fromCharCode(65 + optIndex)}. {opt}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t p-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || selectedIndices.size === 0}>
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
          Create Quiz ({selectedIndices.size} Selected)
        </Button>
      </CardFooter>
    </Card>
  );
};