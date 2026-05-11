import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AssignmentsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error(
        'Assignments Error Boundary caught an error:',
        error,
        errorInfo
      )
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]'>
          <div className='p-8 text-center'>
            <div className='mx-auto max-w-md rounded-lg border border-red-400 bg-red-100 p-6 text-red-700'>
              <h2 className='mb-2 text-lg font-semibold'>
                Something went wrong
              </h2>
              <p className='mb-4 text-sm'>
                {this.state.error?.message ||
                  'Failed to load assignments. Please try again later.'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className='rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
