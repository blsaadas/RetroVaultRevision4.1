'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { getDifficultyAdviceAction } from '@/app/actions';

const formSchema = z.object({
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  recentPerformance: z.string().min(10, { message: 'Please describe your performance in a bit more detail.' }).max(500),
});

type FormValues = z.infer<typeof formSchema>;

interface AdaptiveDifficultyToolProps {
  gameName: string;
  playerScore: number;
}

export function AdaptiveDifficultyTool({ gameName, playerScore }: AdaptiveDifficultyToolProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<{ difficultyAdjustment: string; adaptiveAdvice: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        skillLevel: 'intermediate',
        recentPerformance: '',
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setAdvice(null);
    try {
      const result = await getDifficultyAdviceAction({
        gameName,
        playerScore,
        ...values,
      });

      if (result.success && result.data) {
        setAdvice(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch AI advice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
        setAdvice(null);
        form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bot className="mr-2 h-4 w-4" />
          Get AI Advice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Adaptive Difficulty AI</DialogTitle>
          <DialogDescription>
            Get personalized advice from our AI to tune your gameplay experience.
          </DialogDescription>
        </DialogHeader>
        {advice ? (
            <div className="space-y-4 py-4">
                <div>
                    <h4 className="font-semibold mb-2">Difficulty Adjustment Suggestion:</h4>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{advice.difficultyAdjustment}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Adaptive Advice for You:</h4>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{advice.adaptiveAdvice}</p>
                </div>
            </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <p><span className="font-semibold">Game:</span> {gameName}</p>
                <p><span className="font-semibold">Score:</span> {playerScore}</p>
            </div>
            <FormField
              control={form.control}
              name="skillLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Skill Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recentPerformance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How was your last game?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'I was doing well but the speed got too fast.'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                        </>
                    ) : (
                        'Get Advice'
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
