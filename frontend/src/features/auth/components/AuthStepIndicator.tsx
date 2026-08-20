interface AuthStepIndicatorProps {
  step: 1 | 2;
}

export default function AuthStepIndicator({
  step,
}: AuthStepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="h-1 flex-1 rounded-full bg-blue-600" />

      <div
        className={`
          h-1 flex-1 rounded-full transition-colors duration-300
          ${step === 2 ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      />
    </div>
  );
}
