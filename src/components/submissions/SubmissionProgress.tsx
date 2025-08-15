'use client'

interface SubmissionProgressProps {
  status: string
  className?: string
}

export function SubmissionProgress({ status, className = '' }: SubmissionProgressProps) {
  const steps = [
    {
      key: 'PENDING',
      label: 'En attente',
      description: 'Soumission reçue, en attente d\'assignation'
    },
    {
      key: 'REVIEWING',
      label: 'En évaluation',
      description: 'Assigné aux reviewers, évaluation en cours'
    },
    {
      key: 'DECISION_MADE',
      label: 'Décision prise',
      description: 'Toutes les évaluations terminées'
    },
    {
      key: 'COMPLETED',
      label: 'Terminé',
      description: 'Processus de révision terminé'
    }
  ]

  const currentStepIndex = steps.findIndex(step => step.key === status)
  const isCompleted = currentStepIndex !== -1

  return (
    <div className={`${className}`}>
      <div className="overflow-hidden">
        <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 sm:text-base">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex
            const isPassed = index < currentStepIndex
            const isLast = index === steps.length - 1

            return (
              <li key={step.key} className={`flex items-center ${!isLast ? 'w-full' : ''}`}>
                <div className="flex flex-col items-center">
                  <span 
                    className={`flex items-center justify-center w-8 h-8 border-2 rounded-full shrink-0 ${
                      isActive 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : isPassed 
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {isPassed ? '✓' : index + 1}
                  </span>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isPassed ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
                {!isLast && (
                  <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                    isPassed ? 'border-green-600' : 'border-gray-300'
                  }`}></div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}