export default function EmptyState() {
  const example = `# Bio
Name: Jane Smith
Email: jane@example.com
Location: New York, NY

# Experience
## Engineer @ Google | 2022 - Present
- Built and shipped core product features`;

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Start writing your resume
      </h2>
      <pre className="text-left text-xs bg-gray-50 text-gray-500 px-4 py-3 rounded-md w-full mb-4 border border-gray-200 font-mono leading-relaxed whitespace-pre">
        {example}
      </pre>
      <p className="text-sm text-gray-400">
        Your preview appears here as you type
      </p>
    </div>
  );
}
