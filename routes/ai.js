const express = require('express');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/auth');

const router = express.Router();

const similarityCheck = (text1, text2) => {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  const set2 = new Set(words2);
  
  words1.forEach(word => {
    if (set2.has(word)) matches++;
  });
  
  return (matches / Math.max(words1.length, words2.length)) * 100;
};

router.post('/plagiarism-check', protect, async (req, res) => {
  try {
    const { content, submissionId } = req.body;
    
    const existingSubmissions = await Submission.find({ 
      content: { $exists: true, $ne: '' } 
    }).select('content originalityScore');
    
    let maxSimilarity = 0;
    let similarSubmissions = [];
    
    existingSubmissions.forEach(sub => {
      if (sub._id.toString() !== submissionId) {
        const similarity = similarityCheck(content, sub.content);
        if (similarity > 20) {
          similarSubmissions.push({
            id: sub._id,
            similarity: Math.round(similarity)
          });
        }
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    });
    
    const originalityScore = Math.max(0, 100 - maxSimilarity);
    const plagiarismScore = 100 - originalityScore;
    
    if (submissionId) {
      await Submission.findByIdAndUpdate(submissionId, {
        plagiarismScore,
        originalityScore
      });
    }
    
    res.json({
      plagiarismScore: Math.round(plagiarismScore),
      originalityScore: Math.round(originalityScore),
      similarSubmissions: similarSubmissions.slice(0, 5),
      checkedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/grammar-check', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    const suggestions = [];
    const sentences = content.split(/[.!?]+/);
    
    const grammarRules = [
      { pattern: /\bi\b(?=\s+[a-z])/gi, message: "Capitalize 'I' when referring to yourself" },
      { pattern: /\b\d+\s+[a-z]/g, message: "Number followed by word - consider spelling out numbers at start of sentence" },
      { pattern: /\s{2,}/g, message: "Multiple consecutive spaces detected" },
      { pattern: /[a-z]\s+[a-z]\s+[a-z]/g, message: "Check spacing between words" },
    ];
    
    grammarRules.forEach(rule => {
      const matches = content.match(rule.pattern);
      if (matches) {
        suggestions.push({
          type: 'grammar',
          message: rule.message,
          count: matches.length,
          suggestion: 'Review and correct the identified issues'
        });
      }
    });
    
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = sentences.filter(s => s.trim()).length;
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
    
    if (avgWordsPerSentence > 25) {
      suggestions.push({
        type: 'style',
        message: 'Long sentences detected',
        suggestion: 'Consider breaking longer sentences for better readability'
      });
    }
    
    res.json({
      suggestions: suggestions.slice(0, 10),
      stats: {
        wordCount,
        sentenceCount,
        avgWordsPerSentence
      },
      checkedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/summarize', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const words = content.split(/\s+/);
    
    const keyPhrases = [];
    const importantWords = ['analysis', 'result', 'conclusion', 'study', 'research', 'data', 'method', 'finding', 'important', 'key'];
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (importantWords.includes(cleanWord)) {
        if (!keyPhrases.includes(word)) {
          keyPhrases.push(word);
        }
      }
    });
    
    const summaryLength = Math.min(5, Math.ceil(sentences.length / 3));
    const summary = sentences.slice(0, summaryLength).join('. ') + (sentences.length > summaryLength ? '.' : '');
    
    const studyTips = [
      'Break down complex concepts into smaller, manageable parts',
      'Create flashcards for key terms and definitions',
      'Practice with sample problems to reinforce learning',
      'Review material regularly to improve retention',
      'Join study groups to discuss challenging topics',
      'Use visual aids like diagrams and charts',
      'Teach the material to someone else to reinforce understanding',
      'Take notes in your own words rather than copying'
    ];
    
    const selectedTips = studyTips.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    res.json({
      summary: summary || 'Unable to generate summary from provided content.',
      keyPhrases: keyPhrases.slice(0, 10),
      studyTips: selectedTips,
      stats: {
        originalLength: content.length,
        summaryLength: summary.length,
        compressionRatio: Math.round((summary.length / content.length) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/suggestions', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    const suggestions = [];
    
    if (content.length < 100) {
      suggestions.push({
        type: 'content',
        message: 'Content appears short',
        suggestion: 'Consider adding more detail to strengthen your submission'
      });
    }
    
    const hasConclusion = /conclusion|summary|finally|overall/i.test(content);
    if (!hasConclusion) {
      suggestions.push({
        type: 'structure',
        message: 'No clear conclusion found',
        suggestion: 'Add a concluding section to summarize your key points'
      });
    }
    
    const hasExamples = /example|instance|such as|for instance/i.test(content);
    if (!hasExamples) {
      suggestions.push({
        type: 'content',
        message: 'Limited examples',
        suggestion: 'Include specific examples to support your arguments'
      });
    }
    
    const paragraphCount = content.split(/\n\n+/).length;
    if (paragraphCount < 3) {
      suggestions.push({
        type: 'formatting',
        message: 'Consider adding more paragraphs',
        suggestion: 'Break content into logical paragraphs for better readability'
      });
    }
    
    const formattingSuggestions = [
      { type: 'formatting', message: 'Use bullet points for lists', suggestion: 'Organize items in bullet or numbered lists' },
      { type: 'formatting', message: 'Add section headings', suggestion: 'Use clear headings to organize content' },
      { type: 'clarity', message: 'Define technical terms', suggestion: 'Explain any specialized terminology used' }
    ];
    
    res.json({
      suggestions: suggestions.concat(formattingSuggestions.slice(0, 2)),
      improvementAreas: suggestions.map(s => s.type),
      checkedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/grade', protect, async (req, res) => {
  try {
    const { content, criteria } = req.body;
    
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
    
    let score = 70;
    
    if (words > 500) score += 10;
    if (words > 1000) score += 5;
    if (sentences > 5) score += 5;
    if (/\n\n/.test(content)) score += 5;
    
    const rubricEvaluation = {
      content: Math.min(25, Math.round(score * 0.25)),
      organization: Math.min(25, Math.round(score * 0.25)),
      clarity: Math.min(25, Math.round(score * 0.25)),
      grammar: Math.min(25, Math.round(score * 0.25))
    };
    
    const feedback = [
      rubricEvaluation.content >= 20 ? 'Strong content and depth' : 'Content could be more detailed',
      rubricEvaluation.organization >= 20 ? 'Well organized structure' : 'Consider improving structure',
      rubricEvaluation.grammar >= 20 ? 'Good grammar and readability' : 'Review grammar and spelling'
    ];
    
    res.json({
      suggestedGrade: Math.min(100, Math.round(score)),
      rubricEvaluation,
      feedback,
      suggestions: [
        'Include more specific examples',
        'Ensure proper citation if required',
        'Review for any grammatical errors'
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;