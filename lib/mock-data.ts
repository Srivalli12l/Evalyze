export const mockResumeAnalysis = {
  selected_role: "Frontend Developer",
  role_fit_score: 85,
  skills_detected: ["React", "JavaScript", "CSS", "HTML", "Git"],
  skill_strength: {
    React: "strong",
    JavaScript: "strong",
    CSS: "moderate",
    HTML: "strong",
    Git: "moderate",
  } as Record<string, string>,
  resume_quality: 75,
  strengths: [
    "Strong project descriptions showcasing React expertise",
    "Good variety of frontend skills demonstrated across multiple projects",
  ],
  gaps: [
    "Add TypeScript experience to match modern role requirements",
    "Include responsive design and accessibility projects",
  ],
};

export const mockSkillQuestions = {
  role: "Frontend Developer",
  based_on_skills: ["React", "JavaScript", "CSS"],
  questions: [
    {
      id: "q1",
      skill: "React",
      question:
        "Based on your React experience, what is the primary purpose of the Virtual DOM?",
      options: [
        "To directly manipulate browser DOM elements",
        "To create a lightweight copy of the real DOM for efficient updates",
        "To replace HTML entirely",
        "To handle server-side rendering only",
      ],
      correct: 1,
      explanation:
        "The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to batch and optimize DOM updates by comparing the virtual and real DOMs (diffing), then applying only the necessary changes.",
    },
    {
      id: "q2",
      skill: "React",
      question:
        "Given your project experience with React hooks, what is the correct way to handle side effects?",
      options: [
        "Using componentDidMount lifecycle method",
        "Using the useEffect hook",
        "Directly modifying state in the render function",
        "Using the useState hook only",
      ],
      correct: 1,
      explanation:
        "The useEffect hook is designed to handle side effects in functional components, replacing lifecycle methods like componentDidMount, componentDidUpdate, and componentWillUnmount.",
    },
    {
      id: "q3",
      skill: "JavaScript",
      question:
        "Your resume mentions JavaScript proficiency. What is the output of: console.log(typeof null)?",
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correct: 2,
      explanation:
        'This is a well-known JavaScript quirk. typeof null returns "object" due to a legacy bug in the language that has been preserved for backward compatibility.',
    },
    {
      id: "q4",
      skill: "JavaScript",
      question:
        "Based on your JavaScript skills, which method creates a shallow copy of an array?",
      options: [
        "Array.from()",
        "array.splice()",
        "array.push()",
        "array.sort()",
      ],
      correct: 0,
      explanation:
        "Array.from() creates a new, shallow-copied Array instance from an array-like or iterable object. The spread operator [...arr] also creates a shallow copy.",
    },
    {
      id: "q5",
      skill: "React",
      question:
        "Considering your React project work, what is the purpose of the key prop in lists?",
      options: [
        "To style list items",
        "To help React identify which items have changed, been added, or removed",
        "To set the order of elements",
        "To bind event handlers",
      ],
      correct: 1,
      explanation:
        "Keys help React identify which items in a list have changed, been added, or removed. They should be stable, predictable, and unique among siblings.",
    },
    {
      id: "q6",
      skill: "CSS",
      question:
        "Your resume highlights CSS skills. Which CSS property creates a flex container?",
      options: [
        "display: block",
        "display: flex",
        "position: flex",
        "flex: container",
      ],
      correct: 1,
      explanation:
        "display: flex creates a flex container, enabling flexbox layout for its direct children. This is one of the most commonly used CSS layout techniques.",
    },
    {
      id: "q7",
      skill: "JavaScript",
      question:
        "Given your experience, what is the difference between let and var in JavaScript?",
      options: [
        "There is no difference",
        "let is function-scoped, var is block-scoped",
        "let is block-scoped, var is function-scoped",
        "Both are globally scoped",
      ],
      correct: 2,
      explanation:
        "let is block-scoped (limited to the block, statement, or expression it's declared in), while var is function-scoped (visible throughout the function it's declared in).",
    },
    {
      id: "q8",
      skill: "React",
      question:
        "Based on your React work, what does useMemo do?",
      options: [
        "Memoizes a computed value to avoid expensive recalculations",
        "Creates a new state variable",
        "Handles component side effects",
        "Manages component refs",
      ],
      correct: 0,
      explanation:
        "useMemo memoizes a computed value, recalculating it only when its dependencies change. This optimization helps avoid expensive calculations on every render.",
    },
    {
      id: "q9",
      skill: "JavaScript",
      question:
        "What is the difference between == and === in JavaScript?",
      options: [
        "No difference",
        "== compares value, === compares value and type",
        "=== is only for numbers",
        "== is faster than ===",
      ],
      correct: 1,
      explanation:
        "The == operator performs type coercion before comparison, whereas === (strict equality) compares both the value and the type.",
    },
    {
      id: "q10",
      skill: "React",
      question:
        "Which hook would you use to store a mutable value that does not cause a re-render when updated?",
      options: [
        "useState",
        "useReducer",
        "useRef",
        "useMemo",
      ],
      correct: 2,
      explanation:
        "useRef returns a mutable ref object whose .current property is initialized with the passed argument. Crucially, updating useRef does NOT trigger a component re-render.",
    },
  ],
};

