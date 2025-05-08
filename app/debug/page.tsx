'use client'

export default function DebugIndexPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      
      <div className="card-effect p-6 space-y-4">
        <h2 className="text-xl font-semibold">Available Debug Tools</h2>
        
        <div className="space-y-2">
          <p className="text-text-secondary">No debug tools are currently available.</p>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-text-secondary">
        These tools are intended for development and debugging purposes only.
      </p>
    </div>
  )
} 