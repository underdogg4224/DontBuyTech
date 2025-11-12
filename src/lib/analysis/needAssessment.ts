import { Product, NeedAssessment } from '@/types';

export function assessNeed(
  product: Product,
  userResponses?: Record<string, boolean>
): NeedAssessment {
  const questions = generateQuestions(product);
  let score = 50; // Start with neutral score
  const reasons: string[] = [];

  // Adjust score based on product category and price
  if (product.price > 1000) {
    score -= 10;
    reasons.push('High price point requires careful consideration');
  }

  // Check for luxury/redundant features
  const luxuryKeywords = ['pro', 'max', 'ultra', 'premium'];
  const hasLuxuryFeatures = luxuryKeywords.some(keyword =>
    product.name.toLowerCase().includes(keyword)
  );

  if (hasLuxuryFeatures) {
    score -= 15;
    reasons.push('Premium features may not be necessary for average use');
  }

  // Process user responses if provided
  if (userResponses) {
    questions.forEach(q => {
      const answer = userResponses[q.question];
      if (answer !== undefined) {
        q.answer = answer;
        if (q.impact === 'positive' && answer) {
          score += 10;
        } else if (q.impact === 'negative' && answer) {
          score -= 10;
        }
      }
    });
  }

  // Determine verdict
  let verdict: NeedAssessment['verdict'];
  if (score >= 75) {
    verdict = 'essential';
    reasons.push('Strong case for purchase based on your needs');
  } else if (score >= 55) {
    verdict = 'beneficial';
    reasons.push('Could improve your workflow or daily life');
  } else if (score >= 35) {
    verdict = 'optional';
    reasons.push('Nice to have but not critical');
  } else {
    verdict = 'unnecessary';
    reasons.push('Consider if you really need this product');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    verdict,
    reasons,
    questions,
  };
}

function generateQuestions(product: Product): NeedAssessment['questions'] {
  const baseQuestions: NeedAssessment['questions'] = [
    {
      question: 'Do you use similar products daily?',
      answer: false,
      impact: 'positive',
    },
    {
      question: 'Is your current device broken or significantly outdated?',
      answer: false,
      impact: 'positive',
    },
    {
      question: 'Will this product help you earn money or improve productivity?',
      answer: false,
      impact: 'positive',
    },
    {
      question: 'Are you buying this mainly because its new or trendy?',
      answer: false,
      impact: 'negative',
    },
    {
      question: 'Do you already own something that does 80% of what this does?',
      answer: false,
      impact: 'negative',
    },
  ];

  // Add category-specific questions
  const categoryQuestions = getCategorySpecificQuestions(product.category);
  return [...baseQuestions, ...categoryQuestions];
}

function getCategorySpecificQuestions(
  category: string
): NeedAssessment['questions'] {
  const questions: Record<string, NeedAssessment['questions']> = {
    laptop: [
      {
        question: 'Do you need to run professional software or demanding applications?',
        answer: false,
        impact: 'positive',
      },
      {
        question: 'Is portability a key requirement for your work?',
        answer: false,
        impact: 'positive',
      },
    ],
    smartphone: [
      {
        question: 'Is your current phone no longer receiving security updates?',
        answer: false,
        impact: 'positive',
      },
      {
        question: 'Do you primarily use basic features (calls, texts, browsing)?',
        answer: false,
        impact: 'negative',
      },
    ],
    headphones: [
      {
        question: 'Do you listen to audio content for multiple hours daily?',
        answer: false,
        impact: 'positive',
      },
      {
        question: 'Is noise cancellation important for your environment?',
        answer: false,
        impact: 'positive',
      },
    ],
    smartwatch: [
      {
        question: 'Do you actively track fitness or health metrics?',
        answer: false,
        impact: 'positive',
      },
      {
        question: 'Are you buying this mainly for notifications?',
        answer: false,
        impact: 'negative',
      },
    ],
  };

  return questions[category] || [];
}