export const mockPersonalityScenarios = {
  role: "Frontend Developer",
  scenarios: [
    {
      id: "s1",
      context: "Frontend Developer workplace scenario",
      scenario:
        "A designer hands you a UI mockup that looks beautiful but has several accessibility issues (low contrast, missing alt text areas, no keyboard navigation support). The deadline is tomorrow. How do you handle this?",
      options: [
        "Implement the design exactly as provided to meet the deadline",
        "Raise accessibility concerns with the designer and suggest specific alternatives while negotiating a reasonable timeline extension",
        "Refuse to implement the design until all accessibility issues are fixed",
        "Implement the design as-is and create a follow-up ticket for accessibility improvements",
      ],
      evaluates: "Communication & Ethics",
    },
    {
      id: "s2",
      context: "Frontend Developer workplace scenario",
      scenario:
        "During a code review, a senior developer strongly criticizes your approach to state management in a React component. They suggest a completely different architecture. You believe your approach is better for this specific use case. What do you do?",
      options: [
        "Immediately accept their suggestion without discussion",
        "Explain your reasoning with specific examples, ask clarifying questions about their approach, and be open to compromise",
        "Ignore the feedback and merge your code anyway",
        "Escalate the disagreement to your manager",
      ],
      evaluates: "Collaboration & Growth",
    },
    {
      id: "s3",
      context: "Frontend Developer workplace scenario",
      scenario:
        "You discover a critical performance bug in production that was introduced by another team member's recent commit. The application is slow for thousands of users. What is your first course of action?",
      options: [
        "Publicly blame the team member in the group chat",
        "Focus on fixing the issue first, then privately discuss prevention strategies with the team",
        "Wait for someone else to notice and fix it",
        "Report it to management immediately without attempting to fix it",
      ],
      evaluates: "Problem Solving & Leadership",
    },
    {
      id: "s4",
      context: "Frontend Developer workplace scenario",
      scenario:
        "Your team is split between using a new, cutting-edge CSS framework versus sticking with the established Tailwind CSS setup. Both have valid pros and cons. You're asked to lead the decision. How do you approach this?",
      options: [
        "Pick the new framework because it's exciting and modern",
        "Create a comparison document, build small prototypes with both, gather team input, and make a data-driven recommendation",
        "Always stick with what the team already knows",
        "Let someone else decide since you don't want the responsibility",
      ],
      evaluates: "Decision Making & Leadership",
    },
    {
      id: "s5",
      context: "Frontend Developer workplace scenario",
      scenario:
        "You're assigned a complex feature with a tight deadline. Midway through, you realize the requirements are ambiguous and could be interpreted in two very different ways. What do you do?",
      options: [
        "Pick the interpretation that's easier to implement",
        "Immediately reach out to the product manager to clarify, sharing both interpretations and their implications",
        "Implement both interpretations and let the PM choose later",
        "Continue with your best guess and hope it's correct",
      ],
      evaluates: "Communication & Initiative",
    },
    {
      id: "s6",
      context: "Frontend Developer workplace scenario",
      scenario:
        "A junior developer on your team is struggling with a React concept and has been stuck for two days. They haven't asked for help. You notice they seem frustrated. How do you respond?",
      options: [
        "Wait for them to ask for help - they need to learn independence",
        "Approach them casually, offer guidance without being condescending, and share resources that helped you learn the same concept",
        "Tell their manager they're falling behind",
        "Just send them a link to the React documentation",
      ],
      evaluates: "Empathy & Mentorship",
    },
    {
      id: "s7",
      context: "Frontend Developer workplace scenario",
      scenario:
        "You're in the middle of a sprint and a major change in project direction is announced. The work you've done for the past week is no longer needed. How do you respond?",
      options: [
        "Complain about the wasted effort to everyone who will listen",
        "Take a moment to process, then focus on understanding the new requirements and how your previous work might be partially reused",
        "Refuse to start the new work until the old work's value is acknowledged",
        "Quietly complete the new work but with significantly less effort",
      ],
      evaluates: "Adaptability",
    },
    {
      id: "s8",
      context: "Frontend Developer workplace scenario",
      scenario:
        "You notice a colleague frequently taking credit for your ideas in team meetings. It's starting to affect your motivation. How do you address this?",
      options: [
        "Call them out publicly and aggressively in the next meeting",
        "Start keeping your ideas to yourself",
        "Schedule a private, professional conversation with them to express your concerns and establish better collaboration boundaries",
        "Complain to their manager immediately",
      ],
      evaluates: "Communication & Conflict Resolution",
    },
    {
      id: "s9",
      context: "Frontend Developer workplace scenario",
      scenario:
        "A junior developer asks for your feedback on a PR. You find many issues. How do you provide the critique?",
      options: [
        "List all the mistakes bluntly so they learn fast",
        "Focus on the most critical issues first, provide constructive feedback with examples, and offer a quick call to explain complex points",
        "Fix the issues yourself and merge the PR",
        "Tell them to rewrite the whole thing without specific guidance",
      ],
      evaluates: "Mentorship",
    },
    {
      id: "s10",
      context: "Frontend Developer workplace scenario",
      scenario:
        "The team is falling behind on a critical release. Everyone is stressed and working long hours. What's your approach?",
      options: [
        "Do only your assigned tasks and leave on time",
        "Offer to help team members with their blockers, maintain a positive attitude, and focus on the most impactful tasks to meet the deadline",
        "Blame the project manager for the timeline",
        "Work in isolation to avoid being distracted by others' stress",
      ],
      evaluates: "Teamwork & Resilience",
    },
  ],
};

export const mockFinalFeedback = {
  overall_score: 78,
  readiness_level: "Good",
  role: "Frontend Developer",
  resume_fit_analysis: {
    fit_score: 85,
    matched_skills: [
      { name: "React", strength: "strong" },
      { name: "JavaScript", strength: "strong" },
      { name: "CSS", strength: "moderate" },
      { name: "HTML", strength: "strong" },
      { name: "Git", strength: "moderate" },
    ],
    missing_skills: ["TypeScript", "Testing", "Webpack/Vite", "CI/CD"],
    recommendations: [
      "Add TypeScript to your project portfolio",
      "Include performance metrics in project descriptions",
      "Highlight responsive design and mobile-first experience",
    ],
  },
  breakdown: {
    resume: { score: 75, weight: 30, label: "Resume Analysis" },
    skills: { score: 80, weight: 40, label: "Skill Assessment" },
    personality: { score: 85, weight: 30, label: "Personality Assessment" },
  },
  strengths: [
    "Strong React and JavaScript technical foundation",
    "Excellent communication and collaboration abilities",
    "Resume quality demonstrates solid project experience",
    "Well-suited personality traits for Frontend Developer role",
  ],
  improvements: [
    "Add TypeScript to your resume and active skillset",
    "Include testing and debugging project examples",
    "Strengthen system design and architecture knowledge",
    "Add responsive design and accessibility portfolio pieces",
  ],
  ai_roadmap: {
    week_1_2: [
      "Learn TypeScript fundamentals through official documentation",
      "Convert one existing React project to TypeScript",
      "Practice TypeScript generics and utility types",
    ],
    week_3_4: [
      "Study Jest and React Testing Library",
      "Write unit tests for your TypeScript project",
      "Explore integration testing patterns",
    ],
  },
  interview_tips: [
    "Practice explaining your React projects with clear technical depth",
    "Prepare for TypeScript-related interview questions",
    "Review frontend system design patterns (component architecture, state management)",
    "Be ready to discuss accessibility best practices",
  ],
};

export const personalityTraitScores = {
  communication: 90,
  collaboration: 85,
  problem_solving: 80,
  adaptability: 85,
  leadership: 75,
  empathy: 88,
};
